import React, { useState } from 'react';
import { booksAPI } from '../services/api';
import ImageUpload  from './ImageUpload';

const CURRENT_YEAR = new Date().getFullYear();

function AddBook({ onDone, onCancel }) {
  const [form, setForm]       = useState({ title: '', author: '', published_year: '' });
  const [image, setImage]     = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSub]  = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (file) => {
    setImage(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim())  return setError('Title is required.');
    if (!form.author.trim()) return setError('Author is required.');
    const year = parseInt(form.published_year);
    if (!year || year < 1000 || year > CURRENT_YEAR + 5)
      return setError(`Year must be between 1000 and ${CURRENT_YEAR + 5}.`);

    const formData = new FormData();
    formData.append('title', form.title.trim());
    formData.append('author', form.author.trim());
    formData.append('published_year', year);
    if (image) formData.append('cover_image', image);

    setSub(true);
    try {
      await booksAPI.create(formData);
      setSuccess(`"${form.title}" added to your library!`);
      setTimeout(onDone, 1300);
    } catch (err) {
      setError(err.message);
      setSub(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <div className="page-eyebrow">New Entry</div>
        <h1 className="page-title">Add a <em>Book</em></h1>
        <p className="page-subtitle">Fill in the details to add a book to your collection.</p>
      </div>

      <div className="form-layout">

        {/* ── Form panel ── */}
        <div className="form-panel">
          <div className="form-section-title">Book Details</div>

          {error   && <div className="alert alert-error">⚠️ {error}</div>}
          {success && <div className="alert alert-success">✅ {success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="title">Book Title *</label>
              <input
                id="title" name="title"
                className="form-input"
                placeholder="e.g. The Great Gatsby"
                value={form.title}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="author">Author *</label>
              <input
                id="author" name="author"
                className="form-input"
                placeholder="e.g. F. Scott Fitzgerald"
                value={form.author}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="published_year">Published Year *</label>
              <input
                id="published_year" name="published_year"
                type="number"
                className="form-input"
                placeholder={String(CURRENT_YEAR)}
                value={form.published_year}
                onChange={handleChange}
                min="1000" max={CURRENT_YEAR + 5}
                disabled={submitting}
              />
            </div>

            <div className="divider" />

            <div className="form-section-title" style={{ marginTop: '1.5rem' }}>
              Cover Image
            </div>

            <div className="form-group">
              <ImageUpload value={image} onChange={handleImageChange} />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
              <button
                type="submit"
                className="btn btn-gold"
                disabled={submitting}
                style={{ flex: 1 }}
              >
                {submitting
                  ? <><span className="spinner" /> Adding…</>
                  : '+ Add to Library'}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={onCancel}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* ── Live preview panel ── */}
        <div className="preview-panel">
          <div className="preview-title">Live Preview</div>

          <div className="preview-cover">
            {preview ? (
              <img src={preview} alt="Cover preview" />
            ) : (
              <div className="preview-cover-placeholder">
                <span>📖</span>
                <span>No Cover</span>
              </div>
            )}
          </div>

          <div className="preview-book-title">
            {form.title || <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>Book Title</span>}
          </div>
          <div className="preview-book-author">
            {form.author || <span style={{ color: 'var(--text-dim)' }}>Author Name</span>}
          </div>
          <div className="preview-book-year">
            {form.published_year || <span style={{ color: 'var(--text-dim)' }}>Year</span>}
          </div>
        </div>

      </div>
    </div>
  );
}

export default AddBook;
