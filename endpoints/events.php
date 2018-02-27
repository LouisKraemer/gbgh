<?php
header('Access-Control-Allow-Origin: *');
include 'apisecret.php';

if( !isset($_GET["timestamp"])) {
  echo("{ 'error' : 'request needs \"timestamp\" argument, encoded in unix timestamp.' }");
  exit;
}
else {
  if (false){
    echo("{ 'error' : 'argument need to be a number.' }");
    exit;
  }
  else {
    if (isset($_GET["delta"]) && is_numeric($_GET["delta"])) {
      $from = date('Y-m-d\TH:i:sO', intval($_GET["timestamp"]) + 60 * intval($_GET["delta"]));
      $until = date('Y-m-d\TH:i:sO', intval($_GET["timestamp"]) - 60 * intval($_GET["delta"]));
    }
    else {
      $from = date('Y-m-d\TH:i:sO', intval($_GET["timestamp"]));
      $until = date('Y-m-d\TH:i:sO', intval($_GET["timestamp"]));
    }
    // $date = date('Y-m-d\TH:i:sO', intval($_GET["timestamp"]));
    $json = file_get_contents(
      "https://api.mlab.com/api/1/databases/gbgh/collections/events".
      "?apiKey=".$key.
      "&q=".urlencode("{startTime : {\$lt : \"$from\"}, endTime : {\$gt : \"$until\"}}").
      "&f=".urlencode("{'_id':0}")
    );
    echo($json);
    exit;
  }
}
?>
