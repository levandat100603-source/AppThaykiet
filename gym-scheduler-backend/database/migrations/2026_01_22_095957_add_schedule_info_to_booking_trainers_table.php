<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('booking_trainers')) {
            return;
        }

        Schema::table('booking_trainers', function (Blueprint $table) {
            if (! Schema::hasColumn('booking_trainers', 'schedule_info')) {
                $table->string('schedule_info')->nullable()->after('trainer_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('booking_trainers') || ! Schema::hasColumn('booking_trainers', 'schedule_info')) {
            return;
        }

        Schema::table('booking_trainers', function (Blueprint $table) {
            $table->dropColumn('schedule_info');
        });
    }
};
