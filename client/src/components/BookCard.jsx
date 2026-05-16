import { Link } from 'react-router-dom';
import { FiHeart, FiStar } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useState } from 'react';
import toast from 'react-hot-toast';

const PLACEHOLDER = 'https://via.placeholder.com/128x192?text=No+Cover';

export default function BookCard({ book, onUpdate }) {
  const { user } = useAuth();
  const [likeCount, setLikeCount] = useState(book.likes?.length || 0);
  const [liked, setLiked] = useState(user ? book.likes?.includes(user._id) : false);

  const handleLike = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to like books'); return; }
    try {
      const { data } = await api.put(`/books/${book._id}/like`);
      setLikeCount(data.likes);
      setLiked(data.liked);
      onUpdate?.();
    } catch {
      toast.error('Failed to update like');
    }
  };

  return (
    <Link to={`/books/${book._id}`} className="book-card">
      <div className="book-cover-wrapper">
        <img
          src={book.coverImage || PLACEHOLDER}
          alt={book.title}
          className="book-cover"
          onError={(e) => { e.target.src = PLACEHOLDER; }}
        />
        <button className={`like-btn ${liked ? 'liked' : ''}`} onClick={handleLike}>
          <FiHeart fill={liked ? 'currentColor' : 'none'} />
          <span>{likeCount}</span>
        </button>
      </div>
      <div className="book-info">
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">by {book.author}</p>
        <div className="book-meta">
          <span className="rating">
            <FiStar fill="#f59e0b" color="#f59e0b" size={13} />
            {book.averageRating > 0 ? book.averageRating.toFixed(1) : 'N/A'}
          </span>
          {book.genre?.[0] && <span className="genre-tag">{book.genre[0]}</span>}
        </div>
        {book.addedBy && (
          <p className="added-by">Added by {book.addedBy.username}</p>
        )}
      </div>
    </Link>
  );
}
