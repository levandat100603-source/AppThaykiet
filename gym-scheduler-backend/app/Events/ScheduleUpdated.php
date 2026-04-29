<?php


namespace App\Events;

use App\Models\WorkoutSchedule;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class ScheduleUpdated implements ShouldBroadcast
{
    use SerializesModels;

    public WorkoutSchedule $schedule;

    public function __construct(WorkoutSchedule $schedule)
    {
        $this->schedule = $schedule;
    }

    public function broadcastOn()
    {
        return new Channel('member.'.$this->schedule->member_id);
    }

    public function broadcastAs()
    {
        return 'schedule.updated';
    }
}


