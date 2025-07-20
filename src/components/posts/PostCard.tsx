import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share, Trash2 } from "lucide-react";

interface Post {
  _id: string;
  authorId: {
    _id: string;
    username: string;
    profilePicture: string;
  };
  content: string;
  media: string[];
  likes: number;
  commentsCount: number;
  createdAt: string;
  isLiked: boolean;
}

interface PostCardProps {
  post: Post;
  onLike: () => void;
  onComment: () => void;
  onDelete?: () => void;
}

const PostCard = ({ post, onLike, onComment, onDelete }: PostCardProps) => {
  const isVideo = (filePath: string) => /\.(mp4|webm|ogg)$/i.test(filePath);
  const media = post.media?.[0];
  const timeAgo = new Date(post.createdAt).toLocaleString();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.authorId.profilePicture} />
              <AvatarFallback>
                {post.authorId.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{post.authorId.username}</p>
              <p className="text-xs text-muted-foreground">{timeAgo}</p>
            </div>
          </div>
          {onDelete && (
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {post.content && (
          <p className="mb-3 text-sm leading-relaxed">{post.content}</p>
        )}

        {media && (
          <div className="mb-4">
            {isVideo(media) ? (
              <video controls className="w-full rounded">
                <source src={`http://localhost:5000${media}`} />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={`http://localhost:5000${media}`}
                alt="Post media"
                className="w-full h-auto rounded"
              />
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLike}
              className={`space-x-1 ${post.isLiked ? "text-red-500" : ""}`}
            >
              <Heart className={`h-4 w-4 ${post.isLiked ? "fill-current" : ""}`} />
              <span className="text-xs">{post.likes}</span> 

            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onComment}
              className="space-x-1"
            >
              <MessageCircle className="h-4 w-4" />
              {/* <span className="text-xs">{post.commentsCount}</span> */}
            </Button>

            <Button variant="ghost" size="sm">
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;
