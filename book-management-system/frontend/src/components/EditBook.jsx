import React, { useState } from 'react';
import { booksAPI } from '../services/api';
import ImageUpload  from './ImageUpload';

const CURRENT_YEAR = new Date().getFullYear();

const hasRealCover = (book) => {
  const img = book.cover_image;
  if (!img || img === 'null') return false;
  if (img.includes('default-book.png')) return false;
  if (img.startsWith('/images/')) return false;
  return true;
};

function EditBook({ book, onDone, onCancel }) {
  const [form, setForm] = useState({
    title:          book.title,
    author:         book.author,
    published_year: book.published_year,
  });

  const [image, setImage]               = useState(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [previewUrl, setPreviewUrl]     = useState(null);
  const [submitting, setSub]            = useState(false);
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState('');

  const existingCoverUrl = hasRealCover(book)
    ? `http://localhost:5000/uploads/${book.cover_image}`
    : null;

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (file) => {
    if (file) {
      setImage(file);
      setImageRemoved(false);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setImage(null);
      setImageRemoved(true);
      setPreviewUrl(null);
    }
  };

  // Current display URL for the live preview
  const livePreview = previewUrl
    || (!imageRemoved ? existingCoverUrl : null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim())  return setError('Title is required.');
    if (!form.author.trim()) return setError('Author is required.');
    const year = parseInt(form.published_year);
    if (!year || year < 1000 || year > CURRENT_YEAR + 5)
      return setError(`Year must be between 1000 and ${CURRENT_YEAR + 5}.`);

    const formData = new FormData();
    formData.append('title',          form.title.trim());
    formData.append('author',         form.author.trim());
    formData.append('published_year', year);
    if (image) {
      formData.append('cover_image', image);
    } else if (imageRemoved) {
      formData.append('remove_image', 'true');
    }

    setSub(true);
    try {
      await booksAPI.update(book.id, formData);
      setSuccess('Changes saved!');
      setTimeout(onDone, 1100);
    } catch (err) {
      setError(err.message);
      setSub(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <div className="page-eyebrow">Editing</div>
        <h1 className="page-title"><em>{book.title}</em></h1>
        <p className="page-subtitle">Update the details for this book.</p>
      </div>

      <div className="form-layout">

        {/* ── Form panel ── */}
        <div className="form-panel">
          <div className="form-section-title">Book Details</div>

          {error   && <div className="alert alert-error">⚠️ {error}</div>}
          {success && <div className="alert alert-success">✅ {success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="edit-title">Book Title *</label>
              <input
                id="edit-title" name="title"
                className="form-input"
                value={form.title}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-author">Author *</label>
              <input
                id="edit-author" name="author"
                className="form-input"
                value={form.author}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-year">Published Year *</label>
              <input
                id="edit-year" name="published_year"
                type="number"
                className="form-input"
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
              <ImageUpload
                value={image}
                onChange={handleImageChange}
                existingUrl={imageRemoved ? null : existingCoverUrl}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
              <button
                type="submit"
                className="btn btn-gold"
                disabled={submitting}
                style={{ flex: 1 }}
              >
                {submitting
                  ? <><span className="spinner" /> Saving…</>
                  : '💾 Save Changes'}
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

        {/* ── Live preview ── */}
        <div className="preview-panel">
          <div className="preview-title">Live Preview</div>

          <div className="preview-cover">
            {livePreview ? (
              <img
                src={livePreview}
                alt="Cover preview"
                onError={() => setImageRemoved(true)}
              />
            ) : (
              <div className="preview-cover-placeholder">
                <span>📖</span>
                <span>No Cover</span>
              </div>
            )}
          </div>

          <div className="preview-book-title">{form.title || '—'}</div>
          <div className="preview-book-author">{form.author || '—'}</div>
          <div className="preview-book-year">{form.published_year || '—'}</div>
        </div>

      </div>
    </div>
  );
}

export default EditBook;
