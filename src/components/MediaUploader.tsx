import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Mic, 
  Video, 
  Upload, 
  Play, 
  Square,
  Trash2,
  Loader2,
  Check,
  Image as ImageIcon,
  Camera,
  X,
  SwitchCamera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface MediaUploaderProps {
  type: 'audio' | 'camera' | 'upload';
  onUpload: (url: string, contentType: 'audio' | 'video' | 'photo') => void;
  onClear: () => void;
  mediaUrl: string | null;
  capturedType?: 'audio' | 'video' | 'photo' | null;
}

export default function MediaUploader({ type, onUpload, onClear, mediaUrl, capturedType }: MediaUploaderProps) {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isHoldingRef = useRef(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Callback ref: attaches stream to video element the instant it mounts
  const attachStream = React.useCallback((node: HTMLVideoElement | null) => {
    videoPreviewRef.current = node;
    if (node && streamRef.current) {
      node.srcObject = streamRef.current;
      node.play().catch(() => {});
    }
  }, [isRecording, isCameraActive]);

  // Auto-open camera when type is 'camera'
  useEffect(() => {
    if (type === 'camera' && !isCameraActive && !isRecording && !recordedBlob && !capturedPhoto && !mediaUrl) {
      startCamera();
    }
    return () => {
      // Cleanup on unmount
      streamRef.current?.getTracks().forEach(track => track.stop());
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [type]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode },
        audio: true // Always request audio for video recording
      });
      streamRef.current = stream;
      setIsCameraActive(true);
    } catch (error) {
      console.error('Error starting camera:', error);
    }
  };

  const switchCameraFacing = async () => {
    const newFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacing);
    streamRef.current?.getTracks().forEach(track => track.stop());
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: newFacing },
        audio: true
      });
      streamRef.current = stream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play().catch(() => {});
      }
    } catch (error) {
      console.error('Error switching camera:', error);
    }
  };

  const getVideoMimeType = () => {
    if (MediaRecorder.isTypeSupported('video/mp4')) return 'video/mp4';
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) return 'video/webm;codecs=vp9';
    if (MediaRecorder.isTypeSupported('video/webm')) return 'video/webm';
    return '';
  };

  const startVideoRecording = () => {
    if (!streamRef.current) return;
    try {
      const mimeType = getVideoMimeType();
      const options: MediaRecorderOptions = mimeType ? { mimeType } : {};
      const mediaRecorder = new MediaRecorder(streamRef.current, options);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const actualType = mimeType || 'video/mp4';
        const blob = new Blob(chunks, { type: actualType });
        setRecordedBlob(blob);
      };
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting video recording:', error);
    }
  };

  const getAudioMimeType = () => {
    if (MediaRecorder.isTypeSupported('audio/mp4')) return 'audio/mp4';
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) return 'audio/webm;codecs=opus';
    if (MediaRecorder.isTypeSupported('audio/webm')) return 'audio/webm';
    return '';
  };

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = getAudioMimeType();
      const options: MediaRecorderOptions = mimeType ? { mimeType } : {};
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const actualType = mimeType || 'audio/mp4';
        const blob = new Blob(chunks, { type: actualType });
        setRecordedBlob(blob);
      };
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting audio recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      // Always stop the camera/mic stream so the review screen shows playback, not live feed
      streamRef.current?.getTracks().forEach(track => track.stop());
      setIsCameraActive(false);
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const capturePhoto = () => {
    if (videoPreviewRef.current && canvasRef.current) {
      const video = videoPreviewRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedPhoto(dataUrl);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const uploadFile = async (file: File | Blob, mediaType: 'audio' | 'video' | 'photo') => {
    if (!user) return;
    setIsUploading(true);
    try {
      let fileExt = 'mp4';
      if (file instanceof File) {
        fileExt = file.name.split('.').pop() || 'mp4';
      } else if (mediaType === 'photo') {
        fileExt = 'jpg';
      } else if (file instanceof Blob) {
        // Determine extension from blob mime type
        if (file.type.includes('webm')) fileExt = 'webm';
        else if (file.type.includes('mp4')) fileExt = 'mp4';
      }
      
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('user-media')
        .upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('user-media')
        .getPublicUrl(fileName);

      onUpload(publicUrl, mediaType);
      setRecordedBlob(null);
      setCapturedPhoto(null);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadRecording = () => {
    if (recordedBlob) {
      const mediaType = type === 'audio' ? 'audio' : 'video';
      uploadFile(recordedBlob, mediaType);
    }
  };

  const handleUploadPhoto = async () => {
    if (capturedPhoto) {
      const response = await fetch(capturedPhoto);
      const blob = await response.blob();
      await uploadFile(blob, 'photo');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    // Detect type from file
    let mediaType: 'audio' | 'video' | 'photo' = 'photo';
    if (file.type.startsWith('video/')) mediaType = 'video';
    else if (file.type.startsWith('audio/')) mediaType = 'audio';
    
    await uploadFile(file, mediaType);
  };

  const clearRecording = () => {
    setRecordedBlob(null);
    setCapturedPhoto(null);
    setRecordingDuration(0);
    onClear();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ─── Already uploaded state ───
  if (mediaUrl) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative rounded-2xl overflow-hidden bg-secondary/50"
      >
        {capturedType === 'video' ? (
          <video src={mediaUrl} controls playsInline preload="metadata" className="w-full aspect-[9/16] max-h-[50vh] object-cover" />
        ) : capturedType === 'photo' ? (
          <img src={mediaUrl} alt="Uploaded" className="w-full max-h-[50vh] object-cover" />
        ) : capturedType === 'audio' ? (
          <div className="p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-foreground flex items-center justify-center">
              <Play className="w-5 h-5 text-background fill-background ml-0.5" />
            </div>
            <audio src={mediaUrl} controls preload="metadata" className="flex-1" />
          </div>
        ) : (
          <div className="p-6">
            <p className="text-sm text-muted-foreground">Media uploaded</p>
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

  // ─── CAMERA MODE (fullscreen) ───
  if (type === 'camera') {
    // Photo captured — fullscreen review
    if (capturedPhoto) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black flex flex-col"
        >
          <img src={capturedPhoto} alt="Captured" className="w-full h-full object-cover" />
          <div className="absolute bottom-0 inset-x-0 pb-12 pt-6 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-center gap-6 px-6">
            <button
              onClick={() => { setCapturedPhoto(null); startCamera(); }}
              className="px-5 py-2.5 rounded-full bg-white/15 backdrop-blur-md text-white text-sm font-medium active:scale-95 transition-transform"
            >
              Retake
            </button>
            <Button
              onClick={handleUploadPhoto}
              disabled={isUploading}
              className="rounded-full bg-white text-black hover:bg-white/90 px-6 h-11 font-medium active:scale-95 transition-transform"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
              Use photo
            </Button>
          </div>
        </motion.div>
      );
    }

    // Video recorded — inline review (matches uploaded state style)
    if (recordedBlob) {
      const blobUrl = URL.createObjectURL(recordedBlob);
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative rounded-2xl overflow-hidden bg-secondary/50"
        >
          <video src={blobUrl} controls autoPlay playsInline preload="metadata" className="w-full aspect-[9/16] max-h-[50vh] object-cover" />
          <button
            onClick={() => { setRecordedBlob(null); setRecordingDuration(0); startCamera(); }}
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

    // Video recording active — fullscreen
    if (isRecording) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black"
        >
          <video
            ref={attachStream}
            autoPlay muted playsInline
            className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
          />
          {/* REC indicator */}
          <div className="absolute top-14 left-5 flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive text-white text-sm font-medium">
            <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 rounded-full bg-white" />
            REC · {formatDuration(recordingDuration)}
          </div>
          {/* Stop */}
          <div className="absolute bottom-0 inset-x-0 pb-12 pt-8 bg-gradient-to-t from-black/60 to-transparent flex justify-center">
            <button
              onClick={stopRecording}
              className="w-[72px] h-[72px] rounded-full bg-destructive flex items-center justify-center active:scale-95 transition-transform shadow-2xl"
            >
              <Square className="w-7 h-7 text-white fill-white" />
            </button>
          </div>
        </motion.div>
      );
    }

    // Camera live viewfinder — fullscreen
    if (isCameraActive) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black flex flex-col"
        >
          <video
            ref={attachStream}
            autoPlay muted playsInline
            className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Top bar */}
          <div className="absolute top-0 inset-x-0 pt-12 pb-4 px-5 bg-gradient-to-b from-black/50 to-transparent flex items-center justify-between">
            <button
              onClick={() => { stopCamera(); onClear(); }}
              className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={switchCameraFacing}
              className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform"
            >
              <SwitchCamera className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Bottom — single shutter button: tap = photo, hold = video */}
          <div className="absolute bottom-0 inset-x-0 pb-10 pt-8 bg-gradient-to-t from-black/60 to-transparent flex justify-center">
            <button
              onTouchStart={(e) => {
                e.preventDefault();
                isHoldingRef.current = false;
                holdTimerRef.current = setTimeout(() => {
                  isHoldingRef.current = true;
                  startVideoRecording();
                }, 400);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
                if (isHoldingRef.current) {
                  stopRecording();
                } else {
                  capturePhoto();
                }
                isHoldingRef.current = false;
              }}
              onMouseDown={() => {
                isHoldingRef.current = false;
                holdTimerRef.current = setTimeout(() => {
                  isHoldingRef.current = true;
                  startVideoRecording();
                }, 400);
              }}
              onMouseUp={() => {
                if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
                if (isHoldingRef.current) {
                  stopRecording();
                } else {
                  capturePhoto();
                }
                isHoldingRef.current = false;
              }}
              onContextMenu={(e) => e.preventDefault()}
              style={{ touchAction: 'none', WebkitTouchCallout: 'none', userSelect: 'none' } as React.CSSProperties}
              className="w-[76px] h-[76px] rounded-full bg-white flex items-center justify-center active:scale-95 transition-transform shadow-2xl select-none"
            >
              <div className="w-[64px] h-[64px] rounded-full border-[3px] border-black/10 pointer-events-none" />
            </button>
          </div>
        </motion.div>
      );
    }

    // Camera not yet active — loading/fallback
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/20 border-t-foreground/60 animate-spin" />
      </div>
    );
  }

  // ─── AUDIO MODE ───
  if (type === 'audio') {
    // Recorded, ready to upload
    if (recordedBlob) {
      const blobUrl = URL.createObjectURL(recordedBlob);
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl overflow-hidden bg-secondary/50">
          <div className="p-6 flex items-center gap-4">
            <audio src={blobUrl} controls preload="metadata" className="flex-1" />
          </div>
          <div className="p-4 flex items-center justify-between border-t border-border/30">
            <button onClick={clearRecording} className="px-4 py-2 rounded-full text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Trash2 className="w-4 h-4 inline mr-2" />
              Discard
            </button>
            <Button onClick={handleUploadRecording} disabled={isUploading} className="rounded-full bg-foreground text-background hover:bg-foreground/90">
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
              Use recording
            </Button>
          </div>
        </motion.div>
      );
    }

    // Recording active
    if (isRecording) {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative rounded-2xl overflow-hidden bg-secondary/50">
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
                  animate={{ height: [10, Math.random() * 30 + 10, 10] }}
                  transition={{ repeat: Infinity, duration: 0.5 + Math.random() * 0.5, delay: i * 0.05 }}
                  className="w-1 bg-foreground/40 rounded-full"
                />
              ))}
            </div>
          </div>
          <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive text-white text-sm font-medium">
            <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 rounded-full bg-white" />
            REC · {formatDuration(recordingDuration)}
          </div>
          <div className="absolute bottom-4 inset-x-0 flex justify-center">
            <button onClick={stopRecording} className="w-[72px] h-[72px] rounded-full bg-destructive flex items-center justify-center active:scale-95 transition-transform shadow-xl">
              <Square className="w-6 h-6 text-white fill-white" />
            </button>
          </div>
        </motion.div>
      );
    }

    // Default — start recording
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-12 px-8 bg-secondary/30 rounded-2xl border-2 border-dashed border-border/50">
        <div className="w-20 h-20 rounded-full bg-foreground/10 flex items-center justify-center mb-6">
          <Mic className="w-8 h-8 text-foreground" />
        </div>
        <p className="text-foreground font-medium mb-1">Record your voice</p>
        <p className="text-sm text-muted-foreground mb-6">Share your story in your own voice</p>
        <Button onClick={startAudioRecording} size="lg" className="rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-lg">
          <Mic className="w-4 h-4 mr-2" />
          Start recording
        </Button>
      </motion.div>
    );
  }

  // ─── UPLOAD MODE ───
  if (type === 'upload') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-12 px-8 bg-secondary/30 rounded-2xl border-2 border-dashed border-border/50">
        <div className="w-20 h-20 rounded-full bg-foreground/10 flex items-center justify-center mb-6">
          <Upload className="w-8 h-8 text-foreground" />
        </div>
        <p className="text-foreground font-medium mb-1">Upload media</p>
        <p className="text-sm text-muted-foreground mb-6">Photos, videos, or audio from your library</p>
        <Button onClick={() => fileInputRef.current?.click()} size="lg" className="rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-lg">
          <Upload className="w-4 h-4 mr-2" />
          Choose from library
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,audio/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </motion.div>
    );
  }

  return null;
}
