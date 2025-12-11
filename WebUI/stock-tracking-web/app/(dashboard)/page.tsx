'use client';

import { useAuth } from '@/context/auth-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import saleService from '@/services/saleService';
import stockService from '@/services/stockService';
import userService from '@/services/userService'; // Added
import warehouseService from '@/services/warehouseService'; // Added
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    TrendingUp, Package, Users, ShoppingCart,
    ArrowRightLeft, ShieldCheck, Store, CalendarDays, Banknote,
    PlusCircle
} from 'lucide-react';
import Link from 'next/link';
import { DashboardSummaryDto } from '@/types';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { StockEntryForm } from '@/components/forms/stock-entry-form';
import { UserForm } from '@/components/forms/user-form'; // Added
import { WarehouseForm } from '@/components/forms/warehouse-form'; // Added
import { toast } from 'sonner';

// Reusable logic for stock entry
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

// --- ANDROID DASHBOARD LOGIC --- 
const useAdminActions = () => {
    const queryClient = useQueryClient();
    const [isUserOpen, setIsUserOpen] = useState(false);
    const [isWarehouseOpen, setIsWarehouseOpen] = useState(false);

    const createUserMutation = useMutation({
        mutationFn: userService.create,
        onSuccess: () => {
            toast.success('Personel başarıyla eklendi.');
            queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] }); // To update employees count
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


// --- 1. ADMIN DASHBOARD ---
const AdminDashboard = () => {
    const { data: summary, isLoading } = useQuery({
        queryKey: ['dashboardSummary'],
        queryFn: saleService.getDashboardSummary,
    });

    // Stock Entry Logic
    const { isOpen, setIsOpen, createEntryMutation, onSubmit } = useStockEntry();

    // Admin Other Actions
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
        <div className="h-full flex flex-col p-6 space-y-6 animate-in fade-in duration-500 min-h-0">
            {/* ÜST BAŞLIK ALANI (Sabit) */}
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Yönetim Paneli</h2>
                    <p className="text-slate-500 text-sm">Finansal durum ve operasyon özeti</p>
                </div>
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold border border-red-200">
                    Admin
                </span>
            </div>

            {/* SCROLL EDİLEBİLİR İÇERİK ALANI */}
            <div className="flex-1 overflow-auto min-h-0 space-y-6 pr-2">

                {/* ÖZET KARTLAR */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                    {/* 1. GÜNLÜK CİRO */}
                    <Card className="border-l-4 border-l-blue-500 shadow-sm bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Günlük Ciro</p>
                                    <h3 className="text-2xl font-extrabold text-blue-700 mt-1">
                                        {stats.dailyRevenue.toLocaleString()} ₺
                                    </h3>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-full text-blue-600"><Banknote /></div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 2. AYLIK CİRO */}
                    <Card className="border-l-4 border-l-purple-500 shadow-sm bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Aylık Ciro</p>
                                    <h3 className="text-2xl font-extrabold text-purple-700 mt-1">
                                        {stats.monthlyRevenue.toLocaleString()} ₺
                                    </h3>
                                </div>
                                <div className="p-3 bg-purple-50 rounded-full text-purple-600"><CalendarDays /></div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 3. GENEL TOPLAM CİRO */}
                    <Card className="border-l-4 border-l-green-500 shadow-sm bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Genel Ciro</p>
                                    <h3 className="text-2xl font-extrabold text-green-700 mt-1">
                                        {stats.totalRevenue.toLocaleString()} ₺
                                    </h3>
                                </div>
                                <div className="p-3 bg-green-50 rounded-full text-green-600"><TrendingUp /></div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 4. TOPLAM STOK */}
                    <Card className="border-l-4 border-l-orange-500 shadow-sm bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Toplam Stok</p>
                                    <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                                        {stats.totalStockQuantity} <span className="text-sm font-normal text-slate-400">Adet</span>
                                    </h3>
                                </div>
                                <div className="p-3 bg-orange-50 rounded-full text-orange-600"><Package /></div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">

                    {/* SOL: SON İŞLEMLER TABLOSU */}
                    <Card className="col-span-2 shadow-sm border-0 lg:border">
                        <CardHeader className="border-b bg-slate-50/50 py-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ShoppingCart className="w-5 h-5 text-blue-600" /> Son Satış İşlemleri
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                                        <tr>
                                            <th className="px-6 py-3">Fiş No</th>
                                            <th className="px-6 py-3">Tarih</th>
                                            <th className="px-6 py-3">Personel</th>
                                            <th className="px-6 py-3">Depo</th>
                                            <th className="px-6 py-3 text-right">Tutar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.latestSales.length === 0 ? (
                                            <tr><td colSpan={5} className="text-center py-8 text-slate-400">Henüz işlem yok.</td></tr>
                                        ) : (
                                            stats.latestSales.map((sale) => (
                                                <tr key={sale.id} className="bg-white border-b hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{sale.transactionNumber}</td>
                                                    <td className="px-6 py-4 text-slate-700">
                                                        {new Date(sale.date).toLocaleDateString('tr-TR')} <span className="text-xs text-gray-400">{new Date(sale.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-slate-900">{sale.salesPerson}</td>
                                                    <td className="px-6 py-4 text-slate-600">{sale.warehouse}</td>
                                                    <td className="px-6 py-4 text-right font-bold text-green-600">
                                                        +{sale.amount.toLocaleString()} ₺
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* SAĞ: HIZLI ERİŞİM */}
                    <Card className="shadow-sm border-0 lg:border h-fit">
                        <CardHeader className="border-b bg-slate-50/50 py-4">
                            <CardTitle className="text-lg">Hızlı Menü</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 grid grid-cols-1 gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setIsOpen(true)}
                                className="w-full justify-start h-12 border-slate-200 hover:border-violet-300 hover:bg-violet-50 text-slate-600 hover:text-violet-700"
                            >
                                <PlusCircle className="mr-3 w-5 h-5 text-violet-500" /> Hızlı Stok Ekle
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => setIsUserOpen(true)}
                                className="w-full justify-start h-12 border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-600 hover:text-blue-700"
                            >
                                <Users className="mr-3 w-5 h-5 text-blue-500" /> Yeni Personel Ekle
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => setIsWarehouseOpen(true)}
                                className="w-full justify-start h-12 border-slate-200 hover:border-orange-300 hover:bg-orange-50 text-slate-600 hover:text-orange-700"
                            >
                                <Store className="mr-3 w-5 h-5 text-orange-500" /> Depo / Şube Aç
                            </Button>

                            <Link href="/profit">
                                <Button variant="outline" className="w-full justify-start h-12 border-slate-200 hover:border-green-300 hover:bg-green-50 text-slate-600 hover:text-green-700">
                                    <TrendingUp className="mr-3 w-5 h-5 text-green-500" /> Karlılık Raporu
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* MODALLAR */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Stok Giriş / Çıkış</DialogTitle>
                        <DialogDescription>Mal kabul veya zayi işlemlerini buradan yapabilirsiniz.</DialogDescription>
                    </DialogHeader>
                    <StockEntryForm
                        onSubmit={onSubmit}
                        isLoading={createEntryMutation.isPending}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={isUserOpen} onOpenChange={setIsUserOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Yeni Personel Ekle</DialogTitle>
                        <DialogDescription>Sisteme giriş yapacak yeni bir kullanıcı tanımlayın.</DialogDescription>
                    </DialogHeader>
                    <UserForm
                        onSubmit={onUserSubmit}
                        isLoading={createUserMutation.isPending}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={isWarehouseOpen} onOpenChange={setIsWarehouseOpen}>
                <DialogContent className="sm:max-w-6xl h-[90vh] flex flex-col p-0 gap-0">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle>Yeni Depo / Şube Aç</DialogTitle>
                        <DialogDescription>Yeni bir depo veya mağaza tanımlayın.</DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 min-h-0">
                        <WarehouseForm
                            onSubmit={(data) => createWarehouseMutation.mutate(data)}
                            isLoading={createWarehouseMutation.isPending}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

// --- 2. WAREHOUSE DASHBOARD ---
const WarehouseDashboard = () => {
    // Stock Entry Logic
    const { isOpen, setIsOpen, createEntryMutation, onSubmit } = useStockEntry();

    return (
        <div className="h-full flex flex-col p-6 space-y-6 animate-in fade-in duration-500 min-h-0">
            <div className="flex items-center justify-between shrink-0">
                <h2 className="text-3xl font-bold text-slate-800">Depo Operasyonları</h2>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold border border-blue-200">
                    Depo Sorumlusu
                </span>
            </div>

            <div className="flex-1 overflow-auto min-h-0 pr-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link href="/stocks">
                        <Card className="hover:shadow-md transition-all cursor-pointer border-l-4 border-l-blue-500 h-full group">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-medium text-slate-700 group-hover:text-blue-600">Stok Durumu</CardTitle>
                                <Package className="h-5 w-5 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-500 mb-4">Depodaki ürünlerin anlık miktarlarını görüntüleyin.</p>
                                <Button variant="secondary" className="w-full text-blue-600 bg-blue-50 hover:bg-blue-100">Listeyi Gör</Button>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/transfers">
                        <Card className="hover:shadow-md transition-all cursor-pointer border-l-4 border-l-orange-500 h-full group">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-medium text-slate-700 group-hover:text-orange-600">Transferler</CardTitle>
                                <ArrowRightLeft className="h-5 w-5 text-orange-500" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-500 mb-4">Gelen ve giden transferleri yönetin ve onaylayın.</p>
                                <Button variant="secondary" className="w-full text-orange-600 bg-orange-50 hover:bg-orange-100">İşlemleri Yönet</Button>
                            </CardContent>
                        </Card>
                    </Link>

                    <Card className="hover:shadow-md transition-all cursor-pointer border-l-4 border-l-green-500 bg-green-50/30 h-full">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-medium text-slate-700">Mal Kabul</CardTitle>
                            <PlusIcon />
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-600 mb-4">Yeni gelen ürünleri depoya hızlıca ekleyin.</p>
                            {/* Changed Link to Button trigger */}
                            <Button
                                onClick={() => setIsOpen(true)}
                                className="w-full bg-green-600 hover:bg-green-700 text-white shadow-sm"
                            >
                                Yeni Giriş Yap
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Stok Giriş / Çıkış</DialogTitle>
                        <DialogDescription>Mal kabul veya zayi işlemlerini buradan yapabilirsiniz.</DialogDescription>
                    </DialogHeader>
                    <StockEntryForm
                        onSubmit={onSubmit}
                        isLoading={createEntryMutation.isPending}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
};

// --- 3. SALES DASHBOARD  ---
const SalesDashboard = () => {
    return (
        <div className="h-full flex flex-col justify-center items-center bg-slate-50/50 rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative">

            <div className="text-center space-y-4 mb-10 max-w-2xl px-6 z-10">
                <div className="inline-flex items-center justify-center p-4 bg-blue-100 text-blue-600 rounded-full mb-2 ring-8 ring-blue-50 shadow-sm">
                    <ShoppingCart size={36} />
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight">
                    Hoş Geldiniz 👋
                </h1>
                <p className="text-slate-500 text-base md:text-lg font-medium">
                    İşlemlerinizi gerçekleştirmek için aşağıdan seçim yapın.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl px-6 z-10">

                <Link href="/sales" className="group block">
                    <div className="relative overflow-hidden bg-white border-2 border-blue-100 hover:border-blue-500 rounded-2xl p-6 text-center shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group-active:scale-95 h-full flex flex-col justify-center items-center">

                        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-32 h-32 bg-blue-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>

                        <div className="relative z-10 flex flex-col items-center gap-3">
                            <div className="p-3 bg-blue-600 text-white rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
                                <ShoppingCart size={28} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-700 transition-colors">Satış Ekranı</h3>
                                <p className="text-slate-500 text-xs group-hover:text-slate-600">Hızlı satış yap</p>
                            </div>
                        </div>
                    </div>
                </Link>

                <Link href="/stocks" className="group block">
                    <div className="relative overflow-hidden bg-white border-2 border-orange-100 hover:border-orange-500 rounded-2xl p-6 text-center shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group-active:scale-95 h-full flex flex-col justify-center items-center">

                        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-32 h-32 bg-orange-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>

                        <div className="relative z-10 flex flex-col items-center gap-3">
                            <div className="p-3 bg-orange-500 text-white rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
                                <Package size={28} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 group-hover:text-orange-600 transition-colors">Fiyat & Stok Gör</h3>
                                <p className="text-slate-500 text-xs group-hover:text-slate-600">Ürün listesini incele</p>
                            </div>
                        </div>
                    </div>
                </Link>

            </div>

            {/* Alt Bilgi */}
            <div className="absolute bottom-4 text-center text-slate-400 text-[10px] font-medium">
                <p>Güvenli Satış Sistemi v1.0.0</p>
                <p className="opacity-60">Tüm işlemler kayıt altına alınmaktadır.</p>
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

function PlusIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 h-5 w-5"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
    )
}