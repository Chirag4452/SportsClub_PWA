/**
 * Calendar Component
 * 
 * Enhanced monthly calendar with real-time class scheduling data,
 * interactive scheduling, and comprehensive class management.
 * 
 * @component
 * @version 2.0.0
 */

import { useState, useCallback, useMemo, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Users, Clock, Plus } from 'lucide-react'
import { useScheduling } from '../../hooks/useScheduling.js'
import { SCHEDULING_CONFIG } from '../../services/schedulingService.js'

/**
 * Calendar utilities
 */
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]



/**
 * Get calendar data for a specific month with real class data
 * @function getCalendarData
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @param {Array} classesData - Real classes data from scheduling service
 * @returns {Array} Calendar data with days and weeks
 */
const getCalendarData = (year, month, classesData = []) => {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  // Group classes by date for quick lookup
  const classesByDate = {}
  classesData.forEach(classItem => {
    const dateKey = classItem.date
    if (!classesByDate[dateKey]) {
      classesByDate[dateKey] = []
    }
    classesByDate[dateKey].push(classItem)
  })
  
  const weeks = []
  const currentDate = new Date(startDate)
  
  while (currentDate <= lastDay || weeks.length < 6) {
    const week = []
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentDate)
      const isCurrentMonth = date.getMonth() === month
      const isToday = date.toDateString() === new Date().toDateString()
      const dateKey = date.toISOString().split('T')[0]
      const classes = classesByDate[dateKey] || []
      
      week.push({
        date,
        day: date.getDate(),
        isCurrentMonth,
        isToday,
        isPast: date < new Date() && !isToday,
        isFuture: date > new Date(),
        dateKey,
        classes,
        hasClasses: classes.length > 0
      })
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    weeks.push(week)
    
    if (weeks.length >= 6 && currentDate.getMonth() !== month) {
      break
    }
  }
  
  return weeks
}

/**
 * Calendar header with navigation
 * @function CalendarHeader
 * @param {Object} props - Component props
 * @param {number} props.year - Current year
 * @param {number} props.month - Current month
 * @param {Function} props.onPrevious - Previous month handler
 * @param {Function} props.onNext - Next month handler
 * @param {Function} props.onToday - Go to today handler
 * @returns {JSX.Element} Calendar header component
 */
const CalendarHeader = ({ year, month, onPrevious, onNext, onToday }) => (
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center space-x-4">
      <h3 className="text-xl font-semibold text-gray-900">
        {MONTHS[month]} {year}
      </h3>
      <button
        onClick={onToday}
        className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
      >
        Today
      </button>
    </div>
    
    <div className="flex items-center space-x-2">
      <button
        onClick={onPrevious}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Previous month"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={onNext}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Next month"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  </div>
)

/**
 * Days of week header
 * @function DaysHeader
 * @returns {JSX.Element} Days of week header
 */
const DaysHeader = () => (
  <div className="grid grid-cols-7 gap-1 mb-2">
    {DAYS_OF_WEEK.map((day) => (
      <div
        key={day}
        className="p-2 text-center text-sm font-medium text-gray-500 uppercase tracking-wide"
      >
        {day}
      </div>
    ))}
  </div>
)

/**
 * Enhanced class indicator component with real status mapping
 * @function ClassIndicator
 * @param {Object} props - Component props
 * @param {Array} props.classes - Classes for the day
 * @param {boolean} [props.showCount=true] - Whether to show class count
 * @returns {JSX.Element} Class indicator
 */
const ClassIndicator = ({ classes, showCount = true }) => {
  if (classes.length === 0) return null

  const getStatusColor = (status) => {
    switch (status) {
      case SCHEDULING_CONFIG.STATUS.SCHEDULED:
        return 'bg-blue-500'
      case SCHEDULING_CONFIG.STATUS.COMPLETED:
        return 'bg-green-500'
      case SCHEDULING_CONFIG.STATUS.CANCELLED:
        return 'bg-red-500'
      case SCHEDULING_CONFIG.STATUS.RESCHEDULED:
        return 'bg-orange-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getBatchColor = (batchName) => {
    const batch = Object.values(SCHEDULING_CONFIG.BATCHES).find(
      b => b.name === batchName
    )
    return batch ? `bg-${batch.color}-400` : 'bg-gray-400'
  }

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {classes.slice(0, 3).map((classItem, index) => (
        <div
          key={classItem.$id || index}
          className={`w-2 h-2 rounded-full ${getStatusColor(classItem.status)}`}
          title={`${classItem.time || 'N/A'} - ${classItem.batch_name} (Status: ${classItem.status})`}
        />
      ))}
      {classes.length > 3 && showCount && (
        <div className="text-xs text-gray-500 font-medium">
          +{classes.length - 3}
        </div>
      )}
    </div>
  )
}

/**
 * Calendar day cell component
 * @function CalendarDay
 * @param {Object} props - Component props
 * @param {Object} props.dayData - Day data object
 * @param {Function} props.onClick - Day click handler
 * @returns {JSX.Element} Calendar day cell
 */
const CalendarDay = ({ dayData, onClick }) => {
  const {
    day,
    isCurrentMonth,
    isToday,
    isPast,
    classes,
    hasClasses
  } = dayData

  return (
    <button
      onClick={() => onClick(dayData)}
      className={`
        relative p-2 h-20 border border-gray-100 hover:bg-gray-50 transition-colors
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset
        ${isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'}
        ${isToday ? 'bg-blue-50 border-blue-200' : ''}
        ${isPast && isCurrentMonth ? 'text-gray-500' : ''}
        ${hasClasses ? 'hover:bg-blue-50' : ''}
      `}
    >
      {/* Day Number */}
      <div className={`
        text-sm font-medium
        ${isToday ? 'text-blue-600 font-bold' : ''}
        ${!isCurrentMonth ? 'text-gray-400' : ''}
      `}>
        {day}
      </div>
      
      {/* Today Indicator */}
      {isToday && (
        <div className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full" />
      )}
      
      {/* Class Indicators */}
      <ClassIndicator classes={classes} />
      
      {/* Class Count */}
      {hasClasses && (
        <div className="absolute bottom-1 right-1 text-xs text-gray-600">
          {classes.length}
        </div>
      )}
    </button>
  )
}

/**
 * Calendar legend component
 * @function CalendarLegend
 * @returns {JSX.Element} Calendar legend
 */
const CalendarLegend = () => {
  const legendItems = [
    { color: 'bg-blue-500', label: 'Scheduled' },
    { color: 'bg-green-500', label: 'Completed' },
    { color: 'bg-red-500', label: 'Cancelled' }
  ]

  return (
    <div className="flex items-center justify-center space-x-6 mt-4 text-sm text-gray-600">
      {legendItems.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${item.color}`} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  )
}

/**
 * Enhanced day details modal with real class data and actions
 * @function DayDetailsModal
 * @param {Object} props - Component props
 * @param {Object|null} props.selectedDay - Selected day data
 * @param {Function} props.onClose - Close modal handler
 * @param {Function} [props.onScheduleClick] - Schedule button handler
 * @returns {JSX.Element|null} Day details modal
 */
const DayDetailsModal = ({ selectedDay, onClose, onScheduleClick }) => {
  if (!selectedDay) return null

  const { date, classes } = selectedDay
  const dateString = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const canSchedule = date >= new Date() // Can only schedule future dates

  const getStatusDisplay = (status) => {
    switch (status) {
      case SCHEDULING_CONFIG.STATUS.SCHEDULED:
        return { text: 'Scheduled', color: 'bg-blue-100 text-blue-800' }
      case SCHEDULING_CONFIG.STATUS.COMPLETED:
        return { text: 'Completed', color: 'bg-green-100 text-green-800' }
      case SCHEDULING_CONFIG.STATUS.CANCELLED:
        return { text: 'Cancelled', color: 'bg-red-100 text-red-800' }
      case SCHEDULING_CONFIG.STATUS.RESCHEDULED:
        return { text: 'Rescheduled', color: 'bg-orange-100 text-orange-800' }
      default:
        return { text: status || 'Unknown', color: 'bg-gray-100 text-gray-800' }
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {dateString}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {classes.length > 0 ? (
              <div className="space-y-3">
                {classes.map((classItem, index) => {
                  const statusDisplay = getStatusDisplay(classItem.status)
                  return (
                    <div key={classItem.$id || index} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-900">
                          {classItem.batch_name}
                        </div>
                        <div className={`px-2 py-1 text-xs rounded-full ${statusDisplay.color}`}>
                          {statusDisplay.text}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Clock size={14} />
                          <span>{classItem.time || 'Time TBD'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users size={14} />
                          <span>Max {classItem.max_students || 0} students</span>
                        </div>
                      </div>
                      {classItem.notes && (
                        <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                          <strong>Notes:</strong> {classItem.notes}
                        </div>
                      )}
                      {classItem.cancellation_reason && (
                        <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                          <strong>Cancelled:</strong> {classItem.cancellation_reason}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No classes scheduled for this day</p>
              </div>
            )}

            {/* Action Button */}
            {canSchedule && onScheduleClick && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    onScheduleClick(selectedDay.dateKey)
                    onClose()
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={16} />
                  <span>Schedule Classes</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

/**
 * Main enhanced calendar component with real-time scheduling data
 * @function Calendar
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {Function} [props.onDayClick] - Day click handler
 * @param {Function} [props.onScheduleClick] - Schedule click handler
 * @param {boolean} [props.showLegend=true] - Whether to show legend
 * @param {boolean} [props.showModal=true] - Whether to show day details modal
 * @param {boolean} [props.enableRealtime=true] - Enable real-time updates
 * @param {boolean} [props.autoRefresh=true] - Auto refresh on mount
 * @returns {JSX.Element} Complete calendar component
 * 
 * @example
 * <Calendar 
 *   onScheduleClick={(date) => openSchedulingModal(date)}
 *   enableRealtime={true}
 * />
 */
const Calendar = ({ 
  className = '',
  onDayClick,
  onScheduleClick,
  showLegend = true,
  showModal = true,
  enableRealtime = true,
  autoRefresh = true
}) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Use scheduling hook for real data
  const {
    classes,
    isLoadingClasses,
    error,
    refreshClasses,
    getClassesForDate
  } = useScheduling({
    enableRealtime,
    autoRefresh: false // We'll handle refresh manually for better control
  })

  // Generate calendar data with real classes
  const calendarWeeks = useMemo(() => {
    return getCalendarData(year, month, classes)
  }, [year, month, classes])

  // Load classes for current month when date changes
  useEffect(() => {
    if (autoRefresh) {
      const startDate = new Date(year, month, 1).toISOString().split('T')[0]
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0]
      refreshClasses(startDate, endDate)
    }
  }, [year, month, autoRefresh, refreshClasses])

  /**
   * Navigate to previous month
   * @function handlePreviousMonth
   */
  const handlePreviousMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }, [])

  /**
   * Navigate to next month
   * @function handleNextMonth
   */
  const handleNextMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }, [])

  /**
   * Navigate to today
   * @function handleToday
   */
  const handleToday = useCallback(() => {
    setCurrentDate(new Date())
  }, [])

  /**
   * Refresh calendar data
   * @function handleRefresh
   */
  const handleRefresh = useCallback(() => {
    const startDate = new Date(year, month, 1).toISOString().split('T')[0]
    const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0]
    refreshClasses(startDate, endDate)
  }, [year, month, refreshClasses])

  /**
   * Handle day click
   * @function handleDayClick
   * @param {Object} dayData - Day data
   */
  const handleDayClick = useCallback((dayData) => {
    if (onDayClick) {
      onDayClick(dayData)
    }
    
    if (showModal) {
      setSelectedDay(dayData)
    }
  }, [onDayClick, showModal])

  /**
   * Close day details modal
   * @function handleCloseModal
   */
  const handleCloseModal = useCallback(() => {
    setSelectedDay(null)
  }, [])

  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-200 ${className}`}>
      {/* Calendar Header with Loading State */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h3 className="text-xl font-semibold text-gray-900">
            {MONTHS[month]} {year}
          </h3>
          <button
            onClick={handleToday}
            className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Today
          </button>
          {isLoadingClasses && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span>Loading...</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh calendar"
            disabled={isLoadingClasses}
          >
            <svg className={`w-5 h-5 ${isLoadingClasses ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            onClick={handlePreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Next month"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error.message}</p>
          <button
            onClick={handleRefresh}
            className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Days of Week Header */}
      <DaysHeader />

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {calendarWeeks.flat().map((dayData, index) => (
          <CalendarDay
            key={index}
            dayData={dayData}
            onClick={handleDayClick}
          />
        ))}
      </div>

      {/* Legend */}
      {showLegend && <CalendarLegend />}

      {/* Day Details Modal */}
      {showModal && (
        <DayDetailsModal
          selectedDay={selectedDay}
          onClose={handleCloseModal}
          onScheduleClick={onScheduleClick}
        />
      )}
    </div>
  )
}

export default Calendar
