import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, MessageSquare, Shield, Heart, ChevronRight, Mic, Video, FileText, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MatterLogo from '@/components/MatterLogo';

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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuestion((prev) => (prev + 1) % questions.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <MatterLogo size="md" />
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
            <a href="#services" className="text-muted-foreground hover:text-foreground transition-colors">Services</a>
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">About</a>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-foreground">Sign In</Button>
            <Button onClick={onStartJourney} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section - 23andMe inspired gradient */}
      <section className="relative min-h-screen bg-hero-gradient pt-16">
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl text-foreground leading-tight mb-6">
                Preserve what{' '}
                <span className="text-primary">matters</span> most.
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-lg">
                Your voice, your stories, your wisdom—captured forever so future generations can truly know who you were.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button 
                  onClick={onStartJourney}
                  size="lg" 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full text-lg px-8 h-14"
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  onClick={onTryDemo}
                  variant="outline" 
                  size="lg"
                  className="rounded-full text-lg px-8 h-14 border-2"
                >
                  See How It Works
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>100% Private</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>You Control Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Free to Start</span>
                </div>
              </div>
            </motion.div>

            {/* Right - Question preview card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-card rounded-3xl shadow-premium p-8 border border-border">
                <div className="text-sm text-muted-foreground mb-4 uppercase tracking-wide">This week's question</div>
                
                <AnimatePresence mode="wait">
                  <motion.h2
                    key={currentQuestion}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="text-2xl md:text-3xl text-foreground mb-8 min-h-[80px]"
                  >
                    {questions[currentQuestion]}
                  </motion.h2>
                </AnimatePresence>

                <div className="flex gap-3">
                  <button className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="text-foreground font-medium">Text</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors">
                    <Mic className="h-5 w-5 text-accent" />
                    <span className="text-foreground font-medium">Audio</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors">
                    <Video className="h-5 w-5 text-matter-gold" />
                    <span className="text-foreground font-medium">Video</span>
                  </button>
                </div>

                {/* Progress dots */}
                <div className="flex justify-center gap-2 mt-8">
                  {questions.map((_, idx) => (
                    <div 
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        idx === currentQuestion ? 'bg-primary' : 'bg-border'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Floating stats */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="absolute -right-4 top-1/4 bg-card rounded-2xl shadow-lg p-4 border border-border"
              >
                <div className="text-2xl font-bold text-primary">52</div>
                <div className="text-xs text-muted-foreground">Questions/Year</div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute -left-4 bottom-1/4 bg-card rounded-2xl shadow-lg p-4 border border-border"
              >
                <div className="text-2xl font-bold text-accent">∞</div>
                <div className="text-xs text-muted-foreground">Generations</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section - 23andMe card style */}
      <section id="services" className="py-24 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl text-foreground mb-4">Our Services</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose how you want to preserve and share your legacy
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Personal Archive',
                subtitle: 'For You',
                description: 'Build your personal collection of stories, wisdom, and memories. Revisit them anytime.',
                price: 'Free',
                color: 'primary',
                features: ['52 weekly questions', 'Text, audio & video', 'Private by default', 'Searchable archive']
              },
              {
                title: 'Family Circle',
                subtitle: 'Share with Loved Ones',
                description: 'Share selected memories with family members during your lifetime.',
                price: '$9/mo',
                color: 'accent',
                popular: true,
                features: ['Everything in Personal', 'Share with up to 10 people', 'Family tree integration', 'Collaborative memories']
              },
              {
                title: 'Legacy Mode',
                subtitle: 'Forever Preserved',
                description: 'Create an AI presence that future generations can interact with in your voice.',
                price: '$19/mo',
                color: 'matter-gold',
                features: ['Everything in Family', 'AI voice synthesis', 'Interactive conversations', 'Digital executor controls']
              }
            ].map((service, idx) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`relative bg-card rounded-3xl p-8 border-2 transition-all card-hover ${
                  service.popular ? 'border-primary shadow-lg' : 'border-border'
                }`}
              >
                {service.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-sm font-medium px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 bg-${service.color}/10 text-${service.color}`}>
                  {service.subtitle}
                </div>
                
                <h3 className="text-2xl text-foreground mb-2">{service.title}</h3>
                <p className="text-muted-foreground mb-6">{service.description}</p>
                
                <div className="mb-6">
                  <span className="text-3xl font-bold text-foreground">{service.price}</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-muted-foreground">
                      <Check className={`h-5 w-5 text-${service.color}`} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={onStartJourney}
                  className={`w-full rounded-full h-12 ${
                    service.popular 
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  Get Started
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 px-6 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl text-foreground mb-4">How Matter Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simple steps to preserve your legacy for generations to come
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: MessageSquare,
                title: 'Answer Weekly Questions',
                description: 'Each week, receive a thoughtful question designed to capture your unique perspective, values, and stories.'
              },
              {
                step: '02',
                icon: Shield,
                title: 'Control Your Privacy',
                description: 'Decide what stays private, what you share with family now, and what becomes available as your legacy.'
              },
              {
                step: '03',
                icon: Heart,
                title: 'Connect Across Time',
                description: 'Your AI presence allows future generations to ask questions and hear answers in your own voice.'
              }
            ].map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="relative"
              >
                <div className="text-8xl font-bold text-border/50 absolute -top-4 -left-2">{item.step}</div>
                <div className="relative bg-card rounded-2xl p-8 shadow-md border border-border">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <item.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Emotional Demo */}
      <section id="about" className="py-24 px-6 bg-background">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card rounded-3xl p-8 md:p-12 shadow-lg border border-border"
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl text-foreground mb-4">Imagine This Moment</h2>
              <p className="text-muted-foreground">Years from now, your grandchild wants to know you.</p>
            </div>

            <div className="space-y-6">
              {/* Grandchild message */}
              <div className="flex justify-end">
                <div className="bg-primary/10 rounded-2xl rounded-br-sm px-6 py-4 max-w-sm">
                  <p className="text-foreground">Grandma, what advice would you give me about finding love?</p>
                </div>
              </div>

              {/* Grandma response */}
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex-shrink-0 flex items-center justify-center text-2xl">
                  👵
                </div>
                <div className="bg-secondary rounded-2xl rounded-bl-sm px-6 py-4 max-w-lg">
                  <p className="text-foreground mb-3">
                    "Oh sweetheart, love isn't about finding someone perfect. It's about finding someone whose imperfections you can live with—and who can live with yours."
                  </p>
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mic className="h-3 w-3" />
                    </div>
                    <span>Playing in grandmother's voice</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl text-primary-foreground mb-6">
              Start preserving what matters
            </h2>
            <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              One question per week. Your voice, your values, forever.
            </p>
            <Button 
              onClick={onStartJourney}
              size="lg"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-full text-lg px-10 h-14"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <MatterLogo size="sm" />
          <p className="text-muted-foreground text-sm">The fourth pillar of identity</p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}