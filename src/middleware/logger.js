// ============================================================================
// REQUEST LOGGING MIDDLEWARE
// For use in API routes
// /src/middleware/logger.js
// ============================================================================

import { NextResponse } from 'next/server';

/**
 * Log request details
 */
export function loggerMiddleware(request) {
  const start = Date.now();
  const { method, url } = request;
  
  const logData = {
    timestamp: new Date().toISOString(),
    method,
    url,
    userAgent: request.headers.get('user-agent'),
    ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
        request.headers.get('x-real-ip') || 
        'unknown',
    userId: request.user?.id || 'anonymous'
  };

  // Log request
  console.log('[REQUEST]', JSON.stringify(logData));

  // Track timing (attach to request for later use)
  request.logStart = start;
  request.logData = logData;

  return null; // Continue
}

/**
 * Log response (call this at the end of your route handler)
 */
export function logResponse(request, response, additionalData = {}) {
  const duration = Date.now() - (request.logStart || 0);
  
  const logData = {
    ...request.logData,
    status: response?.status || 200,
    duration: `${duration}ms`,
    ...additionalData
  };

  if (response?.status >= 400) {
    console.error('[RESPONSE ERROR]', JSON.stringify(logData));
  } else {
    console.log('[RESPONSE]', JSON.stringify(logData));
  }
}

/**
 * Error logging middleware
 */
export function errorLoggerMiddleware(request) {
  return async function(error) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      userId: request.user?.id || 'anonymous',
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    };

    console.error('[ERROR]', JSON.stringify(errorLog));

    // In production, send to error tracking service (Sentry, etc.)
    // await sendToSentry(errorLog);

    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  };
}

/**
 * Log admin action
 */
export async function logAdminAction(request, action, details = {}) {
  const log = {
    timestamp: new Date().toISOString(),
    action,
    actor_id: request.user?.id,
    actor_username: request.user?.username,
    ...details,
    ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown',
    userAgent: request.headers.get('user-agent')
  };

  console.log('[ADMIN ACTION]', JSON.stringify(log));

  // In production, save to database
  // await supabase.from('admin_logs').insert(log);

  return log;
}

/**
 * Log security event
 */
export async function logSecurityEvent(request, event, severity = 'info', details = {}) {
  const log = {
    timestamp: new Date().toISOString(),
    event,
    severity, // 'info', 'warning', 'critical'
    userId: request.user?.id || 'anonymous',
    ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown',
    userAgent: request.headers.get('user-agent'),
    ...details
  };

  const logLevel = severity === 'critical' ? 'error' : severity === 'warning' ? 'warn' : 'log';
  console[logLevel]('[SECURITY]', JSON.stringify(log));

  // In production, send alerts for critical events
  // if (severity === 'critical') {
  //   await sendSecurityAlert(log);
  // }

  return log;
}

/**
 * Log moderation action
 */
export async function logModerationAction(request, action, targetId, reason, details = {}) {
  const log = {
    timestamp: new Date().toISOString(),
    action, // 'ban', 'kick', 'timeout', 'warn'
    moderator_id: request.user?.id,
    moderator_username: request.user?.username,
    target_id: targetId,
    reason,
    ...details,
    ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  };

  console.log('[MODERATION]', JSON.stringify(log));

  // In production, save to database
  // await supabase.from('mod_logs').insert(log);

  return log;
}

/**
 * Middleware chain helper - combines multiple middleware
 */
export function chain(...middlewares) {
  return async function(request) {
    for (const middleware of middlewares) {
      const result = await middleware(request);
      if (result instanceof Response || result instanceof NextResponse) {
        return result; // Short-circuit on error
      }
    }
    return null; // All passed
  };
}

/**
 * Create request context logger
 */
export function createRequestLogger(request) {
  const startTime = Date.now();
  const context = {
    requestId: generateRequestId(),
    userId: request.user?.id || 'anonymous',
    ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown',
    method: request.method,
    url: request.url
  };

  return {
    info: (message, data = {}) => {
      console.log(JSON.stringify({
        ...context,
        level: 'info',
        message,
        ...data,
        timestamp: new Date().toISOString()
      }));
    },
    
    warn: (message, data = {}) => {
      console.warn(JSON.stringify({
        ...context,
        level: 'warn',
        message,
        ...data,
        timestamp: new Date().toISOString()
      }));
    },
    
    error: (message, error, data = {}) => {
      console.error(JSON.stringify({
        ...context,
        level: 'error',
        message,
        error: {
          message: error?.message,
          stack: error?.stack,
          name: error?.name
        },
        ...data,
        timestamp: new Date().toISOString()
      }));
    },
    
    done: (statusCode, data = {}) => {
      const duration = Date.now() - startTime;
      console.log(JSON.stringify({
        ...context,
        level: 'info',
        message: 'Request completed',
        statusCode,
        duration: `${duration}ms`,
        ...data,
        timestamp: new Date().toISOString()
      }));
    }
  };
}

/**
 * Generate unique request ID
 */
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Performance monitoring middleware
 */
export function performanceLogger(request) {
  const start = Date.now();
  
  return {
    end: (operationName) => {
      const duration = Date.now() - start;
      
      // Log slow operations
      if (duration > 1000) {
        console.warn('[PERFORMANCE]', JSON.stringify({
          operation: operationName,
          duration: `${duration}ms`,
          url: request.url,
          userId: request.user?.id || 'anonymous',
          timestamp: new Date().toISOString()
        }));
      }
      
      return duration;
    }
  };
}

/**
 * Structured logging for different log levels
 */
export const logger = {
  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[DEBUG]', message, data);
    }
  },
  
  info: (message, data = {}) => {
    console.log('[INFO]', message, data);
  },
  
  warn: (message, data = {}) => {
    console.warn('[WARN]', message, data);
  },
  
  error: (message, error, data = {}) => {
    console.error('[ERROR]', message, {
      error: {
        message: error?.message,
        stack: error?.stack
      },
      ...data
    });
  }
};

export default {
  loggerMiddleware,
  logResponse,
  errorLoggerMiddleware,
  logAdminAction,
  logSecurityEvent,
  logModerationAction,
  chain,
  createRequestLogger,
  performanceLogger,
  logger
};