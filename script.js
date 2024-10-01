// app.js

// Variables
let scene, camera, renderer, controls;
let planets = [];
let orbits = [];
let moons = [];
let showOrbits = true;
let zoomFactor = 10;

// Texture loader for planet images
const textureLoader = new THREE.TextureLoader();

// Planet data (size, orbit radius, texture, name)
const planetData = [
  { name: 'Mercury', size: 2, orbitRadius: 15, texture: 'images/mercury.jpg' },
  { name: 'Venus', size: 4, orbitRadius: 25, texture: 'images/venus.jpg' },
  { name: 'Earth', size: 4.5, orbitRadius: 35, texture: 'images/earth.jpg' },
  { name: 'Mars', size: 3, orbitRadius: 50, texture: 'images/mars.jpg' },
  { name: 'Jupiter', size: 10, orbitRadius: 70, texture: 'jupiter.png' },
  { name: 'Saturn', size: 9, orbitRadius: 90, texture: 'images/saturn.jpg' },
  { name: 'Uranus', size: 7, orbitRadius: 110, texture: 'images/uranus.jpg' },
  { name: 'Neptune', size: 7, orbitRadius: 130, texture: 'images/neptune.jpg' }
];

// Set up Scene, Camera, Renderer, and Controls
function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Orbit Controls for free camera movement
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableZoom = true;
  controls.enablePan = true;
  camera.position.set(0, 100, 150);
  controls.update();

  // Add the Sun
  createSun();

  // Add planets and their orbits
  planetData.forEach(data => {
    createPlanet(data.size, data.orbitRadius, data.texture, data.name);
    createOrbit(data.orbitRadius);
  });

  // Add Earth's moon (satellite of Earth)
  createMoon(0.5, 7, 35); // Moon size, orbit radius, Earth orbitRadius

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(50, 50, 50);
  scene.add(pointLight);

  animate();
  setupControls();
}

// Create the Sun (as a large sphere)
function createSun() {
  const geometry = new THREE.SphereGeometry(8, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const sun = new THREE.Mesh(geometry, material);
  scene.add(sun);
}

// Create a Planet (Sphere) with Orbiting Behavior and Text Label
function createPlanet(size, orbitRadius, textureUrl, name) {
  const geometry = new THREE.SphereGeometry(size, 32, 32);
  const material = new THREE.MeshBasicMaterial({
    map: textureLoader.load(textureUrl) // Load planet texture
  });
  const planet = new THREE.Mesh(geometry, material);

  const planetData = { mesh: planet, radius: orbitRadius, angle: Math.random() * Math.PI * 2, name: name };
  planets.push(planetData);
  scene.add(planet);

  // Create Text Label for the Planet
  createLabel(planet, name);
}

// Create a Moon (satellite around Earth)
function createMoon(size, orbitRadius, planetOrbitRadius) {
  const geometry = new THREE.SphereGeometry(size, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
  const moon = new THREE.Mesh(geometry, material);

  const moonData = { mesh: moon, radius: orbitRadius, planetOrbitRadius: planetOrbitRadius, angle: Math.random() * Math.PI * 2 };
  moons.push(moonData);
  scene.add(moon);
}

// Create Orbits (Circular Lines in 3D)
function createOrbit(radius) {
  const curve = new THREE.EllipseCurve(0, 0, radius, radius);
  const points = curve.getPoints(64);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  const material = new THREE.LineBasicMaterial({ color: 0xffffff });
  const orbit = new THREE.Line(geometry, material);
  orbit.rotation.x = Math.PI / 2;
  orbits.push(orbit);
  scene.add(orbit);
}

// Create Text Label for Planets and Objects
function createLabel(object, text) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = 'Bold 20px Arial';
  context.fillStyle = 'white';
  context.fillText(text, 0, 20);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture });
  const label = new THREE.Sprite(material);
  label.scale.set(10, 5, 1); // Scale the label

  label.position.set(0, 10, 0); // Offset label position
  object.add(label); // Attach label to the object
}

// Setup Interactive Controls (Zoom, Orbit Toggle)
function setupControls() {
  document.getElementById('zoomIn').addEventListener('click', () => {
    camera.position.z -= zoomFactor;
  });

  document.getElementById('zoomOut').addEventListener('click', () => {
    camera.position.z += zoomFactor;
  });

  document.getElementById('toggleTrajectories').addEventListener('click', () => {
    showOrbits = !showOrbits;
    orbits.forEach(orbit => orbit.visible = showOrbits);
  });
}

// Animation Loop
function animate() {
  requestAnimationFrame(animate);

  // Orbit Planets
  planets.forEach(planetData => {
    planetData.angle += 0.01; // Simulate orbit movement
    planetData.mesh.position.x = planetData.radius * Math.cos(planetData.angle);
    planetData.mesh.position.z = planetData.radius * Math.sin(planetData.angle);
  });

  // Orbit Earth's Moon
  moons.forEach(moonData => {
    moonData.angle += 0.02; // Faster orbit for moon
    const earth = planets.find(p => p.name === 'Earth');
    if (earth) {
      moonData.mesh.position.x = earth.mesh.position.x + moonData.radius * Math.cos(moonData.angle);
      moonData.mesh.position.z = earth.mesh.position.z + moonData.radius * Math.sin(moonData.angle);
    }
  });

  renderer.render(scene, camera);
  controls.update();
}

// Handle window resizing
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initialize the Scene
init();
