import { useState, useEffect } from 'react';
import { ReportCategory, UrgencyLevel } from '../types';
import { CATEGORIES, JAKARTA_REGIONS } from '../data/categories';
import {
  getDeviceCoordinates,
  reverseGeocodeCoordinates,
  submitReport,
} from '../services/reportService';
import {
  AlertCircle,
  Camera,
  Check,
  Crosshair,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Upload,
  X,
  Sparkles,
} from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportCreated: (newReport: any) => void;
  pickedCoords?: { lat: number; lng: number } | null;
  onEnablePickMode?: () => void;
}

// Preset realistic photos for testing
const SAMPLE_PHOTOS: Record<ReportCategory, string> = {
  banjir: '/src/assets/images/flood_jakarta_street_1793021561603.jpg',
  jalan_rusak: '/src/assets/images/pothole_damaged_road_jakarta_1793021562269.jpg',
  pohon_tumbang: '/src/assets/images/fallen_tree_roadblock_jakarta_1793021562768.jpg',
  tawuran: '/src/assets/images/tawuran_police_patrol_jakarta_1793021561829.jpg',
  pesta_narkoba: '/src/assets/images/tawuran_police_patrol_jakarta_1793021561829.jpg',
  lainnya: '/src/assets/images/pothole_damaged_road_jakarta_1793021562269.jpg',
};

export default function ReportModal({
  isOpen,
  onClose,
  onReportCreated,
  pickedCoords,
  onEnablePickMode,
}: ReportModalProps) {
  const [category, setCategory] = useState<ReportCategory>('jalan_rusak');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterContact, setReporterContact] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('sedang');
  const [region, setRegion] = useState('Jakarta Pusat');
  const [district, setDistrict] = useState('Menteng');
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: -6.1754,
    lng: 106.8272,
  });

  const [imageUrl, setImageUrl] = useState<string>(SAMPLE_PHOTOS.jalan_rusak);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Auto trigger GPS on initial open
  useEffect(() => {
    if (isOpen) {
      handleTrackGPS();
    }
  }, [isOpen]);

  // Update image when category changes if user hasn't uploaded custom photo
  useEffect(() => {
    if (SAMPLE_PHOTOS[category]) {
      setImageUrl(SAMPLE_PHOTOS[category]);
    }
  }, [category]);

  // Sync coords from map picker
  useEffect(() => {
    if (pickedCoords) {
      setCoords(pickedCoords);
      handleReverseGeocode(pickedCoords.lat, pickedCoords.lng);
    }
  }, [pickedCoords]);

  const handleTrackGPS = async () => {
    setIsLocating(true);
    setGpsStatus('Melacak koordinat GPS perangkat...');
    try {
      const pos = await getDeviceCoordinates();
      setCoords({ lat: pos.lat, lng: pos.lng });
      setGpsStatus(`GPS Terkunci (Akurasi: ±${Math.round(pos.accuracy)}m)`);
      await handleReverseGeocode(pos.lat, pos.lng);
    } catch (err: any) {
      setGpsStatus('GPS tidak aktif, menggunakan koordinat default DKI Jakarta');
    } finally {
      setIsLocating(false);
    }
  };

  const handleReverseGeocode = async (lat: number, lng: number) => {
    const geo = await reverseGeocodeCoordinates(lat, lng);
    setAddress(geo.address);
    setDistrict(geo.district);
    setRegion(geo.region);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setErrorMsg('Ukuran file maksimal 8MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!description.trim()) {
      setErrorMsg('Kolom deskripsi kejadian wajib diisi agar petugas dapat memproses laporan');
      return;
    }

    if (!address.trim()) {
      setErrorMsg('Harap lengkapi alamat atau patokan lokasi');
      return;
    }

    setIsSubmitting(true);
    try {
      const generatedTitle =
        title.trim() ||
        `${CATEGORIES[category].label} di ${district || region || 'Jakarta'}`;

      const newReport = await submitReport({
        title: generatedTitle,
        category,
        description,
        reporterName: reporterName.trim() || 'Warga Anonim',
        reporterContact: reporterContact.trim() || undefined,
        lat: coords.lat,
        lng: coords.lng,
        address,
        district,
        region,
        imageUrl,
        urgency,
      });

      setSuccessMsg('Laporan berhasil dikirim dan tersimpan di Database Pusat SIG Jakarta!');
      setTimeout(() => {
        onReportCreated(newReport);
        onClose();
        resetForm();
      }, 1000);
    } catch (err: any) {
      setErrorMsg('Gagal mengirim laporan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setReporterName('');
    setReporterContact('');
    setSuccessMsg('');
    setErrorMsg('');
  };

  if (!isOpen) return null;

  const currentCat = CATEGORIES[category];

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              Laporan Kejadian Masyarakat
            </h3>
            <p className="text-xs text-slate-400">
              Sampaikan pengaduan real-time wilayah DKI Jakarta & sekitarnya ke instansi terkait
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1. Kategori Kejadian (Dropdown & Cards) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Kategori Kejadian <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ReportCategory)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500 appearance-none cursor-pointer"
              >
                {Object.values(CATEGORIES).map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-slate-900 text-slate-100">
                    {cat.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                ▼
              </div>
            </div>
            <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1.5">
              <span>Instansi Pelaksana:</span>
              <span className="font-medium text-amber-400">{currentCat.defaultAgency}</span>
            </div>
          </div>

          {/* 2. Deskripsi Kejadian (Wajib) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Deskripsi Detail Kejadian <span className="text-red-400">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan kondisi di lokasi (contoh: jalan berlubang besar sedalam 15cm, genangan air setinggi 40cm menutup 2 lajur, kerumunan bawa sajam, dll)..."
              rows={3}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 resize-none"
            />
            <div className="text-[11px] text-slate-400 mt-1">
              Informasi yang jelas membantu petugas mempercepat mobilisasi personel di lapangan.
            </div>
          </div>

          {/* 3. Lokasi & Integrasi GPS Otomatis */}
          <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-400" />
                Lokasi & Pelacakan GPS Otomatis
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTrackGPS}
                  disabled={isLocating}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg transition-colors flex items-center gap-1"
                >
                  {isLocating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  ) : (
                    <Crosshair className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>{isLocating ? 'Melacak...' : 'Lacak GPS'}</span>
                </button>

                {onEnablePickMode && (
                  <button
                    type="button"
                    onClick={() => {
                      onEnablePickMode();
                      onClose();
                    }}
                    className="px-2.5 py-1 text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 rounded-lg transition-colors"
                  >
                    Pilih di Peta
                  </button>
                )}
              </div>
            </div>

            {gpsStatus && (
              <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                <span>📡</span>
                <span>{gpsStatus}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Wilayah / Kota</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  {JAKARTA_REGIONS.filter((r) => r !== 'Semua Wilayah').map((reg) => (
                    <option key={reg} value={reg}>
                      {reg}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Kecamatan / Kelurahan</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Misal: Menteng, Kebayoran Baru"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Alamat / Patokan Jalan <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Jl. Kemang Raya No. 12 (Dekat Indomaret / Depan Masjid)"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="text-[11px] text-slate-500 font-mono">
              Koordinat Terkunci: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
            </div>
          </div>

          {/* 4. Unggah Foto Bukti Kejadian */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Unggah Foto Kejadian
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <div className="sm:col-span-2">
                <label className="border-2 border-dashed border-slate-700 hover:border-amber-500 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-800/40">
                  <Upload className="w-5 h-5 text-amber-400 mb-1" />
                  <span className="text-xs text-slate-300 font-medium">
                    Ambil Foto / Pilih File dari Perangkat
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">JPG, PNG atau WEBP (Maks 8MB)</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Photo Preview */}
              <div className="relative h-24 rounded-xl overflow-hidden bg-slate-800 border border-slate-700">
                <img
                  src={imageUrl}
                  alt="Preview Bukti Laporan"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 right-1 bg-slate-900/80 px-1.5 py-0.5 rounded text-[9px] text-slate-300">
                  Preview Foto
                </span>
              </div>
            </div>
          </div>

          {/* 5. Identitas Pelapor (Opsional / Anonim) & Tingkat Urgensi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Nama Pelapor (Boleh Anonim)
              </label>
              <input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="Kosongkan jika ingin anonim"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Tingkat Urgensi</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              >
                <option value="tinggi">🚨 Sangat Mendesak / Bahaya Langsung</option>
                <option value="sedang">⚠️ Sedang / Perlu Penanganan Segera</option>
                <option value="rendah">ℹ️ Rendah / Pemantauan Berkala</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-700 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan ke Database Pusat...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Kirim Laporan ke Database Pusat SIG</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
