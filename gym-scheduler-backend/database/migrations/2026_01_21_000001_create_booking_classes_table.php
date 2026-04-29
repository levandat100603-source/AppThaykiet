<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    public function up(): void
    {
        Schema::create('booking_classes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('class_id')->constrained('gym_classes')->onDelete('cascade');
            $table->enum('status', ['pending', 'confirmed', 'completed', 'cancelled'])->default('pending');
            $table->boolean('booked_by_admin')->default(false);
            $table->timestamps();
            
            
            $table->unique(['user_id', 'class_id']);
        });
    }

    
    public function down(): void
    {
        Schema::dropIfExists('booking_classes');
    }
};

