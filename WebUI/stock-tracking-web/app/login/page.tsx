'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import authService from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  username: z.string().min(1, 'Kullanıcı adı gereklidir.'),
  password: z.string().min(1, 'Şifre gereklidir.'),
});

export default function LoginPage() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError('');

    try {
      const res = await authService.login(values);

      if (res.success) {
        // --- KRİTİK AYAR BURADA ---
        // path: '/' -> Cookie tüm sitede geçerli olur.
        // sameSite: 'Lax' -> Sayfa yönlendirmelerinde cookie korunur.
        // secure: false -> Localhost (http) için false olmalı, https ise true.
        Cookies.set('token', res.data.accessToken, { 
            expires: 1, 
            path: '/', 
            sameSite: 'Lax',
            secure: window.location.protocol === 'https:' 
        });
        
        // Context'in ve Middleware'in token'ı taze okuması için sayfayı tam yeniliyoruz.
        window.location.href = '/'; 
      } else {
        setError(res.message || 'Giriş başarısız.');
      }
    } catch (err: any) {
      // Backend'den dönen özel hata mesajı varsa onu göster, yoksa genel hata.
      setError(err?.response?.data?.message || 'Sunucuya bağlanılamadı.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <Card className="w-[400px] shadow-lg">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold text-slate-800">Stok Takip</CardTitle>
          <CardDescription>Yönetim paneline giriş yapın</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kullanıcı Adı</FormLabel>
                    <FormControl>
                      <Input placeholder="sysadmin" {...field} />
                    </FormControl>
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
                    <FormControl>
                      <Input type="password" placeholder="******" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <div className="p-3 rounded bg-red-50 text-red-600 text-sm font-medium text-center border border-red-100">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800" disabled={isLoading}>
                {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Giriş Yapılıyor...</>
                ) : (
                    'Giriş Yap'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}