import { useState } from "react";
import { TrendingUp, Sparkles } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import CategoryPills from "@/components/CategoryPills";
import SummaryCard from "@/components/SummaryCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useExploreSummaries, calculateReadTime, calculateListenTime } from "@/hooks/use-summaries";
import { Skeleton } from "@/components/ui/skeleton";

const categories = [
  "All",
  "Technology",
  "Finance",
  "Health",
  "Science",
  "Podcast",
];

const Explore = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { summaries, loading } = useExploreSummaries();

  // Filter summaries by category
  const filteredSummaries = selectedCategory === "All" 
    ? summaries 
    : summaries.filter(s => s.category === selectedCategory);

  // Get trending (most recent) summaries
  const trendingSummaries = [...summaries]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

  // Create collections by category
  const techSummaries = summaries.filter(s => s.category === "Technology").slice(0, 5);
  const financeSummaries = summaries.filter(s => s.category === "Finance").slice(0, 5);

  const renderSummaryCard = (summary: typeof summaries[0]) => (
    <SummaryCard
      key={summary.id}
      id={summary.id}
      title={summary.title}
      channel={summary.channel?.name || "Unknown"}
      channelLogo={summary.channel?.logo_url}
      thumbnail={summary.thumbnail || "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400&h=225&fit=crop"}
      readTime={summary.read_time_minutes || calculateReadTime(summary.intro, summary.key_points as any)}
      listenTime={summary.listen_time_minutes || calculateListenTime(summary.intro, summary.key_points as any)}
    />
  );

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-4 p-3 rounded-xl bg-card">
          <Skeleton className="w-32 h-20 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Bar */}
      <header className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Explore</h1>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6">
        <Tabs defaultValue="trending" className="w-full">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="trending" className="flex-1">
              <TrendingUp className="h-4 w-4 mr-2" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="collections" className="flex-1">
              Collections
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex-1">
              Categories
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trending" className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Trending Now
              </h2>
              {loading ? (
                <LoadingSkeleton />
              ) : trendingSummaries.length > 0 ? (
                <div className="space-y-4">
                  {trendingSummaries.map(renderSummaryCard)}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No summaries available yet</p>
                  <p className="text-sm mt-1">Check back later for trending content</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="collections" className="space-y-6">
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <>
                {techSummaries.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold mb-4 text-foreground">
                      Best of Tech
                    </h2>
                    <div className="space-y-4">
                      {techSummaries.map(renderSummaryCard)}
                    </div>
                  </div>
                )}
                {financeSummaries.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold mb-4 text-foreground">
                      Finance Insights
                    </h2>
                    <div className="space-y-4">
                      {financeSummaries.map(renderSummaryCard)}
                    </div>
                  </div>
                )}
                {techSummaries.length === 0 && financeSummaries.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No collections available yet</p>
                    <p className="text-sm mt-1">Collections will appear as more content is added</p>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="categories">
            <CategoryPills
              categories={categories}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
            <div className="mt-6 space-y-4">
              {loading ? (
                <LoadingSkeleton />
              ) : filteredSummaries.length > 0 ? (
                filteredSummaries.map(renderSummaryCard)
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No summaries in this category</p>
                  <p className="text-sm mt-1">Try selecting a different category</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
};

export default Explore;
