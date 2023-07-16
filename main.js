import './style.css'
import * as THREE from 'three';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
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
  rubik = gltf.scene.children[0];
  
  let cubes = gltf.scene.children[0].children
  for (let child in cubes){
    var geo = new THREE.EdgesGeometry( cubes[child].geometry);
    var mat = new THREE.LineBasicMaterial( { color: 0x000000} );
    // var mat = new THREE.MeshPhongMaterial( { color: 0x000000} );
    var wireframe = new THREE.LineSegments( geo, mat );
    rubik.add(wireframe);
  };
  scene.add(rubik);
  rubik.scale.set(.5, .5, .5);


}, undefined, function ( error ) {

	console.error( error );

});

camera.position.z = 10;


function animate() {
	requestAnimationFrame( animate );
  rubik.rotation.x += 0.02;
  rubik.rotation.y += 0.01;
  rubik.rotation.z += 0.01;

	renderer.render( scene, camera );
}
animate();
