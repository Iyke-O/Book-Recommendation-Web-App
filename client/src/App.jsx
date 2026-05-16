import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SearchPage from './pages/SearchPage';
import BookDetailPage from './pages/BookDetailPage';
import AddBookPage from './pages/AddBookPage';
import ProfilePage from './pages/ProfilePage';
import LoadingSpinner from './components/LoadingSpinner';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { loading } = useAuth();
  if (loading) return <div className="full-screen-center"><LoadingSpinner /></div>;

  return (
    <>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/books/:id" element={<BookDetailPage />} />
          <Route path="/add-book" element={<ProtectedRoute><AddBookPage /></ProtectedRoute>} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { background: '#1e293b', color: '#f1f5f9' } }} />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
