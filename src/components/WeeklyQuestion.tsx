import React, { useState, useEffect } from 'react';
import { triggerProcessingPipeline } from '@/lib/process-pipeline';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PenTool, Mic, Video, Image as ImageIcon, Sparkles, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import MediaUploader from '@/components/MediaUploader';

interface Question {
  id: string;
  question: string;
  category: string;
  depth: string | null;
}

export default function WeeklyQuestion() {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [response, setResponse] = useState('');
  const [responseType, setResponseType] = useState<'text' | 'audio' | 'video' | 'photo'>('text');
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<string[]>([]);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch user's answered questions and find an unanswered one
  useEffect(() => {
    const fetchQuestionData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Get all questions user has answered
        const { data: responses } = await supabase
          .from('responses')
          .select('question_id')
          .eq('user_id', user.id);
        
        const answeredIds = responses?.map(r => r.question_id).filter(Boolean) as string[] || [];
        setAnsweredQuestionIds(answeredIds);
        
        // Get all questions
        const { data: questions, error } = await supabase
          .from('questions')
          .select('*');
        
        if (error) throw error;
        
        if (questions && questions.length > 0) {
          // Find unanswered questions
          const unansweredQuestions = questions.filter(q => !answeredIds.includes(q.id));
          
          if (unansweredQuestions.length > 0) {
            // Pick a random unanswered question
            const randomIndex = Math.floor(Math.random() * unansweredQuestions.length);
            setCurrentQuestion(unansweredQuestions[randomIndex]);
          } else {
            // All questions answered - pick a random one to re-answer
            const randomIndex = Math.floor(Math.random() * questions.length);
            setCurrentQuestion(questions[randomIndex]);
          }
        }
      } catch (error) {
        console.error('Error fetching question:', error);
        toast({
          variant: 'destructive',
          title: 'Failed to load question',
          description: 'Please try refreshing the page.'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuestionData();
  }, [user, toast]);

  const handleSubmit = async () => {
    if (!currentQuestion || !user) return;
    
    // For text, require content; for media, require a URL
    if (responseType === 'text' && !response.trim()) return;
    if (responseType !== 'text' && !mediaUrl) return;
    
    setIsSubmitting(true);
    try {
      const insertData = {
        user_id: user.id,
        question_id: currentQuestion.id,
        content: response.trim() || `[${responseType} response]`,
        content_type: responseType,
        word_count: response.trim() ? response.trim().split(/\s+/).length : 0,
        privacy: 'private' as const,
        audio_url: responseType === 'audio' ? mediaUrl : null,
        video_url: responseType === 'video' ? mediaUrl : null,
        photo_url: responseType === 'photo' ? mediaUrl : null,
      };

      const { data: inserted, error } = await supabase
        .from('responses')
        .insert(insertData)
        .select('id')
        .single();
      
      if (error) throw error;

      // Fire-and-forget: silently process response in background
      if (inserted?.id) {
        triggerProcessingPipeline(inserted.id, user.id);
      }
      
      setIsSubmitted(true);
      toast({
        title: 'Response saved!',
        description: 'Your story has been added to your archive.'
      });
      
      // Reset after a moment
      setTimeout(() => {
        setResponse('');
        setMediaUrl(null);
        setIsSubmitted(false);
        // Load next question
        setAnsweredQuestionIds(prev => [...prev, currentQuestion.id]);
      }, 2000);
      
    } catch (error: any) {
      console.error('Error saving response:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to save response',
        description: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDepthStyle = (depth: string | null) => {
    switch (depth) {
      case 'surface': return 'bg-matter-sage/20 text-matter-sage border-matter-sage/30';
      case 'medium': return 'bg-primary/10 text-primary border-primary/30';
      case 'deep': return 'bg-matter-gold/20 text-matter-gold border-matter-gold/30';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getDepthLabel = (depth: string | null) => {
    switch (depth) {
      case 'surface': return 'Light';
      case 'medium': return 'Medium';
      case 'deep': return 'Deep';
      default: return 'Reflect';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-3xl border border-border shadow-md overflow-hidden">
        <div className="px-6 py-5 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">This Week's Question</h2>
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </div>
        </div>
        <div className="px-6 py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="bg-card rounded-3xl border border-border shadow-md overflow-hidden">
        <div className="px-6 py-5 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">This Week's Question</h2>
              <p className="text-sm text-muted-foreground">No questions available</p>
            </div>
          </div>
        </div>
        <div className="px-6 py-12 text-center">
          <p className="text-muted-foreground">Check back soon for your weekly question.</p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="bg-card rounded-3xl border border-border shadow-md overflow-hidden">
        <div className="px-6 py-5 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Check className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Response Saved!</h2>
              <p className="text-sm text-muted-foreground">Your story has been preserved</p>
            </div>
          </div>
        </div>
        <div className="px-6 py-16 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Check className="h-8 w-8 text-primary" />
          </div>
          <p className="text-xl font-serif text-foreground mb-2">Beautiful.</p>
          <p className="text-muted-foreground">Your reflection has been added to your legacy.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-3xl border border-border shadow-md overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border bg-secondary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">This Week's Question</h2>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDepthStyle(currentQuestion.depth)}`}>
            {getDepthLabel(currentQuestion.depth)}
          </span>
        </div>
      </div>

      {/* Question */}
      <div className="px-6 py-8">
        <p className="text-xl md:text-2xl text-foreground leading-relaxed font-serif">
          {currentQuestion.question}
        </p>
        <p className="mt-3 text-sm text-muted-foreground capitalize">
          Category: {currentQuestion.category}
        </p>
      </div>

      {/* Response type selector */}
      <div className="px-6 pb-4">
        <div className="flex gap-2">
          {[
            { type: 'text' as const, icon: PenTool, label: 'Text' },
            { type: 'audio' as const, icon: Mic, label: 'Audio' },
            { type: 'video' as const, icon: Video, label: 'Video' },
            { type: 'photo' as const, icon: ImageIcon, label: 'Photo' },
          ].map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              onClick={() => setResponseType(type)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                responseType === type
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Response area */}
      <div className="px-6 pb-6">
        {responseType === 'text' && (
          <div className="space-y-4">
            <Textarea
              placeholder="Share your thoughts, memories, and reflections..."
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              className="min-h-[140px] bg-background border-border rounded-xl resize-none"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{response.trim().split(/\s+/).filter(Boolean).length} words</span>
              <span>Saved privately</span>
            </div>
            <Button 
              onClick={handleSubmit}
              disabled={!response.trim() || isSubmitting}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-12"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Response'
              )}
            </Button>
          </div>
        )}

        {(responseType === 'audio' || responseType === 'video' || responseType === 'photo') && (
          <div className="space-y-4">
            <MediaUploader
              type={responseType}
              onUpload={(url) => setMediaUrl(url)}
              onClear={() => setMediaUrl(null)}
              mediaUrl={mediaUrl}
            />
            {mediaUrl && (
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-12"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Response'
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}