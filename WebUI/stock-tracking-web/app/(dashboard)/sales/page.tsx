'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import saleService from '@/services/saleService';
import productService from '@/services/productService';
import warehouseService from '@/services/warehouseService';
import stockService from '@/services/stockService';
import userService from '@/services/userService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ShoppingCart, Search, X, CreditCard, Banknote, Loader2, Package, Store, UserCircle } from 'lucide-react';
import { toast } from 'sonner';
import { CreateSaleRequest, CreateSaleItemRequest, ProductListDto } from '@/types';
import { useAuth } from '@/context/auth-context';
import { SaleItemForm } from '@/components/forms/sale-item-form';

interface BasketItem extends CreateSaleItemRequest {
    productName: string;
    barcode: string;
    stockQuantity: number;
}

export default function SalesPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const [search, setSearch] = useState('');
    const [adminSelectedWarehouse, setAdminSelectedWarehouse] = useState<number>(0);
    const [paymentMethod, setPaymentMethod] = useState<number>(1);
    const [basket, setBasket] = useState<BasketItem[]>([]);

    const [selectedSalesPerson, setSelectedSalesPerson] = useState<string>("0");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<ProductListDto | null>(null);
    const [selectedProductStock, setSelectedProductStock] = useState<number>(0);

    const currentWarehouseId = user?.role === 'Admin' ? adminSelectedWarehouse : user?.warehouseId;
    const canSell = user?.role === 'SatisPersoneli' || user?.role === 'Admin';

    const isSystemAccount = user?.username.endsWith('_satis') || user?.username.endsWith('_depo');

    const { data: products } = useQuery({ queryKey: ['products'], queryFn: productService.getAll });
    const { data: warehouses } = useQuery({ queryKey: ['warehouses'], queryFn: warehouseService.getAll });
    const { data: stocks } = useQuery({ queryKey: ['stocks'], queryFn: stockService.getAll });
    const { data: users } = useQuery({ queryKey: ['users'], queryFn: userService.getAll });

    const warehouseStaff = useMemo(() => {
        if (!users?.data || !currentWarehouseId) return [];
        return users.data.filter(u =>
            u.warehouseId === currentWarehouseId &&
            !u.username.endsWith('_satis') && // Sistem hesabını listede gösterme
            !u.username.endsWith('_depo') &&  // Depo hesabını listede gösterme
            (u.role === 'SatisPersoneli' || u.role === 'DepoSorumlusu' || u.role === 'Admin')
        );
    }, [users, currentWarehouseId]);

    const createMutation = useMutation({
        mutationFn: saleService.create,
        onSuccess: () => {
            toast.success('Satış başarıyla tamamlandı! 🎉');
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['sales'] });
            queryClient.invalidateQueries({ queryKey: ['stocks'] });
            setBasket([]);
            setSelectedSalesPerson("0");
        },
        onError: (err: any) => toast.error(err?.response?.data?.message || 'Satış başarısız.'),
    });

    const handleProductClick = (product: ProductListDto, stock: number) => {
        if (!currentWarehouseId || currentWarehouseId === 0) {
            toast.warning("Lütfen bir depo seçiniz.");
            return;
        }
        if (stock <= 0) {
            toast.error("Bu depoda stok yok!");
            return;
        }
        setSelectedProduct(product);
        setSelectedProductStock(stock);
        setIsModalOpen(true);
    };

    const onAddItem = (values: any) => {
        if (!selectedProduct) return;
        if (values.quantity > selectedProductStock) {
            toast.warning(`Yetersiz Stok! (Mevcut: ${selectedProductStock})`);
            return;
        }
        setBasket((prev) => [...prev, {
            productId: selectedProduct.id,
            productName: selectedProduct.name,
            barcode: selectedProduct.barcode,
            quantity: values.quantity,
            stockQuantity: selectedProductStock,
            priceWithVat: values.priceWithVat,
            vatRate: values.vatRate
        }]);
        setIsModalOpen(false);
        setSelectedProduct(null);
    };

    const removeFromBasket = (index: number) => {
        setBasket(prev => prev.filter((_, i) => i !== index));
    };

    const updateQuantity = (index: number, delta: number) => {
        setBasket(prev => prev.map((item, i) => {
            if (i === index) {
                const newQty = item.quantity + delta;
                if (newQty > item.stockQuantity) {
                    toast.warning("Stok sınırına ulaşıldı.");
                    return item;
                }
                return newQty > 0 ? { ...item, quantity: newQty } : item;
            }
            return item;
        }));
    };

    const basketTotal = basket.reduce((sum, item) => {
        return sum + (item.quantity * (item.priceWithVat || 0));
    }, 0);

    const filteredProductsWithStock = useMemo(() => {
        if (!products?.data) return [];
        let filtered = products.data.filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.barcode.includes(search)
        );
        return filtered.map(product => {
            const stockEntry = stocks?.data?.find(s => s.productId === product.id && s.warehouseId === currentWarehouseId);
            return { ...product, warehouseStock: stockEntry ? stockEntry.quantity : 0 };
        });
    }, [products, search, stocks, currentWarehouseId]);

    const handleCheckout = () => {
        if (basket.length === 0) return;

        // KDV Kuralı
        if (paymentMethod === 2) {
            const hasZeroVat = basket.some(i => (i.vatRate || 0) <= 0);
            if (hasZeroVat) {
                toast.error("Kredi Kartı ile satışta KDV 0 olamaz!");
                return;
            }
        }

        if (isSystemAccount && selectedSalesPerson === "0") {
            toast.warning("Lütfen satışı yapan personeli seçiniz!");
            return;
        }

        const payload: CreateSaleRequest = {
            warehouseId: currentWarehouseId!,
            paymentMethod: paymentMethod,

            actualSalesPersonId: selectedSalesPerson !== "0" ? Number(selectedSalesPerson) : undefined,

            items: basket.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                priceWithVat: item.priceWithVat,
                vatRate: item.vatRate
            }))
        };

        createMutation.mutate(payload);
    };

    return (
        <div className="h-full flex flex-col p-6 space-y-4 min-h-0 bg-slate-50/50">
            <div className="flex justify-between items-center shrink-0">
                <h2 className="text-2xl font-bold tracking-tight text-slate-800">Satış Ekranı</h2>
            </div>

            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6">

                <div className="lg:col-span-8 h-full flex flex-col gap-4 min-h-0">
                    <div className="flex gap-3 shrink-0 bg-white p-3 rounded-xl shadow-sm border border-slate-200">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Ürün Adı veya Barkod Ara..."
                                className="pl-10 h-10 text-base"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                autoFocus
                            />
                        </div>

                        {user?.role === 'Admin' ? (
                            <Select value={adminSelectedWarehouse.toString()} onValueChange={val => setAdminSelectedWarehouse(Number(val))}>
                                <SelectTrigger className="w-[220px] h-10"><SelectValue placeholder="Depo Seç (Admin)" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">Depo Seçiniz...</SelectItem>
                                    {warehouses?.data.map(w => (<SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className="flex gap-2 items-center">
                                <div className="flex items-center px-4 bg-slate-100 rounded-lg text-sm font-medium text-slate-700 border border-slate-200 h-10">
                                    <Store className="w-4 h-4 mr-2 text-slate-500" />
                                    {warehouses?.data.find(w => w.id === user?.warehouseId)?.name || 'Depom'}
                                </div>

                                {isSystemAccount ? (
                                    warehouseStaff.length === 0 ? (
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2 h-10 bg-red-50 px-3 rounded-lg border border-red-200">
                                                <span className="text-xs text-red-600 font-bold whitespace-nowrap">
                                                    ⚠ Personel Yok!
                                                </span>
                                            </div>

                                            {/* DETAYLI DEBUG PANELİ */}
                                            <details className="mt-2 p-3 border border-amber-200 bg-amber-50 rounded-lg text-[10px] text-amber-900 w-[300px] absolute top-12 left-0 z-50 shadow-xl">
                                                <summary className="cursor-pointer font-bold mb-2 hover:underline">Neden Kimse Yok? (Tıkla)</summary>
                                                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                                    <p><strong>Şu Anki Depo ID:</strong> {currentWarehouseId}</p>
                                                    <div className="border-t border-amber-200 pt-1">
                                                        <strong>Tüm Kullanıcılar Analizi:</strong>
                                                        <ul className="list-disc pl-3 mt-1 space-y-1">
                                                            {users?.data?.map(u => {
                                                                const isWarehouseMatch = u.warehouseId === currentWarehouseId;
                                                                const isSystem = u.username.endsWith('_satis') || u.username.endsWith('_depo');
                                                                const isRoleMatch = (u.role === 'SatisPersoneli' || u.role === 'DepoSorumlusu' || u.role === 'Admin');

                                                                let reason = "";
                                                                if (!isWarehouseMatch) reason = `Farklı Depo (ID: ${u.warehouseId})`;
                                                                else if (isSystem) reason = "Sistem Hesabı (Gizli)";
                                                                else if (!isRoleMatch) reason = `Uygunsuz Rol (${u.role})`;
                                                                else reason = "✅ LİSTEDE OLMALI";

                                                                return (
                                                                    <li key={u.id} className={reason.includes("✅") ? "text-green-700 font-bold" : "text-red-700 opacity-70"}>
                                                                        {u.username} ({u.fullName})
                                                                        <br />
                                                                        <span className="italic">&rarr; {reason}</span>
                                                                    </li>
                                                                );
                                                            })}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </details>
                                        </div>
                                    ) : (
                                        <Select
                                            value={selectedSalesPerson}
                                            onValueChange={setSelectedSalesPerson}
                                        >
                                            <SelectTrigger className={`w-[200px] h-10 ${selectedSalesPerson === "0" ? "border-red-300 bg-red-50" : ""}`}>
                                                <SelectValue placeholder="Personel Seçin" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="0" disabled>Personel Seçiniz...</SelectItem>
                                                {warehouseStaff.map(u => (
                                                    <SelectItem key={u.id} value={u.id.toString()}>
                                                        {u.fullName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )
                                ) : (
                                    <div className="flex items-center px-4 bg-green-50 border-green-200 rounded-lg text-sm font-medium text-green-700 border h-10">
                                        <UserCircle className="w-4 h-4 mr-2" />
                                        {user?.username}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto min-h-0 bg-transparent rounded-xl">
                        {!currentWarehouseId || currentWarehouseId === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-white border border-dashed rounded-xl">
                                <Store className="w-12 h-12 mb-2 opacity-20" />
                                <p>Lütfen işlem yapılacak depoyu seçiniz.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                                {filteredProductsWithStock.map(product => (
                                    <div
                                        key={product.id}
                                        onClick={() => canSell && handleProductClick(product, product.warehouseStock)}
                                        className={`
                                    bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-3 group relative overflow-hidden select-none
                                    ${!canSell || product.warehouseStock <= 0 ? 'opacity-60 grayscale cursor-not-allowed' : 'hover:border-blue-400 active:scale-95'}
                                `}
                                    >
                                        <div className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full border ${product.warehouseStock > 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                            {product.warehouseStock} Adet
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[10px] text-gray-400 font-mono">{product.barcode}</div>
                                            <div className="text-sm font-semibold text-slate-800 line-clamp-2 leading-tight group-hover:text-blue-600 min-h-[2.5rem]">
                                                {product.name}
                                            </div>
                                            <div className="text-[10px] text-gray-500 flex items-center gap-1">
                                                <Package className="w-3 h-3" /> {product.categoryName}
                                            </div>
                                        </div>
                                        <div className="pt-3 border-t border-slate-100 flex items-end justify-end">
                                            <div className="text-lg font-bold text-blue-700">
                                                {product.salePrice} ₺
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-4 h-full flex flex-col min-h-0">
                    <Card className="h-full flex flex-col shadow-lg border-0 lg:border bg-white overflow-hidden rounded-xl">
                        <CardHeader className="bg-slate-50/80 border-b py-4 px-5 shrink-0 backdrop-blur-sm">
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-base text-slate-800">
                                    <ShoppingCart className="w-5 h-5 text-blue-600" /> Satış Sepeti
                                </div>
                                <span className="text-xs font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-full border shadow-sm">
                                    {basket.length} Ürün
                                </span>
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="flex-1 overflow-y-auto p-0 scroll-smooth">
                            {basket.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                                        <ShoppingCart size={32} className="opacity-20 translate-x-[-2px]" />
                                    </div>
                                    <p className="text-sm font-medium">Sepetinizde ürün bulunmuyor.</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm shadow-sm">
                                        <TableRow className="hover:bg-transparent border-b-slate-200">
                                            <TableHead className="h-10 text-xs font-semibold text-slate-600 pl-4">Ürün</TableHead>
                                            <TableHead className="h-10 text-xs font-semibold text-slate-600 text-center w-20">Adet</TableHead>
                                            <TableHead className="h-10 text-xs font-semibold text-slate-600 text-right pr-4">Tutar</TableHead>
                                            <TableHead className="h-10 w-8"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {basket.map((item, index) => (
                                            <TableRow key={index} className="text-sm hover:bg-slate-50/50 group transition-colors">
                                                <TableCell className="py-3 pl-4">
                                                    <div className="font-medium line-clamp-1 text-slate-800">{item.productName}</div>
                                                    <div className="text-[10px] text-gray-400 mt-0.5">{item.priceWithVat} ₺ x %{item.vatRate} KDV</div>
                                                </TableCell>
                                                <TableCell className="text-center py-3">
                                                    <div className="flex items-center justify-center gap-1 bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                                                        <button className="w-6 h-6 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-md text-slate-600 transition-all font-bold" onClick={() => updateQuantity(index, -1)}>-</button>
                                                        <span className="w-6 text-center font-semibold text-xs text-slate-700">{item.quantity}</span>
                                                        <button className="w-6 h-6 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-md text-slate-600 transition-all font-bold" onClick={() => updateQuantity(index, 1)}>+</button>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-bold py-3 text-slate-700 pr-4">
                                                    {(item.quantity * (item.priceWithVat || 0)).toLocaleString()} ₺
                                                </TableCell>
                                                <TableCell className="py-3 pr-2">
                                                    <button
                                                        className="w-6 h-6 flex items-center justify-center rounded-md text-slate-300 hover:text-red-600 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                                        onClick={() => removeFromBasket(index)}
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>

                        <CardFooter className="flex-col border-t p-4 bg-slate-50/50 gap-4 shrink-0 backdrop-blur-sm">
                            <div className="grid grid-cols-2 gap-3 w-full">
                                <div
                                    onClick={() => setPaymentMethod(1)}
                                    className={`cursor-pointer border rounded-xl p-3 flex items-center justify-center gap-2 transition-all text-sm font-medium ${paymentMethod === 1 ? 'bg-green-50 border-green-500 text-green-700 shadow-sm ring-1 ring-green-500/20' : 'bg-white hover:bg-gray-50 text-slate-600 border-slate-200'}`}
                                >
                                    <Banknote size={18} /> Nakit
                                </div>
                                <div
                                    onClick={() => setPaymentMethod(2)}
                                    className={`cursor-pointer border rounded-xl p-3 flex items-center justify-center gap-2 transition-all text-sm font-medium ${paymentMethod === 2 ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm ring-1 ring-blue-500/20' : 'bg-white hover:bg-gray-50 text-slate-600 border-slate-200'}`}
                                >
                                    <CreditCard size={18} /> Kredi Kartı
                                </div>
                            </div>

                            <div className="w-full space-y-3">
                                <div className="flex items-end justify-between border-t pt-3 border-slate-200">
                                    <span className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Toplam Tutar</span>
                                    <span className="text-3xl font-bold text-slate-900 tracking-tight">{basketTotal.toLocaleString()} <span className="text-lg font-normal text-slate-500">₺</span></span>
                                </div>
                                <Button
                                    size="lg"
                                    className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/10 h-12 text-base rounded-xl font-medium"
                                    onClick={handleCheckout}
                                    disabled={basket.length === 0 || createMutation.isPending || !canSell}
                                >
                                    {createMutation.isPending ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : 'Satışı Tamamla'}
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                </div>

            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Sepete Ekle</DialogTitle>
                    </DialogHeader>
                    {selectedProduct && (
                        <SaleItemForm
                            product={selectedProduct}
                            onSubmit={onAddItem}
                            onCancel={() => setIsModalOpen(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}