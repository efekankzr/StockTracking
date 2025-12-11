'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import stockService from '@/services/stockService';
import warehouseService from '@/services/warehouseService';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search, Filter, Package, AlertTriangle, Boxes } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/auth-context';

export default function StocksPage() {
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("0");

  const isAdmin = user?.role === 'Admin';

  const { data: stocks, isLoading } = useQuery({ queryKey: ['stocks'], queryFn: stockService.getAll });
  const { data: warehouses } = useQuery({ queryKey: ['warehouses'], queryFn: warehouseService.getAll });

  const filteredStocks = useMemo(() => {
    if (!stocks?.data) return [];

    return stocks.data.filter(item => {
      const matchesSearch =
        item.productName.toLowerCase().includes(search.toLowerCase()) ||
        item.barcode.includes(search);

      const userWarehouseId = user?.warehouseId;

      let matchesWarehouse = true;
      if (isAdmin) {
        if (selectedWarehouse !== "0") {
          matchesWarehouse = item.warehouseId === Number(selectedWarehouse);
        }
      } else {
        matchesWarehouse = item.warehouseId === userWarehouseId;
      }

      return matchesSearch && matchesWarehouse;
    });
  }, [stocks, search, selectedWarehouse, isAdmin, user]);

  const stats = useMemo(() => {
    if (!filteredStocks) return { totalProducts: 0, totalItems: 0, criticalStock: 0 };
    return {
      totalProducts: filteredStocks.length,
      totalItems: filteredStocks.reduce((acc, curr) => acc + curr.quantity, 0),
      criticalStock: filteredStocks.filter(s => s.quantity <= 5).length
    };
  }, [filteredStocks]);

  if (isLoading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
    </div>
  );

  return (
    <div className="h-full flex flex-col p-6 space-y-4 min-h-0">
      <div className="flex flex-col gap-2 shrink-0">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Stok Envanteri</h2>
        <p className="text-slate-500">Depo stok durumlarını ve ürün miktarlarını anlık olarak takip edin.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 shrink-0">
        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Toplam Ürün Çeşidi</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{stats.totalProducts}</div>
            <p className="text-xs text-blue-600/80 mt-1">Farklı ürün kartı</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-900">Toplam Stok Adedi</CardTitle>
            <Boxes className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-700">{stats.totalItems.toLocaleString('tr-TR')}</div>
            <p className="text-xs text-indigo-600/80 mt-1">Depolardaki toplam miktar</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-100 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-900">Kritik Stok</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">{stats.criticalStock}</div>
            <p className="text-xs text-amber-600/80 mt-1">5 adetin altındaki ürünler</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-white/50 p-1 rounded-xl backdrop-blur-sm shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Ürün adı, barkod..."
            className="pl-10 bg-white border-slate-200 focus:border-slate-400 focus:ring-slate-400"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {isAdmin && (
          <div className="w-full sm:w-[250px]">
            <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
              <SelectTrigger className="bg-white border-slate-200">
                <div className="flex items-center gap-2 text-slate-600">
                  <Filter className="w-4 h-4" />
                  <SelectValue placeholder="Tüm Depolar" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0" className="font-medium">Tüm Depolar</SelectItem>
                {warehouses?.data.map(w => (
                  <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto p-0">
          <Table>
            <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
              <TableRow className="hover:bg-slate-50 border-b-slate-200">
                <TableHead className="font-semibold text-slate-600">Ürün Bilgisi</TableHead>
                <TableHead className="font-semibold text-slate-600">Barkod</TableHead>
                <TableHead className="font-semibold text-slate-600">Bulunduğu Depo</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Miktar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStocks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <Package className="h-8 w-8 mb-2 opacity-20" />
                      <p>Kayıt bulunamadı</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStocks.map((stock) => (
                  <TableRow key={stock.id} className="group hover:bg-slate-50/50 transition-colors">
                    <TableCell>
                      <div className="font-medium text-slate-900 group-hover:text-slate-700 transition-colors">
                        {stock.productName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded w-fit">
                        {stock.barcode}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        {stock.warehouseName}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className={`inline-flex items-center justify-end font-bold text-lg ${stock.quantity <= 5 ? 'text-rose-600' : 'text-emerald-600'
                        }`}>
                        {stock.quantity.toLocaleString('tr-TR')}
                        <span className="ml-1 text-xs font-normal text-slate-400">adt</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}