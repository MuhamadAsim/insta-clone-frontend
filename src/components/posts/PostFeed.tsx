import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Video } from "lucide-react";
import PostCard from './PostCard';
import CommentSection from './CommentSection';
import { toast } from "sonner";
import { useUser } from "../context/UserContext";


const PostFeed = () => {
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [userPost, setUserPost] = useState(null);
  const user = useUser();

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/post/fetch_all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const posts = res.data;
      const userId = JSON.parse(atob(token.split('.')[1])).id;
      const recentUserPost = posts.find(post => post.authorId._id === userId);
      setUserPost(recentUserPost || null);
      const friendPosts = posts.filter(post => post.authorId._id !== userId);
      setPosts(friendPosts);
    } catch (err) {
      toast.error("Failed to load posts");
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
  const generateFeed = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.post("http://localhost:5000/reel/generate_feed", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Feed generation attempted.");
    } catch (err) {
      console.error("Feed generation failed", err);
    }
  };

  generateFeed();
}, []);


  const handleCreatePost = async () => {
    if (!newPostContent.trim() && !selectedMedia) return;
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("content", newPostContent);
    if (selectedMedia) formData.append("media", selectedMedia);

    try {
      const res = await axios.post("http://localhost:5000/post/create", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setUserPost(res.data);
      setPosts(prev => [res.data, ...prev]);
      setNewPostContent('');
      setSelectedMedia(null);
    } catch (err) {
      toast.error("Failed to create post");
    }
  };

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedMedia(file);
    }
  };


  const handleLike = async (postId: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.post(`http://localhost:5000/post/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { likes, isLiked } = res.data;

      // Update in posts list
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId
            ? { ...post, likes, isLiked }
            : post
        )
      );

      // Also update if it's user's recent post
      setUserPost(prevUserPost =>
        prevUserPost && prevUserPost._id === postId
          ? { ...prevUserPost, likes, isLiked }
          : prevUserPost
      );

    } catch (err) {
      toast.error("Failed to like post");
    }
  };



  const handleComment = (postId: string) => {
    setOpenComments(openComments === postId ? null : postId);
  };

  const handleDeletePost = async (postId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this post?");
    if (!confirmDelete) return;

    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:5000/post/${postId}/remove_post`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPosts(posts.filter(p => p._id !== postId));
      if (userPost && userPost._id === postId) setUserPost(null);
      toast.success("Post deleted");
    } catch (err) {
      toast.error("Failed to delete post");
    }
  };


  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Post Creation */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.profilePicture || ""} />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="What's on your mind?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="min-h-[60px] resize-none border-none shadow-none focus-visible:ring-0 p-0"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {selectedMedia && (
            <div className="mb-3 relative">
              {selectedMedia.type.startsWith('video') ? (
                <video controls className="max-h-60 rounded-lg w-full">
                  <source src={URL.createObjectURL(selectedMedia)} />
                </video>
              ) : (
                <img
                  src={URL.createObjectURL(selectedMedia)}
                  alt="Selected"
                  className="max-h-60 rounded-lg object-cover w-full"
                />
              )}
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2"
                onClick={() => setSelectedMedia(null)}
              >
                ×
              </Button>
            </div>
          )}
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <label htmlFor="media-upload">
                <Button variant="ghost" size="sm" className="cursor-pointer" asChild>
                  <span><Video className="h-4 w-4 mr-1" /> Media</span>
                </Button>
              </label>
              <input
                id="media-upload"
                type="file"
                accept="image/*,video/*"
                onChange={handleMediaUpload}
                className="hidden"
              />
            </div>
            <Button
              size="sm"
              onClick={handleCreatePost}
              disabled={!newPostContent.trim() && !selectedMedia}
            >
              Post
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User's Recent Post */}
      {userPost && (
        <div>
          <PostCard
            post={userPost}
            onLike={() => handleLike(userPost._id)}
            onComment={() => handleComment(userPost._id)}
            onDelete={() => handleDeletePost(userPost._id)}
          />
          {openComments === userPost._id && (
            <CommentSection postId={userPost._id} />
          )}
        </div>
      )}

      {/* Friend Posts Feed */}
      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post._id}>
            <PostCard
              post={post}
              onLike={() => handleLike(post._id)}
              onComment={() => handleComment(post._id)}
              onDelete={() => handleDeletePost(post._id)}
            />
            {openComments === post._id && (
              <CommentSection postId={post._id} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostFeed;
