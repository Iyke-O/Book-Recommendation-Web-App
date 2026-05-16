import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FiBook } from 'react-icons/fi';

const GENRES = ['Fiction', 'Non-Fiction', 'Mystery', 'Science Fiction', 'Fantasy', 'Romance', 'Thriller', 'Biography', 'History', 'Self-Help'];

const INITIAL = { title: '', author: '', description: '', coverImage: '', isbn: '', publishedYear: '', pageCount: '', genre: [] };

export default function AddBookPage() {
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const toggleGenre = (g) =>
    setForm((f) => ({ ...f, genre: f.genre.includes(g) ? f.genre.filter((x) => x !== g) : [...f.genre, g] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.author.trim()) {
      toast.error('Title and author are required');
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form };
      if (payload.publishedYear) payload.publishedYear = Number(payload.publishedYear);
      if (payload.pageCount) payload.pageCount = Number(payload.pageCount);
      const { data } = await api.post('/books', payload);
      toast.success('Book added successfully!');
      navigate(`/books/${data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container add-book-page">
      <div className="form-card">
        <div className="form-card-header">
          <FiBook size={28} />
          <h1>Add a Book Recommendation</h1>
        </div>
        <form onSubmit={handleSubmit} className="book-form">
          <div className="form-row">
            <div className="form-group">
              <label>Title *</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Book title" required />
            </div>
            <div className="form-group">
              <label>Author *</label>
              <input type="text" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="Author name" required />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What is this book about?" rows={4} />
          </div>
          <div className="form-group">
            <label>Cover Image URL</label>
            <input type="url" value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} placeholder="https://..." />
            {form.coverImage && (
              <img src={form.coverImage} alt="preview" className="cover-preview" onError={(e) => { e.target.style.display = 'none'; }} />
            )}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>ISBN</label>
              <input type="text" value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} placeholder="978-..." />
            </div>
            <div className="form-group">
              <label>Published Year</label>
              <input type="number" value={form.publishedYear} onChange={(e) => setForm({ ...form, publishedYear: e.target.value })} placeholder="2024" min="1000" max="2030" />
            </div>
            <div className="form-group">
              <label>Page Count</label>
              <input type="number" value={form.pageCount} onChange={(e) => setForm({ ...form, pageCount: e.target.value })} placeholder="350" min="1" />
            </div>
          </div>
          <div className="form-group">
            <label>Genres</label>
            <div className="genre-chips">
              {GENRES.map((g) => (
                <button key={g} type="button" className={`genre-chip ${form.genre.includes(g) ? 'selected' : ''}`} onClick={() => toggleGenre(g)}>{g}</button>
              ))}
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-outline" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Adding...' : 'Add Book'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
