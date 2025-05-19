import { useQuery } from "@tanstack/react-query";
import { LearningModule } from "@shared/schema";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, limit, DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

// Convert Firestore document to LearningModule type
const convertToLearningModule = (doc: QueryDocumentSnapshot<DocumentData>): LearningModule => {
  const data = doc.data();
  return {
    id: parseInt(doc.id, 10) || Math.floor(Math.random() * 1000), // Fallback to random ID if parse fails
    title: data.title || "",
    description: data.description || "",
    icon: data.icon || "compass",
    link: data.link || "#",
  };
};

// Function to fetch all learning modules
export const fetchLearningModules = async (): Promise<LearningModule[]> => {
  try {
    const modulesRef = collection(db, "learningModules");
    const snapshot = await getDocs(modulesRef);
    
    if (snapshot.empty) {
      console.log("No learning modules found");
      return [];
    }
    
    return snapshot.docs.map(convertToLearningModule);
  } catch (error) {
    console.error("Error fetching learning modules:", error);
    throw error;
  }
};

// Function to fetch learning modules with limit
export const fetchLimitedLearningModules = async (count: number): Promise<LearningModule[]> => {
  try {
    const modulesRef = collection(db, "learningModules");
    const q = query(modulesRef, limit(count));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(convertToLearningModule);
  } catch (error) {
    console.error("Error fetching limited learning modules:", error);
    throw error;
  }
};

// React Query hooks for learning modules
export const useLearningModules = (limitCount?: number) => {
  return useQuery({
    queryKey: ['learningModules', limitCount],
    queryFn: () => limitCount ? fetchLimitedLearningModules(limitCount) : fetchLearningModules()
  });
};
