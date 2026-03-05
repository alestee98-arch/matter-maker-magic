import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Sprout } from 'lucide-react';
import { z } from 'zod';

const nameSchema = z.string().trim().min(1, 'This field is required').max(50, 'Must be less than 50 characters');

const AGE_GROUPS = [
  { value: '18-35', label: '18–35', subtitle: 'Building your story' },
  { value: '36-55', label: '36–55', subtitle: 'The defining years' },
  { value: '56-70', label: '56–70', subtitle: 'Hard-earned wisdom' },
  { value: '71+', label: '71+', subtitle: 'A life fully lived' },
] as const;

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [onboardingParams] = useSearchParams();
  const onboardingRedirect = onboardingParams.get('redirect') || '/';

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth?mode=signup');
    }
  }, [user, loading, navigate]);

  const handleNameContinue = () => {
    const firstNameResult = nameSchema.safeParse(firstName);
    const lastNameResult = nameSchema.safeParse(lastName);

    const newErrors: typeof errors = {};
    if (!firstNameResult.success) newErrors.firstName = firstNameResult.error.errors[0].message;
    if (!lastNameResult.success) newErrors.lastName = lastNameResult.error.errors[0].message;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setStep(1);
  };

  const handleAgeSelect = async (ageGroup: string) => {
    setIsLoading(true);
    try {
      const displayName = `${firstName.trim()} ${lastName.trim()}`;
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName, age_group: ageGroup } as any)
        .eq('id', user?.id);

      if (error) {
        toast({ variant: 'destructive', title: 'Failed to update profile', description: error.message });
      } else {
        toast({ title: 'Welcome to Matter!', description: 'Your account is all set up.' });
        navigate(onboardingRedirect);
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Progress dots */}
      <div className="flex justify-center gap-2 pt-8">
        {[0, 1].map((i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === step ? 'w-6 bg-foreground' : 'w-2 bg-muted-foreground/30'
            }`}
          />
        ))}
      </div>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="name"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h1 className="text-2xl font-serif text-foreground mb-2">Welcome to Matter!</h1>
                  <p className="text-muted-foreground">What should we call you?</p>
                </div>

                <form
                  onSubmit={(e) => { e.preventDefault(); handleNameContinue(); }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium text-foreground">First name</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => { setFirstName(e.target.value); if (errors.firstName) setErrors({ ...errors, firstName: undefined }); }}
                      className={`h-12 text-base bg-muted/50 ${errors.firstName ? 'border-destructive' : ''}`}
                      autoFocus
                    />
                    {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium text-foreground">Last name</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => { setLastName(e.target.value); if (errors.lastName) setErrors({ ...errors, lastName: undefined }); }}
                      className={`h-12 text-base bg-muted/50 ${errors.lastName ? 'border-destructive' : ''}`}
                    />
                    {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base"
                    disabled={!firstName || !lastName}
                  >
                    Continue
                  </Button>
                </form>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="age"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h1 className="text-2xl font-serif text-foreground mb-2">How old are you?</h1>
                  <p className="text-muted-foreground">This helps us personalize your questions.</p>
                </div>

                <div className="space-y-3">
                  {AGE_GROUPS.map((group) => (
                    <button
                      key={group.value}
                      onClick={() => handleAgeSelect(group.value)}
                      disabled={isLoading}
                      className="w-full text-left p-5 rounded-2xl border border-border/50 bg-secondary/30 hover:bg-secondary/60 hover:border-foreground/20 transition-all duration-200 group disabled:opacity-50"
                    >
                      <span className="text-lg font-medium text-foreground">{group.label}</span>
                      <p className="text-sm text-muted-foreground mt-0.5">{group.subtitle}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
