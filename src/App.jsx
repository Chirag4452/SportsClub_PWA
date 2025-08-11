/**
 * Main App Component - SportClubApp PWA
 * 
 * Complete React application with authentication, tab navigation, and PWA capabilities:
 * - React Router for authentication routing
 * - AuthProvider for authentication state management
 * - Tab-based navigation for main app content
 * - Protected routes for authenticated content
 * - Public routes for login
 * - PWA installation prompts and offline support
 * 
 * @component
 * @version 3.0.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import AppLayout from './components/Layout/AppLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Attendance from './pages/Attendance.jsx'
import Payments from './pages/Payments.jsx'
import { useNavigation, NAVIGATION_TABS } from './hooks/useNavigation.js'

/**
 * Main App Content Component with Tab Navigation
 * @function MainAppContent
 * @returns {JSX.Element} Main app content with tab-based navigation
 */
const MainAppContent = () => {
  const { activeTab } = useNavigation()

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case NAVIGATION_TABS.DASHBOARD.id:
        return <Dashboard />
      case NAVIGATION_TABS.ATTENDANCE.id:
        return <Attendance />
      case NAVIGATION_TABS.PAYMENTS.id:
        return <Payments />
      default:
        return <Dashboard />
    }
  }

  return (
    <AppLayout>
      {renderTabContent()}
    </AppLayout>
  )
}

/**
 * Main application component with routing and authentication
 * @function App
 * @returns {JSX.Element} Complete SportClubApp application
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes - All main app content uses tab navigation */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <MainAppContent />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/attendance" 
              element={
                <ProtectedRoute>
                  <MainAppContent />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/payments" 
              element={
                <ProtectedRoute>
                  <MainAppContent />
                </ProtectedRoute>
              } 
            />
            
            {/* Default Route - Redirect to Dashboard */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Navigate to="/dashboard" replace />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch All Route - Redirect to Dashboard */}
            <Route 
              path="*" 
              element={
                <ProtectedRoute>
                  <Navigate to="/dashboard" replace />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App