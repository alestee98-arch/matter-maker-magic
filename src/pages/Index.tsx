import React, { useState } from 'react';
import LandingPage from '@/components/LandingPage';
import InteractiveDemo from '@/components/InteractiveDemo';
import WeeklyQuestion from '@/components/WeeklyQuestion';
import PersonalArchive from '@/components/PersonalArchive';
import ProfilePage from '@/components/ProfilePage';
import VoiceCloning from '@/components/VoiceCloning';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';

export default function Index() {
const [currentView, setCurrentView] = useState<'landing' | 'demo' | 'app'>('landing');
  const [appView, setAppView] = useState<'home' | 'archive' | 'profile' | 'settings' | 'voice-clone'>('home');

  if (currentView === 'landing') {
    return (
      <LandingPage 
        onStartJourney={() => setCurrentView('app')}
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

  // App view with navigation
  return (
    <AppLayout 
      currentView={appView} 
      onViewChange={setAppView}
      onBack={() => setCurrentView('landing')}
    >
      {appView === 'home' && (
        <div className="grid gap-8 lg:grid-cols-2">
          <WeeklyQuestion />
          <PersonalArchive />
        </div>
      )}
      
      {appView === 'archive' && <PersonalArchive />}
      
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