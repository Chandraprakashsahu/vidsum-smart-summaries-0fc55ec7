import { useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface FollowedChannel {
  id: string;
  name: string;
  logo_url: string | null;
  followers_count: number;
}

const TEN_MINUTES = 1000 * 60 * 10;
const DEBOUNCE_MS = 500;

const fetchFollowedChannels = async (userId: string): Promise<FollowedChannel[]> => {
  const { data, error } = await supabase
    .from("channel_followers")
    .select(`
      channel_id,
      channels:channel_id(id, name, logo_url, followers_count)
    `)
    .eq("user_id", userId);

  if (error) throw error;
  
  return data
    ?.map((item: any) => item.channels)
    .filter(Boolean) as FollowedChannel[] || [];
};

export function useFollowing() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const debounceTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const { data: following = [], isLoading: loading } = useQuery({
    queryKey: ["following", user?.id],
    queryFn: () => fetchFollowedChannels(user!.id),
    enabled: !!user,
    staleTime: TEN_MINUTES,
    gcTime: TEN_MINUTES * 3,
  });

  const followedIds = following.map(c => c.id);

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
      await queryClient.cancelQueries({ queryKey: ["following", user?.id] });
      await queryClient.cancelQueries({ queryKey: ["channels"] });

      const previousFollowing = queryClient.getQueryData<FollowedChannel[]>(["following", user?.id]);

      queryClient.setQueryData<FollowedChannel[]>(["following", user?.id], (old = []) => {
        if (old.some(c => c.id === channelId)) return old;
        return [...old, { id: channelId, name: "", logo_url: null, followers_count: 0 }];
      });

      return { previousFollowing };
    },
    onError: (err, channelId, context) => {
      if (context?.previousFollowing) {
        queryClient.setQueryData(["following", user?.id], context.previousFollowing);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["following", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      queryClient.invalidateQueries({ queryKey: ["followedChannelIds", user?.id] });
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
      await queryClient.cancelQueries({ queryKey: ["following", user?.id] });
      await queryClient.cancelQueries({ queryKey: ["channels"] });

      const previousFollowing = queryClient.getQueryData<FollowedChannel[]>(["following", user?.id]);

      queryClient.setQueryData<FollowedChannel[]>(["following", user?.id], (old = []) => 
        old.filter(c => c.id !== channelId)
      );

      return { previousFollowing };
    },
    onError: (err, channelId, context) => {
      if (context?.previousFollowing) {
        queryClient.setQueryData(["following", user?.id], context.previousFollowing);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["following", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      queryClient.invalidateQueries({ queryKey: ["followedChannelIds", user?.id] });
    },
  });

  const isFollowing = useCallback((channelId: string) => {
    return followedIds.includes(channelId);
  }, [followedIds]);

  const followChannel = useCallback(async (channelId: string) => {
    if (!user) return false;
    
    const existingTimer = debounceTimers.current.get(channelId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    return new Promise<boolean>((resolve) => {
      const timer = setTimeout(async () => {
        debounceTimers.current.delete(channelId);
        try {
          await followMutation.mutateAsync(channelId);
          resolve(true);
        } catch {
          resolve(false);
        }
      }, DEBOUNCE_MS);
      
      debounceTimers.current.set(channelId, timer);
    });
  }, [user, followMutation]);

  const unfollowChannel = useCallback(async (channelId: string) => {
    if (!user) return false;

    const existingTimer = debounceTimers.current.get(channelId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    return new Promise<boolean>((resolve) => {
      const timer = setTimeout(async () => {
        debounceTimers.current.delete(channelId);
        try {
          await unfollowMutation.mutateAsync(channelId);
          resolve(true);
        } catch {
          resolve(false);
        }
      }, DEBOUNCE_MS);
      
      debounceTimers.current.set(channelId, timer);
    });
  }, [user, unfollowMutation]);

  const toggleFollow = useCallback(async (channelId: string): Promise<boolean> => {
    const currentlyFollowing = followedIds.includes(channelId);
    
    if (currentlyFollowing) {
      await unfollowChannel(channelId);
      return false;
    } else {
      await followChannel(channelId);
      return true;
    }
  }, [followedIds, followChannel, unfollowChannel]);

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["following", user?.id] });
  }, [queryClient, user?.id]);

  return { 
    following, 
    loading,
    isFollowing, 
    followChannel, 
    unfollowChannel, 
    toggleFollow,
    refetch
  };
}