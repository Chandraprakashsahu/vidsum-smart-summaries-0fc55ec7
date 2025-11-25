import { Heart, Sparkles } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import SummaryCard from "@/components/SummaryCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const followedCreators = [
  {
    id: "1",
    name: "Tech Insights",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tech",
    subscribers: "1.2M",
  },
  {
    id: "2",
    name: "Money Masters",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Money",
    subscribers: "850K",
  },
  {
    id: "3",
    name: "Wellness Today",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Wellness",
    subscribers: "620K",
  },
];

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
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Bar */}
      <header className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Following</h1>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6">
        {/* Followed Creators */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-foreground">
            Your Creators
          </h2>
          <div className="space-y-3">
            {followedCreators.map((creator) => (
              <div
                key={creator.id}
                className="flex items-center justify-between p-3 rounded-xl bg-card border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={creator.avatar} />
                    <AvatarFallback>
                      {creator.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">
                      {creator.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {creator.subscribers} subscribers
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Following
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent from Following */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Latest from Following
          </h2>
          <div className="space-y-4">
            {recentSummaries.map((summary) => (
              <SummaryCard key={summary.id} {...summary} />
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Following;
