import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Play, Mic, Video, FileText, Check, Star, MessageCircle, Shield, Heart, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MatterLogo from '@/components/MatterLogo';
import heroImage from '@/assets/hero-family.jpg';

interface LandingPageProps {
  onStartJourney: () => void;
  onTryDemo: () => void;
}

const testimonials = [
  {
    quote: "My grandmother passed last year. If only we had this. Now I'm doing it for my parents—no regrets.",
    author: "Sarah M.",
    role: "Daughter preserving her parents' stories"
  },
  {
    quote: "Hearing my father's voice answer my question, years after he's gone—that's not technology. That's a miracle.",
    author: "James K.",
    role: "Legacy Mode user"
  },
  {
    quote: "Every Sunday my kids ask grandpa questions. He's 3,000 miles away but feels like he's in the room.",
    author: "Elena R.",
    role: "Family Circle member"
  }
];

const stats = [
  { value: "52", label: "Questions per year" },
  { value: "∞", label: "Generations connected" },
  { value: "100%", label: "Private & secure" },
];

export default function LandingPage({ onStartJourney, onTryDemo }: LandingPageProps) {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-primary">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <MatterLogo size="md" className="text-primary-foreground" />
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">How it Works</a>
            <a href="#pricing" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">Pricing</a>
            <a href="#testimonials" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">Stories</a>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10">Sign In</Button>
            <Button onClick={onStartJourney} className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-full px-6">
              Start Free
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Full bleed with image */}
      <section className="relative min-h-screen bg-primary">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Grandmother and grandchild sharing stories"
            className="w-full h-full object-cover"
          />
          <div className="hero-overlay absolute inset-0" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 min-h-screen flex items-center">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif text-primary-foreground leading-[1.1] mb-6">
                Your voice.{' '}
                <em className="not-italic text-matter-gold">Forever.</em>
              </h1>
              
              <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 leading-relaxed max-w-xl">
                Weekly questions capture your stories, wisdom, and voice—so future generations can truly <em>know</em> you, not just remember you.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button 
                  onClick={onStartJourney}
                  size="lg" 
                  className="bg-matter-coral hover:bg-matter-coral/90 text-white rounded-full text-lg px-8 h-14 shadow-lg"
                >
                  Start Your Legacy
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  onClick={onTryDemo}
                  size="lg"
                  className="rounded-full text-lg px-8 h-14 border-2 border-white/40 bg-white/10 text-white hover:bg-white/20"
                >
                  <Play className="mr-2 h-5 w-5" />
                  See the Magic
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-4 text-sm text-primary-foreground/80">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-matter-gold text-matter-gold" />
                  ))}
                </div>
                <span>Rated 4.9/5 by families worldwide</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-primary-foreground/40 rounded-full flex justify-center pt-2"
          >
            <div className="w-1 h-2 bg-primary-foreground/60 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* The Differentiator - AI Voice Demo */}
      <section className="py-24 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-matter-coral font-medium mb-4 uppercase tracking-wide text-sm">What makes Matter different</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-foreground mb-6">
              Not just stories.<br />
              <em>Conversations.</em>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              While others give you a book of memories, Matter gives future generations something extraordinary: 
              the ability to <strong>ask questions and hear answers</strong>—in your own voice.
            </p>
          </motion.div>

          {/* AI Conversation Demo */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card rounded-3xl p-8 md:p-12 shadow-premium border border-border max-w-3xl mx-auto"
          >
            <div className="text-center mb-8">
              <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                Legacy Mode Preview
              </span>
            </div>

            <div className="space-y-6">
              {/* Grandchild question */}
              <div className="flex justify-end">
                <div className="bg-primary/10 rounded-2xl rounded-br-sm px-6 py-4 max-w-sm">
                  <p className="text-foreground">Grandma, what advice would you give me about finding love?</p>
                </div>
              </div>

              {/* AI Response with voice */}
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-matter-coral/20 flex-shrink-0 flex items-center justify-center">
                  <span className="text-2xl">👵</span>
                </div>
                <div className="flex-1">
                  <div className="bg-primary text-primary-foreground rounded-2xl rounded-bl-sm px-6 py-4">
                    <p className="mb-4 leading-relaxed">
                      "Oh sweetheart, love isn't about finding someone perfect. It's about finding someone whose imperfections you can live with—and who can live with yours. Your grandfather drove me crazy sometimes, but he was my favorite person to be crazy with."
                    </p>
                    
                    {/* Audio player */}
                    <div className="flex items-center gap-3 pt-3 border-t border-primary-foreground/20">
                      <button className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/30 transition-colors">
                        <Volume2 className="h-5 w-5" />
                      </button>
                      <div className="flex items-center gap-0.5 flex-1">
                        {[...Array(40)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="w-1 bg-primary-foreground/60 rounded-full wave-bar"
                            style={{ 
                              height: `${4 + Math.sin(i * 0.3) * 12}px`,
                              animationDelay: `${i * 0.05}s`
                            }}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-primary-foreground/70">0:42</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                    <Mic className="h-4 w-4" />
                    Playing in Margaret's voice • Recorded 2024
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-primary">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-3 gap-8 text-center">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="text-4xl md:text-5xl font-serif text-matter-gold mb-2">{stat.value}</div>
                <div className="text-primary-foreground/80 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif text-foreground mb-4">How Matter Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simple. Meaningful. Forever.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: MessageCircle,
                title: 'Answer one question a week',
                description: 'Thoughtful prompts arrive weekly. Answer via text, voice, or video—whatever feels natural.'
              },
              {
                step: '02',
                icon: Shield,
                title: 'You control everything',
                description: 'Keep it private, share with family now, or designate as legacy—visible only after you\'re gone.'
              },
              {
                step: '03',
                icon: Heart,
                title: 'Stay connected forever',
                description: 'Your AI presence lets future generations ask questions and hear answers in your actual voice.'
              }
            ].map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="relative"
              >
                <div className="text-[120px] font-serif text-border/30 absolute -top-8 -left-4 leading-none select-none">
                  {item.step}
                </div>
                <div className="relative bg-card rounded-2xl p-8 shadow-md border border-border card-premium">
                  <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-6">
                    <item.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-serif text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 bg-primary/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-serif text-foreground mb-4">
              Stories from families like yours
            </h2>
          </motion.div>

          <div className="relative min-h-[250px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <blockquote className="text-2xl md:text-3xl font-serif text-foreground leading-relaxed mb-8 max-w-3xl mx-auto">
                  "{testimonials[currentTestimonial].quote}"
                </blockquote>
                <div>
                  <p className="font-medium text-foreground">{testimonials[currentTestimonial].author}</p>
                  <p className="text-muted-foreground text-sm">{testimonials[currentTestimonial].role}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentTestimonial(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentTestimonial ? 'bg-primary w-6' : 'bg-border'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif text-foreground mb-4">Start preserving today</h2>
            <p className="text-xl text-muted-foreground">Choose how you want to build your legacy</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Personal',
                price: 'Free',
                period: 'forever',
                description: 'Build your personal archive',
                features: ['52 weekly questions', 'Text, audio & video', 'Private by default', 'Searchable archive'],
                cta: 'Start Free',
                popular: false
              },
              {
                name: 'Family',
                price: '$9',
                period: '/month',
                description: 'Share with loved ones',
                features: ['Everything in Personal', 'Share with 10 people', 'Collaborative memories', 'Family tree view'],
                cta: 'Start Free Trial',
                popular: true
              },
              {
                name: 'Legacy',
                price: '$19',
                period: '/month',
                description: 'Live forever in their hearts',
                features: ['Everything in Family', 'AI voice synthesis', 'Interactive conversations', 'Digital executor'],
                cta: 'Start Free Trial',
                popular: false
              }
            ].map((plan, idx) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`relative bg-card rounded-3xl p-8 border-2 card-premium ${
                  plan.popular ? 'border-primary shadow-lg' : 'border-border'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-sm font-medium px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                
                <h3 className="text-2xl font-serif text-foreground mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-4">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-serif text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-muted-foreground">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={onStartJourney}
                  className={`w-full rounded-full h-12 ${
                    plan.popular 
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {plan.cta}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-primary">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-primary-foreground mb-6">
              Every day you wait is a story lost.
            </h2>
            <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              One question per week. Five minutes of your time. A lifetime of connection for those who come after.
            </p>
            <Button 
              onClick={onStartJourney}
              size="lg"
              className="bg-matter-coral hover:bg-matter-coral/90 text-white rounded-full text-lg px-10 h-14 shadow-lg"
            >
              Start Your Legacy Today
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