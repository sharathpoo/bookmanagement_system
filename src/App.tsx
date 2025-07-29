import React, { useState } from 'react';
import { BookOpen, Plus, Activity, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { useBooks } from './hooks/useBooks';
import { BookCard } from './components/BookCard';
import { BookForm } from './components/BookForm';
import { LogsPanel } from './components/LogsPanel';
import { SearchBar } from './components/SearchBar';
import type { Book } from './types';

function App() {
  const { books, loading, error, fetchBooks, createBook, updateBook, deleteBook } = useBooks();
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | undefined>();
  const [showLogs, setShowLogs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleCreateBook = async (bookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setIsSubmitting(true);
      await createBook(bookData);
      showNotification('success', 'Book created successfully!');
    } catch (error) {
      showNotification('error', error instanceof Error ? error.message : 'Failed to create book');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateBook = async (bookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingBook) return;
    
    try {
      setIsSubmitting(true);
      await updateBook(editingBook.id, bookData);
      showNotification('success', 'Book updated successfully!');
    } catch (error) {
      showNotification('error', error instanceof Error ? error.message : 'Failed to update book');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBook = async (id: string) => {
    if (!confirm('Are you sure you want to delete this book?')) return;
    
    try {
      await deleteBook(id);
      showNotification('success', 'Book deleted successfully!');
    } catch (error) {
      showNotification('error', error instanceof Error ? error.message : 'Failed to delete book');
    }
  };

  const handleSearch = (query: string) => {
    fetchBooks(query);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingBook(undefined);
  };

  const openEditForm = (book: Book) => {
    setEditingBook(book);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-2 ${
          notification.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <BookOpen className="text-blue-600" size={32} />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Book Management</h1>
                <p className="text-sm text-gray-500">Manage your library with request logging</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowLogs(true)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Activity size={18} />
                <span>Request Logs</span>
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={18} />
                <span>Add Book</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Stats */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6">
            <div className="max-w-md w-full">
              <SearchBar onSearch={handleSearch} />
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{books.length}</span> books total
              </div>
              <button
                onClick={() => fetchBooks()}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                title="Refresh"
              >
                <RefreshCw size={16} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-gray-600">Loading books...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="text-red-500 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load books</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => fetchBooks()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first book to the library.</p>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              <span>Add Your First Book</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onEdit={openEditForm}
                onDelete={handleDeleteBook}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {showForm && (
        <BookForm
          book={editingBook}
          onSubmit={editingBook ? handleUpdateBook : handleCreateBook}
          onClose={closeForm}
          isSubmitting={isSubmitting}
        />
      )}

      <LogsPanel isOpen={showLogs} onClose={() => setShowLogs(false)} />
    </div>
  );
}

export default App;