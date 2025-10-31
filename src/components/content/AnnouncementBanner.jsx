import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TextFlameButton, TextDimButton } from '@/ui/Luxurybutton';

/**
 * AnnouncementBanner Component
 * Priority notification system with stacking and animations
 * Fully utilizes content.css styling
 * 
 * @version 2.0 - The Conclave Realm
 */

const AnnouncementBanner = ({
  // Core Props
  id,
  title,
  message,
  priority = 'info', // 'info', 'important', 'critical', 'emergency'
  icon,
  
  // Display Options
  dismissible = true,
  autoDismiss = false,
  dismissAfter = 10000, // milliseconds
  
  // Actions
  actions = [],
  onDismiss,
  onActionClick,
  
  // Customization
  className = '',
  style = {},
  
  // Debug
  debug = false,
  
  ...restProps
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const bannerRef = useRef(null);
  const timeoutRef = useRef(null);
  
  // Priority icons
  const priorityIcons = {
    info: 'ℹ️',
    important: '⚠️',
    critical: '🔴',
    emergency: '🚨'
  };
  
  // Auto-dismiss timer
  useEffect(() => {
    if (!autoDismiss || dismissed) return;
    
    timeoutRef.current = setTimeout(() => {
      handleDismiss();
    }, dismissAfter);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [autoDismiss, dismissAfter, dismissed]);
  
  // Handle dismiss
  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    
    setTimeout(() => {
      setDismissed(true);
      if (onDismiss) {
        onDismiss(id);
      }
    }, 300); // Match animation duration
  }, [id, onDismiss]);
  
  // Handle action click
  const handleActionClick = useCallback((action, e) => {
    e.stopPropagation();
    
    if (action.onClick) {
      action.onClick(e);
    }
    
    if (onActionClick) {
      onActionClick(action, id);
    }
    
    if (action.dismissOnClick !== false) {
      handleDismiss();
    }
  }, [id, onActionClick, handleDismiss]);
  
  // Don't render if dismissed
  if (dismissed) return null;
  
  // Generate classes
  const classes = [
    'announcement-banner',
    priority,
    isExiting ? 'exit' : ''
  ];
  
  if (className) classes.push(className);
  
  return (
    <div
      ref={bannerRef}
      className={classes.join(' ')}
      style={style}
      role="alert"
      aria-live={priority === 'emergency' || priority === 'critical' ? 'assertive' : 'polite'}
      data-cursor="default"
      {...restProps}
    >
      <div className="announcement-banner-content">
        {/* Icon */}
        <div className="announcement-banner-icon">
          {icon || priorityIcons[priority]}
        </div>
        
        {/* Body */}
        <div className="announcement-banner-body">
          {title && (
            <h4 className="announcement-banner-title">{title}</h4>
          )}
          <p className="announcement-banner-message">{message}</p>
        </div>
        
        {/* Actions */}
        {actions.length > 0 && (
          <div className="announcement-banner-actions">
            {actions.map((action, index) => (
              <button
                key={index}
                className={`announcement-banner-action ${action.primary ? 'primary' : ''}`}
                onClick={(e) => handleActionClick(action, e)}
                data-cursor="hover"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Close button */}
      {dismissible && (
        <button
          className="announcement-banner-close"
          onClick={handleDismiss}
          data-cursor="hover"
          aria-label="Dismiss announcement"
        >
          ✕
        </button>
      )}
    </div>
  );
};

/**
 * AnnouncementBannerStack Component
 * Manages multiple announcement banners
 */
export const AnnouncementBannerStack = ({
  announcements = [],
  maxVisible = 3,
  position = 'top', // 'top', 'bottom'
  onDismiss,
  className = '',
  ...restProps
}) => {
  const [activeAnnouncements, setActiveAnnouncements] = useState([]);
  
  // Update active announcements
  useEffect(() => {
    setActiveAnnouncements(announcements.slice(0, maxVisible));
  }, [announcements, maxVisible]);
  
  // Handle individual dismissal
  const handleDismiss = useCallback((id) => {
    setActiveAnnouncements(prev => prev.filter(a => a.id !== id));
    if (onDismiss) {
      onDismiss(id);
    }
  }, [onDismiss]);
  
  if (activeAnnouncements.length === 0) return null;
  
  return (
    <div 
      className={`announcement-banner-container ${className}`}
      style={{ [position]: '80px' }}
      {...restProps}
    >
      <div className="announcement-banner-stack">
        {activeAnnouncements.map((announcement) => (
          <AnnouncementBanner
            key={announcement.id}
            {...announcement}
            onDismiss={handleDismiss}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Hook for managing announcements globally
 */
export const useAnnouncements = (initialAnnouncements = []) => {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const idCounter = useRef(0);
  
  const addAnnouncement = useCallback((announcement) => {
    const id = announcement.id || `announcement-${Date.now()}-${idCounter.current++}`;
    const newAnnouncement = { ...announcement, id };
    
    setAnnouncements(prev => [newAnnouncement, ...prev]);
    return id;
  }, []);
  
  const removeAnnouncement = useCallback((id) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  }, []);
  
  const clearAll = useCallback(() => {
    setAnnouncements([]);
  }, []);
  
  // Priority shortcuts
  const info = useCallback((message, options = {}) => {
    return addAnnouncement({ priority: 'info', message, ...options });
  }, [addAnnouncement]);
  
  const important = useCallback((message, options = {}) => {
    return addAnnouncement({ priority: 'important', message, ...options });
  }, [addAnnouncement]);
  
  const critical = useCallback((message, options = {}) => {
    return addAnnouncement({ priority: 'critical', message, ...options });
  }, [addAnnouncement]);
  
  const emergency = useCallback((message, options = {}) => {
    return addAnnouncement({ priority: 'emergency', message, ...options });
  }, [addAnnouncement]);
  
  return {
    announcements,
    addAnnouncement,
    removeAnnouncement,
    clearAll,
    info,
    important,
    critical,
    emergency
  };
};

// Pre-configured announcement templates
export const announcementTemplates = {
  newEvent: (eventName) => ({
    title: 'New Event Announced',
    message: `${eventName} has been scheduled. Check it out!`,
    priority: 'important',
    icon: '🎉',
    actions: [
      { label: 'View Event', primary: true },
      { label: 'Dismiss' }
    ]
  }),
  
  maintenance: (duration) => ({
    title: 'Scheduled Maintenance',
    message: `The Conclave will undergo maintenance in ${duration}. Save your progress.`,
    priority: 'important',
    icon: '🔧',
    autoDismiss: false,
    actions: [
      { label: 'More Info', primary: true }
    ]
  }),
  
  tournamentStarting: (minutes) => ({
    title: 'Tournament Starting Soon',
    message: `Your tournament begins in ${minutes} minutes. Get ready!`,
    priority: 'critical',
    icon: '🏆',
    autoDismiss: false,
    actions: [
      { label: 'Join Now', primary: true }
    ]
  }),
  
  serverDown: () => ({
    title: 'Connection Lost',
    message: 'Unable to connect to Discord server. Retrying...',
    priority: 'emergency',
    icon: '⚠️',
    dismissible: false
  }),
  
  welcome: (username) => ({
    title: 'Welcome to The Conclave',
    message: `Welcome, ${username}! Explore the pathways and join your fellow nobles.`,
    priority: 'info',
    icon: '👑',
    autoDismiss: true,
    dismissAfter: 8000,
    actions: [
      { label: 'Take Tour', primary: true }
    ]
  }),
  
  levelUp: (level) => ({
    title: 'Level Up!',
    message: `Congratulations! You've reached level ${level}.`,
    priority: 'info',
    icon: '⭐',
    autoDismiss: true,
    dismissAfter: 5000
  }),
  
  badgeEarned: (badgeName) => ({
    title: 'Badge Earned!',
    message: `You've earned the "${badgeName}" badge.`,
    priority: 'info',
    icon: '🏅',
    autoDismiss: true,
    dismissAfter: 6000,
    actions: [
      { label: 'View Badges', primary: true }
    ]
  }),
  
  pathwayUnlocked: (pathway) => ({
    title: 'Pathway Unlocked',
    message: `You've unlocked the ${pathway} realm. New adventures await!`,
    priority: 'important',
    icon: '✨',
    actions: [
      { label: 'Explore Now', primary: true }
    ]
  })
};

// Sample announcements for demo
export const sampleAnnouncements = [
  {
    id: 'ann-1',
    title: 'Tournament Finals Tonight',
    message: 'The Gaming Realm Championship finals begin at 8 PM EST. Don\'t miss the action!',
    priority: 'important',
    icon: '🏆',
    actions: [
      { label: 'Register', primary: true },
      { label: 'Learn More' }
    ]
  },
  {
    id: 'ann-2',
    title: 'New Lorebound Content',
    message: 'Fresh anime reviews and manga recommendations just dropped!',
    priority: 'info',
    icon: '📚',
    autoDismiss: true,
    dismissAfter: 8000,
    actions: [
      { label: 'Check it Out', primary: true }
    ]
  },
  {
    id: 'ann-3',
    title: 'System Update',
    message: 'The Conclave will be down for maintenance tonight at 2 AM EST for approximately 30 minutes.',
    priority: 'critical',
    icon: '🔧',
    actions: [
      { label: 'Schedule', primary: true }
    ]
  }
];

export default AnnouncementBanner;