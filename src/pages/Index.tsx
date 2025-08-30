import { useState } from "react";
import DribbbleGrade from "@/components/DribbbleGrade";
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
        <DribbbleGrade />
        <div className="bg-background py-20 text-center border-t border-border">
          <h2 className="text-3xl font-light text-foreground mb-12 tracking-tight">
            Experience the platform
          </h2>
          <div className="flex justify-center gap-4">
            <Button 
              onClick={() => setCurrentView('demo')} 
              className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-8"
            >
              <Terminal className="w-4 h-4 mr-2" />
              Interactive Demo
            </Button>
            <Button 
              onClick={() => setCurrentView('app')} 
              variant="outline" 
              className="rounded-full px-8"
            >
              <Cpu className="w-4 h-4 mr-2" />
              Try Platform
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'demo') {
    return (
      <div className="min-h-screen bg-gradient-primary">
        <div className="bg-glass backdrop-blur-xl border-b border-glass-border py-6 px-8">
          <Button 
            onClick={() => setCurrentView('landing')} 
            variant="ghost" 
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back
          </Button>
        </div>
        <InteractiveDemo />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="bg-glass backdrop-blur-xl border-b border-glass-border py-6 px-8">
        <Button 
          onClick={() => setCurrentView('landing')} 
          variant="ghost" 
          size="sm"
          className="text-muted-foreground hover:text-foreground"
        >
          ← Back
        </Button>
      </div>
      <WeeklyQuestion />
      <PersonalArchive />
    </div>
  );
};

export default Index;
