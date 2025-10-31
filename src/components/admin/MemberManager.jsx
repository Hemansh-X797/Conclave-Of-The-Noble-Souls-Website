import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

// UI Components
import GlassCard, { ProfileCard, StatsCard, CardGrid, CardStack, useCardCollection } from '@/components/ui/GlassCard';
import LuxuryButton, { 
  OwnerButton, 
  AdminButton, 
  ModButton, 
  TextFlameButton,
  TextDimButton,
  NobleButton 
} from '@/components/ui/LuxuryButton';
import LoadingCrest from '@/components/ui/LoadingCrest';
import NobleInput, { NobleSearchInput, NobleSelect } from '@/components/ui/NobleInput';

// Permission System
import { 
  hasPermission,
  canModerate,
  isStaff,
  getPermissionLevel,
  getUserPermissions,
  PERMISSIONS,
  PERMISSION_LEVELS
} from '@/constants/permissions';

// Role definitions
import ROLES from '@/constants/roles';

// ============================================================================
// MEMBER MANAGER COMPONENT
// ============================================================================

const MemberManager = ({
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
  const [actionLoading, setActionLoading] = useState(false);

  // Member data
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [pathwayFilter, setPathwayFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'online', 'offline', 'banned'
  const [sortBy, setSortBy] = useState('joinDate'); // 'joinDate', 'username', 'level', 'messages'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [membersPerPage] = useState(20);

  // Modal states
  const [showMemberDetail, setShowMemberDetail] = useState(false);
  const [showModModal, setShowModModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Moderation action state
  const [modAction, setModAction] = useState({
    type: '', // 'ban', 'kick', 'timeout', 'warn'
    reason: '',
    duration: '',
    member: null
  });

  // Bulk actions
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [bulkAction, setBulkAction] = useState('');

  // Permission checks
  const permissionLevel = useMemo(() => getPermissionLevel(userRoles), [userRoles]);
  const canManageMembers = useMemo(() => 
    hasPermission(userRoles, PERMISSIONS.MANAGE_MEMBERS) ||
    hasPermission(userRoles, PERMISSIONS.BAN_MEMBERS) ||
    hasPermission(userRoles, PERMISSIONS.KICK_MEMBERS),
    [userRoles]
  );
  const isStaffMember = useMemo(() => isStaff(userRoles), [userRoles]);

  // Refs
  const managerRef = useRef(null);
  const searchInputRef = useRef(null);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/discord/members?detailed=true&includeRoles=true');
      if (!res.ok) throw new Error('Failed to fetch members');

      const data = await res.json();
      setMembers(data.members || []);
      setFilteredMembers(data.members || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch members:', err);
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!canManageMembers) {
      router.push('/chambers/dashboard');
      return;
    }

    fetchMembers();
  }, [canManageMembers, fetchMembers]);

  // ============================================================================
  // FILTERING & SORTING
  // ============================================================================

  useEffect(() => {
    let filtered = [...members];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.username?.toLowerCase().includes(query) ||
        m.discriminator?.includes(query) ||
        m.id?.includes(query)
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(m =>
        m.roles?.includes(roleFilter)
      );
    }

    // Pathway filter
    if (pathwayFilter !== 'all') {
      const pathwayRoleIds = {
        gaming: '1395703399760265226',
        lorebound: '1397498835919442033',
        productive: '1409444816189788171',
        news: '1395703930587189321'
      };
      filtered = filtered.filter(m =>
        m.roles?.includes(pathwayRoleIds[pathwayFilter])
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(m => {
        if (statusFilter === 'online') return m.status === 'online' || m.status === 'idle' || m.status === 'dnd';
        if (statusFilter === 'offline') return m.status === 'offline';
        if (statusFilter === 'banned') return m.banned === true;
        return true;
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case 'username':
          aVal = a.username?.toLowerCase() || '';
          bVal = b.username?.toLowerCase() || '';
          break;
        case 'joinDate':
          aVal = new Date(a.joinedAt || 0).getTime();
          bVal = new Date(b.joinedAt || 0).getTime();
          break;
        case 'level':
          aVal = a.level || 0;
          bVal = b.level || 0;
          break;
        case 'messages':
          aVal = a.messageCount || 0;
          bVal = b.messageCount || 0;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredMembers(filtered);
    setCurrentPage(1);
  }, [searchQuery, roleFilter, pathwayFilter, statusFilter, sortBy, sortOrder, members]);

  // ============================================================================
  // PAGINATION
  // ============================================================================

  const indexOfLastMember = currentPage * membersPerPage;
  const indexOfFirstMember = indexOfLastMember - membersPerPage;
  const currentMembers = filteredMembers.slice(indexOfFirstMember, indexOfLastMember);
  const totalPages = Math.ceil(filteredMembers.length / membersPerPage);

  // ============================================================================
  // MODERATION ACTIONS
  // ============================================================================

  const handleModAction = async (actionType, member) => {
    if (!canModerate(userRoles, member.roles)) {
      alert('You cannot moderate this member (insufficient permissions)');
      return;
    }

    setModAction({ type: actionType, reason: '', duration: '', member });
    setShowModModal(true);
  };

  const executeModAction = async () => {
    if (!modAction.reason.trim()) {
      alert('Please provide a reason for this action');
      return;
    }

    try {
      setActionLoading(true);

      const res = await fetch('/api/admin/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: modAction.type,
          memberId: modAction.member.id,
          reason: modAction.reason,
          duration: modAction.duration,
          moderatorId: user.id
        })
      });

      if (!res.ok) throw new Error('Moderation action failed');

      const result = await res.json();

      // Update local state
      setMembers(prev => prev.map(m =>
        m.id === modAction.member.id
          ? { ...m, banned: modAction.type === 'ban', ...result.updates }
          : m
      ));

      // Close modal and reset
      setShowModModal(false);
      setModAction({ type: '', reason: '', duration: '', member: null });

      alert(`Successfully ${modAction.type}ed ${modAction.member.username}`);
    } catch (err) {
      console.error('Moderation action failed:', err);
      alert(`Failed to ${modAction.type} member: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================================================
  // ROLE MANAGEMENT
  // ============================================================================

  const handleRoleChange = async (member, roleId, action) => {
    try {
      setActionLoading(true);

      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: member.id,
          roleId,
          action, // 'add' or 'remove'
          moderatorId: user.id
        })
      });

      if (!res.ok) throw new Error('Role update failed');

      // Update local state
      setMembers(prev => prev.map(m => {
        if (m.id !== member.id) return m;

        const roles = [...(m.roles || [])];
        if (action === 'add' && !roles.includes(roleId)) {
          roles.push(roleId);
        } else if (action === 'remove') {
          const idx = roles.indexOf(roleId);
          if (idx > -1) roles.splice(idx, 1);
        }

        return { ...m, roles };
      }));

      alert(`Role ${action === 'add' ? 'added to' : 'removed from'} ${member.username}`);
    } catch (err) {
      console.error('Role update failed:', err);
      alert(`Failed to update roles: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================================================
  // BULK ACTIONS
  // ============================================================================

  const handleBulkAction = async () => {
    if (selectedMembers.length === 0) {
      alert('No members selected');
      return;
    }

    if (!bulkAction) {
      alert('Please select an action');
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to ${bulkAction} ${selectedMembers.length} member(s)?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);

      const res = await fetch('/api/admin/bulk-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: bulkAction,
          memberIds: selectedMembers,
          moderatorId: user.id
        })
      });

      if (!res.ok) throw new Error('Bulk action failed');

      await fetchMembers();
      setSelectedMembers([]);
      setBulkAction('');
      setShowBulkModal(false);

      alert(`Bulk action completed successfully`);
    } catch (err) {
      console.error('Bulk action failed:', err);
      alert(`Failed to execute bulk action: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================================================
  // MEMBER SELECTION
  // ============================================================================

  const toggleMemberSelection = (memberId) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const selectAllMembers = () => {
    setSelectedMembers(currentMembers.map(m => m.id));
  };

  const clearSelection = () => {
    setSelectedMembers([]);
  };

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const getMemberStatusColor = (status) => {
    const colors = {
      online: '#50C878',
      idle: '#FFD700',
      dnd: '#E0115F',
      offline: '#666666'
    };
    return colors[status] || colors.offline;
  };

  const getRoleName = (roleId) => {
    const role = Object.values(ROLES).find(r => r.id === roleId);
    return role?.name || 'Unknown Role';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // ============================================================================
  // PERMISSION GUARD
  // ============================================================================

  if (!canManageMembers) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlassCard
          variant="feature"
          title="Access Denied"
          description="You don't have permission to manage members."
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
          message="Loading member data..."
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
          title="Error Loading Members"
          description={error}
          error
        >
          <LuxuryButton onClick={fetchMembers}>
            Retry
          </LuxuryButton>
        </GlassCard>
      </div>
    );
  }

  // ============================================================================
  // RENDER COMPONENTS
  // ============================================================================

  const renderFilters = () => (
    <section className="filters-section fade-in-up" style={{ marginBottom: '2rem' }}>
      <GlassCard variant="feature" glow>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {/* Search */}
          <NobleSearchInput
            ref={searchInputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search members..."
            pathway="default"
          />

          {/* Role Filter */}
          <NobleSelect
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            pathway="default"
          >
            <option value="all">All Roles</option>
            <option value="1369566988128751750">Owner</option>
            <option value="1370702703616856074">Administrator</option>
            <option value="1408079849377107989">Moderator</option>
            <option value="1404790723751968883">VIP</option>
            <option value="1397497084793458691">Noble Soul</option>
          </NobleSelect>

          {/* Pathway Filter */}
          <NobleSelect
            value={pathwayFilter}
            onChange={(e) => setPathwayFilter(e.target.value)}
            pathway="default"
          >
            <option value="all">All Pathways</option>
            <option value="gaming">Gaming</option>
            <option value="lorebound">Lorebound</option>
            <option value="productive">Productive</option>
            <option value="news">News</option>
          </NobleSelect>

          {/* Status Filter */}
          <NobleSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            pathway="default"
          >
            <option value="all">All Status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="banned">Banned</option>
          </NobleSelect>

          {/* Sort By */}
          <NobleSelect
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            pathway="default"
          >
            <option value="joinDate">Join Date</option>
            <option value="username">Username</option>
            <option value="level">Level</option>
            <option value="messages">Messages</option>
          </NobleSelect>

          {/* Sort Order */}
          <NobleSelect
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            pathway="default"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </NobleSelect>
        </div>
      </GlassCard>
    </section>
  );

  const renderMemberCard = (member) => {
    const isSelected = selectedMembers.includes(member.id);
    const canModerateThis = canModerate(userRoles, member.roles);

    return (
      <GlassCard
        key={member.id}
        variant="profile"
        title={member.username}
        subtitle={`#${member.discriminator}`}
        image={member.avatar || '/Assets/Images/nobility/default-avatar.png'}
        imageAlt={`${member.username} avatar`}
        selected={isSelected}
        onClick={() => toggleMemberSelection(member.id)}
        floating
        hover
        className="member-card"
        stats={{
          Level: member.level || 1,
          Messages: member.messageCount || 0,
          XP: member.xp || 0
        }}
        badge={member.banned ? 'Banned' : member.vip ? 'VIP' : null}
      >
        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {/* Status indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: getMemberStatusColor(member.status)
            }} />
            <span className="text-caption" style={{ textTransform: 'capitalize' }}>
              {member.status || 'offline'}
            </span>
          </div>

          {/* Join date */}
          <div className="text-caption" style={{ opacity: 0.7 }}>
            Joined: {formatDate(member.joinedAt)}
          </div>

          {/* Actions */}
          {canModerateThis && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <TextDimButton
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMember(member);
                  setShowMemberDetail(true);
                }}
              >
                View Details
              </TextDimButton>

              {hasPermission(userRoles, PERMISSIONS.TIMEOUT_MEMBERS) && (
                <TextDimButton
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleModAction('timeout', member);
                  }}
                >
                  Timeout
                </TextDimButton>
              )}

              {hasPermission(userRoles, PERMISSIONS.KICK_MEMBERS) && (
                <TextDimButton
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleModAction('kick', member);
                  }}
                >
                  Kick
                </TextDimButton>
              )}

              {hasPermission(userRoles, PERMISSIONS.BAN_MEMBERS) && !member.banned && (
                <TextDimButton
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleModAction('ban', member);
                  }}
                >
                  Ban
                </TextDimButton>
              )}
            </div>
          )}
        </div>
      </GlassCard>
    );
  };

  const renderMembersList = () => (
    <section className="members-list fade-in-up delay-200">
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="text-body">
          Showing {indexOfFirstMember + 1}-{Math.min(indexOfLastMember, filteredMembers.length)} of {filteredMembers.length} members
        </div>

        {selectedMembers.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className="text-body">{selectedMembers.length} selected</span>
            <TextFlameButton size="sm" onClick={() => setShowBulkModal(true)}>
              Bulk Actions
            </TextFlameButton>
            <TextDimButton size="sm" onClick={clearSelection}>
              Clear
            </TextDimButton>
          </div>
        )}
      </div>

      <CardGrid columns="auto" gap="md">
        {currentMembers.map(renderMemberCard)}
      </CardGrid>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
          <TextDimButton
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            ← Previous
          </TextDimButton>

          <span className="text-body">
            Page {currentPage} of {totalPages}
          </span>

          <TextDimButton
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next →
          </TextDimButton>
        </div>
      )}
    </section>
  );

  const renderModModal = () => {
    if (!showModModal) return null;

    return (
      <div className="modal-overlay backdrop-fade" onClick={() => setShowModModal(false)}>
        <GlassCard
          variant="feature"
          title={`${modAction.type.charAt(0).toUpperCase() + modAction.type.slice(1)} Member`}
          subtitle={modAction.member?.username}
          glow
          className="modal-scale-up"
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: '500px', margin: '2rem' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <NobleInput
              label="Reason"
              value={modAction.reason}
              onChange={(e) => setModAction(prev => ({ ...prev, reason: e.target.value }))}
              required
              pathway="default"
            />

            {modAction.type === 'timeout' && (
              <NobleSelect
                label="Duration"
                value={modAction.duration}
                onChange={(e) => setModAction(prev => ({ ...prev, duration: e.target.value }))}
                pathway="default"
              >
                <option value="">Select duration</option>
                <option value="60">1 minute</option>
                <option value="300">5 minutes</option>
                <option value="600">10 minutes</option>
                <option value="3600">1 hour</option>
                <option value="86400">1 day</option>
                <option value="604800">1 week</option>
              </NobleSelect>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <NobleButton
                onClick={executeModAction}
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : 'Confirm'}
              </NobleButton>
              <TextDimButton onClick={() => setShowModModal(false)}>
                Cancel
              </TextDimButton>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div
      ref={managerRef}
      className={`member-manager ${className}`}
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
      <header className="manager-header fade-in-down" style={{ marginBottom: '3rem' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 className="text-display text-gradient-divine">
            Member Management
          </h1>
          <p className="text-body-large" style={{ opacity: 0.8, marginTop: '0.5rem' }}>
            Oversee and manage your noble community
          </p>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <TextFlameButton onClick={selectAllMembers}>
            Select All ({currentMembers.length})
          </TextFlameButton>
          <TextFlameButton onClick={fetchMembers}>
            ↻ Refresh
          </TextFlameButton>
        </div>
      </header>

      {/* Main Content */}
      <main className="manager-content">
        {renderFilters()}
        {renderMembersList()}
      </main>

      {/* Modals */}
      {renderModModal()}

      {/* Quick Stats Footer */}
      <footer style={{ marginTop: '4rem', textAlign: 'center' }}>
        <StatsCard
          title="Quick Stats"
          stats={{
            Total: members.length,
            Filtered: filteredMembers.length,
            Selected: selectedMembers.length
          }}
        />
      </footer>
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default MemberManager;