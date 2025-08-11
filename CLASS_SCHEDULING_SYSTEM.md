# SportClubApp Class Scheduling System 📅

## Overview

A comprehensive class scheduling system with React Hook Form, real-time updates, bulk operations, and professional UI/UX design. Enables instructors to efficiently schedule, cancel, and manage classes with conflict detection and validation.

## 🎯 System Features

### ✅ **Complete Scheduling Workflow**
- **Professional scheduling modal** with React Hook Form validation
- **Bulk scheduling operations** for multiple dates and batches
- **Conflict detection** with skip options
- **Real-time calendar updates** with live class data
- **Mobile-first responsive design** optimized for PWA usage

## 📁 File Structure

```
src/
├── services/
│   └── schedulingService.js         # Backend integration and bulk operations
├── hooks/
│   └── useScheduling.js            # State management and operations hook
├── components/
│   ├── Modal/
│   │   └── Modal.jsx               # Reusable modal with React portals
│   └── Dashboard/
│       ├── SchedulingModal.jsx     # Professional scheduling form
│       └── Calendar.jsx            # Enhanced calendar with real data
└── pages/
    └── Dashboard.jsx               # Integrated dashboard with scheduling
```

## 🧰 Component Details

### **1. Modal Component (`src/components/Modal/Modal.jsx`)**
**Professional modal system using React portals**

```javascript
<Modal
  isOpen={isModalOpen}
  onClose={handleCloseModal}
  size="lg"
  position="center"
  closeOnBackdrop={true}
  closeOnEscape={true}
>
  <Modal.Header title="Modal Title" onClose={handleClose} />
  <Modal.Body scrollable={true}>
    Modal content goes here
  </Modal.Body>
  <Modal.Footer align="right">
    <Button onClick={handleClose}>Close</Button>
  </Modal.Footer>
</Modal>
```

**Features:**
- ✅ **React portals** for proper z-index handling
- ✅ **Smooth animations** with Tailwind transitions
- ✅ **Mobile-first design** with iOS safe areas
- ✅ **Keyboard navigation** (Escape key, focus management)
- ✅ **Accessibility support** (ARIA labels, focus trapping)
- ✅ **Backdrop click** and escape key to close
- ✅ **Compound component pattern** (Modal.Header, Modal.Body, Modal.Footer)
- ✅ **Body scroll management** to prevent background scrolling

**Modal Sizes:**
```javascript
sm, md, lg, xl, 2xl, 3xl, 4xl, full
```

**Modal Positions:**
```javascript
center, top, bottom, center-mobile-bottom
```

### **2. Scheduling Service (`src/services/schedulingService.js`)**
**Comprehensive backend integration for class management**

```javascript
import { 
  scheduleClasses,
  cancelClasses,
  getScheduledClasses,
  getClassStatistics,
  SCHEDULING_CONFIG
} from '../services/schedulingService.js'

// Schedule classes in bulk
const result = await scheduleClasses({
  startDate: '2024-12-20',
  endDate: '2024-12-25',
  batches: ['morning', 'evening'],
  excludeDays: [0, 6], // Exclude weekends
  skipConflicts: true,
  notes: 'Holiday classes'
})

// Cancel classes
const cancelResult = await cancelClasses({
  startDate: '2024-12-20',
  endDate: '2024-12-20',
  batches: ['morning'],
  reason: 'Instructor unavailable'
})
```

**Features:**
- ✅ **Bulk operations** for multiple classes at once
- ✅ **Conflict detection** with automatic resolution options
- ✅ **Date validation** with business rules (min 2 hours advance)
- ✅ **Batch management** (Morning, Evening, Weekend)
- ✅ **Activity logging** for audit trails
- ✅ **Error handling** with user-friendly messages
- ✅ **Appwrite integration** with retry logic

**Configuration Constants:**
```javascript
SCHEDULING_CONFIG = {
  BATCHES: {
    MORNING: { name: 'Morning Batch', defaultTime: '09:00', color: 'orange' },
    EVENING: { name: 'Evening Batch', defaultTime: '18:00', color: 'purple' },
    WEEKEND: { name: 'Weekend Batch', defaultTime: '10:00', color: 'blue' }
  },
  STATUS: {
    SCHEDULED: 'scheduled',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    RESCHEDULED: 'rescheduled'
  },
  VALIDATION: {
    MAX_ADVANCE_DAYS: 90,
    MIN_ADVANCE_HOURS: 2,
    MAX_BULK_OPERATIONS: 50
  }
}
```

### **3. Scheduling Hook (`src/hooks/useScheduling.js`)**
**Comprehensive state management for scheduling operations**

```javascript
const {
  // Operations
  scheduleClasses,
  cancelClasses,
  checkConflicts,
  refreshClasses,
  
  // State
  classes,
  statistics,
  isLoading,
  isScheduling,
  isCancelling,
  error,
  
  // Utilities
  getClassesForDate,
  getClassesByStatus,
  clearError
} = useScheduling({
  enableRealtime: true,
  autoRefresh: true,
  onScheduled: (result) => console.log('Classes scheduled!'),
  onError: (error) => console.error('Scheduling error:', error)
})
```

**Features:**
- ✅ **Real-time updates** with Appwrite subscriptions
- ✅ **Auto-refresh** with configurable intervals
- ✅ **Loading states** for all operations
- ✅ **Error handling** with retry capabilities
- ✅ **Conflict checking** before scheduling
- ✅ **Statistics loading** for dashboard metrics
- ✅ **Data filtering** utilities (by date, status, batch)

### **4. Scheduling Modal (`src/components/Dashboard/SchedulingModal.jsx`)**
**Professional scheduling form with React Hook Form**

```javascript
<SchedulingModal
  isOpen={isModalOpen}
  onClose={handleCloseModal}
  onSubmit={handleScheduleSubmit}
  isLoading={isSubmitting}
  defaultValues={{
    action: 'schedule',
    startDate: '2024-12-20',
    endDate: '2024-12-25',
    batches: ['morning', 'evening']
  }}
/>
```

**Form Features:**
- ✅ **React Hook Form** with validation
- ✅ **Date range picker** with constraints
- ✅ **Batch selection** with checkboxes
- ✅ **Action selection** (Schedule vs Cancel)
- ✅ **Additional options** (exclude weekends, skip conflicts)
- ✅ **Form validation** with real-time feedback
- ✅ **Loading states** during submission
- ✅ **Success/error feedback** with detailed results

**Form Components:**
```javascript
// Date inputs with validation
<DateInput 
  label="Start Date" 
  min={minDate} 
  max={maxDate} 
  error={errors.startDate?.message}
/>

// Batch selection with visual indicators
<BatchSelector 
  field={field} 
  error={error?.message} 
/>

// Action selection (Schedule vs Cancel)
<ActionSelector 
  field={field} 
  error={error?.message} 
/>

// Summary showing estimated classes
<SchedulingSummary formData={watchedData} />
```

### **5. Enhanced Calendar (`src/components/Dashboard/Calendar.jsx`)**
**Real-time calendar with live class data**

```javascript
<Calendar
  onDayClick={handleDayClick}
  onScheduleClick={handleScheduleClick}
  showLegend={true}
  showModal={true}
  enableRealtime={true}
  autoRefresh={true}
/>
```

**Enhanced Features:**
- ✅ **Real class data** from Appwrite backend
- ✅ **Status indicators** with color coding
- ✅ **Day details modal** with class information
- ✅ **Schedule button** in day modal for quick scheduling
- ✅ **Loading states** with refresh button
- ✅ **Error handling** with retry options
- ✅ **Real-time updates** when classes change

**Status Color Coding:**
```css
Scheduled:   Blue (#3B82F6)    - Classes ready to happen
Completed:   Green (#059669)   - Classes that occurred
Cancelled:   Red (#DC2626)     - Classes that were cancelled
Rescheduled: Orange (#F59E0B)  - Classes moved to new time
```

### **6. Dashboard Integration (`src/pages/Dashboard.jsx`)**
**Complete integration of scheduling functionality**

**Integration Features:**
- ✅ **ScheduleButton integration** opens scheduling modal
- ✅ **Calendar integration** with day-specific scheduling
- ✅ **Real-time statistics** in schedule button
- ✅ **Modal state management** for scheduling workflow
- ✅ **Success feedback** and error handling
- ✅ **Smart defaults** based on user actions

## 🎨 User Experience Flow

### **1. Schedule Classes Workflow**
```
1. User clicks "Schedule Classes" button
2. Dropdown shows options:
   - Schedule New Class (single day)
   - Schedule Recurring Classes (date range)
   - Cancel Class
   - Reschedule Class
3. Modal opens with smart defaults based on selection
4. User fills form:
   - Date range
   - Batch selection
   - Additional options
5. Form validates and shows summary
6. User submits, sees loading state
7. Success/error feedback displayed
8. Calendar auto-refreshes with new data
```

### **2. Calendar Interaction Workflow**
```
1. User views calendar with class indicators
2. Clicks on a day with/without classes
3. Day details modal shows:
   - Existing classes with status
   - Class details (time, batch, notes)
   - "Schedule Classes" button for future dates
4. User can schedule directly for that date
5. Calendar updates in real-time
```

### **3. Bulk Operations Workflow**
```
1. User selects date range (e.g., Dec 20-25)
2. Selects multiple batches (Morning + Evening)
3. System calculates: 6 days × 2 batches = 12 classes
4. Conflict detection runs automatically
5. Options to skip conflicts or fix manually
6. Bulk creation with progress feedback
7. Activity logging for audit trail
```

## 🔧 Technical Implementation

### **Form Validation Rules**
```javascript
const validationRules = {
  startDate: {
    required: 'Start date is required',
    validate: (date) => {
      const minDate = new Date(Date.now() + 2 * 60 * 60 * 1000)
      return date >= minDate || 'Must be at least 2 hours in advance'
    }
  },
  endDate: {
    required: 'End date is required',
    validate: (date, formData) => {
      return date >= formData.startDate || 'End date must be after start date'
    }
  },
  batches: {
    required: 'Select at least one batch',
    validate: (batches) => {
      return batches.length > 0 || 'At least one batch required'
    }
  }
}
```

### **Real-time Updates**
```javascript
// Calendar subscribes to classes collection changes
const unsubscribe = realtimeManager.subscribe(
  'classes',
  (payload) => {
    console.log('Class update:', payload)
    refreshClasses() // Auto-refresh calendar data
  },
  ['create', 'update', 'delete']
)
```

### **State Management Architecture**
```javascript
// Dashboard coordinates all scheduling state
const [isSchedulingModalOpen, setIsSchedulingModalOpen] = useState(false)
const [schedulingDefaultValues, setSchedulingDefaultValues] = useState({})

// useScheduling hook manages operations and data
const {
  scheduleClasses,     // Async operation
  cancelClasses,       // Async operation  
  classes,             // Real-time class data
  statistics,          // Dashboard metrics
  isLoading,           // Global loading state
  error                // Error handling
} = useScheduling({
  enableRealtime: true,
  autoRefresh: true
})
```

## 📱 Mobile Optimization

### **Touch Interactions**
```css
/* Touch targets meet iOS guidelines */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

/* Smooth touch feedback */
.touch-button {
  transition: transform 0.1s ease;
  active:scale-95;
}

/* Safe area handling */
.modal {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}
```

### **Responsive Design**
```css
/* Mobile-first modal sizing */
.modal-container {
  @apply max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl;
  @apply mx-4 sm:mx-auto;
  @apply max-h-screen sm:max-h-96;
}

/* Responsive form layout */
.form-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 gap-4;
}
```

## 🔒 Data Security & Validation

### **Input Sanitization**
```javascript
const sanitizeSchedulingData = (data) => {
  return {
    startDate: data.startDate.trim(),
    endDate: data.endDate.trim(),
    batches: data.batches.filter(Boolean).map(b => b.toLowerCase()),
    notes: data.notes?.trim().substring(0, 500) || '',
    reason: data.reason?.trim().substring(0, 500) || ''
  }
}
```

### **Business Logic Validation**
```javascript
const validateSchedulingRequest = (request) => {
  const errors = []
  
  // Date range validation
  if (new Date(request.startDate) > new Date(request.endDate)) {
    errors.push('Start date must be before end date')
  }
  
  // Advance scheduling validation
  const minAdvanceTime = Date.now() + 2 * 60 * 60 * 1000
  if (new Date(request.startDate) < minAdvanceTime) {
    errors.push('Classes must be scheduled at least 2 hours in advance')
  }
  
  // Bulk operation limits
  const totalOperations = calculateOperations(request)
  if (totalOperations > 50) {
    errors.push('Maximum 50 classes can be scheduled at once')
  }
  
  return { valid: errors.length === 0, errors }
}
```

## 🧪 Usage Examples

### **Basic Scheduling**
```javascript
// Schedule a single class
const result = await scheduleClasses({
  startDate: '2024-12-20',
  endDate: '2024-12-20',
  batches: ['morning'],
  notes: 'Special holiday class'
})

if (result.success) {
  console.log(`Scheduled ${result.data.scheduled} classes`)
}
```

### **Bulk Scheduling**
```javascript
// Schedule a week of classes
const result = await scheduleClasses({
  startDate: '2024-12-16',
  endDate: '2024-12-20',
  batches: ['morning', 'evening'],
  excludeDays: [0, 6], // Skip weekends
  skipConflicts: true
})

console.log(`Scheduled ${result.data.scheduled} classes`)
console.log(`Errors: ${result.data.errors}`)
```

### **Cancellation**
```javascript
// Cancel classes for a date range
const result = await cancelClasses({
  startDate: '2024-12-24',
  endDate: '2024-12-25',
  batches: ['morning', 'evening'],
  reason: 'Holiday closure'
})
```

### **Hook Usage**
```javascript
function SchedulingComponent() {
  const {
    scheduleClasses,
    classes,
    isLoading,
    error,
    getClassesForDate
  } = useScheduling({
    enableRealtime: true,
    onScheduled: () => toast.success('Classes scheduled!'),
    onError: (err) => toast.error(err.message)
  })
  
  const todayClasses = getClassesForDate('2024-12-16')
  
  return (
    <div>
      {isLoading && <LoadingSpinner />}
      {error && <ErrorMessage error={error} />}
      <ClassList classes={todayClasses} />
    </div>
  )
}
```

## 🚀 Advanced Features

### **Conflict Resolution**
```javascript
// Check for conflicts before scheduling
const conflictCheck = await checkSchedulingConflicts(dates, batches)
if (conflictCheck.data.hasConflicts) {
  console.log('Conflicts found:', conflictCheck.data.conflicts)
  
  // Option 1: Skip conflicts
  await scheduleClasses({ ...request, skipConflicts: true })
  
  // Option 2: Show conflict resolution UI
  showConflictResolutionModal(conflictCheck.data.conflicts)
}
```

### **Statistics Integration**
```javascript
const { statistics } = useScheduling()

console.log('Today:', statistics.scheduled, 'scheduled classes')
console.log('This week:', statistics.byBatch.morning, 'morning classes')
console.log('Completion rate:', 
  (statistics.completed / statistics.total * 100).toFixed(1) + '%'
)
```

### **Real-time Updates**
```javascript
// Calendar automatically updates when classes change
useEffect(() => {
  const handleClassUpdate = (payload) => {
    if (payload.events.includes('database.documents.create')) {
      toast.success('New class scheduled!')
    }
    if (payload.events.includes('database.documents.delete')) {
      toast.info('Class cancelled')
    }
  }
  
  const unsubscribe = realtimeManager.subscribe(
    'classes', 
    handleClassUpdate
  )
  
  return unsubscribe
}, [])
```

## 🎯 Testing Your Scheduling System

### **Basic Functionality**
1. **Open scheduling modal** from schedule button
2. **Fill form** with date range and batches
3. **Submit form** and verify success message
4. **Check calendar** for new class indicators
5. **Click calendar day** to see class details

### **Advanced Testing**
1. **Conflict detection**: Try to schedule overlapping classes
2. **Bulk operations**: Schedule a week of classes
3. **Cancellation**: Cancel existing classes
4. **Real-time updates**: Have another user schedule classes
5. **Mobile interface**: Test on phone/tablet
6. **Form validation**: Test invalid inputs

### **Error Scenarios**
1. **Network errors**: Disconnect internet and try scheduling
2. **Invalid dates**: Try past dates or invalid ranges
3. **Large bulk operations**: Exceed 50 class limit
4. **Missing permissions**: Test with limited user
5. **Appwrite errors**: Simulate backend failures

## 🎉 Production Ready Features

### ✅ **Complete Scheduling System**
- **Professional UI/UX** with React Hook Form and modals
- **Bulk operations** for efficient class management
- **Real-time updates** with automatic calendar refresh
- **Conflict detection** with resolution options
- **Mobile-optimized** touch interface for PWA

### ✅ **Enterprise Features**
- **Activity logging** for compliance and audit
- **Error handling** with user-friendly messages
- **Performance optimized** with efficient re-rendering
- **Accessibility compliant** with ARIA support
- **Type-safe** with comprehensive JSDoc documentation

### ✅ **Integration Ready**
- **Modular architecture** for easy extension
- **Hook-based design** for reusability
- **Service separation** for maintainability
- **Configuration driven** for customization
- **Test-friendly** structure with dependency injection

## 🎯 Success!

Your SportClubApp now has a **professional, feature-rich class scheduling system** including:

- ✅ **Professional scheduling modal** with React Hook Form validation
- ✅ **Bulk scheduling operations** for multiple classes at once  
- ✅ **Real-time calendar updates** with live Appwrite data
- ✅ **Conflict detection** and resolution workflows
- ✅ **Mobile-optimized interface** for PWA usage
- ✅ **Comprehensive error handling** with user feedback
- ✅ **Production-ready code** with React best practices

**Ready for immediate use in production environment!** 🚀

Your instructors can now efficiently schedule classes, manage conflicts, and see real-time updates across the entire sports club management system.
