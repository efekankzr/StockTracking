'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ProductDto } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import categoryService from '@/services/categoryService';

const formSchema = z.object({
  categoryId: z.coerce.number().min(1, 'Kategori seçimi zorunludur.'),
  name: z.string().min(2, 'Ürün adı en az 2 karakter olmalı.'),
  barcode: z.string().min(1, 'Barkod zorunludur.'),
  image: z.string().optional(),
  salePrice: z.coerce.number().min(0, '0\'dan küçük olamaz.'),

});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  initialData?: ProductDto | null;
  onSubmit: (data: ProductFormValues) => void;
  isLoading: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
}) => {
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll,
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryId: 0,
      name: '',
      barcode: '',
      image: '',
      salePrice: 0,

    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        categoryId: initialData.categoryId,
        name: initialData.name,
        barcode: initialData.barcode,
        image: initialData.image || '',
        salePrice: initialData.salePrice,

      });
    } else {
      form.reset({
        categoryId: 0,
        name: '',
        barcode: '',
        image: '',
        salePrice: 0,
      });
    }
  }, [initialData, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kategori</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value ? (field.value as number).toString() : ''}
              >
                <FormControl>
                  <SelectTrigger ref={field.ref}>
                    <SelectValue placeholder="Kategori Seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories?.data.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ürün Adı</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Laptop..."
                    name={field.name}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    ref={field.ref}
                    value={(field.value as string) ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="barcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Barkod</FormLabel>
                <FormControl>
                  <Input
                    placeholder="869..."
                    name={field.name}
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    ref={field.ref}
                    value={(field.value as string) ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="salePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tavsiye Edilen Satış Fiyatı</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    name={field.name}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    value={(field.value as number) ?? 0}
                    onChange={e => field.onChange(+e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />


        </div>

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resim URL (Opsiyonel)</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://..."
                  name={field.name}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  ref={field.ref}
                  value={(field.value as string) ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'İşleniyor...' : initialData ? 'Güncelle' : 'Kaydet'}
          </Button>
        </div>
      </form>
    </Form>
  );
};