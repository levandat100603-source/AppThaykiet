<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCampaignRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|min:5|max:255',
            'message' => 'required|string|min:10|max:1000',
            'target_audience' => 'required|string|in:all,new_members,inactive',
            'send_at' => 'nullable|date|after:now',
        ];
    }
}
