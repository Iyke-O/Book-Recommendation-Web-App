import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiBook } from 'react-icons/fi';

const GENRES = ['Fiction', 'Non-Fiction', 'Mystery', 'Science Fiction', 'Fantasy', 'Romance', 'Thriller', 'Biography', 'History', 'Self-Help'];

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const toggleGenre = (g) => setSelectedGenres((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      toast.success('Account created! Welcome to BookHaven!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <FiBook size={40} className="auth-logo" />
          <h1>Join BookHaven</h1>
          <p>Create your account and start sharing books</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Username</label>
            <div className="input-with-icon">
              <FiUser />
              <input type="text" placeholder="booklover42" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required minLength={3} />
            </div>
          </div>
          <div className="form-group">
            <label>Email</label>
            <div className="input-with-icon">
              <FiMail />
              <input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <FiLock />
              <input type="password" placeholder="Min 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
            </div>
          </div>
          <div className="form-group">
            <label>Favorite Genres (optional)</label>
            <div className="genre-chips">
              {GENRES.map((g) => (
                <button key={g} type="button" className={`genre-chip ${selectedGenres.includes(g) ? 'selected' : ''}`} onClick={() => toggleGenre(g)}>{g}</button>
              ))}
            </div>
          </div>
          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
