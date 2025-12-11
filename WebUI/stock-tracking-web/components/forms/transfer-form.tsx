'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useQuery } from '@tanstack/react-query';
import warehouseService from '@/services/warehouseService';
import stockService from '@/services/stockService';
import { useAuth } from '@/context/auth-context';
import { useEffect, useState } from 'react';
import { Loader2, ArrowRight } from 'lucide-react';

// Validasyon
const formSchema = z.object({
  sourceWarehouseId: z.coerce.number().min(1, 'Kaynak depo seçilmelidir.'),
  targetWarehouseId: z.coerce.number().min(1, 'Hedef depo seçilmelidir.'),
  productId: z.coerce.number().min(1, 'Ürün seçilmelidir.'),
  quantity: z.coerce.number().min(1, 'Miktar en az 1 olmalıdır.'),
}).refine((data) => data.sourceWarehouseId !== data.targetWarehouseId, {
    message: "Kaynak ve Hedef depo aynı olamaz.",
    path: ["targetWarehouseId"],
});

type TransferFormValues = z.infer<typeof formSchema>;

interface TransferFormProps {
  onSubmit: (data: TransferFormValues) => void;
  isLoading: boolean;
}

export const TransferForm: React.FC<TransferFormProps> = ({
  onSubmit,
  isLoading,
}) => {
  const { user } = useAuth();
  const { data: warehouses } = useQuery({ queryKey: ['warehouses'], queryFn: warehouseService.getAll });
  const { data: allStocks } = useQuery({ queryKey: ['stocks'], queryFn: stockService.getAll });
  
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [maxQuantity, setMaxQuantity] = useState(0);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sourceWarehouseId: 0,
      targetWarehouseId: 0,
      productId: 0,
      quantity: 1,
    },
  });

  const sourceWhId = form.watch('sourceWarehouseId');
  const selectedProductId = form.watch('productId');

  useEffect(() => {
    if (sourceWhId && allStocks?.data) {
        const productsInSource = allStocks.data.filter(s => s.warehouseId === Number(sourceWhId) && s.quantity > 0);
        setAvailableProducts(productsInSource);
        form.setValue('productId', 0);
    } else {
        setAvailableProducts([]);
    }
  }, [sourceWhId, allStocks, form]);

  useEffect(() => {
    if (selectedProductId && availableProducts.length > 0) {
        const stockItem = availableProducts.find(p => p.productId === Number(selectedProductId));
        if (stockItem) {
            setMaxQuantity(stockItem.quantity);
        }
    }
  }, [selectedProductId, availableProducts]);

  useEffect(() => {
    if (user?.role === 'DepoSorumlusu' && user.warehouseId) {
        form.setValue('sourceWarehouseId', user.warehouseId);
    }
  }, [user, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100 mb-2 text-sm text-blue-800">
            <span className="font-bold">Bilgi:</span> Transfer işlemi stoğu kaynaktan düşer, hedef depoya "Onay Bekliyor" olarak gönderir.
        </div>

        <div className="grid grid-cols-2 gap-4 items-end">
            <FormField
            control={form.control}
            name="sourceWarehouseId"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Kaynak (Çıkış)</FormLabel>
                <Select 
                    onValueChange={(val) => field.onChange(Number(val))} 
                    value={field.value ? field.value.toString() : ''}
                    disabled={user?.role === 'DepoSorumlusu'}
                >
                    <FormControl><SelectTrigger ref={field.ref}><SelectValue placeholder="Seçiniz" /></SelectTrigger></FormControl>
                    <SelectContent>
                        {warehouses?.data.map((w) => (
                            <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
            <div className="flex justify-center pb-3"><ArrowRight className="text-slate-400" /></div>
            <FormField
            control={form.control}
            name="targetWarehouseId"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Hedef (Giriş)</FormLabel>
                <Select 
                    onValueChange={(val) => field.onChange(Number(val))} 
                    value={field.value ? field.value.toString() : ''}
                >
                    <FormControl><SelectTrigger ref={field.ref}><SelectValue placeholder="Seçiniz" /></SelectTrigger></FormControl>
                    <SelectContent>
                        {warehouses?.data
                            .filter(w => w.id !== Number(sourceWhId))
                            .map((w) => (
                            <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <FormField
          control={form.control}
          name="productId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transfer Edilecek Ürün</FormLabel>
              <Select 
                onValueChange={(val) => field.onChange(Number(val))} 
                value={field.value ? field.value.toString() : ''}
                disabled={!sourceWhId}
              >
                <FormControl><SelectTrigger ref={field.ref}><SelectValue placeholder={sourceWhId ? "Ürün Seçin" : "Önce Kaynak Depoyu Seçin"} /></SelectTrigger></FormControl>
                <SelectContent>
                  {availableProducts.map((s) => (
                    <SelectItem key={s.productId} value={s.productId.toString()}>
                        {s.productName} (Mevcut: {s.quantity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adet {maxQuantity > 0 && <span className="text-xs text-slate-500">(Max: {maxQuantity})</span>}</FormLabel>
              <FormControl>
                <Input 
                    type="number" 
                    {...field} 
                    value={(field.value as number) ?? 1}
                    onChange={e => {
                        const val = Number(e.target.value);
                        if (val > maxQuantity && maxQuantity > 0) {
                            field.onChange(maxQuantity);
                        } else {
                            field.onChange(val);
                        }
                    }}
                    onFocus={e => e.target.select()}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading} className="w-full bg-slate-900 hover:bg-slate-800">
            {isLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2"/> : null}
            Transferi Başlat
          </Button>
        </div>
      </form>
    </Form>
  );
};