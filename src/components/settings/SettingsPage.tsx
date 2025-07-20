
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Moon, Sun, Eye, EyeOff, Bell, Shield, Globe } from "lucide-react";
import { toast } from "sonner";

interface SettingsPageProps {
  isDarkMode: boolean;
  setIsDarkMode: (darkMode: boolean) => void;
}

const SettingsPage = ({ isDarkMode, setIsDarkMode }: SettingsPageProps) => {
  const [settings, setSettings] = useState({
    isOnline: true,
    notifications: true,
    soundNotifications: true,
    emailNotifications: false,
    language: 'en',
    autoDownloadMedia: true,
    readReceipts: true
  });

  const handleSettingChange = (key: string, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast.success("Settings updated");
  };

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    toast.success(`Switched to ${!isDarkMode ? 'dark' : 'light'} mode`);
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              <span>Appearance</span>
            </CardTitle>
            <CardDescription>
              Customize how the app looks on your device
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark themes
                </p>
              </div>
              <Switch
                checked={isDarkMode}
                onCheckedChange={handleThemeToggle}
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Language</Label>
              <Select 
                value={settings.language} 
                onValueChange={(value) => handleSettingChange('language', value)}
              >
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="it">Italiano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Visibility */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Privacy & Visibility</span>
            </CardTitle>
            <CardDescription>
              Control who can see you and your activity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <Label>Online Status</Label>
                  <Badge variant={settings.isOnline ? "default" : "secondary"} className="text-xs">
                    {settings.isOnline ? "Online" : "Offline"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Show when you're active on the app
                </p>
              </div>
              <Switch
                checked={settings.isOnline}
                onCheckedChange={(checked) => handleSettingChange('isOnline', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Read Receipts</Label>
                <p className="text-sm text-muted-foreground">
                  Let others know when you've read their messages
                </p>
              </div>
              <Switch
                checked={settings.readReceipts}
                onCheckedChange={(checked) => handleSettingChange('readReceipts', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
            </CardTitle>
            <CardDescription>
              Choose what notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications for new messages and friend requests
                </p>
              </div>
              <Switch
                checked={settings.notifications}
                onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sound Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Play sound when receiving notifications
                </p>
              </div>
              <Switch
                checked={settings.soundNotifications}
                onCheckedChange={(checked) => handleSettingChange('soundNotifications', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive important updates via email
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Media & Storage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Media & Storage</span>
            </CardTitle>
            <CardDescription>
              Manage how media files are handled
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-download Media</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically download photos and videos
                </p>
              </div>
              <Switch
                checked={settings.autoDownloadMedia}
                onCheckedChange={(checked) => handleSettingChange('autoDownloadMedia', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Account</span>
            </CardTitle>
            <CardDescription>
              Manage your account settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full md:w-auto">
              Change Password
            </Button>
            <Button variant="outline" className="w-full md:w-auto">
              Download My Data
            </Button>
            <Button variant="destructive" className="w-full md:w-auto">
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
