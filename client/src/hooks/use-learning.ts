import { useQuery } from "@tanstack/react-query";
import type { LearningModule } from "@shared/schema";

// Fetch learning modules from backend API
export const fetchLearningModules = async (): Promise<LearningModule[]> => {
  const res = await fetch("/api/learning-modules");
  if (!res.ok) throw new Error("Failed to fetch learning modules");
  return res.json();
};

// Fetch limited learning modules from backend API
export const fetchLimitedLearningModules = async (count: number): Promise<LearningModule[]> => {
  const res = await fetch(`/api/learning-modules?limit=${count}`);
  if (!res.ok) throw new Error("Failed to fetch limited learning modules");
  return res.json();
};

export const useLearningModules = (limitCount?: number) => {
  return useQuery({
    queryKey: ["learningModules", limitCount],
    queryFn: () => (limitCount ? fetchLimitedLearningModules(limitCount) : fetchLearningModules()),
  });
};