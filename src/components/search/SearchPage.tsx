
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, Check, X } from "lucide-react";
import { toast } from "sonner";
import axios from 'axios';


interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isOnline: boolean;
  mutualFriends: number;
  requestSent?: boolean;
  isFriend?: boolean;
}

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);



  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/friend/search?query=${encodeURIComponent(query)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSearchResults(res.data.users || []); // adjust based on backend response format
    } catch (err) {
      toast.error("Failed to search users");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };


  const handleSendFriendRequest = async (userId: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://localhost:5000/friend/send_request/${userId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSearchResults(prev =>
        prev.map(user =>
          user.id === userId ? { ...user, requestSent: true } : user
        )
      );


      toast.success("Friend request sent!");
    } catch (err) {
      console.log(err.response?.data); // This will show the backend's error message

      toast.error("Failed to send friend request");
    }
  };


  const handleCancelRequest = async (userId: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/friend/cancel_request/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSearchResults(prev =>
        prev.map(user =>
          user.id === userId ? { ...user, requestSent: false } : user
        )
      );

      toast.success("Friend request cancelled");
    } catch (err) {
      console.log(err.response?.data); // This will show the backend's error message
      toast.error("Failed to cancel friend request");
    }
  };


  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Search Users</h1>
          <p className="text-muted-foreground">Find and connect with other users</p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or username..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Search Results */}
        {isSearching && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Searching...</p>
          </div>
        )}

        {searchQuery && !isSearching && searchResults.length === 0 && (
          <div className="text-center py-8">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No users found matching your search</p>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-semibold">Search Results ({searchResults.length})</h2>
            <div className="grid gap-4">
              {searchResults.map((user) => (
                <Card key={user.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          {user.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium truncate">{user.name}</h3>
                            {user.isOnline && (
                              <Badge variant="secondary" className="text-xs">Online</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">@{user.username}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.mutualFriends} mutual friends
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {user.isFriend ? (
                          <Badge variant="default">Friends</Badge>
                        ) : user.requestSent ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelRequest(user.id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleSendFriendRequest(user.id)}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {!searchQuery && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Start searching</h3>
            <p className="text-muted-foreground">
              Enter a name or username to find other users
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
