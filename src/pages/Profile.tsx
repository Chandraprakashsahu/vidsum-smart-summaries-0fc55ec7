import { useState } from "react";
import { Settings, Bookmark, Clock, Sparkles, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import SummaryCard from "@/components/SummaryCard";
import EditProfileDialog from "@/components/EditProfileDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ThemeToggle from "@/components/ThemeToggle";
import { useSavedSummaries } from "@/hooks/use-saved-summaries";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useFollowing } from "@/hooks/use-following";
import { useRecentSummaries } from "@/hooks/use-recent-summaries";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

const Profile = () => {
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const { savedSummaries } = useSavedSummaries();
  const { profile, updateProfile, loading } = useUserProfile();
  const { following } = useFollowing();
  const { recentSummaries, readCount } = useRecentSummaries();
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Bar */}
      <header className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold text-foreground">Profile</h1>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button 
              onClick={() => navigate('/settings')}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <Settings className="h-5 w-5 text-foreground" />
            </button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-4">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-6 p-5 rounded-xl bg-card border border-border">
          {loading ? (
            <>
              <Skeleton className="h-20 w-20 rounded-full mb-3" />
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-40 mb-3" />
            </>
          ) : user ? (
            <>
              <Avatar className="h-20 w-20 mb-3">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.avatar}`} />
                <AvatarFallback>{profile.name[0]}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold text-foreground mb-0.5">{profile.name}</h2>
              <p className="text-sm text-muted-foreground mb-3">{profile.email}</p>
              <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                Edit Profile
              </Button>
            </>
          ) : (
            <>
              <Avatar className="h-20 w-20 mb-3">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Guest`} />
                <AvatarFallback>G</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold text-foreground mb-0.5">Guest User</h2>
              <p className="text-sm text-muted-foreground mb-3">Login to save your profile</p>
              <Button variant="default" size="sm" onClick={() => navigate("/auth")}>
                <LogIn className="h-4 w-4 mr-2" />
                Login / Sign Up
              </Button>
            </>
          )}

          {/* Stats */}
          <div className="flex gap-8 mt-5 w-full justify-center">
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">{savedSummaries.length}</p>
              <p className="text-xs text-muted-foreground">Saved</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">{readCount}</p>
              <p className="text-xs text-muted-foreground">Read</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">{following.length}</p>
              <p className="text-xs text-muted-foreground">Following</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="saved" className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="saved" className="flex-1 text-sm">
              <Bookmark className="h-4 w-4 mr-1.5" />
              Saved
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex-1 text-sm">
              <Clock className="h-4 w-4 mr-1.5" />
              Recent
            </TabsTrigger>
          </TabsList>

          <TabsContent value="saved" className="space-y-3">
            {savedSummaries.length > 0 ? (
              savedSummaries.map((summary) => (
                <SummaryCard key={summary.id} {...summary} />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Bookmark className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No saved summaries yet</p>
                <p className="text-xs mt-1">Tap bookmark icon on any summary to save</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recent" className="space-y-3">
            {recentSummaries.length > 0 ? (
              recentSummaries.map((summary) => (
                <SummaryCard key={summary.id} {...summary} />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No recent summaries</p>
                <p className="text-xs mt-1">Summaries you read will appear here</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />

      <EditProfileDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        profile={profile}
        onSave={updateProfile}
      />
    </div>
  );
};

export default Profile;
