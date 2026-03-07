import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Play, Pause, ArrowRight, Camera, X, ChevronDown, ChevronRight, FileText } from "lucide-react";
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
  transcript?: string | null;
  questions?: {
    question: string;
    category: string;
    depth: string | null;
  } | null;
}

/* Category accent colors — subtle pills */
const CAT_COLORS: Record<string, string> = {
  childhood:    "bg-amber-100/80  text-amber-700",
  relationships:"bg-rose-100/80   text-rose-700",
  adversity:    "bg-slate-100/80  text-slate-600",
  beliefs:      "bg-violet-100/80 text-violet-700",
  purpose:      "bg-sky-100/80    text-sky-700",
  family:       "bg-orange-100/80 text-orange-700",
  humor:        "bg-lime-100/80   text-lime-700",
  legacy:       "bg-emerald-100/80 text-emerald-700",
  self:         "bg-indigo-100/80 text-indigo-700",
};
const catColor = (cat?: string) =>
  cat ? (CAT_COLORS[cat.toLowerCase()] ?? "bg-muted/60 text-muted-foreground") : "";

/* ─────────────────────────────────────────────────────────────── */
export default function ProfilePage() {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const navigate = useNavigate();

  const [entries, setEntries]               = useState<Response[]>([]);
  const [isLoading, setIsLoading]           = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [selectedEntry, setSelectedEntry]   = useState<Response | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    supabase
      .from("responses")
      .select(`id, content, content_type, privacy, created_at, question_id,
               audio_url, video_url, photo_url, transcript,
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
      const ext  = file.name.split(".").pop();
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

  const FILTERS = [
    { id: "all",   label: "All" },
    counts.text  > 0 && { id: "text",  label: "Written" },
    counts.voice > 0 && { id: "voice", label: "Voice"   },
    counts.video > 0 && { id: "video", label: "Video"   },
    counts.photo > 0 && { id: "photo", label: "Photos"  },
  ].filter(Boolean) as { id: string; label: string }[];

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "Your Legacy";
  const initials    = displayName.charAt(0).toUpperCase();

  if (isLoading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/20 border-t-foreground/60 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-8rem)] pb-20">

      {/* ── PROFILE HEADER ── */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        className="pt-10 pb-10 md:pt-16 md:pb-16"
      >
        <div className="max-w-2xl mx-auto px-6 text-center">

          {/* Avatar */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-5"
          >
            <div
              className="relative w-24 h-24 md:w-32 md:h-32 mx-auto rounded-full bg-gradient-to-br from-[hsl(var(--matter-sage)/0.4)] to-[hsl(var(--matter-forest)/0.3)] flex items-center justify-center cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt={displayName} className="w-full h-full rounded-full object-cover" />
                : <span className="font-serif text-4xl md:text-5xl text-foreground/60">{initials}</span>
              }
              <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                <Camera className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {isUploadingAvatar && (
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>
          </motion.div>

          {/* Name */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="font-serif text-3xl md:text-5xl text-foreground mb-2 tracking-tight"
          >
            {displayName}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-muted-foreground text-base md:text-lg leading-relaxed mb-4"
          >
            A life told one question at a time.
          </motion.p>

          {/* Stats row */}
          {entries.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-5 md:gap-8"
            >
              {[
                { label: "moments",  value: entries.length },
                counts.voice > 0 && { label: "voice",   value: counts.voice },
                counts.video > 0 && { label: "video",   value: counts.video },
                counts.text  > 0 && { label: "written", value: counts.text  },
              ].filter(Boolean).map((s: any) => (
                <div key={s.label} className="text-center">
                  <p className="font-serif text-xl md:text-2xl text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">{s.label}</p>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* ── CONTENT ── */}
      <section className="max-w-4xl mx-auto px-4 md:px-6">

        {/* Filter tabs */}
        {FILTERS.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center gap-5 md:gap-8 mb-8 md:mb-12"
          >
            {FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`text-sm transition-all pb-1 border-b ${
                  selectedFilter === f.id
                    ? "text-foreground border-foreground"
                    : "text-muted-foreground/40 border-transparent hover:text-muted-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </motion.div>
        )}

        {/* Empty state */}
        {entries.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24">
            <h3 className="font-serif text-2xl md:text-3xl text-foreground mb-4">Your story begins here</h3>
            <p className="text-muted-foreground mb-10 max-w-sm mx-auto leading-relaxed text-sm md:text-base">
              Answer your first question to start preserving your legacy — for the people who matter most.
            </p>
            <Button onClick={() => navigate("/")} size="lg" className="rounded-full px-8 h-12">
              Begin <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        )}

        {/* Cards grid */}
        {filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="columns-1 md:columns-2 gap-6"
          >
            {filtered.map((entry, i) => (
              <MomentCard key={entry.id} entry={entry} index={i} onSelect={() => setSelectedEntry(entry)} />
            ))}
          </motion.div>
        )}

        {entries.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="text-center text-muted-foreground/40 mt-20 mb-8 text-xs md:text-sm"
          >
            A growing record of a life — shaped week by week.
          </motion.p>
        )}
      </section>

      {/* Detail sheet */}
      <AnimatePresence>
        {selectedEntry && (
          <EntryDetailSheet entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MOMENT CARD
═══════════════════════════════════════════════════════════════ */
function MomentCard({ entry, index, onSelect }: { entry: Response; index: number; onSelect: () => void }) {
  const isVideo = entry.content_type === "video";
  const isAudio = entry.content_type === "audio";
  const isPhoto = entry.content_type === "photo";
  const isText  = !entry.content_type || entry.content_type === "text";
  const cat     = entry.questions?.category;
  const date    = entry.created_at ? format(new Date(entry.created_at), "MMMM yyyy") : "";

  const TEXT_LIMIT = 160;
  const isTruncated = isText && entry.content.length > TEXT_LIMIT;
  const preview = isTruncated ? entry.content.slice(0, TEXT_LIMIT).trimEnd() : entry.content;

  const pad = isVideo ? "p-0" : isAudio ? "p-5" : isPhoto ? "p-0" : "p-5";

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
      onClick={onSelect}
      className={`bg-card rounded-2xl overflow-hidden break-inside-avoid mb-5 cursor-pointer
                  ring-1 ring-border/50 hover:ring-border hover:shadow-sm transition-all active:scale-[0.99] ${pad}`}
    >
      {/* Photo hero */}
      {isPhoto && entry.photo_url && (
        <>
          <div className="relative w-full aspect-[4/3] bg-muted overflow-hidden">
            <img src={entry.photo_url} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="p-5 pt-4">
            <QuestionMeta question={entry.questions?.question} cat={cat} date={date} />
          </div>
        </>
      )}

      {/* Video hero */}
      {isVideo && entry.video_url && (
        <>
          <div className="relative w-full aspect-video bg-black overflow-hidden">
            <video src={entry.video_url} preload="metadata" playsInline muted className="w-full h-full object-cover opacity-90" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                <Play className="w-5 h-5 text-foreground fill-foreground ml-0.5" />
              </div>
            </div>
          </div>
          <div className="p-5 pt-4">
            <QuestionMeta question={entry.questions?.question} cat={cat} date={date} />
          </div>
        </>
      )}

      {/* Audio card */}
      {isAudio && (
        <>
          <QuestionMeta question={entry.questions?.question} cat={cat} date={date} />
          <div className="mt-4 bg-secondary/30 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
              <Play className="w-3.5 h-3.5 text-background fill-background ml-[1px]" />
            </div>
            <div className="flex-1 flex items-end gap-[2px] h-6">
              {[0.3,0.6,0.9,0.5,1,0.7,0.4,0.8,0.5,0.9,0.3,0.7,0.6,0.4,0.8,0.5,0.7,0.4,0.6,0.9].map((h, i) => (
                <div key={i} className="flex-1 bg-foreground/20 rounded-full" style={{ height: `${h * 100}%` }} />
              ))}
            </div>
          </div>
          <TapHint />
        </>
      )}

      {/* Text card */}
      {isText && (
        <>
          <QuestionMeta question={entry.questions?.question} cat={cat} date={date} />
          <div className="mt-3 relative">
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              {preview}
            </p>
            {isTruncated && (
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent" />
            )}
          </div>
          <TapHint />
        </>
      )}
    </motion.article>
  );
}

function QuestionMeta({ question, cat, date }: { question?: string; cat?: string; date: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        {cat
          ? <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${catColor(cat)}`}>{cat}</span>
          : <span />
        }
        <span className="text-[11px] text-muted-foreground/40 ml-auto">{date}</span>
      </div>
      <p className="text-muted-foreground/40 text-[11px] mb-1">In response to</p>
      <h3 className="font-serif text-[15px] md:text-base text-foreground leading-snug">
        {question || "A reflection"}
      </h3>
    </div>
  );
}

function TapHint() {
  return (
    <div className="flex items-center gap-0.5 mt-3 text-muted-foreground/30">
      <span className="text-[11px]">Read</span>
      <ChevronRight className="w-3 h-3" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ENTRY DETAIL SHEET
   — Bottom sheet on mobile
   — Centered modal on desktop
═══════════════════════════════════════════════════════════════ */
function EntryDetailSheet({ entry, onClose }: { entry: Response; onClose: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isText  = !entry.content_type || entry.content_type === "text";
  const isAudio = entry.content_type === "audio";
  const isVideo = entry.content_type === "video";
  const isPhoto = !!entry.photo_url;
  const isLong  = isText && entry.content.length > 400;
  const displayContent = !expanded && isLong
    ? entry.content.slice(0, 400).trimEnd() + "…"
    : entry.content;
  const date = entry.created_at ? format(new Date(entry.created_at), "EEEE, MMMM d, yyyy") : "Recently";
  const cat  = entry.questions?.category;

  const togglePlay = () => {
    if (isVideo && videoRef.current) isPlaying ? videoRef.current.pause() : videoRef.current.play();
    if (isAudio && audioRef.current) isPlaying ? audioRef.current.pause() : audioRef.current.play();
    setIsPlaying(p => !p);
  };

  const audioRef = useRef<HTMLAudioElement>(null);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 320 }}
        className="fixed inset-x-0 bottom-0 z-50 bg-card rounded-t-3xl overflow-hidden
                   max-h-[94vh] flex flex-col
                   md:inset-0 md:m-auto md:rounded-3xl md:w-[600px] md:max-h-[88vh] md:shadow-2xl"
      >
        {/* Sticky header */}
        <div className="flex-shrink-0 pt-3 pb-3 px-5 border-b border-border/50 bg-card">
          {/* Drag handle — mobile only */}
          <div className="w-10 h-1 bg-muted-foreground/20 rounded-full mx-auto mb-3 md:hidden" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              {cat && (
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${catColor(cat)}`}>
                  {cat}
                </span>
              )}
              <span className="text-xs text-muted-foreground/60">{date}</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors ml-2 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Photo — full bleed */}
          {isPhoto && entry.photo_url && (
            <div className="w-full">
              <img src={entry.photo_url} alt="" className="w-full max-h-[55vh] object-cover" />
            </div>
          )}

          {/* Video — with player controls like audio */}
          {isVideo && entry.video_url && (
            <VideoPlayer
              src={entry.video_url}
              transcript={entry.transcript}
            />
          )}

          <div className="px-6 py-6 pb-10">
            {/* Question */}
            <p className="text-muted-foreground/50 text-xs mb-1.5">In response to</p>
            <h2 className="font-serif text-xl md:text-2xl text-foreground leading-snug mb-6">
              {entry.questions?.question || "A reflection"}
            </h2>

            {/* Audio player */}
            {isAudio && entry.audio_url && (
              <AudioPlayer
                src={entry.audio_url}
                transcript={entry.transcript}
                isPlaying={isPlaying}
                onToggle={togglePlay}
                audioRef={audioRef}
                onEnded={() => setIsPlaying(false)}
              />
            )}

            {/* Text answer */}
            {isText && (
              <>
                <p className="text-[15px] md:text-base text-foreground leading-relaxed whitespace-pre-wrap">
                  {displayContent}
                </p>
                {isLong && !expanded && (
                  <button onClick={() => setExpanded(true)}
                    className="mt-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Read more <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                )}
                {isLong && expanded && (
                  <button onClick={() => setExpanded(false)}
                    className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Show less
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   AUDIO PLAYER — progress bar, timer, transcript reveal
═══════════════════════════════════════════════════════════════ */
function AudioPlayer({
  src, transcript, isPlaying, onToggle, audioRef, onEnded
}: {
  src: string;
  transcript?: string | null;
  isPlaying: boolean;
  onToggle: () => void;
  audioRef: React.RefObject<HTMLAudioElement>;
  onEnded: () => void;
}) {
  const [currentTime, setCurrentTime]   = useState(0);
  const [duration, setDuration]         = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onLoad = () => setDuration(audio.duration);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoad);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoad);
      audio.removeEventListener("ended", onEnded);
    };
  }, [audioRef, onEnded]);

  const fmt = (s: number) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const remaining = duration > 0 ? duration - currentTime : 0;

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !audioRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = ratio * duration;
  };

  return (
    <div className="mb-6 bg-secondary/30 rounded-2xl overflow-hidden">
      <audio ref={audioRef} src={src} preload="metadata" className="hidden" />

      {/* Player controls */}
      <div className="p-5">
        <div className="flex items-center gap-4 mb-4">
          {/* Play/Pause button */}
          <button
            onClick={onToggle}
            className="w-12 h-12 rounded-full bg-foreground flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
          >
            {isPlaying
              ? <Pause className="w-5 h-5 text-background fill-background" />
              : <Play className="w-5 h-5 text-background fill-background ml-0.5" />
            }
          </button>

          {/* Time */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground/60 flex-shrink-0 w-16">
            <span>{fmt(currentTime)}</span>
            <span>/</span>
            <span>{fmt(duration)}</span>
          </div>

          {/* Time remaining */}
          {duration > 0 && (
            <span className="ml-auto text-xs text-muted-foreground/40">
              -{fmt(remaining)}
            </span>
          )}
        </div>

        {/* Progress bar — clickable/seekable */}
        <div
          ref={progressRef}
          onClick={seek}
          className="relative h-1.5 bg-foreground/10 rounded-full cursor-pointer group"
        >
          <div
            className="absolute left-0 top-0 h-full bg-foreground/60 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
          {/* Scrubber dot */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-foreground rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `calc(${progress}% - 6px)` }}
          />
        </div>
      </div>

      {/* Transcript toggle — only show if transcript exists */}
      {transcript && (
        <div className="border-t border-border/30">
          <button
            onClick={() => setShowTranscript(v => !v)}
            className="w-full flex items-center justify-between px-5 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" />
              Show transcript
            </span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showTranscript ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {showTranscript && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <p className="px-5 pb-5 text-[14px] text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {transcript}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
