// resources/js/app.js
class F1Maps {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.currentTrack = null;
    this.animationId = null;
    this.isAnimating = false;

    this.trackData = {
      monaco: {
        name: "Monaco GP",
        length: "3.337 km",
        turns: "19",
        lapRecord: "1:10.166",
        points: this.generateTrackPoints("monaco"),
      },
      silverstone: {
        name: "Silverstone",
        length: "5.891 km",
        turns: "18",
        lapRecord: "1:24.303",
        points: this.generateTrackPoints("silverstone"),
      },
      spa: {
        name: "Spa-Francorchamps",
        length: "7.004 km",
        turns: "19",
        lapRecord: "1:41.252",
        points: this.generateTrackPoints("spa"),
      },
      monza: {
        name: "Monza",
        length: "5.793 km",
        turns: "11",
        lapRecord: "1:18.887",
        points: this.generateTrackPoints("monza"),
      },
    };

    this.init();
  }

  init() {
    this.createScene();
    this.createCamera();
    this.createRenderer();
    this.createControls();
    this.createLights();
    this.loadTrack("monaco");
    this.setupEventListeners();
    this.animate();
    this.hideLoading();
  }

  createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0a);

    // Add fog for atmospheric effect
    this.scene.fog = new THREE.Fog(0x0a0a0a, 10, 100);
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 20, 30);
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(this.renderer.domElement);
  }

  createControls() {
    this.controls = new THREE.OrbitControls(
      this.camera,
      this.renderer.domElement
    );
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2;
  }

  createLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    // Point lights for track illumination
    const pointLight1 = new THREE.PointLight(0xff4444, 2, 100);
    pointLight1.position.set(10, 10, 10);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x4444ff, 2, 100);
    pointLight2.position.set(-10, 10, -10);
    this.scene.add(pointLight2);
  }

  generateTrackPoints(trackName) {
    const points = [];
    const numPoints = 100;

    switch (trackName) {
      case "monaco":
        // Monaco-style tight circuit
        for (let i = 0; i < numPoints; i++) {
          const angle = (i / numPoints) * Math.PI * 2;
          const radius = 15 + Math.sin(angle * 4) * 5;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          points.push(new THREE.Vector3(x, 0, z));
        }
        break;

      case "silverstone":
        // Silverstone-style flowing circuit
        for (let i = 0; i < numPoints; i++) {
          const t = i / numPoints;
          const angle = t * Math.PI * 2;
          const x = Math.cos(angle) * 20 + Math.cos(angle * 3) * 8;
          const z = Math.sin(angle) * 15 + Math.sin(angle * 2) * 5;
          points.push(new THREE.Vector3(x, 0, z));
        }
        break;

      case "spa":
        // Spa-style long circuit with elevation
        for (let i = 0; i < numPoints; i++) {
          const t = i / numPoints;
          const angle = t * Math.PI * 2;
          const x = Math.cos(angle) * 25 + Math.cos(angle * 2) * 10;
          const z = Math.sin(angle) * 20 + Math.sin(angle * 3) * 8;
          const y = Math.sin(angle * 6) * 3; // Elevation changes
          points.push(new THREE.Vector3(x, y, z));
        }
        break;

      case "monza":
        // Monza-style high-speed circuit
        for (let i = 0; i < numPoints; i++) {
          const t = i / numPoints;
          const angle = t * Math.PI * 2;
          const x = Math.cos(angle) * 30;
          const z = Math.sin(angle) * 18 + Math.sin(angle * 4) * 3;
          points.push(new THREE.Vector3(x, 0, z));
        }
        break;
    }

    return points;
  }

  loadTrack(trackName) {
    // Clear existing track
    if (this.currentTrack) {
      this.scene.remove(this.currentTrack);
    }

    const trackGroup = new THREE.Group();
    const trackData = this.trackData[trackName];

    // Create track surface
    const trackGeometry = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(trackData.points),
      64,
      2,
      8,
      true
    );

    const trackMaterial = new THREE.MeshLambertMaterial({
      color: 0x333333,
      side: THREE.DoubleSide,
    });

    const track = new THREE.Mesh(trackGeometry, trackMaterial);
    track.receiveShadow = true;
    trackGroup.add(track);

    // Create track barriers
    const barrierGeometry = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(trackData.points),
      64,
      0.5,
      8,
      true
    );

    const barrierMaterial = new THREE.MeshLambertMaterial({
      color: 0xff0000,
    });

    const innerBarrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
    innerBarrier.scale.set(0.8, 2, 0.8);
    innerBarrier.position.y = 1;
    trackGroup.add(innerBarrier);

    const outerBarrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
    outerBarrier.scale.set(1.2, 2, 1.2);
    outerBarrier.position.y = 1;
    trackGroup.add(outerBarrier);

    // Add start/finish line
    const startLineGeometry = new THREE.PlaneGeometry(4, 1);
    const startLineMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
    });

    const startLine = new THREE.Mesh(startLineGeometry, startLineMaterial);
    startLine.rotation.x = -Math.PI / 2;
    startLine.position.copy(trackData.points[0]);
    startLine.position.y = 0.1;
    trackGroup.add(startLine);

    // Add decorative elements
    this.addTrackDecorations(trackGroup, trackData.points);

    this.scene.add(trackGroup);
    this.currentTrack = trackGroup;

    // Update UI
    this.updateTrackInfo(trackData);
  }

  addTrackDecorations(trackGroup, points) {
    // Add trees around the track
    const treeGeometry = new THREE.ConeGeometry(1, 4, 8);
    const treeMaterial = new THREE.MeshLambertMaterial({ color: 0x228b22 });

    for (let i = 0; i < points.length; i += 10) {
      if (Math.random() > 0.6) {
        const tree = new THREE.Mesh(treeGeometry, treeMaterial);
        const point = points[i];
        const offset = 15 + Math.random() * 10;
        const angle = Math.random() * Math.PI * 2;

        tree.position.set(
          point.x + Math.cos(angle) * offset,
          2,
          point.z + Math.sin(angle) * offset
        );
        tree.castShadow = true;
        trackGroup.add(tree);
      }
    }

    // Add grandstands
    const grandstandGeometry = new THREE.BoxGeometry(10, 5, 3);
    const grandstandMaterial = new THREE.MeshLambertMaterial({
      color: 0x666666,
    });

    for (let i = 0; i < 3; i++) {
      const grandstand = new THREE.Mesh(grandstandGeometry, grandstandMaterial);
      const point = points[Math.floor((i * points.length) / 3)];
      grandstand.position.set(point.x + 12, 2.5, point.z + 12);
      grandstand.castShadow = true;
      trackGroup.add(grandstand);
    }
  }

  updateTrackInfo(trackData) {
    document.getElementById("trackName").textContent = trackData.name;
    document.getElementById("trackLength").textContent = trackData.length;
    document.getElementById("trackTurns").textContent = trackData.turns;
    document.getElementById("lapRecord").textContent = trackData.lapRecord;
  }

  setupEventListeners() {
    // Track selector
    document.getElementById("trackSelector").addEventListener("change", (e) => {
      this.loadTrack(e.target.value);
    });

    // View mode buttons
    document.getElementById("topView").addEventListener("click", () => {
      this.setTopView();
      this.updateActiveButton("topView");
    });

    document.getElementById("perspectiveView").addEventListener("click", () => {
      this.setPerspectiveView();
      this.updateActiveButton("perspectiveView");
    });

    // Animation controls
    document.getElementById("animate").addEventListener("click", () => {
      this.toggleAnimation();
    });

    document.getElementById("reset").addEventListener("click", () => {
      this.resetView();
    });

    // Window resize
    window.addEventListener("resize", () => {
      this.onWindowResize();
    });
  }

  setTopView() {
    this.camera.position.set(0, 60, 0);
    this.camera.lookAt(0, 0, 0);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  setPerspectiveView() {
    this.camera.position.set(30, 20, 30);
    this.camera.lookAt(0, 0, 0);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  updateActiveButton(activeId) {
    document.querySelectorAll(".btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    document.getElementById(activeId).classList.add("active");
  }

  toggleAnimation() {
    if (this.isAnimating) {
      this.stopAnimation();
    } else {
      this.startAnimation();
    }
  }

  startAnimation() {
    this.isAnimating = true;
    const animateBtn = document.getElementById("animate");
    animateBtn.textContent = "Stop Animation";
    animateBtn.classList.add("active");

    // Animate camera around the track
    const startTime = Date.now();
    const animateCamera = () => {
      if (!this.isAnimating) return;

      const elapsed = (Date.now() - startTime) / 1000;
      const angle = elapsed * 0.5; // Rotation speed
      const radius = 40;

      this.camera.position.x = Math.cos(angle) * radius;
      this.camera.position.z = Math.sin(angle) * radius;
      this.camera.position.y = 25;
      this.camera.lookAt(0, 0, 0);

      requestAnimationFrame(animateCamera);
    };

    animateCamera();
  }

  stopAnimation() {
    this.isAnimating = false;
    const animateBtn = document.getElementById("animate");
    animateBtn.textContent = "Animate Camera";
    animateBtn.classList.remove("active");
  }

  resetView() {
    this.stopAnimation();
    this.camera.position.set(0, 20, 30);
    this.camera.lookAt(0, 0, 0);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
    this.updateActiveButton("perspectiveView");
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  hideLoading() {
    setTimeout(() => {
      const loading = document.getElementById("loading");
      loading.style.opacity = "0";
      setTimeout(() => {
        loading.style.display = "none";
      }, 500);
    }, 1000);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    if (this.controls) {
      this.controls.update();
    }

    // Rotate point lights for dynamic lighting
    const time = Date.now() * 0.001;
    const lights = this.scene.children.filter(
      (child) => child instanceof THREE.PointLight
    );
    lights.forEach((light, index) => {
      const radius = 20;
      const speed = 0.5 + index * 0.3;
      light.position.x = Math.cos(time * speed) * radius;
      light.position.z = Math.sin(time * speed) * radius;
    });

    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize the application when the page loads
document.addEventListener("DOMContentLoaded", () => {
  new F1Maps();
});
