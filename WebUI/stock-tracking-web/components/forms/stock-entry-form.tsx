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

const formSchema = z.object({
  productId: z.coerce.number().min(1, 'Ürün seçimi zorunludur.'),
  warehouseId: z.coerce.number().min(1, 'Depo seçimi zorunludur.'),
  quantity: z.coerce.number().min(1, 'Miktar en az 1 olmalıdır.'),
  processType: z.coerce.number().min(1, 'İşlem tipi seçilmelidir.'),
  description: z.string().optional(),
  unitPrice: z.coerce.number().optional(),
  taxRate: z.coerce.number().optional(),
});

type StockFormValues = z.infer<typeof formSchema>;

interface StockEntryFormProps {
  onSubmit: (data: StockFormValues) => void;
  isLoading: boolean;
}

export const StockEntryForm: React.FC<StockEntryFormProps> = ({
  onSubmit,
  isLoading,
}) => {
  const { data: products } = useQuery({ queryKey: ['products'], queryFn: productService.getAll });
  const { data: warehouses } = useQuery({ queryKey: ['warehouses'], queryFn: warehouseService.getAll });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productId: 0,
      warehouseId: 0,
      quantity: 1,
      processType: 2,
      description: '',
      unitPrice: 0,
      taxRate: 18,
    },
  });

  const processType = form.watch('processType');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        <FormField
          control={form.control}
          name="productId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ürün</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value ? (field.value as number).toString() : ''}
              >
                <FormControl>
                    <SelectTrigger ref={field.ref}>
                        <SelectValue placeholder="Ürün Seçin" />
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {products?.data.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>{p.name} ({p.barcode})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="warehouseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Depo</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value ? (field.value as number).toString() : ''}
              >
                <FormControl>
                    <SelectTrigger ref={field.ref}>
                        <SelectValue placeholder="Depo Seçin" />
                    </SelectTrigger>
                </FormControl>
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

        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="processType"
            render={({ field }) => (
                <FormItem>
                <FormLabel>İşlem Tipi</FormLabel>
                <Select 
                    onValueChange={(val) => field.onChange(Number(val))} 
                    value={field.value ? field.value.toString() : '2'}
                >
                    <FormControl>
                        <SelectTrigger ref={field.ref}>
                            <SelectValue />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="2">📥 Mal Kabul (Ekle)</SelectItem>
                        <SelectItem value="4">🗑️ Zayi / Fire (Düş)</SelectItem>
                        <SelectItem value="3">↩️ İade Al (Ekle)</SelectItem>
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
                <FormLabel>Miktar</FormLabel>
                <FormControl>
                    <Input 
                        type="number" 
                        {...field}
                        value={(field.value as number) ?? ''} 
                        onChange={e => field.onChange(+e.target.value)}
                        onFocus={(e) => e.target.select()}
                    />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        {Number(processType) === 2 && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg border border-green-100">
                <FormField
                control={form.control}
                name="unitPrice"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-green-800">Birim Alış Fiyatı (TL)</FormLabel>
                    <FormControl>
                        <Input 
                            type="number" 
                            className="bg-white"
                            {...field}
                            value={(field.value as number) ?? 0} 
                            onChange={e => field.onChange(+e.target.value)}
                            onFocus={(e) => e.target.select()}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="taxRate"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-green-800">Alış KDV (%)</FormLabel>
                    <FormControl>
                        <Input 
                            type="number" 
                            className="bg-white"
                            {...field}
                            value={(field.value as number) ?? 0} 
                            onChange={e => field.onChange(+e.target.value)}
                            onFocus={(e) => e.target.select()}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <p className="col-span-2 text-xs text-green-600">
                    * Bu fiyatlar ürünün ortalama maliyetini etkileyecektir.
                </p>
            </div>
        )}

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Açıklama</FormLabel>
              <FormControl>
                <Input 
                    placeholder="Örn: Fatura No: 123" 
                    {...field}
                    value={(field.value as string) ?? ''} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'İşleniyor...' : 'Hareketi Kaydet'}
          </Button>
        </div>
      </form>
    </Form>
  );
};