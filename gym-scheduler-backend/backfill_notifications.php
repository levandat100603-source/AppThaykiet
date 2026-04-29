<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Contracts\Console\Kernel;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

/** @var Kernel $kernel */
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

echo "Starting notifications backfill...\n";

if (!Schema::hasTable('notifications')) {
    echo "Notifications table does not exist. Please run migrations first.\n";
    exit(1);
}

// Helper to avoid duplicates by (user_id, title, message)
$exists = function ($userId, $title, $message) {
    return DB::table('notifications')
        ->where('user_id', $userId)
        ->where('title', $title)
        ->where('message', $message)
        ->exists();
};

$created = 0;

// Backfill for class bookings (booking_classes)
$classBookings = DB::table('booking_classes as bc')
    ->join('gym_classes as gc', 'bc.class_id', '=', 'gc.id')
    ->select('bc.id', 'bc.user_id', 'bc.class_id', 'bc.schedule', 'bc.status', 'gc.name as class_name')
    ->orderBy('bc.id', 'asc')
    ->get();

foreach ($classBookings as $b) {
    $title = 'Đặt lớp thành công';
    $message = ($b->class_name ?: 'Lớp') . ' • ' . ($b->schedule ?: '');

    if (!$exists($b->user_id, $title, $message)) {
        DB::table('notifications')->insert([
            'user_id'      => $b->user_id,
            'title'        => $title,
            'message'      => $message,
            'type'         => 'success',
            'related_type' => 'class',
            'related_id'   => $b->class_id,
            'is_read'      => 0,
            'created_at'   => now(),
            'updated_at'   => now(),
        ]);
        $created++;
    }
}

// Backfill for trainer bookings (booking_trainers)
$trainerBookings = DB::table('booking_trainers as bt')
    ->join('trainers as t', 'bt.trainer_id', '=', 't.id')
    ->select('bt.id', 'bt.user_id', 'bt.trainer_id', 'bt.schedule_info', 'bt.status', 't.name as trainer_name')
    ->orderBy('bt.id', 'asc')
    ->get();

foreach ($trainerBookings as $b) {
    if ($b->status === 'pending') {
        $title = 'Yêu cầu thuê HLV đã tạo';
        $message = ($b->trainer_name ?: 'HLV') . ' • ' . ($b->schedule_info ?: 'Chưa chọn lịch');
        $type = 'booking';
    } elseif ($b->status === 'confirmed') {
        $title = 'Đặt lịch được xác nhận';
        $message = 'Huấn luyện viên ' . ($b->trainer_name ?: 'HLV') . ' đã xác nhận lịch hẹn của bạn. Lịch: ' . ($b->schedule_info ?: '');
        $type = 'booking';
    } elseif ($b->status === 'rejected') {
        $title = 'Đặt lịch bị từ chối';
        $message = 'Huấn luyện viên ' . ($b->trainer_name ?: 'HLV') . ' đã từ chối lịch hẹn của bạn. Lịch: ' . ($b->schedule_info ?: '');
        $type = 'booking';
    } else {
        continue;
    }

    if (!$exists($b->user_id, $title, $message)) {
        DB::table('notifications')->insert([
            'user_id'      => $b->user_id,
            'title'        => $title,
            'message'      => $message,
            'type'         => $type,
            'related_type' => 'trainer',
            'related_id'   => $b->id,
            'is_read'      => 0,
            'created_at'   => now(),
            'updated_at'   => now(),
        ]);
        $created++;
    }
}

echo "Backfill done. Created {$created} notifications.\n";
exit(0);
