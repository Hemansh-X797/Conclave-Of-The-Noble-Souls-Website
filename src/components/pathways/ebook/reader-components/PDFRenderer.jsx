// ============================================================================
// PDF RENDERER COMPONENT - PDF READING ENGINE
// High-performance PDF display with text selection and zoom
// Location: /src/components/pathways/ebook/reader-components/PDFRenderer.jsx
// ============================================================================

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import LoadingCrest from '@/components/ui/LoadingCrest';
import { notify } from '@/components/interactive/NotificationCenter';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

/**
 * PDFRenderer - PDF document renderer with controls
 * 
 * @param {Object} props
 * @param {Object} props.file - File object with path
 * @param {number} props.currentPage - Current page index (0-based)
 * @param {Function} props.onPageChange - Callback when page changes
 * @param {Function} props.onTotalPagesLoad - Callback when PDF loaded with page count
 * @param {boolean} props.bionicMode - Enable bionic reading mode
 */
export default function PDFRenderer({
  file,
  currentPage = 0,
  onPageChange,
  onTotalPagesLoad,
  bionicMode = false
}) {
  const [numPages, setNumPages] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scale, setScale] = useState(1.0);
  const [pageWidth, setPageWidth] = useState(null);
  
  const containerRef = useRef(null);
  const documentRef = useRef(null);

  // ============================================
  // CALCULATE PAGE WIDTH
  // ============================================
  useEffect(() => {
    const updatePageWidth = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        setPageWidth(Math.min(containerWidth - 40, 800)); // Max 800px
      }
    };

    updatePageWidth();
    window.addEventListener('resize', updatePageWidth);
    return () => window.removeEventListener('resize', updatePageWidth);
  }, []);

  // ============================================
  // DOCUMENT LOAD SUCCESS
  // ============================================
  const handleDocumentLoadSuccess = useCallback(({ numPages: pages }) => {
    setNumPages(pages);
    setLoading(false);
    setError(null);
    
    if (onTotalPagesLoad) {
      onTotalPagesLoad(pages);
    }
    
    notify.success(`PDF loaded: ${pages} pages`, { duration: 3000 });
  }, [onTotalPagesLoad]);

  // ============================================
  // DOCUMENT LOAD ERROR
  // ============================================
  const handleDocumentLoadError = useCallback((error) => {
    console.error('PDF load error:', error);
    setLoading(false);
    setError(error.message || 'Failed to load PDF');
    notify.error('Failed to load PDF file');
  }, []);

  // ============================================
  // PAGE RENDER SUCCESS
  // ============================================
  const handlePageRenderSuccess = useCallback(() => {
    // Apply bionic mode if enabled
    if (bionicMode) {
      applyBionicReading();
    }
  }, [bionicMode]);

  // ============================================
  // BIONIC READING MODE
  // ============================================
  const applyBionicReading = useCallback(() => {
    try {
      const textLayer = document.querySelector('.react-pdf__Page__textContent');
      if (!textLayer) return;

      const textElements = textLayer.querySelectorAll('span');
      
      textElements.forEach(span => {
        const text = span.textContent;
        if (!text || text.length < 2) return;

        const boldLength = Math.ceil(text.length / 2);
        const boldPart = text.substring(0, boldLength);
        const normalPart = text.substring(boldLength);

        span.innerHTML = `<strong>${boldPart}</strong>${normalPart}`;
      });
    } catch (error) {
      console.error('Bionic mode error:', error);
    }
  }, []);

  // ============================================
  // KEYBOARD NAVIGATION
  // ============================================
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'PageUp' && currentPage > 0) {
        onPageChange?.(currentPage - 1);
      } else if (e.key === 'PageDown' && currentPage < numPages - 1) {
        onPageChange?.(currentPage + 1);
      } else if (e.key === 'Home') {
        onPageChange?.(0);
      } else if (e.key === 'End' && numPages) {
        onPageChange?.(numPages - 1);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, numPages, onPageChange]);

  // ============================================
  // RENDER: ERROR STATE
  // ============================================
  if (error) {
    return (
      <div className="pdf-error">
        <div className="error-icon">📄</div>
        <h3 className="error-title">PDF Load Error</h3>
        <p className="error-message">{error}</p>
        <p className="error-hint">Please check if the file exists and is a valid PDF.</p>

        <style jsx>{`
          .pdf-error {
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
    <div ref={containerRef} className="pdf-renderer">
      {loading && (
        <div className="pdf-loading">
          <LoadingCrest message="Loading PDF..." />
        </div>
      )}

      <Document
        ref={documentRef}
        file={file.path}
        onLoadSuccess={handleDocumentLoadSuccess}
        onLoadError={handleDocumentLoadError}
        loading={null}
        error={null}
        className="pdf-document"
      >
        <Page
          pageNumber={currentPage + 1}
          width={pageWidth}
          scale={scale}
          onRenderSuccess={handlePageRenderSuccess}
          loading={null}
          error={null}
          className="pdf-page"
          renderTextLayer={true}
          renderAnnotationLayer={true}
        />
      </Document>

      <style jsx>{`
        .pdf-renderer {
          width: 100%;
          min-height: 500px;
          position: relative;
        }

        .pdf-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 500px;
        }

        :global(.pdf-document) {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        :global(.pdf-page) {
          margin: 0 auto;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          overflow: hidden;
        }

        :global(.react-pdf__Page__textContent) {
          user-select: text;
        }

        :global(.react-pdf__Page__textContent span) {
          color: inherit !important;
          background: transparent !important;
        }

        :global(.pdf-page canvas) {
          border-radius: 8px;
        }

        :global(.react-pdf__Page__annotations) {
          display: none;
        }

        /* Bionic Reading Styles */
        :global(.react-pdf__Page__textContent strong) {
          font-weight: 700;
          opacity: 1;
        }
      `}</style>
    </div>
  );
}