import { useState, useEffect } from "react";
import { ArrowLeft, Share2, Bookmark, Play, Pause, BookmarkCheck, UserPlus, UserCheck } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useSavedSummaries } from "@/hooks/use-saved-summaries";
import { useFollowing } from "@/hooks/use-following";
import { useRecentSummaries } from "@/hooks/use-recent-summaries";
import BottomNav from "@/components/BottomNav";

// Demo summary data - in real app this would come from API
const summaryData = {
  id: "1",
  title: "The Future of AI and Machine Learning in 2024",
  channel: "Tech Insights",
  thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop",
  readTime: 5,
  listenTime: 7,
  category: "Technology",
  subscribers: "1.2M",
};

const Summary = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const { isSaved, toggleSave } = useSavedSummaries();
  const { isFollowing, toggleFollow } = useFollowing();
  const { addToRecent } = useRecentSummaries();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState([0]);

  // Use the id from URL params, fallback to demo data
  const currentSummary = { ...summaryData, id: id || summaryData.id };
  const isBookmarked = isSaved(currentSummary.id);
  const isFollowingCreator = isFollowing(currentSummary.channel);

  // Scroll to top and track as read when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
    // Add to recently viewed
    addToRecent({
      id: currentSummary.id,
      title: currentSummary.title,
      channel: currentSummary.channel,
      thumbnail: currentSummary.thumbnail,
      readTime: currentSummary.readTime,
      listenTime: currentSummary.listenTime,
      category: currentSummary.category,
    });
  }, [id]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleBookmark = () => {
    const wasSaved = toggleSave(currentSummary);
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
      id: currentSummary.channel.toLowerCase().replace(/\s/g, '-'),
      name: currentSummary.channel,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentSummary.channel}`,
      subscribers: currentSummary.subscribers,
    };
    const nowFollowing = toggleFollow(creator);
    toast({
      title: nowFollowing ? "Following!" : "Unfollowed",
      description: nowFollowing 
        ? `You are now following ${currentSummary.channel}` 
        : `You unfollowed ${currentSummary.channel}`,
      duration: 2000,
    });
  };

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
            <button className="p-2 hover:bg-muted rounded-full transition-smooth">
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
            src={currentSummary.thumbnail}
            alt="Video thumbnail"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center cursor-pointer hover:bg-primary hover:scale-110 transition-all duration-200 shadow-lg">
              <Play className="h-6 w-6 text-primary-foreground ml-1" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-lg sm:text-xl font-bold mb-3 text-foreground leading-snug">
          {currentSummary.title}
        </h1>

        {/* Creator Bar */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-9 w-9">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentSummary.channel}`} />
              <AvatarFallback>{currentSummary.channel[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-foreground">{currentSummary.channel}</p>
              <p className="text-xs text-muted-foreground">{currentSummary.subscribers} subscribers</p>
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
              onClick={() => setIsPlaying(!isPlaying)}
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
                value={progress}
                onValueChange={setProgress}
                max={420}
                step={1}
                className="w-full"
              />
            </div>
            <span className="text-xs text-muted-foreground font-medium tabular-nums">
              {formatTime(progress[0])} / 07:00
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
              आर्टिफिशियल इंटेलिजेंस (AI) और मशीन लर्निंग 2024 में तकनीक के सबसे महत्वपूर्ण क्षेत्र बन गए हैं।
            </p>

            <div className="bg-muted/50 rounded-lg p-3">
              <h3 className="text-sm font-semibold mb-2 text-foreground flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">1</span>
                जेनरेटिव AI का विकास
              </h3>
              <ul className="space-y-1 text-xs text-muted-foreground pl-7">
                <li>• ChatGPT और DALL-E ने कंटेंट क्रिएशन में क्रांति लाई</li>
                <li>• टेक्स्ट, इमेज और वीडियो जेनरेशन आसान हो गया</li>
                <li>• व्यवसायों में ऑटोमेशन बढ़ रहा है</li>
              </ul>
            </div>

            <div className="bg-muted/50 rounded-lg p-3">
              <h3 className="text-sm font-semibold mb-2 text-foreground flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">2</span>
                एथिकल AI और रेगुलेशन
              </h3>
              <ul className="space-y-1 text-xs text-muted-foreground pl-7">
                <li>• AI में नैतिकता और पारदर्शिता महत्वपूर्ण</li>
                <li>• सरकारें AI रेगुलेशन पर काम कर रही हैं</li>
                <li>• डेटा प्राइवेसी प्राथमिकता है</li>
              </ul>
            </div>

            <div className="bg-muted/50 rounded-lg p-3">
              <h3 className="text-sm font-semibold mb-2 text-foreground flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">3</span>
                रोजगार पर प्रभाव
              </h3>
              <ul className="space-y-1 text-xs text-muted-foreground pl-7">
                <li>• नई नौकरियां और अवसर बन रहे हैं</li>
                <li>• AI स्किल्स की मांग बढ़ रही है</li>
                <li>• मानव-AI सहयोग भविष्य का मॉडल</li>
              </ul>
            </div>

            <div className="bg-muted/50 rounded-lg p-3">
              <h3 className="text-sm font-semibold mb-2 text-foreground flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">4</span>
                व्यावहारिक उपयोग
              </h3>
              <ul className="space-y-1 text-xs text-muted-foreground pl-7">
                <li>• स्वास्थ्य में रोग निदान</li>
                <li>• शिक्षा में व्यक्तिगत अनुभव</li>
                <li>• स्वायत्त वाहन और ट्रैफिक प्रबंधन</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Watch on YouTube Button */}
        <div className="mt-4">
          <Button className="w-full h-11 text-sm font-semibold" size="lg">
            Watch on YouTube
          </Button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Summary;
