import React, { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
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
  },
  {
    id: "e_116",
    title: "My relationship with work",
    date: "2025-08-07",
    category: "Work",
    privacy: "Private",
    mediaType: "text",
    thumbnail: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=400&h=400&fit=crop",
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
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden ring-4 ring-border">
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
                <Button variant="secondary" className="flex-1 md:flex-none">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit profile
                </Button>
                <Button variant="secondary" className="flex-1 md:flex-none">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>

          {/* AI Twin Progress Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 p-4 rounded-xl bg-secondary/50 border border-border"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mic className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">AI Twin</p>
                  <p className="text-xs text-muted-foreground">Voice cloned • Building personality model</p>
                </div>
              </div>
              <span className="text-sm font-medium text-primary">{MOCK_PROFILE.aiTwinProgress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${MOCK_PROFILE.aiTwinProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-primary rounded-full"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Continue answering weekly questions to strengthen your AI Twin's understanding.
            </p>
          </motion.div>

          {/* Circles (like Instagram Stories) */}
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

      {/* Archive Section */}
      <div className="max-w-4xl mx-auto px-4 py-6">
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
        <div className="flex justify-center border-t border-border">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 text-xs font-medium uppercase tracking-wider border-t-2 -mt-px transition-colors ${
                  isActive 
                    ? "border-foreground text-foreground" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <Archive className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No entries found</p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-3 gap-1 mt-1"
          >
            {filtered.map((entry, i) => (
              <EntryTile key={entry.id} entry={entry} index={i} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function EntryTile({ entry, index }: { entry: any; index: number }) {
  const mediaIcons = {
    video: Video,
    audio: Mic,
    text: FileText,
  };
  const MediaIcon = mediaIcons[entry.mediaType as keyof typeof mediaIcons];

  const privacyColors = {
    Private: "bg-secondary text-foreground",
    Share: "bg-blue-500/80 text-white",
    Legacy: "bg-amber-500/80 text-white",
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      className="relative aspect-square overflow-hidden bg-muted group"
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

      {/* Duration badge for video/audio */}
      {entry.duration && (
        <div className="absolute bottom-2 right-2 text-xs text-white bg-foreground/60 px-1.5 py-0.5 rounded">
          {entry.duration}
        </div>
      )}

      {/* Privacy indicator */}
      {entry.privacy === "Legacy" && (
        <div className="absolute top-2 left-2">
          <Badge className={`text-[10px] px-1.5 py-0.5 ${privacyColors[entry.privacy as keyof typeof privacyColors]}`}>
            <Archive className="w-3 h-3 mr-0.5" />
            Legacy
          </Badge>
        </div>
      )}
    </motion.button>
  );
}
