'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import saleService from '@/services/saleService';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Calendar as CalendarIcon, Loader2, TrendingUp, ShoppingBag, Receipt } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { SaleDetailDto } from '@/types';

export default function ReportsPage() {
    const [date, setDate] = useState<Date | undefined>(new Date());

    const { data, isLoading } = useQuery({
        queryKey: ['dailyReport', date],
        queryFn: () => saleService.getDailyReport(date || new Date()),
        enabled: !!date,
    });

    const filteredData = useMemo(() => {
        if (!data?.data) return [];

        return data.data.filter(user => {
            if (user.role === 'Admin') return false;

            if (user.fullName.endsWith(' Depo')) return false;
            if (user.fullName.endsWith(' Satış')) return false;
            if (user.fullName === 'System Administrator') return false;

            return true;
        });
    }, [data]);

    const grandTotalAmount = filteredData.reduce((sum, user) => sum + (user.totalAmount || 0), 0);
    const grandTotalQuantity = filteredData.reduce((sum, user) => sum + (user.totalQuantity || 0), 0);

    const groupSalesByTransaction = (sales: SaleDetailDto[]) => {
        const groups: { [key: number]: SaleDetailDto[] } = {};
        sales.forEach(sale => {
            if (!groups[sale.saleId]) {
                groups[sale.saleId] = [];
            }
            groups[sale.saleId].push(sale);
        });
        return groups;
    };

    return (
        <div className="h-full flex flex-col p-6 space-y-4 min-h-0 bg-slate-50/50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800">Günlük Satış Raporu</h2>
                    <p className="text-slate-500 text-sm">Personel bazlı satış performansları</p>
                </div>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-[240px] justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "d MMMM yyyy", { locale: tr }) : <span>Tarih Seçin</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
                <Card className="bg-blue-50 border-blue-100 shadow-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-full text-blue-600"><TrendingUp size={24} /></div>
                        <div>
                            <p className="text-sm text-blue-600 font-medium">Toplam Ciro</p>
                            <h3 className="text-2xl font-bold text-blue-900">{grandTotalAmount.toLocaleString('tr-TR')} ₺</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-100 shadow-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-full text-green-600"><ShoppingBag size={24} /></div>
                        <div>
                            <p className="text-sm text-green-600 font-medium">Satılan Ürün Adedi</p>
                            <h3 className="text-2xl font-bold text-green-900">{grandTotalQuantity} Adet</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="p-4 border-b shrink-0 bg-slate-50/50">
                    <CardTitle className="text-lg font-medium text-slate-700">Personel Detayları</CardTitle>
                </div>
                <div className="flex-1 overflow-auto p-0">
                    {isLoading ? (
                        <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>
                    ) : filteredData.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">Bu tarihte satış kaydı bulunamadı.</div>
                    ) : (
                        <Accordion type="single" collapsible className="w-full">
                            {filteredData.map((user, index) => {
                                const hasSales = user.sales.length > 0;
                                const groupedSales = groupSalesByTransaction(user.sales);

                                return (
                                    <AccordionItem key={`user-${user.userId}-${index}`} value={`user-${user.userId}-${index}`} className="border-b last:border-0">

                                        <AccordionTrigger className="hover:no-underline hover:bg-slate-50 px-4 rounded-lg">
                                            <div className="flex justify-between w-full pr-4 items-center">
                                                <div className="text-left flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${hasSales ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                    <div>
                                                        <div className="font-semibold text-slate-900">{user.fullName}</div>
                                                        <div className="text-xs text-slate-500">{user.role}</div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-6 text-right">
                                                    <div className="text-sm">
                                                        <span className="text-slate-400 block text-xs">Adet</span>
                                                        <span className={`font-medium ${hasSales ? 'text-slate-900' : 'text-gray-400'}`}>{user.totalQuantity}</span>
                                                    </div>
                                                    <div className="text-sm">
                                                        <span className="text-slate-400 block text-xs">Tutar</span>
                                                        <span className={`font-bold ${hasSales ? 'text-green-600' : 'text-gray-400'}`}>{user.totalAmount} ₺</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </AccordionTrigger>

                                        <AccordionContent className="px-4 pb-4 pt-2">
                                            {!hasSales ? (
                                                <div className="text-center text-gray-400 py-4 text-sm bg-slate-50 rounded-lg border border-dashed">
                                                    Bu personel bugün satış yapmadı.
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {Object.keys(groupedSales).map((saleId) => {
                                                        const items = groupedSales[Number(saleId)];
                                                        const saleTotal = items.reduce((acc, curr) => acc + curr.totalAmount, 0);
                                                        const saleTime = items[0].time;

                                                        return (
                                                            <div key={saleId} className="border rounded-lg bg-white overflow-hidden shadow-sm">
                                                                <div className="bg-slate-50 px-4 py-2 flex justify-between items-center border-b">
                                                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                                                        <Receipt className="w-4 h-4 text-blue-500" />
                                                                        <span>Fiş #{saleId}</span>
                                                                        <span className="text-xs text-gray-400 font-mono">
                                                                            ({new Date(saleTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })})
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-sm font-bold text-slate-900">
                                                                        {saleTotal} ₺
                                                                    </div>
                                                                </div>

                                                                <Table>
                                                                    <TableBody>
                                                                        {items.map((item, iIdx) => (
                                                                            <TableRow key={iIdx} className="hover:bg-transparent border-b last:border-0">
                                                                                <TableCell className="py-2 text-xs w-24 text-gray-500">{item.barcode}</TableCell>
                                                                                <TableCell className="py-2 text-sm font-medium">{item.productName}</TableCell>
                                                                                <TableCell className="py-2 text-right text-xs w-16">{item.quantity} Adet</TableCell>
                                                                                <TableCell className="py-2 text-right text-xs w-20">{item.unitPrice} ₺</TableCell>
                                                                                <TableCell className="py-2 text-right font-bold text-xs w-24">{item.totalAmount} ₺</TableCell>
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
                </div>
            </div>
        </div>
    );
}