// Location Selector Component
import { useState } from 'react';

const LocationSelector = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  
  const mumbaiLocations = [
    'Mumbai', 'Navi Mumbai', 'Thane', 'Bandra',
    'Andheri', 'Dadar', 'Colaba', 'Marine Lines',
    'Churchgate', 'Borivali', 'Kandivali', 'Malad',
    'Goregaon', 'Jogeshwari', 'Vile Parle', 'Santacruz',
    'Powai', 'Bandra Kurla Complex', 'Lower Parel', 'Worli',
    'Prabhadevi', 'Mahim', 'Sion', 'Chembur',
    'Govandi', 'Mankhurd', 'Vashi', 'Panvel'
  ];

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (newValue.length > 2) {
      onChange(newValue);
    }
  };

  const handleLocationSelect = (location) => {
    setInputValue(location);
    onChange(location);
    setIsOpen(false);
  };

  const handleBlur = () => {
    // Delay closing to allow click events on dropdown items
    setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium mb-2">
        Your Location
      </label>
      <div className="relative">
        <input
          type="text"
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-climate-primary focus:border-transparent pr-10"
          placeholder="Enter city or region"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onBlur={handleBlur}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {isOpen && (
        <div className="absolute z-20 mt-1 w-full bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
          <div className="p-2">
            <p className="text-xs text-gray-400 mb-2">Mumbai Region:</p>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {mumbaiLocations.map((location) => (
                <button
                  key={location}
                  className={`p-2 text-left rounded hover:bg-gray-700 transition-colors ${
                    value === location ? 'bg-gray-700 text-climate-primary' : 'text-gray-300'
                  }`}
                  onClick={() => handleLocationSelect(location)}
                >
                  {location}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;