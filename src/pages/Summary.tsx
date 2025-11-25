import { useState } from "react";
import { ArrowLeft, Share2, Bookmark, Play, Pause } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Slider } from "@/components/ui/slider";
import BottomNav from "@/components/BottomNav";

const Summary = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState([0]);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Bar */}
      <header className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="container flex items-center justify-between h-16 px-4">
          <button
            onClick={() => navigate("/home")}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              <Share2 className="h-5 w-5 text-foreground" />
            </button>
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <Bookmark
                className={`h-5 w-5 ${
                  isBookmarked ? "fill-primary text-primary" : "text-foreground"
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6 max-w-3xl">
        {/* Video Thumbnail */}
        <div className="relative aspect-video rounded-xl overflow-hidden mb-6 group">
          <img
            src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop"
            alt="Video thumbnail"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
            <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center cursor-pointer hover:bg-primary transition-colors">
              <Play className="h-8 w-8 text-primary-foreground ml-1" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold mb-4 text-foreground leading-tight">
          The Future of AI and Machine Learning in 2024
        </h1>

        {/* Creator Bar */}
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Tech" />
              <AvatarFallback>TI</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-foreground">Tech Insights</p>
              <p className="text-sm text-muted-foreground">1.2M subscribers</p>
            </div>
          </div>
          <Button size="sm" variant="outline">
            + Follow
          </Button>
        </div>

        {/* Audio Player */}
        <div className="sticky top-16 z-10 bg-card border border-border rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex items-center gap-4 mb-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center transition-colors"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 text-primary-foreground" />
              ) : (
                <Play className="h-5 w-5 text-primary-foreground ml-0.5" />
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
            <span className="text-sm text-muted-foreground font-medium tabular-nums">
              {formatTime(progress[0])} / 07:00
            </span>
          </div>
        </div>

        {/* Summary Content */}
        <div className="prose prose-sm max-w-none">
          <h2 className="text-xl font-semibold mb-3 text-foreground">
            मुख्य बिंदु (Key Points)
          </h2>
          
          <div className="space-y-4 text-foreground/90 leading-relaxed">
            <p>
              आर्टिफिशियल इंटेलिजेंस (AI) और मशीन लर्निंग 2024 में तकनीक के सबसे महत्वपूर्ण क्षेत्र बन गए हैं। यह वीडियो इन तकनीकों के भविष्य और उनके प्रभाव को समझाता है।
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2 text-foreground">
              1. जेनरेटिव AI का विकास
            </h3>
            <p>
              • ChatGPT और DALL-E जैसे टूल्स ने कंटेंट क्रिएशन में क्रांति ला दी है
              <br />
              • टेक्स्ट, इमेज और वीडियो जेनरेशन अब पहले से कहीं ज्यादा आसान हो गया है
              <br />
              • व्यवसायों में ऑटोमेशन और दक्षता में वृद्धि हो रही है
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2 text-foreground">
              2. एथिकल AI और रेगुलेशन
            </h3>
            <p>
              • AI के उपयोग में नैतिकता और पारदर्शिता महत्वपूर्ण हो गई है
              <br />
              • सरकारें और संगठन AI रेगुलेशन पर काम कर रहे हैं
              <br />
              • डेटा प्राइवेसी और बायस को दूर करना प्राथमिकता है
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2 text-foreground">
              3. रोजगार पर प्रभाव
            </h3>
            <p>
              • कुछ नौकरियां ऑटोमेट हो रही हैं, लेकिन नए अवसर भी बन रहे हैं
              <br />
              • AI स्किल्स की मांग तेजी से बढ़ रही है
              <br />
              • मानव-AI सहयोग भविष्य का मॉडल है
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2 text-foreground">
              4. व्यावहारिक उपयोग
            </h3>
            <p>
              • स्वास्थ्य सेवा में रोग निदान और उपचार योजना
              <br />
              • शिक्षा में व्यक्तिगत सीखने के अनुभव
              <br />
              • परिवहन में स्वायत्त वाहन और ट्रैफिक प्रबंधन
            </p>
          </div>
        </div>

        {/* Watch on YouTube Button */}
        <div className="mt-8">
          <Button className="w-full h-12 text-base font-semibold" size="lg">
            Watch on YouTube
          </Button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Summary;
