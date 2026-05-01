<?php

namespace App\Http\Controllers\Api;

use App\Models\Voucher;
use App\Models\PushCampaign;
use App\Models\RefundRequest;
use App\Models\WithdrawalRequest;
use App\Models\TransactionReport;
use App\Models\TrainerEarning;
use App\Models\Booking;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class AdminManagementController
{
    /**
     * Get all vouchers
     */
    public function getVouchers(Request $request): JsonResponse
    {
        $query = Voucher::query();

        if ($request->has('status')) {
            $status = $request->status;
            if ($status === 'expired') {
                $query->where('valid_until', '<', now());
            } elseif ($status === 'exhausted') {
                $query->whereRaw('max_uses IS NOT NULL AND used_count >= max_uses');
            }
        }

        $vouchers = $query->orderBy('created_at', 'desc')->get();
        return response()->json($vouchers);
    }

    /**
     * Create voucher
     */
    public function createVoucher(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:vouchers',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0',
            'max_uses' => 'nullable|integer|min:1',
            'min_order_amount' => 'nullable|numeric|min:0',
            'valid_from' => 'required|date',
            'valid_until' => 'required|date|after:valid_from',
            'applicable_to' => 'required|string|in:all,new_members,specific_packages',
        ]);

        $voucher = Voucher::create($validated);
        return response()->json($voucher, 201);
    }

    /**
     * Update voucher
     */
    public function updateVoucher($id, Request $request): JsonResponse
    {
        $voucher = Voucher::findOrFail($id);

        $validated = $request->validate([
            'is_active' => 'nullable|boolean',
            'valid_until' => 'nullable|date',
            'max_uses' => 'nullable|integer|min:1',
        ]);

        $voucher->update(array_filter($validated));
        return response()->json($voucher);
    }

    /**
     * Delete voucher
     */
    public function deleteVoucher($id): JsonResponse
    {
        Voucher::findOrFail($id)->delete();
        return response()->json(['success' => true]);
    }

    /**
     * Activate voucher
     */
    public function activateVoucher($id): JsonResponse
    {
        $voucher = Voucher::findOrFail($id);
        $voucher->update(['is_active' => true]);
        return response()->json($voucher);
    }

    /**
     * Deactivate voucher
     */
    public function deactivateVoucher($id): JsonResponse
    {
        $voucher = Voucher::findOrFail($id);
        $voucher->update(['is_active' => false]);
        return response()->json($voucher);
    }

    /**
     * Get all push campaigns
     */
    public function getCampaigns(Request $request): JsonResponse
    {
        $query = PushCampaign::query();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $campaigns = $query->orderBy('created_at', 'desc')->get();
        return response()->json($campaigns);
    }

    /**
     * Create push campaign
     */
    public function createCampaign(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'target_audience' => 'required|string|in:all,new_members,inactive',
            'send_at' => 'nullable|date',
        ]);

        $campaign = PushCampaign::create([
            ...$validated,
            'status' => 'draft',
        ]);

        return response()->json($campaign, 201);
    }

    /**
     * Update campaign (draft only)
     */
    public function updateCampaign($id, Request $request): JsonResponse
    {
        $campaign = PushCampaign::findOrFail($id);

        if ($campaign->status !== 'draft') {
            return response()->json(['error' => 'Can only edit draft campaigns'], 422);
        }

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'message' => 'nullable|string',
            'target_audience' => 'nullable|string|in:all,new_members,inactive',
        ]);

        $campaign->update(array_filter($validated));
        return response()->json($campaign);
    }

    /**
     * Schedule campaign
     */
    public function scheduleCampaign($id, Request $request): JsonResponse
    {
        $campaign = PushCampaign::findOrFail($id);

        $validated = $request->validate([
            'send_at' => 'required|date|after:now',
        ]);

        $campaign->update([
            'send_at' => $validated['send_at'],
            'status' => 'scheduled',
        ]);

        return response()->json($campaign);
    }

    /**
     * Send campaign immediately
     */
    public function sendCampaignNow($id): JsonResponse
    {
        $campaign = PushCampaign::findOrFail($id);

        // Get target users
        $query = User::whereIn('role', ['member', 'user']);

        if ($campaign->target_audience === 'new_members') {
            $query->where('created_at', '>', now()->subDays(30));
        } elseif ($campaign->target_audience === 'inactive') {
            // Inactive members - no booking in last 30 days
            $query->doesntHave('bookings')
                ->orWhereHas('bookings', function ($q) {
                    $q->where('created_at', '<', now()->subDays(30));
                });
        }

        $members = $query->get();
        $recipientCount = $members->count();

        // Send notifications (integrate with push notification service)
        $successCount = $recipientCount; // Placeholder

        $campaign->update([
            'sent_at' => now(),
            'status' => 'sent',
            'recipient_count' => $recipientCount,
            'success_count' => $successCount,
        ]);

        return response()->json([
            'success' => true,
            'sentCount' => $successCount,
        ]);
    }

    /**
     * Delete campaign (draft only)
     */
    public function deleteCampaign($id): JsonResponse
    {
        $campaign = PushCampaign::findOrFail($id);

        if ($campaign->status !== 'draft') {
            return response()->json(['error' => 'Can only delete draft campaigns'], 422);
        }

        $campaign->delete();
        return response()->json(['success' => true]);
    }

    /**
     * Get refund requests
     */
    public function getRefundRequests(Request $request): JsonResponse
    {
        $query = RefundRequest::query();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $refunds = $query->orderBy('created_at', 'desc')->get();
        return response()->json($refunds);
    }

    /**
     * Approve refund
     */
    public function approveRefund($id, Request $request): JsonResponse
    {
        $refund = RefundRequest::findOrFail($id);

        $validated = $request->validate([
            'approved_amount' => 'required|numeric|min:0',
            'refund_method' => 'required|string|in:wallet,bank_transfer',
            'notes' => 'nullable|string',
        ]);

        $refund->update([
            ...$validated,
            'status' => 'approved',
            'approved_by' => auth()->id(),
        ]);

        return response()->json($refund);
    }

    /**
     * Reject refund
     */
    public function rejectRefund($id, Request $request): JsonResponse
    {
        $refund = RefundRequest::findOrFail($id);

        $validated = $request->validate([
            'reason' => 'nullable|string',
        ]);

        $refund->update([
            'status' => 'rejected',
            'approved_by' => auth()->id(),
            'notes' => $validated['reason'] ?? null,
        ]);

        return response()->json($refund);
    }

    /**
     * Update refund request
     */
    public function updateRefundRequest($id, Request $request): JsonResponse
    {
        $refund = RefundRequest::findOrFail($id);

        $validated = $request->validate([
            'status' => 'nullable|in:pending,approved,rejected,processed',
            'approved_amount' => 'nullable|numeric|min:0',
        ]);

        $refund->update(array_filter($validated));
        return response()->json($refund);
    }

    /**
     * Get transaction reports
     */
    public function getTransactionReports(Request $request): JsonResponse
    {
        $query = TransactionReport::query();

        if ($request->has('fromDate')) {
            $query->where('date', '>=', $request->fromDate);
        }

        if ($request->has('toDate')) {
            $query->where('date', '<=', $request->toDate);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $reports = $query->orderBy('date', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json($reports);
    }

    /**
     * Export transaction reports to CSV
     */
    public function exportTransactionReports(Request $request)
    {
        $query = TransactionReport::query();

        if ($request->has('fromDate')) {
            $query->where('date', '>=', $request->fromDate);
        }

        if ($request->has('toDate')) {
            $query->where('date', '<=', $request->toDate);
        }

        $reports = $query->orderBy('date', 'desc')->get();

        // Create CSV
        $filename = 'transaction_reports_' . date('Y-m-d_H-i-s') . '.csv';
        $file = fopen('php://memory', 'w');
        fputcsv($file, ['Date', 'Member ID', 'Trainer ID', 'Type', 'Amount', 'Description']);

        foreach ($reports as $report) {
            fputcsv($file, [
                $report->date,
                $report->member_id,
                $report->trainer_id,
                $report->type,
                $report->amount,
                $report->description,
            ]);
        }

        rewind($file);
        $csv = stream_get_contents($file);
        fclose($file);

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ]);
    }

    /**
     * Get revenue statistics
     */
    public function getRevenueStats(Request $request): JsonResponse
    {
        $fromDate = $request->get('fromDate', now()->subMonth());
        $toDate = $request->get('toDate', now());

        $reports = TransactionReport::whereBetween('date', [$fromDate, $toDate])
            ->whereIn('type', ['booking', 'membership', 'package'])
            ->get();

        $totalRevenue = $reports->sum('amount');
        $totalTransactions = $reports->count();
        $avgOrderValue = $totalTransactions > 0 ? $totalRevenue / $totalTransactions : 0;

        return response()->json([
            'total_revenue' => round($totalRevenue, 2),
            'total_transactions' => $totalTransactions,
            'avg_order_value' => round($avgOrderValue, 2),
        ]);
    }

    /**
     * Get trainer payroll
     */
    public function getTrainerPayroll(Request $request): JsonResponse
    {
        $fromDate = $request->get('fromDate', now()->subMonth());
        $toDate = $request->get('toDate', now());

        $trainers = User::where('role', 'trainer');

        if ($request->has('trainerId')) {
            $trainers->where('id', $request->trainerId);
        }

        $payroll = $trainers->get()->map(function ($trainer) {
            $earnings = TrainerEarning::where('trainer_id', $trainer->id)->first();

            return [
                'trainer_id' => $trainer->id,
                'trainer_name' => $trainer->name,
                'total_sessions' => $earnings?->completed_sessions ?? 0,
                'total_earnings' => $earnings?->total_earnings ?? 0,
                'commission_rate' => $earnings?->commission_rate ?? 20,
                'payable_amount' => $earnings?->total_earnings ?? 0,
            ];
        });

        return response()->json($payroll);
    }

    /**
     * Get member activity report
     */
    public function getMemberActivity(Request $request): JsonResponse
    {
        $fromDate = $request->get('fromDate', now()->subMonth());
        $toDate = $request->get('toDate', now());

        $totalMembers = User::whereIn('role', ['member', 'user'])->count();
        $activeMembers = User::whereIn('role', ['member', 'user'])
            ->whereHas('bookings', function ($q) use ($fromDate, $toDate) {
                $q->whereBetween('created_at', [$fromDate, $toDate]);
            })
            ->count();

        $inactiveMembers = $totalMembers - $activeMembers;
        $newMembers = User::whereIn('role', ['member', 'user'])
            ->whereBetween('created_at', [$fromDate, $toDate])
            ->count();

        $cancelledMembers = 0; // Add logic to track cancellations

        $retentionRate = $totalMembers > 0 
            ? round(($activeMembers / $totalMembers) * 100, 2) 
            : 0;

        return response()->json([
            'active_members' => $activeMembers,
            'inactive_members' => $inactiveMembers,
            'new_members' => $newMembers,
            'cancelled_members' => $cancelledMembers,
            'retention_rate' => $retentionRate,
        ]);
    }

    /**
     * Get withdrawal requests for admin payroll screen
     */
    public function getWithdrawalRequests(Request $request): JsonResponse
    {
        $query = WithdrawalRequest::with(['trainer', 'approvedBy']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $requests = $query->orderBy('created_at', 'desc')->get()->map(function ($requestItem) {
            return [
                'id' => $requestItem->id,
                'trainer_id' => $requestItem->trainer_id,
                'trainer_name' => $requestItem->trainer?->name,
                'trainer_email' => $requestItem->trainer?->email,
                'trainer_phone' => $requestItem->trainer?->phone,
                'amount' => $requestItem->amount,
                'method' => $requestItem->method,
                'bank_details' => $requestItem->bank_details,
                'status' => $requestItem->status,
                'notes' => $requestItem->notes,
                'approved_by' => $requestItem->approved_by,
                'approved_by_name' => $requestItem->approvedBy?->name,
                'approved_at' => $requestItem->approved_at,
                'confirmation_images' => $requestItem->confirmation_images ?? [],
                'created_at' => $requestItem->created_at,
                'updated_at' => $requestItem->updated_at,
            ];
        });

        return response()->json($requests);
    }

    /**
     * Approve withdrawal request
     */
    public function approveWithdrawal($id, Request $request): JsonResponse
    {
        $withdrawal = WithdrawalRequest::findOrFail($id);

        $validated = $request->validate([
            'notes' => 'nullable|string',
            'confirmation_images' => 'nullable|array|max:3',
            'confirmation_images.*' => 'image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        if ($withdrawal->status !== 'pending') {
            return response()->json(['message' => 'Yêu cầu này đã được xử lý trước đó'], 422);
        }

        DB::beginTransaction();

        try {
            $storedImages = [];
            if ($request->hasFile('confirmation_images')) {
                foreach ((array) $request->file('confirmation_images') as $imageFile) {
                    if (!$imageFile) {
                        continue;
                    }

                    $storedPath = $imageFile->store('withdrawal-confirmations', 'public');
                    $storedImages[] = '/storage/' . $storedPath;
                }
            }

            $withdrawal->update([
                'status' => 'approved',
                'approved_by' => auth()->id(),
                'approved_at' => now(),
                'notes' => $validated['notes'] ?? null,
                'confirmation_images' => $storedImages,
            ]);

            DB::table('notifications')->insert([
                'user_id' => $withdrawal->trainer_id,
                'title' => 'Yêu cầu rút tiền đã được duyệt',
                'message' => 'Yêu cầu rút ' . number_format($withdrawal->amount, 0, ',', '.') . 'đ của bạn đã được admin xác nhận.',
                'type' => 'success',
                'related_type' => 'withdrawal',
                'related_id' => $withdrawal->id,
                'is_read' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::commit();

            return response()->json($withdrawal->fresh(['trainer', 'approvedBy']));
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['message' => 'Không thể duyệt yêu cầu: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Reject withdrawal request
     */
    public function rejectWithdrawal($id, Request $request): JsonResponse
    {
        $withdrawal = WithdrawalRequest::findOrFail($id);
        
        $validated = $request->validate([
            'notes' => 'required|string',
        ]);

        if ($withdrawal->status !== 'pending') {
            return response()->json(['message' => 'Yêu cầu này đã được xử lý trước đó'], 422);
        }

        DB::beginTransaction();

        try {
            $earning = TrainerEarning::firstOrCreate(
                ['trainer_id' => $withdrawal->trainer_id],
                [
                    'total_earnings' => 0,
                    'completed_sessions' => 0,
                    'pending_sessions' => 0,
                    'cancelled_sessions' => 0,
                    'withdrawal_balance' => 0,
                    'commission_rate' => 60,
                ]
            );

            $earning->update([
                'withdrawal_balance' => $earning->withdrawal_balance + $withdrawal->amount,
            ]);

            $withdrawal->update([
                'status' => 'rejected',
                'approved_by' => auth()->id(),
                'approved_at' => now(),
                'notes' => $validated['notes'],
            ]);

            DB::table('notifications')->insert([
                'user_id' => $withdrawal->trainer_id,
                'title' => 'Yêu cầu rút tiền bị từ chối',
                'message' => 'Yêu cầu rút ' . number_format($withdrawal->amount, 0, ',', '.') . 'đ của bạn đã bị từ chối. Số tiền đã được hoàn lại vào số dư.',
                'type' => 'warning',
                'related_type' => 'withdrawal',
                'related_id' => $withdrawal->id,
                'is_read' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::commit();

            return response()->json($withdrawal->fresh(['trainer', 'approvedBy']));
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['message' => 'Không thể từ chối yêu cầu: ' . $e->getMessage()], 500);
        }
    }
}
