/**
 * Payments Page Component
 * 
 * Payment tracking and management tab with fee collection,
 * payment history, and financial reporting.
 * 
 * @component
 * @version 1.0.0
 */

import { useState, useCallback } from 'react'
import { CreditCard, DollarSign, TrendingUp, AlertCircle, Calendar } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import Card from '../components/Card.jsx'
import Button from '../components/Button.jsx'

/**
 * Payment stats component
 * @function PaymentStats
 * @returns {JSX.Element} Payment statistics cards
 */
const PaymentStats = () => {
  const stats = [
    {
      title: 'Monthly Revenue',
      value: '₹45,600',
      change: '+12%',
      changeType: 'increase',
      icon: TrendingUp,
      color: 'text-green-600 bg-green-50'
    },
    {
      title: 'Paid This Month',
      value: '38',
      change: '+5',
      changeType: 'increase',
      icon: CreditCard,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      title: 'Pending Payments',
      value: '₹18,500',
      change: '-₹2,300',
      changeType: 'decrease',
      icon: AlertCircle,
      color: 'text-orange-600 bg-orange-50'
    },
    {
      title: 'Collection Rate',
      value: '85%',
      change: '+3%',
      changeType: 'increase',
      icon: DollarSign,
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
 * Payment management actions component
 * @function PaymentActions
 * @returns {JSX.Element} Payment management action buttons
 */
const PaymentActions = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  
  const handleMonthChange = useCallback((month) => {
    setSelectedMonth(month)
  }, [])

  const handlePaymentAction = useCallback((action) => {
    console.log(`${action} for month: ${selectedMonth}`)
    // TODO: Implement actual payment actions
    alert(`${action} functionality to be implemented`)
  }, [selectedMonth])

  return (
    <Card title="Payment Management" subtitle="Manage fees and payments">
      {/* Month Selector */}
      <div className="mb-6">
        <label htmlFor="month-select" className="block text-sm font-medium text-gray-700 mb-2">
          Select Month
        </label>
        <input
          type="month"
          id="month-select"
          value={selectedMonth}
          onChange={(e) => handleMonthChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          variant="primary"
          onClick={() => handlePaymentAction('Record Payment')}
          className="w-full"
        >
          <CreditCard size={16} className="mr-2" />
          Record Payment
        </Button>
        
        <Button
          variant="outline"
          onClick={() => handlePaymentAction('Generate Invoice')}
          className="w-full"
        >
          <Calendar size={16} className="mr-2" />
          Generate Invoice
        </Button>
        
        <Button
          variant="secondary"
          onClick={() => handlePaymentAction('Payment Report')}
          className="w-full"
        >
          <TrendingUp size={16} className="mr-2" />
          Payment Report
        </Button>
        
        <Button
          variant="ghost"
          onClick={() => handlePaymentAction('Send Reminders')}
          className="w-full"
        >
          <AlertCircle size={16} className="mr-2" />
          Send Reminders
        </Button>
      </div>
    </Card>
  )
}

/**
 * Recent payment transactions component
 * @function RecentTransactions
 * @returns {JSX.Element} Recent payment transactions list
 */
const RecentTransactions = () => {
  const transactions = [
    { 
      student: 'John Doe', 
      amount: '₹1,200',
      status: 'paid',
      method: 'UPI',
      time: '2 hours ago',
      month: 'December 2024'
    },
    { 
      student: 'Jane Smith', 
      amount: '₹1,200',
      status: 'pending',
      method: 'Cash',
      time: '1 day ago',
      month: 'December 2024'
    },
    { 
      student: 'Mike Johnson', 
      amount: '₹1,200',
      status: 'paid',
      method: 'Card',
      time: '2 days ago',
      month: 'December 2024'
    },
    { 
      student: 'Sarah Wilson', 
      amount: '₹1,200',
      status: 'overdue',
      method: 'Bank Transfer',
      time: '3 days ago',
      month: 'November 2024'
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'paid':
        return 'Paid'
      case 'pending':
        return 'Pending'
      case 'overdue':
        return 'Overdue'
      default:
        return 'Unknown'
    }
  }

  return (
    <Card title="Recent Transactions" subtitle="Latest payment activity">
      <div className="space-y-4">
        {transactions.map((transaction, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-600">
                      {transaction.student.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {transaction.student}
                  </p>
                  <p className="text-xs text-gray-500">
                    {transaction.method} • {transaction.time}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {transaction.amount}
                </p>
                <p className="text-xs text-gray-500">
                  {transaction.month}
                </p>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                {getStatusText(transaction.status)}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <Button variant="ghost" size="sm" className="w-full">
          View All Transactions
        </Button>
      </div>
    </Card>
  )
}

/**
 * Pending payments summary component
 * @function PendingPayments
 * @returns {JSX.Element} Pending payments overview
 */
const PendingPayments = () => {
  const pendingPayments = [
    { student: 'Alex Brown', amount: '₹1,200', daysOverdue: 5 },
    { student: 'Emma Davis', amount: '₹2,400', daysOverdue: 12 },
    { student: 'Chris Wilson', amount: '₹1,200', daysOverdue: 2 },
    { student: 'Lisa Garcia', amount: '₹3,600', daysOverdue: 18 }
  ]

  const getPriorityColor = (days) => {
    if (days >= 15) return 'text-red-600 bg-red-50'
    if (days >= 7) return 'text-orange-600 bg-orange-50'
    return 'text-yellow-600 bg-yellow-50'
  }

  return (
    <Card title="Pending Payments" subtitle="Students with outstanding fees">
      <div className="space-y-3">
        {pendingPayments.map((payment, index) => (
          <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {payment.student}
              </p>
              <p className="text-xs text-gray-500">
                {payment.daysOverdue} days overdue
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-gray-900">
                {payment.amount}
              </span>
              <div className={`w-3 h-3 rounded-full ${getPriorityColor(payment.daysOverdue)}`} />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <Button variant="outline" size="sm" className="w-full">
          <AlertCircle size={14} className="mr-2" />
          Send Payment Reminders
        </Button>
      </div>
    </Card>
  )
}

/**
 * Main payments page component
 * @function Payments
 * @returns {JSX.Element} Payments page content
 */
const Payments = () => {
  const { instructor } = useAuth()

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Payments
        </h1>
        <p className="text-gray-600 mt-1">
          Manage student fees, track payments, and generate reports
        </p>
      </div>

      {/* Payment Stats */}
      <PaymentStats />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Payment Actions */}
        <div className="lg:col-span-2 space-y-6">
          <PaymentActions />
          <RecentTransactions />
        </div>

        {/* Right Column - Pending Payments */}
        <div>
          <PendingPayments />
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="mt-8">
        <Card className="border-purple-200 bg-purple-50">
          <div className="text-center py-8">
            <CreditCard className="mx-auto h-12 w-12 text-purple-600 mb-4" />
            <h3 className="text-lg font-medium text-purple-900 mb-2">
              Complete Payment System Coming Soon
            </h3>
            <p className="text-purple-700 max-w-md mx-auto">
              We're developing a full payment management system with automated invoicing, 
              payment gateway integration, and comprehensive financial reporting.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Payments
