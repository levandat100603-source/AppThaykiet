<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVoucherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'code' => 'required|string|unique:vouchers|min:3|max:50|uppercase',
            'discount_type' => 'required|string|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0.01',
            'max_uses' => 'nullable|integer|min:1',
            'min_order_amount' => 'nullable|numeric|min:0',
            'valid_from' => 'required|date',
            'valid_until' => 'required|date|after:valid_from',
            'applicable_to' => 'required|string|in:all,new_members,specific_packages',
        ];
    }

    public function messages(): array
    {
        return [
            'code.uppercase' => 'Code must be uppercase',
        ];
    }
}
