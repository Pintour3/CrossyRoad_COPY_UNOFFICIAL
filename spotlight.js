import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CSS2DRenderer,CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
const scene = new THREE.Scene()

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );

const camera = new THREE.PerspectiveCamera(75,window.innerWidth / window.innerHeight,0.1,1000)
const controls = new OrbitControls( camera, renderer.domElement );

const matfloor = new THREE.MeshPhongMaterial({color:0xffaa00})
const matbox = new THREE.MeshPhongMaterial({color:0xaaaaaa})

const geofloor = new THREE.PlaneGeometry(100,100)
const geobox = new THREE.BoxGeometry(0.3,0.1,0.2)

const meshfloor = new THREE.Mesh(geofloor,matfloor)
meshfloor.rotation.x = - Math.PI * 0.5;
const meshbox = new THREE.Mesh(geobox,matbox)

const ambient = new THREE.AmbientLight( 0x444444 );

const spotLight = new THREE.SpotLight(0x108030,10)
spotLight.castShadow = true
spotLight.angle = 0.5
spotLight.penumbra = 0.4
spotLight.decay = 2
spotLight.distance =10

let lightHelper
function init(){
    //giving shadow to the scene
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    //creating debug axis to the spot
    lightHelper = new THREE.SpotLightHelper(spotLight)
    //displaying the shadow to the floor (the box currently)
    meshfloor.receiveShadow = true
    
    //asking if the box should create shadow
    meshbox.castShadow = true
    //and if she should be concerned about displaying shadows in his body
    meshbox.receiveShadow = true
    meshbox.position.set(0,.4,0)
    
    scene.add(meshbox)
    scene.add(meshfloor)
    scene.add(ambient)
    scene.add(spotLight)
    scene.add(lightHelper)
    document.body.appendChild(renderer.domElement)
    //camera settings and integrate mooves
    controls.target.set(0,0.5,0)
    camera.position.set(0.5,1,0)
    controls.update()
    
}
init()
function animate() {
    renderer.render(scene,camera)
}