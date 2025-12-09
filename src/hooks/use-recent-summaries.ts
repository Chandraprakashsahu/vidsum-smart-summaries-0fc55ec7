import { useState, useEffect, useCallback, useRef } from "react";

export interface RecentSummary {
  id: string;
  title: string;
  channel: string;
  channelLogo?: string | null;
  thumbnail: string;
  readTime: number;
  listenTime: number;
  category: string;
  viewedAt: number;
}

const STORAGE_KEY = "recentSummaries";
const DEBOUNCE_MS = 500;

export const useRecentSummaries = () => {
  const [recentSummaries, setRecentSummaries] = useState<RecentSummary[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Debounce localStorage writes
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentSummaries));
    }, DEBOUNCE_MS);
    
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [recentSummaries]);

  const addToRecent = useCallback((summary: Omit<RecentSummary, "viewedAt">) => {
    setRecentSummaries((prev) => {
      // Remove if already exists
      const filtered = prev.filter((s) => s.id !== summary.id);
      // Add to beginning with timestamp
      const updated = [{ ...summary, viewedAt: Date.now() }, ...filtered];
      // Keep only last 50
      return updated.slice(0, 50);
    });
  }, []);

  const clearRecent = useCallback(() => {
    setRecentSummaries([]);
  }, []);

  const readCount = recentSummaries.length;

  return { recentSummaries, addToRecent, clearRecent, readCount };
};
