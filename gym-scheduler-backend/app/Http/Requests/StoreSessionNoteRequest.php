<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSessionNoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->role === 'trainer';
    }

    public function rules(): array
    {
        return [
            'trainer_id' => 'required|integer|exists:users,id',
            'booking_id' => 'required|integer|exists:booking_trainers,id',
            'member_id' => 'required|integer|exists:users,id',
            'content' => 'required|string|min:10|max:2000',
            'focus_areas' => 'nullable|array',
            'focus_areas.*' => 'string|max:100',
            'performance' => 'nullable|integer|between:1,5',
            'next_focus' => 'nullable|string|max:500',
        ];
    }
}
