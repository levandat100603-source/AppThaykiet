<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PushCampaign extends Model
{
    protected $fillable = [
        'title',
        'message',
        'target_audience',
        'send_at',
        'sent_at',
        'status',
        'recipient_count',
        'success_count',
    ];

    protected $casts = [
        'send_at' => 'datetime',
        'sent_at' => 'datetime',
    ];
}
