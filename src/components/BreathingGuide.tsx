import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

export function BreathingGuide() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale');
  const [timeRemaining, setTimeRemaining] = useState(4);
  const [cycle, setCycle] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  // Breathing pattern: 4-4-4-2 (inhale-hold-exhale-pause)
  const phases = {
    inhale: { duration: 4, next: 'hold', instruction: 'Breathe In' },
    hold: { duration: 4, next: 'exhale', instruction: 'Hold' },
    exhale: { duration: 4, next: 'pause', instruction: 'Breathe Out' },
    pause: { duration: 2, next: 'inhale', instruction: 'Rest' },
  } as const;

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
        setTotalTime(prev => prev + 1);
      }, 1000);
    } else if (isActive && timeRemaining === 0) {
      // Move to next phase
      const currentPhase = phases[phase];
      const nextPhase = currentPhase.next as keyof typeof phases;
      
      setPhase(nextPhase);
      setTimeRemaining(phases[nextPhase].duration);
      
      if (nextPhase === 'inhale') {
        setCycle(prev => prev + 1);
      }
    }

    return () => clearInterval(interval);
  }, [isActive, timeRemaining, phase]);

  const handleStart = () => {
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase('inhale');
    setTimeRemaining(4);
    setCycle(0);
    setTotalTime(0);
  };

  const getCircleSize = () => {
    switch (phase) {
      case 'inhale':
        return 'scale-125';
      case 'hold':
        return 'scale-125';
      case 'exhale':
        return 'scale-75';
      case 'pause':
        return 'scale-75';
      default:
        return 'scale-100';
    }
  };

  const getCircleColor = () => {
    switch (phase) {
      case 'inhale':
        return 'bg-primary/80';
      case 'hold':
        return 'bg-accent/80';
      case 'exhale':
        return 'bg-muted/80';
      case 'pause':
        return 'bg-secondary/80';
      default:
        return 'bg-primary/80';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-semibold text-foreground">
            Breathing Exercise
          </CardTitle>
          <p className="text-muted-foreground">
            Follow the circle and breathe mindfully
          </p>
        </CardHeader>
        <CardContent className="text-center">
          {/* Breathing Circle */}
          <div className="relative flex items-center justify-center mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className={`w-32 h-32 rounded-full transition-all duration-1000 ease-in-out ${getCircleSize()} ${getCircleColor()}`}
                style={{ 
                  animation: isActive ? 'breathe-glow 4s ease-in-out infinite' : 'none',
                }}
              />
            </div>
            <div className="relative z-10 text-center">
              <div className="text-white font-semibold text-lg">
                {phases[phase].instruction}
              </div>
              <div className="text-white/80 text-3xl font-bold mt-2">
                {timeRemaining}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-6 space-y-2">
            <p className="text-lg font-medium text-foreground">
              {phases[phase].instruction}
            </p>
            <p className="text-sm text-muted-foreground">
              {isActive ? `${timeRemaining}s remaining` : 'Ready to begin'}
            </p>
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-4 mb-6">
            {!isActive ? (
              <Button 
                onClick={handleStart}
                size="lg"
                className="px-8 py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Play className="w-5 h-5 mr-2" />
                Start
              </Button>
            ) : (
              <Button 
                onClick={handlePause}
                variant="secondary"
                size="lg"
                className="px-8 py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Pause className="w-5 h-5 mr-2" />
                Pause
              </Button>
            )}
            <Button 
              onClick={handleReset}
              variant="outline"
              size="lg"
              className="px-8 py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Reset
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <div className="bg-muted/40 rounded-xl p-3">
              <div className="text-2xl font-bold text-primary">{cycle}</div>
              <div className="text-sm text-muted-foreground">Cycles</div>
            </div>
            <div className="bg-muted/40 rounded-xl p-3">
              <div className="text-2xl font-bold text-primary">{formatTime(totalTime)}</div>
              <div className="text-sm text-muted-foreground">Time</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">How it works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span><strong>Inhale</strong> for 4 seconds as the circle grows</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-accent rounded-full"></div>
              <span><strong>Hold</strong> for 4 seconds at full size</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-muted rounded-full"></div>
              <span><strong>Exhale</strong> for 4 seconds as it shrinks</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-secondary rounded-full"></div>
              <span><strong>Pause</strong> for 2 seconds before repeating</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}