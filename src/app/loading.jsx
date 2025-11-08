// ============================================================================
// GLOBAL LOADING PAGE - The Conclave Realm
// Displays during page transitions and data loading
// Location: /src/app/loading.jsx
// ============================================================================

'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import LoadingCrest from '@/components/ui/LoadingCrest';

/**
 * Global loading page
 * Automatically shown by Next.js during:
 * - Route transitions
 * - Page component loading
 * - Data fetching
 */
export default function Loading() {
  const pathname = usePathname();
  const [pathway, setPathway] = useState('default');
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    // Detect pathway from URL
    if (pathname.includes('/gaming')) {
      setPathway('gaming');
      setMessage('Entering Gaming Realm...');
    } else if (pathname.includes('/lorebound')) {
      setPathway('lorebound');
      setMessage('Opening Lorebound Sanctuary...');
    } else if (pathname.includes('/productive')) {
      setPathway('productive');
      setMessage('Accessing Productive Palace...');
    } else if (pathname.includes('/news')) {
      setPathway('news');
      setMessage('Loading News Nexus...');
    } else if (pathname.includes('/chambers')) {
      setPathway('default');
      setMessage('Entering your chambers...');
    } else if (pathname.includes('/sanctum')) {
      setPathway('default');
      setMessage('Accessing Sanctum...');
    } else if (pathname.includes('/throne-room')) {
      setPathway('default');
      setMessage('Entering Throne Room...');
    } else if (pathname.includes('/gateway')) {
      setPathway('default');
      setMessage('Opening Gateway...');
    } else if (pathname.includes('/court')) {
      setPathway('default');
      setMessage('Entering Noble Court...');
    } else if (pathname.includes('/archives')) {
      setPathway('default');
      setMessage('Accessing Archives...');
    } else if (pathname.includes('/hall-of-nobles')) {
      setPathway('default');
      setMessage('Opening Hall of Nobles...');
    } else if (pathname.includes('/art-gallery')) {
      setPathway('default');
      setMessage('Loading Art Gallery...');
    } else {
      setPathway('default');
      setMessage('Loading The Conclave...');
    }
  }, [pathname]);

  return (
    <div className="global-loading-container">
      <LoadingCrest
        pathway={pathway}
        message={message}
        progress={null} // Indeterminate progress
      />
      
      {/* Additional styling */}
      <style jsx>{`
        .global-loading-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-primary);
          z-index: 9999;
        }

        /* Ensure smooth transition */
        .global-loading-container {
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}