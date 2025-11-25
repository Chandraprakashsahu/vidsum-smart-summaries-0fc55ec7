import { useState } from "react";
import { Link2, Sparkles, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const Add = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [customNotes, setCustomNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      toast({
        title: "URL Required",
        description: "Please enter a YouTube video URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Summary Generated!",
        description: "Your video summary has been created successfully.",
      });
      navigate("/home");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Bar */}
      <header className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Add Summary</h1>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6 max-w-2xl">
        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="mb-6 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <Link2 className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-foreground">
              Create New Summary
            </h2>
            <p className="text-muted-foreground">
              Enter a YouTube URL to generate a summary
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="url">YouTube URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Paste any YouTube video link
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Custom Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any specific points you want to focus on..."
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                disabled={isLoading}
                rows={4}
              />
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Generating Summary...
                  </>
                ) : (
                  "Generate Summary"
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate("/home")}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>

          <div className="mt-6 p-4 rounded-lg bg-secondary/50">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Tip:</strong> Our AI will
              analyze the video content and create a concise summary with key
              points, timestamps, and text-to-speech audio.
            </p>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Add;
