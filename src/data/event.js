// ============================================================================
// EVENTS & ACTIVITIES DATA
// Complete event system for The Conclave Realm
// /src/data/events.js
// ============================================================================

export const EVENT_TYPES = {
  TOURNAMENT: {
    id: 'tournament',
    name: 'Tournament',
    icon: '🏆',
    color: '#00BFFF',
    pathway: 'gaming'
  },
  WATCH_PARTY: {
    id: 'watchParty',
    name: 'Watch Party',
    icon: '📺',
    color: '#FF1493',
    pathway: 'lorebound'
  },
  WORKSHOP: {
    id: 'workshop',
    name: 'Workshop',
    icon: '🛠️',
    color: '#50C878',
    pathway: 'productive'
  },
  NEWS_DISCUSSION: {
    id: 'newsDiscussion',
    name: 'News Discussion',
    icon: '📰',
    color: '#E0115F',
    pathway: 'news'
  },
  COMMUNITY: {
    id: 'community',
    name: 'Community Event',
    icon: '🎉',
    color: '#D4AF37',
    pathway: null
  },
  GAME_NIGHT: {
    id: 'gameNight',
    name: 'Game Night',
    icon: '🎮',
    color: '#00BFFF',
    pathway: 'gaming'
  },
  CHALLENGE: {
    id: 'challenge',
    name: 'Challenge',
    icon: '🎯',
    color: '#50C878',
    pathway: 'productive'
  },
  DEBATE: {
    id: 'debate',
    name: 'Debate',
    icon: '💬',
    color: '#E0115F',
    pathway: 'news'
  }
};

export const EVENT_STATUS = {
  UPCOMING: 'upcoming',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const RECURRING_EVENTS = [
  {
    id: 'weekly-gaming-night',
    title: 'Weekly Gaming Night',
    description: 'Join us every Friday night for community gaming sessions. Casual play, fun times, and great company!',
    type: EVENT_TYPES.GAME_NIGHT,
    pathway: 'gaming',
    schedule: {
      frequency: 'weekly',
      dayOfWeek: 5,
      time: '20:00',
      duration: 180,
      timezone: 'UTC'
    },
    maxParticipants: null,
    host: 'Gaming Team',
    requirements: ['Gaming Realm role'],
    rewards: {
      xp: 100,
      badges: ['gaming-enthusiast']
    },
    isActive: true
  },
  
  {
    id: 'anime-watch-party',
    title: 'Anime Watch Party',
    description: 'Weekly anime viewing sessions. Vote on what we watch and enjoy together!',
    type: EVENT_TYPES.WATCH_PARTY,
    pathway: 'lorebound',
    schedule: {
      frequency: 'weekly',
      dayOfWeek: 6,
      time: '19:00',
      duration: 120,
      timezone: 'UTC'
    },
    maxParticipants: null,
    host: 'Lorebound Team',
    requirements: ['Lorebound Realm role'],
    rewards: {
      xp: 75,
      badges: ['anime-enthusiast']
    },
    isActive: true
  },
  
  {
    id: 'productivity-challenge',
    title: '30-Day Productivity Challenge',
    description: 'Monthly productivity challenges to help you build better habits and achieve your goals.',
    type: EVENT_TYPES.CHALLENGE,
    pathway: 'productive',
    schedule: {
      frequency: 'monthly',
      dayOfMonth: 1,
      duration: 43200,
      timezone: 'UTC'
    },
    maxParticipants: null,
    host: 'Productive Team',
    requirements: ['Productive Realm role'],
    rewards: {
      xp: 500,
      badges: ['productivity-champion']
    },
    isActive: true
  },
  
  {
    id: 'news-roundup',
    title: 'Weekly News Roundup',
    description: 'Discuss the week\'s most important news stories and their implications.',
    type: EVENT_TYPES.NEWS_DISCUSSION,
    pathway: 'news',
    schedule: {
      frequency: 'weekly',
      dayOfWeek: 0,
      time: '18:00',
      duration: 90,
      timezone: 'UTC'
    },
    maxParticipants: null,
    host: 'News Team',
    requirements: ['News Nexus role'],
    rewards: {
      xp: 80,
      badges: ['informed-citizen']
    },
    isActive: true
  }
];

export const EVENT_TEMPLATES = {
  tournament: {
    title: '[Game] Tournament',
    description: 'Competitive tournament for [game]. Test your skills against the best!',
    type: EVENT_TYPES.TOURNAMENT,
    pathway: 'gaming',
    duration: 180,
    maxParticipants: 32,
    requirements: ['Gaming Realm role'],
    prizes: {
      first: { xp: 500, role: 'Tournament Champion' },
      second: { xp: 300 },
      third: { xp: 200 }
    }
  },
  
  workshop: {
    title: '[Topic] Workshop',
    description: 'Learn and practice [topic] with guided exercises and expert tips.',
    type: EVENT_TYPES.WORKSHOP,
    pathway: 'productive',
    duration: 120,
    maxParticipants: 20,
    requirements: ['Productive Realm role'],
    rewards: {
      xp: 150,
      badges: ['workshop-graduate']
    }
  },
  
  debate: {
    title: 'Debate: [Topic]',
    description: 'Civil debate and discussion on [topic]. Multiple perspectives welcome.',
    type: EVENT_TYPES.DEBATE,
    pathway: 'news',
    duration: 90,
    maxParticipants: null,
    requirements: ['News Nexus role'],
    rewards: {
      xp: 100
    }
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getEventType(typeId) {
  return Object.values(EVENT_TYPES).find(t => t.id === typeId) || null;
}

export function getRecurringEventsByPathway(pathway) {
  return RECURRING_EVENTS.filter(e => e.pathway === pathway && e.isActive);
}

export function getActiveRecurringEvents() {
  return RECURRING_EVENTS.filter(e => e.isActive);
}

export function getNextOccurrence(event) {
  const now = new Date();
  const { schedule } = event;
  
  if (schedule.frequency === 'weekly') {
    const next = new Date(now);
    const daysUntil = (schedule.dayOfWeek - now.getDay() + 7) % 7;
    next.setDate(now.getDate() + (daysUntil === 0 ? 7 : daysUntil));
    
    if (schedule.time) {
      const [hours, minutes] = schedule.time.split(':');
      next.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    }
    
    return next;
  }
  
  if (schedule.frequency === 'monthly') {
    const next = new Date(now.getFullYear(), now.getMonth(), schedule.dayOfMonth);
    if (next < now) {
      next.setMonth(next.getMonth() + 1);
    }
    return next;
  }
  
  return null;
}

export function getUpcomingEvents() {
  const upcoming = [];
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  RECURRING_EVENTS.forEach(event => {
    if (!event.isActive) return;
    
    const nextDate = getNextOccurrence(event);
    if (nextDate && nextDate >= now && nextDate <= weekFromNow) {
      upcoming.push({
        ...event,
        date: nextDate,
        status: EVENT_STATUS.UPCOMING
      });
    }
  });
  
  return upcoming.sort((a, b) => a.date - b.date);
}

export function createEventFromTemplate(templateId, customData = {}) {
  const template = EVENT_TEMPLATES[templateId];
  if (!template) return null;
  
  return {
    ...template,
    ...customData,
    id: `${templateId}-${Date.now()}`,
    createdAt: new Date(),
    status: EVENT_STATUS.UPCOMING
  };
}

export function getEventsByType(typeId) {
  return RECURRING_EVENTS.filter(e => e.type.id === typeId && e.isActive);
}

export function getEventStats() {
  const active = RECURRING_EVENTS.filter(e => e.isActive);
  
  return {
    total: active.length,
    byPathway: {
      gaming: active.filter(e => e.pathway === 'gaming').length,
      lorebound: active.filter(e => e.pathway === 'lorebound').length,
      productive: active.filter(e => e.pathway === 'productive').length,
      news: active.filter(e => e.pathway === 'news').length,
      community: active.filter(e => !e.pathway).length
    },
    byType: Object.keys(EVENT_TYPES).reduce((acc, key) => {
      acc[key] = active.filter(e => e.type.id === key).length;
      return acc;
    }, {}),
    upcoming: getUpcomingEvents().length
  };
}

export function formatEventTime(event) {
  const nextDate = getNextOccurrence(event);
  if (!nextDate) return 'Schedule TBD';
  
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return nextDate.toLocaleDateString('en-US', options);
}

export function canJoinEvent(event, userRoles = []) {
  if (!event.requirements || event.requirements.length === 0) return true;
  
  if (event.maxParticipants && event.participants?.length >= event.maxParticipants) {
    return false;
  }
  
  const hasRequiredRole = event.requirements.some(req => {
    return userRoles.some(role => role.name === req);
  });
  
  return hasRequiredRole;
}

export default {
  EVENT_TYPES,
  EVENT_STATUS,
  RECURRING_EVENTS,
  EVENT_TEMPLATES,
  getEventType,
  getRecurringEventsByPathway,
  getActiveRecurringEvents,
  getNextOccurrence,
  getUpcomingEvents,
  createEventFromTemplate,
  getEventsByType,
  getEventStats,
  formatEventTime,
  canJoinEvent
};