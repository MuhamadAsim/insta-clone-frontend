import { NavLink } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageCircle,
  Search,
  User,
  Settings,
  Inbox,
  LogOut,
  Moon,
  Sun,
  Home,
  Video
} from "lucide-react";
import { useUser } from "../context/UserContext";

interface SidebarProps {
  onLogout: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (darkMode: boolean) => void;
}

const Sidebar = ({ onLogout, isDarkMode, setIsDarkMode }: SidebarProps) => {
  const user = useUser();

  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Video, label: 'Reels', path: '/reels' },
    { icon: MessageCircle, label: 'Messages', path: '/messages' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: Inbox, label: 'Requests', path: '/inbox' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <MessageCircle className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold">SocialApp</h1>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            {user?.profilePicture ? (
              <AvatarImage
                src={
                  user?.profilePicture?.startsWith("data:image")
                    ? user.profilePicture
                    : `data:image/jpeg;base64,${user?.profilePicture}`
                }
              />

            ) : (
              <AvatarFallback>{user?.username?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{user?.username ?? "Loading..."}</p>
            <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map(({ icon: Icon, label, path }) => (
          <NavLink key={path} to={path}>
            {({ isActive }) => (
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className="w-full justify-start space-x-3 h-12"
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Button>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start space-x-3 h-12"
          onClick={() => setIsDarkMode(!isDarkMode)}
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start space-x-3 h-12 text-destructive hover:text-destructive"
          onClick={onLogout}
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
