import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  serverTimestamp,
  query,
  where,
  deleteDoc
} from "firebase/firestore";

const LEADERBOARD_COLLECTION = "eduhub_leaderboard";

export async function saveUserProgressToFirestore(name: string, progress: number) {
  if (!name) return;
  const ref = doc(db, LEADERBOARD_COLLECTION, name);
  await setDoc(ref, {
    name,
    progress: Number(progress) || 0,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function getLeaderboardFromFirestore() {
  try {
    const snap = await getDocs(collection(db, LEADERBOARD_COLLECTION));
    return snap.docs.map(doc => {
      const d = doc.data();
      return {
        name: d.name,
        progress: Number(d.progress) || 0,
        updatedAt: d.updatedAt || null
      };
    });
  } catch (e) {
    console.error("Error fetching leaderboard:", e);
    return [];
  }
}

export async function cleanupOldZeroProgressUsers() {
  const q = query(
    collection(db, LEADERBOARD_COLLECTION),
    where("progress", "==", 0)
  );
  const snap = await getDocs(q);
  const now = Date.now();
  const batch = [];
  for (const d of snap.docs) {
    const data = d.data();
    const updatedAt = data.updatedAt?.toDate?.() || new Date(0);
    if (now - updatedAt.getTime() > 30 * 24 * 60 * 60 * 1000) {
      batch.push(deleteDoc(d.ref));
    }
  }
  await Promise.all(batch);
}
