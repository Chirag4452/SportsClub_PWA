/**
 * Reusable Card Component for Content Display
 * 
 * Optimized for mobile interfaces with proper touch targets
 * and responsive design for PWA usage.
 */
const Card = ({ 
  children, 
  title, 
  subtitle,
  hover = true, 
  padding = 'default',
  className = '',
  onClick,
  ...props 
}) => {
  // Base card classes with mobile optimization
  const baseClasses = 'bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-200'
  
  // Conditional hover effects
  const hoverClasses = hover 
    ? 'card-shadow hover:card-shadow-hover cursor-pointer active:scale-[0.98]' 
    : 'card-shadow'
    
  // Padding options for different use cases
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8'
  }
  
  // Combine classes
  const cardClasses = [
    baseClasses,
    hoverClasses,
    paddingClasses[padding] || paddingClasses.default,
    className
  ].join(' ')
  
  const CardContent = () => (
    <>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </>
  )
  
  // If onClick is provided, make it interactive
  if (onClick) {
    return (
      <div
        className={cardClasses}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onClick(e)
          }
        }}
        {...props}
      >
        <CardContent />
      </div>
    )
  }
  
  // Regular card without interaction
  return (
    <div className={cardClasses} {...props}>
      <CardContent />
    </div>
  )
}

export default Card
