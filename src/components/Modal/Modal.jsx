/**
 * Reusable Modal Component
 * 
 * Professional modal component using React portals with smooth animations,
 * mobile-first design, and iOS-safe area handling for the SportClubApp PWA.
 * 
 * @component
 * @version 1.0.0
 */

import { useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

/**
 * Modal backdrop component with smooth animations
 * @function ModalBackdrop
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Close handler
 * @param {string} props.backdropClassName - Custom backdrop classes
 * @returns {JSX.Element} Modal backdrop
 */
const ModalBackdrop = ({ isOpen, onClose, backdropClassName = '' }) => (
  <div
    className={`
      fixed inset-0 bg-black transition-opacity duration-300 ease-in-out z-40
      ${isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'}
      ${backdropClassName}
    `}
    onClick={onClose}
    aria-hidden="true"
  />
)

/**
 * Modal content container with animations
 * @function ModalContent
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {string} props.size - Modal size
 * @param {string} props.position - Modal position
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} props.className - Custom classes
 * @returns {JSX.Element} Modal content container
 */
const ModalContent = ({ 
  isOpen, 
  size, 
  position, 
  children, 
  className = '' 
}) => {
  // Size classes mapping
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    full: 'max-w-full mx-4'
  }

  // Position classes mapping
  const positionClasses = {
    center: 'items-center justify-center',
    top: 'items-start justify-center pt-16',
    bottom: 'items-end justify-center pb-16',
    'center-mobile-bottom': 'items-center justify-center sm:items-end sm:justify-center sm:pb-16'
  }

  return (
    <div className={`
      fixed inset-0 flex transition-all duration-300 ease-in-out z-50 p-4
      ${positionClasses[position]}
      ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
    `}>
      <div className={`
        bg-white rounded-2xl shadow-2xl w-full transform transition-all duration-300 ease-in-out
        ${sizeClasses[size]}
        ${isOpen ? 'translate-y-0' : 'translate-y-4'}
        ${className}
        safe-top safe-bottom
      `}>
        {children}
      </div>
    </div>
  )
}

/**
 * Modal header with title and close button
 * @function ModalHeader
 * @param {Object} props - Component props
 * @param {string} props.title - Modal title
 * @param {string} props.subtitle - Optional subtitle
 * @param {Function} props.onClose - Close handler
 * @param {boolean} props.showCloseButton - Show close button
 * @param {React.ReactNode} props.children - Custom header content
 * @param {string} props.className - Custom classes
 * @returns {JSX.Element} Modal header
 */
const ModalHeader = ({ 
  title, 
  subtitle, 
  onClose, 
  showCloseButton = true,
  children,
  className = ''
}) => (
  <div className={`
    flex items-center justify-between p-6 border-b border-gray-200
    ${className}
  `}>
    <div className="flex-1">
      {children || (
        <div>
          {title && (
            <h2 className="text-xl font-semibold text-gray-900 font-display">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
    
    {showCloseButton && onClose && (
      <button
        onClick={onClose}
        className="
          ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 
          rounded-lg transition-colors duration-200 focus:outline-none 
          focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          touch-target
        "
        aria-label="Close modal"
      >
        <X size={20} />
      </button>
    )}
  </div>
)

/**
 * Modal body with scrollable content
 * @function ModalBody
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Body content
 * @param {string} props.className - Custom classes
 * @param {boolean} props.scrollable - Enable scrolling
 * @returns {JSX.Element} Modal body
 */
const ModalBody = ({ 
  children, 
  className = '',
  scrollable = true
}) => (
  <div className={`
    p-6
    ${scrollable ? 'max-h-96 overflow-y-auto' : ''}
    ${className}
  `}>
    {children}
  </div>
)

/**
 * Modal footer with actions
 * @function ModalFooter
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Footer content
 * @param {string} props.className - Custom classes
 * @param {string} props.align - Footer alignment
 * @returns {JSX.Element} Modal footer
 */
const ModalFooter = ({ 
  children, 
  className = '',
  align = 'right'
}) => {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center', 
    right: 'justify-end',
    between: 'justify-between',
    around: 'justify-around'
  }

  return (
    <div className={`
      flex ${alignClasses[align]} items-center space-x-3 
      p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl
      ${className}
    `}>
      {children}
    </div>
  )
}

/**
 * Main Modal component
 * @function Modal
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Function called when modal should close
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} [props.size='md'] - Modal size (sm, md, lg, xl, 2xl, 3xl, 4xl, full)
 * @param {string} [props.position='center'] - Modal position (center, top, bottom, center-mobile-bottom)
 * @param {boolean} [props.closeOnBackdrop=true] - Close when clicking backdrop
 * @param {boolean} [props.closeOnEscape=true] - Close when pressing Escape key
 * @param {string} [props.className] - Custom CSS classes for modal content
 * @param {string} [props.backdropClassName] - Custom CSS classes for backdrop
 * @param {Function} [props.onOpen] - Callback when modal opens
 * @param {Function} [props.onClosed] - Callback when modal fully closes
 * @param {boolean} [props.preventBodyScroll=true] - Prevent body scrolling when open
 * @param {string} [props.testId] - Test ID for testing
 * @returns {JSX.Element|null} Modal portal or null
 * 
 * @example
 * <Modal
 *   isOpen={isModalOpen}
 *   onClose={handleCloseModal}
 *   size="lg"
 *   position="center"
 * >
 *   <Modal.Header title="Modal Title" onClose={handleCloseModal} />
 *   <Modal.Body>
 *     <p>Modal content goes here</p>
 *   </Modal.Body>
 *   <Modal.Footer>
 *     <button onClick={handleCloseModal}>Close</button>
 *   </Modal.Footer>
 * </Modal>
 */
const Modal = ({
  isOpen = false,
  onClose,
  children,
  size = 'md',
  position = 'center',
  closeOnBackdrop = true,
  closeOnEscape = true,
  className = '',
  backdropClassName = '',
  onOpen,
  onClosed,
  preventBodyScroll = true,
  testId = 'modal'
}) => {
  const modalRef = useRef(null)
  const previousActiveElement = useRef(null)

  /**
   * Handle escape key press
   * @function handleEscapeKey
   * @param {KeyboardEvent} event - Keyboard event
   */
  const handleEscapeKey = useCallback((event) => {
    if (event.key === 'Escape' && closeOnEscape && onClose) {
      onClose()
    }
  }, [closeOnEscape, onClose])

  /**
   * Handle backdrop click
   * @function handleBackdropClick
   */
  const handleBackdropClick = useCallback(() => {
    if (closeOnBackdrop && onClose) {
      onClose()
    }
  }, [closeOnBackdrop, onClose])

  /**
   * Focus management for accessibility
   * @function manageFocus
   */
  const manageFocus = useCallback(() => {
    if (isOpen) {
      // Store currently focused element
      previousActiveElement.current = document.activeElement
      
      // Focus the modal
      if (modalRef.current) {
        const focusableElement = modalRef.current.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusableElement) {
          focusableElement.focus()
        } else {
          modalRef.current.focus()
        }
      }
      
      // Call onOpen callback
      if (onOpen) {
        onOpen()
      }
    } else {
      // Restore focus to previous element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus()
        previousActiveElement.current = null
      }
      
      // Call onClosed callback with delay for animation
      if (onClosed) {
        setTimeout(onClosed, 300)
      }
    }
  }, [isOpen, onOpen, onClosed])

  /**
   * Body scroll management
   * @function manageBodyScroll
   */
  const manageBodyScroll = useCallback(() => {
    if (!preventBodyScroll) return

    if (isOpen) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = 
        window.innerWidth - document.documentElement.clientWidth + 'px'
    } else {
      // Restore body scroll
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [isOpen, preventBodyScroll])

  // Effect for keyboard event listeners
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey)
      return () => document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isOpen, handleEscapeKey])

  // Effect for focus management
  useEffect(() => {
    manageFocus()
  }, [manageFocus])

  // Effect for body scroll management
  useEffect(() => {
    return manageBodyScroll()
  }, [manageBodyScroll])

  // Don't render if not open and no portal container
  if (!isOpen && !document.getElementById('modal-root')) {
    return null
  }

  // Create portal container if it doesn't exist
  let portalContainer = document.getElementById('modal-root')
  if (!portalContainer) {
    portalContainer = document.createElement('div')
    portalContainer.id = 'modal-root'
    document.body.appendChild(portalContainer)
  }

  const modalElement = (
    <div 
      data-testid={testId}
      role="dialog"
      aria-modal="true"
      aria-hidden={!isOpen}
    >
      <ModalBackdrop 
        isOpen={isOpen} 
        onClose={handleBackdropClick}
        backdropClassName={backdropClassName}
      />
      <ModalContent
        ref={modalRef}
        isOpen={isOpen}
        size={size}
        position={position}
        className={className}
        tabIndex={-1}
      >
        {children}
      </ModalContent>
    </div>
  )

  return createPortal(modalElement, portalContainer)
}

// Attach subcomponents to Modal for compound component pattern
Modal.Header = ModalHeader
Modal.Body = ModalBody
Modal.Footer = ModalFooter

export default Modal
