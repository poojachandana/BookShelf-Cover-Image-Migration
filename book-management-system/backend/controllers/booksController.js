const db = require('../db');

// Build image URL - Cloudinary returns full https URL

const buildImageUrl = (cover_image) => {
  if (!cover_image) return null;
  if (cover_image === 'null') return null;
  if (cover_image.startsWith('/images/')) return null;
  // Already full URL
  if (cover_image.startsWith('http')) return cover_image;
  // Cloudinary partial path like "book-covers/imageid"
  if (cover_image.startsWith('book-covers/')) {
    return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${cover_image}`;
  }
  return null;
};

// Delete image from Cloudinary
const deleteCloudinaryImage = async (cover_image) => {
  if (!cover_image) return;
  if (!cover_image.startsWith('http')) return;
  try {
    const cloudinary = require('cloudinary').v2;
    // Extract public_id from URL
    // URL format: https://res.cloudinary.com/cloud/image/upload/v123/book-covers/filename.jpg
    const parts = cover_image.split('/');
    const filename = parts[parts.length - 1].split('.')[0];
    const folder = parts[parts.length - 2];
    const public_id = `${folder}/${filename}`;
    await cloudinary.uploader.destroy(public_id);
    console.log('Deleted from Cloudinary:', public_id);
  } catch (err) {
    console.error('Cloudinary delete error:', err.message);
  }
};

// GET all books
const getAllBooks = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, title, author, published_year, cover_image, created_at, updated_at FROM books ORDER BY created_at DESC'
    );
    const books = rows.map(book => ({
      ...book,
      cover_image_url: buildImageUrl(book.cover_image),
    }));
    res.json({ success: true, data: books, count: books.length });
  } catch (err) {
    console.error('getAllBooks error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch books' });
  }
};

// GET single book
const getBookById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    const book = rows[0];
    book.cover_image_url = buildImageUrl(book.cover_image);
    res.json({ success: true, data: book });
  } catch (err) {
    console.error('getBookById error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch book' });
  }
};

// POST create book
const createBook = async (req, res) => {
  try {
    console.log('createBook body:', req.body);
    console.log('createBook file:', req.file);

    const { title, author, published_year } = req.body;

    if (!title || !author || !published_year) {
      return res.status(400).json({
        success: false,
        message: 'Title, author, and published year are required',
      });
    }

    const year = parseInt(published_year);
    if (isNaN(year) || year < 1000 || year > new Date().getFullYear() + 1) {
      return res.status(400).json({ success: false, message: 'Invalid published year' });
    }

    // Cloudinary stores full URL in req.file.path
    const cover_image = req.file ? req.file.path : null;

    const [result] = await db.query(
      'INSERT INTO books (title, author, published_year, cover_image) VALUES (?, ?, ?, ?)',
      [title.trim(), author.trim(), year, cover_image]
    );

    const [newBook] = await db.query('SELECT * FROM books WHERE id = ?', [result.insertId]);
    const book = newBook[0];
    book.cover_image_url = buildImageUrl(book.cover_image);

    res.status(201).json({ success: true, data: book, message: 'Book created successfully' });
  } catch (err) {
    console.error('createBook error:', err);
    res.status(500).json({ success: false, message: 'Failed to create book' });
  }
};

// PUT update book
const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('updateBook body:', req.body);
    console.log('updateBook file:', req.file);

    const [existing] = await db.query('SELECT * FROM books WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const { title, author, published_year, remove_image } = req.body;

    if (!title || !author || !published_year) {
      return res.status(400).json({
        success: false,
        message: 'Title, author, and published year are required',
      });
    }

    const year = parseInt(published_year);
    if (isNaN(year) || year < 1000 || year > new Date().getFullYear() + 1) {
      return res.status(400).json({ success: false, message: 'Invalid published year' });
    }

    let cover_image = existing[0].cover_image;

    if (req.file) {
      // New image uploaded - delete old from Cloudinary
      await deleteCloudinaryImage(existing[0].cover_image);
      cover_image = req.file.path; // Cloudinary full URL
    } else if (remove_image === 'true') {
      // Remove image - delete from Cloudinary
      await deleteCloudinaryImage(existing[0].cover_image);
      cover_image = null;
    }
    // else keep existing cover_image

    await db.query(
      'UPDATE books SET title = ?, author = ?, published_year = ?, cover_image = ? WHERE id = ?',
      [title.trim(), author.trim(), year, cover_image, id]
    );

    const [updatedBook] = await db.query('SELECT * FROM books WHERE id = ?', [id]);
    const book = updatedBook[0];
    book.cover_image_url = buildImageUrl(book.cover_image);

    res.json({ success: true, data: book, message: 'Book updated successfully' });
  } catch (err) {
    console.error('updateBook error:', err);
    res.status(500).json({ success: false, message: 'Failed to update book' });
  }
};

// DELETE book
const deleteBook = async (req, res) => {
  try {
    const [existing] = await db.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // Delete from DB first
    await db.query('DELETE FROM books WHERE id = ?', [req.params.id]);

    // Then delete image from Cloudinary
    await deleteCloudinaryImage(existing[0].cover_image);

    res.json({ success: true, message: 'Book deleted successfully' });
  } catch (err) {
    console.error('deleteBook error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete book' });
  }
};

module.exports = { getAllBooks, getBookById, createBook, updateBook, deleteBook };
