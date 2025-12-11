import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Sprout } from 'lucide-react';
import { z } from 'zod';

const nameSchema = z.string().trim().min(1, 'This field is required').max(50, 'Must be less than 50 characters');

export default function Onboarding() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string }>({});
  
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth?mode=signup');
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const firstNameResult = nameSchema.safeParse(firstName);
    const lastNameResult = nameSchema.safeParse(lastName);
    
    const newErrors: typeof errors = {};
    if (!firstNameResult.success) {
      newErrors.firstName = firstNameResult.error.errors[0].message;
    }
    if (!lastNameResult.success) {
      newErrors.lastName = lastNameResult.error.errors[0].message;
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    setIsLoading(true);
    
    try {
      const displayName = `${firstName.trim()} ${lastName.trim()}`;
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          display_name: displayName,
        })
        .eq('id', user?.id);
      
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Failed to update profile',
          description: error.message
        });
      } else {
        toast({
          title: 'Welcome to Matter!',
          description: 'Your account is all set up.'
        });
        navigate('/');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">
          <Sprout className="w-12 h-12 text-primary" />
        </div>
      </div>
    );
  }

  const userInitial = user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-serif text-foreground mb-2">Welcome to Matter!</h1>
            <p className="text-muted-foreground">Let's finish setting up your account.</p>
          </div>

          {/* User Email Display */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-muted-foreground flex items-center justify-center text-background font-medium">
              {userInitial}
            </div>
            <span className="text-foreground">{user?.email}</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium text-foreground">
                First name
              </Label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (errors.firstName) setErrors({ ...errors, firstName: undefined });
                }}
                className={`h-12 text-base bg-muted/50 ${errors.firstName ? 'border-destructive' : ''}`}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium text-foreground">
                Last name
              </Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  if (errors.lastName) setErrors({ ...errors, lastName: undefined });
                }}
                className={`h-12 text-base bg-muted/50 ${errors.lastName ? 'border-destructive' : ''}`}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName}</p>
              )}
            </div>

            {/* Phone Number (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                Phone number (optional)
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-foreground">
                  <span className="text-lg">🇺🇸</span>
                  <span className="text-sm text-muted-foreground">+1</span>
                </div>
                <Input
                  id="phone"
                  type="tel"
                  placeholder=""
                  value={phoneNumber}
                  onChange={(e) => {
                    // Only allow numbers
                    const value = e.target.value.replace(/\D/g, '');
                    setPhoneNumber(value);
                  }}
                  className="h-12 text-base bg-muted/50 pl-20"
                  maxLength={10}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Matter sends helpful reminders via text. Text STOP or disable in settings to unsubscribe. Msg & data rates may apply.
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-border pt-6">
              {/* Marketing Opt-in */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id="marketing"
                  checked={marketingOptIn}
                  onCheckedChange={(checked) => setMarketingOptIn(checked === true)}
                  className="mt-1"
                />
                <label 
                  htmlFor="marketing" 
                  className="text-sm text-foreground leading-relaxed cursor-pointer"
                >
                  I would like to receive helpful tips, updates, and occasional announcements via email. Unsubscribe at any time.
                </label>
              </div>
            </div>

            {/* Privacy Notice */}
            <p className="text-sm text-muted-foreground">
              Privacy is important to us. By continuing, you acknowledge that you have read and accept Matter's{' '}
              <a href="#" className="text-foreground underline hover:no-underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-foreground underline hover:no-underline">Privacy Policy</a>.
            </p>

            <Button 
              type="submit" 
              className="w-full h-12 text-base" 
              disabled={isLoading || !firstName || !lastName}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground" />
              ) : (
                'Continue'
              )}
            </Button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}