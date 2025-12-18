import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  PenTool, 
  Mic, 
  Video, 
  Lock, 
  Loader2,
  Check,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import MediaUploader from './MediaUploader';

interface Question {
  id: string;
  question: string;
  category: string;
  depth: string | null;
}

export default function HomePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [response, setResponse] = useState('');
  const [responseType, setResponseType] = useState<'text' | 'audio' | 'video' | 'photo'>('text');
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [entriesCount, setEntriesCount] = useState(0);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [showSavedConfirmation, setShowSavedConfirmation] = useState(false);

  useEffect(() => {
    const fetchQuestion = async () => {
      if (!user) return;
      
      setIsLoadingQuestion(true);
      try {
        const { data: responses } = await supabase
          .from('responses')
          .select('question_id')
          .eq('user_id', user.id);
        
        setEntriesCount(responses?.length || 0);
        const answeredIds = responses?.map(r => r.question_id).filter(Boolean) as string[] || [];
        
        const { data: questions, error } = await supabase
          .from('questions')
          .select('*');
        
        if (error) throw error;
        
        if (questions && questions.length > 0) {
          const unansweredQuestions = questions.filter(q => !answeredIds.includes(q.id));
          
          if (unansweredQuestions.length > 0) {
            const randomIndex = Math.floor(Math.random() * unansweredQuestions.length);
            setCurrentQuestion(unansweredQuestions[randomIndex]);
          } else {
            const randomIndex = Math.floor(Math.random() * questions.length);
            setCurrentQuestion(questions[randomIndex]);
          }
        }
      } catch (error) {
        console.error('Error fetching question:', error);
      } finally {
        setIsLoadingQuestion(false);
      }
    };
    
    fetchQuestion();
  }, [user]);

  // Clear media when switching response types
  useEffect(() => {
    setMediaUrl(null);
    setResponse('');
  }, [responseType]);

  const handleSubmit = async () => {
    if (!currentQuestion || !user) return;
    
    // For text, require content OR mediaUrl. For media modes, require mediaUrl
    if (responseType === 'text' && !response.trim() && !mediaUrl) return;
    if ((responseType === 'audio' || responseType === 'video' || responseType === 'photo') && !mediaUrl) return;
    
    setIsSubmitting(true);
    try {
      // Determine content_type based on what's being submitted
      let contentType = responseType;
      if (responseType === 'text' && mediaUrl && !response.trim()) {
        contentType = 'photo';
      }
      
      const insertData: any = {
        user_id: user.id,
        question_id: currentQuestion.id,
        content: response.trim() || `${contentType} response`,
        content_type: contentType,
        privacy: 'private'
      };
      
      if (response.trim()) {
        insertData.word_count = response.trim().split(/\s+/).length;
      }
      
      if (responseType === 'audio' && mediaUrl) {
        insertData.audio_url = mediaUrl;
      }
      
      if (responseType === 'video' && mediaUrl) {
        insertData.video_url = mediaUrl;
      }
      
      // Handle photo attachment in text mode or photo mode
      if ((responseType === 'photo' || responseType === 'text') && mediaUrl) {
        insertData.photo_url = mediaUrl;
      }
      
      const { error } = await supabase
        .from('responses')
        .insert(insertData);
      
      if (error) throw error;
      
      setIsSubmitted(true);
      setEntriesCount(prev => prev + 1);
      toast({
        title: 'Preserved',
        description: 'Your response has been saved to your legacy.'
      });
      
      setTimeout(() => {
        setResponse('');
        setMediaUrl(null);
        setIsSubmitted(false);
      }, 3000);
      
    } catch (error: any) {
      console.error('Error saving response:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitWithConfirmation = async () => {
    await handleSubmit();
    if (!isSubmitting) {
      setShowSavedConfirmation(true);
      setTimeout(() => setShowSavedConfirmation(false), 3000);
    }
  };

  const wordCount = response.trim().split(/\s+/).filter(Boolean).length;
  const weekNumber = Math.floor(entriesCount / 1) + 1;

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col">
      {/* Header with contextual framing */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <p className="text-sm text-muted-foreground mb-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="text-3xl md:text-4xl text-foreground font-serif">
          Week {weekNumber} of your journey
        </h1>
        <p className="text-sm text-muted-foreground mt-1">This week's reflection</p>
        
        <p className="text-xs text-muted-foreground/60 mt-3">
          {entriesCount === 0 
            ? `Week ${weekNumber} · Your journey starts here`
            : `Week ${weekNumber} · ${entriesCount} ${entriesCount === 1 ? 'entry' : 'entries'}`
          }
        </p>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col max-w-2xl">
        <AnimatePresence mode="wait">
          {isLoadingQuestion ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex items-center justify-center"
            >
              <div className="w-8 h-8 rounded-full border-2 border-muted-foreground/20 border-t-foreground animate-spin" />
            </motion.div>
          ) : isSubmitted ? (
            <motion.div
              key="submitted"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex-1 flex flex-col items-center justify-center text-center py-20"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className="w-16 h-16 rounded-full bg-foreground flex items-center justify-center mb-6"
              >
                <Check className="w-8 h-8 text-background" />
              </motion.div>
              <h2 className="text-2xl font-serif text-foreground mb-2">Preserved</h2>
              <p className="text-muted-foreground">This moment is now part of your legacy.</p>
            </motion.div>
          ) : currentQuestion ? (
            <motion.div
              key="question"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col"
            >
              {/* Question */}
              <div className="mb-8">
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  This week's question
                </span>
                <h2 className="text-2xl md:text-3xl font-serif text-foreground leading-relaxed">
                  {currentQuestion.question}
                </h2>
              </div>

              {/* Response Type Tabs - Segmented Control */}
              <div className="inline-flex bg-secondary/50 p-1 rounded-xl mb-6 border border-border/30">
                {[
                  { key: 'text', label: 'Write', icon: PenTool },
                  { key: 'audio', label: 'Record', icon: Mic },
                  { key: 'video', label: 'Video', icon: Video },
                  { key: 'photo', label: 'Photo', icon: ImageIcon },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setResponseType(key as typeof responseType)}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      responseType === key
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Response Area */}
              <div className="flex-1">
                {responseType === 'text' && (
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Start answering the question..."
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      autoFocus
                      className="min-h-[200px] bg-secondary/30 border border-border/50 rounded-2xl resize-none text-lg leading-relaxed placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:border-foreground/30 focus-visible:bg-secondary/50 focus-visible:shadow-sm px-4 py-4 transition-all duration-200"
                    />
                    
                    {/* Photo attachment option */}
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 hover:bg-secondary/30 cursor-pointer transition-all duration-200">
                        <ImageIcon className="w-4 h-4" />
                        <span>Add photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file || !user) return;
                            
                            const fileExt = file.name.split('.').pop();
                            const fileName = `${user.id}/photo_${Date.now()}.${fileExt}`;
                            
                            const { data, error } = await supabase.storage
                              .from('user-media')
                              .upload(fileName, file);
                            
                            if (error) {
                              toast({
                                variant: 'destructive',
                                title: 'Upload failed',
                                description: error.message
                              });
                              return;
                            }
                            
                            const { data: { publicUrl } } = supabase.storage
                              .from('user-media')
                              .getPublicUrl(fileName);
                            
                            setMediaUrl(publicUrl);
                          }}
                        />
                      </label>
                      
                      {mediaUrl && (
                        <div className="relative">
                          <img 
                            src={mediaUrl} 
                            alt="Attached" 
                            className="h-12 w-12 object-cover rounded-lg border border-border/50"
                          />
                          <button
                            onClick={() => setMediaUrl(null)}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs hover:bg-destructive/90"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground/70">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Private by default</span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm text-muted-foreground">{wordCount} words</span>
                      <Button 
                        onClick={handleSubmitWithConfirmation}
                        disabled={(!response.trim() && !mediaUrl) || isSubmitting}
                        className={`rounded-full px-8 h-12 font-medium text-base transition-all duration-200 ${
                          (response.trim() || mediaUrl)
                            ? 'bg-foreground text-background hover:bg-foreground/90 shadow-lg shadow-foreground/10 hover:shadow-xl hover:shadow-foreground/15'
                            : 'bg-muted text-muted-foreground cursor-not-allowed'
                        }`}
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Save response'
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {responseType === 'audio' && (
                  <div className="space-y-6">
                    {!mediaUrl ? (
                      <div className="text-center py-12 bg-secondary/30 rounded-2xl border border-border/50">
                        <Mic className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                        <MediaUploader
                          type="audio"
                          onUpload={setMediaUrl}
                          onClear={() => setMediaUrl(null)}
                          mediaUrl={mediaUrl}
                        />
                      </div>
                    ) : (
                      <>
                        <MediaUploader
                          type="audio"
                          onUpload={setMediaUrl}
                          onClear={() => setMediaUrl(null)}
                          mediaUrl={mediaUrl}
                        />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground/70">
                            <Lock className="w-3.5 h-3.5" />
                            <span>Private by default</span>
                          </div>
                          <Button 
                            onClick={handleSubmitWithConfirmation}
                            disabled={isSubmitting}
                            className="rounded-full px-8 h-12 font-medium text-base bg-foreground text-background hover:bg-foreground/90 shadow-lg"
                          >
                            {isSubmitting ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              'Save recording'
                            )}
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {responseType === 'video' && (
                  <div className="space-y-6">
                    {!mediaUrl ? (
                      <div className="text-center py-12 bg-secondary/30 rounded-2xl border border-border/50">
                        <Video className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                        <MediaUploader
                          type="video"
                          onUpload={setMediaUrl}
                          onClear={() => setMediaUrl(null)}
                          mediaUrl={mediaUrl}
                        />
                      </div>
                    ) : (
                      <>
                        <MediaUploader
                          type="video"
                          onUpload={setMediaUrl}
                          onClear={() => setMediaUrl(null)}
                          mediaUrl={mediaUrl}
                        />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground/70">
                            <Lock className="w-3.5 h-3.5" />
                            <span>Private by default</span>
                          </div>
                          <Button 
                            onClick={handleSubmitWithConfirmation}
                            disabled={isSubmitting}
                            className="rounded-full px-8 h-12 font-medium text-base bg-foreground text-background hover:bg-foreground/90 shadow-lg"
                          >
                            {isSubmitting ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              'Save video'
                            )}
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {responseType === 'photo' && (
                  <div className="space-y-6">
                    {!mediaUrl ? (
                      <div className="text-center py-12 bg-secondary/30 rounded-2xl border border-border/50">
                        <ImageIcon className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                        <MediaUploader
                          type="photo"
                          onUpload={setMediaUrl}
                          onClear={() => setMediaUrl(null)}
                          mediaUrl={mediaUrl}
                        />
                      </div>
                    ) : (
                      <>
                        <MediaUploader
                          type="photo"
                          onUpload={setMediaUrl}
                          onClear={() => setMediaUrl(null)}
                          mediaUrl={mediaUrl}
                        />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground/70">
                            <Lock className="w-3.5 h-3.5" />
                            <span>Private by default</span>
                          </div>
                          <Button 
                            onClick={handleSubmitWithConfirmation}
                            disabled={isSubmitting}
                            className="rounded-full px-8 h-12 font-medium text-base bg-foreground text-background hover:bg-foreground/90 shadow-lg"
                          >
                            {isSubmitting ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              'Save photo'
                            )}
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex items-center justify-center text-center"
            >
              <div>
                <p className="text-muted-foreground">No questions available.</p>
                <p className="text-sm text-muted-foreground/70">Check back soon.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}