export type ReportCategory =
  | 'jalan_rusak'
  | 'pohon_tumbang'
  | 'banjir'
  | 'tawuran'
  | 'pesta_narkoba'
  | 'lainnya';

export type ReportStatus =
  | 'menunggu'
  | 'diteruskan'
  | 'diproses'
  | 'selesai'
  | 'ditolak';

export type UrgencyLevel = 'tinggi' | 'sedang' | 'rendah';

export interface OfficerUpdate {
  id: string;
  officerName: string;
  agency: string;
  note: string;
  timestamp: string;
  status: ReportStatus;
}

export interface CivicReport {
  id: string;
  title: string;
  category: ReportCategory;
  description: string;
  reporterName: string;
  reporterContact?: string;
  lat: number;
  lng: number;
  address: string;
  district: string;
  region: string;
  imageUrl: string;
  status: ReportStatus;
  urgency: UrgencyLevel;
  assignedAgency: string;
  createdAt: string;
  officerUpdates: OfficerUpdate[];
  upvotes: number;
}

export interface CategoryMeta {
  id: ReportCategory;
  label: string;
  shortLabel: string;
  iconName: string;
  color: string;
  badgeBg: string;
  textColor: string;
  markerColor: string;
  defaultAgency: string;
}

export interface RegionShortcut {
  name: string;
  lat: number;
  lng: number;
  zoom: number;
}
