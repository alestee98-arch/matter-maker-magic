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

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-background px-4 md:px-8 py-8 md:py-12">
      <div className="max-w-5xl mx-auto">
        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* PROFILE HEADER - Simple with avatar upload */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-5 mb-12"
        >
          {/* Avatar with upload */}
          <div className="relative group">
            <div 
              className={`w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden flex-shrink-0 ${
                isUploading ? 'opacity-50' : ''
              }`}
            >
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[hsl(var(--matter-sage)/0.4)] to-[hsl(var(--matter-forest)/0.3)] flex items-center justify-center">
                  <span className="font-serif text-2xl md:text-3xl text-foreground/60">
                    {getInitials()}
                  </span>
                </div>
              )}
            </div>
            
            {/* Upload overlay */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
            >
              <Camera className="w-6 h-6 text-white" />
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>

          <div>
            <h1 className="font-serif text-2xl md:text-3xl text-foreground">{displayName}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {entries.length} reflection{entries.length !== 1 ? 's' : ''}
            </p>
          </div>
        </motion.header>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* EMPTY STATE */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {entries.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center py-16"
          >
            <p className="text-muted-foreground mb-6">
              Your story begins here. Answer your first question to start preserving your legacy.
            </p>
            <Button 
              onClick={() => navigate('/home')}
              className="rounded-full bg-foreground text-background hover:bg-foreground/90"
            >
              Begin
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* MASONRY GRID - Response cards */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {entries.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="columns-1 md:columns-2 gap-5 space-y-5"
          >
            {entries.map((entry, index) => (
              <ResponseCard key={entry.id} entry={entry} index={index} />
            ))}
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* CLOSING */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {entries.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-muted-foreground/40 mt-16 text-sm"
          >
            This is a growing record of a life — shaped week by week.
          </motion.p>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// RESPONSE CARD - Individual masonry item
// ═══════════════════════════════════════════════════════════════
function ResponseCard({ entry, index }: { entry: Response; index: number }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const isVideo = entry.content_type === 'video';
  const isAudio = entry.content_type === 'audio';
  const isPhoto = entry.content_type === 'photo';

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isVideo && videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
    if (isAudio && audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="break-inside-avoid bg-card rounded-2xl p-5 md:p-6 border border-border/50"
    >
      {/* Question context */}
      <p className="text-muted-foreground/60 text-xs mb-1">In response to</p>
      <p className="text-foreground font-medium mb-4 leading-snug">
        {entry.questions?.question || 'A reflection'}
      </p>

      {/* Video content */}
      {isVideo && entry.video_url && (
        <div 
          className="relative rounded-xl overflow-hidden mb-4 cursor-pointer group"
          onClick={togglePlay}
        >
          <video 
            ref={videoRef}
            src={entry.video_url}
            className="w-full aspect-video object-cover"
            playsInline
            onEnded={() => setIsPlaying(false)}
          />
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="w-12 h-12 rounded-full bg-background/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-5 h-5 text-foreground fill-foreground ml-0.5" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Audio content */}
      {isAudio && entry.audio_url && (
        <div 
          className="relative rounded-xl overflow-hidden mb-4 cursor-pointer group bg-gradient-to-br from-[hsl(var(--matter-sage)/0.2)] to-[hsl(var(--matter-forest)/0.3)] p-6"
          onClick={togglePlay}
        >
          <audio 
            ref={audioRef}
            src={entry.audio_url}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
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
              {isPlaying ? (
                <Pause className="w-4 h-4 text-foreground" />
              ) : (
                <Play className="w-4 h-4 text-foreground fill-foreground ml-0.5" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Photo content */}
      {isPhoto && entry.photo_url && (
        <div className="rounded-xl overflow-hidden mb-4">
          <img 
            src={entry.photo_url}
            alt=""
            className="w-full object-cover"
          />
        </div>
      )}

      {/* Text content (if text or has content alongside media) */}
      {(!isVideo && !isAudio && !isPhoto) && entry.content && (
        <p className="text-foreground/80 leading-relaxed mb-4">
          {entry.content}
        </p>
      )}

      {/* Date */}
      <p className="text-muted-foreground/50 text-sm">
        {entry.created_at ? format(new Date(entry.created_at), 'MMMM yyyy') : ''}
      </p>
    </motion.div>
  );
}
