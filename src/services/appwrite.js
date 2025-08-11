/**
 * Appwrite Service Configuration
 * 
 * Initializes and configures the Appwrite client, databases, and account services
 * with comprehensive error handling, connection testing, and real-time capabilities.
 * 
 * @module AppwriteService
 * @version 1.0.0
 */

import { Client, Databases, Account, Query, ID } from 'appwrite'
import { handleError, createSuccessResponse, ErrorTypes } from '../utils/errorHandler.js'

// Configuration constants
const APPWRITE_CONFIG = {
  endpoint: 'https://syd.cloud.appwrite.io/v1',
  projectId: '68997806002fe7cd36ba',
  databaseId: 'SportsClub_db',
  collections: {
    instructors: 'instructors',
    students: 'students',
    attendance: 'attendance',
    payments: 'payments',
    classes: 'classes',
    activity_log: 'activity_log'
  }
}

// Initialize Appwrite Client
const client = new Client()
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId)

// Initialize Services
const databases = new Databases(client)
const account = new Account(client)

/**
 * Test Appwrite connection and configuration with comprehensive error handling
 * @async
 * @function testConnection
 * @returns {Promise<Object>} Connection test result with detailed status
 * @throws {Object} Enhanced error object if connection fails critically
 */
const testConnection = async () => {
  try {
    console.log('🔌 Testing Appwrite connection...')
    
    const testResults = {
      client: false,
      database: false,
      collections: {},
      performance: {
        startTime: Date.now(),
        clientTestTime: null,
        databaseTestTime: null,
        totalTime: null
      }
    }
    
    // Test 1: Client connection by checking account (may fail with 401 if not authenticated)
    try {
      await account.get()
      console.log('✅ Appwrite client connection successful (authenticated)')
      testResults.client = true
    } catch (error) {
      if (error.code === 401) {
        // User not authenticated - this is normal for initial connection test
        console.log('✅ Appwrite client connection successful (not authenticated)')
        testResults.client = true
      } else {
        throw error
      }
    }
    testResults.performance.clientTestTime = Date.now() - testResults.performance.startTime
    
    // Test 2: Database connection
    try {
      await databases.listDocuments(
        APPWRITE_CONFIG.databaseId, 
        APPWRITE_CONFIG.collections.instructors, 
        [Query.limit(1)]
      )
      console.log('✅ Database connection successful')
      testResults.database = true
    } catch (error) {
      console.error('❌ Database connection failed:', error.message)
      throw handleError(error, 'database_connection_test')
    }
    testResults.performance.databaseTestTime = Date.now() - testResults.performance.startTime - testResults.performance.clientTestTime
    
    // Test 3: Individual collection accessibility
    const collectionTests = []
    for (const [name, id] of Object.entries(APPWRITE_CONFIG.collections)) {
      collectionTests.push(
        databases.listDocuments(APPWRITE_CONFIG.databaseId, id, [Query.limit(1)])
          .then(() => {
            testResults.collections[name] = { accessible: true, error: null }
            console.log(`✅ Collection '${name}' accessible`)
          })
          .catch(error => {
            testResults.collections[name] = { accessible: false, error: error.message }
            console.warn(`⚠️ Collection '${name}' not accessible:`, error.message)
          })
      )
    }
    
    // Wait for all collection tests to complete
    await Promise.all(collectionTests)
    
    testResults.performance.totalTime = Date.now() - testResults.performance.startTime
    
    const accessibleCollections = Object.values(testResults.collections).filter(c => c.accessible).length
    const totalCollections = Object.keys(APPWRITE_CONFIG.collections).length
    
    console.log(`✅ Connection test completed: ${accessibleCollections}/${totalCollections} collections accessible in ${testResults.performance.totalTime}ms`)
    
    return createSuccessResponse({
      connected: true,
      client: testResults.client,
      database: testResults.database,
      collections: testResults.collections,
      performance: testResults.performance,
      summary: {
        accessibleCollections,
        totalCollections,
        allAccessible: accessibleCollections === totalCollections
      }
    }, 'Connection test completed successfully')
    
  } catch (error) {
    console.error('❌ Appwrite connection test failed:', error)
    return handleError(error, 'connection_test')
  }
}

/**
 * Initialize Appwrite services and test connection
 * @returns {Promise<boolean>} Initialization status
 */
const initializeAppwrite = async () => {
  try {
    console.log('🚀 Initializing Appwrite services...')
    
    const isConnected = await testConnection()
    
    if (isConnected) {
      console.log('🎉 Appwrite initialization complete!')
      console.log('📊 Project ID:', APPWRITE_CONFIG.projectId)
      console.log('🗄️ Database ID:', APPWRITE_CONFIG.databaseId)
      console.log('📑 Collections:', Object.keys(APPWRITE_CONFIG.collections).join(', '))
    } else {
      console.warn('⚠️ Appwrite initialization completed with connection issues')
    }
    
    return isConnected
  } catch (error) {
    console.error('💥 Failed to initialize Appwrite:', error)
    return false
  }
}

/**
 * Real-time subscription manager for Appwrite collections
 * @class RealtimeManager
 */
class RealtimeManager {
  constructor() {
    this.subscriptions = new Map()
    this.listeners = new Map()
  }

  /**
   * Subscribe to real-time updates for a specific collection
   * @param {string} collectionName - Name of the collection to subscribe to
   * @param {Function} callback - Callback function to handle updates
   * @param {Array<string>} [events] - Specific events to listen for
   * @returns {Function} Unsubscribe function
   */
  subscribe(collectionName, callback, events = ['create', 'update', 'delete']) {
    try {
      const collectionId = APPWRITE_CONFIG.collections[collectionName]
      if (!collectionId) {
        throw new Error(`Collection '${collectionName}' not found in configuration`)
      }

      const channel = `databases.${APPWRITE_CONFIG.databaseId}.collections.${collectionId}.documents`
      
      console.log(`📡 Subscribing to real-time updates for ${collectionName}`)
      
      const unsubscribe = client.subscribe(channel, (response) => {
        try {
          const eventType = response.events[0]?.split('.').pop()
          
          if (events.includes(eventType)) {
            console.log(`📨 Real-time update received for ${collectionName}:`, eventType)
            
            const enhancedResponse = {
              collection: collectionName,
              eventType,
              document: response.payload,
              timestamp: new Date().toISOString(),
              channel
            }
            
            callback(enhancedResponse)
          }
        } catch (error) {
          console.error(`❌ Error processing real-time update for ${collectionName}:`, error)
        }
      })

      // Store subscription for management
      this.subscriptions.set(collectionName, unsubscribe)
      
      // Store callback for reference
      if (!this.listeners.has(collectionName)) {
        this.listeners.set(collectionName, [])
      }
      this.listeners.get(collectionName).push(callback)

      console.log(`✅ Successfully subscribed to ${collectionName}`)

      return () => {
        this.unsubscribe(collectionName)
      }
    } catch (error) {
      console.error(`❌ Failed to subscribe to ${collectionName}:`, error)
      throw handleError(error, `subscribe_to_${collectionName}`)
    }
  }

  /**
   * Unsubscribe from a collection's real-time updates
   * @param {string} collectionName - Name of the collection to unsubscribe from
   */
  unsubscribe(collectionName) {
    try {
      const unsubscribeFunc = this.subscriptions.get(collectionName)
      
      if (unsubscribeFunc) {
        unsubscribeFunc()
        this.subscriptions.delete(collectionName)
        this.listeners.delete(collectionName)
        console.log(`📡 Unsubscribed from ${collectionName}`)
      }
    } catch (error) {
      console.error(`❌ Failed to unsubscribe from ${collectionName}:`, error)
    }
  }

  /**
   * Unsubscribe from all collections
   */
  unsubscribeAll() {
    console.log('📡 Unsubscribing from all real-time updates')
    
    for (const collectionName of this.subscriptions.keys()) {
      this.unsubscribe(collectionName)
    }
  }

  /**
   * Get active subscription status
   * @returns {Object} Subscription status information
   */
  getStatus() {
    return {
      activeSubscriptions: Array.from(this.subscriptions.keys()),
      subscriptionCount: this.subscriptions.size,
      listenersCount: Array.from(this.listeners.values()).reduce((sum, listeners) => sum + listeners.length, 0)
    }
  }
}

// Global realtime manager instance
const realtimeManager = new RealtimeManager()

/**
 * Get current user session information
 * @returns {Promise<Object>} Current session or null
 */
const getCurrentSession = async () => {
  try {
    const session = await account.getSession('current')
    return createSuccessResponse(session, 'Session retrieved successfully')
  } catch (error) {
    if (error.code === 401) {
      return createSuccessResponse(null, 'No active session')
    }
    return handleAppwriteError(error, 'getCurrentSession')
  }
}

/**
 * Check if Appwrite services are available
 * @returns {Promise<boolean>} Service availability status
 */
const isServiceAvailable = async () => {
  try {
    await client.call('GET', '/health')
    return true
  } catch (error) {
    console.warn('⚠️ Appwrite service may be unavailable:', error.message)
    return false
  }
}

/**
 * Retry operation with exponential backoff for network resilience
 * @async
 * @function retryOperation
 * @param {Function} operation - Async operation to retry
 * @param {string} operationName - Name of the operation for logging
 * @param {number} [maxRetries=3] - Maximum number of retry attempts
 * @param {number} [baseDelay=1000] - Base delay in milliseconds
 * @returns {Promise<*>} Result of the successful operation
 * @throws {Object} Enhanced error if all retries fail
 */
const retryOperation = async (operation, operationName, maxRetries = 3, baseDelay = 1000) => {
  let lastError = null
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), 10000)
        console.log(`🔄 Retrying ${operationName} (attempt ${attempt}/${maxRetries}) after ${delay}ms delay`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
      
      const result = await operation()
      
      if (attempt > 0) {
        console.log(`✅ ${operationName} succeeded after ${attempt} retries`)
      }
      
      return result
      
    } catch (error) {
      lastError = error
      
      const enhancedError = handleError(error, operationName, { retryCount: attempt })
      
      // Don't retry if error is not retryable
      if (!enhancedError.retryable) {
        console.log(`❌ ${operationName} failed with non-retryable error:`, error.message)
        throw enhancedError
      }
      
      if (attempt === maxRetries) {
        console.log(`❌ ${operationName} failed after ${maxRetries} retries`)
        throw enhancedError
      }
      
      console.warn(`⚠️ ${operationName} failed (attempt ${attempt + 1}/${maxRetries + 1}):`, error.message)
    }
  }
  
  throw handleError(lastError, operationName, { retryCount: maxRetries, finalAttempt: true })
}

// Export configuration and services
export {
  client,
  databases,
  account,
  APPWRITE_CONFIG,
  Query,
  ID,
  testConnection,
  initializeAppwrite,
  getCurrentSession,
  isServiceAvailable,
  realtimeManager,
  retryOperation,
  RealtimeManager
}

// Auto-initialize when module is imported
initializeAppwrite().catch(error => {
  console.error('Failed to auto-initialize Appwrite:', error)
})