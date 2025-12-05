import React, { useState, useRef } from 'react';
import { Play, Pause, Mic, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import grandpaPhoto from '@/assets/grandpa-robert.jpg';

interface VoiceDemoProps {
  onTryDemo: () => void;
}

const GRANDPA_RESPONSE = `Oh honey, let me tell you something. The day I walked onto that Navy base in '62, I was terrified. Eighteen years old, skinny as a rail, and convinced everyone could see right through me.

But here's what I learned—everyone feels that way. The confident ones? They're just better at hiding it. 

You're smart, you're kind, and you've got more courage than you know. College isn't about fitting in, it's about finding your people. And you will. Trust your grandpa on this one.`;

export default function VoiceDemo({ onTryDemo }: VoiceDemoProps) {
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const generateAndPlayAudio = async () => {
    // If audio is already loaded, just play/pause
    if (audioRef.current && audioLoaded) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        setIsAnimating(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
        setIsAnimating(true);
      }
      return;
    }

    setIsLoadingAudio(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text: GRANDPA_RESPONSE,
          voiceId: 'JBFqnCBsd6RMkjVDRZzb' // George - warm, mature male voice
        }
      });

      if (error) throw error;

      if (data?.audioContent) {
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
          { type: 'audio/mpeg' }
        );
        const audioUrl = URL.createObjectURL(audioBlob);
        
        audioRef.current = new Audio(audioUrl);
        audioRef.current.onended = () => {
          setIsPlaying(false);
          setIsAnimating(false);
        };
        
        setAudioLoaded(true);
        audioRef.current.play();
        setIsPlaying(true);
        setIsAnimating(true);
      }
    } catch (error) {
      console.error('Error generating audio:', error);
      toast({
        title: "Audio generation failed",
        description: "Please try again in a moment.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingAudio(false);
    }
  };

  return (
    <div className="bg-matter-navy rounded-3xl p-8 md:p-12 shadow-premium">
      {/* Caller Info */}
      <div className="text-center mb-10">
        <div className={`w-28 h-28 rounded-full mx-auto mb-4 overflow-hidden ring-4 shadow-xl transition-all duration-300 ${
          isAnimating ? 'ring-matter-sage ring-opacity-100 animate-pulse' : 'ring-matter-sage/30'
        }`}>
          <img 
            src={grandpaPhoto} 
            alt="Grandpa Robert"
            className="w-full h-full object-cover"
          />
        </div>
        <h3 className="text-2xl font-serif text-white mb-1">Grandpa Robert</h3>
        <p className="text-white/60 text-sm">1942 - 2021 • 847 responses preserved</p>
      </div>

      {/* Audio Demo - Voice Call Interface */}
      <div className="bg-gradient-to-b from-white/5 to-white/10 rounded-2xl p-6 md:p-8 mb-8">
        {/* Emma's Voice Message */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-matter-coral/40 flex items-center justify-center">
              <span className="text-white text-sm font-medium">E</span>
            </div>
            <span className="text-white/70 text-sm">Emma, 16</span>
          </div>
          <div className="bg-matter-coral/20 rounded-2xl px-5 py-4">
            <div className="flex items-center gap-4">
              <button className="w-12 h-12 rounded-full bg-matter-coral flex items-center justify-center hover:bg-matter-coral/80 transition-colors flex-shrink-0 opacity-50 cursor-default">
                <Play className="h-5 w-5 text-white ml-0.5" />
              </button>
              <div className="flex-1">
                <div className="flex items-center gap-0.5 mb-2">
                  {[...Array(40)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-matter-coral/60 rounded-full"
                      style={{ 
                        height: `${6 + Math.sin(i * 0.5) * 10 + Math.random() * 6}px`,
                      }}
                    />
                  ))}
                </div>
                <p className="text-white/50 text-xs italic">"Grandpa, I'm scared about going to college. Did you ever feel like you didn't belong?"</p>
              </div>
              <span className="text-white/40 text-sm flex-shrink-0">0:08</span>
            </div>
          </div>
        </div>

        {/* Grandpa's AI Voice Response */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img src={grandpaPhoto} alt="Grandpa Robert" className="w-full h-full object-cover" />
            </div>
            <span className="text-white/70 text-sm">Grandpa Robert</span>
            <span className="text-matter-gold/80 text-xs px-2 py-0.5 bg-matter-gold/10 rounded-full">AI Voice</span>
          </div>
          <div className="bg-matter-sage/20 rounded-2xl px-5 py-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={generateAndPlayAudio}
                disabled={isLoadingAudio}
                className="w-12 h-12 rounded-full bg-matter-sage flex items-center justify-center hover:bg-matter-sage/80 transition-colors flex-shrink-0 disabled:opacity-50"
              >
                {isLoadingAudio ? (
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                ) : isPlaying ? (
                  <Pause className="h-5 w-5 text-white" />
                ) : (
                  <Play className="h-5 w-5 text-white ml-0.5" />
                )}
              </button>
              <div className="flex-1">
                <div className="flex items-center gap-0.5 mb-2">
                  {[...Array(60)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 rounded-full transition-all duration-150 ${
                        isAnimating ? 'bg-matter-sage' : 'bg-matter-sage/60'
                      }`}
                      style={{ 
                        height: isAnimating 
                          ? `${4 + Math.random() * 20}px`
                          : `${4 + Math.sin(i * 0.3) * 14 + Math.random() * 8}px`,
                        transition: isAnimating ? 'height 0.1s ease-in-out' : 'none'
                      }}
                    />
                  ))}
                </div>
                <p className="text-white/50 text-xs italic">"Oh honey, let me tell you something. The day I walked onto that Navy base in '62, I was terrified..."</p>
              </div>
              <span className="text-white/40 text-sm flex-shrink-0">0:38</span>
            </div>
          </div>
          <p className="text-white/40 text-xs mt-3 flex items-center gap-1">
            <Mic className="h-3 w-3" />
            Synthesized from Robert's actual voice • Based on his interview from March 2019
          </p>
        </div>
      </div>

      <div className="text-center">
        <p className="text-white/60 text-sm mb-4">
          {isPlaying ? "Playing Grandpa Robert's voice..." : "Click play to hear Grandpa Robert's AI voice respond"}
        </p>
      </div>
    </div>
  );
}
