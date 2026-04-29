<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transaction_reports', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->foreignId('member_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('trainer_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('type'); // booking, membership, package, refund, withdrawal
            $table->decimal('amount', 15, 2);
            $table->text('description')->nullable();
            $table->json('details')->nullable();
            $table->timestamps();
            $table->index(['date', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaction_reports');
    }
};
