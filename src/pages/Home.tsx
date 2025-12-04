import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import BottomNav from "@/components/BottomNav";
import CategoryPills from "@/components/CategoryPills";
import SummaryCard from "@/components/SummaryCard";
import ThemeToggle from "@/components/ThemeToggle";
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

  const filteredSummaries = summariesData.filter((summary) => {
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
        <div className="space-y-4">
          {filteredSummaries.map((summary) => (
            <SummaryCard key={summary.id} {...summary} />
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Home;
