/**
 * Login Form Component
 * 
 * Clean, mobile-first login form with validation, error handling,
 * and iOS-optimized inputs for the SportClubApp PWA.
 * 
 * @component
 * @version 1.0.0
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import Button from './Button.jsx'
import { ErrorDisplay } from './AppwriteConnectionTester.jsx'

/**
 * Login form validation rules
 * @constant
 */
const VALIDATION_RULES = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    minLength: 3,
    maxLength: 100
  },
  password: {
    required: true,
    minLength: 6,
    maxLength: 128
  }
}

/**
 * Validate form field
 * @function validateField
 * @param {string} field - Field name to validate
 * @param {string} value - Field value
 * @param {Object} allValues - All form values for cross-field validation
 * @returns {string|null} Error message or null if valid
 */
const validateField = (field, value, allValues = {}) => {
  const rules = VALIDATION_RULES[field]
  if (!rules) return null
  
  // Required validation
  if (rules.required && (!value || value.trim() === '')) {
    return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`
  }
  
  // Skip other validations if field is empty (but not required)
  if (!value || value.trim() === '') return null
  
  const trimmedValue = value.trim()
  
  // Length validations
  if (rules.minLength && trimmedValue.length < rules.minLength) {
    return `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${rules.minLength} characters`
  }
  
  if (rules.maxLength && trimmedValue.length > rules.maxLength) {
    return `${field.charAt(0).toUpperCase() + field.slice(1)} must not exceed ${rules.maxLength} characters`
  }
  
  // Pattern validation (email)
  if (rules.pattern && !rules.pattern.test(trimmedValue)) {
    if (field === 'email') {
      return 'Please enter a valid email address'
    }
    return `${field.charAt(0).toUpperCase() + field.slice(1)} format is invalid`
  }
  
  return null
}

/**
 * Login form component with comprehensive validation and error handling
 * @function LoginForm
 * @param {Object} props - Component props
 * @param {Function} [props.onSuccess] - Callback function called on successful login
 * @param {Function} [props.onError] - Callback function called on login error
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} Login form component
 * 
 * @example
 * <LoginForm 
 *   onSuccess={(userData) => navigate('/dashboard')}
 *   onError={(error) => console.error('Login failed:', error)}
 * />
 */
const LoginForm = ({ onSuccess, onError, className = '' }) => {
  const { login, isLoading, error: authError, clearError } = useAuth()
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  
  // Form validation state
  const [fieldErrors, setFieldErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  // Refs for form elements
  const emailInputRef = useRef(null)
  const passwordInputRef = useRef(null)
  const formRef = useRef(null)
  
  /**
   * Handle input change with validation
   * @function handleInputChange
   * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
   */
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear auth error when user starts typing
    if (authError) {
      clearError()
    }
    
    // Validate field if it has been touched
    if (touched[name]) {
      const error = validateField(name, value, formData)
      setFieldErrors(prev => ({
        ...prev,
        [name]: error
      }))
    }
  }, [formData, touched, authError, clearError])
  
  /**
   * Handle input blur (field touched)
   * @function handleInputBlur
   * @param {React.FocusEvent<HTMLInputElement>} e - Input blur event
   */
  const handleInputBlur = useCallback((e) => {
    const { name, value } = e.target
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }))
    
    // Validate field
    const error = validateField(name, value, formData)
    setFieldErrors(prev => ({
      ...prev,
      [name]: error
    }))
  }, [formData])
  
  /**
   * Validate entire form
   * @function validateForm
   * @returns {boolean} Whether form is valid
   */
  const validateForm = useCallback(() => {
    const errors = {}
    let isValid = true
    
    // Validate all fields
    Object.keys(VALIDATION_RULES).forEach(field => {
      const error = validateField(field, formData[field], formData)
      if (error) {
        errors[field] = error
        isValid = false
      }
    })
    
    setFieldErrors(errors)
    
    // Mark all fields as touched
    setTouched({
      email: true,
      password: true
    })
    
    return isValid
  }, [formData])
  
  /**
   * Handle form submission
   * @async
   * @function handleSubmit
   * @param {React.FormEvent<HTMLFormElement>} e - Form submit event
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    
    // Prevent double submission
    if (isSubmitting || isLoading) return
    
    console.log('📝 Form submission started')
    
    // Validate form
    if (!validateForm()) {
      console.warn('⚠️ Form validation failed')
      // Focus first field with error
      const firstErrorField = Object.keys(fieldErrors)[0]
      if (firstErrorField === 'email' && emailInputRef.current) {
        emailInputRef.current.focus()
      } else if (firstErrorField === 'password' && passwordInputRef.current) {
        passwordInputRef.current.focus()
      }
      return
    }
    
    try {
      setIsSubmitting(true)
      clearError()
      
      console.log('🔐 Attempting login...')
      
      // Perform login
      const result = await login(formData.email.trim(), formData.password, {
        rememberMe
      })
      
      if (result.success) {
        console.log('✅ Login successful!')
        
        // Call success callback
        if (onSuccess) {
          onSuccess(result.data)
        }
        
        // Clear form on success
        setFormData({ email: '', password: '' })
        setFieldErrors({})
        setTouched({})
        
      } else {
        console.error('❌ Login failed:', result.message)
        
        // Focus email field for retry
        if (emailInputRef.current) {
          emailInputRef.current.focus()
        }
        
        // Call error callback
        if (onError) {
          onError(result)
        }
      }
      
    } catch (error) {
      console.error('💥 Login submission error:', error)
      
      if (onError) {
        onError(error)
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, fieldErrors, isSubmitting, isLoading, rememberMe, login, clearError, onSuccess, onError, validateForm])
  
  /**
   * Handle "Enter" key navigation between fields
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        if (e.target === emailInputRef.current && passwordInputRef.current) {
          e.preventDefault()
          passwordInputRef.current.focus()
        }
      }
    }
    
    const emailInput = emailInputRef.current
    if (emailInput) {
      emailInput.addEventListener('keydown', handleKeyDown)
    }
    
    return () => {
      if (emailInput) {
        emailInput.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [])
  
  // Focus email input on mount
  useEffect(() => {
    if (emailInputRef.current && !isLoading) {
      emailInputRef.current.focus()
    }
  }, [isLoading])
  
  const isFormValid = Object.values(fieldErrors).every(error => error === null) && 
                      formData.email.trim() && 
                      formData.password
  
  const isSubmitDisabled = !isFormValid || isSubmitting || isLoading
  
  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      {/* Auth Error Display */}
      {authError && (
        <div className="mb-6">
          <ErrorDisplay error={authError} onDismiss={clearError} />
        </div>
      )}
      
      {/* Login Form */}
      <form 
        ref={formRef}
        onSubmit={handleSubmit}
        className="space-y-6"
        noValidate
      >
        {/* Email Field */}
        <div>
          <label 
            htmlFor="email" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email Address
          </label>
          <div className="relative">
            <input
              ref={emailInputRef}
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              placeholder="instructor@sportsclub.com"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className={`
                w-full px-4 py-3 text-base border rounded-lg
                bg-white transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                disabled:bg-gray-50 disabled:cursor-not-allowed
                ${fieldErrors.email 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
              disabled={isSubmitting || isLoading}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
            />
            
            {/* Email Icon */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg 
                className={`w-5 h-5 ${fieldErrors.email ? 'text-red-400' : 'text-gray-400'}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" 
                />
              </svg>
            </div>
          </div>
          
          {/* Email Error Message */}
          {fieldErrors.email && (
            <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
              {fieldErrors.email}
            </p>
          )}
        </div>
        
        {/* Password Field */}
        <div>
          <label 
            htmlFor="password" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Password
          </label>
          <div className="relative">
            <input
              ref={passwordInputRef}
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className={`
                w-full px-4 py-3 pr-12 text-base border rounded-lg
                bg-white transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                disabled:bg-gray-50 disabled:cursor-not-allowed
                ${fieldErrors.password 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
              disabled={isSubmitting || isLoading}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? "password-error" : undefined}
            />
            
            {/* Show/Hide Password Button */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:text-gray-600 transition-colors"
              disabled={isSubmitting || isLoading}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          
          {/* Password Error Message */}
          {fieldErrors.password && (
            <p id="password-error" className="mt-1 text-sm text-red-600" role="alert">
              {fieldErrors.password}
            </p>
          )}
        </div>
        
        {/* Remember Me Checkbox */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isSubmitting || isLoading}
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>
          
          {/* Forgot Password Link - Placeholder */}
          <div className="text-sm">
            <button
              type="button"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              disabled={isSubmitting || isLoading}
              onClick={() => {
                // TODO: Implement forgot password functionality
                alert('Forgot password functionality to be implemented')
              }}
            >
              Forgot password?
            </button>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isSubmitting || isLoading}
            disabled={isSubmitDisabled}
            className="w-full"
          >
            {isSubmitting || isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </div>
        
        {/* Form Help Text */}
        <div className="text-center">
          <p className="text-xs text-gray-500 leading-relaxed">
            Sign in with your instructor credentials to access the SportClubApp dashboard
          </p>
        </div>
      </form>
    </div>
  )
}

export default LoginForm
