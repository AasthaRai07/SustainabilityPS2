// Topic Selector Component
const TopicSelector = ({ value, onChange }) => {
  const topics = [
    { 
      value: 'general', 
      label: 'General Environment', 
      icon: '🌍',
      description: 'Overall climate impacts'
    },
    { 
      value: 'hometown', 
      label: 'My Hometown', 
      icon: '🏘️',
      description: 'Local community changes'
    },
    { 
      value: 'coffee', 
      label: 'Coffee & Agriculture', 
      icon: '☕',
      description: 'Food security impacts'
    },
    { 
      value: 'birds', 
      label: 'Local Wildlife', 
      icon: '🐦',
      description: 'Biodiversity changes'
    },
    { 
      value: 'water', 
      label: 'Water Resources', 
      icon: '💧',
      description: 'Water scarcity & flooding'
    },
    { 
      value: 'energy', 
      label: 'Energy & Lifestyle', 
      icon: '⚡',
      description: 'Daily life adaptations'
    }
  ];

  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        Story Focus
      </label>
      <div className="grid grid-cols-1 gap-2">
        {topics.map((topic) => (
          <label 
            key={topic.value}
            className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
              value === topic.value 
                ? 'border-climate-primary bg-gray-700 bg-opacity-50' 
                : 'border-gray-600 bg-gray-800 hover:border-gray-500 hover:bg-gray-750'
            }`}
          >
            <input
              type="radio"
              name="topic"
              value={topic.value}
              checked={value === topic.value}
              onChange={(e) => onChange(e.target.value)}
              className="sr-only"
            />
            <span className="text-xl mr-3">{topic.icon}</span>
            <div>
              <span className="block text-sm font-medium">{topic.label}</span>
              <span className="block text-xs text-gray-400">{topic.description}</span>
            </div>
          </label>
        ))}
      </div>
      
      <div className="mt-3 p-3 bg-blue-900 bg-opacity-30 rounded-lg border border-blue-700">
        <p className="text-xs text-blue-300">
          <span className="text-blue-400">💡</span> Different topics highlight various aspects of climate impact
        </p>
      </div>
    </div>
  );
};

export default TopicSelector;