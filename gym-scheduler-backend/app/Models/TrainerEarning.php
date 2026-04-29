<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrainerEarning extends Model
{
    protected $fillable = [
        'trainer_id',
        'total_earnings',
        'completed_sessions',
        'pending_sessions',
        'cancelled_sessions',
        'withdrawal_balance',
        'commission_rate',
    ];

    protected $casts = [
        'total_earnings' => 'decimal:2',
        'withdrawal_balance' => 'decimal:2',
        'commission_rate' => 'decimal:2',
    ];

    public function trainer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'trainer_id');
    }
}
