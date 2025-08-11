/**
 * Custom Greeting Hook for SportClubApp
 * 
 * Provides time-based greetings with timezone awareness,
 * date formatting, and dynamic updates.
 * 
 * @module useGreeting
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react'

/**
 * Greeting time periods configuration
 * @constant
 */
const GREETING_PERIODS = {
  MORNING: {
    start: 5,   // 5:00 AM
    end: 12,    // 12:00 PM (noon)
    greeting: 'Good morning',
    icon: '🌅',
    color: 'text-orange-600'
  },
  AFTERNOON: {
    start: 12,  // 12:00 PM
    end: 17,    // 5:00 PM
    greeting: 'Good afternoon',
    icon: '☀️',
    color: 'text-yellow-600'
  },
  EVENING: {
    start: 17,  // 5:00 PM
    end: 22,    // 10:00 PM
    greeting: 'Good evening',
    icon: '🌆',
    color: 'text-purple-600'
  },
  NIGHT: {
    start: 22,  // 10:00 PM
    end: 5,     // 5:00 AM (next day)
    greeting: 'Good night',
    icon: '🌙',
    color: 'text-blue-600'
  }
}

/**
 * Get current time-based greeting
 * @function getGreetingForTime
 * @param {number} hour - Current hour (0-23)
 * @returns {Object} Greeting object with text, icon, and color
 */
const getGreetingForTime = (hour) => {
  if (hour >= GREETING_PERIODS.MORNING.start && hour < GREETING_PERIODS.MORNING.end) {
    return GREETING_PERIODS.MORNING
  }
  
  if (hour >= GREETING_PERIODS.AFTERNOON.start && hour < GREETING_PERIODS.AFTERNOON.end) {
    return GREETING_PERIODS.AFTERNOON
  }
  
  if (hour >= GREETING_PERIODS.EVENING.start && hour < GREETING_PERIODS.EVENING.end) {
    return GREETING_PERIODS.EVENING
  }
  
  return GREETING_PERIODS.NIGHT
}

/**
 * Format date for display
 * @function formatDate
 * @param {Date} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {Object} Formatted date strings
 */
const formatDate = (date, options = {}) => {
  const { 
    includeTime = false,
    timeFormat = '12hour',
    dateStyle = 'full'
  } = options

  try {
    // Get timezone-aware date
    const now = date || new Date()
    
    // Format full date
    const fullDate = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    // Format short date
    const shortDate = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
    
    // Format time if requested
    let time = null
    if (includeTime) {
      time = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: timeFormat === '12hour'
      })
    }
    
    return {
      full: fullDate,
      short: shortDate,
      time,
      dayOfWeek: now.toLocaleDateString('en-US', { weekday: 'long' }),
      month: now.toLocaleDateString('en-US', { month: 'long' }),
      day: now.getDate(),
      year: now.getFullYear(),
      hour: now.getHours(),
      minute: now.getMinutes()
    }
  } catch (error) {
    console.warn('Date formatting error:', error)
    return {
      full: 'Date unavailable',
      short: 'N/A',
      time: null,
      dayOfWeek: 'Unknown',
      month: 'Unknown',
      day: 0,
      year: 0,
      hour: 0,
      minute: 0
    }
  }
}

/**
 * Custom hook for dynamic greetings and date information
 * @function useGreeting
 * @param {Object} [options] - Hook options
 * @param {boolean} [options.updateInterval=60000] - Update interval in milliseconds
 * @param {boolean} [options.includeTime=true] - Whether to include time in date formatting
 * @param {string} [options.timeFormat='12hour'] - Time format ('12hour' or '24hour')
 * @returns {Object} Greeting and date information
 * 
 * @example
 * const { greeting, dateInfo, isLoading } = useGreeting()
 * 
 * @example
 * const { greeting, dateInfo } = useGreeting({
 *   updateInterval: 30000,
 *   includeTime: false
 * })
 */
export const useGreeting = (options = {}) => {
  const {
    updateInterval = 60000, // Update every minute
    includeTime = true,
    timeFormat = '12hour'
  } = options

  // State for current time and greeting
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)

  /**
   * Update current time
   * @function updateTime
   */
  const updateTime = useCallback(() => {
    setCurrentTime(new Date())
    setIsLoading(false)
  }, [])

  /**
   * Get current greeting based on time
   * @function getCurrentGreeting
   * @returns {Object} Current greeting information
   */
  const getCurrentGreeting = useCallback(() => {
    const hour = currentTime.getHours()
    return getGreetingForTime(hour)
  }, [currentTime])

  /**
   * Get formatted date information
   * @function getCurrentDateInfo
   * @returns {Object} Formatted date information
   */
  const getCurrentDateInfo = useCallback(() => {
    return formatDate(currentTime, {
      includeTime,
      timeFormat
    })
  }, [currentTime, includeTime, timeFormat])

  // Update time on mount and set up interval
  useEffect(() => {
    updateTime()
    
    const interval = setInterval(updateTime, updateInterval)
    
    return () => clearInterval(interval)
  }, [updateTime, updateInterval])

  // Calculate derived values
  const greeting = getCurrentGreeting()
  const dateInfo = getCurrentDateInfo()

  // Additional utilities
  const isBusinessHours = currentTime.getHours() >= 9 && currentTime.getHours() < 18
  const isWeekend = currentTime.getDay() === 0 || currentTime.getDay() === 6
  const isToday = (date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  return {
    // Core greeting information
    greeting: {
      text: greeting.greeting,
      icon: greeting.icon,
      color: greeting.color,
      period: Object.keys(GREETING_PERIODS).find(
        key => GREETING_PERIODS[key] === greeting
      )
    },
    
    // Date and time information
    dateInfo,
    currentTime,
    
    // Utility information
    isBusinessHours,
    isWeekend,
    isToday,
    
    // State
    isLoading,
    
    // Actions
    updateTime,
    
    // Formatters
    formatCustomDate: (date, customOptions) => formatDate(date, customOptions),
    getGreetingForCustomTime: (hour) => getGreetingForTime(hour),
    
    // Constants
    GREETING_PERIODS
  }
}

export default useGreeting
