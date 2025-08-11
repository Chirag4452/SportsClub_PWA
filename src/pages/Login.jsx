/**
 * Login Page Component
 * 
 * Full login page with responsive design, professional skating club styling,
 * and auto-redirect functionality for the SportClubApp PWA.
 * 
 * @component
 * @version 1.0.0
 */

import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import LoginForm from '../components/LoginForm.jsx'
import Button from '../components/Button.jsx'

/**
 * Login page background pattern component
 * @function BackgroundPattern
 * @returns {JSX.Element} Background pattern overlay
 */
const BackgroundPattern = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50" />
    <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-20 blur-3xl" />
    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100 rounded-full opacity-20 blur-3xl" />
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full opacity-10 blur-3xl" />
  </div>
)

/**
 * SportClub logo and branding component
 * @function BrandingSection
 * @returns {JSX.Element} Branding section component
 */
const BrandingSection = () => (
  <div className="text-center mb-8 lg:mb-12">
    {/* Logo Icon */}
    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4 shadow-lg">
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M13 10V3L4 14h7v7l9-11h-7z" 
        />
      </svg>
    </div>
    
    {/* App Title */}
    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2 font-display">
      SportClubApp
    </h1>
    
    {/* Subtitle */}
    <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
      Professional sports club management platform for instructors and administrators
    </p>
  </div>
)

/**
 * Welcome message component
 * @function WelcomeMessage
 * @param {Object} props - Component props
 * @param {string} [props.message] - Custom welcome message
 * @returns {JSX.Element} Welcome message component
 */
const WelcomeMessage = ({ message }) => {
  if (!message) return null
  
  return (
    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <p className="text-sm text-blue-800 text-center">
        {message}
      </p>
    </div>
  )
}

/**
 * Feature highlights component for login page
 * @function FeatureHighlights
 * @returns {JSX.Element} Feature highlights component
 */
const FeatureHighlights = () => {
  const features = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      text: 'Student Management'
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      text: 'Attendance Tracking'
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      text: 'Payment Management'
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      text: 'Class Scheduling'
    }
  ]
  
  return (
    <div className="hidden lg:block">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
        Powerful Features
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
            <div className="flex-shrink-0 text-blue-600">
              {feature.icon}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {feature.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * PWA installation prompt component
 * @function PWAInstallPrompt
 * @returns {JSX.Element|null} PWA install prompt or null
 */
const PWAInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])
  
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('PWA installation accepted')
      }
      
      setDeferredPrompt(null)
      setShowPrompt(false)
    }
  }
  
  if (!showPrompt) return null
  
  return (
    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 mb-1">
            Install SportClubApp
          </p>
          <p className="text-sm text-gray-600 mb-3">
            Add to your home screen for quick access and offline functionality.
          </p>
          <div className="flex space-x-3">
            <Button
              size="sm"
              onClick={handleInstallClick}
              className="text-xs"
            >
              Install App
            </Button>
            <button
              onClick={() => setShowPrompt(false)}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Main login page component
 * @function Login
 * @returns {JSX.Element} Login page component
 */
const Login = () => {
  const { isAuthenticated, isLoading, sessionChecked } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  
  // Extract state from navigation
  const from = location.state?.from || '/'
  const welcomeMessage = location.state?.message
  
  /**
   * Handle successful login
   * @function handleLoginSuccess
   * @param {Object} userData - User data from successful login
   */
  const handleLoginSuccess = (userData) => {
    console.log('✅ Login successful, redirecting to:', from)
    
    // Small delay to show success before redirecting
    setTimeout(() => {
      navigate(from, { replace: true })
    }, 100)
  }
  
  /**
   * Handle login error
   * @function handleLoginError
   * @param {Object} error - Login error object
   */
  const handleLoginError = (error) => {
    console.error('❌ Login failed:', error)
    // Error handling is managed by the LoginForm and AuthContext
  }
  
  // Show loading while checking authentication
  if (isLoading || !sessionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 mb-4">
            <svg className="animate-spin w-8 h-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <h2 className="text-lg font-medium text-gray-900">SportClubApp</h2>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }
  
  // Redirect if already authenticated
  if (isAuthenticated) {
    console.log('✅ User already authenticated, redirecting to:', from)
    return <Navigate to={from} replace />
  }
  
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Pattern */}
      <BackgroundPattern />
      
      {/* Main Login Container */}
      <div className="relative max-w-6xl w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Branding and Features (Hidden on mobile) */}
          <div className="hidden lg:block">
            <div className="max-w-lg">
              {/* Branding Section */}
              <div className="mb-12">
                <BrandingSection />
              </div>
              
              {/* Feature Highlights */}
              <FeatureHighlights />
              
              {/* Additional Info */}
              <div className="mt-8 p-6 bg-white rounded-xl shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Professional Sports Management
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Streamline your sports club operations with our comprehensive management platform. 
                  Track attendance, manage payments, schedule classes, and monitor student progress 
                  all in one place.
                </p>
              </div>
            </div>
          </div>
          
          {/* Right Column - Login Form */}
          <div className="w-full max-w-md mx-auto lg:max-w-lg">
            {/* Mobile Branding (Shown only on mobile) */}
            <div className="lg:hidden mb-8">
              <BrandingSection />
            </div>
            
            {/* Login Card */}
            <div className="bg-white py-8 px-6 shadow-xl rounded-xl sm:px-10">
              {/* Card Header */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                  Sign In
                </h2>
                <p className="text-center text-sm text-gray-600">
                  Access your instructor dashboard
                </p>
              </div>
              
              {/* Welcome Message */}
              <WelcomeMessage message={welcomeMessage} />
              
              {/* Login Form */}
              <LoginForm 
                onSuccess={handleLoginSuccess}
                onError={handleLoginError}
              />
              
              {/* PWA Install Prompt */}
              <PWAInstallPrompt />
            </div>
            
            {/* Footer Links */}
            <div className="mt-6 text-center">
              <div className="text-xs text-gray-500 space-x-4">
                <button className="hover:text-gray-700 transition-colors">
                  Privacy Policy
                </button>
                <span>•</span>
                <button className="hover:text-gray-700 transition-colors">
                  Terms of Service
                </button>
                <span>•</span>
                <button className="hover:text-gray-700 transition-colors">
                  Support
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-400">
                © 2024 SportClubApp. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
