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
        <div className="fixed bottom-8 right-8 flex flex-col gap-4">
          <Button 
            onClick={() => setCurrentView('demo')}
            className="bg-premium-purple hover:bg-premium-purple/80"
          >
            Ver Demo
          </Button>
          <Button 
            onClick={() => setCurrentView('app')}
            variant="outline"
            className="border-premium-purple text-premium-purple hover:bg-premium-purple/10"
          >
            Entrar a la App
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
            ← Volver
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
            ← Volver al Inicio
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
            <h2 className="text-2xl font-semibold mb-4">Configuración</h2>
            <p className="text-muted-foreground">Panel de configuración próximamente...</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
