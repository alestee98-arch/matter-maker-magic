import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Play, Pause, Camera, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
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
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
            audio_url,
            video_url,
            photo_url,
            questions (
              question,
              category,
              depth
            )
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

    setIsUploading(true);
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

      await updateProfile({ avatar_url: publicUrl });
      toast.success("Profile picture updated");
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error("Failed to upload picture");
    } finally {
      setIsUploading(false);
    }
  };

  const getInitials = () => {
    if (profile?.display_name) {
      return profile.display_name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
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

  // Separate entries by type for mobile carousels
  const videoEntries = entries.filter(e => e.content_type === 'video' && e.video_url);
  const audioEntries = entries.filter(e => e.content_type === 'audio' && e.audio_url);
  const photoEntries = entries.filter(e => e.content_type === 'photo' && e.photo_url);
  const textEntries = entries.filter(e => e.content_type === 'text' || (!e.video_url && !e.audio_url && !e.photo_url));

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-background">
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* MOBILE LAYOUT - Spotify-inspired */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="md:hidden">
        {/* Mobile Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 px-4 py-6"
        >
          <div className="relative group">
            <div className={`w-16 h-16 rounded-full overflow-hidden ${isUploading ? 'opacity-50' : ''}`}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[hsl(var(--matter-sage)/0.4)] to-[hsl(var(--matter-forest)/0.3)] flex items-center justify-center">
                  <span className="font-serif text-xl text-foreground/60">{getInitials()}</span>
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <Camera className="w-5 h-5 text-white" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
          </div>
          <div>
            <h1 className="font-serif text-xl text-foreground">{displayName}</h1>
            <p className="text-muted-foreground text-sm">{entries.length} reflection{entries.length !== 1 ? 's' : ''}</p>
          </div>
        </motion.header>

        {entries.length === 0 ? (
          <MobileEmptyState navigate={navigate} />
        ) : (
          <div className="space-y-6 pb-8">
            {/* Featured moment - hero */}
            {entries[0] && <MobileHero entry={entries[0]} />}
            
            {/* Video carousel */}
            {videoEntries.length > 0 && (
              <MobileCarousel title="Videos" entries={videoEntries} />
            )}
            
            {/* Audio carousel */}
            {audioEntries.length > 0 && (
              <MobileCarousel title="Voice recordings" entries={audioEntries} />
            )}
            
            {/* Photos carousel */}
            {photoEntries.length > 0 && (
              <MobileCarousel title="Photos" entries={photoEntries} />
            )}
            
            {/* Text entries */}
            {textEntries.length > 0 && (
              <div className="px-4">
                <h3 className="font-medium text-foreground mb-3">Written reflections</h3>
                <div className="space-y-3">
                  {textEntries.slice(0, 5).map((entry) => (
                    <MobileTextCard key={entry.id} entry={entry} />
                  ))}
                </div>
              </div>
            )}
            
            <p className="text-center text-muted-foreground/40 text-xs px-4 pt-4">
              A growing record of a life — shaped week by week.
            </p>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* DESKTOP LAYOUT - Masonry grid */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block px-8 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Desktop Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-5 mb-12"
          >
            <div className="relative group">
              <div className={`w-24 h-24 rounded-full overflow-hidden ${isUploading ? 'opacity-50' : ''}`}>
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[hsl(var(--matter-sage)/0.4)] to-[hsl(var(--matter-forest)/0.3)] flex items-center justify-center">
                    <span className="font-serif text-3xl text-foreground/60">{getInitials()}</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </div>
            <div>
              <h1 className="font-serif text-3xl text-foreground">{displayName}</h1>
              <p className="text-muted-foreground text-sm mt-1">{entries.length} reflection{entries.length !== 1 ? 's' : ''}</p>
            </div>
          </motion.header>

          {entries.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center py-16"
            >
              <p className="text-muted-foreground mb-6">Your story begins here.</p>
              <Button onClick={() => navigate('/home')} className="rounded-full bg-foreground text-background hover:bg-foreground/90">
                Begin <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="columns-2 gap-5 space-y-5"
              >
                {entries.map((entry, index) => (
                  <DesktopCard key={entry.id} entry={entry} index={index} />
                ))}
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center text-muted-foreground/40 mt-16 text-sm"
              >
                This is a growing record of a life — shaped week by week.
              </motion.p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MOBILE COMPONENTS
// ═══════════════════════════════════════════════════════════════

function MobileEmptyState({ navigate }: { navigate: (path: string) => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 px-4">
      <p className="text-muted-foreground mb-6">Your story begins here.</p>
      <Button onClick={() => navigate('/home')} className="rounded-full bg-foreground text-background">
        Begin <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </motion.div>
  );
}

function MobileHero({ entry }: { entry: Response }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const isVideo = entry.content_type === 'video' && entry.video_url;
  const isAudio = entry.content_type === 'audio' && entry.audio_url;
  const isPhoto = entry.content_type === 'photo' && entry.photo_url;

  const togglePlay = () => {
    if (isVideo && videoRef.current) {
      isPlaying ? videoRef.current.pause() : videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
    if (isAudio && audioRef.current) {
      isPlaying ? audioRef.current.pause() : audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4">
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[hsl(var(--matter-sage)/0.3)] to-[hsl(var(--matter-forest)/0.2)]">
        {isVideo && (
          <div className="relative aspect-[4/5]" onClick={togglePlay}>
            <video ref={videoRef} src={entry.video_url!} className="w-full h-full object-cover" playsInline onEnded={() => setIsPlaying(false)} />
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="w-14 h-14 rounded-full bg-background/90 flex items-center justify-center">
                  <Play className="w-6 h-6 text-foreground fill-foreground ml-0.5" />
                </div>
              </div>
            )}
          </div>
        )}
        {isAudio && (
          <div className="aspect-square flex items-center justify-center" onClick={togglePlay}>
            <audio ref={audioRef} src={entry.audio_url!} onEnded={() => setIsPlaying(false)} className="hidden" />
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-end gap-1 h-16">
                {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.5, 0.7, 0.4, 0.6].map((h, i) => (
                  <motion.div
                    key={i}
                    animate={{ scaleY: isPlaying ? [h, h * 0.5, h] : h }}
                    transition={{ duration: 0.4, repeat: isPlaying ? Infinity : 0, delay: i * 0.05 }}
                    className="w-2 rounded-full bg-foreground/40 origin-bottom"
                    style={{ height: `${h * 100}%` }}
                  />
                ))}
              </div>
              <div className="w-12 h-12 rounded-full bg-background/90 flex items-center justify-center">
                {isPlaying ? <Pause className="w-5 h-5 text-foreground" /> : <Play className="w-5 h-5 text-foreground fill-foreground ml-0.5" />}
              </div>
            </div>
          </div>
        )}
        {isPhoto && <img src={entry.photo_url!} alt="" className="w-full aspect-[4/5] object-cover" />}
        {!isVideo && !isAudio && !isPhoto && (
          <div className="p-6 aspect-square flex items-center">
            <p className="font-serif text-lg text-foreground/80 leading-relaxed line-clamp-6">{entry.content}</p>
          </div>
        )}
        {/* Overlay with question */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
          <p className="text-white/70 text-xs mb-1">In response to</p>
          <p className="text-white font-medium text-sm">{entry.questions?.question || 'A reflection'}</p>
        </div>
      </div>
    </motion.div>
  );
}

function MobileCarousel({ title, entries }: { title: string; entries: Response[] }) {
  return (
    <div>
      <h3 className="font-medium text-foreground px-4 mb-3">{title}</h3>
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
        {entries.map((entry) => (
          <MobileMediaCard key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}

function MobileMediaCard({ entry }: { entry: Response }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const isVideo = entry.content_type === 'video';
  const isAudio = entry.content_type === 'audio';

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isVideo && videoRef.current) {
      isPlaying ? videoRef.current.pause() : videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
    if (isAudio && audioRef.current) {
      isPlaying ? audioRef.current.pause() : audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex-shrink-0 w-36 rounded-xl overflow-hidden bg-card border border-border/50" onClick={togglePlay}>
      {isVideo && entry.video_url && (
        <div className="relative aspect-[3/4]">
          <video ref={videoRef} src={entry.video_url} className="w-full h-full object-cover" playsInline muted onEnded={() => setIsPlaying(false)} />
          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
            <div className="w-8 h-8 rounded-full bg-background/80 flex items-center justify-center">
              {isPlaying ? <Pause className="w-3 h-3 text-foreground" /> : <Play className="w-3 h-3 text-foreground fill-foreground ml-0.5" />}
            </div>
          </div>
        </div>
      )}
      {isAudio && entry.audio_url && (
        <div className="aspect-[3/4] bg-gradient-to-br from-[hsl(var(--matter-sage)/0.2)] to-[hsl(var(--matter-forest)/0.3)] flex items-center justify-center">
          <audio ref={audioRef} src={entry.audio_url} onEnded={() => setIsPlaying(false)} className="hidden" />
          <div className="flex items-end gap-0.5 h-8">
            {[0.4, 0.7, 0.5, 0.9, 0.6].map((h, i) => (
              <motion.div
                key={i}
                animate={{ scaleY: isPlaying ? [h, h * 0.5, h] : h }}
                transition={{ duration: 0.4, repeat: isPlaying ? Infinity : 0, delay: i * 0.05 }}
                className="w-1 rounded-full bg-foreground/40 origin-bottom"
                style={{ height: `${h * 100}%` }}
              />
            ))}
          </div>
        </div>
      )}
      {entry.content_type === 'photo' && entry.photo_url && (
        <img src={entry.photo_url} alt="" className="w-full aspect-[3/4] object-cover" />
      )}
      <div className="p-2">
        <p className="text-xs text-muted-foreground line-clamp-2">{entry.questions?.question || 'A reflection'}</p>
      </div>
    </div>
  );
}

function MobileTextCard({ entry }: { entry: Response }) {
  return (
    <div className="bg-card rounded-xl p-4 border border-border/50">
      <p className="text-xs text-muted-foreground/60 mb-1">In response to</p>
      <p className="text-sm font-medium text-foreground mb-2">{entry.questions?.question || 'A reflection'}</p>
      <p className="text-foreground/70 text-sm line-clamp-3">{entry.content}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DESKTOP COMPONENTS
// ═══════════════════════════════════════════════════════════════

function DesktopCard({ entry, index }: { entry: Response; index: number }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const isVideo = entry.content_type === 'video';
  const isAudio = entry.content_type === 'audio';
  const isPhoto = entry.content_type === 'photo';

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isVideo && videoRef.current) {
      isPlaying ? videoRef.current.pause() : videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
    if (isAudio && audioRef.current) {
      isPlaying ? audioRef.current.pause() : audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="break-inside-avoid bg-card rounded-2xl p-5 border border-border/50"
    >
      <p className="text-muted-foreground/60 text-xs mb-1">In response to</p>
      <p className="text-foreground font-medium mb-4 leading-snug">{entry.questions?.question || 'A reflection'}</p>

      {isVideo && entry.video_url && (
        <div className="relative rounded-xl overflow-hidden mb-4 cursor-pointer group" onClick={togglePlay}>
          <video ref={videoRef} src={entry.video_url} className="w-full aspect-video object-cover" playsInline onEnded={() => setIsPlaying(false)} />
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="w-12 h-12 rounded-full bg-background/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-5 h-5 text-foreground fill-foreground ml-0.5" />
              </div>
            </div>
          )}
        </div>
      )}

      {isAudio && entry.audio_url && (
        <div className="relative rounded-xl overflow-hidden mb-4 cursor-pointer group bg-gradient-to-br from-[hsl(var(--matter-sage)/0.2)] to-[hsl(var(--matter-forest)/0.3)] p-6" onClick={togglePlay}>
          <audio ref={audioRef} src={entry.audio_url} onEnded={() => setIsPlaying(false)} className="hidden" />
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-end gap-1 h-12">
              {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.5, 0.7, 0.4].map((h, i) => (
                <motion.div
                  key={i}
                  animate={{ scaleY: isPlaying ? [h, h * 0.5, h] : h }}
                  transition={{ duration: 0.4, repeat: isPlaying ? Infinity : 0, delay: i * 0.05 }}
                  className="w-1.5 rounded-full bg-foreground/30 origin-bottom"
                  style={{ height: `${h * 100}%` }}
                />
              ))}
            </div>
            <div className="w-10 h-10 rounded-full bg-background/90 flex items-center justify-center group-hover:scale-110 transition-transform">
              {isPlaying ? <Pause className="w-4 h-4 text-foreground" /> : <Play className="w-4 h-4 text-foreground fill-foreground ml-0.5" />}
            </div>
          </div>
        </div>
      )}

      {isPhoto && entry.photo_url && (
        <div className="rounded-xl overflow-hidden mb-4">
          <img src={entry.photo_url} alt="" className="w-full object-cover" />
        </div>
      )}

      {!isVideo && !isAudio && !isPhoto && entry.content && (
        <p className="text-foreground/80 leading-relaxed mb-4">{entry.content}</p>
      )}

      <p className="text-muted-foreground/50 text-sm">
        {entry.created_at ? format(new Date(entry.created_at), 'MMMM yyyy') : ''}
      </p>
    </motion.div>
  );
}
