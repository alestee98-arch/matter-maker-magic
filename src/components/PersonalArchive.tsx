import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Archive, Calendar, Heart, Brain } from 'lucide-react';

// Enhanced sample journal entries data
const sampleEntries = [
  {
    id: 1,
    date: '2024-01-15',
    question: '¿Cuál fue un momento donde te sentiste completamente presente?',
    preview: 'Esta mañana, mientras tomaba café en el balcón, observando cómo la luz del amanecer se filtraba entre los árboles...',
    type: 'Reflexión',
    mood: '😌',
    category: 'Mindfulness',
    privacy: 'Private',
    mediaType: 'text'
  },
  {
    id: 2,
    date: '2024-01-08',
    question: '¿Qué es algo pequeño que alguien hizo por ti que te hizo sonreír?',
    preview: 'Mi vecina María me trajo flores de su jardín sin ninguna razón especial. Un gesto tan simple pero que iluminó todo mi día...',
    type: 'Gratitud',
    mood: '😊',
    category: 'Relaciones',
    privacy: 'Share',
    mediaType: 'audio'
  },
  {
    id: 3,
    date: '2024-01-01',
    question: '¿Cuál es una lección que aprendiste sobre ti mismo esta semana?',
    preview: 'Descubrí que puedo ser más paciente de lo que pensaba. Cuando mi hermano necesitaba ayuda con la mudanza...',
    type: 'Aprendizaje',
    mood: '🤔',
    category: 'Crecimiento',
    privacy: 'Legacy',
    mediaType: 'video'
  },
  {
    id: 4,
    date: '2023-12-25',
    question: '¿Qué tradición familiar significa más para ti y por qué?',
    preview: 'Cada Navidad, mi abuela nos cuenta la historia de cómo llegó al país. Sus ojos se iluminan al recordar...',
    type: 'Memoria',
    mood: '❤️',
    category: 'Familia',
    privacy: 'Legacy',
    mediaType: 'text'
  }
];

const categories = ['Todos', 'Mindfulness', 'Relaciones', 'Crecimiento', 'Familia'];

export default function PersonalArchive() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [showFilters, setShowFilters] = useState(false);

  const filteredEntries = sampleEntries.filter(entry => {
    const matchesSearch = entry.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.preview.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || entry.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getPrivacyIcon = (privacy: string) => {
    switch (privacy) {
      case 'Private': return '🔒';
      case 'Share': return '👥';
      case 'Legacy': return '⏳';
      default: return '🔒';
    }
  };

  const getMediaIcon = (mediaType: string) => {
    switch (mediaType) {
      case 'text': return '✍️';
      case 'audio': return '🎙️';
      case 'video': return '🎥';
      default: return '✍️';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5" />
              Tu Archivo Personal
            </CardTitle>
            <CardDescription>
              Un espacio seguro para reflexionar y preservar tus pensamientos más importantes
            </CardDescription>
          </div>
          <Badge variant="secondary">{sampleEntries.length} entradas</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar en tus entradas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          
          {showFilters && (
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Entries List */}
        <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <div key={entry.id} className="rounded-xl border bg-gradient-card p-4 transition-all hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(entry.date).toLocaleDateString('es-ES')}
                    </Badge>
                    <Badge variant="secondary">{entry.type}</Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getMediaIcon(entry.mediaType)} {entry.mediaType}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {getPrivacyIcon(entry.privacy)} {entry.privacy}
                    </span>
                  </div>
                  <h3 className="font-medium leading-tight">{entry.question}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {entry.preview}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">Ver completa</Button>
                    <Button variant="outline" size="sm">Editar</Button>
                  </div>
                </div>
                <div className="text-2xl">{entry.mood}</div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredEntries.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No se encontraron entradas que coincidan con tu búsqueda.</p>
          </div>
        )}
        
        <div className="mt-8 rounded-xl bg-gradient-accent/10 border border-border p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Heart className="h-5 w-5 text-premium-purple" />
            <Brain className="h-5 w-5 text-premium-blue" />
          </div>
          <h3 className="font-medium mb-2">Tu legado digital está creciendo</h3>
          <p className="text-sm text-muted-foreground">
            Cada respuesta es un fragmento de tu historia. Con el tiempo, crearás un archivo único 
            de quién eres y cómo ves el mundo.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}