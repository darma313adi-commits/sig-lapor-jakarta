import { CivicReport, ReportCategory, ReportStatus, UrgencyLevel } from '../types';
import { INITIAL_REPORTS } from '../data/mockReports';
import { db } from '../lib/firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  getDocFromServer,
} from 'firebase/firestore';

const LOCAL_STORAGE_KEY = 'sig_jakarta_central_db_v2';
const COLLECTION_NAME = 'reports';

// Real-time listener callback type
export type ReportsSubscriber = (reports: CivicReport[]) => void;

// Seed initial reports to Firestore if empty
async function seedInitialReportsIfEmpty() {
  try {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    if (snap.empty) {
      console.log('Seeding initial reports to Firebase Firestore...');
      for (const rep of INITIAL_REPORTS) {
        await setDoc(doc(db, COLLECTION_NAME, rep.id), rep);
      }
    }
  } catch (err) {
    console.warn('Initial seeding note:', err);
  }
}

// Initial connection test
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, COLLECTION_NAME, 'health_check_probe'));
    return true;
  } catch (err: any) {
    if (err?.code === 'not-found' || err?.message?.includes('No document to update')) {
      return true;
    }
    console.warn('Firestore probe status:', err?.message || err);
    return false;
  }
}

// Subscribe to real-time updates from Firestore (falls back to local storage)
export function subscribeToReports(onUpdate: ReportsSubscriber): () => void {
  try {
    const q = query(collection(db, COLLECTION_NAME));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: CivicReport[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as CivicReport);
          });
          // Sort newest first
          list.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
          onUpdate(list);
        } else {
          // If Firestore collection is empty, seed it and show initial reports
          seedInitialReportsIfEmpty().then(() => {
            onUpdate(INITIAL_REPORTS);
          });
        }
      },
      (error) => {
        console.warn('Firestore real-time snapshot fallback to local storage:', error.message);
        fetchLocalReports().then(onUpdate);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Failed to attach Firestore snapshot listener:', err);
    fetchLocalReports().then(onUpdate);
    return () => {};
  }
}

// Fetch reports once
export async function fetchReports(): Promise<CivicReport[]> {
  try {
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));
    if (!snapshot.empty) {
      const list: CivicReport[] = [];
      snapshot.forEach((d) => list.push(d.data() as CivicReport));
      list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
      return list;
    } else {
      await seedInitialReportsIfEmpty();
      return INITIAL_REPORTS;
    }
  } catch (err) {
    console.warn('Firestore getDocs fallback to local storage:', err);
    return fetchLocalReports();
  }
}

async function fetchLocalReports(): Promise<CivicReport[]> {
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        // fallback
      }
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_REPORTS));
  }
  return INITIAL_REPORTS;
}

// Submit new civic report
export async function submitReport(reportData: {
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
  urgency: UrgencyLevel;
}): Promise<CivicReport> {
  const payload = {
    ...reportData,
    assignedAgency: getAgencyForCategory(reportData.category),
  };

  const newReport: CivicReport = {
    id: `REP-JKT-${Date.now().toString().slice(-6)}`,
    ...payload,
    status: 'menunggu',
    createdAt: new Date().toISOString(),
    officerUpdates: [],
    upvotes: 1,
  };

  try {
    // Write directly to Firebase Cloud Firestore
    await setDoc(doc(db, COLLECTION_NAME, newReport.id), newReport);
    console.log('Report saved to Firestore:', newReport.id);
  } catch (err) {
    console.warn('Failed to save to Firestore directly, caching locally:', err);
  }

  // Update local cache
  const current = await fetchLocalReports();
  const updated = [newReport, ...current.filter((r) => r.id !== newReport.id)];
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

  return newReport;
}

// Update report status & add officer notes
export async function updateReportStatus(
  reportId: string,
  newStatus: ReportStatus,
  officerName: string,
  agency: string,
  note: string
): Promise<CivicReport | null> {
  const current = await fetchReports();
  const index = current.findIndex((r) => r.id === reportId);
  if (index === -1) return null;

  const report = { ...current[index] };
  report.status = newStatus;
  if (note) {
    report.officerUpdates = [
      ...report.officerUpdates,
      {
        id: `UPD-${Date.now().toString().slice(-4)}`,
        officerName: officerName || 'Petugas Jaga',
        agency: agency || report.assignedAgency,
        note,
        timestamp: new Date().toISOString(),
        status: newStatus,
      },
    ];
  }

  try {
    await updateDoc(doc(db, COLLECTION_NAME, reportId), {
      status: report.status,
      officerUpdates: report.officerUpdates,
    });
  } catch (err) {
    console.warn('Failed to update Firestore, saving local:', err);
  }

  current[index] = report;
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
  }

  return report;
}

export async function resetDatabase(): Promise<boolean> {
  try {
    for (const rep of INITIAL_REPORTS) {
      await setDoc(doc(db, COLLECTION_NAME, rep.id), rep);
    }
  } catch (err) {
    console.warn('Reset in Firestore error:', err);
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_REPORTS));
  }
  return true;
}

export async function upvoteReport(reportId: string): Promise<number> {
  const current = await fetchReports();
  const report = current.find((r) => r.id === reportId);
  if (!report) return 1;

  report.upvotes = (report.upvotes || 0) + 1;

  try {
    await updateDoc(doc(db, COLLECTION_NAME, reportId), {
      upvotes: report.upvotes,
    });
  } catch (err) {
    console.warn('Failed to update upvote in Firestore:', err);
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
  }

  return report.upvotes;
}

export function getAgencyForCategory(category: ReportCategory): string {
  switch (category) {
    case 'jalan_rusak':
      return 'Dinas Bina Marga DKI Jakarta';
    case 'pohon_tumbang':
      return 'Dinas Pertamanan & Hutan Kota DKI';
    case 'banjir':
      return 'BPBD DKI Jakarta & Dinas SDA';
    case 'tawuran':
      return 'Polres Metro & Satpol PP DKI';
    case 'pesta_narkoba':
      return 'Satresnarkoba Polres & BNN DKI';
    default:
      return 'Pemerintah Provinsi DKI Jakarta';
  }
}

// Automatic GPS Location Helper
export interface GPSLocationResult {
  lat: number;
  lng: number;
  accuracy: number;
}

export function getDeviceCoordinates(): Promise<GPSLocationResult> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Perangkat tidak mendukung geolokasi GPS'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        // Fallback default coordinate: Monas Jakarta Pusat
        console.warn('GPS error, using default Jakarta coordinate:', error.message);
        resolve({
          lat: -6.1754,
          lng: 106.8272,
          accuracy: 50,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

// Reverse Geocoding helper with Nominatim + smart regional fallback
export async function reverseGeocodeCoordinates(
  lat: number,
  lng: number
): Promise<{ address: string; district: string; region: string }> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'id',
        },
      }
    );
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const road = addr.road || addr.pedestrian || addr.suburb || 'Jl. Lokasi Pelaporan';
      const district = addr.suburb || addr.city_district || addr.neighbourhood || 'Kecamatan Setempat';
      const city = addr.city || addr.county || addr.state || 'DKI Jakarta';

      return {
        address: `${road}, ${district}`,
        district: district,
        region: determineJakartaRegion(lat, lng, city),
      };
    }
  } catch (err) {
    console.warn('Reverse geocode failed, using spatial approximation', err);
  }

  // Spatial approximation based on coordinates
  return approximateJakartaLocation(lat, lng);
}

function determineJakartaRegion(lat: number, lng: number, cityText: string): string {
  if (cityText.includes('Bogor')) return 'Kota/Kab. Bogor';
  if (cityText.includes('Depok')) return 'Kota Depok';
  if (cityText.includes('Bekasi')) return 'Kota Bekasi';
  if (cityText.includes('Tangerang')) return 'Kota Tangerang';
  if (cityText.includes('Selatan')) return 'Jakarta Selatan';
  if (cityText.includes('Barat')) return 'Jakarta Barat';
  if (cityText.includes('Timur')) return 'Jakarta Timur';
  if (cityText.includes('Utara')) return 'Jakarta Utara';
  if (cityText.includes('Pusat')) return 'Jakarta Pusat';

  return approximateJakartaLocation(lat, lng).region;
}

function approximateJakartaLocation(lat: number, lng: number) {
  if (lat > -6.15) {
    return {
      address: `Jl. Pelabuhan & Kawasan Pesisir (Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)})`,
      district: 'Tanjung Priok / Penjaringan',
      region: 'Jakarta Utara',
    };
  } else if (lat < -6.32) {
    return {
      address: `Jl. Raya Utama Penyangga (Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)})`,
      district: 'Perbatasan Bodetabek',
      region: 'Kota Depok',
    };
  } else if (lng < 106.77) {
    return {
      address: `Jl. Arteri Barat (Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)})`,
      district: 'Kebon Jeruk / Cengkareng',
      region: 'Jakarta Barat',
    };
  } else if (lng > 106.88) {
    return {
      address: `Jl. Koridor Timur (Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)})`,
      district: 'Jatinegara / Cakung',
      region: 'Jakarta Timur',
    };
  } else if (lat < -6.23) {
    return {
      address: `Jl. Koridor Selatan (Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)})`,
      district: 'Kebayoran Baru / Cilandak',
      region: 'Jakarta Selatan',
    };
  } else {
    return {
      address: `Jl. Medan Merdeka & Sekitarnya (Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)})`,
      district: 'Gambir / Menteng',
      region: 'Jakarta Pusat',
    };
  }
}
