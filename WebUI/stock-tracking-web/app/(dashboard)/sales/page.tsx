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

  const isSystemAccount = user?.username.endsWith('_kasa') || user?.username.endsWith('_yonetim');

  const { data: products } = useQuery({ queryKey: ['products'], queryFn: productService.getAll });
  const { data: warehouses } = useQuery({ queryKey: ['warehouses'], queryFn: warehouseService.getAll });
  const { data: stocks } = useQuery({ queryKey: ['stocks'], queryFn: stockService.getAll });
  const { data: users } = useQuery({ queryKey: ['users'], queryFn: userService.getAll });

  const warehouseStaff = useMemo(() => {
    if (!users?.data || !currentWarehouseId) return [];
    return users.data.filter(u => 
        u.warehouseId === currentWarehouseId &&
        u.role === 'SatisPersoneli' &&
        u.username !== user?.username
    );
  }, [users, currentWarehouseId, user]);

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
    <div className="h-[calc(100vh-120px)] flex flex-col gap-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full min-h-0">
        
        <div className="lg:col-span-7 h-full flex flex-col gap-3 min-h-0">
            <div className="flex gap-2 shrink-0 bg-white p-2 rounded-lg shadow-sm border">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <Input 
                        placeholder="Ürün Adı veya Barkod Ara..." 
                        className="pl-9 h-9 text-sm" 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        autoFocus
                    />
                </div>
                
                {user?.role === 'Admin' ? (
                    <Select value={adminSelectedWarehouse.toString()} onValueChange={val => setAdminSelectedWarehouse(Number(val))}>
                        <SelectTrigger className="w-[200px] h-9 text-sm"><SelectValue placeholder="Depo Seç (Admin)" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="0">Depo Seçiniz...</SelectItem>
                            {warehouses?.data.map(w => (<SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>))}
                        </SelectContent>
                    </Select>
                ) : (
                    <div className="flex gap-2 items-center">
                        <div className="flex items-center px-3 bg-slate-100 rounded text-sm font-medium text-slate-600 border h-9">
                            <Store className="w-4 h-4 mr-2" />
                            {warehouses?.data.find(w => w.id === user?.warehouseId)?.name || 'Depom'}
                        </div>
                        
                        {isSystemAccount ? (
                            <Select 
                                value={selectedSalesPerson} 
                                onValueChange={setSelectedSalesPerson}
                            >
                                <SelectTrigger className={`w-[180px] h-9 text-sm ${selectedSalesPerson === "0" ? "border-red-300 bg-red-50" : ""}`}>
                                    <SelectValue placeholder="Satışı Yapan?" />
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
                        ) : (
                            <div className="flex items-center px-3 bg-green-50 border-green-100 rounded text-sm font-medium text-green-700 border h-9">
                                <UserCircle className="w-4 h-4 mr-2" />
                                {user?.username}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50/50 p-1 rounded-lg border">
                {!currentWarehouseId || currentWarehouseId === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-400">Lütfen depo seçiniz.</div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
                        {filteredProductsWithStock.map(product => (
                            <div 
                                key={product.id} 
                                onClick={() => canSell && handleProductClick(product, product.warehouseStock)}
                                className={`
                                    bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-2 group relative overflow-hidden
                                    ${!canSell || product.warehouseStock <= 0 ? 'opacity-60 grayscale cursor-not-allowed' : 'hover:border-blue-400 active:scale-95'}
                                `}
                            >
                                <div className={`absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded border ${product.warehouseStock > 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                    {product.warehouseStock} Adet
                                </div>
                                <div>
                                    <div className="text-[10px] text-gray-400 font-mono mb-0.5">{product.barcode}</div>
                                    <div className="text-sm font-semibold text-slate-800 line-clamp-2 leading-tight group-hover:text-blue-600 min-h-[2.5rem]">
                                        {product.name}
                                    </div>
                                    <div className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                                        <Package className="w-3 h-3" /> {product.categoryName}
                                    </div>
                                </div>
                                <div className="pt-2 border-t mt-1">
                                    <div className="text-base font-bold text-blue-700 text-right">
                                        {product.salePrice} ₺
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        <div className="lg:col-span-5 h-full flex flex-col min-h-0">
            <Card className="h-full flex flex-col shadow-md border-0 lg:border bg-white">
                <CardHeader className="bg-slate-50 border-b py-3 px-4 shrink-0">
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-base">
                            <ShoppingCart className="w-4 h-4" /> Sepet
                        </div>
                        <span className="text-xs font-normal text-slate-500 bg-white px-2 py-1 rounded border">
                            {basket.length} Kalem
                        </span>
                    </CardTitle>
                </CardHeader>
                
                <CardContent className="flex-1 overflow-y-auto p-0">
                    {basket.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                            <ShoppingCart size={40} className="opacity-10" />
                            <p className="text-sm">Sepetiniz boş.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-slate-50 sticky top-0 z-10">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="h-8 text-xs">Ürün</TableHead>
                                    <TableHead className="h-8 text-xs text-center w-20">Adet</TableHead>
                                    <TableHead className="h-8 text-xs text-center">KDV</TableHead>
                                    <TableHead className="h-8 text-xs text-right">Tutar</TableHead>
                                    <TableHead className="h-8 w-8"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {basket.map((item, index) => (
                                    <TableRow key={index} className="text-sm">
                                        <TableCell className="py-2">
                                            <div className="font-medium line-clamp-1 text-slate-800">{item.productName}</div>
                                            <div className="text-[10px] text-gray-400">{item.priceWithVat} ₺ (Birim)</div>
                                        </TableCell>
                                        <TableCell className="text-center py-2">
                                            <div className="flex items-center justify-center gap-1 bg-slate-100 rounded-md p-0.5">
                                                <button className="w-5 h-5 flex items-center justify-center hover:bg-white rounded text-slate-600" onClick={() => updateQuantity(index, -1)}>-</button>
                                                <span className="w-4 text-center font-medium text-xs">{item.quantity}</span>
                                                <button className="w-5 h-5 flex items-center justify-center hover:bg-white rounded text-slate-600" onClick={() => updateQuantity(index, 1)}>+</button>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center py-2 text-xs text-gray-500">
                                            %{item.vatRate}
                                        </TableCell>
                                        <TableCell className="text-right font-bold py-2 text-slate-700">
                                            {(item.quantity * (item.priceWithVat || 0)).toLocaleString()} ₺
                                        </TableCell>
                                        <TableCell className="py-2 pr-2">
                                            <button className="text-slate-400 hover:text-red-500 transition-colors" onClick={() => removeFromBasket(index)}>
                                                <X size={14} />
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>

                <CardFooter className="flex-col border-t p-3 bg-slate-50 gap-3 shrink-0">
                    <div className="grid grid-cols-2 gap-2 w-full">
                        <div 
                            onClick={() => setPaymentMethod(1)}
                            className={`cursor-pointer border rounded-md p-2 flex items-center justify-center gap-2 transition-all text-sm ${paymentMethod === 1 ? 'bg-green-50 border-green-500 text-green-700 shadow-sm' : 'bg-white hover:bg-gray-50 text-slate-600'}`}
                        >
                            <Banknote size={16} /> Nakit
                        </div>
                        <div 
                            onClick={() => setPaymentMethod(2)}
                            className={`cursor-pointer border rounded-md p-2 flex items-center justify-center gap-2 transition-all text-sm ${paymentMethod === 2 ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' : 'bg-white hover:bg-gray-50 text-slate-600'}`}
                        >
                            <CreditCard size={16} /> Kart
                        </div>
                    </div>

                    <div className="w-full flex items-center justify-between pt-1">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Toplam Tutar</span>
                            <span className="text-2xl font-bold text-slate-900">{basketTotal.toLocaleString()} ₺</span>
                        </div>
                        <Button 
                            size="default" 
                            className="px-6 bg-slate-900 hover:bg-slate-800" 
                            onClick={handleCheckout}
                            disabled={basket.length === 0 || createMutation.isPending || !canSell}
                        >
                            {createMutation.isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : 'Satışı Onayla'}
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