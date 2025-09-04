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
    text: "¿Cuál fue un momento esta semana donde te sentiste completamente presente?",
    depth: "Ligera"
  },
  {
    id: 2,
    text: "¿Qué es algo pequeño que alguien hizo por ti que te hizo sonreír?",
    depth: "Ligera"
  },
  {
    id: 3,
    text: "¿Cuál es una lección que aprendiste sobre ti mismo esta semana?",
    depth: "Media"
  },
  {
    id: 4,
    text: "¿Qué es algo que esperabas con ansias y cómo se sintió cuando sucedió?",
    depth: "Media"
  },
  {
    id: 5,
    text: "¿Cuál es un recuerdo de la infancia que te vino a la mente esta semana?",
    depth: "Profunda"
  },
  {
    id: 6,
    text: "¿Qué le dirías a tu yo de 17 años sobre el amor y el fracaso?",
    depth: "Profunda"
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
      case 'Ligera': return 'bg-premium-green/20 text-premium-green';
      case 'Media': return 'bg-premium-blue/20 text-premium-blue';
      case 'Profunda': return 'bg-premium-amber/20 text-premium-amber';
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
              Pregunta de la Semana
            </CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString('es-ES', { 
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
              Texto
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
                placeholder="Comparte tus pensamientos aquí..."
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
                  Guardar Respuesta
                </Button>
                <Button variant="outline">
                  Programar para más tarde
                </Button>
              </div>
            </div>
          )}

          {responseType === 'audio' && (
            <div className="rounded-xl border-2 border-dashed border-border bg-card p-8 text-center">
              <Mic className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Grabación de audio próximamente...</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Podrás grabar hasta 5 minutos de audio de alta calidad
              </p>
            </div>
          )}

          {responseType === 'video' && (
            <div className="rounded-xl border-2 border-dashed border-border bg-card p-8 text-center">
              <Video className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Grabación de video próximamente...</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Graba videos de hasta 3 minutos en HD
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}