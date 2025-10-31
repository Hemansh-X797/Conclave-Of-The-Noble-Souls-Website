import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

// UI Components
import GlassCard, { FeatureCard, StatsCard, CardGrid, useCardState } from '@/components/ui/GlassCard';
import LuxuryButton, {
  OwnerButton,
  AdminButton,
  NobleButton,
  TextFlameButton,
  TextDimButton,
  GamingButton,
  LoreboundButton,
  ProductiveButton,
  NewsButton
} from '@/components/ui/LuxuryButton';
import LoadingCrest from '@/components/ui/LoadingCrest';
import NobleInput, {
  NobleTextarea,
  NobleSelect,
  NobleFileUpload,
  NobleTagsInput
} from '@/components/ui/NobleInput';

// Permission System
import {
  hasPermission,
  isStaff,
  getPermissionLevel,
  PERMISSIONS,
  PERMISSION_LEVELS
} from '@/constants/permissions';

// ============================================================================
// EVENT CREATOR COMPONENT
// ============================================================================

const EventCreator = ({
  user = null,
  userRoles = [],
  className = '',
  ...props
}) => {
  const router = useRouter();

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Event data
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);

  // Editor state
  const [editorMode, setEditorMode] = useState('calendar'); // 'calendar', 'list', 'create', 'edit'
  const [currentEvent, setCurrentEvent] = useState(null);
  const [viewMode, setViewMode] = useState('upcoming'); // 'upcoming', 'past', 'all'

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pathway: 'default',
    eventType: 'tournament', // 'tournament', 'movie-night', 'discussion', 'workshop', 'competition', 'custom'
    location: 'discord', // 'discord', 'voice-channel', 'external', 'hybrid'
    locationDetails: '',
    
    // Date & Time
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    timezone: 'UTC',
    recurring: false,
    recurrence: {
      frequency: 'weekly', // 'daily', 'weekly', 'monthly'
      interval: 1,
      endAfter: 10
    },
    
    // Capacity & Registration
    maxParticipants: 0, // 0 = unlimited
    requiresRegistration: false,
    registrationDeadline: '',
    allowWaitlist: true,
    
    // Visibility & Access
    visibility: 'public', // 'public', 'members', 'vip', 'pathway-specific', 'staff'
    pathwayRestrictions: [],
    roleRestrictions: [],
    
    // Rewards & Prizes
    hasRewards: false,
    rewards: {
      first: '',
      second: '',
      third: '',
      participation: ''
    },
    
    // Notifications
    sendReminders: true,
    reminderTimes: ['1day', '1hour'], // before event
    
    // Media & Branding
    banner: null,
    thumbnail: null,
    color: '#D4AF37',
    
    // Additional Info
    tags: [],
    hosts: [user?.id || ''],
    rules: '',
    requirements: '',
    prizes: '',
    externalLink: '',
    discordEventId: null,
    
    // Status
    status: 'draft', // 'draft', 'published', 'live', 'completed', 'cancelled'
    featured: false,
    
    // Stats (auto-populated)
    registeredCount: 0,
    attendedCount: 0,
    waitlistCount: 0
  });

  // Filters
  const [pathwayFilter, setPathwayFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Validation
  const [validationErrors, setValidationErrors] = useState({});

  // Permission checks
  const permissionLevel = useMemo(() => getPermissionLevel(userRoles), [userRoles]);
  const canCreateEvents = useMemo(() =>
    hasPermission(userRoles, PERMISSIONS.CREATE_EVENTS),
    [userRoles]
  );
  const canManageEvents = useMemo(() =>
    hasPermission(userRoles, PERMISSIONS.MANAGE_EVENTS),
    [userRoles]
  );
  const isStaffMember = useMemo(() => isStaff(userRoles), [userRoles]);

  // Refs
  const creatorRef = useRef(null);
  const calendarRef = useRef(null);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/admin/events?includeStats=true');
      if (!res.ok) throw new Error('Failed to fetch events');

      const data = await res.json();
      setEvents(data.events || []);
      setFilteredEvents(data.events || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!canCreateEvents && !canManageEvents) {
      router.push('/chambers/dashboard');
      return;
    }

    fetchEvents();
  }, [canCreateEvents, canManageEvents, fetchEvents]);

  // ============================================================================
  // FILTERING & SORTING
  // ============================================================================

  useEffect(() => {
    let filtered = [...events];
    const now = new Date();

    // View mode filter
    if (viewMode === 'upcoming') {
      filtered = filtered.filter(e => new Date(e.startDate) >= now && e.status !== 'cancelled');
    } else if (viewMode === 'past') {
      filtered = filtered.filter(e => new Date(e.endDate) < now || e.status === 'completed');
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        e.title?.toLowerCase().includes(query) ||
        e.description?.toLowerCase().includes(query) ||
        e.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Pathway filter
    if (pathwayFilter !== 'all') {
      filtered = filtered.filter(e => e.pathway === pathwayFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(e => e.eventType === typeFilter);
    }

    // Sort by start date
    filtered.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    setFilteredEvents(filtered);
  }, [searchQuery, pathwayFilter, typeFilter, viewMode, events]);

  // ============================================================================
  // FORM HANDLERS
  // ============================================================================

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.startDate) errors.startDate = 'Start date is required';
    if (!formData.startTime) errors.startTime = 'Start time is required';
    if (!formData.endDate) errors.endDate = 'End date is required';
    if (!formData.endTime) errors.endTime = 'End time is required';

    const start = new Date(`${formData.startDate}T${formData.startTime}`);
    const end = new Date(`${formData.endDate}T${formData.endTime}`);

    if (end <= start) {
      errors.endDate = 'End date must be after start date';
    }

    if (formData.requiresRegistration && !formData.registrationDeadline) {
      errors.registrationDeadline = 'Registration deadline is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (publishNow = false) => {
    if (!validateForm()) {
      alert('Please fix validation errors before saving');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...formData,
        status: publishNow ? 'published' : formData.status,
        author: user.id
      };

      const res = await fetch(
        currentEvent ? `/api/admin/events/${currentEvent.id}` : '/api/admin/events',
        {
          method: currentEvent ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );

      if (!res.ok) throw new Error('Failed to save event');

      const savedEvent = await res.json();

      if (currentEvent) {
        setEvents(prev => prev.map(e => e.id === currentEvent.id ? savedEvent : e));
      } else {
        setEvents(prev => [savedEvent, ...prev]);
      }

      // Create Discord event if published
      if (publishNow && !currentEvent) {
        try {
          await fetch('/api/discord/create-event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventId: savedEvent.id })
          });
        } catch (err) {
          console.error('Failed to create Discord event:', err);
        }
      }

      resetForm();
      setEditorMode('calendar');

      alert(publishNow ? 'Event published successfully!' : 'Event saved as draft');
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save event: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eventId) => {
    const confirmed = confirm('Are you sure you want to delete this event? This action cannot be undone.');
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/events/${eventId}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete event');

      setEvents(prev => prev.filter(e => e.id !== eventId));
      alert('Event deleted successfully');
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete event: ' + err.message);
    }
  };

  const handleCancel = async (eventId) => {
    const reason = prompt('Please provide a reason for cancelling this event:');
    if (!reason) return;

    try {
      const res = await fetch(`/api/admin/events/${eventId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });

      if (!res.ok) throw new Error('Failed to cancel event');

      setEvents(prev => prev.map(e =>
        e.id === eventId ? { ...e, status: 'cancelled' } : e
      ));

      alert('Event cancelled and participants notified');
    } catch (err) {
      console.error('Cancel failed:', err);
      alert('Failed to cancel event: ' + err.message);
    }
  };

  const handleEdit = (event) => {
    setCurrentEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      pathway: event.pathway,
      eventType: event.eventType,
      location: event.location,
      locationDetails: event.locationDetails || '',
      startDate: event.startDate?.split('T')[0] || '',
      startTime: event.startDate?.split('T')[1]?.substring(0, 5) || '',
      endDate: event.endDate?.split('T')[0] || '',
      endTime: event.endDate?.split('T')[1]?.substring(0, 5) || '',
      timezone: event.timezone || 'UTC',
      recurring: event.recurring || false,
      recurrence: event.recurrence || { frequency: 'weekly', interval: 1, endAfter: 10 },
      maxParticipants: event.maxParticipants || 0,
      requiresRegistration: event.requiresRegistration || false,
      registrationDeadline: event.registrationDeadline || '',
      allowWaitlist: event.allowWaitlist !== false,
      visibility: event.visibility || 'public',
      pathwayRestrictions: event.pathwayRestrictions || [],
      roleRestrictions: event.roleRestrictions || [],
      hasRewards: event.hasRewards || false,
      rewards: event.rewards || { first: '', second: '', third: '', participation: '' },
      sendReminders: event.sendReminders !== false,
      reminderTimes: event.reminderTimes || ['1day', '1hour'],
      banner: event.banner,
      thumbnail: event.thumbnail,
      color: event.color || '#D4AF37',
      tags: event.tags || [],
      hosts: event.hosts || [user?.id],
      rules: event.rules || '',
      requirements: event.requirements || '',
      prizes: event.prizes || '',
      externalLink: event.externalLink || '',
      discordEventId: event.discordEventId,
      status: event.status,
      featured: event.featured || false,
      registeredCount: event.registeredCount || 0,
      attendedCount: event.attendedCount || 0,
      waitlistCount: event.waitlistCount || 0
    });
    setEditorMode('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDuplicate = (event) => {
    setCurrentEvent(null);
    setFormData({
      ...event,
      title: `${event.title} (Copy)`,
      status: 'draft',
      discordEventId: null,
      registeredCount: 0,
      attendedCount: 0,
      waitlistCount: 0
    });
    setEditorMode('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setCurrentEvent(null);
    setFormData({
      title: '',
      description: '',
      pathway: 'default',
      eventType: 'tournament',
      location: 'discord',
      locationDetails: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      timezone: 'UTC',
      recurring: false,
      recurrence: { frequency: 'weekly', interval: 1, endAfter: 10 },
      maxParticipants: 0,
      requiresRegistration: false,
      registrationDeadline: '',
      allowWaitlist: true,
      visibility: 'public',
      pathwayRestrictions: [],
      roleRestrictions: [],
      hasRewards: false,
      rewards: { first: '', second: '', third: '', participation: '' },
      sendReminders: true,
      reminderTimes: ['1day', '1hour'],
      banner: null,
      thumbnail: null,
      color: '#D4AF37',
      tags: [],
      hosts: [user?.id || ''],
      rules: '',
      requirements: '',
      prizes: '',
      externalLink: '',
      discordEventId: null,
      status: 'draft',
      featured: false,
      registeredCount: 0,
      attendedCount: 0,
      waitlistCount: 0
    });
    setValidationErrors({});
  };

  const getPathwayButton = (pathway) => {
    const buttons = {
      gaming: GamingButton,
      lorebound: LoreboundButton,
      productive: ProductiveButton,
      news: NewsButton
    };
    return buttons[pathway] || NobleButton;
  };

  const getEventIcon = (type) => {
    const icons = {
      tournament: '🏆',
      'movie-night': '🎬',
      discussion: '💬',
      workshop: '🎓',
      competition: '⚔️',
      custom: '✨'
    };
    return icons[type] || '📅';
  };

  // ============================================================================
  // PERMISSION GUARD
  // ============================================================================

  if (!canCreateEvents && !canManageEvents) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlassCard
          variant="feature"
          title="Access Denied"
          description="You don't have permission to manage events."
          glow
        >
          <LuxuryButton onClick={() => router.push('/chambers/dashboard')}>
            Return to Dashboard
          </LuxuryButton>
        </GlassCard>
      </div>
    );
  }

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (loading && editorMode === 'calendar') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingCrest
          pathway="default"
          size="large"
          message="Loading events..."
        />
      </div>
    );
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlassCard
          variant="feature"
          title="Error Loading Events"
          description={error}
          error
        >
          <LuxuryButton onClick={fetchEvents}>
            Retry
          </LuxuryButton>
        </GlassCard>
      </div>
    );
  }

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================

  const renderEditor = () => (
    <section className="event-editor fade-in-up" style={{ marginBottom: '3rem' }}>
      <GlassCard variant="feature" glow className="editor-card">
        <div className="editor-header" style={{ marginBottom: '2rem' }}>
          <h2 className="text-h2 text-gradient-divine">
            {editorMode === 'edit' ? 'Edit Event' : 'Create New Event'}
          </h2>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <TextDimButton onClick={() => {
              resetForm();
              setEditorMode('calendar');
            }}>
              ← Back to Calendar
            </TextDimButton>
            <TextDimButton onClick={resetForm}>
              Clear Form
            </TextDimButton>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Basic Info */}
          <div>
            <h3 className="text-h3" style={{ marginBottom: '1rem' }}>Basic Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <NobleInput
                label="Event Title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter an exciting event title..."
                required
                error={validationErrors.title}
                pathway={formData.pathway}
                maxLength={100}
              />

              <NobleTextarea
                label="Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your event in detail..."
                required
                error={validationErrors.description}
                pathway={formData.pathway}
                rows={5}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <NobleSelect
                  label="Event Type"
                  value={formData.eventType}
                  onChange={(e) => handleInputChange('eventType', e.target.value)}
                  pathway={formData.pathway}
                >
                  <option value="tournament">🏆 Tournament</option>
                  <option value="movie-night">🎬 Movie Night</option>
                  <option value="discussion">💬 Discussion</option>
                  <option value="workshop">🎓 Workshop</option>
                  <option value="competition">⚔️ Competition</option>
                  <option value="custom">✨ Custom Event</option>
                </NobleSelect>

                <NobleSelect
                  label="Pathway"
                  value={formData.pathway}
                  onChange={(e) => handleInputChange('pathway', e.target.value)}
                  pathway={formData.pathway}
                >
                  <option value="default">Default</option>
                  <option value="gaming">Gaming</option>
                  <option value="lorebound">Lorebound</option>
                  <option value="productive">Productive</option>
                  <option value="news">News</option>
                </NobleSelect>

                <NobleSelect
                  label="Location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  pathway={formData.pathway}
                >
                  <option value="discord">Discord Server</option>
                  <option value="voice-channel">Voice Channel</option>
                  <option value="external">External Platform</option>
                  <option value="hybrid">Hybrid</option>
                </NobleSelect>
              </div>

              {(formData.location === 'external' || formData.location === 'hybrid') && (
                <NobleInput
                  label="Location Details / Link"
                  value={formData.locationDetails}
                  onChange={(e) => handleInputChange('locationDetails', e.target.value)}
                  placeholder="Zoom link, Discord invite, etc..."
                  pathway={formData.pathway}
                />
              )}
            </div>
          </div>

          {/* Date & Time */}
          <div>
            <h3 className="text-h3" style={{ marginBottom: '1rem' }}>Schedule</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <NobleInput
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                required
                error={validationErrors.startDate}
                pathway={formData.pathway}
              />

              <NobleInput
                label="Start Time"
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                required
                error={validationErrors.startTime}
                pathway={formData.pathway}
              />

              <NobleSelect
                label="Timezone"
                value={formData.timezone}
                onChange={(e) => handleInputChange('timezone', e.target.value)}
                pathway={formData.pathway}
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">EST</option>
                <option value="America/Los_Angeles">PST</option>
                <option value="Europe/London">GMT</option>
                <option value="Asia/Kolkata">IST</option>
              </NobleSelect>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <NobleInput
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                required
                error={validationErrors.endDate}
                pathway={formData.pathway}
              />

              <NobleInput
                label="End Time"
                type="time"
                value={formData.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
                required
                error={validationErrors.endTime}
                pathway={formData.pathway}
              />

              <div style={{ paddingTop: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.recurring}
                    onChange={(e) => handleInputChange('recurring', e.target.checked)}
                  />
                  <span className="text-body">Recurring Event</span>
                </label>
              </div>
            </div>
          </div>

          {/* Registration */}
          <div>
            <h3 className="text-h3" style={{ marginBottom: '1rem' }}>Registration & Capacity</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.requiresRegistration}
                    onChange={(e) => handleInputChange('requiresRegistration', e.target.checked)}
                  />
                  <span className="text-body">Requires Registration</span>
                </label>

                {formData.requiresRegistration && (
                  <NobleInput
                    label="Registration Deadline"
                    type="datetime-local"
                    value={formData.registrationDeadline}
                    onChange={(e) => handleInputChange('registrationDeadline', e.target.value)}
                    error={validationErrors.registrationDeadline}
                    pathway={formData.pathway}
                  />
                )}
              </div>

              <div>
                <NobleInput
                  label="Max Participants (0 = unlimited)"
                  type="number"
                  min="0"
                  value={formData.maxParticipants}
                  onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value))}
                  pathway={formData.pathway}
                />

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.allowWaitlist}
                    onChange={(e) => handleInputChange('allowWaitlist', e.target.checked)}
                  />
                  <span className="text-body">Allow Waitlist</span>
                </label>
              </div>
            </div>
          </div>

          {/* Visibility & Access */}
          <div>
            <h3 className="text-h3" style={{ marginBottom: '1rem' }}>Visibility & Access</h3>
            <NobleSelect
              label="Who can see this event?"
              value={formData.visibility}
              onChange={(e) => handleInputChange('visibility', e.target.value)}
              pathway={formData.pathway}
            >
              <option value="public">Public (Everyone)</option>
              <option value="members">Members Only</option>
              <option value="vip">VIP Members</option>
              <option value="pathway-specific">Pathway Specific</option>
              <option value="staff">Staff Only</option>
            </NobleSelect>
          </div>

          {/* Rewards */}
          <div>
            <h3 className="text-h3" style={{ marginBottom: '1rem' }}>Rewards & Prizes</h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.hasRewards}
                onChange={(e) => handleInputChange('hasRewards', e.target.checked)}
              />
              <span className="text-body">This event has rewards</span>
            </label>

            {formData.hasRewards && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <NobleInput
                  label="🥇 First Place"
                  value={formData.rewards.first}
                  onChange={(e) => handleNestedChange('rewards', 'first', e.target.value)}
                  placeholder="e.g., Discord Nitro, Special Role"
                  pathway={formData.pathway}
                />
                <NobleInput
                  label="🥈 Second Place"
                  value={formData.rewards.second}
                  onChange={(e) => handleNestedChange('rewards', 'second', e.target.value)}
                  placeholder="e.g., Custom Badge"
                  pathway={formData.pathway}
                />
                <NobleInput
                  label="🥉 Third Place"
                  value={formData.rewards.third}
                  onChange={(e) => handleNestedChange('rewards', 'third', e.target.value)}
                  placeholder="e.g., XP Boost"
                  pathway={formData.pathway}
                />
                <NobleInput
                  label="🎖️ Participation"
                  value={formData.rewards.participation}
                  onChange={(e) => handleNestedChange('rewards', 'participation', e.target.value)}
                  placeholder="e.g., Participation Badge"
                  pathway={formData.pathway}
                />
              </div>
            )}
          </div>

          {/* Additional Details */}
          <div>
            <h3 className="text-h3" style={{ marginBottom: '1rem' }}>Additional Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <NobleTextarea
                label="Rules"
                value={formData.rules}
                onChange={(e) => handleInputChange('rules', e.target.value)}
                placeholder="Event rules and guidelines..."
                pathway={formData.pathway}
                rows={4}
              />

              <NobleTextarea
                label="Requirements"
                value={formData.requirements}
                onChange={(e) => handleInputChange('requirements', e.target.value)}
                placeholder="What participants need to bring or prepare..."
                pathway={formData.pathway}
                rows={3}
              />

              <NobleTagsInput
                label="Tags"
                tags={formData.tags}
                onTagsChange={(tags) => handleInputChange('tags', tags)}
                placeholder="Add tags for better discoverability..."
                pathway={formData.pathway}
              />
            </div>
          </div>

          {/* Status & Featured */}
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => handleInputChange('featured', e.target.checked)}
              />
              <span className="text-body">⭐ Featured Event</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.sendReminders}
                onChange={(e) => handleInputChange('sendReminders', e.target.checked)}
              />
              <span className="text-body">📬 Send Reminders</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
            <TextDimButton
              onClick={() => handleSave(false)}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save as Draft'}
            </TextDimButton>

            {React.createElement(getPathwayButton(formData.pathway), {
              onClick: () => handleSave(true),
              disabled: saving
            }, saving ? 'Publishing...' : '✨ Publish Event')}
          </div>
        </div>
      </GlassCard>
    </section>
  );

  const renderFilters = () => (
    <section className="filters-section fade-in-up" style={{ marginBottom: '2rem' }}>
      <GlassCard variant="feature" shimmer>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          <NobleInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events..."
            pathway="default"
          />

          <NobleSelect
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            pathway="default"
          >
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
            <option value="all">All Events</option>
          </NobleSelect>

          <NobleSelect
            value={pathwayFilter}
            onChange={(e) => setPathwayFilter(e.target.value)}
            pathway="default"
          >
            <option value="all">All Pathways</option>
            <option value="default">Default</option>
            <option value="gaming">Gaming</option>
            <option value="lorebound">Lorebound</option>
            <option value="productive">Productive</option>
            <option value="news">News</option>
          </NobleSelect>

          <NobleSelect
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            pathway="default"
          >
            <option value="all">All Types</option>
            <option value="tournament">Tournament</option>
            <option value="movie-night">Movie Night</option>
            <option value="discussion">Discussion</option>
            <option value="workshop">Workshop</option>
            <option value="competition">Competition</option>
          </NobleSelect>
        </div>
      </GlassCard>
    </section>
  );

  const renderEventCard = (event) => {
    const PathwayButton = getPathwayButton(event.pathway);
    const eventDate = new Date(event.startDate);
    const isUpcoming = eventDate > new Date();
    const isPast = eventDate < new Date();
    const registrationFull = event.maxParticipants > 0 && event.registeredCount >= event.maxParticipants;

    return (
      <FeatureCard
        key={event.id}
        title={`${getEventIcon(event.eventType)} ${event.title}`}
        description={event.description}
        image={event.banner || event.thumbnail}
        pathway={event.pathway}
        badge={
          event.status === 'cancelled' ? '❌ Cancelled' :
          event.status === 'live' ? '🔴 Live' :
          event.featured ? '⭐ Featured' :
          registrationFull ? '🔒 Full' :
          isUpcoming ? '📅 Upcoming' :
          '✓ Completed'
        }
        tags={event.tags}
        floating
        shimmer={event.featured}
        glow={event.status === 'live'}
        timestamp={eventDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
        stats={{
          Registered: `${event.registeredCount}${event.maxParticipants > 0 ? `/${event.maxParticipants}` : ''}`,
          Attended: event.attendedCount || 0,
          ...(event.waitlistCount > 0 && { Waitlist: event.waitlistCount })
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <TextFlameButton
            size="sm"
            onClick={() => handleEdit(event)}
            disabled={event.status === 'cancelled'}
          >
            ✏️ Edit
          </TextFlameButton>

          <TextDimButton
            size="sm"
            onClick={() => handleDuplicate(event)}
          >
            📋 Duplicate
          </TextDimButton>

          <TextDimButton
            size="sm"
            onClick={() => window.open(`/events/${event.id}`, '_blank')}
          >
            👁️ View
          </TextDimButton>

          {isUpcoming && event.status !== 'cancelled' && (
            <TextDimButton
              size="sm"
              onClick={() => handleCancel(event.id)}
              style={{ color: '#E0115F' }}
            >
              ❌ Cancel
            </TextDimButton>
          )}

          {event.status !== 'cancelled' && (
            <TextDimButton
              size="sm"
              onClick={() => handleDelete(event.id)}
              style={{ color: '#E0115F' }}
            >
              🗑️ Delete
            </TextDimButton>
          )}
        </div>
      </FeatureCard>
    );
  };

  const renderEventsList = () => (
    <section className="events-list fade-in-up delay-200">
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="text-body">
          Showing {filteredEvents.length} of {events.length} events
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <TextDimButton 
            size="sm"
            onClick={() => setEditorMode(editorMode === 'list' ? 'calendar' : 'list')}
          >
            {editorMode === 'list' ? '📅 Calendar View' : '📋 List View'}
          </TextDimButton>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <GlassCard variant="feature" glow>
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p className="text-h3" style={{ opacity: 0.6, marginBottom: '1rem' }}>
              No events found
            </p>
            <NobleButton onClick={() => setEditorMode('create')}>
              Create Your First Event
            </NobleButton>
          </div>
        </GlassCard>
      ) : (
        <CardGrid columns={3} gap="lg">
          {filteredEvents.map(renderEventCard)}
        </CardGrid>
      )}
    </section>
  );

  const renderCalendarView = () => {
    // Group events by month
    const eventsByMonth = filteredEvents.reduce((acc, event) => {
      const month = new Date(event.startDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
      if (!acc[month]) acc[month] = [];
      acc[month].push(event);
      return acc;
    }, {});

    return (
      <section className="calendar-view fade-in-up delay-200">
        {Object.entries(eventsByMonth).map(([month, monthEvents]) => (
          <div key={month} style={{ marginBottom: '3rem' }}>
            <h3 className="text-h3 text-gradient-divine" style={{ marginBottom: '1.5rem' }}>
              {month}
            </h3>
            <CardGrid columns={3} gap="lg">
              {monthEvents.map(renderEventCard)}
            </CardGrid>
          </div>
        ))}

        {filteredEvents.length === 0 && (
          <GlassCard variant="feature" glow>
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p className="text-h3" style={{ opacity: 0.6, marginBottom: '1rem' }}>
                No events scheduled
              </p>
              <NobleButton onClick={() => setEditorMode('create')}>
                Create Your First Event
              </NobleButton>
            </div>
          </GlassCard>
        )}
      </section>
    );
  };

  const renderStats = () => {
    const upcomingCount = events.filter(e => 
      new Date(e.startDate) > new Date() && e.status !== 'cancelled'
    ).length;
    const pastCount = events.filter(e => 
      new Date(e.endDate) < new Date() || e.status === 'completed'
    ).length;
    const liveCount = events.filter(e => e.status === 'live').length;
    const totalRegistrations = events.reduce((sum, e) => sum + (e.registeredCount || 0), 0);

    return (
      <section className="event-stats fade-in-up delay-100" style={{ marginBottom: '2rem' }}>
        <CardGrid columns={4} gap="md">
          <StatsCard
            title="Upcoming Events"
            stats={{ count: upcomingCount }}
            pathway="gaming"
            shimmer
          />
          <StatsCard
            title="Live Now"
            stats={{ count: liveCount }}
            pathway="news"
            pulse={liveCount > 0}
            glow={liveCount > 0}
          />
          <StatsCard
            title="Past Events"
            stats={{ count: pastCount }}
            pathway="productive"
          />
          <StatsCard
            title="Total Registrations"
            stats={{ count: totalRegistrations }}
            pathway="lorebound"
            floating
          />
        </CardGrid>
      </section>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div
      ref={creatorRef}
      className={`event-creator ${className}`}
      data-cursor="default"
      style={{
        minHeight: '100vh',
        padding: '2rem',
        maxWidth: '1600px',
        margin: '0 auto'
      }}
      {...props}
    >
      {/* Header */}
      <header className="creator-header fade-in-down" style={{ marginBottom: '3rem' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 className="text-display text-gradient-divine">
            Event Management
          </h1>
          <p className="text-body-large" style={{ opacity: 0.8, marginTop: '0.5rem' }}>
            Create and manage epic community events
          </p>
        </div>

        {(editorMode === 'calendar' || editorMode === 'list') && (
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <NobleButton onClick={() => setEditorMode('create')}>
              ✨ Create New Event
            </NobleButton>
            <TextFlameButton onClick={fetchEvents}>
              ↻ Refresh
            </TextFlameButton>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="creator-content">
        {editorMode === 'create' || editorMode === 'edit' ? (
          renderEditor()
        ) : (
          <>
            {renderStats()}
            {renderFilters()}
            {editorMode === 'calendar' ? renderCalendarView() : renderEventsList()}
          </>
        )}
      </main>

      {/* Footer Stats */}
      {(editorMode === 'calendar' || editorMode === 'list') && (
        <footer style={{ marginTop: '4rem', textAlign: 'center' }}>
          <div className="text-caption" style={{ opacity: 0.5 }}>
            Managing {events.length} total events • Last updated: {new Date().toLocaleString()}
          </div>
        </footer>
      )}
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default EventCreator;