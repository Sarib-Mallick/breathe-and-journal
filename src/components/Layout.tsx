import { useState } from 'react';
import { Heart, BookOpen, Smile, Quote, TrendingUp, Bell, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Layout({ children, currentView, onViewChange }: LayoutProps) {
  const navItems = [
    { id: 'mood', label: 'Mood', icon: Smile },
    { id: 'breathe', label: 'Breathe', icon: Wind },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'quotes', label: 'Quotes', icon: Quote },
    { id: 'insights', label: 'Progress', icon: TrendingUp },
    { id: 'reminders', label: 'Reminders', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/95 backdrop-blur-xl border-b border-border/40 sticky top-0 z-50 shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-medium animate-float">
                <span className="text-primary-foreground text-xl">🧘‍♀️</span>
              </div>
              <div>
                <h1 className="text-xl font-display font-semibold text-foreground">Mindful Moments</h1>
                <p className="text-xs text-muted-foreground">Your wellness companion</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.slice(0, 4).map((item, index) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onViewChange(item.id)}
                    className={`flex items-center space-x-2 rounded-xl transition-all duration-200 hover-lift animate-fade-in-scale ${
                      isActive ? 'bg-gradient-primary shadow-medium' : ''
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                  </Button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 pb-24 md:pb-8">
        <div className="max-w-5xl mx-auto">
          <div className="animate-fade-in">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border/40 shadow-strong">
        <div className="px-2 py-2">
          <div className="flex justify-around max-w-md mx-auto">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewChange(item.id)}
                  className={`flex flex-col items-center space-y-1 p-2 h-auto transition-all duration-200 hover-lift rounded-xl min-w-0 ${
                    isActive 
                      ? 'text-primary bg-gradient-primary/10 shadow-medium' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs font-medium truncate max-w-full">{item.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}