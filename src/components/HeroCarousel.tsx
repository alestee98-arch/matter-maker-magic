import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, Mic, Square } from "lucide-react";
import selfieVideoImage from "@/assets/hero-selfie-video.jpg";
import voiceRecordingImage from "@/assets/hero-voice-recording.jpg";

interface CarouselSlide {
  type: "text" | "video" | "voice";
  week: number;
  question: string;
  response?: string;
}

const typeLabels: Record<CarouselSlide["type"], string> = {
  text: "Text",
  video: "Video",
  voice: "Voice",
};

const slides: CarouselSlide[] = [
  {
    type: "video",
    week: 12,
    question: "Who taught you how to love?",
  },
  {
    type: "voice",
    week: 8,
    question: "What belief have you changed your mind about?",
  },
  {
    type: "text",
    week: 15,
    question: "What does home mean to you?",
    response:
      "Home isn't a place for me anymore—it's a feeling. It's the smell of my grandmother's kitchen, the s",
  },
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => window.clearInterval(interval);
  }, []);

  const slide = slides[currentSlide];

  return (
    <div className="relative">
      {/* Type Badge */}
      <div className="absolute -top-2 right-0 z-20">
        <span className="bg-foreground text-background text-sm font-medium px-4 py-2 rounded-full">
          {typeLabels[slide.type]}
        </span>
      </div>

      {/* Device Frame */}
      <div className="bg-card rounded-3xl shadow-lg overflow-hidden border border-border/50">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            transition={{ duration: 0.28 }}
          >
            {slide.type === "text" && <TextSlide slide={slide} />}
            {slide.type === "video" && <VideoSlide slide={slide} />}
            {slide.type === "voice" && <VoiceSlide slide={slide} />}
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
                ? "w-8 h-2 bg-foreground"
                : "w-2 h-2 bg-foreground/20 hover:bg-foreground/40"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function TextSlide({ slide }: { slide: CarouselSlide }) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    const fullText = slide.response ?? "";
    setDisplayedText("");

    let i = 0;
    const interval = window.setInterval(() => {
      i += 1;
      setDisplayedText(fullText.slice(0, i));
      if (i >= fullText.length) window.clearInterval(interval);
    }, 42);

    return () => window.clearInterval(interval);
  }, [slide.response]);

  return (
    <div className="p-7">
      <div className="bg-secondary/20 rounded-2xl p-7 border border-border/30">
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
          Week {slide.week}
        </div>
        <h3 className="text-2xl font-serif text-foreground mb-6">
          {slide.question}
        </h3>

        <div className="bg-background rounded-2xl p-6 min-h-[320px] border border-border">
          <p className="text-foreground leading-relaxed">
            {displayedText}
            <span className="inline-block w-0.5 h-5 bg-foreground ml-0.5 animate-pulse align-middle" />
          </p>
        </div>

        <div className="flex items-center justify-between mt-5">
          <div className="flex items-center gap-3">
            <button
              className="w-9 h-9 rounded-lg bg-secondary/60 flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"
              aria-label="Switch to voice"
              type="button"
            >
              <Mic className="w-4 h-4" />
            </button>
            <button
              className="w-9 h-9 rounded-lg bg-secondary/60 flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"
              aria-label="Switch to video"
              type="button"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <button
            className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-6 py-2 text-sm font-medium"
            type="button"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function VideoSlide({ slide }: { slide: CarouselSlide }) {
  return (
    <div className="p-4">
      <div className="aspect-[4/5] relative rounded-2xl overflow-hidden">
        <img
          src={selfieVideoImage}
          alt="Selfie video response preview showing someone recording a weekly question answer"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
          decoding="async"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-transparent to-foreground/80" />

        <div className="absolute top-6 left-6 right-20">
          <div className="text-xs text-background/70 uppercase tracking-wider mb-1">
            Week {slide.week}
          </div>
          <h3 className="text-2xl font-serif text-background">{slide.question}</h3>
        </div>

        <div className="absolute top-6 right-4 flex items-center gap-2 bg-destructive text-destructive-foreground text-sm px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-destructive-foreground animate-pulse" />
          0:47
        </div>

        <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-8">
          <button
            className="w-12 h-12 rounded-full bg-foreground/30 backdrop-blur-sm flex items-center justify-center text-background hover:bg-foreground/40 transition-colors border border-background/20"
            aria-label="Camera"
            type="button"
          >
            <Camera className="w-5 h-5" />
          </button>

          <button
            className="w-16 h-16 rounded-full bg-destructive flex items-center justify-center text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-lg"
            aria-label="Stop recording"
            type="button"
          >
            <Square className="w-6 h-6 fill-current" />
          </button>

          <button
            className="w-12 h-12 rounded-full bg-foreground/30 backdrop-blur-sm flex items-center justify-center text-background hover:bg-foreground/40 transition-colors border border-background/20"
            aria-label="Flip camera"
            type="button"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M16 3h5v5" />
              <path d="M21 3l-6 6" />
              <path d="M8 21H3v-5" />
              <path d="M3 21l6-6" />
              <path d="M12 7a5 5 0 015 5" />
              <path d="M12 17a5 5 0 01-5-5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function VoiceSlide({ slide }: { slide: CarouselSlide }) {
  const waveform = useMemo(() => {
    return Array.from({ length: 34 }).map((_, i) => ({
      id: i,
      height: Math.sin(i * 0.35) * 50 + 50,
      duration: 0.45 + Math.random() * 0.35,
      delay: i * 0.015,
    }));
  }, []);

  return (
    <div className="p-4">
      <div className="aspect-[4/5] relative rounded-2xl overflow-hidden">
        <img
          src={voiceRecordingImage}
          alt="Voice response preview showing someone recording an audio answer to a weekly question"
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/30 to-foreground/85" />

        <div className="absolute top-6 left-6 right-6">
          <div className="text-xs text-background/70 uppercase tracking-wider mb-1">
            Week {slide.week}
          </div>
          <h3 className="text-2xl font-serif text-background">{slide.question}</h3>
        </div>

        <div className="absolute bottom-28 left-4 right-4">
          <div className="bg-foreground/30 backdrop-blur-md rounded-2xl p-4 border border-background/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-background/80 text-sm">Recording...</span>
              <span className="text-background/80 text-sm font-medium">1:23</span>
            </div>

            <div className="flex items-center justify-center gap-[3px] h-10">
              {waveform.map((w) => (
                <motion.div
                  key={w.id}
                  className="w-[3px] bg-background/80 rounded-full"
                  animate={{ height: [4, w.height * 0.35 + 4, 4] }}
                  transition={{
                    duration: w.duration,
                    repeat: Infinity,
                    delay: w.delay,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center">
          <button
            className="w-14 h-14 rounded-full bg-destructive flex items-center justify-center text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-lg"
            aria-label="Stop recording"
            type="button"
          >
            <Square className="w-5 h-5 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
}
