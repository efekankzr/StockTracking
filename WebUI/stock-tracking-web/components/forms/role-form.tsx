'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Validasyon
const formSchema = z.object({
  name: z.string().min(3, 'Rol adı en az 3 karakter olmalıdır.'),
});

type RoleFormValues = z.infer<typeof formSchema>;

interface RoleFormProps {
  onSubmit: (data: RoleFormValues) => void;
  isLoading: boolean;
}

export const RoleForm: React.FC<RoleFormProps> = ({
  onSubmit,
  isLoading,
}) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rol Adı</FormLabel>
              <FormControl>
                <Input placeholder="Örn: Muhasebe" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>
      </form>
    </Form>
  );
};