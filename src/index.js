require('dotenv').config();  // Load environment variables
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

// Start server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
