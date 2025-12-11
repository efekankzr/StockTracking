'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import warehouseService from '@/services/warehouseService';
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
import { Plus, Trash2, Edit, Loader2, Map as MapIcon, ArchiveRestore, RefreshCcw, Archive } from 'lucide-react';
import { toast } from 'sonner';
import { WarehouseForm } from '@/components/forms/warehouse-form';
import { WarehouseDto } from '@/types';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/auth-context';

const WarehousesMap = dynamic(() => import('@/components/ui/warehouses-map'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400">Harita Yükleniyor...</div>
});

export default function WarehousesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WarehouseDto | null>(null);

  const canEdit = user?.role === 'Admin';

  const { data, isLoading, isError } = useQuery({
    queryKey: ['warehouses'],
    queryFn: warehouseService.getAll,
  });

  const { activeWarehouses, archivedWarehouses } = useMemo(() => {
    if (!data?.data) return { activeWarehouses: [], archivedWarehouses: [] };
    const active = data.data.filter(w => w.isActive);
    const archived = data.data.filter(w => !w.isActive);
    return { activeWarehouses: active, archivedWarehouses: archived };
  }, [data]);

  const createMutation = useMutation({
    mutationFn: warehouseService.create,
    onSuccess: () => {
      toast.success('Depo eklendi.');
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      setIsOpen(false);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Hata oluştu.'),
  });

  const updateMutation = useMutation({
    mutationFn: warehouseService.update,
    onSuccess: () => {
      toast.success('Depo güncellendi.');
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      setIsOpen(false);
      setEditingItem(null);
    },
    onError: (err: any) => toast.error('Hata oluştu.'),
  });

  const archiveMutation = useMutation({
    mutationFn: warehouseService.archive,
    onSuccess: () => {
      toast.success('Depo arşive taşındı.');
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Arşivleme başarısız.'),
  });

  const restoreMutation = useMutation({
    mutationFn: warehouseService.restore,
    onSuccess: () => {
      toast.success('Depo aktif edildi.');
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Geri yükleme başarısız.'),
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: warehouseService.permanentDelete,
    onSuccess: () => {
      toast.success('Depo kalıcı olarak silindi.');
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Silme başarısız.'),
  });

  const openCreateModal = () => { setEditingItem(null); setIsOpen(true); };
  const openEditModal = (item: WarehouseDto) => { setEditingItem(item); setIsOpen(true); };

  const onSubmit = (values: any) => {
    if (editingItem) updateMutation.mutate({ ...values, id: editingItem.id });
    else createMutation.mutate(values);
  };

  if (isLoading) return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin h-8 w-8 text-slate-400" /></div>;
  if (isError) return <div className="text-red-500 text-center p-10">Veriler yüklenemedi.</div>;

  return (
    <div className="h-full flex flex-col p-6 gap-6 min-h-0">

      <div className="flex justify-between items-center shrink-0">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">Depo Yönetimi</h2>

        {canEdit && (
          <div className="flex gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="relative">
                  <ArchiveRestore className="mr-2 h-4 w-4 text-orange-600" />
                  Arşiv
                  {archivedWarehouses.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {archivedWarehouses.length}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Pasif Depolar</SheetTitle>
                  <SheetDescription>Arşivlenen depolar burada saklanır.</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-3 overflow-y-auto max-h-[80vh]">
                  {archivedWarehouses.length === 0 ? (
                    <div className="text-center text-gray-400 py-10 text-sm border-2 border-dashed rounded-lg">Boş</div>
                  ) : (
                    archivedWarehouses.map(w => (
                      <div key={w.id} className="p-3 border rounded-lg bg-slate-50 flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{w.name}</div>
                          <div className="text-xs text-gray-500">{w.city} / {w.district}</div>
                        </div>
                        <div className="flex gap-1">
                          <Button size="icon" variant="outline" className="h-7 w-7 text-green-600" onClick={() => restoreMutation.mutate(w.id)} title="Geri Yükle"><RefreshCcw className="h-3.5 w-3.5" /></Button>
                          <Button size="icon" variant="outline" className="h-7 w-7 text-red-600" onClick={() => { if (confirm('Kalıcı silinsin mi?')) permanentDeleteMutation.mutate(w.id) }} title="Kalıcı Sil"><Trash2 className="h-3.5 w-3.5" /></Button>
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

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6">

        <div className="lg:col-span-4 h-full flex flex-col min-h-0">
          <Card className="h-full flex flex-col border shadow-sm overflow-hidden min-h-0">
            <CardHeader className="pb-3 pt-4 px-4 shrink-0 border-b bg-slate-50/50">
              <CardTitle className="text-base flex items-center gap-2 font-semibold text-slate-700">
                <MapIcon className="w-4 h-4 text-blue-600" />
                Aktif Depolar
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-0 min-h-0">
              <Table>
                <TableHeader className="sticky top-0 bg-white shadow-sm z-10">
                  <TableRow className="hover:bg-transparent border-b-slate-200">
                    <TableHead className="w-[60%] pl-4">Depo Adı</TableHead>
                    {canEdit && <TableHead className="text-right pr-4">İşlemler</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeWarehouses.length === 0 ? (
                    <TableRow><TableCell colSpan={2} className="text-center h-24 text-gray-500">Aktif depo yok.</TableCell></TableRow>
                  ) : (
                    activeWarehouses.map((item) => (
                      <TableRow key={item.id} className="hover:bg-slate-50 transition-colors border-b-slate-100">
                        <TableCell className="pl-4 py-3">
                          <div className="font-medium text-slate-900 text-sm">{item.name}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block shadow-sm"></span>
                            {item.city} / {item.district}
                          </div>
                        </TableCell>

                        {canEdit && (
                          <TableCell className="text-right pr-4 py-3">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-blue-50 hover:text-blue-600" onClick={() => openEditModal(item)}>
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-red-50 hover:text-red-600" onClick={() => { if (confirm('Depo arşive taşınacak?')) archiveMutation.mutate(item.id) }}>
                                <Archive className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="hidden lg:block lg:col-span-8 h-full rounded-xl overflow-hidden border shadow-sm bg-white relative min-h-0">
          <WarehousesMap warehouses={activeWarehouses} />
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[95vw] w-full h-[90vh] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="px-6 py-4 border-b shrink-0 bg-slate-50/50">
            <DialogTitle>{editingItem ? 'Depoyu Düzenle' : 'Yeni Depo Ekle'}</DialogTitle>
            <DialogDescription>Depo ve konum bilgilerini giriniz.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-hidden">
            <WarehouseForm
              initialData={editingItem}
              onSubmit={onSubmit}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}