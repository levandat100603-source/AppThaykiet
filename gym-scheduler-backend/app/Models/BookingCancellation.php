<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingCancellation extends Model
{
    protected $fillable = [
        'booking_id',
        'member_id',
        'reason',
        'cancelled_at',
        'penalty',
        'refund_amount',
        'status',
    ];

    protected $casts = [
        'cancelled_at' => 'datetime',
        'penalty' => 'decimal:2',
        'refund_amount' => 'decimal:2',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(User::class, 'member_id');
    }
}
