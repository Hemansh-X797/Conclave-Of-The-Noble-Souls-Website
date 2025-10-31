import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Import styles
import '@/styles/navigation.css';
import '@/styles/design_system.css';
import '@/styles/typography.css';

/**
 * Searchbar Component
 * Luxury minimalistic search bar with autocomplete for The Conclave
 * 
 * @component
 * @example
 * <Searchbar 
 *   onSearch={(query) => console.log(query)}
 *   placeholder="Search the Conclave..."
 * />
 */
const Searchbar = ({
  // Configuration
  placeholder = 'Search the Conclave...',
  autoFocus = false,
  showShortcut = true,
  debounceMs = 300,
  minChars = 2,
  maxResults = 8,
  
  // Callbacks
  onSearch,
  onSelect,
  onClear,
  onFocus,
  onBlur,
  
  // Custom data
  customSearchEndpoint = '/api/search',
  customResults = null,
  
  // Additional props
  className = '',
  ...restProps
}) => {
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState([]);
  
  // ============================================================================
  // REFS
  // ============================================================================
  
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimer = useRef(null);
  const abortController = useRef(null);
  
  // ============================================================================
  // HOOKS
  // ============================================================================
  
  const router = useRouter();
  
  // ============================================================================
  // LOAD RECENT SEARCHES
  // ============================================================================
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cns_recent_searches');
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved).slice(0, 5));
        } catch (e) {
          console.error('Failed to parse recent searches:', e);
        }
      }
    }
  }, []);
  
  // ============================================================================
  // KEYBOARD SHORTCUT
  // ============================================================================
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      // CMD/CTRL + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      
      // ESC to close
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // ============================================================================
  // OUTSIDE CLICK
  // ============================================================================
  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // ============================================================================
  // SEARCH FUNCTION
  // ============================================================================
  
  const performSearch = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.length < minChars) {
      setResults([]);
      return;
    }
    
    setIsLoading(true);
    
    // Cancel previous request
    if (abortController.current) {
      abortController.current.abort();
    }
    
    abortController.current = new AbortController();
    
    try {
      if (customResults) {
        // Use custom results for demo/testing
        const filtered = customResults.filter(item =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, maxResults);
        
        setResults(filtered);
      } else {
        // Real API call
        const response = await fetch(
          `${customSearchEndpoint}?q=${encodeURIComponent(searchQuery)}&limit=${maxResults}`,
          { signal: abortController.current.signal }
        );
        
        if (!response.ok) throw new Error('Search failed');
        
        const data = await response.json();
        setResults(data.results || []);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Search error:', error);
        setResults([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [customSearchEndpoint, customResults, minChars, maxResults]);
  
  // ============================================================================
  // DEBOUNCED SEARCH
  // ============================================================================
  
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    if (query.trim()) {
      debounceTimer.current = setTimeout(() => {
        performSearch(query.trim());
      }, debounceMs);
    } else {
      setResults([]);
    }
    
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, debounceMs, performSearch]);
  
  // ============================================================================
  // HANDLERS
  // ============================================================================
  
  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    
    if (value.trim()) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, []);
  
  const handleInputFocus = useCallback(() => {
    setIsOpen(true);
    if (onFocus) onFocus();
  }, [onFocus]);
  
  const handleInputBlur = useCallback(() => {
    // Delay to allow click on results
    setTimeout(() => {
      if (onBlur) onBlur();
    }, 200);
  }, [onBlur]);
  
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    // Save to recent searches
    const newRecent = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(newRecent);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('cns_recent_searches', JSON.stringify(newRecent));
    }
    
    if (onSearch) {
      onSearch(query.trim());
    }
    
    // Navigate to search results page
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    
    setIsOpen(false);
    inputRef.current?.blur();
  }, [query, recentSearches, onSearch, router]);
  
  const handleSelect = useCallback((item) => {
    if (onSelect) {
      onSelect(item);
    }
    
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  }, [onSelect]);
  
  const handleClear = useCallback(() => {
    setQuery('');
    setResults([]);
    setSelectedIndex(-1);
    inputRef.current?.focus();
    
    if (onClear) {
      onClear();
    }
  }, [onClear]);
  
  const handleKeyDown = useCallback((e) => {
    if (!isOpen || results.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > -1 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        } else {
          handleSubmit(e);
        }
        break;
    }
  }, [isOpen, results, selectedIndex, handleSelect, handleSubmit]);
  
  const handleRecentClick = useCallback((search) => {
    setQuery(search);
    inputRef.current?.focus();
  }, []);
  
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cns_recent_searches');
    }
  }, []);
  
  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================
  
  const renderSearchIcon = () => (
    <svg className="searchbar-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="11" cy="11" r="8" strokeWidth="2" />
      <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
  
  const renderClearButton = () => {
    if (!query) return null;
    
    return (
      <button
        type="button"
        className="searchbar-clear"
        onClick={handleClear}
        aria-label="Clear search"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    );
  };
  
  const renderShortcut = () => {
    if (!showShortcut || query) return null;
    
    const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    
    return (
      <kbd className="searchbar-shortcut">
        <span>{isMac ? '⌘' : 'Ctrl'}</span>
        <span>K</span>
      </kbd>
    );
  };
  
  const renderResults = () => {
    if (!isOpen) return null;
    
    const showRecent = !query && recentSearches.length > 0;
    const showResults = query && results.length > 0;
    const showEmpty = query && !isLoading && results.length === 0;
    
    if (!showRecent && !showResults && !showEmpty) return null;
    
    return (
      <div className="searchbar-dropdown">
        {showRecent && (
          <div className="searchbar-section">
            <div className="searchbar-section-header">
              <span className="searchbar-section-title">Recent Searches</span>
              <button
                className="searchbar-section-action"
                onClick={clearRecentSearches}
              >
                Clear
              </button>
            </div>
            <ul className="searchbar-results">
              {recentSearches.map((search, idx) => (
                <li key={idx}>
                  <button
                    className="searchbar-result-item"
                    onClick={() => handleRecentClick(search)}
                  >
                    <svg className="searchbar-result-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" strokeWidth="2" />
                      <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span className="searchbar-result-text">{search}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {isLoading && (
          <div className="searchbar-loading">
            <div className="spinner"></div>
            <span>Searching...</span>
          </div>
        )}
        
        {showResults && (
          <div className="searchbar-section">
            <span className="searchbar-section-title">Results</span>
            <ul className="searchbar-results">
              {results.map((result, idx) => (
                <li key={result.id || idx}>
                  <Link
                    href={result.href || result.url}
                    className={`searchbar-result-item ${selectedIndex === idx ? 'selected' : ''}`}
                    onClick={() => handleSelect(result)}
                  >
                    {result.icon && (
                      <span className="searchbar-result-icon" aria-hidden="true">
                        {result.icon}
                      </span>
                    )}
                    <div className="searchbar-result-content">
                      <span className="searchbar-result-title">{result.title}</span>
                      {result.description && (
                        <span className="searchbar-result-description">{result.description}</span>
                      )}
                    </div>
                    {result.category && (
                      <span className="searchbar-result-category">{result.category}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {showEmpty && (
          <div className="searchbar-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8" strokeWidth="2" />
              <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p className="searchbar-empty-title">No results found</p>
            <p className="searchbar-empty-text">
              Try searching with different keywords
            </p>
          </div>
        )}
      </div>
    );
  };
  
  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  
  return (
    <div ref={searchRef} className={`searchbar-divine ${className}`} {...restProps}>
      <form onSubmit={handleSubmit} role="search">
        <div className="searchbar-input-wrapper">
          {renderSearchIcon()}
          
          <input
            ref={inputRef}
            type="search"
            className="searchbar-input"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            autoFocus={autoFocus}
            autoComplete="off"
            spellCheck="false"
            aria-label="Search"
            aria-autocomplete="list"
            aria-controls="search-results"
            aria-expanded={isOpen}
          />
          
          {renderClearButton()}
          {renderShortcut()}
        </div>
      </form>
      
      {renderResults()}
    </div>
  );
};

export default Searchbar;