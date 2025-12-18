'use client';

import { useAuth } from '@/context/auth-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import saleService from '@/services/saleService';
import stockService from '@/services/stockService';
import userService from '@/services/userService';
import warehouseService from '@/services/warehouseService';
import transferService from '@/services/transferService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    TrendingUp, Package, Users, ShoppingCart,
    ArrowRightLeft, ShieldCheck, Store, CalendarDays, Banknote,
    PlusCircle, Truck, Search, History
} from 'lucide-react';
import Link from 'next/link';
import { DashboardSummaryDto } from '@/types';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { StockEntryForm } from '@/components/forms/stock-entry-form';
import { UserForm } from '@/components/forms/user-form';
import { WarehouseForm } from '@/components/forms/warehouse-form';
import { toast } from 'sonner';

const useStockEntry = () => {
    const [isOpen, setIsOpen] = useState(false);
    const queryClient = useQueryClient();

    const createEntryMutation = useMutation({
        mutationFn: stockService.createEntry,
        onSuccess: () => {
            toast.success('Stok hareketi kaydedildi.');
            queryClient.invalidateQueries({ queryKey: ['stocks'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
            setIsOpen(false);
        },
        onError: (err: any) => toast.error(err?.response?.data?.message || 'Hata oluştu.'),
    });

    const onSubmit = (values: any) => {
        createEntryMutation.mutate(values);
    };

    return { isOpen, setIsOpen, createEntryMutation, onSubmit };
};

const useAdminActions = () => {
    const queryClient = useQueryClient();
    const [isUserOpen, setIsUserOpen] = useState(false);
    const [isWarehouseOpen, setIsWarehouseOpen] = useState(false);

    const createUserMutation = useMutation({
        mutationFn: userService.create,
        onSuccess: () => {
            toast.success('Personel başarıyla eklendi.');
            queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
            setIsUserOpen(false);
        },
        onError: (err: any) => toast.error(err?.response?.data?.message || 'Personel eklenirken hata oluştu.'),
    });

    const createWarehouseMutation = useMutation({
        mutationFn: warehouseService.create,
        onSuccess: () => {
            toast.success('Depo başarıyla oluşturuldu.');
            setIsWarehouseOpen(false);
        },
        onError: (err: any) => toast.error(err?.response?.data?.message || 'Depo oluşturulurken hata oluştu.'),
    });

    const onUserSubmit = (values: any) => {
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

        createUserMutation.mutate(payload);
    };

    return {
        isUserOpen, setIsUserOpen,
        isWarehouseOpen, setIsWarehouseOpen,
        createUserMutation,
        createWarehouseMutation,
        onUserSubmit
    };
}


const AdminDashboard = () => {
    const { data: summary, isLoading } = useQuery({
        queryKey: ['dashboardSummary'],
        queryFn: saleService.getDashboardSummary,
    });

    const { isOpen, setIsOpen, createEntryMutation, onSubmit } = useStockEntry();

    const {
        isUserOpen, setIsUserOpen, createUserMutation,
        isWarehouseOpen, setIsWarehouseOpen, createWarehouseMutation,
        onUserSubmit
    } = useAdminActions();

    if (isLoading) return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin h-8 w-8 text-slate-400" /></div>;

    const stats = summary?.data || {
        totalRevenue: 0,
        dailyRevenue: 0,
        monthlyRevenue: 0,
        totalStockQuantity: 0,
        totalEmployees: 0,
        latestSales: []
    };

    return (
        <div className="h-full flex flex-col p-6 space-y-6 animate-in fade-in duration-500 min-h-0 bg-slate-50/50">
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Yönetim Paneli</h2>
                    <p className="text-slate-500 text-sm">Genel durum ve yönetim kısayolları</p>
                </div>
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold border border-red-200">
                    Admin
                </span>
            </div>

            <div className="flex-1 overflow-auto min-h-0 space-y-6 pr-2">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="border-l-4 border-l-blue-500 shadow-sm bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Günlük Ciro</p>
                                    <h3 className="text-2xl font-extrabold text-blue-700 mt-1">{stats.dailyRevenue.toLocaleString()} ₺</h3>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-full text-blue-600"><Banknote /></div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-purple-500 shadow-sm bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Aylık Ciro</p>
                                    <h3 className="text-2xl font-extrabold text-purple-700 mt-1">{stats.monthlyRevenue.toLocaleString()} ₺</h3>
                                </div>
                                <div className="p-3 bg-purple-50 rounded-full text-purple-600"><CalendarDays /></div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500 shadow-sm bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Genel Ciro</p>
                                    <h3 className="text-2xl font-extrabold text-green-700 mt-1">{stats.totalRevenue.toLocaleString()} ₺</h3>
                                </div>
                                <div className="p-3 bg-green-50 rounded-full text-green-600"><TrendingUp /></div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-orange-500 shadow-sm bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Toplam Stok</p>
                                    <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{stats.totalStockQuantity} <span className="text-sm font-normal text-slate-400">Adet</span></h3>
                                </div>
                                <div className="p-3 bg-orange-50 rounded-full text-orange-600"><Package /></div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">
                    <Card className="col-span-2 shadow-sm border-0 lg:border">
                        <CardHeader className="border-b bg-slate-50/50 py-4"><CardTitle className="text-lg flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-blue-600" /> Son Satış İşlemleri</CardTitle></CardHeader>
                        <CardContent className="p-0 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                                        <tr>
                                            <th className="px-6 py-3">Fiş No</th>
                                            <th className="px-6 py-3">Tarih</th>
                                            <th className="px-6 py-3">Depo</th>
                                            <th className="px-6 py-3 text-right">Tutar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.latestSales.length === 0 ? (
                                            <tr><td colSpan={4} className="text-center py-8 text-slate-400">Kayıt yok.</td></tr>
                                        ) : (
                                            stats.latestSales.map((sale) => (
                                                <tr key={sale.id} className="bg-white border-b hover:bg-slate-50">
                                                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{sale.transactionNumber}</td>
                                                    <td className="px-6 py-4">{new Date(sale.date).toLocaleDateString('tr-TR')}</td>
                                                    <td className="px-6 py-4 text-slate-600">{sale.warehouse}</td>
                                                    <td className="px-6 py-4 text-right font-bold text-green-600">+{sale.amount.toLocaleString()} ₺</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-0 lg:border h-fit">
                        <CardHeader className="border-b bg-slate-50/50 py-4"><CardTitle className="text-lg">Hızlı Menü</CardTitle></CardHeader>
                        <CardContent className="p-4 grid grid-cols-1 gap-3">
                            <Button variant="outline" onClick={() => setIsOpen(true)} className="w-full justify-start h-12 border-slate-200 hover:bg-violet-50 text-slate-600 hover:text-violet-700">
                                <PlusCircle className="mr-3 w-5 h-5 text-violet-500" /> Hızlı Stok Ekle
                            </Button>
                            <Button variant="outline" onClick={() => setIsUserOpen(true)} className="w-full justify-start h-12 border-slate-200 hover:bg-blue-50 text-slate-600 hover:text-blue-700">
                                <Users className="mr-3 w-5 h-5 text-blue-500" /> Yeni Personel Ekle
                            </Button>
                            <Button variant="outline" onClick={() => setIsWarehouseOpen(true)} className="w-full justify-start h-12 border-slate-200 hover:bg-orange-50 text-slate-600 hover:text-orange-700">
                                <Store className="mr-3 w-5 h-5 text-orange-500" /> Depo / Şube Aç
                            </Button>
                            <Link href="/profit">
                                <Button variant="outline" className="w-full justify-start h-12 border-slate-200 hover:bg-green-50 text-slate-600 hover:text-green-700">
                                    <TrendingUp className="mr-3 w-5 h-5 text-green-500" /> Karlılık Raporu
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent><DialogHeader><DialogTitle>Stok Giriş / Çıkış</DialogTitle></DialogHeader><StockEntryForm onSubmit={onSubmit} isLoading={createEntryMutation.isPending} /></DialogContent>
            </Dialog>
            <Dialog open={isUserOpen} onOpenChange={setIsUserOpen}>
                <DialogContent><DialogHeader><DialogTitle>Yeni Personel</DialogTitle></DialogHeader><UserForm onSubmit={onUserSubmit} isLoading={createUserMutation.isPending} /></DialogContent>
            </Dialog>
            <Dialog open={isWarehouseOpen} onOpenChange={setIsWarehouseOpen}>
                <DialogContent className="sm:max-w-4xl"><DialogHeader><DialogTitle>Yeni Depo</DialogTitle></DialogHeader><WarehouseForm onSubmit={(data) => createWarehouseMutation.mutate(data)} isLoading={createWarehouseMutation.isPending} /></DialogContent>
            </Dialog>
        </div>
    );
};

const WarehouseDashboard = () => {
    const { user } = useAuth();
    const { isOpen, setIsOpen, createEntryMutation, onSubmit } = useStockEntry();

    const { data: transfers } = useQuery({ queryKey: ['transfers'], queryFn: transferService.getAll });
    const { data: stocks } = useQuery({ queryKey: ['stocks'], queryFn: stockService.getAll });

    // Stats Calculation
    const myWarehouseId = user?.warehouseId;
    const pendingIncoming = transfers?.data?.filter(t => t.targetWarehouseId === myWarehouseId && t.status === 'Pending') || [];
    const pendingOutgoing = transfers?.data?.filter(t => t.sourceWarehouseId === myWarehouseId && t.status === 'Pending') || [];
    const myStocks = stocks?.data?.filter(s => s.warehouseId === myWarehouseId) || [];
    const lowStockItems = myStocks.filter(s => s.quantity < 10); // Example threshold

    return (
        <div className="h-full flex flex-col p-6 space-y-6 animate-in fade-in duration-500 min-h-0 bg-slate-50/50">
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Depo Paneli</h2>
                    <p className="text-slate-500 text-sm">Transfer ve stok yönetimi</p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold border border-blue-200">Depo Sorumlusu</span>
            </div>

            <div className="flex-1 overflow-auto min-h-0 space-y-6 pr-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-l-4 border-l-orange-500 shadow-sm bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bekleyen Giriş</p>
                                    <h3 className="text-2xl font-extrabold text-orange-600 mt-1">{pendingIncoming.length} <span className="text-sm text-slate-400 font-normal">Transfer</span></h3>
                                </div>
                                <Truck className="w-8 h-8 text-orange-200" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-blue-500 shadow-sm bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Toplam Stok Çeşidi</p>
                                    <h3 className="text-2xl font-extrabold text-blue-600 mt-1">{myStocks.length} <span className="text-sm text-slate-400 font-normal">Ürün</span></h3>
                                </div>
                                <Package className="w-8 h-8 text-blue-200" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-red-500 shadow-sm bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kritik Stok</p>
                                    <h3 className="text-2xl font-extrabold text-red-600 mt-1">{lowStockItems.length} <span className="text-sm text-slate-400 font-normal">Ürün</span></h3>
                                </div>
                                <ShieldCheck className="w-8 h-8 text-red-200" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="col-span-1 shadow-sm border-0 lg:border">
                        <CardHeader className="border-b bg-slate-50/50 py-4"><CardTitle className="text-lg">Hızlı İşlemler</CardTitle></CardHeader>
                        <CardContent className="p-4 grid grid-cols-1 gap-3">
                            <Button variant="outline" onClick={() => setIsOpen(true)} className="w-full justify-start h-12 border-slate-200 hover:bg-green-50 text-slate-600 hover:text-green-700">
                                <PlusCircle className="mr-3 w-5 h-5 text-green-500" /> Mal Kabul / Giriş
                            </Button>
                            <Link href="/transfers">
                                <Button variant="outline" className="w-full justify-start h-12 border-slate-200 hover:bg-orange-50 text-slate-600 hover:text-orange-700">
                                    <ArrowRightLeft className="mr-3 w-5 h-5 text-orange-500" /> Transfer Yönetimi
                                </Button>
                            </Link>
                            <Link href="/stocks">
                                <Button variant="outline" className="w-full justify-start h-12 border-slate-200 hover:bg-blue-50 text-slate-600 hover:text-blue-700">
                                    <Search className="mr-3 w-5 h-5 text-blue-500" /> Stok Sorgula
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="col-span-2 shadow-sm border-0 lg:border">
                        <CardHeader className="border-b bg-slate-50/50 py-4"><CardTitle className="text-lg flex items-center gap-2"><Truck className="w-5 h-5 text-slate-500" /> Bekleyen Girişler</CardTitle></CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                                        <tr>
                                            <th className="px-6 py-3">Fiş No</th>
                                            <th className="px-6 py-3">Kaynak</th>
                                            <th className="px-6 py-3">Ürün</th>
                                            <th className="px-6 py-3 text-right">Adet</th>
                                            <th className="px-6 py-3 text-center">Durum</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingIncoming.length === 0 ? (
                                            <tr><td colSpan={5} className="text-center py-8 text-slate-400">Bekleyen transfer yok.</td></tr>
                                        ) : (
                                            pendingIncoming.slice(0, 5).map((tr) => (
                                                <tr key={tr.id} className="bg-white border-b hover:bg-slate-50">
                                                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{tr.transferNumber}</td>
                                                    <td className="px-6 py-4">{tr.sourceWarehouseName}</td>
                                                    <td className="px-6 py-4 font-medium">{tr.productName}</td>
                                                    <td className="px-6 py-4 text-right font-bold">{tr.quantity}</td>
                                                    <td className="px-6 py-4 text-center"><span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">Yolda</span></td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent><DialogHeader><DialogTitle>Stok Giriş / Çıkış</DialogTitle></DialogHeader><StockEntryForm onSubmit={onSubmit} isLoading={createEntryMutation.isPending} /></DialogContent>
            </Dialog>
        </div>
    );
};

const SalesDashboard = () => {
    const { user } = useAuth();
    const { data: dailyReport } = useQuery({
        queryKey: ['dailyReport', new Date().toISOString().split('T')[0]],
        queryFn: () => saleService.getDailyReport(new Date())
    });

    const myStats = dailyReport?.data.find(u => u.userId === user?.id);
    const myRecentSales = myStats?.sales?.slice(0, 5) || [];

    return (
        <div className="h-full flex flex-col p-6 space-y-6 animate-in fade-in duration-500 min-h-0 bg-slate-50/50">
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Satış Paneli</h2>
                    <p className="text-slate-500 text-sm">Hayırlı işler, {user?.fullName}</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">Satış Personeli</span>
            </div>

            <div className="flex-1 overflow-auto min-h-0 space-y-6 pr-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-l-4 border-l-indigo-500 shadow-sm bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bugünkü Cirom</p>
                                    <h3 className="text-2xl font-extrabold text-indigo-700 mt-1">{myStats?.totalAmount.toLocaleString() || 0} ₺</h3>
                                </div>
                                <Banknote className="w-8 h-8 text-indigo-200" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-emerald-500 shadow-sm bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Satılan Ürün</p>
                                    <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{myStats?.totalQuantity || 0} <span className="text-sm text-slate-400 font-normal">Adet</span></h3>
                                </div>
                                <Package className="w-8 h-8 text-emerald-200" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-pink-500 shadow-sm bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fiş Sayısı</p>
                                    <h3 className="text-2xl font-extrabold text-pink-600 mt-1">{new Set(myStats?.sales.map(s => s.saleId)).size || 0} <span className="text-sm text-slate-400 font-normal">İşlem</span></h3>
                                </div>
                                <History className="w-8 h-8 text-pink-200" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="col-span-1 shadow-sm border-0 lg:border">
                        <CardHeader className="border-b bg-slate-50/50 py-4"><CardTitle className="text-lg">Hızlı İşlemler</CardTitle></CardHeader>
                        <CardContent className="p-4 grid grid-cols-1 gap-3">
                            <Link href="/sales">
                                <Button variant="outline" className="w-full justify-start h-12 border-slate-200 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700">
                                    <ShoppingCart className="mr-3 w-5 h-5 text-indigo-500" /> Yeni Satış Yap
                                </Button>
                            </Link>
                            <Link href="/stocks">
                                <Button variant="outline" className="w-full justify-start h-12 border-slate-200 hover:bg-orange-50 text-slate-600 hover:text-orange-700">
                                    <Search className="mr-3 w-5 h-5 text-orange-500" /> Fiyat Gör / Stok Bak
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="col-span-2 shadow-sm border-0 lg:border">
                        <CardHeader className="border-b bg-slate-50/50 py-4"><CardTitle className="text-lg flex items-center gap-2"><History className="w-5 h-5 text-slate-500" /> Son Satışlarım</CardTitle></CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                                        <tr>
                                            <th className="px-6 py-3">Ürün</th>
                                            <th className="px-6 py-3">Saat</th>
                                            <th className="px-6 py-3 text-right">Adet</th>
                                            <th className="px-6 py-3 text-right">Tutar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {myRecentSales.length === 0 ? (
                                            <tr><td colSpan={4} className="text-center py-8 text-slate-400">Bugün henüz satış yok.</td></tr>
                                        ) : (
                                            myRecentSales.map((sale, idx) => (
                                                <tr key={idx} className="bg-white border-b hover:bg-slate-50">
                                                    <td className="px-6 py-4 font-medium text-slate-700">{sale.productName}</td>
                                                    <td className="px-6 py-4 text-xs text-slate-500">{new Date(sale.time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</td>
                                                    <td className="px-6 py-4 text-right">{sale.quantity}</td>
                                                    <td className="px-6 py-4 text-right font-bold text-green-600">+{sale.totalAmount.toLocaleString()} ₺</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default function DashboardPage() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div className="flex items-center justify-center h-full text-slate-400 animate-pulse">Yükleniyor...</div>;
    }

    switch (user?.role) {
        case 'Admin':
            return <AdminDashboard />;
        case 'DepoSorumlusu':
            return <WarehouseDashboard />;
        case 'SatisPersoneli':
            return <SalesDashboard />;
        default:
            return (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                    <ShieldCheck size={64} className="text-slate-200" />
                    <div>
                        <h1 className="text-2xl font-bold text-red-500">Yetkisiz Erişim</h1>
                        <p className="text-slate-500">Hesabınıza atanmış geçerli bir rol bulunamadı.</p>
                    </div>
                    <Link href="/login">
                        <Button variant="outline">Giriş Ekranına Dön</Button>
                    </Link>
                </div>
            );
    }
}