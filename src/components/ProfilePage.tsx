import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Play, ArrowRight } from "lucide-react";
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
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

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

  // Calculate media counts
  const videoCount = entries.filter(e => e.content_type === 'video').length;
  const voiceCount = entries.filter(e => e.content_type === 'audio').length;
  const textCount = entries.filter(e => !e.content_type || e.content_type === 'text').length;
  const photoCount = entries.filter(e => e.content_type === 'photo').length;

  // Find featured moment (prioritize video > voice > photo > text)
  const featuredMoment = entries.find(e => e.content_type === 'video') 
    || entries.find(e => e.content_type === 'audio')
    || entries.find(e => e.content_type === 'photo')
    || entries[0];

  // Filter entries by media type
  const filteredEntries = entries.filter(entry => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'video') return entry.content_type === 'video';
    if (selectedFilter === 'voice') return entry.content_type === 'audio';
    if (selectedFilter === 'text') return !entry.content_type || entry.content_type === 'text';
    return true;
  });

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

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/20 border-t-foreground/60 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] pb-20">
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* PRESENCE - Profile Header */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className="pt-16 pb-20 md:pt-20 md:pb-24"
      >
        <div className="max-w-2xl mx-auto px-6 text-center">
          {/* Avatar - soft, warm */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            className="mb-8"
          >
            <div className="w-32 h-32 md:w-36 md:h-36 mx-auto rounded-full bg-gradient-to-br from-[hsl(var(--matter-sage)/0.4)] to-[hsl(var(--matter-forest)/0.3)] flex items-center justify-center">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={displayName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="font-serif text-5xl md:text-6xl text-foreground/60">
                  {getInitials()}
                </span>
              )}
            </div>
          </motion.div>

          {/* Name */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="font-serif text-4xl md:text-5xl text-foreground mb-4 tracking-tight"
          >
            {displayName}
          </motion.h1>

          {/* Identity - soft, poetic */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="text-muted-foreground text-lg md:text-xl leading-relaxed mb-6"
          >
            A life told one question at a time.
          </motion.p>

          {/* Counts - subtle, secondary */}
          {entries.length > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="text-muted-foreground/60 text-sm tracking-wide"
            >
              {entries.length} moment{entries.length !== 1 ? 's' : ''}
              {videoCount > 0 && <span className="mx-1.5">·</span>}
              {videoCount > 0 && <>{videoCount} video{videoCount !== 1 ? 's' : ''}</>}
              {voiceCount > 0 && <span className="mx-1.5">·</span>}
              {voiceCount > 0 && <>{voiceCount} voice</>}
              {textCount > 0 && <span className="mx-1.5">·</span>}
              {textCount > 0 && <>{textCount} written</>}
              {photoCount > 0 && <span className="mx-1.5">·</span>}
              {photoCount > 0 && <>{photoCount} photo{photoCount !== 1 ? 's' : ''}</>}
            </motion.p>
          )}
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* FEATURED MOMENT - intimate, unhurried */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {featuredMoment && (
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="max-w-3xl mx-auto px-6 mb-20"
        >
          <FeaturedCard entry={featuredMoment} displayName={displayName} />
        </motion.section>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MOMENTS - calm, breathing */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-4xl mx-auto px-6">
        {/* Minimal filters - just text, no icons */}
        {entries.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center gap-6 mb-12"
          >
            {['all', 'video', 'voice', 'text'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`text-sm transition-all ${
                  selectedFilter === filter
                    ? 'text-foreground'
                    : 'text-muted-foreground/50 hover:text-muted-foreground'
                }`}
              >
                {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </motion.div>
        )}

        {/* Empty State - inviting, not lonely */}
        {entries.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <h3 className="font-serif text-2xl md:text-3xl text-foreground mb-4">
              Your story begins here
            </h3>
            <p className="text-muted-foreground mb-10 max-w-md mx-auto leading-relaxed">
              Answer your first question to start preserving your legacy — 
              for the people who matter most.
            </p>
            <Button 
              onClick={() => navigate('/home')}
              size="lg"
              className="rounded-full bg-foreground text-background hover:bg-foreground/90 px-8 h-12"
            >
              Begin
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        )}

        {/* Moments Grid - generous spacing */}
        {filteredEntries.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="columns-1 md:columns-2 gap-8"
          >
            {filteredEntries.map((entry, index) => (
              <MomentCard 
                key={entry.id} 
                entry={entry} 
                index={index}
              />
            ))}
          </motion.div>
        )}

        {/* Closing - anchoring meaning */}
        {entries.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-muted-foreground/50 mt-24 mb-8 text-sm"
          >
            This is a growing record of a life — shaped week by week.
          </motion.p>
        )}
      </section>
    </div>
  );
}

// Featured Card - large, intimate, presence-first
function FeaturedCard({ entry, displayName }: { entry: Response; displayName: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  
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
    <div className="text-center">
      {/* Label - soft, human */}
      <p className="text-muted-foreground/60 text-sm mb-6">
        A moment that captures {displayName.split(' ')[0]}
      </p>

      <div className="bg-card rounded-3xl overflow-hidden">
        {/* Question - the anchor */}
        <div className="px-8 pt-8 pb-6">
          <p className="text-muted-foreground/50 text-xs mb-2">In response to</p>
          <h3 className="font-serif text-xl md:text-2xl text-foreground leading-relaxed">
            {entry.questions?.question || 'A reflection'}
          </h3>
        </div>

        {/* Media */}
        <div className="px-6 pb-8">
          {isVideo && entry.video_url && (
            <div 
              className="relative aspect-video bg-secondary/30 rounded-2xl overflow-hidden cursor-pointer group"
              onClick={togglePlay}
            >
              <video 
                ref={videoRef}
                src={entry.video_url} 
                className="w-full h-full object-cover"
                playsInline
                onEnded={() => setIsPlaying(false)}
              />
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-background/90 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    <Play className="w-6 h-6 text-foreground fill-foreground ml-1" />
                  </div>
                </div>
              )}
            </div>
          )}

          {isAudio && entry.audio_url && (
            <div 
              className="bg-secondary/20 rounded-2xl p-6 cursor-pointer group"
              onClick={togglePlay}
            >
              <audio 
                ref={audioRef}
                src={entry.audio_url} 
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
              <div className="flex items-center gap-5">
                <button className="w-14 h-14 rounded-full bg-foreground flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  {isPlaying ? (
                    <div className="w-4 h-4 bg-background rounded-sm" />
                  ) : (
                    <Play className="w-5 h-5 text-background fill-background ml-0.5" />
                  )}
                </button>
                <div className="flex-1 flex items-end gap-[3px] h-12">
                  {[0.3, 0.5, 0.7, 0.4, 1, 0.8, 0.6, 0.9, 0.5, 0.7, 0.4, 0.8, 0.6, 0.5, 0.3, 0.6, 0.8, 0.5, 0.4, 0.6, 0.7, 0.5, 0.8, 0.4].map((h, i) => (
                    <div 
                      key={i} 
                      className={`flex-1 rounded-full transition-all ${
                        isPlaying ? 'bg-foreground/50' : 'bg-foreground/20'
                      }`}
                      style={{ height: `${h * 100}%` }} 
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {isPhoto && entry.photo_url && (
            <div className="relative aspect-[4/3] bg-secondary/30 rounded-2xl overflow-hidden">
              <img 
                src={entry.photo_url} 
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {!isVideo && !isAudio && !isPhoto && (
            <p className="text-foreground/80 text-lg md:text-xl leading-relaxed italic px-2">
              "{entry.content}"
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Moment Card - calm, weighted by type
function MomentCard({ entry, index }: { entry: Response; index: number }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  
  const isVideo = entry.content_type === 'video';
  const isAudio = entry.content_type === 'audio';
  const isPhoto = entry.content_type === 'photo';
  const isText = !entry.content_type || entry.content_type === 'text';
  
  const formattedDate = entry.created_at 
    ? format(new Date(entry.created_at), 'MMMM yyyy')
    : '';

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

  // Card sizing: video = most generous, then audio/photo, then text
  const paddingClass = isVideo ? 'p-7' : isAudio || isPhoto ? 'p-6' : 'p-5';

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className={`bg-card rounded-2xl overflow-hidden break-inside-avoid mb-8 ${paddingClass}`}
    >
      {/* Question context */}
      <p className="text-muted-foreground/40 text-xs mb-1.5">In response to</p>
      <h3 className={`font-serif text-foreground leading-snug mb-5 ${
        isVideo ? 'text-xl' : isAudio || isPhoto ? 'text-lg' : 'text-base'
      }`}>
        {entry.questions?.question || 'A reflection'}
      </h3>

      {/* Content */}
      {isText && (
        <p className="text-muted-foreground leading-relaxed text-[15px]">
          {entry.content}
        </p>
      )}

      {isVideo && entry.video_url && (
        <div 
          className="relative aspect-video bg-secondary/30 rounded-xl overflow-hidden cursor-pointer group"
          onClick={togglePlay}
        >
          <video 
            ref={videoRef}
            src={entry.video_url} 
            className="w-full h-full object-cover"
            playsInline
            onEnded={() => setIsPlaying(false)}
          />
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-background/90 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Play className="w-5 h-5 text-foreground fill-foreground ml-0.5" />
              </div>
            </div>
          )}
        </div>
      )}

      {isPhoto && entry.photo_url && (
        <div className="relative aspect-[4/3] bg-secondary/30 rounded-xl overflow-hidden">
          <img 
            src={entry.photo_url} 
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {isAudio && entry.audio_url && (
        <div 
          className="bg-secondary/20 rounded-xl p-4 cursor-pointer group"
          onClick={togglePlay}
        >
          <audio 
            ref={audioRef}
            src={entry.audio_url} 
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              {isPlaying ? (
                <div className="w-3 h-3 bg-background rounded-sm" />
              ) : (
                <Play className="w-4 h-4 text-background fill-background ml-0.5" />
              )}
            </button>
            <div className="flex-1 flex items-end gap-[2px] h-8">
              {[0.3, 0.5, 0.7, 0.4, 1, 0.8, 0.6, 0.9, 0.5, 0.7, 0.4, 0.8, 0.6, 0.5, 0.3, 0.6, 0.8, 0.5].map((h, i) => (
                <div 
                  key={i} 
                  className={`flex-1 rounded-full transition-all ${
                    isPlaying ? 'bg-foreground/50' : 'bg-foreground/20'
                  }`}
                  style={{ height: `${h * 100}%` }} 
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Date - quiet, secondary */}
      <p className="text-muted-foreground/40 text-xs mt-4">{formattedDate}</p>
    </motion.article>
  );
}
