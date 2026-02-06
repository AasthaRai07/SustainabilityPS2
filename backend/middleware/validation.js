const winston = require('winston');

// Logger
const logger = winston.loggers.get('climate-storytelling-api') || 
  winston.createLogger({
    transports: [new winston.transports.Console()]
  });

// Mumbai region locations for validation
const mumbaiLocations = [
  'Mumbai', 'Navi Mumbai', 'Thane', 'Bandra',
  'Andheri', 'Dadar', 'Colaba', 'Marine Lines',
  'Churchgate', 'Borivali', 'Kandivali', 'Malad',
  'Goregaon', 'Jogeshwari', 'Vile Parle', 'Santacruz',
  'Powai', 'Bandra Kurla Complex', 'Lower Parel', 'Worli',
  'Prabhadevi', 'Mahim', 'Sion', 'Chembur',
  'Govandi', 'Mankhurd', 'Vashi', 'Panvel'
];

// Valid timeframes
const validTimeframes = ['2030', '2040', '2050'];

// Valid topics
const validTopics = ['general', 'hometown', 'coffee', 'birds', 'water', 'energy'];

// Validate story generation request
function validateStoryRequest(req, res, next) {
  try {
    const { location, timeframe, topic, personalContext } = req.body;
    
    // Validate required fields
    if (!location) {
      return res.status(400).json({
        success: false,
        error: 'Location is required'
      });
    }
    
    if (!timeframe) {
      return res.status(400).json({
        success: false,
        error: 'Timeframe is required'
      });
    }
    
    // Validate location is in Mumbai region
    if (!mumbaiLocations.includes(location)) {
      return res.status(400).json({
        success: false,
        error: `Invalid location. Please select from Mumbai region locations: ${mumbaiLocations.join(', ')}`
      });
    }
    
    // Validate timeframe
    if (!validTimeframes.includes(timeframe)) {
      return res.status(400).json({
        success: false,
        error: `Invalid timeframe. Must be one of: ${validTimeframes.join(', ')}`
      });
    }
    
    // Validate topic if provided
    if (topic && !validTopics.includes(topic)) {
      return res.status(400).json({
        success: false,
        error: `Invalid topic. Must be one of: ${validTopics.join(', ')}`
      });
    }
    
    // Validate personal context length
    if (personalContext && personalContext.length > 500) {
      return res.status(400).json({
        success: false,
        error: 'Personal context must be less than 500 characters'
      });
    }
    
    // Set defaults for optional fields
    req.body.topic = topic || 'general';
    req.body.personalContext = personalContext || '';
    
    logger.info(`Validated story request for ${location} - ${timeframe}`);
    next();
  } catch (error) {
    logger.error('Validation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Validation failed'
    });
  }
}

// Validate climate data request
function validateClimateDataRequest(req, res, next) {
  try {
    const { location } = req.params;
    const { timeframe, metrics } = req.query;
    
    // Validate location
    if (!mumbaiLocations.includes(location)) {
      return res.status(400).json({
        success: false,
        error: `Invalid location. Please select from Mumbai region locations: ${mumbaiLocations.join(', ')}`
      });
    }
    
    // Validate timeframe if provided
    if (timeframe && !validTimeframes.includes(timeframe)) {
      return res.status(400).json({
        success: false,
        error: `Invalid timeframe. Must be one of: ${validTimeframes.join(', ')}`
      });
    }
    
    // Validate metrics if provided
    if (metrics && metrics !== 'all') {
      const requestedMetrics = metrics.split(',');
      const invalidMetrics = requestedMetrics.filter(metric => 
        !['temperature', 'precipitation', 'seaLevel', 'co2'].includes(metric)
      );
      
      if (invalidMetrics.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Invalid metrics: ${invalidMetrics.join(', ')}. Valid metrics are: temperature, precipitation, seaLevel, co2`
        });
      }
    }
    
    next();
  } catch (error) {
    logger.error('Climate data validation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Validation failed'
    });
  }
}

// Validate analytics tracking request
function validateAnalyticsRequest(req, res, next) {
  try {
    const { storyId } = req.body;
    
    if (!storyId) {
      return res.status(400).json({
        success: false,
        error: 'Story ID is required'
      });
    }
    
    if (typeof storyId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Story ID must be a string'
      });
    }
    
    next();
  } catch (error) {
    logger.error('Analytics validation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Validation failed'
    });
  }
}

module.exports = {
  validateStoryRequest,
  validateClimateDataRequest,
  validateAnalyticsRequest
};