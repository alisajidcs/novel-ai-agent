# Novel AI Agent

A web application that analyzes characters in Project Gutenberg books using AI. Built with Next.js and Groq LLM.

## Features

- Input a Project Gutenberg book ID to analyze
- Fetches book content from Project Gutenberg
- Uses AI to identify and analyze characters
- Displays character descriptions and interactions

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the root directory and add your Groq API key:
   ```
   GROQ_API_KEY=your_groq_api_key_here
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Get a book ID from Project Gutenberg (e.g., 1787 for Romeo and Juliet)
2. Enter the book ID in the input field
3. Click "Analyze" to process the book
4. View the character analysis results

## Technologies Used

- Next.js 14
- TypeScript
- Groq LLM API
- Project Gutenberg API

## Getting a Groq API Key

1. Visit [https://groq.com/](https://groq.com/)
2. Create an account
3. Generate an API key in your dashboard
4. Add the API key to your `.env.local` file
