import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Video, Type, Send, Calendar } from "lucide-react";
import { useState } from "react";

const questions = [
  "What moment from this week will you remember forever?",
  "Tell us about someone who made you smile recently.",
  "What lesson did life teach you this week?",
  "Describe a challenge you faced and how you overcame it.",
  "What are you most grateful for right now?",
  "Share a memory that brings you joy.",
  "What advice would you give to someone going through what you experienced this week?",
  "How have you grown or changed recently?",
];

const WeeklyQuestion = () => {
  const [currentQuestion] = useState(
    questions[Math.floor(Math.random() * questions.length)]
  );
  const [response, setResponse] = useState("");
  const [responseType, setResponseType] = useState<'text' | 'audio' | 'video'>('text');

  const handleSubmit = () => {
    if (!response.trim()) return;
    
    // Here you would save the response
    console.log('Saving response:', { question: currentQuestion, response, type: responseType });
    setResponse("");
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <Card className="p-8 border-gentle-shadow/20 shadow-lg">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Week of {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <h2 className="text-2xl font-serif font-medium text-foreground mb-2">
            This week's question
          </h2>
          <p className="text-lg text-foreground/80 leading-relaxed">
            {currentQuestion}
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-center gap-2 mb-4">
            <Button
              variant={responseType === 'text' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setResponseType('text')}
              className="gap-2"
            >
              <Type className="w-4 h-4" />
              Text
            </Button>
            <Button
              variant={responseType === 'audio' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setResponseType('audio')}
              className="gap-2"
            >
              <Mic className="w-4 h-4" />
              Audio
            </Button>
            <Button
              variant={responseType === 'video' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setResponseType('video')}
              className="gap-2"
            >
              <Video className="w-4 h-4" />
              Video
            </Button>
          </div>

          {responseType === 'text' && (
            <div className="space-y-4">
              <Textarea
                placeholder="Share your thoughts here... Take your time, speak from the heart."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                className="min-h-32 text-base leading-relaxed resize-none"
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleSubmit}
                  disabled={!response.trim()}
                  className="gap-2"
                >
                  <Send className="w-4 h-4" />
                  Save Response
                </Button>
              </div>
            </div>
          )}

          {responseType === 'audio' && (
            <div className="text-center py-8 text-muted-foreground">
              <Mic className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Audio recording feature coming soon</p>
            </div>
          )}

          {responseType === 'video' && (
            <div className="text-center py-8 text-muted-foreground">
              <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Video recording feature coming soon</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default WeeklyQuestion;