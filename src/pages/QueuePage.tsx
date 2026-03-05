import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowLeft, ListOrdered } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import MatterLogo from '@/components/MatterLogo';

interface SequenceItem {
  position: number;
  question_id: string;
  question: string;
  category: string;
}

export default function QueuePage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [sequence, setSequence] = useState<SequenceItem[]>([]);
  const [answeredIds, setAnsweredIds] = useState<Set<string>>(new Set());
  const [ageGroup, setAgeGroup] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?mode=login&redirect=/queue');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Get profile age_group
        const { data: profile } = await supabase
          .from('profiles')
          .select('age_group')
          .eq('id', user.id)
          .single();

        const userAgeGroup = (profile as any)?.age_group;
        setAgeGroup(userAgeGroup);

        if (!userAgeGroup) {
          setIsLoading(false);
          return;
        }

        // Get sequence and answered questions in parallel
        const [seqResult, respResult] = await Promise.all([
          supabase
            .from('question_sequences')
            .select('position, question_id, questions(question, category)')
            .eq('age_group', userAgeGroup)
            .order('position', { ascending: true }) as any,
          supabase
            .from('responses')
            .select('question_id')
            .eq('user_id', user.id),
        ]);

        if (seqResult.data) {
          setSequence(
            seqResult.data.map((row: any) => ({
              position: row.position,
              question_id: row.question_id,
              question: row.questions?.question || '',
              category: row.questions?.category || '',
            }))
          );
        }

        if (respResult.data) {
          setAnsweredIds(new Set(respResult.data.map((r: any) => r.question_id).filter(Boolean)));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <MatterLogo size="lg" className="text-foreground animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
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

      <main className="flex-1 px-6 pb-16 max-w-2xl mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <ListOrdered className="w-6 h-6 text-foreground" />
            <h1 className="text-3xl font-serif text-foreground">Your questions</h1>
          </div>
          <p className="text-muted-foreground mb-8">Answer them in any order, or follow the sequence.</p>

          {!ageGroup ? (
            <div className="text-center py-16 bg-secondary/30 rounded-2xl border border-border/50">
              <p className="text-muted-foreground mb-4">Complete onboarding to get your personalized question sequence.</p>
              <Button onClick={() => navigate('/onboarding')} className="rounded-full px-8">
                Complete setup
              </Button>
            </div>
          ) : sequence.length === 0 ? (
            <div className="text-center py-16 bg-secondary/30 rounded-2xl border border-border/50">
              <p className="text-muted-foreground">No question sequence has been set up for your age group yet. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sequence.map((item, index) => {
                const isAnswered = answeredIds.has(item.question_id);
                return (
                  <motion.button
                    key={item.question_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => !isAnswered && navigate(`/answer?q=${item.question_id}`)}
                    disabled={isAnswered}
                    className={`w-full text-left flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 ${
                      isAnswered
                        ? 'border-border/30 bg-muted/20 opacity-60 cursor-default'
                        : 'border-border/50 bg-secondary/20 hover:bg-secondary/40 hover:border-foreground/20 cursor-pointer'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isAnswered ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground'
                    }`}>
                      {isAnswered ? <Check className="w-4 h-4" /> : item.position}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-relaxed ${isAnswered ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {item.question}
                      </p>
                      <Badge variant="secondary" className="mt-1.5 text-xs">
                        {item.category}
                      </Badge>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
