<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Http\Controllers\SalleController;
use Illuminate\Http\Request;

$controller = new SalleController();

// call with empty params
$res = $controller->available(new Request());
echo "Empty params -> ";
echo json_encode($res->getData(), JSON_PRETTY_PRINT);

'try with specific date/time\n';
$res2 = $controller->available(new Request(['date' => '2025-12-26','start_time' => '09:00','end_time' => '11:00']));
echo "\nWith date/time -> ";
echo json_encode($res2->getData(), JSON_PRETTY_PRINT);
