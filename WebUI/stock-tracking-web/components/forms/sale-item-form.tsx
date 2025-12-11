'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ProductListDto } from '@/types';
import { useEffect } from 'react';

const formSchema = z.object({
  quantity: z.coerce.number().min(1, 'En az 1 adet.'),
  priceWithVat: z.coerce.number().min(0, 'Fiyat 0 olamaz.'),
  vatRate: z.coerce.number().min(0).max(100),
});

interface SaleItemFormProps {
  product: ProductListDto;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  onCancel: () => void;
}

export const SaleItemForm: React.FC<SaleItemFormProps> = ({ product, onSubmit, onCancel }) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 1,
      priceWithVat: product.salePrice,
      vatRate: 20,
    },
  });

  useEffect(() => {
    form.reset({
        quantity: 1,
        priceWithVat: product.salePrice,
        vatRate: 20
    });
  }, [product, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 mb-2">
            <h4 className="font-bold text-blue-900">{product.name}</h4>
            <div className="flex justify-between text-sm mt-1 text-blue-700">
                <span>Barkod: {product.barcode}</span>
                <span>Stok: {product.totalStockQuantity}</span>
            </div>
            <div className="text-xs text-blue-500 mt-1">
                Tavsiye Edilen Satış Fiyatı: <span className="font-bold">{product.salePrice} ₺</span>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
                        onFocus={e => e.target.select()}
                        autoFocus
                    />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />

            <FormField
            control={form.control}
            name="vatRate"
            render={({ field }) => (
                <FormItem>
                <FormLabel>KDV (%)</FormLabel>
                <FormControl>
                    <Input 
                        type="number" 
                        {...field}
                        value={(field.value as number) ?? 0}
                        onChange={e => field.onChange(+e.target.value)}
                        onFocus={e => e.target.select()}
                    />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <FormField
          control={form.control}
          name="priceWithVat"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Satış Fiyatı (KDV Dahil)</FormLabel>
              <FormControl>
                <Input 
                    type="number" 
                    className="text-lg font-bold"
                    {...field}
                    value={(field.value as number) ?? 0}
                    onChange={e => field.onChange(+e.target.value)}
                    onFocus={e => e.target.select()}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>İptal</Button>
            <Button type="submit">Sepete Ekle</Button>
        </div>
      </form>
    </Form>
  );
};