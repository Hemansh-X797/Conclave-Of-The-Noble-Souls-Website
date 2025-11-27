// ============================================================================
// EPUB RENDERER COMPONENT - EPUB READING ENGINE
// Advanced EPUB display with chapter navigation and styling
// Location: /src/components/pathways/ebook/reader-components/EPUBRenderer.jsx
// ============================================================================

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import ePub from 'epubjs';
import LoadingCrest from '@/components/ui/LoadingCrest';
import { notify } from '@/components/interactive/NotificationCenter';

/**
 * EPUBRenderer - EPUB document renderer
 * 
 * @param {Object} props
 * @param {Object} props.file - File object with path
 * @param {number} props.currentPage - Current page/location index
 * @param {Function} props.onPageChange - Callback when location changes
 * @param {Function} props.onTotalPagesLoad - Callback with total locations
 * @param {boolean} props.bionicMode - Enable bionic reading
 * @param {number} props.fontSize - Font size in px
 * @param {number} props.lineHeight - Line height multiplier
 */
export default function EPUBRenderer({
  file,
  currentPage = 0,
  onPageChange,
  onTotalPagesLoad,
  bionicMode = false,
  fontSize = 18,
  lineHeight = 1.8
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [book, setBook] = useState(null);
  const [rendition, setRendition] = useState(null);
  const [totalLocations, setTotalLocations] = useState(0);
  const [currentLocation, setCurrentLocation] = useState(0);
  const [chapterInfo, setChapterInfo] = useState(null);
  
  const viewerRef = useRef(null);
  const bookRef = useRef(null);
  const renditionRef = useRef(null);

  // ============================================
  // INITIALIZE EPUB
  // ============================================
  useEffect(() => {
    if (!file?.path || !viewerRef.current) {
return;
}

    const initEpub = async () => {
      try {
        setLoading(true);
        setError(null);

        // Create EPUB book instance
        const epubBook = ePub(file.path);
        bookRef.current = epubBook;
        setBook(epubBook);

        // Create rendition
        const epubRendition = epubBook.renderTo(viewerRef.current, {
          width: '100%',
          height: '100%',
          spread: 'none',
          allowScriptedContent: false
        });
        renditionRef.current = epubRendition;
        setRendition(epubRendition);

        // Display initial location
        await epubRendition.display();

        // Generate locations for page navigation
        await epubBook.locations.generate(1024);
        const locations = epubBook.locations.length();
        setTotalLocations(locations);
        
        if (onTotalPagesLoad) {
          onTotalPagesLoad(locations);
        }

        // Apply initial styles
        applyStyles(epubRendition, fontSize, lineHeight);

        // Setup event listeners
        setupEventListeners(epubRendition, epubBook);

        setLoading(false);
        notify.success('EPUB loaded successfully', { duration: 3000 });

      } catch (err) {
        console.error('EPUB initialization error:', err);
        setError(err.message || 'Failed to load EPUB');
        setLoading(false);
        notify.error('Failed to load EPUB file');
      }
    };

    initEpub();

    // Cleanup
    return () => {
      if (renditionRef.current) {
        renditionRef.current.destroy();
      }
      if (bookRef.current) {
        bookRef.current.destroy();
      }
    };
  }, [file]);

  // ============================================
  // SETUP EVENT LISTENERS
  // ============================================
  const setupEventListeners = useCallback((rend, bk) => {
    // Location changed
    rend.on('relocated', (location) => {
      const currentLoc = bk.locations.locationFromCfi(location.start.cfi);
      setCurrentLocation(currentLoc);
      
      if (onPageChange && currentLoc !== currentPage) {
        onPageChange(currentLoc);
      }

      // Update chapter info
      bk.navigation.get(location.start.href).then(chapter => {
        if (chapter) {
          setChapterInfo({
            label: chapter.label,
            href: chapter.href
          });
        }
      });

      // Apply bionic mode if enabled
      if (bionicMode) {
        setTimeout(() => applyBionicReading(rend), 100);
      }
    });

    // Handle keyboard navigation
    rend.on('keyup', (event) => {
      if (event.key === 'ArrowLeft') {
        rend.prev();
      } else if (event.key === 'ArrowRight') {
        rend.next();
      }
    });

  }, [bionicMode, currentPage, onPageChange]);

  // ============================================
  // APPLY STYLES
  // ============================================
  const applyStyles = useCallback((rend, size, height) => {
    if (!rend) {
return;
}

    rend.themes.fontSize(`${size}px`);
    
    rend.themes.register('custom', {
      'body': {
        'line-height': height,
        'text-align': 'justify',
        'hyphens': 'auto',
        '-webkit-hyphens': 'auto',
        '-moz-hyphens': 'auto',
        'word-wrap': 'break-word'
      },
      'p': {
        'margin-bottom': '1em',
        'text-indent': '1.5em'
      },
      'h1, h2, h3, h4, h5, h6': {
        'font-family': 'var(--font-cinzel)',
        'margin-top': '1.5em',
        'margin-bottom': '0.5em',
        'text-indent': '0'
      },
      'a': {
        'color': 'inherit',
        'text-decoration': 'underline'
      },
      'img': {
        'max-width': '100%',
        'height': 'auto',
        'display': 'block',
        'margin': '1em auto'
      }
    });

    rend.themes.select('custom');
  }, []);

  // ============================================
  // UPDATE FONT SIZE
  // ============================================
  useEffect(() => {
    if (rendition) {
      applyStyles(rendition, fontSize, lineHeight);
    }
  }, [fontSize, lineHeight, rendition, applyStyles]);

  // ============================================
  // NAVIGATE TO PAGE
  // ============================================
  useEffect(() => {
    if (rendition && book && currentPage !== currentLocation) {
      const cfi = book.locations.cfiFromLocation(currentPage);
      if (cfi) {
        rendition.display(cfi);
      }
    }
  }, [currentPage, rendition, book, currentLocation]);

  // ============================================
  // BIONIC READING MODE
  // ============================================
  const applyBionicReading = useCallback((rend) => {
    try {
      const iframe = rend.manager.container.querySelector('iframe');
      if (!iframe || !iframe.contentDocument) {
return;
}

      const doc = iframe.contentDocument;
      const paragraphs = doc.querySelectorAll('p, span, div');

      paragraphs.forEach(element => {
        const walker = doc.createTreeWalker(
          element,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );

        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
          textNodes.push(node);
        }

        textNodes.forEach(textNode => {
          const words = textNode.textContent.split(/\s+/);
          const newContent = words.map(word => {
            if (word.length < 2) {
return word;
}
            const boldLength = Math.ceil(word.length / 2);
            const boldPart = word.substring(0, boldLength);
            const normalPart = word.substring(boldLength);
            return `<strong>${boldPart}</strong>${normalPart}`;
          }).join(' ');

          const span = doc.createElement('span');
          span.innerHTML = newContent;
          textNode.parentNode.replaceChild(span, textNode);
        });
      });
    } catch (error) {
      console.error('Bionic mode error:', error);
    }
  }, []);

  // ============================================
  // NAVIGATION HELPERS
  // ============================================
  const goToNext = useCallback(() => {
    if (rendition) {
      rendition.next();
    }
  }, [rendition]);

  const goToPrev = useCallback(() => {
    if (rendition) {
      rendition.prev();
    }
  }, [rendition]);

  // ============================================
  // KEYBOARD NAVIGATION
  // ============================================
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
return;
}

      if (e.key === 'PageUp') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === 'PageDown') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'Home' && book) {
        e.preventDefault();
        rendition?.display(0);
      } else if (e.key === 'End' && book) {
        e.preventDefault();
        const lastCfi = book.locations.cfiFromLocation(totalLocations - 1);
        if (lastCfi) {
rendition?.display(lastCfi);
}
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [book, rendition, totalLocations, goToPrev, goToNext]);

  // ============================================
  // RENDER: ERROR STATE
  // ============================================
  if (error) {
    return (
      <div className="epub-error">
        <div className="error-icon">📚</div>
        <h3 className="error-title">EPUB Load Error</h3>
        <p className="error-message">{error}</p>
        <p className="error-hint">Please check if the file exists and is a valid EPUB.</p>

        <style jsx>{`
          .epub-error {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 4rem 2rem;
            text-align: center;
          }

          .error-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
            opacity: 0.5;
          }

          .error-title {
            font-family: var(--font-cinzel);
            font-size: 1.5rem;
            font-weight: 700;
            color: #E0115F;
            margin-bottom: 1rem;
          }

          .error-message {
            font-family: var(--font-josefin);
            font-size: 1rem;
            color: var(--text-secondary);
            margin-bottom: 0.5rem;
          }

          .error-hint {
            font-family: var(--font-josefin);
            font-size: 0.9rem;
            color: var(--text-secondary);
            opacity: 0.7;
          }
        `}</style>
      </div>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div className="epub-renderer">
      {loading && (
        <div className="epub-loading">
          <LoadingCrest message="Loading EPUB..." />
        </div>
      )}

      {chapterInfo && (
        <div className="epub-chapter-info">
          <span className="chapter-label">{chapterInfo.label}</span>
        </div>
      )}

      <div 
        ref={viewerRef} 
        className="epub-viewer"
        style={{ display: loading ? 'none' : 'block' }}
      />

      <style jsx>{`
        .epub-renderer {
          width: 100%;
          min-height: 600px;
          position: relative;
        }

        .epub-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 600px;
        }

        .epub-chapter-info {
          position: sticky;
          top: 0;
          padding: 1rem;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 10;
          text-align: center;
        }

        .chapter-label {
          font-family: var(--font-cinzel);
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .epub-viewer {
          width: 100%;
          min-height: 600px;
          overflow: hidden;
        }

        :global(.epub-viewer iframe) {
          border: none;
          width: 100%;
          height: 100%;
        }

        /* EPUB content styling */
        :global(.epub-viewer iframe body) {
          padding: 2rem !important;
          max-width: 800px !important;
          margin: 0 auto !important;
        }

        /* Bionic reading styles */
        :global(.epub-viewer iframe strong) {
          font-weight: 700;
          opacity: 1;
        }

        /* Selection highlighting */
        :global(.epub-viewer iframe ::selection) {
          background: rgba(255, 215, 0, 0.3);
          color: inherit;
        }
      `}</style>
    </div>
  );
}