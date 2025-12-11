'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import systemService from '@/services/systemService';
import categoryService from '@/services/categoryService';
import warehouseService from '@/services/warehouseService';
import productService from '@/services/productService';
import { CategoryForm } from '@/components/forms/category-form';
import { WarehouseForm } from '@/components/forms/warehouse-form';
import { ProductForm } from '@/components/forms/product-form';
import { CheckCircle2, ChevronRight, Package, Home, Layers, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function SetupPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [activeStep, setActiveStep] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Sistem durumunu çek
    const { data: status, isLoading, refetch } = useQuery({
        queryKey: ['setupStatus'],
        queryFn: systemService.getSetupStatus,
    });

    useEffect(() => {
        if (status) {
            // YENİ SIRALAMA: 1. DEPO, 2. KATEGORİ, 3. ÜRÜN
            if (!status.hasWarehouses) setActiveStep(1);
            else if (!status.hasCategories) setActiveStep(2);
            else if (!status.hasProducts) setActiveStep(3);
            else setActiveStep(4); // Hepsi tamam
        }
    }, [status]);

    const handleWarehouseSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            const res = await warehouseService.create(data);
            if (res.success) {
                toast.success('Depo başarıyla oluşturuldu.');
                await refetch();
            } else {
                toast.error('Depo oluşturulurken hata: ' + res.message);
            }
        } catch (error) {
            toast.error('Beklenmedik bir hata oluştu.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCategorySubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            const res = await categoryService.create(data);
            if (res.success) {
                toast.success('Kategori başarıyla oluşturuldu.');
                await refetch();
            } else {
                toast.error('Kategori oluşturulurken hata: ' + res.message);
            }
        } catch (error) {
            toast.error('Beklenmedik bir hata oluştu.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleProductSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            const res = await productService.create(data);
            if (res.success) {
                toast.success('Ürün başarıyla oluşturuldu.');
                await refetch();
            } else {
                toast.error('Ürün oluşturulurken hata: ' + res.message);
            }
        } catch (error) {
            // Hata mesajını daha düzgün gösterelim
            console.error(error);
            toast.error('Beklenmedik bir hata oluştu.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFinish = () => {
        router.push('/');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50">
                <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
            </div>
        );
    }

    // Zaten her şey hazırsa dashboard'a yönlendir
    if (status?.isSystemReady && activeStep !== 4) {
        // Otomatik yönlendirme eklenebilir.
    }

    return (
        <div className="h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden">
            {/* Sol Sidebar / Adımlar */}
            <div className="w-full md:w-80 bg-white border-r border-slate-200 p-6 flex flex-col shrink-0 overflow-y-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Kurulum Sihirbazı</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Sistemi kullanmaya başlamadan önce temel verileri oluşturmalısınız.
                    </p>
                </div>

                <div className="space-y-6 relative">
                    <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-slate-100 -z-10" />

                    {/* Adım 1: Depo */}
                    <div className={`flex items-start gap-4 ${activeStep === 1 ? 'opacity-100' : 'opacity-50'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${status?.hasWarehouses ? 'bg-green-100 text-green-600' : (activeStep === 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-200 text-slate-500')}`}>
                            {status?.hasWarehouses ? <CheckCircle2 className="w-5 h-5" /> : <Home className="w-4 h-4" />}
                        </div>
                        <div>
                            <h3 className={`font-medium ${activeStep === 1 ? 'text-slate-900' : 'text-slate-500'}`}>1. Depo Oluştur</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Stok takibi yapılacak fiziki veya sanal bir depo ekleyin.</p>
                        </div>
                    </div>

                    {/* Adım 2: Kategori */}
                    <div className={`flex items-start gap-4 ${activeStep === 2 ? 'opacity-100' : 'opacity-50'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${status?.hasCategories ? 'bg-green-100 text-green-600' : (activeStep === 2 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-200 text-slate-500')}`}>
                            {status?.hasCategories ? <CheckCircle2 className="w-5 h-5" /> : <Layers className="w-4 h-4" />}
                        </div>
                        <div>
                            <h3 className={`font-medium ${activeStep === 2 ? 'text-slate-900' : 'text-slate-500'}`}>2. Kategori Oluştur</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Ürünlerinizi gruplamak için en az bir kategori ekleyin.</p>
                        </div>
                    </div>

                    {/* Adım 3: Ürün */}
                    <div className={`flex items-start gap-4 ${activeStep === 3 ? 'opacity-100' : 'opacity-50'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${status?.hasProducts ? 'bg-green-100 text-green-600' : (activeStep === 3 ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-200 text-slate-500')}`}>
                            {status?.hasProducts ? <CheckCircle2 className="w-5 h-5" /> : <Package className="w-4 h-4" />}
                        </div>
                        <div>
                            <h3 className={`font-medium ${activeStep === 3 ? 'text-slate-900' : 'text-slate-500'}`}>3. Ürün Oluştur</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Satışını yapacağınız ilk ürününüzü sisteme kaydedin.</p>
                        </div>
                    </div>
                </div>

                {status?.isSystemReady && (
                    <div className="mt-auto pt-6 border-t border-slate-100">
                        <div className="bg-green-50 p-4 rounded-lg flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-green-800 text-sm">Kurulum Tamamlandı!</h4>
                                <p className="text-xs text-green-700 mt-1">Sistemi kullanmaya hazırsınız.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Sağ Ana İçerik */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 overflow-hidden bg-slate-50">
                <div className={`w-full bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col transition-all duration-300 ${activeStep === 1 ? 'max-w-6xl h-[85vh]' : 'max-w-2xl'}`}>

                    {activeStep === 1 && (
                        <div className="flex flex-col h-full min-h-0">
                            <div className="flex items-center gap-3 mb-6 border-b pb-4 shrink-0">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <Home className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-900">Depo Ekle</h2>
                                    <p className="text-sm text-slate-500">Sistemde hiç depo bulunamadı.</p>
                                </div>
                            </div>
                            <div className="flex-1 min-h-0 overflow-hidden">
                                <WarehouseForm isLoading={isSubmitting} onSubmit={handleWarehouseSubmit} />
                            </div>
                        </div>
                    )}

                    {activeStep === 2 && (
                        <div>
                            <div className="flex items-center gap-3 mb-6 border-b pb-4">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <Layers className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-900">Kategori Ekle</h2>
                                    <p className="text-sm text-slate-500">Sistemde hiç kategori bulunamadı.</p>
                                </div>
                            </div>
                            <CategoryForm isLoading={isSubmitting} onSubmit={handleCategorySubmit} />
                        </div>
                    )}

                    {activeStep === 3 && (
                        <div>
                            <div className="flex items-center gap-3 mb-6 border-b pb-4">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <Package className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-900">Ürün Ekle</h2>
                                    <p className="text-sm text-slate-500">Sistemde hiç ürün bulunamadı.</p>
                                </div>
                            </div>
                            <ProductForm isLoading={isSubmitting} onSubmit={handleProductSubmit} />
                        </div>
                    )}

                    {activeStep === 4 && (
                        <div className="text-center py-10">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Tebrikler! 🎉</h2>
                            <p className="text-slate-500 max-w-md mx-auto mb-8">
                                Gerekli temel veriler oluşturuldu. Artık stok takibi, satış işlemleri ve raporlama özelliklerini kullanmaya başlayabilirsiniz.
                            </p>
                            <Button onClick={handleFinish} className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-6 text-lg h-auto rounded-xl">
                                Paneli Görüntüle <ChevronRight className="w-5 h-5 ml-2" />
                            </Button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
