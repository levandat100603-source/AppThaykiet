<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransactionReport extends Model
{
    protected $fillable = [
        'date',
        'member_id',
        'trainer_id',
        'type',
        'amount',
        'description',
        'details',
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
        'details' => 'array',
    ];

    public function member(): BelongsTo
    {
        return $this->belongsTo(User::class, 'member_id');
    }

    public function trainer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'trainer_id');
    }
}
