import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import BookCard from '../components/BookCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiUser, FiBook, FiUsers, FiEdit2, FiCheck, FiX } from 'react-icons/fi';

const GENRES = ['Fiction', 'Non-Fiction', 'Mystery', 'Science Fiction', 'Fantasy', 'Romance', 'Thriller', 'Biography', 'History', 'Self-Help'];

export default function ProfilePage() {
  const { id } = useParams();
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ bio: '', favoriteGenres: [], avatar: '' });
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  const isOwnProfile = user?._id === id;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const [profileRes, booksRes] = await Promise.all([
          api.get(`/users/${id}`),
          api.get(`/users/${id}/books`),
        ]);
        setProfile(profileRes.data);
        setBooks(booksRes.data);
        setFollowersCount(profileRes.data.followers?.length || 0);
        setFollowing(user ? profileRes.data.followers?.some((f) => f._id === user._id) : false);
        setEditForm({ bio: profileRes.data.bio || '', favoriteGenres: profileRes.data.favoriteGenres || [], avatar: profileRes.data.avatar || '' });
      } catch { toast.error('Failed to load profile'); } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, user]);

  const handleFollowToggle = async () => {
    if (!user) { toast.error('Please login'); return; }
    try {
      const { data } = await api.put(`/users/${id}/follow`);
      setFollowing(data.following);
      setFollowersCount(data.followersCount);
    } catch { toast.error('Failed to update follow'); }
  };

  const handleSaveProfile = async () => {
    try {
      const { data } = await api.put('/auth/me', editForm);
      setProfile((p) => ({ ...p, ...data }));
      updateUser(data);
      setEditing(false);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
  };

  if (loading) return <LoadingSpinner />;
  if (!profile) return <div className="container"><p>Profile not found.</p></div>;

  return (
    <div className="container profile-page">
      <div className="profile-header">
        <div className="avatar-wrapper">
          {profile.avatar ? (
            <img src={profile.avatar} alt={profile.username} className="avatar-lg" onError={(e) => { e.target.style.display = 'none'; }} />
          ) : (
            <div className="avatar-placeholder"><FiUser size={40} /></div>
          )}
        </div>
        <div className="profile-info">
          <h1>{profile.username}</h1>
          {!editing ? (
            <>
              <p className="bio">{profile.bio || 'No bio yet.'}</p>
              {profile.favoriteGenres?.length > 0 && (
                <div className="genre-tags">
                  {profile.favoriteGenres.map((g) => <span key={g} className="genre-tag">{g}</span>)}
                </div>
              )}
            </>
          ) : (
            <div className="edit-form">
              <input type="url" value={editForm.avatar} onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })} placeholder="Avatar URL" className="edit-input" />
              <textarea value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} placeholder="Tell us about yourself..." rows={2} className="edit-input" maxLength={300} />
              <div className="genre-chips">
                {GENRES.map((g) => (
                  <button key={g} type="button" className={`genre-chip ${editForm.favoriteGenres.includes(g) ? 'selected' : ''}`}
                    onClick={() => setEditForm((f) => ({ ...f, favoriteGenres: f.favoriteGenres.includes(g) ? f.favoriteGenres.filter((x) => x !== g) : [...f.favoriteGenres, g] }))}>
                    {g}
                  </button>
                ))}
              </div>
              <div className="edit-actions">
                <button className="btn-primary-sm" onClick={handleSaveProfile}><FiCheck /> Save</button>
                <button className="btn-outline-sm" onClick={() => setEditing(false)}><FiX /> Cancel</button>
              </div>
            </div>
          )}
          <div className="profile-stats">
            <span><FiBook /> {books.length} Books</span>
            <span><FiUsers /> {followersCount} Followers</span>
            <span><FiUsers /> {profile.following?.length || 0} Following</span>
          </div>
        </div>
        <div className="profile-actions">
          {isOwnProfile ? (
            <button className="btn-outline" onClick={() => setEditing(!editing)}><FiEdit2 /> Edit Profile</button>
          ) : user ? (
            <button className={following ? 'btn-outline' : 'btn-primary'} onClick={handleFollowToggle}>
              {following ? 'Unfollow' : 'Follow'}
            </button>
          ) : null}
        </div>
      </div>

      <section className="section">
        <h2 className="section-title">{isOwnProfile ? 'My' : `${profile.username}'s`} Books ({books.length})</h2>
        {books.length === 0 ? (
          <div className="empty-state">
            <FiBook size={40} />
            <p>{isOwnProfile ? <><Link to="/add-book">Add your first book recommendation!</Link></> : 'No books added yet.'}</p>
          </div>
        ) : (
          <div className="books-grid">{books.map((b) => <BookCard key={b._id} book={b} />)}</div>
        )}
      </section>
    </div>
  );
}
