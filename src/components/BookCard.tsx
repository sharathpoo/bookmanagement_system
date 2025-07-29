import React from 'react';
import { Edit2, Trash2, Calendar, Tag, BookOpen } from 'lucide-react';
import type { Book } from '../types';

interface BookCardProps {
  book: Book;
  onEdit: (book: Book) => void;
  onDelete: (id: string) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden group">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
              {book.title}
            </h3>
            <p className="text-gray-600 font-medium">{book.author}</p>
          </div>
          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(book)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit book"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => onDelete(book.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete book"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <BookOpen size={14} className="mr-2 text-gray-400" />
            <span className="font-mono text-gray-700">{book.isbn}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <Calendar size={14} className="mr-2 text-gray-400" />
              <span>{book.publishedYear}</span>
            </div>
            <div className="flex items-center">
              <Tag size={14} className="mr-2 text-gray-400" />
              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                {book.genre}
              </span>
            </div>
          </div>

          {book.description && (
            <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
              {book.description}
            </p>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-50">
          <p className="text-xs text-gray-400">
            Updated {new Date(book.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};