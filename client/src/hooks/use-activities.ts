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
    
    // Return dummy data for development
    return [
      {
        id: 1,
        title: "Ekspedisi Gunung Semeru",
        description: "Pendakian Gunung Semeru bersama 15 anggota aktif Mahapala Narotama dengan misi penelitian flora endemik dan konservasi lingkungan. Tim berhasil melakukan pendataan dan dokumentasi berbagai jenis tanaman langka.",
        date: new Date("2024-10-15"),
        imageUrl: "https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&h=658",
        category: "Ekspedisi",
      },
      {
        id: 2,
        title: "Program Penanaman Pohon di Trawas",
        description: "Kegiatan penanaman 500 bibit pohon di kawasan hutan Trawas, Mojokerto sebagai bagian dari kampanye penghijauan dan rehabilitasi lahan kritis. Bekerjasama dengan Dinas Lingkungan Hidup dan masyarakat setempat.",
        date: new Date("2024-09-22"),
        imageUrl: "https://images.unsplash.com/photo-1513828583688-c52646db42da?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&h=658",
        category: "Konservasi",
      },
      {
        id: 3,
        title: "Sosialisasi Bahaya Sampah Plastik di SD Narotama",
        description: "Kegiatan edukasi tentang bahaya sampah plastik bagi lingkungan kepada siswa SD di Surabaya. Acara diisi dengan presentasi interaktif, games edukasi, dan workshop pembuatan kerajinan dari barang bekas.",
        date: new Date("2024-08-18"),
        imageUrl: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&h=658",
        category: "Edukasi",
      },
      {
        id: 4,
        title: "Ekspedisi Pantai Selatan Pulau Jawa",
        description: "Eksplorasi pantai-pantai di selatan Pulau Jawa untuk melakukan dokumentasi ekosistem pesisir dan memetakan area-area yang memerlukan perlindungan khusus. Tim berhasil mengidentifikasi beberapa area konservasi potensial.",
        date: new Date("2024-07-29"),
        imageUrl: "https://images.unsplash.com/photo-1545579133-99bb5ab189bd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&h=658",
        category: "Ekspedisi",
      },
      {
        id: 5,
        title: "Pembersihan Pantai Kenjeran",
        description: "Aksi bersih-bersih Pantai Kenjeran Surabaya dengan melibatkan 100 relawan dari berbagai komunitas. Berhasil mengumpulkan lebih dari 1 ton sampah plastik untuk didaur ulang.",
        date: new Date("2024-07-08"),
        imageUrl: "https://images.unsplash.com/photo-1616680214178-9eb9b0ac4196?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&h=658",
        category: "Konservasi",
      },
      {
        id: 6,
        title: "Workshop Navigasi dan Survival Dasar",
        description: "Workshop navigasi dan teknik survival dasar untuk mahasiswa baru Universitas Narotama. Peserta diajari cara membaca peta, menggunakan kompas, dan keterampilan dasar bertahan hidup di alam liar.",
        date: new Date("2024-06-12"),
        imageUrl: "https://images.unsplash.com/photo-1455156218388-5e61b526818b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&h=658",
        category: "Edukasi",
      },
      {
        id: 7,
        title: "Ekspedisi Hutan Adat Kalimantan",
        description: "Ekspedisi penelitian ke hutan adat di Kalimantan bersama masyarakat lokal untuk mendokumentasikan kearifan lokal dalam menjaga kelestarian hutan. Hasil ekspedisi akan dibukukan sebagai referensi konservasi berbasis kearifan lokal.",
        date: new Date("2024-05-20"),
        imageUrl: "https://images.unsplash.com/photo-1585089858717-f4378c2031d8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&h=658",
        category: "Ekspedisi",
      },
      {
        id: 8,
        title: "Konservasi Sumber Mata Air Desa Jambu",
        description: "Program konservasi sumber mata air di Desa Jambu, Kabupaten Kediri dengan membangun area perlindungan dan penanaman pohon di sekitar sumber air. Project kerjasama dengan pemerintah desa dan NGO lingkungan.",
        date: new Date("2024-04-15"),
        imageUrl: "https://images.unsplash.com/photo-1576434795764-7e9972f8a936?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&h=658",
        category: "Konservasi",
      },
      {
        id: 9,
        title: "Seminar Perubahan Iklim dan Dampaknya",
        description: "Seminar tentang perubahan iklim dan dampaknya terhadap ekosistem Indonesia, dihadiri oleh mahasiswa dari berbagai universitas di Surabaya. Pembicara dari Kementerian Lingkungan Hidup dan beberapa pakar lingkungan hadir sebagai narasumber.",
        date: new Date("2024-03-27"),
        imageUrl: "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&h=658",
        category: "Edukasi",
      }
    ];
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
