import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Users, 
  Clock, 
  FileText, 
  Mic, 
  Video,
  Play,
  Sparkles,
  Loader2,
  X,
  ChevronDown,
  Image as ImageIcon,
  Archive
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
  } | null;
}

export default function PersonalArchive() {
  const [entries, setEntries] = useState<Response[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<Response | null>(null);
  
  const { user } = useAuth();

  useEffect(() => {
    const fetchResponses = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('responses')
          .select(`
            id, content, content_type, privacy, created_at, question_id,
            photo_url, audio_url, video_url,
            questions ( question, category )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(6);
        
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

  const getMediaIcon = (entry: Response) => {
    switch (entry.content_type) {
      case 'audio': return <Mic className="w-3.5 h-3.5" />;
      case 'video': return <Play className="w-3.5 h-3.5 fill-current" />;
      case 'photo': return <ImageIcon className="w-3.5 h-3.5" />;
      default: return <FileText className="w-3.5 h-3.5" />;
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
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="py-12 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="py-10 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
          <Sparkles className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-base font-medium text-foreground mb-1">Start your journey</h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Answer your first question to begin preserving your stories.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Archive className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">Recent</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {entries.map((entry, index) => {
          const hasPhoto = !!entry.photo_url;
          const isMedia = entry.content_type === 'audio' || entry.content_type === 'video';

          return (
            <motion.button
              key={entry.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.04, duration: 0.3 }}
              onClick={() => setSelectedEntry(entry)}
              className="relative aspect-square bg-card rounded-xl border border-border overflow-hidden text-left group hover:border-foreground/15 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {hasPhoto && (
                <img src={entry.photo_url!} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
              )}

              <div className={`absolute inset-0 flex flex-col justify-end p-2.5 ${
                hasPhoto ? 'bg-gradient-to-t from-black/70 via-black/20 to-transparent' : 'bg-card'
              }`}>
                {isMedia && !hasPhoto && (
                  <div className={`absolute top-2.5 left-2.5 w-7 h-7 rounded-lg flex items-center justify-center ${getMediaColor(entry.content_type)}`}>
                    {getMediaIcon(entry)}
                  </div>
                )}

                <p className={`text-[11px] font-medium line-clamp-2 leading-tight mb-0.5 ${hasPhoto ? 'text-white' : 'text-foreground'}`}>
                  {entry.questions?.question || 'Reflection'}
                </p>

                {!hasPhoto && (
                  <p className="text-[10px] text-muted-foreground line-clamp-2 leading-snug">
                    {entry.content}
                  </p>
                )}

                <span className={`text-[9px] mt-1 ${hasPhoto ? 'text-white/60' : 'text-muted-foreground/50'}`}>
                  {formatDate(entry.created_at)}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Detail Sheet */}
      <AnimatePresence>
        {selectedEntry && (
          <ArchiveDetailSheet entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
        )}
      </AnimatePresence>
    </>
  );
}

function ArchiveDetailSheet({ entry, onClose }: { entry: Response; onClose: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = entry.content.length > 200;
  const displayContent = !expanded && isLong ? entry.content.slice(0, 200) + '...' : entry.content;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] bg-card rounded-t-3xl border-t border-border shadow-premium overflow-y-auto"
      >
        <div className="sticky top-0 bg-card/95 backdrop-blur-sm z-10 pt-3 pb-2 px-5">
          <div className="w-10 h-1 bg-muted-foreground/20 rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {entry.created_at ? new Date(entry.created_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Recently'}
            </span>
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="px-5 pb-8">
          {entry.photo_url && (
            <div className="mb-5 -mx-5">
              <img src={entry.photo_url} alt="" className="w-full max-h-[45vh] object-cover" />
            </div>
          )}

          <h2 className="text-lg font-serif text-foreground mb-3 leading-snug">
            {entry.questions?.question || 'Reflection'}
          </h2>

          {entry.audio_url && (
            <div className="mb-4">
              <audio controls className="w-full" src={entry.audio_url} />
            </div>
          )}

          {entry.video_url && (
            <div className="mb-4 rounded-xl overflow-hidden">
              <video controls className="w-full" src={entry.video_url} />
            </div>
          )}

          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{displayContent}</p>

          {isLong && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="mt-2 flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Read more <ChevronDown className="w-3 h-3" />
            </button>
          )}

          <div className="mt-6 flex items-center gap-1.5 text-[11px] text-muted-foreground/50">
            <Lock className="w-3 h-3" />
            <span>Private</span>
          </div>
        </div>
      </motion.div>
    </>
  );
}
