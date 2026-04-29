<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CancelBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->role === 'member';
    }

    public function rules(): array
    {
        return [
            'member_id' => 'required|integer|exists:users,id',
            'booking_id' => 'required|integer|exists:bookings,id',
            'reason' => 'required|string|min:5|max:500',
        ];
    }
}
