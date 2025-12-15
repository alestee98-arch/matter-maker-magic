import React, { useState } from 'react';
import { Home, User, Settings, Menu, X, LogOut } from 'lucide-react';
import MatterLogo from '@/components/MatterLogo';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { motion, AnimatePresence } from 'framer-motion';

interface AppLayoutProps {
  children: React.ReactNode;
  currentView: 'home' | 'profile' | 'settings' | 'voice-clone';
  onViewChange: (view: 'home' | 'profile' | 'settings' | 'voice-clone') => void;
  onBack?: () => void;
}

const navigation: Array<{
  id: 'home' | 'profile' | 'settings';
  label: string;
  icon: any;
}> = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function AppLayout({ children, currentView, onViewChange, onBack }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const { profile } = useProfile();

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';
  const avatarUrl = profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation - Apple-inspired */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <MatterLogo size="md" className="text-foreground" />
            
            {/* Desktop Navigation - Centered */}
            <nav className="hidden md:flex items-center bg-secondary/60 rounded-full p-1">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`relative flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    currentView === item.id
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {currentView === item.id && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-card shadow-sm rounded-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </span>
                </button>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              {onBack && (
                <button
                  onClick={onBack}
                  className="hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              )}
              
              <button 
                onClick={() => onViewChange('profile')}
                className="h-9 w-9 overflow-hidden rounded-full bg-secondary ring-2 ring-border hover:ring-foreground/20 transition-all"
              >
                <img 
                  src={avatarUrl} 
                  alt={displayName} 
                  className="h-full w-full object-cover"
                />
              </button>
              
              {/* Mobile menu button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl overflow-hidden"
            >
              <nav className="px-4 py-4 space-y-1">
                {navigation.map((item, index) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      onViewChange(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                      currentView === item.id
                        ? 'bg-foreground text-background'
                        : 'text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </motion.button>
                ))}
                
                {onBack && (
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navigation.length * 0.05 }}
                    onClick={onBack}
                    className="flex w-full items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-muted-foreground hover:bg-secondary transition-all"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign out
                  </motion.button>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        {children}
      </main>
    </div>
  );
}
