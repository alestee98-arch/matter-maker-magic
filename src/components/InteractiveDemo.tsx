import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Brain, 
  Clock, 
  Send, 
  Sparkles, 
  Volume2, 
  MessageCircle, 
  Heart,
  Calendar,
  ArrowRight
} from "lucide-react";

const sampleQuestions = [
  {
    category: "Philosophical",
    question: "What do you believe is the meaning of a life well-lived?",
    depth: "Deep"
  },
  {
    category: "Personal",
    question: "Describe a moment when you felt most proud of who you are.",
    depth: "Medium"
  },
  {
    category: "Wisdom",
    question: "What's the most important lesson you'd want your descendants to know?",
    depth: "Deep"
  },
  {
    category: "Relationships",
    question: "Tell me about someone who changed your perspective on love.",
    depth: "Medium"
  },
  {
    category: "Values",
    question: "When faced with a difficult choice, what guides your decisions?",
    depth: "Deep"
  }
];

const InteractiveDemo = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<string[]>([]);
  const [currentResponse, setCurrentResponse] = useState("");
  const [showAI, setShowAI] = useState(false);

  const handleSubmitResponse = () => {
    if (!currentResponse.trim()) return;
    
    setResponses([...responses, currentResponse]);
    setCurrentResponse("");
    
    if (currentStep < sampleQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowAI(true);
    }
  };

  const aiPersonality = {
    traits: ["Thoughtful", "Empathetic", "Philosophical", "Warm", "Wise"],
    voice: "Gentle, reflective tone with occasional humor",
    values: "Family, authenticity, growth, connection",
    communication: "Uses metaphors, asks follow-up questions, shares personal insights"
  };

  if (showAI) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Card className="p-8 border-2 border-warm-gold/20 shadow-xl">
          <div className="text-center mb-8">
            <Brain className="w-16 h-16 mx-auto mb-4 text-warm-gold" />
            <h2 className="text-3xl font-serif font-bold text-foreground mb-4">
              Your AI Essence is Learning
            </h2>
            <p className="text-muted-foreground">
              Based on your {responses.length} responses, AI is developing your digital personality
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-warm-gold" />
                Personality Profile
              </h3>
              <div className="space-y-2">
                {aiPersonality.traits.map((trait, index) => (
                  <Badge key={index} variant="secondary" className="mr-2">
                    {trait}
                  </Badge>
                ))}
              </div>
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Voice Pattern:</strong> {aiPersonality.voice}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-warm-gold" />
                Core Values Detected
              </h3>
              <div className="space-y-2">
                <p className="text-sm text-foreground">{aiPersonality.values}</p>
              </div>
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Communication Style:</strong> {aiPersonality.communication}
                </p>
              </div>
            </div>
          </div>

          {/* AI Interaction Preview */}
          <div className="border-t pt-8">
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-warm-gold" />
              Future Interaction Preview
            </h3>
            <div className="bg-gradient-subtle p-6 rounded-lg space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium">👤</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Your great-grandchild, 2089:</p>
                  <p className="text-foreground">"What advice would you give me about following my dreams?"</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-warm-gold/20 rounded-full flex items-center justify-center">
                  <Brain className="w-4 h-4 text-warm-gold" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm text-muted-foreground">Your AI Essence:</p>
                    <Volume2 className="w-4 h-4 text-warm-gold" />
                  </div>
                  <p className="text-foreground italic">
                    "Oh, my dear one... *gentle laugh* Dreams are like seeds - they need both courage and patience. 
                    I learned that the path isn't always straight, but that's what makes it beautiful. Tell me, 
                    what dreams are calling to your heart?"
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <Button 
              onClick={() => {
                setShowAI(false);
                setCurrentStep(0);
                setResponses([]);
              }}
              className="gap-2"
            >
              Try Another Demo
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif font-bold text-foreground mb-4">
          Interactive Demo: Building Your Digital Essence
        </h2>
        <p className="text-muted-foreground">
          Answer {sampleQuestions.length} sample questions to see how AI learns your personality
        </p>
        <div className="flex justify-center mt-4">
          <div className="bg-muted rounded-full px-4 py-2 text-sm">
            Question {currentStep + 1} of {sampleQuestions.length}
          </div>
        </div>
      </div>

      <Card className="p-8 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <Badge variant="outline" className="gap-2">
            <Calendar className="w-4 h-4" />
            {sampleQuestions[currentStep].category}
          </Badge>
          <Badge 
            variant={sampleQuestions[currentStep].depth === "Deep" ? "default" : "secondary"}
          >
            {sampleQuestions[currentStep].depth}
          </Badge>
        </div>

        <h3 className="text-xl font-serif text-foreground mb-6 leading-relaxed">
          {sampleQuestions[currentStep].question}
        </h3>

        <div className="space-y-4">
          <Textarea
            placeholder="Take your time... speak from the heart. The AI learns from the depth and authenticity of your response."
            value={currentResponse}
            onChange={(e) => setCurrentResponse(e.target.value)}
            className="min-h-32 text-base leading-relaxed resize-none"
          />
          
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Responses collected: {responses.length}
            </p>
            <Button 
              onClick={handleSubmitResponse}
              disabled={!currentResponse.trim()}
              className="gap-2"
            >
              <Send className="w-4 h-4" />
              {currentStep === sampleQuestions.length - 1 ? "Complete Demo" : "Next Question"}
            </Button>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Progress</span>
            <span>{Math.round(((currentStep + 1) / sampleQuestions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-warm-gold h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / sampleQuestions.length) * 100}%` }}
            />
          </div>
        </div>
      </Card>

      {responses.length > 0 && (
        <Card className="mt-6 p-6">
          <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-warm-gold" />
            Your Growing Archive
          </h4>
          <div className="space-y-2">
            {responses.map((response, index) => (
              <div key={index} className="text-sm text-muted-foreground border-l-2 border-warm-gold/20 pl-3">
                <strong>Q{index + 1}:</strong> {response.substring(0, 100)}...
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default InteractiveDemo;