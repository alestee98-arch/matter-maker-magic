import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { 
  Heart,
  Search,
  Grid3X3,
  List,
  Type,
  Mic,
  Video,
  Play,
  ArrowRight,
  Image as ImageIcon
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
    const matchesSearch = searchQuery === '' || 
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.questions?.question.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    if (selectedFilter === 'video') matchesFilter = entry.content_type === 'video';
    else if (selectedFilter === 'voice') matchesFilter = entry.content_type === 'audio';
    else if (selectedFilter === 'text') matchesFilter = !entry.content_type || entry.content_type === 'text';
    
    return matchesSearch && matchesFilter;
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
        <div className="w-8 h-8 rounded-full border-2 border-muted-foreground/20 border-t-foreground animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TOP - Profile Summary Block */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="py-12 md:py-16"
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="relative mx-auto mb-6"
          >
            <div className="w-28 h-28 md:w-32 md:h-32 mx-auto rounded-full bg-gradient-to-br from-[hsl(var(--matter-sage))] to-[hsl(var(--matter-forest))] flex items-center justify-center shadow-[0_8px_30px_-6px_rgba(0,0,0,0.15)] ring-4 ring-background">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={displayName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="font-serif text-4xl md:text-5xl text-white/90">
                  {getInitials()}
                </span>
              )}
            </div>
          </motion.div>

          {/* Name */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="font-serif text-3xl md:text-4xl text-foreground mb-2"
          >
            {displayName}
          </motion.h1>

          {/* Identity sentence */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="text-muted-foreground text-lg italic mb-4"
          >
            A life told one question at a time.
          </motion.p>

          {/* Media counts */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-muted-foreground/80 text-sm"
          >
            {entries.length > 0 ? (
              <span>
                {entries.length} moment{entries.length !== 1 ? 's' : ''}
                {videoCount > 0 && <> · {videoCount} video{videoCount !== 1 ? 's' : ''}</>}
                {voiceCount > 0 && <> · {voiceCount} voice recording{voiceCount !== 1 ? 's' : ''}</>}
                {textCount > 0 && <> · {textCount} written reflection{textCount !== 1 ? 's' : ''}</>}
                {photoCount > 0 && <> · {photoCount} photo{photoCount !== 1 ? 's' : ''}</>}
              </span>
            ) : (
              <span>Begin your legacy</span>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* FEATURED MOMENT */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {featuredMoment && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="max-w-4xl mx-auto px-4 mb-12"
        >
          <p className="text-sm text-muted-foreground mb-4 text-center">
            A moment that captures {displayName.split(' ')[0]}
          </p>
          <FeaturedCard entry={featuredMoment} />
        </motion.section>
      )}

      {/* Subtle divider */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="h-px bg-border/60" />
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* YOUR LEGACY SECTION */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-2.5">
            <Heart className="w-5 h-5 text-foreground/80" strokeWidth={1.5} />
            <h2 className="text-xl font-medium text-foreground tracking-tight">Your Legacy</h2>
          </div>
          
          <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all ${
                viewMode === 'grid' 
                  ? 'bg-background shadow-sm text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all ${
                viewMode === 'list' 
                  ? 'bg-background shadow-sm text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search your legacy..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 bg-secondary/30 border-border/50 rounded-xl text-base placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-foreground/20"
            />
          </div>
        </motion.div>

        {/* Simplified Filters: All, Video, Voice, Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex gap-2 mb-8"
        >
          {['all', 'video', 'voice', 'text'].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedFilter === filter
                  ? 'bg-foreground text-background shadow-sm'
                  : 'bg-secondary/50 border border-border/40 text-foreground hover:bg-secondary'
              }`}
            >
              {filter === 'video' && <Video className="w-3.5 h-3.5" />}
              {filter === 'voice' && <Mic className="w-3.5 h-3.5" />}
              {filter === 'text' && <Type className="w-3.5 h-3.5" />}
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredEntries.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 rounded-full bg-secondary/60 mx-auto mb-6 flex items-center justify-center">
              <Heart className="w-8 h-8 text-muted-foreground/50" strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-2xl text-foreground mb-3">
              {searchQuery || selectedFilter !== 'all' 
                ? 'No matching entries' 
                : 'Your legacy begins here'}
            </h3>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto leading-relaxed">
              {searchQuery || selectedFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Answer your first question to start preserving your story'}
            </p>
            {!searchQuery && selectedFilter === 'all' && (
              <Button 
                onClick={() => navigate('/home')}
                size="lg"
                className="rounded-full bg-foreground text-background hover:bg-foreground/90 px-8 h-12 text-base"
              >
                Answer your first question
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </motion.div>
        )}

        {/* Entries Grid with weighted card sizes */}
        {filteredEntries.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className={viewMode === 'grid' 
              ? 'columns-1 md:columns-2 gap-5 space-y-5' 
              : 'space-y-4'
            }
          >
            {filteredEntries.map((entry, index) => (
              <LegacyCard 
                key={entry.id} 
                entry={entry} 
                index={index}
                viewMode={viewMode}
              />
            ))}
          </motion.div>
        )}

        {/* Closing line */}
        {entries.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-muted-foreground/70 italic mt-16 pb-8"
          >
            This is a growing record of a life — shaped week by week.
          </motion.p>
        )}
      </section>
    </div>
  );
}

// Featured Card Component (large, media-first)
function FeaturedCard({ entry }: { entry: Response }) {
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
    <div className="bg-card rounded-2xl border border-border/30 overflow-hidden p-6">
      {/* In response to: */}
      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">In response to:</p>
      <h3 className="font-serif text-xl text-foreground leading-snug mb-5">
        {entry.questions?.question || 'Reflection'}
      </h3>

      {/* Video - large */}
      {isVideo && entry.video_url && (
        <div 
          className="relative aspect-video bg-secondary rounded-xl overflow-hidden cursor-pointer group"
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
            <div className="absolute inset-0 flex items-center justify-center bg-foreground/5">
              <div className="w-16 h-16 rounded-full bg-background/95 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Play className="w-7 h-7 text-foreground fill-foreground ml-1" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Audio - waveform */}
      {isAudio && entry.audio_url && (
        <div 
          className="bg-secondary/40 rounded-xl p-5 cursor-pointer group"
          onClick={togglePlay}
        >
          <audio 
            ref={audioRef}
            src={entry.audio_url} 
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
          <div className="flex items-center gap-4">
            <button className="w-12 h-12 rounded-full bg-foreground flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              {isPlaying ? (
                <div className="w-3.5 h-3.5 bg-background rounded-sm" />
              ) : (
                <Play className="w-5 h-5 text-background fill-background ml-0.5" />
              )}
            </button>
            <div className="flex-1 flex items-end gap-[3px] h-10">
              {[0.3, 0.5, 0.7, 0.4, 1, 0.8, 0.6, 0.9, 0.5, 0.7, 0.4, 0.8, 0.6, 0.5, 0.3, 0.6, 0.8, 0.5, 0.4, 0.6, 0.7, 0.5, 0.8, 0.4].map((h, i) => (
                <div 
                  key={i} 
                  className={`flex-1 rounded-full transition-all ${
                    isPlaying ? 'bg-foreground/60 animate-pulse' : 'bg-foreground/25'
                  }`}
                  style={{ height: `${h * 100}%` }} 
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Photo */}
      {isPhoto && entry.photo_url && (
        <div className="relative aspect-video bg-secondary rounded-xl overflow-hidden">
          <img 
            src={entry.photo_url} 
            alt="Photo response"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Text - if no media */}
      {!isVideo && !isAudio && !isPhoto && (
        <p className="text-muted-foreground text-lg leading-relaxed">
          {entry.content}
        </p>
      )}
    </div>
  );
}

// Legacy Card Component with weighted sizes
function LegacyCard({ 
  entry, 
  index, 
  viewMode
}: { 
  entry: Response; 
  index: number; 
  viewMode: 'grid' | 'list';
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  
  const isVideo = entry.content_type === 'video';
  const isAudio = entry.content_type === 'audio';
  const isPhoto = entry.content_type === 'photo';
  const isText = !entry.content_type || entry.content_type === 'text';
  
  const formattedDate = entry.created_at 
    ? format(new Date(entry.created_at), 'MMMM d, yyyy')
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

  // Card size classes based on content type: video = largest, voice = medium, text = smallest
  const cardSizeClass = isVideo 
    ? 'p-6' // Video cards get more padding
    : isAudio || isPhoto
    ? 'p-5' // Voice/Photo cards medium
    : 'p-4'; // Text cards smallest

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.4 }}
      className={`bg-card rounded-2xl border border-border/30 overflow-hidden break-inside-avoid hover:border-border/60 transition-colors ${
        viewMode === 'list' ? 'flex gap-5 p-5' : cardSizeClass
      }`}
    >
      {viewMode === 'grid' ? (
        <>
          {/* Header: Media type indicator */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-muted-foreground/70">
              {isText && <Type className="w-3.5 h-3.5" strokeWidth={2} />}
              {isAudio && <Mic className="w-3.5 h-3.5" strokeWidth={2} />}
              {isVideo && <Video className="w-3.5 h-3.5" strokeWidth={2} />}
              {isPhoto && <ImageIcon className="w-3.5 h-3.5" strokeWidth={2} />}
              <span className="text-[11px] font-semibold uppercase tracking-wide">
                {isText ? 'Text' : isAudio ? 'Voice' : isVideo ? 'Video' : 'Photo'}
              </span>
            </div>
            <span className="text-xs text-muted-foreground/60">{formattedDate}</span>
          </div>

          {/* In response to: Question */}
          <p className="text-xs text-muted-foreground/70 mb-1">In response to:</p>
          <h3 className={`font-serif text-foreground leading-snug mb-4 ${isVideo ? 'text-lg' : isAudio ? 'text-base' : 'text-sm'}`}>
            {entry.questions?.question || 'Reflection'}
          </h3>

          {/* Content based on type */}
          {isText && (
            <p className="text-muted-foreground text-sm leading-relaxed">
              {entry.content}
            </p>
          )}

          {isVideo && entry.video_url && (
            <div 
              className="relative aspect-video bg-secondary rounded-xl overflow-hidden cursor-pointer group"
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
                <div className="absolute inset-0 flex items-center justify-center bg-foreground/5">
                  <div className="w-14 h-14 rounded-full bg-background/95 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    <Play className="w-6 h-6 text-foreground fill-foreground ml-0.5" />
                  </div>
                </div>
              )}
            </div>
          )}

          {isPhoto && entry.photo_url && (
            <div className="relative aspect-[4/3] bg-secondary rounded-xl overflow-hidden">
              <img 
                src={entry.photo_url} 
                alt="Photo response"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {isAudio && (
            <div 
              className="bg-secondary/40 rounded-xl p-4 cursor-pointer group"
              onClick={togglePlay}
            >
              {entry.audio_url && (
                <audio 
                  ref={audioRef}
                  src={entry.audio_url} 
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
              )}
              <div className="flex items-center gap-4">
                <button className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  {isPlaying ? (
                    <div className="w-3 h-3 bg-background rounded-sm" />
                  ) : (
                    <Play className="w-4 h-4 text-background fill-background ml-0.5" />
                  )}
                </button>
                <div className="flex-1 flex items-end gap-[3px] h-8">
                  {[0.3, 0.5, 0.7, 0.4, 1, 0.8, 0.6, 0.9, 0.5, 0.7, 0.4, 0.8, 0.6, 0.5, 0.3, 0.6, 0.8, 0.5, 0.4, 0.6].map((h, i) => (
                    <div 
                      key={i} 
                      className={`flex-1 rounded-full transition-all ${
                        isPlaying ? 'bg-foreground/60 animate-pulse' : 'bg-foreground/25'
                      }`}
                      style={{ height: `${h * 100}%` }} 
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        // List View
        <>
          <div className="flex-shrink-0">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isVideo ? 'bg-foreground text-background' : 
              isAudio ? 'bg-foreground/80 text-background' : 
              'bg-secondary text-foreground'
            }`}>
              {isText && <Type className="w-4 h-4" />}
              {isAudio && <Mic className="w-4 h-4" />}
              {isVideo && <Video className="w-4 h-4" />}
              {isPhoto && <ImageIcon className="w-4 h-4" />}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground/70 mb-0.5">In response to:</p>
            <h3 className="font-serif text-base text-foreground leading-snug mb-2">
              {entry.questions?.question || 'Reflection'}
            </h3>
            {isText && (
              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-2">
                {entry.content}
              </p>
            )}
            <p className="text-xs text-muted-foreground/60">{formattedDate}</p>
          </div>
        </>
      )}
    </motion.article>
  );
}
