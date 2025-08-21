import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { MoodTracker } from '@/components/MoodTracker';
import { BreathingGuide } from '@/components/BreathingGuide';
import { Journal } from '@/components/Journal';
import { DailyQuotes } from '@/components/DailyQuotes';

const Index = () => {
  const [currentView, setCurrentView] = useState('mood');

  const renderContent = () => {
    switch (currentView) {
      case 'mood':
        return <MoodTracker />;
      case 'breathe':
        return <BreathingGuide />;
      case 'journal':
        return <Journal />;
      case 'quotes':
        return <DailyQuotes />;
      default:
        return <MoodTracker />;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderContent()}
    </Layout>
  );
};

export default Index;
