<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Voucher extends Model
{
    protected $fillable = [
        'code',
        'discount_type',
        'discount_value',
        'max_uses',
        'used_count',
        'min_order_amount',
        'valid_from',
        'valid_until',
        'applicable_to',
        'is_active',
    ];

    protected $casts = [
        'discount_value' => 'decimal:2',
        'min_order_amount' => 'decimal:2',
        'valid_from' => 'date',
        'valid_until' => 'date',
        'is_active' => 'boolean',
    ];

    public function getIsExpiredAttribute(): bool
    {
        return Carbon::now()->gt($this->valid_until);
    }

    public function getIsExhaustedAttribute(): bool
    {
        return $this->max_uses && $this->used_count >= $this->max_uses;
    }

    public function getIsValidAttribute(): bool
    {
        return $this->is_active && !$this->is_expired && !$this->is_exhausted;
    }
}
