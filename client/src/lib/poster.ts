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
    };
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
