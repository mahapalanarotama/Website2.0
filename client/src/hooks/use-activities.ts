import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/firebase";
import { collection, getDocs, DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import type { Activity } from "@/types/schema";

const convertToActivity = (doc: QueryDocumentSnapshot<DocumentData>): Activity => {
  const data = doc.data();
  return {
    id: doc.id,
    title: data.title || "",
    description: data.description || "",
    date: data.date ? (typeof data.date === 'string' ? data.date : data.date?.toDate?.() ?? "") : "",
    imageUrl: data.imageUrl || "",
    category: data.category || "",
    // Tambahkan field lain jika ada di schema
  };
};

export const fetchActivities = async (count?: number): Promise<Activity[]> => {
  const activitiesRef = collection(db, "activities");
  const snapshot = await getDocs(activitiesRef);
  let docs = snapshot.docs
    .filter(doc => {
      const data = doc.data();
      return !('deletedAt' in data) || data.deletedAt === null;
    });
  // Sort by date descending
  docs = docs.sort((a, b) => {
    const dateA = a.data().date ? new Date(a.data().date).getTime() : 0;
    const dateB = b.data().date ? new Date(b.data().date).getTime() : 0;
    return dateB - dateA;
  });
  if (count) docs = docs.slice(0, count);
  return docs.map(convertToActivity);
};

export const useActivities = (limitCount?: number) => {
  return useQuery({
    queryKey: ["activities", limitCount],
    queryFn: () => fetchActivities(limitCount),
  });
};
