import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Mic, 
  Video, 
  Upload, 
  Play, 
  Square,
  Trash2,
  Loader2,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface MediaUploaderProps {
  type: 'audio' | 'video';
  onUpload: (url: string) => void;
  onClear: () => void;
  mediaUrl: string | null;
}

export default function MediaUploader({ type, onUpload, onClear, mediaUrl }: MediaUploaderProps) {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  const startRecording = async () => {
    try {
      const constraints = type === 'video' 
        ? { video: { facingMode: 'user' }, audio: true }
        : { audio: true };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (type === 'video' && videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      
      mediaRecorder.onstop = () => {
        const mimeType = type === 'video' ? 'video/webm' : 'audio/webm';
        const blob = new Blob(chunks, { type: mimeType });
        setRecordedBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach(track => track.stop());
      
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = null;
      }
      
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    await uploadFile(file);
  };

  const uploadFile = async (file: File | Blob) => {
    if (!user) return;
    
    setIsUploading(true);
    try {
      const fileExt = file instanceof File 
        ? file.name.split('.').pop() 
        : type === 'video' ? 'webm' : 'webm';
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('user-media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('user-media')
        .getPublicUrl(fileName);

      onUpload(publicUrl);
      setRecordedBlob(null);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadRecording = () => {
    if (recordedBlob) {
      uploadFile(recordedBlob);
    }
  };

  const clearRecording = () => {
    setRecordedBlob(null);
    setRecordingDuration(0);
    onClear();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const Icon = type === 'video' ? Video : Mic;

  // Already uploaded state
  if (mediaUrl) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative rounded-2xl overflow-hidden bg-secondary/50"
      >
        {type === 'video' ? (
          <video 
            src={mediaUrl} 
            controls 
            className="w-full aspect-video object-cover"
          />
        ) : (
          <div className="p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-foreground flex items-center justify-center">
              <Play className="w-5 h-5 text-background fill-background ml-0.5" />
            </div>
            <audio src={mediaUrl} controls className="flex-1" />
          </div>
        )}
        <button
          onClick={clearRecording}
          className="absolute top-3 right-3 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
        >
          <Trash2 className="w-4 h-4 text-destructive" />
        </button>
        <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-foreground/90 text-background text-xs font-medium flex items-center gap-1.5">
          <Check className="w-3 h-3" />
          Ready to save
        </div>
      </motion.div>
    );
  }

  // Recording preview state (recorded but not uploaded)
  if (recordedBlob) {
    const blobUrl = URL.createObjectURL(recordedBlob);
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl overflow-hidden bg-secondary/50"
      >
        {type === 'video' ? (
          <video 
            src={blobUrl} 
            controls 
            className="w-full aspect-video object-cover"
          />
        ) : (
          <div className="p-6 flex items-center gap-4">
            <audio src={blobUrl} controls className="flex-1" />
          </div>
        )}
        <div className="p-4 flex items-center justify-between border-t border-border/30">
          <button
            onClick={clearRecording}
            className="px-4 py-2 rounded-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Trash2 className="w-4 h-4 inline mr-2" />
            Discard
          </button>
          <Button
            onClick={handleUploadRecording}
            disabled={isUploading}
            className="rounded-full bg-foreground text-background hover:bg-foreground/90"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            Use this {type}
          </Button>
        </div>
      </motion.div>
    );
  }

  // Recording state
  if (isRecording) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative rounded-2xl overflow-hidden bg-secondary/50"
      >
        {type === 'video' ? (
          <video 
            ref={videoPreviewRef}
            muted
            playsInline
            className="w-full aspect-video object-cover scale-x-[-1]"
          />
        ) : (
          <div className="aspect-video flex flex-col items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mb-4"
            >
              <div className="w-12 h-12 rounded-full bg-destructive flex items-center justify-center">
                <Mic className="w-6 h-6 text-white" />
              </div>
            </motion.div>
            <div className="flex items-center gap-3 h-10 mb-4">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    height: [10, Math.random() * 30 + 10, 10],
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 0.5 + Math.random() * 0.5,
                    delay: i * 0.05 
                  }}
                  className="w-1 bg-foreground/40 rounded-full"
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Recording indicator */}
        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive text-white text-sm font-medium">
          <motion.div
            animate={{ opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="w-2 h-2 rounded-full bg-white"
          />
          REC · {formatDuration(recordingDuration)}
        </div>
        
        {/* Stop button */}
        <div className="absolute bottom-4 inset-x-0 flex justify-center">
          <button
            onClick={stopRecording}
            className="w-16 h-16 rounded-full bg-destructive flex items-center justify-center hover:bg-destructive/90 transition-colors shadow-xl"
          >
            <Square className="w-6 h-6 text-white fill-white" />
          </button>
        </div>
      </motion.div>
    );
  }

  // Default state - ready to record or upload
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-12 px-8 bg-secondary/30 rounded-2xl border-2 border-dashed border-border/50"
    >
      <div className="w-20 h-20 rounded-full bg-foreground/10 flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-foreground" />
      </div>
      
      <p className="text-foreground font-medium mb-1">
        {type === 'video' ? 'Record a video' : 'Record your voice'}
      </p>
      <p className="text-sm text-muted-foreground mb-6">
        Share your story in your own {type === 'video' ? 'way' : 'voice'}
      </p>
      
      <div className="flex gap-3">
        <Button
          onClick={startRecording}
          size="lg"
          className="rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-lg"
        >
          <Icon className="w-4 h-4 mr-2" />
          Start recording
        </Button>
        
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          size="lg"
          className="rounded-full border-border/60"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload file
        </Button>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept={type === 'video' ? 'video/*' : 'audio/*'}
        onChange={handleFileSelect}
        className="hidden"
      />
    </motion.div>
  );
}