<?php
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
    $date = date('Y-m-d\TH:i:sO', $_GET["timestamp"]);
    $json = file_get_contents(
      "https://api.mlab.com/api/1/databases/gbgh/collections/events".
      "?apiKey=".$key.
      "&q=".urlencode("{startTime : {\$lt : \"$date\"}, endTime : {\$gt : \"$date\"}}").
      "&f=".urlencode("{'_id':0}")
    );
    echo($json);
    exit;
  }
}
?>
