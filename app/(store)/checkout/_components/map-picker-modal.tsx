"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { LuLoader, LuX, LuMapPin } from "react-icons/lu";

interface MapPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (data: {
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }) => void;
}

export default function MapPickerModal({ open, onClose, onSelect }: MapPickerModalProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [leaflet, setLeaflet] = useState<typeof import("leaflet") | null>(null);

  useEffect(() => {
    if (!open) return;

    if (!document.querySelector("link[href*='leaflet']")) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    let cancelled = false;
    import("leaflet").then((L) => {
      if (cancelled) return;
      setLeaflet(L);
    });

    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!leaflet || !mapRef.current || mapInstanceRef.current) return;

    const L = leaflet;
    const map = L.map(mapRef.current, {
      center: [23.8103, 90.4125],
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const icon = L.divIcon({
      html: `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#C51E3A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
      className: "",
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    const marker = L.marker([23.8103, 90.4125], { icon, draggable: true });
    marker.addTo(map);
    markerRef.current = marker;

    const updateFromCoords = async (lat: number, lng: number) => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
          { headers: { "Accept-Language": "en" } }
        );
        const addr = (await res.json()) as {
          address?: {
            road?: string;
            house_number?: string;
            city?: string;
            town?: string;
            village?: string;
            state?: string;
            country?: string;
            postcode?: string;
          };
        };
        if (addr.address) {
          const a = addr.address;
          const street = [a.house_number, a.road].filter(Boolean).join(" ");
          const city = a.city || a.town || a.village || "";
          onSelectRef.current({
            addressLine1: street,
            city,
            state: a.state || "",
            postalCode: a.postcode || "",
            country: a.country || "",
          });
        }
      } catch {
        // geocoding failed silently
      } finally {
        setLoading(false);
      }
    };

    const onMapClick = async (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      await updateFromCoords(e.latlng.lat, e.latlng.lng);
    };

    const onMarkerDragEnd = async () => {
      const pos = marker.getLatLng();
      await updateFromCoords(pos.lat, pos.lng);
    };

    map.on("click", onMapClick);
    marker.on("dragend", onMarkerDragEnd);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, [leaflet]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim() || !leaflet || !mapInstanceRef.current) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const results = (await res.json()) as Array<{ lat: string; lon: string }>;
      if (results.length > 0) {
        const { lat, lon } = results[0];
        const map = mapInstanceRef.current;
        map.setView([parseFloat(lat), parseFloat(lon)], 14);
        if (markerRef.current) {
          markerRef.current.setLatLng([parseFloat(lat), parseFloat(lon)]);
          markerRef.current.fire("dragend");
        }
      }
    } catch {
      // search failed silently
    } finally {
      setLoading(false);
    }
  }, [searchQuery, leaflet]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-3xl mx-2 sm:mx-4 my-2 sm:my-0 bg-white rounded-xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-zinc-200 shrink-0">
          <h3 className="font-bembo text-lg sm:text-xl text-[#4A4A4A]">Set from Map</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
          >
            <LuX className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-4 sm:px-6 py-2 sm:py-3 border-b border-zinc-200 shrink-0">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search location..."
              className="flex-1 p-3 rounded-md outline outline-1 outline-offset-[-1px] outline-zinc-300 font-gotham text-sm text-[#222222] placeholder:text-zinc-300 placeholder:text-xs placeholder:font-medium placeholder:font-['Gotham'] leading-4 focus:outline-stone-500"
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={loading || !searchQuery.trim()}
              className="w-full sm:w-auto px-5 py-2 bg-stone-800 text-white font-gotham text-sm rounded-md hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <LuLoader className="w-4 h-4 animate-spin" /> : <LuMapPin className="w-4 h-4" />}
              Search
            </button>
          </div>
        </div>

        {/* Map */}
        <div ref={mapRef} className="w-full min-h-[250px] sm:min-h-[350px] flex-1" />

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <p className="font-gotham text-xs text-[#999999] text-center sm:text-left">
            Click on the map or drag the marker to set your location
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 bg-[#C51E3A] text-white font-gotham text-sm rounded-full hover:bg-opacity-90 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
