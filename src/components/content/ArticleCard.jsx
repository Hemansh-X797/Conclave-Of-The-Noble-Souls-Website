import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';

/**
 * ArticleCard Component
 * Ultra-premium article/post display with noble aesthetics
 * Fully utilizes content.css styling system
 * 
 * @version 2.0 - The Conclave Realm
 */

const ArticleCard = ({
  // Core Article Data
  article = {},
  
  // Display Configuration
  variant = 'standard', // 'standard', 'featured', 'compact', 'minimal', 'hero', 'list'
  size = 'md', // 'sm', 'md', 'lg', 'xl'
  layout = 'vertical', // 'vertical', 'horizontal'
  
  // Visual Effects
  animated = true,
  hoverable = true,
  glow = false,
  shimmer = false,
  
  // Content Display Options
  showThumbnail = true,
  showExcerpt = true,
  showAuthor = true,
  showDate = true,
  showReadTime = true,
  showStats = true,
  showTags = true,
  showCategory = true,
  
  // Interactive Props
  clickable = true,
  onClick,
  onAuthorClick,
  onCategoryClick,
  onTagClick,
  href,
  
  // Pathway Theming
  pathway, // 'gaming', 'lorebound', 'productive', 'news'
  
  // Customization
  className = '',
  style = {},
  
  // Advanced Features
  loading = false,
  priority = false, // For Next.js Image priority loading
  
  // Accessibility
  'aria-label': ariaLabel,
  tabIndex,
  
  // Debug
  debug = false,
  
  ...restProps
}) => {
  // Refs
  const cardRef = useRef(null);
  const thumbnailRef = useRef(null);
  
  // State
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Default article structure
  const defaultArticle = {
    id: 'article-001',
    title: 'The Art of Noble Excellence',
    slug: 'art-of-noble-excellence',
    excerpt: 'Discover the principles that define true nobility in the digital age.',
    content: '',
    thumbnail: '/assets/images/luxury/article-default.jpg',
    thumbnailAlt: 'Article thumbnail',
    category: {
      name: 'Culture',
      slug: 'culture',
      color: '#FFD700'
    },
    author: {
      name: 'Lord Valerian',
      username: 'valerian',
      avatar: '/assets/images/nobility/default-avatar.jpg',
      role: 'Grand Duke'
    },
    publishedAt: new Date().toISOString(),
    updatedAt: null,
    readTime: 5, // minutes
    stats: {
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0
    },
    tags: [],
    featured: false,
    pathway: null,
    ...article
  };
  
  const a = defaultArticle; // Shorthand
  
  // Format date
  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }, []);
  
  // Format stats numbers
  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };
  
  // Get pathway class
  const getPathwayClass = useCallback(() => {
    const articlePathway = pathway || a.pathway;
    if (!articlePathway) return '';
    
    const pathwayMap = {
      gaming: 'gaming-realm',
      lorebound: 'lorebound-realm',
      productive: 'productive-realm',
      news: 'news-realm'
    };
    
    return pathwayMap[articlePathway] || '';
  }, [pathway, a.pathway]);
  
  // Generate dynamic classes
  const generateClassNames = useCallback(() => {
    const classes = ['article-card'];
    
    // Variant classes
    if (variant !== 'standard') classes.push(`ac-${variant}`);
    
    // Size classes
    if (size !== 'md') classes.push(`ac-size-${size}`);
    
    // Layout classes
    if (layout === 'horizontal') classes.push('ac-horizontal');
    
    // State classes
    if (loading) classes.push('ac-loading');
    if (isHovered) classes.push('ac-hovered');
    if (isExpanded) classes.push('ac-expanded');
    if (a.featured) classes.push('featured');
    
    // Effect classes
    if (animated) classes.push('ac-animated');
    if (shimmer) classes.push('content-card-shimmer');
    if (glow) classes.push('ac-glow');
    
    // Pathway theming
    const pathwayClass = getPathwayClass();
    if (pathwayClass) classes.push(pathwayClass);
    
    // Custom className
    if (className) classes.push(className);
    
    return classes.join(' ');
  }, [variant, size, layout, loading, isHovered, isExpanded, a.featured, 
      animated, shimmer, glow, getPathwayClass, className]);
  
  // Handle mouse events
  const handleMouseEnter = useCallback(() => {
    if (!hoverable) return;
    setIsHovered(true);
  }, [hoverable]);
  
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);
  
  // Handle click
  const handleClick = useCallback((e) => {
    if (!clickable) return;
    
    if (onClick) {
      onClick(a, e);
    }
  }, [clickable, onClick, a]);
  
  // Handle author click
  const handleAuthorClick = useCallback((e) => {
    e.stopPropagation();
    if (onAuthorClick) {
      onAuthorClick(a.author, e);
    }
  }, [onAuthorClick, a.author]);
  
  // Handle category click
  const handleCategoryClick = useCallback((e) => {
    e.stopPropagation();
    if (onCategoryClick) {
      onCategoryClick(a.category, e);
    }
  }, [onCategoryClick, a.category]);
  
  // Handle tag click
  const handleTagClick = useCallback((tag, e) => {
    e.stopPropagation();
    if (onTagClick) {
      onTagClick(tag, e);
    }
  }, [onTagClick]);
  
  // Render thumbnail
  const renderThumbnail = () => {
    if (!showThumbnail || !a.thumbnail) return null;
    
    return (
      <div className="article-card-thumbnail" ref={thumbnailRef}>
        <Image
          src={a.thumbnail}
          alt={a.thumbnailAlt || a.title}
          fill
          className="article-card-thumbnail-image"
          style={{ objectFit: 'cover' }}
          priority={priority || a.featured}
          onLoad={() => setImageLoaded(true)}
        />
        <div className="article-card-thumbnail-overlay" />
        
        {/* Reading time overlay */}
        {showReadTime && a.readTime && (
          <div className="article-reading-time">
            <span>📖</span>
            <span>{a.readTime} min read</span>
          </div>
        )}
      </div>
    );
  };
  
  // Render category badge
  const renderCategory = () => {
    if (!showCategory || !a.category) return null;
    
    return (
      <span
        className="article-card-category"
        style={{
          borderColor: a.category.color,
          color: a.category.color
        }}
        onClick={handleCategoryClick}
        data-cursor="hover"
      >
        {a.category.name}
      </span>
    );
  };
  
  // Render title
  const renderTitle = () => (
    <h3 className="article-card-title">
      {a.title}
    </h3>
  );
  
  // Render excerpt
  const renderExcerpt = () => {
    if (!showExcerpt || !a.excerpt) return null;
    
    return (
      <p className="article-card-excerpt">
        {a.excerpt}
      </p>
    );
  };
  
  // Render tags
  const renderTags = () => {
    if (!showTags || !a.tags || a.tags.length === 0) return null;
    
    return (
      <div className="article-card-tags">
        {a.tags.map((tag, index) => (
          <span
            key={index}
            className="article-card-tag"
            onClick={(e) => handleTagClick(tag, e)}
            data-cursor="hover"
          >
            {typeof tag === 'object' ? tag.name : tag}
          </span>
        ))}
      </div>
    );
  };
  
  // Render author info
  const renderAuthor = () => {
    if (!showAuthor || !a.author) return null;
    
    return (
      <div 
        className="article-card-author"
        onClick={handleAuthorClick}
        data-cursor="hover"
      >
        <Image
          src={a.author.avatar}
          alt={`${a.author.name} avatar`}
          width={32}
          height={32}
          className="article-card-author-avatar"
        />
        <div className="article-card-author-info">
          <span className="article-card-author-name">
            {a.author.name}
          </span>
          {showDate && (
            <span className="article-card-author-date">
              {formatDate(a.publishedAt)}
            </span>
          )}
        </div>
      </div>
    );
  };
  
  // Render stats
  const renderStats = () => {
    if (!showStats || !a.stats) return null;
    
    const statIcons = {
      views: '👁️',
      likes: '❤️',
      comments: '💬',
      shares: '🔗'
    };
    
    return (
      <div className="article-card-stats">
        {Object.entries(a.stats).map(([key, value]) => {
          if (value === 0 && key !== 'views') return null;
          
          return (
            <div key={key} className="article-card-stat">
              <span className="article-card-stat-icon">
                {statIcons[key]}
              </span>
              <span>{formatNumber(value)}</span>
            </div>
          );
        })}
      </div>
    );
  };
  
  // Render content based on variant
  const renderContent = () => {
    switch (variant) {
      case 'featured':
        return (
          <>
            {renderThumbnail()}
            <div className="article-card-content">
              {renderCategory()}
              {renderTitle()}
              {renderExcerpt()}
              {renderTags()}
              <div className="article-card-meta">
                {renderAuthor()}
                {renderStats()}
              </div>
            </div>
          </>
        );
      
      case 'compact':
        return (
          <>
            {showThumbnail && a.thumbnail && (
              <div className="article-card-thumbnail-small">
                <Image
                  src={a.thumbnail}
                  alt={a.thumbnailAlt || a.title}
                  width={80}
                  height={80}
                  className="article-card-thumbnail-image"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            )}
            <div className="article-card-content">
              {renderCategory()}
              <h4 className="article-card-title article-card-title-compact">
                {a.title}
              </h4>
              <div className="article-card-meta article-card-meta-compact">
                <span className="article-card-author-name">
                  {a.author.name}
                </span>
                {showDate && (
                  <span className="article-card-date">
                    {formatDate(a.publishedAt)}
                  </span>
                )}
              </div>
            </div>
          </>
        );
      
      case 'minimal':
        return (
          <>
            {renderCategory()}
            <h4 className="article-card-title article-card-title-minimal">
              {a.title}
            </h4>
            {showDate && (
              <span className="article-card-date article-card-date-minimal">
                {formatDate(a.publishedAt)}
              </span>
            )}
          </>
        );
      
      case 'hero':
        return (
          <>
            {renderThumbnail()}
            <div className="article-card-content article-card-content-hero">
              <div className="article-card-hero-badge-group">
                {renderCategory()}
                {a.featured && (
                  <span className="article-card-featured-badge">
                    ⭐ Featured
                  </span>
                )}
              </div>
              {renderTitle()}
              {renderExcerpt()}
              {renderTags()}
              <div className="article-card-meta article-card-meta-hero">
                {renderAuthor()}
                {renderStats()}
              </div>
            </div>
          </>
        );
      
      case 'list':
        return (
          <>
            <div className="article-card-list-number">
              {a.index || '01'}
            </div>
            <div className="article-card-list-content">
              {renderCategory()}
              {renderTitle()}
              <div className="article-card-meta">
                {renderAuthor()}
                {showReadTime && a.readTime && (
                  <span className="article-card-read-time">
                    {a.readTime} min
                  </span>
                )}
              </div>
            </div>
            {showThumbnail && a.thumbnail && (
              <div className="article-card-list-thumbnail">
                <Image
                  src={a.thumbnail}
                  alt={a.thumbnailAlt || a.title}
                  width={100}
                  height={100}
                  className="article-card-thumbnail-image"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            )}
          </>
        );
      
      default: // standard
        return (
          <>
            {renderThumbnail()}
            <div className="article-card-content">
              {renderCategory()}
              {renderTitle()}
              {renderExcerpt()}
              {renderTags()}
              <div className="article-card-meta">
                {renderAuthor()}
                {renderStats()}
              </div>
            </div>
          </>
        );
    }
  };
  
  // Render loading skeleton
  const renderSkeleton = () => (
    <div className="article-card article-card-skeleton">
      <div className="skeleton-image" />
      <div className="article-card-content">
        <div className="skeleton-line subtitle" />
        <div className="skeleton-line title" />
        <div className="skeleton-line text" />
        <div className="skeleton-line text" />
        <div className="skeleton-line short" />
      </div>
    </div>
  );
  
  // Loading state
  if (loading) {
    return renderSkeleton();
  }
  
  // Determine wrapper element
  const WrapperElement = href ? Link : clickable ? 'button' : 'article';
  const wrapperProps = href 
    ? { href }
    : clickable 
    ? { onClick: handleClick, type: 'button' }
    : {};
  
  return (
    <WrapperElement
      ref={cardRef}
      className={generateClassNames()}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label={ariaLabel || `Article: ${a.title}`}
      tabIndex={tabIndex ?? (clickable || href ? 0 : -1)}
      data-cursor={clickable || href ? 'hover' : 'default'}
      data-article-id={a.id}
      {...wrapperProps}
      {...restProps}
    >
      {renderContent()}
    </WrapperElement>
  );
};

// Pre-configured variants for easy usage
export const FeaturedArticleCard = (props) => (
  <ArticleCard
    variant="featured"
    size="lg"
    glow
    shimmer
    {...props}
  />
);

export const CompactArticleCard = (props) => (
  <ArticleCard
    variant="compact"
    size="sm"
    showExcerpt={false}
    showTags={false}
    showStats={false}
    {...props}
  />
);

export const MinimalArticleCard = (props) => (
  <ArticleCard
    variant="minimal"
    size="sm"
    showThumbnail={false}
    showExcerpt={false}
    showAuthor={false}
    showTags={false}
    showStats={false}
    {...props}
  />
);

export const HeroArticleCard = (props) => (
  <ArticleCard
    variant="hero"
    size="xl"
    glow
    priority
    {...props}
  />
);

export const ListArticleCard = (props) => (
  <ArticleCard
    variant="list"
    layout="horizontal"
    showExcerpt={false}
    showTags={false}
    showStats={false}
    {...props}
  />
);

// Grid layout component
export const ArticleCardGrid = ({ 
  articles = [], 
  columns = 3,
  gap = 'md',
  variant = 'standard',
  ...props 
}) => {
  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8'
  };
  
  return (
    <div 
      className={`content-grid content-grid-${columns} ${gapClasses[gap]}`}
    >
      {articles.map((article, index) => (
        <ArticleCard
          key={article.id || index}
          article={article}
          variant={variant}
          {...props}
        />
      ))}
    </div>
  );
};

// Masonry layout component
export const ArticleCardMasonry = ({
  articles = [],
  columns = 3,
  gap = 'md',
  variant = 'standard',
  ...props
}) => {
  const gapValue = gap === 'sm' ? '1rem' : gap === 'lg' ? '2rem' : '1.5rem';
  
  return (
    <div
      className="article-card-masonry"
      style={{
        columns,
        columnGap: gapValue,
        width: '100%'
      }}
    >
      {articles.map((article, index) => (
        <div
          key={article.id || index}
          style={{
            breakInside: 'avoid',
            marginBottom: gapValue
          }}
        >
          <ArticleCard
            article={article}
            variant={variant}
            {...props}
          />
        </div>
      ))}
    </div>
  );
};

// List layout component
export const ArticleCardList = ({
  articles = [],
  showIndex = true,
  ...props
}) => (
  <div className="article-card-list-container">
    {articles.map((article, index) => (
      <ListArticleCard
        key={article.id || index}
        article={{
          ...article,
          index: showIndex ? String(index + 1).padStart(2, '0') : null
        }}
        {...props}
      />
    ))}
  </div>
);

// Pathway-specific article cards
export const GamingArticleCard = (props) => (
  <ArticleCard
    pathway="gaming"
    {...props}
  />
);

export const LoreboundArticleCard = (props) => (
  <ArticleCard
    pathway="lorebound"
    {...props}
  />
);

export const ProductiveArticleCard = (props) => (
  <ArticleCard
    pathway="productive"
    {...props}
  />
);

export const NewsArticleCard = (props) => (
  <ArticleCard
    pathway="news"
    glow
    {...props}
  />
);

// Custom hook for article state management
export const useArticleCardState = (initialArticles = []) => {
  const [articles, setArticles] = useState(initialArticles);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: null,
    tag: null,
    author: null,
    pathway: null,
    search: ''
  });
  const [sortBy, setSortBy] = useState('publishedAt'); // 'publishedAt', 'views', 'likes', 'title'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
  
  // Filter and sort articles
  const filteredArticles = useMemo(() => {
    let filtered = [...articles];
    
    // Apply filters
    if (filters.category) {
      filtered = filtered.filter(a => 
        a.category?.slug === filters.category
      );
    }
    
    if (filters.tag) {
      filtered = filtered.filter(a => 
        a.tags?.some(t => 
          (typeof t === 'object' ? t.slug : t) === filters.tag
        )
      );
    }
    
    if (filters.author) {
      filtered = filtered.filter(a => 
        a.author?.username === filters.author
      );
    }
    
    if (filters.pathway) {
      filtered = filtered.filter(a => 
        a.pathway === filters.pathway
      );
    }
    
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(search) ||
        a.excerpt?.toLowerCase().includes(search) ||
        a.author?.name.toLowerCase().includes(search)
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'publishedAt':
          aVal = new Date(a.publishedAt);
          bVal = new Date(b.publishedAt);
          break;
        case 'views':
          aVal = a.stats?.views || 0;
          bVal = b.stats?.views || 0;
          break;
        case 'likes':
          aVal = a.stats?.likes || 0;
          bVal = b.stats?.likes || 0;
          break;
        case 'title':
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          return sortOrder === 'asc' 
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });
    
    return filtered;
  }, [articles, filters, sortBy, sortOrder]);
  
  const addArticle = (article) => {
    setArticles(prev => [article, ...prev]);
  };
  
  const updateArticle = (id, updates) => {
    setArticles(prev => 
      prev.map(a => a.id === id ? { ...a, ...updates } : a)
    );
  };
  
  const removeArticle = (id) => {
    setArticles(prev => prev.filter(a => a.id !== id));
  };
  
  const clearFilters = () => {
    setFilters({
      category: null,
      tag: null,
      author: null,
      pathway: null,
      search: ''
    });
  };
  
  return {
    articles: filteredArticles,
    allArticles: articles,
    loading,
    error,
    filters,
    sortBy,
    sortOrder,
    setArticles,
    addArticle,
    updateArticle,
    removeArticle,
    setLoading,
    setError,
    setFilters,
    setSortBy,
    setSortOrder,
    clearFilters,
    totalCount: articles.length,
    filteredCount: filteredArticles.length
  };
};

// Sample articles for demonstration
export const sampleArticles = [
  {
    id: 'article-001',
    title: 'The Renaissance of Digital Gaming Communities',
    slug: 'renaissance-digital-gaming',
    excerpt: 'How modern gaming communities are reshaping social interaction and creating new forms of digital nobility.',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop',
    category: { name: 'Gaming', slug: 'gaming', color: '#00BFFF' },
    author: {
      name: 'Duke Raziel',
      username: 'raziel',
      avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop',
      role: 'Duke'
    },
    publishedAt: '2025-10-01',
    readTime: 8,
    stats: { views: 2847, likes: 342, comments: 89, shares: 45 },
    tags: ['Gaming', 'Community', 'Social'],
    pathway: 'gaming',
    featured: true
  },
  {
    id: 'article-002',
    title: 'Anime Philosophy: Lessons from the Greatest Stories',
    slug: 'anime-philosophy-lessons',
    excerpt: 'Deep dive into the philosophical themes that make anime a unique storytelling medium.',
    thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&h=600&fit=crop',
    category: { name: 'Lorebound', slug: 'lorebound', color: '#9932CC' },
    author: {
      name: 'Countess Yuki',
      username: 'yuki',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      role: 'Count'
    },
    publishedAt: '2025-09-28',
    readTime: 12,
    stats: { views: 1923, likes: 278, comments: 56, shares: 34 },
    tags: ['Anime', 'Philosophy', 'Culture'],
    pathway: 'lorebound'
  }
];

export default ArticleCard;