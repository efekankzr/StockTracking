'use client';

import Sidebar from "@/components/sidebar";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import systemService from '@/services/systemService';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const { data: status, isLoading } = useQuery({
    queryKey: ['setupStatus'],
    queryFn: systemService.getSetupStatus
  });

  useEffect(() => {
    // Sistem hazır değilse ve biz setup sayfasında değilsek (zaten setup dashboard layout içinde değil)
    if (status !== undefined && !status.isSystemReady) {
      router.push('/setup');
    }
  }, [status, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  // Eğer hazır değilse içeriği gösterme, yönlenmeyi bekle
  if (status !== undefined && !status.isSystemReady) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="hidden md:block h-full">
        <Sidebar />
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
        {/* Sayfa içeriği kendi scroll ve padding'ini yönetecek */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}