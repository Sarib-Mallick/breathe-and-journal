import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface MoodEntry {
  emoji: string;
  label: string;
  date: string;
}

const moods = [
  { emoji: '😊', label: 'Happy', color: 'hover:bg-yellow-100' },
  { emoji: '😌', label: 'Calm', color: 'hover:bg-green-100' },
  { emoji: '😴', label: 'Tired', color: 'hover:bg-blue-100' },
  { emoji: '😔', label: 'Sad', color: 'hover:bg-gray-100' },
  { emoji: '😤', label: 'Stressed', color: 'hover:bg-red-100' },
  { emoji: '🤔', label: 'Confused', color: 'hover:bg-purple-100' },
  { emoji: '😍', label: 'Excited', color: 'hover:bg-pink-100' },
  { emoji: '😐', label: 'Neutral', color: 'hover:bg-gray-50' },
];

export function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('moodHistory');
    if (saved) {
      setMoodHistory(JSON.parse(saved));
    }

    // Check if mood already logged today
    const today = new Date().toDateString();
    const todayMood = JSON.parse(saved || '[]').find(
      (entry: MoodEntry) => new Date(entry.date).toDateString() === today
    );
    if (todayMood) {
      setSelectedMood(todayMood.emoji);
    }
  }, []);

  const handleMoodSelect = (emoji: string, label: string) => {
    const today = new Date().toDateString();
    const newEntry: MoodEntry = {
      emoji,
      label,
      date: new Date().toISOString(),
    };

    // Remove any existing entry for today and add new one
    const updatedHistory = moodHistory.filter(
      entry => new Date(entry.date).toDateString() !== today
    );
    updatedHistory.unshift(newEntry);

    // Keep only last 7 days
    const recentHistory = updatedHistory.slice(0, 7);
    
    setMoodHistory(recentHistory);
    setSelectedMood(emoji);
    localStorage.setItem('moodHistory', JSON.stringify(recentHistory));
    
    toast({
      title: "Mood logged! 📝",
      description: `You're feeling ${label.toLowerCase()} today.`,
    });
  };

  const getRecentMoods = () => {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toDateString();
      
      const moodForDay = moodHistory.find(
        entry => new Date(entry.date).toDateString() === dateString
      );
      
      last7Days.push({
        date: date,
        mood: moodForDay,
        isToday: i === 0,
      });
    }
    
    return last7Days;
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-semibold text-foreground">
            How are you feeling today?
          </CardTitle>
          <p className="text-muted-foreground">
            Take a moment to check in with yourself
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3 mb-6">
            {moods.map((mood) => (
              <Button
                key={mood.emoji}
                variant="ghost"
                onClick={() => handleMoodSelect(mood.emoji, mood.label)}
                className={`h-auto p-4 flex flex-col items-center space-y-2 rounded-xl transition-all duration-200 transform hover:scale-105 ${
                  selectedMood === mood.emoji 
                    ? 'bg-primary/20 border-2 border-primary/30 shadow-md' 
                    : 'hover:bg-muted/60 hover:shadow-sm'
                }`}
              >
                <span className="text-3xl">{mood.emoji}</span>
                <span className="text-xs font-medium text-center">{mood.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mood History */}
      <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">This Week's Journey</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            {getRecentMoods().map((day, index) => (
              <div key={index} className="flex flex-col items-center space-y-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  day.isToday ? 'bg-primary/20 border-2 border-primary/40' : 'bg-muted/40'
                }`}>
                  {day.mood ? (
                    <span className="text-xl">{day.mood.emoji}</span>
                  ) : (
                    <span className="text-muted-foreground text-xs">-</span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {day.date.toLocaleDateString('en', { weekday: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
