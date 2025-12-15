import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  ChevronDown,
  ChevronRight,
  Mic,
  PenLine,
  Video,
  Play,
  Settings
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Response {
  id: string;
  content: string;
  content_type: string | null;
  privacy: string | null;
  created_at: string | null;
  question_id: string | null;
  audio_url?: string | null;
  video_url?: string | null;
  questions?: {
    question: string;
    category: string;
    depth: string | null;
  } | null;
}

interface Question {
  id: string;
  question: string;
  category: string;
  depth: string | null;
}

// Category display names and grouping
const CATEGORY_GROUPS: Record<string, string> = {
  'relationships': 'Love & Relationships',
  'family': 'Love & Relationships',
  'childhood': 'Home & Belonging',
  'life': 'Home & Belonging',
  'achievements': 'Growth & Reflection',
  'self': 'Growth & Reflection',
  'wisdom': 'Growth & Reflection',
  'happiness': 'Joy & Gratitude',
  'values': 'Joy & Gratitude',
  'legacy': 'Legacy & Meaning',
};

const GROUP_ORDER = [
  'Love & Relationships',
  'Home & Belonging', 
  'Growth & Reflection',
  'Joy & Gratitude',
  'Legacy & Meaning'
];

export default function ProfilePage() {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const navigate = useNavigate();
  
  const [entries, setEntries] = useState<Response[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [pastQuestions, setPastQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pastQuestionsOpen, setPastQuestionsOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Fetch all responses for grouping
        const { data: responsesData } = await supabase
          .from('responses')
          .select(`
            id,
            content,
            content_type,
            privacy,
            created_at,
            question_id,
            audio_url,
            video_url,
            questions (
              question,
              category,
              depth
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        setEntries(responsesData || []);
        
        // Fetch questions for "this week" and "past unanswered"
        const answeredIds = responsesData?.map(r => r.question_id).filter(Boolean) || [];
        
        const { data: questionsData } = await supabase
          .from('questions')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (questionsData) {
          const unanswered = questionsData.filter(q => !answeredIds.includes(q.id));
          
          // Current week's question
          if (unanswered.length > 0) {
            setCurrentQuestion(unanswered[0]);
            setPastQuestions(unanswered.slice(1, 4)); // Show up to 3 past unanswered
          } else if (questionsData.length > 0) {
            setCurrentQuestion(questionsData[0]);
          }
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  // Group entries by category
  const groupedEntries = React.useMemo(() => {
    const groups: Record<string, Response[]> = {};
    
    entries.forEach(entry => {
      const category = entry.questions?.category || 'legacy';
      const groupName = CATEGORY_GROUPS[category] || 'Legacy & Meaning';
      
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(entry);
    });
    
    return groups;
  }, [entries]);

  if (profileLoading || isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-muted-foreground/20 border-t-foreground animate-spin" />
      </div>
    );
  }

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'New User';
  const avatarUrl = profile?.avatar_url;
  const tagline = profile?.bio || "A life told one question at a time.";

  // Get initials for fallback
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-[calc(100vh-8rem)] max-w-2xl mx-auto px-4">
      {/* Profile Header - Minimal, Human */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center pt-8 pb-12"
      >
        {/* Avatar or Initials */}
        <div className="relative inline-block mb-6">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-24 h-24 rounded-full object-cover ring-2 ring-border"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center ring-2 ring-border">
              <span className="text-2xl font-serif text-foreground">{initials}</span>
            </div>
          )}
        </div>
        
        {/* Name */}
        <h1 className="text-2xl font-serif text-foreground mb-3">{displayName}</h1>
        
        {/* Poetic Tagline */}
        <p className="text-muted-foreground text-sm italic max-w-sm mx-auto leading-relaxed">
          "{tagline}"
        </p>

        {/* Settings - subtle */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="mt-6 text-muted-foreground hover:text-foreground"
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </motion.section>

      {/* This Week's Question */}
      {currentQuestion && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">This week's question</p>
          <div className="bg-card rounded-2xl border border-border p-6">
            <p className="font-serif text-lg text-foreground leading-relaxed mb-5">
              {currentQuestion.question}
            </p>
            <Button 
              onClick={() => navigate('/home')}
              className="rounded-full bg-foreground text-background hover:bg-foreground/90"
            >
              Answer now
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Past Unanswered Questions - Collapsed */}
          {pastQuestions.length > 0 && (
            <Collapsible open={pastQuestionsOpen} onOpenChange={setPastQuestionsOpen}>
              <CollapsibleTrigger className="flex items-center gap-2 mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ChevronDown className={`w-4 h-4 transition-transform ${pastQuestionsOpen ? 'rotate-180' : ''}`} />
                {pastQuestions.length} unanswered question{pastQuestions.length > 1 ? 's' : ''}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-3 space-y-2">
                  {pastQuestions.map((q, i) => (
                    <button
                      key={q.id}
                      onClick={() => navigate('/home')}
                      className="w-full text-left p-4 bg-secondary/50 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                    >
                      {q.question}
                    </button>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </motion.section>
      )}

      {/* Moments - Grouped by Meaning */}
      {entries.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="pb-16"
        >
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-6">Moments</h2>
          
          <div className="space-y-10">
            {GROUP_ORDER.map((groupName) => {
              const groupEntries = groupedEntries[groupName];
              if (!groupEntries || groupEntries.length === 0) return null;
              
              return (
                <div key={groupName}>
                  <h3 className="font-serif text-foreground mb-4 pb-2 border-b border-border">
                    {groupName}
                  </h3>
                  <div className="space-y-4">
                    {groupEntries.map((entry, i) => (
                      <MomentCard key={entry.id} entry={entry} index={i} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>
      )}

      {/* Empty State */}
      {entries.length === 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center py-16"
        >
          <p className="text-muted-foreground italic">
            Your moments will appear here as you answer questions.
          </p>
        </motion.section>
      )}
    </div>
  );
}

// Individual Moment Card Component
function MomentCard({ entry, index }: { entry: Response; index: number }) {
  const isVideo = entry.content_type === 'video';
  const isAudio = entry.content_type === 'audio';
  const isText = !entry.content_type || entry.content_type === 'text';

  const Icon = isVideo ? Video : isAudio ? Mic : PenLine;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group cursor-pointer"
    >
      <div className="flex items-start gap-4">
        {/* Type Icon */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          isVideo ? 'bg-matter-coral/10 text-matter-coral' :
          isAudio ? 'bg-accent/10 text-accent' :
          'bg-secondary text-muted-foreground'
        }`}>
          <Icon className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Question */}
          <p className="text-sm text-muted-foreground mb-2">
            {entry.questions?.question || 'Reflection'}
          </p>

          {/* Content Preview */}
          {isVideo && (
            <div className="relative aspect-video bg-secondary rounded-xl overflow-hidden max-w-sm group-hover:ring-2 ring-foreground/10 transition-all">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-foreground/90 flex items-center justify-center">
                  <Play className="w-5 h-5 text-background fill-background ml-0.5" />
                </div>
              </div>
              <span className="absolute bottom-2 right-2 text-xs text-foreground/70 bg-background/80 px-2 py-0.5 rounded-full">
                0:30
              </span>
            </div>
          )}

          {isAudio && (
            <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl max-w-sm group-hover:bg-secondary transition-all">
              <div className="flex items-end gap-0.5 h-6">
                {[0.3, 0.6, 0.4, 1, 0.7, 0.5, 0.8, 0.4, 0.6, 0.3].map((h, i) => (
                  <div 
                    key={i} 
                    className="w-1 bg-foreground/40 rounded-full transition-all group-hover:bg-foreground/60" 
                    style={{ height: `${h * 100}%` }} 
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">1:24</span>
            </div>
          )}

          {isText && (
            <p className="text-foreground leading-relaxed line-clamp-3 font-serif">
              {entry.content}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
