const express = require('express');
const { body, validationResult } = require('express-validator');
const { runDraftWorkflow } = require('../services/agent');
const { generateText } = require('../services/llm');

const router = express.Router();

const validateTopic = [
  body('topic').notEmpty().withMessage('Topic is required').isLength({ min: 3, max: 200 }).withMessage('Topic must be between 3 and 200 characters')
];

const validateMarkdown = [
  body('markdown').notEmpty().withMessage('Markdown content is required').isLength({ min: 10 }).withMessage('Content must be at least 10 characters')
];

const validateUserId = [
  body('userId').notEmpty().withMessage('User ID is required').isMongoId().withMessage('Invalid user ID format')
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg).join(', ');
    return res.status(400).json({
      success: false,
      error: errorMessages,
      errors: errors.array() 
    });
  }
  next();
};

router.post('/draft', async (req, res) => {
  const topic = req.body.topic || req.body.title;
  console.log('[AI DRAFT] Incoming body:', req.body);
  if (!topic || typeof topic !== 'string' || topic.trim().length < 3) {
    return res.status(400).json({
      success: false,
      error: 'Topic/title is required and must be at least 3 characters.'
    });
  }
  try {
    console.log(`Generating draft for topic: ${topic}`);
    const result = await runDraftWorkflow(topic);
    if (result.error) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }
    res.json({
      success: true,
      draft: result.markdown || result.draft || '',
      topic: result.topic || topic
    });
  } catch (error) {
    console.error('Error generating draft:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate draft. Please try again.'
    });
  }
});



router.get('/test-groq', async (req, res) => {
  try {
    console.log('Testing Groq API connection...');

    const testPrompt = 'Hello, Groq! Please respond with "pong" if you can hear me.';
    const response = await generateText(
      testPrompt,
      {},
      process.env.GROQ_MODEL || 'groq/compound'
    );

        console.log('Groq test successful:', response.substring(0, 100) + '...');

        res.json({
      success: true,
      message: 'Groq API connection successful',
      response: response.trim()
    });
  } catch (error) {
    console.error('Groq test error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to connect to Groq API',
      details: error.message
    });
  }
});

module.exports = router;
