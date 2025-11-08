// ============================================================================
// ERROR BOUNDARY - The Conclave Realm
// Elegant error handling with luxury aesthetics
// Location: /src/app/error.jsx
// ============================================================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/ui/GlassCard';
import { NobleButton, TextFlameButton } from '@/components/ui/LuxuryButton';
import { notify } from '@/components/interactive/NotificationCenter';
import { AlertTriangle, Home, RefreshCw, Mail, ArrowLeft } from 'lucide-react';

/**
 * Global error boundary
 * Catches all runtime errors and displays elegant fallback UI
 * Automatically logs errors for debugging
 */
export default function Error({ error, reset }) {
  const router = useRouter();
  const [errorDetails, setErrorDetails] = useState({
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    console.error('Error boundary caught:', error);

    const message = error?.message || 'An unexpected error occurred';
    const stack = error?.stack || '';
    
    let code = 'UNKNOWN_ERROR';
    if (message.includes('fetch')) {
      code = 'NETWORK_ERROR';
    } else if (message.includes('permission') || message.includes('unauthorized')) {
      code = 'PERMISSION_ERROR';
    } else if (message.includes('not found') || message.includes('404')) {
      code = 'NOT_FOUND_ERROR';
    } else if (message.includes('timeout')) {
      code = 'TIMEOUT_ERROR';
    } else if (message.includes('database') || message.includes('supabase')) {
      code = 'DATABASE_ERROR';
    }

    setErrorDetails({
      message,
      code,
      timestamp: new Date().toISOString(),
      stack: process.env.NODE_ENV === 'development' ? stack : null
    });

    notify.error('An error occurred', {
      title: 'Error',
      duration: 5000
    });
  }, [error]);

  const handleReset = () => {
    reset();
    notify.info('Retrying...', { duration: 2000 });
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleContactSupport = () => {
    router.push('/contact');
  };

  const getUserFriendlyMessage = () => {
    switch (errorDetails.code) {
      case 'NETWORK_ERROR':
        return 'Unable to connect to our servers. Please check your internet connection.';
      case 'PERMISSION_ERROR':
        return 'You do not have permission to access this resource.';
      case 'NOT_FOUND_ERROR':
        return 'The requested resource could not be found.';
      case 'TIMEOUT_ERROR':
        return 'The request took too long to complete. Please try again.';
      case 'DATABASE_ERROR':
        return 'A database error occurred. Our team has been notified.';
      default:
        return 'An unexpected error occurred. Please try refreshing the page.';
    }
  };

  return (
    <div className="error-page-container">
      <div className="error-bg-effects">
        <div className="error-gradient-orb error-orb-1" />
        <div className="error-gradient-orb error-orb-2" />
        <div className="error-gradient-orb error-orb-3" />
      </div>

      <div className="error-content">
        <div className="error-icon-container">
          <AlertTriangle className="error-icon" />
          <div className="error-icon-glow" />
        </div>

        <h1 className="text-h1 text-gradient-divine error-title">
          Oops! Something Went Wrong
        </h1>

        <p className="text-h4 text-glow-soft error-subtitle">
          The realm encountered an unexpected issue
        </p>

        <GlassCard 
          title="Error Details"
          className="error-details-card"
        >
          <div className="error-info">
            <div className="error-info-row">
              <span className="error-label text-caption">Status:</span>
              <span className="error-value text-body">{errorDetails.code}</span>
            </div>
            
            <div className="error-info-row">
              <span className="error-label text-caption">Message:</span>
              <span className="error-value text-body">{getUserFriendlyMessage()}</span>
            </div>
            
            <div className="error-info-row">
              <span className="error-label text-caption">Time:</span>
              <span className="error-value text-body">
                {new Date(errorDetails.timestamp).toLocaleString()}
              </span>
            </div>

            {process.env.NODE_ENV === 'development' && errorDetails.stack && (
              <details className="error-stack-details">
                <summary className="error-stack-summary text-caption">
                  Technical Details (Development Only)
                </summary>
                <pre className="error-stack-trace text-body-small">
                  {errorDetails.stack}
                </pre>
              </details>
            )}
          </div>
        </GlassCard>

        <div className="error-actions">
          <NobleButton
            size="large"
            onClick={handleReset}
            className="error-action-primary"
          >
            <RefreshCw className="button-icon" />
            Try Again
          </NobleButton>

          <TextFlameButton
            size="large"
            onClick={handleGoHome}
          >
            <Home className="button-icon" />
            Return Home
          </TextFlameButton>

          <TextFlameButton
            size="medium"
            onClick={handleGoBack}
          >
            <ArrowLeft className="button-icon" />
            Go Back
          </TextFlameButton>
        </div>

        <div className="error-support">
          <p className="text-body-small text-glow-soft">
            Need help? 
            <button 
              onClick={handleContactSupport}
              className="error-support-link"
            >
              Contact Support
            </button>
          </p>
        </div>
      </div>

      <style jsx>{`
        .error-page-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          overflow: hidden;
          background: var(--bg-primary);
        }

        .error-bg-effects {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 0;
          overflow: hidden;
        }

        .error-gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.15;
          animation: orbFloat 20s ease-in-out infinite;
        }

        .error-orb-1 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(220, 20, 60, 0.4) 0%, transparent 70%);
          top: -200px;
          left: -200px;
        }

        .error-orb-2 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%);
          bottom: -150px;
          right: -150px;
          animation-delay: -5s;
        }

        .error-orb-3 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(224, 17, 95, 0.3) 0%, transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: -10s;
        }

        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        .error-content {
          position: relative;
          z-index: 1;
          max-width: 800px;
          width: 100%;
          text-align: center;
          animation: fadeInUp 0.6s ease;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .error-icon-container {
          position: relative;
          display: inline-block;
          margin-bottom: 2rem;
        }

        .error-icon {
          width: 120px;
          height: 120px;
          color: var(--cns-gold);
          filter: drop-shadow(0 0 30px rgba(255, 215, 0, 0.6));
          animation: iconPulse 2s ease-in-out infinite;
          position: relative;
          z-index: 2;
        }

        .error-icon-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, transparent 70%);
          border-radius: 50%;
          animation: glowPulse 2s ease-in-out infinite;
          z-index: 1;
        }

        @keyframes iconPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes glowPulse {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.2); }
        }

        .error-title {
          margin-bottom: 1rem;
        }

        .error-subtitle {
          margin-bottom: 3rem;
          opacity: 0.9;
        }

        .error-details-card {
          margin: 0 auto 3rem;
          max-width: 600px;
        }

        .error-info {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          text-align: left;
        }

        .error-info-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(255, 215, 0, 0.1);
        }

        .error-info-row:last-child {
          border-bottom: none;
        }

        .error-label {
          color: var(--cns-gold);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 600;
          min-width: 100px;
        }

        .error-value {
          flex: 1;
          text-align: right;
          word-break: break-word;
        }

        .error-stack-details {
          margin-top: 1.5rem;
          padding: 1rem;
          background: rgba(0, 0, 0, 0.3);
          border-radius: var(--radius-md);
          border: 1px solid rgba(220, 20, 60, 0.3);
        }

        .error-stack-summary {
          cursor: pointer;
          color: var(--text-secondary);
          font-weight: 600;
          user-select: none;
          margin-bottom: 0.5rem;
        }

        .error-stack-summary:hover {
          color: var(--cns-gold);
        }

        .error-stack-trace {
          margin-top: 1rem;
          padding: 1rem;
          background: rgba(0, 0, 0, 0.5);
          border-radius: var(--radius-sm);
          color: var(--text-tertiary);
          font-family: 'Courier New', monospace;
          font-size: 0.75rem;
          line-height: 1.4;
          overflow-x: auto;
          white-space: pre-wrap;
          word-break: break-all;
        }

        .error-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          justify-content: center;
          align-items: center;
          margin-bottom: 2rem;
        }

        .error-action-primary {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .button-icon {
          width: 20px;
          height: 20px;
        }

        .error-support {
          margin-top: 2rem;
        }

        .error-support-link {
          background: none;
          border: none;
          color: var(--cns-gold);
          text-decoration: underline;
          cursor: pointer;
          font-size: inherit;
          font-family: inherit;
          margin-left: 0.5rem;
          transition: all 0.3s ease;
        }

        .error-support-link:hover {
          color: var(--noble-white);
          text-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
        }

        @media (max-width: 768px) {
          .error-page-container {
            padding: 1rem;
          }

          .error-icon {
            width: 80px;
            height: 80px;
          }

          .error-icon-glow {
            width: 150px;
            height: 150px;
          }

          .error-title {
            font-size: clamp(2rem, 6vw, 3rem);
          }

          .error-subtitle {
            font-size: clamp(1.25rem, 4vw, 1.75rem);
          }

          .error-actions {
            flex-direction: column;
            gap: 1rem;
          }

          .error-info-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .error-value {
            text-align: left;
          }

          .error-gradient-orb {
            filter: blur(60px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .error-icon,
          .error-icon-glow,
          .error-gradient-orb {
            animation: none !important;
          }

          .error-content {
            animation: none !important;
          }
        }

        @media (prefers-contrast: high) {
          .error-gradient-orb {
            display: none;
          }

          .error-icon {
            filter: none;
          }
        }
      `}</style>
    </div>
  );
}