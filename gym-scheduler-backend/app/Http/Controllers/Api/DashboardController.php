<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $currentYear = Carbon::now()->year;
        $monthlyStats = [];

        $hasOrders = Schema::hasTable('orders');
        $hasOrderItems = Schema::hasTable('order_items');
        $hasMembers = Schema::hasTable('members');
        $hasPackages = Schema::hasTable('packages');

        $packagePrices = [];
        if ($hasPackages) {
            $packagePrices = DB::table('packages')->pluck('price', 'name')->toArray();
        }

        
        for ($m = 1; $m <= 12; $m++) {
            $start = Carbon::create($currentYear, $m, 1)->startOfMonth();
            $end   = Carbon::create($currentYear, $m, 1)->endOfMonth();

            // Doanh thu
            if ($hasOrders) {
                $revenue = DB::table('orders')
                    ->where('status', 'completed')
                    ->whereBetween('created_at', [$start, $end])
                    ->sum('total_amount');
            } else if ($hasMembers) {
                // Fallback: tính doanh thu dựa vào giá gói của members bắt đầu trong tháng
                $revenue = DB::table('members')
                    ->whereBetween('start', [$start->toDateString(), $end->toDateString()])
                    ->get()
                    ->reduce(function ($carry, $member) use ($packagePrices) {
                        $price = $packagePrices[$member->pack] ?? 0;
                        return $carry + $price;
                    }, 0);
            } else {
                $revenue = 0;
            }

            // Hội viên mới
            if ($hasOrders && $hasOrderItems) {
                $usersBoughtInMonth = DB::table('orders')
                    ->join('order_items', 'orders.id', '=', 'order_items.order_id')
                    ->join('users', 'orders.user_id', '=', 'users.id')
                    ->where('order_items.item_type', 'membership')
                    ->where('orders.status', 'completed')
                    ->whereBetween('orders.created_at', [$start, $end])
                    ->distinct()
                    ->pluck('orders.user_id');

                $newMembersCount = 0;
                foreach ($usersBoughtInMonth as $userId) {
                    $hasHistory = DB::table('orders')
                        ->join('order_items', 'orders.id', '=', 'order_items.order_id')
                        ->where('order_items.item_type', 'membership')
                        ->where('orders.status', 'completed')
                        ->where('orders.user_id', $userId)
                        ->where('orders.created_at', '<', $start)
                        ->exists();
                    if (!$hasHistory) {
                        $newMembersCount++;
                    }
                }
            } else if ($hasMembers) {
                $newMembersCount = DB::table('members')
                    ->whereBetween('start', [$start->toDateString(), $end->toDateString()])
                    ->count();
            } else {
                $newMembersCount = 0;
            }

            $monthlyStats[] = [
                'month' => $m,
                'revenue' => $revenue,
                'new_members' => $newMembersCount
            ];
        }

        
        $currentMonthIndex = Carbon::now()->month - 1;
        $currentMonthData = $monthlyStats[$currentMonthIndex] ?? ['revenue' => 0, 'new_members' => 0];

        
        if ($hasMembers) {
            $totalMembers = DB::table('members')
                ->when(Schema::hasColumn('members', 'end'), function ($query) {
                    return $query->whereDate('end', '>=', Carbon::now());
                })
                ->when(Schema::hasColumn('members', 'status'), function ($query) {
                    return $query->where('status', 'active');
                })
                ->count();
        } else {
            $totalMembers = 0;
        }

        
        $targetRevenue = 50000000;
        $progress = ($targetRevenue > 0) ? ($currentMonthData['revenue'] / $targetRevenue) * 100 : 0;

        return response()->json([
            'current_month' => [
                'revenue' => $currentMonthData['revenue'],
                'new_members' => $currentMonthData['new_members'],
                'total_members' => $totalMembers, 
                'target' => $targetRevenue,
                'progress' => min($progress, 100)
            ],
            'monthly_stats' => $monthlyStats
        ]);
    }

    public function reset()
    {
        return response()->json(['message' => 'Đã cập nhật dữ liệu!']);
    }
}
