interface BookContentPreviewProps {
  content: string;
}

export default function BookContentPreview({ content }: BookContentPreviewProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Excerpt</h3>
      <div className="prose max-w-none">
        <pre className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-lg bg-gray-50 p-4 font-sans text-sm leading-relaxed text-gray-700">
          {content}...
        </pre>
      </div>
    </div>
  );
} 