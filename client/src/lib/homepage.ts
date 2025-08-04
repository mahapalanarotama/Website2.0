import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { DEFAULT_CAROUSEL } from '../shared/carouselDefault';

export type CarouselContentItem = {
  imageUrl: string;
  alt: string;
  title: string;
  description: string;
};

const HOMEPAGE_DOC_ID = 'main';
const HOMEPAGE_COLLECTION = 'homepage';


export async function getCarouselContent(): Promise<CarouselContentItem[]> {
  const ref = doc(db, HOMEPAGE_COLLECTION, HOMEPAGE_DOC_ID);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const data = snap.data();
    if (Array.isArray(data.carouselContent) && data.carouselContent.length > 0) {
      // Merge: always include default slides first, then any new ones (no duplicates by title)
      const custom = data.carouselContent.filter(
        c => !DEFAULT_CAROUSEL.some(d => d.title === c.title)
      );
      return [...DEFAULT_CAROUSEL, ...custom];
    }
  }
  // If not exists, set default
  await setCarouselContent(DEFAULT_CAROUSEL);
  return [...DEFAULT_CAROUSEL];
}

export async function setCarouselContent(carouselContent: CarouselContentItem[]): Promise<void> {
  const ref = doc(db, HOMEPAGE_COLLECTION, HOMEPAGE_DOC_ID);
  await setDoc(ref, { carouselContent }, { merge: true });
}
