'use client';

import { useRef, useState } from 'react';
import { BookMetadata as BookMetadataType, fetchBookData } from '@/lib/gutenberg';
import { analyzeBookContent } from '@/lib/llm';
import CharacterAnalysis from '@/components/CharacterAnalysis';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import CharacterNetwork from '@/components/CharacterNetwork';
import BookBrowser from '@/components/BookBrowser';
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
  const [selectedBookId, setSelectedBookId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (bookId: string) => {
    setSelectedBookId(bookId);
    setIsLoading(true);
    setError(null);

    try {
      // Fetch book data
      const data = await fetchBookData(bookId);
      const subContent = data.content.substring(10000, 19000); // Removing the intro pages to save on tokens
      setContent(subContent);
      setMetadata(data.metadata);

      requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });

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
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navigation />
      <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              Powered by AI character extraction
            </span>
            <h1 className="mb-3 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Novel AI Agent
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Browse thousands of free classic novels from Project Gutenberg and instantly
              map out their characters and relationships.
            </p>
          </div>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              1. Choose a novel
            </h2>
            <BookBrowser
              onSelectBook={handleSubmit}
              isLoading={isLoading}
              selectedBookId={selectedBookId}
            />
          </section>

          {error && (
            <div className="mt-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              <svg className="mt-0.5 h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div ref={resultsRef} className="scroll-mt-20">
            {metadata && (
              <section className="mt-12">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">2. Book details</h2>
                <BookMetadataDisplay metadata={metadata} />
              </section>
            )}

            {(isLoading || characters.length > 0) && (
              <section className="mt-12">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">3. Character network</h2>
                <CharacterNetwork characters={characters} isLoading={isLoading} />
              </section>
            )}

            {(isLoading || characters.length > 0) && (
              <section className="mt-12">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">4. Character profiles</h2>
                <CharacterAnalysis characters={characters} isLoading={isLoading} />
              </section>
            )}

            {content && (
              <section className="mt-12">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">5. Text preview</h2>
                <BookContentPreview content={content} />
              </section>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
