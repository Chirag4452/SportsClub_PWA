/**
 * App Layout Component
 * 
 * Main application layout with header, content area, and bottom navigation.
 * Provides responsive design, iOS safe areas, and smooth content transitions.
 * 
 * @component
 * @version 1.0.0
 */

import { useCallback } from 'react'
import { LogOut, Menu, Bell, Settings } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useNavigation } from '../../hooks/useNavigation.js'
import BottomNavigation from '../BottomNavigation.jsx'
import Button from '../Button.jsx'

/**
 * App Header Component
 * @function AppHeader
 * @param {Object} props - Component props
 * @param {Object} props.user - Current user object
 * @param {Object} props.instructor - Current instructor object
 * @param {Function} props.onLogout - Logout handler
 * @param {Function} [props.onMenuClick] - Menu button click handler
 * @param {Function} [props.onNotificationClick] - Notification button click handler
 * @returns {JSX.Element} App header component
 */
const AppHeader = ({ 
  user, 
  instructor, 
  onLogout, 
  onMenuClick, 
  onNotificationClick 
}) => {
  const displayName = instructor?.name || user?.name || 'User'
  const userEmail = user?.email

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 pt-safe-top">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left Section - App Title & User Info */}
          <div className="flex items-center space-x-3">
            {/* Menu Button (Optional - for future sidebar) */}
            {onMenuClick && (
              <button
                type="button"
                onClick={onMenuClick}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors lg:hidden"
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>
            )}

            {/* App Branding */}
            <div className="flex items-center space-x-3">
              {/* App Icon */}
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg shadow-sm">
                <span className="text-white text-sm font-bold">SC</span>
              </div>

              {/* App Title & User */}
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  SportClubApp
                </h1>
                <p className="text-xs text-gray-600 truncate max-w-[200px]">
                  Welcome, {displayName}
                </p>
              </div>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center space-x-2">
            {/* Notifications Button (Future Feature) */}
            {onNotificationClick && (
              <button
                type="button"
                onClick={onNotificationClick}
                className="relative p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                aria-label="Notifications"
              >
                <Bell size={18} />
                {/* Notification Badge */}
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                  2
                </span>
              </button>
            )}

            {/* Settings Button (Future Feature) */}
            <button
              type="button"
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              aria-label="Settings"
              onClick={() => console.log('Settings clicked - to be implemented')}
            >
              <Settings size={18} />
            </button>

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-gray-600 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut size={16} className="mr-1" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

/**
 * Content Container Component with tab-based transitions
 * @function ContentContainer
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to display
 * @param {boolean} [props.isTransitioning] - Whether navigation is transitioning
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} Content container component
 */
const ContentContainer = ({ 
  children, 
  isTransitioning = false, 
  className = '' 
}) => {
  return (
    <main className={`
      flex-1 overflow-auto
      transition-opacity duration-200 ease-in-out
      ${isTransitioning ? 'opacity-75' : 'opacity-100'}
      ${className}
    `}>
      {/* Content with proper padding for bottom nav */}
      <div className="pb-20 min-h-full">
        {children}
      </div>
    </main>
  )
}

/**
 * Loading State Component
 * @function LoadingState
 * @returns {JSX.Element} Loading state component
 */
const LoadingState = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
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
      <h2 className="text-lg font-medium text-gray-900">SportClubApp</h2>
      <p className="text-sm text-gray-600">Loading your dashboard...</p>
    </div>
  </div>
)

/**
 * Error State Component
 * @function ErrorState
 * @param {Object} props - Component props
 * @param {Object} props.error - Error object
 * @param {Function} props.onRetry - Retry handler
 * @returns {JSX.Element} Error state component
 */
const ErrorState = ({ error, onRetry }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
    <div className="max-w-md w-full text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-red-100 rounded-full">
        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
      <p className="text-gray-600 mb-6">
        {error?.message || 'An unexpected error occurred while loading the application.'}
      </p>
      <Button onClick={onRetry} className="w-full">
        Try Again
      </Button>
    </div>
  </div>
)

/**
 * Main App Layout Component
 * @function AppLayout
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to display in layout
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} Complete app layout
 * 
 * @example
 * <AppLayout>
 *   <DashboardPage />
 * </AppLayout>
 */
const AppLayout = ({ children, className = '' }) => {
  const { user, instructor, logout, isLoading, error } = useAuth()
  const { isTransitioning } = useNavigation()

  /**
   * Handle logout with confirmation
   * @function handleLogout
   */
  const handleLogout = useCallback(async () => {
    try {
      await logout()
      // Navigation will be handled by the auth system
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }, [logout])

  /**
   * Handle error retry
   * @function handleRetry
   */
  const handleRetry = useCallback(() => {
    window.location.reload()
  }, [])

  // Show loading state
  if (isLoading) {
    return <LoadingState />
  }

  // Show error state
  if (error) {
    return <ErrorState error={error} onRetry={handleRetry} />
  }

  return (
    <div className={`
      min-h-screen flex flex-col bg-gray-50
      ${className}
    `}>
      {/* App Header */}
      <AppHeader
        user={user}
        instructor={instructor}
        onLogout={handleLogout}
        onNotificationClick={() => console.log('Notifications - to be implemented')}
      />

      {/* Main Content Area */}
      <ContentContainer isTransitioning={isTransitioning}>
        {children}
      </ContentContainer>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* PWA Install Prompt Area (if needed in future) */}
      {/* <PWAInstallPrompt /> */}
    </div>
  )
}

export default AppLayout
