/**
 * Bottom Navigation Component
 * 
 * Mobile-optimized tab navigation with smooth transitions,
 * touch-friendly interactions, and iOS safe area support.
 * 
 * @component
 * @version 1.0.0
 */

import { useCallback } from 'react'
import { LayoutDashboard, Users, CreditCard } from 'lucide-react'
import { useNavigation, NAVIGATION_TABS } from '../hooks/useNavigation.js'

/**
 * Tab icon components mapping
 * @constant
 */
const TAB_ICONS = {
  [NAVIGATION_TABS.DASHBOARD.id]: LayoutDashboard,
  [NAVIGATION_TABS.ATTENDANCE.id]: Users,
  [NAVIGATION_TABS.PAYMENTS.id]: CreditCard
}

/**
 * Tab configuration with icons and colors
 * @constant
 */
const TAB_CONFIG = {
  [NAVIGATION_TABS.DASHBOARD.id]: {
    icon: LayoutDashboard,
    activeColor: 'text-blue-600',
    inactiveColor: 'text-gray-400',
    activeBg: 'bg-blue-50',
    label: 'Dashboard'
  },
  [NAVIGATION_TABS.ATTENDANCE.id]: {
    icon: Users,
    activeColor: 'text-green-600',
    inactiveColor: 'text-gray-400',
    activeBg: 'bg-green-50',
    label: 'Attendance'
  },
  [NAVIGATION_TABS.PAYMENTS.id]: {
    icon: CreditCard,
    activeColor: 'text-purple-600',
    inactiveColor: 'text-gray-400',
    activeBg: 'bg-purple-50',
    label: 'Payments'
  }
}

/**
 * Individual tab button component
 * @function TabButton
 * @param {Object} props - Component props
 * @param {Object} props.tab - Tab configuration object
 * @param {boolean} props.isActive - Whether tab is currently active
 * @param {boolean} props.isTransitioning - Whether navigation is transitioning
 * @param {Function} props.onClick - Click handler
 * @returns {JSX.Element} Tab button component
 */
const TabButton = ({ tab, isActive, isTransitioning, onClick }) => {
  const config = TAB_CONFIG[tab.id]
  const Icon = config.icon

  const handleClick = useCallback(() => {
    if (!isActive && !isTransitioning) {
      onClick(tab.id)
    }
  }, [isActive, isTransitioning, onClick, tab.id])

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleClick()
    }
  }, [handleClick])

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`
        relative flex flex-col items-center justify-center px-2 py-3 min-h-[60px]
        rounded-lg transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
        ${isActive 
          ? `${config.activeBg} ${config.activeColor} shadow-sm` 
          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
        }
        ${isTransitioning ? 'pointer-events-none' : ''}
      `}
      disabled={isTransitioning}
      aria-pressed={isActive}
      aria-label={`Switch to ${config.label} tab`}
      role="tab"
      tabIndex={isActive ? 0 : -1}
    >
      {/* Tab Icon */}
      <div className="relative">
        <Icon 
          size={20} 
          className={`
            transition-all duration-200 ease-in-out
            ${isActive 
              ? `${config.activeColor} transform scale-110` 
              : 'text-inherit group-hover:scale-105'
            }
          `}
          aria-hidden="true"
        />
        
        {/* Active Indicator Dot */}
        {isActive && (
          <div className={`
            absolute -top-1 -right-1 w-2 h-2 rounded-full
            ${config.activeColor.replace('text-', 'bg-')}
            animate-pulse
          `} />
        )}
      </div>

      {/* Tab Label */}
      <span className={`
        text-xs font-medium mt-1 transition-all duration-200
        ${isActive 
          ? `${config.activeColor} font-semibold` 
          : 'text-inherit'
        }
      `}>
        {config.label}
      </span>

      {/* Active Tab Underline */}
      {isActive && (
        <div className={`
          absolute bottom-0 left-1/2 transform -translate-x-1/2
          w-8 h-0.5 rounded-full
          ${config.activeColor.replace('text-', 'bg-')}
          transition-all duration-300 ease-in-out
        `} />
      )}
    </button>
  )
}

/**
 * Bottom Navigation Bar Component
 * @function BottomNavigation
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} Bottom navigation component
 * 
 * @example
 * <BottomNavigation />
 * 
 * @example
 * <BottomNavigation className="custom-styles" />
 */
const BottomNavigation = ({ className = '' }) => {
  const { 
    activeTab, 
    setActiveTab, 
    isTabActive, 
    isTransitioning, 
    tabs 
  } = useNavigation()

  /**
   * Handle tab button click
   * @function handleTabClick
   * @param {string} tabId - ID of clicked tab
   */
  const handleTabClick = useCallback((tabId) => {
    // Haptic feedback on supported devices
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
    
    setActiveTab(tabId)
  }, [setActiveTab])

  return (
    <nav 
      className={`
        fixed bottom-0 left-0 right-0 z-50
        bg-white border-t border-gray-200
        px-4 pb-safe-bottom
        ${className}
      `}
      role="tablist"
      aria-label="Main navigation"
    >
      {/* Tab Container */}
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => (
          <div key={tab.id} className="flex-1 max-w-[100px]">
            <TabButton
              tab={tab}
              isActive={isTabActive(tab.id)}
              isTransitioning={isTransitioning}
              onClick={handleTabClick}
            />
          </div>
        ))}
      </div>

      {/* iOS Safe Area Padding */}
      <div className="h-safe-bottom bg-white" />

      {/* Transition Overlay */}
      {isTransitioning && (
        <div className="absolute inset-0 bg-white bg-opacity-20 pointer-events-none" />
      )}
    </nav>
  )
}

export default BottomNavigation
