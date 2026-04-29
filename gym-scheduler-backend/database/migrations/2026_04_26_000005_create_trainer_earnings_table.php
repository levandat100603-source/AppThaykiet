<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trainer_earnings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trainer_id')->unique()->constrained('users')->onDelete('cascade');
            $table->decimal('total_earnings', 15, 2)->default(0);
            $table->integer('completed_sessions')->default(0);
            $table->integer('pending_sessions')->default(0);
            $table->integer('cancelled_sessions')->default(0);
            $table->decimal('withdrawal_balance', 15, 2)->default(0);
            $table->decimal('commission_rate', 5, 2)->default(20); // percentage
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trainer_earnings');
    }
};
