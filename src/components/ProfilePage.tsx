import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
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
  ArrowRight
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

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-muted-foreground/20 border-t-foreground animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] max-w-5xl mx-auto px-4 pb-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between py-6"
      >
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-foreground" />
          <h1 className="text-xl font-medium text-foreground">Your Legacy</h1>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' 
                ? 'bg-secondary text-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Grid3X3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' 
                ? 'bg-secondary text-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-6"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search your legacy..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12 bg-card border-border/50 rounded-xl text-base"
          />
        </div>
      </motion.div>

      {/* Category Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide"
      >
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === category
                ? 'bg-foreground text-background'
                : 'bg-card border border-border/50 text-foreground hover:bg-secondary'
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
          <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-6 flex items-center justify-center">
            <Heart className="w-7 h-7 text-muted-foreground" />
          </div>
          <h2 className="font-serif text-xl text-foreground mb-3">
            {searchQuery || selectedCategory !== 'all' 
              ? 'No matching entries' 
              : 'Your legacy begins here'}
          </h2>
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
            {searchQuery || selectedCategory !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Answer your first question to start building your legacy'}
          </p>
          {!searchQuery && selectedCategory === 'all' && (
            <Button 
              onClick={() => navigate('/home')}
              size="lg"
              className="rounded-full bg-foreground text-background hover:bg-foreground/90 px-8"
            >
              Answer your first question
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </motion.div>
      )}

      {/* Entries Grid */}
      {filteredEntries.length > 0 && (
        <div className={viewMode === 'grid' 
          ? 'columns-1 md:columns-2 gap-4 space-y-4' 
          : 'space-y-4'
        }>
          {filteredEntries.map((entry, index) => (
            <LegacyCard 
              key={entry.id} 
              entry={entry} 
              index={index}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Legacy Card Component
function LegacyCard({ entry, index, viewMode }: { entry: Response; index: number; viewMode: 'grid' | 'list' }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  
  const isVideo = entry.content_type === 'video';
  const isAudio = entry.content_type === 'audio';
  const isText = !entry.content_type || entry.content_type === 'text';
  
  const formattedDate = entry.created_at 
    ? format(new Date(entry.created_at), 'MMMM d, yyyy')
    : '';

  const categoryDisplay = CATEGORY_DISPLAY[entry.questions?.category || ''] || entry.questions?.category || 'Reflection';

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

  // Get response number (for display badge)
  const entryNumber = index + 1;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`bg-card rounded-2xl border border-border/40 overflow-hidden break-inside-avoid ${
        viewMode === 'list' ? 'flex gap-6 p-6' : 'p-5'
      }`}
    >
      {viewMode === 'grid' ? (
        <>
          {/* Header Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-foreground text-background text-xs font-semibold flex items-center justify-center">
                {entryNumber}
              </span>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {categoryDisplay}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              {isText && <Type className="w-3.5 h-3.5" />}
              {isAudio && <Mic className="w-3.5 h-3.5" />}
              {isVideo && <Video className="w-3.5 h-3.5" />}
              <span className="text-xs font-medium uppercase">
                {isText ? 'Text' : isAudio ? 'Voice' : 'Video'}
              </span>
            </div>
          </div>

          {/* Question */}
          <h3 className="font-serif text-lg text-foreground leading-snug mb-3">
            {entry.questions?.question || 'Reflection'}
          </h3>

          {/* Content */}
          {isText && (
            <p className="text-muted-foreground text-[15px] leading-relaxed mb-4">
              {entry.content}
            </p>
          )}

          {isVideo && entry.video_url && (
            <div 
              className="relative aspect-video bg-secondary rounded-xl overflow-hidden cursor-pointer group mb-4"
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

          {isAudio && (
            <div 
              className="bg-secondary/50 rounded-xl p-4 cursor-pointer group mb-4"
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
                <div className="flex-1 flex items-end gap-[2px] h-8">
                  {[0.3, 0.5, 0.7, 0.4, 1, 0.8, 0.6, 0.9, 0.5, 0.7, 0.4, 0.8, 0.6, 0.5, 0.3, 0.6, 0.8, 0.5, 0.4, 0.6].map((h, i) => (
                    <div 
                      key={i} 
                      className={`flex-1 rounded-full transition-all ${
                        isPlaying 
                          ? 'bg-foreground/50 animate-pulse' 
                          : 'bg-foreground/20'
                      }`}
                      style={{ height: `${h * 100}%` }} 
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Date */}
          <p className="text-xs text-muted-foreground/70">{formattedDate}</p>
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
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {categoryDisplay}
              </span>
              <span className="text-muted-foreground/30">·</span>
              <div className="flex items-center gap-1 text-muted-foreground">
                {isText && <Type className="w-3 h-3" />}
                {isAudio && <Mic className="w-3 h-3" />}
                {isVideo && <Video className="w-3 h-3" />}
                <span className="text-xs">
                  {isText ? 'Text' : isAudio ? 'Voice' : 'Video'}
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
            <p className="text-xs text-muted-foreground/70">{formattedDate}</p>
          </div>
        </>
      )}
    </motion.article>
  );
}