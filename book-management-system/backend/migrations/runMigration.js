// migrations/runMigration.js — Programmatic migration runner
const db   = require('../db');
require('dotenv').config();

async function runMigration() {
  const conn = await db.getConnection();
  console.log('🚀  Starting migration...\n');

  try {
    await conn.beginTransaction();

    // 1. Check if column already exists
    const [cols] = await conn.query(`
      SELECT COUNT(*) AS cnt
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'books' AND COLUMN_NAME = 'cover_image'
    `, [process.env.DB_NAME || 'book_management']);

    if (cols[0].cnt > 0) {
      console.log('ℹ️   Column cover_image already exists. Migration skipped.\n');
      conn.release();
      process.exit(0);
    }

    // 2. Add column
    await conn.query(`
      ALTER TABLE books
      ADD COLUMN cover_image VARCHAR(255) DEFAULT NULL
      COMMENT 'File path to uploaded book cover image'
    `);
    console.log('✅  Step 1: Column cover_image added.');

    // 3. Update existing NULL records
    const [updated] = await conn.query(`
      UPDATE books SET cover_image = '/images/default-book.png'
      WHERE cover_image IS NULL
    `);
    console.log(`✅  Step 2: ${updated.affectedRows} existing records updated with default image.`);

    // 4. Verify
    const [stats] = await conn.query(`
      SELECT
        COUNT(*) AS total,
        SUM(cover_image IS NOT NULL) AS with_image,
        SUM(cover_image IS NULL)     AS without_image
      FROM books
    `);
    console.log('\n📊  Migration Verification:');
    console.table(stats);

    await conn.commit();
    console.log('\n🎉  Migration completed successfully!\n');
  } catch (err) {
    await conn.rollback();
    console.error('\n❌  Migration failed — transaction rolled back.');
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    conn.release();
    process.exit(0);
  }
}

runMigration();
