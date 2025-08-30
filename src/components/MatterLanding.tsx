import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Brain, Infinity, Users, Mic, Sparkles } from "lucide-react";

const MatterLanding = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <div className="bg-gradient-warm px-6 py-16 text-center">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-8">
            <Infinity className="w-12 h-12 text-warm-gold-foreground" />
            <h1 className="text-6xl font-serif font-bold text-warm-gold-foreground">
              Matter
            </h1>
          </div>
          <h2 className="text-3xl font-serif font-medium text-warm-gold-foreground mb-6">
            Digitally Immortalizing Mankind
          </h2>
          <p className="text-xl text-warm-gold-foreground/80 max-w-4xl mx-auto mb-8 leading-relaxed">
            The world's first universal platform for digital immortality. Every week, we capture your essence 
            through profound questions. Over time, AI learns who you are — your voice, thoughts, and wisdom — 
            creating an eternal digital presence for future generations.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <Card className="p-6 bg-white/10 border-white/20 text-center">
              <Brain className="w-8 h-8 mx-auto mb-4 text-warm-gold-foreground" />
              <h3 className="text-lg font-semibold text-warm-gold-foreground mb-2">
                AI Learns You
              </h3>
              <p className="text-warm-gold-foreground/70 text-sm">
                Deep questions capture your personality, values, and thinking patterns
              </p>
            </Card>
            
            <Card className="p-6 bg-white/10 border-white/20 text-center">
              <Mic className="w-8 h-8 mx-auto mb-4 text-warm-gold-foreground" />
              <h3 className="text-lg font-semibold text-warm-gold-foreground mb-2">
                Voice Preserved
              </h3>
              <p className="text-warm-gold-foreground/70 text-sm">
                Your actual voice is cloned and preserved for authentic interactions
              </p>
            </Card>
            
            <Card className="p-6 bg-white/10 border-white/20 text-center">
              <Users className="w-8 h-8 mx-auto mb-4 text-warm-gold-foreground" />
              <h3 className="text-lg font-semibold text-warm-gold-foreground mb-2">
                Legacy Lives On
              </h3>
              <p className="text-warm-gold-foreground/70 text-sm">
                Future generations can have real conversations with your digital essence
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Vision Statement */}
      <div className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-6 text-warm-gold" />
          <h2 className="text-4xl font-serif font-bold text-foreground mb-8">
            As Universal as a Bank Account
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            Imagine a world where everyone has a Matter account. Where your digital essence grows richer 
            with each passing week. Where death is no longer the end of connection, but the beginning 
            of eternal wisdom sharing across generations.
          </p>
          
          <div className="bg-card rounded-lg p-8 border shadow-lg">
            <h3 className="text-2xl font-serif font-semibold text-foreground mb-4">
              "Children asking for advice from a parent decades after they've passed."
            </h3>
            <p className="text-muted-foreground">
              This isn't science fiction. This is the future we're building today.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-primary/5 py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-6">
            Ready to Begin Your Digital Legacy?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join the revolution in human memory preservation. Start capturing your essence today.
          </p>
          <Button size="lg" className="text-lg px-8 py-6">
            Start Your Matter Account
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MatterLanding;