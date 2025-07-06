import * as THREE from "https://unpkg.com/three@0.155.0/build/three.module.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Basic setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setClearColor(0x15151e, 1);
document.body.appendChild(renderer.domElement);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.3;
controls.minDistance = 3;
controls.maxDistance = 20;

// Lighting
const focusLight = new THREE.SpotLight(0xffffff, 0);
focusLight.angle = Math.PI / 8;
focusLight.penumbra = 0.2;
scene.add(focusLight.target);

const sunLight = new THREE.DirectionalLight(0xffffff, 1);
scene.add(sunLight);

// Earth
const loader = new THREE.TextureLoader();
const dayTexture = loader.load("../resources/img/8k_earth_daymap.jpg", () => {
  document.getElementById("loading").style.display = "none";
});
const nightTexture = loader.load("../resources/img/8k_earth_nightmap.jpg");

// Custom shader material for day/night effect
const earthMaterial = new THREE.ShaderMaterial({
  uniforms: {
    dayMap: { value: dayTexture },
    nightMap: { value: nightTexture },
    lightDirection: { value: new THREE.Vector3() },
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec2 vUv;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D dayMap;
    uniform sampler2D nightMap;
    uniform vec3 lightDirection;
    varying vec3 vNormal;
    varying vec2 vUv;
    
    void main() {
      vec3 dayColor = texture2D(dayMap, vUv).rgb;
      vec3 nightColor = texture2D(nightMap, vUv).rgb;
      
      // Calculate how much the surface faces the light
      float lightIntensity = dot(normalize(vNormal), lightDirection);
      
      // Blend between day and night based on light exposure
      float blendFactor = smoothstep(-0.2, 0.2, lightIntensity);
      vec3 color = mix(nightColor, dayColor, blendFactor);
      
      gl_FragColor = vec4(color, 1.0);
    }
  `,
});

const earthGeo = new THREE.SphereGeometry(2, 128, 128);
const earth = new THREE.Mesh(earthGeo, earthMaterial);
scene.add(earth);

// Stars
const starsGeo = new THREE.BufferGeometry();
const vertices = [];
for (let i = 0; i < 15000; i++) {
  vertices.push(
    (Math.random() - 0.5) * 400,
    (Math.random() - 0.5) * 400,
    (Math.random() - 0.5) * 400
  );
}
starsGeo.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(vertices, 3)
);
const stars = new THREE.Points(
  starsGeo,
  new THREE.PointsMaterial({ color: 0xffffff, size: 0.5, opacity: 0.8 })
);
scene.add(stars);

// Marker logic
const markers = [];

function latLngToVector3(lat, lng, radius = 2) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function createMarker(lat, lng, label = "") {
  const marker = new THREE.Mesh(
    new THREE.SphereGeometry(0.02, 16, 16),
    new THREE.MeshPhongMaterial({
      color: 0xe10600,
      emissive: 0xe10600,
      emissiveIntensity: 0.3,
    })
  );
  marker.position.copy(latLngToVector3(lat, lng, 2.05));
  marker.userData = { lat, lng, label };
  return marker;
}

function addMarker(lat, lng, label = "") {
  const marker = createMarker(lat, lng, label);
  marker.scale.set(0.01, 0.01, 0.01);
  scene.add(marker);
  markers.push(marker);

  let t = 0;
  function animateDrop() {
    if (t < 1) {
      t += 0.08;
      const s = THREE.MathUtils.lerp(0.01, 1, t);
      marker.scale.set(s, s, s);
      requestAnimationFrame(animateDrop);
    }
  }
  animateDrop();
}

// Marker interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const popup = document.getElementById("markerPopup");
let activeMarker = null;
let popupTimeout = null;

function showPopup(text, marker) {
  if (popupTimeout) clearTimeout(popupTimeout);

  const lat = marker.userData.lat;
  const lng = marker.userData.lng;

  // Embed Google Maps iframe
  const mapHTML = `
  <iframe
    width="250"
    height="180"
    frameborder="0"
    style="border:0;margin-top:10px;border-radius:8px;"
    src="https://www.google.com/maps?q=${lat},${lng}&hl=en&z=6&output=embed"
    allowfullscreen>
  </iframe>
`;

  popup.innerHTML = `
    <div style="text-align:center;">
      ${text}
      ${mapHTML}
    </div>
  `;

  popup.style.display = "block";
  activeMarker = marker;
  updatePopupPos();

  focusLight.position.copy(camera.position);
  focusLight.target.position.copy(marker.position);
  focusLight.intensity = 2;
}

function updatePopupPos() {
  if (!activeMarker) return;
  const screen = activeMarker.position.clone().project(camera);
  const x = (screen.x * 0.5 + 0.5) * window.innerWidth;
  const y = (1 - (screen.y * 0.5 + 0.5)) * window.innerHeight;

  const width = popup.offsetWidth;
  const height = popup.offsetHeight;
  popup.style.left = `${x - width / 2}px`;
  popup.style.top = `${y - height - 15}px`;
}

function focusCameraOn(pos) {
  controls.autoRotate = false;
  const start = camera.position.clone();
  const target = pos.clone().normalize().multiplyScalar(4);
  let t = 0;
  function animate() {
    if (t < 1) {
      t += 1 / 60;
      const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      camera.position.lerpVectors(start, target, ease);
      camera.lookAt(0, 0, 0);
      requestAnimationFrame(animate);
    } else {
      camera.position.copy(target);
      camera.lookAt(0, 0, 0);
    }
  }
  animate();
}

renderer.domElement.addEventListener("click", (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const hit = raycaster.intersectObjects(markers, true);
  if (hit.length > 0) {
    const marker = hit[0].object;
    showPopup(marker.userData.label, marker);
    focusCameraOn(marker.position);
  }
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

camera.position.set(0, 0, 6);
camera.lookAt(0, 0, 0);

// Load markers
fetch("get_markers.php")
  .then((res) => res.json())
  .then((data) => {
    if (data.success) {
      data.markers.forEach(({ lat, lng, label }) => addMarker(lat, lng, label));
    } else {
      throw new Error(data.error);
    }
  })
  .catch(() => {
    [
      { lat: 51.5074, lng: -0.1278, label: "London" },
      { lat: 40.7128, lng: -74.006, label: "New York" },
      { lat: -33.8688, lng: 151.2093, label: "Sydney" },
    ].forEach((m) => addMarker(m.lat, m.lng, m.label));
  });

// Animate
function animate() {
  requestAnimationFrame(animate);

  // Update sun position for day/night cycle
  const time = Date.now() * 0.0005;
  sunLight.position.x = Math.sin(time) * 10;
  sunLight.position.z = Math.cos(time) * 10;

  // Update shader with current light direction
  const lightDirection = sunLight.position.clone().normalize();
  earthMaterial.uniforms.lightDirection.value.copy(lightDirection);

  controls.update();
  if (activeMarker) updatePopupPos();

  renderer.render(scene, camera);
}

animate();
