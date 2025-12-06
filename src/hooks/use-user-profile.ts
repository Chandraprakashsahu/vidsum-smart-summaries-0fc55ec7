import { useState, useEffect } from "react";
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

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(defaultProfile);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("name, email, avatar_url")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile({
          name: data.name || user.user_metadata?.name || "User",
          email: data.email || user.email || "user@example.com",
          avatar: data.avatar_url || data.name || "User",
        });
      } else {
        // Use auth user data as fallback
        setProfile({
          name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
          email: user.email || "user@example.com",
          avatar: user.user_metadata?.name || "User",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    try {
      const updateData: { name?: string; email?: string; avatar_url?: string } = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.email) updateData.email = updates.email;
      if (updates.avatar) updateData.avatar_url = updates.avatar;

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("user_id", user.id);

      if (error) throw error;

      setProfile((prev) => ({ ...prev, ...updates }));
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  return { profile, updateProfile, loading, refetch: fetchProfile };
}
