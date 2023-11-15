import './style.css'
import * as THREE from 'three';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


const sizes ={
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    if(window.innerWidth < 800){
      rubik.position.x = 0;
      rubik.scale.set(.3, .3, .3);
    }
    else{
      rubik.position.x = -3;
      rubik.scale.set(.5,.5,.5);
    }
});

const scene = new THREE.Scene();

/**
 * Cameras
 */
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);

const camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 8;
cameraGroup.add(camera);

/**
 * Scroll Logic
 */
let scrollY = window.scrollY;
window.addEventListener('scroll', ()=>{
  scrollY = window.scrollY;
});

/**
 * Cursor Logic (For parallax)
 */
const cursor = {};
cursor.x = 0;
cursor.y = 0;
window.addEventListener('mousemove', (event) =>{
  cursor.x = event.clientX / sizes.width -0.5;
  cursor.y = event.clientY / sizes.height - 0.5;
});


const canvas = document.querySelector('canvas.threeJS');
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize( window.innerWidth, window.innerHeight );

const light = new THREE.AmbientLight( 0xfcfcfc ); // soft white light
scene.add( light );

/**
 * Load cube
 */
const loader = new GLTFLoader();
let rubik;
var pivot;
loader.load( 'rubiks_cube.gltf', function ( gltf ) {
  rubik = gltf.scene.children[0];
  rubik.position.x = -3;
  rubik.position.y = 1;
  
  let cubes = gltf.scene.children[0].children
  for (let child in cubes){
    // Create the wireframe for the cube
    var geo = new THREE.EdgesGeometry( cubes[child].geometry);
    var mat = new THREE.LineBasicMaterial( { color: 0x000000} );
    // var mat = new THREE.MeshPhongMaterial( { color: 0x000000} );
    var wireframe = new THREE.LineSegments( geo, mat );
    rubik.add(wireframe);
  };
  scene.add(rubik);
  rubik.scale.set(.5, .5, .5);

  // Fix position and scale for smaller screens
  if(window.innerWidth < 800){
    rubik.position.x = 0;
    rubik.scale.set(.3, .3, .3);
  }

  // TODO: Fix the center of rotation for cube
  // var box = new THREE.Box3().setFromObject( rubik );
  // box.getCenter( rubik.position ); // this re-sets the mesh position
  // rubik.position.multiplyScalar( - 1 );
  
  // pivot = new THREE.Group();
  // scene.add( pivot );
  // pivot.add( rubik );

}, undefined, function ( error ) {

	console.error( error );

});

/**
 * Particles
 */
const particlesCount = 200;
const positions = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount; i++)
{
    positions[i * 3 + 0] = (Math.random() - 0.5) * 15;
    positions[i * 3 + 1] = 5 * 0.5 - Math.random() * 4 * 4;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 15;
}

const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

// Material
let style = getComputedStyle(document.body);
const particleColor = style.getPropertyValue('--particle-color');
const particlesMaterial = new THREE.PointsMaterial({
  color: particleColor,
  sizeAttenuation: true,
  size: 0.03
});

// Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0
function animate() {
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - previousTime
  previousTime = elapsedTime

	requestAnimationFrame( animate );
  // Cube rotation
  try{
    // console.log(rubik);
    rubik.rotation.x = scrollY * 0.002;
    rubik.rotation.y = scrollY * 0.005;
    rubik.rotation.z = scrollY * 0.005;
    rubik.position.y = - (scrollY / sizes.height) + 1;
  }
  catch(TypeError){
    console.log("Cube not loaded yet");
  }

  // Particles rotation
  particles.rotation.y += 0.001;

  // Camera parallax
  const parallaxX = -cursor.x;
  const parallaxY = cursor.y;
  cameraGroup.position.x += (parallaxX - cameraGroup.position.x) *  5 * deltaTime;
  cameraGroup.position.y += (parallaxY - cameraGroup.position.y) *  5 * deltaTime;

  // Camera Y movement
  camera.position.y = - scrollY / sizes.height;

	renderer.render( scene, camera );
}
animate();


const skill_logos = document.getElementById("skill_logos");

var mousePos = {};

for(let logo of skill_logos.children){
 let rect;
  logo.addEventListener("mouseenter", (e) => {
    rect = e.target.getBoundingClientRect(); // get some poition, scale,... properties of the item
    mousePos.x = e.clientX - rect.left; // get the mouse position relative to the element
    mousePos.y = e.clientY - rect.top;
    logo.querySelector('.modal').classList.toggle('show');
    logo.querySelector('.modal').style.left = (mousePos.x + 10) + "px"; // set the modal position to the last stored position
    logo.querySelector('.modal').style.top = mousePos.y + "px";
  });

  logo.addEventListener("mousemove", (e) => {
    mousePos.x = e.clientX - rect.left;
    mousePos.y = e.clientY - rect.top;
    logo.querySelector('.modal').style.left = (mousePos.x + 10) + "px"; // set the modal position to the last stored position
    logo.querySelector('.modal').style.top = mousePos.y + "px";
  });

  logo.addEventListener("mouseleave", () => {
    logo.querySelector('.modal').classList.toggle('show');
  });
}