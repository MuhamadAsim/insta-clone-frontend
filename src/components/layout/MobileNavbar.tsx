
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  MessageCircle, 
  Search, 
  User, 
  Inbox, 
  Settings,
  Home,
  Video
} from "lucide-react";

const MobileNavbar = () => {
  const location = useLocation();

  const menuItems = [
    { icon: Home, path: '/' },
    { icon: Video, path: '/reels' },
    { icon: MessageCircle, path: '/messages' },
    { icon: Search, path: '/search' },
    { icon: User, path: '/profile' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="bg-card border-t border-border p-2">
      <div className="flex justify-around">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.path} to={item.path}>
              <Button
                variant="ghost"
                size="sm"
                className={`p-3 ${isActive(item.path) ? 'text-primary' : 'text-muted-foreground'}`}
              >
                <Icon className="h-6 w-6" />
              </Button>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNavbar;
