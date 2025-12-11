'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { 
  LayoutDashboard, Tags, Warehouse, Package, ArrowRightLeft, Receipt, Users, BarChart3, LineChart, Truck, Settings
} from 'lucide-react';

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
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="w-64 bg-slate-900 h-full border-r border-slate-800 animate-pulse"></div>;
  }

  if (!user) return null;

  return (
    <div className="flex flex-col h-full w-64 bg-slate-900 text-white border-r border-slate-800">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-center">Stok Takip</h1>
        <div className="text-xs text-center text-slate-400 mt-1 uppercase tracking-wider font-semibold">
            {user.role}
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
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
                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                        isActive 
                        ? "bg-blue-600 text-white shadow-md" 
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    )}
                    >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                    </Link>
                );
        })}
      </nav>
      <div className="p-4 border-t border-slate-800 text-[10px] text-slate-600 text-center">
        v1.0.0 - {user.username}
      </div>
    </div>
  );
}