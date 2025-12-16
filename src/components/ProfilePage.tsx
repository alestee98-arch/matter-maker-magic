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
  Edit3,
  Image as ImageIcon
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

// Category mapping for display
const CATEGORY_DISPLAY: Record<string, string> = {
  'childhood': 'Childhood',
  'relationships': 'Relationships',
  'self': 'Self',
  'wisdom': 'Wisdom',
  'family': 'Family',
  'life': 'Life',
  'happiness': 'Joy & Humor',
  'achievements': 'Career & Work',
  'values': 'Values',
  'legacy': 'Legacy',
};

export default function ProfilePage() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  
  const [entries, setEntries] = useState<Response[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
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

  // Get unique categories from entries
  const categories = ['all', ...Array.from(new Set(entries.map(e => e.questions?.category).filter(Boolean))) as string[]];

  // Filter entries
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = searchQuery === '' || 
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.questions?.question.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
      entry.questions?.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
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
      {/* TOP HALF - Profile Header */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="py-16 md:py-24"
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          {/* Avatar with gradient */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="relative mx-auto mb-8"
          >
            <div className="w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full bg-gradient-to-br from-[hsl(var(--matter-sage))] to-[hsl(var(--matter-forest))] flex items-center justify-center shadow-[0_8px_30px_-6px_rgba(0,0,0,0.15)] ring-4 ring-background">
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="font-serif text-3xl md:text-4xl text-foreground mb-3"
          >
            {displayName}
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="text-muted-foreground text-lg md:text-xl mb-8"
          >
            A life told one question at a time
          </motion.p>

          {/* Reflection count */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="inline-flex items-center gap-2 text-muted-foreground"
          >
            <Edit3 className="w-4 h-4" />
            <span className="font-medium">{entries.length}</span>
            <span>{entries.length === 1 ? 'reflection' : 'reflections'}</span>
          </motion.div>
        </div>
      </motion.section>

      {/* Subtle divider */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="h-px bg-border/60" />
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* BOTTOM HALF - Your Legacy */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-4 py-10 pb-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
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
          transition={{ delay: 0.45 }}
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

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide -mx-1 px-1"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-foreground text-background shadow-sm'
                  : 'bg-secondary/50 border border-border/40 text-foreground hover:bg-secondary'
              }`}
            >
              {category === 'all' ? 'All' : CATEGORY_DISPLAY[category] || category}
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
              {searchQuery || selectedCategory !== 'all' 
                ? 'No matching entries' 
                : 'Your legacy begins here'}
            </h3>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto leading-relaxed">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Answer your first question to start preserving your story'}
            </p>
            {!searchQuery && selectedCategory === 'all' && (
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

        {/* Entries Grid */}
        {filteredEntries.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
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
                totalEntries={entries.length}
              />
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}

// Legacy Card Component
function LegacyCard({ 
  entry, 
  index, 
  viewMode,
  totalEntries
}: { 
  entry: Response; 
  index: number; 
  viewMode: 'grid' | 'list';
  totalEntries: number;
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

  const categoryDisplay = CATEGORY_DISPLAY[entry.questions?.category || ''] || entry.questions?.category || 'Reflection';
  
  // Entry number (reversed - newest gets highest number)
  const entryNumber = totalEntries - index;

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
      transition={{ delay: index * 0.04, duration: 0.4 }}
      className={`bg-card rounded-2xl border border-border/30 overflow-hidden break-inside-avoid hover:border-border/60 transition-colors ${
        viewMode === 'list' ? 'flex gap-6 p-6' : 'p-6'
      }`}
    >
      {viewMode === 'grid' ? (
        <>
          {/* Header Row */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-foreground text-background text-xs font-semibold flex items-center justify-center">
                {entryNumber}
              </span>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                {categoryDisplay}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground/70">
              {isText && <Type className="w-3.5 h-3.5" strokeWidth={2} />}
              {isAudio && <Mic className="w-3.5 h-3.5" strokeWidth={2} />}
              {isVideo && <Video className="w-3.5 h-3.5" strokeWidth={2} />}
              {isPhoto && <ImageIcon className="w-3.5 h-3.5" strokeWidth={2} />}
              <span className="text-[11px] font-semibold uppercase tracking-wide">
                {isText ? 'Text' : isAudio ? 'Voice' : isVideo ? 'Video' : 'Photo'}
              </span>
            </div>
          </div>

          {/* Question */}
          <h3 className="font-serif text-xl text-foreground leading-snug mb-4">
            {entry.questions?.question || 'Reflection'}
          </h3>

          {/* Content */}
          {isText && (
            <p className="text-muted-foreground text-[15px] leading-relaxed mb-5">
              {entry.content}
            </p>
          )}

          {isVideo && entry.video_url && (
            <div 
              className="relative aspect-[4/3] bg-secondary rounded-xl overflow-hidden cursor-pointer group mb-5"
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
            <div className="relative aspect-[4/3] bg-secondary rounded-xl overflow-hidden mb-5">
              <img 
                src={entry.photo_url} 
                alt="Photo response"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {isAudio && (
            <div 
              className="bg-secondary/40 rounded-xl p-4 cursor-pointer group mb-5"
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
                        isPlaying 
                          ? 'bg-foreground/60 animate-pulse' 
                          : 'bg-foreground/25'
                      }`}
                      style={{ height: `${h * 100}%` }} 
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Date */}
          <p className="text-xs text-muted-foreground/60">{formattedDate}</p>
        </>
      ) : (
        // List View
        <>
          <div className="flex-shrink-0">
            <span className="w-10 h-10 rounded-full bg-foreground text-background text-sm font-semibold flex items-center justify-center">
              {entryNumber}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                {categoryDisplay}
              </span>
              <span className="text-muted-foreground/30">·</span>
              <div className="flex items-center gap-1 text-muted-foreground/70">
                {isText && <Type className="w-3 h-3" />}
                {isAudio && <Mic className="w-3 h-3" />}
                {isVideo && <Video className="w-3 h-3" />}
                {isPhoto && <ImageIcon className="w-3 h-3" />}
                <span className="text-[11px] font-semibold uppercase">
                  {isText ? 'Text' : isAudio ? 'Voice' : isVideo ? 'Video' : 'Photo'}
                </span>
              </div>
            </div>
            <h3 className="font-serif text-lg text-foreground leading-snug mb-2">
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
