import { useQuery } from "@tanstack/react-query";
import type { LearningModule } from "@shared/schema";
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

    // Return dummy data for development
    return [
      {
        id: 1,
        title: "Navigasi Darat",
        description: "Panduan lengkap tentang cara membaca peta, menggunakan kompas, dan memahami medan di alam bebas. Modul ini cocok untuk pemula yang ingin mempelajari dasar-dasar navigasi.",
        icon: "map-marked-alt",
        link: "https://example.com/navigasi-darat",
      },
      {
        id: 2,
        title: "Teknik Survival",
        description: "Keterampilan dasar bertahan hidup di alam bebas, termasuk membangun tempat berlindung, mencari air, dan menyalakan api. Sangat penting untuk aktivitas outdoor.",
        icon: "campground",
        link: "https://example.com/teknik-survival",
      },
      {
        id: 3,
        title: "Pertolongan Pertama",
        description: "Panduan penanganan cedera dan situasi darurat saat berada di alam terbuka jauh dari fasilitas medis. Termasuk pengobatan luka, patah tulang, dan evakuasi korban.",
        icon: "first-aid",
        link: "https://example.com/pertolongan-pertama",
      }
    ];
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