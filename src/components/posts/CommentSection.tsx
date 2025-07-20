import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Reply, Send } from "lucide-react";

interface Comment {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
}

interface CommentSectionProps {
  postId: string;
}

const CommentSection = ({ postId }: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyTexts, setReplyTexts] = useState<{ [key: string]: string }>({});
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    setComments([]);
    setHasMore(true);
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);

    try {
      const lastTimestamp = comments.length ? comments[comments.length - 1].timestamp : null;
      const res = await axios.get(`http://localhost:5000/comment/${postId}/get_comments`, {
        params: { limit: 10, before: lastTimestamp },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.length < 10) setHasMore(false);
      setComments(prev => [...prev, ...res.data]);
    } catch (err) {
      console.error("Failed to load comments", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const res = await axios.post(
        `http://localhost:5000/comment/${postId}/create_comment`,
        { content: newComment, targetType: "post" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newCommentObj: Comment = {
        ...res.data,
        replies: [],
      };

      setComments(prev => [newCommentObj, ...prev]);
      setNewComment('');
    } catch (err) {
      console.error("Failed to add comment", err.response?.data || err.message);
    }
  };

  const handleAddReply = async (parentId: string) => {
    const replyText = replyTexts[parentId];
    if (!replyText?.trim()) return;

    try {
      const res = await axios.post(
        `http://localhost:5000/comment/${postId}/reply/${parentId}`,
        { content: replyText, targetType: 'post' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const addReply = (commentsList: Comment[]): Comment[] =>
        commentsList.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), res.data],
            };
          } else if (comment.replies) {
            return {
              ...comment,
              replies: addReply(comment.replies),
            };
          }
          return comment;
        });

      setComments(addReply(comments));
      setReplyTexts(prev => ({ ...prev, [parentId]: '' }));
      setReplyingTo(null);
    } catch (err) {
      console.error("Failed to add reply", err);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      const res = await axios.patch(
        `http://localhost:5000/comment/${commentId}/like_comment`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updateLike = (commentsList: Comment[]): Comment[] =>
        commentsList.map(comment => {
          if (comment.id === commentId) return res.data;
          if (comment.replies) {
            return {
              ...comment,
              replies: updateLike(comment.replies),
            };
          }
          return comment;
        });

      setComments(updateLike(comments));
    } catch (err) {
      console.error("Failed to like comment", err);
    }
  };

  const CommentItem = ({ comment }: { comment: Comment }) => (
    <div key={comment.id} className="space-y-2 ml-0">
      <div className="flex items-start space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.userAvatar} />
          <AvatarFallback>{comment?.username?.charAt(0)?.toUpperCase() ?? "?"}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-semibold text-sm">{comment.username}</span>
              <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
            </div>
            <p className="text-sm">{comment.content}</p>
          </div>
          <div className="flex items-center space-x-4 mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleLikeComment(comment.id)}
              className={`h-6 px-2 space-x-1 ${comment.isLiked ? 'text-red-500' : ''}`}
            >
              <Heart className={`h-3 w-3 ${comment.isLiked ? 'fill-current' : ''}`} />
              <span className="text-xs">{comment.likes}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyingTo(comment.id)}
              className="h-6 px-2 text-xs"
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
          </div>
        </div>
      </div>

      {replyingTo === comment.id && (
        <div className="ml-11 flex space-x-2">
          <Input
            placeholder="Write a reply..."
            value={replyTexts[comment.id] || ''}
            onChange={(e) =>
              setReplyTexts(prev => ({ ...prev, [comment.id]: e.target.value }))
            }
            className="h-8 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && handleAddReply(comment.id)}
            autoFocus
          />
          <Button
            size="sm"
            onClick={() => handleAddReply(comment.id)}
            disabled={!replyTexts[comment.id]?.trim()}
            className="h-8 px-3"
          >
            <Send className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Nested Replies */}
      {comment.replies?.map(reply => (
        <div key={reply.id} className="ml-8 pl-4 border-l-2 border-border">
          <CommentItem comment={reply} />
        </div>
      ))}
    </div>
  );

  return (
    <Card className="mt-2">
      <CardHeader className="pb-3">
        <h3 className="font-semibold text-sm">Comments</h3>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4 mb-4">
          {comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>

        {hasMore && (
          <div className="text-center mb-4">
            <Button
              variant="outline"
              onClick={fetchComments}
              disabled={isLoading}
              className="text-xs"
            >
              {isLoading ? "Loading..." : "Load more"}
            </Button>
          </div>
        )}

        <div className="flex space-x-3 pt-4 border-t border-border">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=400&fit=crop&crop=face" />
            <AvatarFallback>Asim</AvatarFallback>
          </Avatar>
          <div className="flex-1 flex space-x-2">
            <Input
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="h-9"
              onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
            />
            <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommentSection;
