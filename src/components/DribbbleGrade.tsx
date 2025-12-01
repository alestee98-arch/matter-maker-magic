import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Play, Sparkles, Brain, Infinity } from "lucide-react";

const GridPattern = () => (
  <div className="absolute inset-0 opacity-[0.02]">
    <div 
      className="h-full w-full"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23ffffff' fill-opacity='1'%3e%3ccircle cx='30' cy='30' r='0.5'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`,
        backgroundSize: '60px 60px'
      }}
    />
  </div>
);

const FloatingElement = ({ delay = 0, children }: { delay?: number; children: React.ReactNode }) => (
  <div 
    className="animate-float"
    style={{ animationDelay: `${delay}s`, animationDuration: '8s' }}
  >
    {children}
  </div>
);

const DribbbleGrade = () => {
  return (
    <div className="min-h-screen bg-gradient-primary relative overflow-hidden">
      <GridPattern />
      
      {/* Floating elements for depth */}
      <div className="absolute inset-0 pointer-events-none">
        <FloatingElement delay={0}>
          <div className="absolute top-20 left-[10%] w-2 h-2 bg-premium-purple/20 rounded-full blur-sm" />
        </FloatingElement>
        <FloatingElement delay={2}>
          <div className="absolute top-40 right-[15%] w-1 h-1 bg-premium-blue/30 rounded-full" />
        </FloatingElement>
        <FloatingElement delay={4}>
          <div className="absolute bottom-40 left-[20%] w-3 h-3 bg-premium-amber/10 rounded-full blur-sm" />
        </FloatingElement>
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Infinity className="w-6 h-6 text-foreground" />
            <span className="text-lg font-medium tracking-tight">Matter</span>
          </div>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            Contact
          </Button>
        </nav>

        {/* Hero Section */}
        <div className="px-8 pt-20 pb-32">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              
              {/* Left Content */}
              <div className="space-y-8">
                <div className="space-y-6">
                  <Badge variant="secondary" className="px-3 py-1 text-xs font-medium bg-secondary/50 border-border/50">
                    The Fourth Pillar of Identity
                  </Badge>
                  
                  <div className="space-y-4">
                    <h1 className="text-5xl lg:text-6xl font-light tracking-tight leading-[0.95]">
                      A universal
                      <span className="block font-medium bg-gradient-accent bg-clip-text text-transparent">
                        human archive
                      </span>
                    </h1>
                    
                    <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                      Every person receives a Matter identity at birth. One question per week. 
                      A lifetime of answers. An authentic AI of who you truly are.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Button 
                    className="bg-foreground text-background hover:bg-foreground/90 px-8 py-6 rounded-full font-medium"
                    size="lg"
                  >
                    Claim Your Identity
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="lg"
                    className="text-muted-foreground hover:text-foreground px-8 py-6 rounded-full"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    See How It Works
                  </Button>
                </div>

                <div className="flex items-center gap-8 pt-4">
                  <div className="text-sm text-muted-foreground">
                    <span className="text-foreground font-medium">As foundational</span> as a birth certificate
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="text-foreground font-medium">Built for</span> 8 billion humans
                  </div>
                </div>
              </div>

              {/* Right Content - Feature Cards */}
              <div className="space-y-6">
                <Card className="p-8 bg-gradient-card border-border/50 shadow-premium hover:shadow-lg transition-all duration-500 group">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-secondary rounded-xl group-hover:bg-accent/10 transition-colors duration-300">
                      <Brain className="w-6 h-6 text-accent" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="text-lg font-medium">Your Own Words</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Not fabricated. Not imagined. Your Matter identity is built from decades 
                        of your authentic voice — your stories, values, and emotional patterns.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-8 bg-gradient-card border-border/50 shadow-premium hover:shadow-lg transition-all duration-500 group">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-secondary rounded-xl group-hover:bg-premium-blue/10 transition-colors duration-300">
                      <Sparkles className="w-6 h-6 text-premium-blue" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="text-lg font-medium">Cross-Generational Continuity</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Your children, grandchildren, and great-grandchildren will know you 
                        as a real person — not a fading memory, but a living presence.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-8 bg-gradient-card border-border/50 shadow-premium hover:shadow-lg transition-all duration-500 group">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-secondary rounded-xl group-hover:bg-premium-green/10 transition-colors duration-300">
                      <Infinity className="w-6 h-6 text-premium-green" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="text-lg font-medium">Not Erased</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Photos can't preserve essence. Matter stops the loss. Your humor, 
                        wisdom, voice, and perspective — preserved forever.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="px-8 pb-20">
          <div className="max-w-6xl mx-auto">
            <Card className="p-12 bg-glass border-glass-border backdrop-blur-xl">
              <div className="text-center space-y-6">
                <h2 className="text-2xl font-light">
                  This is not a gadget. This is <span className="font-medium text-accent">human infrastructure</span>
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Matter is not about living forever — it's about not being erased. 
                  A tree of presence, not just a tree of names. 
                  The digital immortality of humankind.
                </p>
                
                <div className="grid md:grid-cols-3 gap-8 pt-8">
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-light">52</div>
                    <div className="text-sm text-muted-foreground">Questions per year</div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-light">∞</div>
                    <div className="text-sm text-muted-foreground">Generations preserved</div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-light">8B</div>
                    <div className="text-sm text-muted-foreground">Future identities</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DribbbleGrade;