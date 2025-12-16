import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Play, Pause, ArrowRight, ChevronRight } from "lucide-react";
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
  photo_url?: string | null;
  questions?: {
    question: string;
    category: string;
    depth: string | null;
  } | null;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  
  const [entries, setEntries] = useState<Response[]>([]);
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
            photo_url,
            questions (
              question,
              category,
              depth
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        setEntries(responsesData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  // Group by type
  const videos = entries.filter(e => e.content_type === 'video');
  const voices = entries.filter(e => e.content_type === 'audio');
  const photos = entries.filter(e => e.content_type === 'photo');
  const texts = entries.filter(e => !e.content_type || e.content_type === 'text');

  // Featured moment (prioritize video > voice > photo > text)
  const featuredMoment = videos[0] || voices[0] || photos[0] || texts[0];

  // Get user initials
  const getInitials = () => {
    if (profile?.display_name) {
      return profile.display_name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'M';
  };

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Your Legacy';
  const firstName = displayName.split(' ')[0];

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/20 border-t-foreground/60 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-background">
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* HERO - Full bleed featured moment (Spotify-style) */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {featuredMoment ? (
        <HeroSection entry={featuredMoment} displayName={displayName} />
      ) : (
        <EmptyHero displayName={displayName} getInitials={getInitials} navigate={navigate} />
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ABOUT SECTION - Profile info card */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {entries.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="px-4 md:px-6 -mt-8 relative z-10"
        >
          <div className="max-w-2xl mx-auto">
            <div className="bg-card rounded-2xl p-5 md:p-6">
              <p className="text-muted-foreground/60 text-xs font-medium mb-3">About {firstName}</p>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[hsl(var(--matter-sage)/0.4)] to-[hsl(var(--matter-forest)/0.3)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-serif text-2xl text-foreground/60">
                      {getInitials()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-serif text-xl text-foreground mb-1">{displayName}</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {entries.length} moment{entries.length !== 1 ? 's' : ''} preserved
                    {videos.length > 0 && ` · ${videos.length} video${videos.length !== 1 ? 's' : ''}`}
                    {voices.length > 0 && ` · ${voices.length} voice`}
                  </p>
                  <p className="text-muted-foreground/60 text-sm mt-2 italic">
                    A life told one question at a time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* FEATURED QUOTE - Colored section like Spotify's Lyrics */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {texts.length > 0 && texts[0].content && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="px-4 md:px-6 mt-4"
        >
          <div className="max-w-2xl mx-auto">
            <div className="bg-[hsl(var(--matter-sage)/0.15)] rounded-2xl p-6 md:p-8">
              <p className="text-muted-foreground/70 text-xs font-medium mb-4">Words from {firstName}</p>
              <p className="font-serif text-xl md:text-2xl text-foreground leading-relaxed">
                "{texts[0].content.length > 200 ? texts[0].content.slice(0, 200) + '...' : texts[0].content}"
              </p>
              <p className="text-muted-foreground/50 text-sm mt-4">
                {texts[0].questions?.question}
              </p>
            </div>
          </div>
        </motion.section>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* VIDEOS - Horizontal carousel */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {videos.length > 0 && (
        <MediaCarousel 
          title="Videos" 
          items={videos} 
          type="video"
          delay={0.4}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* VOICE RECORDINGS - Horizontal carousel */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {voices.length > 0 && (
        <MediaCarousel 
          title="Voice recordings" 
          items={voices} 
          type="audio"
          delay={0.5}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* PHOTOS - Horizontal carousel */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {photos.length > 0 && (
        <MediaCarousel 
          title="Photos" 
          items={photos} 
          type="photo"
          delay={0.6}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* WRITTEN REFLECTIONS - List style */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {texts.length > 1 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="px-4 md:px-6 mt-8"
        >
          <div className="max-w-2xl mx-auto">
            <div className="bg-card rounded-2xl p-5 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-foreground font-medium">Written reflections</p>
                <button className="text-muted-foreground text-sm flex items-center gap-1 hover:text-foreground transition-colors">
                  See all <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                {texts.slice(1, 4).map((entry) => (
                  <div key={entry.id} className="border-b border-border/50 last:border-0 pb-4 last:pb-0">
                    <p className="text-foreground text-sm leading-relaxed line-clamp-2">
                      {entry.content}
                    </p>
                    <p className="text-muted-foreground/50 text-xs mt-2">
                      {entry.questions?.question}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* CLOSING */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {entries.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-muted-foreground/40 mt-16 mb-8 px-6 text-sm"
        >
          This is a growing record of a life — shaped week by week.
        </motion.p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// HERO SECTION - Full-bleed featured moment
// ═══════════════════════════════════════════════════════════════
function HeroSection({ entry, displayName }: { entry: Response; displayName: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const isVideo = entry.content_type === 'video';
  const isAudio = entry.content_type === 'audio';
  const isPhoto = entry.content_type === 'photo';

  const togglePlay = () => {
    if (isVideo && videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
    if (isAudio && audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative"
    >
      {/* Media hero - full width on mobile, contained on desktop */}
      <div className="relative aspect-[3/4] md:aspect-[16/9] max-h-[70vh] bg-secondary/20 overflow-hidden">
        {isVideo && entry.video_url && (
          <>
            <video 
              ref={videoRef}
              src={entry.video_url} 
              className="w-full h-full object-cover"
              playsInline
              onEnded={() => setIsPlaying(false)}
            />
            <div 
              className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"
              onClick={togglePlay}
            />
            <button 
              onClick={togglePlay}
              className="absolute bottom-6 left-6 w-14 h-14 rounded-full bg-background flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-foreground" />
              ) : (
                <Play className="w-6 h-6 text-foreground fill-foreground ml-1" />
              )}
            </button>
          </>
        )}

        {isAudio && entry.audio_url && (
          <>
            <audio 
              ref={audioRef}
              src={entry.audio_url}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--matter-sage)/0.3)] to-[hsl(var(--matter-forest)/0.4)]" />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
              {/* Waveform visualization */}
              <div className="flex items-end gap-1 h-32 mb-8">
                {[0.3, 0.5, 0.7, 0.4, 1, 0.8, 0.6, 0.9, 0.5, 0.7, 0.4, 0.8, 0.6, 0.5, 0.3, 0.6, 0.8, 0.5, 0.4, 0.6].map((h, i) => (
                  <motion.div 
                    key={i}
                    initial={{ scaleY: 0.3 }}
                    animate={{ scaleY: isPlaying ? [h, h * 0.6, h] : h }}
                    transition={{ 
                      duration: 0.5, 
                      repeat: isPlaying ? Infinity : 0,
                      delay: i * 0.05 
                    }}
                    className="w-2 md:w-3 rounded-full bg-foreground/30 origin-bottom"
                    style={{ height: `${h * 100}%` }}
                  />
                ))}
              </div>
              <button 
                onClick={togglePlay}
                className="w-16 h-16 rounded-full bg-background flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7 text-foreground" />
                ) : (
                  <Play className="w-7 h-7 text-foreground fill-foreground ml-1" />
                )}
              </button>
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background to-transparent h-32" />
          </>
        )}

        {isPhoto && entry.photo_url && (
          <>
            <img 
              src={entry.photo_url} 
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background to-transparent h-48" />
          </>
        )}

        {!isVideo && !isAudio && !isPhoto && (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--matter-sage)/0.2)] to-[hsl(var(--matter-forest)/0.3)]" />
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <p className="font-serif text-2xl md:text-4xl text-foreground/80 text-center leading-relaxed max-w-xl">
                "{entry.content.length > 150 ? entry.content.slice(0, 150) + '...' : entry.content}"
              </p>
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background to-transparent h-32" />
          </>
        )}
      </div>

      {/* Question info - overlaid at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <p className="text-foreground font-serif text-lg md:text-xl leading-snug max-w-lg">
          {entry.questions?.question || 'A reflection'}
        </p>
        <p className="text-muted-foreground/60 text-sm mt-2">
          {displayName} · {entry.created_at ? format(new Date(entry.created_at), 'MMMM yyyy') : ''}
        </p>
      </div>
    </motion.section>
  );
}

// ═══════════════════════════════════════════════════════════════
// EMPTY HERO - When no entries exist
// ═══════════════════════════════════════════════════════════════
function EmptyHero({ 
  displayName, 
  getInitials, 
  navigate 
}: { 
  displayName: string; 
  getInitials: () => string; 
  navigate: (path: string) => void;
}) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-16 pb-24 px-6"
    >
      <div className="max-w-md mx-auto text-center">
        <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-[hsl(var(--matter-sage)/0.4)] to-[hsl(var(--matter-forest)/0.3)] flex items-center justify-center mb-8">
          <span className="font-serif text-4xl text-foreground/60">
            {getInitials()}
          </span>
        </div>
        <h1 className="font-serif text-3xl text-foreground mb-3">{displayName}</h1>
        <p className="text-muted-foreground mb-10 leading-relaxed">
          Your story begins here. Answer your first question to start preserving your legacy.
        </p>
        <Button 
          onClick={() => navigate('/home')}
          size="lg"
          className="rounded-full bg-foreground text-background hover:bg-foreground/90 px-8 h-12"
        >
          Begin
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.section>
  );
}

// ═══════════════════════════════════════════════════════════════
// MEDIA CAROUSEL - Horizontal scroll section
// ═══════════════════════════════════════════════════════════════
function MediaCarousel({ 
  title, 
  items, 
  type,
  delay 
}: { 
  title: string; 
  items: Response[]; 
  type: 'video' | 'audio' | 'photo';
  delay: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="mt-8"
    >
      <div className="px-4 md:px-6 mb-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <p className="text-foreground font-medium">{title}</p>
          {items.length > 3 && (
            <button className="text-muted-foreground text-sm flex items-center gap-1 hover:text-foreground transition-colors">
              See all <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      {/* Horizontal scroll container */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 px-4 md:px-6 pb-2">
          <div className="max-w-2xl mx-auto flex gap-3 w-full md:w-auto">
            {items.slice(0, 6).map((item) => (
              <MediaCard key={item.id} entry={item} type={type} />
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

// ═══════════════════════════════════════════════════════════════
// MEDIA CARD - Individual item in carousel
// ═══════════════════════════════════════════════════════════════
function MediaCard({ entry, type }: { entry: Response; type: 'video' | 'audio' | 'photo' }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (type === 'video' && videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
    if (type === 'audio' && audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex-shrink-0 w-36 md:w-44">
      {type === 'video' && entry.video_url && (
        <div 
          className="relative aspect-[3/4] bg-secondary/30 rounded-xl overflow-hidden cursor-pointer group"
          onClick={togglePlay}
        >
          <video 
            ref={videoRef}
            src={entry.video_url}
            className="w-full h-full object-cover"
            playsInline
            muted
            onEnded={() => setIsPlaying(false)}
          />
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="w-10 h-10 rounded-full bg-background/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-4 h-4 text-foreground fill-foreground ml-0.5" />
              </div>
            </div>
          )}
        </div>
      )}

      {type === 'audio' && entry.audio_url && (
        <div 
          className="relative aspect-square bg-gradient-to-br from-[hsl(var(--matter-sage)/0.3)] to-[hsl(var(--matter-forest)/0.4)] rounded-xl overflow-hidden cursor-pointer group"
          onClick={togglePlay}
        >
          <audio 
            ref={audioRef}
            src={entry.audio_url}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <div className="flex items-end gap-[2px] h-12 mb-3">
              {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.5].map((h, i) => (
                <motion.div 
                  key={i}
                  animate={{ scaleY: isPlaying ? [h, h * 0.5, h] : h }}
                  transition={{ duration: 0.4, repeat: isPlaying ? Infinity : 0, delay: i * 0.05 }}
                  className="w-1.5 rounded-full bg-foreground/30 origin-bottom"
                  style={{ height: `${h * 100}%` }}
                />
              ))}
            </div>
            <div className="w-10 h-10 rounded-full bg-background/90 flex items-center justify-center group-hover:scale-110 transition-transform">
              {isPlaying ? (
                <Pause className="w-4 h-4 text-foreground" />
              ) : (
                <Play className="w-4 h-4 text-foreground fill-foreground ml-0.5" />
              )}
            </div>
          </div>
        </div>
      )}

      {type === 'photo' && entry.photo_url && (
        <div className="relative aspect-square bg-secondary/30 rounded-xl overflow-hidden">
          <img 
            src={entry.photo_url}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Question label */}
      <p className="text-muted-foreground/70 text-xs mt-2 line-clamp-2 leading-snug">
        {entry.questions?.question || 'A reflection'}
      </p>
    </div>
  );
}
