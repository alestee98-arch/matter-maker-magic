import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Archive, Lock, Users, Clock, FileText, Mic, Video } from 'lucide-react';

const sampleEntries = [
  {
    id: 1,
    date: '2024-01-15',
    question: 'What was a moment where you felt completely present?',
    preview: 'This morning, while having coffee on the balcony, watching how the dawn light filtered through the trees...',
    category: 'Mindfulness',
    privacy: 'Private',
    mediaType: 'text'
  },
  {
    id: 2,
    date: '2024-01-08',
    question: "What's something small someone did for you that made you smile?",
    preview: 'My neighbor Maria brought me flowers from her garden for no particular reason...',
    category: 'Relationships',
    privacy: 'Share',
    mediaType: 'audio'
  },
  {
    id: 3,
    date: '2024-01-01',
    question: "What's a lesson you learned about yourself this week?",
    preview: 'I discovered I can be more patient than I thought...',
    category: 'Growth',
    privacy: 'Legacy',
    mediaType: 'video'
  },
  {
    id: 4,
    date: '2023-12-25',
    question: 'What family tradition means the most to you and why?',
    preview: 'Every Christmas, my grandmother tells us the story of how she came to this country...',
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
      case 'Private': return <Lock className="h-3 w-3" />;
      case 'Share': return <Users className="h-3 w-3" />;
      case 'Legacy': return <Clock className="h-3 w-3" />;
      default: return <Lock className="h-3 w-3" />;
    }
  };

  const getPrivacyStyle = (privacy: string) => {
    switch (privacy) {
      case 'Private': return 'bg-muted text-muted-foreground';
      case 'Share': return 'bg-primary/10 text-primary';
      case 'Legacy': return 'bg-matter-gold/10 text-matter-gold';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getMediaIcon = (mediaType: string) => {
    switch (mediaType) {
      case 'text': return <FileText className="h-4 w-4" />;
      case 'audio': return <Mic className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-card rounded-3xl border border-border shadow-md overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border bg-secondary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Archive className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Your Archive</h2>
              <p className="text-sm text-muted-foreground">{sampleEntries.length} stories preserved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search your stories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background border-border rounded-xl"
            />
          </div>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className="rounded-xl"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        {showFilters && (
          <div className="flex flex-wrap gap-2 mt-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Entries List */}
      <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
        {filteredEntries.map((entry) => (
          <div 
            key={entry.id} 
            className="bg-background rounded-2xl p-4 border border-border hover:border-primary/30 transition-all cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground flex-shrink-0">
                {getMediaIcon(entry.mediaType)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-muted-foreground">
                    {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${getPrivacyStyle(entry.privacy)}`}>
                    {getPrivacyIcon(entry.privacy)}
                    {entry.privacy}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-foreground line-clamp-1 mb-1">
                  {entry.question}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {entry.preview}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {filteredEntries.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No entries found</p>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="px-6 py-4 border-t border-border bg-secondary/30">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Your stories become your legacy
          </p>
          <Button variant="outline" size="sm" className="rounded-full">
            View All Stories
          </Button>
        </div>
      </div>
    </div>
  );
}