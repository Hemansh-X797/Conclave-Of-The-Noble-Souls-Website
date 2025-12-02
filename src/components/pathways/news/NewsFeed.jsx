// ============================================================================
// THE CONCLAVE REALM - NEWS FEED COMPONENT
// Location: /src/components/pathways/news/NewsFeed.jsx
// ============================================================================
// Purpose: Infinite scroll news feed with NewsAPI integration
// Uses: NewsCard, IntersectionObserver for infinite scroll
// ============================================================================

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  RefreshCw,
  Loader,
  AlertCircle,
  TrendingUp,
  Newspaper,
  Globe,
  Zap,
  Filter
} from 'lucide-react';

// Internal components
import NewsCard from './NewsCard';
import GlassCard from '@/components/ui/GlassCard';
import LuxuryButton, { NewsButton } from '@/components/ui/LuxuryButton';
import LoadingCrest from '@/components/ui/LoadingCrest';
import { useAppContext } from '@/contexts/AppProvider';
import { notify } from '@/components/interactive/NotificationCenter';

/**
 * @component NewsFeed
 * @description Infinite scroll news feed with dynamic data from NewsAPI
 * 
 * @param {string} category - News category: 'general'|'business'|'entertainment'|'health'|'science'|'sports'|'technology'
 * @param {string} country - Country code (e.g., 'us', 'gb', 'in')
 * @param {string} query - Search query
 * @param {string} variant - Card variant for news items
 * @param {number} pageSize - Number of articles per page (default: 10)
 * @param {boolean} enableInfiniteScroll - Enable infinite scroll
 * @param {Function} onArticleClick - Callback when article is clicked
 * @param {string} pathway - Pathway theme
 */
export default function NewsFeed({
  category = 'general',
  country = 'us',
  query = '',
  variant = 'default',
  pageSize = 10,
  enableInfiniteScroll = true,
  onArticleClick,
  pathway = 'news'
}) {
  // ============================================================================
  // STATE & REFS
  // ============================================================================
  const { playClick, animationsEnabled } = useAppContext();
  
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  // ============================================================================
  // NEWSAPI CONFIGURATION
  // ============================================================================
  
  const NEWS_API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY || 'demo'; // User needs to add this
  const NEWS_API_BASE = 'https://newsapi.org/v2';

  /**
   * Fetch news from NewsAPI
   * @param {number} pageNum - Page number to fetch
   * @param {boolean} isRefresh - Whether this is a refresh (clears existing data)
   */
  const fetchNews = useCallback(async (pageNum = 1, isRefresh = false) => {
    try {
      if (isRefresh) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      // Build API URL
      let apiUrl = '';
      
      if (query) {
        // Search endpoint for custom queries
        apiUrl = `${NEWS_API_BASE}/everything?q=${encodeURIComponent(query)}&page=${pageNum}&pageSize=${pageSize}&language=en&sortBy=publishedAt`;
      } else {
        // Top headlines endpoint for categories
        apiUrl = `${NEWS_API_BASE}/top-headlines?country=${country}&category=${category}&page=${pageNum}&pageSize=${pageSize}`;
      }

      const response = await fetch(apiUrl, {
        headers: {
          'X-Api-Key': NEWS_API_KEY
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid NewsAPI key. Please add NEXT_PUBLIC_NEWS_API_KEY to .env.local');
        } else if (response.status === 429) {
          throw new Error('NewsAPI rate limit exceeded. Please try again later.');
        } else {
          throw new Error(`NewsAPI error: ${response.status}`);
        }
      }

      const data = await response.json();

      if (data.status === 'error') {
        throw new Error(data.message || 'Failed to fetch news');
      }

      // Filter out articles with [Removed] content
      const validArticles = (data.articles || []).filter(
        article => article.title !== '[Removed]' && article.content !== '[Removed]'
      );

      if (isRefresh) {
        setArticles(validArticles);
      } else {
        setArticles(prev => [...prev, ...validArticles]);
      }

      setTotalResults(data.totalResults || 0);
      setHasMore(validArticles.length === pageSize && (pageNum * pageSize) < (data.totalResults || 0));
      setPage(pageNum);

    } catch (err) {
      console.error('News fetch error:', err);
      setError(err.message);
      
      if (isRefresh) {
        notify.error(err.message, { title: 'Failed to Load News' });
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [category, country, query, pageSize, NEWS_API_KEY]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Initial fetch
  useEffect(() => {
    fetchNews(1, true);
  }, [fetchNews]);

  // Infinite scroll observer
  useEffect(() => {
    if (!enableInfiniteScroll || !hasMore || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && hasMore) {
          fetchNews(page + 1, false);
        }
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0.1
      }
    );

    observerRef.current = observer;

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enableInfiniteScroll, hasMore, loadingMore, page, fetchNews]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleRefresh = () => {
    playClick();
    setPage(1);
    setArticles([]);
    setHasMore(true);
    fetchNews(1, true);
  };

  const handleLoadMore = () => {
    playClick();
    if (!loadingMore && hasMore) {
      fetchNews(page + 1, false);
    }
  };

  const handleArticleClick = (article) => {
    playClick();
    
    if (onArticleClick) {
      onArticleClick(article);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  // Loading State
  if (loading && articles.length === 0) {
    return (
      <div className="news-feed-loading">
        <LoadingCrest pathway={pathway} message="Loading latest news..." />
      </div>
    );
  }

  // Error State
  if (error && articles.length === 0) {
    return (
      <GlassCard className="news-feed-error">
        <div className="error-content">
          <AlertCircle size={64} className="error-icon" />
          <h3 className="text-h3">Failed to Load News</h3>
          <p className="text-body text-secondary">{error}</p>
          
          {error.includes('NewsAPI key') && (
            <div className="api-key-instructions">
              <h4 className="text-h4">Setup Instructions:</h4>
              <ol className="text-body-sm">
                <li>Go to <a href="https://newsapi.org" target="_blank" rel="noopener noreferrer">newsapi.org</a> and get a free API key</li>
                <li>Add to your <code>.env.local</code> file:</li>
                <code className="code-block">NEXT_PUBLIC_NEWS_API_KEY=your_api_key_here</code>
                <li>Restart your development server</li>
              </ol>
            </div>
          )}

          <NewsButton onClick={handleRefresh}>
            <RefreshCw size={18} />
            Try Again
          </NewsButton>
        </div>
      </GlassCard>
    );
  }

  // Empty State
  if (articles.length === 0) {
    return (
      <GlassCard className="news-feed-empty">
        <div className="empty-content">
          <Newspaper size={64} className="empty-icon" />
          <h3 className="text-h3">No Articles Found</h3>
          <p className="text-body text-secondary">
            {query ? `No results for "${query}"` : 'No articles available in this category'}
          </p>
          <NewsButton onClick={handleRefresh}>
            <RefreshCw size={18} />
            Refresh Feed
          </NewsButton>
        </div>
      </GlassCard>
    );
  }

  // Main Feed
  return (
    <div className="news-feed-container">
      {/* Feed Header */}
      <div className="feed-header">
        <div className="header-info">
          <div className="header-icon">
            {query ? <Zap size={24} /> : 
             category === 'technology' ? <Zap size={24} /> :
             category === 'business' ? <TrendingUp size={24} /> :
             <Globe size={24} />}
          </div>
          <div>
            <h3 className="text-h3">
              {query ? `Search: ${query}` : 
               category.charAt(0).toUpperCase() + category.slice(1) + ' News'}
            </h3>
            <p className="text-body-sm text-secondary">
              {totalResults.toLocaleString()} articles • Updated continuously
            </p>
          </div>
        </div>

        <NewsButton
          variant="secondary"
          size="small"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'spinning' : ''} />
          Refresh
        </NewsButton>
      </div>

      {/* Articles Grid */}
      <div className={`news-feed-grid news-feed-${variant}`}>
        {articles.map((article, index) => (
          <NewsCard
            key={`${article.url}-${index}`}
            article={article}
            variant={variant}
            onRead={handleArticleClick}
            pathway={pathway}
            enableTilt={animationsEnabled}
          />
        ))}
      </div>

      {/* Load More / Loading More */}
      {enableInfiniteScroll ? (
        <div ref={loadMoreRef} className="load-more-trigger">
          {loadingMore && (
            <div className="loading-more">
              <Loader size={24} className="spinning" />
              <span className="text-body">Loading more articles...</span>
            </div>
          )}
          {!hasMore && articles.length > 0 && (
            <div className="end-message">
              <p className="text-body text-secondary">You've reached the end!</p>
            </div>
          )}
        </div>
      ) : (
        hasMore && (
          <div className="load-more-button">
            <NewsButton
              onClick={handleLoadMore}
              disabled={loadingMore}
              size="large"
            >
              {loadingMore ? (
                <>
                  <Loader size={18} className="spinning" />
                  Loading...
                </>
              ) : (
                'Load More Articles'
              )}
            </NewsButton>
          </div>
        )
      )}

      {/* Styles */}
      <style jsx>{`
        .news-feed-container {
          width: 100%;
        }

        /* Feed Header */
        .feed-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--news-primary), var(--news-secondary));
          border-radius: 12px;
          color: white;
        }

        /* Articles Grid */
        .news-feed-grid {
          display: grid;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .news-feed-default {
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        }

        .news-feed-compact {
          grid-template-columns: 1fr;
        }

        .news-feed-featured {
          grid-template-columns: 1fr;
        }

        .news-feed-minimal {
          grid-template-columns: 1fr;
          gap: 0;
        }

        /* Loading States */
        .news-feed-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }

        .load-more-trigger {
          display: flex;
          justify-content: center;
          padding: 2rem 0;
          min-height: 100px;
        }

        .loading-more {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          color: var(--text-secondary);
        }

        .load-more-button {
          display: flex;
          justify-content: center;
          padding: 2rem 0;
        }

        .end-message {
          text-align: center;
          padding: 2rem;
        }

        /* Error State */
        .news-feed-error {
          padding: 3rem 2rem;
        }

        .error-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          text-align: center;
          max-width: 600px;
          margin: 0 auto;
        }

        .error-icon {
          color: var(--news-primary);
          opacity: 0.6;
        }

        .api-key-instructions {
          width: 100%;
          padding: 1.5rem;
          background: rgba(224, 17, 95, 0.1);
          border: 1px solid rgba(224, 17, 95, 0.3);
          border-radius: 12px;
          text-align: left;
        }

        .api-key-instructions h4 {
          margin-bottom: 1rem;
          color: var(--news-primary);
        }

        .api-key-instructions ol {
          padding-left: 1.5rem;
          margin: 1rem 0;
        }

        .api-key-instructions li {
          margin-bottom: 0.75rem;
          color: var(--text-secondary);
        }

        .api-key-instructions a {
          color: var(--news-primary);
          text-decoration: underline;
        }

        .code-block {
          display: block;
          margin: 0.5rem 0;
          padding: 0.75rem;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 6px;
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          color: var(--cns-gold);
          word-break: break-all;
        }

        /* Empty State */
        .news-feed-empty {
          padding: 4rem 2rem;
        }

        .empty-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          text-align: center;
        }

        .empty-icon {
          color: var(--text-secondary);
          opacity: 0.5;
        }

        /* Animations */
        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .news-feed-default {
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .news-feed-default {
            grid-template-columns: 1fr;
          }

          .feed-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .header-info {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}