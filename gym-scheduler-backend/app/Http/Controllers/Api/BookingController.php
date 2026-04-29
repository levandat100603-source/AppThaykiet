<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;

class BookingController extends Controller
{
    private function findTrainerForUser($user)
    {
        $trainer = null;

        if (Schema::hasColumn('trainers', 'user_id')) {
            try {
                $trainer = DB::table('trainers')->where('user_id', $user->id)->first();
            } catch (\Throwable $e) {
                $trainer = null;
            }
        }

        if (!$trainer && !empty($user->email)) {
            $trainer = DB::table('trainers')->where('email', $user->email)->first();
        }

        if (!$trainer) {
            $trainer = DB::table('trainers')->where('name', $user->name)->first();
        }

        return $trainer;
    }
    
    public function getAllPendingBookings(Request $request)
    {
        $bookings = DB::table('booking_trainers as bt')
            ->join('users as u', 'bt.user_id', '=', 'u.id')
            ->join('trainers as t', 'bt.trainer_id', '=', 't.id')
            ->where('bt.status', 'pending')
            ->select('bt.*', 'u.name as user_name', 'u.email as user_email', 'u.phone as user_phone', 't.name as trainer_name')
            ->orderBy('bt.created_at', 'desc')
            ->get();
        
        return response()->json($bookings);
    }

    
    public function getPendingBookings(Request $request)
    {
        $user = Auth::user();
        $trainer = $this->findTrainerForUser($user);
        if (!$trainer) {
            return response()->json(['message' => 'Bạn không phải huấn luyện viên'], 403);
        }
        
        
        $bookings = DB::table('booking_trainers as bt')
            ->join('users as u', 'bt.user_id', '=', 'u.id')
            ->where('bt.trainer_id', $trainer->id)
            ->where('bt.status', 'pending')
            ->select('bt.*', 'u.name as user_name', 'u.email as user_email', 'u.phone as user_phone')
            ->orderBy('bt.created_at', 'desc')
            ->get();
        
        return response()->json($bookings);
    }

    
    public function getTrainerSchedule(Request $request)
    {
        $user = Auth::user();
        $trainer = $this->findTrainerForUser($user);
        if (!$trainer) {
            return response()->json(['message' => 'Bạn không phải huấn luyện viên'], 403);
        }

        $bookings = DB::table('booking_trainers as bt')
            ->join('users as u', 'bt.user_id', '=', 'u.id')
            ->join('trainers as t', 'bt.trainer_id', '=', 't.id')
            ->where('bt.trainer_id', $trainer->id)
            ->whereIn('bt.status', ['confirmed', 'completed'])
            ->select('bt.*', 'u.name as user_name', 'u.email as user_email', 'u.phone as user_phone', 't.price as trainer_price')
            ->orderBy('bt.created_at', 'desc')
            ->get();

        return response()->json($bookings);
    }

    public function getRejectedBookings(Request $request)
    {
        $user = Auth::user();
        $trainer = $this->findTrainerForUser($user);
        if (!$trainer) {
            return response()->json(['message' => 'Bạn không phải huấn luyện viên'], 403);
        }

        $bookings = DB::table('booking_trainers as bt')
            ->join('users as u', 'bt.user_id', '=', 'u.id')
            ->join('trainers as t', 'bt.trainer_id', '=', 't.id')
            ->where('bt.trainer_id', $trainer->id)
            ->where('bt.status', 'rejected')
            ->select('bt.*', 'u.name as user_name', 'u.email as user_email', 'u.phone as user_phone', 't.price as trainer_price')
            ->orderBy('bt.updated_at', 'desc')
            ->get();

        return response()->json($bookings);
    }

    public function checkInBooking(Request $request)
    {
        $bookingId = $request->input('booking_id');
        $user = Auth::user();
        $trainer = $this->findTrainerForUser($user);

        if (!$trainer) {
            return response()->json(['message' => 'Bạn không phải huấn luyện viên'], 403);
        }

        $booking = DB::table('booking_trainers')->where('id', $bookingId)->first();
        if (!$booking || (int) $booking->trainer_id !== (int) $trainer->id) {
            return response()->json(['message' => 'Không tìm thấy lịch phù hợp'], 404);
        }

        if ($booking->status !== 'confirmed') {
            return response()->json(['message' => 'Lịch này chưa ở trạng thái đã xác nhận'], 422);
        }

        $trainerPrice = (float) (DB::table('trainers')->where('id', $trainer->id)->value('price') ?? 0);
        $payout = round($trainerPrice * 0.6, 2);
        $trainerUserId = (int) $user->id;

        DB::beginTransaction();

        try {
            DB::table('booking_trainers')
                ->where('id', $bookingId)
                ->update([
                    'status' => 'completed',
                    'updated_at' => now(),
                ]);

            $earning = DB::table('trainer_earnings')->where('trainer_id', $trainerUserId)->first();

            if (!$earning) {
                DB::table('trainer_earnings')->insert([
                    'trainer_id' => $trainerUserId,
                    'total_earnings' => $payout,
                    'completed_sessions' => 1,
                    'pending_sessions' => 0,
                    'cancelled_sessions' => 0,
                    'withdrawal_balance' => $payout,
                    'commission_rate' => 60,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } else {
                DB::table('trainer_earnings')
                    ->where('trainer_id', $trainerUserId)
                    ->update([
                        'total_earnings' => DB::raw('total_earnings + ' . $payout),
                        'completed_sessions' => DB::raw('completed_sessions + 1'),
                        'withdrawal_balance' => DB::raw('withdrawal_balance + ' . $payout),
                        'commission_rate' => 60,
                        'updated_at' => now(),
                    ]);
            }

            DB::table('notifications')->insert([
                'user_id' => $booking->user_id,
                'title' => 'Lịch dạy đã hoàn thành',
                'message' => "Huấn luyện viên {$trainer->name} đã xác nhận check-in lịch: {$booking->schedule_info}",
                'type' => 'booking',
                'related_type' => 'trainer',
                'related_id' => $bookingId,
                'is_read' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Đã xác nhận check-in',
                'payout' => $payout,
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['message' => 'Lỗi check-in: ' . $e->getMessage()], 500);
        }
    }
    
    
    public function confirmBooking(Request $request)
    {
        $bookingId = $request->input('booking_id');
        $action = $request->input('action'); 
        
        $user = Auth::user();
        
        
        $booking = DB::table('booking_trainers')->where('id', $bookingId)->first();
        
        if (!$booking) {
            return response()->json(['message' => 'Không tìm thấy đặt lịch'], 404);
        }
        
        
        if ($user->role !== 'admin') {
            $trainer = $this->findTrainerForUser($user);
            if (!$trainer || $trainer->id != $booking->trainer_id) {
                return response()->json(['message' => 'Bạn không có quyền thực hiện thao tác này'], 403);
            }
        }
        
        DB::beginTransaction();
        
        try {
            $newStatus = ($action === 'confirm') ? 'confirmed' : 'rejected';
            $trainerInfo = DB::table('trainers')->where('id', $booking->trainer_id)->first();
            $trainerUserId = (int) ($trainerInfo->user_id ?? 0);

            
            if ($newStatus === 'confirmed') {
                $conflict = DB::table('booking_trainers')
                    ->where('trainer_id', $booking->trainer_id)
                    ->where('status', 'confirmed')
                    ->where('schedule_info', $booking->schedule_info)
                    ->first();

                if ($conflict) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Lịch này đã bị trùng với một lịch dạy khác. Vui lòng chọn lịch khác.'
                    ], 409);
                }
            }
            
            
            DB::table('booking_trainers')
                ->where('id', $bookingId)
                ->update([
                    'status' => $newStatus,
                    'updated_at' => now()
                ]);

            if ($newStatus === 'rejected' && $trainerUserId > 0) {
                $earning = DB::table('trainer_earnings')->where('trainer_id', $trainerUserId)->first();

                if (!$earning) {
                    DB::table('trainer_earnings')->insert([
                        'trainer_id' => $trainerUserId,
                        'total_earnings' => 0,
                        'completed_sessions' => 0,
                        'pending_sessions' => 0,
                        'cancelled_sessions' => 1,
                        'withdrawal_balance' => 0,
                        'commission_rate' => 60,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                } else {
                    DB::table('trainer_earnings')
                        ->where('trainer_id', $trainerUserId)
                        ->update([
                            'cancelled_sessions' => DB::raw('cancelled_sessions + 1'),
                            'commission_rate' => 60,
                            'updated_at' => now(),
                        ]);
                }
            }
            
            
            $title = ($action === 'confirm') 
                ? 'Đặt lịch được xác nhận' 
                : 'Đặt lịch bị từ chối';
            
            $message = ($action === 'confirm')
                ? "Huấn luyện viên {$trainerInfo->name} đã xác nhận lịch hẹn của bạn. Lịch: {$booking->schedule_info}"
                : "Huấn luyện viên {$trainerInfo->name} đã từ chối lịch hẹn của bạn. Lịch: {$booking->schedule_info}";
            
            DB::table('notifications')->insert([
                'user_id' => $booking->user_id,
                'title' => $title,
                'message' => $message,
                'type' => 'booking',
                'related_type' => 'trainer',
                'related_id' => $bookingId,
                'is_read' => 0,
                'created_at' => now(),
                'updated_at' => now()
            ]);
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => ($action === 'confirm') ? 'Đã xác nhận đặt lịch' : 'Đã từ chối đặt lịch'
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }
    
    
    public function getNotifications(Request $request)
    {
        $user = Auth::user();
        
        $notifications = DB::table('notifications')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();
        
        $unreadCount = DB::table('notifications')
            ->where('user_id', $user->id)
            ->where('is_read', 0)
            ->count();
        
        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount
        ]);
    }
    
    
    public function markAsRead(Request $request)
    {
        $user = Auth::user();
        $notificationId = $request->input('notification_id');
        
        if ($notificationId) {
            
            DB::table('notifications')
                ->where('id', $notificationId)
                ->where('user_id', $user->id)
                ->update(['is_read' => 1, 'updated_at' => now()]);
        } else {
            
            DB::table('notifications')
                ->where('user_id', $user->id)
                ->update(['is_read' => 1, 'updated_at' => now()]);
        }
        
        return response()->json(['success' => true]);
    }
    
    
    public function getMyBookings(Request $request)
    {
        $user = Auth::user();
        
        $bookings = DB::table('booking_trainers as bt')
            ->join('trainers as t', 'bt.trainer_id', '=', 't.id')
            ->where('bt.user_id', $user->id)
            ->select('bt.*', 't.name as trainer_name', 't.image_url', 't.spec')
            ->orderBy('bt.created_at', 'desc')
            ->get();
        
        return response()->json($bookings);
    }
}

