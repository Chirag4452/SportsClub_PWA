/**
 * Database Service for SportClubApp
 * Essential database operations with enhanced error handling
 */

import { 
  databases, 
  APPWRITE_CONFIG, 
  Query, 
  ID,
  retryOperation 
} from './appwrite.js'
import { 
  handleError, 
  handleValidationError, 
  createSuccessResponse
} from '../utils/errorHandler.js'

const DATABASE_ID = APPWRITE_CONFIG.databaseId
const COLLECTIONS = APPWRITE_CONFIG.collections

// Utility functions
const sanitizeString = (input, maxLength = 255) => {
  if (typeof input !== 'string') return String(input || '')
  return input.trim().slice(0, maxLength)
}

const validateRequiredFields = (data, requiredFields, operation) => {
  const missingFields = requiredFields.filter(field => !data[field])
  if (missingFields.length > 0) {
    const fieldErrors = {}
    missingFields.forEach(field => {
      fieldErrors[field] = `${field} is required`
    })
    throw handleValidationError(new Error('Required fields missing'), operation, fieldErrors)
  }
}

/**
 * Log an activity/action in the system
 */
export const logActivity = async (action, instructorId = null, details = {}) => {
  try {
    if (!action) return createSuccessResponse(null, 'No action to log')
    
    const activityData = {
      action: sanitizeString(action, 100),
      instructor_id: instructorId,
      details: JSON.stringify(details),
      timestamp: new Date().toISOString()
    }
    
    const activity = await databases.createDocument(DATABASE_ID, COLLECTIONS.activity_log, ID.unique(), activityData)
    return createSuccessResponse(activity, 'Activity logged successfully')
    
  } catch (error) {
    console.warn('⚠️ Failed to log activity:', error.message)
    return createSuccessResponse(null, 'Activity logging failed but operation continued')
  }
}

/**
 * Get recent activity logs
 */
export const getRecentActivity = async (limit = 50) => {
  try {
    const response = await retryOperation(
      () => databases.listDocuments(DATABASE_ID, COLLECTIONS.activity_log, [
        Query.limit(Math.min(limit, 100)),
        Query.orderDesc('timestamp')
      ]),
      'getRecentActivity'
    )
    
    const activities = response.documents.map(activity => ({
      ...activity,
      details: (() => {
        try {
          return activity.details ? JSON.parse(activity.details) : {}
        } catch {
          return { raw: activity.details }
        }
      })()
    }))
    
    return createSuccessResponse({ activities, total: response.total }, 'Recent activities retrieved')
    
  } catch (error) {
    return handleError(error, 'getRecentActivity')
  }
}

/**
 * Get students with filtering options
 */
export const getStudents = async (options = {}) => {
  try {
    const { limit = 50, batch = null } = options
    
    const queries = [Query.limit(Math.min(limit, 100)), Query.orderDesc('created_at')]
    if (batch) queries.push(Query.contains('batches', batch))
    
    const response = await retryOperation(
      () => databases.listDocuments(DATABASE_ID, COLLECTIONS.students, queries),
      'getStudents'
    )
    
    return createSuccessResponse({ 
      students: response.documents, 
      total: response.total 
    }, 'Students retrieved successfully')
    
  } catch (error) {
    return handleError(error, 'getStudents')
  }
}

/**
 * Create a new student
 */
export const createStudent = async (studentData, createdBy = null) => {
  try {
    validateRequiredFields(studentData, ['name', 'contact', 'batches'], 'createStudent')
    
    if (!Array.isArray(studentData.batches) || studentData.batches.length === 0) {
      throw handleValidationError(new Error('Invalid batches'), 'createStudent', { 
        batches: 'At least one batch must be specified' 
      })
    }
    
    const sanitizedData = {
      name: sanitizeString(studentData.name, 100),
      contact: sanitizeString(studentData.contact, 50),
      batches: studentData.batches.map(batch => sanitizeString(batch, 20)),
      email: studentData.email ? sanitizeString(studentData.email, 100) : null,
      status: 'active',
      payment_status: 'pending',
      created_at: new Date().toISOString(),
      created_by: createdBy
    }
    
    const student = await retryOperation(
      () => databases.createDocument(DATABASE_ID, COLLECTIONS.students, ID.unique(), sanitizedData),
      'createStudent'
    )
    
    await logActivity('student_created', createdBy, {
      student_id: student.$id,
      student_name: student.name
    })
    
    return createSuccessResponse(student, `Student ${student.name} created successfully`)
    
  } catch (error) {
    if (error.success === false) return error
    return handleError(error, 'createStudent')
  }
}

/**
 * Update student information
 */
export const updateStudent = async (studentId, updateData, updatedBy = null) => {
  try {
    if (!studentId) {
      throw handleValidationError(new Error('Student ID required'), 'updateStudent', { 
        studentId: 'Student ID is required' 
      })
    }
    
    const sanitizedData = { updated_at: new Date().toISOString() }
    if (updateData.name) sanitizedData.name = sanitizeString(updateData.name, 100)
    if (updateData.contact) sanitizedData.contact = sanitizeString(updateData.contact, 50)
    if (updateData.email) sanitizedData.email = sanitizeString(updateData.email, 100)
    if (updateData.status) sanitizedData.status = updateData.status
    if (updateData.batches && Array.isArray(updateData.batches)) {
      sanitizedData.batches = updateData.batches.map(batch => sanitizeString(batch, 20))
    }
    
    const updatedStudent = await retryOperation(
      () => databases.updateDocument(DATABASE_ID, COLLECTIONS.students, studentId, sanitizedData),
      'updateStudent'
    )
    
    await logActivity('student_updated', updatedBy, { student_id: studentId })
    
    return createSuccessResponse(updatedStudent, 'Student updated successfully')
    
  } catch (error) {
    if (error.success === false) return error
    return handleError(error, 'updateStudent')
  }
}

/**
 * Get students by batch
 */
export const getStudentsByBatch = async (batchName, options = {}) => {
  try {
    if (!batchName) {
      throw handleValidationError(new Error('Batch name required'), 'getStudentsByBatch', { 
        batchName: 'Batch name is required' 
      })
    }
    
    return await getStudents({ batch: batchName, ...options })
    
  } catch (error) {
    if (error.success === false) return error
    return handleError(error, 'getStudentsByBatch')
  }
}

// Attendance functions
export const markAttendance = async (attendanceData, markedBy = null) => {
  try {
    validateRequiredFields(attendanceData, ['student_id', 'batch_name', 'date', 'present'], 'markAttendance')
    
    const sanitizedData = {
      student_id: attendanceData.student_id,
      batch_name: sanitizeString(attendanceData.batch_name, 20),
      date: attendanceData.date,
      present: Boolean(attendanceData.present),
      created_at: new Date().toISOString(),
      marked_by: markedBy
    }
    
    const attendance = await retryOperation(
      () => databases.createDocument(DATABASE_ID, COLLECTIONS.attendance, ID.unique(), sanitizedData),
      'markAttendance'
    )
    
    await logActivity('attendance_marked', markedBy, { 
      student_id: attendanceData.student_id, 
      date: attendanceData.date 
    })
    
    return createSuccessResponse(attendance, 'Attendance marked successfully')
    
  } catch (error) {
    if (error.success === false) return error
    return handleError(error, 'markAttendance')
  }
}

export const getAttendanceByDate = async (date, batchName = null) => {
  try {
    if (!date) throw handleValidationError(new Error('Date required'), 'getAttendanceByDate', { date: 'Date is required' })
    
    const queries = [Query.equal('date', date)]
    if (batchName) queries.push(Query.equal('batch_name', batchName))
    
    const response = await retryOperation(
      () => databases.listDocuments(DATABASE_ID, COLLECTIONS.attendance, queries),
      'getAttendanceByDate'
    )
    
    return createSuccessResponse({ attendance: response.documents, total: response.total }, 'Attendance retrieved')
    
  } catch (error) {
    if (error.success === false) return error
    return handleError(error, 'getAttendanceByDate')
  }
}

export const getAttendanceByStudent = async (studentId) => {
  try {
    if (!studentId) throw handleValidationError(new Error('Student ID required'), 'getAttendanceByStudent', { studentId: 'Student ID is required' })
    
    const queries = [Query.equal('student_id', studentId), Query.limit(100)]
    
    const response = await retryOperation(
      () => databases.listDocuments(DATABASE_ID, COLLECTIONS.attendance, queries),
      'getAttendanceByStudent'
    )
    
    return createSuccessResponse({ attendance: response.documents, total: response.total }, 'Student attendance retrieved')
    
  } catch (error) {
    if (error.success === false) return error
    return handleError(error, 'getAttendanceByStudent')
  }
}

// Payment functions
export const markPayment = async (paymentData, markedBy = null) => {
  try {
    validateRequiredFields(paymentData, ['student_id', 'month', 'year', 'paid'], 'markPayment')
    
    const sanitizedData = {
      student_id: paymentData.student_id,
      month: sanitizeString(paymentData.month, 20),
      year: parseInt(paymentData.year),
      paid: Boolean(paymentData.paid),
      created_at: new Date().toISOString(),
      marked_by: markedBy
    }
    
    const payment = await retryOperation(
      () => databases.createDocument(DATABASE_ID, COLLECTIONS.payments, ID.unique(), sanitizedData),
      'markPayment'
    )
    
    await logActivity('payment_marked', markedBy, { 
      student_id: paymentData.student_id, 
      month: paymentData.month, 
      year: paymentData.year 
    })
    
    return createSuccessResponse(payment, 'Payment marked successfully')
    
  } catch (error) {
    if (error.success === false) return error
    return handleError(error, 'markPayment')
  }
}

export const getPaymentStatus = async (studentId, month, year) => {
  try {
    if (!studentId || !month || !year) {
      throw handleValidationError(new Error('Missing required parameters'), 'getPaymentStatus', {
        studentId: !studentId ? 'Student ID is required' : undefined,
        month: !month ? 'Month is required' : undefined,
        year: !year ? 'Year is required' : undefined
      })
    }
    
    const response = await retryOperation(
      () => databases.listDocuments(DATABASE_ID, COLLECTIONS.payments, [
        Query.equal('student_id', studentId),
        Query.equal('month', month),
        Query.equal('year', parseInt(year)),
        Query.limit(1)
      ]),
      'getPaymentStatus'
    )
    
    const paymentRecord = response.documents.length > 0 ? response.documents[0] : null
    
    return createSuccessResponse({
      exists: paymentRecord !== null,
      payment: paymentRecord,
      paid: paymentRecord?.paid || false
    }, paymentRecord ? 'Payment record found' : 'No payment record found')
    
  } catch (error) {
    if (error.success === false) return error
    return handleError(error, 'getPaymentStatus')
  }
}

export const getMonthlyPayments = async (month, year) => {
  try {
    if (!month || !year) {
      throw handleValidationError(new Error('Month and year required'), 'getMonthlyPayments', {
        month: !month ? 'Month is required' : undefined,
        year: !year ? 'Year is required' : undefined
      })
    }
    
    const queries = [Query.equal('month', month), Query.equal('year', parseInt(year))]
    
    const response = await retryOperation(
      () => databases.listDocuments(DATABASE_ID, COLLECTIONS.payments, queries),
      'getMonthlyPayments'
    )
    
    return createSuccessResponse({ payments: response.documents, total: response.total }, 'Monthly payments retrieved')
    
  } catch (error) {
    if (error.success === false) return error
    return handleError(error, 'getMonthlyPayments')
  }
}

// Class functions
export const scheduleClasses = async (classData, scheduledBy = null) => {
  try {
    validateRequiredFields(classData, ['dates', 'batch_names'], 'scheduleClasses')
    
    const createdClasses = []
    
    for (const date of classData.dates) {
      for (const batchName of classData.batch_names) {
        try {
          const sanitizedData = {
            date: date,
            batch_name: sanitizeString(batchName, 20),
            status: 'scheduled',
            created_at: new Date().toISOString(),
            scheduled_by: scheduledBy
          }
          
          const classRecord = await databases.createDocument(DATABASE_ID, COLLECTIONS.classes, ID.unique(), sanitizedData)
          createdClasses.push(classRecord)
        } catch (error) {
          console.error(`Failed to create class for ${batchName} on ${date}:`, error)
        }
      }
    }
    
    await logActivity('classes_scheduled', scheduledBy, { created_count: createdClasses.length })
    
    return createSuccessResponse({ classes: createdClasses, created: createdClasses.length }, 'Classes scheduled')
    
  } catch (error) {
    if (error.success === false) return error
    return handleError(error, 'scheduleClasses')
  }
}

export const getScheduledClasses = async (startDate, endDate) => {
  try {
    if (!startDate || !endDate) {
      throw handleValidationError(new Error('Date range required'), 'getScheduledClasses', {
        startDate: !startDate ? 'Start date is required' : undefined,
        endDate: !endDate ? 'End date is required' : undefined
      })
    }
    
    const queries = [
      Query.greaterThanEqual('date', startDate),
      Query.lessThanEqual('date', endDate),
      Query.orderAsc('date')
    ]
    
    const response = await retryOperation(
      () => databases.listDocuments(DATABASE_ID, COLLECTIONS.classes, queries),
      'getScheduledClasses'
    )
    
    return createSuccessResponse({ classes: response.documents, total: response.total }, 'Scheduled classes retrieved')
    
  } catch (error) {
    if (error.success === false) return error
    return handleError(error, 'getScheduledClasses')
  }
}

export const updateClassStatus = async (date, batchName, status, updatedBy = null) => {
  try {
    if (!date || !batchName || !status) {
      throw handleValidationError(new Error('Missing required parameters'), 'updateClassStatus', {
        date: !date ? 'Date is required' : undefined,
        batchName: !batchName ? 'Batch name is required' : undefined,
        status: !status ? 'Status is required' : undefined
      })
    }
    
    const existingClass = await databases.listDocuments(DATABASE_ID, COLLECTIONS.classes, [
      Query.equal('date', date),
      Query.equal('batch_name', batchName),
      Query.limit(1)
    ])
    
    if (existingClass.documents.length === 0) {
      throw handleValidationError(new Error('Class not found'), 'updateClassStatus', {
        class: `No class found for ${batchName} on ${date}`
      })
    }
    
    const classRecord = existingClass.documents[0]
    const updateData = {
      status: sanitizeString(status, 50),
      updated_at: new Date().toISOString(),
      updated_by: updatedBy
    }
    
    const updatedClass = await retryOperation(
      () => databases.updateDocument(DATABASE_ID, COLLECTIONS.classes, classRecord.$id, updateData),
      'updateClassStatus'
    )
    
    await logActivity('class_status_updated', updatedBy, { class_id: classRecord.$id })
    
    return createSuccessResponse(updatedClass, 'Class status updated')
    
  } catch (error) {
    if (error.success === false) return error
    return handleError(error, 'updateClassStatus')
  }
}