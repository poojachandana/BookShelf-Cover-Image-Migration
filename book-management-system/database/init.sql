-- ============================================================
-- Database Initialization Script
-- Creates the books table from scratch (fresh setup)
-- ============================================================

CREATE DATABASE IF NOT EXISTS book_management;
USE book_management;

-- Drop table if re-running setup
DROP TABLE IF EXISTS books;

-- Create books table with full schema (including cover_image)
CREATE TABLE books (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(255)  NOT NULL,
  author        VARCHAR(255)  NOT NULL,
  published_year INT           NOT NULL,
  cover_image   VARCHAR(255)  DEFAULT '/images/default-book.png',
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed with sample data
INSERT INTO books (title, author, published_year, cover_image) VALUES
  ('The Great Gatsby',       'F. Scott Fitzgerald', 1925, '/images/default-book.png'),
  ('To Kill a Mockingbird',  'Harper Lee',          1960, '/images/default-book.png'),
  ('1984',                   'George Orwell',        1949, '/images/default-book.png'),
  ('The Catcher in the Rye', 'J.D. Salinger',       1951, '/images/default-book.png'),
  ('Brave New World',        'Aldous Huxley',        1932, '/images/default-book.png');

-- Verify
SELECT * FROM books;
