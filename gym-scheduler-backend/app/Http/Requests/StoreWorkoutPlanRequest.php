<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreWorkoutPlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->role === 'trainer';
    }

    public function rules(): array
    {
        return [
            'trainer_id' => 'required|integer|exists:users,id',
            'member_id' => 'required|integer|exists:users,id',
            'title' => 'required|string|min:3|max:255',
            'content' => 'required|string|min:20|max:5000',
            'duration' => 'nullable|integer|min:1|max:52',
            'difficulty' => 'nullable|string|in:beginner,intermediate,advanced',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
        ];
    }
}
