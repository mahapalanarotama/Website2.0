import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export type CarouselContentItem = {
  imageUrl: string;
  alt: string;
  title: string;
  description: string;
};

const HOMEPAGE_DOC_ID = 'main';
const HOMEPAGE_COLLECTION = 'homepage';

export async function getCarouselContent(): Promise<CarouselContentItem[] | null> {
  const ref = doc(db, HOMEPAGE_COLLECTION, HOMEPAGE_DOC_ID);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const data = snap.data();
    return data.carouselContent || null;
  }
  return null;
}

export async function setCarouselContent(carouselContent: CarouselContentItem[]): Promise<void> {
  const ref = doc(db, HOMEPAGE_COLLECTION, HOMEPAGE_DOC_ID);
  await setDoc(ref, { carouselContent }, { merge: true });
}
