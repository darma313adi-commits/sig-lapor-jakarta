import { MapPin, Plus, List, BarChart3, HelpCircle, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  activeView: 'map' | 'list' | 'stats';
  onViewChange: (view: 'map' | 'list' | 'stats') => void;
  onOpenReportModal: () => void;
  onOpenGuideModal: () => void;
  totalReportsCount: number;
}

export default function Header({
  activeView,
  onViewChange,
  onOpenReportModal,
  onOpenGuideModal,
  totalReportsCount,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5 bg-slate-900/95 border-b border-slate-800 backdrop-blur-md sticky top-0 z-50">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-2 shrink-0">
        <a
          href="/"
          className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2 hover:text-amber-400 transition-colors"
        >
          <span className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-extrabold shadow-md shadow-amber-500/20">
            SIG
          </span>
          <span>Lapor Jakarta</span>
        </a>
      </div>

      {/* Zone 2: 4-5 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
        <button
          onClick={() => onViewChange('map')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeView === 'map'
              ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
              : 'text-slate-300'
          }`}
        >
          Peta Interaktif
        </button>

        <button
          onClick={() => onViewChange('list')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeView === 'list'
              ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
              : 'text-slate-300'
          }`}
        >
          Daftar Laporan
        </button>

        <button
          onClick={() => onViewChange('stats')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
            activeView === 'stats'
              ? 'text-amber-400 font-semibold border-b-2 border-amber-400'
              : 'text-slate-300'
          }`}
        >
          Statistik Wilayah
        </button>

        <button
          onClick={onOpenGuideModal}
          className="hover:text-white transition-colors whitespace-nowrap shrink-0 pb-0.5 text-slate-400"
        >
          Panduan Warga
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenReportModal}
          className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition-all shadow-lg shadow-amber-500/25 flex items-center gap-1.5 whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Lapor Kejadian</span>
        </button>
      </div>
    </header>
  );
}
