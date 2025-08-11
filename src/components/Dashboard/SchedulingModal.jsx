/**
 * Scheduling Modal Component
 * 
 * Professional class scheduling modal with React Hook Form,
 * date range picker, batch selection, and comprehensive validation.
 * 
 * @component
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Calendar as CalendarIcon, Clock, Users, AlertCircle, CheckCircle, X } from 'lucide-react'
import Modal from '../Modal/Modal.jsx'
import Button from '../Button.jsx'
import { SCHEDULING_CONFIG } from '../../services/schedulingService.js'

/**
 * Date input component with validation
 * @function DateInput
 * @param {Object} props - Component props
 * @param {string} props.label - Input label
 * @param {Object} props.field - React Hook Form field object
 * @param {string} [props.error] - Error message
 * @param {string} [props.min] - Minimum date
 * @param {string} [props.max] - Maximum date
 * @returns {JSX.Element} Date input component
 */
const DateInput = ({ label, field, error, min, max, ...props }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <div className="relative">
      <input
        {...field}
        {...props}
        type="date"
        min={min}
        max={max}
        className={`
          w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          transition-colors duration-200 appearance-none bg-white
          ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
        `}
      />
      <CalendarIcon 
        className="absolute right-3 top-3 text-gray-400 pointer-events-none" 
        size={20} 
      />
    </div>
    {error && (
      <p className="text-sm text-red-600 flex items-center space-x-1">
        <AlertCircle size={14} />
        <span>{error}</span>
      </p>
    )}
  </div>
)

/**
 * Batch selection component with checkboxes
 * @function BatchSelector
 * @param {Object} props - Component props
 * @param {Object} props.field - React Hook Form field object
 * @param {string} [props.error] - Error message
 * @returns {JSX.Element} Batch selector component
 */
const BatchSelector = ({ field, error }) => {
  const { value = [], onChange } = field

  const handleBatchToggle = (batchId) => {
    const newValue = value.includes(batchId)
      ? value.filter(id => id !== batchId)
      : [...value, batchId]
    onChange(newValue)
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Select Batches
      </label>
      <div className="space-y-3">
        {Object.entries(SCHEDULING_CONFIG.BATCHES).map(([key, batch]) => (
          <label
            key={key}
            className={`
              flex items-center space-x-3 p-3 border rounded-lg cursor-pointer
              transition-colors duration-200 hover:bg-gray-50
              ${value.includes(key.toLowerCase()) ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}
            `}
          >
            <input
              type="checkbox"
              checked={value.includes(key.toLowerCase())}
              onChange={() => handleBatchToggle(key.toLowerCase())}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full bg-${batch.color}-500`} />
                <span className="font-medium text-gray-900">{batch.name}</span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <div className="flex items-center space-x-1">
                  <Clock size={12} />
                  <span>{batch.defaultTime}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users size={12} />
                  <span>Max {batch.maxStudents} students</span>
                </div>
              </div>
            </div>
          </label>
        ))}
      </div>
      {error && (
        <p className="text-sm text-red-600 flex items-center space-x-1">
          <AlertCircle size={14} />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}

/**
 * Action selector component with radio buttons
 * @function ActionSelector
 * @param {Object} props - Component props
 * @param {Object} props.field - React Hook Form field object
 * @param {string} [props.error] - Error message
 * @returns {JSX.Element} Action selector component
 */
const ActionSelector = ({ field, error }) => {
  const { value, onChange } = field

  const actions = [
    {
      id: SCHEDULING_CONFIG.ACTIONS.SCHEDULE,
      label: 'Schedule Classes',
      description: 'Create new class sessions',
      icon: CalendarIcon,
      color: 'green'
    },
    {
      id: SCHEDULING_CONFIG.ACTIONS.CANCEL,
      label: 'Cancel Classes',
      description: 'Cancel existing scheduled classes',
      icon: X,
      color: 'red'
    }
  ]

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Action
      </label>
      <div className="space-y-2">
        {actions.map((action) => (
          <label
            key={action.id}
            className={`
              flex items-center space-x-3 p-3 border rounded-lg cursor-pointer
              transition-colors duration-200 hover:bg-gray-50
              ${value === action.id ? `border-${action.color}-300 bg-${action.color}-50` : 'border-gray-200'}
            `}
          >
            <input
              type="radio"
              name="action"
              value={action.id}
              checked={value === action.id}
              onChange={(e) => onChange(e.target.value)}
              className={`w-4 h-4 border-gray-300 focus:ring-2 focus:ring-${action.color}-500 text-${action.color}-600`}
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <action.icon size={16} className={`text-${action.color}-600`} />
                <span className="font-medium text-gray-900">{action.label}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {action.description}
              </p>
            </div>
          </label>
        ))}
      </div>
      {error && (
        <p className="text-sm text-red-600 flex items-center space-x-1">
          <AlertCircle size={14} />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}

/**
 * Additional options component
 * @function AdditionalOptions
 * @param {Object} props - Component props
 * @param {Object} props.control - React Hook Form control
 * @param {Object} props.watch - React Hook Form watch
 * @returns {JSX.Element} Additional options component
 */
const AdditionalOptions = ({ control, watch }) => {
  const action = watch('action')

  return (
    <div className="space-y-4">
      {/* Exclude weekends option */}
      <Controller
        name="excludeWeekends"
        control={control}
        render={({ field }) => (
          <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
            <input
              type="checkbox"
              {...field}
              checked={field.value}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div>
              <span className="font-medium text-gray-900">Exclude Weekends</span>
              <p className="text-sm text-gray-600">Skip Saturday and Sunday</p>
            </div>
          </label>
        )}
      />

      {/* Skip conflicts option for scheduling */}
      {action === SCHEDULING_CONFIG.ACTIONS.SCHEDULE && (
        <Controller
          name="skipConflicts"
          control={control}
          render={({ field }) => (
            <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
              <input
                type="checkbox"
                {...field}
                checked={field.value}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <span className="font-medium text-gray-900">Skip Conflicts</span>
                <p className="text-sm text-gray-600">Automatically skip dates with existing classes</p>
              </div>
            </label>
          )}
        />
      )}

      {/* Notes/Reason field */}
      <Controller
        name={action === SCHEDULING_CONFIG.ACTIONS.CANCEL ? 'reason' : 'notes'}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {action === SCHEDULING_CONFIG.ACTIONS.CANCEL ? 'Cancellation Reason' : 'Notes (Optional)'}
            </label>
            <textarea
              {...field}
              rows={3}
              placeholder={
                action === SCHEDULING_CONFIG.ACTIONS.CANCEL 
                  ? 'Reason for cancellation...'
                  : 'Additional notes for these classes...'
              }
              className={`
                w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                transition-colors duration-200 resize-none
                ${error ? 'border-red-300' : 'border-gray-300'}
              `}
            />
            {error && (
              <p className="text-sm text-red-600">{error.message}</p>
            )}
          </div>
        )}
      />
    </div>
  )
}

/**
 * Scheduling summary component
 * @function SchedulingSummary
 * @param {Object} props - Component props
 * @param {Object} props.formData - Current form data
 * @returns {JSX.Element} Scheduling summary
 */
const SchedulingSummary = ({ formData }) => {
  const { startDate, endDate, batches, action, excludeWeekends } = formData

  if (!startDate || !endDate || !batches?.length || !action) {
    return null
  }

  // Calculate approximate number of classes
  const start = new Date(startDate)
  const end = new Date(endDate)
  const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
  
  let daysToSchedule = daysDiff
  if (excludeWeekends) {
    // Rough calculation excluding weekends
    daysToSchedule = Math.ceil(daysDiff * (5/7))
  }

  const totalClasses = daysToSchedule * batches.length

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h4 className="font-medium text-blue-900 mb-2">Summary</h4>
      <div className="space-y-1 text-sm text-blue-800">
        <div className="flex justify-between">
          <span>Date range:</span>
          <span>{daysDiff} days</span>
        </div>
        <div className="flex justify-between">
          <span>Selected batches:</span>
          <span>{batches.length}</span>
        </div>
        <div className="flex justify-between">
          <span>Exclude weekends:</span>
          <span>{excludeWeekends ? 'Yes' : 'No'}</span>
        </div>
        <div className="flex justify-between font-medium border-t border-blue-300 pt-2 mt-2">
          <span>Approximate classes:</span>
          <span>{totalClasses}</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Submission result component
 * @function SubmissionResult
 * @param {Object} props - Component props
 * @param {Object} props.result - Submission result
 * @param {Function} props.onClose - Close handler
 * @returns {JSX.Element} Submission result display
 */
const SubmissionResult = ({ result, onClose }) => {
  const isSuccess = result.success
  const Icon = isSuccess ? CheckCircle : AlertCircle

  return (
    <div className="text-center py-6">
      <Icon 
        className={`mx-auto mb-4 ${
          isSuccess ? 'text-green-600' : 'text-red-600'
        }`} 
        size={48} 
      />
      <h3 className={`text-lg font-medium mb-2 ${
        isSuccess ? 'text-green-900' : 'text-red-900'
      }`}>
        {isSuccess ? 'Success!' : 'Error'}
      </h3>
      <p className="text-gray-600 mb-4">
        {result.message}
      </p>
      
      {isSuccess && result.data && (
        <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mb-4">
          {result.data.scheduled && (
            <div>Scheduled: {result.data.scheduled} classes</div>
          )}
          {result.data.cancelled && (
            <div>Cancelled: {result.data.cancelled} classes</div>
          )}
          {result.data.errors > 0 && (
            <div className="text-orange-600">
              Errors: {result.data.errors} failed operations
            </div>
          )}
        </div>
      )}

      <Button
        onClick={onClose}
        variant="primary"
        className="px-6"
      >
        Close
      </Button>
    </div>
  )
}

/**
 * Main scheduling modal component
 * @function SchedulingModal
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Close handler
 * @param {Function} props.onSubmit - Submit handler
 * @param {boolean} [props.isLoading=false] - Loading state
 * @param {Object} [props.defaultValues] - Default form values
 * @returns {JSX.Element} Scheduling modal component
 * 
 * @example
 * <SchedulingModal
 *   isOpen={isModalOpen}
 *   onClose={handleCloseModal}
 *   onSubmit={handleScheduleSubmit}
 *   isLoading={isSubmitting}
 * />
 */
const SchedulingModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  defaultValues = {}
}) => {
  const [submissionResult, setSubmissionResult] = useState(null)
  const [step, setStep] = useState('form') // 'form' | 'result'

  // Calculate date constraints
  const today = new Date()
  const minDate = new Date(today.getTime() + 2 * 60 * 60 * 1000) // 2 hours from now
  const maxDate = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000) // 90 days from now

  const minDateString = minDate.toISOString().split('T')[0]
  const maxDateString = maxDate.toISOString().split('T')[0]

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    reset
  } = useForm({
    defaultValues: {
      startDate: '',
      endDate: '',
      batches: [],
      action: SCHEDULING_CONFIG.ACTIONS.SCHEDULE,
      excludeWeekends: true,
      skipConflicts: false,
      notes: '',
      reason: '',
      ...defaultValues
    },
    mode: 'onChange'
  })

  // Watch form values for summary
  const formData = watch()

  /**
   * Handle form submission
   * @function handleFormSubmit
   * @param {Object} data - Form data
   */
  const handleFormSubmit = useCallback(async (data) => {
    try {
      // Prepare submission data
      const submissionData = {
        startDate: data.startDate,
        endDate: data.endDate,
        batches: data.batches,
        action: data.action,
        excludeDays: data.excludeWeekends ? [0, 6] : [], // Exclude Sunday and Saturday
        skipConflicts: data.skipConflicts,
        notes: data.action === SCHEDULING_CONFIG.ACTIONS.SCHEDULE ? data.notes : undefined,
        reason: data.action === SCHEDULING_CONFIG.ACTIONS.CANCEL ? data.reason : undefined
      }

      const result = await onSubmit(submissionData)
      setSubmissionResult(result)
      setStep('result')
    } catch (error) {
      setSubmissionResult({
        success: false,
        message: error.message || 'An unexpected error occurred'
      })
      setStep('result')
    }
  }, [onSubmit])

  /**
   * Handle modal close
   * @function handleClose
   */
  const handleClose = useCallback(() => {
    if (!isLoading) {
      setStep('form')
      setSubmissionResult(null)
      reset()
      onClose()
    }
  }, [isLoading, onClose, reset])

  /**
   * Handle result close
   * @function handleResultClose
   */
  const handleResultClose = useCallback(() => {
    setStep('form')
    setSubmissionResult(null)
    reset()
    onClose()
  }, [onClose, reset])

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && step === 'form') {
      reset()
    }
  }, [isOpen, step, reset])

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      position="center"
      closeOnBackdrop={!isLoading}
      closeOnEscape={!isLoading}
    >
      {step === 'form' ? (
        <>
          <Modal.Header
            title="Class Scheduling"
            subtitle="Schedule or cancel classes for multiple dates and batches"
            onClose={handleClose}
            showCloseButton={!isLoading}
          />

          <Modal.Body scrollable={true}>
            <form id="scheduling-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
              {/* Action Selection */}
              <Controller
                name="action"
                control={control}
                rules={{ required: 'Please select an action' }}
                render={({ field, fieldState: { error } }) => (
                  <ActionSelector field={field} error={error?.message} />
                )}
              />

              {/* Date Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Controller
                  name="startDate"
                  control={control}
                  rules={{ 
                    required: 'Start date is required',
                    validate: (value) => {
                      const date = new Date(value)
                      if (date < minDate) {
                        return 'Start date must be at least 2 hours in the future'
                      }
                      return true
                    }
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <DateInput
                      label="Start Date"
                      field={field}
                      error={error?.message}
                      min={minDateString}
                      max={maxDateString}
                    />
                  )}
                />

                <Controller
                  name="endDate"
                  control={control}
                  rules={{ 
                    required: 'End date is required',
                    validate: (value) => {
                      const startDate = watch('startDate')
                      if (startDate && new Date(value) < new Date(startDate)) {
                        return 'End date must be after start date'
                      }
                      return true
                    }
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <DateInput
                      label="End Date"
                      field={field}
                      error={error?.message}
                      min={watch('startDate') || minDateString}
                      max={maxDateString}
                    />
                  )}
                />
              </div>

              {/* Batch Selection */}
              <Controller
                name="batches"
                control={control}
                rules={{
                  required: 'Please select at least one batch',
                  validate: (value) => {
                    if (!value || value.length === 0) {
                      return 'Please select at least one batch'
                    }
                    return true
                  }
                }}
                render={({ field, fieldState: { error } }) => (
                  <BatchSelector field={field} error={error?.message} />
                )}
              />

              {/* Additional Options */}
              <AdditionalOptions control={control} watch={watch} />

              {/* Summary */}
              <SchedulingSummary formData={formData} />
            </form>
          </Modal.Body>

          <Modal.Footer align="between">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="scheduling-form"
              variant="primary"
              loading={isLoading}
              disabled={!isValid || isLoading}
            >
              {isLoading 
                ? 'Processing...' 
                : formData.action === SCHEDULING_CONFIG.ACTIONS.CANCEL 
                  ? 'Cancel Classes' 
                  : 'Schedule Classes'}
            </Button>
          </Modal.Footer>
        </>
      ) : (
        <Modal.Body>
          <SubmissionResult
            result={submissionResult}
            onClose={handleResultClose}
          />
        </Modal.Body>
      )}
    </Modal>
  )
}

export default SchedulingModal
