const OpenAI = require('openai');
const axios = require('axios');
const winston = require('winston');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Logger
const logger = winston.loggers.get('climate-storytelling-api') || 
  winston.createLogger({
    transports: [new winston.transports.Console()]
  });

// Mock data for development
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
  }
};

// Generate personalized climate story using OpenAI
async function generateStory(userData) {
  try {
    const { location, timeframe, topic, personalContext } = userData;
    
    // Get climate data for the location
    const climateData = await getClimateData(location, timeframe);
    
    // Generate story with OpenAI or fallback to mock
    let storyContent;
    if (process.env.OPENAI_API_KEY) {
      storyContent = await generateAIStory(userData, climateData);
    } else {
      storyContent = generateMockStory(userData, climateData);
    }
    
    // Create story object
    const story = {
      id: generateStoryId(),
      userData,
      climateData,
      content: storyContent,
      visualData: transformFor3D(climateData),
      timestamp: new Date().toISOString(),
      shareable: generateShareableContent(userData, storyContent)
    };
    
    logger.info(`Generated story for ${location} - ${timeframe}`);
    return story;
  } catch (error) {
    logger.error('Error generating story:', error);
    throw new Error(`Failed to generate story: ${error.message}`);
  }
}

// Generate story with OpenAI
async function generateAIStory(userData, climateData) {
  const { location, timeframe, topic, personalContext } = userData;
  
  const prompt = `Create a personalized climate story for someone in ${location} interested in ${topic || 'their local environment'}.

Background data:
- Timeframe: ${timeframe}
- Temperature change: ${(climateData.temperature.projected_2030 - climateData.temperature.current).toFixed(1)}°C
- Precipitation change: ${(climateData.precipitation.projected_2030 - climateData.precipitation.current).toFixed(0)}mm/year
- Sea level rise: ${climateData.seaLevel.projected_2030}mm
- CO2 concentration: ${climateData.co2.projected_2030}ppm

Personal context: ${personalContext || 'They care about their community and want to understand local climate impacts.'}

Please create a 3-4 paragraph story that:
1. Opens with a relatable scenario in their location
2. Describes specific climate changes they'll experience
3. Shows personal impacts on daily life
4. Ends with an empowering call to action

Make it engaging, factual, and hopeful rather than alarmist.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a climate storyteller who creates engaging, personalized narratives about climate change impacts. Your stories should be factual, emotionally resonant, and inspire action without being alarmist."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    return response.choices[0].message.content;
  } catch (error) {
    logger.error('OpenAI API error, falling back to mock story:', error);
    return generateMockStory(userData, climateData);
  }
}

// Generate mock story for development
function generateMockStory(userData, climateData) {
  const { location, timeframe } = userData;
  const tempChange = (climateData.temperature.projected_2030 - climateData.temperature.current);
  const precipChange = (climateData.precipitation.projected_2030 - climateData.precipitation.current);
  const seaLevelRise = climateData.seaLevel.projected_2030;

  const stories = {
    'Mumbai': `By ${timeframe}, Mumbai's monsoon patterns will have fundamentally changed. The city that built its identity around predictable seasonal rhythms now faces uncertainty. Those familiar pre-monsoon thunderstorms that used to signal summer's end will intensify, bringing sudden flooding to areas that never experienced it before. Your daily commute might be disrupted more frequently as heavy rainfall overwhelms drainage systems that were designed for yesterday's climate. The Arabian Sea's warming waters fuel stronger cyclones, making coastal areas more vulnerable. Yet Mumbai's resilience shines through community-driven adaptation - local fishermen are sharing traditional knowledge about changing weather patterns, and neighborhood groups are creating early warning systems. The city's informal settlements are pioneering innovative flood-resistant housing solutions that could serve as models for coastal cities worldwide. Your choices today about water conservation and sustainable transportation directly influence which future Mumbai inherits.`,
    
    'Bandra': `In ${timeframe}, Bandra's familiar coastal charm will evolve as climate change reshapes this iconic Mumbai neighborhood. The Bandra Worli Sea Link, which connects you to South Mumbai, may require periodic closures during extreme weather events that become more frequent. Your evening walks along the waterfront might take different routes as rising seas gradually claim sections of the path. The famous Bandra Kurla Complex, hub of Mumbai's business district, is implementing cutting-edge green building technologies to stay ahead of climate challenges. Local cafes and restaurants are adapting their operations to handle increased heat and unpredictable weather. The community's strong sense of identity and collaborative spirit positions Bandra as a model for climate-resilient urban development. Every sustainable choice you make today - from supporting local green businesses to participating in community initiatives - helps write a positive climate story for Bandra's future.`
  };

  const defaultStory = `By ${timeframe}, ${location} will experience climate changes that reshape daily life in meaningful ways. The ${Math.abs(tempChange).toFixed(1)}°C temperature shift means ${tempChange > 0 ? 'hotter summers and milder winters' : 'cooler conditions year-round'}, affecting everything from energy bills to outdoor activities. Precipitation changes of ${Math.abs(precipChange)}mm/year will alter local ecosystems and water management practices. Rising seas by ${seaLevelRise}mm will impact coastal areas and infrastructure. These changes, while significant, present opportunities for innovation and community building. Local adaptation efforts, from renewable energy projects to sustainable transportation initiatives, show how individual actions contribute to collective resilience. The future isn't predetermined - every choice to reduce emissions and build climate resilience helps create a more sustainable ${location} for ${timeframe} and beyond.`;

  return stories[location] || defaultStory;
}

// Get climate data for location
async function getClimateData(location, timeframe = '2030') {
  // In production, this would fetch from NASA API or other climate data sources
  const baseData = mockClimateData[location] || mockClimateData['Mumbai'];
  
  return {
    temperature: {
      current: baseData.temperature.current,
      projected: baseData.temperature[`projected_${timeframe}`],
      change: baseData.temperature[`projected_${timeframe}`] - baseData.temperature.current,
      unit: '°C'
    },
    precipitation: {
      current: baseData.precipitation.current,
      projected: baseData.precipitation[`projected_${timeframe}`],
      change: baseData.precipitation[`projected_${timeframe}`] - baseData.precipitation.current,
      unit: 'mm/year'
    },
    seaLevel: {
      current: baseData.seaLevel.current,
      projected: baseData.seaLevel[`projected_${timeframe}`],
      change: baseData.seaLevel[`projected_${timeframe}`] - baseData.seaLevel.current,
      unit: 'mm'
    },
    co2: {
      current: baseData.co2.current,
      projected: baseData.co2[`projected_${timeframe}`],
      change: baseData.co2[`projected_${timeframe}`] - baseData.co2.current,
      unit: 'ppm'
    }
  };
}

// Transform data for 3D visualization
function transformFor3D(climateData) {
  return {
    temperatureIntensity: Math.min(Math.abs(climateData.temperature.change) * 0.3, 1),
    precipitationIntensity: Math.min(Math.abs(climateData.precipitation.change) * 0.005, 1),
    seaLevelIntensity: Math.min(climateData.seaLevel.change * 0.002, 1),
    co2Intensity: Math.min(climateData.co2.change * 0.01, 1)
  };
}

// Generate unique story ID
function generateStoryId() {
  return `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Generate shareable content
function generateShareableContent(userData, storyContent) {
  return {
    title: `My Climate Future: ${userData.location} in ${userData.timeframe}`,
    description: storyContent.substring(0, 200) + '...',
    url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/story/${generateStoryId()}`,
    hashtags: ['#ClimateStory', '#ClimateAction', `#${userData.location.replace(/\s+/g, '')}`]
  };
}

// Get story by ID (mock implementation)
async function getStoryById(id) {
  // In production, this would query a database
  logger.info(`Retrieving story with ID: ${id}`);
  return null; // Return null for now as we're not persisting stories
}

// Get user stories (mock implementation)
async function getUserStories(userId, limit = 10, offset = 0) {
  // In production, this would query a database
  logger.info(`Retrieving stories for user: ${userId}`);
  return []; // Return empty array for now
}

module.exports = {
  generateStory,
  getStoryById,
  getUserStories,
  getClimateData
};