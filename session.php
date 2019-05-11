<?php
include("modules/config.php");
session_start(); // Starting Session
// Storing Session
if (!isset($_SESSION['logged_user_info'])) {
	header('Location: index.php'); // Redirecting To Home Page
} else {
	$user_check = $_SESSION['logged_user_info'];
	// SQL Query To Fetch Complete Information Of User
	$query = "SELECT * FROM users WHERE id = '$user_check'";
	$query = $conn->query($query);
	$arr = $query->fetch_array();
	$names = $arr['names'];
	$userId = $arr['id'];
	if ($query->num_rows == 0) {
		header('Location: logout.php'); // Redirecting To Logout
	}
}
if (!isset($user_check)) {
	header('Location: ../index.php'); // Redirecting To Home Page
}
