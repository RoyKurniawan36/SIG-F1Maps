<?php
require_once '../connection.php';

header('Content-Type: application/json');

try {
    $stmt = $pdo->query("SELECT latitude, longitude, country, full_title FROM races");
    $markers = [];

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $lat = (float)$row['latitude'];
        $lng = (float)$row['longitude'];


        $countryCode = htmlspecialchars($row['country']); // example: "japan-flag"
        $flagFile = "../resources/img/flags/{$countryCode}.png";

        // Create label HTML with title and flag image
        $title = htmlspecialchars($row['full_title']);
        $labelHTML = "{$title} - <img src='{$flagFile}' alt='{$countryCode}' style='height:24px;'>";
        

        $markers[] = [
            'lat' => $lat,
            'lng' => $lng,
            'label' => $labelHTML
        ];
    }

    echo json_encode([
        'success' => true,
        'markers' => $markers
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}

