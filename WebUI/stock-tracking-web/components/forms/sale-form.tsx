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
import productService from '@/services/productService';
import warehouseService from '@/services/warehouseService';
import { CreateSaleRequest } from '@/types';

// Validasyon
const formSchema = z.object({
  productId: z.coerce.number().min(1, 'Ürün seçimi zorunludur.'),
  warehouseId: z.coerce.number().min(1, 'Depo seçimi zorunludur.'),
  quantity: z.coerce.number().min(1, 'En az 1 adet satılmalı.'),
  paymentMethod: z.coerce.number().min(1, 'Ödeme yöntemi seçiniz.'), // 1: Nakit, 2: Kart
});

interface SaleFormProps {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  isLoading: boolean;
}

export const SaleForm: React.FC<SaleFormProps> = ({
  onSubmit,
  isLoading,
}) => {
  // Dropdown verileri
  const { data: products } = useQuery({ queryKey: ['products'], queryFn: productService.getAll });
  const { data: warehouses } = useQuery({ queryKey: ['warehouses'], queryFn: warehouseService.getAll });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productId: 0,
      warehouseId: 0,
      quantity: 1,
      paymentMethod: 1, // Varsayılan: Nakit
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        <div className="grid grid-cols-2 gap-4">
            {/* Ürün Seçimi */}
            <FormField
            control={form.control}
            name="productId"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Satılacak Ürün</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ? field.value.toString() : ''}>
                    <FormControl><SelectTrigger ref={field.ref}><SelectValue placeholder="Ürün Seç" /></SelectTrigger></FormControl>
                    <SelectContent>
                    {products?.data.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                            {p.name} - {p.salePrice} ₺
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />

            {/* Depo Seçimi */}
            <FormField
            control={form.control}
            name="warehouseId"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Çıkış Deposu</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ? field.value.toString() : ''}>
                    <FormControl><SelectTrigger ref={field.ref}><SelectValue placeholder="Depo Seç" /></SelectTrigger></FormControl>
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
        </div>

        <div className="grid grid-cols-2 gap-4">
            {/* Adet */}
            <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Adet</FormLabel>
                <FormControl>
                    <Input 
                        type="number" 
                        {...field}
                        value={(field.value as number) ?? 1} 
                        onChange={e => field.onChange(+e.target.value)}
                    />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />

            {/* Ödeme Yöntemi */}
            <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Ödeme Tipi</FormLabel>
                <Select onValueChange={field.onChange} value={(field.value as string) ?? ''}>
                    <FormControl><SelectTrigger ref={field.ref}><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="1">💵 Nakit</SelectItem>
                        <SelectItem value="2">💳 Kredi Kartı</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
            {isLoading ? 'Satış Yapılıyor...' : '✅ Satışı Tamamla'}
          </Button>
        </div>
      </form>
    </Form>
  );
};