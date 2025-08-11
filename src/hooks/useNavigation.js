/**
 * Custom Navigation Hook for SportClubApp
 * 
 * Manages tab navigation state with localStorage persistence,
 * smooth transitions, and mobile-optimized touch interactions.
 * 
 * @module useNavigation
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react'

/**
 * Available navigation tabs configuration
 * @constant
 */
export const NAVIGATION_TABS = {
  DASHBOARD: {
    id: 'dashboard',
    label: 'Dashboard', 
    path: '/dashboard',
    index: 0
  },
  ATTENDANCE: {
    id: 'attendance',
    label: 'Attendance',
    path: '/attendance', 
    index: 1
  },
  PAYMENTS: {
    id: 'payments',
    label: 'Payments',
    path: '/payments',
    index: 2
  }
}

/**
 * Get tabs as array for iteration
 * @constant
 */
export const TABS_ARRAY = Object.values(NAVIGATION_TABS)

/**
 * Default tab (Dashboard)
 * @constant
 */
export const DEFAULT_TAB = NAVIGATION_TABS.DASHBOARD

/**
 * Local storage key for persisting active tab
 * @constant
 */
const STORAGE_KEY = 'sportclub_active_tab'

/**
 * Custom hook for managing navigation state
 * @function useNavigation
 * @param {Object} [options] - Navigation options
 * @param {string} [options.defaultTab] - Default tab ID to show
 * @param {boolean} [options.persistTab=true] - Whether to persist tab in localStorage
 * @param {Function} [options.onTabChange] - Callback when tab changes
 * @returns {Object} Navigation state and actions
 * 
 * @example
 * const { activeTab, setActiveTab, isTabActive, getTabByIndex } = useNavigation()
 * 
 * @example
 * const nav = useNavigation({
 *   defaultTab: 'attendance',
 *   onTabChange: (tab) => console.log('Tab changed to:', tab.label)
 * })
 */
export const useNavigation = (options = {}) => {
  const {
    defaultTab = DEFAULT_TAB.id,
    persistTab = true,
    onTabChange
  } = options

  // State for active tab
  const [activeTab, setActiveTabState] = useState(defaultTab)
  const [isTransitioning, setIsTransitioning] = useState(false)

  /**
   * Get stored tab from localStorage
   * @function getStoredTab
   * @returns {string} Stored tab ID or default
   */
  const getStoredTab = useCallback(() => {
    if (!persistTab) return defaultTab

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored && TABS_ARRAY.find(tab => tab.id === stored)) {
        return stored
      }
    } catch (error) {
      console.warn('⚠️ Failed to read stored tab:', error.message)
    }
    
    return defaultTab
  }, [defaultTab, persistTab])

  /**
   * Store tab in localStorage
   * @function storeTab
   * @param {string} tabId - Tab ID to store
   */
  const storeTab = useCallback((tabId) => {
    if (!persistTab) return

    try {
      localStorage.setItem(STORAGE_KEY, tabId)
    } catch (error) {
      console.warn('⚠️ Failed to store tab:', error.message)
    }
  }, [persistTab])

  /**
   * Set active tab with validation and persistence
   * @function setActiveTab
   * @param {string} tabId - Tab ID to activate
   * @param {Object} [options] - Set tab options
   * @param {boolean} [options.smooth=true] - Whether to use smooth transition
   */
  const setActiveTab = useCallback((tabId, { smooth = true } = {}) => {
    // Validate tab exists
    const tab = TABS_ARRAY.find(t => t.id === tabId)
    if (!tab) {
      console.warn(`⚠️ Invalid tab ID: ${tabId}`)
      return
    }

    // Skip if already active
    if (activeTab === tabId) return

    console.log(`🔄 Switching tab from ${activeTab} to ${tabId}`)

    // Handle smooth transition
    if (smooth) {
      setIsTransitioning(true)
      
      // Slight delay for smooth transition
      setTimeout(() => {
        setActiveTabState(tabId)
        storeTab(tabId)
        
        // Call change callback
        if (onTabChange) {
          onTabChange(tab)
        }
        
        // End transition
        setTimeout(() => setIsTransitioning(false), 150)
      }, 75)
    } else {
      setActiveTabState(tabId)
      storeTab(tabId)
      
      if (onTabChange) {
        onTabChange(tab)
      }
    }
  }, [activeTab, storeTab, onTabChange])

  /**
   * Check if a tab is currently active
   * @function isTabActive
   * @param {string} tabId - Tab ID to check
   * @returns {boolean} Whether tab is active
   */
  const isTabActive = useCallback((tabId) => {
    return activeTab === tabId
  }, [activeTab])

  /**
   * Get tab object by ID
   * @function getTabById
   * @param {string} tabId - Tab ID
   * @returns {Object|null} Tab object or null if not found
   */
  const getTabById = useCallback((tabId) => {
    return TABS_ARRAY.find(tab => tab.id === tabId) || null
  }, [])

  /**
   * Get tab object by index
   * @function getTabByIndex
   * @param {number} index - Tab index
   * @returns {Object|null} Tab object or null if not found
   */
  const getTabByIndex = useCallback((index) => {
    return TABS_ARRAY.find(tab => tab.index === index) || null
  }, [])

  /**
   * Get next tab in sequence
   * @function getNextTab
   * @returns {Object} Next tab object
   */
  const getNextTab = useCallback(() => {
    const currentTab = getTabById(activeTab)
    const nextIndex = (currentTab.index + 1) % TABS_ARRAY.length
    return getTabByIndex(nextIndex)
  }, [activeTab, getTabById, getTabByIndex])

  /**
   * Get previous tab in sequence  
   * @function getPreviousTab
   * @returns {Object} Previous tab object
   */
  const getPreviousTab = useCallback(() => {
    const currentTab = getTabById(activeTab)
    const prevIndex = (currentTab.index - 1 + TABS_ARRAY.length) % TABS_ARRAY.length
    return getTabByIndex(prevIndex)
  }, [activeTab, getTabById, getTabByIndex])

  /**
   * Navigate to next tab
   * @function goToNextTab
   */
  const goToNextTab = useCallback(() => {
    const nextTab = getNextTab()
    setActiveTab(nextTab.id)
  }, [getNextTab, setActiveTab])

  /**
   * Navigate to previous tab
   * @function goToPreviousTab
   */
  const goToPreviousTab = useCallback(() => {
    const prevTab = getPreviousTab()
    setActiveTab(prevTab.id)
  }, [getPreviousTab, setActiveTab])

  /**
   * Reset to default tab
   * @function resetToDefault
   */
  const resetToDefault = useCallback(() => {
    setActiveTab(defaultTab, { smooth: false })
  }, [defaultTab, setActiveTab])

  // Initialize active tab from storage on mount
  useEffect(() => {
    const storedTab = getStoredTab()
    if (storedTab !== activeTab) {
      setActiveTabState(storedTab)
    }
  }, []) // Only run on mount

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Only handle if no input is focused
      if (document.activeElement?.tagName === 'INPUT' || 
          document.activeElement?.tagName === 'TEXTAREA') {
        return
      }

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          goToPreviousTab()
          break
        case 'ArrowRight':
          event.preventDefault()
          goToNextTab()
          break
        case '1':
          event.preventDefault()
          setActiveTab(NAVIGATION_TABS.DASHBOARD.id)
          break
        case '2':
          event.preventDefault()
          setActiveTab(NAVIGATION_TABS.ATTENDANCE.id)
          break
        case '3':
          event.preventDefault()
          setActiveTab(NAVIGATION_TABS.PAYMENTS.id)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [goToNextTab, goToPreviousTab, setActiveTab])

  // Get current active tab object
  const currentTab = getTabById(activeTab)

  return {
    // State
    activeTab,
    currentTab,
    isTransitioning,
    
    // Actions
    setActiveTab,
    isTabActive,
    
    // Navigation
    goToNextTab,
    goToPreviousTab,
    resetToDefault,
    
    // Getters
    getTabById,
    getTabByIndex,
    getNextTab,
    getPreviousTab,
    
    // Configuration
    tabs: TABS_ARRAY,
    tabsCount: TABS_ARRAY.length,
    
    // Utilities
    canGoNext: currentTab?.index < TABS_ARRAY.length - 1,
    canGoPrevious: currentTab?.index > 0
  }
}

export default useNavigation
