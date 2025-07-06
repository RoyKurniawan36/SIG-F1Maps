<?php
require_once '../connection.php';
header('Content-Type: application/json');

try {
    $stmt = $pdo->query("SELECT title, latitude, longitude, country FROM races");
    $markers = [];

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $markers[] = [
            'label' => $row['title'] . ' - ' . $row['country'],
            'lat' => floatval($row['latitude']),
            'lng' => floatval($row['longitude'])
        ];
    }

    echo json_encode(['success' => true, 'markers' => $markers]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
