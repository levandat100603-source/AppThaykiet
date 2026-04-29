<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    public function up()
{
    
    Schema::create('gym_classes', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('trainer_name')->nullable();
        $table->string('time'); 
        $table->string('duration');
        $table->string('days');
        $table->string('location');
        $table->integer('capacity');
        $table->integer('registered')->default(0);
        $table->decimal('price', 10, 0);
        $table->timestamps();
    });

    
    Schema::create('trainers', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('image')->nullable(); 
        $table->string('spec'); 
        $table->string('exp');  
        $table->decimal('rating', 2, 1)->default(5.0);
        $table->string('availability');
        $table->decimal('price', 10, 0);
        $table->timestamps();
    });

    
    Schema::create('packages', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('duration'); 
        $table->decimal('price', 10, 0);
        $table->decimal('old_price', 10, 0)->nullable();
        $table->integer('benefits'); 
        $table->text('benefits_text')->nullable(); 
        $table->string('color')->default('blue');
        $table->boolean('is_popular')->default(false);
        $table->string('status')->default('active');
        $table->timestamps();
    });

    
    Schema::create('members', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('email');
        $table->string('phone');
        $table->string('pack'); 
        $table->string('duration');
        $table->string('start'); 
        $table->string('end');
        $table->decimal('price', 10, 0);
        $table->string('status')->default('active');
        $table->timestamps();
    });
    }

    
    public function down(): void
    {
        Schema::dropIfExists('gym_tables');
    }
};

