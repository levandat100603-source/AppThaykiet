<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('trainers', function (Blueprint $table) {
            // Add user_id column if it doesn't exist
            if (!Schema::hasColumn('trainers', 'user_id')) {
                $table->unsignedBigInteger('user_id')->nullable()->after('id');
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            }
        });

        // Populate user_id for existing trainers by matching email
        $trainers = DB::table('trainers')->whereNull('user_id')->get();
        foreach ($trainers as $trainer) {
            if (!empty($trainer->email)) {
                $user = DB::table('users')
                    ->where('email', $trainer->email)
                    ->where('role', 'trainer')
                    ->first();
                
                if ($user) {
                    DB::table('trainers')
                        ->where('id', $trainer->id)
                        ->update(['user_id' => $user->id]);
                }
            }
            
            // If not found by email, try matching by name
            if (empty($trainer->email)) {
                $user = DB::table('users')
                    ->where('name', $trainer->name)
                    ->where('role', 'trainer')
                    ->first();
                
                if ($user) {
                    DB::table('trainers')
                        ->where('id', $trainer->id)
                        ->update(['user_id' => $user->id]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('trainers', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
        });
    }
};
