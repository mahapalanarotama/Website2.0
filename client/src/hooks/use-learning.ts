import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, limit as limitFn } from "firebase/firestore";
import { db } from '@/lib/firebase';

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  icon: string;
  link: string;
}

const fetchLearningModulesFromFirestore = async (limitCount?: number): Promise<LearningModule[]> => {
  let q = collection(db, 'learnings');
  let qFinal = limitCount ? query(q, limitFn(limitCount)) : q;
  const snap = await getDocs(qFinal);
  return snap.docs.map(doc => {
    const d = doc.data();
    return {
      id: doc.id,
      title: d.title || '',
      description: d.description || '',
      icon: d.icon || '',
      link: d.link || '',
    };
  });
};

export const useLearningModules = (limitCount?: number) => {
  return useQuery({
    queryKey: ["learningModules", limitCount],
    queryFn: () => fetchLearningModulesFromFirestore(limitCount),
  });
};