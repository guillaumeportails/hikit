<?php

// 
$x = 2 + 3;
echo "<h2>Salut !<h2>";
echo $x;

$ch = curl_init("https://inreach.garmin.com/Feed/Share/ThierryBernier?d1=2017-07-14T00:00Z");
$fp = fopen("tracks/feed.kml", "w");

curl_setopt($ch, CURLOPT_FILE, $fp);
echo 'curl_file : ' . curl_error($ch);

curl_setopt($ch, CURLOPT_HEADER, 0);
echo 'curl_head : ' . curl_error($ch);

curl_exec($ch);
echo 'curl_exec : ' . curl_error($ch);

curl_close($ch);
echo 'curl_clos : ' . curl_error($ch);

fclose($fp);

?>

