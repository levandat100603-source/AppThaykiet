<?php


namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WorkoutSchedule;
use App\Models\Member;
use App\Events\ScheduleUpdated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ScheduleController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $schedules = WorkoutSchedule::with('trainer')
            ->where('member_id', $user->id)
            ->orderBy('start_time')
            ->get();

        return response()->json($schedules);
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        $data = $request->validate([
            'trainer_id' => 'nullable|exists:users,id',
            'start_time' => 'required|date',
            'end_time'   => 'required|date|after:start_time',
            'title'      => 'nullable|string',
            'notes'      => 'nullable|string',
        ]);

        $schedule = WorkoutSchedule::create([
            'member_id'  => $user->id,
            'trainer_id' => $data['trainer_id'] ?? null,
            'start_time' => $data['start_time'],
            'end_time'   => $data['end_time'],
            'title'      => $data['title'] ?? null,
            'notes'      => $data['notes'] ?? null,
        ]);

        event(new ScheduleUpdated($schedule));

        return response()->json($schedule, 201);
    }

    public function update(Request $request, WorkoutSchedule $schedule)
    {
        $user = Auth::user();
        if ($user->role !== 'admin' && (int) $schedule->member_id !== (int) $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $data = $request->validate([
            'trainer_id' => 'nullable|exists:users,id',
            'start_time' => 'sometimes|date',
            'end_time'   => 'sometimes|date|after:start_time',
            'status'     => 'sometimes|string',
            'title'      => 'nullable|string',
            'notes'      => 'nullable|string',
        ]);

        $schedule->update($data);
        event(new ScheduleUpdated($schedule));

        return response()->json($schedule);
    }

    public function destroy(WorkoutSchedule $schedule)
    {
        $user = Auth::user();
        if ($user->role !== 'admin' && (int) $schedule->member_id !== (int) $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $schedule->delete();

        event(new ScheduleUpdated($schedule));

        return response()->json(['message' => 'Deleted']);
    }
}


