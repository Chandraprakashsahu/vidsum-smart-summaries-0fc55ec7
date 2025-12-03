import { Heart, Sparkles, UserMinus } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import SummaryCard from "@/components/SummaryCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useFollowing } from "@/hooks/use-following";
import { useToast } from "@/hooks/use-toast";

const recentSummaries = [
  {
    id: "9",
    title: "Latest Tech Trends You Can't Miss",
    channel: "Tech Insights",
    thumbnail: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=225&fit=crop",
    readTime: 5,
    listenTime: 7,
    category: "Technology",
  },
  {
    id: "10",
    title: "Smart Money Moves for 2024",
    channel: "Money Masters",
    thumbnail: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=225&fit=crop",
    readTime: 6,
    listenTime: 8,
    category: "Finance",
  },
];

const Following = () => {
  const { following, unfollowCreator, isFollowing } = useFollowing();
  const { toast } = useToast();

  const handleUnfollow = (id: string, name: string) => {
    unfollowCreator(id);
    toast({
      title: "Unfollowed",
      description: `You unfollowed ${name}`,
      duration: 2000,
    });
  };

  // Filter summaries to show only from followed creators
  const filteredSummaries = recentSummaries.filter(s => isFollowing(s.channel));

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
        {/* Followed Creators */}
        <div className="mb-6">
          <h2 className="text-base font-semibold mb-3 text-foreground">
            Your Creators ({following.length})
          </h2>
          
          {following.length > 0 ? (
            <div className="space-y-2">
              {following.map((creator) => (
                <div
                  key={creator.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-card border border-border"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={creator.avatar} />
                      <AvatarFallback>
                        {creator.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {creator.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {creator.subscribers} subscribers
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-xs"
                    onClick={() => handleUnfollow(creator.id, creator.name)}
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
              <p className="text-sm text-muted-foreground">No creators followed yet</p>
              <p className="text-xs text-muted-foreground mt-1">Follow creators from summary pages</p>
            </div>
          )}
        </div>

        {/* Recent from Following */}
        <div>
          <h2 className="text-base font-semibold mb-3 text-foreground flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary" />
            Latest from Following
          </h2>
          
          {filteredSummaries.length > 0 ? (
            <div className="space-y-3">
              {filteredSummaries.map((summary) => (
                <SummaryCard key={summary.id} {...summary} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Follow some creators to see their latest summaries here</p>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Following;
