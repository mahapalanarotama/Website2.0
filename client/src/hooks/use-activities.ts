import { useQuery } from "@tanstack/react-query";
import { Activity } from "@shared/schema";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, limit, orderBy, DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

// Convert Firestore document to Activity type
const convertToActivity = (doc: QueryDocumentSnapshot<DocumentData>): Activity => {
  const data = doc.data();
  return {
    id: parseInt(doc.id, 10) || Math.floor(Math.random() * 1000), // Fallback to random ID if parse fails
    title: data.title || "",
    description: data.description || "",
    date: data.date?.toDate() || new Date(),
    imageUrl: data.imageUrl || "",
    category: data.category || "Umum",
  };
};

// Function to fetch all activities
export const fetchActivities = async (): Promise<Activity[]> => {
  try {
    const activitiesRef = collection(db, "activities");
    const q = query(activitiesRef, orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log("No activities found");
      return [];
    }
    
    return snapshot.docs.map(convertToActivity);
  } catch (error) {
    console.error("Error fetching activities:", error);
    throw error;
  }
};

// Function to fetch activities with limit
export const fetchLimitedActivities = async (count: number): Promise<Activity[]> => {
  try {
    const activitiesRef = collection(db, "activities");
    const q = query(activitiesRef, orderBy("date", "desc"), limit(count));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(convertToActivity);
  } catch (error) {
    console.error("Error fetching limited activities:", error);
    throw error;
  }
};

// Function to fetch activities by category
export const fetchActivitiesByCategory = async (category: string): Promise<Activity[]> => {
  try {
    const activitiesRef = collection(db, "activities");
    const q = query(
      activitiesRef, 
      where("category", "==", category),
      orderBy("date", "desc")
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(convertToActivity);
  } catch (error) {
    console.error("Error fetching activities by category:", error);
    throw error;
  }
};

// React Query hooks for activities
export const useActivities = (limitCount?: number) => {
  return useQuery({
    queryKey: ['activities', limitCount],
    queryFn: () => limitCount ? fetchLimitedActivities(limitCount) : fetchActivities()
  });
};

export const useActivitiesByCategory = (category: string) => {
  return useQuery({
    queryKey: ['activities', 'category', category],
    queryFn: () => fetchActivitiesByCategory(category),
    // Only run the query if there's a category
    enabled: !!category
  });
};
