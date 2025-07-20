
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import LoginPage from '@/components/auth/LoginPage';
import SignupPage from '@/components/auth/SignupPage';
import MainLayout from '@/components/layout/MainLayout';
import ProfilePage from '@/components/profile/ProfilePage';
import SettingsPage from '@/components/settings/SettingsPage'; 
import SearchPage from '@/components/search/SearchPage';
import MessagingPage from '@/components/messaging/MessagingPage';
import InboxPage from '@/components/inbox/InboxPage';
import ChatPage from '@/components/chat/ChatPage';
import PostFeed from '@/components/posts/PostFeed';
import ReelsPage from '@/components/reels/ReelsPage';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(savedTheme === 'dark' || (!savedTheme && prefersDark));
    
    // Check authentication status
    const authStatus = localStorage.getItem('isAuthenticated');
    setIsAuthenticated(authStatus === 'true');
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
  };

  if (!isAuthenticated) {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
              <Route path="/signup" element={<SignupPage onLogin={handleLogin} />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
            <Toaster />
            <Sonner />
          </div>
        </Router>
      </div>
    );
  }

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/" element={<MainLayout onLogout={handleLogout} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />}>
              <Route index element={<PostFeed />} />
              <Route path="reels" element={<ReelsPage />} />
              <Route path="messages" element={<MessagingPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="inbox" element={<InboxPage />} />
              <Route path="chat/:userId" element={<ChatPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster />
          <Sonner />
        </div>
      </Router>
    </div>
  );
};

export default Index;
