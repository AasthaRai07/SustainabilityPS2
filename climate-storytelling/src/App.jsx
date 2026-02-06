import { useState, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './services/queryConfig';
import StoryEngine from './services/storyEngine';
import LocationSelector from './components/ui/LocationSelector';
import TimeframeSelector from './components/ui/TimeframeSelector';
import TopicSelector from './components/ui/TopicSelector';
import StoryDisplay from './components/story/StoryDisplay';
import ThreeDScene from './components/3d/ThreeDScene';

function App() {
  const [userData, setUserData] = useState({
    location: '',
    timeframe: '2030',
    topic: 'general',
    personalContext: ''
  });
  
  const [story, setStory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generate story when user data is complete
  useEffect(() => {
    if (userData.location && userData.timeframe) {
      generateStory();
    }
  }, [userData.location, userData.timeframe, userData.topic]);

  const generateStory = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const generatedStory = await StoryEngine.generateStory(userData);
      setStory(generatedStory);
    } catch (err) {
      setError(err.message);
      console.error('Error generating story:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationChange = (location) => {
    setUserData(prev => ({ ...prev, location }));
  };

  const handleTimeframeChange = (timeframe) => {
    setUserData(prev => ({ ...prev, timeframe }));
  };

  const handleTopicChange = (topic) => {
    setUserData(prev => ({ ...prev, topic }));
  };

  const handlePersonalContextChange = (context) => {
    setUserData(prev => ({ ...prev, personalContext: context }));
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
        {/* 3D Background Scene */}
        <ThreeDScene storyData={story} userData={userData} />
        
        {/* Main Content */}
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Header */}
          <header className="p-6 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Data to Empathy Bridge
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Transforming climate data into personal, meaningful stories
            </p>
          </header>

          {/* Input Section */}
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="climate-card w-full max-w-4xl">
              {!story ? (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-6 text-center">Create Your Climate Story</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <LocationSelector 
                        value={userData.location} 
                        onChange={handleLocationChange} 
                      />
                      <TimeframeSelector 
                        value={userData.timeframe} 
                        onChange={handleTimeframeChange} 
                      />
                      <TopicSelector 
                        value={userData.topic} 
                        onChange={handleTopicChange} 
                      />
                    </div>
                    
                    <div className="mb-8">
                      <label className="block text-sm font-medium mb-2">
                        Personal Context (Optional)
                      </label>
                      <textarea 
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-climate-primary focus:border-transparent"
                        placeholder="What matters most to you about climate change? (e.g., protecting your garden, concern for children's future, etc.)"
                        value={userData.personalContext}
                        onChange={(e) => handlePersonalContextChange(e.target.value)}
                        rows={3}
                      />
                    </div>
                    
                    {isLoading && (
                      <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-climate-primary"></div>
                        <p className="mt-4 text-gray-300">Crafting your personalized climate story...</p>
                      </div>
                    )}
                    
                    {error && (
                      <div className="bg-red-900 bg-opacity-50 border border-red-700 rounded-lg p-4 text-center">
                        <p className="text-red-200">{error}</p>
                        <button 
                          onClick={generateStory}
                          className="mt-2 climate-btn bg-red-600 hover:bg-red-700"
                        >
                          Try Again
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <StoryDisplay 
                  story={story} 
                  onReset={() => setStory(null)}
                  userData={userData}
                />
              )}
            </div>
          </div>

          {/* Footer */}
          <footer className="p-6 text-center text-gray-400 text-sm">
            <p>Bridging the gap between climate data and human empathy</p>
          </footer>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
