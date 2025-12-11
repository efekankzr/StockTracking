'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import expenseService from '@/services/expenseService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ExpenseTransactionForm } from '@/components/forms/expense-transaction-form';
import { useAuth } from '@/context/auth-context';

export default function ExpensesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const canDelete = user?.role === 'Admin';

  const { data, isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: expenseService.getAllTransactions,
  });

  const createMutation = useMutation({
    mutationFn: expenseService.createTransaction,
    onSuccess: () => {
      toast.success('Gider kaydedildi.');
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setIsOpen(false);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Hata oluştu.'),
  });

  const deleteMutation = useMutation({
    mutationFn: expenseService.deleteTransaction,
    onSuccess: () => {
      toast.success('Kayıt silindi.');
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
    onError: (err: any) => toast.error('Silme başarısız.'),
  });

  if (isLoading) return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin h-8 w-8 text-slate-400" /></div>;

  return (
    <div className="h-full flex flex-col p-6 space-y-4 min-h-0 bg-slate-50/50">
      <div className="flex justify-between items-center shrink-0">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">Gider Fişleri</h2>
        <Button onClick={() => setIsOpen(true)} className="bg-slate-900 hover:bg-slate-800">
          <Plus className="mr-2 h-4 w-4" /> Yeni Gider Gir
        </Button>
      </div>

      <div className="flex-1 min-h-0 bg-white rounded-xl shadow border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b shrink-0 flex items-center gap-2 bg-slate-50/50">
          <CardTitle>Gider Listesi</CardTitle>
        </div>
        <div className="flex-1 overflow-auto p-0">
          <Table>
            <TableHeader className="sticky top-0 bg-slate-50 z-10 shadow-sm">
              <TableRow>
                <TableHead>Tarih</TableHead>
                <TableHead>Fiş No</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Açıklama</TableHead>
                <TableHead>Depo</TableHead>
                <TableHead>Giren</TableHead>
                <TableHead className="text-right">Matrah</TableHead>
                <TableHead className="text-right">KDV</TableHead>
                <TableHead className="text-right">Toplam</TableHead>
                {canDelete && <TableHead className="w-10"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data?.length === 0 ? (
                <TableRow><TableCell colSpan={10} className="text-center h-40 text-gray-500">Kayıt yok.</TableCell></TableRow>
              ) : (
                data?.data.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/50">
                    <TableCell className="text-xs text-slate-500">
                      {new Date(item.documentDate).toLocaleDateString('tr-TR')}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{item.documentNumber}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        {item.categoryName}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 max-w-[200px] truncate" title={item.description}>{item.description}</TableCell>
                    <TableCell className="text-xs">{item.warehouseName}</TableCell>
                    <TableCell className="text-xs text-slate-400">{item.userName}</TableCell>
                    <TableCell className="text-right text-xs">{item.baseAmount.toLocaleString()} ₺</TableCell>
                    <TableCell className="text-right text-xs">{item.vatAmount.toLocaleString()} ₺</TableCell>
                    <TableCell className="text-right font-bold text-slate-900">{item.totalAmount.toLocaleString()} ₺</TableCell>
                    {canDelete && (
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-600" onClick={() => { if (confirm('Silinsin mi?')) deleteMutation.mutate(item.id) }}>
                          <Trash2 className="h-3.5 w-3.5" />
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Gider Fişi / Fatura Girişi</DialogTitle>
          </DialogHeader>
          <ExpenseTransactionForm
            onSubmit={(val) => createMutation.mutate(val)}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}