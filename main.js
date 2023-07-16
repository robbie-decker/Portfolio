import './style.css'
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';




const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );


const loader = new GLTFLoader();
let rubik;
loader.load( 'rubiks cube.gltf', function ( gltf ) {
  rubik = gltf.scene;
	scene.add( rubik );
  // rubik.position.x = 0;
  // rubik.position.y = 10;
  // rubik.position.z = 0;
  rubik.scale.set(.5, .5, .5);

}, undefined, function ( error ) {

	console.error( error );

});

// const geometry = new THREE.BoxGeometry( 1, 1, 1 );
// const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
// const cube = new THREE.Mesh( geometry, material );
// scene.add( cube );

camera.position.z = 10;


function animate() {
	requestAnimationFrame( animate );
  rubik.rotation.x += 0.01;
  rubik.rotation.y += 0.01;
	renderer.render( scene, camera );
}
animate();
