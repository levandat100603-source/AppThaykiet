<?php

namespace App\Http\Controllers\Api;

use App\Models\WorkingHour;
use App\Models\TimeOff;
use App\Models\SessionNote;
use App\Models\WorkoutPlan;
use App\Models\TrainerEarning;
use App\Models\WithdrawalRequest;
use App\Models\Booking;
use App\Http\Requests\RequestWithdrawalRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class TrainerManagementController
{
    private function resolveTrainerId(): ?int
    {
        $user = Auth::user();

        if (!$user || $user->role !== 'trainer') {
            return null;
        }

        return (int) $user->id;
    }

    /**
     * Get working hours for a trainer
     */
    public function getWorkingHours($trainerId): JsonResponse
    {
        $authTrainerId = $this->resolveTrainerId();
        if (!$authTrainerId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $hours = WorkingHour::where('trainer_id', $authTrainerId)->get();
        return response()->json($hours);
    }

    /**
     * Save/update working hours
     */
    public function saveWorkingHours(Request $request): JsonResponse
    {
        $authTrainerId = $this->resolveTrainerId();
        if (!$authTrainerId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'working_hours' => 'required|array',
            'working_hours.*.day_of_week' => 'required|integer|between:0,6',
            'working_hours.*.start_time' => ['required', 'regex:/^(?:[01]\d|2[0-3]):[0-5]\d$/'],
            'working_hours.*.end_time' => ['required', 'regex:/^(?:[01]\d|2[0-3]):[0-5]\d$/'],
            'working_hours.*.is_active' => 'required|boolean',
        ], [
            'working_hours.*.start_time.regex' => 'Giờ chỉ được trong khoảng 00:00 - 23:59',
            'working_hours.*.end_time.regex' => 'Giờ chỉ được trong khoảng 00:00 - 23:59',
        ]);

        foreach ($validated['working_hours'] as $hour) {
            WorkingHour::updateOrCreate(
                [
                    'trainer_id' => $authTrainerId,
                    'day_of_week' => $hour['day_of_week'],
                ],
                [
                    'start_time' => $hour['start_time'],
                    'end_time' => $hour['end_time'],
                    'is_active' => $hour['is_active'],
                ]
            );
        }

        return response()->json(['success' => true, 'message' => 'Working hours saved']);
    }

    /**
     * Get all time-off requests for trainer
     */
    public function getTimeOff($trainerId): JsonResponse
    {
        $authTrainerId = $this->resolveTrainerId();
        if (!$authTrainerId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $timeOffs = TimeOff::where('trainer_id', $authTrainerId)
            ->orderBy('start_date', 'desc')
            ->get();
        return response()->json($timeOffs);
    }

    /**
     * Request time-off
     */
    public function requestTimeOff(Request $request): JsonResponse
    {
        $authTrainerId = $this->resolveTrainerId();
        if (!$authTrainerId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'reason' => 'required|string|in:vacation,medical,personal',
            'description' => 'nullable|string',
        ]);

        $validated['trainer_id'] = $authTrainerId;
        $timeOff = TimeOff::create($validated);
        return response()->json($timeOff, 201);
    }

    /**
     * Update time-off (admin approval)
     */
    public function updateTimeOff($id, Request $request): JsonResponse
    {
        $timeOff = TimeOff::findOrFail($id);
        
        $validated = $request->validate([
            'status' => 'required|in:pending,approved,rejected,cancelled',
            'approved_by' => 'required_if:status,approved|integer|exists:users,id',
            'notes' => 'nullable|string',
        ]);

        $timeOff->update($validated);
        return response()->json($timeOff);
    }

    /**
     * Cancel time-off request
     */
    public function cancelTimeOff($id): JsonResponse
    {
        $timeOff = TimeOff::findOrFail($id);
        $timeOff->update(['status' => 'cancelled']);
        return response()->json(['success' => true, 'message' => 'Time-off cancelled']);
    }

    /**
     * Add session note
     */
    public function addSessionNote(Request $request): JsonResponse
    {
        $authTrainerId = $this->resolveTrainerId();
        if (!$authTrainerId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'booking_id' => 'required|integer|exists:booking_trainers,id',
            'member_id' => 'required|integer|exists:users,id',
            'content' => 'required|string',
            'focus_areas' => 'nullable|array',
            'performance' => 'nullable|integer|between:1,5',
            'next_focus' => 'nullable|string',
        ]);

        $validated['trainer_id'] = $authTrainerId;
        $note = SessionNote::create($validated);
        return response()->json($note, 201);
    }

    /**
     * Get session notes for trainer
     */
    public function getSessionNotes($trainerId, Request $request): JsonResponse
    {
        $authTrainerId = $this->resolveTrainerId();
        if (!$authTrainerId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $query = SessionNote::where('trainer_id', $authTrainerId);

        if ($request->has('member_id')) {
            $query->where('member_id', $request->member_id);
        }

        $notes = $query->orderBy('created_at', 'desc')->get();
        return response()->json($notes);
    }

    /**
     * Update session note
     */
    public function updateSessionNote($id, Request $request): JsonResponse
    {
        $note = SessionNote::findOrFail($id);

        $validated = $request->validate([
            'content' => 'nullable|string',
            'focus_areas' => 'nullable|array',
            'performance' => 'nullable|integer|between:1,5',
            'next_focus' => 'nullable|string',
        ]);

        $note->update(array_filter($validated));
        return response()->json($note);
    }

    /**
     * Delete session note
     */
    public function deleteSessionNote($id): JsonResponse
    {
        SessionNote::findOrFail($id)->delete();
        return response()->json(['success' => true]);
    }

    /**
     * Create workout plan
     */
    public function createWorkoutPlan(Request $request): JsonResponse
    {
        $authTrainerId = $this->resolveTrainerId();
        if (!$authTrainerId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'member_id' => 'required|integer|exists:users,id',
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'duration' => 'nullable|integer|min:1',
            'difficulty' => 'nullable|string|in:beginner,intermediate,advanced',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);

        $validated['trainer_id'] = $authTrainerId;
        $plan = WorkoutPlan::create($validated);
        return response()->json($plan, 201);
    }

    /**
     * Get workout plans for trainer
     */
    public function getWorkoutPlans($trainerId, Request $request): JsonResponse
    {
        $authTrainerId = $this->resolveTrainerId();
        if (!$authTrainerId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $query = WorkoutPlan::where('trainer_id', $authTrainerId);

        if ($request->has('member_id')) {
            $query->where('member_id', $request->member_id);
        }

        $plans = $query->orderBy('created_at', 'desc')->get();
        return response()->json($plans);
    }

    /**
     * Update workout plan
     */
    public function updateWorkoutPlan($id, Request $request): JsonResponse
    {
        $plan = WorkoutPlan::findOrFail($id);

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'nullable|string',
            'duration' => 'nullable|integer|min:1',
            'difficulty' => 'nullable|string|in:beginner,intermediate,advanced',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);

        $plan->update(array_filter($validated));
        return response()->json($plan);
    }

    /**
     * Delete workout plan
     */
    public function deleteWorkoutPlan($id): JsonResponse
    {
        WorkoutPlan::findOrFail($id)->delete();
        return response()->json(['success' => true]);
    }

    /**
     * Get trainer earnings
     */
    public function getEarnings($trainerId): JsonResponse
    {
        $authTrainerId = $this->resolveTrainerId();
        if (!$authTrainerId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $earnings = TrainerEarning::where('trainer_id', $authTrainerId)->firstOrCreate(
            ['trainer_id' => $authTrainerId],
            [
                'total_earnings' => 0,
                'completed_sessions' => 0,
                'pending_sessions' => 0,
                'cancelled_sessions' => 0,
                'withdrawal_balance' => 0,
                'commission_rate' => 60,
            ]
        );

        if ((float) $earnings->commission_rate !== 60.0) {
            $earnings->commission_rate = 60;
            $earnings->save();
        }

        return response()->json($earnings);
    }

    /**
     * Request withdrawal
     */
    public function requestWithdrawal(RequestWithdrawalRequest $request): JsonResponse
    {
        $authTrainerId = $this->resolveTrainerId();
        if (!$authTrainerId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validated();
        $validated['trainer_id'] = $authTrainerId;

        $earnings = TrainerEarning::where('trainer_id', $authTrainerId)->first();

        if (!$earnings || $earnings->withdrawal_balance < $validated['amount']) {
            return response()->json(
                ['error' => 'Insufficient withdrawal balance'],
                422
            );
        }

        // Create withdrawal request record
        $withdrawalRequest = WithdrawalRequest::create([
            'trainer_id' => $authTrainerId,
            'amount' => $validated['amount'],
            'method' => $validated['method'],
            'bank_details' => $validated['bank_details'] ?? null,
            'status' => 'pending',
        ]);

        // Deduct from withdrawal_balance
        $earnings->update([
            'withdrawal_balance' => $earnings->withdrawal_balance - $validated['amount'],
        ]);

        return response()->json($withdrawalRequest, 201);
    }

    /**
     * Get withdrawal requests history
     */
    public function getWithdrawalRequests($trainerId): JsonResponse
    {
        $authTrainerId = $this->resolveTrainerId();
        if (!$authTrainerId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $requests = WithdrawalRequest::where('trainer_id', $authTrainerId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($requests);
    }
}
