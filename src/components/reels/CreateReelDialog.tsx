// components/Reels/CreateReelDialog.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onThumbnailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  caption: string;
  setCaption: (val: string) => void;
  hashtags: string;
  setHashtags: (val: string) => void;
  selectedVideo: File | null;
  selectedThumbnail: File | null;
}

const CreateReelDialog = ({
  isOpen,
  onOpenChange,
  onFileChange,
  onThumbnailChange,
  onSubmit,
  caption,
  setCaption,
  hashtags,
  setHashtags,
  selectedVideo,
  selectedThumbnail,
}: Props) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" /> Create Reel
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Reel</DialogTitle>
        </DialogHeader>

        {/* Video Upload */}
        <label className="text-sm font-medium">Video File *</label>
        <Input type="file" accept="video/*" onChange={onFileChange} />

        {/* Optional Thumbnail Upload */}
        <label className="text-sm font-medium mt-2">Thumbnail (optional)</label>
        <Input type="file" accept="image/*" onChange={onThumbnailChange} />

        {/* Caption */}
        <label className="text-sm font-medium mt-2">Caption *</label>
        <Textarea
          placeholder="Write a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />

        {/* Hashtags */}
        <label className="text-sm font-medium mt-2">Hashtags (optional)</label>
        <Input
          type="text"
          placeholder="e.g., #funny #tech #study"
          value={hashtags}
          onChange={(e) => setHashtags(e.target.value)}
        />

        <Button
          onClick={onSubmit}
          disabled={!selectedVideo || !caption.trim()}
        >
          Post
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default CreateReelDialog;
