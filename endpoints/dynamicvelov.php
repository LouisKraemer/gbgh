<?php
error_reporting( E_ALL );
ini_set('display_errors', 1);

require __DIR__ . "/vendor/autoload.php";

switch($_SERVER['REQUEST_METHOD'])
{
case 'GET': $the_request = &$_GET; break;
}

if( !isset($_GET["from"]) || !isset($_GET["until"]) ) {
  echo("{ 'error' : 'request needs \"from\" and \"until\" arguments, encoded in unix timestamp.' }");
  exit;
}
else {
  if (!is_numeric($_GET["from"]) || !is_numeric($_GET["until"])){
    echo("{ 'error' : 'arguments need to be numbers.' }");
    exit;
  }
  else {
    $client = new MongoDB\Client("mongodb://gcreti:gcreti@ds143388.mlab.com:43388/gbgh");
    $collection = $client->gbgh->dynamicVelov;
    $cursor = $collection->find(
      [
        'timestamp' => [
          '$gt' => intval($_GET["from"]),
          '$lt' => intval($_GET["until"])
        ]
      ],
      [
        'projection' => ['_id'=> 0]
      ]);
    echo json_encode(iterator_to_array($cursor));
    exit;
  }
}
?>
