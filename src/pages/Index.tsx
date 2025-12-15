import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LandingPage from '@/components/LandingPage';
import InteractiveDemo from '@/components/InteractiveDemo';
import HomePage from '@/components/HomePage';
import ProfilePage from '@/components/ProfilePage';
import VoiceCloning from '@/components/VoiceCloning';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Sprout } from 'lucide-react';

export default function Index() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'landing' | 'demo' | 'app'>('landing');
  const [appView, setAppView] = useState<'home' | 'profile' | 'settings' | 'voice-clone'>('home');

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
              <p className="text-muted-foreground">Manage your Matter profile and preferences</p>
            </div>
            
            <div className="grid gap-4 max-w-xl mx-auto">
              <button
                onClick={() => setAppView('voice-clone')}
                className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors text-left"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl">🎙️</span>
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Voice Cloning</h3>
                  <p className="text-sm text-muted-foreground">Create your personalized AI voice</p>
                </div>
              </button>
            </div>
          </div>
        )}
        
        {appView === 'voice-clone' && (
          <VoiceCloning 
            onBack={() => setAppView('settings')}
            onVoiceCreated={(voiceId, name) => {
              console.log('Voice created:', voiceId, name);
            }}
          />
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
