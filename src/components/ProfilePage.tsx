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

  // Stats
  const textCount = entries.filter(e => !e.content_type || e.content_type === 'text').length;
  const voiceCount = entries.filter(e => e.content_type === 'audio').length;
  const videoCount = entries.filter(e => e.content_type === 'video').length;
  const hasStats = entries.length > 0;

  return (
    <div className="min-h-[calc(100vh-8rem)] max-w-2xl mx-auto px-4">
      {/* Profile Header */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center pt-8 pb-6"
      >
        {/* Avatar */}
        <div className="relative inline-block mb-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-background shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-lg">
              <span className="text-2xl font-serif text-foreground">{initials}</span>
            </div>
          )}
        </div>
        
        {/* Name */}
        <h1 className="text-2xl font-serif text-foreground mb-1">{displayName}</h1>
        
        {/* Tagline - no quotes */}
        <p className="text-muted-foreground text-sm mb-4">{tagline}</p>

        {/* Stats Row - only when content exists */}
        {hasStats && (
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>{entries.length} reflections</span>
            {voiceCount > 0 && (
              <>
                <span className="text-border">·</span>
                <span>{voiceCount} voice</span>
              </>
            )}
            {videoCount > 0 && (
              <>
                <span className="text-border">·</span>
                <span>{videoCount} video</span>
              </>
            )}
          </div>
        )}
      </motion.section>

      {/* Empty State */}
      {entries.length === 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center py-16"
        >
          <p className="text-muted-foreground mb-6">
            Your reflections will appear here.
          </p>
          <Button 
            onClick={() => navigate('/home')}
            className="rounded-full bg-foreground text-background hover:bg-foreground/90 px-8"
          >
            Answer your first question
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.section>
      )}

      {/* RESPONSES - THE CENTERPIECE */}
      {entries.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6 pb-8"
        >
          {entries.map((entry, i) => (
            <ResponseCard key={entry.id} entry={entry} index={i} />
          ))}
        </motion.section>
      )}

      {/* This Week's Question - LOWER, SECONDARY */}
      {currentQuestion && entries.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="pb-16 pt-4 border-t border-border/50"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Continue your story</p>
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
        </motion.section>
      )}
    </div>
  );
}

// Response Card - Full content display
function ResponseCard({ entry, index }: { entry: Response; index: number }) {
  const isVideo = entry.content_type === 'video';
  const isAudio = entry.content_type === 'audio';
  const isText = !entry.content_type || entry.content_type === 'text';
  
  const formattedDate = entry.created_at 
    ? format(new Date(entry.created_at), 'MMM d, yyyy')
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group"
    >
      {/* Question - small, muted */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
          isVideo ? 'bg-matter-coral/10 text-matter-coral' :
          isAudio ? 'bg-accent/10 text-accent' :
          'bg-secondary text-muted-foreground'
        }`}>
          {isVideo && <Video className="w-2.5 h-2.5" />}
          {isAudio && <Mic className="w-2.5 h-2.5" />}
          {isText && <PenLine className="w-2.5 h-2.5" />}
        </span>
        <p className="text-xs text-muted-foreground flex-1 truncate">
          {entry.questions?.question || 'Reflection'}
        </p>
        <span className="text-xs text-muted-foreground/60">{formattedDate}</span>
      </div>

      {/* VIDEO - Thumbnail with play */}
      {isVideo && (
        <div className="relative aspect-video bg-secondary rounded-xl overflow-hidden cursor-pointer group/video">
          {entry.video_url ? (
            <video 
              src={entry.video_url} 
              className="w-full h-full object-cover"
              muted
              playsInline
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted" />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/0 group-hover/video:bg-foreground/5 transition-colors">
            <div className="w-14 h-14 rounded-full bg-foreground/90 flex items-center justify-center shadow-lg group-hover/video:scale-105 transition-transform">
              <Play className="w-6 h-6 text-background fill-background ml-0.5" />
            </div>
          </div>
          <span className="absolute bottom-3 right-3 text-xs text-foreground/80 bg-background/80 backdrop-blur px-2.5 py-0.5 rounded-full">
            0:30
          </span>
        </div>
      )}

      {/* AUDIO - Waveform + Play */}
      {isAudio && (
        <div className="bg-secondary/40 rounded-xl p-5 cursor-pointer group/audio hover:bg-secondary/60 transition-colors">
          <div className="flex items-center gap-4">
            <button className="w-11 h-11 rounded-full bg-foreground flex items-center justify-center flex-shrink-0 group-hover/audio:scale-105 transition-transform">
              <Play className="w-4 h-4 text-background fill-background ml-0.5" />
            </button>
            <div className="flex-1">
              <div className="flex items-end gap-[2px] h-8">
                {[0.3, 0.5, 0.7, 0.4, 1, 0.8, 0.6, 0.9, 0.5, 0.7, 0.4, 0.8, 0.6, 0.5, 0.3, 0.6, 0.8, 0.5, 0.4, 0.6, 0.7, 0.5, 0.4, 0.3, 0.5, 0.6, 0.4, 0.7, 0.5, 0.3].map((h, i) => (
                  <div 
                    key={i} 
                    className="flex-1 bg-foreground/25 rounded-full transition-all group-hover/audio:bg-foreground/40" 
                    style={{ height: `${h * 100}%` }} 
                  />
                ))}
              </div>
            </div>
            <span className="text-sm text-muted-foreground">1:24</span>
          </div>
        </div>
      )}

      {/* TEXT - Elegant, generous spacing */}
      {isText && (
        <div className="py-1">
          <p className="font-serif text-lg text-foreground leading-relaxed">
            {entry.content}
          </p>
        </div>
      )}
    </motion.div>
  );
}
