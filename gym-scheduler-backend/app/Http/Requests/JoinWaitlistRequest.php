<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class JoinWaitlistRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->role === 'member';
    }

    public function rules(): array
    {
        return [
            'member_id' => 'required|integer|exists:users,id',
            'item_type' => 'required|string|in:class,trainer',
            'item_id' => 'required|integer',
        ];
    }
}
