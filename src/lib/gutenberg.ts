export interface BookMetadata {
  title: string;
  author: string;
  language: string;
  downloadCount: number;
}

export interface BookData {
  content: string;
  metadata: BookMetadata;
}

export async function fetchBookData(bookId: string): Promise<BookData> {
  const response = await fetch(`/api/gutenberg?bookId=${encodeURIComponent(bookId)}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch book data');
  }

  return response.json();
}

export interface BookSummary {
  id: number;
  title: string;
  authors: string[];
  subjects: string[];
  language: string;
  downloadCount: number;
  coverUrl: string | null;
}

export interface BookSearchResult {
  results: BookSummary[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type BookSortOrder = 'popular' | 'ascending' | 'descending';

export interface BookSearchParams {
  query?: string;
  topic?: string;
  language?: string;
  sort?: BookSortOrder;
  page?: number;
  pageSize?: number;
}

export async function searchBooks(params: BookSearchParams): Promise<BookSearchResult> {
  const query = new URLSearchParams();
  if (params.query) query.set('q', params.query);
  if (params.topic) query.set('topic', params.topic);
  if (params.language) query.set('language', params.language);
  query.set('sort', params.sort ?? 'popular');
  query.set('page', String(params.page ?? 1));
  query.set('pageSize', String(params.pageSize ?? 12));

  const response = await fetch(`/api/books/search?${query.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to search books');
  }

  return response.json();
}
