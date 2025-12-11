'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useQuery } from '@tanstack/react-query';
import expenseService from '@/services/expenseService';
import warehouseService from '@/services/warehouseService';
import { useAuth } from '@/context/auth-context';
import { useEffect } from 'react';

const formSchema = z.object({
    expenseCategoryId: z.coerce.number().min(1, 'Kategori seçiniz.'),
    warehouseId: z.coerce.number().min(1, 'Depo seçiniz.'),
    documentNumber: z.string().min(1, 'Belge no zorunlu.'),
    documentDate: z.string(),
    description: z.string().optional(),
    amount: z.coerce.number().min(0.01, 'Tutar giriniz.'),
    isVatIncluded: z.boolean().default(true),
    vatRate: z.coerce.number().min(0).max(100),
    withholdingRate: z.coerce.number().min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
    onSubmit: (data: any) => void;
    isLoading: boolean;
}

export const ExpenseTransactionForm: React.FC<Props> = ({ onSubmit, isLoading }) => {
    const { user } = useAuth();

    // Verileri Çek
    const { data: categories } = useQuery({ queryKey: ['expenseCategories'], queryFn: expenseService.getAllCategories });
    const { data: warehouses } = useQuery({ queryKey: ['warehouses'], queryFn: warehouseService.getAll });

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            expenseCategoryId: 0,
            warehouseId: 0,
            documentNumber: '',
            documentDate: new Date().toISOString().split('T')[0], // Bugünün tarihi (YYYY-MM-DD)
            description: '',
            amount: 0,
            isVatIncluded: true,
            vatRate: 20,
            withholdingRate: 0,
        },
    });

    // İzleyiciler
    const selectedCategoryId = form.watch('expenseCategoryId');

    // Kategori değişince varsayılan oranları doldur
    useEffect(() => {
        if (selectedCategoryId && categories?.data) {
            const category = categories.data.find(c => c.id === Number(selectedCategoryId));
            if (category) {
                form.setValue('vatRate', category.defaultVatRate);
                form.setValue('withholdingRate', category.hasWithholding ? category.defaultWithholdingRate : 0);
            }
        }
    }, [selectedCategoryId, categories, form]);

    // Depo Sorumlusu ise deposunu otomatik seç
    useEffect(() => {
        if (user?.role === 'DepoSorumlusu' && user.warehouseId) {
            form.setValue('warehouseId', user.warehouseId);
        }
    }, [user, form]);

    const handleSubmit = (values: FormValues) => {
        // Tarihi ISO formatına çevirip gönderelim
        const payload = {
            ...values,
            documentDate: new Date(values.documentDate).toISOString()
        };
        onSubmit(payload);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">

                <div className="grid grid-cols-2 gap-4">
                    {/* Kategori */}
                    <FormField
                        control={form.control}
                        name="expenseCategoryId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Gider Türü</FormLabel>
                                <Select onValueChange={val => field.onChange(Number(val))} value={field.value ? field.value.toString() : ''}>
                                    <FormControl><SelectTrigger ref={field.ref}><SelectValue placeholder="Seçiniz" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {categories?.data.map(c => (
                                            <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Depo */}
                    <FormField
                        control={form.control}
                        name="warehouseId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>İlgili Depo</FormLabel>
                                <Select
                                    onValueChange={val => field.onChange(Number(val))}
                                    value={field.value ? field.value.toString() : ''}
                                    disabled={user?.role === 'DepoSorumlusu'}
                                >
                                    <FormControl><SelectTrigger ref={field.ref}><SelectValue placeholder="Seçiniz" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {warehouses?.data.map(w => (
                                            <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="documentNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fiş/Fatura No</FormLabel>
                                <FormControl><Input placeholder="A-12345" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="documentDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tarih</FormLabel>
                                <FormControl><Input type="date" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border space-y-4">
                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => {
                            // Hesaplamalar (Summary)
                            const total = Number(field.value) || 0;
                            const vatRate = Number(form.watch('vatRate')) || 0;
                            const withholdingRate = Number(form.watch('withholdingRate')) || 0;

                            // Matrah = Toplam / (1 + KDV/100)
                            let baseAmount = total / (1 + (vatRate / 100));
                            let vatAmount = total - baseAmount;

                            // Stopaj Tutarı = Matrah * (Stopaj / 100)
                            let withholdingAmount = baseAmount * (withholdingRate / 100);

                            if (vatRate === 0 && withholdingRate === 0) {
                                baseAmount = total;
                                vatAmount = 0;
                                withholdingAmount = 0;
                            }

                            return (
                                <FormItem>
                                    <FormLabel className="font-bold text-blue-700">Fatura Genel Toplamı (TL)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            className="text-lg font-bold"
                                            {...field}
                                            value={(field.value as string) ?? ''}
                                            onChange={e => field.onChange(+e.target.value)}
                                        />
                                    </FormControl>
                                    <FormDescription>Varsa KDV dahil ödenen toplam tutarı giriniz.</FormDescription>
                                    <FormMessage />

                                    {total > 0 && (
                                        <div className="mt-2 p-3 bg-white rounded border text-sm grid grid-cols-2 gap-2">
                                            <div className="text-gray-500">Matrah (KDV'siz):</div>
                                            <div className="font-mono text-right">{baseAmount.toFixed(2)} ₺</div>

                                            {vatRate > 0 && (
                                                <>
                                                    <div className="text-gray-500">KDV (%{vatRate}):</div>
                                                    <div className="font-mono text-right text-red-600">+{vatAmount.toFixed(2)} ₺</div>
                                                </>
                                            )}

                                            {withholdingRate > 0 && (
                                                <>
                                                    <div className="text-gray-500">Stopaj (%{withholdingRate}):</div>
                                                    <div className="font-mono text-right text-orange-600">{withholdingAmount.toFixed(2)} ₺</div>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </FormItem>
                            );
                        }}
                    />
                </div>

                {/* Gizli Inputlar (Backend'e gidecek değerleri tutmak için) */}
                <FormField name="vatRate" render={({ field }) => <Input type="hidden" {...field} />} />
                <FormField name="withholdingRate" render={({ field }) => <Input type="hidden" {...field} />} />
                <FormField name="isVatIncluded" render={({ field }) => <Input type="hidden" {...field} value="true" />} />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Açıklama</FormLabel>
                            <FormControl><Input placeholder="Örn: Ocak ayı elektrik faturası..." {...field} /></FormControl>
                        </FormItem>
                    )}
                />

                <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={isLoading} className="w-full bg-slate-900 hover:bg-slate-800">Kaydet</Button>
                </div>
            </form>
        </Form>
    );
};