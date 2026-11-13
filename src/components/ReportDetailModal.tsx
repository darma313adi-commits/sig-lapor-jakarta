import { useState } from 'react';
import { CivicReport, ReportStatus } from '../types';
import { CATEGORIES, STATUS_META } from '../data/categories';
import { updateReportStatus, upvoteReport } from '../services/reportService';
import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  Send,
  ShieldCheck,
  ThumbsUp,
  User,
  X,
  Plus,
} from 'lucide-react';

interface ReportDetailModalProps {
  report: CivicReport | null;
  onClose: () => void;
  onReportUpdated: (updated: CivicReport) => void;
  onFlyToMap?: (report: CivicReport) => void;
}

export default function ReportDetailModal({
  report,
  onClose,
  onReportUpdated,
  onFlyToMap,
}: ReportDetailModalProps) {
  if (!report) return null;

  const [newStatus, setNewStatus] = useState<ReportStatus>(report.status);
  const [officerName, setOfficerName] = useState('Petugas Satgas');
  const [officerAgency, setOfficerAgency] = useState(report.assignedAgency);
  const [officerNote, setOfficerNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [upvotes, setUpvotes] = useState(report.upvotes || 0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [showOfficerPanel, setShowOfficerPanel] = useState(false);

  const cat = CATEGORIES[report.category] || CATEGORIES.lainnya;
  const statusMeta = STATUS_META[report.status] || STATUS_META.menunggu;

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!officerNote.trim()) return;

    setIsUpdating(true);
    try {
      const updated = await updateReportStatus(
        report.id,
        newStatus,
        officerName,
        officerAgency,
        officerNote
      );
      if (updated) {
        onReportUpdated(updated);
        setOfficerNote('');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpvote = async () => {
    if (hasUpvoted) return;
    setHasUpvoted(true);
    setUpvotes((prev) => prev + 1);
    await upvoteReport(report.id);
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: cat.color }}
            />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              {report.id}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs font-semibold text-amber-400">{cat.label}</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Main Title & Status Badge */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-100 leading-snug">{report.title}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  {report.address}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {new Date(report.createdAt).toLocaleString('id-ID', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
            </div>

            <div className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 ${statusMeta.badgeClass}`}>
              {statusMeta.label}
            </div>
          </div>

          {/* Photo & Geographic Info Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* High-res Image */}
            <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video md:aspect-auto md:h-64">
              <img
                src={report.imageUrl}
                alt={report.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-semibold text-white border border-white/20">
                Dokumentasi Warga
              </div>
            </div>

            {/* Incident Details Card */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/60 flex flex-col justify-between space-y-3">
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Deskripsi Kejadian
                  </h4>
                  <p className="text-sm text-slate-200 leading-relaxed">{report.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-700/60 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Pelapor:</span>
                    <span className="font-medium text-slate-200">{report.reporterName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Instansi Penanggung Jawab:</span>
                    <span className="font-medium text-amber-400">{report.assignedAgency}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Wilayah:</span>
                    <span className="font-medium text-slate-200">
                      {report.region} ({report.district})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Koordinat SIG:</span>
                    <span className="font-mono text-slate-300">
                      {report.lat.toFixed(4)}, {report.lng.toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-700/60 flex items-center gap-2">
                <button
                  onClick={handleUpvote}
                  disabled={hasUpvoted}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                    hasUpvoted
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{hasUpvoted ? 'Terkonfirmasi' : 'Dukung Laporan'} ({upvotes})</span>
                </button>

                {onFlyToMap && (
                  <button
                    onClick={() => {
                      onFlyToMap(report);
                      onClose();
                    }}
                    className="py-2 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Fokus di Peta</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Section: Status Penanganan Pihak Terkait (Timeline) */}
          <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/60 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Status Penanganan Pihak Terkait (Log Resmi)
              </h3>

              <button
                type="button"
                onClick={() => setShowOfficerPanel(!showOfficerPanel)}
                className="text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
              >
                <span>{showOfficerPanel ? 'Tutup Panel Petugas' : '+ Perbarui Status Petugas'}</span>
              </button>
            </div>

            {/* Officer Action Form (Collapsible) */}
            {showOfficerPanel && (
              <form
                onSubmit={handleStatusUpdate}
                className="p-3.5 bg-slate-900/90 rounded-xl border border-amber-500/30 space-y-3"
              >
                <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  Panel Pembaruan Penanganan Instansi
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Status Baru</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as ReportStatus)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    >
                      <option value="menunggu">Menunggu Verifikasi</option>
                      <option value="diteruskan">Diteruskan ke Instansi</option>
                      <option value="diproses">Sedang Ditangani / Dikerjakan</option>
                      <option value="selesai">Selesai / Teratasi</option>
                      <option value="ditolak">Tidak Valid / Ditolak</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Nama Petugas / NRP</label>
                    <input
                      type="text"
                      value={officerName}
                      onChange={(e) => setOfficerName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Instansi / Satuan</label>
                    <input
                      type="text"
                      value={officerAgency}
                      onChange={(e) => setOfficerAgency(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Catatan Tindak Lanjut & Tindakan Lapangan <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={officerNote}
                    onChange={(e) => setOfficerNote(e.target.value)}
                    placeholder="Contoh: Tim Satgas Suku Dinas telah mengerahkan 1 unit truk dan pompa sedot. Penanganan berlangsung..."
                    rows={2}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="py-1.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isUpdating ? 'Menyimpan...' : 'Kirim Pembaruan Resmi'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Timeline updates */}
            {report.officerUpdates && report.officerUpdates.length > 0 ? (
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-700">
                {report.officerUpdates.map((update, idx) => (
                  <div key={update.id || idx} className="relative group">
                    <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-4 ring-slate-900" />
                    <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700/80 space-y-1">
                      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                        <span className="font-semibold text-slate-200">
                          {update.officerName} ({update.agency})
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(update.timestamp).toLocaleString('id-ID', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{update.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-slate-400 bg-slate-900/40 rounded-lg border border-slate-800">
                Belum ada catatan tindak lanjut dari petugas. Laporan berada dalam antrean penanganan instansi.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
