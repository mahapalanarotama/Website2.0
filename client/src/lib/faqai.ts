import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, collection } from "firebase/firestore";

export type FaqItem = { q: string; a: string };
const FAQ_AI_DOC_PATH = ["homepage", "faq_ai"];

export async function getFaqAI(): Promise<FaqItem[]> {
  const snap = await getDoc(doc(collection(db, FAQ_AI_DOC_PATH[0]), FAQ_AI_DOC_PATH[1]));
  if (snap.exists()) {
    return snap.data().faq || [];
  }
  return [];
}

export async function setFaqAI(faq: FaqItem[]): Promise<void> {
  await setDoc(doc(collection(db, FAQ_AI_DOC_PATH[0]), FAQ_AI_DOC_PATH[1]), { faq }, { merge: true });
}
