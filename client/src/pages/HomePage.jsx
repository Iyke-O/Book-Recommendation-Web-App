import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import BookCard from '../components/BookCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { FiTrendingUp, FiUsers, FiBook } from 'react-icons/fi';

const GENRES = ['Fiction', 'Non-Fiction', 'Mystery', 'Science Fiction', 'Fantasy', 'Romance', 'Thriller', 'Biography', 'History', 'Self-Help'];

export default function HomePage() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeGenre, setActiveGenre] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 12 };
        if (activeGenre) params.genre = activeGenre;
        const { data } = await api.get('/books', { params });
        setBooks(data.books);
        setTotalPages(data.pages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [activeGenre, page]);

  useEffect(() => {
    if (!user) return;
    api.get('/books/feed').then(({ data }) => setFeed(data.books)).catch(() => {});
  }, [user]);

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Discover Your Next <span className="accent">Great Read</span></h1>
          <p>Join a community of book lovers. Share recommendations, rate books, and connect with readers.</p>
          <div className="hero-actions">
            <Link to="/search" className="btn-primary">Search Books</Link>
            {!user && <Link to="/register" className="btn-outline">Join Now</Link>}
            {user && <Link to="/add-book" className="btn-outline">Add a Book</Link>}
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat"><FiBook size={28}/><span>Share Books</span></div>
          <div className="stat"><FiTrendingUp size={28}/><span>Rate & Review</span></div>
          <div className="stat"><FiUsers size={28}/><span>Follow Readers</span></div>
        </div>
      </section>

      {user && feed.length > 0 && (
        <section className="section">
          <h2 className="section-title">Your Feed</h2>
          <div className="books-grid">
            {feed.slice(0, 4).map((b) => <BookCard key={b._id} book={b} />)}
          </div>
        </section>
      )}

      <section className="section">
        <h2 className="section-title">Browse Books</h2>
        <div className="genre-filters">
          <button className={`genre-btn ${!activeGenre ? 'active' : ''}`} onClick={() => { setActiveGenre(''); setPage(1); }}>All</button>
          {GENRES.map((g) => (
            <button key={g} className={`genre-btn ${activeGenre === g ? 'active' : ''}`} onClick={() => { setActiveGenre(g); setPage(1); }}>{g}</button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : books.length === 0 ? (
          <div className="empty-state">
            <FiBook size={48} />
            <p>No books found. <Link to="/add-book">Add the first one!</Link></p>
          </div>
        ) : (
          <>
            <div className="books-grid">
              {books.map((b) => <BookCard key={b._id} book={b} />)}
            </div>
            {totalPages > 1 && (
              <div className="pagination">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-outline-sm">Previous</button>
                <span>{page} / {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="btn-outline-sm">Next</button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
