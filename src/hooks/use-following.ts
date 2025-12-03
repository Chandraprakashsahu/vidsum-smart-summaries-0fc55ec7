import { useState, useEffect } from "react";

export interface Creator {
  id: string;
  name: string;
  avatar: string;
  subscribers: string;
}

const STORAGE_KEY = "vidsum-following";

export function useFollowing() {
  const [following, setFollowing] = useState<Creator[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setFollowing(JSON.parse(stored));
    }
  }, []);

  const followCreator = (creator: Creator) => {
    const updated = [...following.filter(c => c.id !== creator.id), creator];
    setFollowing(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const unfollowCreator = (id: string) => {
    const updated = following.filter(c => c.id !== id);
    setFollowing(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const isFollowing = (name: string) => following.some(c => c.name === name);

  const toggleFollow = (creator: Creator) => {
    if (isFollowing(creator.name)) {
      unfollowCreator(creator.id);
      return false;
    } else {
      followCreator(creator);
      return true;
    }
  };

  return { following, followCreator, unfollowCreator, isFollowing, toggleFollow };
}
