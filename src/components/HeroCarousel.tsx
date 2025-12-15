import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Video, Square, Camera, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CarouselSlide {
  type: 'intro' | 'text' | 'video' | 'voice';
  week: number;
  question: string;
  response?: string;
}

const slides: CarouselSlide[] = [
  {
    type: 'intro',
    week: 0,
    question: 'Who taught you how to love?'
  },
  {
    type: 'text',
    week: 15,
    question: 'What does home mean to you?',
    response: "Home isn't a place for me anymore—it's a feeling. It's the smell of my grandmother's kitchen, the sound of my kids laughing at something silly, the warmth of the morning sun coming through the window."
  },
  {
    type: 'video',
    week: 12,
    question: 'Who taught you how to love?'
  },
  {
    type: 'voice',
    week: 8,
    question: 'What belief have you changed your mind about?'
  }
];

const typeLabels: Record<string, string> = {
  intro: '',
  text: 'Text',
  video: 'Selfie Video',
  voice: 'Voice'
};

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const slide = slides[currentSlide];

  return (
    <div className="relative">
      {/* Type Badge */}
      {slide.type !== 'intro' && (
        <div className="absolute -top-2 right-0 z-20">
          <span className="bg-foreground text-background text-sm font-medium px-4 py-2 rounded-full">
            {typeLabels[slide.type]}
          </span>
        </div>
      )}

      {/* Main Card */}
      <div 
        className="bg-card rounded-3xl shadow-lg overflow-hidden border border-border/50"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {slide.type === 'intro' && <IntroSlide slide={slide} />}
            {slide.type === 'text' && <TextSlide slide={slide} />}
            {slide.type === 'video' && <VideoSlide slide={slide} />}
            {slide.type === 'voice' && <VoiceSlide slide={slide} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Stats Badge */}
      <div className="absolute -bottom-6 -left-6 bg-card rounded-xl shadow-md px-5 py-4 z-20 border border-border/50">
        <div className="text-3xl font-serif text-foreground">52</div>
        <div className="text-sm text-muted-foreground">questions/year</div>
      </div>

      {/* Carousel Dots */}
      <div className="flex items-center justify-center gap-2 mt-10">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`transition-all duration-300 rounded-full ${
              idx === currentSlide 
                ? 'w-8 h-2 bg-foreground' 
                : 'w-2 h-2 bg-foreground/20 hover:bg-foreground/40'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function IntroSlide({ slide }: { slide: CarouselSlide }) {
  return (
    <div className="p-8 pb-6">
      {/* Question Card */}
      <div className="bg-secondary/30 rounded-2xl p-6 mb-6">
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
          This week's question
        </div>
        <h3 className="text-2xl font-serif text-foreground italic">
          {slide.question}
        </h3>
      </div>
      
      {/* Response Mode Buttons */}
      <div className="grid grid-cols-3 gap-3">
        <button className="flex flex-col items-center justify-center gap-2 py-6 px-4 rounded-2xl border border-border bg-card hover:bg-secondary/20 transition-colors">
          <MessageSquare className="w-7 h-7 text-muted-foreground" />
          <span className="text-sm text-muted-foreground font-medium">Text</span>
        </button>
        <button className="flex flex-col items-center justify-center gap-2 py-6 px-4 rounded-2xl border border-border bg-card hover:bg-secondary/20 transition-colors">
          <Mic className="w-7 h-7 text-muted-foreground" />
          <span className="text-sm text-muted-foreground font-medium">Voice</span>
        </button>
        <button className="flex flex-col items-center justify-center gap-2 py-6 px-4 rounded-2xl border border-border bg-card hover:bg-secondary/20 transition-colors">
          <Video className="w-7 h-7 text-muted-foreground" />
          <span className="text-sm text-muted-foreground font-medium">Video</span>
        </button>
      </div>
    </div>
  );
}

function TextSlide({ slide }: { slide: CarouselSlide }) {
  const [displayedText, setDisplayedText] = useState('');
  const fullText = slide.response || '';
  
  useEffect(() => {
    setDisplayedText('');
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 35);
    return () => clearInterval(interval);
  }, [fullText]);

  return (
    <div className="p-8">
      {/* Question Header */}
      <div className="bg-secondary/30 rounded-2xl p-6 mb-4">
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
          Week {slide.week}
        </div>
        <h3 className="text-xl font-serif text-foreground font-medium">
          {slide.question}
        </h3>
      </div>
      
      {/* Typing Response Area */}
      <div className="bg-secondary/20 rounded-2xl p-6 min-h-[180px] mb-4 border border-border/30">
        <p className="text-foreground leading-relaxed">
          {displayedText}
          <span className="inline-block w-0.5 h-5 bg-foreground ml-0.5 animate-pulse align-middle" />
        </p>
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="w-9 h-9 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors">
            <Mic className="w-4 h-4" />
          </button>
          <button className="w-9 h-9 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors">
            <Camera className="w-4 h-4" />
          </button>
        </div>
        <Button className="bg-foreground text-background hover:bg-foreground/90 rounded-lg px-6">
          Save
        </Button>
      </div>
    </div>
  );
}

function VideoSlide({ slide }: { slide: CarouselSlide }) {
  const [timer, setTimer] = useState(47);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative">
      {/* Video Background - Woman recording selfie */}
      <div 
        className="aspect-[4/5] bg-cover bg-center relative rounded-2xl m-3 overflow-hidden"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80)',
          backgroundColor: 'hsl(var(--muted))'
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60" />
        
        {/* Question Header */}
        <div className="absolute top-6 left-6 right-20">
          <div className="text-xs text-white/70 uppercase tracking-wider mb-1">
            Week {slide.week}
          </div>
          <h3 className="text-xl font-serif text-white">
            {slide.question}
          </h3>
        </div>

        {/* Recording Timer */}
        <div className="absolute top-6 right-4 flex items-center gap-2 bg-red-500 text-white text-sm px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          {formatTime(timer)}
        </div>

        {/* Controls */}
        <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-8">
          <button className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/40 transition-colors border border-white/20">
            <Camera className="w-5 h-5" />
          </button>
          <button className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-lg">
            <Square className="w-6 h-6 fill-white" />
          </button>
          <button className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/40 transition-colors border border-white/20">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h6v6M14 10l6.1-6.1M9 21H3v-6M10 14l-6.1 6.1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function VoiceSlide({ slide }: { slide: CarouselSlide }) {
  const [timer, setTimer] = useState(83);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative">
      {/* Background Image - Person with headphones */}
      <div 
        className="aspect-[4/5] bg-cover bg-center relative rounded-2xl m-3 overflow-hidden"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80)',
          backgroundColor: 'hsl(var(--muted))'
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
        
        {/* Question Header */}
        <div className="absolute top-6 left-6 right-6">
          <div className="text-xs text-white/70 uppercase tracking-wider mb-1">
            Week {slide.week}
          </div>
          <h3 className="text-xl font-serif text-white">
            {slide.question}
          </h3>
        </div>

        {/* Audio Waveform Box */}
        <div className="absolute bottom-28 left-4 right-4">
          <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/80 text-sm">Recording...</span>
              <span className="text-white/80 text-sm font-medium">{formatTime(timer)}</span>
            </div>
            <WaveformAnimation />
          </div>
        </div>

        {/* Stop Button */}
        <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center">
          <button className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-lg">
            <Square className="w-5 h-5 fill-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

function WaveformAnimation() {
  return (
    <div className="flex items-center justify-center gap-[3px] h-10">
      {Array.from({ length: 35 }).map((_, i) => {
        const baseHeight = Math.sin(i * 0.3) * 50 + 50;
        return (
          <motion.div
            key={i}
            className="w-[3px] bg-white/80 rounded-full"
            animate={{
              height: [4, baseHeight * 0.35 + 4, 4],
            }}
            transition={{
              duration: 0.4 + Math.random() * 0.4,
              repeat: Infinity,
              delay: i * 0.015,
              ease: "easeInOut"
            }}
          />
        );
      })}
    </div>
  );
}
