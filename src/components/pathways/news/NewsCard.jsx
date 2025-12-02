// ============================================================================
// THE CONCLAVE REALM - NEWS CARD COMPONENT
// Location: /src/components/pathways/news/NewsCard.jsx
// ============================================================================
// Purpose: Luxury news article card with dynamic data from NewsAPI
// Uses: GlassCard, use3DTilt, useImageReveal
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Calendar,
  Clock,
  Eye,
  Heart,
  Share2,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  TrendingUp,
  MessageCircle,
  User,
  Tag,
  MoreVertical
} from 'lucide-react';

// Internal components
import GlassCard from '@/components/ui/GlassCard';
import LuxuryButton, { NewsButton } from '@/components/ui/LuxuryButton';
import { useAppContext } from '@/contexts/AppProvider';
import { notify } from '@/components/interactive/NotificationCenter';
import use3DTilt from '@/hooks/use3DTilt';
import useImageReveal from '@/hooks/useImageReveal';

/**
 * @component NewsCard
 * @description Luxury news card with dynamic data from NewsAPI/RSS feeds
 * 
 * @param {Object} article - News article object
 * @param {string} article.title - Article title
 * @param {string} article.description - Article description
 * @param {string} article.url - Article URL
 * @param {string} article.urlToImage - Article image URL
 * @param {string} article.publishedAt - ISO date string
 * @param {Object} article.source - Source object {id, name}
 * @param {string} article.author - Article author
 * @param {string} article.content - Article content
 * 
 * @param {string} variant - Card style: 'default'|'compact'|'featured'|'minimal'
 * @param {Function} onRead - Callback when user clicks read
 * @param {Function} onShare - Callback when user shares
 * @param {boolean} showActions - Show action buttons
 * @param {boolean} enableTilt - Enable 3D tilt effect
 * @param {string} pathway - Pathway theme
 */
export default function NewsCard({
  article,
  variant = 'default',
  onRead,
  onShare,
  showActions = true,
  enableTilt = true,
  pathway = 'news'
}) {
  // ============================================================================
  // STATE & HOOKS
  // ============================================================================
  const router = useRouter();
  const { playClick, playHover, animationsEnabled, user, isAuthenticated } = useAppContext();
  
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [timeAgo, setTimeAgo] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  
  // 3D Tilt effect
  const tiltRef = use3DTilt({
    tiltAngle: 8,
    glare: true,
    glareOpacity: 0.15,
    disabled: !enableTilt || !animationsEnabled
  });
  
  // Image reveal effect
  const imageRef = useImageReveal({
    direction: 'zoom',
    intensity: 'low',
    disabled: !animationsEnabled
  });

  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  // Check if article is bookmarked
  useEffect(() => {
    if (isAuthenticated && article?.url) {
      try {
        const bookmarks = JSON.parse(localStorage.getItem('news-bookmarks') || '[]');
        setIsBookmarked(bookmarks.includes(article.url));
      } catch (error) {
        console.error('Error loading bookmarks:', error);
      }
    }
  }, [article?.url, isAuthenticated]);

  // Calculate time ago
  useEffect(() => {
    if (!article?.publishedAt) return;

    const updateTimeAgo = () => {
      const now = new Date();
      const published = new Date(article.publishedAt);
      const diffMs = now - published;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) {
        setTimeAgo('Just now');
      } else if (diffMins < 60) {
        setTimeAgo(`${diffMins}m ago`);
      } else if (diffHours < 24) {
        setTimeAgo(`${diffHours}h ago`);
      } else if (diffDays < 7) {
        setTimeAgo(`${diffDays}d ago`);
      } else {
        setTimeAgo(published.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }));
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [article?.publishedAt]);

  // Load engagement stats
  useEffect(() => {
    if (!article?.url) return;

    try {
      const engagementKey = `news-engagement-${btoa(article.url)}`;
      const saved = localStorage.getItem(engagementKey);
      
      if (saved) {
        const data = JSON.parse(saved);
        setLikeCount(data.likes || 0);
        setViewCount(data.views || 0);
        setIsLiked(data.userLiked || false);
      }
    } catch (error) {
      console.error('Error loading engagement:', error);
    }
  }, [article?.url]);

  // ============================================================================
  // HANDLERS
  // ============================================================================
  
  const handleRead = () => {
    playClick();
    
    // Increment view count
    try {
      const engagementKey = `news-engagement-${btoa(article.url)}`;
      const saved = JSON.parse(localStorage.getItem(engagementKey) || '{}');
      saved.views = (saved.views || 0) + 1;
      localStorage.setItem(engagementKey, JSON.stringify(saved));
      setViewCount(saved.views);
    } catch (error) {
      console.error('Error updating views:', error);
    }
    
    if (onRead) {
      onRead(article);
    } else {
      // Open article in new tab
      window.open(article.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleBookmark = () => {
    playClick();

    if (!isAuthenticated) {
      notify.error('Please log in to bookmark articles', {
        title: 'Authentication Required'
      });
      return;
    }

    try {
      const bookmarks = JSON.parse(localStorage.getItem('news-bookmarks') || '[]');
      
      if (isBookmarked) {
        const updated = bookmarks.filter(url => url !== article.url);
        localStorage.setItem('news-bookmarks', JSON.stringify(updated));
        setIsBookmarked(false);
        notify.info('Bookmark removed', { duration: 2000 });
      } else {
        bookmarks.push(article.url);
        localStorage.setItem('news-bookmarks', JSON.stringify(bookmarks));
        setIsBookmarked(true);
        notify.success('Article bookmarked!', { duration: 2000 });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      notify.error('Failed to update bookmark');
    }
  };

  const handleLike = () => {
    playClick();

    if (!isAuthenticated) {
      notify.error('Please log in to like articles', {
        title: 'Authentication Required'
      });
      return;
    }

    try {
      const engagementKey = `news-engagement-${btoa(article.url)}`;
      const saved = JSON.parse(localStorage.getItem(engagementKey) || '{}');
      
      if (isLiked) {
        saved.likes = Math.max(0, (saved.likes || 0) - 1);
        saved.userLiked = false;
        setIsLiked(false);
      } else {
        saved.likes = (saved.likes || 0) + 1;
        saved.userLiked = true;
        setIsLiked(true);
      }
      
      localStorage.setItem(engagementKey, JSON.stringify(saved));
      setLikeCount(saved.likes);
    } catch (error) {
      console.error('Error toggling like:', error);
      notify.error('Failed to update like');
    }
  };

  const handleShare = async () => {
    playClick();

    const shareData = {
      title: article.title,
      text: article.description || article.title,
      url: article.url
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        notify.success('Shared successfully!');
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(article.url);
        notify.success('Link copied to clipboard!');
      }
      
      if (onShare) {
        onShare(article);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error);
        notify.error('Failed to share');
      }
    }
  };

  // ============================================================================
  // VALIDATION
  // ============================================================================
  
  if (!article) {
    return (
      <GlassCard className="news-card news-card-error">
        <div className="error-state">
          <p className="text-body">Article unavailable</p>
        </div>
      </GlassCard>
    );
  }

  // ============================================================================
  // COMPACT VARIANT
  // ============================================================================
  
  if (variant === 'compact') {
    return (
      <GlassCard 
        ref={tiltRef}
        className="news-card news-card-compact"
        onClick={handleRead}
        onMouseEnter={playHover}
      >
        <div className="compact-content">
          {article.urlToImage && (
            <div className="compact-image">
              <Image
                src={article.urlToImage}
                alt={article.title}
                fill
                className="image"
                sizes="100px"
              />
            </div>
          )}
          
          <div className="compact-info">
            <h4 className="text-body-sm compact-title">{article.title}</h4>
            <div className="compact-meta">
              <span className="text-label-xs text-secondary">{article.source?.name}</span>
              <span className="text-label-xs text-secondary">•</span>
              <span className="text-label-xs text-secondary">{timeAgo}</span>
            </div>
          </div>
        </div>
      </GlassCard>
    );
  }

  // ============================================================================
  // MINIMAL VARIANT
  // ============================================================================
  
  if (variant === 'minimal') {
    return (
      <div className="news-card news-card-minimal" onClick={handleRead}>
        <div className="minimal-content">
          <div className="minimal-header">
            <span className="text-label-xs source-name">{article.source?.name}</span>
            <span className="text-label-xs text-secondary">{timeAgo}</span>
          </div>
          <h4 className="text-h4 minimal-title">{article.title}</h4>
          {article.description && (
            <p className="text-body-sm text-secondary minimal-desc">
              {article.description.slice(0, 100)}...
            </p>
          )}
        </div>
      </div>
    );
  }

  // ============================================================================
  // FEATURED VARIANT
  // ============================================================================
  
  if (variant === 'featured') {
    return (
      <GlassCard 
        ref={tiltRef}
        className="news-card news-card-featured"
        onMouseEnter={playHover}
      >
        {/* Featured Badge */}
        <div className="featured-badge">
          <TrendingUp size={14} />
          <span className="text-label-xs">Trending</span>
        </div>

        {/* Image */}
        <div ref={imageRef} className="news-image news-image-large">
          {article.urlToImage ? (
            <Image
              src={article.urlToImage}
              alt={article.title}
              fill
              className="image"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="image-placeholder">
              <ExternalLink size={48} />
            </div>
          )}
          <div className="image-overlay">
            <span className="source-badge text-label-sm">{article.source?.name}</span>
          </div>
        </div>

        {/* Content */}
        <div className="news-content">
          <h2 className="text-h2 news-title">{article.title}</h2>
          
          {article.description && (
            <p className="text-body news-description">{article.description}</p>
          )}

          {/* Meta */}
          <div className="news-meta">
            <div className="meta-item">
              <User size={14} />
              <span className="text-label-sm">{article.author || 'Anonymous'}</span>
            </div>
            <div className="meta-item">
              <Calendar size={14} />
              <span className="text-label-sm">{timeAgo}</span>
            </div>
            <div className="meta-item">
              <Eye size={14} />
              <span className="text-label-sm">{viewCount} views</span>
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="news-actions">
              <NewsButton onClick={handleRead} fullWidth>
                Read Full Article
                <ExternalLink size={18} />
              </NewsButton>

              <div className="action-buttons">
                <button
                  className={`icon-button ${isLiked ? 'button-active' : ''}`}
                  onClick={handleLike}
                  aria-label="Like article"
                >
                  <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
                  {likeCount > 0 && <span className="text-label-xs">{likeCount}</span>}
                </button>
                
                <button
                  className={`icon-button ${isBookmarked ? 'button-active' : ''}`}
                  onClick={handleBookmark}
                  aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
                >
                  {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                </button>
                
                <button
                  className="icon-button"
                  onClick={handleShare}
                  aria-label="Share article"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    );
  }

  // ============================================================================
  // DEFAULT VARIANT
  // ============================================================================
  
  return (
    <GlassCard 
      ref={tiltRef}
      className="news-card news-card-default"
      onMouseEnter={playHover}
    >
      {/* Image */}
      <div ref={imageRef} className="news-image" onClick={handleRead}>
        {article.urlToImage ? (
          <Image
            src={article.urlToImage}
            alt={article.title}
            fill
            className="image"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="image-placeholder">
            <ExternalLink size={32} />
          </div>
        )}
        <div className="image-overlay">
          <span className="source-badge text-label-sm">{article.source?.name}</span>
        </div>
      </div>

      {/* Content */}
      <div className="news-content">
        <h3 className="text-h3 news-title" onClick={handleRead}>{article.title}</h3>
        
        {article.description && (
          <p className="text-body-sm news-description">
            {article.description.slice(0, 120)}...
          </p>
        )}

        {/* Meta */}
        <div className="news-meta">
          {article.author && (
            <div className="meta-item">
              <User size={12} />
              <span className="text-label-xs">{article.author}</span>
            </div>
          )}
          <div className="meta-item">
            <Clock size={12} />
            <span className="text-label-xs">{timeAgo}</span>
          </div>
          {viewCount > 0 && (
            <div className="meta-item">
              <Eye size={12} />
              <span className="text-label-xs">{viewCount}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="news-actions">
            <NewsButton onClick={handleRead} fullWidth size="small">
              Read More
            </NewsButton>

            <div className="action-icons">
              <button
                className={`icon-button ${isLiked ? 'button-active' : ''}`}
                onClick={handleLike}
                aria-label="Like article"
              >
                <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
                {likeCount > 0 && <span className="text-label-xs">{likeCount}</span>}
              </button>
              
              <button
                className={`icon-button ${isBookmarked ? 'button-active' : ''}`}
                onClick={handleBookmark}
                aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
              >
                {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
              </button>
              
              <button
                className="icon-button"
                onClick={handleShare}
                aria-label="Share article"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Styles */}
      <style jsx>{`
        .news-card {
          position: relative;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .news-card:hover {
          transform: translateY(-4px);
        }

        /* Image */
        .news-image {
          position: relative;
          width: 100%;
          height: 200px;
          border-radius: 12px;
          overflow: hidden;
          background: linear-gradient(135deg, rgba(224, 17, 95, 0.1), rgba(255, 215, 0, 0.1));
          cursor: pointer;
        }

        .news-image-large {
          height: 300px;
        }

        .image {
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .news-card:hover .image {
          transform: scale(1.05);
        }

        .image-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          color: rgba(255, 255, 255, 0.3);
        }

        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.7) 100%);
          display: flex;
          align-items: flex-end;
          padding: 1rem;
        }

        .source-badge {
          padding: 0.25rem 0.75rem;
          background: rgba(224, 17, 95, 0.9);
          color: white;
          border-radius: 12px;
          font-weight: 600;
          backdrop-filter: blur(10px);
        }

        /* Content */
        .news-content {
          padding: 1.5rem;
        }

        .news-title {
          margin-bottom: 0.75rem;
          color: var(--text-primary);
          cursor: pointer;
          transition: color 0.2s;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .news-title:hover {
          color: var(--news-primary);
        }

        .news-description {
          color: var(--text-secondary);
          margin-bottom: 1rem;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Meta */
        .news-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: var(--text-secondary);
        }

        .meta-item svg {
          color: var(--news-primary);
          flex-shrink: 0;
        }

        /* Actions */
        .news-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .action-icons {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
        }

        .action-buttons {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
        }

        .icon-button {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.5rem;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .icon-button:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--news-primary);
          transform: scale(1.1);
        }

        .button-active {
          background: rgba(224, 17, 95, 0.2);
          color: var(--news-primary);
          border-color: var(--news-primary);
        }

        /* Featured Badge */
        .featured-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, var(--news-primary), var(--news-secondary));
          border-radius: 20px;
          color: white;
          z-index: 10;
          font-weight: 600;
        }

        /* Compact Variant */
        .news-card-compact {
          padding: 0.75rem;
        }

        .compact-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .compact-image {
          position: relative;
          width: 80px;
          height: 80px;
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;
          background: rgba(224, 17, 95, 0.1);
        }

        .compact-info {
          flex: 1;
          min-width: 0;
        }

        .compact-title {
          color: var(--text-primary);
          margin-bottom: 0.5rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .compact-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        /* Minimal Variant */
        .news-card-minimal {
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
          transition: all 0.2s;
        }

        .news-card-minimal:hover {
          background: rgba(224, 17, 95, 0.05);
          padding-left: 1.5rem;
        }

        .minimal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .source-name {
          color: var(--news-primary);
          font-weight: 600;
        }

        .minimal-title {
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .minimal-desc {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Error State */
        .news-card-error {
          min-height: 100px;
        }

        .error-state {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          color: var(--text-secondary);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .news-image {
            height: 180px;
          }

          .news-image-large {
            height: 250px;
          }

          .compact-image {
            width: 60px;
            height: 60px;
          }

          .news-actions {
            flex-direction: column;
          }

          .action-buttons {
            width: 100%;
          }
        }
      `}</style>
    </GlassCard>
  );
}