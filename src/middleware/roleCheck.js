// ============================================================================
// FILE 3: /src/middleware/roleCheck.js
// ============================================================================

import { NextResponse } from 'next/server';
import { 
  hasPermission, 
  hasAnyPermission,
  hasAllPermissions,
  isStaff, 
  getPermissionLevel,
  canModerate,
  PERMISSIONS,
  PERMISSION_LEVELS
} from '@/constants/permissions';

export function requirePermission(permission) {
  return async function(request) {
    if (!request.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!hasPermission(request.user.roles, permission)) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: `Missing required permission: ${permission}` 
        },
        { status: 403 }
      );
    }

    return null;
  };
}

export function requireAnyPermission(...permissions) {
  return async function(request) {
    if (!request.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!hasAnyPermission(request.user.roles, permissions)) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'Missing required permissions' 
        },
        { status: 403 }
      );
    }

    return null;
  };
}

export function requireAllPermissions(...permissions) {
  return async function(request) {
    if (!request.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!hasAllPermissions(request.user.roles, permissions)) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'Missing one or more required permissions' 
        },
        { status: 403 }
      );
    }

    return null;
  };
}

export function requireStaff(request) {
  if (!request.user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  if (!isStaff(request.user.roles)) {
    return NextResponse.json(
      { 
        error: 'Forbidden',
        message: 'Staff access required' 
      },
      { status: 403 }
    );
  }

  return null;
}

export function requirePermissionLevel(minLevel) {
  return async function(request) {
    if (!request.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userLevel = getPermissionLevel(request.user.roles);
    
    if (userLevel < minLevel) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: `Insufficient permission level. Required: ${minLevel}, Current: ${userLevel}` 
        },
        { status: 403 }
      );
    }

    return null;
  };
}

export function requireModerationAccess(targetUserId, targetRoles) {
  return async function(request) {
    if (!request.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!canModerate(request.user.roles, targetRoles)) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'Cannot moderate user with equal or higher permission level' 
        },
        { status: 403 }
      );
    }

    return null;
  };
}

export function requireOwnershipOrStaff(resourceOwnerId) {
  return async function(request) {
    if (!request.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const isOwner = request.user.id === resourceOwnerId;
    const isStaffMember = isStaff(request.user.roles);

    if (!isOwner && !isStaffMember) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'You can only access your own resources' 
        },
        { status: 403 }
      );
    }

    return null;
  };
}

export const requireAdmin = requirePermissionLevel(PERMISSION_LEVELS.ADMIN);
export const requireModerator = requirePermissionLevel(PERMISSION_LEVELS.MODERATOR);
export const requireVIP = requirePermissionLevel(PERMISSION_LEVELS.VIP);

export const requireContentManagement = requirePermission(PERMISSIONS.MANAGE_CONTENT);
export const requireEventManagement = requireAnyPermission(
  PERMISSIONS.CREATE_EVENTS,
  PERMISSIONS.MANAGE_EVENTS
);

export const requireMemberManagement = requireAnyPermission(
  PERMISSIONS.MANAGE_MEMBERS,
  PERMISSIONS.BAN_MEMBERS,
  PERMISSIONS.KICK_MEMBERS
);

export const requireBanPermission = requirePermission(PERMISSIONS.BAN_MEMBERS);
export const requireKickPermission = requirePermission(PERMISSIONS.KICK_MEMBERS);
export const requireTimeoutPermission = requirePermission(PERMISSIONS.TIMEOUT_MEMBERS);
export const requireWarnPermission = requirePermission(PERMISSIONS.CREATE_WARNINGS);

export const requireAnalyticsAccess = requirePermission(PERMISSIONS.VIEW_ANALYTICS);

export default {
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireStaff,
  requirePermissionLevel,
  requireModerationAccess,
  requireOwnershipOrStaff,
  requireAdmin,
  requireModerator,
  requireVIP,
  requireContentManagement,
  requireEventManagement,
  requireMemberManagement,
  requireBanPermission,
  requireKickPermission,
  requireTimeoutPermission,
  requireWarnPermission,
  requireAnalyticsAccess
};