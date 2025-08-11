/**
 * Protected Route Component
 * 
 * Component that checks authentication status and redirects to login
 * if not authenticated. Shows loading spinner while checking auth status.
 * 
 * @component
 * @version 1.0.0
 */

import { useEffect, useState, useCallback } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

/**
 * Loading spinner component for authentication checks
 * @function LoadingSpinner
 * @param {Object} props - Component props
 * @param {string} [props.message] - Loading message to display
 * @returns {JSX.Element} Loading spinner component
 */
const LoadingSpinner = ({ message = 'Checking authentication...' }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      {/* Spinner Animation */}
      <div className="inline-flex items-center justify-center w-12 h-12 mb-4">
        <svg 
          className="animate-spin w-8 h-8 text-blue-600" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      
      {/* Loading Message */}
      <div className="space-y-2">
        <h2 className="text-lg font-medium text-gray-900">SportClubApp</h2>
        <p className="text-sm text-gray-600">{message}</p>
      </div>
      
      {/* Progress Dots */}
      <div className="flex items-center justify-center space-x-1 mt-4">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  </div>
)

/**
 * Authentication error display component
 * @function AuthError
 * @param {Object} props - Component props
 * @param {Object} props.error - Authentication error
 * @param {Function} props.onRetry - Retry function
 * @returns {JSX.Element} Authentication error component
 */
const AuthError = ({ error, onRetry }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div className="max-w-md w-full">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-red-100 rounded-full">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
        <p className="text-gray-600 mb-6">
          {error?.message || 'Unable to verify your authentication status. Please try again.'}
        </p>
      </div>
      
      <div className="space-y-3">
        <button
          onClick={onRetry}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Retry Authentication Check
        </button>
        
        <button
          onClick={() => window.location.href = '/login'}
          className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Go to Login Page
        </button>
      </div>
      
      {/* Technical Error Details (for debugging) */}
      {error?.details && (
        <details className="mt-6">
          <summary className="text-sm text-gray-500 cursor-pointer">Technical Details</summary>
          <div className="mt-2 p-3 bg-gray-100 rounded-lg text-xs text-gray-600 font-mono">
            <pre className="whitespace-pre-wrap">{error.details}</pre>
          </div>
        </details>
      )}
    </div>
  </div>
)

/**
 * Protected route component that requires authentication
 * @function ProtectedRoute
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render when authenticated
 * @param {string} [props.redirectTo='/login'] - Path to redirect to when not authenticated
 * @param {string} [props.loadingMessage] - Custom loading message
 * @param {boolean} [props.requireInstructor=true] - Whether to require instructor role
 * @returns {JSX.Element} Protected route component
 * 
 * @example
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 * 
 * @example
 * <ProtectedRoute redirectTo="/auth" loadingMessage="Loading dashboard...">
 *   <AdminPanel />
 * </ProtectedRoute>
 */
const ProtectedRoute = ({ 
  children, 
  redirectTo = '/login',
  loadingMessage,
  requireInstructor = true 
}) => {
  const { 
    isAuthenticated, 
    isLoading, 
    sessionChecked,
    error,
    instructor,
    refreshAuth,
    clearError
  } = useAuth()
  
  const location = useLocation()
  const [retryCount, setRetryCount] = useState(0)
  const [showError, setShowError] = useState(false)
  
  /**
   * Handle authentication retry
   * @function handleRetry
   */
  const handleRetry = useCallback(async () => {
    setShowError(false)
    clearError()
    setRetryCount(prev => prev + 1)
    
    try {
      await refreshAuth()
    } catch (err) {
      console.error('Authentication retry failed:', err)
      setShowError(true)
    }
  }, [clearError, refreshAuth])
  
  // Show error screen after multiple failed attempts
  useEffect(() => {
    if (error && sessionChecked && retryCount > 0) {
      const timer = setTimeout(() => {
        setShowError(true)
      }, 2000) // Show error after 2 seconds of persistent error
      
      return () => clearTimeout(timer)
    }
  }, [error, sessionChecked, retryCount])
  
  // Auto-retry authentication check if it fails initially
  useEffect(() => {
    if (error && !isLoading && retryCount === 0) {
      const timer = setTimeout(() => {
        handleRetry()
      }, 1000) // Retry after 1 second
      
      return () => clearTimeout(timer)
    }
  }, [error, isLoading, retryCount, handleRetry])
  
  // Show loading spinner while checking authentication
  if (isLoading || !sessionChecked) {
    const message = loadingMessage || 
      (retryCount > 0 ? `Retrying authentication check (${retryCount})...` : 'Checking authentication...')
    
    return <LoadingSpinner message={message} />
  }
  
  // Show error screen if authentication check persistently fails
  if (showError && error) {
    return <AuthError error={error} onRetry={handleRetry} />
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('🔒 User not authenticated, redirecting to login')
    
    return (
      <Navigate 
        to={redirectTo} 
        state={{ 
          from: location.pathname,
          message: 'Please sign in to access this page'
        }} 
        replace 
      />
    )
  }
  
  // Check instructor requirement
  if (requireInstructor && !instructor) {
    console.warn('👨‍🏫 User authenticated but not an instructor')
    
    return (
      <Navigate 
        to={redirectTo} 
        state={{ 
          from: location.pathname,
          message: 'Instructor access required'
        }} 
        replace 
      />
    )
  }
  
  // User is authenticated and authorized - render children
  console.log('✅ User authorized, rendering protected content')
  
  return <>{children}</>
}

// Note: Additional utilities like withAuth HOC and useRouteProtection hook
// can be added in a separate utils file if needed in the future

export default ProtectedRoute
