import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PenTool, Mic, Video, Sparkles } from 'lucide-react';

const questions = [
  { id: 1, text: "What was a moment this week where you felt completely present?", depth: "Light" },
  { id: 2, text: "What's something small someone did for you that made you smile?", depth: "Light" },
  { id: 3, text: "What's a lesson you learned about yourself this week?", depth: "Medium" },
  { id: 4, text: "What's something you looked forward to and how did it feel when it happened?", depth: "Medium" },
  { id: 5, text: "What's a childhood memory that came to mind this week?", depth: "Deep" },
  { id: 6, text: "What would you tell your 17-year-old self about love and failure?", depth: "Deep" },
];

export default function WeeklyQuestion() {
  const [currentQuestion] = useState(() => 
    questions[Math.floor(Math.random() * questions.length)]
  );
  const [response, setResponse] = useState('');
  const [responseType, setResponseType] = useState<'text' | 'audio' | 'video'>('text');

  const handleSubmit = () => {
    console.log('Response submitted:', { question: currentQuestion, response, type: responseType });
    setResponse('');
  };

  const getDepthStyle = (depth: string) => {
    switch (depth) {
      case 'Light': return 'bg-matter-sage/20 text-matter-sage border-matter-sage/30';
      case 'Medium': return 'bg-primary/10 text-primary border-primary/30';
      case 'Deep': return 'bg-matter-gold/20 text-matter-gold border-matter-gold/30';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="bg-card rounded-3xl border border-border shadow-md overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border bg-secondary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">This Week's Question</h2>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDepthStyle(currentQuestion.depth)}`}>
            {currentQuestion.depth}
          </span>
        </div>
      </div>

      {/* Question */}
      <div className="px-6 py-8">
        <p className="text-xl md:text-2xl text-foreground leading-relaxed">
          {currentQuestion.text}
        </p>
      </div>

      {/* Response type selector */}
      <div className="px-6 pb-4">
        <div className="flex gap-2">
          {[
            { type: 'text' as const, icon: PenTool, label: 'Text' },
            { type: 'audio' as const, icon: Mic, label: 'Audio' },
            { type: 'video' as const, icon: Video, label: 'Video' },
          ].map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              onClick={() => setResponseType(type)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                responseType === type
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Response area */}
      <div className="px-6 pb-6">
        {responseType === 'text' && (
          <div className="space-y-4">
            <Textarea
              placeholder="Share your thoughts..."
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              className="min-h-[140px] bg-background border-border rounded-xl resize-none"
            />
            <div className="flex gap-3">
              <Button 
                onClick={handleSubmit}
                disabled={!response.trim()}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-12"
              >
                Save Response
              </Button>
              <Button variant="outline" className="rounded-xl h-12">
                Save Draft
              </Button>
            </div>
          </div>
        )}

        {responseType === 'audio' && (
          <div className="rounded-2xl border-2 border-dashed border-border bg-secondary/30 p-10 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
              <Mic className="h-8 w-8 text-accent" />
            </div>
            <p className="text-foreground font-medium mb-2">Record Your Story</p>
            <p className="text-sm text-muted-foreground">
              Audio recording coming soon • Up to 5 minutes
            </p>
          </div>
        )}

        {responseType === 'video' && (
          <div className="rounded-2xl border-2 border-dashed border-border bg-secondary/30 p-10 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-matter-gold/10 flex items-center justify-center">
              <Video className="h-8 w-8 text-matter-gold" />
            </div>
            <p className="text-foreground font-medium mb-2">Record Your Story</p>
            <p className="text-sm text-muted-foreground">
              Video recording coming soon • Up to 3 minutes HD
            </p>
          </div>
        )}
      </div>
    </div>
  );
}