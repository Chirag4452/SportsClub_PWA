/**
 * Main Layout Component for PWA
 * 
 * Provides consistent layout structure with safe area support
 * for iOS devices and proper navigation for PWA usage.
 */
const Layout = ({ children, showHeader = true, title = 'SportClubApp' }) => {
  return (
    <div className="min-h-screen bg-gray-50 safe-top safe-bottom">
      {/* Header with iOS safe area consideration */}
      {showHeader && (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 safe-top">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo/Title */}
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <h1 className="text-xl font-bold text-blue-600 font-display">
                    {title}
                  </h1>
                </div>
              </div>
              
              {/* Navigation for larger screens */}
              <nav className="hidden md:flex space-x-8">
                <a href="#home" className="relative px-3 py-2 text-sm font-medium text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-500">
                  Home
                </a>
                <a href="#schedule" className="relative px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200">
                  Schedule
                </a>
                <a href="#members" className="relative px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200">
                  Members
                </a>
                <a href="#settings" className="relative px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200">
                  Settings
                </a>
              </nav>
              
              {/* Mobile menu button */}
              <div className="md:hidden">
                <button 
                  type="button" 
                  className="text-gray-500 hover:text-gray-600 p-2"
                  aria-label="Open menu"
                >
                  <svg 
                    className="h-6 w-6" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4 6h16M4 12h16M4 18h16" 
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>
      )}
      
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* Bottom Navigation for mobile PWA */}
      <nav className="md:hidden bg-white border-t border-gray-200 safe-bottom">
        <div className="grid grid-cols-4 py-2">
          <a 
            href="#home" 
            className="flex flex-col items-center py-2 px-3 text-blue-600 touch-target"
          >
            <svg className="h-6 w-6 mb-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
            </svg>
            <span className="text-xs font-medium">Home</span>
          </a>
          
          <a 
            href="#schedule" 
            className="flex flex-col items-center py-2 px-3 text-gray-500 touch-target"
          >
            <svg className="h-6 w-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <span className="text-xs font-medium">Schedule</span>
          </a>
          
          <a 
            href="#members" 
            className="flex flex-col items-center py-2 px-3 text-gray-500 touch-target"
          >
            <svg className="h-6 w-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <span className="text-xs font-medium">Members</span>
          </a>
          
          <a 
            href="#settings" 
            className="flex flex-col items-center py-2 px-3 text-gray-500 touch-target"
          >
            <svg className="h-6 w-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span className="text-xs font-medium">Settings</span>
          </a>
        </div>
      </nav>
    </div>
  )
}

export default Layout
