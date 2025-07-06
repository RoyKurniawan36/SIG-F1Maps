import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const container = document.getElementById("globe-container");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  40,
  container.clientWidth / container.clientHeight,
  0.1,
  1000
);
camera.position.z = 4;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;

const light = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(light);

// Earth
const textureLoader = new THREE.TextureLoader();
const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
const earthMaterial = new THREE.MeshPhongMaterial({
  map: textureLoader.load("assets/globe-texture.jpg"),
  bumpMap: textureLoader.load("assets/globe-bump.jpg"),
  bumpScale: 0.02,
  transparent: true,
});
const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earthMesh);

// Atmosphere
const atmosphereMaterial = new THREE.ShaderMaterial({
  vertexShader: `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vNormal;
    void main() {
      float intensity = pow(0.9 - dot(vNormal, vec3(0, 0, 1.0)), 6.0);
      gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
    }
  `,
  blending: THREE.AdditiveBlending,
  side: THREE.BackSide,
  transparent: true,
});
const atmosphere = new THREE.Mesh(
  new THREE.SphereGeometry(1.05, 64, 64),
  atmosphereMaterial
);
scene.add(atmosphere);

// Convert lat/long to vector
function latLongToVector3(lat, lon, radius = 1.01) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

const markers = new THREE.Group();
scene.add(markers);

function createGlowingMarker() {
  const markerMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    transparent: true,
    opacity: 1.0,
  });

  const marker = new THREE.Mesh(
    new THREE.SphereGeometry(0.01, 8, 8),
    markerMaterial
  );
  marker.userData.glowPhase = Math.random() * Math.PI * 2;
  return marker;
}

raceData.forEach((race) => {
  const marker = createGlowingMarker();
  const pos = latLongToVector3(
    parseFloat(race.latitude),
    parseFloat(race.longitude)
  );
  marker.position.copy(pos);
  marker.userData = race;
  markers.add(marker);
});

// Info panel
const infoPanel = document.createElement("div");
infoPanel.className = "info-panel";
container.appendChild(infoPanel);

// Raycast
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function flyToPoint(targetVec) {
  const start = camera.position.clone();
  const end = targetVec.clone().normalize().multiplyScalar(2);
  let progress = 0;
  const duration = 60;

  function animateFly() {
    if (progress >= 1) return;
    progress += 1 / duration;
    camera.position.lerpVectors(start, end, easeOutCubic(progress));
    camera.lookAt(earthMesh.position);
    requestAnimationFrame(animateFly);
  }
  animateFly();
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function onClick(event) {
  mouse.x = (event.clientX / container.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / container.clientHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(markers.children);
  if (intersects.length > 0) {
    const race = intersects[0].object.userData;
    controls.autoRotate = false;
    flyToPoint(intersects[0].point);
    infoPanel.innerHTML = `<strong>${race.full_title}</strong><br>${race.location}, ${race.country}<br>${race.date}`;
    infoPanel.style.display = "block";
  } else {
    controls.autoRotate = true;
    infoPanel.style.display = "none";
  }
}
window.addEventListener("click", onClick);

// Resize
window.addEventListener("resize", () => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});

// Animate
function animate() {
  requestAnimationFrame(animate);
  earthMesh.rotation.y += 0.0005;
  const time = Date.now() * 0.005;
  markers.children.forEach((marker) => {
    const glow = 0.5 + Math.sin(time + marker.userData.glowPhase) * 0.5;
    marker.material.opacity = glow;
  });
  controls.update();
  renderer.render(scene, camera);
}
animate();
