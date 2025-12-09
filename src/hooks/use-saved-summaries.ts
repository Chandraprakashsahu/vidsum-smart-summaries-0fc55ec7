import { useState, useEffect, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

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
const DEBOUNCE_MS = 500;

export function useSavedSummaries() {
  const [savedSummaries, setSavedSummaries] = useState<SavedSummary[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const queryClient = useQueryClient();
  const debounceTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedSummaries));
  }, [savedSummaries]);

  const saveSummary = useCallback((summary: Omit<SavedSummary, "savedAt">) => {
    const newSummary = { ...summary, savedAt: Date.now() };
    setSavedSummaries(prev => {
      const updated = [newSummary, ...prev.filter(s => s.id !== summary.id)];
      return updated;
    });
  }, []);

  const removeSummary = useCallback((id: string) => {
    setSavedSummaries(prev => prev.filter(s => s.id !== id));
  }, []);

  const isSaved = useCallback((id: string) => {
    return savedSummaries.some(s => s.id === id);
  }, [savedSummaries]);

  // Debounced toggle save with optimistic UI
  const toggleSave = useCallback((summary: Omit<SavedSummary, "savedAt">) => {
    // Clear existing timer for this summary
    const existingTimer = debounceTimers.current.get(summary.id);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const currentlySaved = savedSummaries.some(s => s.id === summary.id);

    // Immediately update UI (optimistic)
    if (currentlySaved) {
      setSavedSummaries(prev => prev.filter(s => s.id !== summary.id));
    } else {
      const newSummary = { ...summary, savedAt: Date.now() };
      setSavedSummaries(prev => [newSummary, ...prev.filter(s => s.id !== summary.id)]);
    }

    // Debounce the localStorage write
    const timer = setTimeout(() => {
      debounceTimers.current.delete(summary.id);
      // localStorage is already synced via useEffect
    }, DEBOUNCE_MS);

    debounceTimers.current.set(summary.id, timer);

    return !currentlySaved;
  }, [savedSummaries]);

  return { savedSummaries, saveSummary, removeSummary, isSaved, toggleSave };
}