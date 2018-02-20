<?php
header('Access-Control-Allow-Origin: *');
include 'apisecret.php';
$json = file_get_contents(
  "https://api.mlab.com/api/1/databases/gbgh/collections/staticVelov".
  "?apiKey=".$key.
  "&f=".urlencode("{'_id':0}")
);
echo($json);
?>
