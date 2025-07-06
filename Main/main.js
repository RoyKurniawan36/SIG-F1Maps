const THREE = require("three");
const { OrbitControls } = require("three/examples/jsm/controls/OrbitControls");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.SphereGeometry(5, 32, 32);
const textureLoader = new THREE.TextureLoader();
const earthTexture = textureLoader.load("/resources/img/2k_earth_daymap.jpg"); // Add your Earth texture path
const material = new THREE.MeshBasicMaterial({ map: earthTexture });
const earth = new THREE.Mesh(geometry, material);
scene.add(earth);

const markers = [];

function createMarker(lat, lon, race) {
  const markerGeometry = new THREE.SphereGeometry(0.1, 16, 16);
  const markerMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    emissive: 0xff0000,
  });
  const marker = new THREE.Mesh(markerGeometry, markerMaterial);

  // Convert lat/lon to 3D coordinates
  const radius = 5; // Same as the Earth radius
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  marker.position.x = radius * Math.sin(phi) * Math.cos(theta);
  marker.position.y = radius * Math.cos(phi);
  marker.position.z = radius * Math.sin(phi) * Math.sin(theta);

  scene.add(marker);
  markers.push({ marker, race });
}

fetch("connection.php")
  .then((response) => response.json())
  .then((data) => {
    data.forEach((race) => {
      createMarker(race.latitude, race.longitude, race);
    });
  });

const controls = new OrbitControls(camera, renderer.domElement);
camera.position.z = 10;

function animate() {
  requestAnimationFrame(animate);
  earth.rotation.y += 0.001; // Auto-rotation
  controls.update();
  renderer.render(scene, camera);
}
animate();

function createInfoPanel(race) {
  const infoPanel = document.createElement("div");
  infoPanel.style.position = "absolute";
  infoPanel.style.backgroundColor = "white";
  infoPanel.style.padding = "10px";
  infoPanel.innerHTML = `
    <h3>${race.full_title}</h3>
    <p>Date: ${race.date}</p>
    <p>Location: ${race.location}, ${race.country}</p>
  `;
  document.body.appendChild(infoPanel);
}

// Add click event to markers
markers.forEach((markerData) => {
  markerData.marker.userData = { race: markerData.race };
});

renderer.domElement.addEventListener("click", (event) => {
  const mouse = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(
    markers.map((marker) => marker.marker)
  );
  if (intersects.length > 0) {
    const intersectedMarker = intersects[0].object;
    createInfoPanel(intersectedMarker.userData.race);
    // Remove the marker from the scene
    scene.remove(intersectedMarker);
    // Remove the marker from the markers array
    const index = markers.indexOf(
      markers.find((marker) => marker.marker === intersectedMarker)
    );
    if (index > -1) {
      markers.splice(index, 1);
    }
  }
});
