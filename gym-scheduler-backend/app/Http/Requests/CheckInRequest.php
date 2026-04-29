<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckInRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->role === 'member';
    }

    public function rules(): array
    {
        return [
            'member_id' => 'required|integer|exists:users,id',
            'qr_code' => 'required|string|min:10',
        ];
    }
}
