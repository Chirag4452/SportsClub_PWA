/**
 * Schedule Button Component
 * 
 * Prominent call-to-action button for scheduling and canceling classes
 * with touch-optimized design and professional appearance.
 * 
 * @component
 * @version 1.0.0
 */

import { useState, useCallback } from 'react'
import { Calendar, Plus, X, Clock, Users } from 'lucide-react'
import Button from '../Button.jsx'

/**
 * Schedule button states
 * @constant
 */
const SCHEDULE_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
}

/**
 * Button icon component with animation
 * @function ButtonIcon
 * @param {Object} props - Component props
 * @param {string} props.state - Current button state
 * @param {string} props.mode - Button mode ('schedule' or 'cancel')
 * @returns {JSX.Element} Animated button icon
 */
const ButtonIcon = ({ state, mode }) => {
  const getIcon = () => {
    if (state === SCHEDULE_STATES.LOADING) {
      return <Clock className="animate-spin" size={20} />
    }
    
    if (state === SCHEDULE_STATES.SUCCESS) {
      return <Calendar size={20} />
    }
    
    if (mode === 'schedule') {
      return <Plus size={20} />
    }
    
    return <X size={20} />
  }

  return (
    <span className="transition-transform duration-200 group-hover:scale-110">
      {getIcon()}
    </span>
  )
}

/**
 * Quick stats display for scheduling context
 * @function ScheduleStats
 * @param {Object} props - Component props
 * @param {Object} props.stats - Schedule statistics
 * @returns {JSX.Element} Schedule statistics display
 */
const ScheduleStats = ({ stats }) => (
  <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 mt-3">
    <div className="flex items-center space-x-1">
      <Calendar size={14} />
      <span>{stats.scheduledToday} scheduled today</span>
    </div>
    <div className="flex items-center space-x-1">
      <Users size={14} />
      <span>{stats.totalStudents} students</span>
    </div>
  </div>
)

/**
 * Schedule options dropdown menu
 * @function ScheduleOptions
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether dropdown is open
 * @param {Function} props.onClose - Close dropdown handler
 * @param {Function} props.onSelect - Option select handler
 * @returns {JSX.Element} Schedule options dropdown
 */
const ScheduleOptions = ({ isOpen, onClose, onSelect }) => {
  const options = [
    {
      id: 'schedule-new',
      label: 'Schedule New Class',
      description: 'Create a new class session',
      icon: Plus,
      color: 'text-green-600'
    },
    {
      id: 'schedule-recurring',
      label: 'Schedule Recurring Classes',
      description: 'Set up multiple sessions',
      icon: Calendar,
      color: 'text-blue-600'
    },
    {
      id: 'cancel-class',
      label: 'Cancel Class',
      description: 'Cancel an existing session',
      icon: X,
      color: 'text-red-600'
    },
    {
      id: 'reschedule',
      label: 'Reschedule Class',
      description: 'Move to different time',
      icon: Clock,
      color: 'text-orange-600'
    }
  ]

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black bg-opacity-20"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Dropdown Menu */}
      <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {options.map((option, index) => (
          <button
            key={option.id}
            onClick={() => onSelect(option)}
            className={`
              w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors duration-150
              ${index !== options.length - 1 ? 'border-b border-gray-100' : ''}
              focus:outline-none focus:bg-blue-50
            `}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-1.5 rounded-lg bg-gray-100 ${option.color}`}>
                <option.icon size={16} />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 text-sm">
                  {option.label}
                </div>
                <div className="text-xs text-gray-500">
                  {option.description}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </>
  )
}

/**
 * Success message component
 * @function SuccessMessage
 * @param {Object} props - Component props
 * @param {string} props.message - Success message
 * @param {Function} props.onDismiss - Dismiss handler
 * @returns {JSX.Element} Success message display
 */
const SuccessMessage = ({ message, onDismiss }) => (
  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
    <div className="flex items-center justify-between">
      <p className="text-sm text-green-800 font-medium">
        {message}
      </p>
      <button
        onClick={onDismiss}
        className="text-green-600 hover:text-green-800 transition-colors"
        aria-label="Dismiss message"
      >
        <X size={14} />
      </button>
    </div>
  </div>
)

/**
 * Main schedule button component
 * @function ScheduleButton
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {Function} [props.onSchedule] - Schedule action handler
 * @param {Function} [props.onCancel] - Cancel action handler
 * @param {Object} [props.stats] - Schedule statistics
 * @param {boolean} [props.showDropdown=true] - Whether to show options dropdown
 * @param {boolean} [props.showStats=true] - Whether to show statistics
 * @returns {JSX.Element} Complete schedule button component
 * 
 * @example
 * <ScheduleButton 
 *   onSchedule={(option) => console.log('Schedule:', option)}
 *   onCancel={() => console.log('Cancel')}
 * />
 * 
 * @example
 * <ScheduleButton 
 *   className="custom-styles"
 *   showDropdown={false}
 *   stats={{ scheduledToday: 3, totalStudents: 25 }}
 * />
 */
const ScheduleButton = ({ 
  className = '',
  onSchedule,
  onCancel,
  stats = { scheduledToday: 2, totalStudents: 24 },
  showDropdown = true,
  showStats = true
}) => {
  // Component state
  const [state, setState] = useState(SCHEDULE_STATES.IDLE)
  const [showOptions, setShowOptions] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  /**
   * Handle button click
   * @function handleClick
   */
  const handleClick = useCallback(() => {
    if (showDropdown) {
      setShowOptions(!showOptions)
    } else {
      // Direct schedule action
      if (onSchedule) {
        setState(SCHEDULE_STATES.LOADING)
        onSchedule({ id: 'schedule-new', label: 'Schedule New Class' })
      }
    }
  }, [showDropdown, showOptions, onSchedule])

  /**
   * Handle option selection
   * @function handleOptionSelect
   * @param {Object} option - Selected option
   */
  const handleOptionSelect = useCallback(async (option) => {
    setShowOptions(false)
    setState(SCHEDULE_STATES.LOADING)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (option.id === 'cancel-class' && onCancel) {
        onCancel(option)
      } else if (onSchedule) {
        onSchedule(option)
      }

      setState(SCHEDULE_STATES.SUCCESS)
      setSuccessMessage(`${option.label} completed successfully!`)

      // Reset state after delay
      setTimeout(() => {
        setState(SCHEDULE_STATES.IDLE)
        setSuccessMessage('')
      }, 3000)

    } catch (error) {
      setState(SCHEDULE_STATES.ERROR)
      console.error('Schedule action failed:', error)

      // Reset state after delay
      setTimeout(() => {
        setState(SCHEDULE_STATES.IDLE)
      }, 2000)
    }
  }, [onSchedule, onCancel])

  /**
   * Close options dropdown
   * @function handleCloseOptions
   */
  const handleCloseOptions = useCallback(() => {
    setShowOptions(false)
  }, [])

  /**
   * Dismiss success message
   * @function handleDismissSuccess
   */
  const handleDismissSuccess = useCallback(() => {
    setSuccessMessage('')
    setState(SCHEDULE_STATES.IDLE)
  }, [])

  // Button text and variant based on state
  const getButtonConfig = () => {
    switch (state) {
      case SCHEDULE_STATES.LOADING:
        return {
          text: 'Processing...',
          variant: 'primary',
          disabled: true
        }
      case SCHEDULE_STATES.SUCCESS:
        return {
          text: 'Success!',
          variant: 'primary',
          disabled: false
        }
      case SCHEDULE_STATES.ERROR:
        return {
          text: 'Try Again',
          variant: 'danger',
          disabled: false
        }
      default:
        return {
          text: 'Schedule Classes',
          variant: 'primary',
          disabled: false
        }
    }
  }

  const buttonConfig = getButtonConfig()

  return (
    <div className={`relative ${className}`}>
      {/* Main Schedule Button */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Class Management
          </h3>
          <p className="text-gray-600 text-sm mb-6">
            Schedule new classes or manage existing ones
          </p>

          <Button
            variant={buttonConfig.variant}
            size="lg"
            onClick={handleClick}
            disabled={buttonConfig.disabled}
            loading={state === SCHEDULE_STATES.LOADING}
            className={`
              w-full group transition-all duration-200
              ${showDropdown ? 'shadow-lg hover:shadow-xl' : ''}
              ${state === SCHEDULE_STATES.SUCCESS ? 'bg-green-600 hover:bg-green-700' : ''}
            `}
          >
            <ButtonIcon state={state} mode="schedule" />
            <span className="ml-2">{buttonConfig.text}</span>
            {showDropdown && (
              <svg 
                className={`ml-2 w-4 h-4 transition-transform duration-200 ${
                  showOptions ? 'rotate-180' : ''
                }`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </Button>

          {/* Schedule Statistics */}
          {showStats && (
            <ScheduleStats stats={stats} />
          )}

          {/* Success Message */}
          {successMessage && (
            <SuccessMessage 
              message={successMessage}
              onDismiss={handleDismissSuccess}
            />
          )}
        </div>
      </div>

      {/* Options Dropdown */}
      {showDropdown && (
        <ScheduleOptions
          isOpen={showOptions}
          onClose={handleCloseOptions}
          onSelect={handleOptionSelect}
        />
      )}
    </div>
  )
}

export default ScheduleButton
