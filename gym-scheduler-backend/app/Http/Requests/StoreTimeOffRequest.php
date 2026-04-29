<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTimeOffRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->role === 'trainer';
    }

    public function rules(): array
    {
        return [
            'trainer_id' => 'required|integer|exists:users,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'reason' => 'required|string|in:vacation,medical,personal',
            'description' => 'nullable|string|max:500',
        ];
    }
}
