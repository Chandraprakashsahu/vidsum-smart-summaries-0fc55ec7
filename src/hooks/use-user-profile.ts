import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
}

const defaultProfile: UserProfile = {
  name: "User Name",
  email: "user@example.com",
  avatar: "User",
};

const TEN_MINUTES = 1000 * 60 * 10;

const fetchProfile = async (userId: string, userEmail?: string, userName?: string): Promise<UserProfile> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("name, email, avatar_url")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;

  if (data) {
    return {
      name: data.name || userName || "User",
      email: data.email || userEmail || "user@example.com",
      avatar: data.avatar_url || data.name || "User",
    };
  }
  
  // Use auth user data as fallback
  return {
    name: userName || userEmail?.split("@")[0] || "User",
    email: userEmail || "user@example.com",
    avatar: userName || "User",
  };
};

export function useUserProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile = defaultProfile, isLoading: loading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => fetchProfile(
      user!.id, 
      user?.email, 
      user?.user_metadata?.name
    ),
    enabled: !!user,
    staleTime: TEN_MINUTES,
    gcTime: TEN_MINUTES * 3,
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      if (!user) throw new Error("Not authenticated");
      
      const updateData: { name?: string; email?: string; avatar_url?: string } = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.email) updateData.email = updates.email;
      if (updates.avatar) updateData.avatar_url = updates.avatar;

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("user_id", user.id);

      if (error) throw error;
      return updates;
    },
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: ["profile", user?.id] });
      
      const previousProfile = queryClient.getQueryData<UserProfile>(["profile", user?.id]);
      
      // Optimistically update
      queryClient.setQueryData<UserProfile>(["profile", user?.id], (old = defaultProfile) => ({
        ...old,
        ...updates,
      }));

      return { previousProfile };
    },
    onError: (err, updates, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(["profile", user?.id], context.previousProfile);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
  });

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    await updateMutation.mutateAsync(updates);
  }, [updateMutation]);

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
  }, [queryClient, user?.id]);

  return { 
    profile: user ? profile : defaultProfile, 
    updateProfile, 
    loading: user ? loading : false, 
    refetch 
  };
}