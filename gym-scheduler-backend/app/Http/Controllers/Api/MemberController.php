<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class MemberController extends Controller
{
    public function saveExpoPushToken(Request $request)
    {
        $validated = $request->validate([
            'expo_push_token' => 'required|string|max:255',
        ]);

        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (Schema::hasColumn('members', 'expo_push_token')) {
            DB::table('members')
                ->where('email', $user->email)
                ->update([
                    'expo_push_token' => $validated['expo_push_token'],
                    'updated_at' => now(),
                ]);
        }

        return response()->json(['success' => true]);
    }

    public function index()
    {
        $hasUserMembershipColumns = Schema::hasColumn('users', 'membership_package')
            && Schema::hasColumn('users', 'membership_expiry');

        if ($hasUserMembershipColumns) {
            $users = DB::table('users')
                ->where('role', '!=', 'admin')
                ->whereNotNull('membership_package')
                ->orderBy('created_at', 'desc')
                ->get();

            $formattedUsers = $users->map(function ($user) {
                $expiryDate = $user->membership_expiry ? Carbon::parse($user->membership_expiry) : null;
                $isExpired = $expiryDate ? $expiryDate->isPast() : true;

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone ?? 'Chưa cập nhật',
                    'pack' => $user->membership_package,
                    'end' => $expiryDate ? $expiryDate->format('d/m/Y') : '-',
                    'status' => !$isExpired ? 'active' : 'expired',
                    'price' => 0,
                    'duration' => '0 tháng'
                ];
            });

            return response()->json($formattedUsers);
        }

        if (!Schema::hasTable('members')) {
            return response()->json([]);
        }

        $members = DB::table('members')
            ->orderBy('created_at', 'desc')
            ->get();

        // Keep only the latest package row per email in legacy members-table schema.
        $latestMembers = $members->unique('email')->values();

        $formattedMembers = $latestMembers->map(function ($member) {
            $expiryDate = null;
            if (!empty($member->end)) {
                try {
                    $expiryDate = Carbon::parse($member->end);
                } catch (\Throwable $th) {
                    $expiryDate = null;
                }
            }

            $isExpired = $expiryDate ? $expiryDate->isPast() : true;

            return [
                'id' => $member->id,
                'name' => $member->name,
                'email' => $member->email,
                'phone' => $member->phone ?? 'Chưa cập nhật',
                'pack' => $member->pack ?? 'Chưa đăng ký',
                'end' => $expiryDate ? $expiryDate->format('d/m/Y') : ($member->end ?? '-'),
                'status' => !$isExpired ? 'active' : 'expired',
                'price' => $member->price ?? 0,
                'duration' => $member->duration ?? '0 tháng'
            ];
        });

        return response()->json($formattedMembers);
    }

    
    public function getPendingBookings(Request $request)
    {
        $userId = auth()->user()->id;

        
        $pendingClasses = DB::table('booking_classes as bc')
            ->where('bc.user_id', $userId)
            ->where('bc.status', 'pending')
            ->join('gym_classes as gc', 'bc.class_id', '=', 'gc.id')
            ->select('bc.id', 'bc.class_id', 'gc.name', 'gc.time', 'gc.days', 'gc.price', 'gc.duration', 'gc.trainer_name', 'gc.location', 'bc.created_at')
            ->get();

        
        $pendingTrainers = DB::table('booking_trainers as bt')
            ->where('bt.user_id', $userId)
            ->where('bt.status', 'pending')
            ->join('trainers as t', 'bt.trainer_id', '=', 't.id')
            ->select('bt.id', 'bt.trainer_id', 't.name', 't.price', 't.spec', 'bt.created_at')
            ->get();

        return response()->json([
            'classes' => $pendingClasses,
            'trainers' => $pendingTrainers,
            'total_items' => count($pendingClasses) + count($pendingTrainers)
        ]);
    }

    public function checkBookingConflict(Request $request)
    {
        $memberId = $request->input('member_id');
        $type = $request->input('type');
        $itemId = $request->input('item_id');
        $schedule = $request->input('schedule');

        \Log::info('checkBookingConflict called', [
            'member_id' => $memberId,
            'type' => $type,
            'item_id' => $itemId,
            'schedule' => $schedule
        ]);

        if (!$memberId || !$type || !$itemId) {
            return response()->json(['conflict' => false, 'message' => 'Thiếu thông tin'], 400);
        }

        if ($type === 'class') {
            $query = DB::table('booking_classes')
                ->where('user_id', $memberId)
                ->where('class_id', $itemId);

            if ($schedule) {
                $query = $query->where('schedule', $schedule);
            }

            $existingClass = $query->whereIn('status', ['pending', 'confirmed'])->first();

            \Log::info('Class conflict check', [
                'found' => (bool)$existingClass,
                'member_id' => $memberId,
                'class_id' => $itemId,
                'schedule' => $schedule
            ]);

            if ($existingClass) {
                return response()->json(['conflict' => true, 'message' => 'Bạn đã có lịch lớp này rồi.']);
            }
        } elseif ($type === 'trainer') {
            $query = DB::table('booking_trainers')
                ->where('user_id', $memberId)
                ->where('trainer_id', $itemId);

            if ($schedule) {
                $query = $query->where('schedule_info', $schedule);
            }

            $existingTrainer = $query->whereIn('status', ['pending', 'confirmed'])->first();

            \Log::info('Trainer conflict check', [
                'found' => (bool)$existingTrainer,
                'member_id' => $memberId,
                'trainer_id' => $itemId,
                'schedule' => $schedule
            ]);

            if ($existingTrainer) {
                return response()->json(['conflict' => true, 'message' => 'Bạn đã có lịch với HLV này vào thời gian này rồi.']);
            }
        }

        return response()->json(['conflict' => false]);
    }
}
