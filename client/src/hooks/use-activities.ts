import { useQuery } from "@tanstack/react-query";
import type { Activity } from "@shared/schema";

// Fetch activities from backend API
export const fetchActivities = async (): Promise<Activity[]> => {
  const res = await fetch("/api/activities");
  if (!res.ok) throw new Error("Failed to fetch activities");
  return res.json();
};

// Fetch limited activities from backend API
export const fetchLimitedActivities = async (count: number): Promise<Activity[]> => {
  const res = await fetch(`/api/activities?limit=${count}`);
  if (!res.ok) throw new Error("Failed to fetch limited activities");
  return res.json();
};

export const useActivities = (limitCount?: number) => {
  return useQuery({
    queryKey: ["activities", limitCount],
    queryFn: () => limitCount ? fetchLimitedActivities(limitCount) : fetchActivities(),
  });
};
