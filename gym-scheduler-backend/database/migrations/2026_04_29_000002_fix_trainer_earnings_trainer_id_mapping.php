<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $trainers = DB::table('trainers')->select('id', 'user_id')->whereNotNull('user_id')->get();

        foreach ($trainers as $trainer) {
            $legacyEarning = DB::table('trainer_earnings')->where('trainer_id', $trainer->id)->first();
            $correctEarning = DB::table('trainer_earnings')->where('trainer_id', $trainer->user_id)->first();

            if (!$legacyEarning) {
                continue;
            }

            if ($correctEarning) {
                DB::table('trainer_earnings')
                    ->where('id', $correctEarning->id)
                    ->update([
                        'total_earnings' => $correctEarning->total_earnings + $legacyEarning->total_earnings,
                        'completed_sessions' => $correctEarning->completed_sessions + $legacyEarning->completed_sessions,
                        'pending_sessions' => $correctEarning->pending_sessions + $legacyEarning->pending_sessions,
                        'cancelled_sessions' => $correctEarning->cancelled_sessions + $legacyEarning->cancelled_sessions,
                        'withdrawal_balance' => $correctEarning->withdrawal_balance + $legacyEarning->withdrawal_balance,
                        'commission_rate' => $correctEarning->commission_rate ?: $legacyEarning->commission_rate,
                        'updated_at' => now(),
                    ]);

                DB::table('trainer_earnings')->where('id', $legacyEarning->id)->delete();
                continue;
            }

            DB::table('trainer_earnings')
                ->where('id', $legacyEarning->id)
                ->update([
                    'trainer_id' => $trainer->user_id,
                    'updated_at' => now(),
                ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Data fix only; no safe rollback.
    }
};
