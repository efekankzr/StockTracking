'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CategoryDto } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useEffect } from 'react';

// Validasyon Şeması
const formSchema = z.object({
  name: z.string().min(1, 'Kategori adı zorunludur.').max(100, 'Çok uzun.'),
});

type CategoryFormValues = z.infer<typeof formSchema>;

interface CategoryFormProps {
  initialData?: CategoryDto | null; // Düzenleme modunda veri gelir
  onSubmit: (data: CategoryFormValues) => void;
  isLoading: boolean;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
}) => {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  // Eğer düzenleme modundaysak verileri forma doldur
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
      });
    } else {
      form.reset({
        name: '',
      });
    }
  }, [initialData, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kategori Adı</FormLabel>
              <FormControl>
                <Input placeholder="Örn: Elektronik" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />



        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Kaydediliyor...' : initialData ? 'Güncelle' : 'Kaydet'}
          </Button>
        </div>
      </form>
    </Form>
  );
};