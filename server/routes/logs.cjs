const express = require('express');
const router = express.Router();

// This will be set by the main server file
let requestLogger = null;

router.setRequestLogger = (logger) => {
  requestLogger = logger;
};

// Get recent logs
router.get('/', async (req, res) => {
  try {
    if (!requestLogger) {
      return res.status(500).json({
        success: false,
        error: 'Request logger not initialized'
      });
    }

    const limit = parseInt(req.query.limit) || 50;
    const logs = await requestLogger.getRecentLogs(limit);
    
    res.json({
      success: true,
      data: logs,
      count: logs.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;