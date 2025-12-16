'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { WarehouseDto } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Search } from 'lucide-react';
import { toast } from 'sonner';
import { AddressAutocomplete } from '@/components/ui/address-autocomplete';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MapPicker = dynamic(() => import('@/components/ui/map-picker'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400">
      Harita Yükleniyor...
    </div>
  )
});

const formSchema = z.object({
  name: z.string().min(1, 'Depo adı zorunludur.'),
  address: z.string().min(1, 'Adres zorunludur.'),
  city: z.string().min(1, 'İl zorunludur.'),
  district: z.string().min(1, 'İlçe zorunludur.'),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),


});

type WarehouseFormValues = z.infer<typeof formSchema>;

interface WarehouseFormProps {
  initialData?: WarehouseDto | null;
  onSubmit: (data: WarehouseFormValues) => void;
  isLoading: boolean;
}

export const WarehouseForm: React.FC<WarehouseFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
}) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      address: '',
      city: '',
      district: '',
      latitude: 0,
      longitude: 0,

    },
  });

  const handleMapPositionChange = (lat: number, lng: number) => {
    form.setValue('latitude', lat);
    form.setValue('longitude', lng);
  };

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        address: initialData.address,
        city: initialData.city,
        district: initialData.district,
        latitude: initialData.latitude,
        longitude: initialData.longitude,

      });
    } else {
      form.reset({
        name: '',
        address: '',
        city: '',
        district: '',
        latitude: 0,
        longitude: 0,

      });
    }
  }, [initialData, form]);

  const lat = form.watch('latitude');
  const lng = form.watch('longitude');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="h-full flex flex-col min-h-0">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 h-full overflow-hidden min-h-0">

          {/* SOL TARAFLAR: Form Alanları */}
          <div className="md:col-span-5 h-full flex flex-col border-r border-slate-200 bg-white min-h-0">

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 min-h-0">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Depo Adı</FormLabel>
                    <FormControl>
                      <Input placeholder="Örn: Merkez Depo" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* AKILLI ADRES ARAMA BÖLÜMÜ */}
              <div className="border p-4 rounded-lg bg-slate-50 space-y-3">
                <h3 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Adres ve Konum Ara
                </h3>

                <AddressAutocomplete
                  defaultValue={form.getValues('address')}
                  onSelect={(data) => {
                    if (data.label) form.setValue('address', data.label);
                    if (data.city) form.setValue('city', data.city);
                    if (data.district) form.setValue('district', data.district);
                    form.setValue('latitude', data.lat);
                    form.setValue('longitude', data.lon);
                    toast.success("Adres ve konum bilgileri güncellendi.");
                  }}
                />
                <p className="text-xs text-slate-500">
                  * Yukarıya adres yazıp listeden seçerseniz harita ve diğer alanlar otomatik dolar.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>İl</FormLabel>
                      <FormControl>
                        <Input placeholder="İstanbul" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>İlçe</FormLabel>
                      <FormControl>
                        <Input placeholder="Kadıköy" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Açık Adres Detayı</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />


            </div>

            {/* Fixed Footer for Button */}
            <div className="p-4 border-t bg-slate-50 shrink-0">
              <Button type="submit" disabled={isLoading} className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                {isLoading ? 'İşleniyor...' : initialData ? 'Güncelle' : 'Kaydet'}
              </Button>
            </div>

          </div>

          {/* SAĞ TARAF: Harita (Tam Ekran) */}
          <div className="md:col-span-7 h-full relative bg-slate-100 flex flex-col min-h-0">
            <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur px-3 py-2 rounded shadow-md border text-sm font-medium text-slate-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              Konum Doğrulama
              <span className="text-xs font-normal text-slate-500 hidden sm:inline">(İğneyi sürükleyiniz)</span>
            </div>

            <MapPicker
              position={{
                lat: (lat as number) ?? 0,
                lng: (lng as number) ?? 0
              }}
              onPositionChange={handleMapPositionChange}
              className="flex-1 w-full h-full rounded-none border-0"
            />

            <input type="hidden" {...form.register('latitude')} />
            <input type="hidden" {...form.register('longitude')} />
          </div>

        </div>
      </form>
    </Form>
  );
};