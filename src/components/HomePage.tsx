import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Sparkles, 
  PenTool, 
  Mic, 
  Video, 
  Archive, 
  Lock, 
  Users, 
  Clock,
  FileText,
  Search,
  Filter,
  Loader2,
  Check
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: string;
  question: string;
  category: string;
  depth: string | null;
}

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

export default function HomePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Question state
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [response, setResponse] = useState('');
  const [responseType, setResponseType] = useState<'text' | 'audio' | 'video'>('text');
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Archive state
  const [entries, setEntries] = useState<Response[]>([]);
  const [isLoadingArchive, setIsLoadingArchive] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>(['All']);

  // Fetch question
  useEffect(() => {
    const fetchQuestion = async () => {
      if (!user) return;
      
      setIsLoadingQuestion(true);
      try {
        const { data: responses } = await supabase
          .from('responses')
          .select('question_id')
          .eq('user_id', user.id);
        
        const answeredIds = responses?.map(r => r.question_id).filter(Boolean) as string[] || [];
        
        const { data: questions, error } = await supabase
          .from('questions')
          .select('*');
        
        if (error) throw error;
        
        if (questions && questions.length > 0) {
          const unansweredQuestions = questions.filter(q => !answeredIds.includes(q.id));
          
          if (unansweredQuestions.length > 0) {
            const randomIndex = Math.floor(Math.random() * unansweredQuestions.length);
            setCurrentQuestion(unansweredQuestions[randomIndex]);
          } else {
            const randomIndex = Math.floor(Math.random() * questions.length);
            setCurrentQuestion(questions[randomIndex]);
          }
        }
      } catch (error) {
        console.error('Error fetching question:', error);
      } finally {
        setIsLoadingQuestion(false);
      }
    };
    
    fetchQuestion();
  }, [user]);

  // Fetch archive
  useEffect(() => {
    const fetchResponses = async () => {
      if (!user) return;
      
      setIsLoadingArchive(true);
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
        setIsLoadingArchive(false);
      }
    };
    
    fetchResponses();
  }, [user, isSubmitted]);

  const handleSubmit = async () => {
    if (!currentQuestion || !user || !response.trim()) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('responses')
        .insert({
          user_id: user.id,
          question_id: currentQuestion.id,
          content: response.trim(),
          content_type: responseType,
          word_count: response.trim().split(/\s+/).length,
          privacy: 'private'
        });
      
      if (error) throw error;
      
      setIsSubmitted(true);
      toast({
        title: 'Response saved!',
        description: 'Your story has been added to your archive.'
      });
      
      setTimeout(() => {
        setResponse('');
        setIsSubmitted(false);
      }, 2000);
      
    } catch (error: any) {
      console.error('Error saving response:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to save response',
        description: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEntries = entries.filter(entry => {
    const question = entry.questions?.question || '';
    const matchesSearch = question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || entry.questions?.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
      default: return 'Reflect';
    }
  };

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

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* This Week's Question Card */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground text-sm">This Week's Question</h2>
                <p className="text-xs text-muted-foreground">
                  {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            {currentQuestion && (
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getDepthStyle(currentQuestion.depth)}`}>
                {getDepthLabel(currentQuestion.depth)}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        {isLoadingQuestion ? (
          <div className="px-5 py-12 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : isSubmitted ? (
          <div className="px-5 py-12 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
              <Check className="h-6 w-6 text-primary" />
            </div>
            <p className="text-lg font-serif text-foreground mb-1">Beautiful.</p>
            <p className="text-sm text-muted-foreground">Your reflection has been added to your legacy.</p>
          </div>
        ) : currentQuestion ? (
          <>
            {/* Question */}
            <div className="px-5 py-5">
              <p className="text-lg text-foreground leading-relaxed font-serif">
                {currentQuestion.question}
              </p>
              <p className="mt-2 text-xs text-muted-foreground capitalize">
                {currentQuestion.category}
              </p>
            </div>

            {/* Response type selector */}
            <div className="px-5 pb-3">
              <div className="flex gap-1.5">
                {[
                  { type: 'text' as const, icon: PenTool, label: 'Text' },
                  { type: 'audio' as const, icon: Mic, label: 'Audio' },
                  { type: 'video' as const, icon: Video, label: 'Video' },
                ].map(({ type, icon: Icon, label }) => (
                  <button
                    key={type}
                    onClick={() => setResponseType(type)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      responseType === type
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Response area */}
            <div className="px-5 pb-5">
              {responseType === 'text' && (
                <div className="space-y-3">
                  <Textarea
                    placeholder="Share your thoughts, memories, and reflections..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    className="min-h-[120px] bg-background border-border rounded-lg resize-none text-sm"
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{response.trim().split(/\s+/).filter(Boolean).length} words</span>
                    <span className="flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Saved privately
                    </span>
                  </div>
                  <Button 
                    onClick={handleSubmit}
                    disabled={!response.trim() || isSubmitting}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-10"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Response'
                    )}
                  </Button>
                </div>
              )}

              {responseType === 'audio' && (
                <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-8 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mic className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-foreground font-medium text-sm mb-1">Record Your Story</p>
                  <p className="text-xs text-muted-foreground">Audio recording coming soon</p>
                </div>
              )}

              {responseType === 'video' && (
                <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-8 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                    <Video className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-foreground font-medium text-sm mb-1">Record Your Story</p>
                  <p className="text-xs text-muted-foreground">Video recording coming soon</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="px-5 py-12 text-center">
            <p className="text-muted-foreground">No questions available. Check back soon!</p>
          </div>
        )}
      </div>

      {/* Your Archive Card */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
              <Archive className="h-4 w-4 text-accent" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground text-sm">Your Archive</h2>
              <p className="text-xs text-muted-foreground">
                {entries.length === 0 ? 'No stories yet' : `${entries.length} ${entries.length === 1 ? 'story' : 'stories'} preserved`}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoadingArchive ? (
          <div className="px-5 py-12 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : entries.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-sm font-medium text-foreground mb-1">Start your journey</h3>
            <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">
              Answer your first weekly question to begin preserving your stories.
            </p>
          </div>
        ) : (
          <>
            {/* Search */}
            <div className="px-5 py-3 border-b border-border">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search stories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9 bg-background border-border rounded-lg text-sm"
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-9 w-9 rounded-lg"
                >
                  <Filter className="h-3.5 w-3.5" />
                </Button>
              </div>
              
              {showFilters && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all capitalize ${
                        selectedCategory === category
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Entries List */}
            <div className="p-3 space-y-2 max-h-[400px] overflow-y-auto">
              {filteredEntries.map((entry) => (
                <div 
                  key={entry.id} 
                  className="bg-background rounded-xl p-3 border border-border hover:border-primary/30 transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground flex-shrink-0">
                      {getMediaIcon(entry.content_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] text-muted-foreground">
                          {entry.created_at ? new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently'}
                        </span>
                        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] ${getPrivacyStyle(entry.privacy)}`}>
                          {getPrivacyIcon(entry.privacy)}
                          {getPrivacyLabel(entry.privacy)}
                        </span>
                      </div>
                      <h3 className="text-xs font-medium text-foreground line-clamp-1">
                        {entry.questions?.question || 'Reflection'}
                      </h3>
                      <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                        {entry.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredEntries.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-xs text-muted-foreground">No entries found</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
