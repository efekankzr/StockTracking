'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import productService from '@/services/productService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Trash2, Edit, Loader2, Package, ArchiveRestore, RefreshCcw, Archive, Search } from 'lucide-react';
import { toast } from 'sonner';
import { ProductForm } from '@/components/forms/product-form';
import { ProductDto } from '@/types';
import { useAuth } from '@/context/auth-context';

export default function ProductsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [editingData, setEditingData] = useState<ProductDto | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const canEdit = user?.role === 'Admin' || user?.role === 'DepoSorumlusu';

  const { data, isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: productService.getAll,
  });

  const { activeProducts, archivedProducts } = useMemo(() => {
    const active = data?.data
      ?.filter(p => p.isActive)
      .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.barcode.includes(searchQuery)) || [];

    const archived = data?.data?.filter(p => !p.isActive) || [];
    return { activeProducts: active, archivedProducts: archived };
  }, [data, searchQuery]);

  const createMutation = useMutation({
    mutationFn: productService.create,
    onSuccess: () => { toast.success('Ürün eklendi.'); queryClient.invalidateQueries({ queryKey: ['products'] }); setIsOpen(false); },
    onError: (err: any) => {
      let msg = err?.response?.data?.message || 'Hata oluştu.';
      if (err?.response?.data?.errors && err.response.data.errors.length > 0) {
        msg = err.response.data.errors.join(', ');
      }
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: productService.update,
    onSuccess: () => { toast.success('Ürün güncellendi.'); queryClient.invalidateQueries({ queryKey: ['products'] }); setIsOpen(false); setEditingId(null); setEditingData(null); },
    onError: (err: any) => {
      let msg = err?.response?.data?.message || 'Hata oluştu.';
      if (err?.response?.data?.errors && err.response.data.errors.length > 0) {
        msg = err.response.data.errors.join(', ');
      }
      toast.error(msg);
    },
  });

  const archiveMutation = useMutation({
    mutationFn: productService.archive,
    onSuccess: () => { toast.success('Ürün arşive taşındı.'); queryClient.invalidateQueries({ queryKey: ['products'] }); },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Arşivleme başarısız.'),
  });

  const restoreMutation = useMutation({
    mutationFn: productService.restore,
    onSuccess: () => { toast.success('Ürün aktif edildi.'); queryClient.invalidateQueries({ queryKey: ['products'] }); },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Geri yükleme başarısız.'),
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: productService.permanentDelete,
    onSuccess: () => { toast.success('Ürün kalıcı silindi.'); queryClient.invalidateQueries({ queryKey: ['products'] }); },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Silme başarısız.'),
  });

  const openCreateModal = () => { setEditingId(null); setEditingData(null); setIsOpen(true); };

  const openEditModal = async (id: number) => {
    setEditingId(id);
    setIsEditLoading(true);
    setIsOpen(true);
    try {
      const res = await productService.getById(id);
      if (res.success) setEditingData(res.data);
    } catch {
      toast.error("Hata oluştu");
      setIsOpen(false);
    } finally {
      setIsEditLoading(false);
    }
  };

  const onSubmit = (values: any) => {
    if (editingId) updateMutation.mutate({ ...values, id: editingId });
    else createMutation.mutate(values);
  };

  if (isLoading) return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin h-8 w-8 text-slate-400" /></div>;
  if (isError) return <div className="text-red-500 text-center p-10">Veriler yüklenemedi.</div>;

  return (
    <div className="h-full flex flex-col p-6 space-y-4 min-h-0">
      <div className="flex justify-between items-center shrink-0">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">Ürün Yönetimi</h2>

        {canEdit && (
          <div className="flex gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="relative">
                  <ArchiveRestore className="mr-2 h-4 w-4 text-orange-600" />
                  Arşiv
                  {archivedProducts.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {archivedProducts.length}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Pasif Ürünler</SheetTitle>
                  <SheetDescription>Arşivlenen ürünler burada saklanır.</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-3 overflow-y-auto max-h-[80vh]">
                  {archivedProducts.length === 0 ? (
                    <div className="text-center text-gray-400 py-10 text-sm border-2 border-dashed rounded-lg">Boş</div>
                  ) : (
                    archivedProducts.map(p => (
                      <Card key={p.id} className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-3 flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-800">{p.name}</span>
                            <span className="text-xs text-slate-500 font-mono">{p.barcode}</span>
                          </div>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:bg-green-50" onClick={() => restoreMutation.mutate(p.id)}><RefreshCcw className="h-4 w-4" /></Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => { if (confirm('Kalıcı silinsin mi?')) permanentDeleteMutation.mutate(p.id) }}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </SheetContent>
            </Sheet>

            <Button onClick={openCreateModal} className="bg-slate-900 hover:bg-slate-800">
              <Plus className="mr-2 h-4 w-4" /> Yeni Ekle
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 bg-white rounded-xl shadow border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-700">Aktif Ürün Listesi</h3>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Ürün adı veya barkod..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
        </div>
        <div className="flex-1 overflow-auto p-0">
          <Table>
            <TableHeader className="sticky top-0 bg-slate-50 z-10 shadow-sm">
              <TableRow>
                <TableHead>Barkod</TableHead>
                <TableHead>Ürün Adı</TableHead>
                <TableHead>Kategori</TableHead>
                {canEdit && <TableHead className="text-right">İşlemler</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeProducts.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center h-40 text-gray-500">
                  {searchQuery ? 'Arama sonucu bulunamadı.' : 'Aktif ürün yok.'}
                </TableCell></TableRow>
              ) : (
                activeProducts.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-mono text-xs text-slate-600">{item.barcode}</TableCell>
                    <TableCell className="font-medium text-slate-900">{item.name}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {item.categoryName}
                      </span>
                    </TableCell>

                    {canEdit && (
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" className="hover:bg-blue-50 hover:text-blue-600" onClick={() => openEditModal(item.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="hover:bg-red-50 hover:text-red-600" onClick={() => { if (confirm('Ürün arşive taşınacak?')) archiveMutation.mutate(item.id) }}>
                          <Archive className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</DialogTitle>
            <DialogDescription>Ürün bilgilerini eksiksiz giriniz.</DialogDescription>
          </DialogHeader>
          {isEditLoading ? <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div> :
            <ProductForm
              initialData={editingData}
              onSubmit={onSubmit}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          }
        </DialogContent>
      </Dialog>
    </div>
  );
}