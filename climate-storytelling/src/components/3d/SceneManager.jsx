// Three.js Scene Manager - Core 3D rendering engine
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

class SceneManager {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.animationId = null;
    
    // Scene objects
    this.globe = null;
    this.particles = null;
    this.effects = [];
    
    // Animation state
    this.clock = new THREE.Clock();
    this.isAnimating = false;
    
    this.init();
  }

  init() {
    this.createScene();
    this.createCamera();
    this.createRenderer();
    this.createControls();
    this.addLighting();
    this.setupEventListeners();
    this.animate();
  }

  createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a1a);
    this.scene.fog = new THREE.Fog(0x0a0a1a, 15, 30);
  }

  createCamera() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
    this.camera.position.set(0, 0, 25);
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);
  }

  createControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 15;
    this.controls.maxDistance = 50;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.5;
  }

  addLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    this.scene.add(ambientLight);

    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    // Hemisphere light for natural outdoor lighting
    const hemisphereLight = new THREE.HemisphereLight(0x80deea, 0x4caf50, 0.3);
    this.scene.add(hemisphereLight);
  }

  setupEventListeners() {
    window.addEventListener('resize', this.onWindowResize.bind(this));
    
    // Handle container resize
    const resizeObserver = new ResizeObserver(this.onContainerResize.bind(this));
    resizeObserver.observe(this.container);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  onContainerResize() {
    if (!this.container) return;
    
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  // Create the Earth globe
  createGlobe(radius = 10, segments = 64) {
    // Create sphere geometry
    const geometry = new THREE.SphereGeometry(radius, segments, segments);
    
    // Create material with earth texture
    const material = new THREE.MeshPhongMaterial({
      color: 0x228B22, // Forest green base
      shininess: 5,
      transparent: true,
      opacity: 0.9
    });
    
    this.globe = new THREE.Mesh(geometry, material);
    this.globe.castShadow = true;
    this.globe.receiveShadow = true;
    this.scene.add(this.globe);
    
    return this.globe;
  }

  // Update globe appearance based on climate data
  updateGlobeVisuals(climateData) {
    if (!this.globe) return;
    
    const { temperatureIntensity, precipitationIntensity, seaLevelIntensity } = climateData;
    
    // Update globe color based on temperature
    const baseColor = new THREE.Color(0x228B22); // Green
    const hotColor = new THREE.Color(0xff4500); // Orange-red
    const coldColor = new THREE.Color(0x4169e1); // Blue
    
    let targetColor;
    if (temperatureIntensity > 0.5) {
      // Getting warmer
      targetColor = hotColor.clone().lerp(baseColor, 1 - temperatureIntensity);
    } else {
      // Getting cooler
      targetColor = coldColor.clone().lerp(baseColor, 1 - (1 - temperatureIntensity));
    }
    
    this.globe.material.color.lerp(targetColor, 0.1);
    
    // Add visual effects for precipitation and sea level
    this.updateGlobeEffects(temperatureIntensity, precipitationIntensity, seaLevelIntensity);
  }

  // Add visual effects to globe
  updateGlobeEffects(tempIntensity, precipIntensity, seaLevelIntensity) {
    // Remove existing effects
    this.effects.forEach(effect => {
      if (effect.parent) {
        effect.parent.remove(effect);
      }
    });
    this.effects = [];
    
    // Add precipitation particles if significant
    if (precipIntensity > 0.3) {
      this.addPrecipitationEffect(precipIntensity);
    }
    
    // Add sea level rise visualization
    if (seaLevelIntensity > 0.2) {
      this.addSeaLevelEffect(seaLevelIntensity);
    }
    
    // Add heat haze effect for high temperatures
    if (tempIntensity > 0.6) {
      this.addHeatHazeEffect(tempIntensity);
    }
  }

  // Add precipitation particle system
  addPrecipitationEffect(intensity) {
    const particleCount = Math.floor(1000 * intensity);
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 40;
      positions[i + 1] = Math.random() * 40 + 20;
      positions[i + 2] = (Math.random() - 0.5) * 40;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0x87ceeb,
      size: 0.1,
      transparent: true,
      opacity: 0.6
    });
    
    const precipitation = new THREE.Points(particlesGeometry, particlesMaterial);
    this.scene.add(precipitation);
    this.effects.push(precipitation);
    
    // Animate precipitation
    this.animatePrecipitation(precipitation);
  }

  // Add sea level rise visualization
  addSeaLevelEffect(intensity) {
    const waterGeometry = new THREE.RingGeometry(10.2, 10.2 + intensity * 2, 64);
    const waterMaterial = new THREE.MeshBasicMaterial({
      color: 0x1e90ff,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide
    });
    
    const waterRing = new THREE.Mesh(waterGeometry, waterMaterial);
    waterRing.rotation.x = Math.PI / 2;
    this.scene.add(waterRing);
    this.effects.push(waterRing);
    
    // Animate water level
    this.animateWaterLevel(waterRing, intensity);
  }

  // Add heat haze effect
  addHeatHazeEffect(intensity) {
    const hazeGeometry = new THREE.SphereGeometry(12, 32, 32);
    const hazeMaterial = new THREE.MeshBasicMaterial({
      color: 0xff4500,
      transparent: true,
      opacity: intensity * 0.2,
      wireframe: true
    });
    
    const haze = new THREE.Mesh(hazeGeometry, hazeMaterial);
    this.scene.add(haze);
    this.effects.push(haze);
  }

  // Animation methods
  animatePrecipitation(particles) {
    const positions = particles.geometry.attributes.position.array;
    
    const animate = () => {
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] -= 0.1; // Fall downward
        if (positions[i] < -20) {
          positions[i] = 40; // Reset to top
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;
    };
    
    // Store animation function for global animation loop
    particles.userData.animate = animate;
  }

  animateWaterLevel(waterRing, intensity) {
    let time = 0;
    const animate = () => {
      time += 0.02;
      waterRing.scale.x = 1 + Math.sin(time) * 0.1 * intensity;
      waterRing.scale.z = 1 + Math.sin(time) * 0.1 * intensity;
    };
    waterRing.userData.animate = animate;
  }

  // Main animation loop
  animate() {
    this.animationId = requestAnimationFrame(this.animate.bind(this));
    
    const delta = this.clock.getDelta();
    
    // Update controls
    if (this.controls) {
      this.controls.update();
    }
    
    // Update particle effects
    this.effects.forEach(effect => {
      if (effect.userData.animate) {
        effect.userData.animate();
      }
    });
    
    // Render scene
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  // Update scene based on story progress
  updateStoryProgress(progress, climateData) {
    // Update globe visuals
    if (climateData) {
      this.updateGlobeVisuals(climateData);
    }
    
    // Adjust camera position based on story progress
    const targetPosition = new THREE.Vector3(
      Math.sin(progress * Math.PI * 2) * 20,
      Math.cos(progress * Math.PI) * 10,
      25 + progress * 10
    );
    
    this.camera.position.lerp(targetPosition, 0.05);
    this.camera.lookAt(0, 0, 0);
    
    // Adjust controls auto-rotation
    if (this.controls) {
      this.controls.autoRotateSpeed = 0.5 + progress * 2;
    }
  }

  // Cleanup method
  dispose() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    // Dispose of geometry and materials
    if (this.globe) {
      this.globe.geometry.dispose();
      this.globe.material.dispose();
    }
    
    this.effects.forEach(effect => {
      if (effect.geometry) effect.geometry.dispose();
      if (effect.material) effect.material.dispose();
    });
    
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
    
    window.removeEventListener('resize', this.onWindowResize.bind(this));
  }

  // Get current scene state for debugging
  getSceneState() {
    return {
      cameraPosition: this.camera?.position.clone(),
      globePresent: !!this.globe,
      effectCount: this.effects.length,
      rendererInfo: this.renderer?.info
    };
  }
}

export default SceneManager;