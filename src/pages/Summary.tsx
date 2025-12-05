import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Share2, Bookmark, Play, Pause, BookmarkCheck, UserPlus, UserCheck } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useSavedSummaries } from "@/hooks/use-saved-summaries";
import { useFollowing } from "@/hooks/use-following";
import { useRecentSummaries } from "@/hooks/use-recent-summaries";
import { useSpeech } from "@/hooks/use-speech";
import { getSummaryById, summariesData, SummaryData } from "@/data/summaries";
import BottomNav from "@/components/BottomNav";

const Summary = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { isSaved, toggleSave } = useSavedSummaries();
  const { isFollowing, toggleFollow } = useFollowing();
  const { addToRecent } = useRecentSummaries();
  const { isPlaying, progress, duration, toggle, stop } = useSpeech();

  // Get summary data - check generated summaries first, then static data
  const summaryData = useMemo(() => {
    // Check if it's a generated summary
    if (id?.startsWith("generated-")) {
      const generatedSummaries = JSON.parse(localStorage.getItem("generatedSummaries") || "[]");
      const found = generatedSummaries.find((s: any) => `generated-${s.id}` === id);
      if (found) {
        return {
          ...found,
          content: {
            intro: found.intro,
            points: found.points,
          },
        } as SummaryData;
      }
    }
    
    // Fall back to static data
    return getSummaryById(id || "1") || summariesData[0];
  }, [id]);

  const isBookmarked = isSaved(summaryData.id);
  const isFollowingCreator = isFollowing(summaryData.channel);

  // Build speech text from content
  const speechText = useMemo(() => {
    let text = summaryData.content.intro + ". ";
    summaryData.content.points.forEach((point, i) => {
      text += `Point ${i + 1}: ${point.title}. `;
      point.items.forEach(item => {
        text += item + ". ";
      });
    });
    return text;
  }, [summaryData]);

  // Scroll to top and track as read when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
    // Add to recently viewed
    addToRecent({
      id: summaryData.id,
      title: summaryData.title,
      channel: summaryData.channel,
      thumbnail: summaryData.thumbnail,
      readTime: summaryData.readTime,
      listenTime: summaryData.listenTime,
      category: summaryData.category,
    });
    
    // Stop speech when leaving
    return () => stop();
  }, [id, summaryData.id]);

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

  const handleFollow = () => {
    const creator = {
      id: summaryData.channel.toLowerCase().replace(/\s/g, '-'),
      name: summaryData.channel,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${summaryData.channel}`,
      subscribers: summaryData.subscribers,
    };
    const nowFollowing = toggleFollow(creator);
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
        {/* Video Thumbnail */}
        <div className="relative aspect-video rounded-xl overflow-hidden mb-4 shadow-md group">
          <img
            src={summaryData.thumbnail}
            alt="Video thumbnail"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-center justify-center">
            <div 
              onClick={handleWatchYouTube}
              className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center cursor-pointer hover:bg-primary hover:scale-110 transition-all duration-200 shadow-lg"
            >
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
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${summaryData.channel}`} />
              <AvatarFallback>{summaryData.channel[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-foreground">{summaryData.channel}</p>
              <p className="text-xs text-muted-foreground">{summaryData.subscribers} subscribers</p>
            </div>
          </div>
          <Button 
            size="sm" 
            variant={isFollowingCreator ? "outline" : "default"}
            className="h-8 text-xs px-3"
            onClick={handleFollow}
          >
            {isFollowingCreator ? (
              <>
                <UserCheck className="h-3.5 w-3.5 mr-1" />
                Following
              </>
            ) : (
              <>
                <UserPlus className="h-3.5 w-3.5 mr-1" />
                Follow
              </>
            )}
          </Button>
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
        <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
          <h2 className="text-base font-semibold mb-3 text-foreground flex items-center gap-2">
            <span className="w-1 h-4 bg-primary rounded-full"></span>
            मुख्य बिंदु (Key Points)
          </h2>
          
          <div className="space-y-3 text-foreground/85 text-sm leading-relaxed">
            <p className="text-muted-foreground">
              {summaryData.content.intro}
            </p>

            {summaryData.content.points.map((point, index) => (
              <div key={index} className="bg-muted/50 rounded-lg p-3">
                <h3 className="text-sm font-semibold mb-2 text-foreground flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                  {point.title}
                </h3>
                <ul className="space-y-1 text-xs text-muted-foreground pl-7">
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
            Watch on YouTube
          </Button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Summary;
