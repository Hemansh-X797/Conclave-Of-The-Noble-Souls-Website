// ============================================================================
// DISCORD API INTEGRATION
// /src/lib/discord.js
// ============================================================================

const DISCORD_API_BASE = 'https://discord.com/api/v10';
const GUILD_ID = process.env.DISCORD_GUILD_ID;
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Make authenticated Discord API request
 */
async function discordRequest(endpoint, options = {}) {
  const url = `${DISCORD_API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Discord API error: ${response.status}`);
  }

  // Some Discord endpoints return 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// ============================================================================
// GUILD OPERATIONS
// ============================================================================

/**
 * Get guild information
 */
export async function getGuild(withCounts = true) {
  return discordRequest(`/guilds/${GUILD_ID}?with_counts=${withCounts}`);
}

/**
 * Get guild member count
 */
export async function getMemberCount() {
  const guild = await getGuild(true);
  return {
    total: guild.approximate_member_count,
    online: guild.approximate_presence_count
  };
}

/**
 * Get guild channels
 */
export async function getGuildChannels() {
  return discordRequest(`/guilds/${GUILD_ID}/channels`);
}

/**
 * Get guild roles
 */
export async function getGuildRoles() {
  return discordRequest(`/guilds/${GUILD_ID}/roles`);
}

/**
 * Get guild emojis
 */
export async function getGuildEmojis() {
  return discordRequest(`/guilds/${GUILD_ID}/emojis`);
}

// ============================================================================
// MEMBER OPERATIONS
// ============================================================================

/**
 * Get guild members (up to 1000)
 */
export async function getGuildMembers(limit = 1000) {
  return discordRequest(`/guilds/${GUILD_ID}/members?limit=${limit}`);
}

/**
 * Get specific member
 */
export async function getGuildMember(userId) {
  return discordRequest(`/guilds/${GUILD_ID}/members/${userId}`);
}

/**
 * Search guild members
 */
export async function searchGuildMembers(query, limit = 100) {
  return discordRequest(
    `/guilds/${GUILD_ID}/members/search?query=${encodeURIComponent(query)}&limit=${limit}`
  );
}

/**
 * Add role to member
 */
export async function addMemberRole(userId, roleId, reason = '') {
  return discordRequest(`/guilds/${GUILD_ID}/members/${userId}/roles/${roleId}`, {
    method: 'PUT',
    headers: {
      'X-Audit-Log-Reason': reason
    }
  });
}

/**
 * Remove role from member
 */
export async function removeMemberRole(userId, roleId, reason = '') {
  return discordRequest(`/guilds/${GUILD_ID}/members/${userId}/roles/${roleId}`, {
    method: 'DELETE',
    headers: {
      'X-Audit-Log-Reason': reason
    }
  });
}

/**
 * Modify guild member (timeout, nickname, etc.)
 */
export async function modifyGuildMember(userId, data, reason = '') {
  return discordRequest(`/guilds/${GUILD_ID}/members/${userId}`, {
    method: 'PATCH',
    headers: {
      'X-Audit-Log-Reason': reason
    },
    body: JSON.stringify(data)
  });
}

/**
 * Timeout member
 */
export async function timeoutMember(userId, durationSeconds, reason = '') {
  const timeoutUntil = new Date(Date.now() + durationSeconds * 1000).toISOString();
  
  return modifyGuildMember(
    userId,
    { communication_disabled_until: timeoutUntil },
    reason
  );
}

/**
 * Remove timeout from member
 */
export async function removeTimeout(userId, reason = '') {
  return modifyGuildMember(
    userId,
    { communication_disabled_until: null },
    reason
  );
}

// ============================================================================
// MODERATION OPERATIONS
// ============================================================================

/**
 * Kick member from guild
 */
export async function kickMember(userId, reason = '') {
  return discordRequest(`/guilds/${GUILD_ID}/members/${userId}`, {
    method: 'DELETE',
    headers: {
      'X-Audit-Log-Reason': reason
    }
  });
}

/**
 * Ban member from guild
 */
export async function banMember(userId, options = {}) {
  const {
    deleteMessageDays = 1,
    reason = ''
  } = options;

  return discordRequest(`/guilds/${GUILD_ID}/bans/${userId}`, {
    method: 'PUT',
    headers: {
      'X-Audit-Log-Reason': reason
    },
    body: JSON.stringify({
      delete_message_days: deleteMessageDays
    })
  });
}

/**
 * Unban member from guild
 */
export async function unbanMember(userId, reason = '') {
  return discordRequest(`/guilds/${GUILD_ID}/bans/${userId}`, {
    method: 'DELETE',
    headers: {
      'X-Audit-Log-Reason': reason
    }
  });
}

/**
 * Get guild bans
 */
export async function getGuildBans() {
  return discordRequest(`/guilds/${GUILD_ID}/bans`);
}

/**
 * Get specific ban
 */
export async function getGuildBan(userId) {
  return discordRequest(`/guilds/${GUILD_ID}/bans/${userId}`);
}

// ============================================================================
// CHANNEL OPERATIONS
// ============================================================================

/**
 * Get channel
 */
export async function getChannel(channelId) {
  return discordRequest(`/channels/${channelId}`);
}

/**
 * Create channel
 */
export async function createChannel(data, reason = '') {
  return discordRequest(`/guilds/${GUILD_ID}/channels`, {
    method: 'POST',
    headers: {
      'X-Audit-Log-Reason': reason
    },
    body: JSON.stringify(data)
  });
}

/**
 * Modify channel
 */
export async function modifyChannel(channelId, data, reason = '') {
  return discordRequest(`/channels/${channelId}`, {
    method: 'PATCH',
    headers: {
      'X-Audit-Log-Reason': reason
    },
    body: JSON.stringify(data)
  });
}

/**
 * Delete channel
 */
export async function deleteChannel(channelId, reason = '') {
  return discordRequest(`/channels/${channelId}`, {
    method: 'DELETE',
    headers: {
      'X-Audit-Log-Reason': reason
    }
  });
}

/**
 * Send message to channel
 */
export async function sendMessage(channelId, content) {
  return discordRequest(`/channels/${channelId}/messages`, {
    method: 'POST',
    body: JSON.stringify(
      typeof content === 'string' ? { content } : content
    )
  });
}

/**
 * Delete message
 */
export async function deleteMessage(channelId, messageId, reason = '') {
  return discordRequest(`/channels/${channelId}/messages/${messageId}`, {
    method: 'DELETE',
    headers: {
      'X-Audit-Log-Reason': reason
    }
  });
}

/**
 * Bulk delete messages
 */
export async function bulkDeleteMessages(channelId, messageIds, reason = '') {
  return discordRequest(`/channels/${channelId}/messages/bulk-delete`, {
    method: 'POST',
    headers: {
      'X-Audit-Log-Reason': reason
    },
    body: JSON.stringify({ messages: messageIds })
  });
}

// ============================================================================
// EVENT OPERATIONS
// ============================================================================

/**
 * Get scheduled events
 */
export async function getScheduledEvents(withUserCount = false) {
  return discordRequest(
    `/guilds/${GUILD_ID}/scheduled-events?with_user_count=${withUserCount}`
  );
}

/**
 * Get specific scheduled event
 */
export async function getScheduledEvent(eventId, withUserCount = false) {
  return discordRequest(
    `/guilds/${GUILD_ID}/scheduled-events/${eventId}?with_user_count=${withUserCount}`
  );
}

/**
 * Create scheduled event
 */
export async function createScheduledEvent(eventData, reason = '') {
  return discordRequest(`/guilds/${GUILD_ID}/scheduled-events`, {
    method: 'POST',
    headers: {
      'X-Audit-Log-Reason': reason
    },
    body: JSON.stringify(eventData)
  });
}

/**
 * Modify scheduled event
 */
export async function modifyScheduledEvent(eventId, eventData, reason = '') {
  return discordRequest(`/guilds/${GUILD_ID}/scheduled-events/${eventId}`, {
    method: 'PATCH',
    headers: {
      'X-Audit-Log-Reason': reason
    },
    body: JSON.stringify(eventData)
  });
}

/**
 * Delete scheduled event
 */
export async function deleteScheduledEvent(eventId, reason = '') {
  return discordRequest(`/guilds/${GUILD_ID}/scheduled-events/${eventId}`, {
    method: 'DELETE',
    headers: {
      'X-Audit-Log-Reason': reason
    }
  });
}

/**
 * Get event users
 */
export async function getScheduledEventUsers(eventId, options = {}) {
  const params = new URLSearchParams();
  if (options.limit) params.append('limit', options.limit);
  if (options.withMember) params.append('with_member', options.withMember);
  if (options.before) params.append('before', options.before);
  if (options.after) params.append('after', options.after);

  const query = params.toString() ? `?${params.toString()}` : '';
  return discordRequest(
    `/guilds/${GUILD_ID}/scheduled-events/${eventId}/users${query}`
  );
}

// ============================================================================
// WEBHOOK OPERATIONS
// ============================================================================

/**
 * Send webhook message
 */
export async function sendWebhook(webhookUrl, content) {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(
      typeof content === 'string' ? { content } : content
    )
  });

  if (!response.ok) {
    throw new Error(`Webhook failed: ${response.status}`);
  }

  return response.status === 204 ? null : response.json();
}

/**
 * Send announcement webhook
 */
export async function sendAnnouncementWebhook(title, description, options = {}) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_GENERAL;
  
  return sendWebhook(webhookUrl, {
    embeds: [{
      title,
      description,
      color: options.color || 0xD4AF37, // Gold
      thumbnail: options.thumbnail ? { url: options.thumbnail } : undefined,
      image: options.image ? { url: options.image } : undefined,
      footer: options.footer ? { text: options.footer } : undefined,
      timestamp: new Date().toISOString(),
      url: options.url
    }]
  });
}

/**
 * Send mod log webhook
 */
export async function sendModLogWebhook(action, details) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_ADMIN;
  
  const colors = {
    ban: 0xE0115F,    // Red
    kick: 0xFF8C00,   // Orange
    timeout: 0xFFD700, // Yellow
    warn: 0xFFA500     // Light orange
  };

  return sendWebhook(webhookUrl, {
    embeds: [{
      title: `🛡️ Moderation: ${action.toUpperCase()}`,
      description: `**Member:** <@${details.userId}>\n**Moderator:** <@${details.moderatorId}>\n**Reason:** ${details.reason}`,
      color: colors[action] || 0xD4AF37,
      timestamp: new Date().toISOString()
    }]
  });
}

// ============================================================================
// USER OPERATIONS
// ============================================================================

/**
 * Get user info
 */
export async function getUser(userId) {
  return discordRequest(`/users/${userId}`);
}

/**
 * Get current user (bot)
 */
export async function getCurrentUser() {
  return discordRequest('/users/@me');
}

// ============================================================================
// AUDIT LOG OPERATIONS
// ============================================================================

/**
 * Get guild audit log
 */
export async function getAuditLog(options = {}) {
  const params = new URLSearchParams();
  if (options.userId) params.append('user_id', options.userId);
  if (options.actionType) params.append('action_type', options.actionType);
  if (options.before) params.append('before', options.before);
  if (options.limit) params.append('limit', options.limit);

  const query = params.toString() ? `?${params.toString()}` : '';
  return discordRequest(`/guilds/${GUILD_ID}/audit-logs${query}`);
}

// ============================================================================
// INVITE OPERATIONS
// ============================================================================

/**
 * Get guild invites
 */
export async function getGuildInvites() {
  return discordRequest(`/guilds/${GUILD_ID}/invites`);
}

/**
 * Create channel invite
 */
export async function createChannelInvite(channelId, options = {}) {
  return discordRequest(`/channels/${channelId}/invites`, {
    method: 'POST',
    body: JSON.stringify({
      max_age: options.maxAge || 86400, // 24 hours
      max_uses: options.maxUses || 0,
      temporary: options.temporary || false,
      unique: options.unique || false
    })
  });
}

/**
 * Delete invite
 */
export async function deleteInvite(inviteCode, reason = '') {
  return discordRequest(`/invites/${inviteCode}`, {
    method: 'DELETE',
    headers: {
      'X-Audit-Log-Reason': reason
    }
  });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if user is in guild
 */
export async function isUserInGuild(userId) {
  try {
    await getGuildMember(userId);
    return true;
  } catch (error) {
    if (error.message.includes('404')) {
      return false;
    }
    throw error;
  }
}

/**
 * Get member roles
 */
export async function getMemberRoles(userId) {
  const member = await getGuildMember(userId);
  return member.roles;
}

/**
 * Check if member has role
 */
export async function memberHasRole(userId, roleId) {
  const roles = await getMemberRoles(userId);
  return roles.includes(roleId);
}

/**
 * Get member's highest role
 */
export async function getMemberHighestRole(userId) {
  const member = await getGuildMember(userId);
  const guildRoles = await getGuildRoles();
  
  let highestRole = null;
  let highestPosition = -1;

  for (const roleId of member.roles) {
    const role = guildRoles.find(r => r.id === roleId);
    if (role && role.position > highestPosition) {
      highestPosition = role.position;
      highestRole = role;
    }
  }

  return highestRole;
}

/**
 * Format Discord timestamp
 */
export function formatDiscordTimestamp(date, style = 'f') {
  // Styles: t (time), T (time with seconds), d (date), D (date long), f (datetime), F (datetime long), R (relative)
  const timestamp = Math.floor(new Date(date).getTime() / 1000);
  return `<t:${timestamp}:${style}>`;
}

/**
 * Create Discord embed
 */
export function createEmbed(options) {
  return {
    title: options.title,
    description: options.description,
    color: options.color || 0xD4AF37,
    fields: options.fields || [],
    thumbnail: options.thumbnail ? { url: options.thumbnail } : undefined,
    image: options.image ? { url: options.image } : undefined,
    footer: options.footer ? { text: options.footer, icon_url: options.footerIcon } : undefined,
    timestamp: options.timestamp !== false ? new Date().toISOString() : undefined,
    url: options.url
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Guild
  getGuild,
  getMemberCount,
  getGuildChannels,
  getGuildRoles,
  getGuildEmojis,
  
  // Members
  getGuildMembers,
  getGuildMember,
  searchGuildMembers,
  addMemberRole,
  removeMemberRole,
  modifyGuildMember,
  timeoutMember,
  removeTimeout,
  
  // Moderation
  kickMember,
  banMember,
  unbanMember,
  getGuildBans,
  getGuildBan,
  
  // Channels
  getChannel,
  createChannel,
  modifyChannel,
  deleteChannel,
  sendMessage,
  deleteMessage,
  bulkDeleteMessages,
  
  // Events
  getScheduledEvents,
  getScheduledEvent,
  createScheduledEvent,
  modifyScheduledEvent,
  deleteScheduledEvent,
  getScheduledEventUsers,
  
  // Webhooks
  sendWebhook,
  sendAnnouncementWebhook,
  sendModLogWebhook,
  
  // Users
  getUser,
  getCurrentUser,
  
  // Audit
  getAuditLog,
  
  // Invites
  getGuildInvites,
  createChannelInvite,
  deleteInvite,
  
  // Utilities
  isUserInGuild,
  getMemberRoles,
  memberHasRole,
  getMemberHighestRole,
  formatDiscordTimestamp,
  createEmbed
};