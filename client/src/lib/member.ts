// Ganti dengan query Firestore atau API anggota
export async function getMemberByRegNum(regNum: string) {
  // Contoh query Firestore
  // import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
  // const db = getFirestore();
  // const q = query(collection(db, "anggota"), where("regNum", "==", regNum));
  // const snapshot = await getDocs(q);
  // if (!snapshot.empty) return snapshot.docs[0].data();
  // return null;

  // Dummy data untuk demo
  const dummyMembers = [
    { regNum: "1234567890", nama: "Budi Santoso", nim: "20190001", jurusan: "Teknik Informatika" },
    { regNum: "9876543210", nama: "Siti Aminah", nim: "20190002", jurusan: "Manajemen" },
  ];
  return dummyMembers.find(m => m.regNum === regNum) || null;
}
