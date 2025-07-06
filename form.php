<?php
include 'connection.php';
session_start();

// Handle file upload
$uploadPath = "";
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_FILES['image_file']) && $_FILES['image_file']['error'] === 0) {
    $uploadDir = "uploads/";
    if (!is_dir($uploadDir)) mkdir($uploadDir);
    $uploadPath = $uploadDir . basename($_FILES["image_file"]["name"]);
    move_uploaded_file($_FILES["image_file"]["tmp_name"], $uploadPath);
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Race Manager</title>
    <style>
      .container { display: flex; gap: 2rem; }
.form-panel, .preview-panel { flex: 1; }
.race-img-preview { max-width: 100%; height: auto; }
        body { margin: 0; font-family: sans-serif; }
        .sidebar {
            height: 100vh; width: 200px;
            position: fixed; top: 0; left: 0;
            background-color: #111; padding-top: 20px;
        }
        .sidebar a {
            padding: 10px 15px; text-decoration: none; display: block; color: white;
        }
        .sidebar a:hover { background-color: #575757; }

        .main {
            margin-left: 210px; padding: 20px;
        }

        input[type="text"], button {
            width: 100%; margin-bottom: 10px; padding: 8px;
        }
        .race-card {
            border: 1px solid #ccc; padding: 10px; margin-bottom: 10px;
        }
        .race-img { width: 100%; max-height: 150px; object-fit: cover; }
    </style>
</head>
<body>

<div class="sidebar">
    <a href="form.php">🏁 Race Manager</a>
</div>
<div class="container">
    <div class="form-panel">
        <h2><?= $editData ? "Edit Race" : "Add New Race" ?></h2>
        <form method="POST" action="form.php" enctype="multipart/form-data">
            <input type="hidden" name="id" value="<?= $editData['id'] ?? '' ?>">

            <input type="text" name="title" id="title" placeholder="Race Title" value="<?= $editData['title'] ?? '' ?>"><br>
            <input type="text" name="date" id="date" placeholder="Race Date" value="<?= $editData['date'] ?? '' ?>"><br>
            
            <label>Upload Race Image</label><br>
            <input type="file" name="image_file" id="image_file" accept="image/*"><br><br>

            <input type="text" name="flag_url" id="flag_url" placeholder="Flag Image URL" value="<?= $editData['flag_url'] ?? '' ?>"><br>
            <input type="text" name="full_title" id="full_title" placeholder="Full Race Title" value="<?= $editData['full_title'] ?? '' ?>"><br>

            <label>Pick Race Location on Map</label>
            <div id="map" style="width: 100%; height: 300px;"></div><br>
            <input type="hidden" name="latitude" id="latitude">
            <input type="hidden" name="longitude" id="longitude">
            <input type="text" name="location" id="location" placeholder="Location Name (auto)" readonly><br>

            <button type="submit"><?= $editData ? "Update" : "Add" ?> Race</button>
        </form>
    </div>

    <div class="preview-panel">
        <h3>🔎 Live Preview</h3>
        <p><strong id="prev-title">Race Title</strong></p>
        <p><em id="prev-date">Race Date</em></p>
        <img id="prev-image" src="" class="race-img-preview"><br>
        <p>Location: <span id="prev-location">None</span></p>
        <p><small id="prev-full">Full Title</small></p>
        <img id="prev-flag" src="" width="40"><br>
    </div>
</div>
<script>
document.getElementById("title").addEventListener("input", e => {
    document.getElementById("prev-title").textContent = e.target.value;
});
document.getElementById("date").addEventListener("input", e => {
    document.getElementById("prev-date").textContent = e.target.value;
});
document.getElementById("full_title").addEventListener("input", e => {
    document.getElementById("prev-full").textContent = e.target.value;
});
document.getElementById("flag_url").addEventListener("input", e => {
    document.getElementById("prev-flag").src = e.target.value;
});
document.getElementById("image_file").addEventListener("change", e => {
    const [file] = e.target.files;
    if (file) document.getElementById("prev-image").src = URL.createObjectURL(file);
});
</script>

<!-- Leaflet.js for Map -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.3/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.3/dist/leaflet.js"></script>
<script>
const map = L.map('map').setView([25.0, 55.0], 2); // Default view

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let marker;
map.on('click', function(e) {
    const { lat, lng } = e.latlng;

    if (marker) marker.setLatLng([lat, lng]);
    else marker = L.marker([lat, lng]).addTo(map);

    document.getElementById("latitude").value = lat;
    document.getElementById("longitude").value = lng;

    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(response => response.json())
        .then(data => {
            const location = data.address.city || data.address.town || data.address.state || "Unknown";
            document.getElementById("location").value = location;
            document.getElementById("prev-location").textContent = location;
        });
});
</script>
</body>
</html>
