import { useState, useEffect, useMemo, useCallback } from "react";
import { ArrowLeft, Share2, Bookmark, Play, Pause, BookmarkCheck, UserPlus, UserCheck, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useSavedSummaries } from "@/hooks/use-saved-summaries";
import { useRecentSummaries } from "@/hooks/use-recent-summaries";
import { useSpeech } from "@/hooks/use-speech";
import { useFollowing } from "@/hooks/use-following";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSummaryById, summariesData, SummaryData } from "@/data/summaries";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";

interface DbSummary {
  id: string;
  title: string;
  thumbnail: string | null;
  youtube_url: string;
  intro: string;
  key_points: { title: string; items: string[] }[];
  read_time_minutes: number;
  listen_time_minutes: number;
  category: string;
  channel?: {
    id: string;
    name: string;
    logo_url: string | null;
    followers_count: number;
  } | null;
}

interface TranslatedContent {
  intro: string;
  keyPoints: { title: string; points: string[] }[];
}

const Summary = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const { isSaved, toggleSave } = useSavedSummaries();
  const { addToRecent } = useRecentSummaries();
  const { isPlaying, progress, duration, toggle, stop } = useSpeech();
  const { isFollowing, toggleFollow } = useFollowing();

  const [dbSummary, setDbSummary] = useState<DbSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [translatedContent, setTranslatedContent] = useState<TranslatedContent | null>(null);
  const [translating, setTranslating] = useState(false);

  // Fetch from database first
  useEffect(() => {
    const fetchSummary = async () => {
      if (!id) return;
      
      // Check if it's a UUID (database summary)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      if (isUUID) {
        try {
          const { data, error } = await supabase
            .from("summaries")
            .select(`
              *,
              channel:channels(id, name, logo_url, followers_count)
            `)
            .eq("id", id)
            .single();

          if (!error && data) {
            setDbSummary({
              ...data,
              key_points: data.key_points as { title: string; items: string[] }[],
            });
          }
        } catch (error) {
          console.error("Error fetching summary:", error);
        }
      }
      setLoading(false);
    };

    fetchSummary();
  }, [id]);

  // Get summary data - check database, then generated summaries, then static data
  const summaryData = useMemo(() => {
    // If we have a database summary, use it
    if (dbSummary) {
      return {
        id: dbSummary.id,
        title: dbSummary.title,
        channel: dbSummary.channel?.name || "Unknown",
        channelId: dbSummary.channel?.id || null,
        channelLogo: dbSummary.channel?.logo_url || null,
        thumbnail: dbSummary.thumbnail || "",
        readTime: dbSummary.read_time_minutes,
        listenTime: dbSummary.listen_time_minutes,
        category: dbSummary.category,
        subscribers: `${dbSummary.channel?.followers_count || 0} followers`,
        youtubeUrl: dbSummary.youtube_url,
        content: {
          intro: dbSummary.intro,
          points: dbSummary.key_points,
        },
      };
    }

    // Check if it's a generated summary
    if (id?.startsWith("generated-")) {
      const generatedSummaries = JSON.parse(localStorage.getItem("generatedSummaries") || "[]");
      const found = generatedSummaries.find((s: any) => `generated-${s.id}` === id);
      if (found) {
        return {
          ...found,
          channelId: null,
          channelLogo: null,
          subscribers: "0",
          content: {
            intro: found.intro,
            points: found.points,
          },
        };
      }
    }
    
    // Fall back to static data
    const staticData = getSummaryById(id || "1") || summariesData[0];
    return {
      ...staticData,
      channelId: null,
      channelLogo: null,
      content: staticData.content,
    };
  }, [id, dbSummary]);

  // Translate content when language changes for DB summaries
  const translateContent = useCallback(async () => {
    if (!dbSummary) return;
    
    const cacheKey = `translation_${dbSummary.id}_${language}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      setTranslatedContent(JSON.parse(cached));
      return;
    }

    setTranslating(true);
    try {
      const { data, error } = await supabase.functions.invoke('translate-summary', {
        body: {
          intro: dbSummary.intro,
          keyPoints: dbSummary.key_points.map(p => ({
            title: p.title,
            points: p.items
          })),
          targetLanguage: language
        }
      });

      if (error) throw error;

      if (data) {
        const translated: TranslatedContent = {
          intro: data.intro,
          keyPoints: data.keyPoints
        };
        setTranslatedContent(translated);
        localStorage.setItem(cacheKey, JSON.stringify(translated));
      }
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setTranslating(false);
    }
  }, [dbSummary, language]);

  useEffect(() => {
    if (dbSummary && !loading) {
      translateContent();
    }
  }, [dbSummary, language, loading, translateContent]);

  // Get display content (translated or original)
  const displayContent = useMemo(() => {
    if (translatedContent && dbSummary) {
      return {
        intro: translatedContent.intro,
        points: translatedContent.keyPoints.map(p => ({
          title: p.title,
          items: p.points
        }))
      };
    }
    return summaryData.content;
  }, [translatedContent, summaryData.content, dbSummary]);

  const isBookmarked = isSaved(summaryData.id);
  const isFollowingChannel = summaryData.channelId ? isFollowing(summaryData.channelId) : false;

  // Build speech text from content
  const speechText = useMemo(() => {
    let text = displayContent.intro + ". ";
    displayContent.points.forEach((point, i) => {
      text += `Point ${i + 1}: ${point.title}. `;
      point.items.forEach(item => {
        text += item + ". ";
      });
    });
    return text;
  }, [displayContent]);

  // Scroll to top and track as read when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
    if (!loading) {
      // Add to recently viewed
      addToRecent({
        id: summaryData.id,
        title: summaryData.title,
        channel: summaryData.channel,
        channelLogo: summaryData.channelLogo,
        thumbnail: summaryData.thumbnail,
        readTime: summaryData.readTime,
        listenTime: summaryData.listenTime,
        category: summaryData.category,
      });
    }
    
    // Stop speech when leaving
    return () => stop();
  }, [id, summaryData.id, loading]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleBookmark = () => {
    const summaryToSave = {
      id: summaryData.id,
      title: summaryData.title,
      channel: summaryData.channel,
      channelLogo: summaryData.channelLogo,
      thumbnail: summaryData.thumbnail,
      readTime: summaryData.readTime,
      listenTime: summaryData.listenTime,
      category: summaryData.category,
    };
    const wasSaved = toggleSave(summaryToSave);
    toast({
      title: wasSaved ? "Saved!" : "Removed from saved",
      description: wasSaved 
        ? "Summary added to your library" 
        : "Summary removed from your library",
      duration: 2000,
    });
  };

  const handleFollow = async () => {
    if (!summaryData.channelId) {
      toast({
        title: "Cannot follow",
        description: "Please login to follow channels",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to follow channels",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    const nowFollowing = await toggleFollow(summaryData.channelId);
    toast({
      title: nowFollowing ? "Following!" : "Unfollowed",
      description: nowFollowing 
        ? `You are now following ${summaryData.channel}` 
        : `You unfollowed ${summaryData.channel}`,
      duration: 2000,
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: summaryData.title,
      text: `Check out this summary: ${summaryData.title}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied!",
          description: "Summary link copied to clipboard",
          duration: 2000,
        });
      }
    } catch (error) {
      // User cancelled share
    }
  };

  const handleWatchYouTube = () => {
    window.open(summaryData.youtubeUrl, '_blank');
  };

  const handleAudioToggle = () => {
    toggle(speechText);
  };

  const totalSeconds = duration || summaryData.listenTime * 60;
  const avatarSeed = summaryData.channel.replace(/\s+/g, '');
  const channelLogo = summaryData.channelLogo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Bar */}
      <header className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="container flex items-center justify-between h-14 px-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-muted rounded-full transition-smooth"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex items-center gap-1">
            <button 
              onClick={handleShare}
              className="p-2 hover:bg-muted rounded-full transition-smooth"
            >
              <Share2 className="h-5 w-5 text-foreground" />
            </button>
            <button
              onClick={handleBookmark}
              className="p-2 hover:bg-muted rounded-full transition-smooth"
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-5 w-5 text-primary fill-primary" />
              ) : (
                <Bookmark className="h-5 w-5 text-foreground" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-4 max-w-2xl">
        {/* Video Thumbnail - Clickable to open YouTube */}
        <div 
          className="relative aspect-video rounded-xl overflow-hidden mb-4 shadow-md group cursor-pointer"
          onClick={handleWatchYouTube}
        >
          <img
            src={summaryData.thumbnail}
            alt="Video thumbnail"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-200 shadow-lg">
              <Play className="h-6 w-6 text-primary-foreground ml-1" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-lg sm:text-xl font-bold mb-3 text-foreground leading-snug">
          {summaryData.title}
        </h1>

        {/* Creator Bar */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-9 w-9">
              <AvatarImage src={channelLogo} />
              <AvatarFallback>{summaryData.channel[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-foreground">{summaryData.channel}</p>
              <p className="text-xs text-muted-foreground">{summaryData.subscribers}</p>
            </div>
          </div>
          {summaryData.channelId && (
            <Button 
              size="sm" 
              variant={isFollowingChannel ? "outline" : "default"}
              className="h-8 text-xs px-3"
              onClick={handleFollow}
            >
              {isFollowingChannel ? (
                <>
                  <UserCheck className="h-3.5 w-3.5 mr-1" />
                  {t("summary.following")}
                </>
              ) : (
                <>
                  <UserPlus className="h-3.5 w-3.5 mr-1" />
                  {t("summary.follow")}
                </>
              )}
            </Button>
          )}
        </div>

        {/* Audio Player */}
        <div className="sticky top-14 z-10 bg-card border border-border rounded-xl p-3 mb-4 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={handleAudioToggle}
              className="w-9 h-9 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center transition-smooth flex-shrink-0"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 text-primary-foreground" />
              ) : (
                <Play className="h-4 w-4 text-primary-foreground ml-0.5" />
              )}
            </button>
            <div className="flex-1">
              <Slider
                value={[progress]}
                max={totalSeconds}
                step={1}
                className="w-full"
              />
            </div>
            <span className="text-xs text-muted-foreground font-medium tabular-nums">
              {formatTime(progress)} / {formatTime(totalSeconds)}
            </span>
          </div>
        </div>

        {/* Summary Content */}
        <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
            <span className="w-1.5 h-5 bg-primary rounded-full"></span>
            {t("summary.keyPoints")}
            {translating && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-2" />
            )}
          </h2>
          
          <div className="space-y-4 text-foreground/90 text-base leading-relaxed">
            <p className="text-muted-foreground text-base">
              {displayContent.intro}
            </p>

            {displayContent.points.map((point, index) => (
              <div key={index} className="bg-muted/50 rounded-lg p-4">
                <h3 className="text-base font-semibold mb-2 text-foreground flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                  {point.title}
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground pl-8">
                  {point.items.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Watch on YouTube Button */}
        <div className="mt-4">
          <Button 
            className="w-full h-11 text-sm font-semibold" 
            size="lg"
            onClick={handleWatchYouTube}
          >
            {t("summary.watchOnYoutube")}
          </Button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Summary;
