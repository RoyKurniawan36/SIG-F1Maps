<?php
include 'db.php';
$id = $_GET['id'];
$result = $conn->query("SELECT * FROM races WHERE id = $id");
$row = $result->fetch_assoc();
?>
<form method="POST" action="update.php">
    <input type="hidden" name="id" value="<?= $row['id'] ?>">
    Title: <input type="text" name="title" value="<?= $row['title'] ?>"><br>
    Date: <input type="text" name="date" value="<?= $row['date'] ?>"><br>
    Location: <input type="text" name="location" value="<?= $row['location'] ?>"><br>
    Flag URL: <input type="text" name="flag_url" value="<?= $row['flag_url'] ?>"><br>
    Full Title: <input type="text" name="full_title" value="<?= $row['full_title'] ?>"><br>
    Image URL: <input type="text" name="image_url" value="<?= $row['image_url'] ?>"><br>
    Map URL: <input type="text" name="map_url" value="<?= $row['map_url'] ?>"><br>
    <input type="submit" value="Update Race">
</form>
