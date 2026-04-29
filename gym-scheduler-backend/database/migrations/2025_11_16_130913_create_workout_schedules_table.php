<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    public function up(): void
    {
        Schema::create('workout_schedules', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');
        $table->foreignId('trainer_id')->nullable()->constrained('users')->onDelete('set null');
        $table->dateTime('start_time');
        $table->dateTime('end_time');
        $table->string('status')->default('scheduled'); 
        $table->string('title')->nullable(); 
        $table->text('notes')->nullable();
        $table->timestamps();
        });
    }

    
    public function down(): void
    {
        Schema::dropIfExists('workout_schedules');
    }
};

