import { useMemo } from 'react';
import { CivicReport, ReportCategory } from '../types';
import { CATEGORIES, JAKARTA_REGIONS, STATUS_META } from '../data/categories';
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';

interface StatsViewProps {
  reports: CivicReport[];
  onFilterCategory: (cat: string) => void;
  onFilterRegion: (reg: string) => void;
  onSwitchToMap: () => void;
}

export default function StatsView({
  reports,
  onFilterCategory,
  onFilterRegion,
  onSwitchToMap,
}: StatsViewProps) {
  const stats = useMemo(() => {
    const total = reports.length;
    const resolved = reports.filter((r) => r.status === 'selesai').length;
    const inProgress = reports.filter((r) => r.status === 'diproses').length;
    const pending = reports.filter((r) => r.status === 'menunggu' || r.status === 'diteruskan').length;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    // By category
    const byCategory: Record<ReportCategory, number> = {
      jalan_rusak: 0,
      pohon_tumbang: 0,
      banjir: 0,
      tawuran: 0,
      pesta_narkoba: 0,
      lainnya: 0,
    };
    reports.forEach((r) => {
      if (byCategory[r.category] !== undefined) {
        byCategory[r.category]++;
      } else {
        byCategory.lainnya++;
      }
    });

    // By region
    const byRegion: Record<string, number> = {};
    reports.forEach((r) => {
      byRegion[r.region] = (byRegion[r.region] || 0) + 1;
    });

    return { total, resolved, inProgress, pending, resolutionRate, byCategory, byRegion };
  }, [reports]);

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur-md">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
            Total Laporan Warga
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
            {stats.total}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Tersimpan di Database Pusat</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur-md">
          <div className="text-purple-400 text-xs font-semibold uppercase tracking-wider mb-1">
            Sedang Ditangani Satgas
          </div>
          <div className="text-3xl font-extrabold text-purple-400 font-mono tabular-nums">
            {stats.inProgress}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Personel aktif di lokasi</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur-md">
          <div className="text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            Selesai / Teratasi
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono tabular-nums">
            {stats.resolved}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">
            Tingkat Penyelesaian: {stats.resolutionRate}%
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur-md">
          <div className="text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            Menunggu Verifikasi
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono tabular-nums">
            {stats.pending}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Antrean disposisi dinas</div>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center justify-between">
            <span>Distribusi Berdasarkan Jenis Kejadian</span>
            <span className="text-xs text-slate-400 font-normal">Klik untuk filter</span>
          </h3>

          <div className="space-y-3">
            {Object.values(CATEGORIES).map((cat) => {
              const count = stats.byCategory[cat.id] || 0;
              const percent = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;

              return (
                <div
                  key={cat.id}
                  onClick={() => {
                    onFilterCategory(cat.id);
                    onSwitchToMap();
                  }}
                  className="group p-2.5 rounded-xl hover:bg-slate-800/60 transition-colors cursor-pointer border border-transparent hover:border-slate-700/80"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-semibold text-slate-200 group-hover:text-amber-400 transition-colors">
                        {cat.label}
                      </span>
                    </div>
                    <div className="font-mono text-slate-300">
                      <strong className="text-white tabular-nums">{count}</strong> laporan ({percent}%)
                    </div>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Region Breakdown */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center justify-between">
            <span>Persebaran Wilayah DKI Jakarta & Sekitarnya</span>
            <span className="text-xs text-slate-400 font-normal">Klik untuk filter</span>
          </h3>

          <div className="space-y-3">
            {Object.entries(stats.byRegion).map(([regionName, count]) => {
              const percent = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;

              return (
                <div
                  key={regionName}
                  onClick={() => {
                    onFilterRegion(regionName);
                    onSwitchToMap();
                  }}
                  className="group p-2.5 rounded-xl hover:bg-slate-800/60 transition-colors cursor-pointer border border-transparent hover:border-slate-700/80"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2 text-slate-200 group-hover:text-amber-400 transition-colors">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-semibold">{regionName}</span>
                    </div>
                    <div className="font-mono text-slate-300">
                      <strong className="text-white tabular-nums">{count}</strong> kejadian ({percent}%)
                    </div>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-500 transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
