import React, { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Lock, 
  Users, 
  Clock, 
  FileText, 
  Mic, 
  Video,
  Play,
  Archive,
  X,
  ChevronDown,
  Image as ImageIcon
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

interface Response {
  id: string;
  content: string;
  content_type: string | null;
  privacy: string | null;
  created_at: string | null;
  question_id: string | null;
  photo_url: string | null;
  audio_url: string | null;
  video_url: string | null;
  questions?: {
    question: string;
    category: string;
    depth: string | null;
  } | null;
}

const FILTERS = ['All', 'Text', 'Audio', 'Video', 'Photo'];

export default function ArchivePage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [entries, setEntries] = useState<Response[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<Response | null>(null);

  useEffect(() => {
    const fetchResponses = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('responses')
          .select(`
            id,
            content,
            content_type,
            privacy,
            created_at,
            question_id,
            photo_url,
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
        
        if (error) throw error;
        setEntries(data || []);
      } catch (error) {
        console.error('Error fetching responses:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResponses();
  }, [user]);

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const question = entry.questions?.question || '';
      const matchesSearch = question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           entry.content.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (activeFilter === 'All') return matchesSearch;
      return matchesSearch && entry.content_type?.toLowerCase() === activeFilter.toLowerCase();
    });
  }, [entries, searchTerm, activeFilter]);

  const getMediaIcon = (entry: Response) => {
    switch (entry.content_type) {
      case 'audio': return <Mic className="w-4 h-4" />;
      case 'video': return <Play className="w-4 h-4 fill-current" />;
      case 'photo': return <ImageIcon className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getMediaColor = (type: string | null) => {
    switch (type) {
      case 'audio': return 'bg-accent/10 text-accent';
      case 'video': return 'bg-matter-coral/10 text-matter-coral';
      case 'photo': return 'bg-matter-gold/10 text-matter-gold';
      default: return 'bg-secondary text-muted-foreground';
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Recently';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatDateLong = (date: string | null) => {
    if (!date) return 'Recently';
    return new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-muted-foreground/20 border-t-foreground animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-3xl md:text-4xl font-serif text-foreground mb-1">Archive</h1>
        <p className="text-sm text-muted-foreground">
          {entries.length === 0 
            ? 'Your preserved reflections will appear here' 
            : `${entries.length} ${entries.length === 1 ? 'reflection' : 'reflections'} preserved`}
        </p>
      </motion.div>

      {entries.length > 0 && (
        <>
          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-5"
          >
            <div className="relative mb-3">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 bg-secondary/50 border-0 rounded-xl text-sm focus-visible:ring-1 focus-visible:ring-foreground"
              />
            </div>
            
            {/* Filter pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
              {FILTERS.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                    activeFilter === filter
                      ? 'bg-foreground text-background'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Grid */}
          {filteredEntries.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-sm">No matching reflections.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
              {filteredEntries.map((entry, index) => (
                <GridCard 
                  key={entry.id} 
                  entry={entry} 
                  index={index}
                  getMediaIcon={getMediaIcon}
                  getMediaColor={getMediaColor}
                  formatDate={formatDate}
                  onSelect={() => setSelectedEntry(entry)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {entries.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-6">
            <Archive className="w-7 h-7 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-serif text-foreground mb-2">Your archive is empty</h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            Answer your first weekly question to start building your personal archive.
          </p>
        </motion.div>
      )}

      {/* Detail Sheet */}
      <AnimatePresence>
        {selectedEntry && (
          <DetailSheet 
            entry={selectedEntry} 
            onClose={() => setSelectedEntry(null)}
            formatDateLong={formatDateLong}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Grid Card ─── */
function GridCard({ 
  entry, index, getMediaIcon, getMediaColor, formatDate, onSelect 
}: { 
  entry: Response; 
  index: number;
  getMediaIcon: (e: Response) => React.ReactNode;
  getMediaColor: (t: string | null) => string;
  formatDate: (d: string | null) => string;
  onSelect: () => void;
}) {
  const hasPhoto = !!entry.photo_url;
  const isMedia = entry.content_type === 'audio' || entry.content_type === 'video';

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      onClick={onSelect}
      className="relative aspect-square bg-card rounded-2xl border border-border overflow-hidden text-left group hover:border-foreground/15 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Photo background */}
      {hasPhoto && (
        <img 
          src={entry.photo_url!} 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      )}

      {/* Content overlay */}
      <div className={`absolute inset-0 flex flex-col justify-end p-3 ${
        hasPhoto 
          ? 'bg-gradient-to-t from-black/70 via-black/20 to-transparent' 
          : 'bg-card'
      }`}>
        {/* Media badge */}
        {isMedia && !hasPhoto && (
          <div className={`absolute top-3 left-3 w-8 h-8 rounded-lg flex items-center justify-center ${getMediaColor(entry.content_type)}`}>
            {getMediaIcon(entry)}
          </div>
        )}

        {/* Question (title) */}
        <p className={`text-xs font-medium mb-1 line-clamp-2 leading-snug ${
          hasPhoto ? 'text-white' : 'text-foreground'
        }`}>
          {entry.questions?.question || 'Reflection'}
        </p>

        {/* Content preview - clipped */}
        {!hasPhoto && (
          <p className="text-[11px] text-muted-foreground line-clamp-3 leading-relaxed mb-2">
            {entry.content}
          </p>
        )}

        {/* Date */}
        <span className={`text-[10px] ${hasPhoto ? 'text-white/70' : 'text-muted-foreground/70'}`}>
          {formatDate(entry.created_at)}
        </span>
      </div>

      {/* Hover indicator */}
      <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-200 rounded-2xl" />
    </motion.button>
  );
}

/* ─── Detail Sheet (full view) ─── */
function DetailSheet({ 
  entry, onClose, formatDateLong 
}: { 
  entry: Response; 
  onClose: () => void;
  formatDateLong: (d: string | null) => string;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLongText = entry.content.length > 300;
  const displayContent = !expanded && isLongText 
    ? entry.content.slice(0, 300) + '...' 
    : entry.content;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
      />
      
      {/* Sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] bg-card rounded-t-3xl border-t border-border shadow-premium overflow-y-auto"
      >
        {/* Handle */}
        <div className="sticky top-0 bg-card/95 backdrop-blur-sm z-10 pt-3 pb-2 px-6">
          <div className="w-10 h-1 bg-muted-foreground/20 rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {formatDateLong(entry.created_at)}
            </span>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-6 pb-10">
          {/* Photo */}
          {entry.photo_url && (
            <div className="mb-6 -mx-6">
              <img 
                src={entry.photo_url} 
                alt="" 
                className="w-full max-h-[50vh] object-cover"
              />
            </div>
          )}

          {/* Question */}
          <h2 className="text-xl font-serif text-foreground mb-4 leading-snug">
            {entry.questions?.question || 'Reflection'}
          </h2>

          {/* Category */}
          {entry.questions?.category && (
            <span className="inline-block mb-4 px-3 py-1 rounded-full bg-secondary text-xs text-muted-foreground capitalize">
              {entry.questions.category}
            </span>
          )}

          {/* Audio player */}
          {entry.audio_url && (
            <div className="mb-6">
              <audio controls className="w-full" src={entry.audio_url}>
                Your browser does not support audio playback.
              </audio>
            </div>
          )}

          {/* Video player */}
          {entry.video_url && (
            <div className="mb-6 rounded-2xl overflow-hidden">
              <video controls className="w-full" src={entry.video_url}>
                Your browser does not support video playback.
              </video>
            </div>
          )}

          {/* Content */}
          <div className="relative">
            <p className="text-base text-foreground leading-relaxed whitespace-pre-wrap">
              {displayContent}
            </p>
            
            {isLongText && !expanded && (
              <button
                onClick={() => setExpanded(true)}
                className="mt-2 flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Read more
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Privacy */}
          <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground/60">
            <Lock className="w-3 h-3" />
            <span>Private</span>
          </div>
        </div>
      </motion.div>
    </>
  );
}
