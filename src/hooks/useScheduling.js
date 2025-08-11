/**
 * useScheduling Hook
 * 
 * Custom React hook for managing class scheduling operations,
 * state management, and integration with Appwrite services.
 * 
 * @hook
 * @version 1.0.0
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { 
  scheduleClasses, 
  cancelClasses, 
  getScheduledClasses,
  getClassStatistics,
  checkSchedulingConflicts,
  SCHEDULING_CONFIG 
} from '../services/schedulingService.js'
import { realtimeManager } from '../services/appwrite.js'
import { handleError, createSuccessResponse } from '../utils/errorHandler.js'

/**
 * Hook state interface
 * @typedef {Object} SchedulingState
 * @property {boolean} isLoading - Whether any operation is in progress
 * @property {boolean} isScheduling - Whether scheduling operation is in progress
 * @property {boolean} isCancelling - Whether cancellation operation is in progress
 * @property {boolean} isLoadingClasses - Whether classes are being loaded
 * @property {boolean} isLoadingStats - Whether statistics are being loaded
 * @property {Object|null} error - Current error object
 * @property {Array} classes - List of scheduled classes
 * @property {Object|null} statistics - Class statistics
 * @property {Object|null} lastOperation - Result of last operation
 * @property {Array} conflicts - Current scheduling conflicts
 * @property {boolean} hasConflicts - Whether there are conflicts
 */

/**
 * Custom hook for scheduling operations
 * @function useScheduling
 * @param {Object} [options] - Hook configuration options
 * @param {boolean} [options.autoRefresh=true] - Auto-refresh classes after operations
 * @param {number} [options.refreshInterval=0] - Auto-refresh interval in ms (0 = disabled)
 * @param {boolean} [options.enableRealtime=false] - Enable real-time updates
 * @param {Function} [options.onScheduled] - Callback when classes are scheduled
 * @param {Function} [options.onCancelled] - Callback when classes are cancelled
 * @param {Function} [options.onError] - Callback when errors occur
 * @returns {Object} Scheduling operations and state
 * 
 * @example
 * const {
 *   scheduleClasses,
 *   cancelClasses,
 *   classes,
 *   isLoading,
 *   error,
 *   refreshClasses
 * } = useScheduling({
 *   autoRefresh: true,
 *   enableRealtime: true
 * })
 */
export const useScheduling = (options = {}) => {
  const {
    autoRefresh = true,
    refreshInterval = 0,
    enableRealtime = false,
    onScheduled,
    onCancelled,
    onError
  } = options

  // State management
  const [state, setState] = useState({
    isLoading: false,
    isScheduling: false,
    isCancelling: false,
    isLoadingClasses: false,
    isLoadingStats: false,
    error: null,
    classes: [],
    statistics: null,
    lastOperation: null,
    conflicts: [],
    hasConflicts: false
  })

  // Refs for cleanup and caching
  const refreshTimeoutRef = useRef(null)
  const realtimeUnsubscribeRef = useRef(null)
  const abortControllerRef = useRef(null)

  /**
   * Update state safely
   * @function updateState
   * @param {Object|Function} updates - State updates
   */
  const updateState = useCallback((updates) => {
    setState(prevState => 
      typeof updates === 'function' ? updates(prevState) : { ...prevState, ...updates }
    )
  }, [])

  /**
   * Clear current error
   * @function clearError
   */
  const clearError = useCallback(() => {
    updateState({ error: null })
  }, [updateState])

  /**
   * Set loading state
   * @function setLoadingState
   * @param {string} operation - Operation type
   * @param {boolean} loading - Loading state
   */
  const setLoadingState = useCallback((operation, loading) => {
    updateState(prevState => ({
      ...prevState,
      isLoading: loading,
      [operation]: loading
    }))
  }, [updateState])

  /**
   * Handle operation error
   * @function handleOperationError
   * @param {Error} error - Error object
   * @param {string} operation - Operation name
   */
  const handleOperationError = useCallback((error, operation) => {
    const enhancedError = handleError(error, operation)
    updateState({ 
      error: enhancedError,
      isLoading: false,
      isScheduling: false,
      isCancelling: false,
      isLoadingClasses: false,
      isLoadingStats: false
    })
    
    if (onError) {
      onError(enhancedError)
    }
    
    console.error(`Scheduling ${operation} error:`, enhancedError)
  }, [updateState, onError])

  /**
   * Schedule classes with validation and conflict checking
   * @function scheduleClassesOperation
   * @param {Object} request - Scheduling request
   * @returns {Promise<Object>} Operation result
   */
  const scheduleClassesOperation = useCallback(async (request) => {
    try {
      setLoadingState('isScheduling', true)
      updateState({ error: null, lastOperation: null })

      // Abort any previous operation
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      const result = await scheduleClasses(request)
      
      updateState({ 
        lastOperation: result,
        isLoading: false,
        isScheduling: false
      })

      if (result.success) {
        if (onScheduled) {
          onScheduled(result)
        }
        
        if (autoRefresh) {
          await refreshClassesOperation()
        }
      }

      return result

    } catch (error) {
      handleOperationError(error, 'scheduleClasses')
      return handleError(error, 'scheduleClasses')
    }
  }, [autoRefresh, onScheduled, setLoadingState, updateState, handleOperationError])

  /**
   * Cancel classes with validation
   * @function cancelClassesOperation
   * @param {Object} request - Cancellation request
   * @returns {Promise<Object>} Operation result
   */
  const cancelClassesOperation = useCallback(async (request) => {
    try {
      setLoadingState('isCancelling', true)
      updateState({ error: null, lastOperation: null })

      // Abort any previous operation
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      const result = await cancelClasses(request)
      
      updateState({ 
        lastOperation: result,
        isLoading: false,
        isCancelling: false
      })

      if (result.success) {
        if (onCancelled) {
          onCancelled(result)
        }
        
        if (autoRefresh) {
          await refreshClassesOperation()
        }
      }

      return result

    } catch (error) {
      handleOperationError(error, 'cancelClasses')
      return handleError(error, 'cancelClasses')
    }
  }, [autoRefresh, onCancelled, setLoadingState, updateState, handleOperationError])

  /**
   * Check for scheduling conflicts
   * @function checkConflicts
   * @param {Array} dates - Dates to check
   * @param {Array} batches - Batches to check
   * @returns {Promise<Object>} Conflict check result
   */
  const checkConflicts = useCallback(async (dates, batches) => {
    try {
      const result = await checkSchedulingConflicts(dates, batches)
      
      updateState({
        conflicts: result.success ? result.data.conflicts : [],
        hasConflicts: result.success ? result.data.hasConflicts : false
      })

      return result

    } catch (error) {
      handleOperationError(error, 'checkConflicts')
      return handleError(error, 'checkConflicts')
    }
  }, [updateState, handleOperationError])

  /**
   * Refresh scheduled classes
   * @function refreshClassesOperation
   * @param {string} [startDate] - Start date filter
   * @param {string} [endDate] - End date filter
   * @param {Array} [batches] - Batch filter
   * @param {Array} [statuses] - Status filter
   * @returns {Promise<Object>} Refresh result
   */
  const refreshClassesOperation = useCallback(async (
    startDate = null, 
    endDate = null, 
    batches = null, 
    statuses = null
  ) => {
    try {
      setLoadingState('isLoadingClasses', true)
      updateState({ error: null })

      // Default date range - current month
      if (!startDate || !endDate) {
        const now = new Date()
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
      }

      const result = await getScheduledClasses(startDate, endDate, batches, statuses)
      
      if (result.success) {
        updateState({ 
          classes: result.data.classes,
          isLoading: false,
          isLoadingClasses: false
        })
      } else {
        throw new Error(result.message)
      }

      return result

    } catch (error) {
      handleOperationError(error, 'refreshClasses')
      return handleError(error, 'refreshClasses')
    }
  }, [setLoadingState, updateState, handleOperationError])

  /**
   * Load class statistics
   * @function loadStatistics
   * @param {string} [period='week'] - Statistics period
   * @returns {Promise<Object>} Statistics result
   */
  const loadStatistics = useCallback(async (period = 'week') => {
    try {
      setLoadingState('isLoadingStats', true)
      updateState({ error: null })

      const result = await getClassStatistics(period)
      
      if (result.success) {
        updateState({ 
          statistics: result.data,
          isLoading: false,
          isLoadingStats: false
        })
      } else {
        throw new Error(result.message)
      }

      return result

    } catch (error) {
      handleOperationError(error, 'loadStatistics')
      return handleError(error, 'loadStatistics')
    }
  }, [setLoadingState, updateState, handleOperationError])

  /**
   * Get classes for a specific date
   * @function getClassesForDate
   * @param {string} date - Date string (YYYY-MM-DD)
   * @returns {Array} Classes for the date
   */
  const getClassesForDate = useCallback((date) => {
    return state.classes.filter(classItem => classItem.date === date)
  }, [state.classes])

  /**
   * Get classes by status
   * @function getClassesByStatus
   * @param {string} status - Class status
   * @returns {Array} Classes with the status
   */
  const getClassesByStatus = useCallback((status) => {
    return state.classes.filter(classItem => classItem.status === status)
  }, [state.classes])

  /**
   * Get classes by batch
   * @function getClassesByBatch
   * @param {string} batchName - Batch name
   * @returns {Array} Classes for the batch
   */
  const getClassesByBatch = useCallback((batchName) => {
    return state.classes.filter(classItem => classItem.batch_name === batchName)
  }, [state.classes])

  /**
   * Setup real-time subscriptions
   * @function setupRealtime
   */
  const setupRealtime = useCallback(() => {
    if (!enableRealtime) return

    try {
      // Subscribe to classes collection changes
      const unsubscribe = realtimeManager.subscribe(
        'classes',
        (payload) => {
          console.log('Real-time class update:', payload)
          
          // Refresh classes when changes occur
          refreshClassesOperation()
        },
        ['create', 'update', 'delete']
      )

      realtimeUnsubscribeRef.current = unsubscribe
      
    } catch (error) {
      console.warn('Failed to setup real-time updates:', error)
    }
  }, [enableRealtime, refreshClassesOperation])

  /**
   * Setup auto refresh timer
   * @function setupAutoRefresh
   */
  const setupAutoRefresh = useCallback(() => {
    if (refreshInterval > 0) {
      refreshTimeoutRef.current = setTimeout(() => {
        refreshClassesOperation()
        setupAutoRefresh() // Schedule next refresh
      }, refreshInterval)
    }
  }, [refreshInterval, refreshClassesOperation])

  /**
   * Cleanup function
   * @function cleanup
   */
  const cleanup = useCallback(() => {
    // Clear refresh timer
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
      refreshTimeoutRef.current = null
    }

    // Unsubscribe from real-time updates
    if (realtimeUnsubscribeRef.current) {
      realtimeUnsubscribeRef.current()
      realtimeUnsubscribeRef.current = null
    }

    // Abort ongoing operations
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  // Initialize hook on mount
  useEffect(() => {
    refreshClassesOperation()
    loadStatistics('week')
    setupRealtime()
    setupAutoRefresh()

    return cleanup
  }, []) // Empty dependency array for mount only

  // Update real-time subscription when enableRealtime changes
  useEffect(() => {
    if (enableRealtime) {
      setupRealtime()
    } else if (realtimeUnsubscribeRef.current) {
      realtimeUnsubscribeRef.current()
      realtimeUnsubscribeRef.current = null
    }
  }, [enableRealtime, setupRealtime])

  // Update auto refresh when interval changes
  useEffect(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
      refreshTimeoutRef.current = null
    }
    
    setupAutoRefresh()
  }, [refreshInterval, setupAutoRefresh])

  // Return hook interface
  return {
    // State
    ...state,
    
    // Operations
    scheduleClasses: scheduleClassesOperation,
    cancelClasses: cancelClassesOperation,
    checkConflicts,
    refreshClasses: refreshClassesOperation,
    loadStatistics,
    
    // Utilities
    getClassesForDate,
    getClassesByStatus,
    getClassesByBatch,
    clearError,
    
    // Configuration
    config: SCHEDULING_CONFIG,
    
    // Actions
    retry: () => refreshClassesOperation(),
    reset: () => {
      cleanup()
      setState({
        isLoading: false,
        isScheduling: false,
        isCancelling: false,
        isLoadingClasses: false,
        isLoadingStats: false,
        error: null,
        classes: [],
        statistics: null,
        lastOperation: null,
        conflicts: [],
        hasConflicts: false
      })
    }
  }
}

/**
 * Hook for simplified scheduling operations
 * @function useSimpleScheduling
 * @returns {Object} Simplified scheduling interface
 */
export const useSimpleScheduling = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const schedule = useCallback(async (request) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await scheduleClasses(request)
      setIsLoading(false)
      return result
    } catch (err) {
      const error = handleError(err, 'simpleScheduling')
      setError(error)
      setIsLoading(false)
      return error
    }
  }, [])
  
  const cancel = useCallback(async (request) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await cancelClasses(request)
      setIsLoading(false)
      return result
    } catch (err) {
      const error = handleError(err, 'simpleCancellation')
      setError(error)
      setIsLoading(false)
      return error
    }
  }, [])
  
  return {
    schedule,
    cancel,
    isLoading,
    error,
    clearError: () => setError(null)
  }
}

export default useScheduling
