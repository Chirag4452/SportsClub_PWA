/**
 * Main App Component - SportClubApp PWA
 * 
 * Complete React application with authentication, routing, and PWA capabilities:
 * - React Router for navigation
 * - AuthProvider for authentication state management
 * - Protected routes for authenticated content
 * - Public routes for login
 * - PWA installation prompts and offline support
 * 
 * @component
 * @version 2.0.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'

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
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
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