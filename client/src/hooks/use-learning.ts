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
      },
      {
        id: 4,
        title: "Konservasi Lingkungan",
        description: "Prinsip dan praktik konservasi lingkungan yang dapat diterapkan dalam kegiatan outdoor. Mempelajari bagaimana menjaga kelestarian alam selama ekspedisi.",
        icon: "leaf",
        link: "https://example.com/konservasi-lingkungan",
      },
      {
        id: 5,
        title: "Pengetahuan Gunung dan Pendakian",
        description: "Berbagai aspek dalam kegiatan pendakian gunung, termasuk persiapan, teknik pendakian, peralatan, dan manajemen risiko di gunung.",
        icon: "mountain",
        link: "https://example.com/pengetahuan-gunung",
      },
      {
        id: 6,
        title: "Teknik Tali-Temali",
        description: "Panduan lengkap tentang berbagai simpul dan ikatan yang berguna dalam kegiatan outdoor, rescue, dan mountaineering.",
        icon: "campground",
        link: "https://example.com/tali-temali",
      },
      {
        id: 7,
        title: "Keselamatan Air",
        description: "Teknik keselamatan dalam eksplorasi daerah perairan seperti sungai, danau, dan air terjun. Termasuk teknik menyeberangi sungai dan evakuasi korban di air.",
        icon: "water",
        link: "https://example.com/keselamatan-air",
      },
      {
        id: 8,
        title: "Meteorologi Dasar",
        description: "Pengetahuan dasar tentang cuaca, cara membaca tanda-tanda alam, dan dampaknya terhadap kegiatan outdoor. Penting untuk perencanaan dan keselamatan ekspedisi.",
        icon: "wind",
        link: "https://example.com/meteorologi-dasar",
      },
      {
        id: 9,
        title: "Fotografi Alam",
        description: "Teknik fotografi khusus untuk mendokumentasikan keindahan alam, landscape, flora dan fauna saat melakukan kegiatan outdoor.",
        icon: "compass",
        link: "https://example.com/fotografi-alam",
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
