// ============================================================================
// THE CONCLAVE REALM - TOURNAMENT BRACKET COMPONENT
// Location: /src/components/pathways/tournaments/TournamentBracket.jsx
// ============================================================================
// Purpose: Interactive tournament bracket visualization with animations
// Uses: GlassCard, Canvas rendering for bracket lines
// ============================================================================

'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Trophy,
  Users,
  Clock,
  Play,
  CheckCircle,
  Circle,
  Crown,
  Medal,
  Award,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Internal components
import GlassCard from '@/components/ui/GlassCard';
import LuxuryButton, { GamingButton } from '@/components/ui/LuxuryButton';
import { useAppContext } from '@/contexts/AppProvider';
import { notify } from '@/components/interactive/NotificationCenter';

/**
 * @component TournamentBracket
 * @description Interactive bracket visualization for tournaments
 * 
 * @param {Object} tournament - Tournament data
 * @param {Array} matches - Array of match objects
 * @param {string} format - 'single-elimination'|'double-elimination'|'swiss'|'round-robin'
 * @param {Function} onMatchClick - Callback when match is clicked
 * @param {boolean} showScores - Show match scores
 * @param {boolean} interactive - Enable interactive features
 * @param {string} pathway - Pathway theme
 */
export default function TournamentBracket({
  tournament,
  matches = [],
  format = 'single-elimination',
  onMatchClick,
  showScores = true,
  interactive = true,
  pathway = 'gaming'
}) {
  // ============================================================================
  // STATE & REFS
  // ============================================================================
  const { playClick, playHover, animationsEnabled } = useAppContext();
  const canvasRef = useRef(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [bracketData, setBracketData] = useState([]);
  const [viewMode, setViewMode] = useState('bracket'); // bracket | list

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Generate bracket structure from matches
  useEffect(() => {
    if (!matches || matches.length === 0) {
      // Generate mock bracket for demonstration
      generateMockBracket();
      return;
    }

    // Organize matches into rounds
    const rounds = organizeBracket(matches);
    setBracketData(rounds);
  }, [matches, tournament]);

  // Draw connecting lines on canvas
  useEffect(() => {
    if (!canvasRef.current || viewMode !== 'bracket' || !animationsEnabled) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      drawBracketLines();
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [bracketData, viewMode, animationsEnabled]);

  // ============================================================================
  // BRACKET GENERATION
  // ============================================================================

  const generateMockBracket = () => {
    const participants = tournament?.maxParticipants || 16;
    const rounds = Math.log2(participants);

    const mockData = [];
    
    for (let round = 0; round < rounds; round++) {
      const matchesInRound = participants / Math.pow(2, round + 1);
      const roundMatches = [];

      for (let match = 0; match < matchesInRound; match++) {
        roundMatches.push({
          id: `r${round}-m${match}`,
          round: round,
          position: match,
          player1: {
            name: round === 0 ? `Player ${match * 2 + 1}` : null,
            score: round === 0 ? Math.floor(Math.random() * 3) : null,
            avatar: `/Assets/Images/avatars/default-${(match * 2) % 10}.jpg`
          },
          player2: {
            name: round === 0 ? `Player ${match * 2 + 2}` : null,
            score: round === 0 ? Math.floor(Math.random() * 3) : null,
            avatar: `/Assets/Images/avatars/default-${(match * 2 + 1) % 10}.jpg`
          },
          winner: round === 0 ? (Math.random() > 0.5 ? 'player1' : 'player2') : null,
          status: round === 0 ? 'completed' : (round === 1 ? 'ongoing' : 'upcoming'),
          scheduledTime: new Date(Date.now() + (round * 24 * 60 * 60 * 1000)).toISOString()
        });
      }

      mockData.push({
        round: round,
        name: round === rounds - 1 ? 'Finals' : 
              round === rounds - 2 ? 'Semi Finals' : 
              round === rounds - 3 ? 'Quarter Finals' : 
              `Round ${round + 1}`,
        matches: roundMatches
      });
    }

    setBracketData(mockData);
  };

  const organizeBracket = (matchList) => {
    // Group matches by round
    const roundsMap = {};
    
    matchList.forEach(match => {
      const round = match.round || 0;
      if (!roundsMap[round]) {
        roundsMap[round] = [];
      }
      roundsMap[round].push(match);
    });

    // Convert to array and sort
    return Object.keys(roundsMap)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(roundNum => ({
        round: parseInt(roundNum),
        name: getRoundName(parseInt(roundNum), Object.keys(roundsMap).length),
        matches: roundsMap[roundNum].sort((a, b) => (a.position || 0) - (b.position || 0))
      }));
  };

  const getRoundName = (round, totalRounds) => {
    if (round === totalRounds - 1) return 'Finals';
    if (round === totalRounds - 2) return 'Semi Finals';
    if (round === totalRounds - 3) return 'Quarter Finals';
    return `Round ${round + 1}`;
  };

  // ============================================================================
  // CANVAS DRAWING
  // ============================================================================

  const drawBracketLines = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw lines connecting matches
    ctx.strokeStyle = 'rgba(0, 191, 255, 0.3)';
    ctx.lineWidth = 2;

    bracketData.forEach((round, roundIndex) => {
      if (roundIndex === bracketData.length - 1) return; // Skip last round

      const nextRound = bracketData[roundIndex + 1];
      const roundWidth = rect.width / bracketData.length;
      const currentX = (roundIndex + 1) * roundWidth;
      const nextX = (roundIndex + 2) * roundWidth;

      round.matches.forEach((match, matchIndex) => {
        const matchHeight = rect.height / round.matches.length;
        const currentY = (matchIndex + 0.5) * matchHeight;
        const nextMatchIndex = Math.floor(matchIndex / 2);
        const nextY = (nextMatchIndex + 0.5) * (rect.height / nextRound.matches.length);

        // Draw horizontal line
        ctx.beginPath();
        ctx.moveTo(currentX, currentY);
        ctx.lineTo(currentX + roundWidth / 2, currentY);
        
        // Draw vertical connector
        if (matchIndex % 2 === 0 && matchIndex + 1 < round.matches.length) {
          const nextMatchY = (matchIndex + 1.5) * matchHeight;
          ctx.lineTo(currentX + roundWidth / 2, nextMatchY);
        }
        
        // Draw to next round
        ctx.lineTo(nextX - roundWidth / 2, nextY);
        ctx.lineTo(nextX, nextY);
        ctx.stroke();
      });
    });
  };

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleMatchClick = (match) => {
    playClick();
    setSelectedMatch(match);
    
    if (onMatchClick) {
      onMatchClick(match);
    }
  };

  const handleRoundChange = (direction) => {
    playClick();
    
    if (direction === 'prev' && currentRound > 0) {
      setCurrentRound(currentRound - 1);
    } else if (direction === 'next' && currentRound < bracketData.length - 1) {
      setCurrentRound(currentRound + 1);
    }
  };

  const handleViewModeToggle = () => {
    playClick();
    setViewMode(viewMode === 'bracket' ? 'list' : 'bracket');
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderMatch = (match, roundIndex) => {
    const isSelected = selectedMatch?.id === match.id;
    const isWinner = (player) => match.winner === player;
    
    return (
      <GlassCard
        key={match.id}
        className={`bracket-match bracket-match-${match.status} ${isSelected ? 'match-selected' : ''}`}
        onClick={() => interactive && handleMatchClick(match)}
        onMouseEnter={playHover}
      >
        {/* Match Status Icon */}
        <div className="match-status-icon">
          {match.status === 'completed' && <CheckCircle size={16} className="status-completed" />}
          {match.status === 'ongoing' && <Play size={16} className="status-ongoing" />}
          {match.status === 'upcoming' && <Clock size={16} className="status-upcoming" />}
        </div>

        {/* Player 1 */}
        <div className={`match-player ${isWinner('player1') ? 'player-winner' : ''}`}>
          <div className="player-info">
            <div className="player-avatar">
              {match.player1?.avatar ? (
                <img src={match.player1.avatar} alt={match.player1.name || 'TBD'} />
              ) : (
                <Users size={16} />
              )}
            </div>
            <span className="text-body-sm player-name">
              {match.player1?.name || 'TBD'}
            </span>
          </div>
          {showScores && match.player1?.score !== null && (
            <span className="text-h4 player-score">{match.player1.score}</span>
          )}
          {isWinner('player1') && <Crown size={14} className="winner-crown" />}
        </div>

        {/* VS Divider */}
        <div className="match-divider">
          <span className="text-label-xs">VS</span>
        </div>

        {/* Player 2 */}
        <div className={`match-player ${isWinner('player2') ? 'player-winner' : ''}`}>
          <div className="player-info">
            <div className="player-avatar">
              {match.player2?.avatar ? (
                <img src={match.player2.avatar} alt={match.player2.name || 'TBD'} />
              ) : (
                <Users size={16} />
              )}
            </div>
            <span className="text-body-sm player-name">
              {match.player2?.name || 'TBD'}
            </span>
          </div>
          {showScores && match.player2?.score !== null && (
            <span className="text-h4 player-score">{match.player2.score}</span>
          )}
          {isWinner('player2') && <Crown size={14} className="winner-crown" />}
        </div>

        {/* Match Time */}
        {match.scheduledTime && match.status === 'upcoming' && (
          <div className="match-time">
            <Clock size={12} />
            <span className="text-label-xs">
              {new Date(match.scheduledTime).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        )}
      </GlassCard>
    );
  };

  const renderRound = (roundData, index) => {
    return (
      <div key={roundData.round} className="bracket-round">
        <div className="round-header">
          <h4 className="text-h4 round-name">{roundData.name}</h4>
          <span className="text-label-sm text-secondary">
            {roundData.matches.length} {roundData.matches.length === 1 ? 'Match' : 'Matches'}
          </span>
        </div>

        <div className="round-matches">
          {roundData.matches.map(match => renderMatch(match, index))}
        </div>
      </div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!bracketData || bracketData.length === 0) {
    return (
      <GlassCard className="tournament-bracket bracket-empty">
        <div className="empty-state">
          <Trophy size={64} className="empty-icon" />
          <h3 className="text-h3">No Bracket Available</h3>
          <p className="text-body text-secondary">
            The tournament bracket will be generated once registration closes.
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="tournament-bracket-container">
      {/* Header */}
      <div className="bracket-header">
        <div className="bracket-title-section">
          <Trophy className="bracket-icon" />
          <div>
            <h3 className="text-h3">{tournament?.name || 'Tournament Bracket'}</h3>
            <p className="text-body-sm text-secondary">
              {format.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Format
            </p>
          </div>
        </div>

        <div className="bracket-controls">
          <GamingButton
            variant="secondary"
            size="small"
            onClick={handleViewModeToggle}
          >
            {viewMode === 'bracket' ? 'List View' : 'Bracket View'}
          </GamingButton>
        </div>
      </div>

      {/* Bracket View */}
      {viewMode === 'bracket' && (
        <div className="bracket-view">
          <canvas ref={canvasRef} className="bracket-canvas" />
          
          <div className="bracket-rounds">
            {bracketData.map((roundData, index) => renderRound(roundData, index))}
          </div>

          {/* Winner Display */}
          {bracketData[bracketData.length - 1]?.matches[0]?.winner && (
            <div className="bracket-winner">
              <GlassCard className="winner-card">
                <div className="winner-header">
                  <Crown size={32} className="winner-crown-large" />
                  <h3 className="text-h3">Tournament Champion</h3>
                </div>
                <div className="winner-content">
                  <div className="winner-avatar-large">
                    <img 
                      src={bracketData[bracketData.length - 1].matches[0][
                        bracketData[bracketData.length - 1].matches[0].winner
                      ]?.avatar || '/Assets/Images/avatars/default.jpg'} 
                      alt="Champion"
                    />
                  </div>
                  <h2 className="text-display winner-name">
                    {bracketData[bracketData.length - 1].matches[0][
                      bracketData[bracketData.length - 1].matches[0].winner
                    ]?.name || 'Champion'}
                  </h2>
                  <Trophy size={24} className="trophy-icon" />
                </div>
              </GlassCard>
            </div>
          )}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bracket-list-view">
          <div className="list-navigation">
            <button
              className="nav-button"
              onClick={() => handleRoundChange('prev')}
              disabled={currentRound === 0}
            >
              <ChevronLeft size={20} />
            </button>

            <div className="round-selector">
              {bracketData.map((round, index) => (
                <button
                  key={round.round}
                  className={`round-tab ${currentRound === index ? 'round-tab-active' : ''}`}
                  onClick={() => {
                    playClick();
                    setCurrentRound(index);
                  }}
                >
                  {round.name}
                </button>
              ))}
            </div>

            <button
              className="nav-button"
              onClick={() => handleRoundChange('next')}
              disabled={currentRound === bracketData.length - 1}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="list-matches">
            {bracketData[currentRound]?.matches.map(match => renderMatch(match, currentRound))}
          </div>
        </div>
      )}

      {/* Styles */}
      <style jsx>{`
        .tournament-bracket-container {
          width: 100%;
        }

        /* Header */
        .bracket-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .bracket-title-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .bracket-icon {
          color: var(--gaming-primary);
          width: 40px;
          height: 40px;
        }

        .bracket-controls {
          display: flex;
          gap: 1rem;
        }

        /* Bracket View */
        .bracket-view {
          position: relative;
          min-height: 600px;
        }

        .bracket-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        .bracket-rounds {
          display: flex;
          gap: 2rem;
          overflow-x: auto;
          padding: 2rem 0;
          position: relative;
          z-index: 1;
        }

        .bracket-round {
          flex-shrink: 0;
          min-width: 280px;
        }

        .round-header {
          margin-bottom: 1.5rem;
          text-align: center;
          padding: 0.75rem;
          background: rgba(0, 191, 255, 0.1);
          border-radius: 12px;
          border: 1px solid rgba(0, 191, 255, 0.3);
        }

        .round-name {
          color: var(--gaming-primary);
          margin-bottom: 0.25rem;
        }

        .round-matches {
          display: flex;
          flex-direction: column;
          gap: 3rem;
        }

        /* Match Card */
        .bracket-match {
          position: relative;
          padding: 1rem;
          cursor: pointer;
          transition: all 0.3s;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .bracket-match:hover {
          border-color: var(--gaming-primary);
          transform: translateX(4px);
        }

        .bracket-match-completed {
          opacity: 0.9;
        }

        .bracket-match-ongoing {
          border-color: var(--gaming-primary);
          box-shadow: 0 0 20px rgba(0, 191, 255, 0.3);
        }

        .bracket-match-upcoming {
          opacity: 0.7;
        }

        .match-selected {
          border-color: var(--cns-gold);
          box-shadow: 0 0 30px rgba(255, 215, 0, 0.4);
        }

        .match-status-icon {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
        }

        .status-completed {
          color: var(--success-color);
        }

        .status-ongoing {
          color: var(--gaming-primary);
          animation: pulse 2s infinite;
        }

        .status-upcoming {
          color: var(--text-secondary);
        }

        /* Players */
        .match-player {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.03);
          margin-bottom: 0.5rem;
          position: relative;
        }

        .player-winner {
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05));
          border: 1px solid var(--cns-gold);
        }

        .player-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
        }

        .player-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .player-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .player-name {
          color: var(--text-primary);
          font-weight: 500;
        }

        .player-score {
          color: var(--gaming-primary);
          font-weight: 700;
          min-width: 30px;
          text-align: center;
        }

        .winner-crown {
          color: var(--cns-gold);
          margin-left: 0.5rem;
        }

        /* Divider */
        .match-divider {
          text-align: center;
          margin: 0.25rem 0;
          color: var(--text-secondary);
        }

        /* Match Time */
        .match-time {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          margin-top: 0.5rem;
          padding-top: 0.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-secondary);
        }

        /* Winner Display */
        .bracket-winner {
          margin-top: 3rem;
          display: flex;
          justify-content: center;
        }

        .winner-card {
          max-width: 400px;
          text-align: center;
          padding: 2rem;
        }

        .winner-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .winner-crown-large {
          color: var(--cns-gold);
          animation: float 3s ease-in-out infinite;
        }

        .winner-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        .winner-avatar-large {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          overflow: hidden;
          border: 4px solid var(--cns-gold);
          box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
        }

        .winner-avatar-large img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .winner-name {
          color: var(--cns-gold);
          text-shadow: 0 2px 20px rgba(255, 215, 0, 0.5);
        }

        .trophy-icon {
          color: var(--cns-gold);
        }

        /* List View */
        .bracket-list-view {
          padding: 2rem 0;
        }

        .list-navigation {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
          overflow-x: auto;
        }

        .nav-button {
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .nav-button:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--gaming-primary);
        }

        .nav-button:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .round-selector {
          display: flex;
          gap: 0.5rem;
          flex: 1;
          overflow-x: auto;
        }

        .round-tab {
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: var(--text-secondary);
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }

        .round-tab:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .round-tab-active {
          background: var(--gaming-primary);
          color: var(--bg-primary);
          border-color: var(--gaming-primary);
        }

        .list-matches {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        /* Empty State */
        .bracket-empty {
          padding: 4rem 2rem;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          text-align: center;
        }

        .empty-icon {
          color: var(--text-secondary);
          opacity: 0.5;
        }

        /* Animations */
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .bracket-rounds {
            gap: 1.5rem;
          }

          .bracket-round {
            min-width: 240px;
          }
        }

        @media (max-width: 768px) {
          .bracket-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .list-navigation {
            flex-direction: column;
            align-items: stretch;
          }

          .round-selector {
            overflow-x: auto;
          }

          .list-matches {
            grid-template-columns: 1fr;
          }

          .bracket-view {
            min-height: 400px;
          }
        }
      `}</style>
    </div>
  );
}