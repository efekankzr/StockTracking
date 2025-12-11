'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import saleService from '@/services/saleService';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Calendar as CalendarIcon, Loader2, TrendingUp, DollarSign, Percent, ShoppingBag, Receipt } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SaleDetailDto } from '@/types';

export default function ProfitPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const { data, isLoading } = useQuery({
    queryKey: ['profitReport', date],
    queryFn: () => saleService.getDailyReport(date || new Date()),
    enabled: !!date,
  });

  // --- FİLTRELEME (Gerçek Personel) ---
  const filteredData = useMemo(() => {
    if (!data?.data) return [];
    return data.data.filter(user => {
        if (user.role === 'Admin') return false;
        if (user.fullName.endsWith(' Kasa')) return false;
        if (user.fullName.endsWith(' Yöneticisi')) return false;
        if (user.fullName === 'System Administrator') return false;
        return true;
    });
  }, [data]);

  // --- GENEL TOPLAMLAR ---
  const totalRevenue = filteredData.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0) || 0;
  const totalCost = filteredData.reduce((acc, curr) => acc + (curr.totalCost || 0), 0) || 0;
  const totalProfit = filteredData.reduce((acc, curr) => acc + (curr.totalProfit || 0), 0) || 0;
  const totalQuantity = filteredData.reduce((acc, curr) => acc + (curr.totalQuantity || 0), 0);
  const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  // --- YARDIMCI FONKSİYON: Fiş Gruplama ---
  const groupSalesByTransaction = (sales: SaleDetailDto[]) => {
    const groups: { [key: number]: SaleDetailDto[] } = {};
    sales.forEach(sale => {
        if (!groups[sale.saleId]) groups[sale.saleId] = [];
        groups[sale.saleId].push(sale);
    });
    return groups;
  };

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>;

  return (
    <div className="space-y-6">
      {/* BAŞLIK VE TARİH */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Finansal Rapor & Karlılık</h2>
            <p className="text-slate-500 text-sm">Satış personelinin detaylı performans analizi</p>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant={"outline"} className={cn("w-[240px] justify-start text-left font-normal", !date && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "d MMMM yyyy", { locale: tr }) : <span>Tarih Seçin</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
          </PopoverContent>
        </Popover>
      </div>

      {/* ÖZET KARTLAR (5'li Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-white border-l-4 border-l-blue-500 shadow-sm">
            <CardContent className="p-4">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">Toplam Ciro</p>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{totalRevenue.toLocaleString()} ₺</h3>
            </CardContent>
        </Card>
        <Card className="bg-white border-l-4 border-l-red-400 shadow-sm">
            <CardContent className="p-4">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">Maliyet</p>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{totalCost.toLocaleString()} ₺</h3>
            </CardContent>
        </Card>
        <Card className="bg-green-50 border border-green-200 shadow-sm">
            <CardContent className="p-4">
                <div className="flex items-center gap-2 text-green-700 mb-1">
                    <DollarSign className="w-4 h-4" />
                    <p className="text-[10px] uppercase font-bold tracking-wide">Net Kar</p>
                </div>
                <h3 className="text-2xl font-bold text-green-800">{totalProfit.toLocaleString()} ₺</h3>
            </CardContent>
        </Card>
        <Card className="bg-white border-l-4 border-l-purple-500 shadow-sm">
            <CardContent className="p-4">
                <div className="flex items-center gap-2 text-purple-700 mb-1">
                    <Percent className="w-4 h-4" />
                    <p className="text-[10px] uppercase font-bold tracking-wide">Kar Marjı</p>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-1">%{avgMargin.toFixed(1)}</h3>
            </CardContent>
        </Card>
        <Card className="bg-white border-l-4 border-l-orange-500 shadow-sm">
            <CardContent className="p-4">
                <div className="flex items-center gap-2 text-orange-700 mb-1">
                    <ShoppingBag className="w-4 h-4" />
                    <p className="text-[10px] uppercase font-bold tracking-wide">Satılan Adet</p>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{totalQuantity}</h3>
            </CardContent>
        </Card>
      </div>

      {/* DETAYLI ANALİZ (ACCORDION TABLO) */}
      <Card className="shadow-sm border-0 lg:border">
        <CardHeader className="border-b bg-slate-50/50 py-4">
            <CardTitle className="text-lg font-medium text-slate-700">Personel Bazlı Detaylar</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
            {filteredData.length === 0 ? (
                <div className="text-center py-10 text-slate-500">Bu tarihte satış yapan personel bulunamadı.</div>
            ) : (
                <Accordion type="single" collapsible className="w-full">
                    {filteredData.map((user, index) => {
                        const hasSales = user.sales.length > 0;
                        const groupedSales = groupSalesByTransaction(user.sales);

                        return (
                            <AccordionItem key={`user-${user.userId}-${index}`} value={`user-${user.userId}-${index}`} className="border-b last:border-0">
                                
                                {/* ANA SATIR: Personel Finansal Özeti */}
                                <AccordionTrigger className="hover:no-underline hover:bg-slate-50 px-4 py-3">
                                    <div className="grid grid-cols-12 w-full items-center gap-4 pr-4 text-sm">
                                        <div className="col-span-4 text-left">
                                            <div className="font-semibold text-slate-900">{user.fullName}</div>
                                            <div className="text-xs text-slate-500">{user.role}</div>
                                        </div>
                                        <div className="col-span-2 text-right">
                                            <span className="text-xs text-slate-400 block">Ciro</span>
                                            <span className="font-medium text-slate-700">{(user.totalAmount || 0).toLocaleString()} ₺</span>
                                        </div>
                                        <div className="col-span-2 text-right text-red-500">
                                            <span className="text-xs text-red-200 block">Maliyet</span>
                                            -{(user.totalCost || 0).toLocaleString()} ₺
                                        </div>
                                        <div className="col-span-2 text-right text-green-600 font-bold">
                                            <span className="text-xs text-green-200 block">Net Kar</span>
                                            +{(user.totalProfit || 0).toLocaleString()} ₺
                                        </div>
                                        <div className="col-span-2 text-center">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold 
                                                ${(user.profitMargin || 0) > 20 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                %{(user.profitMargin || 0).toFixed(1)}
                                            </span>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                
                                {/* ALT DETAY: Satış Fişleri ve Ürünler */}
                                <AccordionContent className="bg-slate-50/50 px-4 pb-4 pt-2">
                                    {!hasSales ? (
                                        <div className="text-center text-gray-400 py-4 text-xs border-2 border-dashed rounded-lg">Satış detayı yok.</div>
                                    ) : (
                                        <div className="space-y-3 mt-2">
                                            {Object.keys(groupedSales).map((saleId) => {
                                                const items = groupedSales[Number(saleId)];
                                                const saleTotal = items.reduce((acc, curr) => acc + curr.totalAmount, 0);
                                                const saleProfit = items.reduce((acc, curr) => acc + curr.profit, 0);
                                                const saleTime = items[0].time;

                                                return (
                                                    <div key={saleId} className="border rounded-lg bg-white overflow-hidden shadow-sm">
                                                        {/* Fiş Başlığı */}
                                                        <div className="bg-slate-100 px-4 py-2 flex justify-between items-center border-b">
                                                            <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                                                                <Receipt className="w-3.5 h-3.5 text-blue-500" />
                                                                <span>Fiş #{saleId}</span>
                                                                <span className="text-slate-400">({new Date(saleTime).toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'})})</span>
                                                            </div>
                                                            <div className="flex gap-4 text-xs">
                                                                <span>Tutar: <b>{saleTotal.toLocaleString()} ₺</b></span>
                                                                <span className="text-green-600">Kar: <b>{saleProfit.toLocaleString()} ₺</b></span>
                                                            </div>
                                                        </div>

                                                        {/* Fiş İçeriği (Ürünler) */}
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow className="h-8 text-[10px] uppercase">
                                                                    <TableHead>Ürün</TableHead>
                                                                    <TableHead className="text-right">Adet</TableHead>
                                                                    <TableHead className="text-right">Satış</TableHead>
                                                                    <TableHead className="text-right text-red-400">Maliyet</TableHead>
                                                                    <TableHead className="text-right text-green-600">Kar</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {items.map((item, iIdx) => (
                                                                    <TableRow key={iIdx} className="hover:bg-transparent border-b last:border-0 h-9 text-xs">
                                                                        <TableCell className="font-medium text-slate-700">{item.productName}</TableCell>
                                                                        <TableCell className="text-right">{item.quantity}</TableCell>
                                                                        <TableCell className="text-right">{item.unitPrice} ₺</TableCell>
                                                                        <TableCell className="text-right text-red-400">{item.unitCost.toFixed(2)} ₺</TableCell>
                                                                        <TableCell className="text-right font-bold text-green-600">+{item.profit.toLocaleString()} ₺</TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </AccordionContent>
                            </AccordionItem>
                        );
                    })}
                </Accordion>
            )}
        </CardContent>
      </Card>
    </div>
  );
}