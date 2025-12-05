import React, { useState } from 'react';
import LandingPage from '@/components/LandingPage';
import InteractiveDemo from '@/components/InteractiveDemo';
import WeeklyQuestion from '@/components/WeeklyQuestion';
import PersonalArchive from '@/components/PersonalArchive';
import ProfilePage from '@/components/ProfilePage';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';

export default function Index() {
  const [currentView, setCurrentView] = useState<'landing' | 'demo' | 'app'>('landing');
  const [appView, setAppView] = useState<'home' | 'archive' | 'profile' | 'settings'>('home');

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
    <AppLayout currentView={appView} onViewChange={setAppView}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            onClick={() => setCurrentView('landing')}
            variant="outline"
            size="sm"
          >
            ← Back to Home
          </Button>
        </div>
        
        {appView === 'home' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <WeeklyQuestion />
            <PersonalArchive />
          </div>
        )}
        
        {appView === 'archive' && <PersonalArchive />}
        
        {appView === 'profile' && <ProfilePage />}
        
        {appView === 'settings' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">Settings</h2>
            <p className="text-muted-foreground">Settings panel coming soon...</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}