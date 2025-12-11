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
        case 'Pending': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1"/> Yolda</span>;
        case 'Approved': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1"/> Tamamlandı</span>;
        case 'Cancelled': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1"/> İptal</span>;
        default: return status;
    }
  };

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">Transfer Yönetimi</h2>
        <Button onClick={() => setIsOpen(true)} className="bg-slate-900 hover:bg-slate-800">
            <Truck className="mr-2 h-4 w-4" /> Yeni Transfer
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="w-5 h-5 text-orange-600" /> Transfer Geçmişi
            </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
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
                <TableRow><TableCell colSpan={8} className="text-center h-24 text-gray-500">Kayıt yok.</TableCell></TableRow>
              ) : (
                data?.data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs">{item.transferNumber}</TableCell>
                    <TableCell>{item.sourceWarehouseName}</TableCell>
                    <TableCell><ArrowRight className="w-4 h-4 text-slate-400"/></TableCell>
                    <TableCell>{item.targetWarehouseName}</TableCell>
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell className="font-bold">{item.quantity}</TableCell>
                    <TableCell>{renderStatus(item.status)}</TableCell>
                    <TableCell className="text-right space-x-1">
                        {item.status === 'Pending' && (
                            <>
                                <Button 
                                    variant="outline" size="sm" className="text-green-600 hover:bg-green-50 border-green-200 h-8"
                                    onClick={() => { if(confirm('Onaylıyor musunuz?')) approveMutation.mutate(item.id) }}
                                >
                                    <CheckCircle2 className="w-4 h-4 mr-1" /> Onayla
                                </Button>
                                <Button 
                                    variant="outline" size="sm" className="text-red-600 hover:bg-red-50 border-red-200 h-8"
                                    onClick={() => { if(confirm('İptal ediyor musunuz?')) cancelMutation.mutate(item.id) }}
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
        </CardContent>
      </Card>

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