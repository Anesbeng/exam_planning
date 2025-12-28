<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Salle;

$salles = Salle::all()->toArray();
file_put_contents(__DIR__ . '/salles_dump.json', json_encode($salles, JSON_PRETTY_PRINT));
echo "Wrote salles_dump.json (" . count($salles) . " rows)\n";