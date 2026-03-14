PROJECT LINK - https://bookshelf-cover-image-migration.netlify.app/

# 📚 Bibliotheca — Book Management System

> A full-stack web application for managing a book catalog with cover image upload, editing, and cloud storage. Built as part of an internship evaluation project.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?style=flat-square&logo=mysql&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Image_Storage-3448C5?style=flat-square&logo=cloudinary&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

---

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| 🖥️ Frontend | [Netlify Deployment](https://bookshelf-cover-image-migration.netlify.app/) |
| ⚙️ Backend | [https://bookshelf-cover-image-migration.onrender.com](https://dashboard.render.com/web/srv-d6p45rkr85hc739e9eh0) |
| 🗄️ Database | Railway MySQL |
| 🖼️ Images | Cloudinary CDN |

---

## 📌 Project Overview

**Bibliotheca** is a complete CRUD Book Management System that demonstrates:

- Safe **database schema migration** — adding a `cover_image` column to an existing `books` table without data loss
- **RESTful API** design with Express.js and MySQL
- **Cloud image storage** with Cloudinary (upload, transform, delete)
- A polished **React frontend** with a built-in image editor (crop, adjust, filters, rotate)
- Full **deployment pipeline** across Railway, Render, and Netlify

---

## ✨ Features

### 📖 Book Management
- Add, edit, view, and delete books
- Fields: Title, Author, Genre, Published Year, Description, Cover Image
- Responsive book card grid with cover image display

### 🖼️ Image Editor (Built-in)
- **Adjust** — Brightness, Contrast, Saturation, Hue, Blur, Zoom
- **Filters** — 10 presets: Vivid, Matte, B&W, Sepia, Vintage, Cold, Warm, Faded, Dramatic
- **Crop** — Draggable crop box with 8 resize handles, rule-of-thirds grid, aspect ratio lock (Free / 1:1 / 4:3 / 16:9 / 3:4 / 2:3)
- **Rotate** — Left/Right 90°, Flip H/V, fine rotation slider
- Live canvas preview applied before upload

### 🔒 Data Safety
- Migration uses `IF NOT EXISTS` — safe to run multiple times
- Rollback script included to revert schema changes
- Input validation on both frontend and backend
- Cloudinary image cleanup on book deletion

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Axios, Custom CSS |
| Backend | Node.js 18+, Express 4 |
| Database | MySQL 8.x (hosted on Railway) |
| Image Store | Cloudinary (multer-storage-cloudinary) |
| Deployment | Netlify (frontend), Render (backend), Railway (DB) |

---

## 📁 Project Structure

```
BookShelf-Cover-Image-Migration/
└── book-management-system/
    ├── backend/
    │   ├── controllers/
    │   │   └── booksController.js     # CRUD logic + Cloudinary URL builder
    │   ├── middleware/
    │   │   └── upload.js              # Multer + Cloudinary storage config
    │   ├── migrations/
    │   │   └── runMigration.js        # Programmatic migration runner
    │   ├── routes/
    │   │   └── books.js               # API route definitions
    │   ├── db.js                      # MySQL connection pool
    │   └── server.js                  # Express app entry point
    ├── database/
    │   ├── init.sql                   # Initial schema (books table)
    │   ├── migrate.sql                # Adds cover_image column
    │   └── rollback.sql               # Removes cover_image column
    ├── frontend/
    │   └── src/
    │       ├── components/
    │       │   ├── AddBook.jsx        # Add book form
    │       │   ├── BookList.jsx       # Book grid display
    │       │   ├── EditBook.jsx       # Edit book form
    │       │   ├── Header.jsx         # App header
    │       │   └── ImageUpload.jsx    # Image upload + built-in editor
    │       ├── services/
    │       │   └── api.js             # Axios API calls
    │       ├── App.js
    │       └── index.js
    ├── netlify.toml                   # Netlify build config
    └── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8.x
- Cloudinary account
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/BookShelf-Cover-Image-Migration.git
cd BookShelf-Cover-Image-Migration/book-management-system
```

### 2. Database Setup

Run the initial schema:

```sql
CREATE TABLE IF NOT EXISTS books (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  title          VARCHAR(255) NOT NULL,
  author         VARCHAR(255) NOT NULL,
  genre          VARCHAR(100),
  published_year INT,
  description    TEXT,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Run the migration to add cover image support:

```sql
ALTER TABLE books
ADD COLUMN IF NOT EXISTS cover_image VARCHAR(255) DEFAULT NULL;
```

To rollback:

```sql
ALTER TABLE books DROP COLUMN IF EXISTS cover_image;
```

### 3. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
DB_HOST=your-mysql-host
DB_PORT=3306
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=railway

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

PORT=5000
NODE_ENV=development
```

Start the server:

```bash
node server.js
```

### 4. Frontend Setup

```bash
cd frontend
npm install
npm start
```

App runs at `http://localhost:3000`

---

## 📡 API Reference

Base URL: `https://bookshelf-cover-image-migration.onrender.com/api`

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | `/books` | Get all books with cover image URLs | — |
| GET | `/books/:id` | Get single book by ID | — |
| POST | `/books` | Create a new book | `multipart/form-data` |
| PUT | `/books/:id` | Update book details + image | `multipart/form-data` |
| DELETE | `/books/:id` | Delete book + Cloudinary image | — |
| GET | `/health` | Health check | — |

### Example — Create Book

```bash
curl -X POST https://bookshelf-cover-image-migration.onrender.com/api/books \
  -F "title=The Great Gatsby" \
  -F "author=F. Scott Fitzgerald" \
  -F "genre=Fiction" \
  -F "published_year=1925" \
  -F "cover_image=@/path/to/cover.jpg"
```

### Example Response

```json
{
  "id": 1,
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "genre": "Fiction",
  "published_year": 1925,
  "cover_image_url": "https://res.cloudinary.com/dwtlqdbod/image/upload/book-covers/abc123.jpg",
  "created_at": "2026-03-12T10:00:00.000Z"
}
```

---

## 🗄️ Database Schema

```sql
CREATE TABLE books (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  title          VARCHAR(255)  NOT NULL,
  author         VARCHAR(255)  NOT NULL,
  genre          VARCHAR(100),
  published_year INT,
  description    TEXT,
  cover_image    VARCHAR(255)  DEFAULT NULL,   -- Added via migration
  created_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);
```

### Migration Strategy

The migration uses `ADD COLUMN IF NOT EXISTS` making it:
- ✅ **Idempotent** — safe to run multiple times
- ✅ **Non-destructive** — existing book data is preserved
- ✅ **Reversible** — rollback script removes the column cleanly

---

## ☁️ Deployment

### Backend — Render

| Setting | Value |
|---------|-------|
| Root Directory | `book-management-system/backend` |
| Build Command | `npm install` |
| Start Command | `node server.js` |

**Environment Variables** (set in Render dashboard):

```
DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
PORT=5000, NODE_ENV=production
```

### Frontend — Netlify

Controlled by `netlify.toml` at repo root:

```toml
[build]
  base    = "book-management-system/frontend"
  command = "NODE_OPTIONS=--openssl-legacy-provider react-scripts build"
  publish = "book-management-system/frontend/build"

[build.environment]
  CI                    = "false"
  DISABLE_ESLINT_PLUGIN = "true"
```

### Database — Railway

- MySQL 8.x managed instance
- Public proxy URL used for Render connectivity

---

## 🧪 Testing

### Health Check

```bash
curl https://bookshelf-cover-image-migration.onrender.com/api/health
# → { "status": "ok" }
```

### Manual Test Checklist

- [ ] Add a book without a cover image
- [ ] Add a book with a cover image — verify Cloudinary upload
- [ ] Edit a book and replace its cover image
- [ ] Delete a book — verify Cloudinary image is also deleted
- [ ] View book list — all cover images display correctly
- [ ] Run migration twice — no errors (idempotency check)
- [ ] Run rollback — column removed, existing data intact

---

## 🔄 Rollout Plan

1. Run migration on production DB (`migrate.sql`)
2. Deploy backend to Render
3. Deploy frontend to Netlify
4. Smoke test all API endpoints
5. If issues → run `rollback.sql` and redeploy previous backend version

---

## 🛡️ Error Handling

| Scenario | Handling |
|----------|----------|
| Invalid file type | 400 error + user alert |
| File > 10MB | 400 error + user alert |
| DB connection failure | 500 error + console log |
| Cloudinary upload failure | 500 error, no DB write |
| Missing required fields | 400 validation error |
| Book not found | 404 error |

---

## 👤 Author

 Pooja Chandana BN
- GitHub: https://github.com/poojachandana/BookShelf-Cover-Image-Migration

---

## 📄 License

This project is licensed under the MIT License.

---

> Built with ❤️ for internship evaluation — demonstrating full-stack development, database migration, cloud integration, and deployment best practices.
