import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Clock, UserPlus } from "lucide-react";
import { toast } from "sonner";
import axios from 'axios';

interface FriendRequest {
  id: string;
  name: string;
  username: string;
  avatar: string;
  mutualFriends: number;
  timestamp: string;
}

const InboxPage = () => {
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/friend/received_and_sent_requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setReceivedRequests(res.data.received);
      setSentRequests(res.data.sent);
    } catch (err) {
      toast.error("Failed to load friend requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAcceptRequest = async (senderId: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://localhost:5000/friend/accept_request/${senderId}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setReceivedRequests(prev => prev.filter(req => req.id !== senderId));
      toast.success("Friend request accepted");
    } catch {
      toast.error("Failed to accept request");
    }
  };

  const handleDeclineRequest = async (senderId: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/friend/decline_request/${senderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setReceivedRequests(prev => prev.filter(req => req.id !== senderId));
      toast.success("Friend request declined");
    } catch {
      toast.error("Failed to decline request");
    }
  };

  const handleCancelRequest = async (receiverId: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/friend/cancel_request/${receiverId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSentRequests(prev => prev.filter(req => req.id !== receiverId));
      toast.success("Friend request cancelled");
    } catch {
      toast.error("Failed to cancel request");
    }
  };

  return (
  <div className="p-4 md:p-6 max-w-4xl mx-auto">
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Friend Requests</h1>
        <p className="text-muted-foreground">Manage your incoming and outgoing friend requests</p>
      </div>

      <Tabs defaultValue="received" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="received">
            Received{" "}
            {receivedRequests?.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {receivedRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent">
            Sent{" "}
            {sentRequests?.length > 0 && (
              <Badge variant="outline" className="ml-1">
                {sentRequests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Received Requests */}
        <TabsContent value="received" className="space-y-4">
          {loading ? (
            <p>Loading...</p>
          ) : receivedRequests?.length === 0 ? (
            <p className="text-center text-muted-foreground">No received friend requests.</p>
          ) : (
            receivedRequests?.map((request) => (
              <Card key={request._id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={request.profilePicture || ""} />
                      <AvatarFallback>
                        {(request.username || "U").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{request.username || "Unknown"}</p>
                      <p className="text-sm text-muted-foreground">
                        {request.email || "No email"}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleAcceptRequest(request._id)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeclineRequest(request._id)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Decline
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Sent Requests */}
        <TabsContent value="sent" className="space-y-4">
          {loading ? (
            <p>Loading...</p>
          ) : sentRequests?.length === 0 ? (
            <p className="text-center text-muted-foreground">No sent friend requests.</p>
          ) : (
            sentRequests?.map((request) => (
              <Card key={request._id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={request.profilePicture || ""} />
                      <AvatarFallback>
                        {(request.username || "U").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{request.username || "Unknown"}</p>
                      <p className="text-sm text-muted-foreground">
                        {request.email || "No email"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCancelRequest(request._id)}
                  >
                    Cancel
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  </div>
);

};

export default InboxPage;
