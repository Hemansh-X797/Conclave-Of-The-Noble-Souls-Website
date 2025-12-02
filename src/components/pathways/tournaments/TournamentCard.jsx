// ============================================================================
// THE CONCLAVE REALM - TOURNAMENT CARD COMPONENT
// Location: /src/components/pathways/tournaments/TournamentCard.jsx
// ============================================================================
// Purpose: Luxury tournament card with all features
// Uses: GlassCard, LuxuryButton, use3DTilt, useImageReveal
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Trophy,
  Users,
  Calendar,
  DollarSign,
  Clock,
  Gamepad2,
  MapPin,
  Monitor,
  CheckCircle,
  XCircle,
  Loader,
  TrendingUp,
  Award,
  ExternalLink,
  Share2,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';

// Internal components
import GlassCard from '@/components/ui/GlassCard';
import LuxuryButton, { GamingButton } from '@/components/ui/LuxuryButton';
import { useAppContext } from '@/contexts/AppProvider';
import { notify } from '@/components/interactive/NotificationCenter';
import use3DTilt from '@/hooks/use3DTilt';
import useImageReveal from '@/hooks/useImageReveal';

/**
 * @component TournamentCard
 * @description Luxury tournament card with 3D tilt effect and image reveal
 * 
 * @param {Object} tournament - Tournament data object
 * @param {string} tournament.id - Unique tournament ID
 * @param {string} tournament.name - Tournament name
 * @param {string} tournament.game - Game name
 * @param {string} tournament.status - ongoing/upcoming/completed
 * @param {string} tournament.prize - Prize pool (e.g., "$10,000")
 * @param {number} tournament.currentParticipants - Current player count
 * @param {number} tournament.maxParticipants - Maximum players
 * @param {string} tournament.startDate - ISO date string
 * @param {string} tournament.thumbnail - Image path
 * 
 * @param {string} variant - Card style: 'default'|'compact'|'featured'
 * @param {Function} onRegister - Callback when user clicks register
 * @param {Function} onView - Callback when user clicks view details
 * @param {boolean} showActions - Show action buttons
 * @param {boolean} enableTilt - Enable 3D tilt effect
 * @param {string} pathway - Pathway theme (gaming by default)
 */
export default function TournamentCard({
  tournament,
  variant = 'default',
  onRegister,
  onView,
  showActions = true,
  enableTilt = true,
  pathway = 'gaming'
}) {
  // ============================================================================
  // STATE & HOOKS
  // ============================================================================
  const router = useRouter();
  const { playClick, playHover, animationsEnabled, user, isAuthenticated } = useAppContext();
  
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [timeUntilStart, setTimeUntilStart] = useState('');
  const [registrationStatus, setRegistrationStatus] = useState('open');
  
  // 3D Tilt effect
  const tiltRef = use3DTilt({
    tiltAngle: 10,
    glare: true,
    glareOpacity: 0.2,
    disabled: !enableTilt || !animationsEnabled
  });
  
  // Image reveal effect
  const imageRef = useImageReveal({
    direction: 'swing',
    intensity: 'medium',
    disabled: !animationsEnabled
  });

  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  // Check if tournament is bookmarked
  useEffect(() => {
    if (isAuthenticated && tournament?.id) {
      try {
        const bookmarks = JSON.parse(localStorage.getItem('tournament-bookmarks') || '[]');
        setIsBookmarked(bookmarks.includes(tournament.id));
      } catch (error) {
        console.error('Error loading bookmarks:', error);
      }
    }
  }, [tournament?.id, isAuthenticated]);

  // Calculate time until tournament starts
  useEffect(() => {
    if (!tournament?.startDate) return;

    const updateTime = () => {
      const now = new Date();
      const start = new Date(tournament.startDate);
      const diff = start - now;

      if (diff < 0) {
        setTimeUntilStart('Started');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeUntilStart(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeUntilStart(`${hours}h ${minutes}m`);
      } else {
        setTimeUntilStart(`${minutes}m`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [tournament?.startDate]);

  // Check registration status
  useEffect(() => {
    if (!tournament) return;

    const now = new Date();
    const deadline = new Date(tournament.registrationDeadline);
    const isFull = tournament.currentParticipants >= tournament.maxParticipants;

    if (now > deadline) {
      setRegistrationStatus('closed');
    } else if (isFull) {
      setRegistrationStatus('full');
    } else {
      setRegistrationStatus('open');
    }
  }, [tournament]);

  // ============================================================================
  // HANDLERS
  // ============================================================================
  
  const handleRegister = () => {
    playClick();
    
    if (!isAuthenticated) {
      notify.error('Please log in to register for tournaments', {
        title: 'Authentication Required'
      });
      return;
    }

    if (registrationStatus !== 'open') {
      notify.error(`Registration is ${registrationStatus}`, {
        title: 'Cannot Register'
      });
      return;
    }

    if (onRegister) {
      onRegister(tournament);
    } else {
      // Default: Navigate to tournament page
      router.push(`/pathways/gaming/tournaments/${tournament.id}`);
    }

    notify.success(`Registered for ${tournament.name}!`, {
      title: 'Registration Successful',
      duration: 5000
    });
  };

  const handleView = () => {
    playClick();
    
    if (onView) {
      onView(tournament);
    } else {
      router.push(`/pathways/gaming/tournaments/${tournament.id}`);
    }
  };

  const handleBookmark = () => {
    playClick();

    if (!isAuthenticated) {
      notify.error('Please log in to bookmark tournaments', {
        title: 'Authentication Required'
      });
      return;
    }

    try {
      const bookmarks = JSON.parse(localStorage.getItem('tournament-bookmarks') || '[]');
      
      if (isBookmarked) {
        const updated = bookmarks.filter(id => id !== tournament.id);
        localStorage.setItem('tournament-bookmarks', JSON.stringify(updated));
        setIsBookmarked(false);
        notify.info('Bookmark removed', { duration: 2000 });
      } else {
        bookmarks.push(tournament.id);
        localStorage.setItem('tournament-bookmarks', JSON.stringify(bookmarks));
        setIsBookmarked(true);
        notify.success('Tournament bookmarked!', { duration: 2000 });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      notify.error('Failed to update bookmark');
    }
  };

  const handleShare = async () => {
    playClick();

    const shareData = {
      title: tournament.name,
      text: `Check out ${tournament.name} - ${tournament.prize} prize pool!`,
      url: `${window.location.origin}/pathways/gaming/tournaments/${tournament.id}`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        notify.success('Shared successfully!');
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(shareData.url);
        notify.success('Link copied to clipboard!');
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
  
  if (!tournament) {
    return (
      <GlassCard className="tournament-card tournament-card-error">
        <div className="error-state">
          <XCircle size={48} />
          <p className="text-body">Tournament data unavailable</p>
        </div>
      </GlassCard>
    );
  }

  // ============================================================================
  // STATUS BADGE
  // ============================================================================
  
  const getStatusBadge = () => {
    const statusConfig = {
      ongoing: { icon: Loader, color: '#00BFFF', label: 'Live' },
      upcoming: { icon: Clock, color: '#FFD700', label: 'Upcoming' },
      completed: { icon: CheckCircle, color: '#50C878', label: 'Completed' }
    };

    const config = statusConfig[tournament.status] || statusConfig.upcoming;
    const StatusIcon = config.icon;

    return (
      <div 
        className={`tournament-status-badge tournament-status-${tournament.status}`}
        style={{ '--status-color': config.color }}
      >
        <StatusIcon size={14} className={tournament.status === 'ongoing' ? 'spinning' : ''} />
        <span className="text-label-sm">{config.label}</span>
      </div>
    );
  };

  // ============================================================================
  // REGISTRATION STATUS BADGE
  // ============================================================================
  
  const getRegistrationBadge = () => {
    if (tournament.status !== 'upcoming') return null;

    const badges = {
      open: { label: 'Open', color: '#50C878', icon: CheckCircle },
      closed: { label: 'Closed', color: '#FF6B6B', icon: XCircle },
      full: { label: 'Full', color: '#FFA500', icon: Users }
    };

    const config = badges[registrationStatus];
    const BadgeIcon = config.icon;

    return (
      <div 
        className="tournament-registration-badge"
        style={{ '--reg-color': config.color }}
      >
        <BadgeIcon size={12} />
        <span className="text-label-xs">{config.label}</span>
      </div>
    );
  };

  // ============================================================================
  // COMPACT VARIANT
  // ============================================================================
  
  if (variant === 'compact') {
    return (
      <GlassCard 
        ref={tiltRef}
        className="tournament-card tournament-card-compact"
        onClick={handleView}
        onMouseEnter={playHover}
      >
        <div className="compact-content">
          <div className="compact-header">
            <span className="text-h4">{tournament.gameIcon}</span>
            <div className="compact-info">
              <h4 className="text-h4">{tournament.name}</h4>
              <p className="text-label text-secondary">{tournament.game}</p>
            </div>
          </div>

          <div className="compact-stats">
            <div className="stat-item">
              <DollarSign size={14} />
              <span className="text-label">{tournament.prize}</span>
            </div>
            <div className="stat-item">
              <Users size={14} />
              <span className="text-label">{tournament.currentParticipants}/{tournament.maxParticipants}</span>
            </div>
          </div>

          {getStatusBadge()}
        </div>
      </GlassCard>
    );
  }

  // ============================================================================
  // FEATURED VARIANT
  // ============================================================================
  
  if (variant === 'featured') {
    return (
      <GlassCard 
        ref={tiltRef}
        className="tournament-card tournament-card-featured"
        onMouseEnter={playHover}
      >
        {/* Featured Banner */}
        <div className="featured-banner">
          <Award size={16} />
          <span className="text-label-sm">Featured Tournament</span>
        </div>

        {/* Thumbnail */}
        <div ref={imageRef} className="tournament-thumbnail">
          {tournament.thumbnail ? (
            <Image
              src={tournament.thumbnail}
              alt={tournament.name}
              fill
              className="thumbnail-image"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="thumbnail-placeholder">
              <Gamepad2 size={64} />
            </div>
          )}
          <div className="thumbnail-overlay">
            <span className="text-display tournament-icon">{tournament.gameIcon}</span>
          </div>
        </div>

        {/* Content */}
        <div className="tournament-content">
          {getStatusBadge()}
          {getRegistrationBadge()}

          <h3 className="text-h3 tournament-title">{tournament.name}</h3>
          <p className="text-body-sm tournament-game">{tournament.game}</p>

          <div className="tournament-stats-grid">
            <div className="stat-card">
              <Trophy className="stat-icon" size={20} />
              <div>
                <p className="text-label-xs text-secondary">Prize Pool</p>
                <p className="text-h4 stat-value">{tournament.prize}</p>
              </div>
            </div>

            <div className="stat-card">
              <Users className="stat-icon" size={20} />
              <div>
                <p className="text-label-xs text-secondary">Players</p>
                <p className="text-h4 stat-value">{tournament.currentParticipants}/{tournament.maxParticipants}</p>
              </div>
            </div>

            <div className="stat-card">
              <Calendar className="stat-icon" size={20} />
              <div>
                <p className="text-label-xs text-secondary">Starts In</p>
                <p className="text-h4 stat-value">{timeUntilStart}</p>
              </div>
            </div>

            <div className="stat-card">
              <MapPin className="stat-icon" size={20} />
              <div>
                <p className="text-label-xs text-secondary">Region</p>
                <p className="text-h4 stat-value">{tournament.region}</p>
              </div>
            </div>
          </div>

          {showActions && (
            <div className="tournament-actions">
              {tournament.status === 'upcoming' && registrationStatus === 'open' && (
                <GamingButton
                  onClick={handleRegister}
                  fullWidth
                  size="large"
                >
                  Register Now - {tournament.entryFee}
                </GamingButton>
              )}

              {tournament.status === 'ongoing' && (
                <GamingButton
                  onClick={handleView}
                  fullWidth
                  size="large"
                >
                  <ExternalLink size={18} />
                  Watch Live
                </GamingButton>
              )}

              {tournament.status === 'completed' && (
                <GamingButton
                  onClick={handleView}
                  fullWidth
                  size="large"
                  variant="secondary"
                >
                  View Results
                </GamingButton>
              )}

              <div className="action-buttons">
                <button 
                  className="icon-button"
                  onClick={handleBookmark}
                  aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark tournament'}
                >
                  {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                </button>
                <button 
                  className="icon-button"
                  onClick={handleShare}
                  aria-label="Share tournament"
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
      className="tournament-card tournament-card-default"
      onMouseEnter={playHover}
    >
      {/* Thumbnail */}
      <div ref={imageRef} className="tournament-thumbnail">
        {tournament.thumbnail ? (
          <Image
            src={tournament.thumbnail}
            alt={tournament.name}
            fill
            className="thumbnail-image"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="thumbnail-placeholder">
            <Gamepad2 size={48} />
          </div>
        )}
        <div className="thumbnail-overlay">
          <span className="text-h1 tournament-icon">{tournament.gameIcon}</span>
        </div>
      </div>

      {/* Content */}
      <div className="tournament-content">
        <div className="tournament-header">
          {getStatusBadge()}
          {getRegistrationBadge()}
        </div>

        <h3 className="text-h3 tournament-title">{tournament.name}</h3>
        <p className="text-body tournament-game">{tournament.game}</p>

        <div className="tournament-info">
          <div className="info-row">
            <Trophy size={16} />
            <span className="text-body-sm">{tournament.prize}</span>
          </div>
          <div className="info-row">
            <Users size={16} />
            <span className="text-body-sm">{tournament.currentParticipants}/{tournament.maxParticipants} Players</span>
          </div>
          <div className="info-row">
            <Calendar size={16} />
            <span className="text-body-sm">Starts in {timeUntilStart}</span>
          </div>
          <div className="info-row">
            <MapPin size={16} />
            <span className="text-body-sm">{tournament.region}</span>
          </div>
          <div className="info-row">
            <Monitor size={16} />
            <span className="text-body-sm">{tournament.platform}</span>
          </div>
        </div>

        {showActions && (
          <div className="tournament-actions">
            {tournament.status === 'upcoming' && (
              <>
                {registrationStatus === 'open' ? (
                  <GamingButton onClick={handleRegister} fullWidth>
                    Register - {tournament.entryFee}
                  </GamingButton>
                ) : (
                  <GamingButton onClick={handleView} fullWidth variant="secondary">
                    View Details
                  </GamingButton>
                )}
              </>
            )}

            {tournament.status === 'ongoing' && (
              <GamingButton onClick={handleView} fullWidth>
                <ExternalLink size={18} />
                Watch Live
              </GamingButton>
            )}

            {tournament.status === 'completed' && (
              <GamingButton onClick={handleView} fullWidth variant="secondary">
                View Results
              </GamingButton>
            )}

            <div className="action-icons">
              <button 
                className="icon-button"
                onClick={handleBookmark}
                aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark tournament'}
              >
                {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
              </button>
              <button 
                className="icon-button"
                onClick={handleShare}
                aria-label="Share tournament"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Styles */}
      <style jsx>{`
        .tournament-card {
          position: relative;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .tournament-card:hover {
          transform: translateY(-4px);
        }

        /* Thumbnail */
        .tournament-thumbnail {
          position: relative;
          width: 100%;
          height: 200px;
          border-radius: 12px;
          overflow: hidden;
          background: linear-gradient(135deg, rgba(0, 191, 255, 0.1), rgba(255, 215, 0, 0.1));
        }

        .thumbnail-image {
          object-fit: cover;
        }

        .thumbnail-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          color: rgba(255, 255, 255, 0.3);
        }

        .thumbnail-overlay {
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

        .tournament-icon {
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
        }

        /* Content */
        .tournament-content {
          padding: 1.5rem;
        }

        .tournament-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .tournament-title {
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .tournament-game {
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        /* Status Badges */
        .tournament-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          background: rgba(var(--status-color), 0.1);
          border: 1px solid var(--status-color);
          color: var(--status-color);
        }

        .tournament-status-ongoing .spinning {
          animation: spin 2s linear infinite;
        }

        .tournament-registration-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.5rem;
          border-radius: 8px;
          background: rgba(var(--reg-color), 0.1);
          border: 1px solid var(--reg-color);
          color: var(--reg-color);
        }

        /* Info Rows */
        .tournament-info {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .info-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
        }

        .info-row svg {
          color: var(--gaming-primary);
          flex-shrink: 0;
        }

        /* Actions */
        .tournament-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .action-icons {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
        }

        .icon-button {
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
          color: var(--gaming-primary);
          transform: scale(1.1);
        }

        /* Compact Variant */
        .tournament-card-compact {
          padding: 1rem;
        }

        .compact-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .compact-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
        }

        .compact-info {
          flex: 1;
        }

        .compact-stats {
          display: flex;
          gap: 1rem;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: var(--text-secondary);
        }

        /* Featured Variant */
        .tournament-card-featured {
          border: 2px solid var(--gaming-primary);
        }

        .featured-banner {
          position: absolute;
          top: 1rem;
          right: 1rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, var(--gaming-primary), var(--gaming-secondary));
          border-radius: 20px;
          color: var(--bg-primary);
          z-index: 10;
          font-weight: 600;
        }

        .tournament-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin: 1.5rem 0;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .stat-icon {
          color: var(--gaming-primary);
        }

        .stat-value {
          color: var(--text-primary);
          margin-top: 0.25rem;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
        }

        /* Error State */
        .tournament-card-error {
          min-height: 200px;
        }

        .error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 2rem;
          color: var(--text-secondary);
        }

        /* Animations */
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .tournament-thumbnail {
            height: 150px;
          }

          .tournament-stats-grid {
            grid-template-columns: 1fr;
          }

          .compact-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .compact-stats {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </GlassCard>
  );
}