<?php

use Carbon\Carbon;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('users') || !Schema::hasTable('members')) {
            return;
        }

        if (!Schema::hasColumn('users', 'membership_package') || !Schema::hasColumn('users', 'membership_expiry')) {
            return;
        }

        if (!Schema::hasColumn('members', 'email') || !Schema::hasColumn('members', 'pack') || !Schema::hasColumn('members', 'end')) {
            return;
        }

        $members = DB::table('members')
            ->whereNotNull('email')
            ->whereNotNull('pack')
            ->orderBy('created_at', 'desc')
            ->get();

        $latestByEmail = [];
        foreach ($members as $member) {
            $email = strtolower(trim((string) $member->email));
            if ($email === '' || isset($latestByEmail[$email])) {
                continue;
            }
            $latestByEmail[$email] = $member;
        }

        foreach ($latestByEmail as $email => $member) {
            $parsedExpiry = null;

            if (!empty($member->end)) {
                try {
                    $parsedExpiry = Carbon::parse($member->end)->endOfDay();
                } catch (\Throwable $th) {
                    $parsedExpiry = null;
                }
            }

            $user = DB::table('users')
                ->whereRaw('LOWER(email) = ?', [$email])
                ->first();

            if (!$user) {
                continue;
            }

            $updateData = [
                'updated_at' => now(),
            ];

            $hasPackage = !empty($user->membership_package);
            $hasExpiry = !empty($user->membership_expiry);

            if (!$hasPackage && !empty($member->pack)) {
                $updateData['membership_package'] = $member->pack;
            }

            if (!$hasExpiry && $parsedExpiry) {
                $updateData['membership_expiry'] = $parsedExpiry;
            }

            if (count($updateData) > 1) {
                DB::table('users')->where('id', $user->id)->update($updateData);
            }
        }
    }

    public function down(): void
    {
        // Intentionally left blank: data backfill should not be auto-reverted.
    }
};
