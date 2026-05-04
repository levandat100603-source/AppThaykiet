<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Support\GymClassSchedule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class OrderController extends Controller
{
    /**
     * Main checkout endpoint
     */
    public function checkout(Request $request)
    {
        $request->validate([
            'cart' => 'required|array',
            'payment_method' => 'required|string',
            'total' => 'required|numeric',
        ]);

        $user = Auth::user(); 
        $cart = $request->input('cart');
        $paymentMethod = $request->input('payment_method');
        $totalAmount = $request->input('total');

        if (empty($cart)) {
            return response()->json(['message' => 'Giỏ hàng trống'], 400);
        }

        DB::beginTransaction();

        try {
            // Create order with items
            $orderId = $this->createOrder($user->id, $totalAmount, $paymentMethod, $cart);

            // If VNPay, return payment URL for client to proceed
            if ($paymentMethod === 'vnpay') {
                DB::commit();
                return response()->json([
                    'success' => true,
                    'order_id' => $orderId,
                    'message' => 'Chuyển hướng thanh toán VNPay',
                    'requires_payment' => true,
                ], 200);
            }

            // For other payment methods, fulfill order immediately
            $this->fulfillOrder($orderId, $cart);
            
            DB::commit();
            return response()->json([
                'success' => true,
                'order_id' => $orderId,
                'message' => 'Thanh toán thành công',
            ], 200);

        } catch (\Exception $error) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi checkout: ' . $error->getMessage(),
            ], 400);
        }
    }

    /**
     * Create order and order items in database
     */
    public function createOrder($userId, $totalAmount, $paymentMethod, $cart)
    {
        $orderId = DB::table('orders')->insertGetId([
            'user_id' => $userId,
            'total_amount' => $totalAmount,
            'payment_method' => $paymentMethod,
            'status' => $paymentMethod === 'vnpay' ? 'pending' : 'completed',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create order items
        foreach ($cart as $item) {
            DB::table('order_items')->insert([
                'order_id' => $orderId,
                'item_id' => $item['id'],
                'item_name' => $item['name'],
                'item_type' => $item['type'], 
                'price' => $item['price'],
            ]);
        }

        return $orderId;
    }

    /**
     * Fulfill order - apply memberships, bookings, notifications
     */
    public function fulfillOrder($orderId, $cart)
    {
        $order = DB::table('orders')->find($orderId);
        $user = DB::table('users')->find($order->user_id);

        foreach ($cart as $item) {
            switch ($item['type']) {
                case 'membership':
                    $this->processMembership($user, $item);
                    break;
                case 'class':
                    $this->processClassBooking($user, $item);
                    break;
                case 'trainer':
                    $this->processTrainerBooking($user, $item);
                    break;
            }
        }
    }

    /**
     * Process membership activation
     */
    public function processMembership($user, $item)
    {
        $scheduleValue = $item['schedule'] ?? $item['duration'] ?? $item['pack'] ?? $item['name'] ?? '1 tháng';
        $months = (int) filter_var((string) $scheduleValue, FILTER_SANITIZE_NUMBER_INT);
        if ($months <= 0) $months = 1;
        $purchaseDate = Carbon::now();
        $newExpiry = $purchaseDate->copy()->addMonths($months);

        $hasUserMembershipColumns = Schema::hasColumn('users', 'membership_package')
            && Schema::hasColumn('users', 'membership_expiry');

        if ($hasUserMembershipColumns) {
            DB::table('users')->where('id', $user->id)->update([
                'membership_package' => $item['name'],
                'membership_expiry' => $newExpiry,
                'updated_at' => now()
            ]);
        }

        if (Schema::hasTable('members')) {
            $memberData = [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? 'Chưa cập nhật',
                'pack' => $item['name'],
                'duration' => $scheduleValue ?: ($months . ' tháng'),
                'start' => $purchaseDate->format('Y-m-d'),
                'end' => $newExpiry->format('Y-m-d'),
                'price' => $item['price'] ?? 0,
                'status' => 'active',
                'updated_at' => now(),
            ];

            $existingMember = DB::table('members')
                ->where('email', $user->email)
                ->orderBy('created_at', 'desc')
                ->first();

            if ($existingMember) {
                DB::table('members')
                    ->where('id', $existingMember->id)
                    ->update($memberData);
            } else {
                DB::table('members')->insert(array_merge($memberData, [
                    'created_at' => now(),
                ]));
            }
        }
    }

    /**
     * Process class booking
     */
    public function processClassBooking($user, $item)
    {
        $bookedForMember = $item['bookedForMember'] ?? false;
        $memberId = $item['memberId'] ?? null;
        
        $bookingUserId = ($bookedForMember && $memberId) ? $memberId : $user->id;
        
        $schedules = [];
        if (!empty($item['schedules']) && is_array($item['schedules'])) {
            $schedules = $item['schedules'];
        } elseif (!empty($item['schedule'])) {
            $schedules = [$item['schedule']];
        } else {
            $schedules = [now()->format('d/m/Y') . ' | ' . ($item['time'] ?? '')];
        }

        foreach ($schedules as $scheduleStr) {
            $scheduleParts = array_map('trim', explode('|', $scheduleStr, 2));
            $scheduleDate = $scheduleParts[0] ?? '';

            if (!GymClassSchedule::isOccurrenceActive($scheduleDate, $item['time'] ?? '', $item['duration'] ?? 0, now())) {
                throw new \Exception('Lớp học này đã hết thời gian đăng ký hoặc đã kết thúc.');
            }

            $existingBooking = DB::table('booking_classes')
                ->where('user_id', $bookingUserId)
                ->where('class_id', $item['id'])
                ->where('schedule', $scheduleStr)
                ->whereIn('status', ['pending', 'confirmed'])
                ->first();

            if ($existingBooking) {
                throw new \Exception('Khách hàng đã có lịch lớp này: ' . $scheduleStr);
            }

            DB::table('booking_classes')->insert([
                'user_id' => $bookingUserId,
                'class_id' => $item['id'],
                'schedule' => $scheduleStr,
                'status' => 'confirmed',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('gym_classes')->where('id', $item['id'])->increment('registered');

            DB::table('notifications')->insert([
                'user_id' => $bookingUserId,
                'title' => 'Đặt lớp thành công',
                'message' => $item['name'] . ' • ' . $scheduleStr,
                'type' => 'success',
                'related_type' => 'class',
                'related_id' => $item['id'],
                'is_read' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Process trainer booking
     */
    public function processTrainerBooking($user, $item)
    {
        $bookedForMember = $item['bookedForMember'] ?? false;
        $memberId = $item['memberId'] ?? null;
        
        $bookingUserId = ($bookedForMember && $memberId) ? $memberId : $user->id;
        
        $scheduleInfo = $item['schedule'] ?? null;

        $existingTrainerBooking = DB::table('booking_trainers')
            ->where('user_id', $bookingUserId)
            ->where('trainer_id', $item['id'])
            ->when($scheduleInfo, function ($q) use ($scheduleInfo) {
                return $q->where('schedule_info', $scheduleInfo);
            })
            ->whereIn('status', ['pending', 'confirmed'])
            ->first();

        if ($existingTrainerBooking) {
            throw new \Exception('Khách hàng đã có lịch với HLV này trong cùng thời gian.');
        }

        DB::table('booking_trainers')->insert([
            'user_id' => $bookingUserId,
            'trainer_id' => $item['id'],
            'schedule_info' => $scheduleInfo ?? 'Chưa chọn lịch',
            'status' => 'pending', 
            'created_at' => now(),
        ]);

        DB::table('notifications')->insert([
            'user_id' => $bookingUserId,
            'title' => 'Yêu cầu thuê HLV đã tạo',
            'message' => ($item['name'] ?? 'HLV') . ' • ' . ($scheduleInfo ?? 'Chưa chọn lịch'),
            'type' => 'booking',
            'related_type' => 'trainer',
            'related_id' => $item['id'],
            'is_read' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
