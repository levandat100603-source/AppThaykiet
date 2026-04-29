/**
 * BACKEND IMPLEMENTATION GUIDE
 * 
 * This guide provides step-by-step instructions for implementing
 * the API endpoints documented in API_ENDPOINTS.md in the Laravel backend
 * (gym-scheduler-backend folder)
 */

## 1. Database Schema Updates

Create migrations for new tables:

php artisan make:migration create_working_hours_table
php artisan make:migration create_time_offs_table
php artisan make:migration create_session_notes_table
php artisan make:migration create_workout_plans_table
php artisan make:migration create_trainer_earnings_table
php artisan make:migration create_waitlist_entries_table
php artisan make:migration create_membership_freezes_table
php artisan make:migration create_member_cards_table
php artisan make:migration create_booking_cancellations_table
php artisan make:migration create_vouchers_table
php artisan make:migration create_push_campaigns_table
php artisan make:migration create_refund_requests_table
php artisan make:migration create_transaction_reports_table

## 2. Database Table Schemas

### working_hours
CREATE TABLE working_hours (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  trainer_id BIGINT NOT NULL,
  day_of_week INT (0-6),
  start_time TIME,
  end_time TIME,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (trainer_id) REFERENCES users(id)
);

### time_offs
CREATE TABLE time_offs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  trainer_id BIGINT NOT NULL,
  start_date DATE,
  end_date DATE,
  reason VARCHAR(50),
  status ENUM('pending', 'approved', 'rejected', 'cancelled'),
  description TEXT,
  approved_by BIGINT,
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  approved_at TIMESTAMP NULL,
  FOREIGN KEY (trainer_id) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id)
);

### session_notes
CREATE TABLE session_notes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  booking_id BIGINT NOT NULL,
  trainer_id BIGINT NOT NULL,
  member_id BIGINT NOT NULL,
  content TEXT,
  focus_areas JSON,
  performance INT (1-5),
  next_focus TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id),
  FOREIGN KEY (trainer_id) REFERENCES users(id),
  FOREIGN KEY (member_id) REFERENCES users(id)
);

### workout_plans
CREATE TABLE workout_plans (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  trainer_id BIGINT NOT NULL,
  member_id BIGINT NOT NULL,
  title VARCHAR(255),
  content LONGTEXT,
  duration INT,
  difficulty VARCHAR(50),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (trainer_id) REFERENCES users(id),
  FOREIGN KEY (member_id) REFERENCES users(id)
);

### trainer_earnings
CREATE TABLE trainer_earnings (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  trainer_id BIGINT NOT NULL UNIQUE,
  total_earnings DECIMAL(15, 2),
  completed_sessions INT,
  pending_sessions INT,
  cancelled_sessions INT,
  withdrawal_balance DECIMAL(15, 2),
  commission_rate DECIMAL(5, 2),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (trainer_id) REFERENCES users(id)
);

### waitlist_entries
CREATE TABLE waitlist_entries (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  member_id BIGINT NOT NULL,
  item_type ENUM('class', 'trainer'),
  item_id BIGINT NOT NULL,
  position INT,
  created_at TIMESTAMP,
  notified_at TIMESTAMP NULL
);

### membership_freezes
CREATE TABLE membership_freezes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  member_id BIGINT NOT NULL,
  start_date DATE,
  end_date DATE,
  reason VARCHAR(50),
  status ENUM('pending', 'approved', 'active', 'expired'),
  approved_by BIGINT,
  notes TEXT,
  created_at TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id)
);

### member_cards
CREATE TABLE member_cards (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  member_id BIGINT NOT NULL UNIQUE,
  card_number VARCHAR(50) UNIQUE,
  qr_code TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES users(id)
);

### booking_cancellations
CREATE TABLE booking_cancellations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  booking_id BIGINT NOT NULL,
  member_id BIGINT NOT NULL,
  reason TEXT,
  cancelled_at TIMESTAMP,
  penalty DECIMAL(10, 2),
  refund_amount DECIMAL(10, 2),
  status ENUM('pending', 'approved', 'rejected', 'processed'),
  created_at TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id),
  FOREIGN KEY (member_id) REFERENCES users(id)
);

### vouchers
CREATE TABLE vouchers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) UNIQUE,
  discount_type ENUM('percentage', 'fixed'),
  discount_value DECIMAL(10, 2),
  max_uses INT,
  used_count INT DEFAULT 0,
  min_order_amount DECIMAL(10, 2),
  valid_from DATE,
  valid_until DATE,
  applicable_to VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

### push_campaigns
CREATE TABLE push_campaigns (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255),
  message TEXT,
  target_audience VARCHAR(100),
  send_at TIMESTAMP NULL,
  sent_at TIMESTAMP NULL,
  status ENUM('draft', 'scheduled', 'sent'),
  recipient_count INT,
  success_count INT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

### refund_requests
CREATE TABLE refund_requests (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  booking_id BIGINT NOT NULL,
  member_id BIGINT NOT NULL,
  reason TEXT,
  requested_amount DECIMAL(10, 2),
  approved_amount DECIMAL(10, 2),
  status ENUM('pending', 'approved', 'rejected', 'processed'),
  approved_by BIGINT,
  refund_method VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP,
  processed_at TIMESTAMP NULL,
  FOREIGN KEY (booking_id) REFERENCES bookings(id),
  FOREIGN KEY (member_id) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id)
);

### transaction_reports
CREATE TABLE transaction_reports (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  date DATE,
  member_id BIGINT,
  trainer_id BIGINT,
  type VARCHAR(50),
  amount DECIMAL(15, 2),
  description TEXT,
  details JSON,
  created_at TIMESTAMP
);

## 3. Model Classes

Create Eloquent models for each table:

php artisan make:model WorkingHour
php artisan make:model TimeOff
php artisan make:model SessionNote
php artisan make:model WorkoutPlan
php artisan make:model TrainerEarning
php artisan make:model WaitlistEntry
php artisan make:model MembershipFreeze
php artisan make:model MemberCard
php artisan make:model BookingCancellation
php artisan make:model Voucher
php artisan make:model PushCampaign
php artisan make:model RefundRequest
php artisan make:model TransactionReport

## 4. Controller Classes

Create controllers for each feature:

php artisan make:controller TrainerManagementController --model=User
php artisan make:controller MemberFeaturesController --model=User
php artisan make:controller AdminManagementController --model=User

## 5. Routes Definition

In routes/api.php:

```php
<?php

use App\Http\Controllers\TrainerManagementController;
use App\Http\Controllers\MemberFeaturesController;
use App\Http\Controllers\AdminManagementController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function () {
    
    // ===== TRAINER ROUTES =====
    Route::prefix('trainer')->group(function () {
        Route::get('working-hours/{trainerId}', [TrainerManagementController::class, 'getWorkingHours']);
        Route::post('working-hours', [TrainerManagementController::class, 'saveWorkingHours']);
        Route::put('working-hours/{id}', [TrainerManagementController::class, 'updateWorkingHour']);
        Route::delete('working-hours/{id}', [TrainerManagementController::class, 'deleteWorkingHour']);
        
        Route::get('time-off/{trainerId}', [TrainerManagementController::class, 'getTimeOff']);
        Route::post('time-off/request', [TrainerManagementController::class, 'requestTimeOff']);
        Route::put('time-off/{id}', [TrainerManagementController::class, 'updateTimeOff']);
        Route::delete('time-off/{id}', [TrainerManagementController::class, 'cancelTimeOff']);
        
        Route::post('session-notes', [TrainerManagementController::class, 'addSessionNote']);
        Route::get('session-notes/{trainerId}', [TrainerManagementController::class, 'getSessionNotes']);
        Route::put('session-notes/{id}', [TrainerManagementController::class, 'updateSessionNote']);
        Route::delete('session-notes/{id}', [TrainerManagementController::class, 'deleteSessionNote']);
        
        Route::post('workout-plans', [TrainerManagementController::class, 'createWorkoutPlan']);
        Route::get('workout-plans/{trainerId}', [TrainerManagementController::class, 'getWorkoutPlans']);
        Route::put('workout-plans/{id}', [TrainerManagementController::class, 'updateWorkoutPlan']);
        Route::delete('workout-plans/{id}', [TrainerManagementController::class, 'deleteWorkoutPlan']);
        
        Route::get('earnings/{trainerId}', [TrainerManagementController::class, 'getEarnings']);
        Route::post('withdrawal-request', [TrainerManagementController::class, 'requestWithdrawal']);
        Route::get('withdrawal-requests/{trainerId}', [TrainerManagementController::class, 'getWithdrawalRequests']);
    });
    
    // ===== MEMBER ROUTES =====
    Route::prefix('member')->group(function () {
        Route::get('waitlist/{memberId}', [MemberFeaturesController::class, 'getWaitlist']);
        Route::post('waitlist/join', [MemberFeaturesController::class, 'joinWaitlist']);
        Route::delete('waitlist/{id}', [MemberFeaturesController::class, 'leaveWaitlist']);
        Route::post('waitlist/{id}/notify', [MemberFeaturesController::class, 'notifyWaitlistMember']);
        
        Route::get('freeze/{memberId}', [MemberFeaturesController::class, 'getFreezeRequests']);
        Route::post('freeze/request', [MemberFeaturesController::class, 'requestFreeze']);
        Route::put('freeze/{id}', [MemberFeaturesController::class, 'approveFreezeRequest']);
        Route::delete('freeze/{id}', [MemberFeaturesController::class, 'cancelFreezeRequest']);
        
        Route::get('card/{memberId}', [MemberFeaturesController::class, 'getMemberCard']);
        Route::post('card/generate', [MemberFeaturesController::class, 'generateMemberCard']);
        
        Route::post('check-in/facility', [MemberFeaturesController::class, 'checkInFacility']);
        Route::get('check-in/history/{memberId}', [MemberFeaturesController::class, 'getCheckInHistory']);
    });
    
    // Booking routes (shared)
    Route::get('booking/{bookingId}/cancellation-policy', [MemberFeaturesController::class, 'getCancellationPolicy']);
    Route::post('booking/cancel', [MemberFeaturesController::class, 'cancelBooking']);
    Route::get('member/cancellations/{memberId}', [MemberFeaturesController::class, 'getCancellations']);
    
    // ===== ADMIN ROUTES =====
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('vouchers', [AdminManagementController::class, 'getVouchers']);
        Route::post('vouchers', [AdminManagementController::class, 'createVoucher']);
        Route::put('vouchers/{id}', [AdminManagementController::class, 'updateVoucher']);
        Route::delete('vouchers/{id}', [AdminManagementController::class, 'deleteVoucher']);
        Route::post('vouchers/{id}/activate', [AdminManagementController::class, 'activateVoucher']);
        Route::post('vouchers/{id}/deactivate', [AdminManagementController::class, 'deactivateVoucher']);
        
        Route::get('campaigns', [AdminManagementController::class, 'getCampaigns']);
        Route::post('campaigns', [AdminManagementController::class, 'createCampaign']);
        Route::put('campaigns/{id}', [AdminManagementController::class, 'updateCampaign']);
        Route::post('campaigns/{id}/schedule', [AdminManagementController::class, 'scheduleCampaign']);
        Route::post('campaigns/{id}/send-now', [AdminManagementController::class, 'sendCampaignNow']);
        Route::delete('campaigns/{id}', [AdminManagementController::class, 'deleteCampaign']);
        
        Route::get('refund-requests', [AdminManagementController::class, 'getRefundRequests']);
        Route::post('refund-requests/{id}/approve', [AdminManagementController::class, 'approveRefund']);
        Route::post('refund-requests/{id}/reject', [AdminManagementController::class, 'rejectRefund']);
        Route::put('refund-requests/{id}', [AdminManagementController::class, 'updateRefundRequest']);
        
        Route::get('reports/transactions', [AdminManagementController::class, 'getTransactionReports']);
        Route::get('reports/transactions/export', [AdminManagementController::class, 'exportTransactionReports']);
        Route::get('reports/revenue-stats', [AdminManagementController::class, 'getRevenueStats']);
        Route::get('reports/trainer-payroll', [AdminManagementController::class, 'getTrainerPayroll']);
        Route::get('reports/member-activity', [AdminManagementController::class, 'getMemberActivity']);
    });
});
```

## 6. Implementation Priority

Phase 1 (Week 1):
- [ ] Create all database migrations
- [ ] Create all Eloquent models
- [ ] Implement Trainer working hours + time-off endpoints

Phase 2 (Week 2):
- [ ] Implement Trainer session notes + workout plans
- [ ] Implement Trainer earnings + withdrawals
- [ ] Implement Member waitlist + freeze requests

Phase 3 (Week 3):
- [ ] Implement Member card + check-in
- [ ] Implement Member cancellation
- [ ] Implement Admin vouchers + campaigns

Phase 4 (Week 4):
- [ ] Implement Admin refund requests
- [ ] Implement Admin reports + analytics
- [ ] Add middleware authorization + validation

## 7. Testing

Run tests after each phase:

```bash
php artisan test
php artisan test --filter=TrainerManagementControllerTest
php artisan test --filter=AdminManagementControllerTest
```

## 8. Key Implementation Notes

1. **Authorization**: Always verify user role before allowing access to specific endpoints
2. **Data Validation**: Validate all input data in controllers/form requests
3. **Error Handling**: Return consistent error responses
4. **Events**: Trigger events for important actions (e.g., RefundApproved, CampaignSent)
5. **Jobs**: Use queued jobs for long-running tasks (e.g., SendPushNotifications)
6. **Caching**: Cache frequently accessed data (e.g., earnings stats)
7. **Logging**: Log all admin actions for audit trail
