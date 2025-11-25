import { BookOpen, Headphones } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

  return (
    <div
      onClick={() => navigate(`/summary/${id}`)}
      className="flex gap-4 p-3 rounded-xl bg-card hover:bg-muted/50 transition-all cursor-pointer group border border-transparent hover:border-border"
    >
      <div className="relative flex-shrink-0">
        <img
          src={thumbnail}
          alt={title}
          className="w-32 h-20 object-cover rounded-lg"
        />
        <div className="absolute inset-0 bg-black/20 rounded-lg group-hover:bg-black/30 transition-colors" />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mb-2">{channel}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            {readTime} min read
          </span>
          <span className="flex items-center gap-1">
            <Headphones className="h-3.5 w-3.5" />
            {listenTime} min listen
          </span>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
