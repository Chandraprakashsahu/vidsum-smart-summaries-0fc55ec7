import { useState, useEffect } from "react";

export interface RecentSummary {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  readTime: number;
  listenTime: number;
  category: string;
  viewedAt: number;
}

export const useRecentSummaries = () => {
  const [recentSummaries, setRecentSummaries] = useState<RecentSummary[]>(() => {
    const saved = localStorage.getItem("recentSummaries");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("recentSummaries", JSON.stringify(recentSummaries));
  }, [recentSummaries]);

  const addToRecent = (summary: Omit<RecentSummary, "viewedAt">) => {
    setRecentSummaries((prev) => {
      // Remove if already exists
      const filtered = prev.filter((s) => s.id !== summary.id);
      // Add to beginning with timestamp
      const updated = [{ ...summary, viewedAt: Date.now() }, ...filtered];
      // Keep only last 50
      return updated.slice(0, 50);
    });
  };

  const clearRecent = () => {
    setRecentSummaries([]);
  };

  const readCount = recentSummaries.length;

  return { recentSummaries, addToRecent, clearRecent, readCount };
};
