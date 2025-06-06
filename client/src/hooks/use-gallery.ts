import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  activityId?: string | null;
  createdAt?: any;
  updatedAt?: any;
}

const convertToGalleryItem = (doc: QueryDocumentSnapshot<DocumentData>): GalleryItem => {
  const data = doc.data();
  return {
    id: doc.id,
    title: data.title || "",
    description: data.description || "",
    imageUrl: data.imageUrl || "",
    activityId: data.activityId || null,
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null,
  };
};

export const fetchGallery = async (): Promise<GalleryItem[]> => {
  const galleryRef = collection(db, "gallery");
  const q = query(galleryRef, where("deletedAt", "==", null));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(convertToGalleryItem);
};

export const useGallery = () => {
  return useQuery({
    queryKey: ["gallery"],
    queryFn: fetchGallery,
  });
};
