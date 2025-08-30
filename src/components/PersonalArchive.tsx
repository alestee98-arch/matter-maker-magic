import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Archive, Clock, Heart, Sparkles } from "lucide-react";

const sampleEntries = [
  {
    id: 1,
    date: "March 15, 2024",
    question: "What moment from this week will you remember forever?",
    preview: "The sunset walk with my daughter where she asked me about the meaning of life...",
    type: "text",
    mood: "reflective"
  },
  {
    id: 2,
    date: "March 8, 2024",
    question: "Tell us about someone who made you smile recently.",
    preview: "My neighbor Mrs. Chen, who brought over homemade cookies and shared stories...",
    type: "text",
    mood: "joyful"
  },
  {
    id: 3,
    date: "March 1, 2024",
    question: "What lesson did life teach you this week?",
    preview: "Sometimes the best conversations happen in the quietest moments...",
    type: "audio",
    mood: "wise"
  },
];

const PersonalArchive = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Archive className="w-6 h-6 text-primary" />
          <h2 className="text-3xl font-serif font-medium text-foreground">
            Your Archive
          </h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          A growing collection of your thoughts, experiences, and wisdom — 
          preserved for yourself and those you choose to share with.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sampleEntries.map((entry) => (
          <Card key={entry.id} className="p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-start justify-between mb-3">
              <Badge variant="secondary" className="text-xs">
                {entry.type === 'audio' ? '🎵' : '✍️'} {entry.type}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {entry.date}
              </span>
            </div>
            
            <h3 className="text-sm font-medium text-foreground/80 mb-3 leading-relaxed">
              {entry.question}
            </h3>
            
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {entry.preview}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {entry.mood === 'joyful' && <Heart className="w-4 h-4 text-warm-gold" />}
                {entry.mood === 'reflective' && <Sparkles className="w-4 h-4 text-primary" />}
                {entry.mood === 'wise' && <Archive className="w-4 h-4 text-accent-foreground" />}
                <span className="text-xs text-muted-foreground capitalize">
                  {entry.mood}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center mt-12 p-8 bg-gradient-subtle rounded-lg">
        <Sparkles className="w-8 h-8 mx-auto mb-4 text-warm-gold" />
        <h3 className="text-lg font-serif font-medium text-foreground mb-2">
          Your Digital Legacy Grows
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto text-sm">
          Each response adds to your unique story. Over time, this becomes 
          a treasure trove of memories and wisdom for future generations.
        </p>
      </div>
    </div>
  );
};

export default PersonalArchive;