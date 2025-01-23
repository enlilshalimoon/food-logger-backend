const express = require('express');
const { analyzeFoodWithGPT } = require('../visionAPI');

const router = express.Router();

router.post('/vision', async (req, res) => {
  try {
    const { foodItems } = req.body; // Example: ['apple', 'burger', 'salad']
    if (!foodItems || !Array.isArray(foodItems)) {
      return res.status(400).json({ error: 'Invalid input. foodItems should be an array.' });
    }

    const analysis = await analyzeFoodWithGPT(foodItems);
    res.json({ analysis });
  } catch (error) {
    console.error('Error in vision route:', error.message);
    res.status(500).json({ error: 'Failed to analyze food items.' });
  }
});

module.exports = router;
