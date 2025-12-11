'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { WarehouseDto } from '@/types';
import { Copy, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface WarehousesMapProps {
  warehouses: WarehouseDto[];
}

const WarehousesMap = ({ warehouses }: WarehousesMapProps) => {

  // 1. Leaflet İkon Sorunu Düzeltmesi (Next.js için Standart Fix)
  useEffect(() => {
    // Bu kod sadece tarayıcıda çalışır.
    // Prototip düzenlemesini güvenli hale getiriyoruz.
    // @ts-ignore
    if (L.Icon.Default.prototype._getIconUrl) {
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
    }

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
  }, []);

  // 2. Özel İkon Tanımı - useMemo ile stabilize edildi (Her render'da yeniden oluşması engellendi)
  const customIcon = useMemo(() => L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }), []);

  const copyCoordinates = (lat: number, lng: number) => {
    const text = `${lat}, ${lng}`;
    navigator.clipboard.writeText(text);
    toast.success("Koordinatlar kopyalandı! 📋");
  };

  // Harita Merkezini belirle
  const centerPosition: [number, number] =
    warehouses.length > 0 && warehouses[0].latitude !== 0
      ? [warehouses[0].latitude, warehouses[0].longitude]
      : [41.0082, 28.9784];

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-slate-200 shadow-sm z-0 relative bg-slate-100">
      <MapContainer
        center={centerPosition}
        zoom={10}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {warehouses.map((w) => (
          (w.latitude !== 0 && w.longitude !== 0) && (
            <Marker
              key={w.id}
              position={[w.latitude, w.longitude]}
              icon={customIcon} // Burada oluşturduğumuz ikonu kullanıyoruz
            >
              <Popup className="w-64">
                <div className="flex flex-col gap-2">
                  <div className="font-bold text-sm flex items-center gap-2 border-b pb-1">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    {w.name}
                  </div>

                  <div className="text-xs text-slate-600">
                    {w.city} / {w.district}
                  </div>
                  <div className="text-xs text-slate-500 italic">
                    {w.address}
                  </div>

                  <div className="flex items-center justify-between bg-slate-100 p-1.5 rounded border text-xs">
                    <span className="font-mono text-slate-600 truncate max-w-[120px]">
                      {w.latitude.toFixed(4)}, {w.longitude.toFixed(4)}
                    </span>
                    <button
                      onClick={() => copyCoordinates(w.latitude, w.longitude)}
                      className="hover:bg-white p-1 rounded transition-colors text-slate-700"
                      title="Kopyala"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
};

export default WarehousesMap;