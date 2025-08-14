import { getFirestore, collection, addDoc, setDoc, doc, serverTimestamp } from "firebase/firestore";
import { getApp } from "firebase/app";

interface GpsTrackerData {
  nama: string;
  [key: string]: any;
}

export async function saveGpsTrackerToFirestore(data: GpsTrackerData) {
  const db = getFirestore(getApp());
  // Simpan ke gps_tracker (hanya posisi terakhir per user)
  await setDoc(doc(db, "gps_tracker", data.nama), {
    ...data,
    updatedAt: serverTimestamp(),
  });
  // Simpan ke gps_history (riwayat semua posisi)
  await addDoc(collection(db, "gps_history"), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function syncOfflineGpsToFirestore() {
  const saved = localStorage.getItem("gps_track");
  if (!saved) return;
  const arr = JSON.parse(saved);
  for (const data of arr) {
    try {
      await saveGpsTrackerToFirestore(data);
    } catch {}
  }
  // Kosongkan localStorage setelah sync
  localStorage.removeItem("gps_track");
}
