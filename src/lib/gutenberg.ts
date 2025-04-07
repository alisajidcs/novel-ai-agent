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
