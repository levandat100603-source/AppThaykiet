<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreWorkingHourRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->role === 'trainer';
    }

    public function rules(): array
    {
        return [
            'trainer_id' => 'required|integer|exists:users,id',
            'working_hours' => 'required|array|min:1',
            'working_hours.*.day_of_week' => 'required|integer|between:0,6|distinct',
            'working_hours.*.start_time' => 'required|date_format:H:i',
            'working_hours.*.end_time' => 'required|date_format:H:i|after:working_hours.*.start_time',
            'working_hours.*.is_active' => 'required|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'working_hours.*.day_of_week.distinct' => 'Cannot have duplicate days',
            'working_hours.*.end_time.after' => 'End time must be after start time',
        ];
    }
}
