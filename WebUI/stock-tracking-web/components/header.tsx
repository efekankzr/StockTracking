'use client';

import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth-context';

export default function Header() {
  // const router = useRouter(); // window.location kullanacağımız için buna gerek kalmayabilir ama dursun
  const { user } = useAuth();

  const handleLogout = () => {
    Cookies.remove('token', { path: '/' });

    toast.info("Çıkış yapıldı.");

    window.location.href = '/login';
  };

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6 shrink-0">
      <div className="font-semibold text-slate-700">
        Yönetim Paneli
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <div className="bg-slate-100 p-2 rounded-full">
            <User size={18} />
          </div>
          <div className="flex flex-col items-end leading-tight">
            <span className="text-slate-900">{user?.username || 'Kullanıcı'}</span>
            <span className="text-[10px] text-slate-400 font-normal">{user?.role}</span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut size={18} className="mr-2" />
          Çıkış
        </Button>
      </div>
    </header>
  );
}