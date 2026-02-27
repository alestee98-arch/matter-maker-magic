import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Play, ArrowRight, Camera, X, ChevronDown, FileText, Mic, Video as VideoIcon, Image as ImageIcon } from "lucide-react";
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

export default function ProfilePage() {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const navigate = useNavigate();
  
  const [entries, setEntries] = useState<Response[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<Response | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const { data: responsesData } = await supabase
          .from('responses')
          .select(`
            id, content, content_type, privacy, created_at, question_id,
            audio_url, video_url, photo_url,
            questions ( question, category, depth )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        setEntries(responsesData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await updateProfile({ avatar_url: `${publicUrl}?t=${Date.now()}` });
      toast.success('Profile picture updated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload photo');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const videoCount = entries.filter(e => e.content_type === 'video').length;
  const voiceCount = entries.filter(e => e.content_type === 'audio').length;
  const textCount = entries.filter(e => !e.content_type || e.content_type === 'text').length;
  const photoCount = entries.filter(e => e.content_type === 'photo').length;

  const filteredEntries = entries.filter(entry => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'video') return entry.content_type === 'video';
    if (selectedFilter === 'voice') return entry.content_type === 'audio';
    if (selectedFilter === 'text') return !entry.content_type || entry.content_type === 'text';
    return true;
  });

  const getInitials = () => {
    if (profile?.display_name) return profile.display_name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'M';
  };

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Your Legacy';

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/20 border-t-foreground/60 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] pb-20">
      {/* ── Profile Header ── */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className="pt-10 pb-8 md:pt-20 md:pb-24"
      >
        <div className="max-w-2xl mx-auto px-6 text-center">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            className="mb-5 md:mb-8"
          >
            <div 
              className="relative w-24 h-24 md:w-36 md:h-36 mx-auto rounded-full bg-gradient-to-br from-[hsl(var(--matter-sage)/0.4)] to-[hsl(var(--matter-forest)/0.3)] flex items-center justify-center cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={displayName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="font-serif text-4xl md:text-6xl text-foreground/60">
                  {getInitials()}
                </span>
              )}
              <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                <Camera className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {isUploadingAvatar && (
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="font-serif text-3xl md:text-5xl text-foreground mb-2 md:mb-4 tracking-tight"
          >
            {displayName}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="text-muted-foreground text-base md:text-xl leading-relaxed mb-3 md:mb-6"
          >
            A life told one question at a time.
          </motion.p>

          {entries.length > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="text-muted-foreground/60 text-xs md:text-sm tracking-wide"
            >
              {entries.length} moment{entries.length !== 1 ? 's' : ''}
              {videoCount > 0 && <> · {videoCount} video{videoCount !== 1 ? 's' : ''}</>}
              {voiceCount > 0 && <> · {voiceCount} voice</>}
              {textCount > 0 && <> · {textCount} written</>}
              {photoCount > 0 && <> · {photoCount} photo{photoCount !== 1 ? 's' : ''}</>}
            </motion.p>
          )}
        </div>
      </motion.section>

      {/* ── Content ── */}
      <section className="max-w-4xl mx-auto px-4 md:px-6">
        {/* Filters */}
        {entries.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center gap-5 md:gap-6 mb-6 md:mb-12"
          >
            {['all', 'video', 'voice', 'text'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`text-xs md:text-sm transition-all ${
                  selectedFilter === filter
                    ? 'text-foreground'
                    : 'text-muted-foreground/50 hover:text-muted-foreground'
                }`}
              >
                {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </motion.div>
        )}

        {/* Empty state */}
        {entries.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <h3 className="font-serif text-2xl md:text-3xl text-foreground mb-4">
              Your story begins here
            </h3>
            <p className="text-muted-foreground mb-10 max-w-md mx-auto leading-relaxed">
              Answer your first question to start preserving your legacy — 
              for the people who matter most.
            </p>
            <Button 
              onClick={() => navigate('/home')}
              size="lg"
              className="rounded-full bg-foreground text-background hover:bg-foreground/90 px-8 h-12"
            >
              Begin
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        )}

        {/* ── MOBILE: Instagram-style square grid ── */}
        {filteredEntries.length > 0 && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="grid grid-cols-3 gap-[2px] md:hidden rounded-lg overflow-hidden"
            >
              {filteredEntries.map((entry, index) => (
                <MobileGridCell 
                  key={entry.id} 
                  entry={entry} 
                  index={index}
                  onSelect={() => setSelectedEntry(entry)}
                />
              ))}
            </motion.div>

            {/* ── DESKTOP/TABLET: Masonry layout ── */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="hidden md:block columns-2 gap-6"
            >
              {filteredEntries.map((entry, index) => (
                <DesktopMomentCard 
                  key={entry.id} 
                  entry={entry} 
                  index={index}
                  onSelect={() => setSelectedEntry(entry)}
                />
              ))}
            </motion.div>
          </>
        )}

        {entries.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-muted-foreground/50 mt-16 md:mt-24 mb-8 text-xs md:text-sm"
          >
            A growing record of a life — shaped week by week.
          </motion.p>
        )}
      </section>

      {/* ── Detail Sheet ── */}
      <AnimatePresence>
        {selectedEntry && (
          <EntryDetailSheet 
            entry={selectedEntry} 
            onClose={() => setSelectedEntry(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* MOBILE GRID CELL - Instagram-style square tile                 */
/* ═══════════════════════════════════════════════════════════════ */
function MobileGridCell({ entry, index, onSelect }: { entry: Response; index: number; onSelect: () => void }) {
  const hasPhoto = !!entry.photo_url;
  const isVideo = entry.content_type === 'video';
  const isAudio = entry.content_type === 'audio';

  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.02, duration: 0.3 }}
      onClick={onSelect}
      className="relative aspect-square bg-card overflow-hidden text-left focus:outline-none active:opacity-80 transition-opacity"
    >
      {/* Photo / Video thumbnail */}
      {(hasPhoto || (isVideo && entry.video_url)) && (
        <img 
          src={entry.photo_url || ''} 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      )}

      {/* Content for text-only cards */}
      {!hasPhoto && !isVideo && (
        <div className="absolute inset-0 p-3 flex flex-col justify-between bg-card">
          <p className="text-[11px] leading-tight text-foreground line-clamp-5 font-serif">
            {entry.questions?.question || 'Reflection'}
          </p>
          {isAudio && (
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-foreground flex items-center justify-center">
                <Play className="w-2.5 h-2.5 text-background fill-background ml-[1px]" />
              </div>
              <span className="text-[9px] text-muted-foreground">Audio</span>
            </div>
          )}
        </div>
      )}

      {/* Overlay for photo/video cards */}
      {(hasPhoto || isVideo) && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex flex-col justify-end p-2.5">
          {isVideo && (
            <div className="absolute top-2 right-2">
              <VideoIcon className="w-3.5 h-3.5 text-white/80" />
            </div>
          )}
        </div>
      )}

      {/* Audio badge on photo cards */}
      {isAudio && hasPhoto && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center">
          <Mic className="w-2.5 h-2.5 text-white" />
        </div>
      )}
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* DESKTOP MASONRY CARD - kept from original, with click handler  */
/* ═══════════════════════════════════════════════════════════════ */
function DesktopMomentCard({ entry, index, onSelect }: { entry: Response; index: number; onSelect: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  
  const isVideo = entry.content_type === 'video';
  const isAudio = entry.content_type === 'audio';
  const isPhoto = entry.content_type === 'photo';
  const isText = !entry.content_type || entry.content_type === 'text';
  
  const TEXT_LIMIT = 180;
  const isLong = isText && entry.content.length > TEXT_LIMIT;
  const displayContent = isLong ? entry.content.slice(0, TEXT_LIMIT).trimEnd() + '…' : entry.content;

  const formattedDate = entry.created_at 
    ? format(new Date(entry.created_at), 'MMMM yyyy')
    : '';

  const paddingClass = isVideo ? 'p-7' : isAudio || isPhoto ? 'p-6' : 'p-5';

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      onClick={onSelect}
      className={`bg-card rounded-2xl overflow-hidden break-inside-avoid mb-6 cursor-pointer hover:bg-secondary/30 transition-colors ${paddingClass}`}
    >
      <p className="text-muted-foreground/40 text-xs mb-1.5">In response to</p>
      <h3 className={`font-serif text-foreground leading-snug mb-5 ${
        isVideo ? 'text-xl' : isAudio || isPhoto ? 'text-lg' : 'text-base'
      }`}>
        {entry.questions?.question || 'A reflection'}
      </h3>

      {isText && (
        <div>
          <p className="text-muted-foreground leading-relaxed text-[15px]">
            {displayContent}
          </p>
          {isLong && (
            <span className="mt-1.5 inline-block text-xs font-medium text-muted-foreground/60">
              Read more
            </span>
          )}
        </div>
      )}

      {isVideo && entry.video_url && (
        <div className="relative aspect-video bg-secondary/30 rounded-xl overflow-hidden">
          <video src={entry.video_url} className="w-full h-full object-cover" playsInline />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-background/90 flex items-center justify-center shadow-md">
              <Play className="w-5 h-5 text-foreground fill-foreground ml-0.5" />
            </div>
          </div>
        </div>
      )}

      {isPhoto && entry.photo_url && (
        <div className="relative aspect-[4/3] bg-secondary/30 rounded-xl overflow-hidden">
          <img src={entry.photo_url} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      {isAudio && entry.audio_url && (
        <div className="bg-secondary/20 rounded-xl p-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
              <Play className="w-4 h-4 text-background fill-background ml-0.5" />
            </div>
            <div className="flex-1 flex items-end gap-[2px] h-8">
              {[0.3, 0.5, 0.7, 0.4, 1, 0.8, 0.6, 0.9, 0.5, 0.7, 0.4, 0.8, 0.6, 0.5, 0.3, 0.6, 0.8, 0.5].map((h, i) => (
                <div key={i} className="flex-1 bg-foreground/20 rounded-full" style={{ height: `${h * 100}%` }} />
              ))}
            </div>
          </div>
        </div>
      )}

      <p className="text-muted-foreground/40 text-xs mt-4">{formattedDate}</p>
    </motion.article>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* ENTRY DETAIL SHEET - full view on tap (Instagram-style)        */
/* ═══════════════════════════════════════════════════════════════ */
function EntryDetailSheet({ entry, onClose }: { entry: Response; onClose: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const isText = !entry.content_type || entry.content_type === 'text';
  const isLong = entry.content.length > 300;
  const displayContent = !expanded && isLong 
    ? entry.content.slice(0, 300).trimEnd() + '…' 
    : entry.content;

  const formattedDate = entry.created_at 
    ? format(new Date(entry.created_at), 'EEEE, MMMM d, yyyy')
    : 'Recently';

  const togglePlay = () => {
    if (entry.content_type === 'video' && videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
    if (entry.content_type === 'audio' && audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
      />
      
      {/* Sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-50 max-h-[92vh] bg-card rounded-t-3xl border-t border-border overflow-y-auto"
        style={{ boxShadow: '0 -10px 40px rgba(0,0,0,0.1)' }}
      >
        {/* Handle + close */}
        <div className="sticky top-0 bg-card/95 backdrop-blur-sm z-10 pt-3 pb-2 px-5">
          <div className="w-10 h-1 bg-muted-foreground/20 rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{formattedDate}</span>
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
          {entry.content_type === 'video' && entry.video_url && (
            <div 
              className="mb-6 -mx-5 relative aspect-video bg-black cursor-pointer"
              onClick={togglePlay}
            >
              <video 
                ref={videoRef}
                src={entry.video_url} 
                className="w-full h-full object-contain"
                playsInline
                onEnded={() => setIsPlaying(false)}
              />
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
          <h2 className="text-xl md:text-2xl font-serif text-foreground mb-4 leading-snug">
            {entry.questions?.question || 'A reflection'}
          </h2>

          {entry.questions?.category && (
            <span className="inline-block mb-4 px-3 py-1 rounded-full bg-secondary text-xs text-muted-foreground capitalize">
              {entry.questions.category}
            </span>
          )}

          {/* Audio player */}
          {entry.content_type === 'audio' && entry.audio_url && (
            <div className="mb-6 bg-secondary/30 rounded-2xl p-5" onClick={togglePlay}>
              <audio 
                ref={audioRef}
                src={entry.audio_url} 
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
              <div className="flex items-center gap-4 cursor-pointer">
                <button className="w-12 h-12 rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
                  {isPlaying ? (
                    <div className="w-3.5 h-3.5 bg-background rounded-sm" />
                  ) : (
                    <Play className="w-5 h-5 text-background fill-background ml-0.5" />
                  )}
                </button>
                <div className="flex-1 flex items-end gap-[2px] h-10">
                  {[0.3, 0.5, 0.7, 0.4, 1, 0.8, 0.6, 0.9, 0.5, 0.7, 0.4, 0.8, 0.6, 0.5, 0.3, 0.6, 0.8, 0.5, 0.7, 0.4].map((h, i) => (
                    <div 
                      key={i} 
                      className={`flex-1 rounded-full transition-all ${isPlaying ? 'bg-foreground/50' : 'bg-foreground/20'}`}
                      style={{ height: `${h * 100}%` }} 
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Text content */}
          <p className="text-[15px] md:text-base text-foreground leading-relaxed whitespace-pre-wrap">
            {displayContent}
          </p>

          {isLong && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="mt-2 flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Read more
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          )}

          {isLong && expanded && (
            <button
              onClick={() => setExpanded(false)}
              className="mt-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Show less
            </button>
          )}
        </div>
      </motion.div>
    </>
  );
}
