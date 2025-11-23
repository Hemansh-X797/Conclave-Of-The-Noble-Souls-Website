// ============================================================================
// EBOOK DOWNLOADER COMPONENT - NOBLE ACQUISITION SYSTEM
// Advanced download manager with progress tracking and particle effects
// Location: /src/components/pathways/ebook/EBookDownloader.jsx
// ============================================================================

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppContext } from '@/contexts/AppProvider';
import { notify } from '@/components/interactive/NotificationCenter';
import { 
  Download, Check, X, FileText, Loader, 
  AlertCircle, TrendingDown, Sparkles, Package
} from 'lucide-react';

/**
 * EBookDownloader - Advanced file download with progress and effects
 * 
 * @param {Object} props
 * @param {Object} props.book - Book object with files array
 * @param {Function} props.onDownloadComplete - Callback on completion
 * @param {Function} props.onDownloadError - Callback on error
 * @param {boolean} props.showStats - Show download statistics
 * @param {string} props.pathway - Current pathway for theming
 */
export default function EBookDownloader({
  book,
  onDownloadComplete,
  onDownloadError,
  showStats = true,
  pathway = 'lorebound'
}) {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [downloadError, setDownloadError] = useState(null);
  const [downloadStats, setDownloadStats] = useState({
    totalDownloads: 0,
    lastDownload: null,
    popularFormat: null
  });
  const [particles, setParticles] = useState([]);
  
  const downloaderRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  // ============================================
  // CONTEXT & HOOKS
  // ============================================
  const { playClick, playHover, playNotification, animationsEnabled } = useAppContext();

  // ============================================
  // LOAD DOWNLOAD STATS
  // ============================================
  useEffect(() => {
    if (!book?.id || !showStats) return;

    try {
      const savedStats = localStorage.getItem(`download-stats-${book.id}`);
      if (savedStats) {
        setDownloadStats(JSON.parse(savedStats));
      }
    } catch (error) {
      console.error('Failed to load download stats:', error);
    }
  }, [book, showStats]);

  // ============================================
  // PARTICLE ANIMATION
  // ============================================
  useEffect(() => {
    if (!animationsEnabled || !canvasRef.current || !downloadComplete) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    canvas.width = 300 * dpr;
    canvas.height = 300 * dpr;
    canvas.style.width = '300px';
    canvas.style.height = '300px';
    ctx.scale(dpr, dpr);

    // Generate particles
    const newParticles = [];
    for (let i = 0; i < 30; i++) {
      newParticles.push({
        x: 150,
        y: 150,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        size: 2 + Math.random() * 3,
        life: 1,
        color: `hsl(${45 + Math.random() * 60}, 100%, 60%)`
      });
    }
    setParticles(newParticles);

    let time = 0;
    const animate = () => {
      time += 0.02;
      ctx.clearRect(0, 0, 300, 300);

      // Update and draw particles
      newParticles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.05; // Gravity
        particle.life -= 0.01;

        if (particle.life > 0) {
          ctx.globalAlpha = particle.life;
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw success icon glow
      const gradient = ctx.createRadialGradient(150, 150, 0, 150, 150, 50);
      gradient.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(150, 150, 50 + Math.sin(time) * 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 1;

      if (newParticles.some(p => p.life > 0)) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [downloadComplete, animationsEnabled]);

  // ============================================
  // DOWNLOAD HANDLER
  // ============================================
  const handleDownload = useCallback(async (file) => {
    if (!file) return;

    playClick();
    setDownloading(true);
    setDownloadProgress(0);
    setDownloadComplete(false);
    setDownloadError(null);
    setSelectedFile(file);

    try {
      // Simulate download progress (replace with actual download logic)
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      // Wait for progress to complete
      await new Promise(resolve => {
        const checkProgress = setInterval(() => {
          setDownloadProgress(current => {
            if (current >= 100) {
              clearInterval(checkProgress);
              resolve();
              return 100;
            }
            return current;
          });
        }, 100);
      });

      // Create download link
      const link = document.createElement('a');
      link.href = file.path;
      link.download = `${book.title} - ${file.name}.${file.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Update stats
      const newStats = {
        totalDownloads: downloadStats.totalDownloads + 1,
        lastDownload: Date.now(),
        popularFormat: file.format
      };
      setDownloadStats(newStats);
      localStorage.setItem(`download-stats-${book.id}`, JSON.stringify(newStats));

      // Success state
      setDownloadComplete(true);
      playNotification();
      notify.success(`Downloaded: ${file.name}`, { 
        title: 'Download Complete',
        duration: 4000 
      });

      if (onDownloadComplete) {
        onDownloadComplete(file, book);
      }

    } catch (error) {
      console.error('Download error:', error);
      setDownloadError(error.message || 'Download failed');
      notify.error('Download failed', { duration: 3000 });

      if (onDownloadError) {
        onDownloadError(error, file);
      }
    } finally {
      setDownloading(false);
    }
  }, [book, downloadStats, playClick, playNotification, onDownloadComplete, onDownloadError]);

  // ============================================
  // RESET HANDLER
  // ============================================
  const handleReset = useCallback(() => {
    playClick();
    setDownloading(false);
    setDownloadProgress(0);
    setDownloadComplete(false);
    setDownloadError(null);
    setSelectedFile(null);
  }, [playClick]);

  // ============================================
  // FORMAT ICON
  // ============================================
  const getFormatIcon = (format) => {
    switch (format?.toLowerCase()) {
      case 'pdf':
        return '📄';
      case 'epub':
        return '📚';
      case 'mobi':
        return '📖';
      default:
        return '📄';
    }
  };

  // ============================================
  // FORMAT SIZE
  // ============================================
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  // ============================================
  // RENDER: NO FILES
  // ============================================
  if (!book?.files || book.files.length === 0) {
    return (
      <div className="downloader-empty">
        <AlertCircle size={48} style={{ opacity: 0.3 }} />
        <p>No download files available</p>

        <style jsx>{`
          .downloader-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 3rem;
            text-align: center;
            color: var(--text-secondary);
          }

          .downloader-empty p {
            font-family: var(--font-josefin);
            font-size: 1rem;
            margin-top: 1rem;
          }
        `}</style>
      </div>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div className={`ebook-downloader ${pathway}-pathway`} ref={downloaderRef}>
      {/* Download Stats */}
      {showStats && downloadStats.totalDownloads > 0 && (
        <div className="download-stats">
          <div className="stat-item">
            <TrendingDown size={16} />
            <span>{downloadStats.totalDownloads} download{downloadStats.totalDownloads !== 1 ? 's' : ''}</span>
          </div>
          {downloadStats.lastDownload && (
            <div className="stat-item">
              <FileText size={16} />
              <span>Last: {new Date(downloadStats.lastDownload).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      )}

      {/* Download Complete State */}
      {downloadComplete && (
        <div className="download-complete">
          <canvas ref={canvasRef} className="success-canvas" />
          
          <div className="complete-content">
            <div className="complete-icon">
              <Check size={48} />
            </div>
            <h3 className="complete-title">Download Complete!</h3>
            <p className="complete-message">
              {selectedFile?.name} has been downloaded successfully
            </p>
            <button
              className="reset-btn"
              onClick={handleReset}
              onMouseEnter={playHover}
            >
              <Download size={16} />
              Download Another
            </button>
          </div>
        </div>
      )}

      {/* Download Error State */}
      {downloadError && (
        <div className="download-error">
          <div className="error-icon">
            <X size={48} />
          </div>
          <h3 className="error-title">Download Failed</h3>
          <p className="error-message">{downloadError}</p>
          <button
            className="retry-btn"
            onClick={() => handleDownload(selectedFile)}
            onMouseEnter={playHover}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Download Progress State */}
      {downloading && !downloadComplete && !downloadError && (
        <div className="download-progress">
          <div className="progress-icon">
            <Loader size={48} className="spinner" />
          </div>
          <h3 className="progress-title">Downloading...</h3>
          <p className="progress-file">{selectedFile?.name}</p>
          
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill"
              style={{ width: `${downloadProgress}%` }}
            />
          </div>
          
          <div className="progress-percentage">
            {Math.round(downloadProgress)}%
          </div>
        </div>
      )}

      {/* File Selection State */}
      {!downloading && !downloadComplete && !downloadError && (
        <div className="file-selection">
          <div className="selection-header">
            <Package size={24} />
            <h3>Select Download Format</h3>
          </div>

          <div className="files-list">
            {book.files.map((file, index) => (
              <button
                key={index}
                className="file-item"
                onClick={() => handleDownload(file)}
                onMouseEnter={playHover}
              >
                <div className="file-icon">
                  {getFormatIcon(file.format)}
                </div>
                
                <div className="file-info">
                  <div className="file-name">{file.name}</div>
                  <div className="file-details">
                    <span className="file-format">{file.format?.toUpperCase()}</span>
                    {file.size && (
                      <>
                        <span className="file-separator">•</span>
                        <span className="file-size">{formatFileSize(file.size)}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="file-action">
                  <Download size={20} />
                </div>
              </button>
            ))}
          </div>

          {book.files.length > 1 && (
            <div className="selection-hint">
              <Sparkles size={14} />
              <span>Multiple formats available - choose your preferred one</span>
            </div>
          )}
        </div>
      )}

      {/* Styles */}
      <style jsx>{`
        .ebook-downloader {
          width: 100%;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          position: relative;
        }

        /* Stats */
        .download-stats {
          display: flex;
          gap: 1.5rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          margin-bottom: 1.5rem;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--font-josefin);
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        /* File Selection */
        .file-selection {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .selection-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .selection-header h3 {
          font-family: var(--font-cinzel);
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .files-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .file-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
          text-align: left;
        }

        .file-item:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: var(--cns-gold);
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(255, 215, 0, 0.1);
        }

        .file-icon {
          font-size: 2rem;
          line-height: 1;
        }

        .file-info {
          flex: 1;
        }

        .file-name {
          font-family: var(--font-josefin);
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .file-details {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--font-josefin);
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .file-format {
          padding: 0.15rem 0.5rem;
          background: rgba(255, 215, 0, 0.1);
          border-radius: 4px;
          color: var(--cns-gold);
          font-weight: 600;
        }

        .file-separator {
          opacity: 0.5;
        }

        .file-action {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: rgba(255, 215, 0, 0.1);
          border-radius: 8px;
          color: var(--cns-gold);
        }

        .selection-hint {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: rgba(255, 215, 0, 0.05);
          border: 1px solid rgba(255, 215, 0, 0.2);
          border-radius: 8px;
          font-family: var(--font-josefin);
          font-size: 0.85rem;
          color: var(--cns-gold);
        }

        /* Download Progress */
        .download-progress {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 2rem;
          text-align: center;
        }

        .progress-icon {
          color: var(--cns-gold);
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .progress-title {
          font-family: var(--font-cinzel);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .progress-file {
          font-family: var(--font-josefin);
          font-size: 0.95rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .progress-bar-container {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
          margin-top: 0.5rem;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--cns-gold), #FFA500);
          border-radius: 4px;
          transition: width 0.3s ease;
          box-shadow: 0 0 10px var(--cns-gold);
        }

        .progress-percentage {
          font-family: var(--font-cinzel);
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--cns-gold);
        }

        /* Download Complete */
        .download-complete {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem;
          text-align: center;
        }

        .success-canvas {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          pointer-events: none;
        }

        .complete-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .complete-icon {
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(80, 200, 120, 0.2);
          border: 3px solid #50C878;
          border-radius: 50%;
          color: #50C878;
          animation: scaleIn 0.5s ease;
        }

        @keyframes scaleIn {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }

        .complete-title {
          font-family: var(--font-cinzel);
          font-size: 1.75rem;
          font-weight: 700;
          color: #50C878;
          margin: 0;
        }

        .complete-message {
          font-family: var(--font-josefin);
          font-size: 1rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .reset-btn {
          display: flex;
          align-items: center;
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

        .reset-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 215, 0, 0.3);
        }

        /* Download Error */
        .download-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 2rem;
          text-align: center;
        }

        .error-icon {
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(224, 17, 95, 0.2);
          border: 3px solid #E0115F;
          border-radius: 50%;
          color: #E0115F;
        }

        .error-title {
          font-family: var(--font-cinzel);
          font-size: 1.75rem;
          font-weight: 700;
          color: #E0115F;
          margin: 0;
        }

        .error-message {
          font-family: var(--font-josefin);
          font-size: 1rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .retry-btn {
          padding: 0.75rem 1.5rem;
          background: #E0115F;
          border: none;
          border-radius: 12px;
          color: white;
          font-family: var(--font-josefin);
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 1rem;
        }

        .retry-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(224, 17, 95, 0.3);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .ebook-downloader {
            padding: 1.5rem;
          }

          .download-stats {
            flex-direction: column;
            gap: 0.75rem;
          }

          .file-item {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}