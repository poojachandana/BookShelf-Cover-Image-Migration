import React, { useState } from 'react';
import './styles/global.css';
import Header   from './components/Header';
import BookList from './components/BookList';
import AddBook  from './components/AddBook';
import EditBook from './components/EditBook';

function App() {
  const [view, setView]           = useState('list');
  const [editingBook, setEditing] = useState(null);
  const [refreshKey, setRefresh]  = useState(0);

  const refresh = () => setRefresh(k => k + 1);

  const handleEdit = (book) => {
    setEditing(book);
    setView('edit');
  };

  const handleDone = () => {
    setEditing(null);
    setView('list');
    refresh();
  };

  return (
    <div className="app-shell">
      <Header view={view} setView={(v) => {
        if (v === 'list') { setEditing(null); }
        setView(v);
      }} />
      <main className="main-content">
        {view === 'list' && (
          <BookList
            key={refreshKey}
            onEdit={handleEdit}
            onAdd={() => setView('add')}
          />
        )}
        {view === 'add' && (
          <AddBook onDone={handleDone} onCancel={() => setView('list')} />
        )}
        {view === 'edit' && editingBook && (
          <EditBook
            book={editingBook}
            onDone={handleDone}
            onCancel={() => setView('list')}
          />
        )}
      </main>
    </div>
  );
}

export default App;