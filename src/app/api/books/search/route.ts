import { NextResponse } from 'next/server';
import { fetchWithRetry, BROWSER_REQUEST_HEADERS } from '@/lib/http';

// Catalog metadata (title, author, cover, subjects, download counts...) comes
// from Gutendex, a public read-only JSON API mirroring the Project Gutenberg
// catalog. It always returns 32 results per page, so to support a
// user-selectable page size we fetch however many upstream pages are needed
// to cover the requested window and slice out the exact range.
const GUTENDEX_PAGE_SIZE = 32;
const MIN_PAGE_SIZE = 4;
const MAX_PAGE_SIZE = 48;
const MAX_UPSTREAM_PAGES_PER_REQUEST = 3;

interface GutendexAuthor {
  name: string;
  birth_year: number | null;
  death_year: number | null;
}

interface GutendexBook {
  id: number;
  title: string;
  authors: GutendexAuthor[];
  subjects: string[];
  bookshelves: string[];
  languages: string[];
  download_count: number;
  formats: Record<string, string>;
}

interface GutendexResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: GutendexBook[];
}

async function fetchGutendexPage(params: URLSearchParams, page: number): Promise<GutendexResponse> {
  const upstream = new URLSearchParams(params);
  upstream.set('page', String(page));

  const response = await fetchWithRetry(`https://gutendex.com/books/?${upstream.toString()}`, {
    headers: BROWSER_REQUEST_HEADERS,
  });

  if (!response.ok) {
    throw new Error(`Failed to search the catalog: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const query = searchParams.get('q')?.trim() || '';
  const topic = searchParams.get('topic')?.trim() || '';
  const language = searchParams.get('language')?.trim() || '';
  const sort = searchParams.get('sort')?.trim() || 'popular'; // popular | ascending | descending
  const page = clamp(parseInt(searchParams.get('page') || '1', 10) || 1, 1, 10_000);
  const pageSize = clamp(
    parseInt(searchParams.get('pageSize') || '12', 10) || 12,
    MIN_PAGE_SIZE,
    MAX_PAGE_SIZE
  );

  const upstreamParams = new URLSearchParams();
  if (query) upstreamParams.set('search', query);
  if (topic) upstreamParams.set('topic', topic);
  if (language) upstreamParams.set('languages', language);
  if (['popular', 'ascending', 'descending'].includes(sort)) {
    upstreamParams.set('sort', sort);
  }

  const offset = (page - 1) * pageSize;
  const firstUpstreamPage = Math.floor(offset / GUTENDEX_PAGE_SIZE) + 1;
  const lastUpstreamPage = Math.floor((offset + pageSize - 1) / GUTENDEX_PAGE_SIZE) + 1;

  if (lastUpstreamPage - firstUpstreamPage + 1 > MAX_UPSTREAM_PAGES_PER_REQUEST) {
    return NextResponse.json({ error: 'Requested page size/page combination is too large' }, { status: 400 });
  }

  try {
    const upstreamResponses: GutendexResponse[] = [];
    for (let upstreamPage = firstUpstreamPage; upstreamPage <= lastUpstreamPage; upstreamPage++) {
      try {
        upstreamResponses.push(await fetchGutendexPage(upstreamParams, upstreamPage));
      } catch (err) {
        // Requesting a page number past the last available page 404s upstream;
        // treat that as "no more results" rather than a hard failure.
        if (upstreamResponses.length > 0) break;
        throw err;
      }
    }

    const count = upstreamResponses[0]?.count ?? 0;
    const combined = upstreamResponses.flatMap((r) => r.results);
    const sliceStart = offset - (firstUpstreamPage - 1) * GUTENDEX_PAGE_SIZE;
    const pageResults = combined.slice(sliceStart, sliceStart + pageSize);

    const results = pageResults.map((book) => ({
      id: book.id,
      title: book.title || 'Untitled',
      authors: book.authors.length > 0 ? book.authors.map((a) => a.name) : ['Unknown Author'],
      subjects: book.subjects.slice(0, 4),
      language: book.languages[0] || 'en',
      downloadCount: book.download_count || 0,
      coverUrl: book.formats['image/jpeg'] || null,
    }));

    return NextResponse.json({
      results,
      count,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(count / pageSize)),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to search the catalog';
    const status = errorMessage.includes('timeout') ? 504 : 500;
    return NextResponse.json({ error: errorMessage }, { status });
  }
}
