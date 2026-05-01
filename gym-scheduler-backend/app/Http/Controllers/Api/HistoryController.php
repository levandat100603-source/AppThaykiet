<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class HistoryController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $hasUserMembershipColumns = Schema::hasColumn('users', 'membership_package')
            && Schema::hasColumn('users', 'membership_expiry');

        $membershipPackage = $hasUserMembershipColumns ? ($user->membership_package ?? null) : null;
        $membershipExpiry = $hasUserMembershipColumns ? ($user->membership_expiry ?? null) : null;

        if ((!$membershipPackage || !$membershipExpiry) && Schema::hasTable('members')) {
            $latestMember = DB::table('members')
                ->where('email', $user->email)
                ->orderBy('created_at', 'desc')
                ->first();

            if ($latestMember) {
                $membershipPackage = $membershipPackage ?: ($latestMember->pack ?? null);
                $membershipExpiry = $membershipExpiry ?: ($latestMember->end ?? null);
            }
        }

        $expiryDate = null;
        if (!empty($membershipExpiry)) {
            try {
                $expiryDate = Carbon::parse($membershipExpiry);
            } catch (\Throwable $th) {
                $expiryDate = null;
            }
        }

        $membership = [
            'package' => $membershipPackage ?? 'Chưa đăng ký',
            'expiry' => $expiryDate ? $expiryDate->toDateString() : $membershipExpiry,
            'is_active' => $expiryDate ? now()->lte($expiryDate) : false
        ];

        
        $classes = collect();
        if (Schema::hasTable('booking_classes') && Schema::hasTable('gym_classes')) {
            $classes = DB::table('booking_classes')
                ->join('gym_classes', 'booking_classes.class_id', '=', 'gym_classes.id')
                ->where('booking_classes.user_id', $user->id)
                ->select(
                    'gym_classes.name as class_name',
                    'gym_classes.location',
                    'booking_classes.schedule',
                    'booking_classes.status'
                )
                ->orderBy('booking_classes.created_at', 'desc')
                ->get();
        }

        
        $trainers = collect();
        if (Schema::hasTable('booking_trainers') && Schema::hasTable('trainers')) {
            $trainers = DB::table('booking_trainers')
                ->join('trainers', 'booking_trainers.trainer_id', '=', 'trainers.id')
                ->where('booking_trainers.user_id', $user->id)
                ->select(
                    'trainers.name as trainer_name',
                    'booking_trainers.schedule_info',
                    'booking_trainers.status'
                )
                ->orderBy('booking_trainers.created_at', 'desc')
                ->get();
        }

        return response()->json([
            'user_info' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar' => $user->avatar
            ],
            'membership' => $membership,
            'classes' => $classes,
            'trainers' => $trainers
        ]);
    }

    /**
     * Get payment order history for user
     */
    public function getPaymentOrders()
    {
        $user = Auth::user();
        $perPage = 10;
        $page = request()->query('page', 1);

        // Get total count
        $totalCount = DB::table('orders')
            ->where('user_id', $user->id)
            ->count();

        // Get paginated orders with items
        $orders = DB::table('orders')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get();

        // Map orders with order items
        $ordersWithItems = $orders->map(function ($order) {
            $items = DB::table('order_items')
                ->where('order_id', $order->id)
                ->get();

            return [
                'id' => $order->id,
                'total_amount' => (int)$order->total_amount,
                'payment_method' => $order->payment_method,
                'status' => $order->status,
                'vnpay_transaction_id' => $order->vnpay_transaction_id ?? null,
                'vnpay_response_code' => $order->vnpay_response_code ?? null,
                'vnpay_response_message' => $order->vnpay_response_message ?? null,
                'created_at' => $order->created_at,
                'payment_at' => in_array($order->status, ['completed', 'failed', 'cancelled'], true)
                    ? ($order->updated_at ?? $order->created_at)
                    : null,
                'items' => $items->toArray()
            ];
        });

        $lastPage = ceil($totalCount / $perPage);

        return response()->json([
            'orders' => $ordersWithItems,
            'total' => $totalCount,
            'current_page' => (int)$page,
            'last_page' => (int)$lastPage,
            'per_page' => $perPage
        ]);
    }
}
