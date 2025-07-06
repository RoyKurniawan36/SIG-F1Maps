<?php
include 'db.php';

$stmt = $conn->prepare("INSERT INTO races (title, date, location, flag_url, full_title, image_url, map_url) VALUES (?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("sssssss", $_POST['title'], $_POST['date'], $_POST['location'], $_POST['flag_url'], $_POST['full_title'], $_POST['image_url'], $_POST['map_url']);
$stmt->execute();
$stmt->close();

header("Location: index.php");
?>
