// OpenAI API Service for narrative generation
// This service generates personalized climate stories based on data

class OpenAiService {
  constructor() {
    this.backendUrl = 'http://localhost:3001/api';
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    this.isMockMode = !this.apiKey; // Use mock mode if no API key
  }

  // Generate personalized climate story
  async generateClimateStory(userData, climateData) {
    try {
      const response = await fetch(`${this.backendUrl}/stories/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to generate story');
      }

      return result.data.content;
    } catch (error) {
      console.error('Error generating story with backend:', error);
      // Fallback to mock story
      return this.generateMockStory(userData, climateData);
    }
  }

  // Create prompt for story generation
  createStoryPrompt(userData, climateData) {
    const { location, topic, timeframe, personalContext } = userData;
    
    return `Create a personalized climate story for someone in ${location} interested in ${topic || 'their local environment'}. 

Background data:
- Timeframe: ${timeframe || '2030'}
- Temperature change: ${climateData.temperatureChange?.value?.toFixed(1) || 0}°C
- Precipitation change: ${climateData.precipitationChange?.value?.toFixed(0) || 0}mm/year
- Sea level rise: ${climateData.seaLevelRise?.value || 0}mm
- CO2 concentration: ${climateData.co2Concentration?.value || 421}ppm

Personal context: ${personalContext || 'They care about their community and want to understand local climate impacts.'}

Please create a 3-4 paragraph story that:
1. Opens with a relatable scenario in their location
2. Describes specific climate changes they'll experience
3. Shows personal impacts on daily life
4. Ends with an empowering call to action

Make it engaging, factual, and hopeful rather than alarmist.`;
  }

  // Generate mock story for development/testing
  generateMockStory(userData, climateData) {
    const { location, topic, timeframe } = userData;
    const tempChange = climateData.temperatureChange?.value || 0;
    const precipChange = climateData.precipitationChange?.value || 0;
    const seaLevelRise = climateData.seaLevelRise?.value || 0;

    const stories = {
      'new york': `In ${timeframe}, Manhattan's familiar rhythm will shift as climate change reshapes your daily life. The summer of ${timeframe - 1} brought record-breaking heat waves that made the subway feel like a sauna and sent electricity demand soaring. By ${timeframe}, those sweltering July days will be the new normal, arriving earlier and lasting longer. Central Park's iconic cherry blossoms now bloom two weeks earlier than they did just a decade ago, and the autumn colors fade faster each year. Your morning coffee routine might need adjusting as extreme heat makes outdoor seating uncomfortable for longer stretches. But this transformation also brings opportunity - the city's green infrastructure investments are creating cooler neighborhoods, and community gardens are flourishing in spaces once too hot for cultivation. Every rooftop solar panel installed and every tree planted today helps write a different story for ${timeframe}.`,
      
      'mumbai': `By ${timeframe}, Mumbai's monsoon patterns will have fundamentally changed. The city that built its identity around predictable seasonal rhythms now faces uncertainty. Those familiar pre-monsoon thunderstorms that used to signal summer's end will intensify, bringing sudden flooding to areas that never experienced it before. Your daily commute might be disrupted more frequently as heavy rainfall overwhelms drainage systems that were designed for yesterday's climate. The Arabian Sea's warming waters fuel stronger cyclones, making coastal areas more vulnerable. Yet Mumbai's resilience shines through community-driven adaptation - local fishermen are sharing traditional knowledge about changing weather patterns, and neighborhood groups are creating early warning systems. The city's informal settlements are pioneering innovative flood-resistant housing solutions that could serve as models for coastal cities worldwide. Your choices today about water conservation and sustainable transportation directly influence which future Mumbai inherits.`,
      
      'london': `London in ${timeframe} will wear climate change differently than today. The Thames, which has witnessed centuries of history, now faces new challenges as sea levels rise ${seaLevelRise}mm above current levels. Thames Barrier operations have increased fivefold, and new flood defenses protect areas that never needed them before. Your weekend walks along the river might take different routes as some paths become temporarily inaccessible during high tides. The city's famous parks are adapting too - new tree species from warmer climates are being introduced, and green spaces are designed to absorb more rainfall. British weather's reputation for unpredictability will evolve into something more extreme and less charming. But London's response shows how historic cities can lead climate adaptation - the congestion charge has reduced inner-city emissions, and the Mayor's urban forest initiative is creating cooler neighborhoods. Every tube journey you take using public transport instead of driving contributes to the cleaner, more resilient London that ${timeframe} residents will inherit.`,
      
      'sydney': `Sydney's iconic harbor will look different by ${timeframe} as climate change reshapes this coastal paradise. The Bondi to Coogee coastal walk you love might require detours as rising seas gradually claim sections of the path. Summer temperatures regularly push into the high 30s°C, making afternoon beach visits less appealing and increasing demand for air conditioning. The harbor's marine life is shifting - tropical fish species are becoming more common, while some native species struggle with warming waters. Your weekend barbecue might need to start earlier to avoid the afternoon heat, and water restrictions could limit lawn maintenance during dry periods. But Sydney's response demonstrates how coastal cities can adapt - green roofs and walls are cooling the urban heat island effect, and renewable energy adoption is accelerating. The harbor's transformation reflects a broader shift toward climate resilience, where every solar panel installed and every water-saving measure adopted helps preserve the Sydney lifestyle for future generations.`
    };

    // Default story template
    const defaultStory = `By ${timeframe}, ${location} will experience climate changes that reshape daily life in meaningful ways. The ${Math.abs(tempChange).toFixed(1)}°C temperature shift means ${tempChange > 0 ? 'hotter summers and milder winters' : 'colder conditions year-round'}, affecting everything from energy bills to outdoor activities. Precipitation changes of ${Math.abs(precipChange)}mm/year will alter local ecosystems and water management practices. ${seaLevelRise > 0 ? `Rising seas by ${seaLevelRise}mm will impact coastal areas and infrastructure.` : ''} These changes, while significant, present opportunities for innovation and community building. Local adaptation efforts, from renewable energy projects to sustainable transportation initiatives, show how individual actions contribute to collective resilience. The future isn't predetermined - every choice to reduce emissions and build climate resilience helps create a more sustainable ${location} for ${timeframe} and beyond.`;

    return stories[location.toLowerCase()] || defaultStory;
  }

  // Generate story variations based on different themes
  async generateStoryVariations(userData, climateData, themes = ['personal', 'community', 'economic']) {
    const variations = {};
    
    for (const theme of themes) {
      const themedData = { ...userData, theme };
      variations[theme] = await this.generateClimateStory(themedData, climateData);
    }
    
    return variations;
  }

  // Cache stories to reduce API calls
  async getCachedStory(cacheKey) {
    try {
      const cached = localStorage.getItem(`climate_story_${cacheKey}`);
      if (cached) {
        const { story, timestamp } = JSON.parse(cached);
        // Cache for 24 hours
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          return story;
        }
      }
    } catch (error) {
      console.error('Error retrieving cached story:', error);
    }
    return null;
  }

  // Store story in cache
  cacheStory(cacheKey, story) {
    try {
      localStorage.setItem(`climate_story_${cacheKey}`, JSON.stringify({
        story,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error caching story:', error);
    }
  }
}

export default new OpenAiService();