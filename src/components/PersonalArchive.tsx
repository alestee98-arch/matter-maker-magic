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
    question: 'What was a moment where you felt completely present?',
    preview: 'This morning, while having coffee on the balcony, watching how the dawn light filtered through the trees...',
    type: 'Reflection',
    mood: '😌',
    category: 'Mindfulness',
    privacy: 'Private',
    mediaType: 'text'
  },
  {
    id: 2,
    date: '2024-01-08',
    question: 'What\'s something small someone did for you that made you smile?',
    preview: 'My neighbor Maria brought me flowers from her garden for no particular reason. Such a simple gesture but it brightened my entire day...',
    type: 'Gratitude',
    mood: '😊',
    category: 'Relationships',
    privacy: 'Share',
    mediaType: 'audio'
  },
  {
    id: 3,
    date: '2024-01-01',
    question: 'What\'s a lesson you learned about yourself this week?',
    preview: 'I discovered I can be more patient than I thought. When my brother needed help moving...',
    type: 'Learning',
    mood: '🤔',
    category: 'Growth',
    privacy: 'Legacy',
    mediaType: 'video'
  },
  {
    id: 4,
    date: '2023-12-25',
    question: 'What family tradition means the most to you and why?',
    preview: 'Every Christmas, my grandmother tells us the story of how she came to this country. Her eyes light up as she remembers...',
    type: 'Memory',
    mood: '❤️',
    category: 'Family',
    privacy: 'Legacy',
    mediaType: 'text'
  }
];

const categories = ['All', 'Mindfulness', 'Relationships', 'Growth', 'Family'];

export default function PersonalArchive() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const filteredEntries = sampleEntries.filter(entry => {
    const matchesSearch = entry.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.preview.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || entry.category === selectedCategory;
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
              Your Personal Archive
            </CardTitle>
            <CardDescription>
              A safe space to reflect and preserve your most important thoughts
            </CardDescription>
          </div>
          <Badge variant="secondary">{sampleEntries.length} entries</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search your entries..."
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
                      {new Date(entry.date).toLocaleDateString('en-US')}
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
                    <Button variant="outline" size="sm">View full</Button>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
                <div className="text-2xl">{entry.mood}</div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredEntries.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No entries found matching your search.</p>
          </div>
        )}
        
        <div className="mt-8 rounded-xl bg-gradient-accent/10 border border-border p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Heart className="h-5 w-5 text-premium-purple" />
            <Brain className="h-5 w-5 text-premium-blue" />
          </div>
          <h3 className="font-medium mb-2">Your digital legacy is growing</h3>
          <p className="text-sm text-muted-foreground">
            Each response is a fragment of your story. Over time, you&apos;ll create a unique archive 
            of who you are and how you see the world.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}