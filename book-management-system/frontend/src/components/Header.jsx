import React from 'react';

function Header({ view, setView }) {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="logo" onClick={() => setView('list')}>
          <div className="logo-mark">📚</div>
          <div className="logo-text">
            <span className="logo-name">Bibliotheca</span>
            <span className="logo-tagline">Book Management</span>
          </div>
        </div>

        <nav className="header-nav">
          <button
            className={`nav-btn ${view === 'list' ? 'active' : ''}`}
            onClick={() => setView('list')}
          >
            Library
          </button>
          <button
            className="nav-btn-primary"
            onClick={() => setView('add')}
          >
            + Add Book
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Header;
