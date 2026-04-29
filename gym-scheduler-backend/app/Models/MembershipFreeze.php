<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MembershipFreeze extends Model
{
    protected $fillable = [
        'member_id',
        'start_date',
        'end_date',
        'reason',
        'status',
        'approved_by',
        'notes',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function member(): BelongsTo
    {
        return $this->belongsTo(User::class, 'member_id');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function getFrozenDaysAttribute(): int
    {
        return $this->end_date->diffInDays($this->start_date);
    }
}
