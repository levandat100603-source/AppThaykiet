<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkoutSchedule extends Model
{
    protected $fillable = [
        'member_id','trainer_id','start_time','end_time','status','title','notes'
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time'   => 'datetime',
    ];

    public function member()
    {
        return $this->belongsTo(Member::class);
    }

    public function trainer()
    {
        return $this->belongsTo(Trainer::class);
    }
}


