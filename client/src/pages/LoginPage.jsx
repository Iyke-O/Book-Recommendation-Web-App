import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiBook } from 'react-icons/fi';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <FiBook size={40} className="auth-logo" />
          <h1>Welcome Back</h1>
          <p>Sign in to your BookHaven account</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
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
              <input type="password" placeholder="••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
          </div>
          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="auth-switch">Don't have an account? <Link to="/register">Sign up</Link></p>
      </div>
    </div>
  );
}
