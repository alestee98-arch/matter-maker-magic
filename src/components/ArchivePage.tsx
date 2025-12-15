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
  Loader2,
  Play,
  Archive
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';

interface Response {
  id: string;
  content: string;
  content_type: string | null;
  privacy: string | null;
  created_at: string | null;
  question_id: string | null;
  questions?: {
    question: string;
    category: string;
    depth: string | null;
  } | null;
}

const FILTERS = ['All', 'Text', 'Audio', 'Video'];

export default function ArchivePage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [entries, setEntries] = useState<Response[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const getPrivacyIcon = (privacy: string | null) => {
    switch (privacy) {
      case 'private': return <Lock className="w-3 h-3" />;
      case 'share': return <Users className="w-3 h-3" />;
      case 'legacy': return <Clock className="w-3 h-3" />;
      default: return <Lock className="w-3 h-3" />;
    }
  };

  const getMediaIcon = (mediaType: string | null) => {
    switch (mediaType) {
      case 'audio': return <Mic className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
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
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-serif text-foreground mb-2">Archive</h1>
        <p className="text-muted-foreground">
          {entries.length === 0 
            ? 'Your preserved reflections will appear here' 
            : `${entries.length} ${entries.length === 1 ? 'reflection' : 'reflections'} preserved`}
        </p>
      </motion.div>

      {entries.length > 0 && (
        <>
          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search your archive..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 h-12 bg-secondary/50 border-0 rounded-2xl text-base focus-visible:ring-1 focus-visible:ring-foreground"
              />
            </div>
            
            <div className="flex gap-2">
              {FILTERS.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
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

          {/* Entries */}
          {filteredEntries.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No matching reflections found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEntries.map((entry, index) => (
                <motion.article
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-card rounded-2xl p-6 border border-border hover:border-foreground/20 transition-all duration-300 cursor-pointer hover-lift"
                >
                  <div className="flex items-start gap-5">
                    {/* Media Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      entry.content_type === 'audio' ? 'bg-accent/10 text-accent' :
                      entry.content_type === 'video' ? 'bg-matter-coral/10 text-matter-coral' :
                      'bg-secondary text-muted-foreground'
                    }`}>
                      {entry.content_type === 'video' && <Play className="w-5 h-5 fill-current" />}
                      {entry.content_type === 'audio' && (
                        <div className="flex items-end gap-0.5 h-5">
                          {[0.4, 0.7, 0.5, 1, 0.6].map((h, i) => (
                            <div key={i} className="w-0.5 bg-current rounded-full" style={{ height: `${h * 100}%` }} />
                          ))}
                        </div>
                      )}
                      {(!entry.content_type || entry.content_type === 'text') && getMediaIcon(entry.content_type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs text-muted-foreground">
                          {entry.created_at 
                            ? new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : 'Recently'}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          {getPrivacyIcon(entry.privacy)}
                        </span>
                      </div>
                      
                      <h3 className="text-base font-medium text-foreground mb-2 line-clamp-1">
                        {entry.questions?.question || 'Reflection'}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {entry.content}
                      </p>
                      
                      {entry.questions?.category && (
                        <span className="inline-block mt-3 text-xs text-muted-foreground capitalize">
                          {entry.questions.category}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.article>
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
          <p className="text-muted-foreground max-w-sm">
            Answer your first weekly question to start building your personal archive.
          </p>
        </motion.div>
      )}
    </div>
  );
}
