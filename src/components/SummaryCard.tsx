import { BookOpen, Headphones } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SummaryCardProps {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  readTime: number;
  listenTime: number;
}

const SummaryCard = ({
  id,
  title,
  channel,
  thumbnail,
  readTime,
  listenTime,
}: SummaryCardProps) => {
  const navigate = useNavigate();

  // Generate avatar seed from channel name
  const avatarSeed = channel.replace(/\s+/g, '');

  return (
    <div
      onClick={() => navigate(`/summary/${id}`)}
      className="flex gap-3 sm:gap-4 p-3 rounded-xl bg-card hover:bg-muted/50 transition-all cursor-pointer group border border-transparent hover:border-border"
    >
      <div className="relative flex-shrink-0">
        <img
          src={thumbnail}
          alt={title}
          className="w-24 h-16 sm:w-32 sm:h-20 object-cover rounded-lg"
        />
        <div className="absolute inset-0 bg-black/20 rounded-lg group-hover:bg-black/30 transition-colors" />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground line-clamp-2 mb-1 text-sm sm:text-base group-hover:text-primary transition-colors">
          {title}
        </h3>
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} />
            <AvatarFallback className="text-xs">{channel.charAt(0)}</AvatarFallback>
          </Avatar>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">{channel}</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span className="hidden xs:inline">{readTime} min read</span>
            <span className="xs:hidden">{readTime}m</span>
          </span>
          <span className="flex items-center gap-1">
            <Headphones className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span className="hidden xs:inline">{listenTime} min listen</span>
            <span className="xs:hidden">{listenTime}m</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
