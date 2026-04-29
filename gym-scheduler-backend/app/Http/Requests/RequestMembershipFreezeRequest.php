<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RequestMembershipFreezeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->role === 'member';
    }

    public function rules(): array
    {
        return [
            'member_id' => 'required|integer|exists:users,id',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after:start_date',
            'reason' => 'required|string|in:vacation,medical,personal',
            'notes' => 'nullable|string|max:500',
        ];
    }
}
