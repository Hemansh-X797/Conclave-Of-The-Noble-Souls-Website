// ============================================================================
// BOOKMARK PANEL COMPONENT - VISUAL MEMORY PALACE
// Advanced bookmark management with thumbnails and color-coded notes
// Location: /src/components/pathways/ebook/BookmarkPanel.jsx
// ============================================================================

'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAppContext } from '@/contexts/AppProvider';
import { notify } from '@/components/interactive/NotificationCenter';
import EmptyState from '@/components/ui/EmptyState';
import { 
  Bookmark, BookmarkCheck, X, Edit2, Trash2, 
  Search, Filter, Calendar, Tag, Clock,
  ChevronDown, Star, MapPin, Eye
} from 'lucide-react';

/**
 * BookmarkPanel - Advanced bookmark management with visual previews
 * 
 * @param {Object} props
 * @param {string} props.bookId - Current book ID
 * @param {Array} props.bookmarks - Array of bookmark objects
 * @param {number} props.currentPage - Current page number
 * @param {Function} props.onJumpToBookmark - Callback to navigate to bookmark
 * @param {Function} props.onAddBookmark - Callback to add new bookmark
 * @param {Function} props.onUpdateBookmark - Callback to update bookmark
 * @param {Function} props.onDeleteBookmark - Callback to delete bookmark
 * @param {Function} props.onClose - Callback to close panel
 * @param {string} props.pathway - Current pathway for theming
 */
export default function BookmarkPanel({
  bookId,
  bookmarks = [],
  currentPage = 0,
  onJumpToBookmark,
  onAddBookmark,
  onUpdateBookmark,
  onDeleteBookmark,
  onClose,
  pathway = 'lorebound'
}) {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColor, setSelectedColor] = useState('all');
  const [sortBy, setSortBy] = useState('recent'); // recent, page, color
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [editNote, setEditNote] = useState('');
  const [editColor, setEditColor] = useState('gold');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newColor, setNewColor] = useState('gold');
  
  const panelRef = useRef(null);
  const searchInputRef = useRef(null);
  
  // ============================================
  // CONTEXT & HOOKS
  // ============================================
  const { playClick, playHover, animationsEnabled } = useAppContext();

  // ============================================
  // BOOKMARK COLORS
  // ============================================
  const bookmarkColors = useMemo(() => ({
    gold: { color: '#FFD700', label: 'Important', icon: '⭐' },
    blue: { color: '#00BFFF', label: 'Information', icon: '📘' },
    green: { color: '#50C878', label: 'Completed', icon: '✅' },
    red: { color: '#E0115F', label: 'Question', icon: '❓' },
    purple: { color: '#9D4EDD', label: 'Favorite', icon: '💜' },
    orange: { color: '#FF8C00', label: 'Review', icon: '🔄' }
  }), []);

  // ============================================
  // FILTER & SORT BOOKMARKS
  // ============================================
  const filteredBookmarks = useMemo(() => {
    let result = [...bookmarks];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(b => 
        b.note?.toLowerCase().includes(query) ||
        b.page?.toString().includes(query)
      );
    }

    // Color filter
    if (selectedColor !== 'all') {
      result = result.filter(b => b.color === selectedColor);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.date) - new Date(a.date);
        case 'page':
          return a.page - b.page;
        case 'color':
          return (a.color || 'gold').localeCompare(b.color || 'gold');
        default:
          return 0;
      }
    });

    return result;
  }, [bookmarks, searchQuery, selectedColor, sortBy]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleAddBookmark = useCallback(() => {
    if (!onAddBookmark) {
return;
}

    playClick();
    
    const newBookmark = {
      id: Date.now(),
      page: currentPage,
      note: newNote.trim(),
      color: newColor,
      date: Date.now()
    };

    onAddBookmark(newBookmark);
    
    setNewNote('');
    setNewColor('gold');
    setShowAddForm(false);
    
    notify.success('Bookmark added', { duration: 2000 });
  }, [playClick, currentPage, newNote, newColor, onAddBookmark]);

  const handleUpdateBookmark = useCallback((bookmark) => {
    if (!onUpdateBookmark) {
return;
}

    playClick();

    const updatedBookmark = {
      ...bookmark,
      note: editNote,
      color: editColor
    };

    onUpdateBookmark(updatedBookmark);
    setEditingBookmark(null);
    
    notify.success('Bookmark updated', { duration: 2000 });
  }, [playClick, editNote, editColor, onUpdateBookmark]);

  const handleDeleteBookmark = useCallback((bookmarkId) => {
    if (!onDeleteBookmark) {
return;
}

    playClick();
    
    if (confirm('Delete this bookmark?')) {
      onDeleteBookmark(bookmarkId);
      notify.success('Bookmark deleted', { duration: 2000 });
    }
  }, [playClick, onDeleteBookmark]);

  const handleJumpToBookmark = useCallback((bookmark) => {
    playClick();
    
    if (onJumpToBookmark) {
      onJumpToBookmark(bookmark.page);
      notify.success(`Jumped to page ${bookmark.page + 1}`, { duration: 2000 });
    }
  }, [playClick, onJumpToBookmark]);

  const handleStartEdit = useCallback((bookmark) => {
    playClick();
    setEditingBookmark(bookmark.id);
    setEditNote(bookmark.note || '');
    setEditColor(bookmark.color || 'gold');
  }, [playClick]);

  const handleCancelEdit = useCallback(() => {
    playClick();
    setEditingBookmark(null);
    setEditNote('');
    setEditColor('gold');
  }, [playClick]);

  const handleClose = useCallback(() => {
    playClick();
    onClose?.();
  }, [playClick, onClose]);

  // ============================================
  // KEYBOARD SHORTCUTS
  // ============================================
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        if (editingBookmark) {
          handleCancelEdit();
        } else if (showAddForm) {
          setShowAddForm(false);
        } else {
          handleClose();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [editingBookmark, showAddForm, handleCancelEdit, handleClose]);

  // ============================================
  // RENDER: MAIN PANEL
  // ============================================
  return (
    <div className={`bookmark-panel ${pathway}-pathway`} ref={panelRef}>
      {/* Overlay */}
      <div className="panel-overlay" onClick={handleClose} />

      {/* Panel Content */}
      <div className="panel-content">
        {/* Header */}
        <div className="panel-header">
          <div className="header-title">
            <Bookmark size={24} />
            <h2>Bookmarks</h2>
            <span className="bookmark-count">({bookmarks.length})</span>
          </div>

          <div className="header-actions">
            <button
              className="add-bookmark-btn"
              onClick={() => {
                playClick();
                setShowAddForm(!showAddForm);
              }}
              onMouseEnter={playHover}
            >
              <BookmarkCheck size={18} />
              Add
            </button>

            <button
              className="close-btn"
              onClick={handleClose}
              onMouseEnter={playHover}
              aria-label="Close panel"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Add Bookmark Form */}
        {showAddForm && (
          <div className="add-form">
            <div className="form-header">
              <MapPin size={18} />
              <span>New Bookmark at Page {currentPage + 1}</span>
            </div>

            <textarea
              className="form-textarea"
              placeholder="Add a note (optional)..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
            />

            <div className="form-colors">
              <span className="form-label">Color:</span>
              <div className="color-options">
                {Object.entries(bookmarkColors).map(([key, { color, label, icon }]) => (
                  <button
                    key={key}
                    className={`color-btn ${newColor === key ? 'active' : ''}`}
                    style={{ background: color }}
                    onClick={() => setNewColor(key)}
                    onMouseEnter={playHover}
                    title={label}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button
                className="form-btn cancel-btn"
                onClick={() => {
                  playClick();
                  setShowAddForm(false);
                  setNewNote('');
                  setNewColor('gold');
                }}
                onMouseEnter={playHover}
              >
                Cancel
              </button>
              <button
                className="form-btn save-btn"
                onClick={handleAddBookmark}
                onMouseEnter={playHover}
              >
                <BookmarkCheck size={16} />
                Save Bookmark
              </button>
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className="panel-filters">
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search bookmarks... (Ctrl+F)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button
                className="clear-search"
                onClick={() => setSearchQuery('')}
                onMouseEnter={playHover}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="filter-controls">
            {/* Color Filter */}
            <select
              className="filter-select"
              value={selectedColor}
              onChange={(e) => {
                playClick();
                setSelectedColor(e.target.value);
              }}
            >
              <option value="all">All Colors</option>
              {Object.entries(bookmarkColors).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            {/* Sort By */}
            <select
              className="filter-select"
              value={sortBy}
              onChange={(e) => {
                playClick();
                setSortBy(e.target.value);
              }}
            >
              <option value="recent">Recent First</option>
              <option value="page">By Page</option>
              <option value="color">By Color</option>
            </select>
          </div>
        </div>

        {/* Bookmarks List */}
        <div className="bookmarks-list">
          {filteredBookmarks.length === 0 ? (
            <EmptyState
              icon={<Bookmark size={48} />}
              title={searchQuery ? 'No matching bookmarks' : 'No bookmarks yet'}
              message={searchQuery ? `No bookmarks match "${searchQuery}"` : 'Add bookmarks to save your progress and notes'}
            />
          ) : (
            filteredBookmarks.map((bookmark, index) => (
              <div
                key={bookmark.id}
                className={`bookmark-item ${bookmark.page === currentPage ? 'current' : ''}`}
                style={{
                  animationDelay: animationsEnabled ? `${index * 0.05}s` : '0s'
                }}
              >
                {editingBookmark === bookmark.id ? (
                  // Edit Mode
                  <div className="bookmark-edit">
                    <textarea
                      className="edit-textarea"
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                      placeholder="Edit note..."
                      rows={2}
                      autoFocus
                    />

                    <div className="edit-colors">
                      {Object.entries(bookmarkColors).map(([key, { color, icon }]) => (
                        <button
                          key={key}
                          className={`color-btn ${editColor === key ? 'active' : ''}`}
                          style={{ background: color }}
                          onClick={() => setEditColor(key)}
                          onMouseEnter={playHover}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>

                    <div className="edit-actions">
                      <button
                        className="edit-btn cancel"
                        onClick={handleCancelEdit}
                        onMouseEnter={playHover}
                      >
                        Cancel
                      </button>
                      <button
                        className="edit-btn save"
                        onClick={() => handleUpdateBookmark(bookmark)}
                        onMouseEnter={playHover}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <>
                    <div
                      className="bookmark-color-indicator"
                      style={{ background: bookmarkColors[bookmark.color]?.color || bookmarkColors.gold.color }}
                    />

                    <button
                      className="bookmark-content"
                      onClick={() => handleJumpToBookmark(bookmark)}
                      onMouseEnter={playHover}
                    >
                      <div className="bookmark-header">
                        <div className="bookmark-page">
                          <MapPin size={14} />
                          Page {bookmark.page + 1}
                        </div>
                        <div className="bookmark-date">
                          <Clock size={12} />
                          {new Date(bookmark.date).toLocaleDateString()}
                        </div>
                      </div>

                      {bookmark.note && (
                        <div className="bookmark-note">
                          {bookmark.note}
                        </div>
                      )}

                      <div className="bookmark-badge">
                        {bookmarkColors[bookmark.color]?.icon || '⭐'}
                        {bookmarkColors[bookmark.color]?.label || 'Important'}
                      </div>
                    </button>

                    <div className="bookmark-actions">
                      <button
                        className="action-btn edit"
                        onClick={() => handleStartEdit(bookmark)}
                        onMouseEnter={playHover}
                        aria-label="Edit bookmark"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDeleteBookmark(bookmark.id)}
                        onMouseEnter={playHover}
                        aria-label="Delete bookmark"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* Stats Footer */}
        {filteredBookmarks.length > 0 && (
          <div className="panel-footer">
            <div className="footer-stat">
              <Tag size={14} />
              {filteredBookmarks.length} bookmark{filteredBookmarks.length !== 1 ? 's' : ''}
            </div>
            <div className="footer-stat">
              <Eye size={14} />
              Showing {selectedColor === 'all' ? 'all' : bookmarkColors[selectedColor]?.label.toLowerCase()}
            </div>
          </div>
        )}
      </div>

      {/* Styles */}
      <style jsx>{`
        .bookmark-panel {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          z-index: 200;
          width: 450px;
        }

        .panel-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(5px);
        }

        .panel-content {
          position: relative;
          height: 100%;
          background: rgba(10, 10, 15, 0.98);
          backdrop-filter: blur(20px);
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          animation: slideInRight 0.3s ease;
        }

        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        /* Header */
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .header-title h2 {
          font-family: var(--font-cinzel);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .bookmark-count {
          font-family: var(--font-josefin);
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .header-actions {
          display: flex;
          gap: 0.75rem;
        }

        .add-bookmark-btn,
        .close-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: var(--text-primary);
          font-family: var(--font-josefin);
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .add-bookmark-btn:hover,
        .close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--cns-gold);
        }

        .close-btn {
          padding: 0.5rem;
        }

        /* Add Form */
        .add-form {
          padding: 1.5rem;
          background: rgba(255, 215, 0, 0.05);
          border-bottom: 1px solid rgba(255, 215, 0, 0.2);
        }

        .form-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--font-josefin);
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--cns-gold);
          margin-bottom: 1rem;
        }

        .form-textarea,
        .edit-textarea {
          width: 100%;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: var(--text-primary);
          font-family: var(--font-josefin);
          font-size: 0.9rem;
          resize: vertical;
          margin-bottom: 1rem;
        }

        .form-textarea:focus,
        .edit-textarea:focus {
          outline: none;
          border-color: var(--cns-gold);
        }

        .form-colors,
        .edit-colors {
          margin-bottom: 1rem;
        }

        .form-label {
          display: block;
          font-family: var(--font-josefin);
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }

        .color-options,
        .edit-colors {
          display: flex;
          gap: 0.5rem;
        }

        .color-btn {
          width: 36px;
          height: 36px;
          border: 2px solid transparent;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
        }

        .color-btn:hover {
          transform: scale(1.1);
          border-color: rgba(255, 255, 255, 0.5);
        }

        .color-btn.active {
          border-color: white;
          box-shadow: 0 0 10px currentColor;
        }

        .form-actions,
        .edit-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
        }

        .form-btn,
        .edit-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          font-family: var(--font-josefin);
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cancel-btn,
        .edit-btn.cancel {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-secondary);
        }

        .save-btn,
        .edit-btn.save {
          background: var(--cns-gold);
          color: var(--bg-primary);
          border-color: var(--cns-gold);
        }

        .form-btn:hover,
        .edit-btn:hover {
          transform: translateY(-2px);
        }

        /* Filters */
        .panel-filters {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .search-box {
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-secondary);
        }

        .search-input {
          width: 100%;
          padding: 0.5rem 2.5rem 0.5rem 2.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: var(--text-primary);
          font-family: var(--font-josefin);
          font-size: 0.9rem;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--cns-gold);
        }

        .clear-search {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.25rem;
        }

        .filter-controls {
          display: flex;
          gap: 0.75rem;
        }

        .filter-select {
          flex: 1;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: var(--text-primary);
          font-family: var(--font-josefin);
          font-size: 0.85rem;
          cursor: pointer;
        }

        /* Bookmarks List */
        .bookmarks-list {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
        }

        .bookmark-item {
          display: flex;
          align-items: stretch;
          gap: 0;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          margin-bottom: 1rem;
          overflow: hidden;
          transition: all 0.3s ease;
          animation: fadeInUp 0.5s ease forwards;
          opacity: 0;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .bookmark-item:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .bookmark-item.current {
          background: rgba(255, 215, 0, 0.1);
          border-color: var(--cns-gold);
        }

        .bookmark-color-indicator {
          width: 4px;
          flex-shrink: 0;
        }

        .bookmark-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 1rem;
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
          color: var(--text-primary);
        }

        .bookmark-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .bookmark-page {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-family: var(--font-cinzel);
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .bookmark-date {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-family: var(--font-josefin);
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .bookmark-note {
          font-family: var(--font-josefin);
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .bookmark-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.25rem 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          font-family: var(--font-josefin);
          font-size: 0.75rem;
          color: var(--text-secondary);
          align-self: flex-start;
        }

        .bookmark-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 0.5rem;
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .action-btn.edit:hover {
          border-color: var(--cns-gold);
          color: var(--cns-gold);
        }

        .action-btn.delete:hover {
          border-color: #E0115F;
          color: #E0115F;
        }

        /* Edit Mode */
        .bookmark-edit {
          width: 100%;
          padding: 1rem;
        }

        /* Footer */
        .panel-footer {
          display: flex;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.3);
        }

        .footer-stat {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--font-josefin);
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        /* Scrollbar */
        .bookmarks-list::-webkit-scrollbar {
          width: 6px;
        }

        .bookmarks-list::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }

        .bookmarks-list::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }

        .bookmarks-list::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .bookmark-panel {
            width: 100%;
          }

          .panel-header {
            padding: 1rem;
          }

          .panel-filters {
            padding: 1rem;
          }

          .filter-controls {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}