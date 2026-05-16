import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import BookCard from '../components/BookCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiSearch, FiBook } from 'react-icons/fi';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const doSearch = useCallback(async (q, p = 1) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const { data } = await api.get('/books', { params: { search: q, page: p, limit: 12 } });
      setBooks(data.books);
      setTotalPages(data.pages);
      setPage(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    doSearch(query, 1);
  };

  return (
    <div className="search-page container">
      <h1 className="page-title">Search Books</h1>
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-wrapper">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by title, author, or genre..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
            autoFocus
          />
        </div>
        <button type="submit" className="btn-primary">Search</button>
      </form>

      {loading && <LoadingSpinner />}

      {!loading && searched && books.length === 0 && (
        <div className="empty-state">
          <FiBook size={48} />
          <p>No books found for "{query}"</p>
        </div>
      )}

      {!loading && books.length > 0 && (
        <>
          <p className="results-count">{books.length} result{books.length !== 1 ? 's' : ''} found</p>
          <div className="books-grid">
            {books.map((b) => <BookCard key={b._id} book={b} />)}
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              <button disabled={page === 1} onClick={() => doSearch(query, page - 1)} className="btn-outline-sm">Previous</button>
              <span>{page} / {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => doSearch(query, page + 1)} className="btn-outline-sm">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
