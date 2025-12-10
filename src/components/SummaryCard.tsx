import { BookOpen, Headphones } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SummaryCardProps {
  id: string;
  title: string;
  channel: string;
  channelLogo?: string | null;
  thumbnail: string;
  readTime: number;
  listenTime: number;
}

const SummaryCard = ({
  id,
  title,
  channel,
  channelLogo,
  thumbnail,
  readTime,
  listenTime,
}: SummaryCardProps) => {
  const navigate = useNavigate();

  const avatarSeed = channel.replace(/\s+/g, '');
  const logoUrl = channelLogo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;

  return (
    <div
      onClick={() => navigate(`/summary/${id}`)}
      className="flex gap-3 sm:gap-4 p-3 rounded-xl bg-card hover:bg-muted/50 transition-all cursor-pointer group border border-transparent hover:border-border items-start" // items-start added
    >
      {/* Wrapper div changes: items-start prevents stretching */}
      <div className="relative flex-shrink-0">
        <img
          src={thumbnail}
          alt={title}
          // Changes here: 
          // 1. 'h-16' hataya aur 'aspect-video' lagaya (perfect youtube shape ke liye)
          // 2. 'object-cover' rakha
          // 3. 'block' lagaya (niche ka barik gap hatane ke liye)
          className="w-28 sm:w-36 aspect-video object-cover rounded-lg block bg-muted"
        />
        <div className="absolute inset-0 bg-black/10 rounded-lg group-hover:bg-black/20 transition-colors" />
      </div>

      <div className="flex-1 min-w-0 py-0.5"> {/* py-0.5 added for better alignment with image top */}
        <h3 className="font-semibold text-foreground line-clamp-2 mb-1.5 text-sm sm:text-base group-hover:text-primary transition-colors leading-tight">
          {title}
        </h3>
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
            <AvatarImage src={logoUrl} />
            <AvatarFallback className="text-xs">{channel.charAt(0)}</AvatarFallback>
          </Avatar>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">{channel}</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>{readTime} min</span>
          </span>
          <span className="flex items-center gap-1">
            <Headphones className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>{listenTime} min</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;