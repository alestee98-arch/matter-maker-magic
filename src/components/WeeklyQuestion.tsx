import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { PenTool, Mic, Video, Calendar } from 'lucide-react';

// Weekly questions pool with depth categories
const questions = [
  {
    id: 1,
    text: "What was a moment this week where you felt completely present?",
    depth: "Light"
  },
  {
    id: 2,
    text: "What's something small someone did for you that made you smile?",
    depth: "Light"
  },
  {
    id: 3,
    text: "What's a lesson you learned about yourself this week?",
    depth: "Medium"
  },
  {
    id: 4,
    text: "What's something you looked forward to and how did it feel when it happened?",
    depth: "Medium"
  },
  {
    id: 5,
    text: "What's a childhood memory that came to mind this week?",
    depth: "Deep"
  },
  {
    id: 6,
    text: "What would you tell your 17-year-old self about love and failure?",
    depth: "Deep"
  },
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

  const getDepthVariant = (depth: string) => {
    switch (depth) {
      case 'Light': return 'bg-premium-green/20 text-premium-green';
      case 'Medium': return 'bg-premium-blue/20 text-premium-blue';
      case 'Deep': return 'bg-premium-amber/20 text-premium-amber';
      default: return 'secondary';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Week's Question
            </CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </CardDescription>
          </div>
          <Badge className={getDepthVariant(currentQuestion.depth)}>
            {currentQuestion.depth}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-xl bg-gradient-card border border-border p-6">
          <p className="text-lg font-medium leading-relaxed">
            {currentQuestion.text}
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={responseType === 'text' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setResponseType('text')}
              className="flex items-center gap-2"
            >
              <PenTool className="h-4 w-4" />
              Text
            </Button>
            <Button
              variant={responseType === 'audio' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setResponseType('audio')}
              className="flex items-center gap-2"
            >
              <Mic className="h-4 w-4" />
              Audio
            </Button>
            <Button
              variant={responseType === 'video' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setResponseType('video')}
              className="flex items-center gap-2"
            >
              <Video className="h-4 w-4" />
              Video
            </Button>
          </div>

          {responseType === 'text' && (
            <div className="space-y-4">
              <Textarea
                placeholder="Share your thoughts here..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                className="min-h-[120px] bg-card border-border"
              />
              <div className="flex gap-3">
                <Button 
                  onClick={handleSubmit}
                  disabled={!response.trim()}
                  className="flex-1"
                >
                  Save Response
                </Button>
                <Button variant="outline">
                  Schedule for later
                </Button>
              </div>
            </div>
          )}

          {responseType === 'audio' && (
            <div className="rounded-xl border-2 border-dashed border-border bg-card p-8 text-center">
              <Mic className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Audio recording coming soon...</p>
              <p className="mt-2 text-xs text-muted-foreground">
                You&apos;ll be able to record up to 5 minutes of high quality audio
              </p>
            </div>
          )}

          {responseType === 'video' && (
            <div className="rounded-xl border-2 border-dashed border-border bg-card p-8 text-center">
              <Video className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Video recording coming soon...</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Record videos up to 3 minutes in HD
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}