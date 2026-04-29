<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RequestWithdrawalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->role === 'trainer';
    }

    public function rules(): array
    {
        return [
            'trainer_id' => 'required|integer|exists:users,id',
            'amount' => 'required|numeric|min:0.01|max:999999.99',
            'method' => 'required|string|in:bank_transfer,wallet',
            'bank_details' => 'nullable|array',
            'bank_details.account_number' => 'required_if:method,bank_transfer|string',
            'bank_details.account_holder' => 'required_if:method,bank_transfer|string',
            'bank_details.bank_name' => 'required_if:method,bank_transfer|string',
        ];
    }
}
