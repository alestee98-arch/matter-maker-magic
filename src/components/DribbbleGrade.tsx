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
                    Digital Immortality Protocol
                  </Badge>
                  
                  <div className="space-y-4">
                    <h1 className="text-5xl lg:text-6xl font-light tracking-tight leading-[0.95]">
                      Preserve your
                      <span className="block font-medium bg-gradient-accent bg-clip-text text-transparent">
                        essence forever
                      </span>
                    </h1>
                    
                    <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                      Weekly questions build an AI model that captures your complete personality, 
                      voice, and wisdom for future generations to interact with.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Button 
                    className="bg-foreground text-background hover:bg-foreground/90 px-8 py-6 rounded-full font-medium"
                    size="lg"
                  >
                    Begin Legacy
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="lg"
                    className="text-muted-foreground hover:text-foreground px-8 py-6 rounded-full"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Watch Demo
                  </Button>
                </div>

                <div className="flex items-center gap-8 pt-4">
                  <div className="text-sm text-muted-foreground">
                    <span className="text-foreground font-medium">2.1M</span> memories preserved
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="text-foreground font-medium">50K</span> active legacies
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
                      <h3 className="text-lg font-medium">AI Personality Mapping</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Advanced algorithms analyze your responses to build a comprehensive 
                        model of your personality, values, and decision-making patterns.
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
                      <h3 className="text-lg font-medium">Voice Synthesis</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        State-of-the-art voice cloning preserves your unique speech patterns, 
                        tone, and mannerisms for authentic future interactions.
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
                      <h3 className="text-lg font-medium">Eternal Presence</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Your digital consciousness enables meaningful conversations 
                        with descendants, sharing wisdom across generations.
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
                  As universal as a <span className="font-medium text-accent">bank account</span>
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Imagine a world where digital immortality is as common as banking. 
                  Where every person's essence is preserved, accessible, and eternal.
                </p>
                
                <div className="grid md:grid-cols-3 gap-8 pt-8">
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-light">∞</div>
                    <div className="text-sm text-muted-foreground">Infinite preservation</div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-light">2089</div>
                    <div className="text-sm text-muted-foreground">Future conversations</div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-light">8B</div>
                    <div className="text-sm text-muted-foreground">Potential users</div>
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