<?php
require_once '../connection.php';
$query = $pdo->query("SELECT * FROM races");
$races = $query->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>F1 3D Race Globe</title>
  <link rel="stylesheet" href="/resources/css/modules.css">
  <style>
    body, html { margin: 0; padding: 0; overflow: hidden; background: black; }
  </style>
</head>
<body>
  <div id="globe-container"></div>
  <script>
    const raceData = <?php echo json_encode($races); ?>;
  </script>
  <script src="/resources/js/three.min.js"></script>
  <script src="/resources/js/OrbitControls.js"></script>
  <script src="/resources/js/globe.js"></script>
</body>
</html>
