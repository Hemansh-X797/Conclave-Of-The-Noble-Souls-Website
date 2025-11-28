// ============================================================================
// THE CONCLAVE REALM - BACKGROUND JOB QUEUE
// Location: /src/lib/queue.js
// ============================================================================
// Purpose: Simple in-memory job queue for background tasks
// Features: Priority queues, retry logic, scheduling, job tracking
// Dependencies: None (pure JavaScript)
// Author: The Conclave Development Team
// Created: 2024-11-26
// Version: 1.0.0
// ============================================================================

/**
 * @fileoverview
 * Lightweight background job queue system
 * 
 * Features:
 * - Priority-based job execution
 * - Automatic retry with exponential backoff
 * - Job scheduling (delay execution)
 * - Concurrent job processing
 * - Job lifecycle tracking
 * - Event emitters for monitoring
 * - Graceful shutdown
 * 
 * @example
 * import { queue, createJob } from '@/lib/queue';
 * 
 * // Add job to queue
 * const job = await createJob('send-email', {
 *   to: 'user@example.com',
 *   subject: 'Welcome'
 * });
 * 
 * // Process jobs
 * queue.process('send-email', async (job) => {
 *   await sendEmail(job.data);
 * });
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const QUEUE_CONFIG = {
  // Concurrency
  DEFAULT_CONCURRENCY: parseInt(process.env.QUEUE_CONCURRENCY) || 5,
  
  // Retry settings
  MAX_RETRIES: 3,
  RETRY_DELAYS: [1000, 5000, 15000], // Exponential backoff (ms)
  
  // Job timeout
  DEFAULT_TIMEOUT: 60000, // 1 minute
  
  // Cleanup
  CLEANUP_INTERVAL: 300000, // 5 minutes
  COMPLETED_JOB_RETENTION: 3600000, // 1 hour
  FAILED_JOB_RETENTION: 86400000, // 24 hours
  
  // Priorities
  PRIORITIES: {
    LOW: 10,
    NORMAL: 50,
    HIGH: 100,
    CRITICAL: 200,
  },

  // Job states
  STATES: {
    WAITING: 'waiting',
    ACTIVE: 'active',
    COMPLETED: 'completed',
    FAILED: 'failed',
    DELAYED: 'delayed',
    CANCELLED: 'cancelled',
  },
};

// ============================================================================
// JOB CLASS
// ============================================================================

/**
 * @class Job
 * @description Represents a single background job
 */
class Job {
  /**
   * Create job
   * @param {string} type - Job type
   * @param {*} data - Job data
   * @param {object} options - Job options
   */
  constructor(type, data, options = {}) {
    this.id = this.generateId();
    this.type = type;
    this.data = data;
    this.priority = options.priority || QUEUE_CONFIG.PRIORITIES.NORMAL;
    this.timeout = options.timeout || QUEUE_CONFIG.DEFAULT_TIMEOUT;
    this.delay = options.delay || 0;
    this.maxRetries = options.maxRetries ?? QUEUE_CONFIG.MAX_RETRIES;
    
    // State tracking
    this.state = this.delay > 0 ? QUEUE_CONFIG.STATES.DELAYED : QUEUE_CONFIG.STATES.WAITING;
    this.attempts = 0;
    this.errors = [];
    this.result = null;
    
    // Timestamps
    this.createdAt = Date.now();
    this.startedAt = null;
    this.completedAt = null;
    this.failedAt = null;
    this.scheduledFor = this.delay > 0 ? this.createdAt + this.delay : null;
    
    // Metadata
    this.metadata = options.metadata || {};
  }

  /**
   * Generate unique job ID
   * @returns {string} Job ID
   */
  generateId() {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if job is ready to execute
   * @returns {boolean} Is ready
   */
  isReady() {
    if (this.state !== QUEUE_CONFIG.STATES.WAITING && 
        this.state !== QUEUE_CONFIG.STATES.DELAYED) {
      return false;
    }
    
    if (this.scheduledFor && Date.now() < this.scheduledFor) {
      return false;
    }
    
    return true;
  }

  /**
   * Check if job can be retried
   * @returns {boolean} Can retry
   */
  canRetry() {
    return this.attempts < this.maxRetries;
  }

  /**
   * Get retry delay for current attempt
   * @returns {number} Delay in milliseconds
   */
  getRetryDelay() {
    const index = Math.min(this.attempts, QUEUE_CONFIG.RETRY_DELAYS.length - 1);
    return QUEUE_CONFIG.RETRY_DELAYS[index];
  }

  /**
   * Mark job as started
   */
  markStarted() {
    this.state = QUEUE_CONFIG.STATES.ACTIVE;
    this.startedAt = Date.now();
    this.attempts++;
  }

  /**
   * Mark job as completed
   * @param {*} result - Job result
   */
  markCompleted(result) {
    this.state = QUEUE_CONFIG.STATES.COMPLETED;
    this.completedAt = Date.now();
    this.result = result;
  }

  /**
   * Mark job as failed
   * @param {Error} error - Error object
   */
  markFailed(error) {
    this.state = QUEUE_CONFIG.STATES.FAILED;
    this.failedAt = Date.now();
    this.errors.push({
      attempt: this.attempts,
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
    });
  }

  /**
   * Mark job as cancelled
   */
  markCancelled() {
    this.state = QUEUE_CONFIG.STATES.CANCELLED;
  }

  /**
   * Get job duration
   * @returns {number} Duration in milliseconds
   */
  getDuration() {
    if (!this.startedAt) return 0;
    const endTime = this.completedAt || this.failedAt || Date.now();
    return endTime - this.startedAt;
  }

  /**
   * Get job summary
   * @returns {object} Job summary
   */
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      state: this.state,
      priority: this.priority,
      attempts: this.attempts,
      maxRetries: this.maxRetries,
      createdAt: this.createdAt,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      failedAt: this.failedAt,
      duration: this.getDuration(),
      hasErrors: this.errors.length > 0,
      errorCount: this.errors.length,
    };
  }
}

// ============================================================================
// QUEUE CLASS
// ============================================================================

/**
 * @class Queue
 * @description Manages background job execution
 */
class Queue {
  constructor() {
    // Job storage
    this.jobs = new Map();
    this.processors = new Map();
    
    // State tracking
    this.activeJobs = new Set();
    this.concurrency = QUEUE_CONFIG.DEFAULT_CONCURRENCY;
    this.running = false;
    this.paused = false;
    
    // Statistics
    this.stats = {
      total: 0,
      completed: 0,
      failed: 0,
      active: 0,
      waiting: 0,
      delayed: 0,
    };

    // Event listeners
    this.listeners = new Map();
    
    // Start processing
    this.start();
    
    // Start cleanup
    this.startCleanup();
  }

  // ==========================================================================
  // JOB MANAGEMENT
  // ==========================================================================

  /**
   * Add job to queue
   * @param {string} type - Job type
   * @param {*} data - Job data
   * @param {object} options - Job options
   * @returns {Job} Created job
   * 
   * @example
   * const job = queue.add('send-email', { to: 'user@email.com' });
   */
  add(type, data, options = {}) {
    const job = new Job(type, data, options);
    this.jobs.set(job.id, job);
    this.stats.total++;
    this.updateStats();
    
    this.emit('job:added', job);
    
    // Trigger processing
    if (this.running && !this.paused) {
      this.process();
    }
    
    return job;
  }

  /**
   * Get job by ID
   * @param {string} jobId - Job ID
   * @returns {Job|null} Job or null
   */
  getJob(jobId) {
    return this.jobs.get(jobId) || null;
  }

  /**
   * Remove job from queue
   * @param {string} jobId - Job ID
   * @returns {boolean} Success status
   */
  removeJob(jobId) {
    const job = this.jobs.get(jobId);
    if (!job) return false;
    
    // Can't remove active jobs
    if (job.state === QUEUE_CONFIG.STATES.ACTIVE) {
      return false;
    }
    
    this.jobs.delete(jobId);
    this.updateStats();
    this.emit('job:removed', job);
    
    return true;
  }

  /**
   * Cancel job
   * @param {string} jobId - Job ID
   * @returns {boolean} Success status
   */
  cancelJob(jobId) {
    const job = this.jobs.get(jobId);
    if (!job) return false;
    
    // Can't cancel completed/failed jobs
    if (job.state === QUEUE_CONFIG.STATES.COMPLETED || 
        job.state === QUEUE_CONFIG.STATES.FAILED) {
      return false;
    }
    
    job.markCancelled();
    this.activeJobs.delete(jobId);
    this.updateStats();
    this.emit('job:cancelled', job);
    
    return true;
  }

  // ==========================================================================
  // PROCESSOR REGISTRATION
  // ==========================================================================

  /**
   * Register processor for job type
   * @param {string} type - Job type
   * @param {Function} handler - Processing function
   * @param {object} options - Processor options
   * 
   * @example
   * queue.process('send-email', async (job) => {
   *   await sendEmail(job.data);
   * });
   */
  process(type, handler, options = {}) {
    if (typeof type === 'string' && typeof handler === 'function') {
      this.processors.set(type, { handler, options });
      this.emit('processor:registered', { type, options });
    }
    
    // Trigger job processing
    this.processNextJob();
  }

  /**
   * Process next available job
   */
  async processNextJob() {
    // Check if we can process more jobs
    if (this.paused || this.activeJobs.size >= this.concurrency) {
      return;
    }

    // Find next ready job
    const job = this.getNextReadyJob();
    if (!job) return;

    // Check if we have a processor for this job type
    const processor = this.processors.get(job.type);
    if (!processor) {
      console.warn(`No processor registered for job type: ${job.type}`);
      return;
    }

    // Execute job
    await this.executeJob(job, processor);
    
    // Continue processing
    setImmediate(() => this.processNextJob());
  }

  /**
   * Get next ready job (priority-based)
   * @returns {Job|null} Next job or null
   */
  getNextReadyJob() {
    let nextJob = null;
    let highestPriority = -1;

    for (const job of this.jobs.values()) {
      if (job.isReady() && job.priority > highestPriority) {
        nextJob = job;
        highestPriority = job.priority;
      }
    }

    return nextJob;
  }

  /**
   * Execute job with processor
   * @param {Job} job - Job to execute
   * @param {object} processor - Processor config
   */
  async executeJob(job, processor) {
    this.activeJobs.add(job.id);
    job.markStarted();
    this.updateStats();
    this.emit('job:started', job);

    try {
      // Set timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Job timeout')), job.timeout);
      });

      // Execute handler
      const result = await Promise.race([
        processor.handler(job),
        timeoutPromise,
      ]);

      // Mark as completed
      job.markCompleted(result);
      this.stats.completed++;
      this.emit('job:completed', job);
    } catch (error) {
      // Mark as failed
      job.markFailed(error);
      this.emit('job:failed', job, error);

      // Retry if possible
      if (job.canRetry()) {
        job.state = QUEUE_CONFIG.STATES.DELAYED;
        job.scheduledFor = Date.now() + job.getRetryDelay();
        this.emit('job:retry', job);
      } else {
        this.stats.failed++;
        this.emit('job:exhausted', job);
      }
    } finally {
      this.activeJobs.delete(job.id);
      this.updateStats();
    }
  }

  // ==========================================================================
  // QUEUE CONTROL
  // ==========================================================================

  /**
   * Start queue processing
   */
  start() {
    if (this.running) return;
    
    this.running = true;
    this.paused = false;
    this.emit('queue:started');
    
    // Start processing loop
    this.processNextJob();
  }

  /**
   * Pause queue processing
   */
  pause() {
    this.paused = true;
    this.emit('queue:paused');
  }

  /**
   * Resume queue processing
   */
  resume() {
    if (!this.paused) return;
    
    this.paused = false;
    this.emit('queue:resumed');
    
    // Resume processing
    this.processNextJob();
  }

  /**
   * Stop queue processing
   * @param {boolean} graceful - Wait for active jobs
   */
  async stop(graceful = true) {
    this.running = false;
    this.paused = true;
    this.emit('queue:stopping');

    if (graceful) {
      // Wait for active jobs to complete
      while (this.activeJobs.size > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } else {
      // Cancel all active jobs
      for (const jobId of this.activeJobs) {
        this.cancelJob(jobId);
      }
    }

    this.emit('queue:stopped');
  }

  /**
   * Clear all jobs
   * @param {string} state - Only clear jobs in this state
   */
  clear(state = null) {
    const toRemove = [];

    for (const [jobId, job] of this.jobs) {
      if (!state || job.state === state) {
        if (job.state !== QUEUE_CONFIG.STATES.ACTIVE) {
          toRemove.push(jobId);
        }
      }
    }

    toRemove.forEach(id => this.jobs.delete(id));
    this.updateStats();
    this.emit('queue:cleared', { count: toRemove.length, state });
  }

  // ==========================================================================
  // STATISTICS & MONITORING
  // ==========================================================================

  /**
   * Update queue statistics
   */
  updateStats() {
    this.stats.active = 0;
    this.stats.waiting = 0;
    this.stats.delayed = 0;

    for (const job of this.jobs.values()) {
      switch (job.state) {
        case QUEUE_CONFIG.STATES.ACTIVE:
          this.stats.active++;
          break;
        case QUEUE_CONFIG.STATES.WAITING:
          this.stats.waiting++;
          break;
        case QUEUE_CONFIG.STATES.DELAYED:
          this.stats.delayed++;
          break;
      }
    }
  }

  /**
   * Get queue statistics
   * @returns {object} Statistics
   */
  getStats() {
    return {
      ...this.stats,
      total: this.jobs.size,
      concurrency: this.concurrency,
      running: this.running,
      paused: this.paused,
    };
  }

  /**
   * Get jobs by state
   * @param {string} state - Job state
   * @returns {Array} Jobs
   */
  getJobsByState(state) {
    const jobs = [];
    for (const job of this.jobs.values()) {
      if (job.state === state) {
        jobs.push(job);
      }
    }
    return jobs;
  }

  // ==========================================================================
  // CLEANUP
  // ==========================================================================

  /**
   * Start automatic cleanup
   */
  startCleanup() {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, QUEUE_CONFIG.CLEANUP_INTERVAL);
  }

  /**
   * Cleanup old jobs
   */
  cleanup() {
    const now = Date.now();
    const toRemove = [];

    for (const [jobId, job] of this.jobs) {
      // Remove completed jobs older than retention period
      if (job.state === QUEUE_CONFIG.STATES.COMPLETED) {
        if (job.completedAt && 
            now - job.completedAt > QUEUE_CONFIG.COMPLETED_JOB_RETENTION) {
          toRemove.push(jobId);
        }
      }
      
      // Remove failed jobs older than retention period
      if (job.state === QUEUE_CONFIG.STATES.FAILED) {
        if (job.failedAt && 
            now - job.failedAt > QUEUE_CONFIG.FAILED_JOB_RETENTION) {
          toRemove.push(jobId);
        }
      }
    }

    toRemove.forEach(id => this.jobs.delete(id));
    
    if (toRemove.length > 0) {
      this.updateStats();
      this.emit('queue:cleanup', { removed: toRemove.length });
    }
  }

  /**
   * Stop automatic cleanup
   */
  stopCleanup() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  // ==========================================================================
  // EVENT SYSTEM
  // ==========================================================================

  /**
   * Register event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit event
   * @param {string} event - Event name
   * @param {...*} args - Event arguments
   */
  emit(event, ...args) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Event handler error (${event}):`, error);
        }
      });
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

const queue = new Queue();

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Create and add job to queue
 * @param {string} type - Job type
 * @param {*} data - Job data
 * @param {object} options - Job options
 * @returns {Job} Created job
 */
export const createJob = (type, data, options) => {
  return queue.add(type, data, options);
};

/**
 * Get queue instance
 * @returns {Queue} Queue instance
 */
export const getQueue = () => queue;

// ============================================================================
// EXPORTS
// ============================================================================

export default queue;
export { 
  queue, 
  Queue, 
  Job,
  QUEUE_CONFIG,
};