// components/Reels/ReelCard.tsx
import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share, Volume2, VolumeX, Play } from "lucide-react";

interface Reel {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  videoUrl: string;
  thumbnailUrl?: string; // ✅ Add this
  caption: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  timestamp: string;
}


interface Props {
  reel: Reel;
  index: number;
  videoRef: (el: HTMLVideoElement | null) => void;
  isMuted: boolean;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onLike: () => void;
  onOpenComments: () => void;
  isMobile: boolean;
}

const ReelCard = ({
  reel, index, videoRef, isMuted, isPlaying,
  onTogglePlay, onToggleMute, onLike, onOpenComments, isMobile
}: Props) => {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  // Sync videoRef (from parent) with local ref
  useEffect(() => {
    videoRef(localVideoRef.current);
  }, [videoRef]);

  useEffect(() => {
    if (!localVideoRef.current) return;

    if (isPlaying) {
      localVideoRef.current.play().catch(() => { });
    } else {
      localVideoRef.current.pause();
    }
  }, [isPlaying]);

  return (
    <div
      className={`relative ${isMobile ? 'h-screen w-full snap-start' : 'h-[80vh] w-full max-w-md mx-auto mt-8 rounded-lg'} bg-black overflow-hidden`}
      onClick={onTogglePlay}
    >
      <video
        ref={localVideoRef}
        src={reel.videoUrl}
        poster={reel.thumbnailUrl || undefined}
        className="max-h-full h-full object-contain"
        loop
        muted={isMuted}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
        {/* Top section */}
        <div className="absolute top-4 left-4 right-4 flex items-center space-x-2">
          <Avatar className="h-8 w-8 border-2 border-white">
            <AvatarImage src={reel.userAvatar} />
            <AvatarFallback>{reel.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <span className="text-white font-semibold text-sm">{reel.username}</span>
          <span className="text-white/70 text-xs">{reel.timestamp}</span>
        </div>

        {/* Caption */}
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-white text-sm">{reel.caption}</p>
        </div>

        {/* Right-side action buttons */}
        <div className="absolute right-4 bottom-20 flex flex-col space-y-4">
          <Button onClick={(e) => { e.stopPropagation(); onLike(); }} variant="ghost" size="sm"
            className={`text-white h-12 w-12 rounded-full p-0 ${reel.isLiked ? 'text-red-500' : ''}`}>
            <div className="flex flex-col items-center">
              <Heart className={`h-6 w-6 ${reel.isLiked ? 'fill-current' : ''}`} />
              <span className="text-xs">{reel.likes}</span>
            </div>
          </Button>
          <Button onClick={(e) => { e.stopPropagation(); onOpenComments(); }} variant="ghost" size="sm" className="text-white h-12 w-12 rounded-full p-0">
            <div className="flex flex-col items-center">
              <MessageCircle className="h-6 w-6" />
              <span className="text-xs">{reel.comments}</span>
            </div>
          </Button>
          <Button onClick={(e) => e.stopPropagation()} variant="ghost" size="sm" className="text-white h-12 w-12 rounded-full p-0">
            <Share className="h-6 w-6" />
          </Button>
          <Button onClick={(e) => { e.stopPropagation(); onToggleMute(); }} variant="ghost" size="sm" className="text-white h-12 w-12 rounded-full p-0">
            {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
          </Button>
        </div>

        {/* Play icon when paused */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Play className="h-16 w-16 text-white/80" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ReelCard;
