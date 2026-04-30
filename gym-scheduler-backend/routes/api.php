<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ScheduleController; 
use App\Http\Controllers\Api\GymClassController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\HistoryController;
use App\Http\Controllers\Api\MemberController;
use App\Http\Controllers\Api\PackageController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\TrainerManagementController;
use App\Http\Controllers\Api\MemberFeaturesController;
use App\Http\Controllers\Api\AdminManagementController;

Route::get('/', function () {
    return response()->json(['message' => 'API OK']);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/send-verification-code', [AuthController::class, 'sendVerificationCode']);
Route::post('/verify-email', [AuthController::class, 'verifyEmail']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Public gym class catalog for app listing screens
Route::get('/gym-classes', [GymClassController::class, 'index']);
Route::get('/gym-classes/{id}', [GymClassController::class, 'show']);


Route::middleware('auth:sanctum')->group(function () {
    
    Route::get('/schedules', [ScheduleController::class, 'index']);
    Route::post('/schedules', [ScheduleController::class, 'store']);
    Route::put('/schedules/{schedule}', [ScheduleController::class, 'update']);
    Route::delete('/schedules/{schedule}', [ScheduleController::class, 'destroy']);
    
    

        // Trainer Management Routes
        Route::prefix('/trainer')->middleware(['role:trainer'])->group(function () {
            Route::get('/working-hours/{trainerId}', [TrainerManagementController::class, 'getWorkingHours']);
            Route::post('/working-hours', [TrainerManagementController::class, 'saveWorkingHours']);
        
            Route::get('/time-off/{trainerId}', [TrainerManagementController::class, 'getTimeOff']);
            Route::post('/time-off/request', [TrainerManagementController::class, 'requestTimeOff']);
        
            Route::post('/session-notes', [TrainerManagementController::class, 'addSessionNote']);
            Route::get('/session-notes/{trainerId}', [TrainerManagementController::class, 'getSessionNotes']);
            Route::put('/session-notes/{id}', [TrainerManagementController::class, 'updateSessionNote']);
            Route::delete('/session-notes/{id}', [TrainerManagementController::class, 'deleteSessionNote']);
        
            Route::post('/workout-plans', [TrainerManagementController::class, 'createWorkoutPlan']);
            Route::get('/workout-plans/{trainerId}', [TrainerManagementController::class, 'getWorkoutPlans']);
            Route::put('/workout-plans/{id}', [TrainerManagementController::class, 'updateWorkoutPlan']);
            Route::delete('/workout-plans/{id}', [TrainerManagementController::class, 'deleteWorkoutPlan']);
        
            Route::get('/earnings/{trainerId}', [TrainerManagementController::class, 'getEarnings']);
            Route::post('/withdrawal-request', [TrainerManagementController::class, 'requestWithdrawal']);
            Route::get('/withdrawal-requests/{trainerId}', [TrainerManagementController::class, 'getWithdrawalRequests']);
        });

    
        // Member Features Routes
        Route::prefix('/member')->middleware(['role:user,member'])->group(function () {
            Route::get('/waitlist/{memberId}', [MemberFeaturesController::class, 'getWaitlist']);
            Route::post('/waitlist/join', [MemberFeaturesController::class, 'joinWaitlist']);
            Route::delete('/waitlist/{id}', [MemberFeaturesController::class, 'leaveWaitlist']);
            Route::post('/waitlist/{id}/notify', [MemberFeaturesController::class, 'notifyWaitlistMember']);
        
            Route::get('/freezes/{memberId}', [MemberFeaturesController::class, 'getFreezeRequests']);
            Route::post('/freezes', [MemberFeaturesController::class, 'requestFreeze']);
            Route::delete('/freezes/{id}', [MemberFeaturesController::class, 'cancelFreezeRequest']);
        
            Route::get('/card/{memberId}', [MemberFeaturesController::class, 'getMemberCard']);
            Route::post('/card/generate', [MemberFeaturesController::class, 'generateMemberCard']);
            Route::post('/checkin', [MemberFeaturesController::class, 'checkInFacility']);
            Route::get('/checkin/history/{memberId}', [MemberFeaturesController::class, 'getCheckInHistory']);
        
            Route::get('/cancellations/{memberId}', [MemberFeaturesController::class, 'getCancellations']);
            Route::get('/cancellation-policy/{bookingId}', [MemberFeaturesController::class, 'getCancellationPolicy']);
            Route::post('/cancel-booking', [MemberFeaturesController::class, 'cancelBooking']);
        });

    
        // Admin Management Routes
        Route::prefix('/admin')->middleware(['role:admin'])->group(function () {
            // Voucher Management
            Route::get('/vouchers', [AdminManagementController::class, 'getVouchers']);
            Route::post('/vouchers', [AdminManagementController::class, 'createVoucher']);
            Route::put('/vouchers/{id}', [AdminManagementController::class, 'updateVoucher']);
            Route::delete('/vouchers/{id}', [AdminManagementController::class, 'deleteVoucher']);
            Route::post('/vouchers/{id}/activate', [AdminManagementController::class, 'activateVoucher']);
            Route::post('/vouchers/{id}/deactivate', [AdminManagementController::class, 'deactivateVoucher']);
        
            // Push Campaign Management
            Route::get('/campaigns', [AdminManagementController::class, 'getCampaigns']);
            Route::post('/campaigns', [AdminManagementController::class, 'createCampaign']);
            Route::put('/campaigns/{id}', [AdminManagementController::class, 'updateCampaign']);
            Route::post('/campaigns/{id}/schedule', [AdminManagementController::class, 'scheduleCampaign']);
            Route::post('/campaigns/{id}/send', [AdminManagementController::class, 'sendCampaignNow']);
            Route::delete('/campaigns/{id}', [AdminManagementController::class, 'deleteCampaign']);
        
            // Refund Management
            Route::get('/refunds', [AdminManagementController::class, 'getRefundRequests']);
            Route::post('/refunds/{id}/approve', [AdminManagementController::class, 'approveRefund']);
            Route::post('/refunds/{id}/reject', [AdminManagementController::class, 'rejectRefund']);
            Route::put('/refunds/{id}', [AdminManagementController::class, 'updateRefundRequest']);
        
            // Trainer Time-Off Approvals
            Route::put('/trainer/time-off/{id}', [TrainerManagementController::class, 'updateTimeOff']);
            Route::delete('/trainer/time-off/{id}', [TrainerManagementController::class, 'cancelTimeOff']);
            
            // Withdrawal Request Approvals
            Route::put('/trainer/withdrawal-requests/{id}', [AdminManagementController::class, 'approveWithdrawal']);
            Route::post('/trainer/withdrawal-requests/{id}/reject', [AdminManagementController::class, 'rejectWithdrawal']);
        
            // Reports and Statistics
            Route::get('/transactions', [AdminManagementController::class, 'getTransactionReports']);
            Route::get('/transactions/export', [AdminManagementController::class, 'exportTransactionReports']);
            Route::get('/revenue-stats', [AdminManagementController::class, 'getRevenueStats']);
            Route::get('/payroll', [AdminManagementController::class, 'getTrainerPayroll']);
            Route::get('/member-activity', [AdminManagementController::class, 'getMemberActivity']);
        });
    
    
    Route::get('/trainers', [AdminController::class, 'getTrainers']);
    Route::get('/packages', [AdminController::class, 'getPackages']);

    Route::middleware(['auth:sanctum', 'role:admin', 'can:admin-access'])->group(function () {
        Route::post('/admin/sync-trainers', [AdminController::class, 'syncTrainersUsers']);
        Route::get('/admin/data', [AdminController::class, 'getData']);
        Route::post('/admin/store', [AdminController::class, 'store']);
        Route::post('/admin/delete', [AdminController::class, 'delete']);
        Route::get('/admin/members', [MemberController::class, 'index']);
        Route::get('/admin/bookings', [BookingController::class, 'getAllPendingBookings']);
        Route::post('/admin/book-class', [AdminController::class, 'bookClassForMember']);
        Route::post('/admin/book-trainer', [AdminController::class, 'bookTrainerForMember']);
    });
    
    
    Route::post('/member/check-conflict', [MemberController::class, 'checkBookingConflict']);
    Route::post('/member/expo-token', [MemberController::class, 'saveExpoPushToken']);
    
    
    Route::post('/checkout', [OrderController::class, 'checkout']);
    
    
    Route::middleware('can:manage-trainer-bookings')->group(function () {
        Route::get('/bookings/pending', [BookingController::class, 'getPendingBookings']);
        Route::get('/bookings/trainer-schedule', [BookingController::class, 'getTrainerSchedule']);
        Route::get('/bookings/rejected', [BookingController::class, 'getRejectedBookings']);
        Route::post('/bookings/confirm', [BookingController::class, 'confirmBooking']);
        Route::post('/bookings/checkin', [BookingController::class, 'checkInBooking']);
    });
    Route::get('/bookings/my-bookings', [BookingController::class, 'getMyBookings']); 
    Route::get('/notifications', [BookingController::class, 'getNotifications']); 
    Route::post('/notifications/read', [BookingController::class, 'markAsRead']); 
    
    
    Route::get('/dashboard-stats', [DashboardController::class, 'index']);
    Route::post('/dashboard-reset', [DashboardController::class, 'reset']);
    Route::get('/user/history', [HistoryController::class, 'index']);
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);
    Route::post('/user/avatar', [AuthController::class, 'updateAvatar']);
    Route::post('/user/change-password', [AuthController::class, 'changePassword']);


});