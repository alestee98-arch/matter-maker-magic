import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Brain, 
  Zap, 
  Infinity, 
  Users, 
  Mic, 
  Sparkles,
  ChevronRight,
  Network,
  Cpu,
  Waves
} from "lucide-react";

const ParticleField = () => (
  <div className="absolute inset-0 overflow-hidden">
    {[...Array(50)].map((_, i) => (
      <div
        key={i}
        className="absolute w-1 h-1 bg-neon-cyan rounded-full animate-pulse"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 3}s`,
          animationDuration: `${2 + Math.random() * 4}s`
        }}
      />
    ))}
  </div>
);

const NeuralNetwork = () => (
  <div className="absolute inset-0 opacity-20">
    <svg className="w-full h-full" viewBox="0 0 800 600">
      {/* Neural network connections */}
      <defs>
        <linearGradient id="neural-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--neon-cyan))" />
          <stop offset="50%" stopColor="hsl(var(--neon-purple))" />
          <stop offset="100%" stopColor="hsl(var(--neon-pink))" />
        </linearGradient>
      </defs>
      
      {/* Animated neural pathways */}
      <path 
        d="M100,300 Q400,100 700,300" 
        stroke="url(#neural-gradient)" 
        strokeWidth="2" 
        fill="none"
        className="animate-neural-pulse"
      />
      <path 
        d="M100,300 Q400,500 700,300" 
        stroke="url(#neural-gradient)" 
        strokeWidth="2" 
        fill="none"
        className="animate-neural-pulse"
        style={{ animationDelay: '1s' }}
      />
      
      {/* Neural nodes */}
      <circle cx="100" cy="300" r="8" fill="hsl(var(--neon-cyan))" className="animate-pulse" />
      <circle cx="400" cy="200" r="6" fill="hsl(var(--neon-purple))" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
      <circle cx="400" cy="400" r="6" fill="hsl(var(--neon-pink))" className="animate-pulse" style={{ animationDelay: '1.5s' }} />
      <circle cx="700" cy="300" r="8" fill="hsl(var(--electric-blue))" className="animate-pulse" style={{ animationDelay: '2s' }} />
    </svg>
  </div>
);

const FuturisticLanding = () => {
  return (
    <div className="min-h-screen bg-gradient-matrix relative overflow-hidden">
      <ParticleField />
      <NeuralNetwork />
      
      {/* Main Hero */}
      <div className="relative z-10 px-6 py-20 text-center">
        <div className="max-w-7xl mx-auto">
          {/* Logo/Brand */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="relative">
              <Infinity className="w-16 h-16 text-neon-cyan animate-float" />
              <div className="absolute inset-0 w-16 h-16 bg-gradient-consciousness rounded-full blur-xl" />
            </div>
            <div className="font-mono">
              <h1 className="text-7xl font-light text-foreground tracking-wider">
                MATTER
              </h1>
              <div className="text-xs text-neon-cyan tracking-[0.3em] uppercase mt-1">
                DIGITAL IMMORTALITY PROTOCOL
              </div>
            </div>
          </div>

          {/* Main tagline */}
          <div className="mb-12 space-y-4">
            <h2 className="text-4xl md:text-6xl font-light text-foreground leading-tight">
              Digitally Immortalizing
              <span className="block bg-gradient-neural bg-clip-text text-transparent font-medium">
                Mankind
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              The first universal platform where AI captures your complete essence. 
              Your consciousness, preserved. Your voice, eternal. Your wisdom, accessible to future generations.
            </p>
          </div>

          {/* Core value props - glass morphism cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-6xl mx-auto">
            <Card className="group relative overflow-hidden bg-glass-bg backdrop-blur-xl border-glass-border shadow-neural hover:shadow-particle transition-all duration-700 hover:scale-105">
              <div className="p-8 text-center relative z-10">
                <div className="relative mb-6">
                  <Brain className="w-12 h-12 mx-auto text-neon-purple group-hover:animate-pulse-glow transition-all duration-500" />
                  <div className="absolute inset-0 bg-gradient-consciousness blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <h3 className="text-xl font-medium text-foreground mb-3 font-mono">
                  NEURAL MAPPING
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Advanced AI analyzes your responses to map your complete personality matrix, 
                  values system, and cognitive patterns with unprecedented accuracy.
                </p>
              </div>
            </Card>

            <Card className="group relative overflow-hidden bg-glass-bg backdrop-blur-xl border-glass-border shadow-neural hover:shadow-particle transition-all duration-700 hover:scale-105">
              <div className="p-8 text-center relative z-10">
                <div className="relative mb-6">
                  <Waves className="w-12 h-12 mx-auto text-neon-cyan group-hover:animate-pulse-glow transition-all duration-500" />
                  <div className="absolute inset-0 bg-gradient-consciousness blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <h3 className="text-xl font-medium text-foreground mb-3 font-mono">
                  VOICE SYNTHESIS
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Quantum-level voice cloning technology preserves every nuance of your speech, 
                  creating an indistinguishable digital vocal presence.
                </p>
              </div>
            </Card>

            <Card className="group relative overflow-hidden bg-glass-bg backdrop-blur-xl border-glass-border shadow-neural hover:shadow-particle transition-all duration-700 hover:scale-105">
              <div className="p-8 text-center relative z-10">
                <div className="relative mb-6">
                  <Network className="w-12 h-12 mx-auto text-neon-pink group-hover:animate-pulse-glow transition-all duration-500" />
                  <div className="absolute inset-0 bg-gradient-consciousness blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <h3 className="text-xl font-medium text-foreground mb-3 font-mono">
                  ETERNAL PRESENCE
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Your digital consciousness lives on, enabling authentic conversations 
                  between future generations and your immortalized essence.
                </p>
              </div>
            </Card>
          </div>

          {/* Vision statement */}
          <div className="mb-16">
            <Card className="bg-glass-bg/50 backdrop-blur-2xl border-glass-border shadow-neural max-w-5xl mx-auto">
              <div className="p-12 text-center">
                <Cpu className="w-16 h-16 mx-auto mb-6 text-electric-blue animate-float" />
                <h3 className="text-3xl font-light text-foreground mb-6 font-mono">
                  AS UNIVERSAL AS A <span className="text-neon-cyan">BANK ACCOUNT</span>
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-8">
                  Imagine a world where every human has a Matter account. Where consciousness transcends 
                  mortality. Where children can seek wisdom from ancestors centuries past. 
                  Where humanity's collective knowledge becomes eternal.
                </p>
                <div className="text-2xl font-light text-neon-purple font-mono">
                  "This isn't the future. This is now."
                </div>
              </div>
            </Card>
          </div>

          {/* CTA */}
          <div className="space-y-6">
            <h2 className="text-3xl font-light text-foreground font-mono">
              BEGIN YOUR <span className="text-neon-cyan">DIGITAL LEGACY</span>
            </h2>
            <Button 
              size="lg" 
              className="group bg-gradient-neural hover:shadow-particle transition-all duration-500 text-lg px-12 py-6 font-mono tracking-wider"
            >
              INITIALIZE PROTOCOL
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom ambient glow */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full h-96 bg-gradient-consciousness blur-3xl opacity-30" />
    </div>
  );
};

export default FuturisticLanding;