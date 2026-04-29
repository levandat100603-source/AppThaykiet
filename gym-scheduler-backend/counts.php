<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$tables = ['gym_classes','trainers','packages','members','users'];
foreach ($tables as $t) {
    $count = DB::table($t)->count();
    echo $t . '=' . $count . PHP_EOL;
}
