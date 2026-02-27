import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import LandingPage from '@/components/LandingPage';
import InteractiveDemo from '@/components/InteractiveDemo';
import HomePage from '@/components/HomePage';
import ProfilePage from '@/components/ProfilePage';
import AppLayout from '@/components/AppLayout';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sprout, Check, Phone } from 'lucide-react';
import { toast } from 'sonner';

export default function Index() {
  const { user, loading, signOut } = useAuth();
  const { profile, updateProfile } = useProfile();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'landing' | 'demo' | 'app'>('landing');
  const [appView, setAppView] = useState<'home' | 'profile' | 'settings'>('home');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [savingPhone, setSavingPhone] = useState(false);
  const [phoneSaved, setPhoneSaved] = useState(false);

  useEffect(() => {
    if (profile?.phone) {
      setPhoneNumber(profile.phone);
      setPhoneSaved(true);
    }
  }, [profile?.phone]);

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
              <p className="text-muted-foreground">Manage your contact information</p>
            </div>
            
            <div className="grid gap-4 max-w-xl mx-auto">
              {/* Account */}
              <div className="p-5 bg-card rounded-xl border border-border">
                <h3 className="font-medium text-foreground mb-1">Account</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>

               {/* Phone number */}
              <div className={`p-5 bg-card rounded-xl border transition-all duration-500 ${phoneSaved ? 'border-primary/40' : 'border-border'}`}>
                <h3 className="font-medium text-foreground mb-1 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone number
                </h3>
                <p className="text-sm text-muted-foreground mb-3">For SMS question reminders</p>
                <div className="flex gap-2">
                  <Input
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value.replace(/[^\d()-\s+]/g, ''));
                      setPhoneSaved(false);
                    }}
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    disabled={savingPhone || phoneNumber === (profile?.phone || '')}
                    onClick={async () => {
                      setSavingPhone(true);
                      const digits = phoneNumber.replace(/\D/g, '');
                      const { error } = await updateProfile({ phone: digits || null });
                      setSavingPhone(false);
                      if (error) {
                        toast.error('Failed to save phone number');
                      } else {
                        setPhoneSaved(true);
                        toast.success('Phone number saved! 🎉');
                      }
                    }}
                    className="rounded-full"
                  >
                    {savingPhone ? '...' : <Check className="w-4 h-4" />}
                  </Button>
                </div>

                {/* Prominent success badge */}
                {phoneSaved && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="mt-4 flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-xl px-4 py-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Phone number saved</p>
                      <p className="text-xs text-muted-foreground">You'll receive weekly questions via text 📱</p>
                    </div>
                  </motion.div>
                )}

                {!phoneSaved && (
                  <p className="text-xs text-muted-foreground/60 mt-2">US numbers only. We'll text your weekly question.</p>
                )}
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
