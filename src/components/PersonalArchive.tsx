import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Archive, Lock, Users, Clock, FileText, Mic, Video, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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
  } | null;
}

export default function PersonalArchive() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [entries, setEntries] = useState<Response[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>(['All']);
  
  const { user } = useAuth();

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
              category
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setEntries(data || []);
        
        // Extract unique categories
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

  const filteredEntries = entries.filter(entry => {
    const question = entry.questions?.question || '';
    const matchesSearch = question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || entry.questions?.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getPrivacyIcon = (privacy: string | null) => {
    switch (privacy) {
      case 'private': return <Lock className="h-3 w-3" />;
      case 'share': return <Users className="h-3 w-3" />;
      case 'legacy': return <Clock className="h-3 w-3" />;
      default: return <Lock className="h-3 w-3" />;
    }
  };

  const getPrivacyStyle = (privacy: string | null) => {
    switch (privacy) {
      case 'private': return 'bg-muted text-muted-foreground';
      case 'share': return 'bg-primary/10 text-primary';
      case 'legacy': return 'bg-matter-gold/10 text-matter-gold';
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

  if (isLoading) {
    return (
      <div className="bg-card rounded-3xl border border-border shadow-md overflow-hidden">
        <div className="px-6 py-5 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Archive className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Your Archive</h2>
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </div>
        </div>
        <div className="px-6 py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-3xl border border-border shadow-md overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border bg-secondary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Archive className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Your Archive</h2>
              <p className="text-sm text-muted-foreground">
                {entries.length === 0 ? 'No stories yet' : `${entries.length} ${entries.length === 1 ? 'story' : 'stories'} preserved`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {entries.length === 0 ? (
        // Empty state for new users
        <div className="px-6 py-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Start your journey</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-4">
            Answer your first weekly question to begin preserving your stories and wisdom.
          </p>
          <p className="text-xs text-muted-foreground">
            Each response becomes part of your lasting legacy.
          </p>
        </div>
      ) : (
        <>
          {/* Search and Filters */}
          <div className="px-6 py-4 border-b border-border">
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
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className="rounded-xl"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            
            {showFilters && (
              <div className="flex flex-wrap gap-2 mt-3">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${
                      selectedCategory === category
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Entries List */}
          <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
            {filteredEntries.map((entry) => (
              <div 
                key={entry.id} 
                className="bg-background rounded-2xl p-4 border border-border hover:border-primary/30 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground flex-shrink-0">
                    {getMediaIcon(entry.content_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground">
                        {entry.created_at ? new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently'}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${getPrivacyStyle(entry.privacy)}`}>
                        {getPrivacyIcon(entry.privacy)}
                        {getPrivacyLabel(entry.privacy)}
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-foreground line-clamp-1 mb-1">
                      {entry.questions?.question || 'Reflection'}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {entry.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredEntries.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No entries found</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border bg-secondary/30">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Your stories become your legacy
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}