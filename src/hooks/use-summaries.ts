import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Summary {
  id: string;
  youtube_url: string;
  youtube_video_id: string;
  title: string;
  thumbnail: string | null;
  channel_id: string | null;
  category: string;
  intro: string;
  key_points: { title: string; items: string[] }[];
  read_time_minutes: number;
  listen_time_minutes: number;
  created_at: string;
  channel?: {
    id: string;
    name: string;
    logo_url: string | null;
    followers_count: number;
  };
}

export function useSummaries(category?: string) {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSummaries = async () => {
    try {
      let query = supabase
        .from("summaries")
        .select(`
          *,
          channel:channels(id, name, logo_url, followers_count)
        `)
        .order("created_at", { ascending: false });

      if (category && category !== "All") {
        query = query.eq("category", category);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Transform key_points from JSONB
      const transformedData = (data || []).map((item) => ({
        ...item,
        key_points: item.key_points as { title: string; items: string[] }[],
      }));
      
      setSummaries(transformedData);
    } catch (error) {
      console.error("Error fetching summaries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaries();
  }, [category]);

  const getSummaryById = async (id: string): Promise<Summary | null> => {
    try {
      const { data, error } = await supabase
        .from("summaries")
        .select(`
          *,
          channel:channels(id, name, logo_url, followers_count)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      
      return {
        ...data,
        key_points: data.key_points as { title: string; items: string[] }[],
      };
    } catch (error) {
      console.error("Error fetching summary:", error);
      return null;
    }
  };

  return {
    summaries,
    loading,
    getSummaryById,
    refetch: fetchSummaries,
  };
}

// Helper function to calculate read time based on content
export function calculateReadTime(intro: string, points: { title: string; items: string[] }[]): number {
  const wordsPerMinute = 200;
  let totalWords = intro.split(/\s+/).length;
  
  points.forEach((point) => {
    totalWords += point.title.split(/\s+/).length;
    point.items.forEach((item) => {
      totalWords += item.split(/\s+/).length;
    });
  });
  
  return Math.max(1, Math.ceil(totalWords / wordsPerMinute));
}

// Helper function to calculate listen time based on content
export function calculateListenTime(intro: string, points: { title: string; items: string[] }[]): number {
  const wordsPerMinute = 150; // Slower for listening
  let totalWords = intro.split(/\s+/).length;
  
  points.forEach((point) => {
    totalWords += point.title.split(/\s+/).length;
    point.items.forEach((item) => {
      totalWords += item.split(/\s+/).length;
    });
  });
  
  return Math.max(1, Math.ceil(totalWords / wordsPerMinute));
}
