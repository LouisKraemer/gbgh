<?php
header('Access-Control-Allow-Origin: *');
include 'apisecret.php';

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
    $json = file_get_contents(
      "https://api.mlab.com/api/1/databases/gbgh/collections/dynamicVelov".
      "?apiKey=".$key.
      "&q=".urlencode("{timestamp : {\$gt : ".$_GET['from'].", \$lt : ".$_GET['until']."}}").
      "&f=".urlencode("{'_id':0}").
      "&l=60"
    );
    echo($json);
    exit;
  }
}
?>
