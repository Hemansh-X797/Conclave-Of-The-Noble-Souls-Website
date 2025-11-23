// ============================================================================
// EXTERNAL SITE CARD COMPONENT - ELEGANT SITE SHOWCASE
// Beautiful card for displaying external website links with ratings and features
// Location: /src/components/pathways/sites/ExternalSiteCard.jsx
// ============================================================================

'use client';

import { useState, useCallback } from 'react';
import { useAppContext } from '@/contexts/AppProvider';
import { notify } from '@/components/interactive/NotificationCenter';
import { 
  ExternalLink, Star, Check, AlertCircle, 
  Globe, Shield, Zap, TrendingUp
} from 'lucide-react';

/**
 * ExternalSiteCard - Display card for external websites
 * 
 * @param {Object} props
 * @param {Object} props.site - Site object with details
 * @param {Function} props.onVisit - Callback when site is visited
 * @param {string} props.variant - Card variant ('default', 'compact', 'detailed')
 * @param {string} props.pathway - Current pathway for theming
 */
export default function ExternalSiteCard({
  site,
  onVisit,
  variant = 'default',
  pathway = 'lorebound'
}) {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // ============================================
  // CONTEXT & HOOKS
  // ============================================
  const { playClick, playHover } = useAppContext();

  // ============================================
  // HANDLERS
  // ============================================
  const handleVisit = useCallback(() => {
    playClick();
    
    if (site?.url) {
      window.open(site.url, '_blank', 'noopener,noreferrer');
      notify.success(`Opening ${site.name}...`, { duration: 2000 });
      
      if (onVisit) {
        onVisit(site);
      }
    }
  }, [site, playClick, onVisit]);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  // ============================================
  // RENDER RATING STARS
  // ============================================
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star 
          key={`full-${i}`} 
          size={14} 
          fill="currentColor" 
          style={{ color: '#FFD700' }}
        />
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <Star 
          key="half" 
          size={14} 
          fill="currentColor" 
          style={{ 
            color: '#FFD700',
            opacity: 0.5 
          }}
        />
      );
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star 
          key={`empty-${i}`} 
          size={14} 
          style={{ 
            color: '#FFD700',
            opacity: 0.2 
          }}
        />
      );
    }
    
    return stars;
  };

  // ============================================
  // VALIDATE SITE DATA
  // ============================================
  if (!site || !site.url) {
    return null;
  }

  // ============================================
  // RENDER: COMPACT VARIANT
  // ============================================
  if (variant === 'compact') {
    return (
      <button
        className={`site-card site-card-compact ${pathway}-pathway ${isHovered ? 'hovered' : ''}`}
        onClick={handleVisit}
        onMouseEnter={() => {
          playHover();
          setIsHovered(true);
        }}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="compact-logo">
          {!imageError && site.logo ? (
            <img 
              src={site.logo} 
              alt={site.name}
              onError={handleImageError}
            />
          ) : (
            <Globe size={24} />
          )}
        </div>

        <div className="compact-info">
          <div className="compact-name">{site.name}</div>
          {site.rating && (
            <div className="compact-rating">
              <Star size={12} fill="currentColor" style={{ color: '#FFD700' }} />
              {site.rating}
            </div>
          )}
        </div>

        <ExternalLink size={16} className="compact-icon" />

        <style jsx>{`
          .site-card-compact {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
            width: 100%;
          }

          .site-card-compact:hover {
            background: rgba(255, 255, 255, 0.05);
            border-color: var(--cns-gold);
            transform: translateX(4px);
          }

          .compact-logo {
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            overflow: hidden;
          }

          .compact-logo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .compact-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
          }

          .compact-name {
            font-family: var(--font-josefin);
            font-size: 0.95rem;
            font-weight: 600;
            color: var(--text-primary);
          }

          .compact-rating {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            font-family: var(--font-josefin);
            font-size: 0.8rem;
            color: var(--text-secondary);
          }

          .compact-icon {
            color: var(--cns-gold);
            opacity: 0;
            transition: opacity 0.3s ease;
          }

          .site-card-compact:hover .compact-icon {
            opacity: 1;
          }
        `}</style>
      </button>
    );
  }

  // ============================================
  // MAIN RENDER: DEFAULT/DETAILED VARIANT
  // ============================================
  return (
    <div 
      className={`site-card ${pathway}-pathway ${variant === 'detailed' ? 'detailed' : ''} ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => {
        playHover();
        setIsHovered(true);
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Site Logo/Header */}
      <div className="site-header">
        <div className="site-logo">
          {!imageError && site.logo ? (
            <img 
              src={site.logo} 
              alt={site.name}
              onError={handleImageError}
            />
          ) : (
            <Globe size={32} />
          )}
        </div>

        {site.status && (
          <div className={`site-status status-${site.status.toLowerCase()}`}>
            {site.status === 'Active' ? <Check size={12} /> : <AlertCircle size={12} />}
            {site.status}
          </div>
        )}
      </div>

      {/* Site Content */}
      <div className="site-content">
        <h3 className="site-name">{site.name}</h3>
        
        {site.category && (
          <div className="site-category">
            <Globe size={12} />
            {site.category}
          </div>
        )}

        {site.description && (
          <p className="site-description">{site.description}</p>
        )}

        {/* Rating */}
        {site.rating && (
          <div className="site-rating">
            <div className="rating-stars">
              {renderStars(site.rating)}
            </div>
            <span className="rating-value">{site.rating}/5</span>
          </div>
        )}

        {/* Features List */}
        {site.features && site.features.length > 0 && (
          <div className="site-features">
            {site.features.slice(0, variant === 'detailed' ? 6 : 3).map((feature, index) => (
              <div key={index} className="feature-tag">
                <Check size={12} />
                {feature}
              </div>
            ))}
          </div>
        )}

        {/* Additional Info (Detailed variant) */}
        {variant === 'detailed' && (
          <div className="site-info-grid">
            {site.lastChecked && (
              <div className="info-item">
                <Shield size={14} />
                <span>Checked: {new Date(site.lastChecked).toLocaleDateString()}</span>
              </div>
            )}
            {site.speed && (
              <div className="info-item">
                <Zap size={14} />
                <span>Speed: {site.speed}</span>
              </div>
            )}
            {site.popularity && (
              <div className="info-item">
                <TrendingUp size={14} />
                <span>Popularity: {site.popularity}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Visit Button */}
      <button
        className="visit-btn"
        onClick={handleVisit}
        onMouseEnter={playHover}
      >
        <ExternalLink size={16} />
        Visit Site
      </button>

      {/* Styles */}
      <style jsx>{`
        .site-card {
          display: flex;
          flex-direction: column;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 1.5rem;
          transition: all 0.3s ease;
          height: 100%;
        }

        .site-card:hover {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%);
          border-color: var(--cns-gold);
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
        }

        .site-card.detailed {
          padding: 2rem;
        }

        /* Header */
        .site-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .site-logo {
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          overflow: hidden;
        }

        .site-card.detailed .site-logo {
          width: 80px;
          height: 80px;
        }

        .site-logo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .site-status {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.75rem;
          border-radius: 12px;
          font-family: var(--font-josefin);
          font-size: 0.75rem;
          font-weight: 600;
        }

        .status-active {
          background: rgba(80, 200, 120, 0.1);
          color: #50C878;
          border: 1px solid rgba(80, 200, 120, 0.3);
        }

        .status-maintenance {
          background: rgba(255, 140, 0, 0.1);
          color: #FF8C00;
          border: 1px solid rgba(255, 140, 0, 0.3);
        }

        /* Content */
        .site-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .site-name {
          font-family: var(--font-cinzel);
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .site-card.detailed .site-name {
          font-size: 1.5rem;
        }

        .site-category {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.25rem 0.75rem;
          background: rgba(255, 215, 0, 0.1);
          border-radius: 12px;
          font-family: var(--font-josefin);
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--cns-gold);
          align-self: flex-start;
        }

        .site-description {
          font-family: var(--font-josefin);
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--text-secondary);
          margin: 0;
        }

        /* Rating */
        .site-rating {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .rating-stars {
          display: flex;
          gap: 0.15rem;
        }

        .rating-value {
          font-family: var(--font-cinzel);
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        /* Features */
        .site-features {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .feature-tag {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          font-family: var(--font-josefin);
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        /* Info Grid (Detailed) */
        .site-info-grid {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--font-josefin);
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        /* Visit Button */
        .visit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: var(--cns-gold);
          border: none;
          border-radius: 12px;
          color: var(--bg-primary);
          font-family: var(--font-josefin);
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 1rem;
        }

        .visit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 215, 0, 0.3);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .site-card {
            padding: 1.25rem;
          }

          .site-card.detailed {
            padding: 1.5rem;
          }

          .site-logo {
            width: 50px;
            height: 50px;
          }

          .site-card.detailed .site-logo {
            width: 60px;
            height: 60px;
          }

          .site-name {
            font-size: 1.1rem;
          }

          .site-card.detailed .site-name {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
}