export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-2 text-sm text-gray-500 sm:flex-row">
          <span>&copy; {new Date().getFullYear()} Novel AI Agent</span>
          <span>
            Book data courtesy of{' '}
            <a
              href="https://www.gutenberg.org"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-gray-600 hover:text-blue-600"
            >
              Project Gutenberg
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
