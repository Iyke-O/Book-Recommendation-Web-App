import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import StarRating from '../components/StarRating';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiHeart, FiTrash2, FiArrowLeft, FiMessageSquare, FiStar } from 'react-icons/fi';

const PLACEHOLDER = 'https://via.placeholder.com/200x300?text=No+Cover';

export default function BookDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
  const [commentText, setCommentText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookRes, commentsRes] = await Promise.all([
          api.get(`/books/${id}`),
          api.get(`/books/${id}/comments`),
        ]);
        setBook(bookRes.data);
        setComments(commentsRes.data);
      } catch {
        toast.error('Book not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleLike = async () => {
    if (!user) { toast.error('Please login'); return; }
    try {
      const { data } = await api.put(`/books/${id}/like`);
      setBook((b) => ({ ...b, likes: data.liked ? [...(b.likes || []), user._id] : (b.likes || []).filter((l) => l !== user._id) }));
    } catch { toast.error('Failed to update like'); }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.rating) { toast.error('Please select a rating'); return; }
    if (!reviewForm.comment.trim()) { toast.error('Please write a review'); return; }
    setSubmittingReview(true);
    try {
      const { data } = await api.post(`/books/${id}/reviews`, reviewForm);
      setBook(data);
      setReviewForm({ rating: 0, comment: '' });
      toast.success('Review added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      const { data } = await api.delete(`/books/${id}/reviews/${reviewId}`);
      setBook(data);
      toast.success('Review deleted');
    } catch { toast.error('Failed to delete review'); }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const { data } = await api.post(`/books/${id}/comments`, { text: commentText });
      setComments((prev) => [data, ...prev]);
      setCommentText('');
      toast.success('Comment added!');
    } catch { toast.error('Failed to add comment'); } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/books/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success('Comment deleted');
    } catch { toast.error('Failed to delete comment'); }
  };

  if (loading) return <LoadingSpinner />;
  if (!book) return null;

  const isLiked = user && book.likes?.includes(user._id);
  const userReview = book.reviews?.find((r) => r.user?._id === user?._id);
  const isOwner = user && book.addedBy?._id === user._id;

  return (
    <div className="container book-detail-page">
      <button className="back-btn" onClick={() => navigate(-1)}><FiArrowLeft /> Back</button>

      <div className="book-detail-hero">
        <div className="book-cover-lg-wrapper">
          <img src={book.coverImage || PLACEHOLDER} alt={book.title} className="book-cover-lg" onError={(e) => { e.target.src = PLACEHOLDER; }} />
        </div>
        <div className="book-detail-info">
          <h1>{book.title}</h1>
          <p className="detail-author">by <strong>{book.author}</strong></p>
          {book.genre?.length > 0 && (
            <div className="genre-tags">
              {book.genre.map((g) => <span key={g} className="genre-tag">{g}</span>)}
            </div>
          )}
          <div className="rating-display">
            <FiStar fill="#f59e0b" color="#f59e0b" />
            <span className="avg-rating">{book.averageRating > 0 ? book.averageRating.toFixed(1) : 'No ratings yet'}</span>
            {book.totalRatings > 0 && <span className="rating-count">({book.totalRatings} rating{book.totalRatings !== 1 ? 's' : ''})</span>}
          </div>
          <div className="book-meta-list">
            {book.publishedYear && <span>Year: {book.publishedYear}</span>}
            {book.pageCount && <span>Pages: {book.pageCount}</span>}
            {book.isbn && <span>ISBN: {book.isbn}</span>}
          </div>
          <p className="detail-description">{book.description || 'No description available.'}</p>
          <div className="detail-actions">
            <button className={`btn-like ${isLiked ? 'liked' : ''}`} onClick={handleLike}>
              <FiHeart fill={isLiked ? 'currentColor' : 'none'} />
              {book.likes?.length || 0} {isLiked ? 'Liked' : 'Like'}
            </button>
            {book.addedBy && (
              <Link to={`/profile/${book.addedBy._id}`} className="added-by-link">
                Added by {book.addedBy.username}
              </Link>
            )}
            {isOwner && (
              <button className="btn-danger-sm" onClick={async () => {
                if (window.confirm('Delete this book?')) {
                  await api.delete(`/books/${id}`);
                  toast.success('Book deleted');
                  navigate('/');
                }
              }}>Delete</button>
            )}
          </div>
        </div>
      </div>

      <div className="book-detail-body">
        <section className="reviews-section">
          <h2>Reviews ({book.reviews?.length || 0})</h2>
          {user && !userReview && (
            <form onSubmit={handleAddReview} className="review-form">
              <h3>Write a Review</h3>
              <StarRating value={reviewForm.rating} onChange={(r) => setReviewForm({ ...reviewForm, rating: r })} />
              <textarea
                placeholder="Share your thoughts about this book..."
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                rows={3}
                required
              />
              <button type="submit" className="btn-primary" disabled={submittingReview}>
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}
          {userReview && <p className="already-reviewed">You have already reviewed this book.</p>}
          {!user && <p className="login-prompt"><Link to="/login">Login</Link> to write a review.</p>}

          <div className="reviews-list">
            {book.reviews?.map((r) => (
              <div key={r._id} className="review-item">
                <div className="review-header">
                  <Link to={`/profile/${r.user?._id}`} className="reviewer-name">{r.user?.username}</Link>
                  <StarRating value={r.rating} readonly />
                  {user && r.user?._id === user._id && (
                    <button className="btn-icon danger" onClick={() => handleDeleteReview(r._id)}><FiTrash2 size={14}/></button>
                  )}
                </div>
                <p className="review-comment">{r.comment}</p>
                <span className="review-date">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="comments-section">
          <h2><FiMessageSquare /> Discussion ({comments.length})</h2>
          {user ? (
            <form onSubmit={handleAddComment} className="comment-form">
              <textarea
                placeholder="Join the discussion..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={2}
              />
              <button type="submit" className="btn-primary" disabled={submittingComment || !commentText.trim()}>
                {submittingComment ? 'Posting...' : 'Post Comment'}
              </button>
            </form>
          ) : (
            <p className="login-prompt"><Link to="/login">Login</Link> to join the discussion.</p>
          )}
          <div className="comments-list">
            {comments.map((c) => (
              <div key={c._id} className="comment-item">
                <div className="comment-header">
                  <Link to={`/profile/${c.user?._id}`} className="commenter-name">{c.user?.username}</Link>
                  <span className="comment-date">{new Date(c.createdAt).toLocaleDateString()}</span>
                  {user && c.user?._id === user._id && (
                    <button className="btn-icon danger" onClick={() => handleDeleteComment(c._id)}><FiTrash2 size={14}/></button>
                  )}
                </div>
                <p className="comment-text">{c.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
