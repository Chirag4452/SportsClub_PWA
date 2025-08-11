import { useState, useEffect, useCallback } from 'react'
import {
  isStandalone,
  getPWAInstallState,
  addInstallPromptListener,
  addAppInstalledListener,
  getConnectionInfo
} from '../utils/pwa'

/**
 * Custom React Hook for PWA functionality
 * 
 * Provides PWA-related state and functions including installation,
 * online status, and connection information.
 * 
 * @returns {Object} PWA state and functions
 */
const usePWA = () => {
  const [isInstalled, setIsInstalled] = useState(isStandalone())
  const [installPrompt, setInstallPrompt] = useState(null)
  const [canInstall, setCanInstall] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [connectionInfo, setConnectionInfo] = useState(getConnectionInfo())
  
  // Handle install prompt
  useEffect(() => {
    const cleanup = addInstallPromptListener((event) => {
      setInstallPrompt(event)
      setCanInstall(true)
    })
    
    return cleanup
  }, [])
  
  // Handle app installed
  useEffect(() => {
    const cleanup = addAppInstalledListener(() => {
      setIsInstalled(true)
      setCanInstall(false)
      setInstallPrompt(null)
    })
    
    return cleanup
  }, [])
  
  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setConnectionInfo(getConnectionInfo())
    }
    
    const handleOffline = () => {
      setIsOnline(false)
      setConnectionInfo(getConnectionInfo())
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  // Monitor connection changes
  useEffect(() => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    
    if (connection) {
      const handleConnectionChange = () => {
        setConnectionInfo(getConnectionInfo())
      }
      
      connection.addEventListener('change', handleConnectionChange)
      
      return () => {
        connection.removeEventListener('change', handleConnectionChange)
      }
    }
  }, [])
  
  // Install the PWA
  const install = useCallback(async () => {
    if (!installPrompt) {
      return { success: false, error: 'No install prompt available' }
    }
    
    try {
      const result = await installPrompt.prompt()
      const outcome = await installPrompt.userChoice
      
      if (outcome.outcome === 'accepted') {
        setCanInstall(false)
        setInstallPrompt(null)
        return { success: true, outcome: outcome.outcome }
      } else {
        return { success: false, outcome: outcome.outcome }
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }, [installPrompt])
  
  // Check if the device supports PWA installation
  const isSupported = useCallback(() => {
    const state = getPWAInstallState()
    return state === 'installed' || state === 'installable'
  }, [])
  
  // Get installation instructions for the current platform
  const getInstallInstructions = useCallback(() => {
    const userAgent = navigator.userAgent.toLowerCase()
    
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      return {
        platform: 'ios',
        instructions: [
          'Tap the Share button at the bottom of the screen',
          'Scroll down and tap "Add to Home Screen"',
          'Tap "Add" to install the app'
        ]
      }
    } else if (userAgent.includes('android')) {
      return {
        platform: 'android',
        instructions: [
          'Tap the menu button (⋮) in your browser',
          'Select "Add to Home screen" or "Install app"',
          'Tap "Add" to install the app'
        ]
      }
    } else {
      return {
        platform: 'desktop',
        instructions: [
          'Click the install button in the address bar',
          'Or use the browser menu to install',
          'The app will appear in your applications'
        ]
      }
    }
  }, [])
  
  return {
    // State
    isInstalled,
    canInstall,
    isOnline,
    connectionInfo,
    installPrompt,
    
    // Functions
    install,
    isSupported,
    getInstallInstructions,
    
    // Computed values
    installState: getPWAInstallState(),
    isStandalone: isStandalone(),
  }
}

export default usePWA
