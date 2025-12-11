import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Sprout, ArrowLeft, Mail } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

export default function Auth() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const [isLogin, setIsLogin] = useState(mode !== 'signup');
  const [step, setStep] = useState<'email' | 'password' | 'forgot' | 'forgot-sent'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const { signIn, signUp, user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleForgotPassword = async () => {
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setErrors({ email: emailResult.error.errors[0].message });
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Failed to send reset email',
          description: error.message
        });
      } else {
        setStep('forgot-sent');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleEmailContinue = () => {
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setErrors({ email: emailResult.error.errors[0].message });
      return;
    }
    setErrors({});
    setStep('password');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 'email') {
      handleEmailContinue();
      return;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      setErrors({ password: passwordResult.error.errors[0].message });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              variant: 'destructive',
              title: 'Login failed',
              description: 'Invalid email or password. Please try again.'
            });
          } else {
            toast({
              variant: 'destructive',
              title: 'Login failed',
              description: error.message
            });
          }
        } else {
          // Fetch the user's display name for the welcome message
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name')
            .single();
          
          const displayNameToShow = profile?.display_name || email.split('@')[0];
          
          toast({
            title: `Welcome back, ${displayNameToShow}!`,
            description: 'You have successfully logged in.'
          });
          navigate('/');
        }
      } else {
        const { error } = await signUp(email, password, displayName);
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              variant: 'destructive',
              title: 'Account exists',
              description: 'This email is already registered. Please log in instead.'
            });
            setIsLogin(true);
          } else {
            toast({
              variant: 'destructive',
              title: 'Sign up failed',
              description: error.message
            });
          }
        } else {
          toast({
            title: 'Account created!',
            description: 'Let\'s complete your profile.'
          });
          navigate('/onboarding');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'password' || step === 'forgot') {
      setStep('email');
      setErrors({});
    } else if (step === 'forgot-sent') {
      setStep('forgot');
      setErrors({});
    } else {
      navigate('/');
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
      {/* Header */}
      <header className="p-6">
        <button 
          onClick={handleBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center mb-4">
              <Sprout className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-serif text-foreground">Matter</h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {step === 'email' && (
                <motion.div
                  key="email-step"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <h1 className="text-2xl font-serif text-foreground">
                    {isLogin ? 'Sign in' : 'Create account'}
                  </h1>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-foreground">
                      Enter your email address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="johndoe@gmail.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: undefined });
                      }}
                      className={`h-12 text-base ${errors.email ? 'border-destructive' : ''}`}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base" 
                    disabled={!email}
                  >
                    Continue
                  </Button>
                </motion.div>
              )}

              {step === 'password' && (
                <motion.div
                  key="password-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <h1 className="text-2xl font-serif text-foreground">
                      {isLogin ? 'Welcome back' : 'Create your password'}
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">{email}</p>
                  </div>

                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="displayName" className="text-sm font-medium text-foreground">
                        Your name
                      </Label>
                      <Input
                        id="displayName"
                        type="text"
                        placeholder="How should we call you?"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="h-12 text-base"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-medium text-foreground">
                        {isLogin ? 'Enter your password' : 'Create a password'}
                      </Label>
                      {isLogin && (
                        <button
                          type="button"
                          onClick={() => setStep('forgot')}
                          className="text-sm text-primary hover:underline"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors({ ...errors, password: undefined });
                      }}
                      className={`h-12 text-base ${errors.password ? 'border-destructive' : ''}`}
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password}</p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground" />
                    ) : (
                      isLogin ? 'Sign In' : 'Create Account'
                    )}
                  </Button>
                </motion.div>
              )}

              {step === 'forgot' && (
                <motion.div
                  key="forgot-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <h1 className="text-2xl font-serif text-foreground">Reset your password</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Enter your email and we'll send you a link to reset your password.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reset-email" className="text-sm font-medium text-foreground">
                      Email address
                    </Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="johndoe@gmail.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: undefined });
                      }}
                      className={`h-12 text-base ${errors.email ? 'border-destructive' : ''}`}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>

                  <Button 
                    type="button"
                    onClick={handleForgotPassword}
                    className="w-full h-12 text-base" 
                    disabled={isLoading || !email}
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground" />
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>
                </motion.div>
              )}

              {step === 'forgot-sent' && (
                <motion.div
                  key="forgot-sent-step"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-center space-y-6"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                  
                  <div>
                    <h1 className="text-2xl font-serif text-foreground">Check your email</h1>
                    <p className="text-muted-foreground mt-2 text-sm">
                      We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>
                    </p>
                  </div>

                  <div className="pt-4">
                    <p className="text-muted-foreground text-sm">
                      Didn't receive the email?{' '}
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-primary hover:underline font-medium"
                        disabled={isLoading}
                      >
                        Click to resend
                      </button>
                    </p>
                  </div>

                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setStep('email');
                      setErrors({});
                    }}
                    className="w-full h-12 text-base mt-4"
                  >
                    Back to Sign In
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Only show divider and social login for email/password steps */}
            {(step === 'email' || step === 'password') && (
              <>
                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-background px-4 text-muted-foreground">or</span>
                  </div>
                </div>

                {/* Google Sign In */}
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full h-12 text-base gap-3"
                  onClick={async () => {
                    const { error } = await supabase.auth.signInWithOAuth({
                      provider: 'google',
                      options: {
                        redirectTo: `${window.location.origin}/`
                      }
                    });
                    if (error) {
                      toast({
                        variant: 'destructive',
                        title: 'Google sign in failed',
                        description: error.message
                      });
                    }
                  }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>
              </>
            )}
          </form>

          {/* Toggle - only show for email/password steps */}
          {(step === 'email' || step === 'password') && (
            <div className="mt-8 text-center">
              <p className="text-muted-foreground text-sm">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setStep('email');
                    setErrors({});
                  }}
                  className="ml-2 text-primary hover:underline font-medium"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
