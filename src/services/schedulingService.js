/**
 * Scheduling Service
 * 
 * Comprehensive service for class scheduling operations including bulk scheduling,
 * cancellation, conflict resolution, and Appwrite integration for SportClubApp.
 * 
 * @service
 * @version 1.0.0
 */

import { databases, APPWRITE_CONFIG, Query, ID, retryOperation } from './appwrite.js'
import { 
  handleError, 
  handleValidationError, 
  createSuccessResponse, 
  ErrorTypes 
} from '../utils/errorHandler.js'
import { getCurrentUser } from './authService.js'
import { logActivity } from './databaseService.js'

const DATABASE_ID = APPWRITE_CONFIG.databaseId
const CLASSES_COLLECTION = APPWRITE_CONFIG.collections.classes

/**
 * Scheduling constants and configurations
 * @constant
 */
export const SCHEDULING_CONFIG = {
  // Available batches for scheduling
  BATCHES: {
    MORNING: {
      id: 'morning',
      name: 'Morning Batch',
      defaultTime: '09:00',
      color: 'orange',
      maxStudents: 15
    },
    EVENING: {
      id: 'evening', 
      name: 'Evening Batch',
      defaultTime: '18:00',
      color: 'purple',
      maxStudents: 12
    },
    WEEKEND: {
      id: 'weekend',
      name: 'Weekend Batch', 
      defaultTime: '10:00',
      color: 'blue',
      maxStudents: 20
    }
  },

  // Class statuses
  STATUS: {
    SCHEDULED: 'scheduled',
    COMPLETED: 'completed', 
    CANCELLED: 'cancelled',
    RESCHEDULED: 'rescheduled'
  },

  // Scheduling actions
  ACTIONS: {
    SCHEDULE: 'schedule',
    CANCEL: 'cancel',
    RESCHEDULE: 'reschedule'
  },

  // Validation rules
  VALIDATION: {
    MAX_ADVANCE_DAYS: 90,        // Maximum days in advance to schedule
    MIN_ADVANCE_HOURS: 2,        // Minimum hours in advance to schedule
    MAX_BATCH_SIZE: 25,          // Maximum students per class
    MAX_BULK_OPERATIONS: 50      // Maximum classes in bulk operation
  }
}

/**
 * Utility functions for date handling
 */
export const DateUtils = {
  /**
   * Format date for storage (YYYY-MM-DD)
   * @function formatDateForStorage
   * @param {Date} date - Date to format
   * @returns {string} Formatted date string
   */
  formatDateForStorage: (date) => {
    return date.toISOString().split('T')[0]
  },

  /**
   * Parse date from storage format
   * @function parseDateFromStorage
   * @param {string} dateString - Date string to parse
   * @returns {Date} Parsed date
   */
  parseDateFromStorage: (dateString) => {
    return new Date(dateString + 'T00:00:00.000Z')
  },

  /**
   * Generate date range
   * @function generateDateRange
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {Array} excludeDays - Days to exclude (0=Sunday, 6=Saturday)
   * @returns {Array} Array of dates
   */
  generateDateRange: (startDate, endDate, excludeDays = []) => {
    const dates = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      if (!excludeDays.includes(currentDate.getDay())) {
        dates.push(new Date(currentDate))
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return dates
  },

  /**
   * Check if date is valid for scheduling
   * @function isValidSchedulingDate
   * @param {Date} date - Date to validate
   * @returns {Object} Validation result
   */
  isValidSchedulingDate: (date) => {
    const now = new Date()
    const minDate = new Date(now.getTime() + SCHEDULING_CONFIG.VALIDATION.MIN_ADVANCE_HOURS * 60 * 60 * 1000)
    const maxDate = new Date(now.getTime() + SCHEDULING_CONFIG.VALIDATION.MAX_ADVANCE_DAYS * 24 * 60 * 60 * 1000)

    if (date < minDate) {
      return {
        valid: false,
        reason: `Classes must be scheduled at least ${SCHEDULING_CONFIG.VALIDATION.MIN_ADVANCE_HOURS} hours in advance`
      }
    }

    if (date > maxDate) {
      return {
        valid: false,
        reason: `Classes cannot be scheduled more than ${SCHEDULING_CONFIG.VALIDATION.MAX_ADVANCE_DAYS} days in advance`
      }
    }

    return { valid: true }
  }
}

/**
 * Validate scheduling request
 * @function validateSchedulingRequest
 * @param {Object} request - Scheduling request data
 * @returns {Object} Validation result
 */
const validateSchedulingRequest = (request) => {
  const errors = []

  // Validate required fields
  if (!request.startDate) {
    errors.push('Start date is required')
  }

  if (!request.endDate) {
    errors.push('End date is required')
  }

  if (!request.batches || request.batches.length === 0) {
    errors.push('At least one batch must be selected')
  }

  if (!request.action || !Object.values(SCHEDULING_CONFIG.ACTIONS).includes(request.action)) {
    errors.push('Valid action is required')
  }

  // Validate date range
  if (request.startDate && request.endDate) {
    const startDate = new Date(request.startDate)
    const endDate = new Date(request.endDate)

    if (startDate > endDate) {
      errors.push('Start date must be before end date')
    }

    // Validate individual dates
    const startValidation = DateUtils.isValidSchedulingDate(startDate)
    if (!startValidation.valid) {
      errors.push(`Start date: ${startValidation.reason}`)
    }

    const endValidation = DateUtils.isValidSchedulingDate(endDate)
    if (!endValidation.valid) {
      errors.push(`End date: ${endValidation.reason}`)
    }

    // Check date range size
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
    const totalClasses = daysDiff * request.batches.length

    if (totalClasses > SCHEDULING_CONFIG.VALIDATION.MAX_BULK_OPERATIONS) {
      errors.push(`Maximum ${SCHEDULING_CONFIG.VALIDATION.MAX_BULK_OPERATIONS} classes can be scheduled at once`)
    }
  }

  // Validate batches
  if (request.batches) {
    const invalidBatches = request.batches.filter(
      batch => !Object.keys(SCHEDULING_CONFIG.BATCHES).includes(batch.toUpperCase())
    )
    if (invalidBatches.length > 0) {
      errors.push(`Invalid batches: ${invalidBatches.join(', ')}`)
    }
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors
    }
  }

  return { valid: true }
}

/**
 * Check for scheduling conflicts
 * @function checkSchedulingConflicts
 * @param {Array} dates - Dates to check
 * @param {Array} batches - Batches to check
 * @returns {Promise<Object>} Conflict check result
 */
export const checkSchedulingConflicts = async (dates, batches) => {
  try {
    const conflicts = []
    
    // Check each date and batch combination
    for (const date of dates) {
      const dateString = DateUtils.formatDateForStorage(date)
      
      for (const batch of batches) {
        const batchConfig = SCHEDULING_CONFIG.BATCHES[batch.toUpperCase()]
        
        // Query existing classes for this date and batch
        const existingClasses = await retryOperation(
          () => databases.listDocuments(DATABASE_ID, CLASSES_COLLECTION, [
            Query.equal('date', dateString),
            Query.equal('batch_name', batchConfig.name),
            Query.equal('status', SCHEDULING_CONFIG.STATUS.SCHEDULED)
          ]),
          'check_scheduling_conflicts'
        )

        if (existingClasses.documents.length > 0) {
          conflicts.push({
            date: dateString,
            batch: batchConfig.name,
            existingClass: existingClasses.documents[0]
          })
        }
      }
    }

    return createSuccessResponse({
      hasConflicts: conflicts.length > 0,
      conflicts
    }, 'Conflict check completed')

  } catch (error) {
    return handleError(error, 'checkSchedulingConflicts')
  }
}

/**
 * Schedule classes in bulk
 * @function scheduleClasses
 * @param {Object} request - Scheduling request
 * @param {string} request.startDate - Start date (YYYY-MM-DD)
 * @param {string} request.endDate - End date (YYYY-MM-DD)
 * @param {Array} request.batches - Array of batch IDs to schedule
 * @param {Array} [request.excludeDays=[]] - Days to exclude (0=Sunday, 6=Saturday)
 * @param {string} [request.notes=''] - Optional notes for the classes
 * @param {boolean} [request.skipConflicts=false] - Skip conflicting dates
 * @returns {Promise<Object>} Scheduling result
 */
export const scheduleClasses = async (request) => {
  try {
    // Validate request
    const validation = validateSchedulingRequest(request)
    if (!validation.valid) {
      return handleValidationError(validation.errors.join('. '))
    }

    const { 
      startDate, 
      endDate, 
      batches, 
      excludeDays = [0], // Exclude Sundays by default
      notes = '',
      skipConflicts = false
    } = request

    // Generate date range
    const dates = DateUtils.generateDateRange(
      new Date(startDate), 
      new Date(endDate),
      excludeDays
    )

    // Check for conflicts if not skipping
    if (!skipConflicts) {
      const conflictCheck = await checkSchedulingConflicts(dates, batches)
      if (!conflictCheck.success) {
        return conflictCheck
      }

      if (conflictCheck.data.hasConflicts) {
        return handleValidationError(
          `Scheduling conflicts found for ${conflictCheck.data.conflicts.length} classes`,
          ErrorTypes.VALIDATION,
          { conflicts: conflictCheck.data.conflicts }
        )
      }
    }

    // Get current user for logging
    const currentUser = await getCurrentUser()
    const scheduledBy = currentUser.success ? currentUser.data.email : 'system'

    const scheduledClasses = []
    const errors = []

    // Schedule each class
    for (const date of dates) {
      for (const batchId of batches) {
        try {
          const batchConfig = SCHEDULING_CONFIG.BATCHES[batchId.toUpperCase()]
          const dateString = DateUtils.formatDateForStorage(date)

          // Create class document
          const classData = {
            date: dateString,
            batch_name: batchConfig.name,
            time: batchConfig.defaultTime,
            status: SCHEDULING_CONFIG.STATUS.SCHEDULED,
            max_students: batchConfig.maxStudents,
            scheduled_by: scheduledBy,
            notes: notes,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }

          const result = await retryOperation(
            () => databases.createDocument(DATABASE_ID, CLASSES_COLLECTION, ID.unique(), classData),
            'schedule_class'
          )

          scheduledClasses.push(result)

        } catch (error) {
          errors.push({
            date: DateUtils.formatDateForStorage(date),
            batch: batchId,
            error: error.message
          })
        }
      }
    }

    // Log activity
    try {
      await logActivity(
        'Classes Scheduled',
        scheduledBy,
        {
          count: scheduledClasses.length,
          dateRange: `${startDate} to ${endDate}`,
          batches: batches.join(', '),
          errors: errors.length
        }
      )
    } catch (logError) {
      console.warn('Failed to log scheduling activity:', logError)
    }

    const result = {
      scheduled: scheduledClasses.length,
      errors: errors.length,
      classes: scheduledClasses,
      failed: errors
    }

    if (errors.length === 0) {
      return createSuccessResponse(
        result,
        `Successfully scheduled ${scheduledClasses.length} classes`
      )
    } else if (scheduledClasses.length > 0) {
      return createSuccessResponse(
        result,
        `Scheduled ${scheduledClasses.length} classes with ${errors.length} errors`
      )
    } else {
      return handleError(
        new Error('No classes were scheduled'),
        'scheduleClasses',
        { errors }
      )
    }

  } catch (error) {
    return handleError(error, 'scheduleClasses')
  }
}

/**
 * Cancel classes in bulk
 * @function cancelClasses
 * @param {Object} request - Cancellation request
 * @param {string} request.startDate - Start date (YYYY-MM-DD)
 * @param {string} request.endDate - End date (YYYY-MM-DD)
 * @param {Array} request.batches - Array of batch IDs to cancel
 * @param {string} [request.reason=''] - Cancellation reason
 * @returns {Promise<Object>} Cancellation result
 */
export const cancelClasses = async (request) => {
  try {
    const validation = validateSchedulingRequest({ ...request, action: 'cancel' })
    if (!validation.valid) {
      return handleValidationError(validation.errors.join('. '))
    }

    const { startDate, endDate, batches, reason = '' } = request

    // Generate date range
    const dates = DateUtils.generateDateRange(
      new Date(startDate),
      new Date(endDate)
    )

    // Get current user
    const currentUser = await getCurrentUser()
    const cancelledBy = currentUser.success ? currentUser.data.email : 'system'

    const cancelledClasses = []
    const errors = []

    // Cancel each matching class
    for (const date of dates) {
      for (const batchId of batches) {
        try {
          const batchConfig = SCHEDULING_CONFIG.BATCHES[batchId.toUpperCase()]
          const dateString = DateUtils.formatDateForStorage(date)

          // Find existing scheduled classes
          const existingClasses = await retryOperation(
            () => databases.listDocuments(DATABASE_ID, CLASSES_COLLECTION, [
              Query.equal('date', dateString),
              Query.equal('batch_name', batchConfig.name),
              Query.equal('status', SCHEDULING_CONFIG.STATUS.SCHEDULED)
            ]),
            'find_classes_to_cancel'
          )

          // Cancel each found class
          for (const classDoc of existingClasses.documents) {
            const updateData = {
              status: SCHEDULING_CONFIG.STATUS.CANCELLED,
              cancelled_by: cancelledBy,
              cancellation_reason: reason,
              cancelled_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }

            const result = await retryOperation(
              () => databases.updateDocument(DATABASE_ID, CLASSES_COLLECTION, classDoc.$id, updateData),
              'cancel_class'
            )

            cancelledClasses.push(result)
          }

        } catch (error) {
          errors.push({
            date: DateUtils.formatDateForStorage(date),
            batch: batchId,
            error: error.message
          })
        }
      }
    }

    // Log activity
    try {
      await logActivity(
        'Classes Cancelled',
        cancelledBy,
        {
          count: cancelledClasses.length,
          dateRange: `${startDate} to ${endDate}`,
          batches: batches.join(', '),
          reason: reason,
          errors: errors.length
        }
      )
    } catch (logError) {
      console.warn('Failed to log cancellation activity:', logError)
    }

    const result = {
      cancelled: cancelledClasses.length,
      errors: errors.length,
      classes: cancelledClasses,
      failed: errors
    }

    if (cancelledClasses.length === 0) {
      return createSuccessResponse(
        result,
        'No matching classes found to cancel'
      )
    }

    return createSuccessResponse(
      result,
      `Successfully cancelled ${cancelledClasses.length} classes`
    )

  } catch (error) {
    return handleError(error, 'cancelClasses')
  }
}

/**
 * Get scheduled classes for date range
 * @function getScheduledClasses
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @param {Array} [batches] - Optional batch filter
 * @param {Array} [statuses] - Optional status filter
 * @returns {Promise<Object>} Classes result
 */
export const getScheduledClasses = async (startDate, endDate, batches = null, statuses = null) => {
  try {
    const queries = [
      Query.greaterThanEqual('date', startDate),
      Query.lessThanEqual('date', endDate),
      Query.orderAsc('date'),
      Query.orderAsc('time')
    ]

    // Add batch filter if specified
    if (batches && batches.length > 0) {
      const batchNames = batches.map(
        batch => SCHEDULING_CONFIG.BATCHES[batch.toUpperCase()]?.name
      ).filter(Boolean)
      
      if (batchNames.length > 0) {
        queries.push(Query.equal('batch_name', batchNames))
      }
    }

    // Add status filter if specified
    if (statuses && statuses.length > 0) {
      queries.push(Query.equal('status', statuses))
    }

    const result = await retryOperation(
      () => databases.listDocuments(DATABASE_ID, CLASSES_COLLECTION, queries),
      'get_scheduled_classes'
    )

    return createSuccessResponse(
      {
        classes: result.documents,
        total: result.total,
        dateRange: { startDate, endDate }
      },
      `Found ${result.documents.length} classes`
    )

  } catch (error) {
    return handleError(error, 'getScheduledClasses')
  }
}

/**
 * Get class statistics for dashboard
 * @function getClassStatistics
 * @param {string} [period='week'] - Time period (day, week, month)
 * @returns {Promise<Object>} Statistics result
 */
export const getClassStatistics = async (period = 'week') => {
  try {
    const now = new Date()
    let startDate, endDate

    switch (period) {
      case 'day':
        startDate = DateUtils.formatDateForStorage(now)
        endDate = startDate
        break
      case 'week':
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - now.getDay())
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        startDate = DateUtils.formatDateForStorage(weekStart)
        endDate = DateUtils.formatDateForStorage(weekEnd)
        break
      case 'month':
        startDate = DateUtils.formatDateForStorage(new Date(now.getFullYear(), now.getMonth(), 1))
        endDate = DateUtils.formatDateForStorage(new Date(now.getFullYear(), now.getMonth() + 1, 0))
        break
      default:
        throw new Error('Invalid period specified')
    }

    const classesResult = await getScheduledClasses(startDate, endDate)
    if (!classesResult.success) {
      return classesResult
    }

    const classes = classesResult.data.classes

    // Calculate statistics
    const stats = {
      total: classes.length,
      scheduled: classes.filter(c => c.status === SCHEDULING_CONFIG.STATUS.SCHEDULED).length,
      completed: classes.filter(c => c.status === SCHEDULING_CONFIG.STATUS.COMPLETED).length,
      cancelled: classes.filter(c => c.status === SCHEDULING_CONFIG.STATUS.CANCELLED).length,
      byBatch: {},
      period,
      dateRange: { startDate, endDate }
    }

    // Group by batch
    classes.forEach(classItem => {
      if (!stats.byBatch[classItem.batch_name]) {
        stats.byBatch[classItem.batch_name] = {
          total: 0,
          scheduled: 0,
          completed: 0,
          cancelled: 0
        }
      }
      
      stats.byBatch[classItem.batch_name].total++
      stats.byBatch[classItem.batch_name][classItem.status]++
    })

    return createSuccessResponse(stats, `Class statistics for ${period}`)

  } catch (error) {
    return handleError(error, 'getClassStatistics')
  }
}

export default {
  scheduleClasses,
  cancelClasses,
  getScheduledClasses,
  getClassStatistics,
  checkSchedulingConflicts,
  SCHEDULING_CONFIG,
  DateUtils
}
