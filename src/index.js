require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');

const visionRoutes = require('./routes/visionRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Food Logger Backend Running!');
});

// Use Vision API routes
app.use('/', visionRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
