// Timeframe Selector Component
const TimeframeSelector = ({ value, onChange }) => {
  const timeframes = [
    { 
      value: '2030', 
      label: '2030', 
      description: 'Near future (5+ years)' 
    },
    { 
      value: '2040', 
      label: '2040', 
      description: 'Mid-century view' 
    },
    { 
      value: '2050', 
      label: '2050', 
      description: 'Long-term perspective' 
    }
  ];

  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        Time Horizon
      </label>
      <div className="space-y-2">
        {timeframes.map((timeframe) => (
          <label 
            key={timeframe.value}
            className={`flex items-start p-3 rounded-lg border cursor-pointer transition-all ${
              value === timeframe.value 
                ? 'border-climate-primary bg-gray-700 bg-opacity-50' 
                : 'border-gray-600 bg-gray-800 hover:border-gray-500'
            }`}
          >
            <input
              type="radio"
              name="timeframe"
              value={timeframe.value}
              checked={value === timeframe.value}
              onChange={(e) => onChange(e.target.value)}
              className="mt-1 h-4 w-4 text-climate-primary focus:ring-climate-primary border-gray-600"
            />
            <div className="ml-3">
              <span className="block text-sm font-medium">{timeframe.label}</span>
              <span className="block text-xs text-gray-400">{timeframe.description}</span>
            </div>
          </label>
        ))}
      </div>
      
      <div className="mt-3 p-3 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700">
        <p className="text-xs text-gray-400">
          <span className="text-climate-primary">★</span> Longer timeframes show more dramatic changes
        </p>
      </div>
    </div>
  );
};

export default TimeframeSelector;