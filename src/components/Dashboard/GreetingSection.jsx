/**
 * Greeting Section Component
 * 
 * Time-based greeting with instructor name, current date,
 * and loading skeleton states for the dashboard.
 * 
 * @component
 * @version 1.0.0
 */

import { useAuth } from '../../contexts/AuthContext.jsx'
import { useGreeting } from '../../hooks/useGreeting.js'

/**
 * Loading skeleton for greeting section
 * @function GreetingSkeleton
 * @returns {JSX.Element} Loading skeleton component
 */
const GreetingSkeleton = () => (
  <div className="animate-pulse">
    <div className="flex items-center space-x-3 mb-3">
      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
      <div className="h-8 bg-gray-300 rounded w-64"></div>
    </div>
    <div className="h-5 bg-gray-300 rounded w-48 mb-2"></div>
    <div className="h-4 bg-gray-300 rounded w-32"></div>
  </div>
)

/**
 * Greeting text component with animation
 * @function GreetingText
 * @param {Object} props - Component props
 * @param {Object} props.greeting - Greeting object from hook
 * @param {string} props.name - User's name
 * @returns {JSX.Element} Animated greeting text
 */
const GreetingText = ({ greeting, name }) => (
  <div className="flex items-center space-x-3 mb-3">
    {/* Greeting Icon */}
    <div className="text-3xl animate-pulse" role="img" aria-label={greeting.text}>
      {greeting.icon}
    </div>
    
    {/* Greeting Message */}
    <div>
      <h1 className={`text-2xl sm:text-3xl font-bold transition-colors duration-300 ${greeting.color}`}>
        {greeting.text}
        {name && (
          <span className="text-gray-900">
            , {name}!
          </span>
        )}
      </h1>
    </div>
  </div>
)

/**
 * Date and time display component
 * @function DateTimeDisplay
 * @param {Object} props - Component props
 * @param {Object} props.dateInfo - Date information from hook
 * @param {boolean} props.showTime - Whether to show current time
 * @returns {JSX.Element} Date and time display
 */
const DateTimeDisplay = ({ dateInfo, showTime = true }) => (
  <div className="space-y-1">
    {/* Full Date */}
    <p className="text-gray-700 text-lg font-medium">
      {dateInfo.full}
    </p>
    
    {/* Time Display */}
    {showTime && dateInfo.time && (
      <p className="text-gray-500 text-sm flex items-center space-x-2">
        <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span>Current time: {dateInfo.time}</span>
      </p>
    )}
  </div>
)

/**
 * Business hours indicator
 * @function BusinessHoursIndicator
 * @param {Object} props - Component props
 * @param {boolean} props.isBusinessHours - Whether it's currently business hours
 * @param {boolean} props.isWeekend - Whether it's weekend
 * @returns {JSX.Element} Business hours indicator
 */
const BusinessHoursIndicator = ({ isBusinessHours, isWeekend }) => {
  const getStatus = () => {
    if (isWeekend) {
      return {
        text: 'Weekend',
        color: 'text-blue-600 bg-blue-50',
        icon: '🏖️'
      }
    }
    
    if (isBusinessHours) {
      return {
        text: 'Business Hours',
        color: 'text-green-600 bg-green-50',
        icon: '🕐'
      }
    }
    
    return {
      text: 'After Hours',
      color: 'text-orange-600 bg-orange-50',
      icon: '🌙'
    }
  }

  const status = getStatus()

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
      <span role="img" aria-label={status.text}>
        {status.icon}
      </span>
      <span>{status.text}</span>
    </div>
  )
}

/**
 * Quick stats component
 * @function QuickStats
 * @param {Object} props - Component props
 * @param {Object} props.dateInfo - Date information
 * @returns {JSX.Element} Quick stats display
 */
const QuickStats = ({ dateInfo }) => {
  const stats = [
    {
      label: 'Day',
      value: dateInfo.day,
      suffix: getOrdinalSuffix(dateInfo.day)
    },
    {
      label: 'Month',
      value: dateInfo.month.slice(0, 3) // Short month name
    },
    {
      label: 'Year',
      value: dateInfo.year
    }
  ]

  return (
    <div className="hidden sm:flex items-center space-x-6 mt-4">
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <div className="text-lg font-bold text-gray-900">
            {stat.value}{stat.suffix}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Get ordinal suffix for day
 * @function getOrdinalSuffix
 * @param {number} day - Day of month
 * @returns {string} Ordinal suffix
 */
const getOrdinalSuffix = (day) => {
  if (day >= 11 && day <= 13) return 'th'
  
  switch (day % 10) {
    case 1: return 'st'
    case 2: return 'nd'
    case 3: return 'rd'
    default: return 'th'
  }
}

/**
 * Main greeting section component
 * @function GreetingSection
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.showTime=true] - Whether to show current time
 * @param {boolean} [props.showBusinessHours=true] - Whether to show business hours indicator
 * @param {boolean} [props.showQuickStats=false] - Whether to show quick date stats
 * @returns {JSX.Element} Complete greeting section
 * 
 * @example
 * <GreetingSection />
 * 
 * @example
 * <GreetingSection 
 *   className="custom-styles"
 *   showTime={false}
 *   showQuickStats={true}
 * />
 */
const GreetingSection = ({ 
  className = '',
  showTime = true,
  showBusinessHours = true,
  showQuickStats = false
}) => {
  const { user, instructor, isLoading: authLoading } = useAuth()
  const { 
    greeting, 
    dateInfo, 
    isBusinessHours, 
    isWeekend, 
    isLoading: greetingLoading 
  } = useGreeting()

  // Determine display name
  const displayName = instructor?.name || user?.name || null
  const isLoading = authLoading || greetingLoading

  // Show loading skeleton
  if (isLoading) {
    return (
      <section 
        className={`bg-white rounded-xl p-6 shadow-sm border border-gray-200 ${className}`}
        aria-label="Loading greeting"
      >
        <GreetingSkeleton />
      </section>
    )
  }

  return (
    <section 
      className={`bg-white rounded-xl p-6 shadow-sm border border-gray-200 ${className}`}
      aria-label="Dashboard greeting"
    >
      {/* Main Greeting */}
      <GreetingText greeting={greeting} name={displayName} />
      
      {/* Date and Time */}
      <DateTimeDisplay dateInfo={dateInfo} showTime={showTime} />
      
      {/* Business Hours Indicator */}
      {showBusinessHours && (
        <div className="mt-4">
          <BusinessHoursIndicator 
            isBusinessHours={isBusinessHours} 
            isWeekend={isWeekend} 
          />
        </div>
      )}
      
      {/* Quick Stats */}
      {showQuickStats && (
        <QuickStats dateInfo={dateInfo} />
      )}
      
      {/* Motivational Message */}
      <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
        <p className="text-sm text-gray-700 italic">
          {getMotivationalMessage(greeting.period, isWeekend)}
        </p>
      </div>
    </section>
  )
}

/**
 * Get motivational message based on time period
 * @function getMotivationalMessage
 * @param {string} period - Time period (MORNING, AFTERNOON, etc.)
 * @param {boolean} isWeekend - Whether it's weekend
 * @returns {string} Motivational message
 */
const getMotivationalMessage = (period, isWeekend) => {
  if (isWeekend) {
    return "Hope you're having a restful weekend! Your dedication to the sports club is appreciated."
  }

  const messages = {
    MORNING: "Ready to start another great day of coaching? Your students are lucky to have you!",
    AFTERNOON: "Hope your day is going well! Keep up the excellent work with your students.",
    EVENING: "Wrapping up another productive day? Thanks for your dedication to the sports club.",
    NIGHT: "Working late? Don't forget to rest - tomorrow's another opportunity to inspire!"
  }

  return messages[period] || "Keep up the amazing work with your sports club!"
}

export default GreetingSection
