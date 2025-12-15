import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Archive, 
  Lock, 
  Users, 
  Clock, 
  FileText, 
  Mic, 
  Video, 
  Grid3X3,
  List,
  Loader2,
  Play
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

export default function ArchivePage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDepth, setSelectedDepth] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [entries, setEntries] = useState<Response[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>(['All']);

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
        
        const uniqueCategories = new Set<string>();
        data?.forEach(entry => {
          if (entry.questions?.category) {
            uniqueCategories.add(entry.questions.category);
          }
        });
        setCategories(['All', ...Array.from(uniqueCategories)]);
        
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
      const matchesCategory = selectedCategory === 'All' || entry.questions?.category === selectedCategory;
      const matchesDepth = selectedDepth === 'All' || entry.questions?.depth === selectedDepth;
      return matchesSearch && matchesCategory && matchesDepth;
    });
  }, [entries, searchTerm, selectedCategory, selectedDepth]);

  const getPrivacyIcon = (privacy: string | null) => {
    switch (privacy) {
      case 'private': return <Lock className="h-3.5 w-3.5" />;
      case 'share': return <Users className="h-3.5 w-3.5" />;
      case 'legacy': return <Clock className="h-3.5 w-3.5" />;
      default: return <Lock className="h-3.5 w-3.5" />;
    }
  };

  const getPrivacyStyle = (privacy: string | null) => {
    switch (privacy) {
      case 'private': return 'bg-muted text-muted-foreground';
      case 'share': return 'bg-[#4a8f6a]/10 text-[#4a8f6a]';
      case 'legacy': return 'bg-[#b5a48b]/10 text-[#b5a48b]';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPrivacyLabel = (privacy: string | null) => {
    switch (privacy) {
      case 'private': return 'Private';
      case 'share': return 'Shared';
      case 'legacy': return 'Legacy';
      default: return 'Private';
    }
  };

  const getMediaIcon = (mediaType: string | null) => {
    switch (mediaType) {
      case 'text': return <FileText className="h-4 w-4" />;
      case 'audio': return <Mic className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getDepthStyle = (depth: string | null) => {
    switch (depth) {
      case 'surface': return 'bg-[#4a8f6a]/10 text-[#4a8f6a] border-[#4a8f6a]/20';
      case 'medium': return 'bg-[#b5a48b]/10 text-[#b5a48b] border-[#b5a48b]/20';
      case 'deep': return 'bg-matter-coral/10 text-matter-coral border-matter-coral/20';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getDepthLabel = (depth: string | null) => {
    switch (depth) {
      case 'surface': return 'Light';
      case 'medium': return 'Medium';
      case 'deep': return 'Deep';
      default: return '';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Your Archive</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {entries.length === 0 ? 'No stories yet' : `${entries.length} ${entries.length === 1 ? 'story' : 'stories'} preserved`}
          </p>
        </div>
        <div className="flex gap-1">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-card rounded-2xl border border-border p-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search your stories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background border-border rounded-xl"
            />
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="rounded-xl"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
        
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-border space-y-3">
            {/* Category filter */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Category</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${
                      selectedCategory === category
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Depth filter */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Depth</p>
              <div className="flex flex-wrap gap-2">
                {['All', 'surface', 'medium', 'deep'].map((depth) => (
                  <button
                    key={depth}
                    onClick={() => setSelectedDepth(depth)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${
                      selectedDepth === depth
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {depth === 'All' ? 'All' : getDepthLabel(depth)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {entries.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <Archive className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-lg font-medium text-foreground mb-2">Your archive is empty</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Start answering weekly questions to build your personal archive of stories and reflections.
          </p>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-lg font-medium text-foreground mb-2">No results found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filters.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {filteredEntries.map((entry, i) => (
            <GridTile key={entry.id} entry={entry} index={i} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map((entry, i) => (
            <ListItem 
              key={entry.id} 
              entry={entry} 
              index={i}
              getMediaIcon={getMediaIcon}
              getPrivacyIcon={getPrivacyIcon}
              getPrivacyStyle={getPrivacyStyle}
              getPrivacyLabel={getPrivacyLabel}
              getDepthStyle={getDepthStyle}
              getDepthLabel={getDepthLabel}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function GridTile({ entry, index }: { entry: Response; index: number }) {
  const isVideo = entry.content_type === "video";
  const isAudio = entry.content_type === "audio";
  const isText = entry.content_type === "text" || !entry.content_type;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.02 }}
      className="relative aspect-square overflow-hidden bg-card border border-border rounded-xl group"
    >
      {isAudio && (
        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex flex-col items-center justify-center p-4">
          <div className="flex items-end justify-center gap-[3px] h-10 mb-3">
            {[0.4, 0.7, 0.5, 1, 0.6, 0.8, 0.4, 0.9, 0.5, 0.7].map((h, i) => (
              <div
                key={i}
                className="w-1 bg-primary rounded-full"
                style={{ height: `${h * 100}%` }}
              />
            ))}
          </div>
          <Mic className="w-4 h-4 text-primary" />
        </div>
      )}

      {isVideo && (
        <div className="w-full h-full bg-gradient-to-br from-matter-coral/10 to-matter-coral/5 flex items-center justify-center">
          <Play className="w-8 h-8 text-matter-coral fill-matter-coral" />
        </div>
      )}

      {isText && (
        <div className="w-full h-full p-3 flex flex-col">
          <p className="text-xs leading-relaxed text-foreground/80 line-clamp-6 flex-1">
            {entry.content}
          </p>
          <FileText className="w-4 h-4 text-muted-foreground mt-2" />
        </div>
      )}
      
      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-foreground/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3">
        <div className="text-center text-background">
          <p className="text-sm font-medium line-clamp-3">{entry.questions?.question || 'Reflection'}</p>
          <p className="text-xs opacity-70 mt-1 capitalize">{entry.questions?.category}</p>
        </div>
      </div>

      {entry.privacy === "legacy" && (
        <div className="absolute top-2 left-2 z-10">
          <Badge className="text-[10px] px-1.5 py-0.5 bg-[#b5a48b] text-white">
            <Archive className="w-3 h-3 mr-0.5" />
            Legacy
          </Badge>
        </div>
      )}
    </motion.button>
  );
}

interface ListItemProps {
  entry: Response;
  index: number;
  getMediaIcon: (type: string | null) => React.ReactNode;
  getPrivacyIcon: (privacy: string | null) => React.ReactNode;
  getPrivacyStyle: (privacy: string | null) => string;
  getPrivacyLabel: (privacy: string | null) => string;
  getDepthStyle: (depth: string | null) => string;
  getDepthLabel: (depth: string | null) => string;
}

function ListItem({ 
  entry, 
  index, 
  getMediaIcon, 
  getPrivacyIcon, 
  getPrivacyStyle, 
  getPrivacyLabel,
  getDepthStyle,
  getDepthLabel
}: ListItemProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      className="bg-card rounded-xl p-4 border border-border hover:border-primary/30 transition-all cursor-pointer"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground flex-shrink-0">
          {getMediaIcon(entry.content_type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs text-muted-foreground">
              {entry.created_at ? new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${getPrivacyStyle(entry.privacy)}`}>
              {getPrivacyIcon(entry.privacy)}
              {getPrivacyLabel(entry.privacy)}
            </span>
            {entry.questions?.depth && (
              <Badge variant="outline" className={`text-[10px] ${getDepthStyle(entry.questions.depth)}`}>
                {getDepthLabel(entry.questions.depth)}
              </Badge>
            )}
          </div>
          <h3 className="text-sm font-medium text-foreground line-clamp-1 mb-1">
            {entry.questions?.question || 'Reflection'}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {entry.content}
          </p>
          {entry.questions?.category && (
            <span className="inline-block mt-2 text-[10px] text-muted-foreground capitalize bg-muted px-2 py-0.5 rounded">
              {entry.questions.category}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
