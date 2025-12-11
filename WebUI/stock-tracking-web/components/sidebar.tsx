'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import {
  LayoutDashboard, Tags, Warehouse, Package, ArrowRightLeft, Receipt, Users, BarChart3, LineChart, Truck, Settings, LogOut, ChevronRight, Store
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const menuItems = [
  {
    href: '/',
    label: 'Anasayfa',
    icon: LayoutDashboard,
    roles: ['Admin', 'DepoSorumlusu', 'SatisPersoneli']
  },
  {
    href: '/categories',
    label: 'Kategoriler',
    icon: Tags,
    roles: ['Admin']
  },
  {
    href: '/warehouses',
    label: 'Depolar',
    icon: Warehouse,
    roles: ['Admin', 'DepoSorumlusu', 'SatisPersoneli']
  },
  {
    href: '/products',
    label: 'Ürünler',
    icon: Package,
    roles: ['Admin', 'DepoSorumlusu']
  },
  {
    href: '/stocks',
    label: 'Stok Durumu',
    icon: ArrowRightLeft,
    roles: ['Admin', 'DepoSorumlusu']
  },
  {
    href: '/transfers',
    label: 'Ürün Transfer',
    icon: Truck,
    roles: ['Admin', 'DepoSorumlusu']
  },
  {
    href: '/reports',
    label: 'Raporlar',
    icon: BarChart3,
    roles: ['Admin']
  },
  {
    href: '/profit',
    label: 'Karlılık Analizi',
    icon: LineChart,
    roles: ['Admin']
  },
  {
    href: '/users',
    label: 'Personel Listesi',
    icon: Users,
    roles: ['Admin', 'SatisPersoneli', 'DepoSorumlusu']
  },
  {
    href: '/expenses/categories',
    label: 'Gider Tanımları',
    icon: Settings,
    roles: ['Admin']
  },
  {
    href: '/expenses',
    label: 'Giderler',
    icon: Receipt,
    roles: ['Admin', 'DepoSorumlusu']
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return <div className="w-72 bg-slate-950 h-full border-r border-slate-800/50 animate-pulse"></div>;
  }

  if (!user) return null;

  return (
    <div className="flex flex-col h-full w-72 bg-slate-950 text-slate-300 border-r border-slate-800/50 shadow-2xl relative overflow-hidden">

      {/* Dekoratif Arkaplan Efektleri */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[200px] h-[200px] bg-gradient-to-tl from-indigo-900/10 to-transparent pointer-events-none rounded-full blur-3xl" />

      {/* Header Alanı */}
      <div className="p-6 pb-2 relative z-10">
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-900/30">
            <Store className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">StockTracking</h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase opacity-70">Yönetim Paneli</p>
          </div>
        </div>

        {/* Kullanıcı Kartı (Mini) */}
        <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800/50 flex items-center gap-3 mb-2 backdrop-blur-sm">
          <Avatar className="h-9 w-9 border border-indigo-500/30 shadow-sm">
            <AvatarImage src={`https://ui-avatars.com/api/?name=${user.fullName}&background=6366f1&color=fff`} />
            <AvatarFallback className="bg-indigo-600 text-white text-xs">{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.fullName}</p>
            <p className="text-[10px] text-indigo-400 font-medium truncate uppercase tracking-wider">{user.role}</p>
          </div>
        </div>
      </div>

      {/* Menü Alanı */}
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent relative z-10">
        <p className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-2">Menü</p>

        {menuItems
          .filter(item => item.roles.includes(user.role))
          .map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-300 relative overflow-hidden",
                  isActive
                    ? "bg-gradient-to-r from-blue-600/90 to-indigo-600/90 text-white shadow-md shadow-blue-900/20"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-3 relative z-10">
                  <Icon size={18} className={cn("transition-colors", isActive ? "text-white" : "text-slate-500 group-hover:text-blue-400")} />
                  <span className="font-medium text-sm tracking-wide">{item.label}</span>
                </div>

                {isActive && (
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/20" />
                )}

                {!isActive && (
                  <ChevronRight className="w-3 h-3 text-slate-700 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                )}
              </Link>
            );
          })}
      </nav>

      {/* Footer / Çıkış */}
      <div className="p-4 border-t border-slate-800/50 bg-slate-950/50 backdrop-blur-sm relative z-10">
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-all duration-200 group"
        >
          <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Güvenli Çıkış
        </button>
        <div className="mt-3 text-[10px] text-center text-slate-700 font-mono">
          v1.2.0 • Build 2024
        </div>
      </div>
    </div>
  );
}