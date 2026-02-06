const express = require('express');
const router = express.Router();
const { generateStory, getStoryById, getUserStories } = require('../controllers/storyController');
const { validateStoryRequest } = require('../middleware/validation');

// Generate a new climate story
router.post('/generate', validateStoryRequest, async (req, res, next) => {
  try {
    const { location, timeframe, topic, personalContext } = req.body;
    
    const story = await generateStory({
      location,
      timeframe,
      topic,
      personalContext
    });
    
    res.status(201).json({
      success: true,
      data: story
    });
  } catch (error) {
    next(error);
  }
});

// Get a specific story by ID
router.get('/:id', async (req, res, next) => {
  try {
    const story = await getStoryById(req.params.id);
    
    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Story not found'
      });
    }
    
    res.json({
      success: true,
      data: story
    });
  } catch (error) {
    next(error);
  }
});

// Get stories for a specific user/location
router.get('/user/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { limit = 10, offset = 0 } = req.query;
    
    const stories = await getUserStories(userId, parseInt(limit), parseInt(offset));
    
    res.json({
      success: true,
      data: stories,
      count: stories.length
    });
  } catch (error) {
    next(error);
  }
});

// Get popular stories
router.get('/popular', async (req, res, next) => {
  try {
    // This would typically query a database for popular stories
    // For now, returning mock data
    const popularStories = [
      {
        id: '1',
        location: 'Mumbai',
        timeframe: '2030',
        topic: 'hometown',
        views: 1250,
        shares: 89
      },
      {
        id: '2',
        location: 'Bandra',
        timeframe: '2040',
        topic: 'coffee',
        views: 980,
        shares: 67
      }
    ];
    
    res.json({
      success: true,
      data: popularStories
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;