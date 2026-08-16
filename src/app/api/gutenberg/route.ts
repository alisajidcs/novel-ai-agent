import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { fetchWithRetry, GUTENBERG_USER_AGENT } from '@/lib/http';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bookId = searchParams.get('bookId');

  if (!bookId) {
    return NextResponse.json({ error: 'Book ID is required' }, { status: 400 });
  }

  try {
    // Fetch book content
    const contentUrl = `https://www.gutenberg.org/cache/epub/${bookId}/pg${bookId}.txt`;
    const contentResponse = await fetchWithRetry(contentUrl, {
      headers: {
        'User-Agent': GUTENBERG_USER_AGENT,
      },
    });
    
    if (!contentResponse.ok) {
      throw new Error(`Failed to fetch book content: ${contentResponse.statusText}`);
    }
    
    const content = await contentResponse.text();

    // Fetch and parse metadata
    const metadataUrl = `https://www.gutenberg.org/ebooks/${bookId}`;
    const metadataResponse = await fetchWithRetry(metadataUrl, {
      headers: {
        'User-Agent': GUTENBERG_USER_AGENT,
      },
    });
    
    if (!metadataResponse.ok) {
      throw new Error(`Failed to fetch book metadata: ${metadataResponse.statusText}`);
    }

    const html = await metadataResponse.text();
    const $ = cheerio.load(html);

    const title = $('h1').first().text().trim();
    const author = $('table.bibrec tr:contains("Author") td').text().trim();
    const language = $('table.bibrec tr:contains("Language") td').text().trim();
    const downloadCountText = $('table.bibrec tr:contains("Downloads") td').text().trim();
    const downloadCount = parseInt(downloadCountText.replace(/,/g, '')) || 0;

    return NextResponse.json({
      content,
      metadata: {
        title: title || "Unknown Title",
        author: author || "Unknown Author",
        language: language || "Unknown Language",
        downloadCount
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch book data';
    const status = errorMessage.includes('timeout') ? 504 : 500;
    return NextResponse.json(
      { error: errorMessage },
      { status }
    );
  }
} 