import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CSS2DRenderer,CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
/*
const controls = new OrbitControls( camera, renderer.domElement );
const loader = new GLTFLoader();
*/
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75,window.innerWidth / window.innerHeight,0.1,1000)
camera.position.set(0,0,10)
camera.lookAt(0,0,0)
const renderer = new THREE.WebGLRenderer()

renderer.setSize(window.innerWidth,window.innerHeight)
document.body.appendChild(renderer.domElement)

//text renderer
const labelRenderer = new CSS2DRenderer()
labelRenderer.setSize(window.innerWidth,window.innerHeight)
labelRenderer.domElement.style.position = "absolute"
labelRenderer.domElement.style.top = "0"
document.body.appendChild(labelRenderer.domElement)

let cube;
let chicken;
let chickenPivot;
let platform;
function init() {
 
    //boxGeometry(x,y,z) --> forme de l'objet
    const geometry = new THREE.BoxGeometry(1,1,1)
    //meshbasicmaterial --> texture de l'objet
    const material = new THREE.MeshBasicMaterial({color:0x00ffff})
    //création de l'objet cube avec mesh qui prend sa forme et sa texture comme parametre
    cube = new THREE.Mesh(geometry,material)
    //on ajoute l'objet à la scene
    cube.position.set(0,0,0)
    const axeHelper = new THREE.AxesHelper(2)
    //marche aussi avec scene.add(axeHelper)
    cube.add(axeHelper)
    scene.add(cube)


    const testdiv = document.createElement("div")
    testdiv.className = "label"
    testdiv.textContent = "a simple test"
    testdiv.style.backgroundColor="transparent"
    testdiv.style.color ="blue"

    const testLabel = new CSS2DObject(testdiv);
    testLabel.position.set(1,0,1)
    testLabel.center.set(0.5,0)
    cube.add(testLabel)
    //lights

    const ambientLight = new THREE.AmbientLight(0xffffff, 1); // lumière douce
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    //mouse trigger, and react when we click on the chicken !!
    //throw a ray
    const rayCaster = new THREE.Raycaster();
    //coords of the mouse
    const mouse = new THREE.Vector2()
    window.addEventListener("click",event=>{
        //define mouse coords
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        //throw a ray starting from the camera pos
        rayCaster.setFromCamera(mouse,camera)
        //check intersect
        const intersect = rayCaster.intersectObject(chicken)
        if (intersect.length > 0 ) {
            //start the animation
            animateChicken()
        }
    })
    //animation using gsap
    function animateChicken() {
        //first annimation : downscale
        gsap.to(chicken.scale,{
            y:1,
            duration:0.3,
            ease:"power1.inOut",
            //when finished : back to the original scale
            onComplete:()=>{
                gsap.to(chicken.scale,{
                    y:2,
                    duration:0.3,
                    ease:"power1.inOut"
                })
            }
        });
        gsap.to(chicken.position,{
            z:-10,
            duration:0.5,
            ease:"power1.inOut",
            onComplete:()=>{
                gsap.to(chicken.position,{
                    z:-2,
                    duration:0.3,
                    ease:"power1.inOut"
                })
            }
        })
    }
    //trying to generate a 3D model : chicken
    //making a pivot to change the chicken origin point

    const loader = new GLTFLoader();
    const textureLoader = new THREE.TextureLoader();
    chickenPivot = new THREE.Object3D()
    loader.load("chicken.gltf", function(gltf){
        chicken = gltf.scene
        chicken.scale.set(2,2,2)
        chicken.position.z = -2.25*2
        chickenPivot.position.set(3,1,5)
        chickenPivot.add(chicken)
        
        scene.add(chickenPivot)
        },undefined, function(error){
        console.error(error)
    });


    //platform test

    loader.load("floor.gltf",(gltf)=>{
        platform = gltf.scene
        platform.rotation.set(1,0,0)
        platform.position.set(-5,0,0)
        platform.scale.set(.01,.01,.01)
        /*
        //pas besoin car pas d'ombre dans notre projet
        platform.traverse((child)=>{
            if (child.isMesh){
                child.castShadow = true
                child.receiveShadow = true   
            }
        })
        */
        scene.add(platform);
    },undefined,(error)=>{
        console.error(error)
    })
    

}


//fonction d'animation
function animate(){
    cube.rotation.x += 0.005
    cube.rotation.y += 0.02
    
    
    //on affiche la scene et on applique la camera
    renderer.render(scene, camera)
    labelRenderer.render(scene,camera)
}
init()
renderer.setAnimationLoop(animate)