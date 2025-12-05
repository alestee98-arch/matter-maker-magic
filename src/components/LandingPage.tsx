import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Mic, Video, MessageCircle, Heart, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LandingPageProps {
  onStartJourney: () => void;
  onTryDemo: () => void;
}

const questions = [
  "What do you want your children to know about love?",
  "What was the happiest moment of your life?",
  "What would you tell your younger self?",
  "How do you want to be remembered?",
  "What lessons took you a lifetime to learn?",
];

export default function LandingPage({ onStartJourney, onTryDemo }: LandingPageProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentQuestion((prev) => (prev + 1) % questions.length);
        setIsVisible(true);
      }, 500);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-premium-blue/5 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center items-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-8"
          >
            <span className="text-sm uppercase tracking-[0.3em] text-muted-foreground font-medium">
              Matter
            </span>
          </motion.div>

          {/* Main headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-light text-foreground leading-tight mb-6">
            Your voice.{' '}
            <span className="text-accent">Forever.</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-2xl mx-auto mb-12">
            Preserve your essence through meaningful conversations. 
            Let future generations know who you truly were.
          </p>

          {/* Rotating question preview */}
          <div className="h-24 flex items-center justify-center mb-12">
            <AnimatePresence mode="wait">
              {isVisible && (
                <motion.div
                  key={currentQuestion}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl px-8 py-6 max-w-xl"
                >
                  <p className="text-lg md:text-xl text-foreground/90 italic font-light">
                    "{questions[currentQuestion]}"
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onStartJourney}
              size="lg"
              className="bg-foreground text-background hover:bg-foreground/90 text-lg px-8 py-6 rounded-full"
            >
              Begin Your Legacy
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              onClick={onTryDemo}
              variant="outline"
              size="lg"
              className="border-border text-foreground hover:bg-card text-lg px-8 py-6 rounded-full"
            >
              Experience a Memory
            </Button>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center pt-2"
          >
            <div className="w-1 h-2 bg-muted-foreground/50 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* How it works */}
      <section className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-5xl font-light text-foreground mb-6">
              How Matter Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Through thoughtful questions answered over time, we capture the essence of who you are.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: MessageCircle,
                title: "Answer",
                description: "Each week, respond to a meaningful question. Use your voice, video, or text.",
                color: "accent"
              },
              {
                icon: Heart,
                title: "Preserve",
                description: "Your responses build a living archive—your values, stories, wisdom, and voice.",
                color: "premium-purple"
              },
              {
                icon: Play,
                title: "Connect",
                description: "Future generations can ask questions and receive answers in your voice.",
                color: "premium-blue"
              }
            ].map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center"
              >
                <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-${step.color}/10 flex items-center justify-center`}>
                  <step.icon className={`w-10 h-10 text-${step.color}`} />
                </div>
                <h3 className="text-2xl font-medium text-foreground mb-4">{step.title}</h3>
                <p className="text-muted-foreground text-lg">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Emotional Demo Section */}
      <section className="relative py-32 px-6 bg-card/30">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-light text-foreground mb-6">
              Imagine this moment
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Years from now, your grandchild wants to know you. They ask a question, and they hear your voice.
            </p>
          </motion.div>

          {/* Demo conversation mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-card border border-border rounded-3xl p-8 md:p-12"
          >
            <div className="space-y-8">
              {/* Grandchild's question */}
              <div className="flex justify-end">
                <div className="bg-accent/20 rounded-2xl rounded-br-sm px-6 py-4 max-w-md">
                  <p className="text-foreground">
                    Grandma, what advice would you give me about finding love?
                  </p>
                </div>
              </div>

              {/* Grandmother's AI response */}
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/30 to-premium-blue/30 flex-shrink-0 flex items-center justify-center">
                  <span className="text-lg">👵</span>
                </div>
                <div className="bg-secondary rounded-2xl rounded-bl-sm px-6 py-4 max-w-lg">
                  <p className="text-foreground/90 mb-4">
                    "Oh sweetheart, love isn't about finding someone perfect. It's about finding someone whose imperfections you can live with—and who can live with yours. Your grandfather drove me crazy sometimes, but he was my favorite person to be crazy with."
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Play className="w-4 h-4" />
                    <span>Playing in grandmother's voice</span>
                  </div>
                </div>
              </div>

              {/* Audio waveform visualization */}
              <div className="flex justify-center">
                <div className="flex items-center gap-1">
                  {[...Array(40)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-accent/60 rounded-full"
                      animate={{
                        height: [8, 8 + Math.sin(i * 0.3) * 20 + Math.random() * 16, 8],
                      }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: i * 0.05,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Vision */}
      <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <p className="text-2xl md:text-3xl lg:text-4xl font-light text-foreground leading-relaxed mb-12">
              "In the future, your closest companion may be an AI. 
              <span className="text-accent"> Why not have it be someone who once loved you more than anything in the world?</span>"
            </p>
            
            <div className="flex flex-col items-center gap-8">
              <Button
                onClick={onStartJourney}
                size="lg"
                className="bg-foreground text-background hover:bg-foreground/90 text-lg px-10 py-6 rounded-full"
              >
                Start Preserving Your Legacy
              </Button>
              <p className="text-muted-foreground">
                One question per week. Your voice, your values, forever.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Matter</span>
          <p className="text-muted-foreground text-sm">The fourth pillar of identity</p>
        </div>
      </footer>
    </div>
  );
}