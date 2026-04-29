<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ApproveRefundRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'approved_amount' => 'required|numeric|min:0.01',
            'refund_method' => 'required|string|in:wallet,bank_transfer',
            'notes' => 'nullable|string|max:500',
        ];
    }
}
