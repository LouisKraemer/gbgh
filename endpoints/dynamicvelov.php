<?php
header('Access-Control-Allow-Origin: *');
include 'apisecret.php';
if (isset($_GET["describe"])) {
  $json1 = file_get_contents(
    "https://api.mlab.com/api/1/databases/gbgh/collections/dynamicVelov".
    "?apiKey=".$key.
    "&s=".urlencode("{timestamp : 1}").
    "&f=".urlencode("{'_id':0, 'stations': 0}").
    "&l=1"
  );
  $json2 = file_get_contents(
    "https://api.mlab.com/api/1/databases/gbgh/collections/dynamicVelov".
    "?apiKey=".$key.
    "&s=".urlencode("{timestamp : -1}").
    "&f=".urlencode("{'_id':0, 'stations' : 0}").
    "&l=1"
  );
  echo "{ \"min\" : $json1, \"max\" : $json2}";
  exit;
}
if( !isset($_GET["from"]) || !isset($_GET["until"]) ) {
  echo("{ 'error' : 'request needs \"from\" and \"until\" arguments, encoded in unix timestamp. There may be a \"delta\" argument, in minutes, which describes the delta time before and after the given timestamp.' }");
  exit;
}
else {
  if (!is_numeric($_GET["from"]) || !is_numeric($_GET["until"])){
    echo("{ 'error' : 'arguments need to be numbers.' }");
    exit;
  }
  else {
    if (isset($_GET["delta"]) && is_numeric($_GET["delta"])) {
      $from = strval(intval($_GET["from"]) - 60 * intval($_GET["delta"]));
      $until = strval(intval($_GET["until"]) + 60 * intval($_GET["delta"]));
    }
    else {
      $from = $_GET["from"];
      $until = $_GET["until"];
    }
    $json = file_get_contents(
      "https://api.mlab.com/api/1/databases/gbgh/collections/dynamicVelov".
      "?apiKey=".$key.
      "&q=".urlencode("{timestamp : {\$gt : " . $from . ", \$lt : " . $until . "}}").
      "&f=".urlencode("{'_id':0}").
      "&l=60"
    );
    echo($json);
    exit;
  }
}
?>
