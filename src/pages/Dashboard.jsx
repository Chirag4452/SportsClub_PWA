/**
 * Dashboard Page Component
 * 
 * Main dashboard page for authenticated instructors showing
 * an overview of sports club operations and quick actions.
 * 
 * @component  
 * @version 1.0.0
 */

import { useAuth } from '../contexts/AuthContext.jsx'
import Layout from '../components/Layout.jsx'
import Card from '../components/Card.jsx'
import Button from '../components/Button.jsx'
import AppwriteConnectionTester from '../components/AppwriteConnectionTester.jsx'

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
 * Main dashboard component
 * @function Dashboard
 * @returns {JSX.Element} Dashboard page
 */
const Dashboard = () => {
  const { user, instructor, logout } = useAuth()

  const handleLogout = async () => {
    const result = await logout()
    if (result.success) {
      // Redirect will be handled by the AuthContext and routing
      console.log('Logged out successfully')
    }
  }

  return (
    <Layout title="SportClubApp">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {instructor?.name || user?.name || 'Instructor'}!
              </h1>
              <p className="text-gray-600 mt-1">
                Here's what's happening in your sports club today.
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button variant="outline" onClick={handleLogout}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Dashboard Stats */}
        <DashboardStats />

        {/* Main Content Grid */}
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

        {/* Appwrite Integration Tester */}
        <div className="mt-8">
          <Card title="System Integration" subtitle="Test and monitor Appwrite connection">
            <AppwriteConnectionTester />
          </Card>
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard
