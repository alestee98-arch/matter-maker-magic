import React from 'react';
import { Home, FileText, User, Settings, Mic, Video, PenTool } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
  currentView: 'home' | 'archive' | 'profile' | 'settings';
  onViewChange: (view: 'home' | 'archive' | 'profile' | 'settings') => void;
}

const navigation: Array<{
  id: 'home' | 'archive' | 'profile' | 'settings';
  label: string;
  icon: any;
}> = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'archive', label: 'Archive', icon: FileText },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function AppLayout({ children, currentView, onViewChange }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header currentView={currentView} onViewChange={onViewChange} />
      <div className="flex">
        <Sidebar currentView={currentView} onViewChange={onViewChange} />
        <main className="flex-1 lg:ml-64">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function Header({ currentView, onViewChange }: { currentView: 'home' | 'archive' | 'profile' | 'settings'; onViewChange: (view: 'home' | 'archive' | 'profile' | 'settings') => void }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Logo />
          <h1 className="text-xl font-semibold">Matter</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <ResponseButtons />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-accent">
      <div className="h-4 w-4 rounded-full bg-background" />
    </div>
  );
}

function ResponseButtons() {
  return (
    <div className="flex items-center gap-2">
      <button className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80">
        <PenTool className="h-4 w-4" />
        <span className="hidden sm:inline">Text</span>
      </button>
      <button className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80">
        <Mic className="h-4 w-4" />
        <span className="hidden sm:inline">Audio</span>
      </button>
      <button className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80">
        <Video className="h-4 w-4" />
        <span className="hidden sm:inline">Video</span>
      </button>
    </div>
  );
}

function UserMenu() {
  return (
    <div className="flex items-center gap-3">
      <button className="h-8 w-8 overflow-hidden rounded-full bg-secondary">
        <img 
          src="https://i.pravatar.cc/32?img=13" 
          alt="User" 
          className="h-full w-full object-cover"
        />
      </button>
    </div>
  );
}

function Sidebar({ currentView, onViewChange }: { currentView: 'home' | 'archive' | 'profile' | 'settings'; onViewChange: (view: 'home' | 'archive' | 'profile' | 'settings') => void }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border lg:block hidden">
      <div className="flex h-full flex-col pt-20">
        <nav className="flex-1 space-y-2 p-4">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                currentView === item.id
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          ))}
        </nav>
        
        <div className="border-t border-border p-4">
          <div className="rounded-lg bg-secondary p-4">
            <h3 className="text-sm font-medium text-secondary-foreground">This week</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              What&apos;s a song that instantly lifts your mood?
            </p>
            <button className="mt-3 w-full rounded-md bg-accent px-3 py-2 text-xs font-medium text-accent-foreground transition-colors hover:bg-accent/80">
              Answer now
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}