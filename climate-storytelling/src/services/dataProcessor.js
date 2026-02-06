// Data processing utilities for transforming raw climate data
// into story-ready formats

export class DataProcessor {
  // Convert raw climate data into narrative-friendly format
  static processClimateData(rawData, location, timeframe) {
    const processed = {
      location: location,
      timeframe: timeframe,
      metrics: {},
      narrative: {}
    };

    // Process temperature data
    if (rawData.temperatureChange) {
      processed.metrics.temperature = {
        current: rawData.temperatureChange.value > 0 ? 
          `warmer by ${Math.abs(rawData.temperatureChange.value).toFixed(1)}°C` : 
          `cooler by ${Math.abs(rawData.temperatureChange.value).toFixed(1)}°C`,
        change: rawData.temperatureChange.value,
        severity: this.getSeverity(rawData.temperatureChange.value, 'temperature')
      };
    }

    // Process precipitation data
    if (rawData.precipitationChange) {
      processed.metrics.precipitation = {
        current: rawData.precipitationChange.value > 0 ? 
          `wetter by ${Math.abs(rawData.precipitationChange.value).toFixed(0)}mm/year` : 
          `drier by ${Math.abs(rawData.precipitationChange.value).toFixed(0)}mm/year`,
        change: rawData.precipitationChange.value,
        severity: this.getSeverity(rawData.precipitationChange.value, 'precipitation')
      };
    }

    // Process sea level data
    if (rawData.seaLevelRise) {
      processed.metrics.seaLevel = {
        current: `rising by ${rawData.seaLevelRise.value}mm`,
        change: rawData.seaLevelRise.value,
        severity: this.getSeverity(rawData.seaLevelRise.value, 'seaLevel')
      };
    }

    // Process CO2 data
    if (rawData.co2Concentration) {
      processed.metrics.co2 = {
        current: `${rawData.co2Concentration.value}ppm`,
        change: rawData.co2Concentration.value - 421, // baseline
        severity: this.getSeverity(rawData.co2Concentration.value - 421, 'co2')
      };
    }

    // Generate narrative elements
    processed.narrative = this.generateNarrativeElements(processed, rawData.summary);
    
    return processed;
  }

  // Determine severity level for different metrics
  static getSeverity(value, type) {
    const thresholds = {
      temperature: { low: 1, medium: 2, high: 3 },
      precipitation: { low: 50, medium: 100, high: 200 },
      seaLevel: { low: 100, medium: 200, high: 300 },
      co2: { low: 50, medium: 100, high: 150 }
    };

    const threshold = thresholds[type] || thresholds.temperature;
    
    if (Math.abs(value) < threshold.low) return 'low';
    if (Math.abs(value) < threshold.medium) return 'medium';
    if (Math.abs(value) < threshold.high) return 'high';
    return 'extreme';
  }

  // Generate narrative elements from processed data
  static generateNarrativeElements(processedData, summary) {
    const elements = {
      opening: this.generateOpening(processedData.location, processedData.timeframe),
      climateChanges: this.generateClimateChanges(processedData.metrics),
      personalImpact: this.generatePersonalImpact(processedData.metrics, processedData.location),
      callToAction: this.generateCallToAction(processedData.metrics),
      summary: summary
    };

    return elements;
  }

  // Generate opening statement
  static generateOpening(location, timeframe) {
    const timeframes = {
      '2030': 'In just a few short years',
      '2040': 'By the middle of this century',
      '2050': 'By mid-century'
    };

    return `${timeframes[timeframe] || 'In the coming decades'}, ${location} will look very different from today.`;
  }

  // Generate climate change descriptions
  static generateClimateChanges(metrics) {
    const changes = [];
    
    if (metrics.temperature) {
      const tempDesc = metrics.temperature.change > 0 ? 
        `The mercury will climb, making ${metrics.temperature.severity === 'extreme' ? 'sweltering' : 'warmer'} summers the new normal.` :
        `Winter chill will become more pronounced, with ${metrics.temperature.severity === 'extreme' ? 'biting' : 'colder'} temperatures.`;
      changes.push(tempDesc);
    }

    if (metrics.precipitation) {
      const precipDesc = metrics.precipitation.change > 0 ? 
        `Rainfall patterns will shift dramatically, with ${metrics.precipitation.severity === 'extreme' ? 'torrential' : 'increased'} precipitation events.` :
        `Extended dry periods will become common, stressing water resources and agriculture.`;
      changes.push(precipDesc);
    }

    if (metrics.seaLevel) {
      changes.push(`Coastal areas will gradually retreat as sea levels ${metrics.seaLevel.severity === 'extreme' ? 'aggressively' : 'steadily'} rise.`);
    }

    return changes;
  }

  // Generate personal impact statements
  static generatePersonalImpact(metrics, location) {
    const impacts = [];
    
    // Temperature impacts
    if (metrics.temperature) {
      if (metrics.temperature.change > 0) {
        impacts.push(`Your summer electricity bills will soar as air conditioning becomes essential.`);
      } else {
        impacts.push(`Winter heating costs will increase as cold snaps become more frequent.`);
      }
    }

    // Precipitation impacts
    if (metrics.precipitation) {
      if (metrics.precipitation.change > 0) {
        impacts.push(`Flooding will threaten homes and infrastructure during heavy rainfall events.`);
      } else {
        impacts.push(`Gardens and local agriculture will struggle with water scarcity.`);
      }
    }

    // Location-specific impacts
    if (location.toLowerCase().includes('coast') || 
        ['mumbai', 'new york', 'london', 'sydney'].includes(location.toLowerCase())) {
      impacts.push(`Coastal erosion will reshape familiar shorelines and threaten waterfront properties.`);
    }

    return impacts;
  }

  // Generate call to action
  static generateCallToAction(metrics) {
    const actions = [
      "Small changes in our daily lives can make a significant difference.",
      "Community action and policy changes are essential for meaningful impact.",
      "Every action counts in building climate resilience for future generations."
    ];

    // Select action based on most severe metric
    const severities = Object.values(metrics).map(m => m.severity);
    const maxSeverity = Math.max(...severities.map(s => 
      s === 'extreme' ? 4 : s === 'high' ? 3 : s === 'medium' ? 2 : 1
    ));

    return actions[Math.min(maxSeverity - 1, actions.length - 1)];
  }

  // Transform data for 3D visualization
  static transformFor3D(processedData) {
    return {
      temperatureIntensity: Math.min(Math.abs(processedData.metrics.temperature?.change || 0) * 0.5, 1),
      precipitationIntensity: Math.min(Math.abs(processedData.metrics.precipitation?.change || 0) * 0.01, 1),
      seaLevelIntensity: Math.min((processedData.metrics.seaLevel?.change || 0) * 0.005, 1),
      co2Intensity: Math.min((processedData.metrics.co2?.change || 0) * 0.01, 1)
    };
  }

  // Generate time-based progression data
  static generateTimeProgression(baseData, startYear = 2024, endYear = 2050) {
    const progression = [];
    const years = endYear - startYear;
    
    for (let i = 0; i <= years; i += 5) {
      const year = startYear + i;
      const progress = i / years;
      
      progression.push({
        year: year,
        temperature: baseData.temperature.current + 
          (baseData.temperature.projected_2050 - baseData.temperature.current) * progress,
        precipitation: baseData.precipitation.current + 
          (baseData.precipitation.projected_2050 - baseData.precipitation.current) * progress,
        seaLevel: baseData.seaLevel.current + 
          (baseData.seaLevel.projected_2050 - baseData.seaLevel.current) * progress,
        co2: baseData.co2.current + 
          (baseData.co2.projected_2050 - baseData.co2.current) * progress
      });
    }
    
    return progression;
  }
}

export default DataProcessor;