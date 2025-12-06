import { useState, useEffect } from "react";

export interface SavedSummary {
  id: string;
  title: string;
  channel: string;
  channelLogo?: string | null;
  thumbnail: string;
  readTime: number;
  listenTime: number;
  category: string;
  savedAt: number;
}

const STORAGE_KEY = "vidsum-saved-summaries";

export function useSavedSummaries() {
  const [savedSummaries, setSavedSummaries] = useState<SavedSummary[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setSavedSummaries(JSON.parse(stored));
    }
  }, []);

  const saveSummary = (summary: Omit<SavedSummary, "savedAt">) => {
    const newSummary = { ...summary, savedAt: Date.now() };
    const updated = [newSummary, ...savedSummaries.filter(s => s.id !== summary.id)];
    setSavedSummaries(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const removeSummary = (id: string) => {
    const updated = savedSummaries.filter(s => s.id !== id);
    setSavedSummaries(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const isSaved = (id: string) => savedSummaries.some(s => s.id === id);

  const toggleSave = (summary: Omit<SavedSummary, "savedAt">) => {
    if (isSaved(summary.id)) {
      removeSummary(summary.id);
      return false;
    } else {
      saveSummary(summary);
      return true;
    }
  };

  return { savedSummaries, saveSummary, removeSummary, isSaved, toggleSave };
}
