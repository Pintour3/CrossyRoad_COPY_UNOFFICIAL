import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import { CSS2DRenderer,CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import Stats from 'three/addons/libs/stats.module.js';
const scene = new THREE.Scene();
//camera
const camera = new THREE.PerspectiveCamera(65,window.innerWidth/window.innerHeight,0.1,1000)
camera.position.set(4.2,4.2,4.35)

//3D loader files
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
        [1,1,1,1,1,1,1,1,1],
    ]
let chicken;
let chickenRAW
let chickenBoxHelper;
let logs = new Map();

let movementsVar;
function init(){

    //lights
    //ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff,0.7)
    scene.add(ambientLight)
    //directional light lightning from left to the middle of the game for correct shadowing
    const directionalLight = new THREE.DirectionalLight(0xffffff,3);
    directionalLight.position.set(10,6,-4)
    const target = new THREE.Object3D();
    target.position.set(10,1,1) 
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
    //enable if needed
    /*const helper = new THREE.CameraHelper(directionalLight.shadow.camera);
    scene.add(helper)
    */
    //draw Trees with variable size with coords parameters
    function drawTree(x,y,z){
        //50 % chances of spawn to increase performance (very performance cost)
        if (Math.random().toFixed(2) <= 0.5) {
            const key = x
            const scaleY = Math.random()*0.1 + 0.2
            loader.load("/textures/tree.gltf",gltf=>{
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
                //if there isn't objects at this position
                if (!objects.has(key)) {
                    //create an id in the map
                    objects.set(key, [])
                }
                
                //and add the tree to this map id (same for all the others)
                objects.get(key).push(tree)
                scene.add(tree)
            })
        }
    }
    //rail function
    function drawRail(x,y,z){
        const key = x
        loader.load("/textures/railway.gltf",(gltf)=>{
            const rail = gltf.scene
            rail.position.set(x,y,z)
            rail.scale.set(0.4,0.7,0.5)
            rail.traverse(child=>{
                if (child.isMesh) {
                    child.receiveShadow = true
                    child.castShadow = false
                }
                if (child.material) {
                    child.material.side = THREE.FrontSide
                }
            })
            if (!objects.has(key)) {
                    //create an id in the map
                    objects.set(key, [])
            
            }
            objects.get(key).push(rail)
            scene.add(rail)
        })
    }
    //drawLine func
    const lineGeometry = new THREE.PlaneGeometry(0.15,1)
    const lineMaterial = new THREE.MeshBasicMaterial({color:0x909090,side:THREE.DoubleSide})
    function drawLine(x,y,z){
        const key = x
        const line = new THREE.Mesh(lineGeometry,lineMaterial)
        line.position.set(x-0.55,y+0.1,z)
        line.rotation.x = Math.PI/2
        scene.add(line)
        if (!objects.has(key)){
            objects.set(key,[])
        }
        //add object in map corresponding to the identic key
        objects.get(key).push(line)
        
    }
    function drawVehicle(x,y,z,type){
        const key = x 
        let path;
        switch (type){
            case "truck":
            path = "/textures/truck_CrossyRoad.gltf"
        }
        loader.load(path,(gltf)=>{
            const vehicle = gltf.scene
            vehicle.position.set(x,y,z-.2)
            vehicle.scale.set(0.15,0.15,0.15)
            vehicle.traverse(child=>{
                if(child.isMesh){
                    vehicle.receiveShadow = true
                    vehicle.castShadow = true
                    if (child.material){
                        child.material.side = THREE.FrontSide
                    }
                }
            })
            scene.add(vehicle)
        })
    }
    drawVehicle(6,0,4,"truck")
    function drawLog(x,y,z,size){
        const key = x
        loader.load("/textures/LogWater_CrossyRoad.gltf",(gltf)=>{
            const log = gltf.scene 
            log.position.set(x,y-.25,z)
            log.scale.set(0.25,0.25,size * (1/3)/2)
            log.traverse(child=>{
                if (child.isMesh) {
                    log.receiveShadow = true
                    log.castShadow = false
                    if (child.material) {
                        child.material.side = THREE.FrontSide
                    }
                }
            })
            //used to be removed later
            if (!objects.has(key)) {
                    //create an id in the map
                    objects.set(key, [])
            
            }
            if (!logs.has(key)) {
                    let speed = (Math.floor(Math.random()*5))/100 + 0.01
                    if (speed > 0.03) {
                        speed = -speed / 3
                    } else {
                        speed = speed/3
                    }
                    logs.set(key,[speed])
                }
            logs.get(key).push(log)
            objects.get(key).push(log)
            scene.add(log)
        })
        
    }

    //drawBlock func
    const blockGeo = new THREE.BoxGeometry(1,0.125,1)
    const dirtGeo = new THREE.BoxGeometry(1,0.125,1)
    let dirtBlock;

    function drawBlock(x,y,z,color) {
        const key = x
        const blockTexture = new THREE.MeshStandardMaterial({color:color});
        const mainBlock = new THREE.Mesh(blockGeo,blockTexture)
        mainBlock.receiveShadow = true
        switch (color){
            case 0xBDF566:
            case 0x8EC045:
                const dirt = new THREE.MeshBasicMaterial({color:0x403410});
                dirtBlock = new THREE.Mesh(dirtGeo,dirt)
                dirtBlock.receiveShadow = false
                mainBlock.position.set(x,y,z)
                dirtBlock.position.set(x,y-0.125,z)
                scene.add(dirtBlock)
                break
            case 0x535864:
            case 0x49505B:
                mainBlock.position.set(x,y-0.06,z)
                //here lets try to import a road texture 

                break
            case 0x82F4FF:
            case 0x62D8FF:
                mainBlock.position.set(x,y-0.25,z)
                break
            case 0x121212:
            case 0x000000:
                mainBlock.position.set(x,y-0.125,z)
                break
        }
        scene.add(mainBlock)
        //create key id if there is no objects at this position
        if (!objects.has(key)) {
            objects.set(key, [])
        }
        //add object in map corresponding to the identic key
        objects.get(key).push(mainBlock)
        objects.get(key).push(dirtBlock)
        
    }
    //initialise the map, drawn using the map list configuration
    function drawMap(){
        map.forEach((row,rowIndex)=>{
            row.forEach((col,colIndex)=>{
                if (col == 1) {
                    drawBlock(rowIndex,0,colIndex,0xBDF566)
                }
            })
        })
    }
    //initialise the side map, drawn usning the map list configuration
    function drawSide(){
        map.forEach((lines,index)=>{    
            for (let k = 0; k < 6;k++) {
                drawBlock(index,0, -(k + 1),0x8EC045)
                drawBlock(index,0,lines.length + k,0x8EC045)
                drawTree(index,0,lines.length + k)
                drawTree(index,0,-(k + 1))
            }
        })
    }
    //completely delete a block and decorations from the scene (rail, trees, ...)
    function removeBlock(x){
        const key = x
        if (objects.has(x)){
                const meshes = objects.get(key)
                for (const mesh of meshes) {
                    scene.remove(mesh)
                    mesh.geometry?.dispose()
                    mesh.parent?.remove(mesh);
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
    let material;
    function random() {
        var random = Math.random().toFixed(2)
            if (random <= 0.4) {
                material = 1
            } else if (random > 0.4 && random <= 0.65) {
                material = 2
            } else if (random > 0.65 && random <= 0.85) {
                material = 3 
            } else {
                material = 4
            }
        return material
    }
    //build new terrain as the chicken is walking
    let currentChain = [false,0]
    function updateMap(){
        //deleting all the updating elements from their array
        //if chicken is reaching the furthest point
        if (chicken.position.x > playerLastPosition) {
            playerLastPosition = chicken.position.x
            //deleting the last line of blocs
            shiftMap()
            //adding a line to the top of the path
            //rules for the procedural generation
            //max 5 identic path in a row and minimum 2 in a row
            //initial probability : 40% grass, 25% road, 20% river, 15% train --> update if needed
            //grass = 1, road = 2, river = 3, train = 4
            let lastPath = []
            for (let k = 5; k > 0;k --) {
                //list of the previous path
                lastPath.push((map[map.length - k][0]))
            }
            if(!currentChain[0]) {
                material = random()
                currentChain = [true,1]
                while (material == lastPath[lastPath.length-1]){
                    material = random()
                }
            } else {
                //probability 90% --> 70% --> 50% --> 30%
                let length = currentChain[1]
                if (length !== 5) {
                    material = random()
                    let randomNbr = Math.random().toFixed(2)
                    if (randomNbr <= (0.9 - (0.2*length))){
                        material = lastPath[lastPath.length-1]
                        currentChain = [true,currentChain[1] += 1]
                    } else {
                        currentChain = [false,0]
                    }
                } else {
                    material = random()
                    currentChain = [false,0]
                    while (material == lastPath[lastPath.length-1]){
                        material = random()
                    }
                }

            }
            let list = [0,0,0,0,0,0,0,0,0]
            list = list.map(() => material)
            map.push(list)
            let middleColor, sideColor;
            switch(material){
                case 1:
                    //grass
                    middleColor = 0xBDF566
                    sideColor = 0x8EC045
                    for (let k = 0;k<6;k++){
                        drawTree(map.length-1,0,-(1 + k))
                        drawTree(map.length-1,0,list.length + k)
                        }
                    break
                case 2:
                    //road 
                    middleColor = 0x535864
                    sideColor = 0x49505B   
                    //road properties : line on the road
                    if (map[map.length-2][0] == 2) {
                        for (var k = -6; k <= 15;k++){
                            if (k%2 == 0) {
                                drawLine(map.length-1,0,k)
                            }
                        }
                    }     
                    //then : car and trucks on the road   
                    //to do !!
                    /* 
                    let lastVehicleCords = -3 + Math.floor(Math.random()*3) 
                    //random vehicle amount (2-4)
                    const vehicleAmount = Math.floor(Math.random()*3)+2
                    for (let k = 1; k <= vehicleAmount ; k++){
                        //vehicle
                        const randomSize = Math.floor(Math.random()*2)+2
                        //z coord : allign to the map
                        drawLog(map.length-1,0,lastCoords + (randomSize*0.5 - 0.5),randomSize)
                        //gap of 1 and 3 between platforms
                        lastCoords = lastCoords + randomSize + Math.floor(Math.random()*3)+1
                    } */
                    break
                case 3:
                    //water 
                    middleColor = 0x82F4FF
                    sideColor = 0x62D8FF
                    //draw the log and lilyPad 
                    //log
                    let lastCoords = -3 + Math.floor(Math.random()*3) 
                    //random log amount (2-4)
                    const randomAmount = Math.floor(Math.random()*3)+2
                    for (let k = 1; k <= randomAmount ; k++){
                        //random size (2-4)
                        const randomSize = Math.floor(Math.random()*2)+2
                        //z coord : allign to the map
                        drawLog(map.length-1,0,lastCoords + (randomSize*0.5 - 0.5),randomSize)
                        //gap of 1 and 3 between platforms
                        lastCoords = lastCoords + randomSize + Math.floor(Math.random()*3)+1
                    }
                    //total length = 6 + 9 + 6 = 21, in coords : -6 --> 15
                    
                    break
                case 4:
                    //train 
                    middleColor = 0x121212
                    sideColor = 0x000000
                    //draw the rail
                    for(let k =0 ; k < 7; k++){
                        //first pos is -4 and jump of 3
                        drawRail(map.length-1,0,-5 + k*3)
                        }
                    break

            }
            list.forEach((elt,index)=>{
                drawBlock(map.length-1,0,index,middleColor)
            })
            //now generate the sides of the map
            for (let k = 0;k<6;k++){
                drawBlock(map.length-1,0,-(1 + k),sideColor)
                drawBlock(map.length-1,0,list.length + k,sideColor)  
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
                //and the moving parts
                if (logs.has(index)){
                    logs.delete(index)
                }
                //remove the line
                for (let k = 0; k < 19;k++) {
                    removeBlock(index,0,-6+k)
                }
                break; 
            }
        }
    }
    drawMap()
    drawSide()
    //player : chicken 
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
        chickenRAW.position.set(0,0,-0.6)
        chickenRAW.scale.set(0.3,0.3,0.3)
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
        //add if needed
        /*
        chickenBoxHelper = new THREE.BoxHelper(chicken,0x00ffFF);
        scene.add(chickenBoxHelper)
        */
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
    movementsVar = function movements(event){
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
                //fixing the gap of the chicken
                if(!Number.isInteger(chicken.position.z)) {
                    if (!logs.has(Math.round(chicken.position.x))) {
                        let pos = Math.round(chicken.position.z)
                        gsap.to(chicken.position,{
                            z:pos,
                            duration:0.05,
                            ease:"power1.inOut"
                        })
                    }
                }
                //and tell you can move again
                isMooving = false 
            }
        })
        //movements logic
        switch(key) {
            //space and ArrowUp does the same thing
            case " ":
            case "w":
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
            case "s":
            case "ArrowDown": 
                currentRotation = shortestRotation(currentRotation,Math.PI * -0.5)
                tl.to(chicken.position,{y:chicken.position.y + 0.5,duration:0.1,ease:"power1.out",})
                .to(chicken.rotation,{y: currentRotation,duration: 0.2,ease:"power1.inOut"},"<")
                .to(chicken.position,{x:chicken.position.x - 1,duration:0.1,ease:"power1.inOut",},"<")
                .to(chicken.position,{y:chicken.position.y,duration:0.1,ease:"power1.in",},"-=0.15")
                gsap.to(camera.position,{x:camera.position.x - 1,duration:0.2,ease:"power1.out"})
                directionalLight.position.x --
                target.position.x --
                updateMap()
                break
            case "d":
            case "ArrowRight":
                if (chicken.position.z < 8) {
                    currentRotation = shortestRotation(currentRotation,0)
                    tl.to(chicken.position,{y:chicken.position.y + 0.5,duration:0.1,ease:"power1.out",})
                    .to(chicken.rotation,{y: currentRotation,duration: 0.2,ease:"power1.inOut"},"<")
                    .to(chicken.position,{z:chicken.position.z + 1,duration:0.1,ease:"power1.inOut",},"<")
                    .to(chicken.position,{y:chicken.position.y,duration:0.1,ease:"power1.in",},"-=0.15")
                    gsap.to(camera.position,{z:camera.position.z + 0.4,duration:1,ease:"power1.out"})
                }
                break
            case "a":
            case "ArrowLeft":  
                if (chicken.position.z > 0) { 
                    currentRotation = shortestRotation(currentRotation,Math.PI )
                    tl.to(chicken.position,{y:chicken.position.y + 0.5,duration:0.1,ease:"power1.out",})
                    .to(chicken.rotation,{y: currentRotation,duration: 0.2,ease:"power1.inOut"},"<")
                    .to(chicken.position,{z:chicken.position.z - 1,duration:0.1,ease:"power1.inOut",},"<")
                    .to(chicken.position,{y:chicken.position.y,duration:0.1,ease:"power1.in",},"-=0.15")
                    gsap.to(camera.position,{z:camera.position.z - 0.4,duration:1,ease:"power1.out"})
                }
                break
        }
    }
    document.addEventListener("keydown",movementsVar)
    
    
    
}   
//animation
init()
let currentLog = false;
let logsize = 0;
let logSpeed = 0;
let death = false;
function waterUpdate(x,z){
        //this function check if the chicken is jumping in the water or on a log who's moving
        if (currentLog) {
            const logZ = currentLog.position.z
            const logX = currentLog.position.x
            const width = Number(logsize.z.toFixed(5))
            if (chicken.position.z > logZ - width/2 && chicken.position.z < logZ + width/2 && chicken.position.x == logX){
                //mooving the chicken at the speed of the log
                chicken.position.z += logSpeed
                console.log("on a log")
            } else {
                currentLog = false 
                console.log("not on a log")
            } 
        } else if (logs.has(x)) {
        //if there is logs on the chicken line
            let dived = true
            const logList = logs.get(x)
            logSpeed = logList[0]
            //get all individual logs
            for (let index = 1; index < logList.length;index ++) {
                const log = logList[index]
                const logZ = log.position.z
                //try to get logsize
                const box = new THREE.Box3().setFromObject(log);
                logsize = new THREE.Vector3();
                box.getSize(logsize);
                const logWidth = Number(logsize.z.toFixed(5))
                //if chicken is on one log of the list
                if (chicken.position.z > logZ - logWidth/2 && chicken.position.z < logZ + logWidth/2) {
                    //store the currentlog  
                    currentLog = log
                    dived = false
                    break
                }  
            }
            if (dived) {
                dead(1)
            } 
        } 
    }

function dead(deadType){
        //deadType : 1 = drowned, 2 = run over by a vehicle (train, car, truck), 3 = too slow, eaten by the bird
        switch (deadType) {
            case 1:
                death = true
                document.removeEventListener("keydown",movementsVar)
                gsap.to(chicken.position,{
                    y:chicken.position.y - 1.5,
                    duration: 0.3,
                    ease:"power1.inOut"
                })
                break
            case 2:
                break
            case 3: 
                break
        }    
    }
function animate(){
    stats.begin()
    //enable if needed
    /*
    if (chickenBoxHelper) {
        chickenBoxHelper.update()
    }
    */
    logs.forEach((logArray)=>{
        //random positive/negative value betweem +- 0.05
        const speed = logArray[0]
        for (let k = 1; k < logArray.length; k ++ ) {
            const log = logArray[k]
            if (log.position.z < -6) {
                log.position.z = 14
            } else if (log.position.z > 15) {
                log.position.z = -5  
            } 
            log.position.z += speed
        }
    })
    if (!death){
        waterUpdate(chicken.position.x,chicken.position.z)
    }

    renderer.render(scene,camera)
    stats.end()
}