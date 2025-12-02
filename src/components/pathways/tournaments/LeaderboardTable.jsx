// ============================================================================
// THE CONCLAVE REALM - LEADERBOARD TABLE COMPONENT
// Location: /src/components/pathways/tournaments/LeaderboardTable.jsx
// ============================================================================
// Purpose: Competitive leaderboard with rankings, stats, and animations
// Uses: GlassCard, useScrollReveal for entry animations
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Medal,
  Crown,
  Award,
  Star,
  Target,
  Zap,
  Flame,
  ChevronUp,
  ChevronDown,
  Search,
  Filter,
  Download
} from 'lucide-react';

// Internal components
import GlassCard from '@/components/ui/GlassCard';
import LuxuryButton, { GamingButton } from '@/components/ui/LuxuryButton';
import { useAppContext } from '@/contexts/AppProvider';
import { notify } from '@/components/interactive/NotificationCenter';
import useScrollReveal from '@/hooks/useScrollReveal';

/**
 * @component LeaderboardTable
 * @description Luxury leaderboard with sorting, filtering, and animations
 * 
 * @param {Array} players - Array of player objects
 * @param {string} type - 'tournament'|'global'|'seasonal'
 * @param {string} timeframe - 'daily'|'weekly'|'monthly'|'all-time'
 * @param {Function} onPlayerClick - Callback when player is clicked
 * @param {boolean} showStats - Show detailed statistics
 * @param {boolean} showBadges - Show player badges
 * @param {number} highlightRank - Highlight specific rank
 * @param {string} pathway - Pathway theme
 */
export default function LeaderboardTable({
  players = [],
  type = 'global',
  timeframe = 'all-time',
  onPlayerClick,
  showStats = true,
  showBadges = true,
  highlightRank = null,
  pathway = 'gaming'
}) {
  // ============================================================================
  // STATE & HOOKS
  // ============================================================================
  const { playClick, playHover, animationsEnabled, user } = useAppContext();
  
  const [sortBy, setSortBy] = useState('rank');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBadge, setFilterBadge] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // table | compact | detailed
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  
  // Scroll reveal for table rows
  const tableRef = useScrollReveal({
    threshold: 0.1,
    animationType: 'fade-slide-up',
    stagger: true,
    staggerDelay: 50,
    disabled: !animationsEnabled
  });

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Filter and sort players
  useEffect(() => {
    let result = [...players];

    // Search filter
    if (searchQuery) {
      result = result.filter(player =>
        player.player?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.userId?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Badge filter
    if (filterBadge !== 'all') {
      result = result.filter(player =>
        player.badges && player.badges.includes(filterBadge)
      );
    }

    // Sorting
    result.sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case 'rank':
          aVal = a.rank;
          bVal = b.rank;
          break;
        case 'points':
          aVal = a.points;
          bVal = b.points;
          break;
        case 'wins':
          aVal = a.wins;
          bVal = b.wins;
          break;
        case 'winRate':
          aVal = a.winRate;
          bVal = b.winRate;
          break;
        case 'earnings':
          aVal = parseFloat(a.earnings?.replace(/[$,]/g, '') || 0);
          bVal = parseFloat(b.earnings?.replace(/[$,]/g, '') || 0);
          break;
        default:
          return 0;
      }

      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    setFilteredPlayers(result);
  }, [players, searchQuery, filterBadge, sortBy, sortOrder]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSort = (column) => {
    playClick();
    
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const handlePlayerClick = (player) => {
    playClick();
    
    if (onPlayerClick) {
      onPlayerClick(player);
    } else {
      notify.info(`Viewing ${player.player}'s profile`, { duration: 2000 });
    }
  };

  const handleExport = () => {
    playClick();
    
    try {
      const csvContent = [
        ['Rank', 'Player', 'Points', 'Wins', 'Losses', 'Win Rate', 'Earnings'],
        ...filteredPlayers.map(p => [
          p.rank,
          p.player,
          p.points,
          p.wins,
          p.losses,
          `${p.winRate}%`,
          p.earnings
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leaderboard-${timeframe}-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      notify.success('Leaderboard exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      notify.error('Failed to export leaderboard');
    }
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="rank-icon rank-gold" size={24} />;
    if (rank === 2) return <Medal className="rank-icon rank-silver" size={24} />;
    if (rank === 3) return <Medal className="rank-icon rank-bronze" size={24} />;
    return <span className="rank-number text-h3">{rank}</span>;
  };

  const getBadgeIcon = (badge) => {
    const icons = {
      'Champion': <Trophy size={16} />,
      'MVP': <Star size={16} />,
      'Veteran': <Award size={16} />,
      'Sharpshooter': <Target size={16} />,
      'Clutch Master': <Zap size={16} />,
      'Comeback King': <TrendingUp size={16} />,
      'Strategist': <Flame size={16} />
    };
    
    return icons[badge] || <Award size={16} />;
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!players || players.length === 0) {
    return (
      <GlassCard className="leaderboard-empty">
        <div className="empty-state">
          <Trophy size={64} className="empty-icon" />
          <h3 className="text-h3">No Leaderboard Data</h3>
          <p className="text-body text-secondary">
            Compete in tournaments to appear on the leaderboard!
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="leaderboard-container">
      {/* Header */}
      <div className="leaderboard-header">
        <div className="header-title">
          <Trophy className="header-icon" />
          <div>
            <h3 className="text-h3">Leaderboard</h3>
            <p className="text-body-sm text-secondary">
              {timeframe.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Rankings
            </p>
          </div>
        </div>

        <div className="header-controls">
          {/* Search */}
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input text-body"
            />
          </div>

          {/* Badge Filter */}
          {showBadges && (
            <select
              value={filterBadge}
              onChange={(e) => {
                playClick();
                setFilterBadge(e.target.value);
              }}
              className="badge-filter text-body"
            >
              <option value="all">All Badges</option>
              <option value="Champion">Champion</option>
              <option value="MVP">MVP</option>
              <option value="Veteran">Veteran</option>
              <option value="Sharpshooter">Sharpshooter</option>
            </select>
          )}

          {/* Export Button */}
          <GamingButton
            variant="secondary"
            size="small"
            onClick={handleExport}
          >
            <Download size={16} />
            Export
          </GamingButton>
        </div>
      </div>

      {/* Table */}
      <GlassCard className="leaderboard-table-card" ref={tableRef}>
        <div className="table-wrapper">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th className="col-rank">
                  <button className="sort-button" onClick={() => handleSort('rank')}>
                    Rank {getSortIcon('rank')}
                  </button>
                </th>
                <th className="col-player">Player</th>
                {showStats && (
                  <>
                    <th className="col-stat">
                      <button className="sort-button" onClick={() => handleSort('points')}>
                        Points {getSortIcon('points')}
                      </button>
                    </th>
                    <th className="col-stat">
                      <button className="sort-button" onClick={() => handleSort('wins')}>
                        Wins {getSortIcon('wins')}
                      </button>
                    </th>
                    <th className="col-stat">
                      <button className="sort-button" onClick={() => handleSort('winRate')}>
                        Win Rate {getSortIcon('winRate')}
                      </button>
                    </th>
                    <th className="col-stat">
                      <button className="sort-button" onClick={() => handleSort('earnings')}>
                        Earnings {getSortIcon('earnings')}
                      </button>
                    </th>
                  </>
                )}
                {showBadges && <th className="col-badges">Badges</th>}
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.map((player, index) => (
                <tr
                  key={player.userId || index}
                  className={`
                    leaderboard-row 
                    ${player.rank === highlightRank ? 'row-highlighted' : ''}
                    ${player.rank <= 3 ? `row-top-${player.rank}` : ''}
                    ${user?.id === player.userId ? 'row-current-user' : ''}
                  `}
                  onClick={() => handlePlayerClick(player)}
                  onMouseEnter={playHover}
                >
                  {/* Rank */}
                  <td className="col-rank">
                    <div className="rank-cell">
                      {getRankIcon(player.rank)}
                    </div>
                  </td>

                  {/* Player */}
                  <td className="col-player">
                    <div className="player-cell">
                      <div className="player-avatar">
                        {player.avatar ? (
                          <img src={player.avatar} alt={player.player} />
                        ) : (
                          <div className="avatar-placeholder">{player.player?.charAt(0) || '?'}</div>
                        )}
                      </div>
                      <div className="player-info">
                        <span className="text-body player-name">{player.player}</span>
                        {player.mainGames && player.mainGames.length > 0 && (
                          <span className="text-label-xs text-secondary">
                            {player.mainGames[0]}
                          </span>
                        )}
                      </div>
                      {user?.id === player.userId && (
                        <span className="you-badge text-label-xs">You</span>
                      )}
                    </div>
                  </td>

                  {/* Stats */}
                  {showStats && (
                    <>
                      <td className="col-stat">
                        <span className="text-h4 stat-value">{player.points?.toLocaleString()}</span>
                      </td>
                      <td className="col-stat">
                        <span className="text-body stat-value">{player.wins}</span>
                        <span className="text-label-xs text-secondary">/ {player.losses}L</span>
                      </td>
                      <td className="col-stat">
                        <div className="win-rate-cell">
                          <span className="text-h4 stat-value">{player.winRate}%</span>
                          <div className="win-rate-bar">
                            <div 
                              className="win-rate-fill"
                              style={{ width: `${player.winRate}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="col-stat">
                        <span className="text-h4 stat-value earnings-value">{player.earnings}</span>
                      </td>
                    </>
                  )}

                  {/* Badges */}
                  {showBadges && (
                    <td className="col-badges">
                      <div className="badges-cell">
                        {player.badges?.map((badge, idx) => (
                          <div
                            key={idx}
                            className="badge-icon"
                            title={badge}
                          >
                            {getBadgeIcon(badge)}
                          </div>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Stats Footer */}
        <div className="table-footer">
          <span className="text-body-sm text-secondary">
            Showing {filteredPlayers.length} of {players.length} players
          </span>
          {searchQuery && (
            <button
              className="clear-search text-body-sm"
              onClick={() => {
                playClick();
                setSearchQuery('');
              }}
            >
              Clear Search
            </button>
          )}
        </div>
      </GlassCard>

      {/* Styles */}
      <style jsx>{`
        .leaderboard-container {
          width: 100%;
        }

        /* Header */
        .leaderboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-icon {
          color: var(--gaming-primary);
          width: 40px;
          height: 40px;
        }

        .header-controls {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          align-items: center;
        }

        /* Search Box */
        .search-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          transition: all 0.2s;
        }

        .search-box:focus-within {
          border-color: var(--gaming-primary);
          box-shadow: 0 0 20px rgba(0, 191, 255, 0.2);
        }

        .search-box svg {
          color: var(--text-secondary);
        }

        .search-input {
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          width: 200px;
        }

        /* Badge Filter */
        .badge-filter {
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .badge-filter:hover {
          border-color: var(--gaming-primary);
        }

        /* Table */
        .leaderboard-table-card {
          padding: 0;
          overflow: hidden;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .leaderboard-table {
          width: 100%;
          border-collapse: collapse;
        }

        /* Table Header */
        thead {
          background: rgba(255, 255, 255, 0.03);
          border-bottom: 2px solid rgba(0, 191, 255, 0.3);
        }

        thead th {
          padding: 1.5rem 1rem;
          text-align: left;
          color: var(--gaming-primary);
          font-weight: 600;
          font-family: var(--font-orbitron);
          text-transform: uppercase;
          font-size: 0.875rem;
          letter-spacing: 0.05em;
        }

        .sort-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          font: inherit;
          transition: all 0.2s;
        }

        .sort-button:hover {
          color: var(--cns-gold);
        }

        /* Table Body */
        .leaderboard-row {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          cursor: pointer;
          transition: all 0.2s;
        }

        .leaderboard-row:hover {
          background: rgba(0, 191, 255, 0.05);
        }

        .leaderboard-row td {
          padding: 1.25rem 1rem;
        }

        /* Top 3 Rows */
        .row-top-1 {
          background: linear-gradient(90deg, rgba(255, 215, 0, 0.1), transparent);
          border-left: 4px solid var(--cns-gold);
        }

        .row-top-2 {
          background: linear-gradient(90deg, rgba(192, 192, 192, 0.1), transparent);
          border-left: 4px solid #C0C0C0;
        }

        .row-top-3 {
          background: linear-gradient(90deg, rgba(205, 127, 50, 0.1), transparent);
          border-left: 4px solid #CD7F32;
        }

        /* Current User */
        .row-current-user {
          background: linear-gradient(90deg, rgba(0, 191, 255, 0.15), transparent);
          border-left: 4px solid var(--gaming-primary);
        }

        /* Highlighted Row */
        .row-highlighted {
          background: linear-gradient(90deg, rgba(255, 215, 0, 0.2), transparent);
          border: 2px solid var(--cns-gold);
        }

        /* Rank Cell */
        .rank-cell {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 60px;
        }

        .rank-icon {
          animation: float 3s ease-in-out infinite;
        }

        .rank-gold {
          color: var(--cns-gold);
          filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5));
        }

        .rank-silver {
          color: #C0C0C0;
          filter: drop-shadow(0 0 10px rgba(192, 192, 192, 0.5));
        }

        .rank-bronze {
          color: #CD7F32;
          filter: drop-shadow(0 0 10px rgba(205, 127, 50, 0.5));
        }

        .rank-number {
          color: var(--text-secondary);
          font-family: var(--font-orbitron);
        }

        /* Player Cell */
        .player-cell {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .player-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid rgba(255, 255, 255, 0.1);
          flex-shrink: 0;
        }

        .player-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--gaming-primary);
          color: var(--bg-primary);
          font-weight: 700;
          font-size: 1.25rem;
        }

        .player-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .player-name {
          font-weight: 600;
          color: var(--text-primary);
        }

        .you-badge {
          padding: 0.25rem 0.75rem;
          background: var(--gaming-primary);
          color: var(--bg-primary);
          border-radius: 12px;
          font-weight: 600;
        }

        /* Stats */
        .col-stat {
          text-align: center;
        }

        .stat-value {
          color: var(--text-primary);
          font-family: var(--font-orbitron);
        }

        .earnings-value {
          color: var(--cns-gold);
        }

        /* Win Rate */
        .win-rate-cell {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .win-rate-bar {
          width: 100px;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
        }

        .win-rate-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--gaming-primary), var(--gaming-secondary));
          transition: width 0.5s ease;
        }

        /* Badges */
        .badges-cell {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
        }

        .badge-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: var(--gaming-primary);
          transition: all 0.2s;
        }

        .badge-icon:hover {
          transform: scale(1.2);
          background: rgba(0, 191, 255, 0.2);
        }

        /* Footer */
        .table-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .clear-search {
          background: none;
          border: none;
          color: var(--gaming-primary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .clear-search:hover {
          color: var(--cns-gold);
          text-decoration: underline;
        }

        /* Empty State */
        .leaderboard-empty {
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
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .leaderboard-header {
            flex-direction: column;
            align-items: stretch;
          }

          .header-controls {
            flex-direction: column;
          }

          .search-input {
            width: 100%;
          }
        }

        @media (max-width: 768px) {
          .col-stat {
            display: none;
          }

          .col-badges {
            display: none;
          }

          .player-avatar {
            width: 40px;
            height: 40px;
          }
        }
      `}</style>
    </div>
  );
}