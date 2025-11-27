// ============================================================================
// READING PROGRESS COMPONENT - CELESTIAL JOURNEY TRACKER
// Constellation-based progress visualization with luxury aesthetics
// Location: /src/components/pathways/ebook/ReadingProgress.jsx
// ============================================================================

'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAppContext } from '@/contexts/AppProvider';
import { notify } from '@/components/interactive/NotificationCenter';
import { 
  BookOpen, Clock, TrendingUp, Target, Flame, 
  Star, Sparkles, Award, Calendar, Eye,
  ChevronRight, Zap, Coffee, Moon
} from 'lucide-react';

/**
 * ReadingProgress - Celestial reading journey visualization
 * 
 * @param {Object} props
 * @param {Object} props.book - Book object with reading data
 * @param {number} props.currentPage - Current page number
 * @param {number} props.totalPages - Total pages in book
 * @param {number} props.timeSpent - Total reading time in minutes
 * @param {Array} props.readingSessions - Array of reading session data
 * @param {Function} props.onContinueReading - Callback to continue reading
 * @param {string} props.pathway - Current pathway for theming
 * @param {boolean} props.compact - Compact view mode
 */
export default function ReadingProgress({
  book,
  currentPage = 0,
  totalPages = 100,
  timeSpent = 0,
  readingSessions = [],
  onContinueReading,
  pathway = 'lorebound',
  compact = false
}) {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [activeView, setActiveView] = useState('overview'); // overview, stats, constellation
  const [showCelebration, setShowCelebration] = useState(false);
  const [streak, setStreak] = useState(0);
  const [constellationStars, setConstellationStars] = useState([]);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  // ============================================
  // CONTEXT & HOOKS
  // ============================================
  const { 
    user,
    playClick, 
    playHover,
    playNotification,
    animationsEnabled 
  } = useAppContext();

  // ============================================
  // CALCULATIONS
  // ============================================
  const progressPercentage = useMemo(() => Math.min(Math.round((currentPage / totalPages) * 100), 100), [currentPage, totalPages]);

  const pagesRemaining = useMemo(() => Math.max(totalPages - currentPage, 0), [currentPage, totalPages]);

  const estimatedTimeRemaining = useMemo(() => {
    if (currentPage === 0 || timeSpent === 0) {
return null;
}
    const avgTimePerPage = timeSpent / currentPage;
    return Math.round(avgTimePerPage * pagesRemaining);
  }, [currentPage, timeSpent, pagesRemaining]);

  const readingSpeed = useMemo(() => {
    if (timeSpent === 0) {
return 0;
}
    return Math.round((currentPage / timeSpent) * 60); // pages per hour
  }, [currentPage, timeSpent]);

  const readingMood = useMemo(() => {
    if (readingSpeed === 0) {
return { label: 'Start Reading', color: '#808080', emoji: '📖' };
}
    if (readingSpeed < 20) {
return { label: 'Deep Focus', color: '#9D4EDD', emoji: '🟣' };
} // Violet
    if (readingSpeed >= 20 && readingSpeed < 40) {
return { label: 'Normal Pace', color: '#50C878', emoji: '🟢' };
} // Green
    if (readingSpeed >= 40 && readingSpeed < 60) {
return { label: 'Fast Reader', color: '#00BFFF', emoji: '🔵' };
} // Blue
    return { label: 'Speed Reading', color: '#FF4500', emoji: '🔴' }; // Red
  }, [readingSpeed]);

  // ============================================
  // READING STREAK CALCULATION
  // ============================================
  useEffect(() => {
    if (!readingSessions || readingSessions.length === 0) {
      setStreak(0);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let currentStreak = 0;
    const checkDate = new Date(today);
    
    const sessionDates = readingSessions
      .map(session => {
        const date = new Date(session.date);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
      .sort((a, b) => b - a);
    
    const uniqueDates = [...new Set(sessionDates)];
    
    for (let i = 0; i < uniqueDates.length; i++) {
      if (uniqueDates[i] === checkDate.getTime()) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (uniqueDates[i] < checkDate.getTime()) {
        break;
      }
    }
    
    setStreak(currentStreak);
  }, [readingSessions]);

  // ============================================
  // CONSTELLATION GENERATION
  // ============================================
  useEffect(() => {
    const totalChapters = book?.chapters || 20;
    const completedChapters = Math.floor((currentPage / totalPages) * totalChapters);
    
    const stars = [];
    const centerX = 200;
    const centerY = 200;
    const radius = 120;
    
    for (let i = 0; i < totalChapters; i++) {
      const angle = (i / totalChapters) * Math.PI * 2 - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      stars.push({
        id: i,
        x,
        y,
        completed: i < completedChapters,
        size: i < completedChapters ? 4 : 2,
        glow: i < completedChapters ? 8 : 0
      });
    }
    
    setConstellationStars(stars);
  }, [currentPage, totalPages, book]);

  // ============================================
  // CANVAS CONSTELLATION RENDERER
  // ============================================
  useEffect(() => {
    if (!animationsEnabled || !canvasRef.current || activeView !== 'constellation') {
return;
}
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = 400 * dpr;
    canvas.height = 400 * dpr;
    canvas.style.width = '400px';
    canvas.style.height = '400px';
    ctx.scale(dpr, dpr);
    
    let animationTime = 0;
    
    const animate = () => {
      animationTime += 0.01;
      
      ctx.clearRect(0, 0, 400, 400);
      
      // Draw connections between completed stars
      ctx.strokeStyle = readingMood.color;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3;
      
      for (let i = 0; i < constellationStars.length - 1; i++) {
        if (constellationStars[i].completed && constellationStars[i + 1].completed) {
          ctx.beginPath();
          ctx.moveTo(constellationStars[i].x, constellationStars[i].y);
          ctx.lineTo(constellationStars[i + 1].x, constellationStars[i + 1].y);
          ctx.stroke();
        }
      }
      
      ctx.globalAlpha = 1;
      
      // Draw stars
      constellationStars.forEach((star, index) => {
        const pulse = Math.sin(animationTime + index * 0.2) * 0.3 + 0.7;
        
        if (star.completed) {
          // Glow effect
          const gradient = ctx.createRadialGradient(
            star.x, star.y, 0,
            star.x, star.y, star.glow
          );
          gradient.addColorStop(0, readingMood.color);
          gradient.addColorStop(1, 'transparent');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.glow * pulse, 0, Math.PI * 2);
          ctx.fill();
          
          // Star core
          ctx.fillStyle = readingMood.color;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
          
          // Sparkle
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1;
          ctx.globalAlpha = 0.5 * pulse;
          ctx.beginPath();
          ctx.moveTo(star.x - 6, star.y);
          ctx.lineTo(star.x + 6, star.y);
          ctx.moveTo(star.x, star.y - 6);
          ctx.lineTo(star.x, star.y + 6);
          ctx.stroke();
          ctx.globalAlpha = 1;
        } else {
          // Inactive star
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      
      // Draw center text
      ctx.fillStyle = readingMood.color;
      ctx.font = 'bold 32px var(--font-cinzel)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${progressPercentage}%`, 200, 200);
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animationsEnabled, constellationStars, readingMood, progressPercentage, activeView]);

  // ============================================
  // CELEBRATION EFFECT
  // ============================================
  useEffect(() => {
    if (progressPercentage === 100 && !showCelebration) {
      setShowCelebration(true);
      playNotification();
      notify.success('Book completed! 🎉', { 
        title: 'Congratulations!',
        duration: 5000 
      });
      
      setTimeout(() => setShowCelebration(false), 5000);
    }
  }, [progressPercentage, showCelebration, playNotification]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleContinueReading = useCallback(() => {
    playClick();
    onContinueReading?.();
  }, [playClick, onContinueReading]);

  const handleViewChange = useCallback((view) => {
    playClick();
    setActiveView(view);
  }, [playClick]);

  // ============================================
  // COMPACT VIEW
  // ============================================
  if (compact) {
    return (
      <div className={`reading-progress-compact ${pathway}-pathway`}>
        <div className="compact-progress-bar">
          <div 
            className="compact-progress-fill"
            style={{ 
              width: `${progressPercentage}%`,
              background: readingMood.color
            }}
          />
        </div>
        
        <div className="compact-info">
          <span className="compact-percentage">{progressPercentage}%</span>
          <span className="compact-pages">
            {currentPage} / {totalPages} pages
          </span>
        </div>
        
        <style jsx>{`
          .reading-progress-compact {
            width: 100%;
            padding: 1rem;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.08);
          }

          .compact-progress-bar {
            width: 100%;
            height: 8px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 0.5rem;
          }

          .compact-progress-fill {
            height: 100%;
            border-radius: 4px;
            transition: width 0.5s ease;
          }

          .compact-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .compact-percentage {
            font-family: var(--font-cinzel);
            font-size: 1rem;
            font-weight: 700;
            color: var(--text-primary);
          }

          .compact-pages {
            font-family: var(--font-josefin);
            font-size: 0.85rem;
            color: var(--text-secondary);
          }
        `}</style>
      </div>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div className={`reading-progress ${pathway}-pathway`}>
      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="celebration-overlay">
          <div className="celebration-content">
            <Award size={64} className="celebration-icon" />
            <h2 className="celebration-title">Book Completed!</h2>
            <p className="celebration-message">
              You've finished "{book?.title}"
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="progress-header">
        <div className="progress-title-section">
          <h2 className="progress-title">Reading Journey</h2>
          <p className="progress-subtitle">{book?.title}</p>
        </div>
        
        {streak > 0 && (
          <div className="streak-badge">
            <Flame size={20} style={{ color: '#FF4500' }} />
            <span className="streak-number">{streak}</span>
            <span className="streak-label">Day Streak</span>
          </div>
        )}
      </div>

      {/* View Tabs */}
      <div className="view-tabs">
        <button
          className={`view-tab ${activeView === 'overview' ? 'active' : ''}`}
          onClick={() => handleViewChange('overview')}
          onMouseEnter={playHover}
        >
          <Eye size={18} />
          Overview
        </button>
        <button
          className={`view-tab ${activeView === 'stats' ? 'active' : ''}`}
          onClick={() => handleViewChange('stats')}
          onMouseEnter={playHover}
        >
          <TrendingUp size={18} />
          Statistics
        </button>
        <button
          className={`view-tab ${activeView === 'constellation' ? 'active' : ''}`}
          onClick={() => handleViewChange('constellation')}
          onMouseEnter={playHover}
        >
          <Star size={18} />
          Constellation
        </button>
      </div>

      {/* Content Area */}
      <div className="progress-content">
        {activeView === 'overview' && (
          <OverviewView
            progressPercentage={progressPercentage}
            currentPage={currentPage}
            totalPages={totalPages}
            pagesRemaining={pagesRemaining}
            timeSpent={timeSpent}
            estimatedTimeRemaining={estimatedTimeRemaining}
            readingMood={readingMood}
            readingSpeed={readingSpeed}
            onContinueReading={handleContinueReading}
            playHover={playHover}
          />
        )}

        {activeView === 'stats' && (
          <StatsView
            timeSpent={timeSpent}
            readingSessions={readingSessions}
            readingSpeed={readingSpeed}
            readingMood={readingMood}
            streak={streak}
            currentPage={currentPage}
            totalPages={totalPages}
          />
        )}

        {activeView === 'constellation' && (
          <ConstellationView
            canvasRef={canvasRef}
            constellationStars={constellationStars}
            readingMood={readingMood}
            progressPercentage={progressPercentage}
            book={book}
          />
        )}
      </div>

      {/* Global Styles */}
      <style jsx>{`
        .reading-progress {
          width: 100%;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }

        .reading-progress::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, 
            transparent 0%, 
            var(--cns-gold) 50%, 
            transparent 100%
          );
        }

        /* Celebration Overlay */
        .celebration-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          animation: fadeIn 0.3s ease;
        }

        .celebration-content {
          text-align: center;
          animation: scaleIn 0.5s ease;
        }

        .celebration-icon {
          color: var(--cns-gold);
          margin-bottom: 1rem;
          animation: bounce 1s infinite;
        }

        .celebration-title {
          font-family: var(--font-cinzel);
          font-size: 2rem;
          font-weight: 700;
          color: var(--cns-gold);
          margin-bottom: 0.5rem;
        }

        .celebration-message {
          font-family: var(--font-josefin);
          font-size: 1.1rem;
          color: var(--text-secondary);
        }

        /* Header */
        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
        }

        .progress-title {
          font-family: var(--font-cinzel);
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .progress-subtitle {
          font-family: var(--font-josefin);
          font-size: 1rem;
          color: var(--text-secondary);
        }

        .streak-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: rgba(255, 69, 0, 0.1);
          border: 1px solid rgba(255, 69, 0, 0.3);
          border-radius: 50px;
          animation: pulse 2s infinite;
        }

        .streak-number {
          font-family: var(--font-cinzel);
          font-size: 1.5rem;
          font-weight: 700;
          color: #FF4500;
        }

        .streak-label {
          font-family: var(--font-josefin);
          font-size: 0.9rem;
          color: #FF4500;
        }

        /* View Tabs */
        .view-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          background: rgba(255, 255, 255, 0.03);
          padding: 0.5rem;
          border-radius: 12px;
        }

        .view-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: none;
          border: none;
          border-radius: 8px;
          color: var(--text-secondary);
          font-family: var(--font-josefin);
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .view-tab:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
        }

        .view-tab.active {
          background: var(--cns-gold);
          color: var(--bg-primary);
        }

        /* Content Area */
        .progress-content {
          min-height: 300px;
        }

        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .reading-progress {
            padding: 1.5rem;
          }

          .progress-header {
            flex-direction: column;
            gap: 1rem;
          }

          .progress-title {
            font-size: 1.5rem;
          }

          .view-tabs {
            flex-direction: column;
          }

          .celebration-title {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// OVERVIEW VIEW
// ============================================================================
function OverviewView({
  progressPercentage,
  currentPage,
  totalPages,
  pagesRemaining,
  timeSpent,
  estimatedTimeRemaining,
  readingMood,
  readingSpeed,
  onContinueReading,
  playHover
}) {
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
return `${hours}h ${mins}m`;
}
    return `${mins}m`;
  };

  return (
    <div className="overview-view">
      {/* Main Progress Circle */}
      <div className="progress-circle-container">
        <svg className="progress-circle" viewBox="0 0 200 200">
          {/* Background Circle */}
          <circle
            cx="100"
            cy="100"
            r="85"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="12"
          />
          {/* Progress Circle */}
          <circle
            cx="100"
            cy="100"
            r="85"
            fill="none"
            stroke={readingMood.color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 85}`}
            strokeDashoffset={`${2 * Math.PI * 85 * (1 - progressPercentage / 100)}`}
            transform="rotate(-90 100 100)"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
          {/* Center Text */}
          <text
            x="100"
            y="95"
            textAnchor="middle"
            fontSize="36"
            fontWeight="700"
            fill={readingMood.color}
            fontFamily="var(--font-cinzel)"
          >
            {progressPercentage}%
          </text>
          <text
            x="100"
            y="115"
            textAnchor="middle"
            fontSize="14"
            fill="var(--text-secondary)"
            fontFamily="var(--font-josefin)"
          >
            Complete
          </text>
        </svg>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatItem
          icon={<BookOpen size={24} />}
          label="Pages Read"
          value={`${currentPage} / ${totalPages}`}
          color={readingMood.color}
        />
        <StatItem
          icon={<Target size={24} />}
          label="Pages Remaining"
          value={pagesRemaining}
          color="#50C878"
        />
        <StatItem
          icon={<Clock size={24} />}
          label="Time Spent"
          value={formatTime(timeSpent)}
          color="#00BFFF"
        />
        {estimatedTimeRemaining && (
          <StatItem
            icon={<Zap size={24} />}
            label="Est. Time Left"
            value={formatTime(estimatedTimeRemaining)}
            color="#FFD700"
          />
        )}
      </div>

      {/* Reading Mood */}
      <div className="reading-mood-card" style={{ borderColor: readingMood.color }}>
        <div className="mood-icon" style={{ color: readingMood.color }}>
          {readingMood.emoji}
        </div>
        <div className="mood-content">
          <h3 className="mood-label">Current Reading Mood</h3>
          <p className="mood-value" style={{ color: readingMood.color }}>
            {readingMood.label}
          </p>
          <p className="mood-detail">
            {readingSpeed} pages/hour
          </p>
        </div>
      </div>

      {/* Continue Reading Button */}
      {progressPercentage < 100 && (
        <button
          className="continue-reading-btn"
          onClick={onContinueReading}
          onMouseEnter={playHover}
          style={{ background: readingMood.color }}
        >
          <BookOpen size={20} />
          Continue Reading
          <ChevronRight size={20} />
        </button>
      )}

      <style jsx>{`
        .overview-view {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          align-items: center;
        }

        .progress-circle-container {
          width: 200px;
          height: 200px;
        }

        .progress-circle {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.3));
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          width: 100%;
        }

        .reading-mood-card {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          border: 2px solid;
          border-radius: 16px;
          transition: all 0.3s ease;
        }

        .reading-mood-card:hover {
          background: rgba(255, 255, 255, 0.05);
          transform: translateY(-2px);
        }

        .mood-icon {
          font-size: 3rem;
          line-height: 1;
        }

        .mood-content {
          flex: 1;
        }

        .mood-label {
          font-family: var(--font-josefin);
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 0.25rem;
        }

        .mood-value {
          font-family: var(--font-cinzel);
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .mood-detail {
          font-family: var(--font-josefin);
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .continue-reading-btn {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 2rem;
          border: none;
          border-radius: 50px;
          color: var(--bg-primary);
          font-family: var(--font-josefin);
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }

        .continue-reading-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 30px rgba(0, 0, 0, 0.3);
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .reading-mood-card {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// STATS VIEW
// ============================================================================
function StatsView({
  timeSpent,
  readingSessions,
  readingSpeed,
  readingMood,
  streak,
  currentPage,
  totalPages
}) {
  const totalSessions = readingSessions?.length || 0;
  const avgSessionTime = totalSessions > 0 ? Math.round(timeSpent / totalSessions) : 0;
  const longestSession = readingSessions?.length > 0 
    ? Math.max(...readingSessions.map(s => s.duration || 0))
    : 0;
  
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
return `${hours}h ${mins}m`;
}
    return `${mins}m`;
  };

  const getReadingLevel = () => {
    if (currentPage < totalPages * 0.25) {
return { level: 'Beginner', color: '#808080', icon: '🌱' };
}
    if (currentPage < totalPages * 0.5) {
return { level: 'Progressing', color: '#50C878', icon: '🌿' };
}
    if (currentPage < totalPages * 0.75) {
return { level: 'Advanced', color: '#00BFFF', icon: '🌳' };
}
    if (currentPage < totalPages) {
return { level: 'Master', color: '#9D4EDD', icon: '🎯' };
}
    return { level: 'Champion', color: '#FFD700', icon: '👑' };
  };

  const readingLevel = getReadingLevel();

  return (
    <div className="stats-view">
      {/* Reading Level Badge */}
      <div className="reading-level-badge" style={{ borderColor: readingLevel.color }}>
        <div className="level-icon" style={{ color: readingLevel.color }}>
          {readingLevel.icon}
        </div>
        <div className="level-content">
          <h3 className="level-title">Reading Level</h3>
          <p className="level-name" style={{ color: readingLevel.color }}>
            {readingLevel.level}
          </p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="detailed-stats-grid">
        <DetailedStatCard
          icon={<Clock size={28} />}
          label="Total Time"
          value={formatTime(timeSpent)}
          sublabel="Reading this book"
          color="#00BFFF"
        />
        <DetailedStatCard
          icon={<Calendar size={28} />}
          label="Sessions"
          value={totalSessions}
          sublabel={`Avg ${formatTime(avgSessionTime)}/session`}
          color="#50C878"
        />
        <DetailedStatCard
          icon={<Zap size={28} />}
          label="Reading Speed"
          value={`${readingSpeed} p/h`}
          sublabel={readingMood.label}
          color={readingMood.color}
        />
        <DetailedStatCard
          icon={<Flame size={28} />}
          label="Streak"
          value={`${streak} days`}
          sublabel="Keep it up!"
          color="#FF4500"
        />
        <DetailedStatCard
          icon={<Coffee size={28} />}
          label="Longest Session"
          value={formatTime(longestSession)}
          sublabel="Personal best"
          color="#8B4513"
        />
        <DetailedStatCard
          icon={<Moon size={28} />}
          label="Completion"
          value={`${Math.round((currentPage / totalPages) * 100)}%`}
          sublabel={`${totalPages - currentPage} pages left`}
          color="#9D4EDD"
        />
      </div>

      {/* Reading History Chart */}
      {readingSessions && readingSessions.length > 0 && (
        <div className="reading-history">
          <h3 className="history-title">Reading Activity</h3>
          <div className="history-chart">
            {readingSessions.slice(-7).map((session, index) => {
              const maxDuration = Math.max(...readingSessions.map(s => s.duration || 0));
              const height = ((session.duration || 0) / maxDuration) * 100;
              
              return (
                <div key={index} className="history-bar-container">
                  <div 
                    className="history-bar"
                    style={{ 
                      height: `${height}%`,
                      background: readingMood.color 
                    }}
                  >
                    <div className="history-tooltip">
                      <span>{formatTime(session.duration || 0)}</span>
                      <span>{new Date(session.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span className="history-label">
                    {new Date(session.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style jsx>{`
        .stats-view {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .reading-level-badge {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.03);
          border: 2px solid;
          border-radius: 16px;
        }

        .level-icon {
          font-size: 4rem;
          line-height: 1;
        }

        .level-content {
          flex: 1;
        }

        .level-title {
          font-family: var(--font-josefin);
          font-size: 1rem;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }

        .level-name {
          font-family: var(--font-cinzel);
          font-size: 2rem;
          font-weight: 700;
        }

        .detailed-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .reading-history {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 1.5rem;
        }

        .history-title {
          font-family: var(--font-cinzel);
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
        }

        .history-chart {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 0.5rem;
          height: 200px;
          padding: 1rem 0;
        }

        .history-bar-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .history-bar {
          width: 100%;
          min-height: 20px;
          border-radius: 8px 8px 0 0;
          position: relative;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .history-bar:hover {
          opacity: 0.8;
          transform: translateY(-4px);
        }

        .history-tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.9);
          color: white;
          padding: 0.5rem;
          border-radius: 8px;
          white-space: nowrap;
          font-family: var(--font-josefin);
          font-size: 0.8rem;
          display: none;
          flex-direction: column;
          gap: 0.25rem;
          margin-bottom: 0.5rem;
        }

        .history-bar:hover .history-tooltip {
          display: flex;
        }

        .history-label {
          font-family: var(--font-josefin);
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .reading-level-badge {
            flex-direction: column;
            text-align: center;
            padding: 1.5rem;
          }

          .level-name {
            font-size: 1.5rem;
          }

          .detailed-stats-grid {
            grid-template-columns: 1fr;
          }

          .history-chart {
            height: 150px;
          }
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// CONSTELLATION VIEW
// ============================================================================
function ConstellationView({
  canvasRef,
  constellationStars,
  readingMood,
  progressPercentage,
  book
}) {
  const completedChapters = constellationStars.filter(s => s.completed).length;
  const totalChapters = constellationStars.length;

  return (
    <div className="constellation-view">
      {/* Canvas Container */}
      <div className="constellation-canvas-container">
        <canvas ref={canvasRef} className="constellation-canvas" />
        
        <div className="constellation-overlay">
          <div className="constellation-info">
            <Sparkles size={24} style={{ color: readingMood.color }} />
            <h3 className="constellation-title">Chapter Constellation</h3>
            <p className="constellation-description">
              Each star represents a chapter in your journey
            </p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="constellation-legend">
        <div className="legend-item">
          <div className="legend-star completed" style={{ background: readingMood.color }} />
          <span>Completed ({completedChapters})</span>
        </div>
        <div className="legend-item">
          <div className="legend-star incomplete" />
          <span>Remaining ({totalChapters - completedChapters})</span>
        </div>
      </div>

      {/* Chapter Progress */}
      <div className="chapter-progress-card">
        <div className="chapter-progress-header">
          <Star size={24} style={{ color: readingMood.color }} />
          <h3 className="chapter-progress-title">Chapter Progress</h3>
        </div>
        <div className="chapter-progress-bar">
          <div 
            className="chapter-progress-fill"
            style={{ 
              width: `${(completedChapters / totalChapters) * 100}%`,
              background: readingMood.color
            }}
          />
        </div>
        <p className="chapter-progress-text">
          {completedChapters} of {totalChapters} chapters completed
        </p>
      </div>

      {/* Fun Fact */}
      <div className="fun-fact-card" style={{ borderColor: readingMood.color }}>
        <Sparkles size={20} style={{ color: readingMood.color }} />
        <p className="fun-fact-text">
          {progressPercentage < 25 && "You're building momentum! Keep reading to see your constellation grow."}
          {progressPercentage >= 25 && progressPercentage < 50 && "Your constellation is taking shape! You're making great progress."}
          {progressPercentage >= 50 && progressPercentage < 75 && "Over halfway there! Your reading journey is truly stellar."}
          {progressPercentage >= 75 && progressPercentage < 100 && "Almost complete! Your constellation is nearly formed."}
          {progressPercentage === 100 && "Perfect constellation! You've completed this noble journey."}
        </p>
      </div>

      <style jsx>{`
        .constellation-view {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          align-items: center;
        }

        .constellation-canvas-container {
          position: relative;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.03) 0%, transparent 70%);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          overflow: hidden;
        }

        .constellation-canvas {
          width: 100%;
          height: 100%;
        }

        .constellation-overlay {
          position: absolute;
          top: 1rem;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
          pointer-events: none;
        }

        .constellation-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .constellation-title {
          font-family: var(--font-cinzel);
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .constellation-description {
          font-family: var(--font-josefin);
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .constellation-legend {
          display: flex;
          gap: 2rem;
          padding: 1rem 2rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-family: var(--font-josefin);
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .legend-star {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .legend-star.completed {
          box-shadow: 0 0 10px currentColor;
        }

        .legend-star.incomplete {
          background: rgba(255, 255, 255, 0.2);
        }

        .chapter-progress-card {
          width: 100%;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
        }

        .chapter-progress-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .chapter-progress-title {
          font-family: var(--font-cinzel);
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .chapter-progress-bar {
          width: 100%;
          height: 12px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 0.75rem;
        }

        .chapter-progress-fill {
          height: 100%;
          border-radius: 6px;
          transition: width 1s ease;
          box-shadow: 0 0 10px currentColor;
        }

        .chapter-progress-text {
          font-family: var(--font-josefin);
          font-size: 0.9rem;
          color: var(--text-secondary);
          text-align: center;
        }

        .fun-fact-card {
          width: 100%;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.25rem;
          background: rgba(255, 255, 255, 0.03);
          border: 2px solid;
          border-radius: 12px;
        }

        .fun-fact-text {
          font-family: var(--font-josefin);
          font-size: 0.95rem;
          color: var(--text-primary);
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .constellation-canvas-container {
            width: 100%;
            max-width: 350px;
            height: 350px;
          }

          .constellation-legend {
            flex-direction: column;
            gap: 1rem;
          }
        }

        @media (max-width: 480px) {
          .constellation-canvas-container {
            max-width: 300px;
            height: 300px;
          }
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// STAT ITEM COMPONENT
// ============================================================================
function StatItem({ icon, label, value, color }) {
  return (
    <div className="stat-item">
      <div className="stat-item-icon" style={{ color }}>
        {icon}
      </div>
      <div className="stat-item-content">
        <span className="stat-item-value">{value}</span>
        <span className="stat-item-label">{label}</span>
      </div>

      <style jsx>{`
        .stat-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .stat-item:hover {
          background: rgba(255, 255, 255, 0.05);
          transform: translateY(-2px);
        }

        .stat-item-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
        }

        .stat-item-content {
          display: flex;
          flex-direction: column;
        }

        .stat-item-value {
          font-family: var(--font-cinzel);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .stat-item-label {
          font-family: var(--font-josefin);
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// DETAILED STAT CARD COMPONENT
// ============================================================================
function DetailedStatCard({ icon, label, value, sublabel, color }) {
  return (
    <div className="detailed-stat-card">
      <div className="detailed-stat-icon" style={{ color }}>
        {icon}
      </div>
      <div className="detailed-stat-content">
        <span className="detailed-stat-label">{label}</span>
        <span className="detailed-stat-value" style={{ color }}>{value}</span>
        <span className="detailed-stat-sublabel">{sublabel}</span>
      </div>

      <style jsx>{`
        .detailed-stat-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .detailed-stat-card:hover {
          background: rgba(255, 255, 255, 0.05);
          transform: translateY(-2px);
        }

        .detailed-stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 50%;
        }

        .detailed-stat-content {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .detailed-stat-label {
          font-family: var(--font-josefin);
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .detailed-stat-value {
          font-family: var(--font-cinzel);
          font-size: 1.75rem;
          font-weight: 700;
        }

        .detailed-stat-sublabel {
          font-family: var(--font-josefin);
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}