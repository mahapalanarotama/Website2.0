import { db } from './firebase';
import { collection, addDoc, getDocs, Timestamp, query, orderBy } from 'firebase/firestore';

export type DevLog = {
  action: string;
  detail: string;
  user: string;
  createdAt: Date;
};

const LOG_COLLECTION = 'devlog';

export async function addDevLog(log: Omit<DevLog, 'createdAt'>) {
  await addDoc(collection(db, LOG_COLLECTION), {
    ...log,
    createdAt: Timestamp.now(),
  });
}

export async function getDevLogs(): Promise<DevLog[]> {
  const q = query(collection(db, LOG_COLLECTION), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => {
    const data = doc.data();
    return {
      action: data.action,
      detail: data.detail,
      user: data.user,
      createdAt: data.createdAt?.toDate?.() || new Date(),
    };
  });
}
