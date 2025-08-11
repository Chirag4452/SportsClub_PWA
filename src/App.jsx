import { useState, useEffect } from 'react'
import Layout from './components/Layout'
import Button from './components/Button'
import Card from './components/Card'

/**
 * Main App Component - SportClubApp PWA
 * 
 * Demonstrates the complete setup including:
 * - Tailwind CSS with custom theme
 * - PWA capabilities
 * - Responsive design
 * - Mobile-optimized components
 */
function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  
  // PWA installation handling
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }
    
    const handleAppInstalled = () => {
      console.log('SportClubApp was installed')
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
    }
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])
  
  // Network status handling
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  // Install PWA function
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      console.log(`User response to install prompt: ${outcome}`)
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    }
  }
  
  return (
    <Layout title="SportClubApp">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* PWA Status Bar */}
        <div className="mb-6">
          {!isOnline && (
            <div className="bg-yellow-100 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-4">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                You are currently offline. Some features may be limited.
              </div>
            </div>
          )}
          
          {showInstallPrompt && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                  <span>Install SportClubApp for a better experience</span>
                </div>
                <Button
                  size="sm"
                  onClick={handleInstallClick}
                  className="ml-4"
                >
                  Install
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 font-display">
            Welcome to SportClubApp
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A modern Progressive Web App for sports club management with beautiful design, 
            offline capabilities, and mobile optimization.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg">
              Get Started
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>
        
        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card 
            title="PWA Ready" 
            subtitle="Works offline and installs like a native app"
            hover={true}
            onClick={() => console.log('PWA card clicked')}
          >
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
              <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd"/>
              </svg>
            </div>
            <p className="text-gray-600">
              Install directly from your browser for quick access and offline functionality.
            </p>
          </Card>
          
          <Card 
            title="Mobile First" 
            subtitle="Optimized for all device sizes"
            hover={true}
            onClick={() => console.log('Mobile card clicked')}
          >
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-4">
              <svg className="h-6 w-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd"/>
              </svg>
            </div>
            <p className="text-gray-600">
              Responsive design with touch-optimized components and iOS safe area support.
            </p>
          </Card>
          
          <Card 
            title="Modern Stack" 
            subtitle="Built with React, Vite, and Tailwind CSS"
            hover={true}
            onClick={() => console.log('Tech card clicked')}
          >
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
              <svg className="h-6 w-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
              </svg>
            </div>
            <p className="text-gray-600">
              Lightning-fast development with hot reload, modern tooling, and best practices.
            </p>
          </Card>
        </div>
        
        {/* Button Showcase */}
        <Card title="Component Showcase" subtitle="Demonstrating various UI components">
          <div className="space-y-6">
            {/* Button Variants */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Button Variants</h4>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="primary" loading>Loading</Button>
                <Button variant="primary" disabled>Disabled</Button>
              </div>
            </div>
            
            {/* Button Sizes */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Button Sizes</h4>
              <div className="flex flex-wrap gap-3 items-center">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
              </div>
            </div>
            
            {/* Theme Colors */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Theme Colors</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {['blue', 'gray', 'purple', 'green', 'yellow', 'red'].map(color => (
                  <div key={color} className="text-center">
                    <div className={`w-12 h-12 rounded-lg bg-${color}-500 mx-auto mb-2`}></div>
                    <span className="text-xs text-gray-600 capitalize">{color}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  )
}

export default App
