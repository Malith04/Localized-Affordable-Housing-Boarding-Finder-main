'use client';

import React, { useEffect, useRef } from 'react';
import { Listing, UniversityAnchor } from '@/types/bodima';
import { formatLKR } from '@/lib/utils/formatters';

interface MapContainerProps {
  listings: Listing[];
  activeUniversity: UniversityAnchor;
  searchRadiusMeters: number;
  selectedListingId?: string | null;
  onSelectListing?: (listing: Listing) => void;
  className?: string;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  listings,
  activeUniversity,
  searchRadiusMeters,
  selectedListingId,
  onSelectListing,
  className = 'h-[550px] w-full',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const radiusCircleRef = useRef<any>(null);
  const campusMarkerRef = useRef<any>(null);
  const markerLookupRef = useRef<Record<string, any>>({});

  // Initialize Map on Client Mount
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Inject Leaflet CSS if not already present
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (!mapInstanceRef.current) {
        // Initialize Map
        const map = L.map(mapContainerRef.current, {
          center: [activeUniversity.latitude, activeUniversity.longitude],
          zoom: 14,
          zoomControl: false,
          scrollWheelZoom: true,
        });

        // Add custom sleek zoom controls at bottom right
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Clean, zero-cost, 100% free OpenStreetMap standard raster tiles (NO API KEY REQUIRED / NO WATERMARK)
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
        }).addTo(map);

        const markersLayer = L.layerGroup().addTo(map);
        markersLayerRef.current = markersLayer;
        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;

      // 1. Update Campus Marker and Radius Circle
      if (radiusCircleRef.current) {
        radiusCircleRef.current.remove();
      }
      if (campusMarkerRef.current) {
        campusMarkerRef.current.remove();
      }

      // Radius boundary circle
      radiusCircleRef.current = L.circle([activeUniversity.latitude, activeUniversity.longitude], {
        radius: searchRadiusMeters,
        color: '#10b981', // emerald-500
        weight: 2.5,
        opacity: 0.85,
        dashArray: '6, 8',
        fillColor: '#10b981',
        fillOpacity: 0.07,
      }).addTo(map);

      // Campus Marker Pin
      const campusIcon = L.divIcon({
        className: 'custom-campus-pin',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="absolute -top-7 bg-slate-900 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-xl border border-emerald-400 flex items-center gap-1.5 whitespace-nowrap animate-bounce z-40">
              🎓 ${activeUniversity.shortName}
            </div>
            <div class="w-6 h-6 bg-emerald-600 rounded-full border-3 border-white shadow-xl ring-4 ring-emerald-500/30"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      campusMarkerRef.current = L.marker(
        [activeUniversity.latitude, activeUniversity.longitude],
        { icon: campusIcon }
      ).addTo(map);

      campusMarkerRef.current.bindPopup(`
        <div style="font-family: inherit; font-size: 13px; padding: 4px;">
          <strong style="color: #059669; font-size: 14px;">🎓 ${activeUniversity.name}</strong>
          <p style="margin: 4px 0 0; color: #475569; font-size: 12px;">${activeUniversity.city} • ${activeUniversity.sinhalaName}</p>
          <div style="margin-top: 6px; font-size: 11px; color: #64748b;">
            Search radius: ${(searchRadiusMeters / 1000).toFixed(1)} km walking perimeter
          </div>
        </div>
      `);

      // 2. Render Boarding Price Markers
      if (markersLayerRef.current) {
        markersLayerRef.current.clearLayers();
        markerLookupRef.current = {};

        listings.forEach((listing) => {
          const isSelected = selectedListingId === listing.id;
          const priceFormatted = listing.monthly_rent >= 1000 
            ? `${(listing.monthly_rent / 1000).toFixed(listing.monthly_rent % 1000 === 0 ? 0 : 1)}k`
            : `${listing.monthly_rent}`;

          const pricePinHtml = `
            <div class="group cursor-pointer transform transition-transform duration-200 ${isSelected ? 'scale-125 z-50' : 'hover:scale-110'}">
              <div class="flex items-center gap-1 px-3 py-1.5 rounded-full font-bold text-xs shadow-lg border transition-all ${
                isSelected
                  ? 'bg-slate-900 text-emerald-400 border-emerald-400 ring-4 ring-emerald-500/40 shadow-emerald-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white border-slate-300 dark:border-slate-700 hover:border-emerald-500 shadow-md'
              }">
                <span class="text-[10px] text-emerald-600 dark:text-emerald-400">Rs.</span>
                <span>${priceFormatted}</span>
              </div>
              <div class="w-2 h-2 mx-auto bg-slate-900 dark:bg-emerald-400 rounded-full mt-0.5 opacity-70"></div>
            </div>
          `;

          const pinIcon = L.divIcon({
            className: 'custom-price-pin',
            html: pricePinHtml,
            iconSize: [64, 32],
            iconAnchor: [32, 16],
          });

          const marker = L.marker([listing.latitude, listing.longitude], {
            icon: pinIcon,
          });

          const popupContent = `
            <div style="font-family: inherit; font-size: 12px; width: 220px; padding: 4px;">
              <strong style="display: block; font-size: 13px; margin-bottom: 2px; color: #0f172a;">${listing.title}</strong>
              <div style="color: #059669; font-weight: 800; font-size: 15px; margin-bottom: 4px;">
                ${formatLKR(listing.monthly_rent)} <span style="font-size: 11px; font-weight: 400; color: #64748b;">/ mo</span>
              </div>
              <div style="color: #64748b; font-size: 11px; margin-bottom: 6px;">
                📍 ${listing.nearest_landmark || listing.address_text}
              </div>
              <div style="font-size: 10px; color: #334155; display: flex; gap: 4px; flex-wrap: wrap;">
                <span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-weight: 600;">${listing.room_type}</span>
                <span style="background: #ecfdf5; color: #047857; padding: 2px 6px; border-radius: 4px; font-weight: 600;">${listing.gender_preference}</span>
                <span style="background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px;">${listing.electricity_type}</span>
              </div>
            </div>
          `;

          marker.bindPopup(popupContent, { offset: [0, -12] });

          marker.on('click', () => {
            onSelectListing?.(listing);
          });

          marker.addTo(markersLayerRef.current);
          markerLookupRef.current[listing.id] = marker;
        });
      }

      // If a specific listing is selected, fly to it and open popup
      if (selectedListingId && markerLookupRef.current[selectedListingId]) {
        const selectedMarker = markerLookupRef.current[selectedListingId];
        const selectedPos = selectedMarker.getLatLng();
        map.flyTo(selectedPos, 16, { duration: 1.0 });
        selectedMarker.openPopup();
      } else {
        // Center around campus with smooth animation
        map.flyTo([activeUniversity.latitude, activeUniversity.longitude], 14, {
          duration: 0.8,
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [listings, activeUniversity, searchRadiusMeters, selectedListingId, onSelectListing]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className={`relative ${className} isolate z-0 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-slate-100 dark:bg-slate-900 transition-all`}>
      <div ref={mapContainerRef} className="h-full w-full" />
      
      {/* Map Floating Top Badge */}
      <div className="absolute top-4 left-4 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg text-xs pointer-events-auto flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-bold text-slate-800 dark:text-slate-100">
            {activeUniversity.shortName} Proximity Zone
          </span>
        </div>
        <span className="text-slate-400 dark:text-slate-500">|</span>
        <span className="text-slate-600 dark:text-slate-300 font-medium">
          {searchRadiusMeters >= 1000 ? `${(searchRadiusMeters / 1000).toFixed(1)} km` : `${searchRadiusMeters} m`} perimeter
        </span>
      </div>

      {/* Recenter Campus Button */}
      <button
        type="button"
        onClick={() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([activeUniversity.latitude, activeUniversity.longitude], 14, { duration: 0.8 });
          }
        }}
        className="absolute bottom-5 left-5 z-20 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition active:scale-95 flex items-center gap-1.5"
      >
        <span>🎯 Recenter on Campus</span>
      </button>
    </div>
  );
};
