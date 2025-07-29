const Book = require('../models/Book.cjs');
const { v4: uuidv4 } = require('uuid');

class BookService {
  constructor() {
    this.books = new Map();
    this.initializeSampleData();
  }

  initializeSampleData() {
    const sampleBooks = [
      {
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        isbn: "978-0-7432-7356-5",
        publishedYear: 1925,
        genre: "Classic Literature",
        description: "A classic American novel set in the Jazz Age"
      },
      {
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        isbn: "978-0-06-112008-4",
        publishedYear: 1960,
        genre: "Classic Literature",
        description: "A gripping tale of racial injustice and childhood innocence"
      },
      {
        title: "1984",
        author: "George Orwell",
        isbn: "978-0-452-28423-4",
        publishedYear: 1949,
        genre: "Dystopian Fiction",
        description: "A dystopian social science fiction novel and cautionary tale"
      }
    ];

    sampleBooks.forEach(bookData => {
      const id = uuidv4();
      const book = new Book(id, bookData.title, bookData.author, bookData.isbn, 
                           bookData.publishedYear, bookData.genre, bookData.description);
      this.books.set(id, book);
    });
  }

  getAllBooks() {
    return Array.from(this.books.values()).map(book => book.toJSON());
  }

  getBookById(id) {
    const book = this.books.get(id);
    return book ? book.toJSON() : null;
  }

  createBook(bookData) {
    const { title, author, isbn, publishedYear, genre, description } = bookData;
    
    if (!title || !author || !isbn) {
      throw new Error('Title, author, and ISBN are required fields');
    }

    // Check for duplicate ISBN
    const existingBook = Array.from(this.books.values()).find(book => book.isbn === isbn);
    if (existingBook) {
      throw new Error('A book with this ISBN already exists');
    }

    const id = uuidv4();
    const book = new Book(id, title, author, isbn, publishedYear, genre, description);
    this.books.set(id, book);
    
    return book.toJSON();
  }

  updateBook(id, updates) {
    const book = this.books.get(id);
    if (!book) {
      throw new Error('Book not found');
    }

    // Check for duplicate ISBN if updating ISBN
    if (updates.isbn && updates.isbn !== book.isbn) {
      const existingBook = Array.from(this.books.values()).find(b => b.isbn === updates.isbn && b.id !== id);
      if (existingBook) {
        throw new Error('A book with this ISBN already exists');
      }
    }

    book.update(updates);
    return book.toJSON();
  }

  deleteBook(id) {
    const book = this.books.get(id);
    if (!book) {
      throw new Error('Book not found');
    }

    this.books.delete(id);
    return book.toJSON();
  }

  searchBooks(query) {
    const searchTerm = query.toLowerCase();
    return Array.from(this.books.values())
      .filter(book => 
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm) ||
        book.genre.toLowerCase().includes(searchTerm) ||
        book.isbn.includes(searchTerm)
      )
      .map(book => book.toJSON());
  }
}

module.exports = BookService;