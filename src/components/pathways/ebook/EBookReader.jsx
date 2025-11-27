// ============================================================================
// EBOOK READER COMPONENT - THE ULTIMATE READING SANCTUARY
// Full-featured e-book reader with 3D orb, multiple themes, and luxury UX
// Location: /src/components/pathways/ebook/EBookReader.jsx
// ============================================================================

'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useAppContext } from '@/contexts/AppProvider';
import { notify } from '@/components/interactive/NotificationCenter';
import LoadingCrest from '@/components/ui/LoadingCrest';
import { 
  X, ChevronLeft, ChevronRight, BookOpen, Settings, 
  Sun, Moon, Palette, Type, ZoomIn, ZoomOut, Maximize2,
  Minimize2, Bookmark, BookmarkCheck, Volume2, VolumeX,
  Eye, EyeOff, RotateCcw, Lightbulb, Circle
} from 'lucide-react';

// Lazy load PDF/EPUB libraries
const PDFReader = dynamic(() => import('./reader-components/PDFRenderer'), {
  ssr: false,
  loading: () => <LoadingCrest message="Loading PDF renderer..." />
});

const EPUBReader = dynamic(() => import('./reader-components/EPUBRenderer'), {
  ssr: false,
  loading: () => <LoadingCrest message="Loading EPUB renderer..." />
});

const ThreeDOrb = dynamic(() => import('./reader-components/ThreeDOrbEffect'), {
  ssr: false
});

/**
 * EBookReader - Ultimate reading experience with all luxury features
 * 
 * @param {Object} props
 * @param {Object} props.book - Book object with file information
 * @param {number} props.initialPage - Starting page/position
 * @param {Function} props.onClose - Callback when reader closes
 * @param {Function} props.onProgress - Callback for progress updates
 * @param {Function} props.onBookmark - Callback when bookmark added
 * @param {string} props.pathway - Current pathway for theming
 */
export default function EBookReader({
  book,
  initialPage = 0,
  onClose,
  onProgress,
  onBookmark,
  pathway = 'lorebound'
}) {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [readingTheme, setReadingTheme] = useState('dark'); // dark, light, sepia, contrast
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [fontFamily, setFontFamily] = useState('josefin');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [ambientMode, setAmbientMode] = useState(false);
  const [bionicMode, setBionicMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [show3DOrb, setShow3DOrb] = useState(true);
  const [readingSpeed, setReadingSpeed] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState(Date.now());
  const [pagesReadInSession, setPagesReadInSession] = useState(0);
  
  const readerContainerRef = useRef(null);
  const contentRef = useRef(null);
  const lastPageChangeRef = useRef(Date.now());
  const progressIntervalRef = useRef(null);
  
  // ============================================
  // CONTEXT & HOOKS
  // ============================================
  const { 
    playClick, 
    playHover,
    animationsEnabled,
    isMobile 
  } = useAppContext();

  // ============================================
  // DETERMINE FILE TYPE
  // ============================================
  const fileType = useMemo(() => {
    const file = book?.files?.[0];
    if (!file) {
return null;
}
    
    const format = file.format?.toLowerCase();
    if (format === 'pdf') {
return 'pdf';
}
    if (format === 'epub') {
return 'epub';
}
    
    const path = file.path?.toLowerCase();
    if (path?.endsWith('.pdf')) {
return 'pdf';
}
    if (path?.endsWith('.epub')) {
return 'epub';
}
    
    return null;
  }, [book]);

  // ============================================
  // READING SPEED CALCULATION
  // ============================================
  useEffect(() => {
    const calculateSpeed = () => {
      const timeElapsed = (Date.now() - sessionStartTime) / 1000 / 60; // minutes
      if (timeElapsed > 0 && pagesReadInSession > 0) {
        const speed = Math.round((pagesReadInSession / timeElapsed) * 60); // pages per hour
        setReadingSpeed(speed);
      }
    };

    const interval = setInterval(calculateSpeed, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [sessionStartTime, pagesReadInSession]);

  // ============================================
  // READING MOOD COLOR
  // ============================================
  const readingMoodColor = useMemo(() => {
    if (readingSpeed === 0) {
return '#808080';
} // Gray
    if (readingSpeed < 20) {
return '#9D4EDD';
} // Violet - Deep Focus
    if (readingSpeed >= 20 && readingSpeed < 40) {
return '#50C878';
} // Green - Normal
    if (readingSpeed >= 40 && readingSpeed < 60) {
return '#00BFFF';
} // Blue - Fast
    return '#FF4500'; // Red - Intense
  }, [readingSpeed]);

  // ============================================
  // INITIALIZE READER
  // ============================================
  useEffect(() => {
    const initReader = async () => {
      try {
        setIsLoading(true);
        
        // Load saved preferences
        const savedTheme = localStorage.getItem(`reader-theme-${book.id}`);
        const savedFontSize = localStorage.getItem(`reader-font-size-${book.id}`);
        const savedLineHeight = localStorage.getItem(`reader-line-height-${book.id}`);
        const savedBookmarks = localStorage.getItem(`bookmarks-${book.id}`);
        
        if (savedTheme) {
setReadingTheme(savedTheme);
}
        if (savedFontSize) {
setFontSize(parseInt(savedFontSize));
}
        if (savedLineHeight) {
setLineHeight(parseFloat(savedLineHeight));
}
        if (savedBookmarks) {
setBookmarks(JSON.parse(savedBookmarks));
}
        
        // Simulate loading (actual loading handled by PDF/EPUB renderers)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setIsLoading(false);
        notify.success('Reader loaded', { duration: 2000 });
      } catch (error) {
        console.error('Reader initialization error:', error);
        notify.error('Failed to initialize reader');
        setIsLoading(false);
      }
    };

    if (book) {
      initReader();
    }
  }, [book]);

  // ============================================
  // AUTO-SAVE PROGRESS
  // ============================================
  useEffect(() => {
    progressIntervalRef.current = setInterval(() => {
      if (currentPage > 0 && totalPages > 0) {
        const progress = Math.round((currentPage / totalPages) * 100);
        
        // Save to localStorage
        localStorage.setItem(`reading-progress-${book.id}`, JSON.stringify({
          currentPage,
          totalPages,
          progress,
          lastRead: Date.now()
        }));
        
        // Callback to parent
        if (onProgress) {
          onProgress({
            bookId: book.id,
            currentPage,
            totalPages,
            progress
          });
        }
      }
    }, 10000); // Save every 10 seconds

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [currentPage, totalPages, book, onProgress]);

  // ============================================
  // KEYBOARD SHORTCUTS
  // ============================================
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Prevent shortcuts if typing in input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
return;
}
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          handlePreviousPage();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNextPage();
          break;
        case 'Escape':
          if (isFullscreen) {
handleToggleFullscreen();
} else {
handleClose();
}
          break;
        case 'b':
        case 'B':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleAddBookmark();
          }
          break;
        case 'f':
        case 'F':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleToggleFullscreen();
          }
          break;
        case '+':
        case '=':
          e.preventDefault();
          handleFontSizeChange(fontSize + 1);
          break;
        case '-':
        case '_':
          e.preventDefault();
          handleFontSizeChange(fontSize - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, isFullscreen, fontSize]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleClose = useCallback(() => {
    playClick();
    
    // Final progress save
    if (currentPage > 0 && totalPages > 0) {
      const progress = Math.round((currentPage / totalPages) * 100);
      localStorage.setItem(`reading-progress-${book.id}`, JSON.stringify({
        currentPage,
        totalPages,
        progress,
        lastRead: Date.now()
      }));
    }
    
    onClose?.();
  }, [playClick, currentPage, totalPages, book, onClose]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages - 1) {
      playClick();
      setCurrentPage(prev => prev + 1);
      setPagesReadInSession(prev => prev + 1);
      lastPageChangeRef.current = Date.now();
      
      if (soundEnabled) {
        // Play page turn sound
        const audio = new Audio('/Assets/Audio/effects/page-turn.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {});
      }
    }
  }, [currentPage, totalPages, playClick, soundEnabled]);

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 0) {
      playClick();
      setCurrentPage(prev => prev - 1);
      lastPageChangeRef.current = Date.now();
      
      if (soundEnabled) {
        const audio = new Audio('/Assets/Audio/effects/page-turn.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {});
      }
    }
  }, [currentPage, playClick, soundEnabled]);

  const handlePageJump = useCallback((page) => {
    if (page >= 0 && page < totalPages) {
      playClick();
      const pagesDiff = Math.abs(page - currentPage);
      setPagesReadInSession(prev => prev + pagesDiff);
      setCurrentPage(page);
    }
  }, [currentPage, totalPages, playClick]);

  const handleThemeChange = useCallback((theme) => {
    playClick();
    setReadingTheme(theme);
    localStorage.setItem(`reader-theme-${book.id}`, theme);
  }, [playClick, book]);

  const handleFontSizeChange = useCallback((size) => {
    const clampedSize = Math.max(12, Math.min(32, size));
    setFontSize(clampedSize);
    localStorage.setItem(`reader-font-size-${book.id}`, clampedSize.toString());
  }, [book]);

  const handleLineHeightChange = useCallback((height) => {
    const clampedHeight = Math.max(1.2, Math.min(2.5, height));
    setLineHeight(clampedHeight);
    localStorage.setItem(`reader-line-height-${book.id}`, clampedHeight.toString());
  }, [book]);

  const handleFontFamilyChange = useCallback((family) => {
    playClick();
    setFontFamily(family);
  }, [playClick]);

  const handleToggleFullscreen = useCallback(() => {
    playClick();
    
    if (!document.fullscreenElement) {
      readerContainerRef.current?.requestFullscreen().catch(err => {
        console.error('Fullscreen error:', err);
        notify.error('Fullscreen not supported');
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, [playClick]);

  const handleAddBookmark = useCallback(() => {
    playClick();
    
    const newBookmark = {
      id: Date.now(),
      page: currentPage,
      date: Date.now(),
      note: '' // Can be enhanced with note input
    };
    
    const updatedBookmarks = [...bookmarks, newBookmark];
    setBookmarks(updatedBookmarks);
    localStorage.setItem(`bookmarks-${book.id}`, JSON.stringify(updatedBookmarks));
    
    notify.success('Bookmark added', { duration: 2000 });
    
    if (onBookmark) {
      onBookmark(newBookmark);
    }
  }, [playClick, currentPage, bookmarks, book, onBookmark]);

  const handleRemoveBookmark = useCallback((bookmarkId) => {
    playClick();
    const updatedBookmarks = bookmarks.filter(b => b.id !== bookmarkId);
    setBookmarks(updatedBookmarks);
    localStorage.setItem(`bookmarks-${book.id}`, JSON.stringify(updatedBookmarks));
    notify.success('Bookmark removed', { duration: 2000 });
  }, [playClick, bookmarks, book]);

  const handleToggleAmbientMode = useCallback(() => {
    playClick();
    setAmbientMode(prev => !prev);
  }, [playClick]);

  const handleToggleBionicMode = useCallback(() => {
    playClick();
    setBionicMode(prev => !prev);
  }, [playClick]);

  const handleToggleSound = useCallback(() => {
    playClick();
    setSoundEnabled(prev => !prev);
  }, [playClick]);

  const handleToggleOrb = useCallback(() => {
    playClick();
    setShow3DOrb(prev => !prev);
  }, [playClick]);

  // ============================================
  // PROGRESS PERCENTAGE
  // ============================================
  const progressPercentage = useMemo(() => {
    if (totalPages === 0) {
return 0;
}
    return Math.round((currentPage / totalPages) * 100);
  }, [currentPage, totalPages]);

  // ============================================
  // CHECK IF PAGE IS BOOKMARKED
  // ============================================
  const isBookmarked = useMemo(() => bookmarks.some(b => b.page === currentPage), [bookmarks, currentPage]);

  // ============================================
  // THEME STYLES
  // ============================================
  const themeStyles = useMemo(() => {
    const themes = {
      dark: {
        bg: '#0A0A0F',
        text: '#E5E5E7',
        secondary: '#9CA3AF'
      },
      light: {
        bg: '#F5F5DC',
        text: '#1A1A1A',
        secondary: '#6B7280'
      },
      sepia: {
        bg: '#F4ECD8',
        text: '#5C4A2C',
        secondary: '#8B7355'
      },
      contrast: {
        bg: '#000000',
        text: '#FFFFFF',
        secondary: '#CCCCCC'
      }
    };
    return themes[readingTheme] || themes.dark;
  }, [readingTheme]);

  // ============================================
  // RENDER: LOADING STATE
  // ============================================
  if (isLoading) {
    return (
      <div className="reader-loading">
        <LoadingCrest 
          pathway={pathway} 
          message={`Loading ${book?.title}...`}
        />
        
        <style jsx>{`
          .reader-loading {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.95);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
          }
        `}</style>
      </div>
    );
  }

  // ============================================
  // RENDER: ERROR STATE (NO FILE TYPE)
  // ============================================
  if (!fileType) {
    return (
      <div className="reader-error">
        <div className="error-content">
          <BookOpen size={64} style={{ color: '#FF4500' }} />
          <h2 className="error-title">Unsupported Format</h2>
          <p className="error-message">
            This book format is not supported. Please use PDF or EPUB files.
          </p>
          <button className="error-close-btn" onClick={handleClose}>
            Close Reader
          </button>
        </div>
        
        <style jsx>{`
          .reader-error {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
          }

          .error-content {
            text-align: center;
            padding: 3rem;
          }

          .error-title {
            font-family: var(--font-cinzel);
            font-size: 2rem;
            color: var(--text-primary);
            margin: 1rem 0;
          }

          .error-message {
            font-family: var(--font-josefin);
            font-size: 1.1rem;
            color: var(--text-secondary);
            margin-bottom: 2rem;
          }

          .error-close-btn {
            padding: 1rem 2rem;
            background: var(--cns-gold);
            border: none;
            border-radius: 12px;
            color: var(--bg-primary);
            font-family: var(--font-josefin);
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .error-close-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255, 215, 0, 0.3);
          }
        `}</style>
      </div>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div 
      ref={readerContainerRef}
      className={`ebook-reader ${readingTheme}-theme ${ambientMode ? 'ambient-mode' : ''}`}
      style={{
        background: themeStyles.bg,
        color: themeStyles.text
      }}
    >
      {/* 3D Orb Effect */}
      {show3DOrb && animationsEnabled && !isMobile && (
        <ThreeDOrb
          scrollProgress={progressPercentage}
          readingSpeed={readingSpeed}
          moodColor={readingMoodColor}
          isReading={currentPage > 0}
        />
      )}

      {/* Top Toolbar */}
      <div className="reader-toolbar reader-toolbar-top">
        <div className="toolbar-left">
          <button
            className="toolbar-btn"
            onClick={handleClose}
            onMouseEnter={playHover}
            aria-label="Close reader"
          >
            <X size={20} />
            Close
          </button>
          
          <div className="book-info">
            <span className="book-title">{book?.title}</span>
            <span className="book-author">by {book?.author}</span>
          </div>
        </div>

        <div className="toolbar-right">
          <button
            className={`toolbar-btn ${isBookmarked ? 'active' : ''}`}
            onClick={handleAddBookmark}
            onMouseEnter={playHover}
            aria-label="Add bookmark"
          >
            {isBookmarked ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
          </button>

          <button
            className="toolbar-btn"
            onClick={() => {
              playClick();
              setShowBookmarks(!showBookmarks);
            }}
            onMouseEnter={playHover}
            aria-label="Show bookmarks"
          >
            <BookOpen size={20} />
            {bookmarks.length > 0 && (
              <span className="bookmark-count">{bookmarks.length}</span>
            )}
          </button>

          <button
            className="toolbar-btn"
            onClick={() => {
              playClick();
              setShowSettings(!showSettings);
            }}
            onMouseEnter={playHover}
            aria-label="Settings"
          >
            <Settings size={20} />
          </button>

          <button
            className="toolbar-btn"
            onClick={handleToggleFullscreen}
            onMouseEnter={playHover}
            aria-label="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <SettingsPanel
          readingTheme={readingTheme}
          fontSize={fontSize}
          lineHeight={lineHeight}
          fontFamily={fontFamily}
          ambientMode={ambientMode}
          bionicMode={bionicMode}
          soundEnabled={soundEnabled}
          show3DOrb={show3DOrb}
          onThemeChange={handleThemeChange}
          onFontSizeChange={handleFontSizeChange}
          onLineHeightChange={handleLineHeightChange}
          onFontFamilyChange={handleFontFamilyChange}
          onToggleAmbient={handleToggleAmbientMode}
          onToggleBionic={handleToggleBionicMode}
          onToggleSound={handleToggleSound}
          onToggleOrb={handleToggleOrb}
          onClose={() => setShowSettings(false)}
          playHover={playHover}
        />
      )}

      {/* Bookmarks Panel */}
      {showBookmarks && (
        <BookmarksPanel
          bookmarks={bookmarks}
          currentPage={currentPage}
          onJumpToBookmark={handlePageJump}
          onRemoveBookmark={handleRemoveBookmark}
          onClose={() => setShowBookmarks(false)}
          playHover={playHover}
        />
      )}

      {/* Main Reading Area */}
      <div 
        ref={contentRef}
        className="reader-content"
        style={{
          fontSize: `${fontSize}px`,
          lineHeight,
          fontFamily: fontFamily === 'josefin' ? 'var(--font-josefin)' : 
                      fontFamily === 'serif' ? 'Georgia, serif' :
                      fontFamily === 'mono' ? 'monospace' : 'var(--font-josefin)'
        }}
      >
        {fileType === 'pdf' && (
          <PDFReader
            file={book.files[0]}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onTotalPagesLoad={setTotalPages}
            bionicMode={bionicMode}
          />
        )}

        {fileType === 'epub' && (
          <EPUBReader
            file={book.files[0]}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onTotalPagesLoad={setTotalPages}
            bionicMode={bionicMode}
            fontSize={fontSize}
            lineHeight={lineHeight}
          />
        )}
      </div>

      {/* Bottom Toolbar */}
      <div className="reader-toolbar reader-toolbar-bottom">
        <button
          className="toolbar-btn nav-btn"
          onClick={handlePreviousPage}
          onMouseEnter={playHover}
          disabled={currentPage === 0}
          aria-label="Previous page"
        >
          <ChevronLeft size={20} />
          Previous
        </button>

        <div className="progress-info">
          <span className="page-number">
            {currentPage + 1} / {totalPages}
          </span>
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill"
              style={{ 
                width: `${progressPercentage}%`,
                background: readingMoodColor
              }}
            />
          </div>
          <span className="progress-percentage" style={{ color: readingMoodColor }}>
            {progressPercentage}%
          </span>
          
          {readingSpeed > 0 && (
            <span className="reading-speed">
              {readingSpeed} p/h
            </span>
          )}
        </div>

        <button
          className="toolbar-btn nav-btn"
          onClick={handleNextPage}
          onMouseEnter={playHover}
          disabled={currentPage >= totalPages - 1}
          aria-label="Next page"
        >
          Next
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Ambient Mode Overlay */}
      {ambientMode && (
        <div className="ambient-overlay" />
      )}

      {/* Global Styles */}
      <style jsx>{`
        .ebook-reader {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 10000;
          display: flex;
          flex-direction: column;
          transition: background 0.3s ease;
        }

        .ebook-reader.ambient-mode {
          background: #000 !important;
        }

        /* Toolbars */
        .reader-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 2rem;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 100;
        }

        .reader-toolbar-top {
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .reader-toolbar-bottom {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          border-bottom: none;
        }

        .toolbar-left,
        .toolbar-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .toolbar-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: var(--text-primary);
          font-family: var(--font-josefin);
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .toolbar-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--cns-gold);
        }

        .toolbar-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .toolbar-btn.active {
          background: rgba(255, 215, 0, 0.1);
          border-color: var(--cns-gold);
          color: var(--cns-gold);
        }

        .bookmark-count {
          position: absolute;
          top: -8px;
          right: -8px;
          background: var(--cns-gold);
          color: var(--bg-primary);
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 700;
        }

        .book-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          max-width: 300px;
        }

        .book-title {
          font-family: var(--font-cinzel);
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .book-author {
          font-family: var(--font-josefin);
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        /* Reading Content */
        .reader-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 3rem;
          max-width: 900px;
          margin: 0 auto;
          width: 100%;
          transition: all 0.3s ease;
        }

        .ebook-reader.ambient-mode .reader-content {
          max-width: 800px;
          box-shadow: 0 0 100px rgba(255, 255, 255, 0.1);
        }

        /* Progress Info */
        .progress-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .page-number {
          font-family: var(--font-cinzel);
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
          min-width: 100px;
          text-align: center;
        }

        .progress-bar-container {
          width: 200px;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.5s ease;
          box-shadow: 0 0 10px currentColor;
        }

        .progress-percentage {
          font-family: var(--font-cinzel);
          font-size: 0.9rem;
          font-weight: 700;
          min-width: 50px;
        }

        .reading-speed {
          font-family: var(--font-josefin);
          font-size: 0.85rem;
          color: var(--text-secondary);
          padding: 0.25rem 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
        }

        /* Ambient Overlay */
        .ambient-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(
            circle at center,
            transparent 30%,
            rgba(0, 0, 0, 0.8) 70%,
            rgba(0, 0, 0, 0.95) 100%
          );
          pointer-events: none;
          z-index: 50;
        }

        /* Navigation Buttons */
        .nav-btn {
          min-width: 120px;
          justify-content: center;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .reader-toolbar {
            padding: 1rem;
          }

          .reader-content {
            padding: 2rem;
          }

          .book-info {
            max-width: 200px;
          }
        }

        @media (max-width: 768px) {
          .toolbar-left,
          .toolbar-right {
            gap: 0.5rem;
          }

          .toolbar-btn {
            padding: 0.5rem;
          }

          .toolbar-btn span {
            display: none;
          }

          .book-info {
            display: none;
          }

          .reader-content {
            padding: 1.5rem;
          }

          .progress-bar-container {
            width: 100px;
          }

          .reading-speed {
            display: none;
          }

          .nav-btn {
            min-width: auto;
          }

          .nav-btn span {
            display: none;
          }
        }

        /* Scrollbar */
        .reader-content::-webkit-scrollbar {
          width: 8px;
        }

        .reader-content::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }

        .reader-content::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }

        .reader-content::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// SETTINGS PANEL COMPONENT
// ============================================================================
function SettingsPanel({
  readingTheme,
  fontSize,
  lineHeight,
  fontFamily,
  ambientMode,
  bionicMode,
  soundEnabled,
  show3DOrb,
  onThemeChange,
  onFontSizeChange,
  onLineHeightChange,
  onFontFamilyChange,
  onToggleAmbient,
  onToggleBionic,
  onToggleSound,
  onToggleOrb,
  onClose,
  playHover
}) {
  return (
    <div className="settings-panel">
      <div className="settings-overlay" onClick={onClose} />
      
      <div className="settings-content">
        <div className="settings-header">
          <h2 className="settings-title">Reading Settings</h2>
          <button className="settings-close" onClick={onClose} onMouseEnter={playHover}>
            <X size={20} />
          </button>
        </div>

        <div className="settings-body">
          {/* Theme Selection */}
          <div className="setting-section">
            <h3 className="setting-label">
              <Palette size={18} />
              Reading Theme
            </h3>
            <div className="theme-options">
              <button
                className={`theme-btn dark ${readingTheme === 'dark' ? 'active' : ''}`}
                onClick={() => onThemeChange('dark')}
                onMouseEnter={playHover}
              >
                <Moon size={16} />
                Dark
              </button>
              <button
                className={`theme-btn light ${readingTheme === 'light' ? 'active' : ''}`}
                onClick={() => onThemeChange('light')}
                onMouseEnter={playHover}
              >
                <Sun size={16} />
                Light
              </button>
              <button
                className={`theme-btn sepia ${readingTheme === 'sepia' ? 'active' : ''}`}
                onClick={() => onThemeChange('sepia')}
                onMouseEnter={playHover}
              >
                <Palette size={16} />
                Sepia
              </button>
              <button
                className={`theme-btn contrast ${readingTheme === 'contrast' ? 'active' : ''}`}
                onClick={() => onThemeChange('contrast')}
                onMouseEnter={playHover}
              >
                <Eye size={16} />
                Contrast
              </button>
            </div>
          </div>

          {/* Font Size */}
          <div className="setting-section">
            <h3 className="setting-label">
              <Type size={18} />
              Font Size: {fontSize}px
            </h3>
            <div className="slider-controls">
              <button
                className="slider-btn"
                onClick={() => onFontSizeChange(fontSize - 1)}
                onMouseEnter={playHover}
              >
                <ZoomOut size={16} />
              </button>
              <input
                type="range"
                min="12"
                max="32"
                value={fontSize}
                onChange={(e) => onFontSizeChange(parseInt(e.target.value))}
                className="slider"
              />
              <button
                className="slider-btn"
                onClick={() => onFontSizeChange(fontSize + 1)}
                onMouseEnter={playHover}
              >
                <ZoomIn size={16} />
              </button>
            </div>
          </div>

          {/* Line Height */}
          <div className="setting-section">
            <h3 className="setting-label">
              Line Spacing: {lineHeight.toFixed(1)}
            </h3>
            <input
              type="range"
              min="1.2"
              max="2.5"
              step="0.1"
              value={lineHeight}
              onChange={(e) => onLineHeightChange(parseFloat(e.target.value))}
              className="slider"
            />
          </div>

          {/* Font Family */}
          <div className="setting-section">
            <h3 className="setting-label">Font Style</h3>
            <div className="font-options">
              <button
                className={`font-btn ${fontFamily === 'josefin' ? 'active' : ''}`}
                onClick={() => onFontFamilyChange('josefin')}
                onMouseEnter={playHover}
              >
                Josefin Sans
              </button>
              <button
                className={`font-btn ${fontFamily === 'serif' ? 'active' : ''}`}
                onClick={() => onFontFamilyChange('serif')}
                onMouseEnter={playHover}
              >
                Serif
              </button>
              <button
                className={`font-btn ${fontFamily === 'mono' ? 'active' : ''}`}
                onClick={() => onFontFamilyChange('mono')}
                onMouseEnter={playHover}
              >
                Monospace
              </button>
            </div>
          </div>

          {/* Toggle Options */}
          <div className="setting-section">
            <h3 className="setting-label">Reading Modes</h3>
            <div className="toggle-options">
              <label className="toggle-option">
                <input
                  type="checkbox"
                  checked={ambientMode}
                  onChange={onToggleAmbient}
                />
                <span className="toggle-label">
                  <Lightbulb size={16} />
                  Ambient Focus Mode
                </span>
              </label>
              
              <label className="toggle-option">
                <input
                  type="checkbox"
                  checked={bionicMode}
                  onChange={onToggleBionic}
                />
                <span className="toggle-label">
                  <Eye size={16} />
                  Bionic Reading
                </span>
              </label>
              
              <label className="toggle-option">
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={onToggleSound}
                />
                <span className="toggle-label">
                  {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  Page Turn Sounds
                </span>
              </label>
              
              <label className="toggle-option">
                <input
                  type="checkbox"
                  checked={show3DOrb}
                  onChange={onToggleOrb}
                />
                <span className="toggle-label">
                  <Circle size={16} />
                  3D Orb Effect
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .settings-panel {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .settings-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(5px);
        }

        .settings-content {
          position: relative;
          width: 90%;
          max-width: 600px;
          max-height: 80vh;
          background: rgba(10, 10, 15, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          overflow: hidden;
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .settings-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .settings-title {
          font-family: var(--font-cinzel);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .settings-close {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .settings-close:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
        }

        .settings-body {
          padding: 2rem;
          max-height: calc(80vh - 100px);
          overflow-y: auto;
        }

        .setting-section {
          margin-bottom: 2rem;
        }

        .setting-section:last-child {
          margin-bottom: 0;
        }

        .setting-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--font-josefin);
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        /* Theme Options */
        .theme-options {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        .theme-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: var(--text-primary);
          font-family: var(--font-josefin);
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .theme-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--cns-gold);
        }

        .theme-btn.active {
          background: var(--cns-gold);
          color: var(--bg-primary);
          border-color: var(--cns-gold);
        }

        .theme-btn.dark {
          background-color: rgba(10, 10, 15, 0.8);
        }

        .theme-btn.light {
          background-color: rgba(245, 245, 220, 0.8);
        }

        .theme-btn.sepia {
          background-color: rgba(244, 236, 216, 0.8);
        }

        .theme-btn.contrast {
          background-color: rgba(0, 0, 0, 0.9);
        }

        /* Slider Controls */
        .slider-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .slider-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .slider-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--cns-gold);
        }

        .slider {
          flex: 1;
          -webkit-appearance: none;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          outline: none;
        }

        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          background: var(--cns-gold);
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 10px var(--cns-gold);
        }

        .slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          background: var(--cns-gold);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        /* Font Options */
        .font-options {
          display: flex;
          gap: 0.75rem;
        }

        .font-btn {
          flex: 1;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: var(--text-primary);
          font-family: var(--font-josefin);
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .font-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--cns-gold);
        }

        .font-btn.active {
          background: var(--cns-gold);
          color: var(--bg-primary);
          border-color: var(--cns-gold);
        }

        /* Toggle Options */
        .toggle-options {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .toggle-option {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .toggle-option:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .toggle-option input[type="checkbox"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
        }

        .toggle-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--font-josefin);
          font-size: 0.95rem;
          color: var(--text-primary);
        }

        /* Scrollbar */
        .settings-body::-webkit-scrollbar {
          width: 6px;
        }

        .settings-body::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }

        .settings-body::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }

        @media (max-width: 768px) {
          .settings-content {
            width: 95%;
            max-height: 90vh;
          }

          .settings-header,
          .settings-body {
            padding: 1.5rem;
          }

          .theme-options {
            grid-template-columns: 1fr;
          }

          .font-options {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// BOOKMARKS PANEL COMPONENT
// ============================================================================
function BookmarksPanel({
  bookmarks,
  currentPage,
  onJumpToBookmark,
  onRemoveBookmark,
  onClose,
  playHover
}) {
  return (
    <div className="bookmarks-panel">
      <div className="bookmarks-overlay" onClick={onClose} />
      
      <div className="bookmarks-content">
        <div className="bookmarks-header">
          <h2 className="bookmarks-title">
            <Bookmark size={20} />
            Bookmarks ({bookmarks.length})
          </h2>
          <button className="bookmarks-close" onClick={onClose} onMouseEnter={playHover}>
            <X size={20} />
          </button>
        </div>

        <div className="bookmarks-body">
          {bookmarks.length === 0 ? (
            <div className="bookmarks-empty">
              <Bookmark size={48} style={{ opacity: 0.3 }} />
              <p>No bookmarks yet</p>
              <span>Press Ctrl+B to add a bookmark</span>
            </div>
          ) : (
            <div className="bookmarks-list">
              {bookmarks.map((bookmark) => (
                <div 
                  key={bookmark.id}
                  className={`bookmark-item ${bookmark.page === currentPage ? 'current' : ''}`}
                >
                  <button
                    className="bookmark-jump"
                    onClick={() => {
                      onJumpToBookmark(bookmark.page);
                      onClose();
                    }}
                    onMouseEnter={playHover}
                  >
                    <BookmarkCheck size={16} />
                    <div className="bookmark-info">
                      <span className="bookmark-page">Page {bookmark.page + 1}</span>
                      <span className="bookmark-date">
                        {new Date(bookmark.date).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                  
                  <button
                    className="bookmark-remove"
                    onClick={() => onRemoveBookmark(bookmark.id)}
                    onMouseEnter={playHover}
                    aria-label="Remove bookmark"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .bookmarks-panel {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 350px;
          z-index: 200;
        }

        .bookmarks-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
        }

        .bookmarks-content {
          position: relative;
          height: 100%;
          background: rgba(10, 10, 15, 0.95);
          backdrop-filter: blur(20px);
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          animation: slideInRight 0.3s ease;
        }

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .bookmarks-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .bookmarks-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--font-cinzel);
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .bookmarks-close {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .bookmarks-close:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
        }

        .bookmarks-body {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
        }

        .bookmarks-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          color: var(--text-secondary);
          gap: 1rem;
        }

        .bookmarks-empty p {
          font-family: var(--font-josefin);
          font-size: 1.1rem;
          margin: 0;
        }

        .bookmarks-empty span {
          font-family: var(--font-josefin);
          font-size: 0.85rem;
          opacity: 0.6;
        }

        .bookmarks-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .bookmark-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.2s ease;
        }

        .bookmark-item:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .bookmark-item.current {
          background: rgba(255, 215, 0, 0.1);
          border-color: var(--cns-gold);
        }

        .bookmark-jump {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: none;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
          text-align: left;
        }

        .bookmark-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .bookmark-page {
          font-family: var(--font-cinzel);
          font-size: 0.95rem;
          font-weight: 600;
        }

        .bookmark-date {
          font-family: var(--font-josefin);
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .bookmark-remove {
          padding: 1rem;
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .bookmark-remove:hover {
          color: #E0115F;
        }

        @media (max-width: 768px) {
          .bookmarks-panel {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}