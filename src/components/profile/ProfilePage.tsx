import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Edit, Camera, Users, MessageSquare } from "lucide-react";
import { toast } from "sonner";

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [friendCount, setFriendCount] = useState(0);
  const [profileData, setProfileData] = useState({
    name: '',
    username: '',
    bio: '',
    age: '',
    gender: '',
    phone: '',
    profilePicture: '',
    friendCount: 0,
  });

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      console.log(`Fetching profile for user ID: ${userId}`);
      const res = await axios.get(`http://localhost:5000/user/profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfileData(res.data);
      setFriendCount(res.data.friendCount);
    } catch (err) {
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
  try {
    const token = localStorage.getItem("token");
    await axios.put(
      "http://localhost:5000/user/update_profile",
      {
        name: profileData.name,
        bio: profileData.bio,
        age: profileData.age,
        gender: profileData.gender,
        phone: profileData.phone,
        profilePicture: profileData.profilePicture,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setIsEditing(false);
    toast.success("Profile updated successfully!");
  } catch (err) {
    toast.error("Failed to update profile");
  }
};


  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData((prev) => ({ ...prev, profilePicture: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) return <p className="p-6">Loading profile...</p>;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <Link to="/settings">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" /> Settings
          </Button>
        </Link>
      </div>

<div className="grid gap-6 grid-cols-1 md:grid-cols-1 lg:grid-cols-3">
     <Card className="w-full lg:col-span-2">
  <CardContent className="p-6">
    <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 md:gap-6 items-start">
      {/* Avatar and Edit button vertically stacked */}
      <div className="flex flex-col items-center space-y-4 min-w-[96px]">
        <div className="relative">
          <Avatar className="h-24 w-24 md:h-32 md:w-32">
            <AvatarImage src={profileData.profilePicture} />
            <AvatarFallback>{profileData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Profile Picture</DialogTitle>
              </DialogHeader>
              <Input type="file" accept="image/*" onChange={handleProfilePictureUpload} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Button below Avatar */}
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Edit className="h-4 w-4 mr-2" /> Edit Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={profileData.name} onChange={(e) => handleInputChange('name', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" value={profileData.bio} onChange={(e) => handleInputChange('bio', e.target.value)} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" type="number" value={profileData.age} onChange={(e) => handleInputChange('age', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={profileData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={profileData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} />
              </div>
              <Button onClick={handleSave} className="w-full">Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Profile Info */}
      <div className="space-y-2 w-full overflow-hidden">
        <div className="flex items-center space-x-2 flex-wrap">
          <h2 className="text-2xl font-bold">{profileData.name}</h2>
          <Badge variant="secondary">@{profileData.username}</Badge>
          <Badge variant="outline" className="capitalize">{profileData.gender}</Badge>
        </div>
        <p className="text-muted-foreground">{profileData.bio}</p>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>Age: {profileData.age}</span>
          <span>Phone: {profileData.phone}</span>
        </div>
      </div>
    </div>
  </CardContent>
</Card>


        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Friends</span>
                </div>
                <span className="font-semibold">{friendCount}</span>
              </div>
              {/* <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Messages</span>
                </div>
                <span className="font-semibold">0</span>
              </div> */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
