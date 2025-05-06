import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import { CSS2DRenderer,CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import Stats from 'three/addons/libs/stats.module.js';
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(65,window.innerWidth/window.innerHeight,0.1,1000)
camera.position.set(4.2,5,4.3)

//3D loader
const loader = new GLTFLoader();

//render
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.BasicShadowMap;
renderer.setSize(window.innerWidth,window.innerHeight)
document.body.appendChild(renderer.domElement)
renderer.setAnimationLoop(animate);

//stats 
var stats = new Stats();

document.body.appendChild( stats.dom );

let objects = new Map()
//init
let map = [
        [1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1],
    ]
let chicken;
let chickenRAW
let chickenBoxHelper;
function init(){

    //lights
    //ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff,0.7)
    scene.add(ambientLight)
    //directional light lightning from left to the middle of the game for correct shadowing
    const directionalLight = new THREE.DirectionalLight(0xffffff,3);
    directionalLight.position.set(11,6,-4)
    const target = new THREE.Object3D();
    target.position.set(11,1,1) 
    scene.add(target)
    directionalLight.target = target
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024
    directionalLight.shadow.mapSize.height = 1024
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 100;
    scene.add(directionalLight)
    const helper = new THREE.CameraHelper(directionalLight.shadow.camera);
    scene.add(helper)
    //draw Trees with variable size with coords parameters
    function drawTree(x,y,z){
        const key = `${x},${y},${z}`
        const scaleY = Math.random()*0.1 + 0.2
        loader.load("/textures/tree.gltf",gltf=>{
            const tree = gltf.scene
            tree.scale.set(0.3,scaleY,0.3)
            tree.position.set(x,y,z)
            tree.userData.type = "tree"
            tree.traverse(child=>{
                if (child.isMesh) {
                    child.receiveShadow = true
                    child.castShadow = true
                }
                if (child.material) {
                    child.material.side = THREE.FrontSide
                }
            }) 
            if (!objects.has(key)) {
                objects.set(key, [])
            }
        
            objects.get(key).push(tree)
            scene.add(tree)
        })
    }
    //draw blocs on the sides of the game grid
    function drawSide(){
        map.forEach((lines,index)=>{
            let type = lines[0]
            switch(type){
                case 1:
                    for (let k = 0; k < 5;k++) {
                        grassBlock(index,0, -(k + 1),0x8EC045)
                        grassBlock(index,0,lines.length + k,0x8EC045)
                        drawTree(index,0,lines.length + k)
                        drawTree(index,0,-(k + 1))
                    }
                    break
            }
        })
    }
    

    //grassblock func
    function grassBlock(x,y,z,color) {
        const key = `${x},${y},${z}`
        const grassGeo = new THREE.BoxGeometry(1,0.25,1)
        const dirtGeo = new THREE.BoxGeometry(1,0.25,1)
        
        const grass = new THREE.MeshStandardMaterial({color:color});
        const dirt = new THREE.MeshBasicMaterial({color:0x403410});
        
        const grassBlock = new THREE.Mesh(grassGeo,grass)
        const dirtBlock = new THREE.Mesh(dirtGeo,dirt)
        grassBlock.receiveShadow = true
        dirtBlock.receiveShadow = false
        grassBlock.position.set(x,y,z)
        dirtBlock.position.set(x,y-0.25,z)
        
        if (!objects.has(key)) {
            objects.set(key, [])
        }
        objects.get(key).push(grassBlock)
        objects.get(key).push(dirtBlock)
        scene.add(grassBlock)
        scene.add(dirtBlock)
    }
    function drawMap(){
        map.forEach((row,rowIndex)=>{
            row.forEach((col,colIndex)=>{
                if (col == 1) {
                    grassBlock(rowIndex,0,colIndex,0xBDF566)
                }
            })
        })
    }
    //completely delete a block from the scene
    function removeBlock(x,y,z){
        const key = `${x},${y},${z}`
        if (objects.has(key)){
                const meshes = objects.get(key)
                for (const mesh of meshes) {
                    scene.remove(mesh)
                    mesh.geometry?.dispose()
                    if (Array.isArray(mesh.material)){
                        for (const mat of mesh.material)
                            mat.dispose()
                    } else {
                        mesh.material?.dispose()
                    }
                }
                objects.delete(key)   
            }
    }
    //build new terrain as the chicken is walking
    function updateMap(){
        //if chicken is reaching the farest point
        if (chicken.position.x > playerLastPosition) {
            playerLastPosition = chicken.position.x
            //deleting the last line of blocs
            shiftMap()
            //adding a line to the top of the path
            let list = [1,1,1,1,1,1,1,1,1]
            map.push(list)
            list.forEach((elt,index)=>{
                grassBlock(map.length-1,0,index,0xBDF566)
            })
            //now generate the sides of the map
            for (let k = 0;k<5;k++){
                grassBlock(map.length-1,0,-(1 + k),0x8EC045)
                grassBlock(map.length-1,0,list.length + k,0x8EC045)
                drawTree(map.length-1,0,-(1 + k))
                drawTree(map.length-1,0,list.length + k)
            }
           
            
        }
    }
    //delete the map behind the chicken to avoid performance issues
    function shiftMap(){
        //we scan the list
        for (let index = 0; index < map.length; index++) {
            //we take an element
            let list = map[index];
            //if this element is not equal to 0
            if (list.length !== 0) {
                //we empty this list
                map[index] = []
                //remove the line
                for (let k = 0; k < 19;k++) {
                    removeBlock(index,0,-5+k)
                }
                break; 
            }
        }
    }
    drawMap()
    drawSide()
    //player : chicken ?
    chicken = new THREE.Object3D()
    loader.load("/textures/chicken.gltf",(gltf)=>{
        chickenRAW = gltf.scene
        chickenRAW.traverse(child=>{
            if (child.isMesh){
                child.castShadow = true
                child.receiveShadow = true
            }
            if (child.material) {
                child.material.side = THREE.FrontSide
            }
        })
        //relative position to the pivot
        chickenRAW.position.set(0,0.2,-0.75)
        chickenRAW.scale.set(0.4,0.4,0.4)
        chicken.add(chickenRAW)
        //init pos
        
        chicken.position.set(6,.25/2,(map[0].length-1)/2)
        //axe helper of the chicken
        
        //getting the half size of the box to allign to the floor cuz pivot is center of the chicken
        const box = new THREE.Box3().setFromObject(chicken);
        const size = new THREE.Vector3();
        box.getSize(size)
        //align perfectly the chicken to the floor
        chicken.position.y += size.y/2
        //putting the head in the right way
        chicken.rotation.y = Math.PI * 0.5
        //scene and debug
        
        chickenBoxHelper = new THREE.BoxHelper(chicken,0x00ff00);
        scene.add(chickenBoxHelper)
        camera.lookAt(chicken.position)
        scene.add(chicken)
    })
    
    let isMooving = false;
    let currentRotation = Math.PI*0.5

    function shortestRotation(from,to){
        let delta = ((to - from + Math.PI) % (2*Math.PI))-Math.PI
        return from + delta
    }

    //movements
    let playerLastPosition = chicken.position.x
    document.addEventListener("keydown",(event)=>{
        let key = event.key
        //if he's currently moving, dont do anything
        if (isMooving) return;
        //if it's not, then tell it is mooving
        isMooving = true
        //configuring a timeline where animation could launch in chain
        const tl = gsap.timeline({
            //and as a callback at the end
            onComplete:()=>{
                //reducing his size with a yoyo to make him compress and decompress
                gsap.to(chicken.scale,{y:0.8,yoyo: true,repeat:1,duration:0.05,ease:"power1.inOut"})
                //and tell you can move again
                isMooving = false 
            }
        })
        //movements logic
        switch(key) {
            //space and ArrowUp does the same thing
            case " ":
            case "ArrowUp":
                //setting the correct rotation
                currentRotation = shortestRotation(currentRotation,Math.PI * 0.5)
                //setting the little bounce
                tl.to(chicken.position,{y:chicken.position.y + 0.5,duration:0.1,ease:"power1.out",})
                .to(chicken.rotation,{y: currentRotation,duration: 0.2,ease:"power1.inOut"},"<")
                .to(chicken.position,{x:chicken.position.x + 1,duration:0.1,ease:"power1.inOut",},"<")
                .to(chicken.position,{y:chicken.position.y,duration:0.1,ease:"power1.in",},"-=0.15")
                //moving the camera to follow the chiken
                gsap.to(camera.position,{x:camera.position.x + 1,duration:0.2,ease:"power1.out"})
                //moving the light and the light target to reduce performance cost 
                directionalLight.position.x ++
                target.position.x ++
                updateMap()
                break
            case "ArrowDown": 
                currentRotation = shortestRotation(currentRotation,Math.PI * -0.5)
                tl.to(chicken.position,{y:chicken.position.y + 0.5,duration:0.1,ease:"power1.out",})
                .to(chicken.rotation,{y: currentRotation,duration: 0.2,ease:"power1.inOut"},"<")
                .to(chicken.position,{x:chicken.position.x - 1,duration:0.1,ease:"power1.inOut",},"<")
                .to(chicken.position,{y:chicken.position.y,duration:0.1,ease:"power1.in",},"-=0.15")
                gsap.to(camera.position,{x:camera.position.x - 1,duration:0.2,ease:"power1.out"})
                directionalLight.position.x --
                target.position.x --
                break
            case "ArrowRight":
                currentRotation = shortestRotation(currentRotation,0)
                tl.to(chicken.position,{y:chicken.position.y + 0.5,duration:0.1,ease:"power1.out",})
                .to(chicken.rotation,{y: currentRotation,duration: 0.2,ease:"power1.inOut"},"<")
                .to(chicken.position,{z:chicken.position.z + 1,duration:0.1,ease:"power1.inOut",},"<")
                .to(chicken.position,{y:chicken.position.y,duration:0.1,ease:"power1.in",},"-=0.15")
                gsap.to(camera.position,{z:camera.position.z + 1,duration:1,ease:"power1.out"})
                break
            case "ArrowLeft":   
                currentRotation = shortestRotation(currentRotation,Math.PI )
                tl.to(chicken.position,{y:chicken.position.y + 0.5,duration:0.1,ease:"power1.out",})
                .to(chicken.rotation,{y: currentRotation,duration: 0.2,ease:"power1.inOut"},"<")
                .to(chicken.position,{z:chicken.position.z - 1,duration:0.1,ease:"power1.inOut",},"<")
                .to(chicken.position,{y:chicken.position.y,duration:0.1,ease:"power1.in",},"-=0.15")
                gsap.to(camera.position,{z:camera.position.z - 1,duration:1,ease:"power1.out"})
                break
        }
    })


    
   
    
}   
//animation
init()
function animate(){
    stats.begin()
    if (chickenBoxHelper) {
        chickenBoxHelper.update()
    }
    renderer.render(scene,camera)
    stats.end()
}