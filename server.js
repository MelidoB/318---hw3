require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const Book = require('./models/Book'); // Import the Book model

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Allow CORS for all origins
app.use(cors());

// Log requests to the console
app.use(morgan('combined'));

// Apply rate limiting to all requests
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Error connecting to MongoDB', err));

// Root route - Display a welcome message and all books
app.get('/', async (req, res) => {
    try {
        const books = await Book.find(); // Fetch all books from the database
        res.json({
            message: 'Welcome to the Book API',
            books: books.length ? books : 'No books found' // Display books or a message if empty
        });
    } catch (err) {
        res.status(500).json({ message: err.message }); // Handle errors
    }
});

// CRUD Routes for books

// Create a new book
app.post('/books', async (req, res) => {
    try {
        const book = new Book(req.body);
        const savedBook = await book.save();
        res.status(201).json(savedBook);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get all books
app.get('/books', async (req, res) => {
    try {
        const books = await Book.find();
        res.json(books);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a book by ID
app.get('/books/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found' });
        res.json(book);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update a book by ID
app.put('/books/:id', async (req, res) => {
    try {
        const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedBook) return res.status(404).json({ message: 'Book not found' });
        res.json(updatedBook);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a book by ID
app.delete('/books/:id', async (req, res) => {
    try {
        const deletedBook = await Book.findByIdAndDelete(req.params.id);
        if (!deletedBook) return res.status(404).json({ message: 'Book not found' });
        res.json({ message: 'Book deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Catch-all route for 404 errors
app.use((req, res) => {
    res.status(404).send('404: Not Found');
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
