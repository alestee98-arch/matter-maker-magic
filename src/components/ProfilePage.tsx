import React, { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, 
  Play, 
  Edit, 
  Lock, 
  Users, 
  Archive,
  Grid3X3,
  Bookmark,
  Settings,
  Plus,
  Mic,
  Video,
  FileText,
  Download,
  ChevronRight,
  Sprout,
  Clock,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";

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
    depth: string | null;
  } | null;
}

const TABS = [
  { id: "grid", icon: Grid3X3, label: "All" },
  { id: "saved", icon: Bookmark, label: "Saved" },
  { id: "legacy", icon: Archive, label: "Legacy" },
];

export default function ProfilePage() {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("grid");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Data state
  const [entries, setEntries] = useState<Response[]>([]);
  const [weeklyQuestions, setWeeklyQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ entries: 0, streak: 0, topics: 0 });

  // Fetch user data
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Fetch responses
        const { data: responsesData } = await supabase
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
        
        setEntries(responsesData || []);
        
        // Calculate stats
        const uniqueCategories = new Set<string>();
        responsesData?.forEach(entry => {
          if (entry.questions?.category) {
            uniqueCategories.add(entry.questions.category);
          }
        });
        
        setStats({
          entries: responsesData?.length || 0,
          streak: 0, // TODO: Calculate actual streak
          topics: uniqueCategories.size
        });
        
        // Fetch unanswered questions for weekly prompts
        const answeredIds = responsesData?.map(r => r.question_id).filter(Boolean) || [];
        
        const { data: questionsData } = await supabase
          .from('questions')
          .select('*')
          .limit(10);
        
        if (questionsData) {
          const unanswered = questionsData.filter(q => !answeredIds.includes(q.id));
          // Get 3 questions with different depths if possible
          const selected: Question[] = [];
          const depths = ['surface', 'medium', 'deep'];
          
          for (const depth of depths) {
            const q = unanswered.find(q => q.depth === depth) || questionsData.find(q => q.depth === depth);
            if (q && !selected.find(s => s.id === q.id)) {
              selected.push(q);
            }
          }
          
          // Fill remaining slots
          while (selected.length < 3 && questionsData.length > selected.length) {
            const q = questionsData.find(q => !selected.find(s => s.id === q.id));
            if (q) selected.push(q);
          }
          
          setWeeklyQuestions(selected);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      const q = query.trim().toLowerCase();
      if (activeTab === "legacy" && e.privacy !== "legacy") return false;
      if (!q) return true;
      const question = e.questions?.question || '';
      return question.toLowerCase().includes(q) || e.content.toLowerCase().includes(q);
    });
  }, [query, activeTab, entries]);

  // Loading state
  if (profileLoading || isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Derive display values
  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'New User';
  const handle = `@${displayName.toLowerCase().replace(/\s+/g, '')}`;
  const avatarUrl = profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`;
  const bio = profile?.bio || "Start answering questions to build your legacy.";
  const legacyStatus = profile?.legacy_status || 'active';

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

  const getMediaIcon = (mediaType: string | null) => {
    switch (mediaType) {
      case 'text': return <FileText className="h-4 w-4" />;
      case 'audio': return <Mic className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
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

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
          >
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden ring-4 ring-border">
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            </div>
            {stats.entries > 0 && (
              <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1.5">
                <Mic className="w-3.5 h-3.5" />
              </div>
            )}
          </motion.div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 mb-2">
              <h1 className="text-xl font-semibold">{displayName}</h1>
              <span className="text-sm text-muted-foreground">{handle}</span>
            </div>

            {/* Stats */}
            <div className="flex justify-center md:justify-start gap-6 mb-3">
              <div className="text-center md:text-left">
                <span className="font-semibold">{stats.entries}</span>
                <span className="text-muted-foreground text-sm ml-1">entries</span>
              </div>
              <div className="text-center md:text-left">
                <span className="font-semibold">{stats.streak}</span>
                <span className="text-muted-foreground text-sm ml-1">week streak</span>
              </div>
              <div className="text-center md:text-left">
                <span className="font-semibold">{stats.topics}</span>
                <span className="text-muted-foreground text-sm ml-1">topics</span>
              </div>
            </div>

            {/* Bio */}
            <p className="text-sm text-foreground max-w-md mb-3">{bio}</p>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <Button variant="secondary" size="sm">
                <Edit className="w-3.5 h-3.5 mr-1.5" />
                Edit profile
              </Button>
              <Button variant="secondary" size="sm">
                <Settings className="w-3.5 h-3.5 mr-1.5" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Circles */}
        <div className="mt-5 pt-5 border-t border-border">
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Circles</span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-1 min-w-[56px]"
            >
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                <Plus className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="text-[10px] text-muted-foreground">New</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* AI Twin + Legacy Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* AI Twin Progress */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <Mic className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">AI Twin</p>
                <p className="text-xs text-muted-foreground">Building your digital presence</p>
              </div>
              <span className="text-base font-semibold text-primary">{Math.min(stats.entries * 2, 100)}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${Math.min(stats.entries * 2, 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              {stats.entries === 0 
                ? "Start answering questions to build your AI Twin."
                : "Continue answering to strengthen your AI Twin."}
            </p>
          </CardContent>
        </Card>

        {/* Legacy Status */}
        <Card>
          <CardContent className="pt-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Legacy executor</span>
              <span className="text-sm text-muted-foreground">Not set</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Status</span>
              <Badge className="bg-[#4a8f6a]/20 text-[#4a8f6a] text-xs">
                {legacyStatus === 'active' ? 'Active' : legacyStatus}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Export</span>
              <Button variant="outline" size="sm" className="h-7 text-xs">
                <Download className="w-3 h-3 mr-1" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Question */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">This week's question</CardTitle>
          <p className="text-xs text-muted-foreground">Choose one and respond with text, audio, or video.</p>
        </CardHeader>
        <CardContent className="space-y-2">
          {weeklyQuestions.map((prompt, i) => (
            <motion.button
              key={prompt.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="w-full flex items-start gap-2.5 p-3 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-left group"
            >
              <Badge variant="outline" className={`text-[10px] shrink-0 ${getDepthStyle(prompt.depth)}`}>
                {getDepthLabel(prompt.depth)}
              </Badge>
              <span className="flex-1 text-sm leading-relaxed">{prompt.question}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
            </motion.button>
          ))}
          <div className="flex gap-2 pt-1">
            <Button className="flex-1 h-9">Answer now</Button>
            <Button variant="outline" className="h-9">Schedule</Button>
          </div>
        </CardContent>
      </Card>

      {/* Archive Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">Your Archive</h2>
          <div className="flex gap-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setViewMode("list")}
            >
              <FileText className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your archive..."
            className="pl-10 h-9"
          />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border mb-3">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  isActive 
                    ? "border-primary text-foreground" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Archive className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
            <p className="font-medium text-foreground text-sm mb-1">Your archive is empty</p>
            <p className="text-xs text-muted-foreground">Answer your first question to start building your legacy.</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-3 gap-1">
            {filtered.map((entry, i) => (
              <EntryTile key={entry.id} entry={entry} index={i} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((entry, i) => (
              <EntryListItem key={entry.id} entry={entry} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EntryTile({ entry, index }: { entry: Response; index: number }) {
  const isVideo = entry.content_type === "video";
  const isAudio = entry.content_type === "audio";
  const isText = entry.content_type === "text" || !entry.content_type;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.02 }}
      className="relative aspect-square overflow-hidden bg-muted group rounded-sm"
    >
      {/* AUDIO: Waveform visualization */}
      {isAudio && (
        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex flex-col items-center justify-center p-3">
          <div className="flex items-end justify-center gap-[2px] h-8 mb-2">
            {[0.4, 0.7, 0.5, 1, 0.6, 0.8, 0.4, 0.9, 0.5].map((h, i) => (
              <div
                key={i}
                className="w-1 bg-primary rounded-full"
                style={{ height: `${h * 100}%` }}
              />
            ))}
          </div>
          <Mic className="w-3 h-3 text-primary" />
        </div>
      )}

      {/* VIDEO: placeholder */}
      {isVideo && (
        <div className="w-full h-full bg-gradient-to-br from-matter-coral/20 to-matter-coral/5 flex flex-col items-center justify-center">
          <Play className="w-6 h-6 text-matter-coral fill-matter-coral" />
        </div>
      )}

      {/* TEXT: Text preview */}
      {isText && (
        <div className="w-full h-full bg-card p-2 flex flex-col">
          <p className="text-[9px] leading-relaxed text-foreground/80 line-clamp-5 flex-1">
            {entry.content}
          </p>
          <FileText className="w-3 h-3 text-muted-foreground mt-1" />
        </div>
      )}
      
      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-foreground/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="text-center text-background px-2">
          <p className="text-[10px] font-medium line-clamp-2">{entry.questions?.question || 'Reflection'}</p>
        </div>
      </div>

      {/* Legacy indicator */}
      {entry.privacy === "legacy" && (
        <div className="absolute top-1 left-1 z-10">
          <Badge className="text-[8px] px-1 py-0 bg-[#b5a48b] text-white">
            <Archive className="w-2 h-2" />
          </Badge>
        </div>
      )}
    </motion.button>
  );
}

function EntryListItem({ entry, index }: { entry: Response; index: number }) {
  const getMediaIcon = (mediaType: string | null) => {
    switch (mediaType) {
      case 'audio': return <Mic className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      className="flex items-start gap-3 p-3 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
    >
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
        {getMediaIcon(entry.content_type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground line-clamp-1">
          {entry.questions?.question || 'Reflection'}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
          {entry.content}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-muted-foreground">
            {entry.created_at ? new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently'}
          </span>
          {entry.privacy === 'legacy' && (
            <Badge className="text-[8px] px-1 py-0 bg-[#b5a48b]/20 text-[#b5a48b]">Legacy</Badge>
          )}
        </div>
      </div>
    </motion.div>
  );
}
