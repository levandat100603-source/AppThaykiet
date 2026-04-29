<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\User;

echo "\n========== DATABASE VERIFICATION ==========\n\n";

// Check each critical table
$tables = [
    'users',
    'gym_classes',
    'trainers', 
    'booking_classes',
    'booking_trainers',
    'orders',
    'order_items',
    'packages',
    'notifications',
    'working_hours',
    'time_offs',
    'waitlist_entries',
    'membership_freezes',
    'member_cards',
    'booking_cancellations',
];

foreach ($tables as $table) {
    $count = DB::table($table)->count();
    $status = $count > 0 ? '✓' : '✗';
    printf("[%s] %-30s %d rows\n", $status, $table, $count);
}

echo "\n========== USER ROLES ==========\n\n";
$users = User::select('id', 'name', 'email', 'role')->get();
foreach ($users as $user) {
    printf("[%d] %-30s %-25s %s\n", $user->id, $user->name, $user->email, $user->role ?? 'NO_ROLE');
}

echo "\n========== SUMMARY ==========\n";
$total = User::count();
printf("Total Users: %d\n", $total);
printf("Gym Classes: %d\n", DB::table('gym_classes')->count());
printf("Trainers: %d\n", DB::table('trainers')->count());
printf("Bookings: %d\n", DB::table('booking_classes')->count() + DB::table('booking_trainers')->count());
printf("Orders: %d\n", DB::table('orders')->count());

echo "\n✓ Database check complete!\n\n";
