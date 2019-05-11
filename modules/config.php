<?php
// Timezone
date_default_timezone_set('Africa/Kigali');
$server = "localhost";
$user = "root";
$pass = "iamgeek";
$db = "intelligentform";

$GLOBALS['server'] = $server;
$GLOBALS['user'] = $user;
$GLOBALS['pass'] = $pass;
$GLOBALS['db'] = $db;
$conn = new mysqli($server, $user, $pass, $db);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
