import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Settings,
  ChevronRight,
  Mic,
  FileText,
  Video,
  Play,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";

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

interface Question {
  id: string;
  question: string;
  category: string;
  depth: string | null;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  
  const [entries, setEntries] = useState<Response[]>([]);
  const [weeklyQuestions, setWeeklyQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ entries: 0, streak: 0, topics: 0 });

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
            questions (
              question,
              category,
              depth
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(6);
        
        setEntries(responsesData || []);
        
        const { count } = await supabase
          .from('responses')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        const uniqueCategories = new Set<string>();
        responsesData?.forEach(entry => {
          if (entry.questions?.category) {
            uniqueCategories.add(entry.questions.category);
          }
        });
        
        setStats({
          entries: count || 0,
          streak: 0,
          topics: uniqueCategories.size
        });
        
        const answeredIds = responsesData?.map(r => r.question_id).filter(Boolean) || [];
        
        const { data: questionsData } = await supabase
          .from('questions')
          .select('*')
          .limit(10);
        
        if (questionsData) {
          const unanswered = questionsData.filter(q => !answeredIds.includes(q.id));
          const selected: Question[] = [];
          const depths = ['surface', 'medium', 'deep'];
          
          for (const depth of depths) {
            const q = unanswered.find(q => q.depth === depth) || questionsData.find(q => q.depth === depth);
            if (q && !selected.find(s => s.id === q.id)) {
              selected.push(q);
            }
          }
          
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

  if (profileLoading || isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-muted-foreground/20 border-t-foreground animate-spin" />
      </div>
    );
  }

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'New User';
  const avatarUrl = profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`;
  const bio = profile?.bio || "Start answering questions to build your legacy.";
  const aiProgress = Math.min(stats.entries * 2, 100);

  return (
    <div className="min-h-[calc(100vh-8rem)] max-w-3xl mx-auto">
      {/* Profile Header */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="relative inline-block mb-6">
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-28 h-28 rounded-full object-cover ring-4 ring-background shadow-lg"
          />
          {stats.entries > 0 && (
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-foreground flex items-center justify-center shadow-md">
              <Mic className="w-4 h-4 text-background" />
            </div>
          )}
        </div>
        
        <h1 className="text-2xl font-serif text-foreground mb-1">{displayName}</h1>
        <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">{bio}</p>
        
        {/* Stats */}
        <div className="flex justify-center gap-10 mb-6">
          <div className="text-center">
            <p className="text-2xl font-semibold text-foreground">{stats.entries}</p>
            <p className="text-xs text-muted-foreground">Reflections</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-foreground">{stats.streak}</p>
            <p className="text-xs text-muted-foreground">Week Streak</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-foreground">{stats.topics}</p>
            <p className="text-xs text-muted-foreground">Topics</p>
          </div>
        </div>
        
        <Button variant="outline" size="sm" className="rounded-full">
          <Settings className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </motion.section>

      {/* AI Twin Progress */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-3xl p-6 border border-border mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-medium text-foreground">AI Twin</h2>
            <p className="text-sm text-muted-foreground">Building your digital presence</p>
          </div>
          <span className="text-2xl font-semibold text-foreground">{aiProgress}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${aiProgress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-foreground rounded-full"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          {stats.entries === 0 
            ? "Answer your first question to start building your AI Twin."
            : `${50 - stats.entries > 0 ? `${50 - stats.entries} more reflections` : 'Keep going'} to strengthen your AI Twin.`}
        </p>
      </motion.section>

      {/* Weekly Questions */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-10"
      >
        <h2 className="text-lg font-serif text-foreground mb-4">This week's questions</h2>
        <div className="space-y-3">
          {weeklyQuestions.map((question, i) => (
            <button
              key={question.id}
              className="w-full flex items-center justify-between p-4 bg-card rounded-2xl border border-border hover:border-foreground/20 transition-all duration-200 text-left group hover-lift"
            >
              <div className="flex items-center gap-4">
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-medium ${
                  question.depth === 'surface' ? 'bg-matter-sage/10 text-matter-sage' :
                  question.depth === 'medium' ? 'bg-matter-gold/10 text-matter-gold' :
                  'bg-matter-coral/10 text-matter-coral'
                }`}>
                  {question.depth === 'surface' ? 'L' : question.depth === 'medium' ? 'M' : 'D'}
                </span>
                <span className="text-sm text-foreground leading-relaxed">{question.question}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </motion.section>

      {/* Recent Reflections */}
      {entries.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-serif text-foreground">Recent reflections</h2>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              View all
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {entries.slice(0, 6).map((entry, i) => (
              <motion.button
                key={entry.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="aspect-square rounded-2xl overflow-hidden bg-card border border-border hover:border-foreground/20 transition-all group relative"
              >
                {entry.content_type === 'video' && (
                  <div className="w-full h-full bg-gradient-to-br from-matter-coral/10 to-matter-coral/5 flex items-center justify-center">
                    <Play className="w-8 h-8 text-matter-coral fill-matter-coral" />
                  </div>
                )}
                
                {entry.content_type === 'audio' && (
                  <div className="w-full h-full bg-gradient-to-br from-accent/10 to-accent/5 flex flex-col items-center justify-center p-4">
                    <div className="flex items-end gap-0.5 h-8 mb-2">
                      {[0.4, 0.7, 0.5, 1, 0.6, 0.8, 0.4].map((h, i) => (
                        <div key={i} className="w-1 bg-accent rounded-full" style={{ height: `${h * 100}%` }} />
                      ))}
                    </div>
                    <Mic className="w-4 h-4 text-accent" />
                  </div>
                )}
                
                {(!entry.content_type || entry.content_type === 'text') && (
                  <div className="w-full h-full p-4 flex flex-col">
                    <p className="text-xs leading-relaxed text-muted-foreground line-clamp-5 flex-1">
                      {entry.content}
                    </p>
                    <FileText className="w-4 h-4 text-muted-foreground/50 mt-2" />
                  </div>
                )}
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-foreground/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3">
                  <p className="text-xs text-background text-center line-clamp-4">
                    {entry.questions?.question || 'Reflection'}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
}
