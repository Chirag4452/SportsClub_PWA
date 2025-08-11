/**
 * Dashboard Page Component
 * 
 * Main dashboard tab with greeting, schedule management, calendar,
 * and comprehensive overview of sports club operations.
 * 
 * @component  
 * @version 3.0.0
 */

import { useCallback, useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import Card from '../components/Card.jsx'
import Button from '../components/Button.jsx'
import AppwriteConnectionTester from '../components/AppwriteConnectionTester.jsx'
import GreetingSection from '../components/Dashboard/GreetingSection.jsx'
import ScheduleButton from '../components/Dashboard/ScheduleButton.jsx'
import Calendar from '../components/Dashboard/Calendar.jsx'
import SchedulingModal from '../components/Dashboard/SchedulingModal.jsx'
import { useScheduling } from '../hooks/useScheduling.js'
import { SCHEDULING_CONFIG } from '../services/schedulingService.js'

/**
 * Dashboard stats component
 * @function DashboardStats
 * @returns {JSX.Element} Dashboard statistics cards
 */
const DashboardStats = () => {
  const stats = [
    {
      title: 'Active Students',
      value: '124',
      change: '+12',
      changeType: 'increase',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      )
    },
    {
      title: 'Classes Today',
      value: '8',
      change: '+2',
      changeType: 'increase',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: 'Attendance Rate',
      value: '92%',
      change: '+5%',
      changeType: 'increase',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 00-2 2h2a2 2 0 002-2V5a2 2 0 00-2-2H2a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: 'Pending Payments',
      value: '₹18,500',
      change: '-₹2,300',
      changeType: 'decrease',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg mr-4">
              <div className="text-blue-600">
                {stat.icon}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
              <div className="flex items-center mt-1">
                <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                <span className={`ml-2 text-xs font-medium ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

/**
 * Quick actions component
 * @function QuickActions
 * @returns {JSX.Element} Quick action buttons
 */
const QuickActions = () => {
  const actions = [
    {
      title: 'Mark Attendance',
      description: 'Record student attendance for today\'s classes',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      action: () => alert('Navigate to attendance marking page')
    },
    {
      title: 'Add Student',
      description: 'Register a new student in the system',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      action: () => alert('Navigate to add student page')
    },
    {
      title: 'Schedule Classes',
      description: 'Plan and schedule upcoming classes',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      action: () => alert('Navigate to class scheduling page')
    },
    {
      title: 'Payment Records',
      description: 'Manage student payment records',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      action: () => alert('Navigate to payment management page')
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {actions.map((action, index) => (
        <Card key={index} className="p-4 cursor-pointer hover:shadow-lg transition-shadow duration-200" hover>
          <div className="flex items-start space-x-3" onClick={action.action}>
            <div className="flex-shrink-0 p-2 bg-blue-50 rounded-lg">
              <div className="text-blue-600">
                {action.icon}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900">{action.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{action.description}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

/**
 * Main dashboard component with integrated scheduling functionality
 * @function Dashboard
 * @returns {JSX.Element} Dashboard page content
 */
const Dashboard = () => {
  const { instructor, user } = useAuth()
  
  // Scheduling state
  const [isSchedulingModalOpen, setIsSchedulingModalOpen] = useState(false)
  const [schedulingDefaultValues, setSchedulingDefaultValues] = useState({})
  
  // Use scheduling hook for real-time data and operations
  const {
    scheduleClasses,
    cancelClasses,
    statistics,
    isScheduling,
    isCancelling,
    error: schedulingError,
    clearError
  } = useScheduling({
    enableRealtime: true,
    autoRefresh: true
  })

  /**
   * Open scheduling modal
   * @function openSchedulingModal
   * @param {Object} defaultValues - Default form values
   */
  const openSchedulingModal = useCallback((defaultValues = {}) => {
    setSchedulingDefaultValues(defaultValues)
    setIsSchedulingModalOpen(true)
    if (schedulingError) clearError()
  }, [schedulingError, clearError])

  /**
   * Close scheduling modal
   * @function closeSchedulingModal
   */
  const closeSchedulingModal = useCallback(() => {
    setIsSchedulingModalOpen(false)
    setSchedulingDefaultValues({})
  }, [])

  /**
   * Handle schedule action from schedule button
   * @function handleScheduleAction
   * @param {Object} option - Schedule option selected
   */
  const handleScheduleAction = useCallback((option) => {
    console.log('Schedule action:', option)
    
    const defaultValues = {
      action: SCHEDULING_CONFIG.ACTIONS.SCHEDULE
    }

    // Set default date range based on option
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 7)

    switch (option.id) {
      case 'schedule-new':
        defaultValues.startDate = tomorrow.toISOString().split('T')[0]
        defaultValues.endDate = tomorrow.toISOString().split('T')[0]
        break
      case 'schedule-recurring':
        defaultValues.startDate = tomorrow.toISOString().split('T')[0]
        defaultValues.endDate = nextWeek.toISOString().split('T')[0]
        defaultValues.excludeWeekends = true
        break
      default:
        break
    }

    openSchedulingModal(defaultValues)
  }, [openSchedulingModal])

  /**
   * Handle cancel action from schedule button
   * @function handleCancelAction
   * @param {Object} option - Cancel option selected
   */
  const handleCancelAction = useCallback((option) => {
    console.log('Cancel action:', option)
    
    const defaultValues = {
      action: SCHEDULING_CONFIG.ACTIONS.CANCEL,
      batches: ['morning', 'evening'] // Default to common batches
    }

    // Set default date range for cancellation
    const today = new Date()
    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 7)

    defaultValues.startDate = today.toISOString().split('T')[0]
    defaultValues.endDate = nextWeek.toISOString().split('T')[0]

    openSchedulingModal(defaultValues)
  }, [openSchedulingModal])

  /**
   * Handle calendar day click - open scheduling for that specific date
   * @function handleCalendarDayClick
   * @param {Object} dayData - Selected day data
   */
  const handleCalendarDayClick = useCallback((dayData) => {
    console.log('Calendar day clicked:', dayData)
    // Modal will be handled by Calendar component internally
  }, [])

  /**
   * Handle calendar schedule click - from day details modal
   * @function handleCalendarScheduleClick
   * @param {string} dateString - Date string (YYYY-MM-DD)
   */
  const handleCalendarScheduleClick = useCallback((dateString) => {
    console.log('Calendar schedule click for date:', dateString)
    
    const defaultValues = {
      action: SCHEDULING_CONFIG.ACTIONS.SCHEDULE,
      startDate: dateString,
      endDate: dateString,
      batches: [] // Let user choose
    }

    openSchedulingModal(defaultValues)
  }, [openSchedulingModal])

  /**
   * Handle scheduling modal submission
   * @function handleSchedulingSubmit
   * @param {Object} formData - Form submission data
   */
  const handleSchedulingSubmit = useCallback(async (formData) => {
    console.log('Scheduling submit:', formData)
    
    try {
      let result
      
      if (formData.action === SCHEDULING_CONFIG.ACTIONS.SCHEDULE) {
        result = await scheduleClasses({
          startDate: formData.startDate,
          endDate: formData.endDate,
          batches: formData.batches,
          excludeDays: formData.excludeDays || [],
          skipConflicts: formData.skipConflicts || false,
          notes: formData.notes || ''
        })
      } else if (formData.action === SCHEDULING_CONFIG.ACTIONS.CANCEL) {
        result = await cancelClasses({
          startDate: formData.startDate,
          endDate: formData.endDate,
          batches: formData.batches,
          reason: formData.reason || ''
        })
      }

      return result
      
    } catch (error) {
      console.error('Scheduling operation failed:', error)
      return {
        success: false,
        message: error.message || 'An unexpected error occurred'
      }
    }
  }, [scheduleClasses, cancelClasses])

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      {/* Greeting Section */}
      <div className="mb-8">
        <GreetingSection 
          showTime={true}
          showBusinessHours={true}
          showQuickStats={false}
        />
      </div>

      {/* Dashboard Stats */}
      <DashboardStats />

      {/* Primary Actions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Schedule Management with Real Statistics */}
        <ScheduleButton
          onSchedule={handleScheduleAction}
          onCancel={handleCancelAction}
          stats={{
            scheduledToday: statistics?.scheduled || 0,
            totalStudents: 28 // This would come from student statistics
          }}
          showDropdown={true}
          showStats={true}
        />

        {/* Calendar Overview with Scheduling Integration */}
        <Calendar
          onDayClick={handleCalendarDayClick}
          onScheduleClick={handleCalendarScheduleClick}
          showLegend={true}
          showModal={true}
          enableRealtime={true}
          autoRefresh={true}
          className="h-fit"
        />
      </div>

      {/* Secondary Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Quick Actions */}
        <div className="lg:col-span-2">
          <Card title="Quick Actions" subtitle="Common tasks and operations">
            <QuickActions />
          </Card>
        </div>

        {/* Right Column - Recent Activity */}
        <div>
          <Card title="Recent Activity" subtitle="Latest system activity">
            <div className="space-y-3">
              {[
                { action: 'Student registered', time: '2 hours ago', type: 'success' },
                { action: 'Class scheduled', time: '3 hours ago', type: 'info' },
                { action: 'Payment received', time: '5 hours ago', type: 'success' },
                { action: 'Attendance marked', time: '1 day ago', type: 'info' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* System Integration Section */}
      <div className="mt-8">
        <Card title="System Integration" subtitle="Test and monitor Appwrite connection">
          <AppwriteConnectionTester />
        </Card>
      </div>

      {/* Scheduling Modal */}
      <SchedulingModal
        isOpen={isSchedulingModalOpen}
        onClose={closeSchedulingModal}
        onSubmit={handleSchedulingSubmit}
        isLoading={isScheduling || isCancelling}
        defaultValues={schedulingDefaultValues}
      />
    </div>
  )
}

export default Dashboard
