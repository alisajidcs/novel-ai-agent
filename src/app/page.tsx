'use client';

import { useState } from 'react';
import { BookMetadata as BookMetadataType, fetchBookData } from '@/lib/gutenberg';
import { analyzeBookContent } from '@/lib/llm';
import CharacterAnalysis from '@/components/CharacterAnalysis';
import Navigation from '@/components/Navigation';
import CharacterNetwork from '@/components/CharacterNetwork';
import BookSearchForm from '@/components/BookSearchForm';
import BookMetadataDisplay from '@/components/BookMetadata';
import BookContentPreview from '@/components/BookContentPreview';

interface Character {
  name: string;
  interactions: string[];
}

export default function TextVersion() {
  const [content, setContent] = useState('');
  const [metadata, setMetadata] = useState<BookMetadataType | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (bookId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch book data      
      const data = await fetchBookData(bookId);
      const subContent = data.content.substring(10000, 19000); // Removing the intro pages to save on tokens
      setContent(subContent);
      setMetadata(data.metadata);

      // Analyze characters
      const characterAnalysis = await analyzeBookContent(subContent);
      setCharacters(characterAnalysis.interactionMapping);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing the book');
      setContent('');
      setMetadata(null);
      setCharacters([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Navigation />
      <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Novel AI Agent
            </h1>
            <p className="text-lg text-gray-600">
              View character analysis in the Gutenberg Novels
            </p>
          </div>

          <BookSearchForm onSubmit={handleSubmit} isLoading={isLoading} />

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {metadata && <BookMetadataDisplay metadata={metadata} />}

          <div className="mt-12">
            <CharacterNetwork characters={characters} isLoading={isLoading} />
          </div>

          <div className="mt-12">
            <CharacterAnalysis characters={characters} isLoading={isLoading} />
          </div>

          {content && <BookContentPreview content={content} />}
        </div>
      </main>
    </div>
  );
} 