'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import expenseService from '@/services/expenseService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { ExpenseCategoryForm } from '@/components/forms/expense-category-form';

export default function ExpenseCategoriesPage() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['expenseCategories'],
    queryFn: expenseService.getAllCategories,
  });

  const createMutation = useMutation({
    mutationFn: expenseService.createCategory,
    onSuccess: () => {
      toast.success('Gider türü eklendi.');
      queryClient.invalidateQueries({ queryKey: ['expenseCategories'] });
      setIsOpen(false);
    },
    onError: () => toast.error('Hata oluştu.'),
  });

  const deleteMutation = useMutation({
    mutationFn: expenseService.deleteCategory,
    onSuccess: () => {
      toast.success('Silindi.');
      queryClient.invalidateQueries({ queryKey: ['expenseCategories'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Silinemedi.'),
  });

  if (isLoading) return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div></div>;

  return (
    <div className="h-full flex flex-col p-6 space-y-4 min-h-0 bg-slate-50/50">
      <div className="flex justify-between items-center shrink-0">
        <h2 className="text-2xl font-bold text-slate-800">Gider Tanımları</h2>
        <Button onClick={() => setIsOpen(true)} className="bg-slate-900 hover:bg-slate-800">
          <Plus className="mr-2 h-4 w-4" /> Yeni Tanım
        </Button>
      </div>

      <div className="flex-1 min-h-0 bg-white rounded-xl shadow border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b shrink-0 bg-slate-50/50">
          <CardTitle className="text-lg font-medium text-slate-700">Gider Türleri ve Kurallar</CardTitle>
        </div>
        <div className="flex-1 overflow-auto p-0">
          <Table>
            <TableHeader className="sticky top-0 bg-slate-50 z-10 shadow-sm">
              <TableRow>
                <TableHead>Adı</TableHead>
                <TableHead className="text-center">Vergi İndirimi</TableHead>
                <TableHead className="text-center">Varsayılan KDV</TableHead>
                <TableHead className="text-center">Stopaj</TableHead>
                <TableHead className="text-right">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((item) => (
                <TableRow key={item.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-medium">
                    {item.name}
                    {item.isSystemDefault && <span className="ml-2 text-[10px] bg-slate-100 px-1 rounded text-slate-500 border">Sistem</span>}
                  </TableCell>
                  <TableCell className="text-center">
                    {item.isTaxDeductible ? <Check className="w-4 h-4 mx-auto text-green-600" /> : <X className="w-4 h-4 mx-auto text-red-400" />}
                  </TableCell>
                  <TableCell className="text-center">%{item.defaultVatRate}</TableCell>
                  <TableCell className="text-center">
                    {item.hasWithholding ? <span className="text-red-600 font-bold">%{item.defaultWithholdingRate}</span> : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {!item.isSystemDefault && (
                      <Button
                        variant="ghost" size="icon" className="text-red-500 hover:bg-red-50"
                        onClick={() => { if (confirm('Silinsin mi?')) deleteMutation.mutate(item.id) }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Yeni Gider Türü</DialogTitle></DialogHeader>
          <ExpenseCategoryForm onSubmit={(val) => createMutation.mutate(val)} isLoading={createMutation.isPending} />
        </DialogContent>
      </Dialog>
    </div>
  );
}