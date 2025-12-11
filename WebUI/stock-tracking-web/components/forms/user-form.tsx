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

const formSchema = z.object({
  fullName: z.string().min(2, 'Ad Soyad zorunludur.'),
  username: z.string().min(3, 'Kullanıcı adı en az 3 karakter.'),
  email: z.string().email('Geçerli bir e-posta giriniz.'),
  phoneNumber: z.string().min(10, 'Telefon numarası zorunludur.'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı.'),
  roleId: z.coerce.number(),
  warehouseId: z.coerce.number().optional(),
}).refine((data) => {
  if (data.roleId !== 0 && (!data.warehouseId || data.warehouseId === 0)) {
    return false;
  }
  return true;
}, {
  message: "Personel için depo seçimi zorunludur.",
  path: ["warehouseId"],
});

interface UserFormProps {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  isLoading: boolean;
}

export const UserForm: React.FC<UserFormProps> = ({
  onSubmit,
  isLoading,
}) => {
  const { data: warehouses } = useQuery({ queryKey: ['warehouses'], queryFn: warehouseService.getAll });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      phoneNumber: '',
      password: '',
      roleId: 1,
      warehouseId: 0,
    },
  });

  const selectedRole = form.watch("roleId");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ad Soyad</FormLabel>
              <FormControl><Input placeholder="Ahmet Yılmaz" {...field} value={field.value ?? ''} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Kullanıcı Adı</FormLabel>
                <FormControl><Input placeholder="ahmetyilmaz" {...field} value={field.value ?? ''} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Şifre</FormLabel>
                <FormControl><Input type="password" placeholder="******" {...field} value={field.value ?? ''} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
                <FormItem>
                <FormLabel>E-Posta</FormLabel>
                <FormControl><Input placeholder="ahmet@sirket.com" {...field} value={field.value ?? ''} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Telefon</FormLabel>
                <FormControl><Input placeholder="555..." {...field} value={field.value ?? ''} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="roleId"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Yetki Rolü</FormLabel>
                <Select 
                    onValueChange={(val) => field.onChange(Number(val))} 
                    value={field.value !== undefined ? (field.value as number).toString() : ''}
                >
                    <FormControl><SelectTrigger ref={field.ref}><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="0">🛡️ Admin (Tam Yetki)</SelectItem>
                        <SelectItem value="1">📦 Depo Sorumlusu</SelectItem>
                        <SelectItem value="2">🛒 Satış Personeli</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />

            {selectedRole !== 0 && (
                <FormField
                control={form.control}
                name="warehouseId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Çalışacağı Depo</FormLabel>
                    <Select 
                        onValueChange={(val) => field.onChange(Number(val))} 
                        value={field.value ? field.value.toString() : ''}
                    >
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
            )}
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Oluşturuluyor...' : 'Personeli Kaydet'}
          </Button>
        </div>
      </form>
    </Form>
  );
};