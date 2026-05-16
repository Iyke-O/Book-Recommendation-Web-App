import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiBook, FiSearch, FiUser, FiLogOut, FiPlusCircle, FiHome } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <FiBook size={24} />
        <span>BookHaven</span>
      </Link>
      <div className="navbar-links">
        <Link to="/" title="Home"><FiHome /></Link>
        <Link to="/search" title="Search"><FiSearch /></Link>
        {user ? (
          <>
            <Link to="/add-book" title="Add Book"><FiPlusCircle /></Link>
            <Link to={`/profile/${user._id}`} title="Profile"><FiUser /></Link>
            <button onClick={handleLogout} className="btn-icon" title="Logout"><FiLogOut /></button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-outline-sm">Login</Link>
            <Link to="/register" className="btn-primary-sm">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
