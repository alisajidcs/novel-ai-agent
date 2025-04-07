**Overview**

Project Gutenberg ****is a platform to download and access free e-books. Build a web application that allows users to explore and analyze books from Project Gutenberg. 

https://www.gutenberg.org/ebooks/1787

Our project is to download a book, analyze it using an LLM and display the results.

---

### API Access

E-book content and metadata can be programmatically fetched via Project Gutenberg

```python
content_url = f"https://www.gutenberg.org/cache/epub/${bookId}/pg${bookId}.txt"
metadata_url = f"https://www.gutenberg.org/ebooks/{book_id}"
```

---

### **Requirements**

**⚙️ Core Functionality** 

1. Create a single page application with an input field for a Project Gutenberg book ID
2. Download the book text using the Gutenberg API
3. Show the first page of the downloaded book and meta data
4. Use an LLM to identify all characters in the text
5. Show all the characters and their interactions with some interactive UI

