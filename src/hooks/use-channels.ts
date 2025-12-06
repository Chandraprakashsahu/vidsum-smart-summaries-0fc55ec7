import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Channel {
  id: string;
  name: string;
  youtube_channel_id: string | null;
  logo_url: string | null;
  subscribers_count: string;
  followers_count: number;
}

export function useChannels() {
  const { user } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [followedChannelIds, setFollowedChannelIds] = useState<string[]>([]);

  const fetchChannels = async () => {
    try {
      const { data, error } = await supabase
        .from("channels")
        .select("*")
        .order("followers_count", { ascending: false });

      if (error) throw error;
      setChannels(data || []);
    } catch (error) {
      console.error("Error fetching channels:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowedChannels = async () => {
    if (!user) {
      setFollowedChannelIds([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("channel_followers")
        .select("channel_id")
        .eq("user_id", user.id);

      if (error) throw error;
      setFollowedChannelIds(data?.map((f) => f.channel_id) || []);
    } catch (error) {
      console.error("Error fetching followed channels:", error);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  useEffect(() => {
    fetchFollowedChannels();
  }, [user]);

  const isFollowing = (channelId: string) => followedChannelIds.includes(channelId);

  const toggleFollow = async (channelId: string) => {
    if (!user) return false;

    try {
      if (isFollowing(channelId)) {
        // Unfollow
        const { error } = await supabase
          .from("channel_followers")
          .delete()
          .eq("user_id", user.id)
          .eq("channel_id", channelId);

        if (error) throw error;
        setFollowedChannelIds((prev) => prev.filter((id) => id !== channelId));
        
        // Update local channel count
        setChannels((prev) =>
          prev.map((ch) =>
            ch.id === channelId
              ? { ...ch, followers_count: Math.max(0, ch.followers_count - 1) }
              : ch
          )
        );
        return false;
      } else {
        // Follow
        const { error } = await supabase
          .from("channel_followers")
          .insert({ user_id: user.id, channel_id: channelId });

        if (error) throw error;
        setFollowedChannelIds((prev) => [...prev, channelId]);
        
        // Update local channel count
        setChannels((prev) =>
          prev.map((ch) =>
            ch.id === channelId
              ? { ...ch, followers_count: ch.followers_count + 1 }
              : ch
          )
        );
        return true;
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      return isFollowing(channelId);
    }
  };

  const getChannelByName = (name: string) => {
    return channels.find((ch) => ch.name.toLowerCase() === name.toLowerCase());
  };

  return {
    channels,
    loading,
    isFollowing,
    toggleFollow,
    getChannelByName,
    refetch: fetchChannels,
  };
}
