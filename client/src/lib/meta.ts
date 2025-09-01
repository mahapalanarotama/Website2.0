import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export type MetaData = {
  title: string;
  description: string;
  keywords: string;
  image: string;
  favicon: string;
  faviconFallback: string;
  faviconPng: string;
  googleFormUrl?: string;
  googleFormDownloadUrl?: string;
  chatbotToken?: string;
};

const META_DOC_ID = 'main';
const META_COLLECTION = 'meta';

export async function getMeta(): Promise<MetaData | null> {
  const ref = doc(db, META_COLLECTION, META_DOC_ID);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data() as MetaData;
  return null;
}

export async function setMeta(meta: MetaData): Promise<void> {
  const ref = doc(db, META_COLLECTION, META_DOC_ID);
  await setDoc(ref, meta, { merge: true });
}
