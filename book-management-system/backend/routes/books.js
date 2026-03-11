// routes/books.js — Book routes with multer middleware
const express    = require('express');
const router     = express.Router();
const upload     = require('../middleware/upload');
const controller = require('../controllers/booksController');

// Error wrapper for multer
const uploadSingle = (req, res, next) => {
  upload.single('cover_image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

router.get('/',     controller.getAllBooks);
router.get('/:id',  controller.getBookById);
router.post('/',    uploadSingle, controller.createBook);
router.put('/:id',  uploadSingle, controller.updateBook);
router.delete('/:id', controller.deleteBook);

module.exports = router;
