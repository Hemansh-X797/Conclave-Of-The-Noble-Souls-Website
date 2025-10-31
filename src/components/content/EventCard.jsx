import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import '@/styles/content.css';
import { TextFlameButton, TextDimButton, NobleButton } from '@/ui/Luxurybutton';

const EventCard = ({
  event,
  pathway = 'default',
  size = 'md',
  onClick,
  onRegister,
  onShare,
  onRemind,
  showCountdown = true,
  showParticipants = true,
  showRewards = true,
  showHost = true,
  showTags = true,
  animated = true,
  featured = false,
  className = '',
  ...props
}) => {
  const router = useRouter();
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isRegistered, setIsRegistered] = useState(event.isRegistered || false);
  const [participantCount, setParticipantCount] = useState(event.participants?.count || 0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [reminded, setReminded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [tiltStyle, setTiltStyle] = useState({});
  
  const timerRef = useRef(null);
  const cardRef = useRef(null);
  const shareMenuRef = useRef(null);

  // Countdown timer
  useEffect(() => {
    if (event.status === 'upcoming' && event.startDate && showCountdown) {
      updateCountdown();
      timerRef.current = setInterval(updateCountdown, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [event.startDate, event.status, showCountdown]);

  // 3D tilt effect on mouse move
  useEffect(() => {
    if (!animated || !cardRef.current) return;

    const handleMouseMove = (e) => {
      if (!isHovered) return;
      
      const card = cardRef.current;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;
      
      setTiltStyle({
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`
      });
    };

    const handleMouseLeave = () => {
      setTiltStyle({
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)'
      });
    };

    const card = cardRef.current;
    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isHovered, animated]);

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target)) {
        setShowShareMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateCountdown = () => {
    const now = new Date().getTime();
    const start = new Date(event.startDate).getTime();
    const distance = start - now;

    if (distance < 0) {
      setTimeRemaining(null);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      return;
    }

    setTimeRemaining({
      days: Math.floor(distance / (1000 * 60 * 60 * 24)),
      hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((distance % (1000 * 60)) / 1000)
    });
  };

  const handleClick = () => {
    if (onClick) {
      onClick(event);
    } else {
      router.push(`/events/${event.id}`);
    }
  };

  const handleRegister = async (e) => {
    e.stopPropagation();
    
    if (isRegistered) {
      // Unregister
      setIsRegistered(false);
      setParticipantCount(prev => Math.max(0, prev - 1));
    } else {
      // Register
      setIsRegistered(true);
      setParticipantCount(prev => prev + 1);
    }
    
    if (onRegister) {
      await onRegister(event, !isRegistered);
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    setShowShareMenu(!showShareMenu);
  };

  const handleSharePlatform = async (platform) => {
    const url = `${window.location.origin}/events/${event.id}`;
    const text = `Check out ${event.title}!`;
    
    const shareUrls = {
      discord: `https://discord.com/channels/@me`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      copy: url
    };

    if (platform === 'copy') {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    } else {
      window.open(shareUrls[platform], '_blank');
    }
    
    setShowShareMenu(false);
    
    if (onShare) {
      onShare(event, platform);
    }
  };

  const handleReminder = (e) => {
    e.stopPropagation();
    setReminded(!reminded);
    
    if (onRemind) {
      onRemind(event, !reminded);
    }
  };

  const getEventTypeIcon = (type) => {
    const icons = {
      tournament: '🏆',
      workshop: '🎓',
      gathering: '🎉',
      discussion: '💬',
      competition: '⚔️',
      stream: '📺',
      meetup: '🤝',
      premiere: '🎬',
      default: '🎯'
    };
    return icons[type] || icons.default;
  };

  const getStatusColor = (status) => {
    const colors = {
      upcoming: '#3498DB',
      live: '#2ECC71',
      completed: '#95A5A6',
      cancelled: '#E74C3C'
    };
    return colors[status] || colors.upcoming;
  };

  const formatDuration = (duration) => {
    if (typeof duration === 'string') return duration;
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getParticipantLimit = () => {
    if (!event.maxParticipants) return null;
    const percentage = (participantCount / event.maxParticipants) * 100;
    return { total: event.maxParticipants, percentage };
  };

  const participantLimit = getParticipantLimit();

  return (
    <div
      ref={cardRef}
      className={`event-card ${pathway}-realm content-card-${size} ${featured ? 'featured' : ''} ${className}`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={animated ? tiltStyle : {}}
      data-cursor="hover"
      data-pathway={pathway}
      {...props}
    >
      {featured && (
        <div className="event-featured-badge">
          ⭐ Featured Event
        </div>
      )}

      <div className="event-card-header">
        <div className={`event-card-status ${event.status}`}>
          {event.status === 'live' && '🔴 '}
          {event.status}
        </div>
        <div className="event-card-type">
          {getEventTypeIcon(event.type)} {event.type}
        </div>
      </div>

      {event.image && (
        <div className="event-card-image">
          {!imageLoaded && (
            <div className="skeleton-image" />
          )}
          <Image
            src={event.image}
            alt={event.title}
            fill
            style={{ objectFit: 'cover', opacity: imageLoaded ? 1 : 0 }}
            onLoad={() => setImageLoaded(true)}
          />
          <div className="event-card-image-overlay">
            {event.status === 'live' && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                background: 'rgba(46, 204, 113, 0.9)',
                padding: '6px 12px',
                borderRadius: '20px',
                fontWeight: 'bold',
                fontSize: '14px'
              }}>
                <span style={{ 
                  width: '8px', 
                  height: '8px', 
                  background: '#fff', 
                  borderRadius: '50%',
                  animation: 'statusPulse 1s infinite'
                }} />
                LIVE NOW
              </div>
            )}
            {event.pathway && (
              <div style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                padding: '4px 10px',
                background: 'rgba(0, 0, 0, 0.7)',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {event.pathway}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="event-card-content">
        <h3 className="event-card-title">{event.title}</h3>
        <p className="event-card-description">{event.description}</p>

        {showHost && event.host && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '16px',
            padding: '12px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '8px'
          }}>
            {event.host.avatar && (
              <Image
                src={event.host.avatar}
                alt={event.host.name}
                width={36}
                height={36}
                style={{ borderRadius: '50%', border: '2px solid rgba(255, 255, 255, 0.2)' }}
              />
            )}
            <div>
              <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
                Hosted by
              </div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>
                {event.host.name}
              </div>
            </div>
          </div>
        )}

        <div className="event-card-meta">
          <div className="event-card-meta-item">
            <span className="event-card-meta-icon">📅</span>
            <span>{new Date(event.startDate).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}</span>
          </div>
          <div className="event-card-meta-item">
            <span className="event-card-meta-icon">🕐</span>
            <span>{new Date(event.startDate).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true
            })}</span>
          </div>
          {event.duration && (
            <div className="event-card-meta-item">
              <span className="event-card-meta-icon">⏱️</span>
              <span>{formatDuration(event.duration)}</span>
            </div>
          )}
          {event.location && (
            <div className="event-card-meta-item">
              <span className="event-card-meta-icon">📍</span>
              <span>{event.location}</span>
            </div>
          )}
        </div>

        {showCountdown && event.status === 'upcoming' && timeRemaining && (
          <div className="event-countdown">
            {timeRemaining.days > 0 && (
              <div className="event-countdown-item">
                <div className="event-countdown-value">{timeRemaining.days}</div>
                <div className="event-countdown-label">Days</div>
              </div>
            )}
            <div className="event-countdown-item">
              <div className="event-countdown-value">{timeRemaining.hours}</div>
              <div className="event-countdown-label">Hours</div>
            </div>
            <div className="event-countdown-item">
              <div className="event-countdown-value">{timeRemaining.minutes}</div>
              <div className="event-countdown-label">Min</div>
            </div>
            <div className="event-countdown-item">
              <div className="event-countdown-value">{timeRemaining.seconds}</div>
              <div className="event-countdown-label">Sec</div>
            </div>
          </div>
        )}

        {showParticipants && (
          <div className="event-participants">
            <div className="event-participants-count">
              <span>👥</span>
              <span>
                {participantCount} {event.maxParticipants ? `/ ${event.maxParticipants}` : ''} Registered
              </span>
            </div>
            {event.participants?.avatars && event.participants.avatars.length > 0 && (
              <div className="event-participants-avatars">
                {event.participants.avatars.slice(0, 5).map((avatar, index) => (
                  <Image
                    key={index}
                    src={avatar}
                    alt={`Participant ${index + 1}`}
                    width={32}
                    height={32}
                    className="event-participant-avatar"
                  />
                ))}
                {participantCount > 5 && (
                  <div className="event-participant-avatar" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: 'rgba(255, 215, 0, 0.2)',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#FFD700'
                  }}>
                    +{participantCount - 5}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {participantLimit && (
          <div style={{ marginTop: '12px' }}>
            <div style={{
              height: '6px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${Math.min(participantLimit.percentage, 100)}%`,
                background: participantLimit.percentage >= 90 
                  ? 'linear-gradient(90deg, #E74C3C, #C0392B)' 
                  : 'linear-gradient(90deg, #FFD700, #FFA500)',
                transition: 'width 0.3s ease',
                boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)'
              }} />
            </div>
            {participantLimit.percentage >= 90 && (
              <div style={{ 
                marginTop: '6px', 
                fontSize: '12px', 
                color: '#E74C3C',
                fontWeight: '600'
              }}>
                ⚠️ Almost Full!
              </div>
            )}
          </div>
        )}

        {showRewards && event.rewards && event.rewards.length > 0 && (
          <div className="event-rewards">
            {event.rewards.map((reward, index) => (
              <div key={index} className="event-reward-badge">
                <span className="event-reward-icon">{reward.icon || '🏅'}</span>
                <span>{reward.label}</span>
              </div>
            ))}
          </div>
        )}

        {showTags && event.tags && event.tags.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginTop: '16px'
          }}>
            {event.tags.map((tag, index) => (
              <span
                key={index}
                style={{
                  padding: '4px 10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  transition: 'all 0.2s ease'
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="event-card-footer">
        <div className="event-card-actions">
          {event.status === 'upcoming' && (
            <TextFlameButton 
              size="sm" 
              onClick={handleRegister}
              style={{
                background: isRegistered ? 'rgba(46, 204, 113, 0.2)' : undefined,
                borderColor: isRegistered ? '#2ECC71' : undefined
              }}
            >
              {isRegistered ? '✓ Registered' : 'Register Now'}
            </TextFlameButton>
          )}
          {event.status === 'live' && (
            <NobleButton size="sm" onClick={handleRegister} animated="pulse">
              Join Now
            </NobleButton>
          )}
          {event.status === 'completed' && (
            <TextDimButton size="sm" onClick={handleClick}>
              View Results
            </TextDimButton>
          )}
          
          <TextDimButton size="sm" onClick={handleClick}>
            Details
          </TextDimButton>

          {event.status === 'upcoming' && (
            <button
              onClick={handleReminder}
              style={{
                padding: '8px 16px',
                background: reminded ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: reminded ? '1px solid #FFD700' : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                color: reminded ? '#FFD700' : 'rgba(255, 255, 255, 0.8)',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'Josefin Sans, sans-serif'
              }}
              data-cursor="hover"
            >
              {reminded ? '🔔 Reminded' : '🔔 Remind Me'}
            </button>
          )}

          <div style={{ position: 'relative' }} ref={shareMenuRef}>
            <button
              onClick={handleShare}
              style={{
                padding: '8px 16px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'Josefin Sans, sans-serif'
              }}
              data-cursor="hover"
            >
              📤 Share
            </button>

            {showShareMenu && (
              <div style={{
                position: 'absolute',
                bottom: '110%',
                right: '0',
                background: 'rgba(0, 0, 0, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                minWidth: '140px',
                zIndex: 1000,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
                animation: 'fadeIn 0.2s ease-out'
              }}>
                <button
                  onClick={() => handleSharePlatform('discord')}
                  style={{
                    padding: '8px 12px',
                    background: 'rgba(114, 137, 218, 0.1)',
                    border: '1px solid rgba(114, 137, 218, 0.3)',
                    borderRadius: '6px',
                    color: '#7289DA',
                    fontSize: '13px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'Josefin Sans, sans-serif'
                  }}
                  data-cursor="hover"
                >
                  Discord
                </button>
                <button
                  onClick={() => handleSharePlatform('twitter')}
                  style={{
                    padding: '8px 12px',
                    background: 'rgba(29, 161, 242, 0.1)',
                    border: '1px solid rgba(29, 161, 242, 0.3)',
                    borderRadius: '6px',
                    color: '#1DA1F2',
                    fontSize: '13px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'Josefin Sans, sans-serif'
                  }}
                  data-cursor="hover"
                >
                  Twitter
                </button>
                <button
                  onClick={() => handleSharePlatform('copy')}
                  style={{
                    padding: '8px 12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'Josefin Sans, sans-serif'
                  }}
                  data-cursor="hover"
                >
                  Copy Link
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Skeleton loading
export const EventCardSkeleton = ({ pathway = 'default', size = 'md' }) => (
  <div className={`skeleton-card ${pathway}-realm content-card-${size}`}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
      <div className="skeleton-line" style={{ width: '80px', height: '24px' }} />
      <div className="skeleton-line" style={{ width: '100px', height: '24px' }} />
    </div>
    <div className="skeleton-image" />
    <div className="skeleton-line title" />
    <div className="skeleton-line text" />
    <div className="skeleton-line short" />
    <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
      <div className="skeleton-line" style={{ width: '100px', height: '36px' }} />
      <div className="skeleton-line" style={{ width: '80px', height: '36px' }} />
    </div>
  </div>
);

export default EventCard;