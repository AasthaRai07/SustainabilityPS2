const axios = require('axios');
const winston = require('winston');

// Logger
const logger = winston.loggers.get('climate-storytelling-api') || 
  winston.createLogger({
    transports: [new winston.transports.Console()]
  });

// Mock climate data for Mumbai region
const mockClimateData = {
  'Mumbai': {
    temperature: { current: 28.5, projected_2030: 31.2, projected_2040: 33.8, projected_2050: 36.1 },
    precipitation: { current: 2400, projected_2030: 2200, projected_2040: 2000, projected_2050: 1800 },
    seaLevel: { current: 0, projected_2030: 150, projected_2040: 280, projected_2050: 420 },
    co2: { current: 420, projected_2030: 485, projected_2040: 520, projected_2050: 550 }
  },
  'Bandra': {
    temperature: { current: 29.1, projected_2030: 31.8, projected_2040: 34.2, projected_2050: 36.8 },
    precipitation: { current: 2350, projected_2030: 2150, projected_2040: 1950, projected_2050: 1750 },
    seaLevel: { current: 0, projected_2030: 155, projected_2040: 285, projected_2050: 425 },
    co2: { current: 425, projected_2030: 490, projected_2040: 525, projected_2050: 555 }
  },
  'Andheri': {
    temperature: { current: 28.8, projected_2030: 31.5, projected_2040: 34.0, projected_2050: 36.4 },
    precipitation: { current: 2380, projected_2030: 2180, projected_2040: 1980, projected_2050: 1780 },
    seaLevel: { current: 0, projected_2030: 152, projected_2040: 282, projected_2050: 422 },
    co2: { current: 422, projected_2030: 487, projected_2040: 522, projected_2050: 552 }
  }
};

// Additional Mumbai region locations
const mumbaiRegionLocations = [
  'Mumbai', 'Navi Mumbai', 'Thane', 'Bandra',
  'Andheri', 'Dadar', 'Colaba', 'Marine Lines',
  'Churchgate', 'Borivali', 'Kandivali', 'Malad',
  'Goregaon', 'Jogeshwari', 'Vile Parle', 'Santacruz',
  'Powai', 'Bandra Kurla Complex', 'Lower Parel', 'Worli',
  'Prabhadevi', 'Mahim', 'Sion', 'Chembur',
  'Govandi', 'Mankhurd', 'Vashi', 'Panvel'
];

// Get climate data for a specific location
async function getClimateData(location, timeframe = '2030', metrics = 'all') {
  try {
    // Validate location is in Mumbai region
    if (!mumbaiRegionLocations.includes(location)) {
      throw new Error(`Location '${location}' not supported. Please select from Mumbai region locations.`);
    }
    
    // Get base data for the location (use Mumbai data as fallback)
    const baseData = mockClimateData[location] || mockClimateData['Mumbai'];
    
    const climateData = {
      location,
      timeframe,
      metrics: {
        temperature: {
          current: baseData.temperature.current,
          projected: baseData.temperature[`projected_${timeframe}`],
          change: baseData.temperature[`projected_${timeframe}`] - baseData.temperature.current,
          unit: '°C',
          description: `Temperature change by ${timeframe}`
        },
        precipitation: {
          current: baseData.precipitation.current,
          projected: baseData.precipitation[`projected_${timeframe}`],
          change: baseData.precipitation[`projected_${timeframe}`] - baseData.precipitation.current,
          unit: 'mm/year',
          description: `Annual precipitation change by ${timeframe}`
        },
        seaLevel: {
          current: baseData.seaLevel.current,
          projected: baseData.seaLevel[`projected_${timeframe}`],
          change: baseData.seaLevel[`projected_${timeframe}`] - baseData.seaLevel.current,
          unit: 'mm',
          description: `Sea level rise by ${timeframe}`
        },
        co2: {
          current: baseData.co2.current,
          projected: baseData.co2[`projected_${timeframe}`],
          change: baseData.co2[`projected_${timeframe}`] - baseData.co2.current,
          unit: 'ppm',
          description: `CO2 concentration by ${timeframe}`
        }
      },
      summary: generateDataSummary(baseData, timeframe, location)
    };
    
    // Filter metrics if specific ones requested
    if (metrics !== 'all') {
      const requestedMetrics = metrics.split(',');
      const filteredMetrics = {};
      requestedMetrics.forEach(metric => {
        if (climateData.metrics[metric]) {
          filteredMetrics[metric] = climateData.metrics[metric];
        }
      });
      climateData.metrics = filteredMetrics;
    }
    
    logger.info(`Retrieved climate data for ${location} - ${timeframe}`);
    return climateData;
  } catch (error) {
    logger.error('Error fetching climate data:', error);
    throw error;
  }
}

// Get extreme weather statistics
async function getExtremeWeatherData(location, year = '2030') {
  try {
    const baseData = mockClimateData[location] || mockClimateData['Mumbai'];
    
    const extremeData = {
      location,
      year,
      extremeHeatDays: {
        current: 45,
        projected: Math.max(45, 45 + (baseData.temperature[`projected_${year}`] - baseData.temperature.current) * 3),
        unit: 'days/year'
      },
      extremePrecipitationEvents: {
        current: 12,
        projected: Math.max(12, 12 + Math.abs(baseData.precipitation[`projected_${year}`] - baseData.precipitation.current) / 100),
        unit: 'events/year'
      },
      droughtSeverity: {
        current: 2.8,
        projected: Math.max(2.8, 2.8 + (baseData.temperature[`projected_${year}`] - baseData.temperature.current) * 0.4),
        unit: 'on Palmer Drought Severity Index'
      },
      floodRisk: {
        current: 'moderate',
        projected: (baseData.seaLevel[`projected_${year}`] > 200) ? 'high' : 
                  (baseData.seaLevel[`projected_${year}`] > 100) ? 'moderate' : 'low',
        description: 'Flood risk level based on sea level rise and precipitation changes'
      }
    };
    
    logger.info(`Retrieved extreme weather data for ${location} - ${year}`);
    return extremeData;
  } catch (error) {
    logger.error('Error fetching extreme weather data:', error);
    throw error;
  }
}

// Search for climate datasets (mock implementation)
async function searchDatasets(query, limit = 10) {
  try {
    // Mock dataset search results
    const datasets = [
      {
        id: 'MERRA2_MUMBAI_TEMP',
        title: 'MERRA-2 Temperature Data for Mumbai Region',
        description: '2-meter temperature data from MERRA-2 reanalysis for Mumbai metropolitan area',
        url: 'https://disc.gsfc.nasa.gov/datasets/MERRA2_MUMBAI_TEMP/summary',
        provider: 'NASA GES DISC'
      },
      {
        id: 'TRMM_MUMBAI_PRECIP',
        title: 'TRMM Precipitation Data for Mumbai',
        description: 'Tropical Rainfall Measuring Mission precipitation data for Mumbai region',
        url: 'https://disc.gsfc.nasa.gov/datasets/TRMM_MUMBAI_PRECIP/summary',
        provider: 'NASA GES DISC'
      },
      {
        id: 'AVHRR_SST_MUMBAI',
        title: 'AVHRR Sea Surface Temperature - Mumbai Coast',
        description: 'Advanced Very High Resolution Radiometer sea surface temperature data for Mumbai coastal waters',
        url: 'https://coastwatch.noaa.gov/avhrr-mumbai',
        provider: 'NOAA CoastWatch'
      },
      {
        id: 'GRACE_MUMBAI_WATER',
        title: 'GRACE Land Water Storage - Mumbai Basin',
        description: 'Land water equivalent anomalies from GRACE satellites for Mumbai water basin',
        url: 'https://gravity.colorado.edu/grace-mumbai',
        provider: 'NASA GRACE'
      }
    ];
    
    // Filter by query
    const filteredDatasets = datasets.filter(dataset => 
      dataset.title.toLowerCase().includes(query.toLowerCase()) ||
      dataset.description.toLowerCase().includes(query.toLowerCase())
    ).slice(0, limit);
    
    logger.info(`Dataset search for query: ${query}, found ${filteredDatasets.length} results`);
    return filteredDatasets;
  } catch (error) {
    logger.error('Error searching datasets:', error);
    throw error;
  }
}

// Generate data summary
function generateDataSummary(data, timeframe, location) {
  return `${location} will experience a ${Math.abs(data.temperature[`projected_${timeframe}`] - data.temperature.current).toFixed(1)}°C ${data.temperature.current < data.temperature[`projected_${timeframe}`] ? 'increase' : 'decrease'} in average temperatures by ${timeframe}, with ${Math.abs(data.precipitation[`projected_${timeframe}`] - data.precipitation.current).toFixed(0)}mm ${data.precipitation.current > data.precipitation[`projected_${timeframe}`] ? 'less' : 'more'} annual precipitation. Sea levels are projected to rise ${data.seaLevel[`projected_${timeframe}`]}mm, and CO2 concentrations will reach ${data.co2[`projected_${timeframe}`]}ppm.`;
}

module.exports = {
  getClimateData,
  getExtremeWeatherData,
  searchDatasets
};