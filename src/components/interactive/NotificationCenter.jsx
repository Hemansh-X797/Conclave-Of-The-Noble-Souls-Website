import React, { useState, useEffect, useCallback, useRef } from 'react';
import ' @/styles/interactive.css';

const NotificationCenter = ({
  position = 'bottom-right',
  autoCloseDuration = 5000,
  maxNotifications = 5,
  className = '',
  ...props
}) => {
  const [notifications, setNotifications] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);
  const timersRef = useRef({});

  useEffect(() => {
    // Cleanup timers on unmount
    return () => {
      Object.values(timersRef.current).forEach(timer => clearTimeout(timer));
    };
  }, []);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotif = {
      id,
      type: notification.type || 'info',
      pathway: notification.pathway || null,
      title: notification.title,
      message: notification.message,
      icon: notification.icon || getDefaultIcon(notification.type, notification.pathway),
      actions: notification.actions || [],
      duration: notification.duration !== undefined ? notification.duration : autoCloseDuration,
      createdAt: Date.now()
    };

    setNotifications(prev => {
      const updated = [newNotif, ...prev];
      return updated.slice(0, maxNotifications);
    });

    // Auto-close if duration is set
    if (newNotif.duration > 0) {
      timersRef.current[id] = setTimeout(() => {
        removeNotification(id);
      }, newNotif.duration);
    }

    return id;
  }, [autoCloseDuration, maxNotifications]);

  const removeNotification = useCallback((id) => {
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }

    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const pauseTimer = useCallback((id) => {
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
    }
  }, []);

  const resumeTimer = useCallback((id, remainingTime) => {
    const notification = notifications.find(n => n.id === id);
    if (!notification || notification.duration <= 0) return;

    timersRef.current[id] = setTimeout(() => {
      removeNotification(id);
    }, remainingTime);
  }, [notifications, removeNotification]);

  const handleMouseEnter = (id) => {
    setHoveredId(id);
    pauseTimer(id);
  };

  const handleMouseLeave = (id) => {
    setHoveredId(null);
    const notification = notifications.find(n => n.id === id);
    if (notification && notification.duration > 0) {
      const elapsed = Date.now() - notification.createdAt;
      const remaining = notification.duration - elapsed;
      if (remaining > 0) {
        resumeTimer(id, remaining);
      } else {
        removeNotification(id);
      }
    }
  };

  return (
    <div className={`notification-center ${className}`} {...props}>
      <div className="notification-stack">
        {notifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id)}
            onMouseEnter={() => handleMouseEnter(notification.id)}
            onMouseLeave={() => handleMouseLeave(notification.id)}
            isHovered={hoveredId === notification.id}
          />
        ))}
      </div>
    </div>
  );
};

const NotificationToast = ({
  notification,
  onClose,
  onMouseEnter,
  onMouseLeave,
  isHovered
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const progressRef = useRef(null);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  const getNotificationClass = () => {
    const classes = ['notification-toast'];
    
    if (notification.pathway) {
      classes.push(notification.pathway);
    } else {
      classes.push(notification.type);
    }
    
    if (isExiting) classes.push('exit');
    
    return classes.join(' ');
  };

  const handleActionClick = (action) => {
    if (action.onClick) {
      action.onClick();
    }
    handleClose();
  };

  return (
    <div
      className={getNotificationClass()}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      data-cursor="hover"
    >
      <div className="notification-content">
        <div className="notification-icon">{notification.icon}</div>
        <div className="notification-body">
          {notification.title && (
            <div className="notification-title">{notification.title}</div>
          )}
          <div className="notification-message">{notification.message}</div>
          {notification.actions && notification.actions.length > 0 && (
            <div className="notification-actions">
              {notification.actions.map((action, index) => (
                <button
                  key={index}
                  className={`notification-action-btn ${action.primary ? 'primary' : ''}`}
                  onClick={() => handleActionClick(action)}
                  data-cursor="hover"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        className="notification-close"
        onClick={handleClose}
        data-cursor="hover"
        aria-label="Close notification"
      >
        ✕
      </button>

      {notification.duration > 0 && (
        <div className="notification-progress">
          <div
            ref={progressRef}
            className="notification-progress-bar"
            style={{
              animationDuration: `${notification.duration}ms`,
              animationPlayState: isHovered ? 'paused' : 'running'
            }}
          />
        </div>
      )}
    </div>
  );
};

// Get default icon based on type/pathway
const getDefaultIcon = (type, pathway) => {
  if (pathway) {
    const pathwayIcons = {
      gaming: '⚔️',
      lorebound: '✦',
      productive: '⚡',
      news: '◆'
    };
    return pathwayIcons[pathway] || '📢';
  }

  const typeIcons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };
  return typeIcons[type] || '📢';
};

// Create singleton instance
let notificationInstance = null;

const getNotificationInstance = () => {
  if (!notificationInstance) {
    const container = document.createElement('div');
    container.id = 'notification-center-root';
    document.body.appendChild(container);

    const NotificationWrapper = () => {
      const [, forceUpdate] = useState(0);
      
      useEffect(() => {
        notificationInstance = {
          add: (notification) => {
            if (wrapperRef.current) {
              return wrapperRef.current.addNotification(notification);
            }
          },
          remove: (id) => {
            if (wrapperRef.current) {
              wrapperRef.current.removeNotification(id);
            }
          }
        };
        forceUpdate(1);
      }, []);

      const wrapperRef = useRef(null);

      return <NotificationCenter ref={wrapperRef} />;
    };

    // This would need ReactDOM.render in actual implementation
    // For now, we'll export the API functions
  }
  return notificationInstance;
};

// Public API
export const notify = {
  success: (message, options = {}) => {
    return addNotificationToQueue({
      type: 'success',
      message,
      ...options
    });
  },

  error: (message, options = {}) => {
    return addNotificationToQueue({
      type: 'error',
      message,
      duration: options.duration || 7000,
      ...options
    });
  },

  warning: (message, options = {}) => {
    return addNotificationToQueue({
      type: 'warning',
      message,
      ...options
    });
  },

  info: (message, options = {}) => {
    return addNotificationToQueue({
      type: 'info',
      message,
      ...options
    });
  },

  gaming: (message, options = {}) => {
    return addNotificationToQueue({
      pathway: 'gaming',
      message,
      ...options
    });
  },

  lorebound: (message, options = {}) => {
    return addNotificationToQueue({
      pathway: 'lorebound',
      message,
      ...options
    });
  },

  productive: (message, options = {}) => {
    return addNotificationToQueue({
      pathway: 'productive',
      message,
      ...options
    });
  },

  news: (message, options = {}) => {
    return addNotificationToQueue({
      pathway: 'news',
      message,
      ...options
    });
  },

  custom: (options) => {
    return addNotificationToQueue(options);
  }
};

// Queue system for notifications
let notificationQueue = [];
let queueProcessor = null;

const addNotificationToQueue = (notification) => {
  notificationQueue.push(notification);
  processQueue();
  return notification;
};

const processQueue = () => {
  if (queueProcessor) return;
  
  queueProcessor = setInterval(() => {
    if (notificationQueue.length > 0) {
      const notification = notificationQueue.shift();
      if (typeof window !== 'undefined' && window.__notificationCenter) {
        window.__notificationCenter(notification);
      }
    }
    
    if (notificationQueue.length === 0) {
      clearInterval(queueProcessor);
      queueProcessor = null;
    }
  }, 100);
};

// Hook for using notifications in components
export const useNotifications = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Check if notification center is mounted
    if (typeof window !== 'undefined') {
      const checkReady = setInterval(() => {
        if (window.__notificationCenter) {
          setReady(true);
          clearInterval(checkReady);
        }
      }, 100);

      return () => clearInterval(checkReady);
    }
  }, []);

  return {
    notify,
    ready
  };
};

// React hook to integrate with NotificationCenter component
export const useNotificationCenter = (centerRef) => {
  useEffect(() => {
    if (centerRef && centerRef.current) {
      window.__notificationCenter = (notification) => {
        return centerRef.current.addNotification(notification);
      };
    }

    return () => {
      delete window.__notificationCenter;
    };
  }, [centerRef]);
};

// Example usage component
export const NotificationExample = () => {
  return (
    <div style={{ padding: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      <button onClick={() => notify.success('Operation completed successfully!')}>
        Success
      </button>
      <button onClick={() => notify.error('Something went wrong!')}>
        Error
      </button>
      <button onClick={() => notify.warning('Please be careful!')}>
        Warning
      </button>
      <button onClick={() => notify.info('Here is some information')}>
        Info
      </button>
      <button onClick={() => notify.gaming('Gaming tournament starting!', { title: 'Tournament Alert' })}>
        Gaming
      </button>
      <button onClick={() => notify.lorebound('New chapter released!', { title: 'Lorebound Update' })}>
        Lorebound
      </button>
      <button onClick={() => notify.productive('Goal achieved!', { title: 'Achievement' })}>
        Productive
      </button>
      <button onClick={() => notify.news('Breaking news!', { title: 'News Flash' })}>
        News
      </button>
      <button onClick={() => notify.custom({
        type: 'success',
        title: 'Custom Notification',
        message: 'This has custom actions!',
        actions: [
          { label: 'View', primary: true, onClick: () => alert('Viewed!') },
          { label: 'Dismiss', onClick: () => console.log('Dismissed') }
        ]
      })}>
        With Actions
      </button>
    </div>
  );
};

export default NotificationCenter;