import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

// UI Components
import GlassCard, { StatsCard, CardGrid } from '@/components/ui/GlassCard';
import LuxuryButton, { OwnerButton, AdminButton, ModButton, TextFlameButton } from '@/components/ui/LuxuryButton';
import LoadingCrest from '@/components/ui/LoadingCrest';

// Permission System
import { 
  hasPermission, 
  isStaff, 
  getPermissionLevel,
  PERMISSIONS,
  PERMISSION_LEVELS 
} from '@/constants/permissions';

// ============================================================================
// ANALYTICS DASHBOARD COMPONENT
// ============================================================================

const AnalyticsDash = ({ 
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
  const [timeRange, setTimeRange] = useState('7d'); // '24h', '7d', '30d', '90d', 'all'
  const [selectedPathway, setSelectedPathway] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  
  // Analytics data state
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalMembers: 0,
      activeMembers: 0,
      newMembers: 0,
      onlineMembers: 0,
      totalMessages: 0,
      totalEvents: 0
    },
    growth: {
      members: [],
      messages: [],
      events: []
    },
    pathways: {
      gaming: { members: 0, activity: 0, trend: 0 },
      lorebound: { members: 0, activity: 0, trend: 0 },
      productive: { members: 0, activity: 0, trend: 0 },
      news: { members: 0, activity: 0, trend: 0 }
    },
    moderation: {
      totalActions: 0,
      bans: 0,
      kicks: 0,
      warnings: 0,
      timeouts: 0
    },
    engagement: {
      messageRate: 0,
      voiceMinutes: 0,
      eventsAttended: 0,
      reactionsGiven: 0
    },
    topMembers: [],
    recentActivity: []
  });
  
  // Permission check
  const permissionLevel = useMemo(() => getPermissionLevel(userRoles), [userRoles]);
  const canViewAnalytics = useMemo(() => 
    hasPermission(userRoles, PERMISSIONS.VIEW_ANALYTICS),
    [userRoles]
  );
  const isStaffMember = useMemo(() => isStaff(userRoles), [userRoles]);
  
  // Refs
  const dashboardRef = useRef(null);
  const chartRefs = useRef({});
  
  // ============================================================================
  // DATA FETCHING
  // ============================================================================
  
  const fetchAnalyticsData = async () => {
    try {
      setRefreshing(true);
      
      // Fetch Discord stats
      const statsRes = await fetch(`/api/discord/stats?timeRange=${timeRange}`);
      if (!statsRes.ok) throw new Error('Failed to fetch stats');
      const stats = await statsRes.json();
      
      // Fetch member data
      const membersRes = await fetch(`/api/discord/members?detailed=true`);
      if (!membersRes.ok) throw new Error('Failed to fetch members');
      const members = await membersRes.json();
      
      // Process and set data
      setAnalyticsData({
        overview: {
          totalMembers: stats.memberCount || 0,
          activeMembers: stats.activeMemberCount || 0,
          newMembers: stats.newMemberCount || 0,
          onlineMembers: stats.onlineCount || 0,
          totalMessages: stats.messageCount || 0,
          totalEvents: stats.eventCount || 0
        },
        growth: stats.growth || { members: [], messages: [], events: [] },
        pathways: stats.pathways || {},
        moderation: stats.moderation || {},
        engagement: stats.engagement || {},
        topMembers: members.slice(0, 10) || [],
        recentActivity: stats.recentActivity || []
      });
      
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError(err.message);
      setLoading(false);
    } finally {
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    if (!canViewAnalytics) {
      router.push('/chambers/dashboard');
      return;
    }
    
    fetchAnalyticsData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchAnalyticsData, 300000);
    return () => clearInterval(interval);
  }, [timeRange, canViewAnalytics]);
  
  // ============================================================================
  // PERMISSION GUARD
  // ============================================================================
  
  if (!canViewAnalytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlassCard 
          variant="feature"
          title="Access Denied"
          description="You don't have permission to view analytics."
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
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingCrest 
          pathway="default" 
          size="large"
          message="Loading divine analytics..." 
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
          title="Error Loading Analytics"
          description={error}
          error
        >
          <LuxuryButton onClick={fetchAnalyticsData}>
            Retry
          </LuxuryButton>
        </GlassCard>
      </div>
    );
  }
  
  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================
  
  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };
  
  const calculatePercentage = (current, previous) => {
    if (!previous) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };
  
  const getPathwayColor = (pathway) => {
    const colors = {
      gaming: '#00BFFF',
      lorebound: '#FF1493',
      productive: '#50C878',
      news: '#E0115F'
    };
    return colors[pathway] || '#D4AF37';
  };
  
  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================
  
  const renderOverviewStats = () => (
    <section className="analytics-overview fade-in-up">
      <div className="section-header" style={{ marginBottom: '2rem' }}>
        <h2 className="text-h2 text-gradient-divine">Server Overview</h2>
        <div className="header-actions" style={{ display: 'flex', gap: '1rem' }}>
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              color: 'var(--noble-white)',
              cursor: 'pointer'
            }}
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
          
          <TextFlameButton 
            onClick={fetchAnalyticsData}
            disabled={refreshing}
            data-cursor="hover"
          >
            {refreshing ? '↻ Refreshing...' : '↻ Refresh'}
          </TextFlameButton>
        </div>
      </div>
      
      <CardGrid columns={3} gap="lg">
        <StatsCard
          title="Total Members"
          stats={{
            count: formatNumber(analyticsData.overview.totalMembers),
            active: `${formatNumber(analyticsData.overview.activeMembers)} active`,
            new: `+${formatNumber(analyticsData.overview.newMembers)} this week`
          }}
          glow
          floating
          primaryAction={{
            label: 'View Members',
            onClick: () => router.push('/admin/members')
          }}
        />
        
        <StatsCard
          title="Online Now"
          stats={{
            count: formatNumber(analyticsData.overview.onlineMembers),
            percentage: `${((analyticsData.overview.onlineMembers / analyticsData.overview.totalMembers) * 100).toFixed(1)}% of total`
          }}
          pathway="gaming"
          shimmer
          primaryAction={{
            label: 'Live View',
            onClick: () => router.push('/admin/live')
          }}
        />
        
        <StatsCard
          title="Total Messages"
          stats={{
            count: formatNumber(analyticsData.overview.totalMessages),
            rate: `${analyticsData.engagement.messageRate}/hour average`
          }}
          pathway="productive"
          pulse
        />
      </CardGrid>
    </section>
  );
  
  const renderPathwayStats = () => (
    <section className="pathway-stats fade-in-up delay-200" style={{ marginTop: '3rem' }}>
      <h2 className="text-h2 text-gradient-divine" style={{ marginBottom: '2rem' }}>
        Pathway Analytics
      </h2>
      
      <CardGrid columns={4} gap="md">
        {Object.entries(analyticsData.pathways).map(([pathway, data]) => (
          <GlassCard
            key={pathway}
            pathway={pathway}
            title={pathway.charAt(0).toUpperCase() + pathway.slice(1)}
            shimmer
            floating
            onClick={() => setSelectedPathway(pathway)}
            selected={selectedPathway === pathway}
            stats={{
              Members: formatNumber(data.members),
              Activity: `${data.activity}%`,
              Trend: `${data.trend > 0 ? '+' : ''}${data.trend}%`
            }}
          >
            <div style={{ 
              width: '100%', 
              height: '4px', 
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '2px',
              overflow: 'hidden',
              marginTop: '1rem'
            }}>
              <div style={{
                width: `${data.activity}%`,
                height: '100%',
                background: getPathwayColor(pathway),
                transition: 'width 1s ease'
              }} />
            </div>
          </GlassCard>
        ))}
      </CardGrid>
    </section>
  );
  
  const renderModerationStats = () => {
    if (permissionLevel < PERMISSION_LEVELS.MODERATOR) return null;
    
    return (
      <section className="moderation-stats fade-in-up delay-300" style={{ marginTop: '3rem' }}>
        <h2 className="text-h2 text-gradient-divine" style={{ marginBottom: '2rem' }}>
          Moderation Overview
        </h2>
        
        <CardGrid columns={5} gap="md">
          <StatsCard
            title="Total Actions"
            stats={{ count: formatNumber(analyticsData.moderation.totalActions) }}
            size="sm"
            glow
          />
          <StatsCard
            title="Bans"
            stats={{ count: formatNumber(analyticsData.moderation.bans) }}
            size="sm"
            pathway="news"
          />
          <StatsCard
            title="Kicks"
            stats={{ count: formatNumber(analyticsData.moderation.kicks) }}
            size="sm"
            pathway="gaming"
          />
          <StatsCard
            title="Warnings"
            stats={{ count: formatNumber(analyticsData.moderation.warnings) }}
            size="sm"
            pathway="lorebound"
          />
          <StatsCard
            title="Timeouts"
            stats={{ count: formatNumber(analyticsData.moderation.timeouts) }}
            size="sm"
            pathway="productive"
          />
        </CardGrid>
      </section>
    );
  };
  
  const renderEngagementMetrics = () => (
    <section className="engagement-metrics fade-in-up delay-400" style={{ marginTop: '3rem' }}>
      <h2 className="text-h2 text-gradient-divine" style={{ marginBottom: '2rem' }}>
        Community Engagement
      </h2>
      
      <CardGrid columns={4} gap="lg">
        <GlassCard
          title="Message Activity"
          description={`${analyticsData.engagement.messageRate} messages per hour`}
          glow
          shimmer
        >
          <div className="engagement-chart" style={{ marginTop: '1rem' }}>
            {/* Simple bar visualization */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '100px' }}>
              {analyticsData.growth.messages.slice(-24).map((value, idx) => (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    height: `${(value / Math.max(...analyticsData.growth.messages)) * 100}%`,
                    background: 'linear-gradient(to top, var(--cns-gold), var(--royal-purple))',
                    borderRadius: '2px 2px 0 0',
                    transition: 'height 0.3s ease'
                  }}
                />
              ))}
            </div>
          </div>
        </GlassCard>
        
        <GlassCard
          title="Voice Activity"
          description={`${formatNumber(analyticsData.engagement.voiceMinutes)} minutes`}
          pathway="gaming"
          pulse
        />
        
        <GlassCard
          title="Event Participation"
          description={`${formatNumber(analyticsData.engagement.eventsAttended)} attendees`}
          pathway="lorebound"
          floating
        />
        
        <GlassCard
          title="Reactions Given"
          description={`${formatNumber(analyticsData.engagement.reactionsGiven)} reactions`}
          pathway="productive"
          shimmer
        />
      </CardGrid>
    </section>
  );
  
  const renderTopMembers = () => (
    <section className="top-members fade-in-up delay-500" style={{ marginTop: '3rem' }}>
      <h2 className="text-h2 text-gradient-divine" style={{ marginBottom: '2rem' }}>
        Most Active Members
      </h2>
      
      <GlassCard variant="feature" glow>
        <div className="members-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {analyticsData.topMembers.length === 0 ? (
            <p className="text-body" style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>
              No member data available
            </p>
          ) : (
            analyticsData.topMembers.map((member, index) => (
              <div 
                key={member.id}
                className="member-item hover-lift"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '12px',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <div className="rank" style={{
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: index < 3 ? 'var(--gradient-divine-gold)' : 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  fontWeight: 'bold',
                  color: index < 3 ? 'var(--noble-black)' : 'var(--cns-gold)'
                }}>
                  {index + 1}
                </div>
                
                <div className="member-avatar" style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'var(--gradient-divine-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>
                  {member.username?.[0]?.toUpperCase() || '?'}
                </div>
                
                <div className="member-info" style={{ flex: 1 }}>
                  <div className="text-body-large" style={{ fontWeight: '600' }}>
                    {member.username || 'Unknown User'}
                  </div>
                  <div className="text-caption" style={{ opacity: 0.7 }}>
                    {member.messageCount || 0} messages • Level {member.level || 1}
                  </div>
                </div>
                
                <div className="member-stats" style={{
                  display: 'flex',
                  gap: '1rem',
                  fontSize: '0.875rem'
                }}>
                  <span>🏆 {member.xp || 0} XP</span>
                  <span>⭐ {member.reputation || 0}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </section>
  );
  
  const renderRecentActivity = () => (
    <section className="recent-activity fade-in-up delay-600" style={{ marginTop: '3rem' }}>
      <h2 className="text-h2 text-gradient-divine" style={{ marginBottom: '2rem' }}>
        Recent Activity
      </h2>
      
      <GlassCard variant="feature" shimmer>
        <div className="activity-feed" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {analyticsData.recentActivity.length === 0 ? (
            <p className="text-body" style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>
              No recent activity
            </p>
          ) : (
            analyticsData.recentActivity.slice(0, 15).map((activity, index) => (
              <div 
                key={index}
                className="activity-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '8px',
                  borderLeft: `3px solid ${getPathwayColor(activity.pathway || 'default')}`
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>{activity.icon || '📊'}</span>
                <div style={{ flex: 1 }}>
                  <span className="text-body">{activity.message}</span>
                  <span className="text-caption" style={{ opacity: 0.6, marginLeft: '0.5rem' }}>
                    {activity.timestamp}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </section>
  );
  
  const renderQuickActions = () => {
    const actions = [];
    
    if (permissionLevel >= PERMISSION_LEVELS.OWNER) {
      actions.push(
        <OwnerButton
          key="owner-action"
          icon="♔"
          onClick={() => router.push('/throne-room')}
        >
          Throne Room
        </OwnerButton>
      );
    }
    
    if (permissionLevel >= PERMISSION_LEVELS.ADMIN) {
      actions.push(
        <AdminButton
          key="admin-action"
          icon="♖"
          onClick={() => router.push('/admin/manage')}
        >
          Admin Panel
        </AdminButton>
      );
    }
    
    if (permissionLevel >= PERMISSION_LEVELS.MODERATOR) {
      actions.push(
        <ModButton
          key="mod-action"
          icon="♗"
          onClick={() => router.push('/sanctum')}
        >
          Sanctum
        </ModButton>
      );
    }
    
    return actions.length > 0 ? (
      <section className="quick-actions" style={{ marginTop: '3rem' }}>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          {actions}
        </div>
      </section>
    ) : null;
  };
  
  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  
  return (
    <div 
      ref={dashboardRef}
      className={`analytics-dashboard ${className}`}
      data-cursor="default"
      style={{
        minHeight: '100vh',
        padding: '2rem',
        maxWidth: '1600px',
        margin: '0 auto'
      }}
      {...props}
    >
      {/* Dashboard Header */}
      <header className="dashboard-header fade-in-down" style={{ marginBottom: '3rem' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 className="text-display text-gradient-divine">
            Divine Analytics
          </h1>
          <p className="text-body-large" style={{ opacity: 0.8, marginTop: '0.5rem' }}>
            Real-time insights into your noble realm
          </p>
          {user && (
            <p className="text-caption" style={{ opacity: 0.6, marginTop: '0.25rem' }}>
              Welcome back, {user.username} • Permission Level: {permissionLevel}
            </p>
          )}
        </div>
      </header>
      
      {/* Main Dashboard Content */}
      <main className="dashboard-content">
        {renderOverviewStats()}
        {renderPathwayStats()}
        {renderModerationStats()}
        {renderEngagementMetrics()}
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '3rem' }}>
          {renderTopMembers()}
          {renderRecentActivity()}
        </div>
        
        {renderQuickActions()}
      </main>
      
      {/* Dashboard Footer */}
      <footer style={{ marginTop: '4rem', textAlign: 'center', opacity: 0.5 }}>
        <p className="text-caption">
          Last updated: {new Date().toLocaleString()} • Auto-refresh in 5 minutes
        </p>
      </footer>
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default AnalyticsDash;