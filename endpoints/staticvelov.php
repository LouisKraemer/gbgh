<?php
// error_reporting( E_ALL );
// ini_set('display_errors', 1);

require __DIR__ . "/vendor/autoload.php";

$client = new MongoDB\Client("mongodb://gcreti:gcreti@ds143388.mlab.com:43388/gbgh");
$collection = $client->gbgh->staticVelov;

$cursor = $collection->find([],['projection' => ['_id'=> 0]]);
echo json_encode(iterator_to_array($cursor));
?>
