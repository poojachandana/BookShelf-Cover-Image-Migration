-- ============================================================
-- Rollback Script: Remove cover_image column from books table
-- Version: 1.0.0
-- CAUTION: This will permanently delete all cover_image data!
-- Run only if migration needs to be reversed.
-- ============================================================

-- Step 1: Backup cover_image data before dropping (safety net)
CREATE TABLE IF NOT EXISTS books_cover_image_backup AS
  SELECT id, title, cover_image, NOW() AS backed_up_at
  FROM books;

-- Confirm backup succeeded
SELECT COUNT(*) AS backed_up_rows FROM books_cover_image_backup;

-- Step 2: Remove the cover_image column
ALTER TABLE books DROP COLUMN cover_image;

-- Step 3: Verify rollback
DESCRIBE books;

-- ============================================================
-- Optional: Remove backup table after confirming app works
-- ============================================================
-- DROP TABLE IF EXISTS books_cover_image_backup;