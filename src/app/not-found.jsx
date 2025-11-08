// ============================================================================
// 404 NOT FOUND PAGE - The Conclave Realm
// Elegant page for missing routes with luxury aesthetics
// Location: /src/app/not-found.jsx
// ============================================================================

'use client';

import { useRouter, usePathname } from 'next/navigation';
import { NobleButton, TextFlameButton } from '@/components/ui/LuxuryButton';
import GlassCard from '@/components/ui/GlassCard';
import { Home, Search, ArrowLeft, Compass, Map } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * 404 Not Found Page
 * Shows when a route doesn't exist
 * Provides helpful navigation options
 */
export default function NotFound() {
  const router = useRouter();
  const pathname = usePathname();
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const path = pathname.toLowerCase();
    const newSuggestions = [];

    if (path.includes('game') || path.includes('gaming')) {
      newSuggestions.push({ label: 'Gaming Realm', path: '/pathways/gaming' });
    }
    if (path.includes('lore') || path.includes('anime') || path.includes('manga')) {
      newSuggestions.push({ label: 'Lorebound Sanctuary', path: '/pathways/lorebound' });
    }
    if (path.includes('product') || path.includes('work')) {
      newSuggestions.push({ label: 'Productive Palace', path: '/pathways/productive' });
    }
    if (path.includes('news')) {
      newSuggestions.push({ label: 'News Nexus', path: '/pathways/news' });
    }
    if (path.includes('event')) {
      newSuggestions.push({ label: 'Events', path: '/events' });
    }
    if (path.includes('staff') || path.includes('team')) {
      newSuggestions.push({ label: 'Noble Court', path: '/court' });
    }
    if (path.includes('dashboard') || path.includes('profile')) {
      newSuggestions.push({ label: 'Your Chambers', path: '/chambers' });
    }

    if (newSuggestions.length === 0) {
      newSuggestions.push(
        { label: 'Homepage', path: '/' },
        { label: 'Pathways', path: '/pathways' },
        { label: 'Gateway', path: '/gateway' }
      );
    }

    setSuggestions(newSuggestions);
  }, [pathname]);

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleSearch = () => {
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
      bubbles: true
    });
    document.dispatchEvent(event);
  };

  return (
    <div className="not-found-container">
      <div className="not-found-bg">
        <div className="not-found-orb not-found-orb-1" />
        <div className="not-found-orb not-found-orb-2" />
        <div className="not-found-orb not-found-orb-3" />
        <div className="not-found-grid" />
      </div>

      <div className="not-found-content">
        <div className="not-found-number-container">
          <div className="not-found-number">4</div>
          <div className="not-found-number not-found-number-center">
            <Compass className="not-found-compass" />
          </div>
          <div className="not-found-number">4</div>
        </div>

        <h1 className="text-h1 text-gradient-divine not-found-title">
          Page Not Found
        </h1>

        <p className="text-h4 text-glow-soft not-found-subtitle">
          This path does not exist in The Conclave Realm
        </p>

        <GlassCard className="not-found-path-card">
          <div className="not-found-path-info">
            <Map className="not-found-path-icon" />
            <div>
              <p className="text-caption not-found-path-label">
                Attempted Path:
              </p>
              <p className="text-body not-found-path-value">
                {pathname}
              </p>
            </div>
          </div>
        </GlassCard>

        {suggestions.length > 0 && (
          <div className="not-found-suggestions">
            <h3 className="text-h5 text-gradient-divine">
              Perhaps you were looking for:
            </h3>
            <div className="not-found-suggestions-grid">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => router.push(suggestion.path)}
                  className="not-found-suggestion-item"
                >
                  <span className="text-body">{suggestion.label}</span>
                  <ArrowLeft className="suggestion-arrow" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="not-found-actions">
          <NobleButton
            size="large"
            onClick={handleGoHome}
            className="not-found-action-primary"
          >
            <Home className="button-icon" />
            Return to Homepage
          </NobleButton>

          <TextFlameButton
            size="large"
            onClick={handleSearch}
          >
            <Search className="button-icon" />
            Search Site
          </TextFlameButton>

          <TextFlameButton
            size="medium"
            onClick={handleGoBack}
          >
            <ArrowLeft className="button-icon" />
            Go Back
          </TextFlameButton>
        </div>

        <div className="not-found-help">
          <p className="text-body-small text-glow-soft">
            Lost? Press <kbd className="kbd">Ctrl</kbd> + <kbd className="kbd">K</kbd> to search,
            or contact us if you believe this is an error.
          </p>
        </div>
      </div>

      <style jsx>{`
        .not-found-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          overflow: hidden;
          background: var(--bg-primary);
        }

        .not-found-bg {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 0;
        }

        .not-found-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.12;
          animation: orbFloatSlow 25s ease-in-out infinite;
        }

        .not-found-orb-1 {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, transparent 70%);
          top: -250px;
          left: -250px;
        }

        .not-found-orb-2 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(153, 102, 204, 0.3) 0%, transparent 70%);
          bottom: -200px;
          right: -200px;
          animation-delay: -8s;
        }

        .not-found-orb-3 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(0, 191, 255, 0.3) 0%, transparent 70%);
          top: 40%;
          left: 60%;
          animation-delay: -16s;
        }

        @keyframes orbFloatSlow {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
          25% { transform: translate(40px, -40px) scale(1.1) rotate(90deg); }
          50% { transform: translate(-30px, 30px) scale(0.9) rotate(180deg); }
          75% { transform: translate(50px, 20px) scale(1.05) rotate(270deg); }
        }

        .not-found-grid {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            linear-gradient(rgba(255, 215, 0, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 215, 0, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: gridMove 20s linear infinite;
        }

        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }

        .not-found-content {
          position: relative;
          z-index: 1;
          max-width: 900px;
          width: 100%;
          text-align: center;
          animation: fadeInScale 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .not-found-number-container {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .not-found-number {
          font-size: clamp(6rem, 15vw, 12rem);
          font-weight: 900;
          font-family: var(--font-decorative);
          background: var(--gradient-divine-gold);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 0 60px rgba(255, 215, 0, 0.4);
          animation: numberFloat 4s ease-in-out infinite;
          line-height: 1;
        }

        .not-found-number:nth-child(1) {
          animation-delay: 0s;
        }

        .not-found-number:nth-child(3) {
          animation-delay: -2s;
        }

        @keyframes numberFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        .not-found-number-center {
          font-size: clamp(4rem, 10vw, 8rem);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .not-found-compass {
          width: clamp(4rem, 10vw, 8rem);
          height: clamp(4rem, 10vw, 8rem);
          color: var(--cns-gold);
          filter: drop-shadow(0 0 30px rgba(255, 215, 0, 0.6));
          animation: compassSpin 20s linear infinite;
        }

        @keyframes compassSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .not-found-title {
          margin-bottom: 1rem;
        }

        .not-found-subtitle {
          margin-bottom: 2.5rem;
          opacity: 0.9;
        }

        .not-found-path-card {
          margin: 0 auto 2.5rem;
          max-width: 600px;
        }

        .not-found-path-info {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          text-align: left;
        }

        .not-found-path-icon {
          width: 32px;
          height: 32px;
          color: var(--cns-gold);
          flex-shrink: 0;
          margin-top: 0.25rem;
        }

        .not-found-path-label {
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 0.5rem;
        }

        .not-found-path-value {
          color: var(--text-primary);
          word-break: break-all;
          font-family: 'Courier New', monospace;
          background: rgba(255, 215, 0, 0.05);
          padding: 0.5rem;
          border-radius: var(--radius-sm);
          border: 1px solid rgba(255, 215, 0, 0.2);
        }

        .not-found-suggestions {
          margin-bottom: 2.5rem;
        }

        .not-found-suggestions h3 {
          margin-bottom: 1.5rem;
        }

        .not-found-suggestions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .not-found-suggestion-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          background: var(--bg-glass);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 215, 0, 0.2);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
        }

        .not-found-suggestion-item:hover {
          background: var(--bg-glass-hover);
          border-color: rgba(255, 215, 0, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(255, 215, 0, 0.2);
        }

        .suggestion-arrow {
          width: 20px;
          height: 20px;
          transform: rotate(180deg);
          transition: transform 0.3s ease;
        }

        .not-found-suggestion-item:hover .suggestion-arrow {
          transform: rotate(180deg) translateX(-5px);
        }

        .not-found-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          justify-content: center;
          align-items: center;
          margin-bottom: 2rem;
        }

        .not-found-action-primary {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .button-icon {
          width: 20px;
          height: 20px;
        }

        .not-found-help {
          margin-top: 2rem;
        }

        .kbd {
          background: rgba(255, 215, 0, 0.1);
          border: 1px solid rgba(255, 215, 0, 0.3);
          border-radius: var(--radius-sm);
          padding: 0.2em 0.4em;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
          color: var(--cns-gold);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          display: inline-block;
          min-width: 1.5em;
          text-align: center;
        }

        @media (max-width: 768px) {
          .not-found-container {
            padding: 1rem;
          }

          .not-found-number-container {
            gap: 1rem;
          }

          .not-found-number {
            font-size: clamp(4rem, 12vw, 8rem);
          }

          .not-found-number-center {
            font-size: clamp(3rem, 8vw, 6rem);
          }

          .not-found-compass {
            width: clamp(3rem, 8vw, 6rem);
            height: clamp(3rem, 8vw, 6rem);
          }

          .not-found-title {
            font-size: clamp(2rem, 6vw, 3rem);
          }

          .not-found-subtitle {
            font-size: clamp(1.25rem, 4vw, 1.75rem);
          }

          .not-found-suggestions-grid {
            grid-template-columns: 1fr;
          }

          .not-found-actions {
            flex-direction: column;
            gap: 1rem;
          }

          .not-found-orb {
            filter: blur(80px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .not-found-number,
          .not-found-compass,
          .not-found-orb,
          .not-found-grid {
            animation: none !important;
          }

          .not-found-content {
            animation: none !important;
          }

          .not-found-suggestion-item:hover {
            transform: none;
          }
        }

        @media (prefers-contrast: high) {
          .not-found-orb,
          .not-found-grid {
            display: none;
          }

          .not-found-number,
          .not-found-compass {
            filter: none;
          }
        }
      `}</style>
    </div>
  );
}