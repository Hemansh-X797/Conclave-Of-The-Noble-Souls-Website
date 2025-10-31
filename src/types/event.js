// ============================================================================
// EVENT TYPE DEFINITIONS
// Type structures and validators for event data
// /src/types/event.js
// ============================================================================

/**
 * @typedef {Object} Event
 * @property {string} id - Unique event identifier
 * @property {string} title - Event title
 * @property {string} description - Event description
 * @property {EventType} type - Event type object
 * @property {string|null} pathway - Associated pathway ID
 * @property {EventSchedule} schedule - Event scheduling information
 * @property {number|null} maxParticipants - Maximum participants (null = unlimited)
 * @property {string[]} participants - Array of user IDs
 * @property {string} host - Event host name/role
 * @property {string[]} requirements - Requirements to join (role names, etc.)
 * @property {EventRewards} rewards - Event rewards
 * @property {boolean} isActive - Whether event is active
 * @property {EventStatus} status - Current event status
 * @property {Date} date - Event date (for upcoming events)
 * @property {string} createdAt - ISO timestamp
 * @property {string|null} updatedAt - ISO timestamp
 */

/**
 * @typedef {Object} EventType
 * @property {string} id - Type identifier
 * @property {string} name - Type display name
 * @property {string} icon - Type icon/emoji
 * @property {string} color - Type color
 * @property {string|null} pathway - Associated pathway
 */

/**
 * @typedef {Object} EventSchedule
 * @property {string} frequency - 'once', 'daily', 'weekly', 'monthly'
 * @property {number|null} dayOfWeek - Day of week (0-6, Sunday=0)
 * @property {number|null} dayOfMonth - Day of month (1-31)
 * @property {string|null} time - Time in HH:MM format
 * @property {number} duration - Duration in minutes
 * @property {string} timezone - Timezone (e.g., 'UTC', 'America/New_York')
 */

/**
 * @typedef {Object} EventRewards
 * @property {number} xp - XP reward
 * @property {string[]} badges - Badge/achievement IDs
 * @property {Object.<string, any>} custom - Custom rewards per pathway
 */

/**
 * @typedef {Object} EventTemplate
 * @property {string} title - Template title
 * @property {string} description - Template description
 * @property {EventType} type - Event type
 * @property {string} pathway - Pathway ID
 * @property {number} duration - Duration in minutes
 * @property {number|null} maxParticipants - Max participants
 * @property {string[]} requirements - Requirements
 * @property {EventRewards} rewards - Rewards
 * @property {Object.<string, any>} prizes - Prize structure (for tournaments)
 */

/**
 * @typedef {'upcoming'|'ongoing'|'completed'|'cancelled'} EventStatus
 */

// ============================================================================
// VALIDATORS
// ============================================================================

/**
 * Validate event object structure
 * @param {Event} event - Event to validate
 * @returns {boolean}
 */
export function isValidEvent(event) {
  return (
    event &&
    typeof event.id === 'string' &&
    typeof event.title === 'string' &&
    event.type &&
    typeof event.type.id === 'string' &&
    event.schedule &&
    typeof event.schedule.duration === 'number'
  );
}

/**
 * Validate event schedule
 * @param {EventSchedule} schedule - Schedule to validate
 * @returns {boolean}
 */
export function isValidEventSchedule(schedule) {
  const validFrequencies = ['once', 'daily', 'weekly', 'monthly'];
  
  return (
    schedule &&
    validFrequencies.includes(schedule.frequency) &&
    typeof schedule.duration === 'number' &&
    schedule.duration > 0
  );
}

/**
 * Validate event status
 * @param {EventStatus} status - Status to validate
 * @returns {boolean}
 */
export function isValidEventStatus(status) {
  const validStatuses = ['upcoming', 'ongoing', 'completed', 'cancelled'];
  return validStatuses.includes(status);
}

// ============================================================================
// TRANSFORMERS
// ============================================================================

/**
 * Calculate next occurrence of recurring event
 * @param {Event} event - Event with schedule
 * @param {Date} fromDate - Calculate from this date
 * @returns {Date|null}
 */
export function calculateNextOccurrence(event, fromDate = new Date()) {
  const { schedule } = event;
  
  if (schedule.frequency === 'once') {
    return event.date || null;
  }
  
  const next = new Date(fromDate);
  
  if (schedule.frequency === 'daily') {
    if (schedule.time) {
      const [hours, minutes] = schedule.time.split(':');
      next.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      if (next <= fromDate) {
        next.setDate(next.getDate() + 1);
      }
    }
    return next;
  }
  
  if (schedule.frequency === 'weekly' && schedule.dayOfWeek !== null) {
    const daysUntil = (schedule.dayOfWeek - next.getDay() + 7) % 7;
    next.setDate(next.getDate() + (daysUntil === 0 ? 7 : daysUntil));
    
    if (schedule.time) {
      const [hours, minutes] = schedule.time.split(':');
      next.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }
    return next;
  }
  
  if (schedule.frequency === 'monthly' && schedule.dayOfMonth) {
    next.setDate(schedule.dayOfMonth);
    if (next <= fromDate) {
      next.setMonth(next.getMonth() + 1);
    }
    
    if (schedule.time) {
      const [hours, minutes] = schedule.time.split(':');
      next.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }
    return next;
  }
  
  return null;
}

/**
 * Format event date and time
 * @param {Event} event - Event object
 * @returns {string}
 */
export function formatEventDateTime(event) {
  const nextDate = event.date || calculateNextOccurrence(event);
  if (!nextDate) return 'Schedule TBD';
  
  return new Date(nextDate).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Get event duration in human readable format
 * @param {number} minutes - Duration in minutes
 * @returns {string}
 */
export function formatEventDuration(minutes) {
  if (minutes < 60) {
    return `${minutes} minutes`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  
  return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minutes`;
}

/**
 * Check if user can join event
 * @param {Event} event - Event to check
 * @param {string[]} userRoles - User's role names
 * @returns {Object} {canJoin: boolean, reason: string}
 */
export function canUserJoinEvent(event, userRoles = []) {
  // Check if event is full
  if (event.maxParticipants && event.participants.length >= event.maxParticipants) {
    return {
      canJoin: false,
      reason: 'Event is full'
    };
  }
  
  // Check if user already joined
  if (event.participants.includes('currentUserId')) { // Replace with actual user ID check
    return {
      canJoin: false,
      reason: 'Already joined'
    };
  }
  
  // Check if event is active
  if (!event.isActive) {
    return {
      canJoin: false,
      reason: 'Event is not active'
    };
  }
  
  // Check if event is completed or cancelled
  if (event.status === 'completed' || event.status === 'cancelled') {
    return {
      canJoin: false,
      reason: `Event is ${event.status}`
    };
  }
  
  // Check role requirements
  if (event.requirements && event.requirements.length > 0) {
    const hasRequiredRole = event.requirements.some(req =>
      userRoles.some(role => role === req)
    );
    
    if (!hasRequiredRole) {
      return {
        canJoin: false,
        reason: `Requires: ${event.requirements.join(' or ')}`
      };
    }
  }
  
  return {
    canJoin: true,
    reason: ''
  };
}

/**
 * Get event status based on date and time
 * @param {Event} event - Event to check
 * @returns {EventStatus}
 */
export function getEventStatus(event) {
  if (event.status === 'cancelled') {
    return 'cancelled';
  }
  
  const now = new Date();
  const eventDate = event.date || calculateNextOccurrence(event);
  
  if (!eventDate) {
    return 'upcoming';
  }
  
  const eventEnd = new Date(eventDate.getTime() + event.schedule.duration * 60000);
  
  if (now < eventDate) {
    return 'upcoming';
  }
  
  if (now >= eventDate && now < eventEnd) {
    return 'ongoing';
  }
  
  return 'completed';
}

/**
 * Create event from template
 * @param {EventTemplate} template - Event template
 * @param {Object} customData - Custom data to override
 * @returns {Event}
 */
export function createEventFromTemplate(template, customData = {}) {
  return {
    id: `${template.type.id}-${Date.now()}`,
    title: template.title,
    description: template.description,
    type: template.type,
    pathway: template.pathway,
    schedule: {
      frequency: 'once',
      dayOfWeek: null,
      dayOfMonth: null,
      time: null,
      duration: template.duration,
      timezone: 'UTC'
    },
    maxParticipants: template.maxParticipants,
    participants: [],
    host: 'Event Team',
    requirements: template.requirements,
    rewards: template.rewards,
    isActive: true,
    status: 'upcoming',
    date: new Date(),
    createdAt: new Date().toISOString(),
    updatedAt: null,
    ...customData
  };
}

/**
 * Get events happening within date range
 * @param {Event[]} events - Array of events
 * @param {Date} startDate - Range start
 * @param {Date} endDate - Range end
 * @returns {Event[]}
 */
export function getEventsInDateRange(events, startDate, endDate) {
  return events.filter(event => {
    const eventDate = event.date || calculateNextOccurrence(event, startDate);
    return eventDate && eventDate >= startDate && eventDate <= endDate;
  }).sort((a, b) => {
    const dateA = a.date || calculateNextOccurrence(a);
    const dateB = b.date || calculateNextOccurrence(b);
    return dateA - dateB;
  });
}

/**
 * Get upcoming events (next 7 days)
 * @param {Event[]} events - Array of events
 * @returns {Event[]}
 */
export function getUpcomingEvents(events) {
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  return getEventsInDateRange(events, now, weekFromNow);
}

/**
 * Get events by pathway
 * @param {Event[]} events - Array of events
 * @param {string} pathwayId - Pathway ID
 * @returns {Event[]}
 */
export function getEventsByPathway(events, pathwayId) {
  return events.filter(event => event.pathway === pathwayId);
}

/**
 * Get events by type
 * @param {Event[]} events - Array of events
 * @param {string} typeId - Event type ID
 * @returns {Event[]}
 */
export function getEventsByType(events, typeId) {
  return events.filter(event => event.type.id === typeId);
}

/**
 * Calculate event attendance rate
 * @param {Event} event - Event object
 * @returns {number} Percentage (0-100)
 */
export function calculateAttendanceRate(event) {
  if (!event.maxParticipants) return 0;
  return Math.round((event.participants.length / event.maxParticipants) * 100);
}

/**
 * Check if event is recurring
 * @param {Event} event - Event to check
 * @returns {boolean}
 */
export function isRecurringEvent(event) {
  return event.schedule.frequency !== 'once';
}

/**
 * Get event color based on pathway or type
 * @param {Event} event - Event object
 * @returns {string} Hex color
 */
export function getEventColor(event) {
  return event.type.color;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  isValidEvent,
  isValidEventSchedule,
  isValidEventStatus,
  calculateNextOccurrence,
  formatEventDateTime,
  formatEventDuration,
  canUserJoinEvent,
  getEventStatus,
  createEventFromTemplate,
  getEventsInDateRange,
  getUpcomingEvents,
  getEventsByPathway,
  getEventsByType,
  calculateAttendanceRate,
  isRecurringEvent,
  getEventColor
};