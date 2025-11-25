import { useState } from "react";
import { TrendingUp, Sparkles } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import CategoryPills from "@/components/CategoryPills";
import SummaryCard from "@/components/SummaryCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const categories = [
  "All",
  "Technology",
  "Finance",
  "Health",
  "Science",
  "Podcast",
];

const trendingSummaries = [
  {
    id: "5",
    title: "Breaking: Major AI Breakthrough Announced",
    channel: "Tech News Daily",
    thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=225&fit=crop",
    readTime: 4,
    listenTime: 6,
    category: "Technology",
  },
  {
    id: "6",
    title: "Stock Market Analysis: What You Need to Know",
    channel: "Financial Times",
    thumbnail: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=225&fit=crop",
    readTime: 5,
    listenTime: 7,
    category: "Finance",
  },
];

const curatedCollections = [
  {
    title: "Best of Tech 2024",
    summaries: [
      {
        id: "7",
        title: "How AI is Transforming Healthcare",
        channel: "Medical Insights",
        thumbnail: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=225&fit=crop",
        readTime: 6,
        listenTime: 8,
        category: "Health",
      },
      {
        id: "8",
        title: "The Rise of Quantum Computing",
        channel: "Future Tech",
        thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=225&fit=crop",
        readTime: 7,
        listenTime: 9,
        category: "Technology",
      },
    ],
  },
];

const Explore = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");

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
              <div className="space-y-4">
                {trendingSummaries.map((summary) => (
                  <SummaryCard key={summary.id} {...summary} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="collections" className="space-y-6">
            {curatedCollections.map((collection, idx) => (
              <div key={idx}>
                <h2 className="text-lg font-semibold mb-4 text-foreground">
                  {collection.title}
                </h2>
                <div className="space-y-4">
                  {collection.summaries.map((summary) => (
                    <SummaryCard key={summary.id} {...summary} />
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="categories">
            <CategoryPills
              categories={categories}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
            <div className="mt-6 space-y-4">
              {trendingSummaries
                .filter(
                  (s) =>
                    selectedCategory === "All" ||
                    s.category === selectedCategory
                )
                .map((summary) => (
                  <SummaryCard key={summary.id} {...summary} />
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
};

export default Explore;
