import { useState, useEffect } from "react";
import { Link2, Sparkles, Loader2, Edit3, Save, X, Play, ExternalLink, Lock, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { calculateReadTime, calculateListenTime } from "@/hooks/use-summaries";
import { useSpeech } from "@/hooks/use-speech";

interface BilingualContent {
  intro: string;
  keyPoints: { title: string; items: string[] }[];
}

interface GeneratedSummary {
  id: string;
  title: string;
  channel: string;
  channelLogo?: string | null;
  category: string;
  thumbnail: string;
  youtubeUrl: string;
  videoId: string;
  readTime: number;
  listenTime: number;
  content_en: BilingualContent;
  content_hi: BilingualContent;
}

const categories = ["Technology", "Finance", "Health", "Science", "Podcast", "Entertainment", "Education"];

const STORAGE_KEY = "vidsum_temp_data";

const Add = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isSuperAdmin } = useAuth();
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // State Initialization
  const [url, setUrl] = useState("");
  const [customNotes, setCustomNotes] = useState("");
  const [generatedSummary, setGeneratedSummary] = useState<GeneratedSummary | null>(null);
  const [editedContentEn, setEditedContentEn] = useState<BilingualContent | null>(null);
  const [editedContentHi, setEditedContentHi] = useState<BilingualContent | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("Technology");
  
  const [isEditing, setIsEditing] = useState(false);
  
  const { speak, stop, isPlaying: speaking } = useSpeech();
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const displayContent = language === "hi" ? editedContentHi : editedContentEn;

  // 1. Load saved data from Session Storage on mount
  useEffect(() => {
    const savedData = sessionStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.generatedSummary) {
          setGeneratedSummary(parsed.generatedSummary);
          setEditedContentEn(parsed.editedContentEn);
          setEditedContentHi(parsed.editedContentHi);
          setUrl(parsed.url);
          setSelectedCategory(parsed.selectedCategory);
          setCustomNotes(parsed.customNotes);
        }
      } catch (e) {
        console.error("Failed to parse saved summary", e);
      }
    }
  }, []);

  // 2. Save data to Session Storage whenever important state changes
  useEffect(() => {
    if (generatedSummary) {
      const dataToSave = {
        generatedSummary,
        editedContentEn,
        editedContentHi,
        url,
        selectedCategory,
        customNotes
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    }
  }, [generatedSummary, editedContentEn, editedContentHi, url, selectedCategory, customNotes]);

  // Clear storage helper
  const clearStorage = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setGeneratedSummary(null);
    setEditedContentEn(null);
    setEditedContentHi(null);
    setUrl("");
    setCustomNotes("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      toast({ title: "URL Required", description: "Please enter a YouTube video URL", variant: "destructive" });
      return;
    }

    const isValidYouTube = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)/.test(url);
    if (!isValidYouTube) {
      toast({ title: "Invalid URL", description: "Please enter a valid YouTube video URL", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    // Clear old data before generating new
    setGeneratedSummary(null);
    
    try {
      const { data, error } = await supabase.functions.invoke("generate-summary", {
        body: { url, customNotes },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const readTime = calculateReadTime(
        data.content_en?.intro || "", 
        data.content_en?.keyPoints?.map((p: any) => ({ title: p.title, items: p.items })) || []
      );
      const listenTime = calculateListenTime(
        data.content_en?.intro || "", 
        data.content_en?.keyPoints?.map((p: any) => ({ title: p.title, items: p.items })) || []
      );

      const summaryWithTimes: GeneratedSummary = {
        id: data.id,
        title: data.title,
        channel: data.channel,
        channelLogo: data.channelLogo,
        category: data.category || "Technology",
        thumbnail: data.thumbnail,
        youtubeUrl: data.youtubeUrl,
        videoId: data.videoId,
        readTime,
        listenTime,
        content_en: data.content_en,
        content_hi: data.content_hi,
      };

      setGeneratedSummary(summaryWithTimes);
      setEditedContentEn(data.content_en);
      setEditedContentHi(data.content_hi);
      setSelectedCategory(data.category || "Technology");

      toast({
        title: "Summary Generated!",
        description: isSuperAdmin ? "Review, edit, then upload to save." : "Summary generated successfully!",
      });
    } catch (error) {
      console.error("Error generating summary:", error);
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to generate summary", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => setIsEditing(true);

  const handleCancelEdit = () => {
    if (generatedSummary) {
      setEditedContentEn(generatedSummary.content_en);
      setEditedContentHi(generatedSummary.content_hi);
    }
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    if (generatedSummary && editedContentEn && editedContentHi) {
      const readTime = calculateReadTime(editedContentEn.intro, editedContentEn.keyPoints.map(p => ({ title: p.title, items: p.items })));
      const listenTime = calculateListenTime(editedContentEn.intro, editedContentEn.keyPoints.map(p => ({ title: p.title, items: p.items })));
      
      setGeneratedSummary({
        ...generatedSummary,
        content_en: editedContentEn,
        content_hi: editedContentHi,
        readTime,
        listenTime,
      });
    }
    setIsEditing(false);
    toast({ title: "Changes Saved", description: "Your edits have been applied." });
  };

  const handleUpload = async () => {
    if (!generatedSummary || !isSuperAdmin || !editedContentEn || !editedContentHi) return;
    setIsUploading(true);

    try {
      let channelId: string;
      const { data: existingChannel } = await supabase.from("channels").select("id").eq("name", generatedSummary.channel).maybeSingle();

      if (existingChannel) {
        channelId = existingChannel.id;
        if (generatedSummary.channelLogo) {
          await supabase.from("channels").update({ logo_url: generatedSummary.channelLogo }).eq("id", existingChannel.id);
        }
      } else {
        const avatarSeed = generatedSummary.channel.replace(/\s+/g, '');
        const logoUrl = generatedSummary.channelLogo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;
        const { data: newChannel, error } = await supabase.from("channels").insert({ name: generatedSummary.channel, logo_url: logoUrl }).select("id").single();
        if (error) throw error;
        channelId = newChannel.id;
      }

      const { error: summaryError } = await supabase.from("summaries").insert([{
        youtube_url: generatedSummary.youtubeUrl,
        youtube_video_id: generatedSummary.videoId,
        title: generatedSummary.title,
        thumbnail: generatedSummary.thumbnail,
        channel_id: channelId,
        category: selectedCategory,
        intro: editedContentEn.intro,
        key_points: editedContentEn.keyPoints.map(p => ({ title: p.title, items: p.items })),
        content_en: JSON.parse(JSON.stringify(editedContentEn)),
        content_hi: JSON.parse(JSON.stringify(editedContentHi)),
        read_time_minutes: generatedSummary.readTime,
        listen_time_minutes: generatedSummary.listenTime,
        uploaded_by: user?.id,
      }]);

      if (summaryError) throw summaryError;

      // Clear storage on successful upload
      sessionStorage.removeItem(STORAGE_KEY);

      toast({ title: "Summary Uploaded!", description: "Published successfully." });
      navigate("/home");
    } catch (error) {
      console.error("Error uploading:", error);
      toast({ title: "Upload Failed", description: "Failed to upload summary", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handlePlayAudio = () => {
    if (speaking) {
      stop();
    } else if (displayContent) {
      const textToSpeak = `${displayContent.intro}. ${displayContent.keyPoints.map(p => `${p.title}. ${p.items.join('. ')}`).join('. ')}`;
      speak(textToSpeak);
    }
  };

  const handleIntroChange = (newIntro: string) => {
    if (language === "hi" && editedContentHi) {
      setEditedContentHi({ ...editedContentHi, intro: newIntro });
    } else if (editedContentEn) {
      setEditedContentEn({ ...editedContentEn, intro: newIntro });
    }
  };

  const handlePointTitleChange = (index: number, newTitle: string) => {
    if (language === "hi" && editedContentHi) {
      const updated = [...editedContentHi.keyPoints];
      updated[index] = { ...updated[index], title: newTitle };
      setEditedContentHi({ ...editedContentHi, keyPoints: updated });
    } else if (editedContentEn) {
      const updated = [...editedContentEn.keyPoints];
      updated[index] = { ...updated[index], title: newTitle };
      setEditedContentEn({ ...editedContentEn, keyPoints: updated });
    }
  };

  const handlePointItemChange = (pointIndex: number, itemIndex: number, newItem: string) => {
    if (language === "hi" && editedContentHi) {
      const updated = [...editedContentHi.keyPoints];
      updated[pointIndex].items[itemIndex] = newItem;
      setEditedContentHi({ ...editedContentHi, keyPoints: updated });
    } else if (editedContentEn) {
      const updated = [...editedContentEn.keyPoints];
      updated[pointIndex].items[itemIndex] = newItem;
      setEditedContentEn({ ...editedContentEn, keyPoints: updated });
    }
  };

  const handleWatchYouTube = () => {
    if (generatedSummary?.youtubeUrl) {
      window.open(generatedSummary.youtubeUrl, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Generate Summary</h1>
          </div>
          {isSuperAdmin && (
            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
              Admin
            </span>
          )}
        </div>
      </header>

      <main className="container px-4 py-6 max-w-2xl">
        {!generatedSummary ? (
          <div className="p-6 rounded-2xl bg-card border border-border">
            <div className="mb-6 text-center">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <Link2 className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-foreground">
                Generate Summary
              </h2>
              <p className="text-muted-foreground">
                Enter a YouTube URL to generate a summary (English + Hindi)
              </p>
              {!isSuperAdmin && (
                <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1">
                  <Lock className="h-3 w-3" />
                  Only admins can upload summaries to the app
                </p>
              )}
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
                <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Summary"
                  )}
                </Button>
                
                <Button type="button" variant="outline" className="w-full" onClick={() => navigate("/home")} disabled={isLoading}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Video Thumbnail */}
            <div className="relative aspect-video rounded-xl overflow-hidden shadow-md group cursor-pointer" onClick={handleWatchYouTube}>
              <img src={generatedSummary.thumbnail} alt="Video thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-200 shadow-lg">
                  <Play className="h-6 w-6 text-primary-foreground ml-1" />
                </div>
              </div>
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-white font-semibold text-lg line-clamp-2">{generatedSummary.title}</h3>
                <p className="text-white/80 text-sm">{generatedSummary.channel}</p>
              </div>
            </div>

            {/* Channel Info - REMOVED FOLLOW BUTTON */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={generatedSummary.channelLogo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${generatedSummary.channel.replace(/\s+/g, '')}`} />
                  <AvatarFallback>{generatedSummary.channel[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">{generatedSummary.channel}</p>
                  <p className="text-xs text-muted-foreground">YouTube Channel</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {supported && (
                  <Button variant="outline" size="sm" onClick={handlePlayAudio} className="gap-1">
                    <Volume2 className={`h-4 w-4 ${speaking ? "text-primary animate-pulse" : ""}`} />
                    {speaking ? "Stop" : "Listen"}
                  </Button>
                )}
              </div>
            </div>

            {/* Summary Content Card */}
            <div className="p-5 rounded-2xl bg-card border border-border">
              <div className="flex items-center justify-between mb-4">
                {isSuperAdmin && isEditing ? (
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {selectedCategory}
                  </span>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{generatedSummary.readTime} min read</span>
                  <span>•</span>
                  <span>{generatedSummary.listenTime} min listen</span>
                </div>
              </div>

              {/* Intro & Key Points Rendering */}
              <div className="mb-4">
                <Label className="text-sm font-medium mb-2 block">Introduction</Label>
                {isEditing ? (
                  <Textarea value={displayContent?.intro || ""} onChange={(e) => handleIntroChange(e.target.value)} rows={3} className="text-sm" />
                ) : (
                  <p className="text-muted-foreground text-sm leading-relaxed">{displayContent?.intro}</p>
                )}
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-medium">Key Points</Label>
                {displayContent?.keyPoints.map((point, pIndex) => (
                  <div key={pIndex} className="p-3 rounded-lg bg-secondary/50">
                    {isEditing ? (
                      <Input value={point.title} onChange={(e) => handlePointTitleChange(pIndex, e.target.value)} className="font-medium mb-2" />
                    ) : (
                      <h4 className="font-medium text-foreground mb-2">{point.title}</h4>
                    )}
                    <ul className="space-y-1">
                      {point.items.map((item, iIndex) => (
                        <li key={iIndex} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          {isEditing ? (
                            <Input value={item} onChange={(e) => handlePointItemChange(pIndex, iIndex, e.target.value)} className="text-sm flex-1" />
                          ) : (
                            <span className="text-muted-foreground text-sm">{item}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              {isSuperAdmin && (
                <div className="flex gap-3 mt-6">
                  {isEditing ? (
                    <>
                      <Button onClick={handleSaveEdit} className="flex-1">
                        <Save className="h-4 w-4 mr-2" /> Save
                      </Button>
                      <Button variant="outline" onClick={handleCancelEdit}>
                        <X className="h-4 w-4 mr-2" /> Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" onClick={handleEdit} className="flex-1">
                        <Edit3 className="h-4 w-4 mr-2" /> Edit
                      </Button>
                      <Button onClick={handleUpload} className="flex-1" disabled={isUploading}>
                        {isUploading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...</> : <><Save className="h-4 w-4 mr-2" /> Upload & Publish</>}
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>

            <Button variant="outline" className="w-full" onClick={handleWatchYouTube}>
              <ExternalLink className="h-4 w-4 mr-2" /> Watch Original on YouTube
            </Button>

            {/* Clear Data on Generate Another */}
            <Button variant="ghost" className="w-full" onClick={clearStorage}>
              Generate Another Summary
            </Button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Add;