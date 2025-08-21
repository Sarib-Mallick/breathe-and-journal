import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Heart, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Quote {
  text: string;
  author: string;
  category: string;
}

const inspirationalQuotes: Quote[] = [
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    category: "motivation"
  },
  {
    text: "Mindfulness is a way of befriending ourselves and our experience.",
    author: "Jon Kabat-Zinn",
    category: "mindfulness"
  },
  {
    text: "You are enough just as you are.",
    author: "Meghan Markle",
    category: "self-love"
  },
  {
    text: "The present moment is the only time over which we have dominion.",
    author: "Thích Nhất Hạnh",
    category: "mindfulness"
  },
  {
    text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
    author: "Ralph Waldo Emerson",
    category: "inner-strength"
  },
  {
    text: "Your limitation—it's only your imagination.",
    author: "Unknown",
    category: "motivation"
  },
  {
    text: "Breathing in, I calm my body. Breathing out, I smile.",
    author: "Thích Nhất Hạnh",
    category: "breathing"
  },
  {
    text: "You have been assigned this mountain to show others it can be moved.",
    author: "Mel Robbins",
    category: "resilience"
  },
  {
    text: "Be yourself; everyone else is already taken.",
    author: "Oscar Wilde",
    category: "authenticity"
  },
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
    category: "action"
  },
  {
    text: "Peace comes from within. Do not seek it without.",
    author: "Buddha",
    category: "inner-peace"
  },
  {
    text: "Your mind is a garden, your thoughts are the seeds. You can grow flowers or you can grow weeds.",
    author: "Unknown",
    category: "mindset"
  },
  {
    text: "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Chinese Proverb",
    category: "action"
  },
  {
    text: "You are never too old to set another goal or to dream a new dream.",
    author: "C.S. Lewis",
    category: "dreams"
  },
  {
    text: "Wherever you are, be there totally.",
    author: "Eckhart Tolle",
    category: "presence"
  }
];

export function DailyQuotes() {
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [favoriteQuotes, setFavoriteQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load saved favorites
    const saved = localStorage.getItem('favoriteQuotes');
    if (saved) {
      setFavoriteQuotes(JSON.parse(saved));
    }

    // Load today's quote or generate new one
    loadTodaysQuote();
  }, []);

  const loadTodaysQuote = () => {
    const today = new Date().toDateString();
    const savedQuote = localStorage.getItem(`dailyQuote_${today}`);
    
    if (savedQuote) {
      setCurrentQuote(JSON.parse(savedQuote));
    } else {
      generateNewQuote();
    }
  };

  const generateNewQuote = () => {
    setIsLoading(true);
    
    // Simulate loading for better UX
    setTimeout(() => {
      const randomQuote = inspirationalQuotes[
        Math.floor(Math.random() * inspirationalQuotes.length)
      ];
      
      setCurrentQuote(randomQuote);
      
      // Save as today's quote
      const today = new Date().toDateString();
      localStorage.setItem(`dailyQuote_${today}`, JSON.stringify(randomQuote));
      
      setIsLoading(false);
      
      toast({
        title: "New inspiration! ✨",
        description: "A fresh quote to brighten your day.",
      });
    }, 500);
  };

  const toggleFavorite = (quote: Quote) => {
    const isFavorite = favoriteQuotes.some(fav => fav.text === quote.text);
    let updatedFavorites;
    
    if (isFavorite) {
      updatedFavorites = favoriteQuotes.filter(fav => fav.text !== quote.text);
      toast({
        title: "Removed from favorites",
        description: "Quote removed from your collection.",
      });
    } else {
      updatedFavorites = [quote, ...favoriteQuotes].slice(0, 10); // Keep max 10 favorites
      toast({
        title: "Added to favorites! ❤️",
        description: "Quote saved to your collection.",
      });
    }
    
    setFavoriteQuotes(updatedFavorites);
    localStorage.setItem('favoriteQuotes', JSON.stringify(updatedFavorites));
  };

  const shareQuote = async (quote: Quote) => {
    const text = `"${quote.text}" - ${quote.author}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mindful Moments - Daily Quote',
          text: text,
        });
      } catch (err) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(text);
        toast({
          title: "Copied to clipboard! 📋",
          description: "Quote copied and ready to share.",
        });
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard! 📋",
        description: "Quote copied and ready to share.",
      });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      motivation: 'bg-primary/20 text-primary',
      mindfulness: 'bg-accent/20 text-accent-foreground',
      'self-love': 'bg-pink-100 text-pink-700',
      'inner-strength': 'bg-purple-100 text-purple-700',
      breathing: 'bg-green-100 text-green-700',
      resilience: 'bg-orange-100 text-orange-700',
      authenticity: 'bg-blue-100 text-blue-700',
      action: 'bg-red-100 text-red-700',
      'inner-peace': 'bg-indigo-100 text-indigo-700',
      mindset: 'bg-yellow-100 text-yellow-700',
      dreams: 'bg-cyan-100 text-cyan-700',
      presence: 'bg-teal-100 text-teal-700',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const isFavorite = currentQuote ? favoriteQuotes.some(fav => fav.text === currentQuote.text) : false;

  return (
    <div className="space-y-6">
      {/* Daily Quote */}
      <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-semibold text-foreground">
            Daily Inspiration
          </CardTitle>
          <p className="text-muted-foreground">
            A thoughtful quote to guide your day
          </p>
        </CardHeader>
        <CardContent>
          {currentQuote && (
            <div className="text-center space-y-6 animate-fade-in">
              <div className="relative">
                <div className="absolute top-0 left-0 text-6xl text-primary/20 font-serif">"</div>
                <p className="text-lg md:text-xl leading-relaxed text-foreground px-8 py-4">
                  {currentQuote.text}
                </p>
                <div className="absolute bottom-0 right-0 text-6xl text-primary/20 font-serif rotate-180">"</div>
              </div>
              
              <div className="space-y-3">
                <p className="text-muted-foreground font-medium">
                  — {currentQuote.author}
                </p>
                
                <div className="flex justify-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(currentQuote.category)}`}>
                    {currentQuote.category.replace('-', ' ')}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-center space-x-3 pt-4">
                <Button
                  onClick={() => toggleFavorite(currentQuote)}
                  variant={isFavorite ? "default" : "outline"}
                  size="sm"
                  className="rounded-xl transition-all duration-200 hover:scale-105"
                >
                  <Heart className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                  {isFavorite ? 'Favorited' : 'Favorite'}
                </Button>
                
                <Button
                  onClick={() => shareQuote(currentQuote)}
                  variant="outline"
                  size="sm"
                  className="rounded-xl transition-all duration-200 hover:scale-105"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                
                <Button
                  onClick={generateNewQuote}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                  className="rounded-xl transition-all duration-200 hover:scale-105"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? 'Loading...' : 'New Quote'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Favorite Quotes */}
      {favoriteQuotes.length > 0 && (
        <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center">
              <Heart className="w-5 h-5 mr-2 fill-current text-red-500" />
              Your Favorite Quotes ({favoriteQuotes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {favoriteQuotes.map((quote, index) => (
                <div
                  key={index}
                  className="p-4 bg-muted/20 rounded-xl border border-muted/40 hover:bg-muted/30 transition-colors"
                >
                  <p className="text-sm text-foreground leading-relaxed mb-2">
                    "{quote.text}"
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      — {quote.author}
                    </p>
                    <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(quote.category)}`}>
                      {quote.category.replace('-', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}