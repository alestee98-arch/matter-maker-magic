import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, MessageSquare, Mic, Video, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MatterLogo from '@/components/MatterLogo';
import HeroCarousel from '@/components/HeroCarousel';
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
            <a href="#questions" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Questions</a>
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

      {/* Hero Section */}
      <section className="relative min-h-screen bg-background pt-16">
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card mb-8">
                <span className="w-2 h-2 rounded-full bg-matter-coral" />
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
                <Sparkles className="w-4 h-4 text-matter-coral" />
                <span>7 day free trial · No credit card required</span>
              </div>
            </motion.div>

            {/* Right - Hero Carousel */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <HeroCarousel />
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section - Dark */}
      <section id="how-it-works" className="py-24 px-6 bg-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-4">How It Works</h2>
          </motion.div>

          <div className="space-y-24">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid md:grid-cols-2 gap-12 items-center"
            >
              <div>
                <p className="text-[#b5a48b] text-sm uppercase tracking-wider mb-4">Step 1</p>
                <h3 className="text-3xl font-serif text-white mb-4">Get a question by text or email</h3>
                <p className="text-white/70 leading-relaxed">
                  Every week, Matter sends you one thoughtfully curated question. No apps to download, no logins to remember — just a simple text or email when it's time to reflect.
                </p>
              </div>
              <div className="flex justify-center md:justify-end">
                <div className="bg-[#2a2a2a] rounded-2xl p-6 w-full max-w-sm border border-white/10">
                  <p className="text-white/50 text-xs uppercase tracking-wider mb-2">Question #12</p>
                  <p className="text-white text-lg">Who taught you how to love?</p>
                </div>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid md:grid-cols-2 gap-12 items-center"
            >
              <div className="order-2 md:order-1 flex justify-center md:justify-start">
                <div className="bg-gradient-to-br from-[#b5a48b]/30 to-[#8a7a6a]/20 rounded-2xl p-8 w-full max-w-sm border border-[#b5a48b]/20">
                  <div className="flex justify-center gap-6 mb-6">
                    {[
                      { icon: MessageSquare, label: 'Text' },
                      { icon: Mic, label: 'Voice' },
                      { icon: Video, label: 'Video' },
                    ].map(({ icon: Icon, label }) => (
                      <div key={label} className="flex flex-col items-center gap-2">
                        <div className="w-14 h-14 rounded-xl bg-[#2a2a2a] flex items-center justify-center">
                          <Icon className="w-6 h-6 text-[#b5a48b]" />
                        </div>
                        <span className="text-white/70 text-sm">{label}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-white/50 text-sm text-center">Choose your preferred format</p>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <p className="text-[#b5a48b] text-sm uppercase tracking-wider mb-4">Step 2</p>
                <h3 className="text-3xl font-serif text-white mb-4">Answer in text, voice, or selfie video</h3>
                <p className="text-white/70 leading-relaxed">
                  Choose how you want to share your story. Type it out, record your voice, or capture a selfie video. Take 5 minutes or an hour — it's your moment to preserve.
                </p>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid md:grid-cols-2 gap-12 items-center"
            >
              <div>
                <p className="text-[#b5a48b] text-sm uppercase tracking-wider mb-4">Step 3</p>
                <h3 className="text-3xl font-serif text-white mb-4">We build your legacy</h3>
                <p className="text-white/70 leading-relaxed">
                  Over time, your responses become a beautifully curated profile — your story and your voice, preserved for the people who matter most to you.
                </p>
              </div>
              <div className="flex justify-center md:justify-end">
                <div className="bg-[#2a2a2a] rounded-2xl p-5 w-full max-w-sm border border-white/10 space-y-3">
                  {[
                    { week: 'Week 1', question: 'What belief have you changed...' },
                    { week: 'Week 2', question: 'Who taught you how to love?' },
                    { week: 'Week 3', question: 'What does home mean to you?' },
                    { week: 'Week 4', question: 'What are you certain about now...' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-[#3a3a3a] rounded-xl p-3">
                      <div className="w-8 h-8 rounded-full bg-[#b5a48b] flex items-center justify-center">
                        <Check className="w-4 h-4 text-[#1a1a1a]" />
                      </div>
                      <div>
                        <p className="text-white/50 text-xs">{item.week}</p>
                        <p className="text-white text-sm">{item.question}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-6 bg-[#f5f5f3]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif text-foreground mb-4">Don't just take our word for it</h2>
            <p className="text-lg text-muted-foreground">Hear from people preserving their stories</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "My kids will have my voice forever. That's everything.",
                name: "Sarah M.",
                role: "Mother of three"
              },
              {
                quote: "One question a week feels so manageable. I actually stick with it.",
                name: "James L.",
                role: "Busy professional"
              },
              {
                quote: "I'm capturing stories I would have forgotten. This is a gift to my family.",
                name: "Maria R.",
                role: "Grandmother"
              }
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl p-8 border border-border"
              >
                <p className="text-foreground text-lg mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div>
                  <p className="font-medium text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Questions That Matter Section */}
      <section id="questions" className="py-24 px-6 bg-background">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif text-foreground mb-4">Questions that matter</h2>
            <p className="text-lg text-muted-foreground">Thoughtfully curated to capture your essence</p>
          </motion.div>

          <div className="space-y-4">
            {[
              { category: 'Growth', question: 'What belief have you changed your mind about?' },
              { category: 'Relationships', question: 'Who taught you how to love?' },
              { category: 'Identity', question: 'What does home mean to you?' },
              { category: 'Wisdom', question: "What are you certain about now that you weren't ten years ago?", highlight: true },
              { category: 'Legacy', question: 'What do you hope your loved ones inherit from you?' },
            ].map((item, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className={`w-full flex items-center justify-between p-6 rounded-2xl border transition-all text-left group ${
                  item.highlight 
                    ? 'bg-[#b5a48b]/10 border-[#b5a48b]/30' 
                    : 'bg-card border-border hover:border-border/80'
                }`}
              >
                <div>
                  <span className="inline-block px-3 py-1 rounded-full bg-foreground text-background text-xs uppercase tracking-wider mb-2">
                    {item.category}
                  </span>
                  <p className="text-lg text-foreground">{item.question}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="w-5 h-5 text-background" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>


      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-[#f5f5f3]">
        <div className="max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-serif text-foreground mb-4">Simple pricing</h2>
            <p className="text-lg text-muted-foreground">One price. Your entire legacy.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl p-10 border border-border shadow-sm"
          >
            <div className="text-center mb-8">
              <p className="text-[#b5a48b] text-sm uppercase tracking-wider mb-4">Your Digital Legacy</p>
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-5xl font-serif text-foreground">$12</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-sm text-muted-foreground">or $120/year (save $24)</p>
            </div>

            <ul className="space-y-4 mb-8">
              {[
                '52 meaningful questions per year',
                'Unlimited voice & text responses',
                'AI-powered reflections',
                'Beautiful legacy profile',
                'Family sharing (optional)',
                'Stored forever, privately'
              ].map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-foreground">
                  <div className="w-2 h-2 rounded-full bg-foreground" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button 
              onClick={onStartJourney}
              className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-full h-12 text-base"
            >
              Start Your 7-Day Trial
            </Button>
            <p className="text-center text-sm text-muted-foreground mt-4">No credit card required</p>
          </motion.div>
        </div>
      </section>


      {/* Footer - Navy */}
      <footer className="py-12 px-6 bg-[#1e2a3a]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <MatterLogo size="sm" className="text-white" />
          <p className="text-white/50 text-sm max-w-md text-center">The emotional infrastructure of families — where identity is stored, preserved, and experienced across generations.</p>
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
