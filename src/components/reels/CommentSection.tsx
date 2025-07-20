import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Send } from "lucide-react";

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

interface Props {
  isOpen: boolean;
  onClose: () => void;
  comments: Comment[];
  newComment: string;
  setNewComment: (val: string) => void;
  onLikeComment: (commentId: string) => void;
  onAddComment: () => void;
  isMobile: boolean;
}

const CommentSection = ({
  isOpen, onClose, comments, newComment, setNewComment,
  onLikeComment, onAddComment, isMobile
}: Props) => {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={`${isMobile ? "h-[90vh]" : "w-[400px]"} flex flex-col`}
      >
        <SheetHeader>
          <SheetTitle>Comments</SheetTitle>
        </SheetHeader>

        {/* Top Input */}
        <div className="flex space-x-2 mt-4">
          <Input
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            onKeyDown={(e) => e.key === 'Enter' && onAddComment()}
          />
          <Button onClick={onAddComment} disabled={!newComment.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable Comments */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-4 pr-1">
          {comments.map(comment => (
            <div key={comment.id} className="flex items-start space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.userAvatar} />
                <AvatarFallback>{comment.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="bg-muted p-3 rounded-md">
                  <div className="text-sm font-semibold">{comment.username}</div>
                  <div className="text-xs text-muted-foreground">{comment.timestamp}</div>
                  <p>{comment.content}</p>
                </div>
                <Button
                  onClick={() => onLikeComment(comment.id)}
                  variant="ghost"
                  size="sm"
                  className={`mt-1 ${comment.isLiked ? 'text-red-500' : ''}`}
                >
                  <Heart className="h-4 w-4 mr-1" /> {comment.likes}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CommentSection;
