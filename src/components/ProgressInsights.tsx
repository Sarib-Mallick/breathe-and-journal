import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Calendar, Target, Award, Heart, Brain, Timer } from 'lucide-react';

interface MoodEntry {
  emoji: string;
  label: string;
  date: string;
}

interface JournalEntry {
  id: string;
  content: string;
  date: string;
  prompt?: string;
}

interface BreathingSession {
  date: string;
  cycles: number;
  duration: number;
}

interface InsightData {
  streakDays: number;
  totalEntries: number;
  favoriteTime: string;
  moodTrend: 'improving' | 'stable' | 'declining';
  totalBreathingMinutes: number;
  journalWordCount: number;
  weeklyGoalProgress: number;
}

export function ProgressInsights() {
  const [insights, setInsights] = useState<InsightData | null>(null);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = () => {
    // Load data from localStorage
    const moodData = localStorage.getItem('moodHistory');
    const journalData = localStorage.getItem('journalEntries');
    const breathingData = localStorage.getItem('breathingSessions') || '[]';

    const moods: MoodEntry[] = moodData ? JSON.parse(moodData) : [];
    const journals: JournalEntry[] = journalData ? JSON.parse(journalData) : [];
    const breathingSessions: BreathingSession[] = JSON.parse(breathingData);

    setMoodHistory(moods);
    setJournalEntries(journals);

    // Calculate insights
    const streakDays = calculateStreak(moods, journals);
    const totalEntries = moods.length + journals.length;
    const favoriteTime = calculateFavoriteTime(journals);
    const moodTrend = calculateMoodTrend(moods);
    const totalBreathingMinutes = breathingSessions.reduce((total, session) => total + session.duration / 60, 0);
    const journalWordCount = journals.reduce((total, entry) => {
      return total + entry.content.trim().split(/\s+/).filter(word => word.length > 0).length;
    }, 0);
    const weeklyGoalProgress = calculateWeeklyProgress(moods, journals, breathingSessions);

    setInsights({
      streakDays,
      totalEntries,
      favoriteTime,
      moodTrend,
      totalBreathingMinutes: Math.round(totalBreathingMinutes),
      journalWordCount,
      weeklyGoalProgress
    });
  };

  const calculateStreak = (moods: MoodEntry[], journals: JournalEntry[]): number => {
    const today = new Date();
    let streak = 0;
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateString = checkDate.toDateString();
      
      const hasActivity = moods.some(mood => new Date(mood.date).toDateString() === dateString) ||
                         journals.some(journal => new Date(journal.date).toDateString() === dateString);
      
      if (hasActivity) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  };

  const calculateFavoriteTime = (journals: JournalEntry[]): string => {
    if (journals.length === 0) return 'morning';
    
    const timeSlots = { morning: 0, afternoon: 0, evening: 0 };
    
    journals.forEach(entry => {
      const hour = new Date(entry.date).getHours();
      if (hour < 12) timeSlots.morning++;
      else if (hour < 18) timeSlots.afternoon++;
      else timeSlots.evening++;
    });
    
    return Object.entries(timeSlots).reduce((a, b) => timeSlots[a[0] as keyof typeof timeSlots] > timeSlots[b[0] as keyof typeof timeSlots] ? a : b)[0];
  };

  const calculateMoodTrend = (moods: MoodEntry[]): 'improving' | 'stable' | 'declining' => {
    if (moods.length < 3) return 'stable';
    
    const moodValues = {
      '😊': 5, '😍': 5, '😌': 4, '😐': 3, '🤔': 3, '😴': 2, '😔': 1, '😤': 1
    };
    
    const recent = moods.slice(0, 3).map(m => moodValues[m.emoji as keyof typeof moodValues] || 3);
    const older = moods.slice(3, 6).map(m => moodValues[m.emoji as keyof typeof moodValues] || 3);
    
    if (older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    
    const diff = recentAvg - olderAvg;
    if (diff > 0.5) return 'improving';
    if (diff < -0.5) return 'declining';
    return 'stable';
  };

  const calculateWeeklyProgress = (moods: MoodEntry[], journals: JournalEntry[], breathing: BreathingSession[]): number => {
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    
    const weeklyMoods = moods.filter(m => new Date(m.date) >= thisWeek).length;
    const weeklyJournals = journals.filter(j => new Date(j.date) >= thisWeek).length;
    const weeklyBreathing = breathing.filter(b => new Date(b.date) >= thisWeek).length;
    
    const totalActivities = weeklyMoods + weeklyJournals + weeklyBreathing;
    const weeklyGoal = 14; // 2 activities per day
    
    return Math.min(100, (totalActivities / weeklyGoal) * 100);
  };

  const getStreakIcon = (days: number) => {
    if (days >= 7) return '🔥';
    if (days >= 3) return '⭐';
    return '🌱';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-success" />;
      case 'declining': return <TrendingUp className="w-4 h-4 text-warning rotate-180" />;
      default: return <Target className="w-4 h-4 text-muted-foreground" />;
    }
  };

  if (!insights) return null;

  return (
    <div className="space-y-6">
      {/* Weekly Progress */}
      <Card className="glass-card border-0 hover-lift">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-display flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Weekly Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Goal: 2 mindful activities daily</span>
              <span className="text-2xl font-bold text-primary">{Math.round(insights.weeklyGoalProgress)}%</span>
            </div>
            <Progress value={insights.weeklyGoalProgress} className="h-3" />
            <p className="text-xs text-muted-foreground">
              {insights.weeklyGoalProgress >= 100 ? "Amazing! You've exceeded your weekly goal! 🎉" :
               insights.weeklyGoalProgress >= 70 ? "Great progress! You're almost there! 💪" :
               "Keep going! Every small step counts. 🌟"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Streak */}
        <Card className="glass-card border-0 hover-lift animate-fade-in-scale">
          <CardContent className="p-6 text-center">
            <div className="text-3xl mb-2">{getStreakIcon(insights.streakDays)}</div>
            <div className="text-2xl font-bold text-primary mb-1">
              {insights.streakDays}
            </div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
            <Badge variant="secondary" className="mt-2 text-xs">
              {insights.streakDays >= 7 ? 'On Fire!' : insights.streakDays >= 3 ? 'Building' : 'Starting'}
            </Badge>
          </CardContent>
        </Card>

        {/* Total Entries */}
        <Card className="glass-card border-0 hover-lift animate-fade-in-scale" style={{ animationDelay: '0.1s' }}>
          <CardContent className="p-6 text-center">
            <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-primary mb-1">
              {insights.totalEntries}
            </div>
            <div className="text-sm text-muted-foreground">Total Entries</div>
            <Badge variant="secondary" className="mt-2 text-xs">
              All Activities
            </Badge>
          </CardContent>
        </Card>

        {/* Mood Trend */}
        <Card className="glass-card border-0 hover-lift animate-fade-in-scale" style={{ animationDelay: '0.2s' }}>
          <CardContent className="p-6 text-center">
            <div className="flex justify-center mb-2">
              {getTrendIcon(insights.moodTrend)}
            </div>
            <div className="text-lg font-semibold text-foreground mb-1 capitalize">
              {insights.moodTrend}
            </div>
            <div className="text-sm text-muted-foreground">Mood Trend</div>
            <Badge 
              variant={insights.moodTrend === 'improving' ? 'default' : 'secondary'} 
              className="mt-2 text-xs"
            >
              {insights.moodTrend === 'improving' ? 'Great!' : 
               insights.moodTrend === 'declining' ? 'Stay Strong' : 'Steady'}
            </Badge>
          </CardContent>
        </Card>

        {/* Breathing Minutes */}
        <Card className="glass-card border-0 hover-lift animate-fade-in-scale" style={{ animationDelay: '0.3s' }}>
          <CardContent className="p-6 text-center">
            <Timer className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-primary mb-1">
              {insights.totalBreathingMinutes}
            </div>
            <div className="text-sm text-muted-foreground">Minutes Breathing</div>
            <Badge variant="secondary" className="mt-2 text-xs">
              Mindful Time
            </Badge>
          </CardContent>
        </Card>

        {/* Journal Words */}
        <Card className="glass-card border-0 hover-lift animate-fade-in-scale" style={{ animationDelay: '0.4s' }}>
          <CardContent className="p-6 text-center">
            <Brain className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-primary mb-1">
              {insights.journalWordCount.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Words Written</div>
            <Badge variant="secondary" className="mt-2 text-xs">
              Thoughts Captured
            </Badge>
          </CardContent>
        </Card>

        {/* Favorite Time */}
        <Card className="glass-card border-0 hover-lift animate-fade-in-scale" style={{ animationDelay: '0.5s' }}>
          <CardContent className="p-6 text-center">
            <Heart className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-lg font-semibold text-foreground mb-1 capitalize">
              {insights.favoriteTime}
            </div>
            <div className="text-sm text-muted-foreground">Favorite Time</div>
            <Badge variant="secondary" className="mt-2 text-xs">
              Peak Hours
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card className="glass-card border-0 hover-lift">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {insights.streakDays >= 1 && (
              <div className="text-center p-3 bg-gradient-primary rounded-xl text-primary-foreground animate-bounce-gentle">
                <div className="text-2xl mb-1">🌱</div>
                <div className="text-xs font-medium">First Steps</div>
              </div>
            )}
            {insights.streakDays >= 3 && (
              <div className="text-center p-3 bg-gradient-warm rounded-xl text-accent-foreground">
                <div className="text-2xl mb-1">⭐</div>
                <div className="text-xs font-medium">Building Habit</div>
              </div>
            )}
            {insights.streakDays >= 7 && (
              <div className="text-center p-3 bg-gradient-primary rounded-xl text-primary-foreground">
                <div className="text-2xl mb-1">🔥</div>
                <div className="text-xs font-medium">On Fire!</div>
              </div>
            )}
            {insights.journalWordCount >= 1000 && (
              <div className="text-center p-3 bg-gradient-cool rounded-xl text-muted-foreground">
                <div className="text-2xl mb-1">📚</div>
                <div className="text-xs font-medium">Wordsmith</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}