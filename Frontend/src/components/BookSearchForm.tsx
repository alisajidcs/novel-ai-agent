import { useState } from 'react';

interface BookSearchFormProps {
  onSubmit: (bookId: string) => void;
  isLoading: boolean;
}

export default function BookSearchForm({ onSubmit, isLoading }: BookSearchFormProps) {
  const [bookId, setBookId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(bookId);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-4">
      <div className="flex flex-col space-y-2">
        <label htmlFor="bookId" className="text-sm font-medium text-gray-700">
          Project Gutenberg Book ID
          <br />
          Choose a book from <a href="https://www.gutenberg.org/ebooks/subject/4882" className="text-blue-500 hover:underline">Novels(Drama)</a> category
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            id="bookId"
            value={bookId}
            onChange={(e) => setBookId(e.target.value)}
            placeholder="e.g., 1787"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !bookId}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
        <p className="text-sm text-gray-600">
          Example IDs: 1787, 779, 27673, 1532, 1977
        </p>
      </div>
    </form>
  );
} 