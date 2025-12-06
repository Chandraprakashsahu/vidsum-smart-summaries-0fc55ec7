import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface FollowedChannel {
  id: string;
  name: string;
  logo_url: string | null;
  followers_count: number;
}

const LOCAL_STORAGE_KEY = "vidsum-following";

export function useFollowing() {
  const { user } = useAuth();
  const [following, setFollowing] = useState<FollowedChannel[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch followed channels from database
  const fetchFollowing = useCallback(async () => {
    if (!user) {
      // Load from localStorage for guests
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        try {
          setFollowing(JSON.parse(stored));
        } catch {
          setFollowing([]);
        }
      }
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("channel_followers")
        .select(`
          channel_id,
          channels:channel_id(id, name, logo_url, followers_count)
        `)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching followed channels:", error);
        setFollowing([]);
      } else {
        const channels = data
          ?.map((item: any) => item.channels)
          .filter(Boolean) as FollowedChannel[];
        setFollowing(channels || []);
      }
    } catch (error) {
      console.error("Error:", error);
      setFollowing([]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchFollowing();
  }, [fetchFollowing]);

  const isFollowing = useCallback((channelId: string) => {
    return following.some(c => c.id === channelId);
  }, [following]);

  const followChannel = async (channelId: string) => {
    if (!user) {
      // Guest users can't follow
      return false;
    }

    try {
      const { error } = await supabase
        .from("channel_followers")
        .insert({ user_id: user.id, channel_id: channelId });

      if (error) {
        console.error("Error following channel:", error);
        return false;
      }

      // Refetch to get updated data
      await fetchFollowing();
      return true;
    } catch (error) {
      console.error("Error:", error);
      return false;
    }
  };

  const unfollowChannel = async (channelId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("channel_followers")
        .delete()
        .eq("user_id", user.id)
        .eq("channel_id", channelId);

      if (error) {
        console.error("Error unfollowing channel:", error);
        return false;
      }

      await fetchFollowing();
      return true;
    } catch (error) {
      console.error("Error:", error);
      return false;
    }
  };

  const toggleFollow = async (channelId: string): Promise<boolean> => {
    if (isFollowing(channelId)) {
      await unfollowChannel(channelId);
      return false;
    } else {
      await followChannel(channelId);
      return true;
    }
  };

  return { 
    following, 
    loading,
    isFollowing, 
    followChannel, 
    unfollowChannel, 
    toggleFollow,
    refetch: fetchFollowing
  };
}
