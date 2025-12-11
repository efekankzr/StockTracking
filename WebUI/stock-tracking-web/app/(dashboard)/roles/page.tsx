'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import roleService from '@/services/roleService';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Loader2, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { RoleForm } from '@/components/forms/role-form';

export default function RolesPage() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  // 1. Rolleri Çek
  const { data, isLoading, isError } = useQuery({
    queryKey: ['roles'],
    queryFn: roleService.getAll,
  });

  // 2. Rol Ekle
  const createMutation = useMutation({
    mutationFn: roleService.create,
    onSuccess: () => {
      toast.success('Rol başarıyla oluşturuldu.');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setIsOpen(false);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Hata oluştu.'),
  });

  // 3. Rol Sil
  const deleteMutation = useMutation({
    mutationFn: roleService.delete,
    onSuccess: () => {
      toast.success('Rol silindi.');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Silme başarısız.'),
  });

  const onSubmit = (values: any) => {
    createMutation.mutate(values);
  };

  // Admin rolünü silmeye çalışırsa uyaralım veya butonunu gizleyelim
  const handleDelete = (id: number, name: string) => {
    if (name === 'Admin') {
      toast.error("Admin rolü silinemez!");
      return;
    }
    if (confirm(`${name} rolünü silmek istediğinize emin misiniz?`)) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>;
  if (isError) return <div className="flex justify-center items-center h-full text-red-500">Veriler yüklenemedi.</div>;

  return (
    <div className="h-full flex flex-col p-6 space-y-4 min-h-0 bg-slate-50/50">
      <div className="flex justify-between items-center shrink-0">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">Rol Yönetimi</h2>
        <Button onClick={() => setIsOpen(true)} className="bg-slate-900 hover:bg-slate-800">
          <Plus className="mr-2 h-4 w-4" /> Yeni Rol Ekle
        </Button>
      </div>

      <div className="flex-1 min-h-0 bg-white rounded-xl shadow border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b shrink-0 flex items-center gap-2 bg-slate-50/50">
          <ShieldCheck className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-slate-700">Sistem Rolleri</h3>
        </div>
        <div className="flex-1 overflow-auto p-0">
          <Table>
            <TableHeader className="sticky top-0 bg-slate-50 z-10 shadow-sm">
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Rol Adı</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data?.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center h-40 text-gray-500">Rol bulunamadı.</TableCell></TableRow>
              ) : (
                data?.data.map((role) => (
                  <TableRow key={role.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-mono text-xs text-slate-500">{role.id}</TableCell>
                    <TableCell className="font-medium">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${role.name === 'Admin' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'}
                        `}>
                        {role.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {/* Admin rolü silinemez, butonu pasif yap veya gösterme */}
                      {role.name !== 'Admin' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                          onClick={() => handleDelete(role.id, role.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* MODAL */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Yeni Rol Tanımla</DialogTitle>
            <DialogDescription>Sisteme yeni bir yetki grubu ekleyin.</DialogDescription>
          </DialogHeader>

          <RoleForm
            onSubmit={onSubmit}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}