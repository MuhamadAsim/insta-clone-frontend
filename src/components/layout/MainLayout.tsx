import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNavbar from './MobileNavbar';
import { useIsMobile } from '@/hooks/use-mobile';

interface MainLayoutProps {
  onLogout: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (darkMode: boolean) => void;
}

const MainLayout = ({ onLogout, isDarkMode, setIsDarkMode }: MainLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {!isMobile && (
        <Sidebar
          onLogout={onLogout}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />
      )}

      <main className="flex-1 flex flex-col">
        {/* Scrollable content only */}
        <div className="flex-1 overflow-y-auto px-4">
          <Outlet />
        </div>

        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 z-50">
            <MobileNavbar />
          </div>
        )}
      </main>
    </div>
  );
};


export default MainLayout;
