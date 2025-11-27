// ============================================================================
// SITE GRID COMPONENT - EXTERNAL SITE DISCOVERY SYSTEM
// Advanced grid layout for displaying and filtering external websites
// Location: /src/components/pathways/sites/SiteGrid.jsx
// ============================================================================

'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAppContext } from '@/contexts/AppProvider';
import { notify } from '@/components/interactive/NotificationCenter';
import LoadingCrest from '@/components/ui/LoadingCrest';
import EmptyState from '@/components/ui/EmptyState';
import ExternalSiteCard from './ExternalSiteCard';
import { 
  Search, Filter, X, Globe, SortAsc, SortDesc,
  Grid3x3, List, Star, TrendingUp, Clock, Tag
} from 'lucide-react';

/**
 * SiteGrid - External website discovery and filtering system
 * 
 * @param {Object} props
 * @param {Array} props.sites - Array of site objects
 * @param {Array} props.categories - Available categories
 * @param {string} props.defaultCategory - Default selected category
 * @param {Function} props.onSiteVisit - Callback when site is visited
 * @param {string} props.pathway - Current pathway for theming
 */
export default function SiteGrid({
  sites = [],
  categories = [],
  defaultCategory = 'all',
  onSiteVisit,
  pathway = 'lorebound'
}) {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
  const [sortBy, setSortBy] = useState('name'); // name, rating, popularity
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [showFilters, setShowFilters] = useState(false);
  
  const gridRef = useRef(null);
  const searchInputRef = useRef(null);
  
  // ============================================
  // CONTEXT & HOOKS
  // ============================================
  const { playClick, playHover, animationsEnabled, isMobile } = useAppContext();

  // ============================================
  // INITIALIZE
  // ============================================
  useEffect(() => {
    const initGrid = async () => {
      try {
        setLoading(true);
        
        // Simulate loading (remove in production)
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Load saved preferences
        const savedView = localStorage.getItem('site-grid-view');
        const savedSort = localStorage.getItem('site-grid-sort');
        const savedOrder = localStorage.getItem('site-grid-order');
        
        if (savedView) {
setViewMode(savedView);
}
        if (savedSort) {
setSortBy(savedSort);
}
        if (savedOrder) {
setSortOrder(savedOrder);
}
        
        setLoading(false);
      } catch (error) {
        console.error('Grid initialization error:', error);
        setLoading(false);
      }
    };
    
    initGrid();
  }, []);

  // ============================================
  // FILTER & SORT SITES
  // ============================================
  const filteredAndSortedSites = useMemo(() => {
    let result = [...sites];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(site => 
        site.name?.toLowerCase().includes(query) ||
        site.description?.toLowerCase().includes(query) ||
        site.category?.toLowerCase().includes(query) ||
        site.features?.some(f => f.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(site => 
        site.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Sort
    result.sort((a, b) => {
      let compareA, compareB;

      switch (sortBy) {
        case 'name':
          compareA = a.name?.toLowerCase() || '';
          compareB = b.name?.toLowerCase() || '';
          break;
        case 'rating':
          compareA = a.rating || 0;
          compareB = b.rating || 0;
          break;
        case 'popularity':
          compareA = a.popularity || 0;
          compareB = b.popularity || 0;
          break;
        default:
          compareA = a.name?.toLowerCase() || '';
          compareB = b.name?.toLowerCase() || '';
      }

      if (sortOrder === 'asc') {
        return compareA > compareB ? 1 : -1;
      } else {
        return compareA < compareB ? 1 : -1;
      }
    });

    return result;
  }, [sites, searchQuery, selectedCategory, sortBy, sortOrder]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleSearch = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleCategoryChange = useCallback((category) => {
    playClick();
    setSelectedCategory(category);
  }, [playClick]);

  const handleSortChange = useCallback((newSortBy) => {
    playClick();
    
    if (newSortBy === sortBy) {
      const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      setSortOrder(newOrder);
      localStorage.setItem('site-grid-order', newOrder);
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
      localStorage.setItem('site-grid-sort', newSortBy);
      localStorage.setItem('site-grid-order', 'asc');
    }
  }, [sortBy, sortOrder, playClick]);

  const handleViewModeChange = useCallback((mode) => {
    playClick();
    setViewMode(mode);
    localStorage.setItem('site-grid-view', mode);
  }, [playClick]);

  const handleClearFilters = useCallback(() => {
    playClick();
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('name');
    setSortOrder('asc');
    notify.success('Filters cleared');
  }, [playClick]);

  const handleSiteVisit = useCallback((site) => {
    // Track visit
    const visits = JSON.parse(localStorage.getItem('site-visits') || '{}');
    visits[site.url] = (visits[site.url] || 0) + 1;
    localStorage.setItem('site-visits', JSON.stringify(visits));
    
    if (onSiteVisit) {
      onSiteVisit(site);
    }
  }, [onSiteVisit]);

  // ============================================
  // KEYBOARD SHORTCUTS
  // ============================================
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
return;
}

      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
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
      <div className="grid-loading">
        <LoadingCrest 
          pathway={pathway} 
          message="Loading sites..."
        />
      </div>
    );
  }

  // ============================================
  // RENDER: EMPTY STATE
  // ============================================
  if (sites.length === 0) {
    return (
      <EmptyState
        icon={<Globe size={64} />}
        title="No Sites Available"
        message="No external sites have been added yet."
      />
    );
  }

  // ============================================
  // RENDER: NO RESULTS
  // ============================================
  if (filteredAndSortedSites.length === 0) {
    return (
      <div className="site-grid-container" ref={gridRef}>
        {/* Search Bar */}
        <div className="grid-header">
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
          title="No Sites Found"
          message={`No sites match your search "${searchQuery}"`}
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
    <div className={`site-grid-container ${pathway}-pathway`} ref={gridRef}>
      {/* Header Section */}
      <div className="grid-header">
        {/* Stats Summary */}
        <div className="grid-stats">
          <StatCard
            icon={<Globe size={18} />}
            label="Total Sites"
            value={sites.length}
            color="gold"
          />
          <StatCard
            icon={<Filter size={18} />}
            label="Showing"
            value={filteredAndSortedSites.length}
            color="blue"
          />
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
        <div className="grid-controls">
          {/* Filter Toggle */}
          <button
            className={`control-btn ${showFilters ? 'active' : ''}`}
            onClick={() => {
              playClick();
              setShowFilters(!showFilters);
            }}
            onMouseEnter={playHover}
          >
            <Filter size={16} />
            Filters
            {selectedCategory !== 'all' && (
              <span className="filter-badge">1</span>
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
        </div>
      </div>

      {/* Category Filter */}
      {showFilters && categories.length > 0 && (
        <div className="category-filter">
          <button
            className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('all')}
            onMouseEnter={playHover}
          >
            All Sites
          </button>
          {categories.map((category) => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category)}
              onMouseEnter={playHover}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {/* Sites Grid */}
      <div className={`sites-grid sites-grid-${viewMode}`}>
        {filteredAndSortedSites.map((site, index) => (
          <div
            key={site.url || index}
            className="grid-item"
            style={{
              animationDelay: animationsEnabled ? `${index * 0.05}s` : '0s'
            }}
          >
            <ExternalSiteCard
              site={site}
              onVisit={handleSiteVisit}
              variant={viewMode === 'list' ? 'compact' : 'default'}
              pathway={pathway}
            />
          </div>
        ))}
      </div>

      {/* Styles */}
      <style jsx>{`
        .site-grid-container {
          width: 100%;
          padding: 2rem;
        }

        /* Header */
        .grid-header {
          margin-bottom: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* Stats */
        .grid-stats {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        /* Controls */
        .grid-controls {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          align-items: center;
        }

        .control-btn {
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

        .control-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--cns-gold);
        }

        .control-btn.active {
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

        /* Category Filter */
        .category-filter {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          margin-bottom: 2rem;
        }

        .category-btn {
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          color: var(--text-primary);
          font-family: var(--font-josefin);
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .category-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--cns-gold);
        }

        .category-btn.active {
          background: var(--cns-gold);
          color: var(--bg-primary);
          border-color: var(--cns-gold);
        }

        /* Sites Grid */
        .sites-grid {
          display: grid;
          gap: 2rem;
        }

        .sites-grid-grid {
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        }

        .sites-grid-list {
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        .grid-item {
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
        .grid-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .site-grid-container {
            padding: 1.5rem;
          }

          .sites-grid-grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .site-grid-container {
            padding: 1rem;
          }

          .sites-grid-grid {
            grid-template-columns: 1fr;
          }

          .grid-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .control-btn {
            justify-content: center;
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
    <div className={`stat-card stat-${color}`}>
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
        }

        .stat-icon {
          color: var(--cns-gold);
        }

        .stat-blue .stat-icon {
          color: #00BFFF;
        }

        .stat-value {
          font-family: var(--font-cinzel);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1;
        }

        .stat-label {
          font-family: var(--font-josefin);
          font-size: 0.85rem;
          color: var(--text-secondary);
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
        placeholder="Search sites... (Ctrl+K)"
        value={value}
        onChange={onChange}
        className="search-input"
      />
      {value && (
        <button
          className="search-clear"
          onClick={onClear}
          onMouseEnter={playHover}
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
          padding: 1rem 3.5rem;
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
        }
      `}</style>
    </div>
  );
}

function SortDropdown({ sortBy, sortOrder, onSortChange, playClick, playHover }) {
  const [isOpen, setIsOpen] = useState(false);

  const sortOptions = [
    { value: 'name', label: 'Name', icon: <Tag size={16} /> },
    { value: 'rating', label: 'Rating', icon: <Star size={16} /> },
    { value: 'popularity', label: 'Popularity', icon: <TrendingUp size={16} /> }
  ];

  const currentSort = sortOptions.find(opt => opt.value === sortBy);

  return (
    <div className="sort-dropdown">
      <button
        className="sort-btn"
        onClick={() => {
          playClick();
          setIsOpen(!isOpen);
        }}
        onMouseEnter={playHover}
      >
        {currentSort?.icon}
        Sort: {currentSort?.label}
        {sortOrder === 'desc' ? <SortDesc size={16} /> : <SortAsc size={16} />}
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

        .sort-btn {
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
        }

        .sort-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--cns-gold);
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
          min-width: 180px;
          background: rgba(10, 10, 15, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 0.5rem;
          z-index: 100;
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
  return (
    <div className="view-switcher">
      <button
        className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
        onClick={() => onChange('grid')}
        onMouseEnter={playHover}
        title="Grid view"
      >
        <Grid3x3 size={18} />
      </button>
      <button
        className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
        onClick={() => onChange('list')}
        onMouseEnter={playHover}
        title="List view"
      >
        <List size={18} />
      </button>

      <style jsx>{`
        .view-switcher {
          display: flex;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 0.25rem;
        }

        .view-btn {
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

        .view-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
        }

        .view-btn.active {
          background: var(--cns-gold);
          color: var(--bg-primary);
        }
      `}</style>
    </div>
  );
}