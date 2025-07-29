const express = require('express');
const BookService = require('../services/BookService.cjs');

const router = express.Router();
const bookService = new BookService();

// Get all books
router.get('/', (req, res) => {
  try {
    const { search } = req.query;
    let books;
    
    if (search) {
      books = bookService.searchBooks(search);
    } else {
      books = bookService.getAllBooks();
    }
    
    res.json({
      success: true,
      data: books,
      count: books.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get book by ID
router.get('/:id', (req, res) => {
  try {
    const book = bookService.getBookById(req.params.id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }
    
    res.json({
      success: true,
      data: book
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new book
router.post('/', (req, res) => {
  try {
    const book = bookService.createBook(req.body);
    
    res.status(201).json({
      success: true,
      data: book,
      message: 'Book created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Update book
router.put('/:id', (req, res) => {
  try {
    const book = bookService.updateBook(req.params.id, req.body);
    
    res.json({
      success: true,
      data: book,
      message: 'Book updated successfully'
    });
  } catch (error) {
    const statusCode = error.message === 'Book not found' ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
});

// Delete book
router.delete('/:id', (req, res) => {
  try {
    const book = bookService.deleteBook(req.params.id);
    
    res.json({
      success: true,
      data: book,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    const statusCode = error.message === 'Book not found' ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;