import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, Clock, Heart, Coffee, Moon, Sun } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReminderSettings {
  enabled: boolean;
  morningCheck: boolean;
  afternoonBreak: boolean;
  eveningReflection: boolean;
  breathingReminder: boolean;
  waterReminder: boolean;
  stretchReminder: boolean;
}

const defaultSettings: ReminderSettings = {
  enabled: false,
  morningCheck: true,
  afternoonBreak: true,
  eveningReflection: true,
  breathingReminder: true,
  waterReminder: true,
  stretchReminder: true,
};

const reminderTypes = [
  {
    key: 'morningCheck' as keyof ReminderSettings,
    title: 'Morning Check-in',
    description: 'Start your day with mindful awareness',
    icon: Sun,
    time: '9:00 AM',
    message: 'Good morning! How are you feeling today? Take a moment to check in with yourself. 🌅'
  },
  {
    key: 'afternoonBreak' as keyof ReminderSettings,
    title: 'Afternoon Mindful Break',
    description: 'Pause and breathe during your busy day',
    icon: Coffee,
    time: '2:00 PM',
    message: 'Time for a mindful break! Take 3 deep breaths and reset your energy. ☕'
  },
  {
    key: 'eveningReflection' as keyof ReminderSettings,
    title: 'Evening Reflection',
    description: 'Reflect on your day and practice gratitude',
    icon: Moon,
    time: '8:00 PM',
    message: 'How was your day? Take a moment to journal your thoughts and gratitude. 🌙'
  },
  {
    key: 'breathingReminder' as keyof ReminderSettings,
    title: 'Breathing Exercise',
    description: 'Regular breathing practice reminders',
    icon: Heart,
    time: 'Every 3 hours',
    message: 'Time to breathe mindfully! A quick breathing exercise can restore your calm. 🫁'
  },
  {
    key: 'waterReminder' as keyof ReminderSettings,
    title: 'Hydration Reminder',
    description: 'Stay hydrated for better wellbeing',
    icon: Clock,
    time: 'Every 2 hours',
    message: 'Remember to drink water! Staying hydrated helps your mind and body feel better. 💧'
  },
  {
    key: 'stretchReminder' as keyof ReminderSettings,
    title: 'Movement Break',
    description: 'Gentle reminders to move your body',
    icon: Bell,
    time: 'Every 90 minutes',
    message: 'Time to move! Stand up, stretch, or take a short walk. Your body will thank you. 🚶‍♀️'
  }
];

export function WellnessReminders() {
  const [settings, setSettings] = useState<ReminderSettings>(defaultSettings);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load saved settings
    const saved = localStorage.getItem('reminderSettings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }

    // Check notification permission
    if ('Notification' in window) {
      setPermissionGranted(Notification.permission === 'granted');
    }
  }, []);

  useEffect(() => {
    // Save settings when they change
    localStorage.setItem('reminderSettings', JSON.stringify(settings));
  }, [settings]);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Notifications not supported",
        description: "Your browser doesn't support notifications.",
        variant: "destructive"
      });
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      toast({
        title: "Notifications blocked",
        description: "Please enable notifications in your browser settings.",
        variant: "destructive"
      });
      return false;
    }

    const permission = await Notification.requestPermission();
    const granted = permission === 'granted';
    setPermissionGranted(granted);

    if (granted) {
      toast({
        title: "Notifications enabled! 🔔",
        description: "You'll receive gentle wellness reminders.",
      });
    } else {
      toast({
        title: "Notifications disabled",
        description: "You can enable them later in settings.",
      });
    }

    return granted;
  };

  const toggleReminders = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        return;
      }
      
      // Schedule sample notification to confirm it works
      setTimeout(() => {
        if (Notification.permission === 'granted') {
          new Notification('Mindful Moments', {
            body: 'Wellness reminders are now active! We\'ll help you stay mindful throughout the day. 🧘‍♀️',
            icon: '/favicon.ico',
            badge: '/favicon.ico',
          });
        }
      }, 2000);
    }

    setSettings(prev => ({ ...prev, enabled }));
    
    toast({
      title: enabled ? "Reminders activated! 🌟" : "Reminders paused",
      description: enabled 
        ? "You'll receive gentle wellness reminders throughout the day."
        : "Wellness reminders have been turned off.",
    });
  };

  const toggleSpecificReminder = (key: keyof ReminderSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const sendTestNotification = (reminderType: typeof reminderTypes[0]) => {
    if (!permissionGranted || !settings.enabled) {
      toast({
        title: "Enable reminders first",
        description: "Turn on notifications to test reminders.",
      });
      return;
    }

    new Notification('Mindful Moments', {
      body: reminderType.message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
    });

    toast({
      title: "Test notification sent! 📨",
      description: "Check if you received the notification.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Main Toggle */}
      <Card className="glass-card border-0 hover-lift">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-display flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Wellness Reminders
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Gentle notifications to support your wellbeing journey
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
            <div>
              <Label htmlFor="reminders-enabled" className="text-base font-medium">
                Enable Reminders
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive gentle wellness notifications throughout the day
              </p>
            </div>
            <Switch
              id="reminders-enabled"
              checked={settings.enabled}
              onCheckedChange={toggleReminders}
              className="ml-4"
            />
          </div>

          {!permissionGranted && settings.enabled && (
            <div className="mt-4 p-4 bg-warning/10 border border-warning/20 rounded-xl">
              <p className="text-sm text-warning-foreground">
                <strong>Browser notifications required:</strong> Please allow notifications when prompted to receive wellness reminders.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Individual Reminder Settings */}
      {settings.enabled && (
        <Card className="glass-card border-0 hover-lift">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-display">Reminder Types</CardTitle>
            <p className="text-sm text-muted-foreground">
              Customize which reminders you'd like to receive
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reminderTypes.map((reminder, index) => {
                const Icon = reminder.icon;
                const isEnabled = settings[reminder.key];
                
                return (
                  <div 
                    key={reminder.key}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 animate-fade-in-scale ${
                      isEnabled 
                        ? 'bg-primary/5 border-primary/20' 
                        : 'bg-muted/20 border-muted/40'
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${
                        isEnabled ? 'bg-primary/20 text-primary' : 'bg-muted/40 text-muted-foreground'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-foreground">{reminder.title}</h4>
                          <span className="text-xs text-muted-foreground bg-muted/60 px-2 py-1 rounded-full">
                            {reminder.time}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {reminder.description}
                        </p>
                        {isEnabled && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => sendTestNotification(reminder)}
                            className="text-xs h-7 px-3"
                          >
                            Test Notification
                          </Button>
                        )}
                      </div>
                    </div>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={() => toggleSpecificReminder(reminder.key)}
                      disabled={!settings.enabled}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Tips */}
      <Card className="glass-card border-0 hover-lift">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-display">💡 Tips for Better Wellness</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <p><strong>Start small:</strong> Begin with just morning and evening reminders, then add more as you build the habit.</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <p><strong>Customize timing:</strong> Adjust reminder frequency based on your schedule and preferences.</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <p><strong>Be patient:</strong> Building mindful habits takes time. Gentle, consistent reminders help create lasting change.</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <p><strong>Listen to your body:</strong> If reminders feel overwhelming, reduce the frequency or take a break.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}