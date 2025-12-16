import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { 
  Heart,
  Search,
  Type,
  Mic,
  Video,
  Play,
  Pause,
  ArrowRight,
  Image as ImageIcon,
  ChevronDown,
  Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [featuredId, setFeaturedId] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);

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
        
        // Set initial featured moment (prioritize video > voice > photo > text)
        if (responsesData && responsesData.length > 0) {
          const defaultFeatured = responsesData.find(e => e.content_type === 'video') 
            || responsesData.find(e => e.content_type === 'audio')
            || responsesData.find(e => e.content_type === 'photo')
            || responsesData[0];
          setFeaturedId(defaultFeatured?.id || null);
        }
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

  // Get featured moment
  const featuredMoment = entries.find(e => e.id === featuredId);

  // Split entries: recent (3-5) and archive (rest), excluding featured
  const otherEntries = entries.filter(e => e.id !== featuredId);
  const recentEntries = otherEntries.slice(0, 4);
  const archiveEntries = otherEntries.slice(4);

  // Filter entries by media type
  const filterEntries = (list: Response[]) => list.filter(entry => {
    const matchesSearch = searchQuery === '' || 
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.questions?.question.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    if (selectedFilter === 'video') matchesFilter = entry.content_type === 'video';
    else if (selectedFilter === 'voice') matchesFilter = entry.content_type === 'audio';
    else if (selectedFilter === 'text') matchesFilter = !entry.content_type || entry.content_type === 'text';
    
    return matchesSearch && matchesFilter;
  });

  const filteredRecent = filterEntries(recentEntries);
  const filteredArchive = filterEntries(archiveEntries);

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
        <div className="w-8 h-8 rounded-full border-2 border-muted-foreground/20 border-t-foreground animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* HERO SECTION - Cover Page Feel */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="py-16 md:py-24 bg-gradient-to-b from-secondary/30 to-transparent"
      >
        <div className="max-w-3xl mx-auto px-4 text-center">
          {/* Large Avatar */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            className="relative mx-auto mb-8"
          >
            <div className="w-36 h-36 md:w-44 md:h-44 mx-auto rounded-full bg-gradient-to-br from-[hsl(var(--matter-sage))] to-[hsl(var(--matter-forest))] flex items-center justify-center shadow-[0_12px_40px_-8px_rgba(0,0,0,0.2)] ring-4 ring-background">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={displayName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="font-serif text-5xl md:text-6xl text-white/90">
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
            className="font-serif text-4xl md:text-5xl text-foreground mb-4"
          >
            {displayName}
          </motion.h1>

          {/* Short Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-xl text-muted-foreground italic mb-3"
          >
            A life told one question at a time.
          </motion.p>

          {/* Purpose Line */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="text-muted-foreground/70 mb-8"
          >
            A growing record of a life, shaped one question at a time.
          </motion.p>

          {/* Content Summary */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="inline-flex flex-wrap justify-center gap-x-3 gap-y-1 text-sm text-muted-foreground/80"
          >
            {entries.length > 0 ? (
              <>
                <span className="font-medium text-foreground">{entries.length} moments recorded</span>
                {videoCount > 0 && <><span>·</span><span>{videoCount} video{videoCount !== 1 ? 's' : ''}</span></>}
                {voiceCount > 0 && <><span>·</span><span>{voiceCount} voice</span></>}
                {textCount > 0 && <><span>·</span><span>{textCount} written reflection{textCount !== 1 ? 's' : ''}</span></>}
                {photoCount > 0 && <><span>·</span><span>{photoCount} photo{photoCount !== 1 ? 's' : ''}</span></>}
              </>
            ) : (
              <span>Your legacy begins here</span>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* FEATURED MOMENT - Hero-sized emotional entry point */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {featuredMoment && (
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="max-w-4xl mx-auto px-4 mb-16"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-muted-foreground/60 uppercase tracking-widest mb-1">Featured moment</p>
              <h2 className="font-serif text-2xl text-foreground">
                A moment that captures {firstName}
              </h2>
            </div>
            <button 
              onClick={() => {
                // Cycle to next entry as featured
                const currentIndex = entries.findIndex(e => e.id === featuredId);
                const nextIndex = (currentIndex + 1) % entries.length;
                setFeaturedId(entries[nextIndex]?.id || null);
              }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Star className="w-3.5 h-3.5" />
              Change
            </button>
          </div>
          <FeaturedCard entry={featuredMoment} />
        </motion.section>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* RECENT MOMENTS - Last 3-5 answers */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {filteredRecent.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 mb-12">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <h2 className="font-serif text-xl text-foreground mb-1">Recent moments</h2>
            <p className="text-sm text-muted-foreground/70">The latest reflections from {firstName}'s journey</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredRecent.map((entry, index) => (
              <MomentCard 
                key={entry.id} 
                entry={entry} 
                index={index}
                onSetFeatured={() => setFeaturedId(entry.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Subtle divider */}
      {archiveEntries.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 my-8">
          <div className="h-px bg-border/40" />
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* FULL LEGACY ARCHIVE */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {(archiveEntries.length > 0 || entries.length === 0) && (
        <section className="max-w-5xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <Heart className="w-5 h-5 text-foreground/70" strokeWidth={1.5} />
                <h2 className="font-serif text-xl text-foreground">The Legacy</h2>
              </div>
              
              {/* Search toggle - optional, not dominant */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="text-muted-foreground/60 hover:text-foreground transition-colors p-2"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground/70 italic">
              These are the moments {firstName} chose to leave behind.
            </p>
          </motion.div>

          {/* Search - optional */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                  <Input
                    placeholder="Search moments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 h-11 bg-secondary/20 border-border/30 rounded-xl text-sm placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-foreground/10"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filters - secondary, simple */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex gap-2 mb-8"
          >
            {['all', 'video', 'voice', 'text'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedFilter === filter
                    ? 'bg-foreground/10 text-foreground'
                    : 'text-muted-foreground/70 hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                {filter === 'video' && <Video className="w-3 h-3" />}
                {filter === 'voice' && <Mic className="w-3 h-3" />}
                {filter === 'text' && <Type className="w-3 h-3" />}
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </motion.div>

          {/* Empty State */}
          {entries.length === 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 rounded-full bg-secondary/40 mx-auto mb-6 flex items-center justify-center">
                <Heart className="w-8 h-8 text-muted-foreground/40" strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-2xl text-foreground mb-3">
                Your legacy begins here
              </h3>
              <p className="text-muted-foreground/70 mb-8 max-w-sm mx-auto leading-relaxed">
                Answer your first question to start preserving your story
              </p>
              <Button 
                onClick={() => navigate('/home')}
                size="lg"
                className="rounded-full bg-foreground text-background hover:bg-foreground/90 px-8 h-12 text-base"
              >
                Answer your first question
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* No results from filter/search */}
          {entries.length > 0 && filteredArchive.length === 0 && filteredRecent.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-muted-foreground/60">No matching moments found</p>
            </motion.div>
          )}

          {/* Archive Grid */}
          {filteredArchive.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="columns-1 md:columns-2 lg:columns-3 gap-5 space-y-5"
            >
              {filteredArchive.map((entry, index) => (
                <MomentCard 
                  key={entry.id} 
                  entry={entry} 
                  index={index}
                  onSetFeatured={() => setFeaturedId(entry.id)}
                  compact
                />
              ))}
            </motion.div>
          )}

          {/* Closing line */}
          {entries.length > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center text-muted-foreground/60 italic mt-20 pb-8 text-sm"
            >
              This is a growing record of a life — shaped week by week.
            </motion.p>
          )}
        </section>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FEATURED CARD - Large, media-first, hero-sized
// ═══════════════════════════════════════════════════════════════════════════
function FeaturedCard({ entry }: { entry: Response }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<string>('');
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  
  const isVideo = entry.content_type === 'video';
  const isAudio = entry.content_type === 'audio';
  const isPhoto = entry.content_type === 'photo';

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
    <div className="bg-card rounded-3xl border border-border/20 overflow-hidden shadow-sm">
      <div className="p-8">
        {/* Question first */}
        <h3 className="font-serif text-2xl md:text-3xl text-foreground leading-snug mb-6">
          {entry.questions?.question || 'A moment of reflection'}
        </h3>

        {/* Video - intimate, not performative */}
        {isVideo && entry.video_url && (
          <div 
            className="relative aspect-video bg-secondary/50 rounded-2xl overflow-hidden cursor-pointer group mb-4"
            onClick={togglePlay}
          >
            <video 
              ref={videoRef}
              src={entry.video_url} 
              className="w-full h-full object-cover"
              playsInline
              onLoadedMetadata={(e) => setDuration(formatDuration(e.currentTarget.duration))}
              onEnded={() => setIsPlaying(false)}
            />
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-foreground/5">
                <div className="w-20 h-20 rounded-full bg-background/95 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <Play className="w-8 h-8 text-foreground fill-foreground ml-1" />
                </div>
              </div>
            )}
            {duration && (
              <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-foreground/80 text-background text-xs rounded-full font-medium">
                {duration}
              </div>
            )}
          </div>
        )}

        {/* Voice - question above, larger controls */}
        {isAudio && entry.audio_url && (
          <div className="bg-secondary/30 rounded-2xl p-6">
            <audio 
              ref={audioRef}
              src={entry.audio_url} 
              onLoadedMetadata={(e) => setDuration(formatDuration(e.currentTarget.duration))}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
            <div className="flex items-center gap-5">
              <button 
                onClick={togglePlay}
                className="w-16 h-16 rounded-full bg-foreground flex items-center justify-center flex-shrink-0 hover:scale-105 transition-transform shadow-md"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-background" />
                ) : (
                  <Play className="w-6 h-6 text-background fill-background ml-1" />
                )}
              </button>
              <div className="flex-1">
                <div className="flex items-end gap-[3px] h-12 mb-2">
                  {[0.3, 0.5, 0.7, 0.4, 1, 0.8, 0.6, 0.9, 0.5, 0.7, 0.4, 0.8, 0.6, 0.5, 0.3, 0.6, 0.8, 0.5, 0.4, 0.6, 0.7, 0.5, 0.8, 0.4, 0.6, 0.9, 0.5].map((h, i) => (
                    <div 
                      key={i} 
                      className={`flex-1 rounded-full transition-all ${
                        isPlaying ? 'bg-foreground/70 animate-pulse' : 'bg-foreground/30'
                      }`}
                      style={{ height: `${h * 100}%` }} 
                    />
                  ))}
                </div>
                {duration && (
                  <p className="text-sm text-muted-foreground/70">{duration}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Photo */}
        {isPhoto && entry.photo_url && (
          <div className="relative aspect-[4/3] bg-secondary/50 rounded-2xl overflow-hidden">
            <img 
              src={entry.photo_url} 
              alt="Photo response"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Text - reflective, readable */}
        {!isVideo && !isAudio && !isPhoto && (
          <p className="text-muted-foreground text-xl leading-[1.8] font-light">
            {entry.content}
          </p>
        )}
      </div>

      {/* Subtle date */}
      <div className="px-8 pb-6">
        <p className="text-xs text-muted-foreground/50">
          {entry.created_at && format(new Date(entry.created_at), 'MMMM d, yyyy')}
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MOMENT CARD - Keepsake-style, question-first, human
// ═══════════════════════════════════════════════════════════════════════════
function MomentCard({ 
  entry, 
  index,
  onSetFeatured,
  compact = false
}: { 
  entry: Response; 
  index: number;
  onSetFeatured: () => void;
  compact?: boolean;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<string>('');
  const [showFullText, setShowFullText] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  
  const isVideo = entry.content_type === 'video';
  const isAudio = entry.content_type === 'audio';
  const isPhoto = entry.content_type === 'photo';
  const isText = !entry.content_type || entry.content_type === 'text';
  
  const formattedDate = entry.created_at 
    ? format(new Date(entry.created_at), 'MMMM d, yyyy')
    : '';

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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

  // Determine if text is long (over ~150 chars)
  const isLongText = isText && entry.content.length > 150;
  const displayText = isLongText && !showFullText 
    ? entry.content.slice(0, 150) + '...' 
    : entry.content;

  // Card sizing: video largest, voice/photo medium, text smallest
  const cardPadding = isVideo ? 'p-6' : isAudio || isPhoto ? 'p-5' : 'p-4';

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
      className={`group bg-card rounded-2xl border border-border/20 overflow-hidden break-inside-avoid hover:border-border/40 transition-colors ${cardPadding}`}
    >
      {/* Question first - clearly shown */}
      <h3 className={`font-serif text-foreground leading-snug mb-4 ${
        isVideo ? 'text-lg' : compact ? 'text-sm' : 'text-base'
      }`}>
        {entry.questions?.question || 'A moment of reflection'}
      </h3>

      {/* Response content */}
      {isText && (
        <div>
          <p className="text-muted-foreground leading-[1.75] text-sm">
            {displayText}
          </p>
          {isLongText && (
            <button 
              onClick={() => setShowFullText(!showFullText)}
              className="text-xs text-foreground/60 hover:text-foreground mt-2 flex items-center gap-1"
            >
              {showFullText ? 'Show less' : 'Read more'}
              <ChevronDown className={`w-3 h-3 transition-transform ${showFullText ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      )}

      {isVideo && entry.video_url && (
        <div 
          className="relative aspect-video bg-secondary/30 rounded-xl overflow-hidden cursor-pointer"
          onClick={togglePlay}
        >
          <video 
            ref={videoRef}
            src={entry.video_url} 
            className="w-full h-full object-cover"
            playsInline
            onLoadedMetadata={(e) => setDuration(formatDuration(e.currentTarget.duration))}
            onEnded={() => setIsPlaying(false)}
          />
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-foreground/5">
              <div className="w-12 h-12 rounded-full bg-background/95 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Play className="w-5 h-5 text-foreground fill-foreground ml-0.5" />
              </div>
            </div>
          )}
          {duration && (
            <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-foreground/80 text-background text-xs rounded-full">
              {duration}
            </div>
          )}
        </div>
      )}

      {isPhoto && entry.photo_url && (
        <div className="relative aspect-[4/3] bg-secondary/30 rounded-xl overflow-hidden">
          <img 
            src={entry.photo_url} 
            alt="Photo response"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {isAudio && (
        <div 
          className="bg-secondary/20 rounded-xl p-4 cursor-pointer"
          onClick={togglePlay}
        >
          {entry.audio_url && (
            <audio 
              ref={audioRef}
              src={entry.audio_url} 
              onLoadedMetadata={(e) => setDuration(formatDuration(e.currentTarget.duration))}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          )}
          <div className="flex items-center gap-4">
            <button className="w-12 h-12 rounded-full bg-foreground flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              {isPlaying ? (
                <Pause className="w-4 h-4 text-background" />
              ) : (
                <Play className="w-4 h-4 text-background fill-background ml-0.5" />
              )}
            </button>
            <div className="flex-1">
              <div className="flex items-end gap-[2px] h-8 mb-1">
                {[0.3, 0.5, 0.7, 0.4, 1, 0.8, 0.6, 0.9, 0.5, 0.7, 0.4, 0.8, 0.6, 0.5, 0.3, 0.6, 0.8, 0.5].map((h, i) => (
                  <div 
                    key={i} 
                    className={`flex-1 rounded-full transition-all ${
                      isPlaying ? 'bg-foreground/60 animate-pulse' : 'bg-foreground/25'
                    }`}
                    style={{ height: `${h * 100}%` }} 
                  />
                ))}
              </div>
              {duration && (
                <p className="text-xs text-muted-foreground/60">{duration}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer: subtle date + set as featured */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/10">
        <span className="text-xs text-muted-foreground/50">{formattedDate}</span>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onSetFeatured();
          }}
          className="text-xs text-muted-foreground/40 hover:text-foreground/70 transition-colors opacity-0 group-hover:opacity-100 flex items-center gap-1"
        >
          <Star className="w-3 h-3" />
          Feature
        </button>
      </div>
    </motion.article>
  );
}
