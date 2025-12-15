import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  PenTool, 
  Mic, 
  Video, 
  Lock, 
  Loader2,
  Check,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Question {
  id: string;
  question: string;
  category: string;
  depth: string | null;
}

export default function HomePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [response, setResponse] = useState('');
  const [responseType, setResponseType] = useState<'text' | 'audio' | 'video'>('text');
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [entriesCount, setEntriesCount] = useState(0);

  useEffect(() => {
    const fetchQuestion = async () => {
      if (!user) return;
      
      setIsLoadingQuestion(true);
      try {
        const { data: responses } = await supabase
          .from('responses')
          .select('question_id')
          .eq('user_id', user.id);
        
        setEntriesCount(responses?.length || 0);
        const answeredIds = responses?.map(r => r.question_id).filter(Boolean) as string[] || [];
        
        const { data: questions, error } = await supabase
          .from('questions')
          .select('*');
        
        if (error) throw error;
        
        if (questions && questions.length > 0) {
          const unansweredQuestions = questions.filter(q => !answeredIds.includes(q.id));
          
          if (unansweredQuestions.length > 0) {
            const randomIndex = Math.floor(Math.random() * unansweredQuestions.length);
            setCurrentQuestion(unansweredQuestions[randomIndex]);
          } else {
            const randomIndex = Math.floor(Math.random() * questions.length);
            setCurrentQuestion(questions[randomIndex]);
          }
        }
      } catch (error) {
        console.error('Error fetching question:', error);
      } finally {
        setIsLoadingQuestion(false);
      }
    };
    
    fetchQuestion();
  }, [user]);

  const handleSubmit = async () => {
    if (!currentQuestion || !user || !response.trim()) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('responses')
        .insert({
          user_id: user.id,
          question_id: currentQuestion.id,
          content: response.trim(),
          content_type: responseType,
          word_count: response.trim().split(/\s+/).length,
          privacy: 'private'
        });
      
      if (error) throw error;
      
      setIsSubmitted(true);
      setEntriesCount(prev => prev + 1);
      toast({
        title: 'Saved',
        description: 'Your response has been preserved.'
      });
      
      setTimeout(() => {
        setResponse('');
        setIsSubmitted(false);
      }, 3000);
      
    } catch (error: any) {
      console.error('Error saving response:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const wordCount = response.trim().split(/\s+/).filter(Boolean).length;

  const weekNumber = Math.floor(entriesCount / 1) + 1;

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col">
      {/* Journey Context Strip - softer framing for new users */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between mb-8 pb-6 border-b border-border/50"
      >
        <div className="text-left">
          <p className="text-lg font-serif text-foreground">
            {entriesCount === 0 ? 'Your journey starts here' : `Week ${weekNumber} of your journey`}
          </p>
          {entriesCount > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {entriesCount} {entriesCount === 1 ? 'reflection' : 'reflections'} saved
            </p>
          )}
        </div>
      </motion.div>

      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <p className="text-sm text-muted-foreground mb-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-3xl md:text-4xl text-foreground font-serif">
            {entriesCount === 0 ? 'Begin your story' : 'Continue your story'}
          </h1>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col max-w-2xl">
        <AnimatePresence mode="wait">
          {isLoadingQuestion ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex items-center justify-center"
            >
              <div className="w-8 h-8 rounded-full border-2 border-muted-foreground/20 border-t-foreground animate-spin" />
            </motion.div>
          ) : isSubmitted ? (
            <motion.div
              key="submitted"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex-1 flex flex-col items-center justify-center text-center py-20"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className="w-16 h-16 rounded-full bg-foreground flex items-center justify-center mb-6"
              >
                <Check className="w-8 h-8 text-background" />
              </motion.div>
              <h2 className="text-2xl font-serif text-foreground mb-2">Preserved</h2>
              <p className="text-muted-foreground">This moment is now part of your legacy.</p>
            </motion.div>
          ) : currentQuestion ? (
            <motion.div
              key="question"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col"
            >
              {/* Question */}
              <div className="mb-8">
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  This week's question
                </span>
                <h2 className="text-2xl md:text-3xl font-serif text-foreground leading-relaxed">
                  {currentQuestion.question}
                </h2>
              </div>

              {/* Response Type Selector - Write emphasized as default */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setResponseType('text')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    responseType === 'text'
                      ? 'bg-foreground text-background shadow-md'
                      : 'bg-foreground/10 text-foreground hover:bg-foreground/20'
                  }`}
                >
                  <PenTool className="w-4 h-4" />
                  Write
                </button>
                <button
                  onClick={() => setResponseType('audio')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    responseType === 'audio'
                      ? 'bg-foreground text-background shadow-md'
                      : 'border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  Record
                </button>
                <button
                  onClick={() => setResponseType('video')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    responseType === 'video'
                      ? 'bg-foreground text-background shadow-md'
                      : 'border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  Video
                </button>
              </div>

              {/* Response Area */}
              <div className="flex-1">
                {responseType === 'text' && (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Take your time. Share what comes to mind..."
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      className="min-h-[200px] bg-transparent border-0 border-b border-border rounded-none resize-none text-lg leading-relaxed placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:border-foreground px-0 py-4"
                    />
                    
                    {/* Privacy reassurance - prominent placement */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground/70 py-2">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Saved privately — only visible to you unless you choose otherwise</span>
                    </div>
                    
                    {/* Micro-prompt reassurance */}
                    <p className="text-sm text-muted-foreground/50 italic">
                      You don't need the perfect words. Start anywhere — you can always come back.
                    </p>
                    
                    <div className="flex items-center justify-between pt-4">
                      <span className="text-sm text-muted-foreground">{wordCount} words</span>
                      <Button 
                        onClick={handleSubmit}
                        disabled={!response.trim() || isSubmitting}
                        className="rounded-full px-8 h-12 bg-foreground text-background hover:bg-foreground/90 font-medium text-base shadow-lg shadow-foreground/10 transition-all hover:shadow-xl hover:shadow-foreground/15"
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Save response'
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {responseType === 'audio' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-16 px-8 bg-secondary/50 rounded-3xl"
                  >
                    <div className="w-20 h-20 rounded-full bg-foreground flex items-center justify-center mb-6">
                      <Mic className="w-8 h-8 text-background" />
                    </div>
                    <p className="text-foreground font-medium mb-1">Voice Recording</p>
                    <p className="text-sm text-muted-foreground">Coming soon</p>
                  </motion.div>
                )}

                {responseType === 'video' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-16 px-8 bg-secondary/50 rounded-3xl"
                  >
                    <div className="w-20 h-20 rounded-full bg-foreground flex items-center justify-center mb-6">
                      <Video className="w-8 h-8 text-background" />
                    </div>
                    <p className="text-foreground font-medium mb-1">Video Recording</p>
                    <p className="text-sm text-muted-foreground">Coming soon</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex items-center justify-center text-center"
            >
              <div>
                <p className="text-muted-foreground">No questions available.</p>
                <p className="text-sm text-muted-foreground/70">Check back soon.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
