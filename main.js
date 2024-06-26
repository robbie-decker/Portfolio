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
      rubik.scale.set(.5, .5, .5);
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
let rubik; // This is the rubiks cube
let mixer; // This is for animations. Think of this as the timeline on blender
const actions = [];
const playDuration = 1.0;
let animationTime = 0;
let playingForward = true;

// let cube_file = 'rubiks_cube(animation).gltf';
let cube_file = 'updated_cube.glb';
// let cube_file = 'rubiks_cube(2023).gltf';

loader.load( cube_file, function ( gltf ) {
  rubik = gltf.scene;
  rubik.position.x = -3;
  rubik.position.y = 50;
  console.log(rubik.position);
  rubik.scale.set(.5, .5, .5);
  
  scene.add(rubik);

  // Fix position and scale for smaller screens
  if(window.innerWidth < 800){
    rubik.position.x = 0;
    rubik.scale.set(.3, .3, .3);
  }

  mixer = new THREE.AnimationMixer(rubik);

  gltf.animations.forEach( function ( clip ) {
      var action = mixer.clipAction(clip);
      // action.reset();
      action.setLoop(THREE.LoopOnce); // Set the loop to play only once
      action.clampWhenFinished = true; // Keeps the last frame displayed after the animation ends
      action.play();

      action.paused = true; // Start paused
      action._clip.duration = 4.95;
      console.log(action);
      actions.push(action);
  } );

  console.log(mixer);


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


const clock = new THREE.Clock();


/**
 * Scroll Logic for sections
 */
let scrollY = window.scrollY;
// For keeping track of section animations from right side
let currentSection = 0;

// Get all the sections on the page
let sections = document.querySelectorAll('section');
sections[currentSection].classList.add('active');
window.addEventListener('scroll', ()=>{
  scrollY = window.scrollY;
  const newSection = Math.round(scrollY / sizes.height);

  if(newSection != currentSection){
    sections[currentSection].classList.remove('active');
    sections[newSection].classList.add('active');
    
    newSection > currentSection? playingForward = true : playingForward = false;
    
    currentSection = newSection;

    console.log('changed', currentSection);

    //Rotate pieces of the cube
    if (mixer && actions.length > 0) {
      actions.forEach(action => action.paused = false);
      clock.start();
      var elapsedTime = 0;

      function updateAnimations() {
          // var delta = clock.getDelta();
          elapsedTime += deltaTime;
          console.log(deltaTime);
          // elapsedTime += delta;
          if (elapsedTime >= playDuration) {
              // Stop after playDuration seconds
              actions.forEach(action => action.paused = true);
              clock.stop();
              if (playingForward) {
                  animationTime += playDuration;
              } else {
                  animationTime -= playDuration;
              }

              // Check bounds and toggle direction if needed
              if (animationTime >= actions[0]._clip.duration) {
                  playingForward = false;
                  animationTime = actions[0]._clip.duration;
              } else if (animationTime <= 0) {
                  playingForward = true;
                  animationTime = 0;
              }

              // Set the time for all actions
              actions.forEach(action => {
                  // action.timeScale = playingForward ? 1 : -1; // Set playback direction
                  action.time = animationTime;
              });
              return;
          }
          // Update all actions
          if (playingForward) {
              mixer.update(deltaTime);
          } else {
              mixer.update(-deltaTime);
          }
          requestAnimationFrame(updateAnimations);
      }
      updateAnimations();
    }
  }
});



/**
 * Animate
 */
let deltaTime;

let previousTime = 0
function animate() {
  // if(mixer){
  //   mixer.update(clock.getDelta());
  // }


  // const elapsedTime = clock.getElapsedTime()
  // const deltaTime = elapsedTime - previousTime
  // previousTime = elapsedTime

  deltaTime = clock.getDelta();


	// requestAnimationFrame( animate );
  // Cube rotation
  try{
    rubik.rotation.x = scrollY * 0.001;
    rubik.rotation.y = scrollY * 0.0025;
    rubik.rotation.z = scrollY * 0.0025;
    rubik.position.y = - (scrollY / sizes.height);
    
  }
  catch(TypeError){
    console.log("Cube not loaded yet");
  }

  // Particles rotation
  particles.rotation.y += 0.001;

  // // Camera parallax
  const parallaxX = -cursor.x;
  const parallaxY = cursor.y;
  cameraGroup.position.x += (parallaxX - cameraGroup.position.x) *  5 * deltaTime;
  cameraGroup.position.y += (parallaxY - cameraGroup.position.y) *  5 * deltaTime;
  // cameraGroup.position.x += (parallaxX - cameraGroup.position.x) *  5;
  // cameraGroup.position.y += (parallaxY - cameraGroup.position.y) *  5;

  // // Camera Y movement
  camera.position.y = - scrollY / sizes.height;

	renderer.render( scene, camera );
}
// animate();
renderer.setAnimationLoop(animate);


const skill_logos = document.getElementById("skill_logos");

var mousePos = {};

// Adds modal to logos when hovering over them
for(let logo of skill_logos.children){
 let rect;
  logo.addEventListener("mouseenter", (e) => {
    rect = e.target.getBoundingClientRect(); // get some position, scale,... properties of the item
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