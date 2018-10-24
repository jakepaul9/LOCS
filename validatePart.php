<?php

require ('../../mysqli_connect.php');
DEFINE ("KG_TO_LBS", 2.2046);
$partid = $_REQUEST['pname'];
$q = "SELECT id, pname, units, weight FROM Parts WHERE id='$partid'";
$r = @mysqli_query ($dbc, $q);
$row = mysqli_fetch_array($r, MYSQLI_ASSOC);

if(!$row){echo 'invalid';}
else{

$lbs = (float)$row[weight] * KG_TO_LBS;
$part_info = array(
	'id' => $row[id],
	'pname' => $row[pname],
	'units' => $row[units],
	'weight' => $lbs
);
//echo '<script>alert("from DB: id='.$row[id].' partname = '.$row[pname].'");</script>';

echo json_encode($part_info);
}

?>
