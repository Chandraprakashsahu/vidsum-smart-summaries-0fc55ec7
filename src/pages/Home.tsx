import { useState } from "react";
import { Search, Sparkles, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import CategoryPills from "@/components/CategoryPills";
import SummaryCard from "@/components/SummaryCard";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useSummaries } from "@/hooks/use-summaries";
import { summariesData } from "@/data/summaries";

const categories = [
  "All",
  "Technology",
  "Finance",
  "Health",
  "Science",
  "Podcast",
];

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const { summaries, loading } = useSummaries(selectedCategory === "All" ? undefined : selectedCategory);

  // Combine database summaries with static data for now
  const dbSummaries = summaries.map((s) => ({
    id: s.id,
    title: s.title,
    channel: s.channel?.name || "Unknown",
    channelLogo: s.channel?.logo_url || null,
    thumbnail: s.thumbnail || "",
    readTime: s.read_time_minutes,
    listenTime: s.listen_time_minutes,
    category: s.category,
  }));

  const staticSummaries = summariesData.map((s) => ({
    id: s.id,
    title: s.title,
    channel: s.channel,
    channelLogo: null,
    thumbnail: s.thumbnail,
    readTime: s.readTime,
    listenTime: s.listenTime,
    category: s.category,
  }));

  // Prioritize database summaries, then static
  const allSummaries = [...dbSummaries, ...staticSummaries];

  const filteredSummaries = allSummaries.filter((summary) => {
    const matchesCategory =
      selectedCategory === "All" || summary.category === selectedCategory;
    const matchesSearch = summary.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Bar */}
      <header className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">VidSum</h1>
          </div>
          <div className="flex items-center gap-2">
            {!user && (
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="gap-1">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Login</span>
                </Button>
              </Link>
            )}
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              <Search className="h-5 w-5 text-foreground" />
            </button>
            <ThemeToggle />
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4">
          <Input
            type="search"
            placeholder="Search summaries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Category Pills */}
        <CategoryPills
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </header>

      {/* Main Feed */}
      <main className="container px-4 py-6">
        <h2 className="text-lg font-semibold mb-4 text-foreground">
          Latest Summaries
        </h2>
        
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex gap-4 p-3 rounded-xl bg-card">
                <div className="w-32 h-20 bg-muted rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSummaries.map((summary) => (
              <SummaryCard
                key={summary.id}
                id={summary.id}
                title={summary.title}
                channel={summary.channel}
                channelLogo={summary.channelLogo}
                thumbnail={summary.thumbnail}
                readTime={summary.readTime}
                listenTime={summary.listenTime}
              />
            ))}
            {filteredSummaries.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>No summaries found</p>
              </div>
            )}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Home;
