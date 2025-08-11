import { forwardRef } from 'react'

/**
 * Reusable Button Component with Multiple Variants
 * 
 * Supports different styles and sizes optimized for touch interfaces
 * and PWA usage. Includes proper accessibility features.
 */
const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}, ref) => {
  // Base button classes with touch optimization
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  // Variant-specific classes using standard Tailwind classes
  const variantClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 active:bg-blue-700 shadow-md hover:shadow-lg',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 border border-gray-200 hover:border-gray-300',
    outline: 'border-2 border-blue-500 text-blue-600 hover:bg-blue-50 focus:ring-blue-500 active:bg-blue-100',
    ghost: 'text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 active:bg-red-700 shadow-md hover:shadow-lg',
  }
  
  // Size-specific classes optimized for mobile touch
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[40px]',
    md: 'px-4 py-2.5 text-sm min-h-[44px]',
    lg: 'px-6 py-3 text-base min-h-[48px]',
    xl: 'px-8 py-4 text-lg min-h-[52px]',
  }
  
  // Combine all classes
  const buttonClasses = [
    baseClasses,
    variantClasses[variant] || variantClasses.primary,
    sizeClasses[size] || sizeClasses.md,
    className
  ].join(' ')
  
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={buttonClasses}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  )
})

Button.displayName = 'Button'

export default Button
