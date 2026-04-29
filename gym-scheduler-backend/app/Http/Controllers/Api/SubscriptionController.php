<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SubscriptionController extends Controller
{
    public function create(Request $request)
    {
        $user = Auth::user();

        $data = $request->validate([
            'payment_method' => 'required|string',
        ]);

        $user->createOrGetStripeCustomer();
        $user->updateDefaultPaymentMethod($data['payment_method']);

        $subscription = $user->newSubscription('default', 'price_basic_plan_id')
                             ->create($data['payment_method']);

        return response()->json($subscription);
    }
}

