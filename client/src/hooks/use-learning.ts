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
      },
      {
        id: 10,
        title: "Etika Lingkungan",
        description: "Pendalaman tentang prinsip etika dan filsafat lingkungan, khususnya dalam konteks kegiatan outdoor. Materi ini membahas konsep deep ecology, biosentrisme, dan sustainable outdoor activities berdasarkan artikel dari Jurnal Etika Lingkungan Universitas Indonesia.",
        icon: "book",
        link: "https://example.com/etika-lingkungan",
      },
      {
        id: 11,
        title: "Rock Climbing: Dasar-Dasar Panjat Tebing",
        description: "Keterampilan teknis dalam panjat tebing, mencakup peralatan, teknik dasar gerakan memanjat, belaying, dan keselamatan. Materi diadaptasi dari blog MAPALA Universitas Diponegoro yang berpengalaman dalam kompetisi panjat tebing nasional.",
        icon: "mountain",
        link: "https://example.com/panjat-tebing",
      },
      {
        id: 12,
        title: "Pengelolaan Organisasi Mahasiswa Pecinta Alam",
        description: "Panduan mengelola organisasi MAPALA, mencakup struktur organisasi, manajemen kegiatan, fundraising, dan pengembangan organisasi. Disusun berdasarkan pengalaman berbagai organisasi MAPALA yang telah berdiri lebih dari 30 tahun di Indonesia.",
        icon: "users",
        link: "https://example.com/pengelolaan-mapala",
      },
      {
        id: 13,
        title: "Pengenalan Flora dan Fauna Indonesia",
        description: "Panduan identifikasi dan pengenalan spesies flora dan fauna endemik Indonesia, termasuk taksonomi dasar. Bahan diambil dari situs resmi Kementerian Lingkungan Hidup dan penelitian dari LIPI (Lembaga Ilmu Pengetahuan Indonesia).",
        icon: "leaf",
        link: "https://example.com/flora-fauna",
      },
      {
        id: 14,
        title: "Ekspedisi dan Penjelajahan: Metode dan Perencanaan",
        description: "Panduan komprehensif tentang perencanaan, pelaksanaan, dan dokumentasi ekspedisi alam. Mencakup manajemen logistik, peralatan, dan keselamatan berdasarkan artikel dari WANADRI (Organisasi Pecinta Alam tertua di Indonesia).",
        icon: "compass",
        link: "https://example.com/ekspedisi",
      },
      {
        id: 15,
        title: "Penanggulangan Bencana Alam",
        description: "Bahan pembelajaran tentang jenis-jenis bencana alam di Indonesia dan peran komunitas pecinta alam dalam mitigasi serta penanggulangan bencana. Adaptasi dari panduan BNPB (Badan Nasional Penanggulangan Bencana) dan pengalaman MAPALA dalam aktivitas SAR.",
        icon: "fire-extinguisher",
        link: "https://example.com/penanggulangan-bencana",
      },
      {
        id: 16,
        title: "Speleologi: Eksplorasi Gua",
        description: "Teknik dasar eksplorasi gua, termasuk keterampilan teknis caving, pemetaan gua, dan identifikasi formasi gua. Berdasarkan panduan dari komunitas MAPALA yang aktif dalam kegiatan penelusuran gua di Gunungkidul dan Kalimantan.",
        icon: "campground",
        link: "https://example.com/speleologi",
      },
      {
        id: 17,
        title: "Kepemimpinan dalam Kegiatan Outdoor",
        description: "Modul pengembangan kepemimpinan dalam konteks kegiatan outdoor, mencakup decision making, manajemen tim, dan leadership dalam situasi krisis. Dikembangkan dari berbagai sumber tentang outdoor leadership dan pengalaman organisasi MAPALA senior.",
        icon: "user-tie",
        link: "https://example.com/kepemimpinan-outdoor",
      },
      {
        id: 18,
        title: "Konservasi Ekosistem Hutan Mangrove",
        description: "Studi mendalam tentang ekosistem mangrove, ancaman yang dihadapi, dan strategi konservasi. Diadaptasi dari penelitian dan program konservasi mangrove yang pernah dilakukan oleh berbagai MAPALA di pesisir Indonesia.",
        icon: "water",
        link: "https://example.com/konservasi-mangrove",
      },
      {
        id: 19,
        title: "Perencanaan Program Ekowisata",
        description: "Panduan perencanaan dan pengembangan ekowisata berbasis komunitas, dengan fokus pada pelestarian lingkungan dan pemberdayaan masyarakat lokal. Materi diadaptasi dari program ekowisata yang berhasil diterapkan oleh mahasiswa pecinta alam di berbagai daerah di Indonesia.",
        icon: "leaf",
        link: "https://example.com/ekowisata",
      },
      {
        id: 20,
        title: "Pendidikan Lingkungan Berbasis Sekolah",
        description: "Modul untuk menyelenggarakan program pendidikan lingkungan hidup di sekolah-sekolah. Berisi berbagai kegiatan dan metode pengajaran yang efektif untuk menumbuhkan kesadaran lingkungan sejak dini. Dikembangkan dari program pendidikan lingkungan yang pernah dilaksanakan oleh berbagai MAPALA di Indonesia.",
        icon: "school",
        link: "https://example.com/pendidikan-lingkungan",
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
