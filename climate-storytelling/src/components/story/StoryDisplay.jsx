// Story Display Component - Shows the generated climate story
import { useState } from 'react';
import { motion } from 'framer-motion';

const StoryDisplay = ({ story, onReset, userData }) => {
  const [currentSection, setCurrentSection] = useState(0);
  
  if (!story) return null;

  const sections = [
    {
      title: "Your Climate Future",
      content: story.narrative.aiGenerated,
      icon: "📖"
    },
    {
      title: "Key Changes",
      content: story.climateData.narrative.climateChanges.join('\n\n'),
      icon: "📊"
    },
    {
      title: "Personal Impact",
      content: story.climateData.narrative.personalImpact.join('\n\n'),
      icon: "👤"
    },
    {
      title: "Call to Action",
      content: story.climateData.narrative.callToAction,
      icon: "🌱"
    }
  ];

  const nextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const shareStory = () => {
    if (navigator.share) {
      navigator.share({
        title: story.shareable.title,
        text: story.shareable.description,
        url: story.shareable.url
      });
    } else {
      // Fallback to copy to clipboard
      navigator.clipboard.writeText(`${story.shareable.title}\n\n${story.shareable.description}\n\n${story.shareable.url}`);
      alert('Story copied to clipboard!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">
          <span className="mr-2">{sections[currentSection].icon}</span>
          {sections[currentSection].title}
        </h2>
        <p className="text-gray-400">
          {userData.location} • {userData.timeframe} • {userData.topic}
        </p>
      </div>

      {/* Story Content */}
      <motion.div
        key={currentSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="climate-card flex flex-col items-center text-center"
      >
        <div className="prose prose-invert max-w-2xl mx-auto text-center">
          <p className="text-lg leading-relaxed whitespace-pre-line">
            {currentSection === 0 ? story.content : sections[currentSection].content}
          </p>
        </div>
      </motion.div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={prevSection}
          disabled={currentSection === 0}
          className={`climate-btn ${currentSection === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'}`}
        >
          ← Previous
        </button>
        
        <div className="flex space-x-2">
          {sections.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSection(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSection 
                  ? 'bg-climate-primary scale-125' 
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
              aria-label={`Go to section ${index + 1}`}
            />
          ))}
        </div>
        
        {currentSection < sections.length - 1 ? (
          <button
            onClick={nextSection}
            className="climate-btn hover:bg-green-700"
          >
            Next →
          </button>
        ) : (
          <div className="flex space-x-3">
            <button
              onClick={shareStory}
              className="climate-btn bg-blue-600 hover:bg-blue-700"
            >
              Share Story
            </button>
            <button
              onClick={onReset}
              className="climate-btn bg-gray-600 hover:bg-gray-700"
            >
              Create New Story
            </button>
          </div>
        )}
      </div>

      {/* Climate Data Summary */}
      {currentSection === 0 && story.climateData && (
        <div className="climate-card">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <span className="mr-2">🌡️</span>
            Climate Data Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DataCard 
              title="Temperature Change" 
              value={`${Math.abs(story.climateData.metrics.temperature?.change || 0).toFixed(1)}°C`}
              description={`${story.climateData.metrics.temperature?.current} → ${story.climateData.metrics.temperature?.projected}`}
              severity={getSeverity(story.climateData.metrics.temperature?.change)}
            />
            <DataCard 
              title="Precipitation Change" 
              value={`${Math.abs(story.climateData.metrics.precipitation?.change || 0).toFixed(0)}mm/year`}
              description={`${story.climateData.metrics.precipitation?.current} → ${story.climateData.metrics.precipitation?.projected}`}
              severity={getSeverity(story.climateData.metrics.precipitation?.change)}
            />
            <DataCard 
              title="Sea Level Rise" 
              value={`${story.climateData.metrics.seaLevel?.change || 0}mm`}
              description={`${story.climateData.metrics.seaLevel?.current} → ${story.climateData.metrics.seaLevel?.projected}`}
              severity={getSeverity(story.climateData.metrics.seaLevel?.change)}
            />
            <DataCard 
              title="CO2 Concentration" 
              value={`${story.climateData.metrics.co2?.projected || 421}ppm`}
              description={`Change: ${(story.climateData.metrics.co2?.change || 0).toFixed(0)}ppm`}
              severity={getSeverity(story.climateData.metrics.co2?.change)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Data Card Component
const DataCard = ({ title, value, description, severity }) => {
  const severityColors = {
    low: 'text-green-400',
    medium: 'text-yellow-400',
    high: 'text-orange-400',
    extreme: 'text-red-400'
  };

  return (
    <div className="p-4 bg-gray-700 bg-opacity-50 rounded-lg border border-gray-600">
      <h4 className="font-semibold text-gray-300 mb-2">{title}</h4>
      <div className={`text-2xl font-bold mb-1 ${severityColors[severity] || 'text-white'}`}>
        {value}
      </div>
      <p className="text-sm text-gray-400">{description}</p>
      {severity && (
        <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
          severity === 'low' ? 'bg-green-900 text-green-300' :
          severity === 'medium' ? 'bg-yellow-900 text-yellow-300' :
          severity === 'high' ? 'bg-orange-900 text-orange-300' :
          'bg-red-900 text-red-300'
        }`}>
          {severity.toUpperCase()} Impact
        </span>
      )}
    </div>
  );
};

// Helper function to determine severity level
const getSeverity = (value) => {
  if (value === undefined || value === null) return 'low';
  
  const absValue = Math.abs(value);
  if (absValue < 1) return 'low';
  if (absValue < 2) return 'medium';
  if (absValue < 3) return 'high';
  return 'extreme';
};

export default StoryDisplay;