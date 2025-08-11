/**
 * Appwrite Connection Tester Component
 * 
 * A comprehensive testing component that demonstrates all the enhanced error handling,
 * connection testing, and real-time subscription features of the Appwrite integration.
 * 
 * @component
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react'
import { testConnection, realtimeManager } from '../services/appwrite.js'
import { login, logout, isAuthenticated } from '../services/authService.js'
import * as dbService from '../services/databaseService.js'
import Button from './Button.jsx'
import Card from './Card.jsx'

/**
 * Connection status indicator component
 * @param {Object} props
 * @param {'connected'|'disconnected'|'connecting'|'error'} props.status
 * @param {string} [props.message]
 * @returns {JSX.Element}
 */
const StatusIndicator = ({ status, message }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return { icon: '✅', color: 'text-green-600 bg-green-50', label: 'Connected' }
      case 'connecting':
        return { icon: '⏳', color: 'text-yellow-600 bg-yellow-50', label: 'Connecting' }
      case 'error':
        return { icon: '❌', color: 'text-red-600 bg-red-50', label: 'Error' }
      default:
        return { icon: '⚪', color: 'text-gray-600 bg-gray-50', label: 'Disconnected' }
    }
  }

  const config = getStatusConfig()

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
      <span className="mr-2">{config.icon}</span>
      <span>{config.label}</span>
      {message && <span className="ml-2 text-xs">- {message}</span>}
    </div>
  )
}

/**
 * Error display component with user-friendly formatting
 * @param {Object} props
 * @param {Object|null} props.error - Enhanced error object
 * @param {Function} [props.onDismiss] - Function to call when error is dismissed
 * @returns {JSX.Element|null}
 */
const ErrorDisplay = ({ error, onDismiss }) => {
  if (!error) return null

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500 bg-red-50 text-red-800'
      case 'high':
        return 'border-red-400 bg-red-50 text-red-700'
      case 'medium':
        return 'border-yellow-400 bg-yellow-50 text-yellow-700'
      case 'low':
        return 'border-blue-400 bg-blue-50 text-blue-700'
      default:
        return 'border-gray-400 bg-gray-50 text-gray-700'
    }
  }

  return (
    <Card className={`border-l-4 ${getSeverityColor(error.severity)} p-4 mb-4`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <span className="font-semibold text-sm uppercase tracking-wide">
              {error.type?.replace('_', ' ')} Error
            </span>
            <span className="ml-2 px-2 py-1 text-xs rounded-full bg-white border">
              {error.severity}
            </span>
          </div>
          
          <h4 className="font-medium text-base mb-1">{error.message}</h4>
          
          {error.details && (
            <p className="text-sm opacity-80 mb-2">{error.details}</p>
          )}
          
          <div className="flex items-center text-xs space-x-4 opacity-70">
            <span>Operation: {error.operation}</span>
            <span>Code: {error.code}</span>
            {error.retryable && <span className="text-green-600">• Retryable</span>}
          </div>
          
          {error.context?.suggestedAction && (
            <div className="mt-3 p-2 bg-white bg-opacity-50 rounded text-sm">
              <strong>Suggestion:</strong> {error.context.suggestedAction}
            </div>
          )}
        </div>
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Dismiss error"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </Card>
  )
}

/**
 * Main Appwrite Connection Tester Component
 * @returns {JSX.Element}
 */
const AppwriteConnectionTester = () => {
  // Connection state
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [connectionResult, setConnectionResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Authentication state
  const [authStatus, setAuthStatus] = useState(null)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  // Database testing state
  const [dbOperations, setDbOperations] = useState([])
  const [isTestingDb, setIsTestingDb] = useState(false)

  // Real-time subscriptions state
  const [realtimeEvents, setRealtimeEvents] = useState([])
  const [activeSubscriptions, setActiveSubscriptions] = useState([])

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Test Appwrite connection with comprehensive error handling
   */
  const handleTestConnection = useCallback(async () => {
    setIsLoading(true)
    setConnectionStatus('connecting')
    setError(null)

    try {
      console.log('🧪 Starting comprehensive connection test...')
      
      const result = await testConnection()
      
      if (result.success) {
        setConnectionResult(result.data)
        setConnectionStatus('connected')
        console.log('✅ Connection test passed:', result)
      } else {
        setConnectionStatus('error')
        setError(result)
        console.error('❌ Connection test failed:', result)
      }
    } catch (err) {
      console.error('💥 Connection test error:', err)
      setConnectionStatus('error')
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Test authentication with error handling
   */
  const handleTestAuth = useCallback(async () => {
    setIsAuthenticating(true)
    setError(null)

    try {
      if (authStatus?.authenticated) {
        // Logout
        const result = await logout()
        if (result.success) {
          setAuthStatus(null)
        } else {
          setError(result)
        }
      } else {
        // Login
        if (!loginForm.email || !loginForm.password) {
          throw new Error('Please enter email and password')
        }

        const result = await login(loginForm.email, loginForm.password)
        
        if (result.success) {
          const authCheck = await isAuthenticated()
          setAuthStatus(authCheck.data)
          setLoginForm({ email: '', password: '' })
        } else {
          setError(result)
        }
      }
    } catch (err) {
      console.error('Authentication error:', err)
      setError(err)
    } finally {
      setIsAuthenticating(false)
    }
  }, [authStatus, loginForm])

  /**
   * Test database operations with error handling
   */
  const handleTestDatabase = useCallback(async () => {
    setIsTestingDb(true)
    setError(null)
    const operations = []

    try {
      // Test 1: Get students
      console.log('🧪 Testing database operations...')
      
      try {
        const studentsResult = await dbService.getStudents({ limit: 5 })
        operations.push({
          operation: 'getStudents',
          success: studentsResult.success,
          result: studentsResult.success ? `Found ${studentsResult.data.students.length} students` : studentsResult.message,
          timestamp: new Date().toISOString()
        })
      } catch (err) {
        operations.push({
          operation: 'getStudents',
          success: false,
          result: err.message,
          timestamp: new Date().toISOString()
        })
      }

      // Test 2: Get recent activity
      try {
        const activityResult = await dbService.getRecentActivity(5)
        operations.push({
          operation: 'getRecentActivity',
          success: activityResult.success,
          result: activityResult.success ? `Found ${activityResult.data.activities.length} activities` : activityResult.message,
          timestamp: new Date().toISOString()
        })
      } catch (err) {
        operations.push({
          operation: 'getRecentActivity',
          success: false,
          result: err.message,
          timestamp: new Date().toISOString()
        })
      }

      // Test 3: Get scheduled classes
      const today = new Date().toISOString().split('T')[0]
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      try {
        const classesResult = await dbService.getScheduledClasses(today, nextWeek)
        operations.push({
          operation: 'getScheduledClasses',
          success: classesResult.success,
          result: classesResult.success ? `Found ${classesResult.data.classes.length} classes` : classesResult.message,
          timestamp: new Date().toISOString()
        })
      } catch (err) {
        operations.push({
          operation: 'getScheduledClasses',
          success: false,
          result: err.message,
          timestamp: new Date().toISOString()
        })
      }

      setDbOperations(operations)
      console.log('✅ Database operations test completed:', operations)

    } catch (err) {
      console.error('💥 Database test error:', err)
      setError(err)
    } finally {
      setIsTestingDb(false)
    }
  }, [])

  /**
   * Test real-time subscriptions
   */
  const handleTestRealtime = useCallback(async () => {
    try {
      if (activeSubscriptions.length > 0) {
        // Unsubscribe from all
        realtimeManager.unsubscribeAll()
        setActiveSubscriptions([])
        setRealtimeEvents([])
      } else {
        // Subscribe to key collections
        const collections = ['students', 'attendance', 'activity_log']
        
        collections.forEach(collection => {
          const unsubscribe = realtimeManager.subscribe(collection, (event) => {
            console.log(`📡 Real-time event received for ${collection}:`, event)
            
            setRealtimeEvents(prev => [
              {
                id: Date.now() + Math.random(),
                collection: event.collection,
                eventType: event.eventType,
                timestamp: event.timestamp,
                document: event.document
              },
              ...prev.slice(0, 19) // Keep only 20 most recent events
            ])
          })
          
          setActiveSubscriptions(prev => [...prev, { collection, unsubscribe }])
        })
      }
    } catch (err) {
      console.error('Real-time subscription error:', err)
      setError(err)
    }
  }, [activeSubscriptions])

  /**
   * Check authentication status on mount
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authCheck = await isAuthenticated()
        if (authCheck.success) {
          setAuthStatus(authCheck.data)
        }
      } catch (err) {
        console.warn('Initial auth check failed:', err)
      }
    }

    checkAuth()
  }, [])

  /**
   * Cleanup subscriptions on unmount
   */
  useEffect(() => {
    return () => {
      if (activeSubscriptions.length > 0) {
        realtimeManager.unsubscribeAll()
      }
    }
  }, [activeSubscriptions])

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Appwrite Integration Tester
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Comprehensive testing interface for SportClubApp's Appwrite integration with 
          enhanced error handling, real-time subscriptions, and connection monitoring.
        </p>
      </div>

      {/* Error Display */}
      <ErrorDisplay error={error} onDismiss={clearError} />

      {/* Connection Testing */}
      <Card title="Connection Testing" subtitle="Test Appwrite connection and configuration">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <StatusIndicator 
              status={connectionStatus} 
              message={isLoading ? 'Testing connection...' : undefined}
            />
            <Button 
              onClick={handleTestConnection}
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Testing...' : 'Test Connection'}
            </Button>
          </div>

          {connectionResult && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-3">Connection Test Results:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Client:</strong> {connectionResult.client ? '✅ Connected' : '❌ Failed'}
                </div>
                <div>
                  <strong>Database:</strong> {connectionResult.database ? '✅ Connected' : '❌ Failed'}
                </div>
                <div className="md:col-span-2">
                  <strong>Collections:</strong> {connectionResult.summary.accessibleCollections}/{connectionResult.summary.totalCollections} accessible
                </div>
                <div className="md:col-span-2">
                  <strong>Response Time:</strong> {connectionResult.performance.totalTime}ms
                </div>
              </div>
              
              {connectionResult.collections && (
                <details className="mt-4">
                  <summary className="cursor-pointer font-medium">Collection Details</summary>
                  <div className="mt-2 space-y-1">
                    {Object.entries(connectionResult.collections).map(([name, status]) => (
                      <div key={name} className="flex justify-between items-center text-sm">
                        <span>{name}:</span>
                        <span className={status.accessible ? 'text-green-600' : 'text-red-600'}>
                          {status.accessible ? '✅ Accessible' : '❌ ' + status.error}
                        </span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Authentication Testing */}
      <Card title="Authentication Testing" subtitle="Test login, logout, and session management">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <StatusIndicator 
              status={authStatus?.authenticated ? 'connected' : 'disconnected'}
              message={authStatus?.authenticated ? `Logged in as ${authStatus.instructor?.name || 'User'}` : 'Not authenticated'}
            />
          </div>

          {!authStatus?.authenticated ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                  className="input"
                  placeholder="instructor@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  className="input"
                  placeholder="Password"
                />
              </div>
              <Button 
                onClick={handleTestAuth}
                loading={isAuthenticating}
                disabled={!loginForm.email || !loginForm.password}
              >
                Login
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Button 
                variant="secondary"
                onClick={handleTestAuth}
                loading={isAuthenticating}
              >
                Logout
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Database Operations Testing */}
      <Card title="Database Operations" subtitle="Test CRUD operations with error handling">
        <div className="space-y-4">
          <Button 
            onClick={handleTestDatabase}
            loading={isTestingDb}
            disabled={isTestingDb}
          >
            {isTestingDb ? 'Testing Database...' : 'Test Database Operations'}
          </Button>

          {dbOperations.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-3">Database Test Results:</h4>
              <div className="space-y-2">
                {dbOperations.map((op, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg border-l-4 ${
                      op.success 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-red-500 bg-red-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{op.operation}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(op.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-sm mt-1">{op.result}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Real-time Subscriptions Testing */}
      <Card title="Real-time Subscriptions" subtitle="Test live data synchronization">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <StatusIndicator 
              status={activeSubscriptions.length > 0 ? 'connected' : 'disconnected'}
              message={activeSubscriptions.length > 0 
                ? `${activeSubscriptions.length} subscriptions active` 
                : 'No active subscriptions'
              }
            />
            <Button 
              onClick={handleTestRealtime}
              variant={activeSubscriptions.length > 0 ? 'secondary' : 'primary'}
            >
              {activeSubscriptions.length > 0 ? 'Stop Subscriptions' : 'Start Subscriptions'}
            </Button>
          </div>

          {activeSubscriptions.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h5 className="font-medium text-blue-800 mb-2">Active Subscriptions:</h5>
              <div className="flex flex-wrap gap-2">
                {activeSubscriptions.map((sub, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm">
                    {sub.collection}
                  </span>
                ))}
              </div>
            </div>
          )}

          {realtimeEvents.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-3">Real-time Events (Most Recent):</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {realtimeEvents.map((event) => (
                  <div key={event.id} className="p-3 bg-gray-50 rounded-lg border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm">
                        {event.collection} - {event.eventType}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 truncate">
                      Document ID: {event.document?.$id || 'Unknown'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export { ErrorDisplay }
export default AppwriteConnectionTester
