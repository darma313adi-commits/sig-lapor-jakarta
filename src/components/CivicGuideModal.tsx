import { X, PhoneCall, ShieldAlert, CheckCircle, MapPin, Camera } from 'lucide-react';

interface CivicGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartReport: () => void;
}

export default function CivicGuideModal({
  isOpen,
  onClose,
  onStartReport,
}: CivicGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <h3 className="text-base font-bold text-slate-100">
              Panduan Pelaporan Warga SIG Jakarta
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs text-slate-300 max-h-[75vh] overflow-y-auto">
          {/* Steps */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Langkah Cepat Pelaporan
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">
                  1
                </div>
                <div className="font-semibold text-slate-100">Pilih Kategori</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Pilih kejadian: Jalan rusak, pohon tumbang, banjir, tawuran, atau pesta narkoba.
                </p>
              </div>

              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">
                  2
                </div>
                <div className="font-semibold text-slate-100">Deteksi GPS & Foto</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Lokasi otomatis terdeteksi via GPS perangkat, lengkapi foto dan deskripsi jelas.
                </p>
              </div>

              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">
                  3
                </div>
                <div className="font-semibold text-slate-100">Pantau Penanganan</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Laporan masuk ke database pusat dan instansi terkait (Dinas SDA, Bina Marga, Polres).
                </p>
              </div>
            </div>
          </div>

          {/* Emergency Hotlines */}
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/70 space-y-2">
            <h4 className="font-bold text-slate-100 flex items-center gap-1.5 text-xs">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              Kontak Darurat Resmi DKI Jakarta
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="bg-slate-900/80 p-2 rounded-lg text-center border border-slate-700/50">
                <span className="block font-bold text-amber-400 text-sm font-mono">112</span>
                <span className="text-[10px] text-slate-400">Jakarta Siaga</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg text-center border border-slate-700/50">
                <span className="block font-bold text-blue-400 text-sm font-mono">110</span>
                <span className="text-[10px] text-slate-400">Polri / Tawuran</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg text-center border border-slate-700/50">
                <span className="block font-bold text-red-400 text-sm font-mono">113</span>
                <span className="text-[10px] text-slate-400">Damkar & Rescue</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg text-center border border-slate-700/50">
                <span className="block font-bold text-emerald-400 text-sm font-mono">119</span>
                <span className="text-[10px] text-slate-400">Ambulans Gawat</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors"
            >
              Tutup
            </button>
            <button
              onClick={() => {
                onClose();
                onStartReport();
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-colors"
            >
              Mulai Buat Laporan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
