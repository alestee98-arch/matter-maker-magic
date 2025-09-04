import React, { useState } from 'react';
import DribbbleGrade from '@/components/DribbbleGrade';
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
      <div className="min-h-screen">
        <DribbbleGrade />
        <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
          <Button 
            onClick={() => setCurrentView('demo')}
            className="bg-premium-purple text-white hover:bg-premium-purple/80 shadow-lg"
          >
            View Demo
          </Button>
          <Button 
            onClick={() => setCurrentView('app')}
            className="bg-card text-card-foreground border-2 border-premium-purple hover:bg-premium-purple hover:text-white shadow-lg"
          >
            Enter App
          </Button>
        </div>
      </div>
    );
  }

  if (currentView === 'demo') {
    return (
      <div className="min-h-screen">
        <InteractiveDemo />
        <div className="fixed top-8 left-8">
          <Button 
            onClick={() => setCurrentView('landing')}
            variant="outline"
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
