import React, { useState } from 'react';
import { Home, Archive, User, Settings, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MatterLogo from '@/components/MatterLogo';

interface AppLayoutProps {
  children: React.ReactNode;
  currentView: 'home' | 'archive' | 'profile' | 'settings';
  onViewChange: (view: 'home' | 'archive' | 'profile' | 'settings') => void;
  onBack?: () => void;
}

const navigation: Array<{
  id: 'home' | 'archive' | 'profile' | 'settings';
  label: string;
  icon: any;
}> = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'archive', label: 'Archive', icon: Archive },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function AppLayout({ children, currentView, onViewChange, onBack }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              {onBack && (
                <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
                  ← Back
                </Button>
              )}
              <MatterLogo size="md" />
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    currentView === item.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium text-foreground">John Doe</div>
                <div className="text-xs text-muted-foreground">12 stories</div>
              </div>
              <button className="h-10 w-10 overflow-hidden rounded-full bg-secondary border-2 border-border">
                <img 
                  src="https://i.pravatar.cc/40?img=13" 
                  alt="User" 
                  className="h-full w-full object-cover"
                />
              </button>
              
              {/* Mobile menu button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-muted-foreground hover:text-foreground"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card">
            <nav className="px-4 py-3 space-y-1">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    currentView === item.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}