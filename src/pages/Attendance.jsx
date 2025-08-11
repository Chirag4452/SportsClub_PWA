/**
 * Attendance Page Component
 * 
 * Attendance tracking and management tab with student check-in/out,
 * batch management, and attendance history.
 * 
 * @component
 * @version 1.0.0
 */

import { useState, useCallback } from 'react'
import { Calendar, Users, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import Card from '../components/Card.jsx'
import Button from '../components/Button.jsx'

/**
 * Attendance stats component
 * @function AttendanceStats
 * @returns {JSX.Element} Attendance statistics cards
 */
const AttendanceStats = () => {
  const stats = [
    {
      title: 'Present Today',
      value: '45',
      change: '+8',
      changeType: 'increase',
      icon: CheckCircle,
      color: 'text-green-600 bg-green-50'
    },
    {
      title: 'Absent Today',
      value: '12',
      change: '-3',
      changeType: 'decrease',
      icon: XCircle,
      color: 'text-red-600 bg-red-50'
    },
    {
      title: 'On Time',
      value: '38',
      change: '+5',
      changeType: 'increase',
      icon: Clock,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      title: 'Attendance Rate',
      value: '79%',
      change: '+5%',
      changeType: 'increase',
      icon: Users,
      color: 'text-purple-600 bg-purple-50'
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg mr-3 ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-500 truncate">{stat.title}</h3>
              <div className="flex items-center mt-1">
                <span className="text-xl font-bold text-gray-900">{stat.value}</span>
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
 * Quick attendance actions component
 * @function QuickActions
 * @returns {JSX.Element} Quick attendance action buttons
 */
const QuickActions = () => {
  const [selectedBatch, setSelectedBatch] = useState('morning-batch')
  
  const batches = [
    { id: 'morning-batch', name: 'Morning Batch', time: '6:00 AM - 8:00 AM' },
    { id: 'evening-batch', name: 'Evening Batch', time: '6:00 PM - 8:00 PM' },
    { id: 'weekend-batch', name: 'Weekend Batch', time: '9:00 AM - 11:00 AM' }
  ]

  const handleBatchChange = useCallback((batchId) => {
    setSelectedBatch(batchId)
  }, [])

  const handleQuickAction = useCallback((action) => {
    console.log(`${action} for batch: ${selectedBatch}`)
    // TODO: Implement actual attendance actions
    alert(`${action} functionality to be implemented`)
  }, [selectedBatch])

  return (
    <Card title="Quick Actions" subtitle="Manage attendance for your batches">
      {/* Batch Selector */}
      <div className="mb-6">
        <label htmlFor="batch-select" className="block text-sm font-medium text-gray-700 mb-2">
          Select Batch
        </label>
        <select
          id="batch-select"
          value={selectedBatch}
          onChange={(e) => handleBatchChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {batches.map((batch) => (
            <option key={batch.id} value={batch.id}>
              {batch.name} ({batch.time})
            </option>
          ))}
        </select>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          variant="primary"
          onClick={() => handleQuickAction('Mark Attendance')}
          className="w-full"
        >
          <CheckCircle size={16} className="mr-2" />
          Mark Attendance
        </Button>
        
        <Button
          variant="outline"
          onClick={() => handleQuickAction('View Report')}
          className="w-full"
        >
          <Calendar size={16} className="mr-2" />
          View Report
        </Button>
        
        <Button
          variant="secondary"
          onClick={() => handleQuickAction('Export Data')}
          className="w-full"
        >
          Export Data
        </Button>
        
        <Button
          variant="ghost"
          onClick={() => handleQuickAction('Settings')}
          className="w-full"
        >
          Settings
        </Button>
      </div>
    </Card>
  )
}

/**
 * Recent attendance activity component
 * @function RecentActivity
 * @returns {JSX.Element} Recent attendance activity list
 */
const RecentActivity = () => {
  const activities = [
    { 
      student: 'John Doe', 
      action: 'Marked Present', 
      time: '30 minutes ago', 
      batch: 'Morning Batch',
      status: 'present' 
    },
    { 
      student: 'Jane Smith', 
      action: 'Marked Absent', 
      time: '45 minutes ago', 
      batch: 'Morning Batch',
      status: 'absent' 
    },
    { 
      student: 'Mike Johnson', 
      action: 'Marked Present', 
      time: '1 hour ago', 
      batch: 'Morning Batch',
      status: 'present' 
    },
    { 
      student: 'Sarah Wilson', 
      action: 'Marked Late', 
      time: '2 hours ago', 
      batch: 'Morning Batch',
      status: 'late' 
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800'
      case 'absent':
        return 'bg-red-100 text-red-800'
      case 'late':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card title="Recent Activity" subtitle="Latest attendance updates">
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-600">
                      {activity.student.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.student}
                  </p>
                  <p className="text-xs text-gray-500">
                    {activity.batch} • {activity.time}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activity.status)}`}>
                {activity.action}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <Button variant="ghost" size="sm" className="w-full">
          View All Activity
        </Button>
      </div>
    </Card>
  )
}

/**
 * Main attendance page component
 * @function Attendance
 * @returns {JSX.Element} Attendance page content
 */
const Attendance = () => {
  const { instructor } = useAuth()

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Attendance
        </h1>
        <p className="text-gray-600 mt-1">
          Track and manage student attendance across all batches
        </p>
      </div>

      {/* Attendance Stats */}
      <AttendanceStats />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Quick Actions */}
        <div className="lg:col-span-2">
          <QuickActions />
        </div>

        {/* Right Column - Recent Activity */}
        <div>
          <RecentActivity />
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="mt-8">
        <Card className="border-blue-200 bg-blue-50">
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Full Attendance System Coming Soon
            </h3>
            <p className="text-blue-700 max-w-md mx-auto">
              We're building a comprehensive attendance tracking system with real-time 
              check-ins, batch management, and detailed reporting features.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Attendance
