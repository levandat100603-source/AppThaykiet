<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Member extends Model
{
    protected $fillable = [
        'user_id','dob','membership_type','membership_start','membership_end','expo_push_token'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function schedules()
    {
        return $this->hasMany(WorkoutSchedule::class);
    }
}


