<?php
// Test file để kiểm tra query trainer_schedules
require_once 'bootstrap/app.php';

use Illuminate\Support\Facades\DB;

$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Test query trainers
echo "=== TRAINERS ===\n";
$trainers = DB::table('trainers')->select('id', 'user_id', 'name', 'email')->get();
foreach ($trainers as $t) {
    echo "ID: {$t->id}, User ID: {$t->user_id}, Name: {$t->name}, Email: {$t->email}\n";
}

echo "\n=== WORKING HOURS ===\n";
$workingHours = DB::table('working_hours')->select('id', 'trainer_id', 'day_of_week', 'start_time', 'end_time', 'is_active')->get();
foreach ($workingHours as $wh) {
    echo "ID: {$wh->id}, Trainer ID: {$wh->trainer_id}, Day: {$wh->day_of_week}, {$wh->start_time}-{$wh->end_time}, Active: {$wh->is_active}\n";
}

echo "\n=== TRAINER SCHEDULES QUERY ===\n";
$trainerSchedules = DB::table('working_hours as wh')
    ->join('users as trainer_user', 'wh.trainer_id', '=', 'trainer_user.id')
    ->leftJoin('trainers as t', 'trainer_user.id', '=', 't.user_id')
    ->orderBy('wh.day_of_week', 'asc')
    ->orderBy('wh.start_time', 'asc')
    ->get([
        'wh.id',
        'wh.trainer_id',
        'wh.day_of_week',
        'wh.start_time',
        'wh.end_time',
        'wh.is_active',
        'trainer_user.name as trainer_name',
        'trainer_user.email as trainer_email',
        'trainer_user.phone as trainer_phone',
        't.id as trainer_record_id',
        't.spec',
        't.bio',
    ]);

echo "Total results: " . count($trainerSchedules) . "\n";
foreach ($trainerSchedules as $ts) {
    echo "ID: {$ts->id}, Trainer ID: {$ts->trainer_id}, Name: {$ts->trainer_name}, Day: {$ts->day_of_week}\n";
}
