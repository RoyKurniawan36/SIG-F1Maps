<?php
session_start();

// Handle form submissions
if ($_POST) {
    $action = $_POST['action'] ?? '';
    
    switch($action) {
        case 'create':
            $stmt = $pdo->prepare("INSERT INTO races (race_type, title, short_date, full_date, location, country, flag_url, image_url, full_title, map_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $_POST['race_type'],
                $_POST['title'],
                $_POST['short_date'],
                $_POST['full_date'],
                $_POST['location'],
                $_POST['country'],
                $_POST['flag_url'],
                $_POST['image_url'],
                $_POST['full_title'],
                $_POST['map_url'],
                $_POST['status']
            ]);
            $_SESSION['message'] = "Race created successfully!";
            break;
            
        case 'update':
            $stmt = $pdo->prepare("UPDATE races SET race_type=?, title=?, short_date=?, full_date=?, location=?, country=?, flag_url=?, image_url=?, full_title=?, map_url=?, status=? WHERE id=?");
            $stmt->execute([
                $_POST['race_type'],
                $_POST['title'],
                $_POST['short_date'],
                $_POST['full_date'],
                $_POST['location'],
                $_POST['country'],
                $_POST['flag_url'],
                $_POST['image_url'],
                $_POST['full_title'],
                $_POST['map_url'],
                $_POST['status'],
                $_POST['id']
            ]);
            $_SESSION['message'] = "Race updated successfully!";
            break;
            
        case 'delete':
            $stmt = $pdo->prepare("DELETE FROM races WHERE id = ?");
            $stmt->execute([$_POST['id']]);
            $_SESSION['message'] = "Race deleted successfully!";
            break;
    }
    
    header('Location: races.php');
    exit;
}

// Get race for editing
$edit_race = null;
if (isset($_GET['edit'])) {
    $stmt = $pdo->prepare("SELECT * FROM races WHERE id = ?");
    $stmt->execute([$_GET['edit']]);
    $edit_race = $stmt->fetch(PDO::FETCH_ASSOC);
}

// Get all races
$stmt = $pdo->query("SELECT * FROM races ORDER BY full_date ASC");
$races = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>