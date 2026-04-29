<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('booking_trainers')) {
            return;
        }

        Schema::create('booking_trainers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('trainer_id')->nullable()->constrained('trainers')->nullOnDelete();
            $table->string('schedule_info')->nullable();
            $table->string('status', 50)->default('pending');
            $table->timestamps();

            $table->index('user_id');
            $table->index('trainer_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        if (Schema::hasTable('booking_trainers')) {
            Schema::dropIfExists('booking_trainers');
        }
    }
};
