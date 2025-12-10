import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Mic, Check, Star, MessageCircle, Shield, Lock, Volume2, Phone, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MatterLogo from '@/components/MatterLogo';
import VoiceDemo from '@/components/VoiceDemo';
import heroImage from '@/assets/hero-legacy.jpg';
import grandpaPhoto from '@/assets/grandpa-robert.jpg';

interface LandingPageProps {
  onStartJourney: () => void;
  onTryDemo: () => void;
}

export default function LandingPage({ onStartJourney, onTryDemo }: LandingPageProps) {

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-primary">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <MatterLogo size="md" className="text-primary-foreground" />
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">How it Works</a>
            <a href="#demo" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">Experience</a>
            <a href="#pricing" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">Pricing</a>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10">Sign In</Button>
            <Button onClick={onStartJourney} className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-full px-6">
              Begin
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen bg-primary">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="A woman hearing a beloved voice"
            className="w-full h-full object-cover"
          />
          <div className="hero-overlay absolute inset-0" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 min-h-screen flex items-center">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-primary-foreground leading-[1.2] mb-6">
                Your stories. Your voice.<br />
                Your wisdom.
              </h1>
              
              <p className="text-2xl md:text-3xl text-matter-gold font-serif mb-8">
                Here, forever.
              </p>

              <p className="text-lg text-primary-foreground/80 mb-10 max-w-xl">
                Answer one meaningful question each week. Over time, Matter learns your voice, your reasoning, and your story — and preserves it for the people who love you.
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
              </div>
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
              Each week, Matter asks you one question.
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
              You answer in your voice or in writing. Your profile grows with every response. 
              Over time, Matter begins to capture your personality, values, and way of thinking.
            </p>
            
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
                description: 'Deep, thoughtful prompts arrive weekly. Answer by text, voice, or video—five minutes that compound over a lifetime.'
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
          <p className="text-white/50 text-sm">The fourth pillar of identity</p>
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