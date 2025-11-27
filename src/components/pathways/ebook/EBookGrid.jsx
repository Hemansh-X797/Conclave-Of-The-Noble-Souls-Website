// ============================================================================
// EBOOK GRID COMPONENT - THE NOBLE LIBRARY
// Luxury e-book display system with advanced filtering and views
// Location: /src/components/pathways/ebook/EBookGrid.jsx
// ============================================================================

'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAppContext } from '@/contexts/AppProvider';
import { notify } from '@/components/interactive/NotificationCenter';
import LoadingCrest from '@/components/ui/LoadingCrest';
import EmptyState from '@/components/ui/EmptyState';
import EBookCard from '@/components/pathways/ebook/EBookCard';
import { 
  Search, Filter, X, Grid3x3, List, LayoutGrid,
  SortAsc, SortDesc, Star, Clock, Download,
  ChevronDown, BookOpen, Eye, TrendingUp
} from 'lucide-react';

/**
 * EBookGrid - Advanced e-book library display with filtering and multiple views
 * 
 * @param {Object} props
 * @param {Array} props.books - Array of book objects
 * @param {Function} props.onRead - Callback when user clicks read
 * @param {Function} props.onDownload - Callback when user clicks download
 * @param {string} props.variant - Grid variant ('default', 'compact', 'detailed')
 * @param {string} props.pathway - Current pathway for theming
 * @param {boolean} props.showProgress - Show reading progress indicators
 * @param {Array} props.collections - User's collections
 * @param {Function} props.onAddToCollection - Callback to add book to collection
 */
export default function EBookGrid({
  books = [],
  onRead,
  onDownload,
  variant = 'default',
  pathway = 'lorebound',
  showProgress = true,
  collections = [],
  onAddToCollection
}) {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid'); // grid, list, compact
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 12;
  
  const gridRef = useRef(null);
  const searchInputRef = useRef(null);
  
  // ============================================
  // CONTEXT & HOOKS
  // ============================================
  const { 
    user, 
    isAuthenticated, 
    playClick, 
    playHover,
    isMobile,
    animationsEnabled 
  } = useAppContext();

  // ============================================
  // INITIALIZE
  // ============================================
  useEffect(() => {
    const initializeGrid = async () => {
      try {
        setLoading(true);
        
        // Simulate initial load (remove in production)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Load saved preferences
        const savedViewMode = localStorage.getItem('ebook-view-mode');
        const savedSortBy = localStorage.getItem('ebook-sort-by');
        const savedSortOrder = localStorage.getItem('ebook-sort-order');
        
        if (savedViewMode) {
setViewMode(savedViewMode);
}
        if (savedSortBy) {
setSortBy(savedSortBy);
}
        if (savedSortOrder) {
setSortOrder(savedSortOrder);
}
        
        setLoading(false);
      } catch (error) {
        console.error('Grid initialization error:', error);
        notify.error('Failed to load library');
        setLoading(false);
      }
    };
    
    initializeGrid();
  }, []);

  // ============================================
  // EXTRACT AVAILABLE GENRES
  // ============================================
  const availableGenres = useMemo(() => {
    const genreSet = new Set();
    books.forEach(book => {
      if (book.genre) {
        if (Array.isArray(book.genre)) {
          book.genre.forEach(g => genreSet.add(g));
        } else {
          genreSet.add(book.genre);
        }
      }
    });
    return Array.from(genreSet).sort();
  }, [books]);

  // ============================================
  // FILTER & SORT LOGIC
  // ============================================
  const filteredAndSortedBooks = useMemo(() => {
    let result = [...books];
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(book => 
        book.title?.toLowerCase().includes(query) ||
        book.author?.toLowerCase().includes(query) ||
        book.description?.toLowerCase().includes(query)
      );
    }
    
    // Genre filter
    if (selectedGenres.length > 0) {
      result = result.filter(book => {
        const bookGenres = Array.isArray(book.genre) ? book.genre : [book.genre];
        return selectedGenres.some(genre => bookGenres.includes(genre));
      });
    }
    
    // Status filter
    if (selectedStatus !== 'all') {
      result = result.filter(book => book.status === selectedStatus);
    }
    
    // Sort
    result.sort((a, b) => {
      let compareA, compareB;
      
      switch (sortBy) {
        case 'title':
          compareA = a.title?.toLowerCase() || '';
          compareB = b.title?.toLowerCase() || '';
          break;
        case 'author':
          compareA = a.author?.toLowerCase() || '';
          compareB = b.author?.toLowerCase() || '';
          break;
        case 'rating':
          compareA = a.rating || 0;
          compareB = b.rating || 0;
          break;
        case 'dateAdded':
          compareA = new Date(a.dateAdded || 0).getTime();
          compareB = new Date(b.dateAdded || 0).getTime();
          break;
        case 'downloads':
          compareA = a.downloads || 0;
          compareB = b.downloads || 0;
          break;
        case 'progress':
          compareA = a.progress || 0;
          compareB = b.progress || 0;
          break;
        default:
          compareA = a.title?.toLowerCase() || '';
          compareB = b.title?.toLowerCase() || '';
      }
      
      if (sortOrder === 'asc') {
        return compareA > compareB ? 1 : -1;
      } else {
        return compareA < compareB ? 1 : -1;
      }
    });
    
    return result;
  }, [books, searchQuery, selectedGenres, selectedStatus, sortBy, sortOrder]);

  // ============================================
  // PAGINATION
  // ============================================
  const paginatedBooks = useMemo(() => {
    const startIndex = (currentPage - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    return filteredAndSortedBooks.slice(startIndex, endIndex);
  }, [filteredAndSortedBooks, currentPage, booksPerPage]);

  const totalPages = Math.ceil(filteredAndSortedBooks.length / booksPerPage);

  // ============================================
  // HANDLERS
  // ============================================
  const handleSearch = useCallback((e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  }, []);

  const handleGenreToggle = useCallback((genre) => {
    playClick();
    setSelectedGenres(prev => 
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
    setCurrentPage(1);
  }, [playClick]);

  const handleStatusChange = useCallback((status) => {
    playClick();
    setSelectedStatus(status);
    setCurrentPage(1);
  }, [playClick]);

  const handleSortChange = useCallback((newSortBy) => {
    playClick();
    
    if (newSortBy === sortBy) {
      // Toggle order if same sort field
      const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      setSortOrder(newOrder);
      localStorage.setItem('ebook-sort-order', newOrder);
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
      localStorage.setItem('ebook-sort-by', newSortBy);
      localStorage.setItem('ebook-sort-order', 'asc');
    }
  }, [sortBy, sortOrder, playClick]);

  const handleViewModeChange = useCallback((mode) => {
    playClick();
    setViewMode(mode);
    localStorage.setItem('ebook-view-mode', mode);
  }, [playClick]);

  const handleClearFilters = useCallback(() => {
    playClick();
    setSearchQuery('');
    setSelectedGenres([]);
    setSelectedStatus('all');
    setSortBy('title');
    setSortOrder('asc');
    setCurrentPage(1);
    notify.success('Filters cleared');
  }, [playClick]);

  const handleBookSelect = useCallback((bookId) => {
    playClick();
    setSelectedBooks(prev => 
      prev.includes(bookId)
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  }, [playClick]);

  const handleBulkDownload = useCallback(() => {
    if (selectedBooks.length === 0) {
      notify.error('No books selected');
      return;
    }
    
    playClick();
    notify.info(`Downloading ${selectedBooks.length} books...`);
    
    selectedBooks.forEach(bookId => {
      const book = books.find(b => b.id === bookId);
      if (book && onDownload) {
        onDownload(book);
      }
    });
    
    setSelectedBooks([]);
  }, [selectedBooks, books, onDownload, playClick]);

  const handlePageChange = useCallback((page) => {
    playClick();
    setCurrentPage(page);
    
    // Scroll to top of grid
    if (gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [playClick]);

  // ============================================
  // KEYBOARD SHORTCUTS
  // ============================================
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Focus search on Ctrl/Cmd + K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      
      // Toggle filters on Ctrl/Cmd + F
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setShowFilters(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // ============================================
  // RENDER: LOADING STATE
  // ============================================
  if (loading) {
    return (
      <div className="ebook-grid-loading">
        <LoadingCrest 
          pathway={pathway} 
          message="Loading noble library..."
        />
      </div>
    );
  }

  // ============================================
  // RENDER: EMPTY STATE (NO BOOKS)
  // ============================================
  if (books.length === 0) {
    return (
      <EmptyState
        icon={<BookOpen size={64} />}
        title="No Books Available"
        message="The library is currently empty. Check back soon for new additions."
        action={{
          label: 'Browse External Sites',
          onClick: () => notify.info('Opening external sites...')
        }}
      />
    );
  }

  // ============================================
  // RENDER: EMPTY SEARCH RESULTS
  // ============================================
  if (filteredAndSortedBooks.length === 0) {
    return (
      <div className="ebook-grid-container" ref={gridRef}>
        {/* Search Bar */}
        <div className="ebook-grid-header">
          <SearchBar
            value={searchQuery}
            onChange={handleSearch}
            onClear={() => setSearchQuery('')}
            inputRef={searchInputRef}
            playHover={playHover}
          />
        </div>
        
        <EmptyState
          icon={<Search size={64} />}
          title="No Books Found"
          message={`No books match "${searchQuery}" with current filters.`}
          action={{
            label: 'Clear Filters',
            onClick: handleClearFilters
          }}
        />
      </div>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div className={`ebook-grid-container ${pathway}-pathway`} ref={gridRef}>
      {/* ========================================
          HEADER SECTION
          ======================================== */}
      <div className="ebook-grid-header">
        {/* Stats Summary */}
        <div className="ebook-stats-summary">
          <StatCard
            icon={<BookOpen size={20} />}
            label="Total Books"
            value={books.length}
            color="gold"
          />
          <StatCard
            icon={<Eye size={20} />}
            label="Showing"
            value={filteredAndSortedBooks.length}
            color="blue"
          />
          {selectedBooks.length > 0 && (
            <StatCard
              icon={<Download size={20} />}
              label="Selected"
              value={selectedBooks.length}
              color="green"
            />
          )}
        </div>

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChange={handleSearch}
          onClear={() => setSearchQuery('')}
          inputRef={searchInputRef}
          playHover={playHover}
        />

        {/* Controls Row */}
        <div className="ebook-grid-controls">
          {/* Filter Toggle */}
          <button
            className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
            onClick={() => {
              playClick();
              setShowFilters(!showFilters);
            }}
            onMouseEnter={playHover}
          >
            <Filter size={18} />
            Filters
            {(selectedGenres.length > 0 || selectedStatus !== 'all') && (
              <span className="filter-badge">
                {selectedGenres.length + (selectedStatus !== 'all' ? 1 : 0)}
              </span>
            )}
          </button>

          {/* Sort Dropdown */}
          <SortDropdown
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            playClick={playClick}
            playHover={playHover}
          />

          {/* View Mode Switcher */}
          <ViewModeSwitcher
            viewMode={viewMode}
            onChange={handleViewModeChange}
            playHover={playHover}
          />

          {/* Bulk Actions */}
          {selectedBooks.length > 0 && (
            <button
              className="bulk-action-btn"
              onClick={handleBulkDownload}
              onMouseEnter={playHover}
            >
              <Download size={18} />
              Download Selected ({selectedBooks.length})
            </button>
          )}
        </div>
      </div>

      {/* ========================================
          FILTER PANEL
          ======================================== */}
      {showFilters && (
        <FilterPanel
          availableGenres={availableGenres}
          selectedGenres={selectedGenres}
          selectedStatus={selectedStatus}
          onGenreToggle={handleGenreToggle}
          onStatusChange={handleStatusChange}
          onClearAll={handleClearFilters}
          playHover={playHover}
        />
      )}

      {/* ========================================
          BOOKS GRID
          ======================================== */}
      <div className={`ebook-grid ebook-grid-${viewMode}`}>
        {paginatedBooks.map((book, index) => (
          <div
            key={book.id}
            className="ebook-grid-item"
            style={{
              animationDelay: animationsEnabled ? `${index * 0.05}s` : '0s'
            }}
          >
            <EBookCard
              book={book}
              onRead={onRead}
              onDownload={onDownload}
              showProgress={showProgress}
              variant={viewMode === 'list' ? 'list' : 'default'}
              isSelected={selectedBooks.includes(book.id)}
              onSelect={() => handleBookSelect(book.id)}
              collections={collections}
              onAddToCollection={onAddToCollection}
            />
          </div>
        ))}
      </div>

      {/* ========================================
          PAGINATION
          ======================================== */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          playHover={playHover}
        />
      )}

      {/* ========================================
          STYLES
          ======================================== */}
      <style jsx>{`
        .ebook-grid-container {
          width: 100%;
          padding: 2rem;
          position: relative;
        }

        /* Header */
        .ebook-grid-header {
          margin-bottom: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* Stats Summary */
        .ebook-stats-summary {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        /* Controls */
        .ebook-grid-controls {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          align-items: center;
        }

        .filter-toggle-btn,
        .bulk-action-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: var(--text-primary);
          font-family: var(--font-josefin);
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .filter-toggle-btn:hover,
        .bulk-action-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--cns-gold);
          transform: translateY(-2px);
        }

        .filter-toggle-btn.active {
          background: var(--cns-gold);
          color: var(--bg-primary);
          border-color: var(--cns-gold);
        }

        .filter-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: var(--cns-gold);
          color: var(--bg-primary);
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 700;
        }

        /* Grid Layout */
        .ebook-grid {
          display: grid;
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .ebook-grid-grid {
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        }

        .ebook-grid-list {
          grid-template-columns: 1fr;
        }

        .ebook-grid-compact {
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .ebook-grid-item {
          animation: fadeInUp 0.5s ease forwards;
          opacity: 0;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Loading */
        .ebook-grid-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .ebook-grid-container {
            padding: 1rem;
          }

          .ebook-grid-grid {
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 1.5rem;
          }

          .ebook-grid-compact {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          }

          .ebook-grid-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-toggle-btn,
          .bulk-action-btn {
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .ebook-grid-grid,
          .ebook-grid-compact {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function StatCard({ icon, label, value, color = 'gold' }) {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
      
      <style jsx>{`
        .stat-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(255, 215, 0, 0.1);
          color: var(--cns-gold);
        }

        .stat-card-blue .stat-icon {
          background: rgba(0, 191, 255, 0.1);
          color: #00BFFF;
        }

        .stat-card-green .stat-icon {
          background: rgba(80, 200, 120, 0.1);
          color: #50C878;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          font-family: var(--font-cinzel);
          color: var(--text-primary);
        }

        .stat-label {
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-family: var(--font-josefin);
        }
      `}</style>
    </div>
  );
}

function SearchBar({ value, onChange, onClear, inputRef, playHover }) {
  return (
    <div className="search-bar">
      <Search className="search-icon" size={20} />
      <input
        ref={inputRef}
        type="text"
        placeholder="Search books by title, author, or description... (Ctrl+K)"
        value={value}
        onChange={onChange}
        className="search-input"
      />
      {value && (
        <button
          className="search-clear"
          onClick={onClear}
          onMouseEnter={playHover}
          aria-label="Clear search"
        >
          <X size={18} />
        </button>
      )}
      
      <style jsx>{`
        .search-bar {
          position: relative;
          width: 100%;
        }

        .search-icon {
          position: absolute;
          left: 1.25rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-secondary);
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          padding: 1rem 3.5rem 1rem 3.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          color: var(--text-primary);
          font-family: var(--font-josefin);
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.08);
          border-color: var(--cns-gold);
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.1);
        }

        .search-input::placeholder {
          color: var(--text-secondary);
        }

        .search-clear {
          position: absolute;
          right: 1.25rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .search-clear:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
}

function SortDropdown({ sortBy, sortOrder, onSortChange, playClick, playHover }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const sortOptions = [
    { value: 'title', label: 'Title', icon: <SortAsc size={16} /> },
    { value: 'author', label: 'Author', icon: <SortAsc size={16} /> },
    { value: 'rating', label: 'Rating', icon: <Star size={16} /> },
    { value: 'dateAdded', label: 'Date Added', icon: <Clock size={16} /> },
    { value: 'downloads', label: 'Downloads', icon: <TrendingUp size={16} /> },
    { value: 'progress', label: 'Progress', icon: <BookOpen size={16} /> }
  ];
  
  const currentSort = sortOptions.find(opt => opt.value === sortBy);
  
  return (
    <div className="sort-dropdown">
      <button
        className="sort-button"
        onClick={() => {
          playClick();
          setIsOpen(!isOpen);
        }}
        onMouseEnter={playHover}
      >
        {currentSort?.icon}
        Sort: {currentSort?.label}
        {sortOrder === 'desc' ? <SortDesc size={16} /> : <SortAsc size={16} />}
        <ChevronDown size={16} className={isOpen ? 'rotate' : ''} />
      </button>
      
      {isOpen && (
        <>
          <div className="sort-overlay" onClick={() => setIsOpen(false)} />
          <div className="sort-menu">
            {sortOptions.map(option => (
              <button
                key={option.value}
                className={`sort-option ${sortBy === option.value ? 'active' : ''}`}
                onClick={() => {
                  onSortChange(option.value);
                  setIsOpen(false);
                }}
                onMouseEnter={playHover}
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
      
      <style jsx>{`
        .sort-dropdown {
          position: relative;
        }

        .sort-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: var(--text-primary);
          font-family: var(--font-josefin);
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .sort-button:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--cns-gold);
        }

        .sort-button .rotate {
          transform: rotate(180deg);
        }

        .sort-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 99;
        }

        .sort-menu {
          position: absolute;
          top: calc(100% + 0.5rem);
          left: 0;
          min-width: 200px;
          background: rgba(10, 10, 15, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 0.5rem;
          z-index: 100;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
          animation: slideDown 0.2s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .sort-option {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.75rem 1rem;
          background: none;
          border: none;
          border-radius: 8px;
          color: var(--text-primary);
          font-family: var(--font-josefin);
          font-size: 0.95rem;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sort-option:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .sort-option.active {
          background: rgba(255, 215, 0, 0.1);
          color: var(--cns-gold);
        }
      `}</style>
    </div>
  );
}

function ViewModeSwitcher({ viewMode, onChange, playHover }) {
  const modes = [
    { value: 'grid', icon: <Grid3x3 size={18} />, label: 'Grid' },
    { value: 'list', icon: <List size={18} />, label: 'List' },
    { value: 'compact', icon: <LayoutGrid size={18} />, label: 'Compact' }
  ];
  
  return (
    <div className="view-mode-switcher">
      {modes.map(mode => (
        <button
          key={mode.value}
          className={`view-mode-btn ${viewMode === mode.value ? 'active' : ''}`}
          onClick={() => onChange(mode.value)}
          onMouseEnter={playHover}
          aria-label={`Switch to ${mode.label} view`}
          title={mode.label}
        >
          {mode.icon}
        </button>
      ))}
      
      <style jsx>{`
        .view-mode-switcher {
          display: flex;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 0.25rem;
        }

        .view-mode-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 0.75rem;
          background: none;
          border: none;
          border-radius: 8px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .view-mode-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
        }

        .view-mode-btn.active {
          background: var(--cns-gold);
          color: var(--bg-primary);
        }
      `}</style>
    </div>
  );
}

function FilterPanel({ 
  availableGenres, 
  selectedGenres, 
  selectedStatus,
  onGenreToggle, 
  onStatusChange,
  onClearAll,
  playHover 
}) {
  const statuses = [
    { value: 'all', label: 'All Books' },
    { value: 'completed', label: 'Completed' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'hiatus', label: 'On Hiatus' }
  ];
  
  return (
    <div className="filter-panel">
      {/* Status Filter */}
      <div className="filter-section">
        <h3 className="filter-title">Status</h3>
        <div className="filter-options">
          {statuses.map(status => (
            <button
              key={status.value}
              className={`filter-chip ${selectedStatus === status.value ? 'active' : ''}`}
              onClick={() => onStatusChange(status.value)}
              onMouseEnter={playHover}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* Genre Filter */}
      <div className="filter-section">
        <h3 className="filter-title">
          Genres
          {selectedGenres.length > 0 && (
            <span className="filter-count">({selectedGenres.length} selected)</span>
          )}
        </h3>
        <div className="filter-options filter-options-wrap">
          {availableGenres.map(genre => (
            <button
              key={genre}
              className={`filter-chip ${selectedGenres.includes(genre) ? 'active' : ''}`}
              onClick={() => onGenreToggle(genre)}
              onMouseEnter={playHover}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Clear All */}
      {(selectedGenres.length > 0 || selectedStatus !== 'all') && (
        <button
          className="clear-filters-btn"
          onClick={onClearAll}
          onMouseEnter={playHover}
        >
          <X size={16} />
          Clear All Filters
        </button>
      )}
      
      <style jsx>{`
        .filter-panel {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
          animation: slideDown 0.3s ease;
        }

        .filter-section {
          margin-bottom: 1.5rem;
        }

        .filter-section:last-of-type {
          margin-bottom: 0;
        }

        .filter-title {
          font-family: var(--font-cinzel);
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .filter-count {
          font-family: var(--font-josefin);
          font-size: 0.9rem;
          font-weight: 400;
          color: var(--cns-gold);
        }

        .filter-options {
          display: flex;
          gap: 0.75rem;
        }

        .filter-options-wrap {
          flex-wrap: wrap;
        }

        .filter-chip {
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          color: var(--text-primary);
          font-family: var(--font-josefin);
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .filter-chip:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--cns-gold);
        }

        .filter-chip.active {
          background: var(--cns-gold);
          color: var(--bg-primary);
          border-color: var(--cns-gold);
        }

        .clear-filters-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: rgba(224, 17, 95, 0.1);
          border: 1px solid rgba(224, 17, 95, 0.3);
          border-radius: 12px;
          color: #E0115F;
          font-family: var(--font-josefin);
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 1.5rem;
        }

        .clear-filters-btn:hover {
          background: rgba(224, 17, 95, 0.2);
          border-color: #E0115F;
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .filter-panel {
            padding: 1.5rem;
          }

          .filter-options {
            flex-direction: column;
          }

          .filter-options-wrap {
            flex-direction: row;
          }
        }
      `}</style>
    </div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange, playHover }) {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
pages.push(i);
}
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
pages.push(i);
}
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
pages.push(i);
}
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };
  
  const pageNumbers = getPageNumbers();
  
  return (
    <div className="pagination">
      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage - 1)}
        onMouseEnter={playHover}
        disabled={currentPage === 1}
      >
        Previous
      </button>
      
      <div className="pagination-numbers">
        {pageNumbers.map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="pagination-ellipsis">
              ...
            </span>
          ) : (
            <button
              key={page}
              className={`pagination-number ${currentPage === page ? 'active' : ''}`}
              onClick={() => onPageChange(page)}
              onMouseEnter={playHover}
            >
              {page}
            </button>
          )
        ))}
      </div>
      
      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage + 1)}
        onMouseEnter={playHover}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
      
      <style jsx>{`
        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 2rem 0;
        }

        .pagination-btn {
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: var(--text-primary);
          font-family: var(--font-josefin);
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .pagination-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--cns-gold);
          transform: translateY(-2px);
        }

        .pagination-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .pagination-numbers {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .pagination-number {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: var(--text-primary);
          font-family: var(--font-josefin);
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pagination-number:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--cns-gold);
          transform: scale(1.1);
        }

        .pagination-number.active {
          background: var(--cns-gold);
          color: var(--bg-primary);
          border-color: var(--cns-gold);
        }

        .pagination-ellipsis {
          color: var(--text-secondary);
          font-family: var(--font-josefin);
          padding: 0 0.5rem;
        }

        @media (max-width: 768px) {
          .pagination {
            gap: 0.5rem;
          }

          .pagination-btn {
            padding: 0.5rem 1rem;
            font-size: 0.85rem;
          }

          .pagination-number {
            width: 36px;
            height: 36px;
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
}