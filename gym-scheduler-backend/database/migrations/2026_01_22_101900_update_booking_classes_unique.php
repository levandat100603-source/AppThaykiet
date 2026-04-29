<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('booking_classes', function (Blueprint $table) {
            // Drop old unique if it exists (ignore errors)
            try {
                \Illuminate\Support\Facades\DB::statement('ALTER TABLE booking_classes DROP INDEX booking_classes_user_id_class_id_unique');
            } catch (\Throwable $e) {}

            $table->unique(['user_id', 'class_id', 'schedule'], 'booking_classes_user_class_schedule_unique');
        });
    }

    public function down(): void
    {
        Schema::table('booking_classes', function (Blueprint $table) {
            $table->dropUnique('booking_classes_user_class_schedule_unique');
            $table->unique(['user_id', 'class_id']);
        });
    }
};
