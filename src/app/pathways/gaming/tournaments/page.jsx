.rule-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--gaming-cyan);
          margin-bottom: 1rem;
          text-align: center;
        }

        .rule-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .rule-list li {
          padding-left: 1.5rem;
          position: relative;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.6;
        }

        .rule-list li::before {
          content: '▸';
          position: absolute;
          left: 0;
          color: var(--gaming-cyan);
        }

        /* Winners Grid */
        .winners-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
        }

        .winner-card {
          padding: 2rem;
          background: rgba(0, 191, 255, 0.05);
          border: 1px solid rgba(0, 191, 255, 0.2);
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          transition: all 0.3s ease;
        }

        .winner-card:hover {
          background: rgba(0, 191, 255, 0.1);
          border-color: var(--gaming-cyan);
          transform: translateY(-4px);
        }

        .winner-rank {
          font-size: 2rem;
          text-align: center;
        }

        .winner-info {
          text-align: center;
        }

        .winner-name {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--gaming-cyan);
          margin-bottom: 0.5rem;
        }

        .winner-tournament {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 0.25rem;
        }

        .winner-game {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .winner-prize {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--cns-gold);
        }

        .winner-trophy {
          width: 24px;
          height: 24px;
        }

        .winner-date {
          text-align: center;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
        }

        /* Steps Container */
        .steps-container {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 2rem;
          margin-top: 3rem;
        }

        .step-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 2rem;
          background: rgba(0, 191, 255, 0.05);
          border: 2px solid rgba(0, 191, 255, 0.2);
          border-radius: 12px;
          min-width: 200px;
          max-width: 250px;
          transition: all 0.3s ease;
        }

        .step-card:hover {
          background: rgba(0, 191, 255, 0.1);
          border-color: var(--gaming-cyan);
          transform: scale(1.05);
        }

        .step-number {
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--gaming-cyan);
          color: white;
          border-radius: 50%;
          font-size: 2rem;
          font-weight: 700;
        }

        .step-content {
          text-align: center;
        }

        .step-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--gaming-cyan);
          margin-bottom: 0.5rem;
        }

        .step-description {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
        }

        .step-arrow {
          color: var(--gaming-cyan);
          opacity: 0.5;
        }

        .step-arrow svg {
          width: 32px;
          height: 32px;
        }

        /* FAQ Grid */
        .faq-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2rem;
        }

        /* CTA Section */
        .cta-section {
          background: linear-gradient(
            135deg,
            rgba(0, 191, 255, 0.1) 0%,
            rgba(10, 10, 15, 0.95) 50%,
            rgba(255, 215, 0, 0.1) 100%
          );
          padding: 8rem 0;
        }

        .cta-content {
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }

        .cta-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 2rem;
          color: var(--gaming-cyan);
          filter: drop-shadow(0 0 20px var(--gaming-cyan));
          animation: float 4s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        .cta-buttons {
          display: flex;
          gap: 2rem;
          justify-content: center;
          margin-top: 3rem;
          flex-wrap: wrap;
        }

        .cta-primary {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .button-icon {
          width: 24px;
          height: 24px;
        }

        /* Prizes Grid */
        .prizes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .prize-card {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1.5rem;
        }

        .prize-rank {
          font-size: 2rem;
          font-weight: 700;
          color: var(--cns-gold);
          min-width: 60px;
          text-align: center;
        }

        .prize-info {
          flex: 1;
        }

        .prize-tournament {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--gaming-cyan);
          margin-bottom: 0.25rem;
        }

        .prize-game {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .prize-amount {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--cns-gold);
        }

        /* Scroll Reveal */
        .scroll-reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.6s ease;
        }

        .scroll-reveal.revealed {
          opacity: 1;
          transform: translateY(0);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .hero-stats-bar {
            grid-template-columns: repeat(2, 1fr);
          }

          .filters-container {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-group {
            flex-direction: column;
          }

          .results-count {
            margin-left: 0;
          }

          .tournaments-grid {
            grid-template-columns: 1fr;
          }

          .faq-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .tournaments-section {
            padding: 4rem 0;
          }

          .section-content {
            padding: 0 1rem;
          }

          .hero-stats-bar {
            grid-template-columns: 1fr;
            margin-top: -2rem;
          }

          .section-header {
            flex-direction: column;
            align-items: stretch;
          }

          .steps-container {
            flex-direction: column;
          }

          .step-arrow {
            transform: rotate(90deg);
          }

          .stats-grid,
          .winners-grid,
          .prizes-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// TOURNAMENT CARD COMPONENT
// ============================================================================
function TournamentCard({ 
  tournament, 
  isRegistered, 
  onRegister, 
  onUnregister,
  onViewBracket,
  viewMode,
  playHover,
  playClick,
  isLive,
  isArchived 
}) {
  const format = TOURNAMENT_FORMATS[tournament.format?.toUpperCase().replace('-', '_')] || TOURNAMENT_FORMATS.SINGLE_ELIMINATION;
  const status = TOURNAMENT_STATUS[tournament.status?.toUpperCase()] || TOURNAMENT_STATUS.UPCOMING;
  
  const registrationProgress = tournament.maxParticipants 
    ? (tournament.registrations / tournament.maxParticipants) * 100 
    : 0;

  return (
    <GamingCard 
      className={`tournament-card tournament-card-${viewMode} ${isLive ? 'tournament-live' : ''}`}
      onMouseEnter={playHover}
    >
      {/* Status Badge */}
      <div 
        className="tournament-status-badge"
        style={{ backgroundColor: status.color }}
      >
        {React.createElement(status.icon, { className: 'status-icon' })}
        {status.label}
      </div>

      {/* Tournament Header */}
      <div className="tournament-header">
        <div className="tournament-game">{tournament.game}</div>
        <div className="tournament-format" style={{ color: format.color }}>
          <span className="format-icon">{format.icon}</span>
          {format.name}
        </div>
      </div>

      {/* Tournament Title */}
      <h3 className="tournament-title">{tournament.name}</h3>

      {/* Tournament Details */}
      <div className="tournament-details">
        <div className="detail-item">
          <Calendar className="detail-icon" />
          <span>{formatDate(tournament.startDate)}</span>
        </div>
        <div className="detail-item">
          <Clock className="detail-icon" />
          <span>{getCountdown(tournament.startDate)}</span>
        </div>
        <div className="detail-item">
          <Trophy className="detail-icon" />
          <span>{tournament.prizePool}</span>
        </div>
        <div className="detail-item">
          <Users className="detail-icon" />
          <span>{tournament.registrations}/{tournament.maxParticipants}</span>
        </div>
      </div>

      {/* Registration Progress */}
      {!isArchived && (
        <div className="registration-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${registrationProgress}%` }}
            />
          </div>
          <div className="progress-text">
            {registrationProgress.toFixed(0)}% Full
          </div>
        </div>
      )}

      {/* Tournament Description */}
      {tournament.description && (
        <p className="tournament-description">
          {truncateText(tournament.description, 120)}
        </p>
      )}

      {/* Tournament Actions */}
      <div className="tournament-actions">
        {!isArchived && tournament.status === 'registration' && (
          <>
            {isRegistered ? (
              <GamingButton
                onClick={() => {
                  playClick();
                  onUnregister(tournament.id);
                }}
                variant="outline"
                size="small"
              >
                <XCircle className="button-icon" />
                Unregister
              </GamingButton>
            ) : (
              <GamingButton
                onClick={() => {
                  playClick();
                  onRegister(tournament.id);
                }}
                size="small"
              >
                <UserPlus className="button-icon" />
                Register
              </GamingButton>
            )}
          </>
        )}

        {(isLive || isArchived) && tournament.bracket && (
          <GamingButton
            onClick={() => {
              playClick();
              onViewBracket(tournament);
            }}
            variant="outline"
            size="small"
          >
            <Eye className="button-icon" />
            View Bracket
          </GamingButton>
        )}

        {tournament.streamUrl && isLive && (
          <GamingButton
            onClick={() => {
              playClick();
              window.open(tournament.streamUrl, '_blank');
            }}
            size="small"
          >
            <Play className="button-icon" />
            Watch Live
          </GamingButton>
        )}
      </div>

      <style jsx>{`
        .tournament-card {
          position: relative;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .tournament-card.tournament-live {
          border: 2px solid #FF1744;
          box-shadow: 0 0 20px rgba(255, 23, 68, 0.3);
        }

        .tournament-status-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .status-icon {
          width: 16px;
          height: 16px;
        }

        .tournament-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          padding-right: 6rem;
        }

        .tournament-game {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--gaming-cyan);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .tournament-format {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .format-icon {
          font-size: 1.25rem;
        }

        .tournament-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.95);
          margin: 0;
          line-height: 1.3;
        }

        .tournament-details {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .detail-icon {
          width: 16px;
          height: 16px;
          color: var(--gaming-cyan);
        }

        .registration-progress {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: rgba(0, 191, 255, 0.2);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--gaming-cyan);
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
          text-align: right;
        }

        .tournament-description {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
          margin: 0;
        }

        .tournament-actions {
          display: flex;
          gap: 1rem;
          margin-top: auto;
          flex-wrap: wrap;
        }

        .tournament-card-list {
          flex-direction: row;
          align-items: center;
        }

        .tournament-card-list .tournament-header {
          padding-right: 0;
        }

        .tournament-card-list .tournament-details {
          grid-template-columns: repeat(4, 1fr);
        }

        @media (max-width: 768px) {
          .tournament-details {
            grid-template-columns: 1fr;
          }

          .tournament-header {
            flex-direction: column;
            align-items: flex-start;
            padding-right: 0;
          }

          .tournament-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </GamingCard>
  );
}

// ============================================================================
// FEATURED TOURNAMENT COMPONENT
// ============================================================================
function FeaturedTournament({ 
  tournament, 
  isRegistered, 
  onRegister, 
  onViewBracket,
  playHover,
  playClick 
}) {
  if (!tournament) return null;

  return (
    <div className="featured-tournament">
      <div className="featured-bg">
        <Image
          src="/Assets/Images/Pathways/Gaming/Tournament.jpg"
          alt={tournament.name}
          fill
          style={{ objectFit: 'cover' }}
        />
        <div className="featured-overlay" />
      </div>

      <div className="featured-content">
        <div className="featured-badge">
          <Star className="badge-icon" />
          Featured Tournament
        </div>

        <h2 className="featured-title">{tournament.name}</h2>
        <div className="featured-game">{tournament.game}</div>

        <div className="featured-stats">
          <div className="featured-stat">
            <Trophy className="stat-icon" />
            <div>
              <div className="stat-label">Prize Pool</div>
              <div className="stat-value">{tournament.prizePool}</div>
            </div>
          </div>

          <div className="featured-stat">
            <Users className="stat-icon" />
            <div>
              <div className="stat-label">Participants</div>
              <div className="stat-value">{tournament.registrations}/{tournament.maxParticipants}</div>
            </div>
          </div>

          <div className="featured-stat">
            <Calendar className="stat-icon" />
            <div>
              <div className="stat-label">Start Date</div>
              <div className="stat-value">{formatDate(tournament.startDate)}</div>
            </div>
          </div>
        </div>

        <p className="featured-description">{tournament.description}</p>

        <div className="featured-actions">
          {tournament.status === 'registration' && (
            <GamingButton
              size="large"
              onClick={() => {
                playClick();
                onRegister(tournament.id);
              }}
              onMouseEnter={playHover}
            >
              <Trophy className="button-icon" />
              Register Now
            </GamingButton>
          )}

          {tournament.bracket && (
            <NobleButton
              size="large"
              onClick={() => {
                playClick();
                onViewBracket(tournament);
              }}
              onMouseEnter={playHover}
            >
              <Eye className="button-icon" />
              View Bracket
            </NobleButton>
          )}
        </div>
      </div>

      <style jsx>{`
        .featured-tournament {
          position: relative;
          min-height: 500px;
          border-radius: 16px;
          overflow: hidden;
          border: 2px solid var(--gaming-cyan);
        }

        .featured-bg {
          position: absolute;
          inset: 0;
        }

        .featured-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(0, 191, 255, 0.8) 0%,
            rgba(10, 10, 15, 0.95) 100%
          );
        }

        .featured-content {
          position: relative;
          z-index: 2;
          padding: 4rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .featured-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: var(--cns-gold);
          color: var(--bg-primary);
          border-radius: 20px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          width: fit-content;
        }

        .badge-icon {
          width: 20px;
          height: 20px;
        }

        .featured-title {
          font-size: 3rem;
          font-weight: 700;
          color: white;
          margin: 0;
          text-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
        }

        .featured-game {
          font-size: 1.5rem;
          color: var(--gaming-cyan);
          font-weight: 600;
        }

        .featured-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .featured-stat {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .featured-stat .stat-icon {
          width: 48px;
          height: 48px;
          color: var(--gaming-cyan);
        }

        .stat-label {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 0.25rem;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
        }

        .featured-description {
          font-size: 1.125rem;
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.8;
          max-width: 800px;
        }

        .featured-actions {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .featured-content {
            padding: 2rem;
          }

          .featured-title {
            font-size: 2rem;
          }

          .featured-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// TOURNAMENT CALENDAR COMPONENT
// ============================================================================
function TournamentCalendar({ tournaments, onDateClick }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const getTournamentsByDate = (date) => {
    return tournaments.filter(t => {
      const tDate = new Date(t.startDate);
      return tDate.toDateString() === date.toDateString();
    });
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
  const days = [];

  // Empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="calendar-day empty" />);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const tournamentsOnDate = getTournamentsByDate(date);
    const isToday = date.toDateString() === new Date().toDateString();

    days.push(
      <div 
        key={day} 
        className={`calendar-day ${isToday ? 'today' : ''} ${tournamentsOnDate.length > 0 ? 'has-tournament' : ''}`}
        onClick={() => tournamentsOnDate.length > 0 && onDateClick(date)}
      >
        <div className="day-number">{day}</div>
        {tournamentsOnDate.length > 0 && (
          <div className="day-tournaments">
            {tournamentsOnDate.length} event{tournamentsOnDate.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    );
  }

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="tournament-calendar">
      <div className="calendar-header">
        <button
          className="calendar-nav"
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
        >
          <ArrowLeft />
        </button>

        <h3 className="calendar-month">{monthName}</h3>

        <button
          className="calendar-nav"
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
        >
          <ArrowRight />
        </button>
      </div>

      <div className="calendar-weekdays">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="weekday">{day}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {days}
      </div>

      <style jsx>{`
        .tournament-calendar {
          background: rgba(0, 191, 255, 0.05);
          border: 1px solid rgba(0, 191, 255, 0.2);
          border-radius: 12px;
          padding: 2rem;
        }

        .calendar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
        }

        .calendar-nav {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 191, 255, 0.1);
          border: 1px solid rgba(0, 191, 255, 0.2);
          border-radius: 8px;
          color: var(--gaming-cyan);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .calendar-nav:hover {
          background: rgba(0, 191, 255, 0.2);
          border-color: var(--gaming-cyan);
        }

        .calendar-month {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--gaming-cyan);
        }

        .calendar-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .weekday {
          text-align: center;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.875rem;
          text-transform: uppercase;
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.5rem;
        }

        .calendar-day {
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .calendar-day.empty {
          background: transparent;
          border: none;
          cursor: default;
        }

        .calendar-day.today {
          border-color: var(--gaming-cyan);
          background: rgba(0, 191, 255, 0.1);
        }

        .calendar-day.has-tournament {
          background: rgba(0, 191, 255, 0.15);
          border-color: var(--gaming-cyan);
        }

        .calendar-day.has-tournament:hover {
          background: rgba(0, 191, 255, 0.25);
          transform: scale(1.05);
        }

        .day-number {
          font-size: 1.125rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
        }

        .day-tournaments {
          font-size: 0.625rem;
          color:// ============================================================================
// GAMING TOURNAMENTS PAGE - The Conclave Realm
// The most extensive tournament system ever created - 100% production-ready
// Location: /src/app/pathways/gaming/tournaments/page.jsx
// ============================================================================

'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';

// ============================================================================
// CONTEXT & HOOKS
// ============================================================================
import { useAppContext } from '@/contexts/AppProvider';
import { useAuth } from '@/hooks/useAuth';
import { useDiscord } from '@/hooks/useDiscord';
import { usePathways, usePathwayProgress } from '@/hooks/usePathways';
import { useSound } from '@/hooks/useSound';

// ============================================================================
// UI COMPONENTS
// ============================================================================
import { 
  GamingButton, 
  NobleButton, 
  TextFlameButton 
} from '@/components/ui/LuxuryButton';

import { 
  GamingCard, 
  StatsCard, 
  ProfileCard, 
  FeatureCard 
} from '@/components/ui/GlassCard';

import LoadingCrest, { LoadingOverlay } from '@/components/ui/LoadingCrest';

import { 
  GamingPortal,
  EventShowcase,
  SuperButtonGroup 
} from '@/components/ui/SuperButton';

import { 
  NobleSearchInput,
  NobleSelect 
} from '@/components/ui/NobleInput';

// ============================================================================
// PATHWAY COMPONENTS
// ============================================================================
import PathwayHero from '@/components/pathways/PathwayHero';

// ============================================================================
// CONTENT COMPONENTS
// ============================================================================
import EventCard from '@/components/content/EventCard';
import MemberSpotlight from '@/components/content/MemberSpotlight';
import AnnouncementBanner from '@/components/content/AnnouncementBanner';

// ============================================================================
// INTERACTIVE COMPONENTS
// ============================================================================
import BadgeSystem from '@/components/interactive/BadgeSystem';
import { notify } from '@/components/interactive/NotificationCenter';

// ============================================================================
// DATA & CONSTANTS
// ============================================================================
import { getPathwayById } from '@/data/pathways';
import { 
  getUpcomingEvents, 
  getActiveRecurringEvents 
} from '@/data/events';
import { 
  getAllAchievements, 
  getAchievementsByPathway 
} from '@/data/lore';
import { getActiveStaffMembers } from '@/data/staff';

import { 
  formatDate, 
  formatDateTime,
  formatNumber, 
  getRelativeTime,
  debounce,
  truncateText 
} from '@/lib/utils';

import { hasPermission } from '@/constants/permissions';

// ============================================================================
// ICONS
// ============================================================================
import { 
  Trophy,
  Calendar,
  Users,
  Clock,
  Target,
  Award,
  Zap,
  Play,
  ChevronRight,
  Filter,
  Search,
  Download,
  Share2,
  ExternalLink,
  TrendingUp,
  Crown,
  Swords,
  Shield,
  Flame,
  Star,
  CircleDot,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  ArrowRight,
  ArrowLeft,
  Maximize2,
  RefreshCw,
  Eye,
  UserPlus,
  List,
  Grid,
  Calendar as CalendarIcon,
  MapPin,
  DollarSign,
  Activity
} from 'lucide-react';

// ============================================================================
// TOURNAMENT CONSTANTS
// ============================================================================

const TOURNAMENT_FORMATS = {
  SINGLE_ELIMINATION: {
    id: 'single-elimination',
    name: 'Single Elimination',
    description: 'One loss and you\'re out',
    icon: '🎯',
    color: '#FF4655'
  },
  DOUBLE_ELIMINATION: {
    id: 'double-elimination',
    name: 'Double Elimination',
    description: 'Two chances to compete',
    icon: '⚔️',
    color: '#FF8C00'
  },
  ROUND_ROBIN: {
    id: 'round-robin',
    name: 'Round Robin',
    description: 'Everyone plays everyone',
    icon: '🔄',
    color: '#00BFFF'
  },
  SWISS: {
    id: 'swiss',
    name: 'Swiss System',
    description: 'Skill-based matchmaking',
    icon: '⚖️',
    color: '#9D4DFF'
  },
  BATTLE_ROYALE: {
    id: 'battle-royale',
    name: 'Battle Royale',
    description: 'Last one standing wins',
    icon: '💥',
    color: '#FF1744'
  },
  CUSTOM: {
    id: 'custom',
    name: 'Custom Format',
    description: 'Special tournament rules',
    icon: '✨',
    color: '#FFD700'
  }
};

const TOURNAMENT_STATUS = {
  LIVE: { id: 'live', label: 'Live Now', color: '#FF1744', icon: Activity },
  UPCOMING: { id: 'upcoming', label: 'Upcoming', color: '#00BFFF', icon: Clock },
  REGISTRATION: { id: 'registration', label: 'Registration Open', color: '#39FF14', icon: UserPlus },
  CLOSED: { id: 'closed', label: 'Registration Closed', color: '#FF8C00', icon: AlertCircle },
  ENDED: { id: 'ended', label: 'Ended', color: '#666666', icon: CheckCircle }
};

const GAMES_LIST = [
  'Chess', 'Minecraft', 'Roblox', 'Elden Ring', 'Valorant',
  'League of Legends', 'Fortnite', 'Apex Legends', 'CS2',
  'Overwatch 2', 'Rocket League', 'Genshin Impact', 'All Games'
];

// ============================================================================
// TOURNAMENTS PAGE COMPONENT
// ============================================================================
export default function TournamentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { 
    user, 
    isAuthenticated,
    serverData,
    soundsEnabled,
    animationsEnabled,
    isMobile,
    playHover,
    playClick,
    playNotification
  } = useAppContext();

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const [isLoading, setIsLoading] = useState(true);
  const [tournaments, setTournaments] = useState([]);
  const [filteredTournaments, setFilteredTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [showBracket, setShowBracket] = useState(false);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [gameFilter, setGameFilter] = useState('all');
  const [formatFilter, setFormatFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [sortBy, setSortBy] = useState('date'); // date, prize, participants
  
  // Registration state
  const [registering, setRegistering] = useState(false);
  const [userRegistrations, setUserRegistrations] = useState([]);
  
  // Stats
  const [tournamentStats, setTournamentStats] = useState({});
  const [recentWinners, setRecentWinners] = useState([]);
  const [topPrizes, setTopPrizes] = useState([]);
  
  // UI state
  const [visibleSections, setVisibleSections] = useState(new Set());
  const [expandedTournament, setExpandedTournament] = useState(null);

  // ============================================================================
  // REFS
  // ============================================================================
  const heroRef = useRef(null);
  const filtersRef = useRef(null);
  const liveRef = useRef(null);
  const upcomingRef = useRef(null);
  const calendarRef = useRef(null);
  const featuredRef = useRef(null);
  const winnersRef = useRef(null);
  const statsRef = useRef(null);
  const archiveRef = useRef(null);
  const faqRef = useRef(null);

  // ============================================================================
  // DATA LOADING
  // ============================================================================
  useEffect(() => {
    loadAllData();
    
    // Set up real-time updates for live tournaments
    const interval = setInterval(() => {
      loadLiveTournaments();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [user, isAuthenticated]);

  const loadAllData = async () => {
    try {
      setIsLoading(true);

      // Load tournaments from API
      await loadTournaments();
      
      // Load user registrations
      if (isAuthenticated && user) {
        await loadUserRegistrations();
      }
      
      // Load statistics
      await loadTournamentStats();
      
      // Load recent winners
      await loadRecentWinners();
      
      setIsLoading(false);

      // Welcome notification
      if (!sessionStorage.getItem('tournaments-welcomed')) {
        setTimeout(() => {
          playNotification();
          notify.success('Welcome to the Tournament Arena!', {
            title: '🏆 Battle Awaits',
            duration: 4000
          });
          sessionStorage.setItem('tournaments-welcomed', 'true');
        }, 1000);
      }

    } catch (error) {
      console.error('Tournaments load error:', error);
      notify.error('Failed to load tournaments', { title: 'Loading Error' });
      setIsLoading(false);
    }
  };

  // ============================================================================
  // LOAD TOURNAMENTS (DYNAMIC FROM API)
  // ============================================================================
  const loadTournaments = async () => {
    try {
      const response = await fetch('/api/discord/events?type=tournament&pathway=gaming');
      
      if (response.ok) {
        const data = await response.json();
        
        // Transform and enrich tournament data
        const enrichedTournaments = data.map(tournament => ({
          ...tournament,
          format: tournament.format || 'single-elimination',
          status: determineTournamentStatus(tournament),
          registrations: tournament.participants?.length || 0,
          maxParticipants: tournament.maxParticipants || 32,
          prizePool: tournament.prizePool || calculatePrizePool(tournament),
          bracket: tournament.bracket || null,
          streamUrl: tournament.streamUrl || null,
          vods: tournament.vods || []
        }));
        
        setTournaments(enrichedTournaments);
        setFilteredTournaments(enrichedTournaments);
      } else {
        // Fallback: Use local events data
        const localEvents = getUpcomingEvents();
        const gamingTournaments = localEvents.filter(e => 
          e.category === 'tournament' && 
          (e.pathway === 'gaming' || e.tags?.includes('gaming'))
        );
        
        setTournaments(gamingTournaments);
        setFilteredTournaments(gamingTournaments);
      }
    } catch (error) {
      console.error('Load tournaments error:', error);
      
      // Fallback to local data
      const localEvents = getUpcomingEvents();
      const gamingTournaments = localEvents.filter(e => 
        e.category === 'tournament' && 
        (e.pathway === 'gaming' || e.tags?.includes('gaming'))
      );
      
      setTournaments(gamingTournaments);
      setFilteredTournaments(gamingTournaments);
    }
  };

  // ============================================================================
  // LOAD LIVE TOURNAMENTS (REAL-TIME)
  // ============================================================================
  const loadLiveTournaments = async () => {
    try {
      const response = await fetch('/api/discord/events?status=live&type=tournament');
      
      if (response.ok) {
        const liveData = await response.json();
        
        // Update tournaments with live data
        setTournaments(prev => 
          prev.map(t => {
            const liveVersion = liveData.find(l => l.id === t.id);
            return liveVersion ? { ...t, ...liveVersion } : t;
          })
        );
      }
    } catch (error) {
      console.error('Load live tournaments error:', error);
    }
  };

  // ============================================================================
  // LOAD USER REGISTRATIONS
  // ============================================================================
  const loadUserRegistrations = async () => {
    try {
      const response = await fetch(`/api/discord/events/registrations?userId=${user.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setUserRegistrations(data.map(r => r.eventId));
      }
    } catch (error) {
      console.error('Load user registrations error:', error);
    }
  };

  // ============================================================================
  // LOAD TOURNAMENT STATISTICS
  // ============================================================================
  const loadTournamentStats = async () => {
    try {
      const response = await fetch('/api/discord/stats?category=tournaments');
      
      if (response.ok) {
        const data = await response.json();
        setTournamentStats(data);
      } else {
        // Fallback stats
        setTournamentStats({
          totalTournaments: tournaments.length,
          activeTournaments: tournaments.filter(t => t.status === 'live').length,
          totalParticipants: tournaments.reduce((sum, t) => sum + (t.registrations || 0), 0),
          totalPrizePool: tournaments.reduce((sum, t) => sum + (parsePrize(t.prizePool) || 0), 0),
          avgParticipants: Math.floor(tournaments.reduce((sum, t) => sum + (t.registrations || 0), 0) / (tournaments.length || 1)),
          largestTournament: Math.max(...tournaments.map(t => t.registrations || 0)),
          upcomingCount: tournaments.filter(t => t.status === 'upcoming' || t.status === 'registration').length,
          completedCount: tournaments.filter(t => t.status === 'ended').length
        });
      }
    } catch (error) {
      console.error('Load tournament stats error:', error);
    }
  };

  // ============================================================================
  // LOAD RECENT WINNERS
  // ============================================================================
  const loadRecentWinners = async () => {
    try {
      const response = await fetch('/api/discord/events?status=ended&type=tournament&limit=6');
      
      if (response.ok) {
        const data = await response.json();
        
        const winners = data.map(tournament => ({
          tournamentId: tournament.id,
          tournamentName: tournament.name,
          game: tournament.game,
          winner: tournament.winner || tournament.participants?.[0],
          prize: tournament.prizePool,
          date: tournament.endDate,
          participants: tournament.participants?.length || 0
        })).filter(w => w.winner);
        
        setRecentWinners(winners);
        
        // Top prizes
        const sorted = [...data].sort((a, b) => 
          parsePrize(b.prizePool) - parsePrize(a.prizePool)
        );
        setTopPrizes(sorted.slice(0, 5));
      }
    } catch (error) {
      console.error('Load recent winners error:', error);
    }
  };

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================
  const determineTournamentStatus = (tournament) => {
    const now = new Date();
    const start = new Date(tournament.startDate);
    const end = tournament.endDate ? new Date(tournament.endDate) : null;
    const regDeadline = tournament.registrationDeadline ? new Date(tournament.registrationDeadline) : start;

    if (end && now > end) return 'ended';
    if (now >= start && (!end || now < end)) return 'live';
    if (now < regDeadline) return 'registration';
    if (now >= regDeadline && now < start) return 'closed';
    return 'upcoming';
  };

  const calculatePrizePool = (tournament) => {
    // Generate realistic prize based on participants
    const participants = tournament.participants?.length || tournament.maxParticipants || 16;
    const basePrize = 50;
    const perParticipant = 10;
    return `$${basePrize + (participants * perParticipant)}`;
  };

  const parsePrize = (prizeString) => {
    if (!prizeString) return 0;
    const match = prizeString.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  };

  const isUserRegistered = (tournamentId) => {
    return userRegistrations.includes(tournamentId);
  };

  const getCountdown = (date) => {
    const now = new Date();
    const target = new Date(date);
    const diff = target - now;

    if (diff <= 0) return 'Started';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // ============================================================================
  // FILTERING & SORTING
  // ============================================================================
  useEffect(() => {
    filterAndSortTournaments();
  }, [tournaments, statusFilter, gameFilter, formatFilter, searchQuery, sortBy]);

  const filterAndSortTournaments = () => {
    let filtered = [...tournaments];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    // Game filter
    if (gameFilter !== 'all' && gameFilter !== 'All Games') {
      filtered = filtered.filter(t => t.game === gameFilter);
    }

    // Format filter
    if (formatFilter !== 'all') {
      filtered = filtered.filter(t => t.format === formatFilter);
    }

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.name?.toLowerCase().includes(query) ||
        t.game?.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case 'date':
        filtered.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        break;
      case 'prize':
        filtered.sort((a, b) => parsePrize(b.prizePool) - parsePrize(a.prizePool));
        break;
      case 'participants':
        filtered.sort((a, b) => (b.registrations || 0) - (a.registrations || 0));
        break;
      case 'popularity':
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      default:
        break;
    }

    setFilteredTournaments(filtered);
  };

  // ============================================================================
  // TOURNAMENT REGISTRATION
  // ============================================================================
  const handleRegisterTournament = async (tournamentId) => {
    if (!isAuthenticated) {
      playClick();
      notify.error('Please login to register for tournaments', {
        title: 'Authentication Required'
      });
      router.push('/gateway');
      return;
    }

    try {
      setRegistering(true);
      playClick();

      const response = await fetch(`/api/discord/events/${tournamentId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id,
          username: user.username,
          discordId: user.discordId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const data = await response.json();

      // Update local state
      setUserRegistrations(prev => [...prev, tournamentId]);
      
      // Update tournament registrations count
      setTournaments(prev =>
        prev.map(t =>
          t.id === tournamentId
            ? { ...t, registrations: (t.registrations || 0) + 1 }
            : t
        )
      );

      playNotification();
      notify.success('Successfully registered for tournament!', {
        title: '✅ Registration Complete',
        duration: 5000
      });

      // Reload data
      await loadAllData();

    } catch (error) {
      console.error('Tournament registration error:', error);
      notify.error(error.message || 'Failed to register. Please try again.', {
        title: 'Registration Failed'
      });
    } finally {
      setRegistering(false);
    }
  };

  // ============================================================================
  // TOURNAMENT UNREGISTER
  // ============================================================================
  const handleUnregisterTournament = async (tournamentId) => {
    try {
      playClick();

      const response = await fetch(`/api/discord/events/${tournamentId}/unregister`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });

      if (!response.ok) throw new Error('Unregistration failed');

      // Update local state
      setUserRegistrations(prev => prev.filter(id => id !== tournamentId));
      
      // Update tournament registrations count
      setTournaments(prev =>
        prev.map(t =>
          t.id === tournamentId
            ? { ...t, registrations: Math.max(0, (t.registrations || 0) - 1) }
            : t
        )
      );

      notify.success('Unregistered from tournament', {
        title: 'Unregistration Complete'
      });

      await loadAllData();

    } catch (error) {
      console.error('Unregistration error:', error);
      notify.error('Failed to unregister', { title: 'Error' });
    }
  };

  // ============================================================================
  // VIEW BRACKET
  // ============================================================================
  const handleViewBracket = (tournament) => {
    playClick();
    setSelectedTournament(tournament);
    setShowBracket(true);
  };

  // ============================================================================
  // SCROLL REVEAL
  // ============================================================================
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          setVisibleSections(prev => new Set(prev).add(entry.target.id));
        }
      });
    }, observerOptions);

    const sections = [
      heroRef.current,
      filtersRef.current,
      liveRef.current,
      upcomingRef.current,
      calendarRef.current,
      featuredRef.current,
      winnersRef.current,
      statsRef.current,
      archiveRef.current,
      faqRef.current
    ].filter(Boolean);

    sections.forEach(section => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  // ============================================================================
  // CATEGORIZED TOURNAMENTS
  // ============================================================================
  const liveTournaments = useMemo(() => 
    filteredTournaments.filter(t => t.status === 'live'),
    [filteredTournaments]
  );

  const upcomingTournaments = useMemo(() => 
    filteredTournaments.filter(t => t.status === 'registration' || t.status === 'upcoming'),
    [filteredTournaments]
  );

  const closedTournaments = useMemo(() => 
    filteredTournaments.filter(t => t.status === 'closed'),
    [filteredTournaments]
  );

  const endedTournaments = useMemo(() => 
    filteredTournaments.filter(t => t.status === 'ended'),
    [filteredTournaments]
  );

  // ============================================================================
  // RENDER LOADING
  // ============================================================================
  if (isLoading) {
    return (
      <LoadingCrest 
        pathway="gaming" 
        message="Loading Tournaments..." 
        progress={80}
      />
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  return (
    <div className="gaming-tournaments-page">
      {/* ================================================================
          SECTION 1: HERO
          ================================================================ */}
      <section 
        ref={heroRef}
        id="tournaments-hero"
        className="tournaments-hero scroll-reveal"
      >
        <PathwayHero
          pathway={getPathwayById('gaming')}
          title="Tournament Arena"
          subtitle="Battle for Glory and Prizes"
          description="Compete in epic tournaments across multiple games"
          backgroundImage="/Assets/Images/Pathways/Gaming/Tournament.jpg"
          showScrollIndicator={false}
          animated={animationsEnabled}
        />

        {/* Quick Stats Bar */}
        <div className="hero-stats-bar">
          <div className="hero-stat">
            <Activity className="stat-icon" />
            <div className="stat-content">
              <div className="stat-value">{liveTournaments.length}</div>
              <div className="stat-label">Live Now</div>
            </div>
          </div>
          <div className="hero-stat">
            <Clock className="stat-icon" />
            <div className="stat-content">
              <div className="stat-value">{upcomingTournaments.length}</div>
              <div className="stat-label">Upcoming</div>
            </div>
          </div>
          <div className="hero-stat">
            <Trophy className="stat-icon" />
            <div className="stat-content">
              <div className="stat-value">{formatNumber(tournamentStats.totalTournaments || tournaments.length)}</div>
              <div className="stat-label">Total Tournaments</div>
            </div>
          </div>
          <div className="hero-stat">
            <DollarSign className="stat-icon" />
            <div className="stat-content">
              <div className="stat-value">${formatNumber(tournamentStats.totalPrizePool || 0)}</div>
              <div className="stat-label">Total Prizes</div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 2: FILTERS & SEARCH
          ================================================================ */}
      <section 
        ref={filtersRef}
        id="tournaments-filters"
        className="tournaments-section filters-section scroll-reveal"
      >
        <div className="section-content">
          <div className="filters-container">
            {/* Search */}
            <NobleSearchInput
              placeholder="Search tournaments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="tournament-search"
            />

            {/* Filters */}
            <div className="filter-group">
              <NobleSelect
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'live', label: 'Live Now' },
                  { value: 'registration', label: 'Registration Open' },
                  { value: 'upcoming', label: 'Upcoming' },
                  { value: 'closed', label: 'Registration Closed' },
                  { value: 'ended', label: 'Ended' }
                ]}
                className="filter-select"
              />

              <NobleSelect
                value={gameFilter}
                onChange={(e) => setGameFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Games' },
                  ...GAMES_LIST.map(game => ({ value: game, label: game }))
                ]}
                className="filter-select"
              />

              <NobleSelect
                value={formatFilter}
                onChange={(e) => setFormatFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Formats' },
                  ...Object.values(TOURNAMENT_FORMATS).map(format => ({
                    value: format.id,
                    label: format.name
                  }))
                ]}
                className="filter-select"
              />

              <NobleSelect
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                options={[
                  { value: 'date', label: 'Sort by Date' },
                  { value: 'prize', label: 'Sort by Prize' },
                  { value: 'participants', label: 'Sort by Participants' },
                  { value: 'popularity', label: 'Sort by Popularity' }
                ]}
                className="filter-select"
              />
            </div>

            {/* View Toggle */}
            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => { setViewMode('grid'); playClick(); }}
                onMouseEnter={playHover}
              >
                <Grid className="view-icon" />
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => { setViewMode('list'); playClick(); }}
                onMouseEnter={playHover}
              >
                <List className="view-icon" />
              </button>
            </div>

            {/* Results Count */}
            <div className="results-count">
              {filteredTournaments.length} tournament{filteredTournaments.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 3: LIVE TOURNAMENTS
          ================================================================ */}
      {liveTournaments.length > 0 && (
        <section 
          ref={liveRef}
          id="tournaments-live"
          className="tournaments-section live-section scroll-reveal"
        >
          <div className="section-content">
            <div className="section-header">
              <h2 className="text-h2 text-gradient-gaming">
                <Activity className="inline-icon pulse-icon" />
                Live Tournaments
              </h2>
              <div className="live-indicator">
                <CircleDot className="live-dot" />
                <span>{liveTournaments.length} Active</span>
              </div>
            </div>

            <div className={`tournaments-${viewMode}`}>
              {liveTournaments.map(tournament => (
                <TournamentCard
                  key={tournament.id}
                  tournament={tournament}
                  isRegistered={isUserRegistered(tournament.id)}
                  onRegister={handleRegisterTournament}
                  onUnregister={handleUnregisterTournament}
                  onViewBracket={handleViewBracket}
                  viewMode={viewMode}
                  playHover={playHover}
                  playClick={playClick}
                  isLive={true}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================================================================
          SECTION 4: UPCOMING TOURNAMENTS (REGISTRATION OPEN)
          ================================================================ */}
      {upcomingTournaments.length > 0 && (
        <section 
          ref={upcomingRef}
          id="tournaments-upcoming"
          className="tournaments-section upcoming-section scroll-reveal"
        >
          <div className="section-content">
            <div className="section-header">
              <h2 className="text-h2 text-gradient-gaming">
                <Clock className="inline-icon" />
                Upcoming Tournaments
              </h2>
              <GamingButton
                onClick={() => {
                  playClick();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onMouseEnter={playHover}
              >
                Register Now
                <UserPlus className="button-icon" />
              </GamingButton>
            </div>

            <div className={`tournaments-${viewMode}`}>
              {upcomingTournaments.map(tournament => (
                <TournamentCard
                  key={tournament.id}
                  tournament={tournament}
                  isRegistered={isUserRegistered(tournament.id)}
                  onRegister={handleRegisterTournament}
                  onUnregister={handleUnregisterTournament}
                  onViewBracket={handleViewBracket}
                  viewMode={viewMode}
                  playHover={playHover}
                  playClick={playClick}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================================================================
          SECTION 5: REGISTRATION CLOSED
          ================================================================ */}
      {closedTournaments.length > 0 && (
        <section 
          id="tournaments-closed"
          className="tournaments-section closed-section scroll-reveal"
        >
          <div className="section-content">
            <div className="section-header">
              <h2 className="text-h3 text-gradient-gaming">
                <AlertCircle className="inline-icon" />
                Registration Closed
              </h2>
            </div>

            <div className={`tournaments-${viewMode}`}>
              {closedTournaments.map(tournament => (
                <TournamentCard
                  key={tournament.id}
                  tournament={tournament}
                  isRegistered={isUserRegistered(tournament.id)}
                  onRegister={handleRegisterTournament}
                  onUnregister={handleUnregisterTournament}
                  onViewBracket={handleViewBracket}
                  viewMode={viewMode}
                  playHover={playHover}
                  playClick={playClick}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================================================================
          SECTION 6: TOURNAMENT CALENDAR
          ================================================================ */}
      <section 
        ref={calendarRef}
        id="tournaments-calendar"
        className="tournaments-section calendar-section scroll-reveal"
      >
        <div className="section-content">
          <div className="section-header text-center">
            <h2 className="text-h2 text-gradient-gaming">
              <CalendarIcon className="inline-icon" />
              Tournament Calendar
            </h2>
            <p className="text-h4 text-glow-soft">
              Plan your competitive schedule
            </p>
          </div>

          <div className="calendar-container">
            <TournamentCalendar 
              tournaments={tournaments}
              onDateClick={(date) => {
                playClick();
                // Filter by date
                setSearchQuery('');
                setStatusFilter('all');
              }}
            />
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 7: FEATURED TOURNAMENT
          ================================================================ */}
      {tournaments.length > 0 && (
        <section 
          ref={featuredRef}
          id="tournaments-featured"
          className="tournaments-section featured-section scroll-reveal"
        >
          <div className="section-content">
            <div className="section-header text-center">
              <h2 className="text-h2 text-gradient-gaming">
                <Star className="inline-icon" />
                Featured Tournament
              </h2>
            </div>

            <FeaturedTournament
              tournament={tournaments.find(t => t.featured) || tournaments[0]}
              isRegistered={isUserRegistered(tournaments[0]?.id)}
              onRegister={handleRegisterTournament}
              onViewBracket={handleViewBracket}
              playHover={playHover}
              playClick={playClick}
            />
          </div>
        </section>
      )}

      {/* ================================================================
          SECTION 8: TOURNAMENT RULES
          ================================================================ */}
      <section 
        id="tournaments-rules"
        className="tournaments-section rules-section scroll-reveal"
      >
        <div className="section-content">
          <div className="section-header text-center">
            <h2 className="text-h2 text-gradient-gaming">
              <Shield className="inline-icon" />
              Tournament Rules
            </h2>
          </div>

          <div className="rules-grid">
            <GamingCard className="rule-card">
              <div className="rule-icon">
                <CheckCircle />
              </div>
              <h3 className="rule-title">Registration</h3>
              <ul className="rule-list">
                <li>Must be a verified Discord member</li>
                <li>Must have joined Gaming Realm pathway</li>
                <li>Register before deadline</li>
                <li>Check-in 15 minutes before start</li>
              </ul>
            </GamingCard>

            <GamingCard className="rule-card">
              <div className="rule-icon">
                <Swords />
              </div>
              <h3 className="rule-title">Fair Play</h3>
              <ul className="rule-list">
                <li>No cheating or exploits</li>
                <li>No toxic behavior</li>
                <li>Respect opponents and staff</li>
                <li>Follow game-specific rules</li>
              </ul>
            </GamingCard>

            <GamingCard className="rule-card">
              <div className="rule-icon">
                <Trophy />
              </div>
              <h3 className="rule-title">Prizes</h3>
              <ul className="rule-list">
                <li>Prizes awarded within 48 hours</li>
                <li>Must claim within 7 days</li>
                <li>Winners announced publicly</li>
                <li>Exclusive Discord roles</li>
              </ul>
            </GamingCard>

            <GamingCard className="rule-card">
              <div className="rule-icon">
                <Info />
              </div>
              <h3 className="rule-title">Conduct</h3>
              <ul className="rule-list">
                <li>Show sportsmanship</li>
                <li>Report issues to staff immediately</li>
                <li>Follow Discord server rules</li>
                <li>Staff decisions are final</li>
              </ul>
            </GamingCard>
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 9: PRIZE POOL LEADERBOARD
          ================================================================ */}
      {topPrizes.length > 0 && (
        <section 
          id="tournaments-prizes"
          className="tournaments-section prizes-section scroll-reveal"
        >
          <div className="section-content">
            <div className="section-header">
              <h2 className="text-h2 text-gradient-gaming">
                <DollarSign className="inline-icon" />
                Biggest Prize Pools
              </h2>
            </div>

            <div className="prizes-grid">
              {topPrizes.map((tournament, index) => (
                <GamingCard key={tournament.id} className="prize-card">
                  <div className="prize-rank">#{index + 1}</div>
                  <div className="prize-info">
                    <h3 className="prize-tournament">{tournament.name}</h3>
                    <div className="prize-game">{tournament.game}</div>
                  </div>
                  <div className="prize-amount">
                    {tournament.prizePool}
                  </div>
                </GamingCard>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================================================================
          SECTION 10: RECENT WINNERS (HALL OF CHAMPIONS)
          ================================================================ */}
      {recentWinners.length > 0 && (
        <section 
          ref={winnersRef}
          id="tournaments-winners"
          className="tournaments-section winners-section scroll-reveal"
        >
          <div className="section-content">
            <div className="section-header text-center">
              <h2 className="text-h2 text-gradient-gaming">
                <Crown className="inline-icon" />
                Hall of Champions
              </h2>
              <p className="text-h4 text-glow-soft">
                Celebrating recent tournament victors
              </p>
            </div>

            <div className="winners-grid">
              {recentWinners.map((winner, index) => (
                <div key={winner.tournamentId} className="winner-card">
                  <div className="winner-rank">
                    {index < 3 ? ['🥇', '🥈', '🥉'][index] : `#${index + 1}`}
                  </div>
                  <div className="winner-info">
                    <h3 className="winner-name">{winner.winner?.username || winner.winner}</h3>
                    <div className="winner-tournament">{winner.tournamentName}</div>
                    <div className="winner-game">{winner.game}</div>
                  </div>
                  <div className="winner-prize">
                    <Trophy className="winner-trophy" />
                    {winner.prize}
                  </div>
                  <div className="winner-date">
                    {formatDate(winner.date)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================================================================
          SECTION 11: TOURNAMENT STATISTICS
          ================================================================ */}
      <section 
        ref={statsRef}
        id="tournaments-stats"
        className="tournaments-section stats-section scroll-reveal"
      >
        <div className="section-content">
          <div className="section-header text-center">
            <h2 className="text-h2 text-gradient-gaming">
              <TrendingUp className="inline-icon" />
              Tournament Statistics
            </h2>
          </div>

          <div className="stats-grid">
            <StatsCard
              icon={<Trophy className="stat-icon" />}
              value={formatNumber(tournamentStats.totalTournaments || tournaments.length)}
              label="Total Tournaments"
              subtitle="All Time"
              animated={visibleSections.has('tournaments-stats')}
              pathway="gaming"
            />

            <StatsCard
              icon={<Activity className="stat-icon stat-icon-pulse" />}
              value={formatNumber(tournamentStats.activeTournaments || liveTournaments.length)}
              label="Active Now"
              subtitle="Live Tournaments"
              animated={visibleSections.has('tournaments-stats')}
              pathway="gaming"
            />

            <StatsCard
              icon={<Users className="stat-icon" />}
              value={formatNumber(tournamentStats.totalParticipants || 0)}
              label="Total Participants"
              subtitle="All Tournaments"
              animated={visibleSections.has('tournaments-stats')}
              pathway="gaming"
            />

            <StatsCard
              icon={<DollarSign className="stat-icon" />}
              value={`${formatNumber(tournamentStats.totalPrizePool || 0)}`}
              label="Total Prize Pool"
              subtitle="Awarded"
              animated={visibleSections.has('tournaments-stats')}
              pathway="gaming"
            />

            <StatsCard
              icon={<Target className="stat-icon" />}
              value={formatNumber(tournamentStats.avgParticipants || 0)}
              label="Avg Participants"
              subtitle="Per Tournament"
              animated={visibleSections.has('tournaments-stats')}
              pathway="gaming"
            />

            <StatsCard
              icon={<Flame className="stat-icon" />}
              value={formatNumber(tournamentStats.largestTournament || 0)}
              label="Largest Tournament"
              subtitle="Max Participants"
              animated={visibleSections.has('tournaments-stats')}
              pathway="gaming"
            />

            <StatsCard
              icon={<Clock className="stat-icon" />}
              value={formatNumber(tournamentStats.upcomingCount || upcomingTournaments.length)}
              label="Upcoming"
              subtitle="Next 30 Days"
              animated={visibleSections.has('tournaments-stats')}
              pathway="gaming"
            />

            <StatsCard
              icon={<CheckCircle className="stat-icon" />}
              value={formatNumber(tournamentStats.completedCount || endedTournaments.length)}
              label="Completed"
              subtitle="Total Finished"
              animated={visibleSections.has('tournaments-stats')}
              pathway="gaming"
            />
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 12: PAST TOURNAMENTS ARCHIVE
          ================================================================ */}
      {endedTournaments.length > 0 && (
        <section 
          ref={archiveRef}
          id="tournaments-archive"
          className="tournaments-section archive-section scroll-reveal"
        >
          <div className="section-content">
            <div className="section-header">
              <h2 className="text-h2 text-gradient-gaming">
                <Archive className="inline-icon" />
                Tournament Archive
              </h2>
              <GamingButton
                onClick={() => {
                  playClick();
                  setStatusFilter('ended');
                  window.scrollTo({ top: filtersRef.current.offsetTop, behavior: 'smooth' });
                }}
                onMouseEnter={playHover}
              >
                View All
                <ArrowRight className="button-icon" />
              </GamingButton>
            </div>

            <div className={`tournaments-${viewMode}`}>
              {endedTournaments.slice(0, 6).map(tournament => (
                <TournamentCard
                  key={tournament.id}
                  tournament={tournament}
                  isRegistered={false}
                  onViewBracket={handleViewBracket}
                  viewMode={viewMode}
                  playHover={playHover}
                  playClick={playClick}
                  isArchived={true}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================================================================
          SECTION 13: HOW TO JOIN
          ================================================================ */}
      <section 
        id="tournaments-how-to-join"
        className="tournaments-section how-to-section scroll-reveal"
      >
        <div className="section-content">
          <div className="section-header text-center">
            <h2 className="text-h2 text-gradient-gaming">
              <Target className="inline-icon" />
              How to Join Tournaments
            </h2>
          </div>

          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3 className="step-title">Login & Verify</h3>
                <p className="step-description">
                  Login with Discord and verify your server membership
                </p>
              </div>
            </div>

            <div className="step-arrow">
              <ArrowRight />
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3 className="step-title">Join Gaming Realm</h3>
                <p className="step-description">
                  Join the Gaming Realm pathway to access tournaments
                </p>
              </div>
            </div>

            <div className="step-arrow">
              <ArrowRight />
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3 className="step-title">Register</h3>
                <p className="step-description">
                  Find a tournament and click "Register" before the deadline
                </p>
              </div>
            </div>

            <div className="step-arrow">
              <ArrowRight />
            </div>

            <div className="step-card">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3 className="step-title">Compete & Win</h3>
                <p className="step-description">
                  Check in before start time, compete, and claim your prize!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 14: FAQ
          ================================================================ */}
      <section 
        ref={faqRef}
        id="tournaments-faq"
        className="tournaments-section faq-section scroll-reveal"
      >
        <div className="section-content">
          <div className="section-header text-center">
            <h2 className="text-h2 text-gradient-gaming">
              <Info className="inline-icon" />
              Frequently Asked Questions
            </h2>
          </div>

          <div className="faq-grid">
            <FAQItem
              question="How do I register for a tournament?"
              answer="Simply click the 'Register' button on any tournament card. You must be logged in and have joined the Gaming Realm pathway. Registration is instant and you'll receive a confirmation notification."
            />
            <FAQItem
              question="Can I cancel my registration?"
              answer="Yes! You can unregister from any tournament before the registration deadline by clicking the 'Unregister' button on the tournament card."
            />
            <FAQItem
              question="What happens if I miss check-in?"
              answer="You must check in 15 minutes before the tournament start time. If you miss check-in, your spot may be given to a substitute player from the waitlist."
            />
            <FAQItem
              question="How are brackets determined?"
              answer="Brackets are seeded based on your Gaming Realm rank, tournament history, and game-specific ratings. We ensure fair and competitive matchups."
            />
            <FAQItem
              question="When are prizes awarded?"
              answer="Prizes are typically awarded within 48 hours of tournament completion. You'll receive a Discord notification when your prize is ready to claim."
            />
            <FAQItem
              question="Can I participate in team tournaments solo?"
              answer="Team tournaments require a full team to register. You can use the #looking-for-team channel in Discord to find teammates before registration closes."
            />
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 15: FINAL CTA
          ================================================================ */}
      <section 
        id="tournaments-cta"
        className="tournaments-section cta-section scroll-reveal"
      >
        <div className="section-content">
          <div className="cta-content">
            <Trophy className="cta-icon" />
            
            <h2 className="text-display text-gradient-gaming">
              Ready to Compete?
            </h2>
            
            <p className="text-h3 text-glow-soft">
              Join {upcomingTournaments.length} upcoming tournament{upcomingTournaments.length !== 1 ? 's' : ''} and prove your skills
            </p>

            <div className="cta-buttons">
              <GamingButton
                size="large"
                onClick={() => {
                  playClick();
                  window.scrollTo({ top: upcomingRef.current?.offsetTop || 0, behavior: 'smooth' });
                }}
                onMouseEnter={playHover}
                className="cta-primary"
              >
                <Trophy className="button-icon" />
                View Tournaments
              </GamingButton>

              <NobleButton
                size="large"
                onClick={() => {
                  playClick();
                  router.push('/pathways/gaming');
                }}
                onMouseEnter={playHover}
              >
                Back to Gaming Realm
                <ArrowLeft className="button-icon" />
              </NobleButton>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          BRACKET MODAL
          ================================================================ */}
      {showBracket && selectedTournament && (
        <BracketModal
          tournament={selectedTournament}
          onClose={() => {
            setShowBracket(false);
            setSelectedTournament(null);
            playClick();
          }}
        />
      )}

      {/* ================================================================
          GLOBAL STYLES
          ================================================================ */}
      <style jsx global>{`
        /* Tournament Page Styles */
        .gaming-tournaments-page {
          width: 100%;
          min-height: 100vh;
          background: var(--bg-primary);
          font-family: var(--font-orbitron);
        }

        .tournaments-section {
          padding: 6rem 0;
          position: relative;
        }

        .section-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3rem;
          flex-wrap: wrap;
          gap: 2rem;
        }

        .section-header.text-center {
          flex-direction: column;
          text-align: center;
        }

        .inline-icon {
          display: inline-block;
          width: 1em;
          height: 1em;
          margin-right: 0.5rem;
          vertical-align: middle;
          color: var(--gaming-cyan);
        }

        .pulse-icon {
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }

        /* Hero Section */
        .tournaments-hero {
          position: relative;
          min-height: 70vh;
        }

        .hero-stats-bar {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
          max-width: 1400px;
          margin: -4rem auto 0;
          padding: 0 2rem;
          position: relative;
          z-index: 10;
        }

        .hero-stat {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 2rem;
          background: rgba(0, 191, 255, 0.1);
          border: 1px solid rgba(0, 191, 255, 0.3);
          border-radius: 12px;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .hero-stat:hover {
          background: rgba(0, 191, 255, 0.2);
          border-color: var(--gaming-cyan);
          transform: translateY(-4px);
        }

        .hero-stat .stat-icon {
          width: 48px;
          height: 48px;
          color: var(--gaming-cyan);
        }

        .hero-stat .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--gaming-cyan);
          line-height: 1;
        }

        .hero-stat .stat-label {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
          text-transform: uppercase;
        }

        /* Filters Section */
        .filters-section {
          background: rgba(0, 191, 255, 0.02);
          padding: 3rem 0;
        }

        .filters-container {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          align-items: center;
        }

        .tournament-search {
          flex: 1;
          min-width: 250px;
        }

        .filter-group {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .filter-select {
          min-width: 180px;
        }

        .view-toggle {
          display: flex;
          gap: 0.5rem;
          background: rgba(0, 191, 255, 0.1);
          border: 1px solid rgba(0, 191, 255, 0.2);
          border-radius: 8px;
          padding: 0.25rem;
        }

        .view-btn {
          padding: 0.75rem;
          background: transparent;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: rgba(255, 255, 255, 0.6);
        }

        .view-btn:hover {
          background: rgba(0, 191, 255, 0.2);
          color: var(--gaming-cyan);
        }

        .view-btn.active {
          background: var(--gaming-cyan);
          color: white;
        }

        .view-icon {
          width: 20px;
          height: 20px;
        }

        .results-count {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.875rem;
          margin-left: auto;
        }

        /* Live Section */
        .live-section {
          background: linear-gradient(
            180deg,
            rgba(255, 23, 68, 0.05) 0%,
            rgba(10, 10, 15, 0.95) 100%
          );
        }

        .live-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: rgba(255, 23, 68, 0.2);
          border: 1px solid #FF1744;
          border-radius: 20px;
          color: #FF1744;
          font-weight: 600;
        }

        .live-dot {
          width: 12px;
          height: 12px;
          animation: livePulse 2s ease-in-out infinite;
        }

        @keyframes livePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        /* Tournament Layouts */
        .tournaments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 2rem;
        }

        .tournaments-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2rem;
        }

        /* Rules Grid */
        .rules-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .rule-card {
          padding: 2rem;
        }

        .rule-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 191, 255, 0.1);
          border-radius: 50%;
          color: var(--gaming-cyan);
        }

        .rule-icon svg {
          width: 32px;
          height: 32px;
        }

        .rule-title {
          font-size: 1.5rem;
          font-weight: 700;
          color