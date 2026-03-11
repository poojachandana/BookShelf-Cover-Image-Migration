const db   = require('../db');
const path = require('path');
const fs   = require('fs');

// ── Delete image file helper ──────────────────────────────────
const deleteImageFile = (coverImage) => {
  try {
    if (!coverImage) return;
    if (coverImage.startsWith('/images/')) return;
    if (coverImage.startsWith('http')) return;
    const filename = path.basename(coverImage);
    const filePath = path.join(__dirname, '..', 'uploads', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('Deleted file:', filename);
    }
  } catch (err) {
    console.error('Error deleting file:', err.message);
  }
};

// ── Build image URL helper ────────────────────────────────────
const buildImageUrl = (req, filename) => {
  if (!filename) return null;
  if (filename === 'null') return null;
  if (filename.startsWith('/images/')) return null;
  return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
};

// ── GET all books ─────────────────────────────────────────────
exports.getAllBooks = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM books ORDER BY created_at DESC');
    const books = rows.map(b => ({
      ...b,
      cover_image_url: buildImageUrl(req, b.cover_image),
    }));
    res.json({ success: true, count: books.length, data: books });
  } catch (err) {
    console.error('getAllBooks error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET single book ───────────────────────────────────────────
exports.getBookById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    const book = { ...rows[0], cover_image_url: buildImageUrl(req, rows[0].cover_image) };
    res.json({ success: true, data: book });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── CREATE book ───────────────────────────────────────────────
exports.createBook = async (req, res) => {
  try {
    console.log('=== CREATE BOOK ===');
    console.log('Body:', req.body);
    console.log('File:', req.file ? req.file.filename : 'none');

    const title          = req.body.title;
    const author         = req.body.author;
    const published_year = req.body.published_year;

    if (!title || title.trim() === '') {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }
    if (!author || author.trim() === '') {
      return res.status(400).json({ success: false, message: 'Author is required' });
    }
    if (!published_year) {
      return res.status(400).json({ success: false, message: 'Published year is required' });
    }

    const year = parseInt(published_year);
    if (isNaN(year)) {
      return res.status(400).json({ success: false, message: 'Year must be a number' });
    }

    const coverImage = req.file ? req.file.filename : null;

    const [result] = await db.query(
      'INSERT INTO books (title, author, published_year, cover_image) VALUES (?, ?, ?, ?)',
      [title.trim(), author.trim(), year, coverImage]
    );

    const [rows] = await db.query('SELECT * FROM books WHERE id = ?', [result.insertId]);
    const book = { ...rows[0], cover_image_url: buildImageUrl(req, rows[0].cover_image) };

    console.log('Book created:', book.title);
    res.status(201).json({ success: true, message: 'Book created successfully', data: book });

  } catch (err) {
    if (req.file) deleteImageFile(req.file.filename);
    console.error('createBook error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── UPDATE book ───────────────────────────────────────────────
exports.updateBook = async (req, res) => {
  const { title, author, published_year, remove_image } = req.body;
  const { id } = req.params;

  try {
    const [existing] = await db.query('SELECT * FROM books WHERE id = ?', [id]);
    if (!existing.length) {
      if (req.file) deleteImageFile(req.file.filename);
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const oldBook     = existing[0];
    const newTitle    = title          ? title.trim()             : oldBook.title;
    const newAuthor   = author         ? author.trim()            : oldBook.author;
    const newYear     = published_year ? parseInt(published_year) : oldBook.published_year;
    let newCoverImage = oldBook.cover_image;

    if (req.file) {
      deleteImageFile(oldBook.cover_image);
      newCoverImage = req.file.filename;
    } else if (remove_image === 'true') {
      deleteImageFile(oldBook.cover_image);
      newCoverImage = null;
    }

    await db.query(
      'UPDATE books SET title = ?, author = ?, published_year = ?, cover_image = ? WHERE id = ?',
      [newTitle, newAuthor, newYear, newCoverImage, id]
    );

    const [updated] = await db.query('SELECT * FROM books WHERE id = ?', [id]);
    const book = { ...updated[0], cover_image_url: buildImageUrl(req, updated[0].cover_image) };
    res.json({ success: true, message: 'Book updated successfully', data: book });

  } catch (err) {
    if (req.file) deleteImageFile(req.file.filename);
    console.error('updateBook error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE book ───────────────────────────────────────────────
exports.deleteBook = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const book = rows[0];
    await db.query('DELETE FROM books WHERE id = ?', [req.params.id]);
    deleteImageFile(book.cover_image);

    res.json({ success: true, message: 'Book deleted successfully' });
  } catch (err) {
    console.error('deleteBook error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};