import { useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Channel {
  id: string;
  name: string;
  youtube_channel_id: string | null;
  logo_url: string | null;
  subscribers_count: string | null;
  followers_count: number;
}

const TEN_MINUTES = 1000 * 60 * 10;
const DEBOUNCE_MS = 500;

const fetchChannels = async (): Promise<Channel[]> => {
  const { data, error } = await supabase
    .from("channels")
    .select("*")
    .order("followers_count", { ascending: false });

  if (error) throw error;
  return data || [];
};

const fetchFollowedIds = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from("channel_followers")
    .select("channel_id")
    .eq("user_id", userId);

  if (error) throw error;
  return data?.map(item => item.channel_id) || [];
};

export function useChannels() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const debounceTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const { data: channels = [], isLoading: loading } = useQuery({
    queryKey: ["channels"],
    queryFn: fetchChannels,
    staleTime: TEN_MINUTES,
    gcTime: TEN_MINUTES * 3,
  });

  const { data: followedChannelIds = [] } = useQuery({
    queryKey: ["followedChannelIds", user?.id],
    queryFn: () => fetchFollowedIds(user!.id),
    enabled: !!user,
    staleTime: TEN_MINUTES,
    gcTime: TEN_MINUTES * 3,
  });

  const followMutation = useMutation({
    mutationFn: async (channelId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("channel_followers")
        .insert({ user_id: user.id, channel_id: channelId });
      if (error) throw error;
      return channelId;
    },
    onMutate: async (channelId) => {
      await queryClient.cancelQueries({ queryKey: ["followedChannelIds", user?.id] });
      await queryClient.cancelQueries({ queryKey: ["channels"] });
      await queryClient.cancelQueries({ queryKey: ["following", user?.id] });

      const previousFollowedIds = queryClient.getQueryData<string[]>(["followedChannelIds", user?.id]);
      const previousChannels = queryClient.getQueryData<Channel[]>(["channels"]);

      queryClient.setQueryData<string[]>(["followedChannelIds", user?.id], (old = []) => {
        if (old.includes(channelId)) return old;
        return [...old, channelId];
      });

      queryClient.setQueryData<Channel[]>(["channels"], (old = []) =>
        old.map(c => c.id === channelId ? { ...c, followers_count: (c.followers_count || 0) + 1 } : c)
      );

      return { previousFollowedIds, previousChannels };
    },
    onError: (err, channelId, context) => {
      if (context?.previousFollowedIds) {
        queryClient.setQueryData(["followedChannelIds", user?.id], context.previousFollowedIds);
      }
      if (context?.previousChannels) {
        queryClient.setQueryData(["channels"], context.previousChannels);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followedChannelIds", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      queryClient.invalidateQueries({ queryKey: ["following", user?.id] });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async (channelId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("channel_followers")
        .delete()
        .eq("user_id", user.id)
        .eq("channel_id", channelId);
      if (error) throw error;
      return channelId;
    },
    onMutate: async (channelId) => {
      await queryClient.cancelQueries({ queryKey: ["followedChannelIds", user?.id] });
      await queryClient.cancelQueries({ queryKey: ["channels"] });
      await queryClient.cancelQueries({ queryKey: ["following", user?.id] });

      const previousFollowedIds = queryClient.getQueryData<string[]>(["followedChannelIds", user?.id]);
      const previousChannels = queryClient.getQueryData<Channel[]>(["channels"]);

      queryClient.setQueryData<string[]>(["followedChannelIds", user?.id], (old = []) =>
        old.filter(id => id !== channelId)
      );

      queryClient.setQueryData<Channel[]>(["channels"], (old = []) =>
        old.map(c => c.id === channelId ? { ...c, followers_count: Math.max(0, (c.followers_count || 1) - 1) } : c)
      );

      return { previousFollowedIds, previousChannels };
    },
    onError: (err, channelId, context) => {
      if (context?.previousFollowedIds) {
        queryClient.setQueryData(["followedChannelIds", user?.id], context.previousFollowedIds);
      }
      if (context?.previousChannels) {
        queryClient.setQueryData(["channels"], context.previousChannels);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followedChannelIds", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      queryClient.invalidateQueries({ queryKey: ["following", user?.id] });
    },
  });

  const isFollowing = useCallback((channelId: string) => {
    return followedChannelIds.includes(channelId);
  }, [followedChannelIds]);

  const toggleFollow = useCallback(async (channelId: string): Promise<boolean> => {
    if (!user) return false;

    const existingTimer = debounceTimers.current.get(channelId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const currentlyFollowing = followedChannelIds.includes(channelId);

    // Immediately update UI (optimistic)
    if (currentlyFollowing) {
      queryClient.setQueryData<string[]>(["followedChannelIds", user?.id], (old = []) =>
        old.filter(id => id !== channelId)
      );
      queryClient.setQueryData<Channel[]>(["channels"], (old = []) =>
        old.map(c => c.id === channelId ? { ...c, followers_count: Math.max(0, (c.followers_count || 1) - 1) } : c)
      );
    } else {
      queryClient.setQueryData<string[]>(["followedChannelIds", user?.id], (old = []) => {
        if (old.includes(channelId)) return old;
        return [...old, channelId];
      });
      queryClient.setQueryData<Channel[]>(["channels"], (old = []) =>
        old.map(c => c.id === channelId ? { ...c, followers_count: (c.followers_count || 0) + 1 } : c)
      );
    }

    return new Promise<boolean>((resolve) => {
      const timer = setTimeout(async () => {
        debounceTimers.current.delete(channelId);
        try {
          if (currentlyFollowing) {
            await unfollowMutation.mutateAsync(channelId);
            resolve(false);
          } else {
            await followMutation.mutateAsync(channelId);
            resolve(true);
          }
        } catch {
          // Revert on error
          if (currentlyFollowing) {
            queryClient.setQueryData<string[]>(["followedChannelIds", user?.id], (old = []) => [...old, channelId]);
          } else {
            queryClient.setQueryData<string[]>(["followedChannelIds", user?.id], (old = []) => old.filter(id => id !== channelId));
          }
          resolve(currentlyFollowing);
        }
      }, DEBOUNCE_MS);

      debounceTimers.current.set(channelId, timer);
    });
  }, [user, followedChannelIds, followMutation, unfollowMutation, queryClient]);

  const getChannelByName = useCallback((name: string) => {
    return channels.find(c => c.name.toLowerCase() === name.toLowerCase());
  }, [channels]);

  const getChannelById = useCallback((id: string) => {
    return channels.find(c => c.id === id);
  }, [channels]);

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["channels"] });
    queryClient.invalidateQueries({ queryKey: ["followedChannelIds", user?.id] });
  }, [queryClient, user?.id]);

  return { 
    channels, 
    loading, 
    isFollowing, 
    toggleFollow, 
    getChannelByName,
    getChannelById,
    refetch,
    refetchFollowed: refetch,
  };
}