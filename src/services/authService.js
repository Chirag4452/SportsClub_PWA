/**
 * Authentication Service for SportClubApp
 * 
 * Handles user authentication using Appwrite with comprehensive error handling,
 * instructor collection validation, session management, and security features.
 * 
 * @module AuthService
 * @version 1.0.0
 */

import { 
  account, 
  databases, 
  APPWRITE_CONFIG, 
  Query,
  retryOperation 
} from './appwrite.js'
import { 
  handleError, 
  handleAuthError, 
  handleValidationError,
  createSuccessResponse,
  ErrorTypes 
} from '../utils/errorHandler.js'

/**
 * Login with email and password, validating against instructors collection
 * @async
 * @function login
 * @param {string} email - Instructor email address (required)
 * @param {string} password - Instructor password (required)
 * @param {Object} [options] - Login options
 * @param {boolean} [options.rememberMe=false] - Whether to persist session longer
 * @param {boolean} [options.validateInstructor=true] - Whether to validate against instructors collection
 * @returns {Promise<Object>} Login result with user and instructor information
 * @throws {Object} Enhanced error object with authentication details
 * 
 * @example
 * const result = await login('instructor@email.com', 'password123')
 * if (result.success) {
 *   console.log('Welcome:', result.data.instructor.name)
 * } else {
 *   console.error('Login failed:', result.message)
 * }
 */
export const login = async (email, password, options = {}) => {
  const { rememberMe = false, validateInstructor = true } = options
  
  try {
    console.log('🔐 Attempting to log in user:', email.replace(/(.{2}).*@/, '$1***@'))
    
    // Input validation with detailed error messages
    const validationErrors = {}
    if (!email || email.trim().length === 0) {
      validationErrors.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      validationErrors.email = 'Please enter a valid email address'
    }
    
    if (!password || password.length === 0) {
      validationErrors.password = 'Password is required'
    } else if (password.length < 6) {
      validationErrors.password = 'Password must be at least 6 characters long'
    }
    
    if (Object.keys(validationErrors).length > 0) {
      throw handleValidationError(
        new Error('Validation failed'),
        'login_validation',
        validationErrors
      )
    }
    
    const normalizedEmail = email.trim().toLowerCase()
    
    // Step 1: Create email session with Appwrite (with retry for network resilience)
    const session = await retryOperation(
      () => account.createEmailPasswordSession(normalizedEmail, password),
      'create_session',
      3,
      1000
    )
    console.log('✅ Appwrite session created successfully')
    
    // Step 2: Get user account information
    const user = await retryOperation(
      () => account.get(),
      'get_user_account',
      2,
      500
    )
    console.log('📋 User account retrieved successfully')
    
    // Step 3: Validate user exists in instructors collection (if required)
    let instructorInfo = null
    if (validateInstructor) {
      instructorInfo = await getInstructorInfo(normalizedEmail)
      
      if (!instructorInfo.success) {
        // User authenticated but not in instructors collection - clean up session
        try {
          await account.deleteSession('current')
        } catch (cleanupError) {
          console.warn('⚠️ Failed to cleanup session after instructor validation failure:', cleanupError)
        }
        
        throw new Error('Access denied. You are not registered as an instructor in the system.')
      }
      
      console.log('🎉 Login successful for instructor:', instructorInfo.data.name)
    }
    
    // Step 4: Store session information locally
    const sessionData = {
      loginTime: new Date().toISOString(),
      rememberMe,
      email: normalizedEmail,
      userId: user.$id
    }
    
    // Use sessionStorage for temporary sessions, localStorage for persistent
    const storage = rememberMe ? localStorage : sessionStorage
    storage.setItem('authSession', JSON.stringify(sessionData))
    
    if (instructorInfo) {
      storage.setItem('instructorInfo', JSON.stringify(instructorInfo.data))
    }
    
    // Step 5: Log successful login activity
    try {
      // Import logActivity dynamically to avoid circular dependency
      const { logActivity } = await import('./databaseService.js')
      await logActivity('user_login', instructorInfo?.data?.id || user.$id, {
        email: normalizedEmail,
        timestamp: sessionData.loginTime,
        rememberMe
      })
    } catch (logError) {
      console.warn('⚠️ Failed to log login activity:', logError.message)
    }
    
    const loginResponse = {
      user,
      session,
      loginTime: sessionData.loginTime,
      rememberMe
    }
    
    if (instructorInfo) {
      loginResponse.instructor = instructorInfo.data
    }
    
    const welcomeMessage = instructorInfo 
      ? `Welcome back, ${instructorInfo.data.name}!`
      : 'Login successful!'
    
    return createSuccessResponse(loginResponse, welcomeMessage)
    
  } catch (error) {
    console.error('❌ Login failed:', error.message)
    
    // Handle specific authentication errors with enhanced context
    if (error.code === 401) {
      return handleAuthError(
        { 
          ...error, 
          message: 'Invalid email or password. Please check your credentials and try again.' 
        }, 
        'login'
      )
    }
    
    if (error.code === 429) {
      return handleError(error, 'login', {
        suggestedAction: 'Too many login attempts. Please wait a few minutes before trying again.'
      })
    }
    
    // Check if error is already enhanced
    if (error.success === false && error.type) {
      return error
    }
    
    return handleError(error, 'login', { email: email?.replace(/(.{2}).*@/, '$1***@') })
  }
}

/**
 * Logout current user and cleanup session data
 * @async
 * @function logout
 * @param {Object} [options] - Logout options
 * @param {boolean} [options.clearAllSessions=false] - Whether to clear all sessions across devices
 * @param {boolean} [options.logActivity=true] - Whether to log the logout activity
 * @returns {Promise<Object>} Logout result with cleanup status
 * 
 * @example
 * const result = await logout({ clearAllSessions: true })
 * if (result.success) {
 *   console.log('Logged out successfully')
 * }
 */
export const logout = async (options = {}) => {
  const { clearAllSessions = false, logActivity = true } = options
  
  try {
    console.log('🚪 Logging out user...')
    
    // Get current user info for activity logging before logout
    let currentUser = null
    let instructorInfo = null
    
    if (logActivity) {
      try {
        currentUser = await account.get()
        instructorInfo = getCachedInstructorInfo()
      } catch (getUserError) {
        console.warn('⚠️ Could not get user info for activity logging:', getUserError.message)
      }
    }
    
    // Step 1: Delete session(s) from Appwrite
    try {
      if (clearAllSessions) {
        console.log('🧹 Clearing all sessions across devices...')
        await account.deleteSessions()
      } else {
        await account.deleteSession('current')
      }
      console.log('✅ Server session(s) cleared successfully')
    } catch (sessionError) {
      console.warn('⚠️ Failed to clear server session:', sessionError.message)
      // Continue with local cleanup even if server logout fails
    }
    
    // Step 2: Clear local storage data
    const clearLocalData = () => {
      // Clear auth-related data from both storage types
      localStorage.removeItem('authSession')
      localStorage.removeItem('instructorInfo')
      localStorage.removeItem('lastLoginTime') // Legacy support
      
      sessionStorage.removeItem('authSession')
      sessionStorage.removeItem('instructorInfo')
      
      // Clear any other cached authentication data
      sessionStorage.removeItem('recentActivity')
      sessionStorage.removeItem('userPreferences')
    }
    
    clearLocalData()
    console.log('✅ Local storage cleared successfully')
    
    // Step 3: Log logout activity (before clearing everything)
    if (logActivity && currentUser && instructorInfo) {
      try {
        const { logActivity: logActivityFn } = await import('./databaseService.js')
        await logActivityFn('user_logout', instructorInfo.id, {
          email: currentUser.email,
          timestamp: new Date().toISOString(),
          clearAllSessions
        })
        console.log('✅ Logout activity logged')
      } catch (logError) {
        console.warn('⚠️ Failed to log logout activity:', logError.message)
      }
    }
    
    // Step 4: Clear any real-time subscriptions
    try {
      const { realtimeManager } = await import('./appwrite.js')
      realtimeManager.unsubscribeAll()
      console.log('✅ Real-time subscriptions cleared')
    } catch (realtimeError) {
      console.warn('⚠️ Failed to clear real-time subscriptions:', realtimeError.message)
    }
    
    console.log('🎉 Logout completed successfully')
    
    return createSuccessResponse({
      timestamp: new Date().toISOString(),
      clearedSessions: clearAllSessions ? 'all' : 'current',
      localDataCleared: true,
      activityLogged: logActivity
    }, clearAllSessions ? 'Logged out from all devices' : 'Logged out successfully')
    
  } catch (error) {
    console.error('❌ Logout error:', error.message)
    
    // Even if logout fails, ensure local cleanup happens
    try {
      localStorage.removeItem('authSession')
      localStorage.removeItem('instructorInfo')
      localStorage.removeItem('lastLoginTime')
      sessionStorage.clear()
      console.log('✅ Emergency local cleanup completed')
    } catch (cleanupError) {
      console.error('💥 Failed to cleanup local data:', cleanupError.message)
    }
    
    // Don't treat logout as a critical failure - user should be logged out locally
    return createSuccessResponse({
      timestamp: new Date().toISOString(),
      localDataCleared: true,
      serverLogoutFailed: true,
      error: error.message
    }, 'Logged out locally (server logout failed)')
  }
}

/**
 * Get current authenticated user
 * @returns {Promise<Object>} Current user information or null
 */
export const getCurrentUser = async () => {
  try {
    const user = await account.get()
    console.log('👤 Current user retrieved:', user.email)
    
    return createSuccessResponse(user, 'User information retrieved')
    
  } catch (error) {
    if (error.code === 401) {
      return createSuccessResponse(null, 'No authenticated user')
    }
    
    return handleAppwriteError(error, 'getCurrentUser')
  }
}

/**
 * Get instructor information from instructors collection by email
 * @param {string} email - Instructor email
 * @returns {Promise<Object>} Instructor information
 */
export const getInstructorInfo = async (email) => {
  try {
    console.log('👨‍🏫 Fetching instructor info for:', email)
    
    if (!email) {
      throw new Error('Email is required to fetch instructor information')
    }
    
    // Query instructors collection by email
    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.instructors,
      [
        Query.equal('email', email),
        Query.limit(1)
      ]
    )
    
    if (response.documents.length === 0) {
      console.warn('⚠️ Instructor not found in database:', email)
      return handleAppwriteError(
        { code: 404, message: 'Instructor not found in database' },
        'getInstructorInfo'
      )
    }
    
    const instructor = response.documents[0]
    console.log('✅ Instructor found:', instructor.name)
    
    return createSuccessResponse({
      id: instructor.$id,
      name: instructor.name,
      email: instructor.email,
      role: instructor.role || 'instructor',
      permissions: instructor.permissions || [],
      createdAt: instructor.$createdAt,
      updatedAt: instructor.$updatedAt
    }, 'Instructor information retrieved')
    
  } catch (error) {
    console.error('❌ Error fetching instructor info:', error.message)
    return handleAppwriteError(error, 'getInstructorInfo')
  }
}

/**
 * Check if user is currently authenticated with comprehensive validation
 * @async
 * @function isAuthenticated
 * @param {Object} [options] - Authentication check options
 * @param {boolean} [options.validateInstructor=true] - Whether to validate instructor status
 * @param {boolean} [options.checkSession=true] - Whether to validate active session
 * @returns {Promise<Object>} Authentication status with detailed information
 * 
 * @example
 * const authStatus = await isAuthenticated()
 * if (authStatus.authenticated) {
 *   console.log('User is authenticated as:', authStatus.instructor?.name)
 * }
 */
export const isAuthenticated = async (options = {}) => {
  const { validateInstructor = true, checkSession = true } = options
  
  try {
    console.log('🔍 Checking authentication status...')
    
    const authStatus = {
      authenticated: false,
      hasValidSession: false,
      hasInstructorInfo: false,
      user: null,
      instructor: null,
      sessionAge: null,
      errors: []
    }
    
    // Step 1: Check if we have cached session info
    const cachedSession = getCachedSessionInfo()
    if (cachedSession) {
      authStatus.sessionAge = Date.now() - new Date(cachedSession.loginTime).getTime()
    }
    
    // Step 2: Validate active Appwrite session
    if (checkSession) {
      try {
        const userResult = await getCurrentUser()
        if (userResult.success && userResult.data) {
          authStatus.hasValidSession = true
          authStatus.user = userResult.data
          console.log('✅ Valid Appwrite session found')
        } else {
          authStatus.errors.push('No valid Appwrite session')
          console.log('❌ No valid Appwrite session')
        }
      } catch (sessionError) {
        authStatus.errors.push(`Session validation failed: ${sessionError.message}`)
        console.warn('⚠️ Session validation failed:', sessionError.message)
      }
    }
    
    // Step 3: Validate instructor information (if required)
    if (validateInstructor) {
      try {
        const instructorInfo = getCachedInstructorInfo()
        if (instructorInfo && instructorInfo.id && instructorInfo.name) {
          authStatus.hasInstructorInfo = true
          authStatus.instructor = instructorInfo
          console.log('✅ Valid instructor info found')
        } else {
          authStatus.errors.push('No valid instructor information')
          console.log('❌ No valid instructor information')
          
          // Try to refresh instructor info if we have a valid session
          if (authStatus.hasValidSession && authStatus.user?.email) {
            try {
              const refreshedInfo = await getInstructorInfo(authStatus.user.email)
              if (refreshedInfo.success) {
                authStatus.hasInstructorInfo = true
                authStatus.instructor = refreshedInfo.data
                
                // Update cache
                const storage = cachedSession?.rememberMe ? localStorage : sessionStorage
                storage.setItem('instructorInfo', JSON.stringify(refreshedInfo.data))
                
                console.log('✅ Instructor info refreshed successfully')
              }
            } catch (refreshError) {
              authStatus.errors.push(`Failed to refresh instructor info: ${refreshError.message}`)
              console.warn('⚠️ Failed to refresh instructor info:', refreshError.message)
            }
          }
        }
      } catch (instructorError) {
        authStatus.errors.push(`Instructor validation failed: ${instructorError.message}`)
        console.warn('⚠️ Instructor validation failed:', instructorError.message)
      }
    }
    
    // Step 4: Determine overall authentication status
    authStatus.authenticated = checkSession 
      ? authStatus.hasValidSession && (!validateInstructor || authStatus.hasInstructorInfo)
      : !validateInstructor || authStatus.hasInstructorInfo
    
    console.log(`🔍 Authentication check complete: ${authStatus.authenticated ? 'Authenticated' : 'Not authenticated'}`)
    
    if (authStatus.errors.length > 0) {
      console.warn('⚠️ Authentication issues detected:', authStatus.errors)
    }
    
    return createSuccessResponse(authStatus, 
      authStatus.authenticated 
        ? 'User is authenticated' 
        : 'User is not authenticated'
    )
    
  } catch (error) {
    console.error('❌ Authentication check failed:', error.message)
    
    return handleError(error, 'authentication_check', {
      fallback: {
        authenticated: false,
        hasValidSession: false,
        hasInstructorInfo: false,
        error: error.message
      }
    })
  }
}

/**
 * Get cached session information from local storage
 * @returns {Object|null} Cached session data or null if not found
 */
const getCachedSessionInfo = () => {
  try {
    // Try localStorage first (persistent sessions), then sessionStorage
    let sessionData = localStorage.getItem('authSession')
    if (!sessionData) {
      sessionData = sessionStorage.getItem('authSession')
    }
    
    return sessionData ? JSON.parse(sessionData) : null
  } catch (error) {
    console.warn('⚠️ Failed to parse cached session info:', error.message)
    return null
  }
}

/**
 * Get cached instructor information from localStorage
 * @returns {Object|null} Cached instructor info or null
 */
export const getCachedInstructorInfo = () => {
  try {
    const cachedInfo = localStorage.getItem('instructorInfo')
    return cachedInfo ? JSON.parse(cachedInfo) : null
  } catch (error) {
    console.error('❌ Error reading cached instructor info:', error.message)
    return null
  }
}

/**
 * Refresh instructor information and update cache
 * @returns {Promise<Object>} Updated instructor information
 */
export const refreshInstructorInfo = async () => {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser.success || !currentUser.data) {
      throw new Error('No authenticated user to refresh')
    }
    
    const instructorInfo = await getInstructorInfo(currentUser.data.email)
    
    if (instructorInfo.success) {
      localStorage.setItem('instructorInfo', JSON.stringify(instructorInfo.data))
    }
    
    return instructorInfo
    
  } catch (error) {
    console.error('❌ Error refreshing instructor info:', error.message)
    return handleAppwriteError(error, 'refreshInstructorInfo')
  }
}

/**
 * Change user password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Password change result
 */
export const changePassword = async (currentPassword, newPassword) => {
  try {
    console.log('🔑 Changing user password...')
    
    if (!currentPassword || !newPassword) {
      throw new Error('Both current and new passwords are required')
    }
    
    if (newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long')
    }
    
    await account.updatePassword(newPassword, currentPassword)
    
    console.log('✅ Password changed successfully')
    
    return createSuccessResponse(null, 'Password changed successfully')
    
  } catch (error) {
    console.error('❌ Password change failed:', error.message)
    return handleAppwriteError(error, 'changePassword')
  }
}

/**
 * Get session duration and activity
 * @returns {Object} Session information
 */
export const getSessionInfo = () => {
  const lastLoginTime = localStorage.getItem('lastLoginTime')
  const instructorInfo = getCachedInstructorInfo()
  
  if (!lastLoginTime) {
    return {
      isActive: false,
      duration: 0,
      instructor: null
    }
  }
  
  const loginTime = new Date(lastLoginTime)
  const currentTime = new Date()
  const duration = Math.floor((currentTime - loginTime) / 1000) // Duration in seconds
  
  return {
    isActive: true,
    loginTime: loginTime.toISOString(),
    duration,
    durationFormatted: formatDuration(duration),
    instructor: instructorInfo
  }
}

/**
 * Format duration in seconds to human-readable format
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`
  } else {
    return `${remainingSeconds}s`
  }
}