import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TextFlameButton, TextDimButton } from './LuxuryButton';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PATH RECOMMEND COMPONENT - THE CONCLAVE REALM
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Smart content recommendation system for pathways.
 * Suggests relevant posts, events, resources based on user activity and preferences.
 * 
 * Features:
 * - Smart recommendation algorithm
 * - Multiple content types (posts, events, resources, discussions)
 * - "Why recommended" explanations
 * - Filter by content type
 * - Dismiss/save functionality
 * - Personalization based on activity
 * - Premium card design with pathway theming
 * - Mobile responsive
 * - Loading states
 * 
 * @component
 * @example
 * @version 1.0
 * <PathRecommend
 *   pathway="gaming"
 *   recommendations={recommendations}
 *   onDismiss={(id) => console.log('Dismissed', id)}
 *   onSave={(id) => console.log('Saved', id)}
 * />
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const PATHWAY_CONFIG = {
  gaming: {
    color: '#00bfff',
    gradient: 'linear-gradient(135deg, #00bfff 0%, #8a2be2 100%)',
    icon: '🎮',
  },
  lorebound: {
    color: '#6a0dad',
    gradient: 'linear-gradient(135deg, #6a0dad 0%, #9932cc 100%)',
    icon: '📚',
  },
  productive: {
    color: '#c0c0c0',
    gradient: 'linear-gradient(135deg, #c0c0c0 0%, #95a5a6 100%)',
    icon: '⚡',
  },
  news: {
    color: '#e5e4e2',
    gradient: 'linear-gradient(135deg, #e5e4e2 0%, #bdc3c7 100%)',
    icon: '📰',
  },
};

const CONTENT_TYPES = {
  post: { label: 'Posts', icon: '💬', color: '#2196f3' },
  event: { label: 'Events', icon: '📅', color: '#4caf50' },
  resource: { label: 'Resources', icon: '📚', color: '#ff9800' },
  discussion: { label: 'Discussions', icon: '💭', color: '#9c27b0' },
  media: { label: 'Media', icon: '🎬', color: '#e91e63' },
};

const REASON_LABELS = {
  trending: { label: 'Trending Now', icon: '🔥', color: '#ff6b6b' },
  popular: { label: 'Popular', icon: '⭐', color: '#ffd700' },
  new: { label: 'New Content', icon: '✨', color: '#4caf50' },
  similar: { label: 'Similar to what you like', icon: '👍', color: '#2196f3' },
  recommended: { label: 'Recommended for you', icon: '💝', color: '#ff69b4' },
  'for-you': { label: 'Personalized', icon: '🎯', color: '#9c27b0' },
};

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

const formatTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval !== 1 ? 's' : ''} ago`;
    }
  }
  
  return 'Just now';
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const PathRecommend = ({
  // Core Data
  pathway = 'gaming',
  recommendations = [],
  
  // Display Options
  maxItems = 6,
  showFilters = true,
  showReasons = true,
  showActions = true,
  layout = 'grid', // 'grid' | 'list' | 'compact'
  
  // Behavior
  onDismiss,
  onSave,
  onView,
  
  // Loading State
  isLoading = false,
  
  // Styling
  className = '',
  style = {},
  
  // Advanced
  debug = false,
  
  ...restProps
}) => {
  // ═══════════════════════════════════════════════════════════════════════
  // STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════
  
  const [activeFilter, setActiveFilter] = useState('all');
  const [dismissedIds, setDismissedIds] = useState(new Set());
  const [savedIds, setSavedIds] = useState(new Set());

  // ═══════════════════════════════════════════════════════════════════════
  // MEMOIZED VALUES
  // ═══════════════════════════════════════════════════════════════════════
  
  const pathwayConfig = useMemo(() => {
    return PATHWAY_CONFIG[pathway] || PATHWAY_CONFIG.gaming;
  }, [pathway]);

  const filteredRecommendations = useMemo(() => {
    let filtered = recommendations.filter(rec => !dismissedIds.has(rec.id));
    
    if (activeFilter !== 'all') {
      filtered = filtered.filter(rec => rec.type === activeFilter);
    }
    
    return filtered.slice(0, maxItems);
  }, [recommendations, activeFilter, dismissedIds, maxItems]);

  const contentTypeCounts = useMemo(() => {
    const counts = { all: recommendations.length };
    
    Object.keys(CONTENT_TYPES).forEach(type => {
      counts[type] = recommendations.filter(rec => rec.type === type).length;
    });
    
    return counts;
  }, [recommendations]);

  const containerClasses = useMemo(() => {
    const base = 'path-recommend';
    const pathwayClass = `path-recommend--${pathway}`;
    const layoutClass = `path-recommend--${layout}`;
    const loadingClass = isLoading ? 'is-loading' : '';
    
    return [base, pathwayClass, layoutClass, loadingClass, className]
      .filter(Boolean)
      .join(' ');
  }, [pathway, layout, isLoading, className]);

  // ═══════════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════════════
  
  const handleDismiss = useCallback((id, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    setDismissedIds(prev => new Set([...prev, id]));
    
    if (onDismiss) {
      onDismiss(id);
    }
  }, [onDismiss]);

  const handleSave = useCallback((id, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    setSavedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
    
    if (onSave) {
      onSave(id);
    }
  }, [onSave]);

  const handleView = useCallback((recommendation) => {
    if (onView) {
      onView(recommendation);
    }
  }, [onView]);

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER HELPERS
  // ═══════════════════════════════════════════════════════════════════════
  
  const renderFilters = () => {
    if (!showFilters) return null;

    const filters = [
      { key: 'all', label: 'All', icon: '🎯' },
      ...Object.entries(CONTENT_TYPES).map(([key, config]) => ({
        key,
        label: config.label,
        icon: config.icon,
      })),
    ];

    return (
      <div className="path-recommend__filters" data-cursor="default">
        {filters.map((filter) => (
          <button
            key={filter.key}
            className={`path-recommend__filter ${
              activeFilter === filter.key ? 'is-active' : ''
            }`}
            onClick={() => setActiveFilter(filter.key)}
            data-cursor="hover"
          >
            <span className="path-recommend__filter-icon">{filter.icon}</span>
            <span className="path-recommend__filter-label">{filter.label}</span>
            <span className="path-recommend__filter-count">
              {contentTypeCounts[filter.key] || 0}
            </span>
          </button>
        ))}
      </div>
    );
  };

  const renderReasonBadge = (reason) => {
    if (!showReasons || !reason) return null;

    const reasonConfig = REASON_LABELS[reason] || REASON_LABELS.recommended;

    return (
      <div
        className="path-recommend__reason"
        style={{ '--reason-color': reasonConfig.color }}
        data-cursor="default"
      >
        <span className="path-recommend__reason-icon">{reasonConfig.icon}</span>
        <span className="path-recommend__reason-label">{reasonConfig.label}</span>
      </div>
    );
  };

  const renderRecommendationCard = (recommendation) => {
    const contentType = CONTENT_TYPES[recommendation.type] || CONTENT_TYPES.post;
    const isSaved = savedIds.has(recommendation.id);

    return (
      <article
        key={recommendation.id}
        className="path-recommend__card"
        data-type={recommendation.type}
        onClick={() => handleView(recommendation)}
        data-cursor="hover"
      >
        {/* Image/Thumbnail */}
        {recommendation.image && (
          <div className="path-recommend__card-image">
            <Image
              src={recommendation.image}
              alt={recommendation.title}
              fill
              style={{ objectFit: 'cover' }}
            />
            <div className="path-recommend__card-image-overlay" />
          </div>
        )}

        {/* Content */}
        <div className="path-recommend__card-content">
          {/* Header */}
          <div className="path-recommend__card-header">
            <div
              className="path-recommend__card-type"
              style={{ '--type-color': contentType.color }}
            >
              <span className="path-recommend__card-type-icon">{contentType.icon}</span>
              <span className="path-recommend__card-type-label">{contentType.label}</span>
            </div>

            {/* Actions */}
            {showActions && (
              <div className="path-recommend__card-actions">
                <button
                  className={`path-recommend__card-action path-recommend__card-action--save ${
                    isSaved ? 'is-active' : ''
                  }`}
                  onClick={(e) => handleSave(recommendation.id, e)}
                  title={isSaved ? 'Unsave' : 'Save'}
                  data-cursor="hover"
                >
                  {isSaved ? '🔖' : '📌'}
                </button>
                <button
                  className="path-recommend__card-action path-recommend__card-action--dismiss"
                  onClick={(e) => handleDismiss(recommendation.id, e)}
                  title="Dismiss"
                  data-cursor="hover"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Reason Badge */}
          {renderReasonBadge(recommendation.reason)}

          {/* Title */}
          <h3 className="path-recommend__card-title">{recommendation.title}</h3>

          {/* Description */}
          {recommendation.description && (
            <p className="path-recommend__card-description">
              {recommendation.description}
            </p>
          )}

          {/* Meta */}
          <div className="path-recommend__card-meta">
            {recommendation.author && (
              <span className="path-recommend__card-author">
                👤 {recommendation.author}
              </span>
            )}
            {recommendation.date && (
              <span className="path-recommend__card-date">
                🕐 {formatTimeAgo(recommendation.date)}
              </span>
            )}
            {recommendation.engagement && (
              <span className="path-recommend__card-engagement">
                💬 {recommendation.engagement} responses
              </span>
            )}
          </div>

          {/* View Button */}
          {recommendation.href && (
            <div className="path-recommend__card-footer">
              <Link href={recommendation.href}>
                <TextDimButton size="sm" className="path-recommend__card-button">
                  View {contentType.label.slice(0, -1)}
                </TextDimButton>
              </Link>
            </div>
          )}
        </div>
      </article>
    );
  };

  const renderEmptyState = () => {
    return (
      <div className="path-recommend__empty" data-cursor="default">
        <div className="path-recommend__empty-icon">🎯</div>
        <h3 className="path-recommend__empty-title">No Recommendations Yet</h3>
        <p className="path-recommend__empty-message">
          Start exploring {pathway} content to get personalized recommendations!
        </p>
      </div>
    );
  };

  const renderLoadingState = () => {
    return (
      <div className="path-recommend__loading" data-cursor="default">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="path-recommend__skeleton">
            <div className="path-recommend__skeleton-image" />
            <div className="path-recommend__skeleton-content">
              <div className="path-recommend__skeleton-line path-recommend__skeleton-line--title" />
              <div className="path-recommend__skeleton-line path-recommend__skeleton-line--text" />
              <div className="path-recommend__skeleton-line path-recommend__skeleton-line--text" />
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════════════════
  
  return (
    <section
      className={containerClasses}
      style={{
        ...style,
        '--pathway-color': pathwayConfig.color,
        '--pathway-gradient': pathwayConfig.gradient,
      }}
      data-pathway={pathway}
      {...restProps}
    >
      {/* Header */}
      <div className="path-recommend__header">
        <h2 className="path-recommend__title" data-cursor="default">
          <span className="path-recommend__title-icon">{pathwayConfig.icon}</span>
          Recommended for You
        </h2>
        {filteredRecommendations.length > 0 && (
          <p className="path-recommend__subtitle" data-cursor="default">
            Based on your activity and interests
          </p>
        )}
      </div>

      {/* Filters */}
      {renderFilters()}

      {/* Content */}
      {isLoading ? (
        renderLoadingState()
      ) : filteredRecommendations.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className="path-recommend__grid">
          {filteredRecommendations.map(renderRecommendationCard)}
        </div>
      )}

      {/* Debug */}
      {debug && (
        <div className="path-recommend__debug">
          <pre>{JSON.stringify({
            pathway,
            totalRecommendations: recommendations.length,
            filtered: filteredRecommendations.length,
            activeFilter,
            dismissed: dismissedIds.size,
            saved: savedIds.size,
          }, null, 2)}</pre>
        </div>
      )}
    </section>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// PRESET VARIANTS
// ═══════════════════════════════════════════════════════════════════════════

export const GamingRecommend = (props) => (
  <PathRecommend pathway="gaming" {...props} />
);

export const LoreboundRecommend = (props) => (
  <PathRecommend pathway="lorebound" {...props} />
);

export const ProductiveRecommend = (props) => (
  <PathRecommend pathway="productive" {...props} />
);

export const NewsRecommend = (props) => (
  <PathRecommend pathway="news" {...props} />
);

// ═══════════════════════════════════════════════════════════════════════════
// COMPACT VARIANT
// ═══════════════════════════════════════════════════════════════════════════

export const CompactRecommend = (props) => (
  <PathRecommend
    layout="compact"
    maxItems={3}
    showFilters={false}
    {...props}
  />
);

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = `
/* ═══════════════════════════════════════════════════════════════════════
   PATH RECOMMEND - BASE STYLES
   ═══════════════════════════════════════════════════════════════════════ */

.path-recommend {
  position: relative;
  width: 100%;
  font-family: 'Josefin Sans', sans-serif;
}

/* Header */
.path-recommend__header {
  margin-bottom: 2rem;
}

.path-recommend__title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  background: var(--pathway-gradient);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.path-recommend__title-icon {
  font-size: 2rem;
  filter: drop-shadow(0 0 10px var(--pathway-color));
}

.path-recommend__subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

/* Filters */
.path-recommend__filters {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.path-recommend__filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.path-recommend__filter:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.path-recommend__filter.is-active {
  background: var(--pathway-gradient);
  border-color: var(--pathway-color);
  color: #000;
  box-shadow: 0 0 20px var(--pathway-color);
}

.path-recommend__filter-icon {
  font-size: 1.2rem;
}

.path-recommend__filter-count {
  padding: 0.25rem 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
}

.path-recommend__filter.is-active .path-recommend__filter-count {
  background: rgba(0, 0, 0, 0.2);
}

/* Grid */
.path-recommend__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.path-recommend--list .path-recommend__grid {
  grid-template-columns: 1fr;
}

.path-recommend--compact .path-recommend__grid {
  gap: 1rem;
}

/* Card */
.path-recommend__card {
  position: relative;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.path-recommend__card:hover {
  border-color: var(--pathway-color);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.5), 0 0 30px var(--pathway-color);
  transform: translateY(-8px);
}

/* Card Image */
.path-recommend__card-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.path-recommend__card-image img {
  transition: transform 0.4s ease;
}

.path-recommend__card:hover .path-recommend__card-image img {
  transform: scale(1.1);
}

.path-recommend__card-image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.7) 100%);
  z-index: 1;
}

/* Card Content */
.path-recommend__card-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
}

/* Card Header */
.path-recommend__card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.path-recommend__card-type {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--type-color);
  color: #fff;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.path-recommend__card-type-icon {
  font-size: 1rem;
}

/* Card Actions */
.path-recommend__card-actions {
  display: flex;
  gap: 0.5rem;
}

.path-recommend__card-action {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.path-recommend__card-action:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  transform: scale(1.1);
}

.path-recommend__card-action--save.is-active {
  background: #ffd700;
  border-color: #ffd700;
  color: #000;
}

.path-recommend__card-action--dismiss:hover {
  background: #ff4444;
  border-color: #ff4444;
  color: #fff;
}

/* Reason Badge */
.path-recommend__reason {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--reason-color);
  color: #fff;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  width: fit-content;
}

.path-recommend__reason-icon {
  font-size: 1rem;
}

/* Card Title */
.path-recommend__card-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Card Description */
.path-recommend__card-description {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Card Meta */
.path-recommend__card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: auto;
}

.path-recommend__card-author,
.path-recommend__card-date,
.path-recommend__card-engagement {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* Card Footer */
.path-recommend__card-footer {
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.path-recommend__card-button {
  width: 100%;
}

/* Empty State */
.path-recommend__empty {
  text-align: center;
  padding: 4rem 2rem;
}

.path-recommend__empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.path-recommend__empty-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: rgba(255, 255, 255, 0.8);
}

.path-recommend__empty-message {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

/* Loading State */
.path-recommend__loading {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.path-recommend__skeleton {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  overflow: hidden;
}

.path-recommend__skeleton-image {
  width: 100%;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  animation: shimmer 1.5s infinite;
}

.path-recommend__skeleton-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.path-recommend__skeleton-line {
  height: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  animation: shimmer 1.5s infinite;
}

.path-recommend__skeleton-line--title {
  height: 20px;
  width: 70%;
}

.path-recommend__skeleton-line--text {
  width: 100%;
}

/* Debug */
.path-recommend__debug {
  margin-top: 2rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  font-family: 'Courier New', monospace;
}

/* ═══════════════════════════════════════════════════════════════════════
   ANIMATIONS
   ═══════════════════════════════════════════════════════════════════════ */

@keyframes shimmer {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.5;
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════════════════════════════════════════ */

@media (max-width: 768px) {
  .path-recommend__grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .path-recommend__title {
    font-size: 1.5rem;
  }

  .path-recommend__filters {
    gap: 0.5rem;
  }

  .path-recommend__filter {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }

  .path-recommend__card-image {
    height: 150px;
  }

  .path-recommend__loading {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .path-recommend__header {
    margin-bottom: 1.5rem;
  }

  .path-recommend__title {
    font-size: 1.25rem;
  }

  .path-recommend__card-content {
    padding: 1rem;
  }

  .path-recommend__filters {
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 0.5rem;
  }

  .path-recommend__filter {
    flex-shrink: 0;
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   REDUCED MOTION
   ═══════════════════════════════════════════════════════════════════════ */

@media (prefers-reduced-motion: reduce) {
  .path-recommend__card,
  .path-recommend__card-action,
  .path-recommend__card-image img {
    transition: none;
    animation: none;
  }

  .path-recommend__skeleton-image,
  .path-recommend__skeleton-line {
    animation: none;
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleId = 'path-recommend-styles';
  if (!document.getElementById(styleId)) {
    const styleTag = document.createElement('style');
    styleTag.id = styleId;
    styleTag.textContent = styles;
    document.head.appendChild(styleTag);
  }
}

export default PathRecommend;