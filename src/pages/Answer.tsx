import { useState, useEffect } from 'react';
import { triggerProcessingPipeline } from '@/lib/process-pipeline';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check, Loader2, Lock, ArrowLeft, PenTool, Mic, Camera, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import MatterLogo from '@/components/MatterLogo';
import MediaUploader from '@/components/MediaUploader';

export default function Answer() {
  const [searchParams] = useSearchParams();
  const questionId = searchParams.get('q');
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [question, setQuestion] = useState<{ id: string; question: string; category: string } | null>(null);
  const [response, setResponse] = useState('');
  const [responseType, setResponseType] = useState<'text' | 'audio' | 'camera' | 'upload'>('text');
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [capturedMediaType, setCapturedMediaType] = useState<'audio' | 'video' | 'photo' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      const redirectPath = `/answer${questionId ? `?q=${questionId}` : ''}`;
      navigate(`/auth?mode=login&redirect=${encodeURIComponent(redirectPath)}`);
    }
  }, [user, authLoading, navigate, questionId]);

  // Fetch the question
  useEffect(() => {
    const fetchQuestion = async () => {
      if (!user) return;
      setIsLoading(true);

      try {
        if (questionId) {
          const { data, error } = await supabase
            .from('questions')
            .select('*')
            .eq('id', questionId)
            .single();

          if (error || !data) {
            await fetchNextQuestion();
          } else {
            setQuestion(data);
          }
        } else {
          await fetchNextQuestion();
        }
      } catch {
        await fetchNextQuestion();
      } finally {
        setIsLoading(false);
      }
    };

    const fetchNextQuestion = async () => {
      // Get answered question IDs
      const { data: responses } = await supabase
        .from('responses')
        .select('question_id')
        .eq('user_id', user!.id);

      const answeredIds = responses?.map(r => r.question_id).filter(Boolean) as string[] || [];

      // Try sequence-based selection first
      const { data: profile } = await supabase
        .from('profiles')
        .select('age_group, current_sequence_position')
        .eq('id', user!.id)
        .single();

      const userAgeGroup = (profile as any)?.age_group;
      const currentPos = (profile as any)?.current_sequence_position ?? 0;

      if (userAgeGroup) {
        const { data: seqData } = await supabase
          .from('question_sequences')
          .select('question_id, position, questions(id, question, category)')
          .eq('age_group', userAgeGroup)
          .gt('position', currentPos)
          .order('position', { ascending: true })
          .limit(1) as any;

        if (seqData && seqData.length > 0 && seqData[0].questions) {
          setQuestion(seqData[0].questions);
          return;
        }
      }

      // Fallback: random unanswered question
      const { data: questions } = await supabase
        .from('questions')
        .select('*');

      if (questions && questions.length > 0) {
        const unanswered = questions.filter(q => !answeredIds.includes(q.id));
        const pool = unanswered.length > 0 ? unanswered : questions;
        setQuestion(pool[Math.floor(Math.random() * pool.length)]);
      }
    };

    fetchQuestion();
  }, [user, questionId]);

  const handleSubmit = async () => {
    if (!question || !user) return;

    // For text, require content; for media, require a URL
    if (responseType === 'text' && !response.trim()) return;
    if (responseType !== 'text' && !mediaUrl) return;

    setIsSubmitting(true);
    try {
      const contentType = responseType === 'text' ? 'text' : (capturedMediaType || 'text');
      const insertData = {
        user_id: user.id,
        question_id: question.id,
        content: response.trim() || `[${contentType} response]`,
        content_type: contentType,
        word_count: response.trim() ? response.trim().split(/\s+/).length : 0,
        privacy: 'private' as const,
        audio_url: capturedMediaType === 'audio' ? mediaUrl : null,
        video_url: capturedMediaType === 'video' ? mediaUrl : null,
        photo_url: capturedMediaType === 'photo' ? mediaUrl : null,
      };

      const { data: inserted, error } = await supabase
        .from('responses')
        .insert(insertData)
        .select('id')
        .single();

      if (error) throw error;

      if (inserted?.id) {
        triggerProcessingPipeline(inserted.id, user.id);
      }

      // Advance sequence position so the next question is shown
      const { data: profileData } = await supabase
        .from('profiles')
        .select('current_sequence_position')
        .eq('id', user.id)
        .single();
      
      const currentPos = (profileData as any)?.current_sequence_position ?? 0;
      await supabase
        .from('profiles')
        .update({ current_sequence_position: currentPos + 1 })
        .eq('id', user.id);

      setIsSubmitted(true);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to save',
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const wordCount = response.trim().split(/\s+/).filter(Boolean).length;
  const canSubmit = responseType === 'text' ? !!response.trim() : !!mediaUrl;

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <MatterLogo size="lg" className="text-foreground animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal header */}
      <header className="px-6 py-5 flex items-center justify-between">
        <MatterLogo size="sm" className="text-foreground" />
        <button
          onClick={() => navigate('/')}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Home
        </button>
      </header>

      {/* Full-screen focused content */}
      <main className="flex-1 flex items-center justify-center px-6 pb-16">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            {isSubmitted ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                  className="w-16 h-16 rounded-full bg-foreground flex items-center justify-center mx-auto mb-6"
                >
                  <Check className="w-8 h-8 text-background" />
                </motion.div>
                <h2 className="text-3xl font-serif text-foreground mb-3">Preserved</h2>
                <p className="text-muted-foreground mb-8">This moment is now part of your legacy.</p>
                <Button
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="rounded-full px-8"
                >
                  Go home
                </Button>
              </motion.div>
            ) : question ? (
              <motion.div
                key="question"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Category label */}
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-6">
                  This week's question
                </p>

                {/* The question */}
                <h1 className="text-3xl md:text-4xl font-serif text-foreground leading-snug mb-8">
                  {question.question}
                </h1>

                {/* Response type selector */}
                <div className="flex gap-2 mb-6">
                  {[
                    { type: 'text' as const, icon: PenTool, label: 'Write' },
                    { type: 'audio' as const, icon: Mic, label: 'Record' },
                    { type: 'camera' as const, icon: Camera, label: 'Camera' },
                    { type: 'upload' as const, icon: Upload, label: 'Media' },
                  ].map(({ type, icon: Icon, label }) => (
                    <button
                      key={type}
                      onClick={() => { setResponseType(type); setMediaUrl(null); setCapturedMediaType(null); }}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        responseType === type
                          ? 'bg-foreground text-background'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>

                {/* Response area */}
                {responseType === 'text' ? (
                  <Textarea
                    placeholder="Start writing..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    autoFocus
                    className="min-h-[200px] bg-transparent border border-border/50 rounded-2xl resize-none text-lg leading-relaxed placeholder:text-muted-foreground/40 focus-visible:ring-0 focus-visible:border-foreground/30 px-5 py-5 transition-all duration-200"
                  />
                ) : (
                  <MediaUploader
                    type={responseType}
                    onUpload={(url, contentType) => { setMediaUrl(url); setCapturedMediaType(contentType); }}
                    onClear={() => { setMediaUrl(null); setCapturedMediaType(null); }}
                    mediaUrl={mediaUrl}
                    capturedType={capturedMediaType}
                  />
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {responseType === 'text' && <span>{wordCount} words</span>}
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      Private
                    </span>
                  </div>
                  <Button
                    onClick={handleSubmit}
                    disabled={!canSubmit || isSubmitting}
                    className="rounded-full px-8 h-11 bg-foreground text-background hover:bg-foreground/90"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Save'
                    )}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <p className="text-muted-foreground">No question available right now.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}