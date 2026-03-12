import React, { useEffect, useState } from 'react';
import { booksAPI } from '../services/api';

const hasRealCover = (book) => {
  const img = book.cover_image;
  if (!img || img === 'null') return false;
  if (img.includes('default-book.png')) return false;
  if (img.startsWith('/images/')) return false;
  return true;
};

function BookList({ onEdit, onAdd }) {
  const [books, setBooks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch]     = useState('');

  useEffect(() => { fetchBooks(); }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await booksAPI.getAll();
      setBooks(res.data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, book) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${book.title}"?`)) return;
    setDeleting(book.id);
    try {
      await booksAPI.delete(book.id);
      setBooks(prev => prev.filter(b => b.id !== book.id));
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    } finally {
      setDeleting(null);
    }
  };

  const filtered = books.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase())
  );

  const customCoverCount = books.filter(b => hasRealCover(b)).length;

  if (loading) return (
    <div className="loading-screen">
      <div className="loading-spinner-lg" />
      <p className="loading-text">Loading your library…</p>
    </div>
  );

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div className="page-eyebrow">Collection</div>
        <h1 className="page-title">Your <em>Library</em></h1>
        <p className="page-subtitle">
          {books.length > 0
            ? `${books.length} books in your collection`
            : 'Start building your personal library'}
        </p>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{books.length}</div>
          <div className="stat-label">Total Books</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{customCoverCount}</div>
          <div className="stat-label">With Cover</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {books.length > 0
              ? Math.min(...books.map(b => b.published_year))
              : '—'}
          </div>
          <div className="stat-label">Oldest Year</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {books.length > 0
              ? Math.max(...books.map(b => b.published_year))
              : '—'}
          </div>
          <div className="stat-label">Newest Year</div>
        </div>
      </div>

      {/* Search */}
      <div className="search-wrap">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search titles or authors…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-error">
          ⚠️ {error} — Make sure your backend is running on port 5000.
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && !loading ? (
        <div className="empty-state">
          <div className="empty-illustration">
            {search ? '🔍' : '📭'}
          </div>
          <h3 className="empty-title">
            {search ? 'No results found' : 'Your library awaits'}
          </h3>
          <p className="empty-sub">
            {search
              ? `No books match "${search}"`
              : 'Add your first book to begin your collection'}
          </p>
          {!search && (
            <button className="btn btn-gold" onClick={onAdd}>
              + Add First Book
            </button>
          )}
        </div>
      ) : (
        <>
          {search && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '1.5rem' }}>
              {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"
            </p>
          )}
          <div className="books-grid">
            {filtered.map((book, index) => (
              <BookCard
                key={book.id}
                book={book}
                index={index}
                onEdit={onEdit}
                onDelete={handleDelete}
                deleting={deleting === book.id}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function BookCard({ book, index, onEdit, onDelete, deleting }) {
  const [imgErr, setImgErr] = useState(false);
  const coverUrl = book.cover_image;

  return (
    <div className="book-card" style={{ animationDelay: `${index * 0.06}s` }}>

      {/* Cover */}
      <div className="book-cover-wrap">
        {coverUrl ? (
          <>
            <img
              src={coverUrl}
              alt={book.title}
              onError={() => setImgErr(true)}
            />
            <div className="cover-overlay" />
          </>
        ) : (
          <div className="book-cover-placeholder">
            <div className="placeholder-icon">📖</div>
            <span className="placeholder-text">No Cover</span>
          </div>
        )}

        {/* Hover action buttons */}
        <div className="cover-actions">
          <button
            className="cover-btn cover-btn-edit"
            onClick={(e) => { e.stopPropagation(); onEdit(book); }}
          >
            ✏️ Edit
          </button>
          <button
            className="cover-btn cover-btn-delete"
            onClick={(e) => onDelete(e, book)}
            disabled={deleting}
          >
            {deleting
              ? <span className="spinner" style={{ width: 12, height: 12 }} />
              : '🗑️'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="book-info">
        <div className="book-number">#{String(book.id).padStart(3, '0')}</div>
        <div className="book-title">{book.title}</div>
        <div className="book-author">{book.author}</div>
        <div className="book-year">{book.published_year}</div>
      </div>
    </div>
  );
}

export default BookList;
