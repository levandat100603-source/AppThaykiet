<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Add VNPay transaction tracking columns
            if (!Schema::hasColumn('orders', 'vnpay_transaction_id')) {
                $table->string('vnpay_transaction_id')->nullable()->after('payment_method');
            }
            
            if (!Schema::hasColumn('orders', 'vnpay_response_code')) {
                $table->string('vnpay_response_code')->nullable()->after('vnpay_transaction_id');
            }
            
            if (!Schema::hasColumn('orders', 'vnpay_response_message')) {
                $table->string('vnpay_response_message')->nullable()->after('vnpay_response_code');
            }
            
            // Change status column to have pending as default
            if (Schema::hasColumn('orders', 'status')) {
                $table->string('status')->default('pending')->change();
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'vnpay_transaction_id',
                'vnpay_response_code',
                'vnpay_response_message',
            ]);
        });
    }
};
