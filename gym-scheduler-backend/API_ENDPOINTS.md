// Backend API Endpoints Documentation
// for gym-scheduler-backend (Laravel)
// 
// This file documents all API endpoints needed for the new features
// added to flutter_gym_scheduler (Trainer, Member, Admin enhancements)

/**
 * ========================================
 * TRAINER FEATURES ENDPOINTS
 * ========================================
 */

// Working Hours Management
GET /api/trainer/working-hours/{trainerId}
  - Get all working hours for a trainer
  - Response: List<WorkingHours>
  - Parameters: trainerId (required)

POST /api/trainer/working-hours
  - Save/update working hours for a trainer
  - Body: {
      trainerId: int,
      workingHours: [
        { dayOfWeek: int, startTime: "HH:mm", endTime: "HH:mm", isActive: bool }
      ]
    }
  - Response: { success: bool, message: string }

PUT /api/trainer/working-hours/{id}
  - Update a specific working hour entry
  - Body: { startTime: "HH:mm", endTime: "HH:mm", isActive: bool }
  - Response: WorkingHours

DELETE /api/trainer/working-hours/{id}
  - Delete a working hour entry
  - Response: { success: bool }


// Time-off Management
GET /api/trainer/time-off/{trainerId}
  - Get all time-off requests for a trainer
  - Response: List<TimeOff>

POST /api/trainer/time-off/request
  - Create a new time-off request
  - Body: {
      trainerId: int,
      startDate: "2024-01-01",
      endDate: "2024-01-10",
      reason: "vacation|medical|personal",
      description?: string
    }
  - Response: TimeOff

PUT /api/trainer/time-off/{id}
  - Update a time-off request
  - Body: { status: "approved|rejected|cancelled", approvedBy?: int, notes?: string }
  - Response: TimeOff

DELETE /api/trainer/time-off/{id}
  - Cancel a time-off request
  - Response: { success: bool }


// Session Notes & Progress Tracking
POST /api/trainer/session-notes
  - Create a session note after a training session
  - Body: {
      trainerId: int,
      bookingId: int,
      memberId: int,
      content: string,
      focusAreas?: [string],
      performance?: "1"|"2"|"3"|"4"|"5",
      nextFocus?: string
    }
  - Response: SessionNote

GET /api/trainer/session-notes/{trainerId}
  - Get all session notes for a trainer
  - Query: ?memberId=x (optional, filter by member)
  - Response: List<SessionNote>

PUT /api/trainer/session-notes/{id}
  - Update a session note
  - Body: { content: string, focusAreas?: [string], performance?: string }
  - Response: SessionNote

DELETE /api/trainer/session-notes/{id}
  - Delete a session note
  - Response: { success: bool }


// Workout Plans
POST /api/trainer/workout-plans
  - Create a workout plan for a member
  - Body: {
      trainerId: int,
      memberId: int,
      title: string,
      content: string,
      duration?: int (weeks),
      difficulty?: "beginner|intermediate|advanced",
      startDate?: "2024-01-01",
      endDate?: "2024-03-01"
    }
  - Response: WorkoutPlan

GET /api/trainer/workout-plans/{trainerId}
  - Get all workout plans created by trainer
  - Query: ?memberId=x (optional)
  - Response: List<WorkoutPlan>

PUT /api/trainer/workout-plans/{id}
  - Update a workout plan
  - Body: { title, content, difficulty, duration, ... }
  - Response: WorkoutPlan

DELETE /api/trainer/workout-plans/{id}
  - Delete a workout plan
  - Response: { success: bool }


// Trainer Earnings & Withdrawals
GET /api/trainer/earnings/{trainerId}
  - Get earnings summary for a trainer
  - Response: {
      trainerId: int,
      totalEarnings: double,
      completedSessions: int,
      pendingSessions: int,
      cancelledSessions: int,
      withdrawalBalance: double,
      monthlyBreakdown?: [{ month: string, amount: double }]
    }

POST /api/trainer/withdrawal-request
  - Request withdrawal of earnings
  - Body: {
      trainerId: int,
      amount: double,
      method: "bank_transfer|wallet",
      bankDetails?: { ... }
    }
  - Response: { success: bool, requestId: int }

GET /api/trainer/withdrawal-requests/{trainerId}
  - Get withdrawal request history
  - Response: List<WithdrawalRequest>


/**
 * ========================================
 * MEMBER FEATURES ENDPOINTS
 * ========================================
 */

// Waitlist Management
GET /api/member/waitlist/{memberId}
  - Get waitlist entries for a member
  - Response: List<WaitlistEntry>

POST /api/member/waitlist/join
  - Join a waitlist for a class or trainer
  - Body: {
      memberId: int,
      itemType: "class|trainer",
      itemId: int
    }
  - Response: WaitlistEntry

DELETE /api/member/waitlist/{id}
  - Remove from waitlist
  - Response: { success: bool }

POST /api/member/waitlist/{id}/notify
  - Internal: Notify member when spot opens
  - Response: { notified: bool }


// Membership Freeze
GET /api/member/freeze/{memberId}
  - Get all freeze requests for member
  - Response: List<MembershipFreeze>

POST /api/member/freeze/request
  - Request to freeze membership
  - Body: {
      memberId: int,
      startDate: "2024-01-01",
      endDate: "2024-02-01",
      reason: "vacation|medical|personal",
      notes?: string
    }
  - Response: MembershipFreeze

PUT /api/member/freeze/{id}
  - Admin approves/rejects freeze request
  - Body: { status: "approved|rejected", approvedBy: int, notes?: string }
  - Response: MembershipFreeze

DELETE /api/member/freeze/{id}
  - Cancel a freeze request
  - Response: { success: bool }


// Digital Member Card & Check-in
GET /api/member/card/{memberId}
  - Get member's digital card
  - Response: MemberCard

POST /api/member/card/generate
  - Generate a new digital card
  - Body: { memberId: int }
  - Response: MemberCard

POST /api/member/check-in/facility
  - Check-in member at facility
  - Body: { memberId: int, qrCode: string }
  - Response: { success: bool, checkedInAt: datetime }

GET /api/member/check-in/history/{memberId}
  - Get check-in history for member
  - Response: List<CheckIn>


// Booking Cancellation
GET /api/booking/{bookingId}/cancellation-policy
  - Get cancellation policy for a specific booking
  - Response: {
      bookingId: int,
      hoursBeforeCancellation: int,
      refundPercentage: int,
      penalty?: double
    }

POST /api/booking/cancel
  - Cancel a booking
  - Body: {
      memberId: int,
      bookingId: int,
      reason: string
    }
  - Response: {
      success: bool,
      refundAmount: double,
      penalty?: double,
      cancellationId: int
    }

GET /api/member/cancellations/{memberId}
  - Get cancellation history
  - Response: List<BookingCancellation>


/**
 * ========================================
 * ADMIN FEATURES ENDPOINTS
 * ========================================
 */

// Voucher Management
GET /api/admin/vouchers
  - Get all vouchers
  - Query: ?status=active|expired|exhausted
  - Response: List<Voucher>

POST /api/admin/vouchers
  - Create a new voucher
  - Body: {
      code: string,
      discountType: "percentage|fixed",
      discountValue: double,
      maxUses?: int,
      minOrderAmount?: double,
      validFrom?: "2024-01-01",
      validUntil?: "2024-12-31",
      applicableTo: "all|new_members|specific_packages"
    }
  - Response: Voucher

PUT /api/admin/vouchers/{id}
  - Update a voucher
  - Body: { isActive: bool, validUntil?, maxUses?, ... }
  - Response: Voucher

DELETE /api/admin/vouchers/{id}
  - Delete a voucher
  - Response: { success: bool }

POST /api/admin/vouchers/{id}/activate
  - Activate an inactive voucher
  - Response: Voucher

POST /api/admin/vouchers/{id}/deactivate
  - Deactivate a voucher
  - Response: Voucher


// Push Notification Campaigns
GET /api/admin/campaigns
  - Get all notification campaigns
  - Query: ?status=draft|scheduled|sent
  - Response: List<PushCampaign>

POST /api/admin/campaigns
  - Create a new campaign (draft)
  - Body: {
      title: string,
      message: string,
      targetAudience: "all|new_members|inactive",
      sendAt?: "2024-01-15 10:00:00"
    }
  - Response: PushCampaign

PUT /api/admin/campaigns/{id}
  - Update a draft campaign
  - Body: { title?, message?, targetAudience?, sendAt? }
  - Response: PushCampaign

POST /api/admin/campaigns/{id}/schedule
  - Schedule a campaign to be sent later
  - Body: { sendAt: "2024-01-15 10:00:00" }
  - Response: PushCampaign

POST /api/admin/campaigns/{id}/send-now
  - Send campaign immediately
  - Response: { success: bool, sentCount: int }

DELETE /api/admin/campaigns/{id}
  - Delete a campaign (only if draft)
  - Response: { success: bool }


// Refund Request Management
GET /api/admin/refund-requests
  - Get all refund requests
  - Query: ?status=pending|approved|rejected|processed
  - Response: List<RefundRequest>

POST /api/admin/refund-requests/{id}/approve
  - Approve a refund request
  - Body: {
      approvedAmount: double,
      refundMethod: "wallet|bank_transfer",
      notes?: string
    }
  - Response: RefundRequest

POST /api/admin/refund-requests/{id}/reject
  - Reject a refund request
  - Body: { reason: string }
  - Response: RefundRequest

PUT /api/admin/refund-requests/{id}
  - Update refund request (admin only)
  - Body: { status, approvedAmount, ... }
  - Response: RefundRequest


// Reporting & Analytics
GET /api/admin/reports/transactions
  - Get transaction report
  - Query: ?fromDate=2024-01-01&toDate=2024-01-31&type=booking|membership|package
  - Response: List<TransactionReport>

GET /api/admin/reports/transactions/export
  - Export transactions to CSV
  - Query: ?fromDate=2024-01-01&toDate=2024-01-31&format=csv
  - Response: File (CSV stream)

GET /api/admin/reports/revenue-stats
  - Get revenue statistics
  - Query: ?fromDate=2024-01-01&toDate=2024-01-31
  - Response: {
      totalRevenue: double,
      totalTransactions: int,
      avgOrderValue: double,
      dailyBreakdown: [{ date, amount }],
      categoryBreakdown: [{ category, amount }]
    }

GET /api/admin/reports/trainer-payroll
  - Get trainer payroll statistics
  - Query: ?fromDate=2024-01-01&toDate=2024-01-31&trainerId?
  - Response: [
      {
        trainerId: int,
        trainerName: string,
        totalSessions: int,
        totalEarnings: double,
        commissionRate: double,
        payableAmount: double
      }
    ]

GET /api/admin/reports/member-activity
  - Get member activity report
  - Query: ?fromDate=2024-01-01&toDate=2024-01-31
  - Response: {
      activeMembers: int,
      inactiveMembers: int,
      newMembers: int,
      cancelledMembers: int,
      retentionRate: double
    }


/**
 * ========================================
 * AUTHENTICATION & AUTHORIZATION
 * ========================================
 */

All endpoints require:
- Header: Authorization: Bearer {token}
- Token obtained from POST /api/auth/login

Trainer-specific endpoints require:
- User role: "trainer" in JWT claims

Admin-specific endpoints require:
- User role: "admin" in JWT claims

Member-specific endpoints require:
- User role: "member" in JWT claims
- Access only own member data (memberId validation)


/**
 * ========================================
 * ERROR RESPONSES
 * ========================================
 */

All endpoints return standard error format:
{
  "error": true,
  "message": "Error description",
  "code": "ERROR_CODE",
  "statusCode": 400|401|403|404|500
}

Common error codes:
- UNAUTHORIZED: Missing/invalid token
- FORBIDDEN: Insufficient permissions
- NOT_FOUND: Resource not found
- VALIDATION_ERROR: Invalid request data
- BUSINESS_ERROR: Business logic violation (e.g., can't freeze active membership)
- CONFLICT: Resource conflict (e.g., duplicate voucher code)
- INTERNAL_ERROR: Server error


/**
 * ========================================
 * PAGINATION & FILTERING
 * ========================================
 */

List endpoints support:
- Query: ?page=1&limit=20&sort=created_at&order=desc
- Response: {
    data: [...],
    pagination: {
      current_page: int,
      total: int,
      per_page: int
    }
  }


/**
 * ========================================
 * DATA MODELS (for reference)
 * ========================================
 */

WorkingHours {
  id: int,
  trainerId: int,
  dayOfWeek: 0-6 (Monday-Sunday),
  startTime: "HH:mm",
  endTime: "HH:mm",
  isActive: bool,
  createdAt: datetime,
  updatedAt: datetime
}

TimeOff {
  id: int,
  trainerId: int,
  startDate: date,
  endDate: date,
  reason: string,
  status: "pending|approved|rejected|cancelled",
  description?: string,
  approvedBy?: int,
  notes?: string,
  createdAt: datetime,
  approvedAt?: datetime
}

SessionNote {
  id: int,
  bookingId: int,
  trainerId: int,
  memberId: int,
  content: string,
  focusAreas?: [string],
  performance?: "1"-"5",
  nextFocus?: string,
  createdAt: datetime,
  updatedAt: datetime
}

WorkoutPlan {
  id: int,
  trainerId: int,
  memberId: int,
  title: string,
  content: string,
  duration?: int (weeks),
  difficulty?: string,
  startDate?: date,
  endDate?: date,
  createdAt: datetime,
  updatedAt: datetime
}

TrainerEarnings {
  trainerId: int,
  totalEarnings: double,
  completedSessions: int,
  pendingSessions: int,
  cancelledSessions: int,
  withdrawalBalance: double,
  commissionRate: double
}

WaitlistEntry {
  id: int,
  memberId: int,
  itemType: "class|trainer",
  itemId: int,
  position: int,
  createdAt: datetime,
  notifiedAt?: datetime
}

MembershipFreeze {
  id: int,
  memberId: int,
  startDate: date,
  endDate: date,
  reason: string,
  status: "pending|approved|active|expired",
  approvedBy?: int,
  notes?: string,
  frozenDays: int (calculated)
}

MemberCard {
  id: int,
  memberId: int,
  cardNumber: string (unique),
  qrCode: string (QR encoded cardNumber),
  isActive: bool,
  createdAt: datetime
}

BookingCancellation {
  id: int,
  bookingId: int,
  memberId: int,
  reason: string,
  cancelledAt: datetime,
  penalty?: double,
  refundAmount?: double,
  status: "pending|approved|rejected|processed"
}

Voucher {
  id: int,
  code: string (unique),
  discountType: "percentage|fixed",
  discountValue: double,
  maxUses?: int,
  usedCount: int,
  minOrderAmount?: double,
  validFrom: date,
  validUntil: date,
  applicableTo: string,
  isActive: bool,
  isExpired: bool (calculated),
  isExhausted: bool (calculated),
  createdAt: datetime
}

PushCampaign {
  id: int,
  title: string,
  message: string,
  targetAudience: string,
  sendAt?: datetime,
  sentAt?: datetime,
  status: "draft|scheduled|sent",
  recipientCount?: int,
  successCount?: int,
  createdAt: datetime
}

RefundRequest {
  id: int,
  bookingId: int,
  memberId: int,
  reason: string,
  requestedAmount: double,
  approvedAmount?: double,
  status: "pending|approved|rejected|processed",
  approvedBy?: int,
  refundMethod?: "wallet|bank_transfer",
  notes?: string,
  createdAt: datetime,
  processedAt?: datetime
}

TransactionReport {
  id: int,
  date: date,
  memberId?: int,
  trainerId?: int,
  type: string (booking|membership|package|refund|withdrawal),
  amount: double,
  description?: string,
  details?: object
}
