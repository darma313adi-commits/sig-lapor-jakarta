import { useState, useEffect } from 'react';
import { CivicReport, ReportCategory } from './types';
import {
  fetchReports,
  getDeviceCoordinates,
  submitReport,
  resetDatabase,
  subscribeToReports,
} from './services/reportService';
import Header from './components/Header';
import LeafletMap from './components/LeafletMap';
import ReportListView from './components/ReportListView';
import StatsView from './components/StatsView';
import ReportModal from './components/ReportModal';
import ReportDetailModal from './components/ReportDetailModal';
import CivicGuideModal from './components/CivicGuideModal';
import { CATEGORIES, STATUS_META } from './data/categories';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Compass,
  Crosshair,
  Filter,
  Layers,
  ListFilter,
  Map as MapIcon,
  Plus,
  Radio,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Zap,
} from 'lucide-react';

export default function App() {
  const [reports, setReports] = useState<CivicReport[]>([]);
  const [activeView, setActiveView] = useState<'map' | 'list' | 'stats'>('map');
  const [selectedReport, setSelectedReport] = useState<CivicReport | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('Semua Wilayah');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  // GPS & Map Picking
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [pickingLocation, setPickingLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isPickingMode, setIsPickingMode] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Live Toast Notification
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'new' | 'update' | 'reset';
  } | null>(null);

  const showNotification = (text: string, type: 'new' | 'update' | 'reset' = 'new') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Real-time Firestore sync across all devices & users
  useEffect(() => {
    setIsRefreshing(true);
    const unsubscribe = subscribeToReports((updatedReports) => {
      setReports(updatedReports);
      setIsRefreshing(false);
    });

    return () => unsubscribe();
  }, []);

  const loadReports = async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchReports();
      setReports(data);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle locate user GPS
  const handleLocateUser = async () => {
    try {
      const pos = await getDeviceCoordinates();
      setUserLocation({ lat: pos.lat, lng: pos.lng });
      showNotification(
        `Lokasi GPS Terlacak: ${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}`,
        'update'
      );
    } catch (err) {
      console.warn('GPS location error:', err);
    }
  };

  const handleReportCreated = (newReport: CivicReport) => {
    setReports((prev) => [newReport, ...prev]);
    setSelectedReport(newReport);
    setActiveView('map');
    setPickingLocation(null);
    setIsPickingMode(false);
    showNotification(`Laporan berhasil dikirim ke database: ${newReport.title}`, 'new');
  };

  const handleReportUpdated = (updated: CivicReport) => {
    setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setSelectedReport(updated);
    showNotification(
      `Status penanganan diperbarui: ${STATUS_META[updated.status]?.label}`,
      'update'
    );
  };

  const handleFlyToMap = (report: CivicReport) => {
    setSelectedReport(report);
    setActiveView('map');
  };

  const handleEnablePickMode = () => {
    setIsPickingMode(true);
    setActiveView('map');
    setPickingLocation({ lat: -6.2088, lng: 106.8456 });
  };

  const handlePickLocation = (coords: { lat: number; lng: number }) => {
    if (isPickingMode) {
      setPickingLocation(coords);
      setIsPickingMode(false);
      setIsReportModalOpen(true);
    }
  };

  // Quick Simulation Helper to demonstrate live real-time dynamic behavior
  const handleSimulateReport = async () => {
    const simulationPool = [
      {
        title: 'Pohon Sengon Roboh Menghalangi Pintu Keluar Stasiun',
        category: 'pohon_tumbang' as ReportCategory,
        description: 'Pohon berukuran sedang tumbang menimpa bahu jalan akses penjemputan penumpang. Tidak ada korban luka, lalu lintas tersendat.',
        reporterName: 'Warga Palmerah (Live Sensor)',
        lat: -6.2074 + (Math.random() - 0.5) * 0.04,
        lng: 106.7972 + (Math.random() - 0.5) * 0.04,
        address: 'Jl. Palmerah Barat, Dekat Pasar Palmerah',
        district: 'Palmerah',
        region: 'Jakarta Barat',
        imageUrl: '/src/assets/images/fallen_tree_roadblock_jakarta_1793021562768.jpg',
        urgency: 'tinggi' as const,
      },
      {
        title: 'Genangan Air Naik 45cm Akibat Pompa Pembuang Macet',
        category: 'banjir' as ReportCategory,
        description: 'Air luapan saluran penghubung mulai meluap ke badan jalan raya. Ketinggian air 30-45 cm, hanya truk besar yang berani melintas.',
        reporterName: 'Supir Angkot M16',
        lat: -6.2201 + (Math.random() - 0.5) * 0.04,
        lng: 106.8529 + (Math.random() - 0.5) * 0.04,
        address: 'Jl. Raya Otista Raya No. 88, Kampung Melayu',
        district: 'Jatinegara',
        region: 'Jakarta Timur',
        imageUrl: '/src/assets/images/flood_jakarta_street_1793021561603.jpg',
        urgency: 'tinggi' as const,
      },
      {
        title: 'Lubang Galian Pipa Tanpa Rambu Pengaman Membahayakan',
        category: 'jalan_rusak' as ReportCategory,
        description: 'Bekas galian utilitas sedalam 25 cm amblas dan belum diaspal kembali. Sangat riskan bagi pesepeda motor di malam hari.',
        reporterName: 'Komunitas Motor Jaksel',
        lat: -6.2415 + (Math.random() - 0.5) * 0.04,
        lng: 106.8206 + (Math.random() - 0.5) * 0.04,
        address: 'Jl. Kapten Tendean (Depan Gedung Trans)',
        district: 'Mampang Prapatan',
        region: 'Jakarta Selatan',
        imageUrl: '/src/assets/images/pothole_damaged_road_jakarta_1793021562269.jpg',
        urgency: 'sedang' as const,
      },
      {
        title: 'Patroli Antisipasi Kerumunan Pelajar Hendak Tawuran',
        category: 'tawuran' as ReportCategory,
        description: 'Warga melihat puluhan pelajar bergerombol di flyover dengan gelagat mencurigakan sebelum jam pulang sekolah.',
        reporterName: 'Warga Peduli Keamanan',
        lat: -6.1834 + (Math.random() - 0.5) * 0.04,
        lng: 106.8488 + (Math.random() - 0.5) * 0.04,
        address: 'Flyover Matraman - Pramuka',
        district: 'Matraman',
        region: 'Jakarta Timur',
        imageUrl: '/src/assets/images/tawuran_police_patrol_jakarta_1793021561829.jpg',
        urgency: 'tinggi' as const,
      },
    ];

    const pick = simulationPool[Math.floor(Math.random() * simulationPool.length)];
    const created = await submitReport(pick);
    setReports((prev) => [created, ...prev]);
    setSelectedReport(created);
    setActiveView('map');
    showNotification(`⚡ Simulasi Laporan Masuk: "${created.title}"`, 'new');
  };

  const handleResetData = async () => {
    if (confirm('Reset seluruh data ke laporan awal bawaan?')) {
      await resetDatabase();
      await loadReports();
      showNotification('Database telah diatur ulang ke laporan awal', 'reset');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-white relative">
      {/* Real-time Dynamic Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-[999] max-w-sm bg-slate-900/95 border border-amber-500/40 text-slate-100 p-3.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-in slide-in-from-top duration-300">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              toastMessage.type === 'new'
                ? 'bg-amber-500/20 text-amber-400'
                : toastMessage.type === 'update'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-blue-500/20 text-blue-400'
            }`}
          >
            {toastMessage.type === 'new' ? (
              <Bell className="w-4 h-4 animate-bounce" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
          </div>
          <div className="text-xs">
            <span className="font-semibold block text-slate-200">
              {toastMessage.type === 'new'
                ? 'Notifikasi Real-time'
                : toastMessage.type === 'update'
                ? 'Pembaruan Status Penanganan'
                : 'Status Sistem'}
            </span>
            <span className="text-slate-300 line-clamp-2">{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Top Header Contract */}
      <Header
        activeView={activeView}
        onViewChange={setActiveView}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        totalReportsCount={reports.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* Quick Category & Status Bar */}
        <section className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
            {/* View Switcher Mobile / Secondary */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setActiveView('map')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeView === 'map'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Peta Jakarta & Sekitarnya</span>
              </button>

              <button
                onClick={() => setActiveView('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeView === 'list'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>Laporan Masyarakat ({reports.length})</span>
              </button>
            </div>

            {/* Category Quick Filter */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs shrink-0">
              <span className="text-slate-500 text-[11px] font-medium mr-1">Filter Cepat:</span>
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'bg-slate-800 text-amber-400 font-bold border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Semua
              </button>
              {Object.values(CATEGORIES).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? 'bg-slate-800 text-white font-bold border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span>{cat.shortLabel}</span>
                </button>
              ))}
            </div>

            {/* Simulation & Real-time DB Controls */}
            <div className="flex items-center gap-2 shrink-0 text-xs text-slate-400">
              <button
                onClick={handleSimulateReport}
                title="Simulasi Laporan Warga Masuk Secara Real-Time"
                className="px-2.5 py-1 text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap"
              >
                <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="hidden md:inline">Uji Simulasi Laporan</span>
                <span className="md:hidden">Simulasi</span>
              </button>

              <button
                onClick={handleResetData}
                title="Reset Database ke Data Awal"
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={loadReports}
                title="Sinkronisasi Data Terbaru"
                disabled={isRefreshing}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* View Mode Content */}
        {activeView === 'map' ? (
          <div className="flex-1 relative w-full h-[calc(100vh-115px)] min-h-[580px]">
            <LeafletMap
              reports={reports}
              selectedReport={selectedReport}
              onSelectReport={setSelectedReport}
              userLocation={userLocation}
              onLocateUser={handleLocateUser}
              pickingLocation={pickingLocation}
              onPickLocation={handlePickLocation}
              isPickingMode={isPickingMode}
              selectedCategoryFilter={selectedCategory}
            />

            {/* Floating Quick Action Drawer (Bottom Sheet on Desktop/Tablet) */}
            <div className="absolute bottom-4 right-4 z-[400] max-w-sm hidden sm:block">
              <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    SIG Real-time Jabodetabek
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {reports.length} Titik Laporan
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Klik titik pin di peta untuk melihat foto bukti dan status tindak lanjut aparat.
                </p>
                <div className="pt-1 flex gap-2">
                  <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="flex-1 py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Lapor Sekarang</span>
                  </button>
                  <button
                    onClick={() => setActiveView('list')}
                    className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
                  >
                    Buka Tabel
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : activeView === 'list' ? (
          <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6">
            <ReportListView
              reports={reports}
              onSelectReport={setSelectedReport}
              onFlyToMap={handleFlyToMap}
              onOpenReportModal={() => setIsReportModalOpen(true)}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedRegion={selectedRegion}
              onRegionChange={setSelectedRegion}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>
        ) : (
          <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6">
            <StatsView
              reports={reports}
              onFilterCategory={(cat) => {
                setSelectedCategory(cat);
                setActiveView('list');
              }}
              onFilterRegion={(reg) => {
                setSelectedRegion(reg);
                setActiveView('list');
              }}
              onSwitchToMap={() => setActiveView('map')}
            />
          </div>
        )}
      </main>

      {/* Citizen Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onReportCreated={handleReportCreated}
        pickedCoords={pickingLocation}
        onEnablePickMode={handleEnablePickMode}
      />

      {/* Report Detail & Authority Status Modal */}
      <ReportDetailModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        onReportUpdated={handleReportUpdated}
        onFlyToMap={handleFlyToMap}
      />

      {/* Citizen Reporting Guide Modal */}
      <CivicGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        onStartReport={() => setIsReportModalOpen(true)}
      />
    </div>
  );
}
