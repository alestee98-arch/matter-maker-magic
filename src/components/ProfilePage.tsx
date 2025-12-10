import React, { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Share,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";

const MOCK_PROFILE = {
  id: "user_001",
  name: "Alex Martinez",
  handle: "@alexmartinez",
  avatar: "https://i.pravatar.cc/160?img=13",
  bio: "Building MATTER — preserving essence through time. Lover of wellness, AI, and good questions.",
  stats: {
    answers: 87,
    streakWeeks: 12,
    categories: 9
  },
  privacyDefault: "Private",
  legacyExecutor: "Maria Martinez",
  voiceCloned: true,
  aiTwinProgress: 78,
};

const MOCK_PROMPTS = [
  {
    id: "p_203",
    depth: "Light",
    text: "What's a song that instantly lifts your mood?",
  },
  {
    id: "p_204",
    depth: "Medium", 
    text: "Tell about a small decision that changed your trajectory more than you imagined.",
  },
  {
    id: "p_205",
    depth: "Deep",
    text: "What would you tell your 17-year-old self about love and failure?",
  },
];

const MOCK_CIRCLES = [
  { id: "c1", name: "Family", avatar: "https://i.pravatar.cc/80?img=3", count: 5 },
  { id: "c2", name: "Close Friends", avatar: "https://i.pravatar.cc/80?img=8", count: 8 },
];

const MOCK_ENTRIES = [
  {
    id: "e_118",
    title: "Learning to fail well",
    date: "2025-08-21",
    category: "Lessons",
    privacy: "Private",
    mediaType: "video",
    thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
    duration: "02:34",
    transcriptSnippet: "Failing didn't break me; it taught me to listen more…",
  },
  {
    id: "e_117",
    title: "What family means to me",
    date: "2025-08-14",
    category: "Family",
    privacy: "Share",
    mediaType: "audio",
    thumbnail: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=400&fit=crop",
    duration: "03:18",
    transcriptSnippet: "Sunday dinner table was the first classroom…",
  },
  {
    id: "e_116",
    title: "My relationship with work",
    date: "2025-08-07",
    category: "Work",
    privacy: "Private",
    mediaType: "text",
    thumbnail: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=400&h=400&fit=crop",
    transcriptSnippet: "Ambition without rest stays empty…",
  },
  {
    id: "e_115",
    title: "A small (and daily) joy",
    date: "2025-07-31",
    category: "Joy",
    privacy: "Legacy",
    mediaType: "audio",
    thumbnail: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop",
    duration: "01:11",
    transcriptSnippet: "The first sip of coffee, before the world finds me…",
  },
  {
    id: "e_114",
    title: "Childhood memories",
    date: "2025-07-24",
    category: "Family",
    privacy: "Legacy",
    mediaType: "video",
    thumbnail: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=400&h=400&fit=crop",
    duration: "04:22",
    transcriptSnippet: "The backyard felt infinite when I was seven…",
  },
  {
    id: "e_113",
    title: "What scares me most",
    date: "2025-07-17",
    category: "Fear",
    privacy: "Private",
    mediaType: "audio",
    thumbnail: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=400&h=400&fit=crop",
    duration: "02:45",
    transcriptSnippet: "Not being remembered for who I really was…",
  },
];

const TABS = [
  { id: "grid", icon: Grid3X3, label: "All" },
  { id: "saved", icon: Bookmark, label: "Saved" },
  { id: "legacy", icon: Archive, label: "Legacy" },
];

export default function ProfilePage() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("grid");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    return MOCK_ENTRIES.filter((e) => {
      const q = query.trim().toLowerCase();
      if (activeTab === "legacy" && e.privacy !== "Legacy") return false;
      if (!q) return true;
      return e.title.toLowerCase().includes(q) || e.category.toLowerCase().includes(q);
    });
  }, [query, activeTab]);

  return (
    <div className="min-h-screen bg-background">
      {/* Profile Header */}
      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Top Section - Avatar + Info */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative"
            >
              <div className="w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden ring-4 ring-border">
                <img
                  src={MOCK_PROFILE.avatar}
                  alt={MOCK_PROFILE.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* AI Twin Indicator */}
              {MOCK_PROFILE.voiceCloned && (
                <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-2">
                  <Mic className="w-4 h-4" />
                </div>
              )}
            </motion.div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-3">
                <h1 className="text-2xl font-normal font-sans tracking-tight">{MOCK_PROFILE.name}</h1>
                <span className="text-muted-foreground">{MOCK_PROFILE.handle}</span>
              </div>

              {/* Stats Row */}
              <div className="flex justify-center md:justify-start gap-8 mb-4">
                <div className="text-center md:text-left">
                  <span className="font-semibold">{MOCK_PROFILE.stats.answers}</span>
                  <span className="text-muted-foreground ml-1">entries</span>
                </div>
                <div className="text-center md:text-left">
                  <span className="font-semibold">{MOCK_PROFILE.stats.streakWeeks}</span>
                  <span className="text-muted-foreground ml-1">week streak</span>
                </div>
                <div className="text-center md:text-left">
                  <span className="font-semibold">{MOCK_PROFILE.stats.categories}</span>
                  <span className="text-muted-foreground ml-1">topics</span>
                </div>
              </div>

              {/* Bio */}
              <p className="text-foreground max-w-md mb-4">{MOCK_PROFILE.bio}</p>

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <Button variant="secondary" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit profile
                </Button>
                <Button variant="secondary" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>

          {/* Circles Row */}
          <div className="mt-6 flex items-center gap-4 overflow-x-auto pb-2">
            {MOCK_CIRCLES.map((circle) => (
              <motion.button
                key={circle.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center gap-1 min-w-[72px]"
              >
                <div className="w-16 h-16 rounded-full ring-2 ring-border overflow-hidden">
                  <img src={circle.avatar} alt={circle.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-xs text-muted-foreground truncate max-w-[72px]">{circle.name}</span>
              </motion.button>
            ))}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-1 min-w-[72px]"
            >
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                <Plus className="w-6 h-6 text-muted-foreground" />
              </div>
              <span className="text-xs text-muted-foreground">New</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* AI Twin + Weekly Question Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* AI Twin Progress */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mic className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">AI Twin</p>
                    <p className="text-sm text-muted-foreground">
                      {MOCK_PROFILE.voiceCloned ? "Voice cloned" : "Voice not cloned"} • Building personality
                    </p>
                  </div>
                  <span className="text-lg font-semibold text-primary">{MOCK_PROFILE.aiTwinProgress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${MOCK_PROFILE.aiTwinProgress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Continue answering weekly questions to strengthen your AI Twin.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Legacy Status */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="h-full">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Legacy executor</span>
                  <span className="font-medium">{MOCK_PROFILE.legacyExecutor}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge className="bg-emerald-500/20 text-emerald-600">Encrypted & backed up</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Export</span>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Weekly Question */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-sans font-semibold">This week's question</CardTitle>
              <p className="text-sm text-muted-foreground">Choose one and respond with text, audio, or video.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {MOCK_PROMPTS.map((prompt, i) => (
                <motion.button
                  key={prompt.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.05 }}
                  className="w-full flex items-start gap-3 p-4 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors text-left group"
                >
                  <DepthBadge depth={prompt.depth} />
                  <span className="flex-1 text-sm leading-relaxed">{prompt.text}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
                </motion.button>
              ))}
              <div className="flex gap-2 pt-2">
                <Button className="flex-1">Answer now</Button>
                <Button variant="outline">Schedule</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Archive Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold font-sans">Your Archive</h2>
            <div className="flex gap-2">
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
                <FileText className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your archive..."
              className="pl-10"
            />
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border mb-4">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
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
            <div className="py-16 text-center text-muted-foreground">
              <Archive className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No entries found</p>
            </div>
          ) : viewMode === "grid" ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-3 gap-1"
            >
              {filtered.map((entry, i) => (
                <EntryTile key={entry.id} entry={entry} index={i} />
              ))}
            </motion.div>
          ) : (
            <div className="space-y-3">
              {filtered.map((entry, i) => (
                <EntryListItem key={entry.id} entry={entry} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DepthBadge({ depth }: { depth: string }) {
  const colors = {
    Light: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    Medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    Deep: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  };

  return (
    <Badge variant="outline" className={`text-xs ${colors[depth as keyof typeof colors] || ""}`}>
      {depth}
    </Badge>
  );
}

function EntryTile({ entry, index }: { entry: any; index: number }) {
  const mediaIcons = {
    video: Video,
    audio: Mic,
    text: FileText,
  };
  const MediaIcon = mediaIcons[entry.mediaType as keyof typeof mediaIcons];

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ scale: 1.02 }}
      className="relative aspect-square overflow-hidden bg-muted group rounded-sm"
    >
      <img
        src={entry.thumbnail}
        alt={entry.title}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      
      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="text-center text-background px-2">
          <p className="text-sm font-medium line-clamp-2">{entry.title}</p>
          <p className="text-xs opacity-80 mt-1">{entry.category}</p>
        </div>
      </div>

      {/* Media type indicator */}
      <div className="absolute top-2 right-2">
        <MediaIcon className="w-4 h-4 text-white drop-shadow-lg" />
      </div>

      {/* Duration badge */}
      {entry.duration && (
        <div className="absolute bottom-2 right-2 text-xs text-white bg-foreground/60 px-1.5 py-0.5 rounded">
          {entry.duration}
        </div>
      )}

      {/* Legacy indicator */}
      {entry.privacy === "Legacy" && (
        <div className="absolute top-2 left-2">
          <Badge className="text-[10px] px-1.5 py-0.5 bg-amber-500/80 text-white">
            <Archive className="w-3 h-3 mr-0.5" />
          </Badge>
        </div>
      )}
    </motion.button>
  );
}

function EntryListItem({ entry, index }: { entry: any; index: number }) {
  const mediaIcons = {
    video: Video,
    audio: Mic,
    text: FileText,
  };
  const MediaIcon = mediaIcons[entry.mediaType as keyof typeof mediaIcons];

  const privacyColors = {
    Private: "bg-secondary text-foreground",
    Share: "bg-blue-500/20 text-blue-600",
    Legacy: "bg-amber-500/20 text-amber-600",
  };

  const PrivacyIcon = {
    Private: Lock,
    Share: Share,
    Legacy: Archive,
  };
  const PIcon = PrivacyIcon[entry.privacy as keyof typeof PrivacyIcon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="flex gap-4 p-4 rounded-xl border border-border bg-card hover:bg-secondary/30 transition-colors cursor-pointer group"
    >
      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
        <img src={entry.thumbnail} alt={entry.title} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-medium truncate">{entry.title}</h3>
            <p className="text-sm text-muted-foreground">
              {new Date(entry.date).toLocaleDateString()} · {entry.category}
            </p>
          </div>
          <Badge className={`flex-shrink-0 ${privacyColors[entry.privacy as keyof typeof privacyColors]}`}>
            <PIcon className="w-3 h-3 mr-1" />
            {entry.privacy}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-2 line-clamp-1">{entry.transcriptSnippet}</p>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className="text-xs">
            <MediaIcon className="w-3 h-3 mr-1" />
            {entry.mediaType}
            {entry.duration && ` · ${entry.duration}`}
          </Badge>
        </div>
      </div>
    </motion.div>
  );
}
