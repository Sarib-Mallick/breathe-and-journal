import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, BookOpen, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface JournalEntry {
  id: string;
  content: string;
  date: string;
  prompt?: string;
}

const journalPrompts = [
  "What am I grateful for today?",
  "What challenged me today and how did I handle it?",
  "What made me smile today?",
  "What would I like to improve about today?",
  "What am I looking forward to tomorrow?",
  "How am I feeling right now, and why?",
  "What was the highlight of my day?",
  "What did I learn about myself today?",
  "What act of kindness did I witness or perform?",
  "What would I tell my younger self about today?",
];

export function Journal() {
  const [currentEntry, setCurrentEntry] = useState('');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('journalEntries');
    if (saved) {
      setEntries(JSON.parse(saved));
    }
    
    // Auto-save current entry
    const autoSave = setTimeout(() => {
      if (currentEntry.trim()) {
        saveEntry(false);
      }
    }, 3000);

    return () => clearTimeout(autoSave);
  }, [currentEntry]);

  const saveEntry = async (showToast = true) => {
    if (!currentEntry.trim()) return;

    setIsSaving(true);
    
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      content: currentEntry,
      date: new Date().toISOString(),
      prompt: currentPrompt || undefined,
    };

    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
    
    setCurrentEntry('');
    setCurrentPrompt('');
    setIsSaving(false);

    if (showToast) {
      toast({
        title: "Entry saved! 📝",
        description: "Your thoughts have been safely stored.",
      });
    }
  };

  const getRandomPrompt = () => {
    const randomPrompt = journalPrompts[Math.floor(Math.random() * journalPrompts.length)];
    setCurrentPrompt(randomPrompt);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  return (
    <div className="space-y-6">
      {/* Writing Area */}
      <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-semibold text-foreground">
              Journal
            </CardTitle>
            <Button
              onClick={getRandomPrompt}
              variant="outline"
              size="sm"
              className="rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Prompt
            </Button>
          </div>
          <p className="text-muted-foreground">
            Express your thoughts freely in this safe space
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentPrompt && (
            <div className="p-4 bg-accent/20 rounded-xl border border-accent/30">
              <p className="text-sm font-medium text-accent-foreground mb-2">
                Today's prompt:
              </p>
              <p className="text-foreground italic">"{currentPrompt}"</p>
            </div>
          )}
          
          <Textarea
            value={currentEntry}
            onChange={(e) => setCurrentEntry(e.target.value)}
            placeholder="What's on your mind today? Start writing..."
            className="min-h-[200px] resize-none text-base leading-relaxed border-0 bg-muted/20 focus:bg-muted/30 transition-colors"
            style={{ boxShadow: 'none' }}
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>{getWordCount(currentEntry)} words</span>
              {isSaving && <span className="text-primary">Auto-saving...</span>}
            </div>
            <Button
              onClick={() => saveEntry(true)}
              disabled={!currentEntry.trim() || isSaving}
              className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Entry
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Previous Entries */}
      {entries.length > 0 && (
        <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Your Journey ({entries.length} entries)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {entries.slice(0, 5).map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 bg-muted/20 rounded-xl border border-muted/40 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      {formatDate(entry.date)}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {getWordCount(entry.content)} words
                    </Badge>
                  </div>
                  
                  {entry.prompt && (
                    <div className="mb-2 p-2 bg-accent/10 rounded-lg">
                      <p className="text-xs text-accent-foreground italic">
                        Prompt: "{entry.prompt}"
                      </p>
                    </div>
                  )}
                  
                  <p className="text-sm text-foreground leading-relaxed line-clamp-3">
                    {entry.content}
                  </p>
                </div>
              ))}
              
              {entries.length > 5 && (
                <div className="text-center py-4">
                  <Badge variant="outline" className="text-xs">
                    +{entries.length - 5} more entries
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}