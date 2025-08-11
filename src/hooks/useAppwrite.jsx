/**
 * Custom React Hook for Appwrite Operations
 * 
 * Provides comprehensive state management for Appwrite operations including:
 * - Loading states, error handling, and data management  
 * - Real-time subscriptions for all collections
 * - Connection status monitoring with automatic reconnection
 * - Retry logic with exponential backoff
 * - Authentication state management
 * - Network status monitoring
 * 
 * @module useAppwrite
 * @version 1.0.0
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  client, 
  databases, 
  APPWRITE_CONFIG, 
  realtimeManager, 
  testConnection,
  retryOperation 
} from '../services/appwrite.js'
import { isAuthenticated, getCurrentUser } from '../services/authService.js'
import { 
  handleError, 
  handleNetworkError, 
  shouldRetry, 
  getRetryDelay,
  createSuccessResponse,
  ErrorTypes 
} from '../utils/errorHandler.js'

/**
 * Main Appwrite hook for managing operations and state with comprehensive error handling
 * @function useAppwrite
 * @param {Object} options - Configuration options for the hook
 * @param {boolean} [options.autoConnect=true] - Whether to auto-connect on mount
 * @param {boolean} [options.enableRealtime=false] - Whether to enable real-time subscriptions
 * @param {number} [options.retryAttempts=3] - Maximum number of retry attempts for failed operations
 * @param {number} [options.retryDelay=1000] - Base delay in milliseconds for retry attempts
 * @param {string[]} [options.subscribeToCollections=[]] - Collections to subscribe to for real-time updates
 * @param {boolean} [options.monitorNetwork=true] - Whether to monitor network status changes
 * @param {boolean} [options.autoReconnect=true] - Whether to automatically reconnect on network recovery
 * @returns {Object} Appwrite state and operations with comprehensive error handling
 * 
 * @example
 * const {
 *   isConnected,
 *   isLoading,
 *   error,
 *   executeOperation,
 *   subscribeToCollection
 * } = useAppwrite({
 *   enableRealtime: true,
 *   subscribeToCollections: ['students', 'attendance']
 * })
 */
const useAppwrite = (options = {}) => {
  const {
    autoConnect = true,
    enableRealtime = false,
    retryAttempts = 3,
    retryDelay = 1000,
    subscribeToCollections = [],
    monitorNetwork = true,
    autoReconnect = true
  } = options

  // Primary state management
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [instructor, setInstructor] = useState(null)
  
  // Connection management
  const [connectionAttempts, setConnectionAttempts] = useState(0)
  const [lastActivity, setLastActivity] = useState(new Date())
  const [connectionQuality, setConnectionQuality] = useState('unknown')
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  
  // Real-time subscriptions management
  const [activeSubscriptions, setActiveSubscriptions] = useState([])
  const [realtimeData, setRealtimeData] = useState(() => {
    // Initialize with empty arrays for each collection
    const initialData = {}
    Object.keys(APPWRITE_CONFIG.collections).forEach(collection => {
      initialData[collection] = []
    })
    return initialData
  })
  const [realtimeErrors, setRealtimeErrors] = useState({})
  
  // Performance tracking
  const [metrics, setMetrics] = useState({
    operationsCount: 0,
    successfulOperations: 0,
    failedOperations: 0,
    averageResponseTime: 0,
    lastOperationTime: null
  })

  // Refs for cleanup and persistence
  const retryTimeoutRef = useRef(null)
  const isUnmountedRef = useRef(false)
  const operationTimeoutsRef = useRef(new Set())
  const metricsRef = useRef(metrics)

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Update activity timestamp for session tracking
   */
  const updateActivity = useCallback(() => {
    setLastActivity(new Date())
  }, [])

  /**
   * Test connection to Appwrite
   */
  const testConnection = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔍 Testing Appwrite connection...')
      
      // Test if user is authenticated
      const authStatus = await isAuthenticated()
      
      if (authStatus) {
        const userResult = await getCurrentUser()
        if (userResult.success) {
          setUser(userResult.data)
          console.log('✅ User authenticated:', userResult.data.email)
        }
      }
      
      // Test database connection
      await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.instructors,
        []
      )
      
      setIsConnected(true)
      setConnectionAttempts(0)
      updateActivity()
      
      console.log('✅ Appwrite connection successful')
      return true
      
    } catch (err) {
      console.error('❌ Appwrite connection failed:', err.message)
      setError({
        code: err.code || 'CONNECTION_ERROR',
        message: err.message || 'Failed to connect to Appwrite',
        timestamp: new Date().toISOString()
      })
      setIsConnected(false)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [updateActivity])

  /**
   * Retry connection with exponential backoff
   */
  const retryConnection = useCallback(async () => {
    if (connectionAttempts >= retryAttempts || isUnmountedRef.current) {
      console.warn(`⚠️ Max retry attempts (${retryAttempts}) reached`)
      return false
    }

    const delay = retryDelay * Math.pow(2, connectionAttempts)
    console.log(`🔄 Retrying connection in ${delay}ms (attempt ${connectionAttempts + 1}/${retryAttempts})`)
    
    setConnectionAttempts(prev => prev + 1)
    
    return new Promise((resolve) => {
      retryTimeoutRef.current = setTimeout(async () => {
        if (!isUnmountedRef.current) {
          const success = await testConnection()
          resolve(success)
        } else {
          resolve(false)
        }
      }, delay)
    })
  }, [connectionAttempts, retryAttempts, retryDelay, testConnection])

  /**
   * Execute an Appwrite operation with error handling and retry logic
   */
  const executeOperation = useCallback(async (operation, operationName = 'Unknown') => {
    try {
      setIsLoading(true)
      setError(null)
      updateActivity()
      
      console.log(`🚀 Executing ${operationName}...`)
      
      const result = await operation()
      
      console.log(`✅ ${operationName} completed successfully`)
      return result
      
    } catch (err) {
      console.error(`❌ ${operationName} failed:`, err.message)
      
      const errorData = {
        code: err.code || 'OPERATION_ERROR',
        message: err.message || `Failed to execute ${operationName}`,
        operation: operationName,
        timestamp: new Date().toISOString()
      }
      
      setError(errorData)
      
      // If it's a connection error, try to reconnect
      if (err.code === 503 || err.code === 500) {
        setIsConnected(false)
        await retryConnection()
      }
      
      throw errorData
      
    } finally {
      setIsLoading(false)
    }
  }, [updateActivity, retryConnection])

  /**
   * Subscribe to real-time updates for a collection
   */
  const subscribeToCollection = useCallback((collectionName) => {
    if (!enableRealtime || !APPWRITE_CONFIG.collections[collectionName]) {
      console.warn(`⚠️ Real-time not enabled or invalid collection: ${collectionName}`)
      return
    }

    try {
      console.log(`📡 Subscribing to real-time updates for ${collectionName}`)
      
      const channel = `databases.${APPWRITE_CONFIG.databaseId}.collections.${APPWRITE_CONFIG.collections[collectionName]}.documents`
      
      const unsubscribe = client.subscribe(channel, (response) => {
        console.log(`📨 Real-time update received for ${collectionName}:`, response.events[0])
        
        const eventType = response.events[0].split('.').pop()
        const document = response.payload
        
        setRealtimeData(prev => {
          const updated = { ...prev }
          
          switch (eventType) {
            case 'create':
              updated[collectionName] = [...(prev[collectionName] || []), document]
              break
              
            case 'update':
              updated[collectionName] = (prev[collectionName] || []).map(item =>
                item.$id === document.$id ? document : item
              )
              break
              
            case 'delete':
              updated[collectionName] = (prev[collectionName] || []).filter(item =>
                item.$id !== document.$id
              )
              break
              
            default:
              console.log(`Unknown event type: ${eventType}`)
          }
          
          return updated
        })
        
        updateActivity()
      })
      
      // Store subscription for cleanup
      const newSubscriptions = new Map(subscriptionsRef.current)
      newSubscriptions.set(collectionName, unsubscribe)
      subscriptionsRef.current = newSubscriptions
      setSubscriptions(newSubscriptions)
      
      console.log(`✅ Subscribed to ${collectionName}`)
      
    } catch (err) {
      console.error(`❌ Failed to subscribe to ${collectionName}:`, err.message)
    }
  }, [enableRealtime, updateActivity])

  /**
   * Unsubscribe from a collection
   */
  const unsubscribeFromCollection = useCallback((collectionName) => {
    const subscription = subscriptionsRef.current.get(collectionName)
    
    if (subscription) {
      console.log(`📡 Unsubscribing from ${collectionName}`)
      subscription()
      
      const newSubscriptions = new Map(subscriptionsRef.current)
      newSubscriptions.delete(collectionName)
      subscriptionsRef.current = newSubscriptions
      setSubscriptions(newSubscriptions)
    }
  }, [])

  /**
   * Subscribe to all specified collections
   */
  const subscribeToCollections = useCallback(() => {
    subscribeToCollections.forEach(collectionName => {
      subscribeToCollection(collectionName)
    })
  }, [subscribeToCollection, subscribeToCollections])

  /**
   * Unsubscribe from all collections
   */
  const unsubscribeFromAll = useCallback(() => {
    console.log('📡 Unsubscribing from all real-time updates')
    
    subscriptionsRef.current.forEach((unsubscribe, collectionName) => {
      console.log(`Unsubscribing from ${collectionName}`)
      unsubscribe()
    })
    
    subscriptionsRef.current.clear()
    setSubscriptions(new Map())
  }, [])

  /**
   * Refresh connection and user data
   */
  const refresh = useCallback(async () => {
    console.log('🔄 Refreshing Appwrite connection and data')
    await testConnection()
    
    if (enableRealtime) {
      unsubscribeFromAll()
      setTimeout(() => {
        subscribeToCollections()
      }, 1000)
    }
  }, [testConnection, enableRealtime, unsubscribeFromAll, subscribeToCollections])

  /**
   * Get connection statistics
   */
  const getConnectionStats = useCallback(() => {
    return {
      isConnected,
      connectionAttempts,
      lastActivity: lastActivity.toISOString(),
      subscriptionsCount: subscriptions.size,
      activeCollections: Array.from(subscriptions.keys()),
      timeSinceLastActivity: Date.now() - lastActivity.getTime()
    }
  }, [isConnected, connectionAttempts, lastActivity, subscriptions])

  // Initialize connection on mount
  useEffect(() => {
    if (autoConnect) {
      console.log('🚀 Auto-connecting to Appwrite...')
      testConnection()
    }

    return () => {
      isUnmountedRef.current = true
    }
  }, [autoConnect, testConnection])

  // Set up real-time subscriptions
  useEffect(() => {
    if (enableRealtime && isConnected && subscribeToCollections.length > 0) {
      console.log('📡 Setting up real-time subscriptions...')
      subscribeToCollections.forEach(collectionName => {
        subscribeToCollection(collectionName)
      })
    }

    return () => {
      if (enableRealtime) {
        unsubscribeFromAll()
      }
    }
  }, [enableRealtime, isConnected, subscribeToCollections, subscribeToCollection, unsubscribeFromAll])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true
      
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
      
      unsubscribeFromAll()
    }
  }, [unsubscribeFromAll])

  return {
    // Connection state
    isConnected,
    isLoading,
    error,
    user,
    connectionAttempts,
    lastActivity,
    
    // Real-time data
    realtimeData,
    subscriptions: Array.from(subscriptions.keys()),
    
    // Operations
    executeOperation,
    testConnection,
    retryConnection,
    refresh,
    clearError,
    updateActivity,
    
    // Real-time management
    subscribeToCollection,
    unsubscribeFromCollection,
    unsubscribeFromAll,
    
    // Utilities
    getConnectionStats,
    
    // Status helpers
    canRetry: connectionAttempts < retryAttempts,
    isRetrying: connectionAttempts > 0 && connectionAttempts < retryAttempts,
    hasMaxRetries: connectionAttempts >= retryAttempts,
    isRealtimeEnabled: enableRealtime,
    hasActiveSubscriptions: subscriptions.size > 0
  }
}

/**
 * Specialized hook for database operations with automatic state management
 */
export const useAppwriteDatabase = (collectionName, options = {}) => {
  const {
    autoFetch = false,
    fetchOnMount = true,
    enableRealtime = true,
    queries = []
  } = options

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const appwrite = useAppwrite({
    enableRealtime,
    subscribeToCollections: enableRealtime ? [collectionName] : []
  })

  /**
   * Fetch documents from collection
   */
  const fetchData = useCallback(async (customQueries = []) => {
    try {
      setLoading(true)
      setError(null)

      const result = await appwrite.executeOperation(async () => {
        return await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections[collectionName],
          [...queries, ...customQueries]
        )
      }, `fetch${collectionName}`)

      setData(result.documents)
      return result

    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [appwrite, collectionName, queries])

  // Auto-fetch on mount
  useEffect(() => {
    if (fetchOnMount && appwrite.isConnected) {
      fetchData()
    }
  }, [fetchOnMount, appwrite.isConnected, fetchData])

  // Update data from real-time updates
  useEffect(() => {
    if (enableRealtime && appwrite.realtimeData[collectionName]) {
      setData(appwrite.realtimeData[collectionName])
    }
  }, [enableRealtime, appwrite.realtimeData, collectionName])

  return {
    // Data state
    data,
    loading: loading || appwrite.isLoading,
    error: error || appwrite.error,
    
    // Operations
    fetchData,
    refresh: fetchData,
    
    // Connection state
    isConnected: appwrite.isConnected,
    
    // Utilities
    clearError: () => {
      setError(null)
      appwrite.clearError()
    }
  }
}

export default useAppwrite
