// components/Reels/ReelsPage.tsx

import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import ReelCard from './ReelCard';
import CreateReelDialog from './CreateReelDialog';
import CommentSection from './CommentSection';
import { useIsMobile } from '@/hooks/use-mobile';

interface Reel {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  videoUrl: string;
  caption: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  timestamp: string;
  thumbnailUrl?: string; // ✅ New
  hashtags?: string[];   // ✅ New
}


interface Comment {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
}

const ReelsPage = () => {
  const [reels, setReels] = useState<Reel[]>([]);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newReelCaption, setNewReelCaption] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [reelComments, setReelComments] = useState<{ [key: string]: Comment[] }>({});
  const [newComment, setNewComment] = useState('');
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const isMobile = useIsMobile();
  const watchedReelIds = useRef<Set<string>>(new Set());
  const [hashtags, setHashtags] = useState("");
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);


  useEffect(() => {
    const fetchReels = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/reel/feed", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReels(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch reels", err);
        setReels([]);
      }
    };

    fetchReels();
  }, []);

  // Automatically play/pause video
  useEffect(() => {
    const currentVideo = videoRefs.current[currentReelIndex];
    if (currentVideo) {
      isPlaying ? currentVideo.play() : currentVideo.pause();
    }

    // Mark as watched
    const currentReel = reels[currentReelIndex];
    if (currentReel && !watchedReelIds.current.has(currentReel.id)) {
      markReelAsWatched(currentReel.id);
      watchedReelIds.current.add(currentReel.id);
    }
  }, [currentReelIndex, isPlaying]);

  const handleScroll = (e: React.WheelEvent) => {
    if (e.deltaY > 0 && currentReelIndex < reels.length - 1) {
      setCurrentReelIndex(prev => prev + 1);
    } else if (e.deltaY < 0 && currentReelIndex > 0) {
      setCurrentReelIndex(prev => prev - 1);
    }
  };

  const markReelAsWatched = async (reelId: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://localhost:5000/reel/${reelId}/mark_watched`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Failed to mark reel as watched", err);
    }
  };

  const handleLike = async (reelId: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://localhost:5000/reel/${reelId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReels(prev =>
        prev.map(reel =>
          reel.id === reelId
            ? { ...reel, isLiked: !reel.isLiked, likes: reel.isLiked ? reel.likes - 1 : reel.likes + 1 }
            : reel
        )
      );
    } catch (err) {
      console.error('Error liking reel', err);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedVideo(file);
  };




  const handleCreateReel = async () => {
    if (!selectedVideo || !newReelCaption.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      const videoDuration = await getVideoDuration(selectedVideo);
      if (videoDuration > 120) {
        alert("Video must be 120 seconds or shorter.");
        return;
      }

      const formData = new FormData();
      formData.append("video", selectedVideo);
      formData.append("caption", newReelCaption);
      formData.append("authorId", userId || "");

      // ✅ Handle hashtags robustly
      const tagArray =
        hashtags.match(/#[\w\d_]+/g)?.map((tag) => tag.toLowerCase()) || [];
      if (tagArray.length > 0) {
        formData.append("hashtags", JSON.stringify(tagArray));
      }

      // ✅ Use uploaded or auto-generated thumbnail
      if (selectedThumbnail) {
        formData.append("thumbnail", selectedThumbnail, "custom-thumbnail.jpg");
      } else {
        const generatedThumbBlob = await generateThumbnailFromVideo(selectedVideo);
        const generatedThumbFile = new File([generatedThumbBlob], "auto-thumbnail.jpg", {
          type: "image/jpeg",
        });
        formData.append("thumbnail", generatedThumbFile);
      }

      const res = await axios.post("http://localhost:5000/reel", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setReels((prev) => [res.data, ...prev]);
      setNewReelCaption("");
      setSelectedVideo(null);
      setSelectedThumbnail(null);
      setHashtags("");
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error("Failed to create reel", err);
    }
  };




  const generateThumbnailFromVideo = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const url = URL.createObjectURL(file);

      video.preload = 'metadata';
      video.src = url;
      video.muted = true;
      video.playsInline = true;

      video.onloadeddata = () => {
        video.currentTime = Math.min(1, video.duration / 2); // Jump to middle or 1s
      };

      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject("Could not create canvas context");

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject("Failed to generate thumbnail blob");
          URL.revokeObjectURL(url);
        }, 'image/jpeg', 0.8);
      };

      video.onerror = (e) => reject("Video processing error");
    });
  };





  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = URL.createObjectURL(file);
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      video.onerror = () => reject("Failed to load video metadata.");
    });
  };





  const handleOpenComments = async (reelId: string) => {
    setOpenComments(reelId);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/comment/${reelId}/get_comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReelComments(prev => ({ ...prev, [reelId]: res.data }));
    } catch (err) {
      console.error('Failed to fetch comments', err);
    }
  };

  const handleAddComment = async () => {
    if (!openComments || !newComment.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `http://localhost:5000/comment/${openComments}/create_comment`,
        {
          content: newComment,
          targetType: 'reel',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReelComments(prev => ({
        ...prev,
        [openComments]: [...(prev[openComments] || []), res.data],
      }));
      setReels(prev =>
        prev.map(r => (r.id === openComments ? { ...r, comments: r.comments + 1 } : r))
      );
      setNewComment('');
    } catch (err) {
      console.error('Failed to post comment', err);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!openComments) return;
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`http://localhost:5000/comment/${commentId}/like_comment`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setReelComments(prev => ({
        ...prev,
        [openComments]: prev[openComments]?.map(c =>
          c.id === commentId
            ? { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 }
            : c
        )
      }));
    } catch (err) {
      console.error('Failed to like comment', err);
    }
  };

  return (
    <div className="bg-background">
      {!isMobile && (
        <div className="sticky top-0 z-10 bg-background border-b border-border p-4">
          <div className="flex justify-between items-center max-w-md mx-auto">
            <h1 className="text-xl font-bold">Reels</h1>
            <CreateReelDialog
              isOpen={isCreateModalOpen}
              onOpenChange={setIsCreateModalOpen}
              onFileChange={handleVideoUpload}
              onThumbnailChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setSelectedThumbnail(file);
              }}
              onSubmit={handleCreateReel}
              caption={newReelCaption}
              setCaption={setNewReelCaption}
              hashtags={hashtags}
              setHashtags={setHashtags}
              selectedVideo={selectedVideo}
              selectedThumbnail={selectedThumbnail}
            />

          </div>
        </div>
      )}

      <div
        className={`${isMobile ? 'h-screen overflow-y-scroll snap-y snap-mandatory' : 'h-full overflow-hidden'
          }`}
        onWheel={!isMobile ? handleScroll : undefined}
      >
        {isMobile
          ? reels.map((reel, i) => {
            // Mobile: mark each visible reel as watched on mount
            if (!watchedReelIds.current.has(reel.id)) {
              markReelAsWatched(reel.id);
              watchedReelIds.current.add(reel.id);
            }
            return (
              <ReelCard
                key={reel.id}
                reel={reel}
                index={i}
                videoRef={(el) => (videoRefs.current[i] = el)}
                isMuted={isMuted}
                isPlaying={isPlaying}
                onTogglePlay={() => setIsPlaying((prev) => !prev)}
                onToggleMute={() => setIsMuted((prev) => !prev)}
                onLike={() => handleLike(reel.id)}
                onOpenComments={() => handleOpenComments(reel.id)}
                isMobile={isMobile}
              />
            );
          })
          : reels[currentReelIndex] && (
            <ReelCard
              reel={reels[currentReelIndex]}
              index={currentReelIndex}
              videoRef={(el) => (videoRefs.current[currentReelIndex] = el)}
              isMuted={isMuted}
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying((prev) => !prev)}
              onToggleMute={() => setIsMuted((prev) => !prev)}
              onLike={() => handleLike(reels[currentReelIndex].id)}
              onOpenComments={() => handleOpenComments(reels[currentReelIndex].id)}
              isMobile={isMobile}
            />
          )}
      </div>

      <CommentSection
        isOpen={!!openComments}
        onClose={() => setOpenComments(null)}
        comments={openComments ? reelComments[openComments] || [] : []}
        newComment={newComment}
        setNewComment={setNewComment}
        onLikeComment={handleLikeComment}
        onAddComment={handleAddComment}
        isMobile={isMobile}
      />
    </div>
  );
};

export default ReelsPage;
