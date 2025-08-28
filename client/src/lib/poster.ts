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
  isFirst?: boolean; // for marking the first poster
}

export async function getPosters(): Promise<PosterConfig[]> {
  const snapshot = await getDocs(collection(db, "posters"));
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      imageUrl: data.imageUrl,
      startTime: data.startTime,
      endTime: data.endTime,
      linkUrl: data.linkUrl || undefined,
      order: data.order ?? 0,
      isFirst: data.isFirst ?? false,
    };
  }).sort((a, b) => {
    // Sort by isFirst first, then by order
    if (a.isFirst && !b.isFirst) return -1;
    if (!a.isFirst && b.isFirst) return 1;
    return (a.order ?? 0) - (b.order ?? 0);
  });
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
