import { useState } from "react";
import MatterLanding from "@/components/MatterLanding";
import InteractiveDemo from "@/components/InteractiveDemo";
import WeeklyQuestion from "@/components/WeeklyQuestion";
import PersonalArchive from "@/components/PersonalArchive";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";

const Index = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'demo' | 'app'>('landing');

  if (currentView === 'landing') {
    return (
      <div>
        <MatterLanding />
        <div className="bg-background py-16 text-center">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-8">
            Experience the Vision
          </h2>
          <div className="flex justify-center gap-4">
            <Button 
              onClick={() => setCurrentView('demo')} 
              size="lg" 
              className="gap-2"
            >
              <Play className="w-5 h-5" />
              Interactive Demo
            </Button>
            <Button 
              onClick={() => setCurrentView('app')} 
              variant="outline" 
              size="lg"
              className="gap-2"
            >
              <ArrowRight className="w-5 h-5" />
              Try the Platform
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'demo') {
    return (
      <div>
        <div className="bg-primary/5 py-8 px-6 text-center">
          <Button 
            onClick={() => setCurrentView('landing')} 
            variant="ghost" 
            size="sm"
          >
            ← Back to Landing
          </Button>
        </div>
        <InteractiveDemo />
      </div>
    );
  }

  return (
    <div>
      <div className="bg-primary/5 py-4 px-6 text-center">
        <Button 
          onClick={() => setCurrentView('landing')} 
          variant="ghost" 
          size="sm"
        >
          ← Back to Landing
        </Button>
      </div>
      <div className="min-h-screen bg-gradient-subtle">
        <WeeklyQuestion />
        <PersonalArchive />
      </div>
    </div>
  );
};

export default Index;
