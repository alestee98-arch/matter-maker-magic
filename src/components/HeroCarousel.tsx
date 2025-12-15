import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Video, Square, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CarouselSlide {
  type: 'text' | 'video' | 'voice';
  week: number;
  question: string;
}

const slides: CarouselSlide[] = [
  {
    type: 'text',
    week: 15,
    question: 'What does home mean to you?'
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

const typeLabels = {
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
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const slide = slides[currentSlide];

  return (
    <div className="relative">
      {/* Type Badge */}
      <div className="absolute -top-2 right-0 z-20">
        <span className="bg-foreground text-background text-sm font-medium px-4 py-2 rounded-full">
          {typeLabels[slide.type]}
        </span>
      </div>

      {/* Main Card */}
      <div 
        className="bg-card rounded-3xl shadow-lg overflow-hidden"
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
            {slide.type === 'text' && <TextSlide slide={slide} />}
            {slide.type === 'video' && <VideoSlide slide={slide} />}
            {slide.type === 'voice' && <VoiceSlide slide={slide} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Stats Badge */}
      <div className="absolute -bottom-6 -left-6 bg-card rounded-xl shadow-md px-5 py-4 z-20">
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

function TextSlide({ slide }: { slide: CarouselSlide }) {
  return (
    <div className="p-8">
      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
        Week {slide.week}
      </div>
      <h3 className="text-xl font-serif text-foreground mb-6">
        {slide.question}
      </h3>
      
      <div className="bg-secondary/50 rounded-2xl p-6 min-h-[200px] mb-4">
        <p className="text-foreground leading-relaxed">
          Home isn't a place for me anymore—it's a feeling. It's the smell of my grandmother's kitchen, the sound of my kids laughing at some
          <span className="animate-pulse">|</span>
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-secondary/80 transition-colors">
            <Mic className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-secondary/80 transition-colors">
            <Video className="w-5 h-5" />
          </button>
        </div>
        <Button className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-6">
          Save
        </Button>
      </div>
    </div>
  );
}

function VideoSlide({ slide }: { slide: CarouselSlide }) {
  return (
    <div className="relative">
      {/* Video Background */}
      <div 
        className="aspect-[4/5] bg-cover bg-center relative"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80)',
          backgroundColor: 'hsl(var(--foreground))'
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
        
        {/* Question Header */}
        <div className="absolute top-6 left-6 right-6">
          <div className="text-xs text-white/70 uppercase tracking-wider mb-1">
            Week {slide.week}
          </div>
          <h3 className="text-xl font-serif text-white">
            {slide.question}
          </h3>
        </div>

        {/* Recording Timer */}
        <div className="absolute top-6 right-6 flex items-center gap-2 bg-red-500 text-white text-sm px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          0:47
        </div>

        {/* Controls */}
        <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-8">
          <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors">
            <Camera className="w-5 h-5" />
          </button>
          <button className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors">
            <Square className="w-6 h-6 fill-white" />
          </button>
          <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 3v1m0 16v1M5.6 5.6l.7.7m11.4 11.4l.7.7M3 12h1m16 0h1M5.6 18.4l.7-.7m11.4-11.4l.7-.7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function VoiceSlide({ slide }: { slide: CarouselSlide }) {
  return (
    <div className="relative">
      {/* Background Image */}
      <div 
        className="aspect-[4/5] bg-cover bg-center relative"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80)',
          backgroundColor: 'hsl(var(--foreground))'
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70" />
        
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
        <div className="absolute bottom-28 left-6 right-6">
          <div className="bg-black/50 backdrop-blur-md rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/80 text-sm">Recording...</span>
              <span className="text-white/80 text-sm">1:23</span>
            </div>
            <WaveformAnimation />
          </div>
        </div>

        {/* Stop Button */}
        <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center">
          <button className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors">
            <Square className="w-6 h-6 fill-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

function WaveformAnimation() {
  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {Array.from({ length: 40 }).map((_, i) => {
        const height = Math.random() * 100;
        return (
          <motion.div
            key={i}
            className="w-1 bg-white/80 rounded-full"
            animate={{
              height: [4, height * 0.4 + 4, 4],
            }}
            transition={{
              duration: 0.5 + Math.random() * 0.5,
              repeat: Infinity,
              delay: i * 0.02,
            }}
          />
        );
      })}
    </div>
  );
}
