import { Settings, Bookmark, Clock, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import SummaryCard from "@/components/SummaryCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ThemeToggle from "@/components/ThemeToggle";

const savedSummaries = [
  {
    id: "11",
    title: "The Future of AI and Machine Learning in 2024",
    channel: "Tech Insights",
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=225&fit=crop",
    readTime: 5,
    listenTime: 7,
    category: "Technology",
  },
  {
    id: "12",
    title: "Investment Strategies for Beginners: Complete Guide",
    channel: "Money Masters",
    thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=225&fit=crop",
    readTime: 6,
    listenTime: 8,
    category: "Finance",
  },
];

const recentlyViewed = [
  {
    id: "13",
    title: "10 Daily Habits for Better Mental Health",
    channel: "Wellness Today",
    thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=225&fit=crop",
    readTime: 4,
    listenTime: 6,
    category: "Health",
  },
];

const Profile = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Bar */}
      <header className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Profile</h1>
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

      <main className="container px-4 py-6">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-8 p-6 rounded-2xl bg-card border border-border">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=User" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <h2 className="text-2xl font-bold text-foreground mb-1">User Name</h2>
          <p className="text-muted-foreground mb-4">user@example.com</p>
          <Button variant="outline" size="sm">
            Edit Profile
          </Button>

          {/* Stats */}
          <div className="flex gap-8 mt-6 w-full justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">24</p>
              <p className="text-sm text-muted-foreground">Saved</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">156</p>
              <p className="text-sm text-muted-foreground">Read</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">12</p>
              <p className="text-sm text-muted-foreground">Following</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="saved" className="w-full">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="saved" className="flex-1">
              <Bookmark className="h-4 w-4 mr-2" />
              Saved
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex-1">
              <Clock className="h-4 w-4 mr-2" />
              Recent
            </TabsTrigger>
          </TabsList>

          <TabsContent value="saved" className="space-y-4">
            {savedSummaries.map((summary) => (
              <SummaryCard key={summary.id} {...summary} />
            ))}
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            {recentlyViewed.map((summary) => (
              <SummaryCard key={summary.id} {...summary} />
            ))}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
};

export default Profile;
