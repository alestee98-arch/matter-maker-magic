import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Mic, X, Check, Loader2, Play, Pause, AudioWaveform, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AudioSample {
  id: string;
  file: File;
  name: string;
  duration: number;
  isPlaying: boolean;
}

interface VoiceCloningProps {
  onVoiceCreated?: (voiceId: string, name: string) => void;
  onBack?: () => void;
}

export default function VoiceCloning({ onVoiceCreated, onBack }: VoiceCloningProps) {
  const [voiceName, setVoiceName] = useState('');
  const [description, setDescription] = useState('');
  const [audioSamples, setAudioSamples] = useState<AudioSample[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createdVoice, setCreatedVoice] = useState<{ id: string; name: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementsRef = useRef<{ [key: string]: HTMLAudioElement }>({});
  
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('audio/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload audio files only (MP3, WAV, M4A, etc.)",
          variant: "destructive"
        });
        return;
      }

      const audio = new Audio(URL.createObjectURL(file));
      audio.onloadedmetadata = () => {
        const sample: AudioSample = {
          id: crypto.randomUUID(),
          file,
          name: file.name,
          duration: audio.duration,
          isPlaying: false
        };
        setAudioSamples(prev => [...prev, sample]);
      };
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([audioBlob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
        
        const audio = new Audio(URL.createObjectURL(audioBlob));
        audio.onloadedmetadata = () => {
          const sample: AudioSample = {
            id: crypto.randomUUID(),
            file,
            name: `Recording ${audioSamples.length + 1}`,
            duration: audio.duration,
            isPlaying: false
          };
          setAudioSamples(prev => [...prev, sample]);
        };

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to record audio samples.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const removeSample = (id: string) => {
    setAudioSamples(prev => prev.filter(sample => sample.id !== id));
    if (audioElementsRef.current[id]) {
      audioElementsRef.current[id].pause();
      delete audioElementsRef.current[id];
    }
  };

  const togglePlaySample = (id: string) => {
    const sample = audioSamples.find(s => s.id === id);
    if (!sample) return;

    if (!audioElementsRef.current[id]) {
      audioElementsRef.current[id] = new Audio(URL.createObjectURL(sample.file));
      audioElementsRef.current[id].onended = () => {
        setAudioSamples(prev => prev.map(s => 
          s.id === id ? { ...s, isPlaying: false } : s
        ));
      };
    }

    const audio = audioElementsRef.current[id];
    
    if (sample.isPlaying) {
      audio.pause();
      audio.currentTime = 0;
    } else {
      // Pause all other samples
      Object.entries(audioElementsRef.current).forEach(([key, audioEl]) => {
        if (key !== id) {
          audioEl.pause();
          audioEl.currentTime = 0;
        }
      });
      setAudioSamples(prev => prev.map(s => ({ ...s, isPlaying: s.id === id })));
      audio.play();
      return;
    }

    setAudioSamples(prev => prev.map(s => 
      s.id === id ? { ...s, isPlaying: !s.isPlaying } : { ...s, isPlaying: false }
    ));
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalDuration = () => {
    return audioSamples.reduce((acc, sample) => acc + sample.duration, 0);
  };

  const createVoiceClone = async () => {
    if (!voiceName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for the voice.",
        variant: "destructive"
      });
      return;
    }

    if (audioSamples.length === 0) {
      toast({
        title: "Audio samples required",
        description: "Please upload or record at least one audio sample.",
        variant: "destructive"
      });
      return;
    }

    const totalDuration = getTotalDuration();
    if (totalDuration < 30) {
      toast({
        title: "More audio needed",
        description: "Please provide at least 30 seconds of audio for best results.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);

    try {
      const formData = new FormData();
      formData.append('name', voiceName);
      if (description) {
        formData.append('description', description);
      }
      
      for (const sample of audioSamples) {
        formData.append('files', sample.file);
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/clone-voice`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create voice clone');
      }

      setCreatedVoice({ id: data.voiceId, name: data.name });
      
      toast({
        title: "Voice created!",
        description: `"${voiceName}" has been successfully cloned.`,
      });

      onVoiceCreated?.(data.voiceId, data.name);
    } catch (error) {
      console.error('Error creating voice clone:', error);
      toast({
        title: "Failed to create voice",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (createdVoice) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto text-center py-16"
      >
        <div className="w-24 h-24 rounded-full bg-matter-sage/20 flex items-center justify-center mx-auto mb-6">
          <Sparkles className="h-12 w-12 text-matter-sage" />
        </div>
        <h2 className="text-3xl font-serif text-foreground mb-4">
          Voice Created Successfully!
        </h2>
        <p className="text-muted-foreground mb-8">
          "{createdVoice.name}" has been cloned and is ready to use.<br />
          Your loved ones will be able to hear this voice for generations.
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={onBack}>
            Back to Profile
          </Button>
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={() => {
              setCreatedVoice(null);
              setVoiceName('');
              setDescription('');
              setAudioSamples([]);
            }}
          >
            Clone Another Voice
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl font-serif text-foreground mb-3">Clone Your Voice</h2>
        <p className="text-muted-foreground">
          Upload audio samples of your voice to create a personalized AI voice clone.<br />
          For best results, provide at least 1-2 minutes of clear speech.
        </p>
      </motion.div>

      {/* Voice Name & Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4 mb-8"
      >
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Voice Name *
          </label>
          <Input
            value={voiceName}
            onChange={(e) => setVoiceName(e.target.value)}
            placeholder="e.g., Grandpa Robert, Mom, Dad..."
            className="bg-card"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Description (optional)
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add details about this voice—their personality, how they spoke, what made them unique..."
            className="bg-card resize-none"
            rows={3}
          />
        </div>
      </motion.div>

      {/* Audio Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl border border-border p-6 mb-6"
      >
        <h3 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
          <AudioWaveform className="h-5 w-5 text-primary" />
          Audio Samples
        </h3>

        {/* Upload/Record Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Audio Files
          </Button>
          <Button
            variant={isRecording ? "destructive" : "outline"}
            onClick={isRecording ? stopRecording : startRecording}
            className="flex-1"
          >
            {isRecording ? (
              <>
                <div className="w-3 h-3 bg-white rounded-full animate-pulse mr-2" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                Record Now
              </>
            )}
          </Button>
        </div>

        {/* Audio Samples List */}
        <AnimatePresence>
          {audioSamples.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              {audioSamples.map((sample, index) => (
                <motion.div
                  key={sample.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 bg-muted/50 rounded-xl p-3"
                >
                  <button
                    onClick={() => togglePlaySample(sample.id)}
                    className="w-10 h-10 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors flex-shrink-0"
                  >
                    {sample.isPlaying ? (
                      <Pause className="h-4 w-4 text-primary-foreground" />
                    ) : (
                      <Play className="h-4 w-4 text-primary-foreground ml-0.5" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {sample.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDuration(sample.duration)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeSample(sample.id)}
                    className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {audioSamples.length === 0 && !isRecording && (
          <div className="text-center py-8 text-muted-foreground">
            <AudioWaveform className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No audio samples yet</p>
            <p className="text-sm">Upload files or record directly</p>
          </div>
        )}

        {/* Recording Animation */}
        {isRecording && (
          <div className="text-center py-8">
            <div className="flex items-center justify-center gap-1 mb-3">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-destructive rounded-full"
                  animate={{
                    height: [8, 24, 8],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.05,
                  }}
                />
              ))}
            </div>
            <p className="text-destructive font-medium">Recording...</p>
            <p className="text-sm text-muted-foreground">Speak clearly into your microphone</p>
          </div>
        )}
      </motion.div>

      {/* Stats & Create Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {audioSamples.length > 0 && (
          <div className="flex items-center justify-between mb-4 text-sm">
            <span className="text-muted-foreground">
              {audioSamples.length} sample{audioSamples.length !== 1 ? 's' : ''} • {formatDuration(getTotalDuration())} total
            </span>
            <span className={getTotalDuration() >= 30 ? 'text-matter-sage' : 'text-matter-coral'}>
              {getTotalDuration() >= 30 ? (
                <span className="flex items-center gap-1">
                  <Check className="h-4 w-4" /> Ready to clone
                </span>
              ) : (
                `Need ${Math.ceil(30 - getTotalDuration())}s more`
              )}
            </span>
          </div>
        )}

        <div className="flex gap-3">
          {onBack && (
            <Button variant="outline" onClick={onBack} className="flex-1">
              Cancel
            </Button>
          )}
          <Button
            onClick={createVoiceClone}
            disabled={isCreating || audioSamples.length === 0 || !voiceName.trim()}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Voice...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Create Voice Clone
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          By creating a voice clone, you confirm you have permission to use this voice.
        </p>
      </motion.div>
    </div>
  );
}
