import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import {
  Play, Pause, ArrowRight, Camera, X, ChevronDown,
  Mic, Video as VideoIcon, FileText, Image as ImageIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";

interface Response {
  id: string;
  content: string;
  content_type: string | null;
  privacy: string | null;
  created_at: string | null;
  question_id: string | null;
  audio_url?: string | null;
  video_url?: string | null;
  photo_url?: string | null;
  questions?: {
    question: string;
    category: string;
    depth: string | null;
  } | null;
}

const CATEGORY_COLORS: Record<string, string> = {
  childhood:   "bg-amber-100  text-amber-800",
  relationships:"bg-rose-100   text-rose-800",
  adversity:   "bg-slate-100  text-slate-700",
  beliefs:     "bg-violet-100 text-violet-800",
  purpose:     "bg-sky-100    text-sky-800",
  family:      "bg-orange-100 text-orange-800",
  humor:       "bg-lime-100   text-lime-800",
  legacy:      "bg-emerald-100 text-emerald-800",
  self:        "bg-indigo-100 text-indigo-800",
};

function categoryColor(cat?: string) {
  return cat ? (CATEGORY_COLORS[cat.toLowerCase()] ?? "bg-muted text-muted-foreground") : "bg-muted text-muted-foreground";
}

/* ─────────────────────────────────────────────────────────────── */
export default function ProfilePage() {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const navigate = useNavigate();

  const [entries, setEntries] = useState<Response[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<Response | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    supabase
      .from("responses")
      .select(`id, content, content_type, privacy, created_at, question_id,
               audio_url, video_url, photo_url,
               questions ( question, category, depth )`)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => { setEntries(data || []); setIsLoading(false); });
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setIsUploadingAvatar(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      await updateProfile({ avatar_url: `${publicUrl}?t=${Date.now()}` });
      toast.success("Profile picture updated");
    } catch { toast.error("Failed to upload photo"); }
    finally { setIsUploadingAvatar(false); }
  };

  const counts = {
    video: entries.filter(e => e.content_type === "video").length,
    voice: entries.filter(e => e.content_type === "audio").length,
    text:  entries.filter(e => !e.content_type || e.content_type === "text").length,
    photo: entries.filter(e => e.content_type === "photo").length,
  };

  const filtered = entries.filter(e => {
    if (selectedFilter === "all")   return true;
    if (selectedFilter === "video") return e.content_type === "video";
    if (selectedFilter === "voice") return e.content_type === "audio";
    if (selectedFilter === "text")  return !e.content_type || e.content_type === "text";
    if (selectedFilter === "photo") return e.content_type === "photo";
    return true;
  });

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "Your Legacy";
  const initials = displayName.charAt(0).toUpperCase();

  if (isLoading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/20 border-t-foreground/60 animate-spin" />
    </div>
  );

  /* ── FILTERS ── */
  const FILTERS = [
    { id: "all",   label: "All",   count: entries.length },
    { id: "text",  label: "Written", count: counts.text },
    { id: "voice", label: "Voice",   count: counts.voice },
    { id: "video", label: "Video",   count: counts.video },
    { id: "photo", label: "Photo",   count: counts.photo },
  ].filter(f => f.id === "all" || f.count > 0);

  /* ─── AVATAR ─── */
  const AvatarEl = (
    <div
      className="relative rounded-full bg-gradient-to-br from-[hsl(var(--matter-sage)/0.4)] to-[hsl(var(--matter-forest)/0.3)] flex items-center justify-center cursor-pointer group"
      style={{ width: "100%", height: "100%" }}
      onClick={() => fileInputRef.current?.click()}
    >
      {profile?.avatar_url
        ? <img src={profile.avatar_url} alt={displayName} className="w-full h-full rounded-full object-cover" />
        : <span className="font-serif text-foreground/60" style={{ fontSize: "clamp(1.5rem,4vw,3rem)" }}>{initials}</span>
      }
      <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
        <Camera className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      {isUploadingAvatar && (
        <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-white/30 border-t-white animate-spin" />
        </div>
      )}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
    </div>
  );

  /* ════════════════════════════════════════════════════════════════
     MOBILE LAYOUT
  ════════════════════════════════════════════════════════════════ */
  const MobileView = (
    <div className="md:hidden pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center pt-10 pb-6 px-5"
      >
        <div className="w-24 h-24 mb-4">{AvatarEl}</div>
        <h1 className="font-serif text-2xl text-foreground tracking-tight">{displayName}</h1>
        <p className="text-muted-foreground text-sm mt-1">A life told one question at a time.</p>

        {entries.length > 0 && (
          <div className="flex gap-5 mt-5">
            {[
              { label: "Moments", value: entries.length },
              counts.voice > 0  && { label: "Voice",   value: counts.voice },
              counts.video > 0  && { label: "Video",   value: counts.video },
              counts.text  > 0  && { label: "Written", value: counts.text },
            ].filter(Boolean).map((s: any) => (
              <div key={s.label} className="text-center">
                <p className="font-serif text-xl text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Filter pills — horizontal scroll */}
      {FILTERS.length > 1 && (
        <div className="flex gap-2 px-5 pb-5 overflow-x-auto scrollbar-hide">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all border ${
                selectedFilter === f.id
                  ? "bg-foreground text-background border-foreground"
                  : "bg-transparent text-muted-foreground border-border"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {entries.length === 0 && (
        <div className="text-center px-8 py-20">
          <h3 className="font-serif text-2xl text-foreground mb-3">Your story begins here</h3>
          <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
            Answer your first question to start preserving your legacy.
          </p>
          <Button onClick={() => navigate("/home")} className="rounded-full px-8 h-11">
            Begin <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Feed */}
      <div className="px-4 space-y-3">
        <AnimatePresence>
          {filtered.map((entry, i) => (
            <MobileFeedCard key={entry.id} entry={entry} index={i} onSelect={() => setSelectedEntry(entry)} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════════════════════════
     DESKTOP LAYOUT
  ════════════════════════════════════════════════════════════════ */
  const DesktopView = (
    <div className="hidden md:flex gap-8 pt-10 pb-20 max-w-6xl mx-auto px-6">

      {/* ── LEFT SIDEBAR ── */}
      <motion.aside
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-64 flex-shrink-0"
      >
        <div className="sticky top-24 space-y-6">
          {/* Avatar */}
          <div className="w-24 h-24">{AvatarEl}</div>

          {/* Name + tagline */}
          <div>
            <h1 className="font-serif text-2xl text-foreground tracking-tight leading-tight">{displayName}</h1>
            <p className="text-muted-foreground text-sm mt-1 leading-relaxed">A life told one question at a time.</p>
          </div>

          {/* Stats */}
          {entries.length > 0 && (
            <div className="space-y-3 border-t border-border pt-5">
              {[
                { label: "Total moments",  value: entries.length },
                { label: "Voice answers",  value: counts.voice },
                { label: "Video answers",  value: counts.video },
                { label: "Written answers",value: counts.text },
              ].filter(s => s.value > 0).map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{s.label}</span>
                  <span className="font-serif text-lg text-foreground">{s.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Filters */}
          {FILTERS.length > 1 && (
            <div className="space-y-1 border-t border-border pt-5">
              {FILTERS.map(f => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFilter(f.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                    selectedFilter === f.id
                      ? "bg-foreground/5 text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                  }`}
                >
                  <span>{f.label}</span>
                  <span className="text-xs opacity-50">{f.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.aside>

      {/* ── MAIN GRID ── */}
      <div className="flex-1 min-w-0">
        {entries.length === 0 ? (
          <div className="text-center py-32">
            <h3 className="font-serif text-3xl text-foreground mb-4">Your story begins here</h3>
            <p className="text-muted-foreground mb-10 max-w-md mx-auto leading-relaxed">
              Answer your first question to start preserving your legacy.
            </p>
            <Button onClick={() => navigate("/home")} size="lg" className="rounded-full px-8 h-12">
              Begin <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="columns-2 gap-5"
          >
            {filtered.map((entry, i) => (
              <DesktopCard key={entry.id} entry={entry} index={i} onSelect={() => setSelectedEntry(entry)} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {MobileView}
      {DesktopView}

      <AnimatePresence>
        {selectedEntry && (
          <EntryDetailSheet entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
        )}
      </AnimatePresence>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MOBILE FEED CARD
   Full-width card, content-type-aware design
═══════════════════════════════════════════════════════════════ */
function MobileFeedCard({ entry, index, onSelect }: { entry: Response; index: number; onSelect: () => void }) {
  const isText  = !entry.content_type || entry.content_type === "text";
  const isAudio = entry.content_type === "audio";
  const isVideo = entry.content_type === "video";
  const isPhoto = entry.content_type === "photo";
  const date    = entry.created_at ? format(new Date(entry.created_at), "MMM yyyy") : "";
  const cat     = entry.questions?.category;

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={onSelect}
      className="w-full text-left rounded-2xl overflow-hidden bg-card border border-border/50 active:scale-[0.98] transition-transform"
    >
      {/* Photo / Video hero image */}
      {(isPhoto && entry.photo_url) && (
        <img src={entry.photo_url} alt="" className="w-full h-48 object-cover" />
      )}
      {(isVideo && entry.video_url) && (
        <div className="relative w-full h-48 bg-black">
          <video src={entry.video_url} className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
              <Play className="w-5 h-5 text-foreground fill-foreground ml-0.5" />
            </div>
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Category + type */}
        <div className="flex items-center justify-between mb-2.5">
          {cat && (
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${categoryColor(cat)}`}>
              {cat}
            </span>
          )}
          <span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground/60">
            {isAudio && <><Mic className="w-3 h-3" /> Voice</>}
            {isVideo && <><VideoIcon className="w-3 h-3" /> Video</>}
            {isPhoto && <><ImageIcon className="w-3 h-3" /> Photo</>}
            {isText  && <><FileText className="w-3 h-3" /> Written</>}
          </span>
        </div>

        {/* Question */}
        <p className="font-serif text-[15px] text-foreground leading-snug mb-2 line-clamp-2">
          {entry.questions?.question || "A reflection"}
        </p>

        {/* Answer preview — text only */}
        {isText && entry.content && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {entry.content}
          </p>
        )}

        {/* Audio waveform preview */}
        {isAudio && (
          <div className="flex items-end gap-[2px] h-6 mt-1">
            {[0.3,0.5,0.7,0.4,1,0.8,0.6,0.9,0.5,0.7,0.4,0.8,0.6,0.5,0.3,0.6,0.8,0.5,0.7,0.4,0.6,0.8,0.4,0.7].map((h, i) => (
              <div key={i} className="flex-1 bg-foreground/15 rounded-full" style={{ height: `${h * 100}%` }} />
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-3">
          <span className="text-[11px] text-muted-foreground/50">{date}</span>
          <span className="text-[11px] text-muted-foreground/50">Tap to read →</span>
        </div>
      </div>
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DESKTOP MASONRY CARD
═══════════════════════════════════════════════════════════════ */
function DesktopCard({ entry, index, onSelect }: { entry: Response; index: number; onSelect: () => void }) {
  const isText  = !entry.content_type || entry.content_type === "text";
  const isAudio = entry.content_type === "audio";
  const isVideo = entry.content_type === "video";
  const isPhoto = entry.content_type === "photo";
  const date    = entry.created_at ? format(new Date(entry.created_at), "MMMM yyyy") : "";
  const cat     = entry.questions?.category;
  const TEXT_LIMIT = 200;
  const preview = isText && entry.content.length > TEXT_LIMIT
    ? entry.content.slice(0, TEXT_LIMIT).trimEnd() + "…"
    : entry.content;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      onClick={onSelect}
      className="bg-card rounded-2xl overflow-hidden break-inside-avoid mb-5 cursor-pointer hover:bg-secondary/20 transition-colors border border-border/40"
    >
      {/* Photo */}
      {isPhoto && entry.photo_url && (
        <img src={entry.photo_url} alt="" className="w-full object-cover max-h-64" />
      )}

      {/* Video */}
      {isVideo && entry.video_url && (
        <div className="relative aspect-video bg-black">
          <video src={entry.video_url} className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow">
              <Play className="w-5 h-5 text-foreground fill-foreground ml-0.5" />
            </div>
          </div>
        </div>
      )}

      <div className="p-5">
        {/* Category pill */}
        <div className="flex items-center justify-between mb-3">
          {cat && (
            <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full capitalize ${categoryColor(cat)}`}>
              {cat}
            </span>
          )}
          <span className="ml-auto text-[11px] text-muted-foreground/50">{date}</span>
        </div>

        {/* Question */}
        <p className="text-muted-foreground/50 text-xs mb-1">In response to</p>
        <h3 className="font-serif text-base text-foreground leading-snug mb-4">
          {entry.questions?.question || "A reflection"}
        </h3>

        {/* Content */}
        {isText && (
          <p className="text-[14px] text-muted-foreground leading-relaxed">{preview}</p>
        )}

        {isAudio && entry.audio_url && (
          <div className="bg-secondary/30 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
              <Play className="w-3.5 h-3.5 text-background fill-background ml-[1px]" />
            </div>
            <div className="flex-1 flex items-end gap-[2px] h-7">
              {[0.3,0.5,0.7,0.4,1,0.8,0.6,0.9,0.5,0.7,0.4,0.8,0.6,0.5,0.3,0.6,0.8,0.5].map((h, i) => (
                <div key={i} className="flex-1 bg-foreground/20 rounded-full" style={{ height: `${h * 100}%` }} />
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.article>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ENTRY DETAIL SHEET
   Bottom sheet on mobile, centered modal on desktop
═══════════════════════════════════════════════════════════════ */
function EntryDetailSheet({ entry, onClose }: { entry: Response; onClose: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const isText  = !entry.content_type || entry.content_type === "text";
  const isLong  = entry.content.length > 300;
  const displayContent = !expanded && isLong
    ? entry.content.slice(0, 300).trimEnd() + "…"
    : entry.content;
  const date = entry.created_at ? format(new Date(entry.created_at), "EEEE, MMMM d, yyyy") : "Recently";
  const cat  = entry.questions?.category;

  const togglePlay = () => {
    if (entry.content_type === "video" && videoRef.current) {
      isPlaying ? videoRef.current.pause() : videoRef.current.play();
    }
    if (entry.content_type === "audio" && audioRef.current) {
      isPlaying ? audioRef.current.pause() : audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
      />

      {/* Sheet — slides up on mobile, centered on desktop */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-50 max-h-[92vh] bg-card rounded-t-3xl border-t border-border overflow-y-auto
                   md:inset-x-auto md:left-1/2 md:bottom-auto md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2
                   md:w-[560px] md:max-h-[85vh] md:rounded-3xl md:border md:shadow-2xl"
        style={{ boxShadow: "0 -10px 60px rgba(0,0,0,0.12)" }}
      >
        {/* Handle + close */}
        <div className="sticky top-0 bg-card/95 backdrop-blur-sm z-10 pt-3 pb-2 px-5">
          <div className="w-10 h-1 bg-muted-foreground/20 rounded-full mx-auto mb-4 md:hidden" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {cat && (
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${categoryColor(cat)}`}>
                  {cat}
                </span>
              )}
              <span className="text-xs text-muted-foreground">{date}</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-5 pb-10">
          {/* Photo */}
          {entry.photo_url && (
            <div className="mb-6 -mx-5">
              <img src={entry.photo_url} alt="" className="w-full max-h-[50vh] object-cover" />
            </div>
          )}

          {/* Video */}
          {entry.content_type === "video" && entry.video_url && (
            <div className="mb-6 -mx-5 relative aspect-video bg-black cursor-pointer" onClick={togglePlay}>
              <video ref={videoRef} src={entry.video_url} className="w-full h-full object-contain" playsInline
                onEnded={() => setIsPlaying(false)} />
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                    <Play className="w-6 h-6 text-foreground fill-foreground ml-0.5" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Question */}
          <h2 className="text-xl md:text-2xl font-serif text-foreground mb-5 leading-snug">
            {entry.questions?.question || "A reflection"}
          </h2>

          {/* Audio */}
          {entry.content_type === "audio" && entry.audio_url && (
            <div className="mb-6 bg-secondary/30 rounded-2xl p-5 cursor-pointer" onClick={togglePlay}>
              <audio ref={audioRef} src={entry.audio_url} onEnded={() => setIsPlaying(false)} className="hidden" />
              <div className="flex items-center gap-4">
                <button className="w-12 h-12 rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
                  {isPlaying
                    ? <div className="w-3.5 h-3.5 bg-background rounded-sm" />
                    : <Play className="w-5 h-5 text-background fill-background ml-0.5" />
                  }
                </button>
                <div className="flex-1 flex items-end gap-[2px] h-10">
                  {[0.3,0.5,0.7,0.4,1,0.8,0.6,0.9,0.5,0.7,0.4,0.8,0.6,0.5,0.3,0.6,0.8,0.5,0.7,0.4].map((h, i) => (
                    <div key={i} className={`flex-1 rounded-full transition-all ${isPlaying ? "bg-foreground/50" : "bg-foreground/20"}`}
                      style={{ height: `${h * 100}%` }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Text answer */}
          {isText && (
            <>
              <p className="text-[15px] md:text-base text-foreground leading-relaxed whitespace-pre-wrap">
                {displayContent}
              </p>
              {isLong && !expanded && (
                <button onClick={() => setExpanded(true)}
                  className="mt-3 flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Read more <ChevronDown className="w-3.5 h-3.5" />
                </button>
              )}
              {isLong && expanded && (
                <button onClick={() => setExpanded(false)}
                  className="mt-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Show less
                </button>
              )}
            </>
          )}
        </div>
      </motion.div>
    </>
  );
}
