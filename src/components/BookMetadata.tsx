import type { BookMetadata } from '@/lib/gutenberg';

interface BookMetadataProps {
  metadata: BookMetadata;
}

export default function BookMetadata({ metadata }: BookMetadataProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-2xl font-bold text-gray-900">{metadata.title}</h3>
      <div className="grid grid-cols-1 gap-4 text-gray-600 sm:grid-cols-3">
        <div>
          <span className="block text-xs font-medium uppercase tracking-wide text-gray-400">Author</span>
          {metadata.author}
        </div>
        <div>
          <span className="block text-xs font-medium uppercase tracking-wide text-gray-400">Language</span>
          {metadata.language}
        </div>
        <div>
          <span className="block text-xs font-medium uppercase tracking-wide text-gray-400">Downloads</span>
          {metadata.downloadCount.toLocaleString()}
        </div>
      </div>
    </div>
  );
} 