import { useState, useMemo } from 'react';
import { CivicReport, ReportCategory, ReportStatus } from '../types';
import { CATEGORIES, JAKARTA_REGIONS, STATUS_META } from '../data/categories';
import {
  Calendar,
  ChevronRight,
  Filter,
  Layers,
  MapPin,
  MessageSquare,
  Search,
  ShieldCheck,
  ThumbsUp,
  X,
  FileSpreadsheet,
} from 'lucide-react';

interface ReportListViewProps {
  reports: CivicReport[];
  onSelectReport: (report: CivicReport) => void;
  onFlyToMap: (report: CivicReport) => void;
  onOpenReportModal: () => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedRegion: string;
  onRegionChange: (reg: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export default function ReportListView({
  reports,
  onSelectReport,
  onFlyToMap,
  onOpenReportModal,
  selectedCategory,
  onCategoryChange,
  selectedRegion,
  onRegionChange,
  selectedStatus,
  onStatusChange,
  searchQuery,
  onSearchChange,
}: ReportListViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      // Category filter
      if (selectedCategory !== 'all' && r.category !== selectedCategory) {
        return false;
      }
      // Region filter
      if (selectedRegion !== 'Semua Wilayah' && r.region !== selectedRegion) {
        return false;
      }
      // Status filter
      if (selectedStatus !== 'all' && r.status !== selectedStatus) {
        return false;
      }
      // Search query in title, description, address, reporter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.address.toLowerCase().includes(q) ||
          r.district.toLowerCase().includes(q) ||
          r.reporterName.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [reports, selectedCategory, selectedRegion, selectedStatus, searchQuery]);

  const exportCSV = () => {
    const headers = ['ID', 'Judul', 'Kategori', 'Status', 'Wilayah', 'Alamat', 'Pelapor', 'Tanggal'];
    const rows = filteredReports.map((r) => [
      r.id,
      `"${r.title.replace(/"/g, '""')}"`,
      r.category,
      r.status,
      r.region,
      `"${r.address.replace(/"/g, '""')}"`,
      r.reporterName,
      r.createdAt,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap_laporan_sig_jakarta_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari deskripsi laporan, jalan, kata kunci (misal: banjir kemang, aspal berlubang)..."
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-9 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action buttons (Table/Grid Toggle & CSV Export) */}
          <div className="flex items-center gap-2 self-end lg:self-auto">
            <div className="flex items-center gap-1 p-1 bg-slate-800 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Galeri Foto
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  viewMode === 'table'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tabel Petugas
              </button>
            </div>

            <button
              onClick={exportCSV}
              title="Unduh Rekap CSV untuk Disposisi Dinas"
              className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Ekspor CSV</span>
            </button>
          </div>
        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          {/* Dropdown Kategori */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Dropdown Kategori Laporan
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">Semua Kategori ({reports.length})</option>
              {Object.values(CATEGORIES).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label} ({reports.filter((r) => r.category === cat.id).length})
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown Wilayah */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Dropdown Wilayah / Kota
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => onRegionChange(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              {JAKARTA_REGIONS.map((reg) => (
                <option key={reg} value={reg}>
                  {reg}
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown Status Penanganan */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Status Penanganan Pihak Terkait
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">Semua Status</option>
              {Object.entries(STATUS_META).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count & Clear Filter */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Menampilkan <strong className="text-slate-100 tabular-nums">{filteredReports.length}</strong> laporan
          kejadian warga
        </span>
        {(selectedCategory !== 'all' ||
          selectedRegion !== 'Semua Wilayah' ||
          selectedStatus !== 'all' ||
          searchQuery) && (
          <button
            onClick={() => {
              onCategoryChange('all');
              onRegionChange('Semua Wilayah');
              onStatusChange('all');
              onSearchChange('');
            }}
            className="text-amber-400 hover:underline text-xs"
          >
            Reset Semua Filter
          </button>
        )}
      </div>

      {/* Empty State */}
      {filteredReports.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 mx-auto flex items-center justify-center text-xl">
            🔍
          </div>
          <h4 className="text-base font-semibold text-slate-200">
            Tidak ada laporan yang sesuai kriteria filter
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Coba ubah kata kunci pencarian, ganti dropdown kategori kejadian, atau buat laporan baru.
          </p>
          <button
            onClick={onOpenReportModal}
            className="mt-2 px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition-colors"
          >
            Lapor Kejadian Baru
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredReports.map((report) => {
            const cat = CATEGORIES[report.category] || CATEGORIES.lainnya;
            const statusMeta = STATUS_META[report.status] || STATUS_META.menunggu;

            return (
              <div
                key={report.id}
                onClick={() => onSelectReport(report)}
                className="group bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Photo Container */}
                  <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                    <img
                      src={report.imageUrl}
                      alt={report.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Category Tag */}
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold backdrop-blur-md bg-slate-950/80 text-white border border-white/20">
                      {cat.shortLabel}
                    </div>

                    {/* Status Badge */}
                    <div
                      className={`absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold backdrop-blur-md ${statusMeta.badgeClass}`}
                    >
                      {statusMeta.label}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-mono text-slate-400">{report.id}</span>
                      <span>
                        {new Date(report.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-100 text-sm leading-snug group-hover:text-amber-400 transition-colors line-clamp-2">
                      {report.title}
                    </h4>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {report.description}
                    </p>

                    <div className="text-xs text-slate-400 flex items-center gap-1 truncate pt-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{report.address}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-4 py-3 bg-slate-800/40 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[11px]">
                      <ThumbsUp className="w-3 h-3 text-slate-400" />
                      <span className="tabular-nums font-semibold">{report.upvotes || 0}</span>
                    </span>

                    {report.officerUpdates?.length > 0 && (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                        <ShieldCheck className="w-3 h-3" />
                        <span className="tabular-nums">{report.officerUpdates.length} Tindak Lanjut</span>
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onFlyToMap(report);
                    }}
                    className="text-amber-400 hover:text-amber-300 font-semibold text-xs flex items-center gap-0.5"
                  >
                    <span>Fokus Peta</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* High-density Table for Officers */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 border-b border-slate-700/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">ID / Tanggal</th>
                  <th className="py-3 px-4">Kategori & Judul</th>
                  <th className="py-3 px-4">Lokasi / Wilayah</th>
                  <th className="py-3 px-4">Status Penanganan</th>
                  <th className="py-3 px-4">Instansi Terkait</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredReports.map((report) => {
                  const cat = CATEGORIES[report.category] || CATEGORIES.lainnya;
                  const statusMeta = STATUS_META[report.status] || STATUS_META.menunggu;

                  return (
                    <tr
                      key={report.id}
                      onClick={() => onSelectReport(report)}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono text-slate-300 block">{report.id}</span>
                        <span className="text-[11px] text-slate-500">
                          {new Date(report.createdAt).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="text-[11px] font-semibold text-slate-300">
                            {cat.shortLabel}
                          </span>
                        </div>
                        <div className="font-medium text-slate-100 truncate">{report.title}</div>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="text-slate-200 truncate">{report.address}</div>
                        <div className="text-[11px] text-slate-400">{report.region}</div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${statusMeta.badgeClass}`}
                        >
                          {statusMeta.label}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                        {report.assignedAgency}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onFlyToMap(report);
                          }}
                          className="px-2.5 py-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 rounded text-xs font-semibold"
                        >
                          Peta
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
