import { Heart, Sparkles, UserMinus, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import SummaryCard from "@/components/SummaryCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useChannels } from "@/hooks/use-channels";
import { useSummaries } from "@/hooks/use-summaries";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Following = () => {
  const { user } = useAuth();
  const { channels, isFollowing, toggleFollow } = useChannels();
  const { summaries } = useSummaries();
  const { toast } = useToast();

  // Get followed channels
  const followedChannels = channels.filter((ch) => isFollowing(ch.id));

  // Get summaries from followed channels
  const followedSummaries = summaries.filter((s) => 
    s.channel && followedChannels.some((ch) => ch.id === s.channel?.id)
  );

  const handleUnfollow = async (channelId: string, channelName: string) => {
    await toggleFollow(channelId);
    toast({
      title: "Unfollowed",
      description: `You unfollowed ${channelName}`,
      duration: 2000,
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-10 bg-card border-b border-border">
          <div className="container flex items-center justify-between h-14 px-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-lg font-bold text-foreground">Following</h1>
            </div>
          </div>
        </header>

        <main className="container px-4 py-8 flex flex-col items-center justify-center">
          <div className="text-center py-12 max-w-sm">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
            <h2 className="text-lg font-semibold mb-2 text-foreground">Login to Follow Channels</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Create an account to follow your favorite channels and see their latest summaries here.
            </p>
            <Link to="/auth">
              <Button className="gap-2">
                <LogIn className="h-4 w-4" />
                Login or Sign Up
              </Button>
            </Link>
          </div>
        </main>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Bar */}
      <header className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold text-foreground">Following</h1>
          </div>
        </div>
      </header>

      <main className="container px-4 py-4">
        {/* Followed Channels */}
        <div className="mb-6">
          <h2 className="text-base font-semibold mb-3 text-foreground">
            Your Channels ({followedChannels.length})
          </h2>
          
          {followedChannels.length > 0 ? (
            <div className="space-y-2">
              {followedChannels.map((channel) => (
                <div
                  key={channel.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-card border border-border"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={channel.logo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${channel.name}`} />
                      <AvatarFallback>
                        {channel.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {channel.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {channel.followers_count} followers
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-xs"
                    onClick={() => handleUnfollow(channel.id, channel.name)}
                  >
                    <UserMinus className="h-3.5 w-3.5 mr-1" />
                    Unfollow
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-card rounded-xl border border-border">
              <Heart className="h-10 w-10 mx-auto mb-2 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No channels followed yet</p>
              <p className="text-xs text-muted-foreground mt-1">Follow channels from summary pages</p>
            </div>
          )}
        </div>

        {/* Recent from Following */}
        <div>
          <h2 className="text-base font-semibold mb-3 text-foreground flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary" />
            Latest from Following
          </h2>
          
          {followedSummaries.length > 0 ? (
            <div className="space-y-3">
              {followedSummaries.map((summary) => (
                <SummaryCard
                  key={summary.id}
                  id={summary.id}
                  title={summary.title}
                  channel={summary.channel?.name || "Unknown"}
                  channelLogo={summary.channel?.logo_url}
                  thumbnail={summary.thumbnail || ""}
                  readTime={summary.read_time_minutes}
                  listenTime={summary.listen_time_minutes}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Follow some channels to see their latest summaries here</p>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Following;
