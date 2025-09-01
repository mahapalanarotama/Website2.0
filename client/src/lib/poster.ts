import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";

export interface PosterConfig {
  id?: string;
  imageUrl: string;
  startTime: Timestamp;
  endTime: Timestamp;
  linkUrl?: string;
  order?: number; // for drag-and-drop ordering
  // isFirst dihapus
  githubPath?: string; // path gambar di GitHub
}

export async function getPosters(): Promise<PosterConfig[]> {
  const snapshot = await getDocs(collection(db, "posters"));
  const posters = snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      imageUrl: data.imageUrl,
      startTime: data.startTime,
      endTime: data.endTime,
      linkUrl: data.linkUrl || undefined,
      order: data.order ?? 0,
      isFirst: data.isFirst ?? false,
      githubPath: data.githubPath || undefined,
    };
  });
  // Jika ada poster utama (isFirst) dan order=0, tampilkan di depan. Jika tidak, urutkan semua poster hanya berdasarkan order ascending
  // Balik urutan: urutan pertama tampil terakhir (paling depan)
  // Urutkan poster lain (selain utama) dari order ascending lalu reverse
  // Urutkan poster non-utama (reverse)
  // Urutkan poster berdasarkan order ascending (order=0 paling depan)
  return [...posters].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function addPoster(poster: Omit<PosterConfig, "id">) {
  return await addDoc(collection(db, "posters"), poster);
}

export async function updatePoster(id: string, poster: Partial<PosterConfig>) {
  return await updateDoc(doc(db, "posters", id), poster);
}

export async function deletePoster(id: string) {
  return await deleteDoc(doc(db, "posters", id));
}
