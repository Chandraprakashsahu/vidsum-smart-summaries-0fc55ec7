import { useQuery, useQueryClient } from "@tanstack/react-query";
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

// Stale time constants
const ONE_HOUR = 1000 * 60 * 60;
const TEN_MINUTES = 1000 * 60 * 10;

const fetchSummaries = async (category?: string): Promise<Summary[]> => {
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
  
  return (data || []).map((item) => ({
    ...item,
    key_points: item.key_points as { title: string; items: string[] }[],
  }));
};

// Home page hook - 1 hour stale time (daily curated)
export function useSummaries(category?: string) {
  const queryClient = useQueryClient();
  
  const { data: summaries = [], isLoading: loading } = useQuery({
    queryKey: ["summaries", "home", category || "All"],
    queryFn: () => fetchSummaries(category),
    staleTime: ONE_HOUR, // Cache for 1 hour
    gcTime: ONE_HOUR * 24, // Keep in cache for 24 hours
  });

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

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ["summaries", "home"] });
  };

  return {
    summaries,
    loading,
    getSummaryById,
    refetch,
  };
}

// Explore page hook - 10 minutes stale time (hourly updates)
export function useExploreSummaries(category?: string) {
  const queryClient = useQueryClient();
  
  const { data: summaries = [], isLoading: loading } = useQuery({
    queryKey: ["summaries", "explore", category || "All"],
    queryFn: () => fetchSummaries(category),
    staleTime: TEN_MINUTES, // Cache for 10 minutes
    gcTime: ONE_HOUR, // Keep in cache for 1 hour
  });

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ["summaries", "explore"] });
  };

  return {
    summaries,
    loading,
    refetch,
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