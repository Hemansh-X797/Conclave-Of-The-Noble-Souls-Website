import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { TextFlameButton, TextDimButton } from '@/ui/Luxurybutton';

/**
 * GalleryGrid Component
 * Premium media gallery with masonry layout and lightbox
 * Fully utilizes content.css styling system
 * 
 * @version 2.0 - The Conclave Realm
 */

const GalleryGrid = ({
  // Core Data
  items = [],
  
  // Layout Configuration
  layout = 'masonry', // 'masonry', 'grid', 'justified'
  columns = 3, // 2, 3, 4
  gap = 'md', // 'sm', 'md', 'lg'
  aspectRatio = 'auto', // 'auto', 'square', 'landscape', 'portrait'
  
  // Display Options
  showOverlay = true,
  showInfo = true,
  showAuthor = true,
  enableLightbox = true,
  enableInfiniteScroll = false,
  
  // Filtering
  filterByPathway = null,
  filterByCategory = null,
  searchQuery = '',
  
  // Interactive
  onItemClick,
  onAuthorClick,
  onLoadMore,
  
  // Pathway Theming
  pathway, // 'gaming', 'lorebound', 'productive', 'news'
  
  // Customization
  className = '',
  style = {},
  
  // Advanced
  lazyLoad = true,
  virtualized = false,
  
  // Debug
  debug = false,
  
  ...restProps
}) => {
  // Refs
  const gridRef = useRef(null);
  const lightboxRef = useRef(null);
  const observerRef = useRef(null);
  
  // State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filteredItems, setFilteredItems] = useState(items);
  const [visibleItems, setVisibleItems] = useState(items.slice(0, 20));
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPathway, setSelectedPathway] = useState(filterByPathway);
  const [selectedCategory, setSelectedCategory] = useState(filterByCategory);
  const [search, setSearch] = useState(searchQuery);
  
  // Filter items
  useEffect(() => {
    let filtered = [...items];
    
    if (selectedPathway) {
      filtered = filtered.filter(item => item.pathway === selectedPathway);
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter(item =>
        item.title?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.author?.name?.toLowerCase().includes(query)
      );
    }
    
    setFilteredItems(filtered);
    setVisibleItems(filtered.slice(0, 20));
  }, [items, selectedPathway, selectedCategory, search]);
  
  // Infinite scroll
  useEffect(() => {
    if (!enableInfiniteScroll || !gridRef.current) return;
    
    const options = {
      root: null,
      rootMargin: '200px',
      threshold: 0.1
    };
    
    const callback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !isLoading) {
          loadMoreItems();
        }
      });
    };
    
    observerRef.current = new IntersectionObserver(callback, options);
    
    const sentinel = gridRef.current.querySelector('.gallery-sentinel');
    if (sentinel) {
      observerRef.current.observe(sentinel);
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enableInfiniteScroll, isLoading, visibleItems.length, filteredItems.length]);
  
  // Load more items
  const loadMoreItems = useCallback(() => {
    if (visibleItems.length >= filteredItems.length) return;
    
    setIsLoading(true);
    
    setTimeout(() => {
      const nextBatch = filteredItems.slice(
        visibleItems.length,
        visibleItems.length + 20
      );
      setVisibleItems(prev => [...prev, ...nextBatch]);
      setIsLoading(false);
      
      if (onLoadMore) {
        onLoadMore(nextBatch);
      }
    }, 500);
  }, [visibleItems.length, filteredItems, onLoadMore]);
  
  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        navigateLightbox('prev');
      } else if (e.key === 'ArrowRight') {
        navigateLightbox('next');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, currentIndex]);
  
  // Open lightbox
  const openLightbox = useCallback((index) => {
    if (!enableLightbox) return;
    setCurrentIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  }, [enableLightbox]);
  
  // Close lightbox
  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    document.body.style.overflow = '';
  }, []);
  
  // Navigate lightbox
  const navigateLightbox = useCallback((direction) => {
    if (direction === 'prev') {
      setCurrentIndex(prev => 
        prev === 0 ? filteredItems.length - 1 : prev - 1
      );
    } else {
      setCurrentIndex(prev => 
        prev === filteredItems.length - 1 ? 0 : prev + 1
      );
    }
  }, [filteredItems.length]);
  
  // Handle item click
  const handleItemClick = useCallback((item, index) => {
    if (onItemClick) {
      onItemClick(item, index);
    }
    
    if (enableLightbox) {
      openLightbox(index);
    }
  }, [onItemClick, enableLightbox, openLightbox]);
  
  // Generate grid classes
  const getGridClasses = useCallback(() => {
    const classes = ['gallery-grid-container'];
    
    if (layout === 'masonry') classes.push('gallery-masonry');
    else if (layout === 'grid') classes.push(`content-grid content-grid-${columns}`);
    else if (layout === 'justified') classes.push('gallery-justified');
    
    const gapClasses = { sm: 'gap-4', md: 'gap-6', lg: 'gap-8' };
    classes.push(gapClasses[gap] || 'gap-6');
    
    if (pathway) classes.push(`gallery-pathway-${pathway}`);
    if (className) classes.push(className);
    
    return classes.join(' ');
  }, [layout, columns, gap, pathway, className]);
  
  // Get aspect ratio class
  const getAspectClass = useCallback((item) => {
    if (aspectRatio !== 'auto') return `gallery-item-${aspectRatio}`;
    if (item.aspectRatio) return `gallery-item-${item.aspectRatio}`;
    return 'gallery-item-auto';
  }, [aspectRatio]);
  
  // Render gallery item
  const renderGalleryItem = (item, index) => {
    const itemPathway = item.pathway || pathway;
    
    return (
      <div
        key={item.id || index}
        className={`gallery-item ${getAspectClass(item)} ${itemPathway ? `${itemPathway}-realm` : ''}`}
        onClick={() => handleItemClick(item, index)}
        data-cursor="hover"
      >
        <div className="gallery-item-inner">
          {/* Image */}
          <div className="gallery-item-image">
            <Image
              src={item.src || item.url}
              alt={item.alt || item.title || 'Gallery image'}
              fill
              className="gallery-image"
              style={{ objectFit: 'cover' }}
              loading={lazyLoad ? 'lazy' : 'eager'}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          
          {/* Overlay */}
          {showOverlay && (
            <div className="gallery-item-overlay">
              {showInfo && (
                <div className="gallery-item-info">
                  {item.title && (
                    <h4 className="gallery-item-title">{item.title}</h4>
                  )}
                  {item.description && (
                    <p className="gallery-item-description">{item.description}</p>
                  )}
                  
                  {showAuthor && item.author && (
                    <div 
                      className="gallery-item-author"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onAuthorClick) onAuthorClick(item.author);
                      }}
                    >
                      {item.author.avatar && (
                        <Image
                          src={item.author.avatar}
                          alt={item.author.name}
                          width={24}
                          height={24}
                          className="gallery-author-avatar"
                        />
                      )}
                      <span className="gallery-author-name">{item.author.name}</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Stats */}
              {item.stats && (
                <div className="gallery-item-stats">
                  {item.stats.likes > 0 && (
                    <span className="gallery-stat">❤️ {item.stats.likes}</span>
                  )}
                  {item.stats.views > 0 && (
                    <span className="gallery-stat">👁️ {item.stats.views}</span>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Category badge */}
          {item.category && (
            <div className="gallery-item-category">
              {item.category}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Render lightbox
  const renderLightbox = () => {
    if (!lightboxOpen || !filteredItems[currentIndex]) return null;
    
    const item = filteredItems[currentIndex];
    
    return (
      <div 
        className="gallery-lightbox-overlay"
        onClick={closeLightbox}
        ref={lightboxRef}
      >
        <div className="gallery-lightbox-container">
          {/* Close button */}
          <button
            className="gallery-lightbox-close"
            onClick={closeLightbox}
            data-cursor="hover"
            aria-label="Close lightbox"
          >
            ✕
          </button>
          
          {/* Navigation */}
          <button
            className="gallery-lightbox-nav gallery-lightbox-prev"
            onClick={(e) => {
              e.stopPropagation();
              navigateLightbox('prev');
            }}
            data-cursor="hover"
            aria-label="Previous image"
          >
            ‹
          </button>
          
          <button
            className="gallery-lightbox-nav gallery-lightbox-next"
            onClick={(e) => {
              e.stopPropagation();
              navigateLightbox('next');
            }}
            data-cursor="hover"
            aria-label="Next image"
          >
            ›
          </button>
          
          {/* Image */}
          <div 
            className="gallery-lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={item.src || item.url}
              alt={item.alt || item.title || 'Gallery image'}
              fill
              className="gallery-lightbox-image"
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
          
          {/* Info */}
          <div className="gallery-lightbox-info">
            {item.title && (
              <h3 className="gallery-lightbox-title">{item.title}</h3>
            )}
            {item.description && (
              <p className="gallery-lightbox-description">{item.description}</p>
            )}
            {showAuthor && item.author && (
              <div className="gallery-lightbox-author">
                {item.author.avatar && (
                  <Image
                    src={item.author.avatar}
                    alt={item.author.name}
                    width={32}
                    height={32}
                    className="gallery-author-avatar"
                  />
                )}
                <span>{item.author.name}</span>
              </div>
            )}
            
            {/* Counter */}
            <div className="gallery-lightbox-counter">
              {currentIndex + 1} / {filteredItems.length}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render filters
  const renderFilters = () => {
    const pathways = ['gaming', 'lorebound', 'productive', 'news'];
    const categories = [...new Set(items.map(item => item.category).filter(Boolean))];
    
    if (pathways.length === 0 && categories.length === 0) return null;
    
    return (
      <div className="gallery-filters">
        {/* Pathway filters */}
        {pathways.length > 0 && (
          <div className="gallery-filter-group">
            <TextDimButton
              size="sm"
              onClick={() => setSelectedPathway(null)}
              className={!selectedPathway ? 'filter-active' : ''}
            >
              All Pathways
            </TextDimButton>
            {pathways.map(p => (
              <TextDimButton
                key={p}
                size="sm"
                onClick={() => setSelectedPathway(p)}
                className={selectedPathway === p ? 'filter-active' : ''}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </TextDimButton>
            ))}
          </div>
        )}
        
        {/* Category filters */}
        {categories.length > 0 && (
          <div className="gallery-filter-group">
            {categories.map(cat => (
              <TextDimButton
                key={cat}
                size="sm"
                onClick={() => setSelectedCategory(
                  selectedCategory === cat ? null : cat
                )}
                className={selectedCategory === cat ? 'filter-active' : ''}
              >
                {cat}
              </TextDimButton>
            ))}
          </div>
        )}
        
        {/* Search */}
        <div className="gallery-search">
          <input
            type="text"
            placeholder="Search gallery..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="gallery-search-input"
            data-cursor="text"
          />
        </div>
      </div>
    );
  };
  
  return (
    <>
      <div className="gallery-wrapper" style={style} {...restProps}>
        {renderFilters()}
        
        <div ref={gridRef} className={getGridClasses()}>
          {visibleItems.map((item, index) => renderGalleryItem(item, index))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="gallery-loading">
              <div className="gallery-loading-spinner">⏳</div>
            </div>
          )}
          
          {/* Sentinel for infinite scroll */}
          {enableInfiniteScroll && visibleItems.length < filteredItems.length && (
            <div className="gallery-sentinel" />
          )}
        </div>
        
        {/* Load more button */}
        {!enableInfiniteScroll && visibleItems.length < filteredItems.length && (
          <div className="gallery-load-more">
            <TextFlameButton onClick={loadMoreItems} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Load More'}
            </TextFlameButton>
          </div>
        )}
        
        {/* Empty state */}
        {filteredItems.length === 0 && (
          <div className="gallery-empty">
            <p>No images found</p>
          </div>
        )}
      </div>
      
      {renderLightbox()}
    </>
  );
};

// Sample gallery data
export const sampleGalleryItems = [
  {
    id: '1',
    src: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
    title: 'Epic Battle',
    description: 'Tournament finals screenshot',
    category: 'Gaming',
    pathway: 'gaming',
    author: { name: 'Duke Raziel', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100' },
    stats: { likes: 234, views: 1523 }
  },
  {
    id: '2',
    src: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
    title: 'Anime Art',
    description: 'Fan art collection',
    category: 'Artwork',
    pathway: 'lorebound',
    author: { name: 'Countess Yuki', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
    stats: { likes: 456, views: 2341 }
  }
];

export default GalleryGrid;