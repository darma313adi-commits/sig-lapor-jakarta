import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { CivicReport, ReportCategory } from '../types';
import { CATEGORIES, REGION_SHORTCUTS, STATUS_META } from '../data/categories';
import {
  Compass,
  Crosshair,
  Layers,
  MapPin,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

interface LeafletMapProps {
  reports: CivicReport[];
  selectedReport: CivicReport | null;
  onSelectReport: (report: CivicReport) => void;
  userLocation: { lat: number; lng: number } | null;
  onLocateUser: () => void;
  pickingLocation: { lat: number; lng: number } | null;
  onPickLocation?: (coords: { lat: number; lng: number }) => void;
  isPickingMode?: boolean;
  selectedCategoryFilter: string;
}

const TILE_SERVERS = {
  osm: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    name: 'OpenStreetMap (Jelas & Lengkap)',
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  },
  voyager: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    name: 'Carto Voyager (Modern Terang)',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 19,
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    name: 'Carto Dark (Mode Gelap)',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 19,
  },
};

export default function LeafletMap({
  reports,
  selectedReport,
  onSelectReport,
  userLocation,
  onLocateUser,
  pickingLocation,
  onPickLocation,
  isPickingMode = false,
  selectedCategoryFilter,
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const boundaryLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.CircleMarker | null>(null);
  const pickMarkerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Default to OpenStreetMap to guarantee instant display in any environment
  const [activeBaseMap, setActiveBaseMap] = useState<'osm' | 'voyager' | 'dark'>('osm');
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [showRegionMenu, setShowRegionMenu] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Jabodetabek (Jakarta - Depok - Tangerang - Bekasi)
    const map = L.map(mapContainerRef.current, {
      center: [-6.2146, 106.8451], // Jakarta Pusat / Monas Area
      zoom: 11,
      zoomControl: false,
      attributionControl: true,
    });

    const activeConfig = TILE_SERVERS[activeBaseMap];
    const tiles = L.tileLayer(activeConfig.url, {
      maxZoom: activeConfig.maxZoom || 19,
      subdomains: (activeConfig as any).subdomains || 'abc',
      attribution: activeConfig.attribution,
    }).addTo(map);

    tileLayerRef.current = tiles;

    // Jabodetabek Boundary Highlight (Visual reference polygon)
    const boundaryGroup = L.layerGroup().addTo(map);
    boundaryLayerRef.current = boundaryGroup;

    // Approximate Jabodetabek Metropolitan Area perimeter
    const jabodetabekPerimeter: [number, number][] = [
      [-6.08, 106.68], // Pluit / Laut Utara
      [-6.08, 107.02], // Marunda / Bekasi Utara
      [-6.20, 107.08], // Tambun / Cikarang
      [-6.38, 107.05], // Cibubur / Cileungsi
      [-6.65, 106.88], // Bogor Timur
      [-6.65, 106.75], // Bogor Barat
      [-6.45, 106.72], // Depok Barat / Sawangan
      [-6.32, 106.60], // Serpong / Tangsel
      [-6.16, 106.58], // Tangerang Kota
      [-6.08, 106.68], // Closed loop
    ];

    L.polygon(jabodetabekPerimeter, {
      color: '#f59e0b',
      weight: 2,
      dashArray: '6, 6',
      fillColor: '#f59e0b',
      fillOpacity: 0.04,
      interactive: false,
    }).addTo(boundaryGroup);

    // Markers layer
    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    mapInstanceRef.current = map;

    // Handle map click for picking location mode
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onPickLocation) {
        onPickLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    });

    // Invalidate size on mount and delays to handle flex container settling
    const timer1 = setTimeout(() => map.invalidateSize(), 100);
    const timer2 = setTimeout(() => map.invalidateSize(), 400);
    const timer3 = setTimeout(() => map.invalidateSize(), 1000);

    // Resize observer
    let resizeObserver: ResizeObserver | null = null;
    if (mapContainerRef.current && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Map tiles when changed
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const activeConfig = TILE_SERVERS[activeBaseMap];
    const newTiles = L.tileLayer(activeConfig.url, {
      maxZoom: activeConfig.maxZoom || 19,
      subdomains: (activeConfig as any).subdomains || 'abc',
      attribution: activeConfig.attribution,
    }).addTo(map);

    tileLayerRef.current = newTiles;
    map.invalidateSize();
  }, [activeBaseMap]);

  // Update Markers when reports or category filter changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const map = mapInstanceRef.current;
    const group = markersLayerRef.current;
    group.clearLayers();

    const filtered =
      selectedCategoryFilter === 'all'
        ? reports
        : reports.filter((r) => r.category === selectedCategoryFilter);

    filtered.forEach((report) => {
      const cat = CATEGORIES[report.category] || CATEGORIES.lainnya;
      const statusMeta = STATUS_META[report.status] || STATUS_META.menunggu;

      const markerHtml = `
        <div class="relative flex flex-col items-center cursor-pointer group" style="transform: translate(-50%, -100%);">
          ${
            report.status !== 'selesai' && report.urgency === 'tinggi'
              ? `<span class="absolute w-10 h-10 -top-1 rounded-full opacity-75 animate-ping" style="background-color: ${cat.color}50;"></span>`
              : ''
          }
          <div class="relative w-8 h-8 rounded-full border-2 border-white flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110" style="background-color: ${cat.color};">
            <span class="text-white text-[11px] font-black leading-none">${getCategoryInitial(report.category)}</span>
          </div>
          <div class="w-2 h-2.5 -mt-0.5" style="background-color: ${cat.color}; clip-path: polygon(0 0, 100% 0, 50% 100%);"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-sig-pin',
        iconSize: [32, 42],
        iconAnchor: [16, 42],
        popupAnchor: [0, -44],
      });

      const marker = L.marker([report.lat, report.lng], { icon: customIcon });

      const popupContent = `
        <div class="p-3 text-slate-100 max-w-[280px]">
          <div class="relative h-28 w-full rounded-lg overflow-hidden mb-2 bg-slate-800">
            <img src="${report.imageUrl}" alt="${report.title}" class="w-full h-full object-cover" />
            <div class="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md bg-slate-900/80 text-white border border-white/20">
              ${cat.shortLabel}
            </div>
            <div class="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-semibold ${statusMeta.badgeClass}">
              ${statusMeta.label}
            </div>
          </div>

          <h4 class="font-semibold text-sm text-slate-100 leading-snug line-clamp-2 mb-1">
            ${escapeHtml(report.title)}
          </h4>
          
          <p class="text-xs text-slate-300 line-clamp-2 mb-2">
            ${escapeHtml(report.description)}
          </p>

          <div class="text-[11px] text-slate-400 mb-3 flex items-center gap-1">
            <span>📍</span>
            <span class="truncate">${escapeHtml(report.address)}</span>
          </div>

          <button id="view-report-btn-${report.id}" class="w-full py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm">
            Lihat Detail & Tangani
          </button>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 300 });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-report-btn-${report.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectReport(report);
            map.closePopup();
          };
        }
      });

      marker.addTo(group);
    });
  }, [reports, selectedCategoryFilter, onSelectReport]);

  // Center on Selected Report
  useEffect(() => {
    if (!selectedReport || !mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([selectedReport.lat, selectedReport.lng], 15, {
      duration: 1.2,
    });
  }, [selectedReport]);

  // Handle User GPS Marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (userLocation) {
      if (!userMarkerRef.current) {
        userMarkerRef.current = L.circleMarker([userLocation.lat, userLocation.lng], {
          radius: 10,
          fillColor: '#0284c7',
          color: '#ffffff',
          weight: 3,
          opacity: 1,
          fillOpacity: 0.9,
        }).addTo(map);

        userMarkerRef.current.bindTooltip('Posisi GPS Anda', { permanent: false, direction: 'top' });
      } else {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      }
      map.flyTo([userLocation.lat, userLocation.lng], 14, { duration: 1.2 });
    }
  }, [userLocation]);

  // Handle Picking Location Pin in Citizen Report Modal
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (pickingLocation) {
      const pickHtml = `
        <div class="relative flex flex-col items-center animate-bounce" style="transform: translate(-50%, -100%);">
          <div class="w-9 h-9 rounded-full bg-amber-500 border-2 border-white shadow-2xl flex items-center justify-center text-slate-950 font-bold text-sm">
            📍
          </div>
          <div class="w-2 h-2.5 -mt-0.5 bg-amber-500" style="clip-path: polygon(0 0, 100% 0, 50% 100%);"></div>
        </div>
      `;
      const icon = L.divIcon({
        html: pickHtml,
        className: 'pick-pin',
        iconSize: [36, 46],
        iconAnchor: [18, 46],
      });

      if (!pickMarkerRef.current) {
        pickMarkerRef.current = L.marker([pickingLocation.lat, pickingLocation.lng], {
          icon,
          draggable: true,
        }).addTo(map);

        pickMarkerRef.current.on('dragend', (e) => {
          const latlng = e.target.getLatLng();
          if (onPickLocation) {
            onPickLocation({ lat: latlng.lat, lng: latlng.lng });
          }
        });
      } else {
        pickMarkerRef.current.setLatLng([pickingLocation.lat, pickingLocation.lng]);
      }
    } else if (pickMarkerRef.current) {
      map.removeLayer(pickMarkerRef.current);
      pickMarkerRef.current = null;
    }
  }, [pickingLocation, onPickLocation]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  const handleJumpToRegion = (r: (typeof REGION_SHORTCUTS)[0]) => {
    mapInstanceRef.current?.flyTo([r.lat, r.lng], r.zoom, { duration: 1.2 });
    setShowRegionMenu(false);
  };

  return (
    <div className="relative w-full h-full min-h-[580px] bg-slate-900 overflow-hidden">
      {/* Map DOM Element */}
      <div
        ref={mapContainerRef}
        id="leaflet-jabodetabek-map"
        className="w-full h-full min-h-[580px] z-0"
        style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
      />

      {/* Picking Mode Banner */}
      {isPickingMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] bg-amber-500 text-slate-950 px-4 py-2 rounded-full font-bold text-xs shadow-2xl flex items-center gap-2 border-2 border-white animate-pulse">
          <Crosshair className="w-4 h-4" />
          <span>Klik titik lokasi kejadian di peta Jabodetabek</span>
        </div>
      )}

      {/* Top Left: Region Shortcuts Bar */}
      <div className="absolute top-4 left-4 z-[400] flex flex-wrap gap-1.5 bg-slate-900/95 p-1.5 rounded-xl border border-slate-700/80 shadow-2xl backdrop-blur-md max-w-[calc(100%-110px)]">
        <button
          onClick={() => setShowRegionMenu(!showRegionMenu)}
          className="md:hidden flex items-center gap-1 px-3 py-1 text-xs font-semibold text-slate-200 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
        >
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>Wilayah Jabodetabek</span>
        </button>

        <div className="hidden md:flex items-center gap-1 overflow-x-auto no-scrollbar max-w-[700px]">
          {REGION_SHORTCUTS.map((reg) => (
            <button
              key={reg.name}
              onClick={() => handleJumpToRegion(reg)}
              className="px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-slate-800/90 rounded-md transition-colors whitespace-nowrap"
            >
              {reg.name}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Region Dropdown */}
      {showRegionMenu && (
        <div className="md:hidden absolute top-16 left-4 z-[400] bg-slate-900 border border-slate-700 rounded-xl p-2 shadow-2xl backdrop-blur-lg w-52 space-y-1 max-h-72 overflow-y-auto">
          {REGION_SHORTCUTS.map((reg) => (
            <button
              key={reg.name}
              onClick={() => handleJumpToRegion(reg)}
              className="w-full text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800 rounded-lg transition-colors font-medium"
            >
              {reg.name}
            </button>
          ))}
        </div>
      )}

      {/* Bottom Left Legend */}
      <div className="hidden lg:block absolute bottom-6 left-4 z-[400] bg-slate-900/95 border border-slate-700/80 p-3 rounded-xl shadow-2xl backdrop-blur-md max-w-xs">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Kategori Laporan Jabodetabek
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
          {Object.values(CATEGORIES).map((cat) => (
            <div key={cat.id} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-slate-300 truncate">{cat.shortLabel}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Right: Layer Switcher & GPS Controls */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
        {/* Locate Me (GPS) */}
        <button
          onClick={onLocateUser}
          title="Lacak Lokasi GPS Saya"
          className="w-10 h-10 bg-slate-900/95 hover:bg-slate-800 text-slate-200 hover:text-amber-400 rounded-xl border border-slate-700/80 shadow-xl backdrop-blur-md flex items-center justify-center transition-colors"
        >
          <Crosshair className="w-5 h-5" />
        </button>

        {/* Base Map Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            title="Ganti Jenis Peta"
            className="w-10 h-10 bg-slate-900/95 hover:bg-slate-800 text-slate-200 hover:text-amber-400 rounded-xl border border-slate-700/80 shadow-xl backdrop-blur-md flex items-center justify-center transition-colors"
          >
            <Layers className="w-5 h-5" />
          </button>

          {showLayerMenu && (
            <div className="absolute right-0 top-12 bg-slate-900 border border-slate-700 rounded-xl p-2 shadow-2xl backdrop-blur-lg w-52 space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
                Pilih Tampilan Peta
              </div>
              {Object.entries(TILE_SERVERS).map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => {
                    setActiveBaseMap(key as any);
                    setShowLayerMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    activeBaseMap === key
                      ? 'bg-amber-500/20 text-amber-300 font-bold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="flex flex-col bg-slate-900/95 rounded-xl border border-slate-700/80 shadow-xl backdrop-blur-md overflow-hidden">
          <button
            onClick={handleZoomIn}
            title="Perbesar"
            className="w-10 h-10 flex items-center justify-center text-slate-200 hover:text-amber-400 hover:bg-slate-800 transition-colors border-b border-slate-800"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Perkecil"
            className="w-10 h-10 flex items-center justify-center text-slate-200 hover:text-amber-400 hover:bg-slate-800 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function getCategoryInitial(category: ReportCategory): string {
  switch (category) {
    case 'jalan_rusak':
      return 'JR';
    case 'pohon_tumbang':
      return 'PT';
    case 'banjir':
      return 'BJ';
    case 'tawuran':
      return 'TW';
    case 'pesta_narkoba':
      return 'NK';
    default:
      return 'LK';
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
