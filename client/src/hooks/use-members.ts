import { useQuery } from "@tanstack/react-query";
import { Member } from "@shared/schema";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, limit, DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

// Convert Firestore document to Member type
const convertToMember = (doc: QueryDocumentSnapshot<DocumentData>): Member => {
  const data = doc.data();
  return {
    id: parseInt(doc.id, 10) || Math.floor(Math.random() * 1000), // Fallback to random ID if parse fails
    fullName: data.fullName || "",
    fieldName: data.fieldName || "",
    batchName: data.batchName || "",
    batchYear: data.batchYear || 0,
    registrationNumber: data.registrationNumber || "",
    membershipStatus: data.membershipStatus || "Tidak Aktif",
    photoUrl: data.photoUrl || "",
    qrCode: data.qrCode || "",
    email: data.email || "",
    phone: data.phone || "",
  };
};

// Function to fetch all members
export const fetchMembers = async (): Promise<Member[]> => {
  try {
    const membersRef = collection(db, "members");
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
    const membersRef = collection(db, "members");
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
    const membersRef = collection(db, "members");
    const q = query(membersRef, where(field, ">=", value), where(field, "<=", value + "\uf8ff"));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(convertToMember);
  } catch (error) {
    console.error("Error searching members:", error);
    throw error;
  }
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
