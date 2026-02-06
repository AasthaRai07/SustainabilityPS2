// NASA Earth Observations API Service
// Using our backend API for climate data
class NasaApiService {
  constructor() {
    this.baseUrl = 'http://localhost:3001/api';
    this.mockData = this.generateMockData();
  }

  // Generate realistic mock climate data for development
  generateMockData() {
    return {
      temperature: {
        current: 15.2,
        projected_2030: 17.8,
        projected_2050: 20.1,
        trend: 'rising'
      },
      precipitation: {
        current: 850,
        projected_2030: 780,
        projected_2050: 720,
        trend: 'decreasing'
      },
      seaLevel: {
        current: 0,
        projected_2030: 12,
        projected_2050: 25,
        trend: 'rising'
      },
      co2: {
        current: 421,
        projected_2030: 485,
        projected_2050: 550,
        trend: 'rising'
      }
    };
  }

  // Initialize Earthdata API authentication (for production use)
  async initializeAuth() {
    // In production, you would implement NASA Earthdata authentication
    // This requires registration at https://urs.earthdata.nasa.gov/
    console.log('NASA API Auth initialized (mock mode)');
    return true;
  }

  // Fetch climate data for a specific location
  async fetchClimateData(location, timeframe = '2030') {
    try {
      const response = await fetch(`${this.baseUrl}/climate/data/${location}?timeframe=${timeframe}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch climate data');
      }
      
      return result.data;
    } catch (error) {
      console.error('Error fetching climate data from backend:', error);
      // Fallback to mock data
      const data = this.getMockDataForLocation(location);
      return this.formatClimateData(data, timeframe);
    }
  }

  // Get mock data customized for location
  getMockDataForLocation(location) {
    const baseData = { ...this.mockData };
    
    // Apply location-based modifiers (simulating real regional variations)
    const locationModifiers = {
      'new york': { 
        temperature: 1.2, 
        precipitation: -50, 
        seaLevel: 15 
      },
      'mumbai': { 
        temperature: 0.8, 
        precipitation: 100, 
        seaLevel: 8 
      },
      'london': { 
        temperature: 0.5, 
        precipitation: 20, 
        seaLevel: 12 
      },
      'sydney': { 
        temperature: 1.0, 
        precipitation: -30, 
        seaLevel: 18 
      },
      'default': { 
        temperature: 0, 
        precipitation: 0, 
        seaLevel: 0 
      }
    };

    const modifiers = locationModifiers[location.toLowerCase()] || locationModifiers.default;
    
    baseData.temperature.current += modifiers.temperature;
    baseData.temperature.projected_2030 += modifiers.temperature * 1.1;
    baseData.temperature.projected_2050 += modifiers.temperature * 1.2;
    
    baseData.precipitation.current += modifiers.precipitation;
    baseData.precipitation.projected_2030 += modifiers.precipitation * 0.9;
    baseData.precipitation.projected_2050 += modifiers.precipitation * 0.8;
    
    baseData.seaLevel.projected_2030 += modifiers.seaLevel;
    baseData.seaLevel.projected_2050 += modifiers.seaLevel * 2;
    
    return baseData;
  }

  // Format data for consumption by other services
  formatClimateData(data, timeframe) {
    const year = timeframe || '2030';
    
    return {
      temperatureChange: {
        value: data.temperature[`projected_${year}`] - data.temperature.current,
        unit: '°C',
        description: `Temperature change by ${year}`
      },
      precipitationChange: {
        value: data.precipitation[`projected_${year}`] - data.precipitation.current,
        unit: 'mm/year',
        description: `Annual precipitation change by ${year}`
      },
      seaLevelRise: {
        value: data.seaLevel[`projected_${year}`],
        unit: 'mm',
        description: `Sea level rise by ${year}`
      },
      co2Concentration: {
        value: data.co2[`projected_${year}`],
        unit: 'ppm',
        description: `CO2 concentration by ${year}`
      },
      summary: this.generateDataSummary(data, year)
    };
  }

  // Generate human-readable summary of the data
  generateDataSummary(data, year) {
    return `By ${year}, this region will experience a ${Math.abs(data.temperature[`projected_${year}`] - data.temperature.current).toFixed(1)}°C ${data.temperature.trend} in average temperatures, with ${Math.abs(data.precipitation[`projected_${year}`] - data.precipitation.current).toFixed(0)}mm ${data.precipitation.trend} in annual precipitation.`;
  }

  // Search for specific climate datasets
  async searchDatasets(query, limit = 10) {
    try {
      const response = await fetch(`${this.baseUrl}/climate/datasets/search?query=${query}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to search datasets');
      }
      
      return result.data;
    } catch (error) {
      console.error('Error searching datasets:', error);
      // Return mock data as fallback
      return [
        {
          id: 'MERRA2_T2M',
          title: 'MERRA-2 Temperature 2M',
          description: '2-meter temperature data from MERRA-2 reanalysis',
          url: 'https://giovanni.gsfc.nasa.gov/giovanni/'
        },
        {
          id: 'GRACE_LWE',
          title: 'GRACE Land Water Storage',
          description: 'Land water equivalent anomalies from GRACE satellites',
          url: 'https://gravity.colorado.edu/'
        },
        {
          id: 'MODIS_VI',
          title: 'MODIS Vegetation Indices',
          description: 'Vegetation health monitoring from MODIS',
          url: 'https://lpdaac.usgs.gov/products/modis-products-table/'
        }
      ];
    }
  }

  // Fetch extreme weather statistics for a location
  async getExtremeWeatherData(location, year) {
    const data = this.getMockDataForLocation(location);
    return {
      extremeHeatDays: {
        current: 12,
        projected: Math.max(12, 12 + (data.temperature.projected_2030 - data.temperature.current) * 2),
        unit: 'days/year'
      },
      extremePrecipitationEvents: {
        current: 8,
        projected: Math.max(8, 8 + Math.abs(data.precipitation.projected_2030 - data.precipitation.current) / 50),
        unit: 'events/year'
      },
      droughtSeverity: {
        current: 3.2,
        projected: Math.max(3.2, 3.2 + (data.temperature.projected_2030 - data.temperature.current) * 0.5),
        unit: 'on Palmer Drought Severity Index'
      }
    };
  }
}

export default new NasaApiService();