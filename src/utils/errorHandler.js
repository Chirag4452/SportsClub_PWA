/**
 * Comprehensive Error Handling Utility for SportClubApp
 * 
 * Provides standardized error handling, categorization, and user-friendly messaging
 * for different types of errors that can occur in the Appwrite integration.
 */

/**
 * Error types enumeration for consistent error categorization
 * @readonly
 * @enum {string}
 */
export const ErrorTypes = {
  NETWORK: 'NETWORK_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR', 
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  PERMISSION: 'PERMISSION_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  CONFLICT: 'CONFLICT_ERROR',
  RATE_LIMIT: 'RATE_LIMIT_ERROR',
  SERVER: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
  CONNECTION: 'CONNECTION_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR'
}

/**
 * Error severity levels for proper error handling and logging
 * @readonly
 * @enum {string}
 */
export const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
}

/**
 * User-friendly error messages mapped to error codes
 * @type {Object.<string, string>}
 */
const ERROR_MESSAGES = {
  // Authentication errors
  401: 'Invalid credentials. Please check your email and password.',
  'user_unauthorized': 'You are not authorized to access this resource.',
  'user_not_found': 'User account not found. Please contact an administrator.',
  'session_expired': 'Your session has expired. Please log in again.',
  
  // Permission errors
  403: 'Access denied. You don\'t have permission to perform this action.',
  'permission_denied': 'You don\'t have the required permissions for this operation.',
  'insufficient_permissions': 'Your account has insufficient permissions.',
  
  // Network errors
  'network_error': 'Network connection failed. Please check your internet connection.',
  'connection_timeout': 'Connection timed out. Please try again.',
  'service_unavailable': 'Service is currently unavailable. Please try again later.',
  503: 'Service temporarily unavailable. Please try again in a few minutes.',
  
  // Validation errors
  400: 'Invalid request. Please check your input and try again.',
  'validation_failed': 'Input validation failed. Please check your data.',
  'required_field_missing': 'Required information is missing. Please fill in all required fields.',
  
  // Resource errors
  404: 'The requested resource was not found.',
  409: 'Conflict detected. The resource already exists or has been modified.',
  'document_not_found': 'The requested record was not found.',
  'collection_not_found': 'Database collection not found.',
  
  // Rate limiting
  429: 'Too many requests. Please wait a moment before trying again.',
  'rate_limit_exceeded': 'Request limit exceeded. Please try again later.',
  
  // Server errors
  500: 'Internal server error. Our team has been notified.',
  502: 'Service gateway error. Please try again later.',
  'database_error': 'Database operation failed. Please try again.',
  
  // Default messages
  'default': 'An unexpected error occurred. Please try again.',
  'unknown': 'Something went wrong. Please contact support if the issue persists.'
}

/**
 * Maps Appwrite error codes to error types and severity
 * @type {Object.<string|number, {type: string, severity: string}>}
 */
const ERROR_CODE_MAPPING = {
  // Authentication errors
  401: { type: ErrorTypes.AUTHENTICATION, severity: ErrorSeverity.MEDIUM },
  'user_unauthorized': { type: ErrorTypes.AUTHENTICATION, severity: ErrorSeverity.MEDIUM },
  'user_not_found': { type: ErrorTypes.AUTHENTICATION, severity: ErrorSeverity.HIGH },
  'session_expired': { type: ErrorTypes.AUTHENTICATION, severity: ErrorSeverity.LOW },
  
  // Permission errors  
  403: { type: ErrorTypes.PERMISSION, severity: ErrorSeverity.MEDIUM },
  'permission_denied': { type: ErrorTypes.PERMISSION, severity: ErrorSeverity.MEDIUM },
  'insufficient_permissions': { type: ErrorTypes.AUTHORIZATION, severity: ErrorSeverity.MEDIUM },
  
  // Network errors
  'network_error': { type: ErrorTypes.NETWORK, severity: ErrorSeverity.HIGH },
  'connection_timeout': { type: ErrorTypes.TIMEOUT, severity: ErrorSeverity.MEDIUM },
  503: { type: ErrorTypes.NETWORK, severity: ErrorSeverity.HIGH },
  502: { type: ErrorTypes.NETWORK, severity: ErrorSeverity.HIGH },
  
  // Validation errors
  400: { type: ErrorTypes.VALIDATION, severity: ErrorSeverity.LOW },
  'validation_failed': { type: ErrorTypes.VALIDATION, severity: ErrorSeverity.LOW },
  'required_field_missing': { type: ErrorTypes.VALIDATION, severity: ErrorSeverity.LOW },
  
  // Resource errors
  404: { type: ErrorTypes.NOT_FOUND, severity: ErrorSeverity.LOW },
  409: { type: ErrorTypes.CONFLICT, severity: ErrorSeverity.MEDIUM },
  'document_not_found': { type: ErrorTypes.NOT_FOUND, severity: ErrorSeverity.LOW },
  
  // Rate limiting
  429: { type: ErrorTypes.RATE_LIMIT, severity: ErrorSeverity.MEDIUM },
  'rate_limit_exceeded': { type: ErrorTypes.RATE_LIMIT, severity: ErrorSeverity.MEDIUM },
  
  // Server errors
  500: { type: ErrorTypes.SERVER, severity: ErrorSeverity.CRITICAL },
  'database_error': { type: ErrorTypes.SERVER, severity: ErrorSeverity.HIGH }
}

/**
 * Enhanced error object structure for consistent error handling
 * @typedef {Object} EnhancedError
 * @property {boolean} success - Always false for errors
 * @property {string} type - Error type from ErrorTypes enum
 * @property {string} severity - Error severity from ErrorSeverity enum
 * @property {string} code - Original error code
 * @property {string} message - User-friendly error message
 * @property {string} details - Technical error details (for debugging)
 * @property {string} operation - Operation that caused the error
 * @property {string} timestamp - ISO timestamp when error occurred
 * @property {boolean} retryable - Whether the operation can be retried
 * @property {Object} [context] - Additional context about the error
 */

/**
 * Creates a standardized enhanced error object with proper categorization
 * @param {Error|Object} error - Original error object
 * @param {string} operation - Operation that caused the error
 * @param {Object} [context] - Additional context about the error
 * @returns {EnhancedError} Enhanced error object with categorization and user-friendly message
 */
export const createEnhancedError = (error, operation = 'Unknown operation', context = {}) => {
  // Extract error code and message
  const errorCode = error?.code || error?.status || 'unknown'
  const originalMessage = error?.message || 'Unknown error occurred'
  
  // Get error mapping or default
  const mapping = ERROR_CODE_MAPPING[errorCode] || {
    type: ErrorTypes.UNKNOWN,
    severity: ErrorSeverity.MEDIUM
  }
  
  // Get user-friendly message
  const userMessage = ERROR_MESSAGES[errorCode] || ERROR_MESSAGES['default']
  
  // Determine if error is retryable
  const retryable = isRetryableError(errorCode, mapping.type)
  
  // Create enhanced error object
  const enhancedError = {
    success: false,
    type: mapping.type,
    severity: mapping.severity,
    code: errorCode,
    message: userMessage,
    details: originalMessage,
    operation,
    timestamp: new Date().toISOString(),
    retryable,
    context
  }
  
  // Log error with appropriate level
  logError(enhancedError)
  
  return enhancedError
}

/**
 * Determines if an error is retryable based on error code and type
 * @param {string|number} errorCode - Error code
 * @param {string} errorType - Error type from ErrorTypes enum
 * @returns {boolean} Whether the error is retryable
 */
export const isRetryableError = (errorCode, errorType) => {
  // Network errors are generally retryable
  if (errorType === ErrorTypes.NETWORK || errorType === ErrorTypes.TIMEOUT) {
    return true
  }
  
  // Server errors (5xx) are retryable
  if (typeof errorCode === 'number' && errorCode >= 500 && errorCode < 600) {
    return true
  }
  
  // Rate limit errors are retryable after delay
  if (errorType === ErrorTypes.RATE_LIMIT) {
    return true
  }
  
  // Specific retryable codes
  const retryableCodes = ['service_unavailable', 'connection_timeout', 'database_error']
  if (retryableCodes.includes(errorCode)) {
    return true
  }
  
  return false
}

/**
 * Logs error with appropriate level based on severity
 * @param {EnhancedError} error - Enhanced error object
 */
const logError = (error) => {
  const logMessage = `[${error.operation}] ${error.type}: ${error.message}`
  const logDetails = {
    code: error.code,
    details: error.details,
    severity: error.severity,
    timestamp: error.timestamp,
    context: error.context
  }
  
  switch (error.severity) {
    case ErrorSeverity.CRITICAL:
      console.error('🚨', logMessage, logDetails)
      break
    case ErrorSeverity.HIGH:
      console.error('❌', logMessage, logDetails)
      break
    case ErrorSeverity.MEDIUM:
      console.warn('⚠️', logMessage, logDetails)
      break
    case ErrorSeverity.LOW:
      console.info('ℹ️', logMessage, logDetails)
      break
    default:
      console.log('📝', logMessage, logDetails)
  }
}

/**
 * Creates a success response object for consistent API responses
 * @param {*} data - Response data
 * @param {string} [message] - Success message
 * @param {Object} [meta] - Additional metadata
 * @returns {Object} Standardized success response
 */
export const createSuccessResponse = (data, message = 'Operation completed successfully', meta = {}) => {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    ...meta
  }
}

/**
 * Handles network errors specifically with retry logic
 * @param {Error} error - Network error
 * @param {string} operation - Operation that failed
 * @param {number} [retryCount=0] - Current retry attempt
 * @returns {EnhancedError} Enhanced network error
 */
export const handleNetworkError = (error, operation, retryCount = 0) => {
  const context = {
    retryCount,
    isOffline: !navigator.onLine,
    connectionType: navigator?.connection?.effectiveType || 'unknown'
  }
  
  // Customize message based on network state
  let customMessage = ERROR_MESSAGES['network_error']
  if (!navigator.onLine) {
    customMessage = 'You appear to be offline. Please check your internet connection.'
  } else if (retryCount > 0) {
    customMessage = `Connection failed (attempt ${retryCount + 1}). Retrying...`
  }
  
  const enhancedError = createEnhancedError(error, operation, context)
  enhancedError.message = customMessage
  
  return enhancedError
}

/**
 * Handles authentication errors with specific messaging
 * @param {Error} error - Authentication error
 * @param {string} operation - Operation that failed
 * @returns {EnhancedError} Enhanced authentication error
 */
export const handleAuthError = (error, operation) => {
  const context = {
    requiresReauth: true,
    suggestedAction: 'Please log in again'
  }
  
  const enhancedError = createEnhancedError(error, operation, context)
  
  // Special handling for expired sessions
  if (error?.code === 401 && operation.includes('session')) {
    enhancedError.message = 'Your session has expired. Please log in again.'
    enhancedError.context.autoRedirect = true
  }
  
  return enhancedError
}

/**
 * Handles permission errors with helpful messaging
 * @param {Error} error - Permission error
 * @param {string} operation - Operation that failed
 * @param {string} [resource] - Resource that was accessed
 * @returns {EnhancedError} Enhanced permission error
 */
export const handlePermissionError = (error, operation, resource) => {
  const context = {
    resource,
    suggestedAction: 'Contact an administrator for access',
    requiresPermission: true
  }
  
  const enhancedError = createEnhancedError(error, operation, context)
  
  if (resource) {
    enhancedError.message = `You don't have permission to access ${resource}. Contact an administrator for access.`
  }
  
  return enhancedError
}

/**
 * Handles validation errors with field-specific messaging
 * @param {Error} error - Validation error
 * @param {string} operation - Operation that failed
 * @param {Object} [fieldErrors] - Field-specific validation errors
 * @returns {EnhancedError} Enhanced validation error
 */
export const handleValidationError = (error, operation, fieldErrors = {}) => {
  const context = {
    fieldErrors,
    suggestedAction: 'Please correct the highlighted fields',
    isValidationError: true
  }
  
  const enhancedError = createEnhancedError(error, operation, context)
  
  // Create detailed message if field errors are provided
  if (Object.keys(fieldErrors).length > 0) {
    const fieldNames = Object.keys(fieldErrors).join(', ')
    enhancedError.message = `Please check the following fields: ${fieldNames}`
  }
  
  return enhancedError
}

/**
 * Generic error handler that routes to specific handlers based on error type
 * @param {Error} error - Original error
 * @param {string} operation - Operation that failed
 * @param {Object} [options] - Additional options for error handling
 * @returns {EnhancedError} Enhanced error object
 */
export const handleError = (error, operation, options = {}) => {
  const { retryCount, resource, fieldErrors } = options
  
  // Route to specific error handlers based on error code/type
  if (error?.code === 401 || error?.type === 'authentication') {
    return handleAuthError(error, operation)
  }
  
  if (error?.code === 403 || error?.type === 'permission') {
    return handlePermissionError(error, operation, resource)
  }
  
  if (error?.code === 400 || error?.type === 'validation') {
    return handleValidationError(error, operation, fieldErrors)
  }
  
  if (!navigator.onLine || error?.code === 503 || error?.name === 'NetworkError') {
    return handleNetworkError(error, operation, retryCount)
  }
  
  // Default error handling
  return createEnhancedError(error, operation, options)
}

/**
 * Utility to check if current error state should trigger a retry
 * @param {EnhancedError} error - Enhanced error object
 * @param {number} currentRetryCount - Current retry count
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {boolean} Whether to retry the operation
 */
export const shouldRetry = (error, currentRetryCount, maxRetries = 3) => {
  return error.retryable && currentRetryCount < maxRetries
}

/**
 * Calculates retry delay using exponential backoff
 * @param {number} retryCount - Current retry attempt
 * @param {number} [baseDelay=1000] - Base delay in milliseconds
 * @returns {number} Delay in milliseconds before next retry
 */
export const getRetryDelay = (retryCount, baseDelay = 1000) => {
  return Math.min(baseDelay * Math.pow(2, retryCount), 10000) // Cap at 10 seconds
}

export default {
  ErrorTypes,
  ErrorSeverity,
  createEnhancedError,
  createSuccessResponse,
  handleError,
  handleNetworkError,
  handleAuthError,
  handlePermissionError,
  handleValidationError,
  isRetryableError,
  shouldRetry,
  getRetryDelay
}
