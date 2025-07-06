class F1Globe {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.globe = null;
    this.markers = [];
    this.races = [];
    this.isAutoRotating = true;
    this.isDragging = false;
    this.selectedMarker = null;
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.controls = {
      mouseX: 0,
      mouseY: 0,
      targetX: 0,
      targetY: 0,
    };

    this.init();
  }

  async init() {
    try {
      await this.loadRaceData();
      this.initThreeJS();
      this.createGlobe();
      this.createMarkers();
      this.setupEventListeners();
      this.animate();
      this.hideLoading();
    } catch (error) {
      console.error("Failed to initialize F1 Globe:", error);
      this.showError("Failed to load race data");
    }
  }

  async loadRaceData() {
    try {
      const response = await fetch("connection.php");
      const data = await response.json();

      if (data.success) {
        this.races = data.data;
        console.log(`Loaded ${this.races.length} F1 races`);
      } else {
        throw new Error(data.error || "Failed to load race data");
      }
    } catch (error) {
      console.error("Error loading race data:", error);
      // Fallback with sample data for development
      this.races = [
        {
          title: "Monaco GP",
          full_title: "Monaco Grand Prix",
          date: "2024-05-26",
          location: "Monte Carlo",
          country: "Monaco",
          latitude: 43.7347,
          longitude: 7.4206,
        },
        {
          title: "British GP",
          full_title: "British Grand Prix",
          date: "2024-07-07",
          location: "Silverstone",
          country: "United Kingdom",
          latitude: 52.0786,
          longitude: -1.0169,
        },
      ];
    }
  }

  initThreeJS() {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000814);

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 2.5);

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById("globe"),
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 3, 5);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);

    // Add rim lighting for dramatic effect
    const rimLight = new THREE.DirectionalLight(0x00ffff, 0.3);
    rimLight.position.set(-5, 0, -5);
    this.scene.add(rimLight);
  }

  createGlobe() {
    // Globe geometry
    const geometry = new THREE.SphereGeometry(1, 64, 64);

    // Create earth texture (procedural)
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    // Create earth-like texture
    const gradient = ctx.createRadialGradient(512, 256, 0, 512, 256, 512);
    gradient.addColorStop(0, "#4a90e2");
    gradient.addColorStop(0.3, "#357abd");
    gradient.addColorStop(0.7, "#2d5aa0");
    gradient.addColorStop(1, "#1a365d");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 512);

    // Add continents (simplified)
    ctx.fillStyle = "#2d5016";
    ctx.fillRect(150, 150, 200, 100); // Europe/Africa
    ctx.fillRect(400, 200, 150, 80); // Asia
    ctx.fillRect(700, 180, 120, 100); // Americas
    ctx.fillRect(50, 300, 180, 60); // Australia

    const texture = new THREE.CanvasTexture(canvas);

    // Globe material with enhanced properties
    const material = new THREE.MeshPhongMaterial({
      map: texture,
      shininess: 100,
      specular: 0x222222,
      transparent: true,
      opacity: 0.95,
    });

    this.globe = new THREE.Mesh(geometry, material);
    this.globe.receiveShadow = true;
    this.scene.add(this.globe);

    // Add atmosphere glow
    const atmosphereGeometry = new THREE.SphereGeometry(1.03, 32, 32);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0x00aaff) },
      },
      vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
      fragmentShader: `
                varying vec3 vNormal;
                uniform vec3 color;
                void main() {
                    float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                    gl_FragColor = vec4(color, 1.0) * intensity;
                }
            `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
    });

    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    this.scene.add(atmosphere);
  }

  createMarkers() {
    this.races.forEach((race, index) => {
      const marker = this.createMarker(race, index);
      this.markers.push(marker);
      this.scene.add(marker);
    });

    this.populateRaceList();
  }

  createMarker(race, index) {
    // Convert lat/lng to 3D position
    const phi = (90 - race.latitude) * (Math.PI / 180);
    const theta = (race.longitude + 180) * (Math.PI / 180);

    const radius = 1.02;
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    // Create marker group
    const markerGroup = new THREE.Group();
    markerGroup.position.set(x, y, z);
    markerGroup.userData = { race, index };

    // Marker geometry (pyramid/pin shape)
    const markerGeometry = new THREE.ConeGeometry(0.02, 0.08, 8);
    const markerMaterial = new THREE.MeshPhongMaterial({
      color: 0xff6b6b,
      shininess: 100,
      transparent: true,
      opacity: 0.9,
    });

    const markerMesh = new THREE.Mesh(markerGeometry, markerMaterial);
    markerMesh.position.y = 0.04;
    markerGroup.add(markerMesh);

    // Glowing base
    const baseGeometry = new THREE.SphereGeometry(0.015, 16, 16);
    const baseMaterial = new THREE.MeshPhongMaterial({
      color: 0xffd93d,
      emissive: 0x442200,
      transparent: true,
      opacity: 0.8,
    });

    const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
    markerGroup.add(baseMesh);

    // Pulsing ring animation
    const ringGeometry = new THREE.RingGeometry(0.02, 0.03, 16);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xff6b6b,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    });

    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.lookAt(0, 0, 0);
    markerGroup.add(ring);

    // Animation properties
    markerGroup.userData.ring = ring;
    markerGroup.userData.originalScale = markerGroup.scale.clone();
    markerGroup.userData.time = index * 0.5; // Stagger animations

    return markerGroup;
  }

  populateRaceList() {
    const raceItems = document.getElementById("race-items");
    raceItems.innerHTML = "";

    this.races.forEach((race, index) => {
      const item = document.createElement("div");
      item.className = "race-item";
      item.innerHTML = `
                <h4>${race.title}</h4>
                <p>📅 ${new Date(race.date).toLocaleDateString()}</p>
                <p>📍 ${race.location}, ${race.country}</p>
            `;

      item.addEventListener("click", () => {
        this.focusOnMarker(index);
        this.showRaceInfo(race);
        this.toggleRaceList();
      });

      raceItems.appendChild(item);
    });
  }

  setupEventListeners() {
    const canvas = document.getElementById("globe");

    // Mouse events
    canvas.addEventListener("mousedown", this.onMouseDown.bind(this));
    canvas.addEventListener("mousemove", this.onMouseMove.bind(this));
    canvas.addEventListener("mouseup", this.onMouseUp.bind(this));
    canvas.addEventListener("click", this.onMouseClick.bind(this));

    // Touch events for mobile
    canvas.addEventListener("touchstart", this.onTouchStart.bind(this));
    canvas.addEventListener("touchmove", this.onTouchMove.bind(this));
    canvas.addEventListener("touchend", this.onTouchEnd.bind(this));

    // Control buttons
    document
      .getElementById("playPause")
      .addEventListener("click", this.toggleAutoRotation.bind(this));
    document
      .getElementById("reset")
      .addEventListener("click", this.resetView.bind(this));
    document
      .getElementById("showAll")
      .addEventListener("click", this.toggleRaceList.bind(this));
    document
      .getElementById("close-panel")
      .addEventListener("click", this.hideRaceInfo.bind(this));

    // Window resize
    window.addEventListener("resize", this.onWindowResize.bind(this));

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.hideRaceInfo();
        this.hideRaceList();
      }
      if (e.key === " ") {
        e.preventDefault();
        this.toggleAutoRotation();
      }
    });
  }

  onMouseDown(event) {
    this.isDragging = true;
    this.isAutoRotating = false;
    this.controls.mouseX = event.clientX;
    this.controls.mouseY = event.clientY;
    document.getElementById("globe").style.cursor = "grabbing";
  }

  onMouseMove(event) {
    if (!this.isDragging) return;

    const deltaX = event.clientX - this.controls.mouseX;
    const deltaY = event.clientY - this.controls.mouseY;

    this.controls.targetX += deltaX * 0.01;
    this.controls.targetY += deltaY * 0.01;

    this.controls.mouseX = event.clientX;
    this.controls.mouseY = event.clientY;
  }

  onMouseUp() {
    this.isDragging = false;
    document.getElementById("globe").style.cursor = "grab";
  }

  onMouseClick(event) {
    if (this.isDragging) return;

    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.markers, true);

    if (intersects.length > 0) {
      const marker = intersects[0].object.parent;
      if (marker.userData.race) {
        this.focusOnMarker(marker.userData.index);
        this.showRaceInfo(marker.userData.race);
      }
    }
  }

  onTouchStart(event) {
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      this.onMouseDown({ clientX: touch.clientX, clientY: touch.clientY });
    }
  }

  onTouchMove(event) {
    if (event.touches.length === 1) {
      event.preventDefault();
      const touch = event.touches[0];
      this.onMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
    }
  }

  onTouchEnd() {
    this.onMouseUp();
  }
}
