/**
 * PWA Utility Functions
 * 
 * Collection of helper functions for Progressive Web App functionality
 * including installation, offline detection, and caching management.
 */

/**
 * Check if the app is running in standalone mode (installed PWA)
 * @returns {boolean} True if running as installed PWA
 */
export const isStandalone = () => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone ||
    document.referrer.includes('android-app://')
  )
}

/**
 * Check if the device is iOS
 * @returns {boolean} True if running on iOS
 */
export const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
}

/**
 * Check if the device is Android
 * @returns {boolean} True if running on Android
 */
export const isAndroid = () => {
  return /Android/.test(navigator.userAgent)
}

/**
 * Get PWA installation state
 * @returns {string} Installation state: 'installed', 'installable', 'not-supported'
 */
export const getPWAInstallState = () => {
  if (isStandalone()) {
    return 'installed'
  }
  
  // Check if beforeinstallprompt is supported
  if ('BeforeInstallPromptEvent' in window) {
    return 'installable'
  }
  
  // iOS Safari doesn't support beforeinstallprompt
  if (isIOS() && !isStandalone()) {
    return 'installable'
  }
  
  return 'not-supported'
}

/**
 * Show iOS installation instructions
 * @returns {string} Instructions for iOS users
 */
export const getIOSInstallInstructions = () => {
  return 'To install this app on your iPhone or iPad, tap the Share button and then "Add to Home Screen".'
}

/**
 * Register service worker for PWA functionality
 * @returns {Promise<ServiceWorkerRegistration|null>}
 */
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker registered successfully:', registration)
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        console.log('New service worker available')
      })
      
      return registration
    } catch (error) {
      console.error('Service Worker registration failed:', error)
      return null
    }
  }
  
  return null
}

/**
 * Update service worker and reload the app
 * @param {ServiceWorkerRegistration} registration 
 */
export const updateServiceWorker = async (registration) => {
  if (registration && registration.waiting) {
    // Send message to waiting service worker to skip waiting
    registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    
    // Wait for the new service worker to activate, then reload
    registration.addEventListener('controllerchange', () => {
      window.location.reload()
    })
  }
}

/**
 * Clear all caches (useful for development/debugging)
 * @returns {Promise<boolean>} Success status
 */
export const clearAllCaches = async () => {
  try {
    const cacheNames = await caches.keys()
    const deletePromises = cacheNames.map(cacheName => caches.delete(cacheName))
    await Promise.all(deletePromises)
    console.log('All caches cleared successfully')
    return true
  } catch (error) {
    console.error('Error clearing caches:', error)
    return false
  }
}

/**
 * Get network connection information
 * @returns {Object} Connection info
 */
export const getConnectionInfo = () => {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  
  return {
    online: navigator.onLine,
    effectiveType: connection?.effectiveType || 'unknown',
    downlink: connection?.downlink || 'unknown',
    rtt: connection?.rtt || 'unknown',
    saveData: connection?.saveData || false,
  }
}

/**
 * Add beforeinstallprompt event listener
 * @param {Function} callback Function to call when install prompt is available
 * @returns {Function} Cleanup function to remove the event listener
 */
export const addInstallPromptListener = (callback) => {
  const handleBeforeInstallPrompt = (event) => {
    event.preventDefault()
    callback(event)
  }
  
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  
  // Return cleanup function
  return () => {
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }
}

/**
 * Add app installed event listener
 * @param {Function} callback Function to call when app is installed
 * @returns {Function} Cleanup function to remove the event listener
 */
export const addAppInstalledListener = (callback) => {
  const handleAppInstalled = (event) => {
    callback(event)
  }
  
  window.addEventListener('appinstalled', handleAppInstalled)
  
  // Return cleanup function
  return () => {
    window.removeEventListener('appinstalled', handleAppInstalled)
  }
}

/**
 * Get safe area insets for iOS devices
 * @returns {Object} Safe area inset values
 */
export const getSafeAreaInsets = () => {
  const style = getComputedStyle(document.documentElement)
  
  return {
    top: style.getPropertyValue('--safe-area-inset-top') || '0px',
    right: style.getPropertyValue('--safe-area-inset-right') || '0px',
    bottom: style.getPropertyValue('--safe-area-inset-bottom') || '0px',
    left: style.getPropertyValue('--safe-area-inset-left') || '0px',
  }
}
