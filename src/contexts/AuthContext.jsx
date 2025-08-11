/**
 * Authentication Context for SportClubApp
 * 
 * Provides authentication state management, login/logout functions,
 * and automatic session checking with React 18 best practices.
 * 
 * @module AuthContext
 * @version 1.0.0
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { login as authLogin, logout as authLogout, isAuthenticated } from '../services/authService.js'
import { handleError } from '../utils/errorHandler.js'

/**
 * Authentication context
 * @type {React.Context}
 */
const AuthContext = createContext(null)

/**
 * Custom hook to access authentication context
 * @function useAuth
 * @returns {Object} Authentication context value
 * @throws {Error} If used outside AuthProvider
 * 
 * @example
 * const { user, login, logout, isLoading, error } = useAuth()
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}

/**
 * Authentication state provider component
 * @function AuthProvider
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} AuthContext provider
 * 
 * @example
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */
export const AuthProvider = ({ children }) => {
  // Authentication state
  const [user, setUser] = useState(null)
  const [instructor, setInstructor] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  // Session management state
  const [sessionChecked, setSessionChecked] = useState(false)
  const [lastActivity, setLastActivity] = useState(Date.now())

  /**
   * Clear error state
   * @function clearError
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Update last activity timestamp for session tracking
   * @function updateActivity
   */
  const updateActivity = useCallback(() => {
    setLastActivity(Date.now())
  }, [])

  /**
   * Set authentication state from auth response
   * @function setAuthState
   * @param {Object} authData - Authentication data from login response
   */
  const setAuthState = useCallback((authData) => {
    if (authData) {
      setUser(authData.user || null)
      setInstructor(authData.instructor || null)
      setIsAuthenticated(true)
      updateActivity()
      
      console.log('✅ Authentication state updated:', {
        user: authData.user?.email,
        instructor: authData.instructor?.name
      })
    }
  }, [updateActivity])

  /**
   * Clear authentication state
   * @function clearAuthState
   */
  const clearAuthState = useCallback(() => {
    setUser(null)
    setInstructor(null)
    setIsAuthenticated(false)
    setError(null)
    
    console.log('🧹 Authentication state cleared')
  }, [])

  /**
   * Check current authentication status
   * @async
   * @function checkAuthStatus
   * @param {boolean} [silent=false] - Whether to suppress loading states
   * @returns {Promise<boolean>} Authentication status
   */
  const checkAuthStatus = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true)
        setError(null)
      }
      
      console.log('🔍 Checking authentication status...')
      
      const authStatusResponse = await isAuthenticated({
        validateInstructor: true,
        checkSession: true
      })
      
      if (authStatusResponse.success && authStatusResponse.data.authenticated) {
        const authData = {
          user: authStatusResponse.data.user,
          instructor: authStatusResponse.data.instructor
        }
        
        setAuthState(authData)
        setSessionChecked(true)
        
        console.log('✅ User is authenticated:', authData.instructor?.name)
        return true
      } else {
        clearAuthState()
        setSessionChecked(true)
        
        if (authStatusResponse.data?.errors?.length > 0) {
          console.warn('⚠️ Authentication issues:', authStatusResponse.data.errors)
        }
        
        console.log('❌ User is not authenticated')
        return false
      }
    } catch (err) {
      console.error('❌ Auth status check failed:', err)
      
      const enhancedError = handleError(err, 'checkAuthStatus', {
        context: 'session_validation'
      })
      
      setError(enhancedError)
      clearAuthState()
      setSessionChecked(true)
      return false
    } finally {
      if (!silent) {
        setIsLoading(false)
      }
    }
  }, [setAuthState, clearAuthState])

  /**
   * Login with email and password
   * @async
   * @function login
   * @param {string} email - User email address
   * @param {string} password - User password
   * @param {Object} [options] - Login options
   * @param {boolean} [options.rememberMe=false] - Whether to persist session
   * @returns {Promise<Object>} Login result
   * 
   * @example
   * const result = await login('instructor@example.com', 'password', { rememberMe: true })
   * if (result.success) {
   *   console.log('Logged in successfully!')
   * } else {
   *   console.error('Login failed:', result.message)
   * }
   */
  const login = useCallback(async (email, password, options = {}) => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔐 Attempting login for:', email.replace(/(.{2}).*@/, '$1***@'))
      
      const loginResponse = await authLogin(email, password, {
        rememberMe: options.rememberMe || false,
        validateInstructor: true
      })
      
      if (loginResponse.success) {
        // Set authentication state from login response
        setAuthState({
          user: loginResponse.data.user,
          instructor: loginResponse.data.instructor
        })
        
        console.log('🎉 Login successful!')
        
        return {
          success: true,
          message: loginResponse.message,
          data: {
            user: loginResponse.data.user,
            instructor: loginResponse.data.instructor
          }
        }
      } else {
        // Handle login failure
        setError(loginResponse)
        clearAuthState()
        
        console.error('❌ Login failed:', loginResponse.message)
        
        return loginResponse
      }
    } catch (err) {
      console.error('💥 Login error:', err)
      
      const enhancedError = handleError(err, 'login', {
        email: email?.replace(/(.{2}).*@/, '$1***@'),
        context: 'authentication'
      })
      
      setError(enhancedError)
      clearAuthState()
      
      return enhancedError
    } finally {
      setIsLoading(false)
    }
  }, [setAuthState, clearAuthState])

  /**
   * Logout current user
   * @async
   * @function logout
   * @param {Object} [options] - Logout options
   * @param {boolean} [options.clearAllSessions=false] - Clear all sessions across devices
   * @returns {Promise<Object>} Logout result
   * 
   * @example
   * const result = await logout({ clearAllSessions: true })
   * if (result.success) {
   *   console.log('Logged out successfully!')
   * }
   */
  const logout = useCallback(async (options = {}) => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🚪 Logging out user...')
      
      const logoutResponse = await authLogout({
        clearAllSessions: options.clearAllSessions || false,
        logActivity: true
      })
      
      // Always clear local auth state, even if server logout fails
      clearAuthState()
      
      if (logoutResponse.success) {
        console.log('✅ Logout successful')
        
        return {
          success: true,
          message: logoutResponse.message
        }
      } else {
        console.warn('⚠️ Server logout had issues, but local state cleared:', logoutResponse.message)
        
        return {
          success: true, // Still consider it success since local state is cleared
          message: 'Logged out locally'
        }
      }
    } catch (err) {
      console.error('❌ Logout error:', err)
      
      // Still clear local state on logout error
      clearAuthState()
      
      const enhancedError = handleError(err, 'logout', {
        context: 'session_cleanup'
      })
      
      setError(enhancedError)
      
      return {
        success: true, // Consider success since local state is cleared
        message: 'Logged out locally (server logout failed)'
      }
    } finally {
      setIsLoading(false)
    }
  }, [clearAuthState])

  /**
   * Refresh authentication status
   * @async
   * @function refreshAuth
   * @returns {Promise<boolean>} Whether user is still authenticated
   */
  const refreshAuth = useCallback(async () => {
    return await checkAuthStatus(false)
  }, [checkAuthStatus])

  // Check authentication status on mount
  useEffect(() => {
    let isMounted = true
    
    const initializeAuth = async () => {
      console.log('🚀 Initializing authentication...')
      
      if (isMounted) {
        await checkAuthStatus(false)
      }
    }
    
    initializeAuth()
    
    return () => {
      isMounted = false
    }
  }, [checkAuthStatus])

  // Periodic session validation (every 5 minutes)
  useEffect(() => {
    if (!isAuthenticated || !sessionChecked) return
    
    const interval = setInterval(() => {
      console.log('⏰ Performing periodic session validation...')
      checkAuthStatus(true) // Silent check
    }, 5 * 60 * 1000) // 5 minutes
    
    return () => clearInterval(interval)
  }, [isAuthenticated, sessionChecked, checkAuthStatus])

  // Activity tracking for session management
  useEffect(() => {
    if (!isAuthenticated) return
    
    // Track user activity for session management
    const handleUserActivity = () => {
      updateActivity()
    }
    
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true)
    })
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true)
      })
    }
  }, [isAuthenticated, updateActivity])

  // Session timeout warning (after 30 minutes of inactivity)
  useEffect(() => {
    if (!isAuthenticated) return
    
    const checkSessionTimeout = () => {
      const timeSinceLastActivity = Date.now() - lastActivity
      const thirtyMinutes = 30 * 60 * 1000
      
      if (timeSinceLastActivity > thirtyMinutes) {
        console.warn('⚠️ Session timeout warning: User inactive for 30+ minutes')
        // Could trigger a warning modal or auto-logout here
      }
    }
    
    const interval = setInterval(checkSessionTimeout, 5 * 60 * 1000) // Check every 5 minutes
    
    return () => clearInterval(interval)
  }, [isAuthenticated, lastActivity])

  // Context value
  const contextValue = {
    // Authentication state
    user,
    instructor,
    isAuthenticated,
    isLoading,
    error,
    sessionChecked,
    lastActivity,
    
    // Authentication actions
    login,
    logout,
    refreshAuth,
    checkAuthStatus,
    
    // Utility functions
    clearError,
    updateActivity,
    
    // Helper properties
    isInstructor: Boolean(instructor),
    userName: instructor?.name || user?.name || null,
    userEmail: user?.email || null,
    instructorId: instructor?.$id || instructor?.id || null,
    userId: user?.$id || null
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
