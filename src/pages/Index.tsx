import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LandingPage from '@/components/LandingPage';
import InteractiveDemo from '@/components/InteractiveDemo';
import HomePage from '@/components/HomePage';
import ProfilePage from '@/components/ProfilePage';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Sprout } from 'lucide-react';

export default function Index() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'landing' | 'demo' | 'app'>('landing');
  const [appView, setAppView] = useState<'home' | 'profile' | 'settings'>('home');

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">
          <Sprout className="w-12 h-12 text-primary" />
        </div>
      </div>
    );
  }

  // If user is logged in and on landing, go to app
  const handleStartJourney = () => {
    if (user) {
      setCurrentView('app');
    } else {
      navigate('/auth');
    }
  };

  if (currentView === 'landing' && !user) {
    return (
      <LandingPage 
        onStartJourney={handleStartJourney}
        onTryDemo={() => setCurrentView('demo')}
      />
    );
  }

  if (currentView === 'demo') {
    return (
      <div className="min-h-screen">
        <InteractiveDemo />
        <div className="fixed top-8 left-8 z-50">
          <Button 
            onClick={() => setCurrentView('landing')}
            variant="outline"
            className="bg-card/80 backdrop-blur-sm"
          >
            ← Back
          </Button>
        </div>
      </div>
    );
  }

  // If user is logged in, show the app
  if (user) {
    return (
      <AppLayout 
        currentView={appView} 
        onViewChange={setAppView}
        onBack={async () => {
          await signOut();
          setCurrentView('landing');
        }}
      >
        {appView === 'home' && <HomePage />}
        
        {appView === 'profile' && <ProfilePage />}
        
        {appView === 'settings' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-serif text-foreground mb-2">Settings</h2>
              <p className="text-muted-foreground">Manage your account and preferences</p>
            </div>
            
            <div className="grid gap-4 max-w-xl mx-auto">
              {/* Account */}
              <div className="p-5 bg-card rounded-xl border border-border">
                <h3 className="font-medium text-foreground mb-1">Account</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>

              {/* Notifications */}
              <div className="p-5 bg-card rounded-xl border border-border flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">Weekly reminders</h3>
                  <p className="text-sm text-muted-foreground">Get notified when a new question arrives</p>
                </div>
                <div className="w-10 h-6 bg-primary rounded-full relative cursor-pointer">
                  <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-primary-foreground rounded-full shadow-sm" />
                </div>
              </div>

              {/* Privacy */}
              <div className="p-5 bg-card rounded-xl border border-border flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">Profile visibility</h3>
                  <p className="text-sm text-muted-foreground">Who can view your legacy profile</p>
                </div>
                <span className="text-sm text-muted-foreground">Invited only</span>
              </div>

              {/* Sign out */}
              <button
                onClick={async () => {
                  await signOut();
                  setCurrentView('landing');
                }}
                className="p-5 bg-card rounded-xl border border-border text-left hover:border-destructive/50 transition-colors"
              >
                <h3 className="font-medium text-destructive">Sign out</h3>
                <p className="text-sm text-muted-foreground">Log out of your account</p>
              </button>
            </div>
          </div>
        )}
      </AppLayout>
    );
  }

  // Not logged in, show landing
  return (
    <LandingPage 
      onStartJourney={handleStartJourney}
      onTryDemo={() => setCurrentView('demo')}
    />
  );
}
