'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Loader2, MapPin, AlertCircle } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

interface AddressSuggestion {
  label: string;
  city?: string;
  district?: string;
  lat: number;
  lon: number;
}

interface AddressAutocompleteProps {
  onSelect: (data: AddressSuggestion) => void;
  defaultValue?: string;
}

export function AddressAutocomplete({ onSelect, defaultValue }: AddressAutocompleteProps) {
  const [query, setQuery] = useState(defaultValue || '');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, 500);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Dışarı tıklandığında listeyi kapat
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Arama Yap (Nominatim API)
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!debouncedQuery || debouncedQuery.length < 3) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      setErrorMsg(null);

      try {


        const url = `/api/proxy/nominatim?q=${encodeURIComponent(debouncedQuery)}`;
        const res = await fetch(url);

        if (!res.ok) throw new Error(`API Hatası: ${res.status}`);

        const data = await res.json();


        if (data && data.length > 0) {
          setSuggestions(data);
          setIsOpen(true);
        } else {
          setSuggestions([]);
          setIsOpen(false);
        }

      } catch (error) {
        console.error("❌ Adres hatası:", error);
        setErrorMsg("Adres servisine bağlanılamadı.");
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAddresses();
  }, [debouncedQuery]);

  const handleSelect = (item: any) => {
    const addr = item.address;

    const displayLabel = item.display_name;
    const city = addr.province || addr.city || addr.state;
    const district = addr.town || addr.district || addr.county || addr.suburb;

    const selectedData: AddressSuggestion = {
      label: displayLabel,
      city: city,
      district: district,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon)
    };

    setQuery(item.name || displayLabel.split(',')[0]); // Inputa kısa ismini yaz
    setIsOpen(false);
    onSelect(selectedData);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative">
        <Input
          placeholder="Adres aramaya başlayın... (Örn: Kadıköy)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (suggestions.length > 0) setIsOpen(true); }}
          className="pr-10"
        />
        <div className="absolute right-3 top-2.5 text-slate-400">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
        </div>
      </div>

      {errorMsg && (
        <div className="text-xs text-red-500 mt-1 flex items-center gap-1 px-1">
          <AlertCircle className="w-3 h-3" /> {errorMsg}
        </div>
      )}

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-[9999] left-0 w-full bg-white border border-slate-200 rounded-md shadow-xl mt-1 max-h-60 overflow-auto ring-1 ring-black ring-opacity-5">
          {suggestions.map((item, index) => (
            <li
              key={index}
              onClick={() => handleSelect(item)}
              className="px-4 py-3 hover:bg-slate-50 cursor-pointer text-sm border-b last:border-b-0 transition-colors flex items-start gap-3"
            >
              <MapPin className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <div>
                <div className="font-medium text-slate-900">
                  {item.name || item.address.road || "Adres Detayı"}
                </div>
                <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                  {item.display_name}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}