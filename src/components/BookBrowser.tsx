'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { BookSearchResult, BookSortOrder, BookSummary, searchBooks } from '@/lib/gutenberg';

interface BookBrowserProps {
  onSelectBook: (bookId: string) => void;
  isLoading: boolean;
  selectedBookId?: string;
}

const TOPIC_OPTIONS = [
  { label: 'All genres', value: '' },
  { label: 'Fiction', value: 'fiction' },
  { label: 'Drama', value: 'drama' },
  { label: 'Romance', value: 'romance' },
  { label: 'Adventure', value: 'adventure' },
  { label: 'Mystery', value: 'mystery' },
  { label: 'Poetry', value: 'poetry' },
  { label: 'History', value: 'history' },
];

const LANGUAGE_OPTIONS = [
  { label: 'Any language', value: '' },
  { label: 'English', value: 'en' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
  { label: 'Spanish', value: 'es' },
  { label: 'Italian', value: 'it' },
  { label: 'Portuguese', value: 'pt' },
];

const SORT_OPTIONS: { label: string; value: BookSortOrder }[] = [
  { label: 'Most popular', value: 'popular' },
  { label: 'Title (A-Z)', value: 'ascending' },
  { label: 'Title (Z-A)', value: 'descending' },
];

const PAGE_SIZE_OPTIONS = [8, 12, 16, 24, 32];

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

function BookCoverSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-3 aspect-[2/3] w-full rounded-lg bg-gray-200" />
      <div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
      <div className="h-3 w-1/2 rounded bg-gray-200" />
    </div>
  );
}

function BookCard({
  book,
  onSelect,
  isDisabled,
  isSelected,
}: {
  book: BookSummary;
  onSelect: (bookId: string) => void;
  isDisabled: boolean;
  isSelected: boolean;
}) {
  return (
    <div
      className={`group flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
        isSelected ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'
      }`}
    >
      <div className="relative flex aspect-[2/3] w-full items-center justify-center overflow-hidden bg-gray-100">
        {book.coverUrl ? (
          <Image
            src={book.coverUrl}
            alt={`Cover of ${book.title}`}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 180px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-gray-400">
            <svg className="mb-2 h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
              />
            </svg>
            <span className="px-2 text-center text-xs">No cover</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-gray-900" title={book.title}>
          {book.title}
        </h3>
        <p className="line-clamp-1 text-xs text-gray-500" title={book.authors.join(', ')}>
          {book.authors.join(', ')}
        </p>

        {book.subjects.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {book.subjects.slice(0, 2).map((subject) => (
              <span
                key={subject}
                className="truncate rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700"
                title={subject}
              >
                {subject}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 12m0 0l4.5-4.5M12 12V3"
              />
            </svg>
            {book.downloadCount.toLocaleString()}
          </span>
          <button
            type="button"
            onClick={() => onSelect(String(book.id))}
            disabled={isDisabled}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSelected && isDisabled ? 'Analyzing…' : 'Analyze'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BookBrowser({ onSelectBook, isLoading, selectedBookId }: BookBrowserProps) {
  const [queryInput, setQueryInput] = useState('');
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState('');
  const [sort, setSort] = useState<BookSortOrder>('popular');
  const [pageSize, setPageSize] = useState(12);
  const [page, setPage] = useState(1);

  const [data, setData] = useState<BookSearchResult | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const debouncedQuery = useDebouncedValue(queryInput, 400);

  // Any filter change should jump back to page 1, since the previous page
  // number may no longer make sense for the new result set.
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, topic, language, sort, pageSize]);

  useEffect(() => {
    let cancelled = false;

    async function runSearch() {
      setIsFetching(true);
      setFetchError(null);
      try {
        const result = await searchBooks({
          query: debouncedQuery || undefined,
          topic: topic || undefined,
          language: language || undefined,
          sort,
          page,
          pageSize,
        });
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) {
          setFetchError(err instanceof Error ? err.message : 'Failed to search the catalog');
          setData(null);
        }
      } finally {
        if (!cancelled) setIsFetching(false);
      }
    }

    runSearch();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, topic, language, sort, page, pageSize]);

  const resultsRange = useMemo(() => {
    if (!data || data.count === 0) return null;
    const start = (data.page - 1) * data.pageSize + 1;
    const end = Math.min(data.page * data.pageSize, data.count);
    return { start, end };
  }, [data]);

  return (
    <div className="w-full">
      {/* Search + filters toolbar */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Search by title or author, e.g. &quot;Pride and Prejudice&quot;"
              className="w-full rounded-md border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
            Genre
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="rounded-md border border-gray-300 py-2 px-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TOPIC_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
            Language
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-md border border-gray-300 py-2 px-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
            Sort by
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as BookSortOrder)}
              className="rounded-md border border-gray-300 py-2 px-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
            Per page
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="rounded-md border border-gray-300 py-2 px-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size} books
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Results summary */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <span>
          {isFetching
            ? 'Searching…'
            : resultsRange
            ? `Showing ${resultsRange.start}-${resultsRange.end} of ${data?.count.toLocaleString()} books`
            : fetchError
            ? ' '
            : 'No books found'}
        </span>
      </div>

      {/* Results grid */}
      {fetchError ? (
        <div className="mt-4 rounded-lg bg-red-50 p-6 text-center text-sm text-red-700">
          {fetchError}
        </div>
      ) : isFetching && !data ? (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {Array.from({ length: pageSize }).map((_, i) => (
            <BookCoverSkeleton key={i} />
          ))}
        </div>
      ) : data && data.results.length > 0 ? (
        <div
          className={`mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 ${
            isFetching ? 'opacity-60' : ''
          }`}
        >
          {data.results.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onSelect={onSelectBook}
              isDisabled={isLoading}
              isSelected={selectedBookId === String(book.id)}
            />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-gray-300 p-10 text-center text-sm text-gray-500">
          No books match your filters. Try a different search term or genre.
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || isFetching}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {data.page} of {data.totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page >= data.totalPages || isFetching}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
