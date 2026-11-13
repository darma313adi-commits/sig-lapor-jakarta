import { CategoryMeta, ReportCategory, ReportStatus } from '../types';

export const CATEGORIES: Record<ReportCategory, CategoryMeta> = {
  jalan_rusak: {
    id: 'jalan_rusak',
    label: 'Jalan Rusak & Berlubang',
    shortLabel: 'Jalan Rusak',
    iconName: 'AlertTriangle',
    color: '#f59e0b', // amber-500
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    textColor: 'text-amber-400',
    markerColor: '#f59e0b',
    defaultAgency: 'Dinas Bina Marga DKI Jakarta',
  },
  pohon_tumbang: {
    id: 'pohon_tumbang',
    label: 'Pohon Tumbang / Rawan Roboh',
    shortLabel: 'Pohon Tumbang',
    iconName: 'Trees',
    color: '#10b981', // emerald-500
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    textColor: 'text-emerald-400',
    markerColor: '#10b981',
    defaultAgency: 'Dinas Pertamanan & Hutan Kota DKI',
  },
  banjir: {
    id: 'banjir',
    label: 'Banjir & Genangan Air',
    shortLabel: 'Banjir',
    iconName: 'Waves',
    color: '#06b6d4', // cyan-500
    badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    textColor: 'text-cyan-400',
    markerColor: '#06b6d4',
    defaultAgency: 'BPBD DKI Jakarta & Dinas SDA',
  },
  tawuran: {
    id: 'tawuran',
    label: 'Tawuran & Gangguan Keamanan',
    shortLabel: 'Tawuran',
    iconName: 'ShieldAlert',
    color: '#ef4444', // red-500
    badgeBg: 'bg-red-500/10 text-red-400 border-red-500/30',
    textColor: 'text-red-400',
    markerColor: '#ef4444',
    defaultAgency: 'Polres Metro & Satpol PP DKI',
  },
  pesta_narkoba: {
    id: 'pesta_narkoba',
    label: 'Pesta Narkoba & Penyalahgunaan Zat',
    shortLabel: 'Pesta Narkoba',
    iconName: 'Skull',
    color: '#a855f7', // purple-500
    badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    textColor: 'text-purple-400',
    markerColor: '#a855f7',
    defaultAgency: 'Satresnarkoba Polres & BNN DKI',
  },
  lainnya: {
    id: 'lainnya',
    label: 'Darurat & Fasilitas Publik Lainnya',
    shortLabel: 'Lainnya',
    iconName: 'HelpCircle',
    color: '#94a3b8', // slate-400
    badgeBg: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
    textColor: 'text-slate-300',
    markerColor: '#94a3b8',
    defaultAgency: 'Pemerintah Kota / Kecamatan Terkait',
  },
};

export const STATUS_META: Record<
  ReportStatus,
  { label: string; color: string; badgeClass: string; dotClass: string }
> = {
  menunggu: {
    label: 'Menunggu Verifikasi',
    color: '#f59e0b',
    badgeClass: 'text-amber-400 border border-amber-500/30 bg-amber-500/10',
    dotClass: 'bg-amber-400',
  },
  diteruskan: {
    label: 'Diteruskan ke Instansi',
    color: '#3b82f6',
    badgeClass: 'text-blue-400 border border-blue-500/30 bg-blue-500/10',
    dotClass: 'bg-blue-400',
  },
  diproses: {
    label: 'Sedang Ditangani',
    color: '#8b5cf6',
    badgeClass: 'text-purple-400 border border-purple-500/30 bg-purple-500/10',
    dotClass: 'bg-purple-400',
  },
  selesai: {
    label: 'Selesai / Teratasi',
    color: '#10b981',
    badgeClass: 'text-emerald-400 border border-emerald-500/30 bg-emerald-500/10',
    dotClass: 'bg-emerald-400',
  },
  ditolak: {
    label: 'Laporan Tidak Valid',
    color: '#ef4444',
    badgeClass: 'text-red-400 border border-red-500/30 bg-red-500/10',
    dotClass: 'bg-red-400',
  },
};

export const JAKARTA_REGIONS = [
  'Semua Wilayah',
  'Jakarta Pusat',
  'Jakarta Selatan',
  'Jakarta Timur',
  'Jakarta Barat',
  'Jakarta Utara',
  'Kepulauan Seribu',
  'Kota Depok',
  'Kota Bekasi',
  'Kota Tangerang',
  'Tangerang Selatan',
  'Kota/Kab. Bogor',
];

export const REGION_SHORTCUTS = [
  { name: 'Seluruh Jabodetabek', lat: -6.22, lng: 106.84, zoom: 11 },
  { name: 'DKI Jakarta (Pusat)', lat: -6.1754, lng: 106.8272, zoom: 13 },
  { name: 'Jakarta Selatan', lat: -6.2615, lng: 106.8106, zoom: 13 },
  { name: 'Jakarta Timur', lat: -6.2250, lng: 106.9004, zoom: 13 },
  { name: 'Jakarta Barat', lat: -6.1683, lng: 106.7588, zoom: 13 },
  { name: 'Jakarta Utara', lat: -6.1384, lng: 106.8640, zoom: 13 },
  { name: 'Kota Depok', lat: -6.4025, lng: 106.7942, zoom: 12 },
  { name: 'Kota Bekasi', lat: -6.2383, lng: 106.9756, zoom: 12 },
  { name: 'Tangerang', lat: -6.1783, lng: 106.6319, zoom: 12 },
  { name: 'Kota Bogor', lat: -6.5971, lng: 106.8060, zoom: 12 },
];
