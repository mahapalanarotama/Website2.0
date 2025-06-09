import { useQuery } from "@tanstack/react-query";
// Define Member type locally if not available from a module
export interface Member {
  id: number;
  fullName: string;
  fieldName: string;
  batchName: string;
  batchYear: number;
  registrationNumber: string;
  membershipStatus: string;
  photoUrl: string;
  qrCode: string;
  email: string;
  phone: string;
  gender: string;
}
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, limit, DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

// Convert Firestore document to Member type
const convertToMember = (doc: QueryDocumentSnapshot<DocumentData>): Member => {
  const data = doc.data();
  return {
    id: !isNaN(Number(doc.id)) ? Number(doc.id) : Math.floor(Math.random() * 1000000), // Use doc.id as number if possible, else fallback to random
    fullName: data.namalengkap || "",
    fieldName: data.namalapangan || "",
    batchName: data.namaangkatan || "",
    batchYear: data.tahun || 0,
    registrationNumber: data.nomorregistrasi || "",
    membershipStatus: data.keanggotaan || "Tidak Aktif",
    photoUrl: data.foto || "",
    qrCode: data.url || "",
    email: data.email || "",
    phone: data.phone || "",
    gender: data.gender || '', // mapping gender jika ada di Firestore
  };
};

// Function to fetch all members
export const fetchMembers = async (): Promise<Member[]> => {
  try {
    // Change collection name from "members" to "anggota"
    const membersRef = collection(db, "anggota");
    const snapshot = await getDocs(membersRef);
    
    if (snapshot.empty) {
      console.log("No members found");
      return [];
    }
    
    return snapshot.docs.map(convertToMember);
  } catch (error) {
    console.error("Error fetching members:", error);
    throw error;
  }
};

// Function to fetch members with limit
export const fetchLimitedMembers = async (count: number): Promise<Member[]> => {
  try {
    // Change collection name from "members" to "anggota"
    const membersRef = collection(db, "anggota");
    const q = query(membersRef, limit(count));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(convertToMember);
  } catch (error) {
    console.error("Error fetching limited members:", error);
    throw error;
  }
};

// Function to fetch members by search criteria
export const searchMembers = async (field: string, value: string): Promise<Member[]> => {
  try {
    // Change collection name from "members" to "anggota"
    const membersRef = collection(db, "anggota");
    const q = query(membersRef, where(field, ">=", value), where(field, "<=", value + "\uf8ff"));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(convertToMember);
  } catch (error) {
    console.error("Error searching members:", error);
    throw error;
  }
};

// Fetch member by field (for detail card)
export const getMemberByField = async (field: string, value: string) => {
  const membersRef = collection(db, "anggota");
  const q = query(membersRef, where(field, "==", value), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  const data = doc.data();
  return {
    fullName: data.namalengkap || "",
    fieldName: data.namalapangan || "",
    batchName: data.namaangkatan || "",
    batchYear: data.tahun || 0,
    registrationNumber: data.nomorregistrasi || "",
    membershipStatus: data.keanggotaan || "Tidak Aktif",
    photoUrl: data.foto || "",
    statusMahasiswa: data.statusMahasiswa || "",
  };
};

// React Query hooks for members
export const useMembers = (limitCount?: number) => {
  return useQuery({
    queryKey: ['members', limitCount],
    queryFn: () => limitCount ? fetchLimitedMembers(limitCount) : fetchMembers()
  });
};

export const useSearchMembers = (field: string, value: string) => {
  return useQuery({
    queryKey: ['members', field, value],
    queryFn: () => searchMembers(field, value),
    // Only run the query if there's a search value
    enabled: !!value
  });
};
