'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { CreateExpenseCategoryRequest } from '@/types';

const formSchema = z.object({
  name: z.string().min(2, 'En az 2 karakter.'),
  description: z.string().optional(),
  isTaxDeductible: z.boolean().default(true),
  defaultVatRate: z.coerce.number().min(0).max(100),
  hasWithholding: z.boolean().default(false),
  defaultWithholdingRate: z.coerce.number().min(0).max(100),
});

interface Props {
  onSubmit: (data: CreateExpenseCategoryRequest) => void;
  isLoading: boolean;
}

export const ExpenseCategoryForm: React.FC<Props> = ({ onSubmit, isLoading }) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      isTaxDeductible: false,
      defaultVatRate: 0,
      hasWithholding: false,
      defaultWithholdingRate: 0,
    },
  });

  const hasWithholding = form.watch("hasWithholding");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gider Adı</FormLabel>
              <FormControl>
                <Input placeholder="Örn: Yemek Gideri" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Açıklama</FormLabel>
              <FormControl>
                <Input placeholder="Opsiyonel..." {...field} value={field.value ?? ''} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex items-center gap-4 border p-4 rounded-lg bg-slate-50">
          <FormField
            control={form.control}
            name="isTaxDeductible"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>KDV Var mı?</FormLabel>
                  <FormDescription>Bu gider kalemi KDV içeriyor mu?</FormDescription>
                </div>
              </FormItem>
            )}
          />

          {form.watch('isTaxDeductible') && (
            <FormField
              control={form.control}
              name="defaultVatRate"
              render={({ field }) => (
                <FormItem className="w-24">
                  <FormLabel>KDV (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={(field.value as number) ?? 0}
                      onChange={e => field.onChange(+e.target.value)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="flex items-center gap-4 border p-4 rounded-lg bg-slate-50">
          <FormField
            control={form.control}
            name="hasWithholding"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Stopaj Var mı?</FormLabel>
                  <FormDescription>Kira, serbest meslek vb.</FormDescription>
                </div>
              </FormItem>
            )}
          />

          {hasWithholding && (
            <FormField
              control={form.control}
              name="defaultWithholdingRate"
              render={({ field }) => (
                <FormItem className="w-24">
                  <FormLabel>Oran (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={(field.value as number) ?? 0}
                      onChange={e => field.onChange(+e.target.value)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isLoading}>Kaydet</Button>
        </div>
      </form>
    </Form>
  );
};