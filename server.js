// Load environment variables from .env file
require('dotenv').config();

const mongoose = require('mongoose');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000; // Use the PORT defined in .env or default to 3000

// Middleware to parse JSON
app.use(express.json());

// Use environment variable for MongoDB connection string
const dbURI = process.env.MONGODB_URI;

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Error connecting to MongoDB', err));

// Basic route
app.get('/', (req, res) => {
    res.send('Welcome to the Book API');
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
