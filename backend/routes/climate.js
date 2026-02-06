const express = require('express');
const router = express.Router();
const { getClimateData, getExtremeWeatherData, searchDatasets } = require('../controllers/climateController');

// Get climate data for a specific location and timeframe
router.get('/data/:location', async (req, res, next) => {
  try {
    const { location } = req.params;
    const { timeframe = '2030', metrics = 'all' } = req.query;
    
    const climateData = await getClimateData(location, timeframe, metrics);
    
    res.json({
      success: true,
      data: climateData
    });
  } catch (error) {
    next(error);
  }
});

// Get extreme weather statistics
router.get('/extreme/:location', async (req, res, next) => {
  try {
    const { location } = req.params;
    const { year = '2030' } = req.query;
    
    const extremeData = await getExtremeWeatherData(location, year);
    
    res.json({
      success: true,
      data: extremeData
    });
  } catch (error) {
    next(error);
  }
});

// Search for climate datasets
router.get('/datasets/search', async (req, res, next) => {
  try {
    const { query, limit = 10 } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required'
      });
    }
    
    const datasets = await searchDatasets(query, parseInt(limit));
    
    res.json({
      success: true,
      data: datasets
    });
  } catch (error) {
    next(error);
  }
});

// Get available locations
router.get('/locations', async (req, res, next) => {
  try {
    // Mumbai region locations
    const locations = [
      'Mumbai', 'Navi Mumbai', 'Thane', 'Bandra',
      'Andheri', 'Dadar', 'Colaba', 'Marine Lines',
      'Churchgate', 'Borivali', 'Kandivali', 'Malad',
      'Goregaon', 'Jogeshwari', 'Vile Parle', 'Santacruz',
      'Powai', 'Bandra Kurla Complex', 'Lower Parel', 'Worli',
      'Prabhadevi', 'Mahim', 'Sion', 'Chembur',
      'Govandi', 'Mankhurd', 'Vashi', 'Panvel'
    ];
    
    res.json({
      success: true,
      data: locations
    });
  } catch (error) {
    next(error);
  }
});

// Get available timeframes
router.get('/timeframes', async (req, res, next) => {
  try {
    const timeframes = [
      { value: '2030', label: '2030', description: 'Near future (5+ years)' },
      { value: '2040', label: '2040', description: 'Mid-century view' },
      { value: '2050', label: '2050', description: 'Long-term perspective' }
    ];
    
    res.json({
      success: true,
      data: timeframes
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;