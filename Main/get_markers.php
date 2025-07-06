<?php
require_once '../connection.php';

// Put your Google Maps API key here
$apiKey = 'AIzaSyAAgY3Vew0LpTLCBR_Sg98TKXrW_8Yk_4o';

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

        // Add placeholder for Google Maps API
        $mapHTML = "<div id='map-{$lat}-{$lng}' style='width:auto;height:240px;'></div>
            <script src='https://maps.googleapis.com/maps/api/js?key={$apiKey}&callback=initMap' async defer></script>
            <script>
                function initMap() {
                    const map = new google.maps.Map(document.getElementById('map-{$lat}-{$lng}'), {
                        zoom: 4,
                        center: { lat: {$lat}, lng: {$lng} }
                    });
                    const marker = new google.maps.Marker({
                        position: { lat: {$lat}, lng: {$lng} },
                        map: map
                    });
                }
            </script>";
        $labelHTML .= $mapHTML;


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

