<?php
// Bootstrap Laravel framework
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Backfill trainer emails from users table
$trainers = DB::table('trainers')->get();
foreach ($trainers as $trainer) {
    $user = DB::table('users')
        ->where('role', 'trainer')
        ->where('name', $trainer->name)
        ->first();
    
    if ($user) {
        DB::table('trainers')
            ->where('id', $trainer->id)
            ->update([
                'email' => $user->email,
                'phone' => $user->phone ?? null
            ]);
        echo "Updated trainer {$trainer->name} with email {$user->email}\n";
    }
}
echo "Backfill completed!\n";
