-- ============================================================
-- Migration Script: Add cover_image column to books table
-- Version: 1.0.0
-- Date: 2025
-- Description: Safely adds cover_image VARCHAR(255) to books
-- ============================================================

-- Step 1: Begin transaction for safety
START TRANSACTION;

-- Step 2: Check if column already exists (MySQL compatible)
-- If running PostgreSQL, use the DO block below instead
SET @col_exists = (
  SELECT COUNT(*) 
  FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'books'
    AND COLUMN_NAME = 'cover_image'
);

-- Step 3: Add the column only if it does not exist
-- For MySQL:
ALTER TABLE books 
  ADD COLUMN IF NOT EXISTS cover_image VARCHAR(255) 
  DEFAULT NULL 
  COMMENT 'File path to uploaded book cover image';

-- Step 4: Set default image for all existing records that have NULL cover_image
UPDATE books 
SET cover_image = '/images/default-book.png'
WHERE cover_image IS NULL;

-- Step 5: Verify the migration
SELECT 
  COUNT(*) AS total_books,
  SUM(CASE WHEN cover_image IS NOT NULL THEN 1 ELSE 0 END) AS books_with_image,
  SUM(CASE WHEN cover_image IS NULL THEN 1 ELSE 0 END) AS books_without_image
FROM books;

-- Step 6: Commit transaction
COMMIT;

-- ============================================================
-- PostgreSQL Alternative (use instead of MySQL block above)
-- ============================================================
/*
BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'books' AND column_name = 'cover_image'
  ) THEN
    ALTER TABLE books ADD COLUMN cover_image VARCHAR(255) DEFAULT NULL;
    RAISE NOTICE 'Column cover_image added successfully.';
  ELSE
    RAISE NOTICE 'Column cover_image already exists. Skipping.';
  END IF;
END
$$;

UPDATE books
SET cover_image = '/images/default-book.png'
WHERE cover_image IS NULL;

SELECT 
  COUNT(*) AS total_books,
  COUNT(cover_image) AS books_with_image
FROM books;

COMMIT;
*/
