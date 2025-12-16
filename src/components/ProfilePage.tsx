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
  ArrowRight,
  Quote
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
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  // Stats
  const voiceCount = entries.filter(e => e.content_type === 'audio').length;
  const videoCount = entries.filter(e => e.content_type === 'video').length;
  const hasStats = entries.length > 0;

  return (
    <div className="min-h-[calc(100vh-8rem)] max-w-3xl mx-auto px-4 pb-16">
      {/* Profile Header */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center pt-12 pb-10"
      >
        {/* Avatar */}
        <div className="relative inline-block mb-6">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-28 h-28 rounded-full object-cover ring-4 ring-background shadow-xl"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-matter-sage to-matter-cream flex items-center justify-center shadow-xl ring-4 ring-background">
              <span className="text-3xl font-serif text-matter-navy">{initials}</span>
            </div>
          )}
        </div>
        
        {/* Name */}
        <h1 className="text-3xl font-serif text-foreground mb-2">{displayName}</h1>
        
        {/* Tagline */}
        <p className="text-muted-foreground mb-6">A life told one question at a time</p>

        {/* Stats Row */}
        {hasStats && (
          <div className="inline-flex items-center gap-6 text-sm bg-secondary/50 px-6 py-3 rounded-full">
            <div className="flex items-center gap-2">
              <PenLine className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-foreground">{entries.length}</span>
              <span className="text-muted-foreground">reflections</span>
            </div>
            {voiceCount > 0 && (
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-accent" />
                <span className="font-medium text-foreground">{voiceCount}</span>
                <span className="text-muted-foreground">voice</span>
              </div>
            )}
            {videoCount > 0 && (
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-matter-coral" />
                <span className="font-medium text-foreground">{videoCount}</span>
                <span className="text-muted-foreground">video</span>
              </div>
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
          className="text-center py-20 px-8"
        >
          <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-6 flex items-center justify-center">
            <Quote className="w-7 h-7 text-muted-foreground" />
          </div>
          <h2 className="font-serif text-xl text-foreground mb-3">Your reflections will appear here</h2>
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
            Each answer you share becomes part of your lasting legacy — spoken, written, and remembered.
          </p>
          <Button 
            onClick={() => navigate('/home')}
            size="lg"
            className="rounded-full bg-foreground text-background hover:bg-foreground/90 px-8 shadow-lg"
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
          className="space-y-6"
        >
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-4">Your Moments</h2>
          
          {entries.map((entry, i) => (
            <ResponseCard key={entry.id} entry={entry} index={i} />
          ))}
        </motion.section>
      )}

      {/* Continue Your Story - LOWER, SECONDARY */}
      {currentQuestion && entries.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12 pt-8 border-t border-border"
        >
          <div className="bg-gradient-to-br from-secondary/60 to-secondary/30 rounded-2xl p-8">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">Continue your story</p>
            <p className="font-serif text-xl text-foreground leading-relaxed mb-6">
              {currentQuestion.question}
            </p>
            <Button 
              variant="outline"
              onClick={() => navigate('/home')}
              className="rounded-full border-foreground/20 hover:bg-foreground hover:text-background transition-all"
            >
              Answer now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.section>
      )}
    </div>
  );
}

// Response Card - Full content display with proper visual weight
function ResponseCard({ entry, index }: { entry: Response; index: number }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  
  const isVideo = entry.content_type === 'video';
  const isAudio = entry.content_type === 'audio';
  const isText = !entry.content_type || entry.content_type === 'text';
  
  const formattedDate = entry.created_at 
    ? format(new Date(entry.created_at), 'MMM d, yyyy')
    : '';

  const togglePlay = () => {
    if (isVideo && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
    if (isAudio && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Card Header */}
      <div className="px-6 pt-5 pb-4 border-b border-border/30">
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm text-muted-foreground leading-relaxed flex-1">
            {entry.questions?.question || 'Reflection'}
          </p>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center ${
              isVideo ? 'bg-matter-coral/10 text-matter-coral' :
              isAudio ? 'bg-accent/10 text-accent' :
              'bg-secondary text-muted-foreground'
            }`}>
              {isVideo && <Video className="w-3 h-3" />}
              {isAudio && <Mic className="w-3 h-3" />}
              {isText && <PenLine className="w-3 h-3" />}
            </span>
            <span className="text-xs text-muted-foreground">{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6">
        {/* VIDEO */}
        {isVideo && (
          <div 
            className="relative aspect-video bg-secondary rounded-xl overflow-hidden cursor-pointer group"
            onClick={togglePlay}
          >
            {entry.video_url ? (
              <video 
                ref={videoRef}
                src={entry.video_url} 
                className="w-full h-full object-cover"
                playsInline
                onEnded={() => setIsPlaying(false)}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-matter-sage/20 to-matter-cream/30" />
            )}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-foreground/0 group-hover:bg-foreground/10 transition-colors">
                <div className="w-16 h-16 rounded-full bg-background/95 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                  <Play className="w-7 h-7 text-foreground fill-foreground ml-1" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* AUDIO */}
        {isAudio && (
          <div 
            className="bg-gradient-to-r from-secondary/60 to-secondary/30 rounded-xl p-6 cursor-pointer group hover:from-secondary/80 hover:to-secondary/50 transition-all"
            onClick={togglePlay}
          >
            <div className="flex items-center gap-5">
              <button className="w-14 h-14 rounded-full bg-foreground flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-lg">
                {isPlaying ? (
                  <div className="w-4 h-4 bg-background rounded-sm" />
                ) : (
                  <Play className="w-5 h-5 text-background fill-background ml-0.5" />
                )}
              </button>
              <div className="flex-1">
                {entry.audio_url ? (
                  <audio 
                    ref={audioRef}
                    src={entry.audio_url} 
                    onEnded={() => setIsPlaying(false)}
                    className="hidden"
                  />
                ) : null}
                <div className="flex items-end gap-[3px] h-10">
                  {[0.3, 0.5, 0.7, 0.4, 1, 0.8, 0.6, 0.9, 0.5, 0.7, 0.4, 0.8, 0.6, 0.5, 0.3, 0.6, 0.8, 0.5, 0.4, 0.6, 0.7, 0.5, 0.4, 0.3, 0.5, 0.6, 0.4].map((h, i) => (
                    <div 
                      key={i} 
                      className={`flex-1 rounded-full transition-all ${
                        isPlaying 
                          ? 'bg-foreground/60 animate-pulse' 
                          : 'bg-foreground/20 group-hover:bg-foreground/35'
                      }`}
                      style={{ height: `${h * 100}%` }} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TEXT - Elegant typography */}
        {isText && (
          <div className="relative">
            <Quote className="absolute -top-1 -left-1 w-8 h-8 text-secondary" />
            <p className="font-serif text-xl text-foreground leading-relaxed pl-6">
              {entry.content}
            </p>
          </div>
        )}
      </div>
    </motion.article>
  );
}
