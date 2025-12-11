'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import transferService from '@/services/transferService';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, CheckCircle2, XCircle, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { TransferForm } from '@/components/forms/transfer-form';
import { useAuth } from '@/context/auth-context';

export default function TransfersPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  if (user?.role === 'SatisPersoneli') {
    return <div className="p-10 text-center text-red-500">Yetkisiz Erişim</div>;
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ['transfers'],
    queryFn: transferService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: transferService.create,
    onSuccess: () => {
      toast.success('Transfer başlatıldı.');
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
      setIsOpen(false);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Hata oluştu.'),
  });

  const approveMutation = useMutation({
    mutationFn: transferService.approve,
    onSuccess: () => {
      toast.success('Transfer onaylandı, stok giriş yaptı.');
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Onay başarısız.'),
  });

  const cancelMutation = useMutation({
    mutationFn: transferService.cancel,
    onSuccess: () => {
      toast.success('Transfer iptal edildi, stok iade edildi.');
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'İptal başarısız.'),
  });

  const onSubmit = (values: any) => {
    createMutation.mutate(values);
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case 'Pending': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> Yolda</span>;
      case 'Approved': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" /> Tamamlandı</span>;
      case 'Cancelled': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> İptal</span>;
      default: return status;
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin h-8 w-8 text-slate-400" /></div>;

  return (
    <div className="h-full flex flex-col p-6 space-y-4 min-h-0 bg-slate-50/50">
      <div className="flex justify-between items-center shrink-0">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">Transfer Yönetimi</h2>
        <Button onClick={() => setIsOpen(true)} className="bg-slate-900 hover:bg-slate-800">
          <Truck className="mr-2 h-4 w-4" /> Yeni Transfer
        </Button>
      </div>

      <div className="flex-1 min-h-0 bg-white rounded-xl shadow border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b shrink-0 flex items-center gap-2 bg-slate-50/50">
          <Truck className="w-5 h-5 text-orange-600" />
          <h3 className="font-semibold text-slate-700">Transfer Geçmişi</h3>
        </div>
        <div className="flex-1 overflow-auto p-0">
          <Table>
            <TableHeader className="sticky top-0 bg-slate-50 z-10 shadow-sm">
              <TableRow>
                <TableHead>Fiş No</TableHead>
                <TableHead>Kaynak</TableHead>
                <TableHead></TableHead>
                <TableHead>Hedef</TableHead>
                <TableHead>Ürün</TableHead>
                <TableHead>Adet</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data?.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center h-40 text-gray-500">Kayıt yok.</TableCell></TableRow>
              ) : (
                data?.data.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-mono text-xs text-slate-500">{item.transferNumber}</TableCell>
                    <TableCell>{item.sourceWarehouseName}</TableCell>
                    <TableCell><ArrowRight className="w-4 h-4 text-slate-400" /></TableCell>
                    <TableCell>{item.targetWarehouseName}</TableCell>
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell className="font-bold">{item.quantity}</TableCell>
                    <TableCell>{renderStatus(item.status)}</TableCell>
                    <TableCell className="text-right space-x-1">
                      {item.status === 'Pending' && (
                        <>
                          {(user?.role === 'Admin' || user?.warehouseId === item.targetWarehouseId) && (
                            <Button
                              variant="outline" size="sm" className="text-green-600 hover:bg-green-50 border-green-200 h-8"
                              onClick={() => { if (confirm('Onaylıyor musunuz?')) approveMutation.mutate(item.id) }}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" /> Onayla
                            </Button>
                          )}
                          <Button
                            variant="outline" size="sm" className="text-red-600 hover:bg-red-50 border-red-200 h-8"
                            onClick={() => { if (confirm('İptal ediyor musunuz?')) cancelMutation.mutate(item.id) }}
                          >
                            <XCircle className="w-4 h-4 mr-1" /> İptal
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Yeni Transfer Başlat</DialogTitle>
          </DialogHeader>
          <TransferForm onSubmit={onSubmit} isLoading={createMutation.isPending} />
        </DialogContent>
      </Dialog>
    </div>
  );
}