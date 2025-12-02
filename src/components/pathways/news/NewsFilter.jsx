// ============================================================================
// THE CONCLAVE REALM - NEWS FILTER COMPONENT
// Location: /src/components/pathways/news/NewsFilter.jsx
// ============================================================================
// Purpose: Advanced filtering for news feed (category, country, date range)
// Uses: GlassCard, LuxuryButton
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import {
  Filter,
  X,
  Search,
  Globe,
  Calendar,
  Tag,
  TrendingUp,
  CheckCircle,
  ChevronDown,
  SlidersHorizontal
} from 'lucide-react';

// Internal components
import GlassCard from '@/components/ui/GlassCard';
import LuxuryButton, { NewsButton } from '@/components/ui/LuxuryButton';
import { useAppContext } from '@/contexts/AppProvider';
import { notify } from '@/components/interactive/NotificationCenter';

/**
 * @component NewsFilter
 * @description Advanced filter panel for news feed
 * 
 * @param {Function} onFilterChange - Callback when filters change
 * @param {Object} initialFilters - Initial filter state
 * @param {boolean} showAdvanced - Show advanced filter options
 * @param {string} variant - 'sidebar'|'horizontal'|'modal'
 * @param {string} pathway - Pathway theme
 */
export default function NewsFilter({
  onFilterChange,
  initialFilters = {},
  showAdvanced = true,
  variant = 'sidebar',
  pathway = 'news'
}) {
  // ============================================================================
  // STATE
  // ============================================================================
  const { playClick, playHover } = useAppContext();
  
  const [filters, setFilters] = useState({
    category: initialFilters.category || 'general',
    country: initialFilters.country || 'us',
    query: initialFilters.query || '',
    dateRange: initialFilters.dateRange || 'all',
    sortBy: initialFilters.sortBy || 'publishedAt',
    sources: initialFilters.sources || []
  });

  const [isExpanded, setIsExpanded] = useState(true);
  const [searchInput, setSearchInput] = useState(filters.query);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // ============================================================================
  // FILTER OPTIONS
  // ============================================================================

  const categories = [
    { id: 'general', name: 'General', icon: '📰' },
    { id: 'business', name: 'Business', icon: '💼' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
    { id: 'health', name: 'Health', icon: '🏥' },
    { id: 'science', name: 'Science', icon: '🔬' },
    { id: 'sports', name: 'Sports', icon: '⚽' },
    { id: 'technology', name: 'Technology', icon: '💻' }
  ];

  const countries = [
    { code: 'us', name: 'United States', flag: '🇺🇸' },
    { code: 'gb', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'ca', name: 'Canada', flag: '🇨🇦' },
    { code: 'au', name: 'Australia', flag: '🇦🇺' },
    { code: 'in', name: 'India', flag: '🇮🇳' },
    { code: 'de', name: 'Germany', flag: '🇩🇪' },
    { code: 'fr', name: 'France', flag: '🇫🇷' },
    { code: 'jp', name: 'Japan', flag: '🇯🇵' },
    { code: 'cn', name: 'China', flag: '🇨🇳' }
  ];

  const dateRanges = [
    { id: 'all', name: 'All Time', icon: Calendar },
    { id: 'today', name: 'Today', icon: Calendar },
    { id: 'week', name: 'This Week', icon: Calendar },
    { id: 'month', name: 'This Month', icon: Calendar }
  ];

  const sortOptions = [
    { id: 'publishedAt', name: 'Latest First' },
    { id: 'relevancy', name: 'Most Relevant' },
    { id: 'popularity', name: 'Most Popular' }
  ];

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Calculate active filters count
  useEffect(() => {
    let count = 0;
    if (filters.category !== 'general') count++;
    if (filters.country !== 'us') count++;
    if (filters.query) count++;
    if (filters.dateRange !== 'all') count++;
    if (filters.sources.length > 0) count++;
    setActiveFiltersCount(count);
  }, [filters]);

  // Notify parent of filter changes
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filters);
    }
  }, [filters, onFilterChange]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleCategoryChange = (categoryId) => {
    playClick();
    setFilters(prev => ({ ...prev, category: categoryId }));
  };

  const handleCountryChange = (countryCode) => {
    playClick();
    setFilters(prev => ({ ...prev, country: countryCode }));
  };

  const handleDateRangeChange = (rangeId) => {
    playClick();
    setFilters(prev => ({ ...prev, dateRange: rangeId }));
  };

  const handleSortChange = (sortId) => {
    playClick();
    setFilters(prev => ({ ...prev, sortBy: sortId }));
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    playClick();
    setFilters(prev => ({ ...prev, query: searchInput }));
    
    if (searchInput) {
      notify.info(`Searching for: ${searchInput}`, { duration: 2000 });
    }
  };

  const handleReset = () => {
    playClick();
    
    const defaultFilters = {
      category: 'general',
      country: 'us',
      query: '',
      dateRange: 'all',
      sortBy: 'publishedAt',
      sources: []
    };
    
    setFilters(defaultFilters);
    setSearchInput('');
    notify.success('Filters reset', { duration: 2000 });
  };

  const toggleExpanded = () => {
    playClick();
    setIsExpanded(!isExpanded);
  };

  // ============================================================================
  // RENDER HORIZONTAL VARIANT
  // ============================================================================

  if (variant === 'horizontal') {
    return (
      <GlassCard className="news-filter news-filter-horizontal">
        <div className="horizontal-content">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="search-form-inline">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search news..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="search-input-inline text-body"
            />
            <NewsButton type="submit" size="small">
              Search
            </NewsButton>
          </form>

          {/* Category Pills */}
          <div className="category-pills">
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`category-pill ${filters.category === cat.id ? 'pill-active' : ''}`}
                onClick={() => handleCategoryChange(cat.id)}
                onMouseEnter={playHover}
              >
                <span>{cat.icon}</span>
                <span className="text-label-sm">{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Filter Button */}
          <button
            className="filter-toggle-button"
            onClick={toggleExpanded}
            onMouseEnter={playHover}
          >
            <SlidersHorizontal size={18} />
            <span className="text-body-sm">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="filter-badge">{activeFiltersCount}</span>
            )}
          </button>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="expanded-filters">
            <div className="filter-row">
              <div className="filter-group">
                <label className="text-label-sm filter-label">Country</label>
                <select
                  value={filters.country}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="filter-select text-body"
                >
                  {countries.map(country => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label className="text-label-sm filter-label">Date Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => handleDateRangeChange(e.target.value)}
                  className="filter-select text-body"
                >
                  {dateRanges.map(range => (
                    <option key={range.id} value={range.id}>
                      {range.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label className="text-label-sm filter-label">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="filter-select text-body"
                >
                  {sortOptions.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              <NewsButton
                variant="secondary"
                size="small"
                onClick={handleReset}
              >
                <X size={16} />
                Reset
              </NewsButton>
            </div>
          </div>
        )}
      </GlassCard>
    );
  }

  // ============================================================================
  // RENDER SIDEBAR VARIANT (DEFAULT)
  // ============================================================================

  return (
    <div className="news-filter news-filter-sidebar">
      {/* Header */}
      <div className="filter-header">
        <div className="header-title">
          <Filter size={20} />
          <h4 className="text-h4">Filters</h4>
        </div>
        {activeFiltersCount > 0 && (
          <button
            className="reset-button text-label-sm"
            onClick={handleReset}
            onMouseEnter={playHover}
          >
            <X size={14} />
            Reset
          </button>
        )}
      </div>

      {/* Search */}
      <div className="filter-section">
        <label className="text-label filter-label">
          <Search size={16} />
          Search
        </label>
        <form onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Search news..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="search-input text-body"
          />
          <NewsButton type="submit" fullWidth size="small">
            Search
          </NewsButton>
        </form>
      </div>

      {/* Category */}
      <div className="filter-section">
        <label className="text-label filter-label">
          <Tag size={16} />
          Category
        </label>
        <div className="category-grid">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`category-button ${filters.category === cat.id ? 'button-active' : ''}`}
              onClick={() => handleCategoryChange(cat.id)}
              onMouseEnter={playHover}
            >
              <span className="category-icon">{cat.icon}</span>
              <span className="text-label-sm category-name">{cat.name}</span>
              {filters.category === cat.id && (
                <CheckCircle size={14} className="check-icon" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Country */}
      <div className="filter-section">
        <label className="text-label filter-label">
          <Globe size={16} />
          Country
        </label>
        <select
          value={filters.country}
          onChange={(e) => handleCountryChange(e.target.value)}
          className="filter-select text-body"
        >
          {countries.map(country => (
            <option key={country.code} value={country.code}>
              {country.flag} {country.name}
            </option>
          ))}
        </select>
      </div>

      {/* Date Range */}
      {showAdvanced && (
        <div className="filter-section">
          <label className="text-label filter-label">
            <Calendar size={16} />
            Date Range
          </label>
          <div className="date-range-buttons">
            {dateRanges.map(range => (
              <button
                key={range.id}
                className={`date-button ${filters.dateRange === range.id ? 'button-active' : ''}`}
                onClick={() => handleDateRangeChange(range.id)}
                onMouseEnter={playHover}
              >
                <span className="text-label-sm">{range.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sort By */}
      {showAdvanced && (
        <div className="filter-section">
          <label className="text-label filter-label">
            <TrendingUp size={16} />
            Sort By
          </label>
          <div className="sort-buttons">
            {sortOptions.map(option => (
              <button
                key={option.id}
                className={`sort-button ${filters.sortBy === option.id ? 'button-active' : ''}`}
                onClick={() => handleSortChange(option.id)}
                onMouseEnter={playHover}
              >
                <span className="text-label-sm">{option.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Filters Badge */}
      {activeFiltersCount > 0 && (
        <div className="active-filters-badge">
          <span className="text-label-sm">
            {activeFiltersCount} {activeFiltersCount === 1 ? 'filter' : 'filters'} active
          </span>
        </div>
      )}

      {/* Styles */}
      <style jsx>{`
        .news-filter {
          width: 100%;
        }

        /* Sidebar Variant */
        .news-filter-sidebar {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .filter-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--news-primary);
        }

        .reset-button {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.5rem 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .reset-button:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--news-primary);
        }

        /* Filter Sections */
        .filter-section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .filter-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          font-weight: 600;
        }

        .filter-label svg {
          color: var(--news-primary);
        }

        /* Search Input */
        .search-input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: var(--text-primary);
          transition: all 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--news-primary);
          box-shadow: 0 0 20px rgba(224, 17, 95, 0.2);
        }

        /* Category Grid */
        .category-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        .category-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .category-button:hover {
          background: rgba(255, 255, 255, 0.05);
          transform: translateY(-2px);
        }

        .button-active {
          background: rgba(224, 17, 95, 0.2);
          border-color: var(--news-primary);
        }

        .category-icon {
          font-size: 1.5rem;
        }

        .category-name {
          color: var(--text-primary);
          text-align: center;
        }

        .check-icon {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          color: var(--news-primary);
        }

        /* Select Dropdowns */
        .filter-select {
          width: 100%;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-select:focus {
          outline: none;
          border-color: var(--news-primary);
        }

        /* Date Range Buttons */
        .date-range-buttons,
        .sort-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .date-button,
        .sort-button {
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .date-button:hover,
        .sort-button:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
        }

        .date-button.button-active,
        .sort-button.button-active {
          background: rgba(224, 17, 95, 0.2);
          border-color: var(--news-primary);
          color: var(--news-primary);
        }

        /* Active Filters Badge */
        .active-filters-badge {
          padding: 0.75rem 1rem;
          background: linear-gradient(135deg, var(--news-primary), var(--news-secondary));
          border-radius: 12px;
          color: white;
          text-align: center;
          font-weight: 600;
        }

        /* Horizontal Variant */
        .news-filter-horizontal {
          padding: 1.5rem;
        }

        .horizontal-content {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          align-items: center;
        }

        .search-form-inline {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          flex: 1;
          min-width: 300px;
        }

        .search-input-inline {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
        }

        .category-pills {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .category-pill {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .category-pill:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .pill-active {
          background: var(--news-primary);
          color: white;
          border-color: var(--news-primary);
        }

        .filter-toggle-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .filter-toggle-button:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .filter-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--news-primary);
          color: white;
          border-radius: 50%;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .expanded-filters {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .filter-row {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          align-items: flex-end;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
          min-width: 150px;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .category-grid {
            grid-template-columns: 1fr;
          }

          .horizontal-content {
            flex-direction: column;
            align-items: stretch;
          }

          .search-form-inline {
            min-width: 100%;
          }

          .category-pills {
            width: 100%;
            overflow-x: auto;
            flex-wrap: nowrap;
          }

          .filter-row {
            flex-direction: column;
          }

          .filter-group {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}