import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Mic,
  PenLine,
  Video,
  Play,
  Pause,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

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

export default function ProfilePage() {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const navigate = useNavigate();
  
  const [entries, setEntries] = useState<Response[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Fetch all responses
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
        
        // Fetch current question
        const answeredIds = responsesData?.map(r => r.question_id).filter(Boolean) || [];
        
        const { data: questionsData } = await supabase
          .from('questions')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (questionsData) {
          const unanswered = questionsData.filter(q => !answeredIds.includes(q.id));
          if (unanswered.length > 0) {
            setCurrentQuestion(unanswered[0]);
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
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  // Get featured moment (most recent response, prioritize video > audio > text)
  const featuredMoment = entries.length > 0 
    ? entries.find(e => e.content_type === 'video') 
      || entries.find(e => e.content_type === 'audio') 
      || entries[0]
    : null;

  // Get other entries (excluding featured)
  const otherEntries = entries.filter(e => e.id !== featuredMoment?.id);

  return (
    <div className="min-h-[calc(100vh-8rem)] max-w-2xl mx-auto px-4">
      {/* Profile Header */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center pt-8 pb-8"
      >
        {/* Avatar or Initials */}
        <div className="relative inline-block mb-5">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-28 h-28 rounded-full object-cover ring-4 ring-background shadow-lg"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-lg">
              <span className="text-3xl font-serif text-foreground">{initials}</span>
            </div>
          )}
        </div>
        
        {/* Name */}
        <h1 className="text-3xl font-serif text-foreground mb-3">{displayName}</h1>
        
        {/* Poetic Tagline */}
        <p className="text-muted-foreground italic max-w-xs mx-auto leading-relaxed">
          "{tagline}"
        </p>
      </motion.section>

      {/* Featured Moment - THE EMOTIONAL ANCHOR */}
      {featuredMoment && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <FeaturedMoment entry={featuredMoment} />
        </motion.section>
      )}

      {/* Empty State - Purposeful */}
      {entries.length === 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center py-12 px-6"
        >
          <div className="max-w-sm mx-auto">
            <p className="text-foreground font-serif text-xl leading-relaxed mb-2">
              This is where your voice, your words, and your presence will live.
            </p>
            <p className="text-muted-foreground text-sm mb-8">
              A space for the people who matter most to you.
            </p>
            <Button 
              onClick={() => navigate('/home')}
              className="rounded-full bg-foreground text-background hover:bg-foreground/90 px-8"
            >
              Answer your first question
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.section>
      )}

      {/* Responses List - Simple, Human */}
      {otherEntries.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="space-y-0 divide-y divide-border/50">
            {otherEntries.map((entry, i) => (
              <ResponseRow key={entry.id} entry={entry} />
            ))}
          </div>
        </motion.section>
      )}

      {/* This Week's Question - Lower, Secondary */}
      {currentQuestion && entries.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="pb-16"
        >
          <div className="border-t border-border pt-8">
            <p className="text-xs text-muted-foreground mb-4">This week's question</p>
            <p className="font-serif text-foreground leading-relaxed mb-4">
              {currentQuestion.question}
            </p>
            <button 
              onClick={() => navigate('/home')}
              className="text-sm text-foreground/70 hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              Answer now
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </motion.section>
      )}
    </div>
  );
}

// Featured Moment - Full showcase
function FeaturedMoment({ entry }: { entry: Response }) {
  const isVideo = entry.content_type === 'video';
  const isAudio = entry.content_type === 'audio';
  const isText = !entry.content_type || entry.content_type === 'text';

  return (
    <div>
      {/* Question */}
      <p className="text-sm text-muted-foreground mb-4">
        {entry.questions?.question || 'Reflection'}
      </p>

      {/* Video Player */}
      {isVideo && (
        <div className="relative aspect-video bg-secondary rounded-2xl overflow-hidden cursor-pointer group">
          {entry.video_url ? (
            <video 
              src={entry.video_url} 
              className="w-full h-full object-cover"
              muted
              loop
              playsInline
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted" />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/5 group-hover:bg-foreground/10 transition-colors">
            <div className="w-16 h-16 rounded-full bg-foreground/90 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Play className="w-7 h-7 text-background fill-background ml-1" />
            </div>
          </div>
          <span className="absolute bottom-3 right-3 text-xs text-foreground/80 bg-background/80 backdrop-blur px-3 py-1 rounded-full">
            0:30
          </span>
        </div>
      )}

      {/* Audio Waveform Player */}
      {isAudio && (
        <div className="bg-secondary/50 rounded-2xl p-6 cursor-pointer group hover:bg-secondary/70 transition-colors">
          <div className="flex items-center gap-4">
            <button className="w-12 h-12 rounded-full bg-foreground flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Play className="w-5 h-5 text-background fill-background ml-0.5" />
            </button>
            <div className="flex-1">
              <div className="flex items-end gap-[3px] h-10">
                {[0.3, 0.5, 0.7, 0.4, 1, 0.8, 0.6, 0.9, 0.5, 0.7, 0.4, 0.8, 0.6, 0.5, 0.3, 0.6, 0.8, 0.5, 0.4, 0.6, 0.7, 0.5, 0.4, 0.3].map((h, i) => (
                  <div 
                    key={i} 
                    className="flex-1 bg-foreground/30 rounded-full transition-all group-hover:bg-foreground/50" 
                    style={{ height: `${h * 100}%` }} 
                  />
                ))}
              </div>
            </div>
            <span className="text-sm text-muted-foreground">1:24</span>
          </div>
        </div>
      )}

      {/* Text - Beautifully Typeset */}
      {isText && (
        <div className="py-2">
          <p className="font-serif text-xl text-foreground leading-relaxed">
            {entry.content}
          </p>
        </div>
      )}
    </div>
  );
}

// Simple Response Row
function ResponseRow({ entry }: { entry: Response }) {
  const isVideo = entry.content_type === 'video';
  const isAudio = entry.content_type === 'audio';
  
  const Icon = isVideo ? Video : isAudio ? Mic : PenLine;
  
  const formattedDate = entry.created_at 
    ? format(new Date(entry.created_at), 'MMM d, yyyy')
    : '';

  return (
    <div className="py-4 flex items-center gap-4 cursor-pointer hover:bg-secondary/30 -mx-4 px-4 transition-colors">
      {/* Format Icon */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isVideo ? 'bg-matter-coral/10 text-matter-coral' :
        isAudio ? 'bg-accent/10 text-accent' :
        'bg-secondary text-muted-foreground'
      }`}>
        <Icon className="w-3.5 h-3.5" />
      </div>

      {/* Question */}
      <p className="flex-1 text-foreground text-sm truncate">
        {entry.questions?.question || 'Reflection'}
      </p>

      {/* Date */}
      <span className="text-xs text-muted-foreground flex-shrink-0">
        {formattedDate}
      </span>
    </div>
  );
}
