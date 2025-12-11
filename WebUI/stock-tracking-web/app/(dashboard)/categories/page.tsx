'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import categoryService from '@/services/categoryService';
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
import { Plus, Trash2, Edit, Loader2, Tags, Archive, RefreshCcw, ArchiveRestore } from 'lucide-react';
import { toast } from 'sonner';
import { CategoryForm } from '@/components/forms/category-form';
import { CategoryDto } from '@/types';
import { useAuth } from '@/context/auth-context';

export default function CategoriesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [isOpen, setIsOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDto | null>(null);

  const canEdit = user?.role === 'Admin';

  const { data, isLoading, isError } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll,
  });

  const { activeCategories, archivedCategories } = useMemo(() => {
    if (!data?.data) return { activeCategories: [], archivedCategories: [] };

    const active = data.data.filter(c => c.isActive);
    const archived = data.data.filter(c => !c.isActive); // Pasif olanlar

    return { activeCategories: active, archivedCategories: archived };
  }, [data]);

  const createMutation = useMutation({
    mutationFn: categoryService.create,
    onSuccess: () => {
      toast.success('Kategori eklendi.');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsOpen(false); 
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'İşlem başarısız.'),
  });

  const updateMutation = useMutation({
    mutationFn: categoryService.update,
    onSuccess: () => {
      toast.success('Kategori güncellendi.');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsOpen(false);
      setEditingCategory(null);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'İşlem başarısız.'),
  });

  const archiveMutation = useMutation({
    mutationFn: categoryService.archive,
    onSuccess: () => {
      toast.success('Kategori arşive taşındı.');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Arşivleme başarısız.'),
  });

  const restoreMutation = useMutation({
    mutationFn: categoryService.restore,
    onSuccess: () => {
      toast.success('Kategori geri yüklendi.');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Geri yükleme başarısız.'),
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: categoryService.permanentDelete,
    onSuccess: () => {
      toast.success('Kategori kalıcı olarak silindi.');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Silme başarısız.'),
  });

  const openCreateModal = () => {
    setEditingCategory(null);
    setIsOpen(true);
  };

  const openEditModal = (category: CategoryDto) => {
    setEditingCategory(category);
    setIsOpen(true);
  };

  const onSubmit = (values: any) => {
    if (editingCategory) {
      updateMutation.mutate({ ...values, id: editingCategory.id });
    } else {
      createMutation.mutate(values);
    }
  };

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
  if (isError) return <div className="text-red-500 text-center p-10">Veriler yüklenemedi.</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">Kategoriler</h2>
        
        {canEdit && (
            <div className="flex gap-2">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="relative">
                            <ArchiveRestore className="mr-2 h-4 w-4 text-orange-600" /> 
                            Arşiv / Çöp Kutusu
                            {archivedCategories.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                    {archivedCategories.length}
                                </span>
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Arşivlenen Kategoriler</SheetTitle>
                            <SheetDescription>
                                Silinen kategoriler burada saklanır. Geri yükleyebilir veya tamamen silebilirsiniz.
                            </SheetDescription>
                        </SheetHeader>
                        
                        <div className="mt-6 space-y-4 overflow-y-auto max-h-[80vh]">
                            {archivedCategories.length === 0 ? (
                                <div className="text-center text-gray-400 py-10 text-sm border-2 border-dashed rounded-lg">
                                    Arşiv boş.
                                </div>
                            ) : (
                                archivedCategories.map(cat => (
                                    <div key={cat.id} className="p-3 border rounded-lg bg-slate-50 flex items-center justify-between group">
                                        <div>
                                            <div className="font-medium text-sm">{cat.name}</div>
                                            <div className="text-xs text-gray-500 line-clamp-1">{cat.description}</div>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button 
                                                size="icon" variant="outline" className="h-7 w-7 text-green-600 hover:bg-green-50"
                                                title="Geri Yükle"
                                                onClick={() => restoreMutation.mutate(cat.id)}
                                            >
                                                <RefreshCcw className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button 
                                                size="icon" variant="outline" className="h-7 w-7 text-red-600 hover:bg-red-50"
                                                title="Kalıcı Sil"
                                                onClick={() => { if(confirm('Bu işlem geri alınamaz! Tamamen silinsin mi?')) permanentDeleteMutation.mutate(cat.id) }}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
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
                <Tags className="w-5 h-5 text-blue-600" /> Aktif Kategori Listesi
            </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Ad</TableHead>
                <TableHead>Açıklama</TableHead>
                {canEdit && <TableHead className="text-right">İşlemler</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24 text-gray-500">Aktif kategori bulunamadı.</TableCell>
                </TableRow>
              ) : (
                activeCategories.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs text-slate-500">{item.id}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-slate-600">{item.description}</TableCell>
                    
                    {canEdit && (
                        <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" className="hover:bg-blue-50 hover:text-blue-600" onClick={() => openEditModal(item)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                            variant="ghost" size="icon" className="hover:bg-red-50 hover:text-red-600"
                            onClick={() => {
                                if(confirm('Kategori arşive taşınacak. Devam edilsin mi?')) archiveMutation.mutate(item.id)
                            }}
                        >
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle'}</DialogTitle>
            <DialogDescription>
              Gerekli alanları doldurup kaydedin.
            </DialogDescription>
          </DialogHeader>
          
          <CategoryForm 
            initialData={editingCategory} 
            onSubmit={onSubmit} 
            isLoading={createMutation.isPending || updateMutation.isPending} 
          />
          
        </DialogContent>
      </Dialog>
    </div>
  );
}