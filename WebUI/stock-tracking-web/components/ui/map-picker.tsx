'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { cn } from '@/lib/utils';

const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center);
  return null;
}

interface MapPickerProps {
  position: { lat: number; lng: number };
  onPositionChange: (lat: number, lng: number) => void;
  className?: string;
}

const MapPicker = ({ position, onPositionChange, className }: MapPickerProps) => {
  const markerRef = useRef<L.Marker>(null);

  // Marker sürüklendiğinde çalışacak olay
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          onPositionChange(newPos.lat, newPos.lng);
        }
      },
    }),
    [onPositionChange]
  );

  // Eğer pozisyon yoksa (0,0 ise) varsayılan olarak İstanbul'u göster
  const centerPosition: [number, number] =
    position.lat === 0 && position.lng === 0
      ? [41.0082, 28.9784]
      : [position.lat, position.lng];

  return (
    <div className={cn("h-[300px] w-full rounded-lg overflow-hidden border border-slate-300 z-0 relative", className)}>
      <MapContainer
        center={centerPosition}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        {/* Harita görüntüsü (OpenStreetMap) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Dışarıdan gelen pozisyon değişirse harita oraya odaklansın */}
        <ChangeView center={centerPosition} />

        {/* Sürüklenebilir İğne */}
        <Marker
          draggable={true}
          eventHandlers={eventHandlers}
          position={centerPosition}
          ref={markerRef}
          icon={icon}
        >
          <Popup>Konumu buraya sabitle.</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapPicker;