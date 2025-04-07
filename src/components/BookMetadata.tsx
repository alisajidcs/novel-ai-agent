import type { BookMetadata } from '@/lib/gutenberg';

interface BookMetadataProps {
  metadata: BookMetadata;
}

export default function BookMetadata({ metadata }: BookMetadataProps) {
  return (
    <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">{metadata.title}</h2>
      <div className="grid grid-cols-2 gap-4 text-gray-600">
        <div>
          <span className="font-medium">Author:</span> {metadata.author}
        </div>
        <div>
          <span className="font-medium">Language:</span> {metadata.language}
        </div>
        <div>
          <span className="font-medium">Downloads:</span> {metadata.downloadCount.toLocaleString()}
        </div>
      </div>
    </div>
  );
} 