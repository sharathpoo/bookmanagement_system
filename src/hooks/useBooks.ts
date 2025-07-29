import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { Book, ApiResponse } from '../types';

export const useBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBooks = async (search?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response: ApiResponse<Book[]> = await apiService.getBooks(search);
      setBooks(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  const createBook = async (book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response: ApiResponse<Book> = await apiService.createBook(book);
      if (response.success && response.data) {
        setBooks(prev => [response.data!, ...prev]);
        return response.data;
      }
    } catch (err) {
      throw err;
    }
  };

  const updateBook = async (id: string, updates: Partial<Book>) => {
    try {
      const response: ApiResponse<Book> = await apiService.updateBook(id, updates);
      if (response.success && response.data) {
        setBooks(prev => prev.map(book => 
          book.id === id ? response.data! : book
        ));
        return response.data;
      }
    } catch (err) {
      throw err;
    }
  };

  const deleteBook = async (id: string) => {
    try {
      await apiService.deleteBook(id);
      setBooks(prev => prev.filter(book => book.id !== id));
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return {
    books,
    loading,
    error,
    fetchBooks,
    createBook,
    updateBook,
    deleteBook,
    refetch: () => fetchBooks()
  };
};