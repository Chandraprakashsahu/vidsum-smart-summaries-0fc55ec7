import { useState, useEffect } from "react";

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
}

const STORAGE_KEY = "vidsum-user-profile";

const defaultProfile: UserProfile = {
  name: "User Name",
  email: "user@example.com",
  avatar: "User",
};

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setProfile(JSON.parse(stored));
    }
  }, []);

  const updateProfile = (updates: Partial<UserProfile>) => {
    const updated = { ...profile, ...updates };
    setProfile(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return { profile, updateProfile };
}
