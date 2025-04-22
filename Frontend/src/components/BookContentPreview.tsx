interface BookContentPreviewProps {
  content: string;
}

export default function BookContentPreview({ content }: BookContentPreviewProps) {
  return (
    <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Book Content Preview</h3>
      <div className="prose max-w-none">
        <pre className="whitespace-pre-wrap font-sans text-gray-700">
          {content}...
        </pre>
      </div>
    </div>
  );
} 