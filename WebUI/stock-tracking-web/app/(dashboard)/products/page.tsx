'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import productService from '@/services/productService';
import { Button } from '@/components/ui/button';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from '@/components/ui/dialog';
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Edit, Loader2, Package, ArchiveRestore, RefreshCcw, Archive } from 'lucide-react';
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

  const canEdit = user?.role === 'Admin' || user?.role === 'DepoSorumlusu';

  const { data, isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: productService.getAll,
  });

  const { activeProducts, archivedProducts } = useMemo(() => {
    if (!data?.data) return { activeProducts: [], archivedProducts: [] };
    const active = data.data.filter(p => p.isActive);
    const archived = data.data.filter(p => !p.isActive);
    return { activeProducts: active, archivedProducts: archived };
  }, [data]);

  const createMutation = useMutation({
    mutationFn: productService.create,
    onSuccess: () => { toast.success('Ürün eklendi.'); queryClient.invalidateQueries({ queryKey: ['products'] }); setIsOpen(false); },
    onError: () => toast.error('Hata oluştu.'),
  });

  const updateMutation = useMutation({
    mutationFn: productService.update,
    onSuccess: () => { toast.success('Ürün güncellendi.'); queryClient.invalidateQueries({ queryKey: ['products'] }); setIsOpen(false); setEditingId(null); setEditingData(null); },
    onError: () => toast.error('Hata oluştu.'),
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
        if(res.success) setEditingData(res.data);
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

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
  if (isError) return <div className="text-red-500 text-center p-10">Veriler yüklenemedi.</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
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
                                    <div key={p.id} className="p-3 border rounded-lg bg-slate-50 flex items-center justify-between">
                                        <div>
                                            <div className="font-medium text-sm">{p.name}</div>
                                            <div className="text-xs text-gray-500 font-mono">{p.barcode}</div>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button size="icon" variant="outline" className="h-7 w-7 text-green-600" onClick={() => restoreMutation.mutate(p.id)}><RefreshCcw className="h-3.5 w-3.5" /></Button>
                                            <Button size="icon" variant="outline" className="h-7 w-7 text-red-600" onClick={() => { if(confirm('Kalıcı silinsin mi?')) permanentDeleteMutation.mutate(p.id) }}><Trash2 className="h-3.5 w-3.5" /></Button>
                                        </div>
                                    </div>
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

      <Card>
        <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" /> Aktif Ürün Listesi
            </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Barkod</TableHead>
                <TableHead>Ürün Adı</TableHead>
                <TableHead>Kategori</TableHead>
                {canEdit && <TableHead className="text-right">İşlemler</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeProducts.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center h-24 text-gray-500">Aktif ürün yok.</TableCell></TableRow>
              ) : (
                activeProducts.map((item) => (
                  <TableRow key={item.id}>
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
                        <Button variant="ghost" size="icon" className="hover:bg-red-50 hover:text-red-600" onClick={() => { if(confirm('Ürün arşive taşınacak?')) archiveMutation.mutate(item.id) }}>
                            <Archive className="h-4 w-4" />
                        </Button>
                        </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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