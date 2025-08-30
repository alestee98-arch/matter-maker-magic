import { useState } from "react";
import FuturisticLanding from "@/components/FuturisticLanding";
import InteractiveDemo from "@/components/InteractiveDemo";
import WeeklyQuestion from "@/components/WeeklyQuestion";
import PersonalArchive from "@/components/PersonalArchive";
import { Button } from "@/components/ui/button";
import { Terminal, Cpu } from "lucide-react";

const Index = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'demo' | 'app'>('landing');

  if (currentView === 'landing') {
    return (
      <div>
        <FuturisticLanding />
        <div className="bg-background py-20 text-center border-t border-glass-border">
          <h2 className="text-4xl font-light text-foreground mb-12 font-mono tracking-wider">
            EXPERIENCE THE <span className="text-neon-cyan">PROTOCOL</span>
          </h2>
          <div className="flex justify-center gap-6">
            <Button 
              onClick={() => setCurrentView('demo')} 
              size="lg" 
              className="group bg-gradient-neural hover:shadow-particle transition-all duration-500 font-mono tracking-wider px-8 py-6"
            >
              <Terminal className="w-5 h-5 mr-2 group-hover:animate-pulse" />
              NEURAL DEMO
            </Button>
            <Button 
              onClick={() => setCurrentView('app')} 
              variant="outline" 
              size="lg"
              className="group border-glass-border hover:bg-glass-bg backdrop-blur-xl font-mono tracking-wider px-8 py-6"
            >
              <Cpu className="w-5 h-5 mr-2 group-hover:animate-pulse" />
              ACCESS PLATFORM
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'demo') {
    return (
      <div className="min-h-screen bg-gradient-matrix">
        <div className="bg-glass-bg/50 backdrop-blur-xl border-b border-glass-border py-6 px-6 text-center">
          <Button 
            onClick={() => setCurrentView('landing')} 
            variant="ghost" 
            size="sm"
            className="font-mono text-neon-cyan hover:text-foreground"
          >
            ← RETURN TO PROTOCOL
          </Button>
        </div>
        <InteractiveDemo />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-matrix">
      <div className="bg-glass-bg/50 backdrop-blur-xl border-b border-glass-border py-6 px-6 text-center">
        <Button 
          onClick={() => setCurrentView('landing')} 
          variant="ghost" 
          size="sm"
          className="font-mono text-neon-cyan hover:text-foreground"
        >
          ← RETURN TO PROTOCOL
        </Button>
      </div>
      <WeeklyQuestion />
      <PersonalArchive />
    </div>
  );
};

export default Index;
