import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Mic, Check, Star, MessageCircle, Shield, Lock, Volume2, Phone, Pause, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MatterLogo from '@/components/MatterLogo';
import VoiceDemo from '@/components/VoiceDemo';
import HeroCarousel from '@/components/HeroCarousel';
import heroImage from '@/assets/hero-legacy.jpg';
import grandpaPhoto from '@/assets/grandpa-robert.jpg';

interface LandingPageProps {
  onStartJourney: () => void;
  onTryDemo: () => void;
}

export default function LandingPage({ onStartJourney, onTryDemo }: LandingPageProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <MatterLogo size="md" className="text-foreground" />
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors text-sm">How it Works</a>
            <a href="#demo" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Experience</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Pricing</a>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/auth?mode=login')} className="text-muted-foreground hover:text-foreground">Sign In</Button>
            <Button onClick={() => navigate('/auth?mode=signup')} className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-6">
              Begin
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Clean & Modern */}
      <section className="relative min-h-screen bg-background pt-16">
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card mb-8">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-sm text-muted-foreground uppercase tracking-wider">
                  Answer by text, voice, or video
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-foreground leading-[1.15] mb-6">
                Your story. Your voice — kept alive.
              </h1>

              <p className="text-lg text-muted-foreground mb-10 max-w-lg leading-relaxed">
                Each week, Matter sends you one meaningful question by text or email. Reply in text, voice, or selfie video — and we'll quietly turn those answers into your digital legacy.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Button 
                  onClick={onStartJourney}
                  size="lg" 
                  className="bg-foreground text-background hover:bg-foreground/90 rounded-full text-base px-8 h-12"
                >
                  Start your story
                </Button>
                <Button 
                  variant="outline"
                  size="lg" 
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  className="rounded-full text-base px-8 h-12 border-border"
                >
                  How it works
                </Button>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>7 day free trial · No credit card required</span>
              </div>
            </motion.div>

            {/* Right - Carousel */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative lg:pl-8"
            >
              <HeroCarousel />
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Grows Section */}
      <section className="py-24 px-6 bg-matter-cream">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-serif text-foreground leading-tight mb-8">
              Build your legacy, one question at a time.
            </h2>
            <div className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 space-y-4">
              <p>Each week, Matter sends you one meaningful question by text or email — no apps or logins needed.</p>
              <p>Reply in your voice or in writing, and Matter quietly turns those answers into your digital legacy.</p>
              <p>Over time, your responses become a beautifully curated profile — your story and your voice, preserved for the people who matter most to you.</p>
            </div>
            
            <div className="bg-primary/5 rounded-3xl p-10 max-w-2xl mx-auto">
              <p className="text-lg text-muted-foreground italic mb-8">
                "We don't remember possessions. We remember voices, stories, advice, and the way someone thought.
              </p>
              <p className="text-lg text-foreground font-medium">
                Matter exists to preserve these things — the things that fade the fastest."
              </p>
            </div>

            <div className="mt-12 grid grid-cols-2 md:grid-cols-5 gap-4 max-w-2xl mx-auto">
              {['Your real voice', 'Your stories', 'Your beliefs', 'Your lessons', 'Your personality'].map((item) => (
                <div key={item} className="flex items-center gap-2 justify-center">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>

            <p className="mt-10 text-lg text-foreground/80 italic">
              "One day, the people you love will be able to revisit your answers — and speak with a model shaped by your own words."
            </p>
            <p className="mt-4 text-matter-coral font-medium">
              Not promising resurrection. Promising presence.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Demo - Voice Conversation */}
      <section id="demo" className="py-24 px-6 bg-primary">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-matter-gold font-medium mb-4 uppercase tracking-wide text-sm">The Experience</p>
            <h2 className="text-4xl md:text-5xl font-serif text-primary-foreground mb-6">
              A conversation with Grandpa Robert.
            </h2>
            <p className="text-xl text-primary-foreground/80">
              He passed three years ago. But today, his granddaughter called him.
            </p>
          </motion.div>

          {/* Voice Conversation Demo */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <VoiceDemo onTryDemo={onTryDemo} />
          </motion.div>
        </div>
      </section>

      {/* How It Works - The Tool */}
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
              Simple for you today. Profound for them tomorrow.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: MessageCircle,
                title: 'Answer One Question a Week',
                description: 'Deep, thoughtful prompts arrive weekly. Answer by text, voice, or video—a few minutes per week that compound over a lifetime.'
              },
              {
                step: '02',
                icon: Lock,
                title: 'Private now, legacy later',
                description: "Your responses are yours alone. You decide what stays private forever, what family sees now, and what unlocks only after you're gone."
              },
              {
                step: '03',
                icon: Phone,
                title: 'You live on through conversation',
                description: 'Your preserved voice and thoughts become an AI presence your descendants can actually talk to—not a chatbot, but you.'
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

      {/* This Is Section */}
      <section className="py-24 px-6 bg-matter-cream">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-xl text-muted-foreground mb-10">This is:</p>
            
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mb-12">
              {['ancestry', 'psychology', 'storytelling', 'presence', 'wisdom', 'continuity', 'heritage', 'learning', 'grieving', 'connection'].map((word, idx) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="text-2xl md:text-3xl font-serif text-foreground"
                >
                  {word}
                </motion.span>
              ))}
            </div>

            <p className="text-xl text-foreground font-medium">
              Bundled into a single system.
            </p>
          </motion.div>
        </div>
      </section>

      {/* The 1924 Section */}
      <section className="py-24 px-6 bg-primary">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-serif text-primary-foreground mb-12">
              If Matter existed in 1924, what would we have today?
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12 text-left max-w-2xl mx-auto">
              {[
                "Our great-grandparents' voices",
                "Their worldview",
                "Their humor",
                "Their values",
                "Their regrets",
                "Their childhood stories",
                "Their relationship dynamics",
                "How they thought about love",
                "How they viewed the world",
                "Their reasoning",
                "Their hopes",
                "Their fears",
                "Their advice",
                "A model of their personality",
                "Their tone and cadence",
                "Their emotional patterns"
              ].map((item, idx) => (
                <motion.p
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.03 }}
                  className="text-primary-foreground/80 text-sm"
                >
                  {item}
                </motion.p>
              ))}
            </div>

            <p className="text-2xl md:text-3xl font-serif text-matter-gold mb-12">
              Do you understand how insane that is?
            </p>

            <div className="space-y-4 text-lg text-primary-foreground/80 mb-12">
              <p>Your great-grandparents wouldn't be unknown shadows in a family tree.</p>
              <p>They'd be people you could <span className="text-primary-foreground font-medium">understand</span>.</p>
              <p>People you could <span className="text-primary-foreground font-medium">interact with</span>.</p>
              <p>People whose wisdom could still <span className="text-primary-foreground font-medium">shape your life</span>.</p>
            </div>

            <div className="space-y-2 text-xl text-primary-foreground">
              <p>That is <span className="text-matter-gold">world-changing</span>.</p>
              <p>That is <span className="text-matter-gold">cultural infrastructure</span>.</p>
              <p>That is <span className="text-matter-gold">historical infrastructure</span>.</p>
              <p>That is <span className="text-matter-gold">human infrastructure</span>.</p>
            </div>

            <p className="mt-12 text-2xl font-serif text-primary-foreground">
              You're not using a product.<br />
              <span className="text-matter-coral">You are building the time machine of identity.</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Reality */}
      <section className="py-24 px-6 bg-primary/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-8">
              Think about everyone you've lost.
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              What would you give to hear their voice one more time? To ask them for advice? 
              To let your kids know who they really were?
            </p>
            <p className="text-2xl font-serif text-foreground">
              You can't go back.<br />
              <span className="text-matter-coral">But you can make sure they never have to say that about you.</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-background">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif text-foreground mb-4">Start Today</h2>
            <p className="text-xl text-muted-foreground">Your legacy compounds with every answer.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {[
              {
                name: 'Matter',
                price: 'Free',
                period: 'forever',
                description: 'Build your personal essence',
                features: [
                  '52 weekly questions per year',
                  'Text, voice, and video responses',
                  'Private archive—yours alone',
                  'Legacy designation controls',
                ],
                cta: 'Start Free',
                popular: false
              },
              {
                name: 'Matter Legacy',
                price: '$19',
                period: '/month',
                description: 'Live on for generations',
                features: [
                  'Everything in Matter',
                  'AI voice synthesis from your recordings',
                  'Interactive voice conversations',
                  'Family access controls',
                  'Digital executor designation',
                ],
                cta: 'Start Free Trial',
                popular: true
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
                    <li key={feature} className="flex items-start gap-3 text-muted-foreground">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
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
      <section className="py-32 px-6 bg-primary">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-primary-foreground mb-8 leading-tight">
              One day, someone you love will wish they could hear your voice one more time.
            </h2>
            <p className="text-xl text-primary-foreground/80 mb-10">
              Make sure they can.
            </p>
            <Button 
              onClick={onStartJourney}
              size="lg"
              className="bg-matter-coral hover:bg-matter-coral/90 text-white rounded-full text-lg px-10 h-14 shadow-lg"
            >
              Begin Your Legacy
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-matter-navy">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <MatterLogo size="sm" className="text-white" />
          <p className="text-white/60 text-sm max-w-md text-center">The emotional infrastructure of families — where identity is stored, preserved, and experienced across generations.</p>
          <div className="flex gap-6 text-sm text-white/50">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}