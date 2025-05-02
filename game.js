import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import { CSS2DRenderer,CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

//scene and camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(65,window.innerWidth/window.innerHeight,0.1,1000)
camera.position.set(-2.2,5,4.3)

//3D loader
const loader = new GLTFLoader();

//render
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.BasicShadowMap;
renderer.setSize(window.innerWidth,window.innerHeight)
document.body.appendChild(renderer.domElement)
renderer.setAnimationLoop(animate);


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
    ]
let chicken;
let chickenRAW
let chickenBoxHelper;
function init(){

    //lights
    const ambientLight = new THREE.AmbientLight(0xffffff,0.7)
    scene.add(ambientLight)
    const directionalLight = new THREE.DirectionalLight(0xffffff,3);
    directionalLight.position.set(5,6,-4)
    const target = new THREE.Object3D();
    target.position.set(5,1,1) 
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
        const scaleY = Math.random()*0.1 + 0.2
        console.log(scaleY)
        loader.load("tree.gltf",gltf=>{
            const tree = gltf.scene
            tree.scale.set(0.3,scaleY,0.3)
            tree.position.set(x,y,z)
            tree.traverse(child=>{
                if (child.isMesh) {
                    child.receiveShadow = true
                    child.castShadow = true
                }
                if (child.material) {
                    child.material.side = THREE.FrontSide
                }
            }) 
            scene.add(tree)
        })
    }
    //draw blocs on the sides of the game grid
    function drawSide(){
        map.forEach((lines,index)=>{
            let type = lines[0]
            switch(type){
                case 1:
                    for (let k = 0; k < 3;k++) {
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
        const objToRemove = []
        scene.children.forEach(child=>{
            if (child instanceof THREE.Mesh){
                const pos = child.position
                if (
                    (pos.x === x && pos.y === y && pos.z === z) ||
                    (pos.x === x && pos.y === y - 0.25 && pos.z === z)
                ) {
                    objToRemove.push(child);
                }
            }
        });
        objToRemove.forEach((mesh)=>{
            scene.remove(mesh)
        })
    }
    //kick the last line of the map tab
    function popMap(){
            var list = map.pop()
            var length = map.length
            list.forEach((obj,index)=>(
                removeBlock(length,0,index)
            ))
    }
    drawMap()
    drawSide()
    //player : chicken ?
    chicken = new THREE.Object3D()
    loader.load("chicken.gltf",(gltf)=>{
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
        
        chicken.position.set(0,.25/2,(map[0].length-1)/2)
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
    document.addEventListener("keydown",(event)=>{
        let key = event.key
        if (isMooving) return;
        isMooving = true
        const tl = gsap.timeline({
            onComplete:()=>{
                isMooving = false 
            }
        })
        
        switch(key) {
            case "ArrowRight":
                //jump
                tl.to(chicken.position,{
                    y:chicken.position.y + 0.5,
                    duration:0.1,
                    ease:"power1.out",
                })
                currentRotation = shortestRotation(currentRotation,0)
                tl.to(chicken.rotation,{
                    y: currentRotation,
                    duration: 0.2,
                    ease:"power1.inOut"
                },"<")
                //moove
                tl.to(chicken.position,{
                    z:chicken.position.z + 1,
                    duration:0.2,
                    ease:"power1.inOut",
                },"<")
                //goback to the floor
                .to(chicken.position,{
                    y:chicken.position.y,
                    duration:0.1,
                    ease:"power1.in"
                },"-=0.1")
                tl.to(chicken.scale,{
                    y:0.8,
                    yoyo: true,
                    repeat:1,
                    duration:0.1,
                    ease:"power1.inOut"
                },"-=0.1")
                break
            case "ArrowLeft":   
                tl.to(chicken.position,{
                    y:chicken.position.y + 0.5,
                    duration:0.1,
                    ease:"power1.out",
                })
                currentRotation = shortestRotation(currentRotation,Math.PI)
                tl.to(chicken.rotation,{
                    y: currentRotation,
                    duration: 0.2,
                    ease:"power1.inOut"
                },"<")
                tl.to(chicken.position,{
                    z:chicken.position.z - 1,
                    duration:0.2,
                    ease:"power1.inOut",
                },"<")
                .to(chicken.position,{
                    y:chicken.position.y,
                    duration:0.1,
                    ease:"power1.in"
                },"-=0.1")
                tl.to(chicken.scale,{
                    y:0.8,
                    yoyo: true,
                    repeat:1,
                    duration:0.1,
                    ease:"power1.inOut"
                },"-=0.1")
                break
            //space and ArrowUp does the same thing
            case " ":
            case "ArrowUp":
                tl.to(chicken.position,{
                    y:chicken.position.y + 0.5,
                    duration:0.1,
                    ease:"power1.out",
                })
                currentRotation = shortestRotation(currentRotation,Math.PI * 0.5)
                tl.to(chicken.rotation,{
                    y: currentRotation,
                    duration: 0.2,
                    ease:"power1.inOut"
                },"<")
                tl.to(chicken.position,{
                    x:chicken.position.x + 1,
                    duration:0.2,
                    ease:"power1.inOut",
                },"<")
                .to(chicken.position,{
                    y:chicken.position.y,
                    duration:0.1,
                    ease:"power1.in"
                },"-=0.1")
                tl.to(chicken.scale,{
                    y:0.8,
                    yoyo: true,
                    repeat:1,
                    duration:0.1,
                    ease:"power1.inOut"
                },"-=0.1")
                
                gsap.to(camera.position,{
                    x:camera.position.x + 1,
                    duration:0.2,
                    ease:"power1.out"
                })
                
                break
            case "ArrowDown": 
                tl.to(chicken.position,{
                    y:chicken.position.y + 0.5,
                    duration:0.1,
                    ease:"power1.out",
                })
                currentRotation = shortestRotation(currentRotation,Math.PI * -0.5)
                tl.to(chicken.rotation,{
                    y: currentRotation,
                    duration: 0.2,
                    ease:"power1.inOut"
                },"<")
                tl.to(chicken.position,{
                    x:chicken.position.x - 1,
                    duration:0.2,
                    ease:"power1.inOut",
                },"<")
                .to(chicken.position,{
                    y:chicken.position.y,
                    duration:0.1,
                    ease:"power1.in"
                },"-=0.1")
                tl.to(chicken.scale,{
                    y:0.8,
                    yoyo: true,
                    repeat:1,
                    duration:0.1,
                    ease:"power1.inOut"
                },"-=0.1")
                gsap.to(camera.position,{
                    x:camera.position.x - 1,
                    duration:0.2,
                    ease:"power1.out"
                })
                break
                case "Enter":
                    popMap()
                    break
        }
    })


    
   
    
}   
//animation
init()
function animate(){
    if (chickenBoxHelper) {
        chickenBoxHelper.update()
    }
    renderer.render(scene,camera)
    
}