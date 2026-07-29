import * as THREE from 'three';
const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// const camera = new THREE.OrthographicCamera(-4, 4, 4, -4, 0.1, 1000); // Define the orthographic camera
// The sidebar sits beside the canvas on desktop and below it on mobile, so the
// canvas can't just be (innerWidth - sidebar). Below the breakpoint it goes
// full-width at a fraction of the viewport height, with the sidebar underneath.
// Keep MOBILE_BREAKPOINT in sync with the media query in styles/custom.css.
const SIDEBAR_WIDTH = 320;
const MOBILE_BREAKPOINT = 700;
const MOBILE_HEIGHT_RATIO = 0.45;

// clientWidth/clientHeight, not innerWidth/innerHeight: inner* includes the
// scrollbar, so a full-width canvas would overflow the layout viewport and add
// a horizontal scrollbar. That bites on mobile, where the sidebar is in flow and
// the page scrolls.
function viewport() {
  const doc = document.documentElement;
  return { width: doc.clientWidth, height: doc.clientHeight };
}

function canvasSize() {
  const { width, height } = viewport();
  if (width <= MOBILE_BREAKPOINT) {
    return {
      width: width,
      height: Math.round(height * MOBILE_HEIGHT_RATIO),
    };
  }
  return {
    width: width - SIDEBAR_WIDTH,
    height: height,
  };
}

let { width, height } = canvasSize();
const aspect = width / height;
// How much world space the orthographic camera shows. The logo's geometry is
// regenerated every frame from 4D-rotated vertices, so there is no size constant
// on the object itself — this is the zoom. Smaller shows less, so the logo looks
// bigger: halving this from 10 to 5 doubles it on screen.
const frustumSize = 5;
const camera = new THREE.OrthographicCamera(frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 0.1, 1000);

const stereoCamera = new THREE.StereoCamera();



const renderer = new THREE.WebGLRenderer({ 
  alpha: true,
  canvas: document.getElementById('canvas')  // Use existing canvas
});
renderer.setSize(width, height);
// Remove this line since we're using existing canvas
// document.body.appendChild(renderer.domElement);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;


const planeGeometry = new THREE.PlaneGeometry(200, 200);
const planeMaterial = new THREE.ShadowMaterial();
planeMaterial.opacity = 0.03;

const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.receiveShadow = true;
plane.position.y = -3;
plane.rotation.x = -Math.PI / 2;
scene.add(plane);
      
const light = new THREE.DirectionalLight(0xffffff, 0.5);
light.position.set(0, 1, 0);
light.castShadow = true;

light.shadow.radius = 8;
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040, 0.5); // soft white light
// scene.add(ambientLight);

// Animated meshes live in this group so mouse drags rotate the object, not the camera.
const logo = new THREE.Group();
scene.add(logo);

const WORLD_X = new THREE.Vector3(1, 0, 0);
const WORLD_Y = new THREE.Vector3(0, 1, 0);
const DRAG_SPEED = 0.005;
const SPIN_DECAY = 0.92;
let dragging = false;
let lastX = 0, lastY = 0;
let yawVelocity = 0, pitchVelocity = 0;

const canvas = renderer.domElement;
canvas.style.cursor = 'grab';
canvas.style.touchAction = 'none';
canvas.addEventListener('pointerdown', e => {
  dragging = true;
  lastX = e.clientX;
  lastY = e.clientY;
  yawVelocity = pitchVelocity = 0;
  canvas.setPointerCapture(e.pointerId);
  canvas.style.cursor = 'grabbing';
});
canvas.addEventListener('pointermove', e => {
  if (!dragging) return;
  yawVelocity = (e.clientX - lastX) * DRAG_SPEED;
  pitchVelocity = (e.clientY - lastY) * DRAG_SPEED;
  lastX = e.clientX;
  lastY = e.clientY;
});
const endDrag = e => {
  dragging = false;
  canvas.releasePointerCapture(e.pointerId);
  canvas.style.cursor = 'grab';
};
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);

const pointLight = new THREE.PointLight(0xff0000, 1, 100);
pointLight.position.set(0, 1, 0);

scene.add(pointLight);

const φ = (-1 + Math.sqrt(5)) / 2;

const vertices = [
  [1, 1, 1, 0],
  [-1, -1, 1, 0],
  [-1, 1, -1, 0],
  [1, -1, -1, 0],
  [0, 0, 0, Math.sqrt(5)]
];

// Calculate the centroid of the vertices
let centroid = [0, 0, 0, 0];
for (let vertex of vertices) {
  for (let i = 0; i < 4; i++) {
      centroid[i] += vertex[i];
  }
}
centroid = centroid.map(c => c / vertices.length);

// Subtract the centroid from each vertex to center them around the origin
const centeredVertices = vertices.map(vertex => vertex.map((v, i) => v - centroid[i]));

const projectedVertices = centeredVertices.map(vertex => new THREE.Vector3(vertex[0], vertex[1], vertex[2]));

// Define faces using the vertices
const faces = [
[0, 1, 2], [0, 1, 3], [1, 2, 3], [0, 2, 3],
[0, 2, 4], [0, 3, 4], [0, 1, 4], [1, 2, 4],
[1, 3, 4], [2, 3, 4]
];

// Color for each face
let sat = 0.60;
let lum = 0.6;
const faceColors = [];
for (let i = 0; i < 20; i++) {
  faceColors.push(new THREE.Color().setHSL(i / 20, sat, lum));
}



// Place the camera. lookAt keeps the object centered now that the removed
// TrackballControls is no longer aiming the camera at the origin.
camera.position.z = 3;

camera.position.y = 3;
camera.position.x = 0;
camera.lookAt(0, 0, 0);

// Rotate in 4D
function rotate4D(point, angle, plane) {
  const cosTheta = Math.cos(angle);
  const sinTheta = Math.sin(angle);
  let [x, y, z, w] = point;
  
  switch (plane) {
    case 'XY':
    return [cosTheta * x - sinTheta * y, sinTheta * x + cosTheta * y, z, w];
    case 'XZ':
    return [cosTheta * x - sinTheta * z, y, sinTheta * x + cosTheta * z, w];
    case 'XW':
    return [cosTheta * x - sinTheta * w, y, z, sinTheta * x + cosTheta * w];
    case 'YZ':
    return [x, cosTheta * y - sinTheta * z, sinTheta * y + cosTheta * z, w];
    case 'YW':
    return [x, cosTheta * y - sinTheta * w, z, sinTheta * y + cosTheta * w];
    case 'ZW':
    default:
    return [x, y, cosTheta * z - sinTheta * w, sinTheta * z + cosTheta * w];
  }
}

// 	window.addEventListener('resize', function() {
//     // Update camera
//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();

//     // Update renderer
//     renderer.setSize(window.innerWidth, window.innerHeight);
// }, false);
window.addEventListener('resize', function() {
  const size = canvasSize();
  // Guard against a zero-height viewport (a hidden or collapsed pane), which
  // would make aspect NaN and blank the canvas until the next resize.
  if (size.width <= 0 || size.height <= 0) return;

  const aspect = size.width / size.height;

  camera.left = frustumSize * aspect / - 2;
  camera.right = frustumSize * aspect / 2;
  camera.top = frustumSize / 2;
  camera.bottom = frustumSize / - 2;

  camera.updateProjectionMatrix();

  renderer.setSize(size.width, size.height);

}, false);

let angle = 0;

function animate(t) {
  requestAnimationFrame(animate);
  angle = t / 10000;
  var rotatedVertices = vertices
    .map(vertex => rotate4D(vertex, angle * φ, 'YW'))
    .map(vertex => rotate4D(vertex, angle, 'XW'))
    .map(vertex => rotate4D(vertex, angle * φ * φ, 'ZW'))
    .map(vertex => rotate4D(vertex, angle * φ * φ, 'XY'))

  const projectedVertices = rotatedVertices.map(vertex => new THREE.Vector3(vertex[0], vertex[1], vertex[2]));
  
  // Dispose the previous frame's geometry/material before clearing, or three.js
  // retains them on the GPU and memory grows unbounded until the tab freezes.
  for (const child of logo.children) {
    child.geometry?.dispose();
    (Array.isArray(child.material) ? child.material : [child.material]).forEach(m => m?.dispose());
  }
  logo.clear();
  
  // Add vertex dots
  projectedVertices.forEach((vertex, idx) => {
    const dotGeometry = new THREE.SphereGeometry(0.02); // Adjust size as needed
    const dotMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x888888,
      transparent: true,
      opacity: 0.8 
    });
    const dot = new THREE.Mesh(dotGeometry, dotMaterial);
    dot.position.copy(vertex);
    dot.renderOrder = faces.length + idx;
    logo.add(dot);
  });

  faces.forEach((face, idx) => {
    // if (idx > 3) return;
    const geometry = new THREE.BufferGeometry();
    
    const positions = [
    ...projectedVertices[face[0]].toArray(),
    ...projectedVertices[face[1]].toArray(),
    ...projectedVertices[face[2]].toArray()
    ];
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    
    let hue = idx % 2 ? idx / 20 : (idx + 10) / 20
    let timeshift = t/10000

    // Create pulsing opacity based on time
    let baseOpacity = 0.05
    let opacityVariation = 0.1
    let opacitySpeed = 1 // Adjust speed of pulsing
    let opacity = baseOpacity + Math.sin(t/1000 * opacitySpeed + idx) * opacityVariation

    let color = new THREE.Color().setHSL(hue + timeshift, sat, lum);
    let color2 = new THREE.Color().setHSL((hue + 0.25) + timeshift + 0.5, sat, lum);
    
    const material = new THREE.MeshBasicMaterial({ 
      color: color, 
      side: THREE.FrontSide, 
      transparent: true,
      opacity: opacity,  
      depthWrite: false,
    });
    
    const material2 = new THREE.MeshBasicMaterial({ 
      color: color2, 
      side: THREE.BackSide, 
      transparent: true,
      opacity: opacity, 
      depthWrite: false,
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.renderOrder = idx;
    logo.add(mesh);
          
    
    const mesh2 = new THREE.Mesh(geometry, material2);
    mesh2.castShadow = true;
    mesh2.renderOrder = idx;
    logo.add(mesh2);

    
    // wireframe
    // var geo = new THREE.EdgesGeometry( mesh.geometry ); // or WireframeGeometry
    // var mat = new THREE.LineBasicMaterial( { color: 0x888888, 
    // 	depthWrite: true} );
    // var wireframe = new THREE.LineSegments( geo, mat );
    // mesh.renderOrder = 1000;
    // mesh.add( wireframe );
    
    // Add wireframe
    const wireframeGeometry = new THREE.EdgesGeometry(geometry);
    const wireframeMaterial = new THREE.LineBasicMaterial({ 
        color: 0x888888,
        transparent: true,
        opacity: 0.3,
        depthWrite: true,
        linewidth: 2  // Added this line to make wireframe thicker
    });
    const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
    wireframe.renderOrder = idx + faces.length; // Ensure wireframe renders on top
    logo.add(wireframe);
  });


  logo.rotateOnWorldAxis(WORLD_Y, yawVelocity);
  logo.rotateOnWorldAxis(WORLD_X, pitchVelocity);
  if (!dragging) {
    yawVelocity *= SPIN_DECAY;
    pitchVelocity *= SPIN_DECAY;
  }

  renderer.render(scene, camera, 0, 0.5 * window.innerWidth, window.innerHeight);
  
  
  // stereoCamera.update(camera);
  
  // renderer.render(scene, stereoCamera.cameraL, 0, 0.5 * window.innerWidth, window.innerHeight);
  // renderer.render(scene, stereoCamera.cameraR, 0.5 * window.innerWidth, 0, 0.5 * window.innerWidth, window.innerHeight);
  
}

animate();
