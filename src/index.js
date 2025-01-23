require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Use CORS and parse JSON bodies
app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.send('Food Logger Backend Running!');
});

// POST /vision route
app.post('/vision', (req, res) => {
  try {
    const { photo } = req.body;

    // Check if photo data is provided
    if (!photo) {
      return res.status(400).json({ error: 'No photo provided' });
    }

    // Simulate a response (replace this with your Google Vision API integration)
    const labels = ['apple', 'fruit']; // Replace this with actual Vision API results

    res.json({ labels }); // Send back the labels
  } catch (error) {
    console.error('Error in /vision:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
