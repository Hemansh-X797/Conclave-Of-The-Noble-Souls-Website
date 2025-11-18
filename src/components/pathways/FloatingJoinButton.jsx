// ============================================================================
// FLOATING JOIN BUTTON COMPONENT
// Hero-integrated pathway join button
// Location: /src/components/pathways/FloatingJoinButton.jsx
// ============================================================================

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { GamingButton, LoreboundButton, ProductiveButton, NewsButton, NobleButton } from '@/components/ui/LuxuryButton';
import { notify } from '@/components/interactive/NotificationCenter';
import { getPathwayById } from '@/data/pathways';
import { PATHWAY_LAYOUT_CONFIG } from '@/config/pathwayLayout.config';

/**
 * FloatingJoinButton Component
 * Large, prominent join button integrated into pathway hero sections
 * - Shows only on main pathway pages
 * - Shows only if user hasn't joined
 * - Positioned prominently in hero
 * - Fades after successful join
 * 
 * @component
 * @example
 * <FloatingJoinButton 
 *   pathway="gaming"
 *   isJoined={false}
 *   userId="user123"
 * />
 */
const FloatingJoinButton = ({
  pathway = 'gaming',
  isJoined = false,
  userId = null,
  isAuthenticated = false,
  position = 'hero-inline', // 'hero-inline' | 'floating'
  onJoinSuccess,
  onJoinError,
  className = ''
}) => {
  // ==========================================================================
  // STATE
  // ==========================================================================
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(isJoined);
  const [showWelcome, setShowWelcome] = useState(false);

  // ==========================================================================
  // HOOKS
  // ==========================================================================
  const router = useRouter();

  // ==========================================================================
  // PATHWAY DATA
  // ==========================================================================
  const pathwayData = getPathwayById(pathway);

  // ==========================================================================
  // JOIN HANDLER
  // ==========================================================================
  const handleJoinPathway = useCallback(async () => {
    // Check authentication
    if (!isAuthenticated) {
      notify.error('Please login first', {
        title: 'Authentication Required'
      });
      router.push('/gateway');
      return;
    }

    try {
      setJoining(true);

      // TODO: Replace with actual Supabase call after setup
      // Simulating API call for now
      await new Promise(resolve => setTimeout(resolve, 800));

      /*
      // FUTURE: Actual Supabase implementation
      const { data, error } = await supabase
        .from('pathway_progress')
        .insert({
          user_id: userId,
          pathway_id: pathway,
          joined_at: new Date().toISOString(),
          progress: 0
        });

      if (error) throw error;
      */

      // Success!
      setJoined(true);
      setShowWelcome(true);

      notify.success(`Welcome to ${pathwayData.name}!`, {
        title: 'Pathway Joined',
        duration: 5000
      });

      // Call success callback
      if (onJoinSuccess) {
        onJoinSuccess(pathway);
      }

      // Hide welcome message after 3 seconds
      setTimeout(() => {
        setShowWelcome(false);
      }, 3000);

    } catch (error) {
      console.error('Failed to join pathway:', error);
      
      notify.error('Failed to join pathway. Please try again.', {
        title: 'Join Failed'
      });

      if (onJoinError) {
        onJoinError(error);
      }

    } finally {
      setJoining(false);
    }
  }, [isAuthenticated, userId, pathway, pathwayData, router, onJoinSuccess, onJoinError]);

  // ==========================================================================
  // CHECK IF SHOULD DISPLAY
  // ==========================================================================
  
  // Don't show if already joined
  if (joined) {
    // Show welcome message briefly
    if (showWelcome) {
      return (
        <div className={`join-welcome ${pathway}-welcome ${className}`}>
          <div className="welcome-content">
            <div className="welcome-icon">✨</div>
            <h3 className="welcome-title">Welcome, Noble Soul!</h3>
            <p className="welcome-message">
              You've joined <span className="pathway-name">{pathwayData.name}</span>
            </p>
          </div>

          <style jsx>{`
            .join-welcome {
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 2rem;
              background: rgba(255, 255, 255, 0.05);
              border-radius: 12px;
              border: 2px solid var(--cns-gold);
              animation: welcomeFadeIn 0.5s ease, welcomeFadeOut 0.5s ease 2.5s forwards;
            }

            .welcome-content {
              text-align: center;
            }

            .welcome-icon {
              font-size: 3rem;
              margin-bottom: 1rem;
              animation: welcomeIconBounce 0.6s ease;
            }

            .welcome-title {
              font-family: var(--font-josefin);
              font-size: 1.5rem;
              font-weight: 700;
              color: var(--cns-gold);
              margin-bottom: 0.5rem;
            }

            .welcome-message {
              font-family: var(--font-josefin);
              font-size: 1rem;
              color: rgba(255, 255, 255, 0.9);
            }

            .pathway-name {
              font-weight: 600;
              background: linear-gradient(135deg, var(--cns-gold), #FFA500);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }

            @keyframes welcomeFadeIn {
              from {
                opacity: 0;
                transform: scale(0.9) translateY(20px);
              }
              to {
                opacity: 1;
                transform: scale(1) translateY(0);
              }
            }

            @keyframes welcomeFadeOut {
              to {
                opacity: 0;
                transform: scale(0.95) translateY(-10px);
              }
            }

            @keyframes welcomeIconBounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
          `}</style>
        </div>
      );
    }
    return null;
  }

  // Don't show if disabled in config
  if (!PATHWAY_LAYOUT_CONFIG.joinButton.enabled) {
    return null;
  }

  // ==========================================================================
  // BUTTON SELECTION BASED ON PATHWAY
  // ==========================================================================
  const ButtonComponent = {
    gaming: GamingButton,
    lorebound: LoreboundButton,
    productive: ProductiveButton,
    news: NewsButton
  }[pathway] || NobleButton;

  // ==========================================================================
  // RENDER
  // ==========================================================================
  return (
    <div className={`floating-join-container ${position} ${pathway}-join ${className}`}>
      <div className="join-content">
        {/* Pathway Info */}
        <div className="join-info">
          <div className="join-icon" aria-hidden="true">{pathwayData.icon}</div>
          <div className="join-text">
            <h3 className="join-title">
              Ready to join <span className="pathway-highlight">{pathwayData.name}</span>?
            </h3>
            <p className="join-description">
              {pathwayData.shortDescription || pathwayData.description}
            </p>
          </div>
        </div>

        {/* Join Button */}
        <ButtonComponent
          size="xlarge"
          onClick={handleJoinPathway}
          disabled={joining}
          className="join-button"
          aria-label={`Join ${pathwayData.name}`}
        >
          {joining ? (
            <>
              <span className="button-spinner" aria-hidden="true">⟳</span>
              <span>Joining...</span>
            </>
          ) : (
            <>
              <span className="button-icon" aria-hidden="true">⭐</span>
              <span>Join {pathwayData.name}</span>
            </>
          )}
        </ButtonComponent>

        {/* Benefits Preview */}
        <div className="join-benefits">
          <p className="benefits-intro">You'll get access to:</p>
          <ul className="benefits-list">
            {pathwayData.features && pathwayData.features.slice(0, 3).map((feature, index) => (
              <li key={index} className="benefit-item">
                <span className="benefit-check" aria-hidden="true">✓</span>
                <span>{feature.title || feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ====================================================================
          COMPONENT STYLES
          ==================================================================== */}
      <style jsx>{`
        /* ================================================================
           JOIN CONTAINER
           ================================================================ */
        
        .floating-join-container {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          padding: 2.5rem;
          background: rgba(10, 10, 15, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .floating-join-container:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 48px rgba(0, 0, 0, 0.5);
        }

        /* Position variants */
        .floating-join-container.floating {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          z-index: 1000;
          max-width: 400px;
        }

        .floating-join-container.hero-inline {
          /* Stays inline with hero content */
          position: relative;
        }

        /* ================================================================
           PATHWAY-SPECIFIC BORDERS
           ================================================================ */
        
        .gaming-join {
          border-color: rgba(0, 191, 255, 0.3);
          box-shadow: 0 8px 32px rgba(0, 191, 255, 0.1);
        }

        .lorebound-join {
          border-color: rgba(255, 20, 147, 0.3);
          box-shadow: 0 8px 32px rgba(255, 20, 147, 0.1);
        }

        .productive-join {
          border-color: rgba(80, 200, 120, 0.3);
          box-shadow: 0 8px 32px rgba(80, 200, 120, 0.1);
        }

        .news-join {
          border-color: rgba(224, 17, 95, 0.3);
          box-shadow: 0 8px 32px rgba(224, 17, 95, 0.1);
        }

        /* ================================================================
           CONTENT
           ================================================================ */
        
        .join-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        /* ================================================================
           PATHWAY INFO
           ================================================================ */
        
        .join-info {
          display: flex;
          gap: 1.5rem;
          align-items: flex-start;
        }

        .join-icon {
          font-size: 3rem;
          line-height: 1;
          flex-shrink: 0;
        }

        .join-text {
          flex: 1;
        }

        .join-title {
          font-family: var(--font-josefin);
          font-size: 1.5rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.95);
          margin-bottom: 0.75rem;
          line-height: 1.3;
        }

        .pathway-highlight {
          background: linear-gradient(135deg, var(--cns-gold), #FFA500);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .join-description {
          font-family: var(--font-josefin);
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
        }

        /* ================================================================
           JOIN BUTTON
           ================================================================ */
        
        .join-button {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }

        .button-icon {
          font-size: 1.25rem;
        }

        .button-spinner {
          display: inline-block;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* ================================================================
           BENEFITS
           ================================================================ */
        
        .join-benefits {
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .benefits-intro {
          font-family: var(--font-josefin);
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--cns-gold);
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .benefits-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .benefit-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-family: var(--font-josefin);
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .benefit-check {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          background: var(--cns-gold);
          color: var(--bg-primary);
          border-radius: 50%;
          font-size: 0.75rem;
          font-weight: 700;
          flex-shrink: 0;
        }

        /* ================================================================
           RESPONSIVE DESIGN
           ================================================================ */
        
        @media (max-width: 768px) {
          .floating-join-container {
            padding: 2rem;
            max-width: 100%;
          }

          .floating-join-container.floating {
            position: relative;
            bottom: auto;
            right: auto;
          }

          .join-info {
            gap: 1rem;
          }

          .join-icon {
            font-size: 2.5rem;
          }

          .join-title {
            font-size: 1.25rem;
          }

          .join-description {
            font-size: 0.875rem;
          }
        }

        @media (max-width: 480px) {
          .floating-join-container {
            padding: 1.5rem;
          }

          .join-info {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }

          .join-icon {
            font-size: 3rem;
          }

          .join-title {
            font-size: 1.125rem;
          }

          .benefits-list {
            gap: 0.5rem;
          }

          .benefit-item {
            font-size: 0.85rem;
          }
        }

        /* ================================================================
           ACCESSIBILITY
           ================================================================ */
        
        @media (prefers-reduced-motion: reduce) {
          .floating-join-container,
          .button-spinner {
            transition: none !important;
            animation: none !important;
          }
        }

        @media (prefers-contrast: high) {
          .floating-join-container {
            background: rgba(0, 0, 0, 0.95);
            border: 2px solid rgba(255, 255, 255, 0.5);
          }

          .join-title,
          .join-description,
          .benefit-item {
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

export default FloatingJoinButton;