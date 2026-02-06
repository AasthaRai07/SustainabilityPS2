const express = require('express');
const router = express.Router();

// Track story view
router.post('/track-view', async (req, res, next) => {
  try {
    const { storyId, userId } = req.body;
    
    // In a real implementation, this would save to a database
    console.log(`Story ${storyId} viewed by ${userId || 'anonymous'}`);
    
    res.json({
      success: true,
      message: 'View tracked successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Track story share
router.post('/track-share', async (req, res, next) => {
  try {
    const { storyId, platform, userId } = req.body;
    
    // In a real implementation, this would save to a database
    console.log(`Story ${storyId} shared on ${platform} by ${userId || 'anonymous'}`);
    
    res.json({
      success: true,
      message: 'Share tracked successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get analytics summary
router.get('/summary', async (req, res, next) => {
  try {
    // Mock analytics data
    const analytics = {
      totalStories: 1250,
      totalViews: 45890,
      totalShares: 3240,
      popularLocations: [
        { location: 'Mumbai', count: 340 },
        { location: 'Bandra', count: 280 },
        { location: 'Andheri', count: 210 }
      ],
      popularTopics: [
        { topic: 'hometown', count: 420 },
        { topic: 'coffee', count: 310 },
        { topic: 'water', count: 280 }
      ]
    };
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
});

// Get user engagement metrics
router.get('/engagement/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    // Mock user engagement data
    const engagement = {
      storiesCreated: 12,
      storiesViewed: 45,
      storiesShared: 8,
      favoriteLocations: ['Mumbai', 'Bandra', 'Powai'],
      favoriteTopics: ['hometown', 'coffee', 'energy']
    };
    
    res.json({
      success: true,
      data: engagement
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;