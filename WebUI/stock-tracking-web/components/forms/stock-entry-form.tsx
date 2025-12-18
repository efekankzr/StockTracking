'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useQuery } from '@tanstack/react-query';
import productService from '@/services/productService';
import warehouseService from '@/services/warehouseService';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { ProductListDto } from '@/types/product';
import { WarehouseDto } from '@/types/warehouse';
import { ServiceResponse } from '@/types/common';

const formSchema = z.object({
  productId: z.coerce.number().min(1, 'Ürün seçimi zorunludur.'),
  warehouseId: z.coerce.number().min(1, 'Depo seçimi zorunludur.'),
  quantity: z.coerce.number().min(1, 'Miktar en az 1 olmalıdır.'),
  processType: z.coerce.number().min(1, 'İşlem tipi seçilmelidir.'),
  description: z.string().optional(),
  unitPrice: z.coerce.number().optional(),
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
  const { data: products } = useQuery<ServiceResponse<ProductListDto[]>>({ queryKey: ['products'], queryFn: productService.getAll });
  const { data: warehouses } = useQuery<ServiceResponse<WarehouseDto[]>>({ queryKey: ['warehouses'], queryFn: warehouseService.getAll });

  const [openProduct, setOpenProduct] = useState(false);
  const [openWarehouse, setOpenWarehouse] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productId: 0,
      warehouseId: 0,
      quantity: 1,
      processType: 2,
      description: '',
      unitPrice: 0,
    },
  });

  const processType = form.watch('processType');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        <FormField
          control={form.control}
          name="productId"
          render={({ field }) => {
            const selectedProduct = products?.data?.find(
              (p) => p.id === field.value
            );
            return (
              <FormItem className="flex flex-col">
                <FormLabel>Ürün</FormLabel>
                <Popover open={openProduct} onOpenChange={setOpenProduct}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openProduct}
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {selectedProduct
                          ? selectedProduct.name
                          : "Ürün Seçin"}
                        {selectedProduct && selectedProduct.barcode && (
                          <span className="ml-2 text-xs text-muted-foreground">({selectedProduct.barcode})</span>
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Ürün ara..." />
                      <CommandList>
                        <CommandEmpty>Ürün bulunamadı.</CommandEmpty>
                        <CommandGroup>
                          {products?.data?.map((product) => (
                            <CommandItem
                              value={`${product.name} ${product.barcode}`} // Ensure searchable by name and barcode
                              key={product.id}
                              onSelect={() => {
                                form.setValue("productId", product.id)
                                setOpenProduct(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  product.id === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {product.name}
                              <span className="ml-2 text-xs text-muted-foreground">({product.barcode})</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )
          }}
        />

        <FormField
          control={form.control}
          name="warehouseId"
          render={({ field }) => {
            const selectedWarehouse = warehouses?.data?.find(
              (w) => w.id === field.value
            );
            return (
              <FormItem className="flex flex-col">
                <FormLabel>Depo</FormLabel>
                <Popover open={openWarehouse} onOpenChange={setOpenWarehouse}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openWarehouse}
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {selectedWarehouse
                          ? selectedWarehouse.name
                          : "Depo Seçin"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Depo ara..." />
                      <CommandList>
                        <CommandEmpty>Depo bulunamadı.</CommandEmpty>
                        <CommandGroup>
                          {warehouses?.data?.map((warehouse) => (
                            <CommandItem
                              value={warehouse.name}
                              key={warehouse.id}
                              onSelect={() => {
                                form.setValue("warehouseId", warehouse.id)
                                setOpenWarehouse(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  warehouse.id === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {warehouse.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )
          }}
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
          <div className="grid grid-cols-1 gap-4 p-4 bg-green-50 rounded-lg border border-green-100">
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
            <p className="text-xs text-green-600">
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