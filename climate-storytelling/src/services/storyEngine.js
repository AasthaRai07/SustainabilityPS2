// Story Engine - Main orchestrator for the climate storytelling experience
import nasaApi from './nasaApi';
import openaiApi from './openaiApi';
import DataProcessor from './dataProcessor';

class StoryEngine {
  constructor() {
    this.currentStory = null;
    this.userData = null;
    this.climateData = null;
  }

  // Generate complete personalized story experience
  async generateStory(userData) {
    try {
      this.userData = userData;
      
      // Use backend API to generate complete story
      const response = await fetch('http://localhost:3001/api/stories/generate', {
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

      this.currentStory = result.data;
      
      // Cache the story
      const cacheKey = this.generateCacheKey(userData);
      openaiApi.cacheStory(cacheKey, result.data.content);
      
      return this.currentStory;
    } catch (error) {
      console.error('Error generating story:', error);
      // Return fallback story
      return this.generateFallbackStory(userData);
    }
  }

  // Assemble all story components
  assembleStory(aiStory, processedData, userData) {
    return {
      id: this.generateStoryId(userData),
      userData: userData,
      climateData: processedData,
      narrative: {
        aiGenerated: aiStory,
        structured: processedData.narrative
      },
      visualData: DataProcessor.transformFor3D(processedData),
      timestamp: new Date().toISOString(),
      shareable: this.generateShareableContent(userData, aiStory)
    };
  }

  // Generate unique story ID
  generateStoryId(userData) {
    return `${userData.location.replace(/\s+/g, '-').toLowerCase()}-${userData.timeframe}-${Date.now()}`;
  }

  // Generate cache key for story storage
  generateCacheKey(userData) {
    return `${userData.location}-${userData.topic || 'general'}-${userData.timeframe}`;
  }

  // Generate fallback story when APIs fail
  generateFallbackStory(userData) {
    const fallbackData = nasaApi.generateMockData();
    const processedData = DataProcessor.processClimateData(
      nasaApi.formatClimateData(fallbackData, userData.timeframe),
      userData.location,
      userData.timeframe
    );
    
    const fallbackStory = `Climate change will significantly impact ${userData.location} by ${userData.timeframe}. Based on current trends, residents can expect temperature changes, shifting precipitation patterns, and evolving environmental conditions. These changes will affect daily life, from energy consumption to outdoor activities. The good news is that communities worldwide are developing innovative solutions, and individual actions today help shape a more sustainable future. Every choice to reduce emissions and build resilience contributes to positive outcomes for ${userData.location} and beyond.`;
    
    return this.assembleStory(fallbackStory, processedData, userData);
  }

  // Get cached story if available
  async getCachedStory(userData) {
    const cacheKey = this.generateCacheKey(userData);
    const cachedStory = await openaiApi.getCachedStory(cacheKey);
    
    if (cachedStory) {
      // Return cached story with current structure
      return {
        content: cachedStory,
        userData: userData,
        timestamp: new Date().toISOString()
      };
    }
    
    return null;
  }

  // Update story with new parameters
  async updateStory(newParams) {
    if (!this.userData) return null;
    
    const updatedData = { ...this.userData, ...newParams };
    return await this.generateStory(updatedData);
  }

  // Generate time progression data for animations
  async generateTimeProgression(startYear = 2024, endYear = 2050) {
    if (!this.climateData) return null;
    
    const baseData = {
      temperature: {
        current: 15.2 + (this.climateData.metrics.temperature?.change || 0),
        projected_2050: 15.2 + (this.climateData.metrics.temperature?.change || 0) * 2
      },
      precipitation: {
        current: 850 + (this.climateData.metrics.precipitation?.change || 0),
        projected_2050: 850 + (this.climateData.metrics.precipitation?.change || 0) * 2
      },
      seaLevel: {
        current: 0,
        projected_2050: this.climateData.metrics.seaLevel?.change || 0
      },
      co2: {
        current: 421,
        projected_2050: 421 + (this.climateData.metrics.co2?.change || 0)
      }
    };
    
    return DataProcessor.generateTimeProgression(baseData, startYear, endYear);
  }

  // Generate shareable content
  generateShareableContent(userData, story) {
    return {
      title: `My Climate Future: ${userData.location} in ${userData.timeframe}`,
      description: story.substring(0, 200) + '...',
      url: `${window.location.origin}/story/${this.generateStoryId(userData)}`,
      image: this.generateStoryImage(userData),
      hashtags: ['#ClimateStory', '#ClimateAction', `#${userData.location.replace(/\s+/g, '')}`]
    };
  }

  // Generate story image data (for social sharing)
  generateStoryImage(userData) {
    // In production, this would generate an actual image
    // For now, return a data structure for image generation
    return {
      location: userData.location,
      timeframe: userData.timeframe,
      theme: userData.topic || 'climate',
      template: 'story-card'
    };
  }

  // Get story statistics for analytics
  getStoryStats() {
    return {
      totalStoriesGenerated: localStorage.getItem('storiesGenerated') || 0,
      mostPopularLocations: this.getPopularLocations(),
      averageStoryLength: this.getAverageStoryLength(),
      completionRate: this.getStoryCompletionRate()
    };
  }

  // Helper methods for analytics
  getPopularLocations() {
    // Implementation would track location popularity
    return ['New York', 'London', 'Sydney', 'Mumbai'];
  }

  getAverageStoryLength() {
    // Implementation would calculate average story length
    return 650; // characters
  }

  getStoryCompletionRate() {
    // Implementation would track how many stories users read completely
    return 0.73; // 73%
  }

  // Validate user input
  validateUserData(userData) {
    const required = ['location', 'timeframe'];
    const missing = required.filter(field => !userData[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
    
    // Validate timeframe
    const validTimeframes = ['2030', '2040', '2050'];
    if (!validTimeframes.includes(userData.timeframe)) {
      throw new Error(`Invalid timeframe. Must be one of: ${validTimeframes.join(', ')}`);
    }
    
    return true;
  }
}

export default new StoryEngine();