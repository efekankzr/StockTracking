'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import userService from '@/services/userService';
import warehouseService from '@/services/warehouseService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  UserPlus, Loader2, ShieldAlert, Package, ShoppingCart, CheckCircle2, XCircle, Phone, Settings2, User as UserIcon, Search, Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { UserForm } from '@/components/forms/user-form';
import { UserDto } from '@/types';
import { useAuth } from '@/context/auth-context';

export default function UsersPage() {
  const { user: currentUser } = useAuth(); // Giriş yapan kullanıcı
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  // FİLTRE STATE'LERİ
  const [searchText, setSearchText] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState<string>("all");
  const [filterSystemWarehouse, setFilterSystemWarehouse] = useState<string>("all");

  // Verileri Çek
  const { data: users, isLoading } = useQuery({ queryKey: ['users'], queryFn: userService.getAll });
  const { data: warehouses } = useQuery({ queryKey: ['warehouses'], queryFn: warehouseService.getAll });

  const isAdmin = currentUser?.role === 'Admin';

  // --- GELİŞMİŞ FİLTRELEME VE GRUPLAMA ---
  const { systemUsers, customUsers } = useMemo(() => {
    if (!users?.data) return { systemUsers: [], customUsers: [] };

    // 1. Sysadmin'i gizle
    let all = users.data.filter(u => u.username !== 'sysadmin');

    // 2. Gruplara ayır
    let system = all.filter(u => u.username.endsWith('_yonetim') || u.username.endsWith('_kasa'));
    let custom = all.filter(u => !u.username.endsWith('_yonetim') && !u.username.endsWith('_kasa'));

    // 3. CUSTOM USERS FİLTRESİ (İsim ve Depo)
    if (searchText) {
        custom = custom.filter(u => 
            u.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
            u.username.toLowerCase().includes(searchText.toLowerCase())
        );
    }
    if (filterWarehouse !== "all") {
        custom = custom.filter(u => u.warehouseId === Number(filterWarehouse));
    }

    // 4. SYSTEM USERS FİLTRESİ (Sadece Depo)
    if (filterSystemWarehouse !== "all") {
        system = system.filter(u => u.warehouseId === Number(filterSystemWarehouse));
    }

    return { systemUsers: system, customUsers: custom };
  }, [users, searchText, filterWarehouse, filterSystemWarehouse]);


  const createMutation = useMutation({
    mutationFn: userService.create,
    onSuccess: () => {
      toast.success('Personel başarıyla oluşturuldu.');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsOpen(false);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Bir hata oluştu.'),
  });

  const onSubmit = (values: any) => {
    const roleId = Number(values.roleId);
    let roleName = "SatisPersoneli"; 

    switch (roleId) {
        case 0: roleName = "Admin"; break;
        case 1: roleName = "DepoSorumlusu"; break;
        case 2: roleName = "SatisPersoneli"; break;
    }

    const payload = {
        fullName: values.fullName,
        username: values.username,
        email: values.email,
        phoneNumber: values.phoneNumber,
        password: values.password,
        role: roleName,
        warehouseId: roleId === 0 ? null : Number(values.warehouseId)
    };

    createMutation.mutate(payload);
  };

  const renderRoleBadge = (role: string) => {
    switch (role) {
      case 'Admin': return <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-700 border border-red-200"><ShieldAlert className="w-3 h-3" /> Yönetici</div>;
      case 'DepoSorumlusu': return <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200"><Package className="w-3 h-3" /> Depo Sorumlusu</div>;
      case 'SatisPersoneli': return <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-700 border border-green-200"><ShoppingCart className="w-3 h-3" /> Satış Personeli</div>;
      default: return <span className="text-gray-500">{role}</span>;
    }
  };

  const UserRow = ({ user }: { user: UserDto }) => (
    <TableRow key={user.id} className="hover:bg-slate-50 transition-colors border-b-slate-100">
      <TableCell className="py-3">
        <div className="flex flex-col">
          <span className="font-medium text-slate-900 text-sm">{user.fullName}</span>
          <span className="text-[11px] text-slate-500 font-mono">@{user.username}</span>
        </div>
      </TableCell>
      <TableCell className="py-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-slate-600">{user.email}</span>
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Phone className="w-3 h-3"/> {user.phoneNumber}
          </span>
        </div>
      </TableCell>
      <TableCell className="py-3">{renderRoleBadge(user.role)}</TableCell>
      <TableCell className="py-3">
          {user.warehouseName ? (
              <span className="flex items-center gap-1 text-slate-700 font-medium text-xs">
                  <Package className="w-3.5 h-3.5 text-slate-400"/> {user.warehouseName}
              </span>
          ) : (
              <span className="text-slate-400 italic text-[10px]">- Merkez -</span>
          )}
      </TableCell>
      <TableCell className="py-3 text-right">
        {user.isActive ? 
            <span className="inline-flex items-center gap-1 text-green-600 text-[10px] font-medium bg-green-50 px-1.5 py-0.5 rounded border border-green-100"><CheckCircle2 className="w-3 h-3" /> Aktif</span> : 
            <span className="inline-flex items-center gap-1 text-red-500 text-[10px] font-medium bg-red-50 px-1.5 py-0.5 rounded border border-red-100"><XCircle className="w-3 h-3" /> Pasif</span>
        }
      </TableCell>
    </TableRow>
  );

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>;

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-4 overflow-hidden">
      
      {/* ÜST KISIM */}
      <div className="flex justify-between items-center shrink-0">
        <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-800">Personel Yönetimi</h2>
        </div>
        {isAdmin && (
            <Button onClick={() => setIsOpen(true)} className="bg-slate-900 hover:bg-slate-800 shadow-sm h-9 text-sm">
            <UserPlus className="mr-2 h-4 w-4" /> Yeni Personel
            </Button>
        )}
      </div>

      {/* GRID YAPISI (Admin ise 2 Kolon, Değilse 1 Kolon) */}
      <div className={`grid gap-6 h-full min-h-0 ${isAdmin ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        
        {/* TABLO 1: MAĞAZA PERSONELLERİ */}
        <Card className="h-full flex flex-col shadow-sm border-l-4 border-l-blue-500 overflow-hidden">
            <CardHeader className="pb-3 px-4 py-3 shrink-0 border-b bg-slate-50/50 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base font-medium flex items-center gap-2 text-slate-800">
                    <UserIcon className="w-4 h-4 text-blue-600" /> 
                    Mağaza Personeli
                    <span className="text-xs font-normal text-slate-500 bg-white px-2 py-0.5 rounded border">
                        {customUsers.length}
                    </span>
                </CardTitle>
            </CardHeader>
            
            {/* FİLTRELER */}
            <div className="p-3 flex gap-2 border-b bg-white shrink-0">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                    <Input 
                        placeholder="İsim veya kullanıcı adı..." 
                        className="pl-8 h-8 text-xs" 
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                    />
                </div>
                <div className="w-[140px]">
                    <Select value={filterWarehouse} onValueChange={setFilterWarehouse}>
                        <SelectTrigger className="h-8 text-xs">
                            <div className="flex items-center gap-2 text-slate-600">
                                <Filter className="w-3 h-3" />
                                <SelectValue placeholder="Tüm Depolar" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tüm Depolar</SelectItem>
                            {warehouses?.data.map(w => (
                                <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <CardContent className="p-0 flex-1 overflow-y-auto">
                <Table>
                    <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                        <TableRow className="hover:bg-transparent border-b-slate-200">
                            <TableHead className="h-9 text-xs">Ad Soyad</TableHead>
                            <TableHead className="h-9 text-xs">İletişim</TableHead>
                            <TableHead className="h-9 text-xs">Rol</TableHead>
                            <TableHead className="h-9 text-xs">Depo</TableHead>
                            <TableHead className="h-9 text-xs text-right">Durum</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {customUsers.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="text-center h-24 text-gray-500 text-xs">Personel bulunamadı.</TableCell></TableRow>
                        ) : (
                            customUsers.map(user => <UserRow key={user.id} user={user} />)
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        {/* TABLO 2: SİSTEM HESAPLARI (SADECE ADMIN) */}
        {isAdmin && (
            <Card className="h-full flex flex-col shadow-sm border-l-4 border-l-orange-400 overflow-hidden">
                <CardHeader className="pb-3 px-4 py-3 shrink-0 border-b bg-orange-50/30 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-base font-medium flex items-center gap-2 text-slate-800">
                        <Settings2 className="w-4 h-4 text-orange-600" /> 
                        Sistem Hesapları
                        <span className="text-xs font-normal text-slate-500 bg-white px-2 py-0.5 rounded border">
                            {systemUsers.length}
                        </span>
                    </CardTitle>
                </CardHeader>

                {/* FİLTRE (Sadece Depo) */}
                <div className="p-3 flex gap-2 border-b bg-white shrink-0 justify-end">
                     <div className="w-[180px]">
                        <Select value={filterSystemWarehouse} onValueChange={setFilterSystemWarehouse}>
                            <SelectTrigger className="h-8 text-xs">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Filter className="w-3 h-3" />
                                    <SelectValue placeholder="Tüm Depolar" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tüm Depolar</SelectItem>
                                {warehouses?.data.map(w => (
                                    <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <CardContent className="p-0 flex-1 overflow-y-auto">
                    <Table>
                        <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                            <TableRow className="hover:bg-transparent border-b-slate-200">
                                <TableHead className="h-9 text-xs">Hesap Adı</TableHead>
                                <TableHead className="h-9 text-xs">İletişim</TableHead>
                                <TableHead className="h-9 text-xs">Rol</TableHead>
                                <TableHead className="h-9 text-xs">Depo</TableHead>
                                <TableHead className="h-9 text-xs text-right">Durum</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {systemUsers.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center h-24 text-gray-500 text-xs">Hesap bulunamadı.</TableCell></TableRow>
                            ) : (
                                systemUsers.map(user => <UserRow key={user.id} user={user} />)
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        )}
      </div>

      {/* MODAL */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Yeni Personel Ekle</DialogTitle>
            <DialogDescription>
              Mağazada çalışacak yeni bir personel tanımlayın.
            </DialogDescription>
          </DialogHeader>
          
          <UserForm 
            onSubmit={onSubmit} 
            isLoading={createMutation.isPending} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}