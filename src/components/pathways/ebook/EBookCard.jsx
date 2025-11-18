// ============================================================================
// EBOOK CARD COMPONENT
// Display card for e-books with cover, info, and actions
// Location: /src/components/pathways/ebook/EBookCard.jsx
// ============================================================================

'use client';

import { useState } from 'react';
import Image from 'next/image';
import StatusBadge from '@/components/ui/StatusBadge';
import { NobleButton } from '@/components/ui/LuxuryButton';

/**
 * EBookCard Component
 * Beautiful card display for e-books
 * - Cover image with fallback
 * - Title, author, rating
 * - Genre tags, status badge
 * - Download and read actions
 * - Hover effects
 * 
 * @component
 * @example
 * <EBookCard
 *   book={{
 *     title: "Shadow Slave",
 *     author: "Guiltythree",
 *     rating: 9.5,
 *     coverImage: "/covers/shadow-slave.jpg",
 *     files: [...],
 *     genre: ["Fantasy", "Action"]
 *   }}
 *   onRead={handleRead}
 *   onDownload={handleDownload}
 * />
 */
const EBookCard = ({
  book = {},
  variant = 'default', // 'default' | 'compact' | 'detailed'
  onRead,
  onDownload,
  onClick,
  className = ''
}) => {
  // ==========================================================================
  // STATE
  // ==========================================================================
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // ==========================================================================
  // BOOK DATA DESTRUCTURING
  // ==========================================================================
  const {
    id,
    title = 'Untitled',
    author = 'Unknown Author',
    rating = 0,
    coverImage,
    genre = [],
    status = 'Completed',
    description = '',
    files = [],
    tags = [],
    downloads = 0
  } = book;

  // ==========================================================================
  // RATING DISPLAY
  // ==========================================================================
  const renderRating = () => {
    if (!rating || rating === 0) return null;

    const stars = Math.floor(rating / 2); // Convert 10-point to 5-star
    const hasHalfStar = (rating % 2) >= 1;

    return (
      <div className="ebook-rating" aria-label={`Rating: ${rating} out of 10`}>
        <div className="rating-stars">
          {[...Array(5)].map((_, index) => (
            <span 
              key={index}
              className={`star ${index < stars ? 'filled' : ''} ${index === stars && hasHalfStar ? 'half' : ''}`}
              aria-hidden="true"
            >
              {index < stars || (index === stars && hasHalfStar) ? '★' : '☆'}
            </span>
          ))}
        </div>
        <span className="rating-number">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // ==========================================================================
  // RENDER COVER IMAGE
  // ==========================================================================
  const renderCover = () => {
    if (imageError || !coverImage) {
      return (
        <div className="ebook-cover-fallback">
          <div className="fallback-icon">📚</div>
          <div className="fallback-title">{title}</div>
        </div>
      );
    }

    return (
      <Image
        src={coverImage}
        alt={`${title} cover`}
        fill
        sizes="(max-width: 768px) 150px, 200px"
        className="ebook-cover-image"
        onError={() => setImageError(true)}
      />
    );
  };

  // ==========================================================================
  // RENDER ACTIONS
  // ==========================================================================
  const renderActions = () => {
    if (variant === 'compact') return null;

    return (
      <div className="ebook-actions">
        {onRead && (
          <NobleButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onRead(book);
            }}
            className="action-read"
          >
            <span className="action-icon">👁️</span>
            <span>Read</span>
          </NobleButton>
        )}

        {onDownload && files && files.length > 0 && (
          <NobleButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDownload(book);
            }}
            className="action-download"
          >
            <span className="action-icon">⬇</span>
            <span>Download</span>
          </NobleButton>
        )}
      </div>
    );
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================
  return (
    <div
      className={`ebook-card ${variant}-variant ${className}`}
      onClick={() => onClick && onClick(book)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role={onClick ? 'button' : 'article'}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Cover Section */}
      <div className="ebook-cover-container">
        {renderCover()}
        
        {/* Overlay on Hover */}
        {isHovered && variant !== 'compact' && (
          <div className="ebook-overlay">
            <div className="overlay-content">
              <p className="overlay-description">
                {description || 'Click to view details'}
              </p>
            </div>
          </div>
        )}

        {/* Status Badge */}
        {status && (
          <div className="ebook-status-badge">
            <StatusBadge 
              status={status}
              size="small"
              pulse={status.toLowerCase() === 'ongoing'}
            />
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="ebook-info">
        {/* Title */}
        <h3 className="ebook-title" title={title}>
          {title}
        </h3>

        {/* Author */}
        <p className="ebook-author">by {author}</p>

        {/* Rating */}
        {renderRating()}

        {/* Genre Tags */}
        {genre.length > 0 && variant !== 'compact' && (
          <div className="ebook-genres">
            {genre.slice(0, 3).map((g, index) => (
              <span key={index} className="genre-tag">
                {g}
              </span>
            ))}
            {genre.length > 3 && (
              <span className="genre-more">+{genre.length - 3}</span>
            )}
          </div>
        )}

        {/* Meta Info */}
        {variant === 'detailed' && (
          <div className="ebook-meta">
            {files.length > 0 && (
              <span className="meta-item">
                <span className="meta-icon">📄</span>
                {files.length} file{files.length !== 1 ? 's' : ''}
              </span>
            )}
            {downloads > 0 && (
              <span className="meta-item">
                <span className="meta-icon">⬇</span>
                {downloads.toLocaleString()} downloads
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        {renderActions()}
      </div>

      {/* ====================================================================
          COMPONENT STYLES
          ==================================================================== */}
      <style jsx>{`
        /* ================================================================
           EBOOK CARD CONTAINER
           ================================================================ */
        
        .ebook-card {
          display: flex;
          flex-direction: column;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
          cursor: ${onClick ? 'pointer' : 'default'};
          height: 100%;
        }

        .ebook-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
          border-color: rgba(255, 215, 0, 0.3);
        }

        /* ================================================================
           COVER CONTAINER
           ================================================================ */
        
        .ebook-cover-container {
          position: relative;
          width: 100%;
          padding-top: 140%; /* 5:7 aspect ratio for book covers */
          background: rgba(0, 0, 0, 0.3);
          overflow: hidden;
        }

        .ebook-cover-image {
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .ebook-card:hover .ebook-cover-image {
          transform: scale(1.05);
        }

        /* Fallback Cover */}
        .ebook-cover-fallback {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05));
        }

        .fallback-icon {
          font-size: 3rem;
          opacity: 0.5;
        }

        .fallback-title {
          font-family: var(--font-josefin);
          font-size: 0.875rem;
          font-weight: 600;
          text-align: center;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.3;
        }

        /* ================================================================
           OVERLAY
           ================================================================ */
        
        .ebook-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to bottom, transparent 30%, rgba(0, 0, 0, 0.95) 100%);
          display: flex;
          align-items: flex-end;
          padding: 1.5rem;
          animation: overlayFadeIn 0.3s ease;
        }

        @keyframes overlayFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .overlay-content {
          width: 100%;
        }

        .overlay-description {
          font-family: var(--font-josefin);
          font-size: 0.8125rem;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* ================================================================
           STATUS BADGE
           ================================================================ */
        
        .ebook-status-badge {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          z-index: 2;
        }

        /* ================================================================
           INFO SECTION
           ================================================================ */
        
        .ebook-info {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          flex: 1;
        }

        /* ================================================================
           TITLE
           ================================================================ */
        
        .ebook-title {
          font-family: var(--font-josefin);
          font-size: 1.125rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.95);
          margin: 0;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* ================================================================
           AUTHOR
           ================================================================ */
        
        .ebook-author {
          font-family: var(--font-josefin);
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
          margin: 0;
          font-style: italic;
        }

        /* ================================================================
           RATING
           ================================================================ */
        
        .ebook-rating {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .rating-stars {
          display: flex;
          gap: 0.125rem;
          color: var(--cns-gold);
          font-size: 0.875rem;
        }

        .star {
          line-height: 1;
        }

        .star.filled {
          color: var(--cns-gold);
        }

        .rating-number {
          font-family: var(--font-josefin);
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--cns-gold);
        }

        /* ================================================================
           GENRE TAGS
           ================================================================ */
        
        .ebook-genres {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .genre-tag {
          padding: 0.25rem 0.625rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          font-family: var(--font-josefin);
          font-size: 0.75rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.7);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .genre-more {
          padding: 0.25rem 0.625rem;
          font-family: var(--font-josefin);
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
        }

        /* ================================================================
           META INFO
           ================================================================ */
        
        .ebook-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          padding-top: 0.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-family: var(--font-josefin);
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .meta-icon {
          font-size: 0.875rem;
        }

        /* ================================================================
           ACTIONS
           ================================================================ */
        
        .ebook-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: auto;
          padding-top: 1rem;
        }

        .ebook-actions :global(button) {
          flex: 1;
        }

        .action-icon {
          font-size: 1rem;
        }

        /* ================================================================
           VARIANT: COMPACT
           ================================================================ */
        
        .compact-variant {
          max-width: 150px;
        }

        .compact-variant .ebook-info {
          padding: 0.875rem;
          gap: 0.5rem;
        }

        .compact-variant .ebook-title {
          font-size: 0.9375rem;
        }

        .compact-variant .ebook-author {
          font-size: 0.8125rem;
        }

        /* ================================================================
           VARIANT: DETAILED
           ================================================================ */
        
        .detailed-variant .ebook-info {
          padding: 1.5rem;
        }

        /* ================================================================
           RESPONSIVE DESIGN
           ================================================================ */
        
        @media (max-width: 768px) {
          .ebook-title {
            font-size: 1rem;
          }

          .ebook-info {
            padding: 1rem;
          }

          .ebook-actions {
            flex-direction: column;
            gap: 0.5rem;
          }
        }

        @media (max-width: 480px) {
          .ebook-card {
            max-width: 100%;
          }

          .ebook-title {
            font-size: 0.9375rem;
          }
        }

        /* ================================================================
           ACCESSIBILITY
           ================================================================ */
        
        @media (prefers-reduced-motion: reduce) {
          .ebook-card,
          .ebook-cover-image,
          .ebook-overlay {
            transition: none !important;
            animation: none !important;
          }
        }

        @media (prefers-contrast: high) {
          .ebook-card {
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid rgba(255, 255, 255, 0.5);
          }

          .ebook-title,
          .ebook-author {
            color: white;
          }
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default EBookCard;