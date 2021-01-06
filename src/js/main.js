let camera, scene, renderer, controls, flashLight,slenderMan, origem, composer, glitchPass, onKeyDown, moveSpeed, rustedCar;
let raycaster;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let run = false;
let interact = false;
let lanternPicked = false;
let gateClosed = false;
let canEscape = false;
let rainOn = true;
let rainSoundOn = true;
let slenderOn = true;
let gateCollision;
let onWater, flashLightBody, flashLightLamp, flashLightCircle, spotLight1, spotLight2, spotLight3, spotLight4, light;

const objects = [];
const papers = [];
const slenders = [];
const water = [];

let forestSound, stepSound, slenderStaticSound, pageFlipSound, rainSound, flashLightClickSound, gateClosingSound;
var slenderSpeed = 0.0;
var baseSlenderSpeed = 0.00175; //velocidade inicial
var collectPages = 0;
var inicialPapersLenght = 0;
var flashLightPower = 0;

var forestSoundVolume = 0.25;
var rainSoundVolume = 0.15;
var gateClosingSoundVolume = 0.6;
var forestSoundVolume = 0.25;
var flashLightClickSoundVolume = 0.5;
var pageFlipSoundVolume = 0.4;
var slenderStaticSoundVolume = 0.5;
var stepSoundVolume = 0.6;

var baseMoveSpeed = 7.5; //maior mais devagar
var stamina = 100;
const mouseSpeed = 0.0008;

let rainGeo, rainCount, rain, rainDrop;			

// Save the current time
let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const vertex = new THREE.Vector3();
const color = new THREE.Color();

var coordArray = getMap();

var loadingScreen = {
    scene: new THREE.Scene(),
    camera: new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.6, 1000 ),
};
var loadingManager = null;
var RESOURCES_LOADED = false;		

var elem = document.documentElement;

function openFullscreen() {
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
    }
}

function loadSlender() {
    const SlenderLoader = new THREE.OBJLoader(loadingManager);

    SlenderLoader.load(
        'models/slenderman/SM Model.obj',
        function ( slenderMan ) {
            slenderMan.position.x = Math.floor(Math.random() * 400);
            slenderMan.position.y = 0;
            slenderMan.position.z = Math.floor(Math.random() * 400); // começar do fundo de forma randomica
            slenderMan.scale.x = 11;
            slenderMan.scale.y = 11;
            slenderMan.scale.z = 11;
            slenderMan.rotateY(Math.PI*11/12) // rever
            slenderMan.traverse( function ( child ) {
            if ( child instanceof THREE.Mesh ) {
                const slenderTexture = new THREE.TextureLoader(loadingManager).load( 'models/slenderman/slenderman_color.png' );			
                child.material = new THREE.MeshStandardMaterial( {map: slenderTexture, metalness: 0.85, fog: true} )
                }
            } );						
            scene.add( slenderMan );
            slenders.push(slenderMan);
        }
    );    
}

function turnLightsOn() {
    light.intensity = 0.75;
}

function turnLightsOff() {
    light.intensity = 0.0;
}

function turnRainOff() {
    rainOn = false;
    rainSoundOn = false;
    scene.remove(rain)
}

function turnRainOn() {
    rainOn = true;
    rainSoundOn = true;
    scene.add(rain);
}

function turnSlenderOff() {
    slenderOn = false;
    scene.remove(slenders[0])
}

function turnSlenderOn() {
    slenderOn = true;
    slenders.shift();
    loadSlender();
}

init();
animate();

var AudioLoader = new THREE.AudioLoader(loadingManager);
const listener = new THREE.AudioListener();

function init() {				

    loadingManager = new THREE.LoadingManager();

    const loadingScreenCSS = document.getElementById( 'loading-screen' );
    loadingManager = new THREE.LoadingManager( () => {
        loadingScreenCSS.classList.add( 'fade-out' );
    } );
    
    loadingManager.onLoad = function(){
        loadingScreenCSS.remove();
        RESOURCES_LOADED = true;
        blocker.style.visibility = 'visible';
        instructions.style.visibility = 'visible';
    };

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.6, 1000 );

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x000000 );

    light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.00 );  // ( 0xeeeeff, 0x777788, 0.5 )
    light.position.set( 0.5, 1, 0.75 );
    scene.add(light);

    controls = new THREE.PointerLockControls( camera, document.body );
    controls.speedFactor = mouseSpeed;

    const blocker = document.getElementById( 'blocker' );
    const instructions = document.getElementById( 'instructions' );
    const gameover = document.getElementById( 'gameover' );
    const pages = document.getElementById( 'pages' );				

    instructions.addEventListener( 'click', function () {
        controls.lock();
    }, false );

    // permission 
    controls.addEventListener( 'lock', function () {
        instructions.style.display = 'none';
        blocker.style.display = 'none';
        pages.style.visibility = 'visible';
        // create an AudioListener and add it to the camera
        camera.add( listener );
        if(gateClosed === false) {
            openFullscreen();
            gateClosingSound = new THREE.Audio( listener );
            AudioLoader.load( 'sounds/gateClosingSound.mp3', function( buffer ) {
                gateClosingSound.setBuffer( buffer );
                gateClosingSound.setLoop( false );
                gateClosingSound.setVolume(gateClosingSoundVolume);
                gateClosingSound.play();
                gateClosed = true;
            });
        }

        forestSound = new THREE.Audio( listener );
        rainSound = new THREE.Audio( listener );
        flashLightClickSound = new THREE.Audio( listener );
        AudioLoader.load( 'sounds/forest.mp3', function( buffer ) {
            forestSound.setBuffer( buffer );
            forestSound.setLoop( true );
            forestSound.setVolume( forestSoundVolume );
            forestSound.play();
        });
        if (rainSoundOn === true) {
            AudioLoader.load( 'sounds/rain1.mp3', function( buffer ) {
                rainSound.setBuffer( buffer );
                rainSound.setLoop( true );
                rainSound.setVolume( rainSoundVolume );
                rainSound.play();
            });
        }
        // create a global audio source
        stepSound = new THREE.Audio( listener );
        slenderStaticSound = new THREE.Audio( listener );
        pageFlipSound = new THREE.Audio( listener );

        slenderSpeed = baseSlenderSpeed + collectPages*0.0025;
    } );

    controls.addEventListener( 'unlock', function () {
        blocker.style.display = 'block';
        instructions.style.display = '';
        forestSound.stop();
        if(rainSoundOn === true) rainSound.stop();
    } );

    flashLightPowerRange = document.getElementById('flashLightPowerRange')
    flashLightPowerRange.addEventListener('change', function() {
        flashLightPower = flashLightPowerRange.value/20-1;
    })

    const volume = document.getElementById('volume')
    volume.addEventListener('change', function() {
        forestSoundVolume = (0.25 + volume.value/300);
        if (rainSoundOn) rainSoundVolume = (0.15 + volume.value/300);
        gateClosingSoundVolume = (0.6 + volume.value/300);
        flashLightClickSoundVolume = (0.5 + volume.value/300);
        pageFlipSoundVolume = (0.4 + volume.value/300);
        slenderStaticSoundVolume = (0.5 + volume.value/300);
        stepSoundVolume = (0.6 + volume.value/300);        
    })    

    scene.add( controls.getObject() );

    onKeyDown = function ( event ) {

        switch ( event.keyCode ) {

            case 38: // up
            case 87: // w
                moveForward = true;
                break;

            case 37: // left
            case 65: // a
                moveLeft = true;
                break;

            case 40: // down
            case 83: // s
                moveBackward = true;
                break;

            case 39: // right
            case 68: // d
                moveRight = true;
                break;

            case 16: // shift
                run = true;
                break;

            case 69: // e
                interact = true;
                break;

        }

    };

    const onKeyUp = function ( event ) {

        switch ( event.keyCode ) {

            case 38: // up
            case 87: // w
                moveForward = false;
                break;

            case 37: // left
            case 65: // a
                moveLeft = false;
                break;

            case 40: // down
            case 83: // s
                moveBackward = false;
                break;

            case 39: // right
            case 68: // d
                moveRight = false;
                break;

            case 16: // shift
                run = false;
                break;

            case 69: // e
                interact = false;
                break;

        }

    };

    document.addEventListener( 'keydown', onKeyDown, false );
    document.addEventListener( 'keyup', onKeyUp, false );
    
    raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );	

    // floor

    let floorGeometry = new THREE.PlaneBufferGeometry( 1000, 1220, 100, 100 );
    floorGeometry.rotateX( - Math.PI / 2 );

    // vertex displacement

    let position = floorGeometry.attributes.position;

    for ( let i = 0, l = position.count; i < l; i ++ ) {
        vertex.fromBufferAttribute( position, i );
        vertex.x += Math.random() * 20 - 10;
        vertex.y += Math.random() * 2;
        vertex.z += Math.random() * 20 - 10;
        position.setXYZ( i, vertex.x, vertex.y, vertex.z );
    }

    // ensure each face has unique vertices
    floorGeometry = floorGeometry.toNonIndexed(); 

    const floor_texture = new THREE.TextureLoader(loadingManager).load( 'textures/grass1.jpg' );
    const floorMaterial = new THREE.MeshPhongMaterial( { map : floor_texture } );
    floor_texture.wrapS = THREE.RepeatWrapping;
    floor_texture.wrapT = THREE.RepeatWrapping;
    floor_texture.repeat.set( 12, 12 );				

    const floor = new THREE.Mesh( floorGeometry, floorMaterial );
    floor.position.x = 430;
    floor.position.z = 540;
    scene.add( floor );

    // objects

    for ( let i = 0; i < coordArray.length; i++) {
        var coordinates = coordArray[i];	
        for(var j = 0; j < coordinates.length; j++) {
            if (coordinates[j] === 1) {
                const cylinderGeometry = new THREE.CylinderBufferGeometry( 10, 10, 200 ).toNonIndexed();
                const three_texture = new THREE.TextureLoader(loadingManager).load( 'textures/arvore.jpeg' );
                const cylinderMaterial = new THREE.MeshPhongMaterial( {  map : three_texture} );							
                const cylinder = new THREE.Mesh( cylinderGeometry, cylinderMaterial );
                
                cylinder.position.x = i*20;
                cylinder.position.y = 95;
                cylinder.position.z = j*20;
                
                const box = new THREE.Box3();
                box.setFromObject(cylinder);

                scene.add( cylinder );
                objects.push( box );
            }

            else if (coordinates[j] === 2) { //container

                const containerLenght = 80;
                const containerHeight = 50;

                var planeGeometry = new THREE.PlaneBufferGeometry( containerLenght, containerHeight)
                const container_texture = new THREE.TextureLoader(loadingManager).load( 'textures/container.png' );			
                const planeMaterial = new THREE.MeshStandardMaterial( {map: container_texture, side: THREE.DoubleSide} );
                var plane = new THREE.Mesh( planeGeometry,  planeMaterial);

                plane.position.x = i*20;
                plane.position.y = 20;
                plane.position.z = j*20-20;

                const boxGeometry = new THREE.BoxBufferGeometry( containerLenght, containerHeight, 2)		
                const collisionBox1 = new THREE.Mesh( boxGeometry);
                
                collisionBox1.position.x = i*20;
                collisionBox1.position.y = 20;
                collisionBox1.position.z = j*20-20;

                const box1 = new THREE.Box3();
                box1.setFromObject(collisionBox1);	

                scene.add( plane );	
                objects.push( box1 );

                plane = new THREE.Mesh( planeGeometry,  planeMaterial);

                plane.position.x = i*20;
                plane.position.y = 20;
                plane.position.z = j*20+20;

                const collisionBox2 = new THREE.Mesh( boxGeometry);

                collisionBox2.position.x = i*20;
                collisionBox2.position.y = 20;
                collisionBox2.position.z = j*20+20;

                const box2 = new THREE.Box3();
                box2.setFromObject(collisionBox2);	

                scene.add( plane );	
                objects.push( box2 );	

                planeGeometry = new THREE.PlaneGeometry( 80, 40)			
                plane = new THREE.Mesh( planeGeometry,  planeMaterial);

                plane.position.x = i*20;
                plane.position.y = 45;
                plane.position.z = j*20;
                plane.rotateX(Math.PI / 2)

                scene.add( plane );								

            }

            else if (coordinates[j] === 5) { //crossed walls
                const boxGeometry = new THREE.BoxBufferGeometry( 80, 40, 3)
                const wall_texture = new THREE.TextureLoader(loadingManager).load( 'textures/wall.jpg' );
                const wall_texture2 = new THREE.TextureLoader(loadingManager).load( 'textures/wall.jpg' );
                wall_texture2.wrapS = THREE.RepeatWrapping;
                wall_texture2.wrapT = THREE.RepeatWrapping;
                wall_texture2.repeat.set( 0.1, 1 );
                const boxMaterial = 
                    [
                        new THREE.MeshStandardMaterial({map: wall_texture2, side: THREE.DoubleSide}), // RIGHT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture2, side: THREE.DoubleSide}), // LEFT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture2, side: THREE.DoubleSide}), // TOP SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture2, side: THREE.DoubleSide}), // BOTTOM SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture, side: THREE.DoubleSide}), // FRONT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture, side: THREE.DoubleSide}) // BACK SIDE
                    ];

                const box1 = new THREE.Mesh( boxGeometry,  boxMaterial);

                box1.position.x = i*20;
                box1.position.y = 20;
                box1.position.z = j*20;
                
                const collisionBox1 = new THREE.Box3();
                collisionBox1.setFromObject(box1);

                scene.add( box1 );	
                objects.push( collisionBox1 );	

                const box2 = new THREE.Mesh( boxGeometry,  boxMaterial);

                box2.position.x = i*20;
                box2.position.y = 20;
                box2.position.z = j*20;
                box2.rotateY(Math.PI / 2);
                
                const collisionBox2 = new THREE.Box3();
                collisionBox2.setFromObject(box2);

                scene.add( box2 );	
                objects.push( collisionBox2 );							
            }

            else if (coordinates[j] === 6) { //página
                const planeGeometry = new THREE.PlaneGeometry( 2.5, 4)
                const paper_texture = new THREE.TextureLoader(loadingManager).load( 'textures/page1.jpeg' );
                const planeMaterial = new THREE.MeshBasicMaterial( {map: paper_texture, side: THREE.DoubleSide} );
                const plane = new THREE.Mesh( planeGeometry,  planeMaterial);

                plane.position.x = i*20;
                plane.position.y = 2;
                plane.position.z = j*20;
                plane.rotateX(Math.PI*3/2);

                const box = new THREE.Box3();
                box.setFromObject(plane);

                scene.add( plane );	
                papers.push(plane);
            }

            else if (coordinates[j] === 7) { //página
                const planeGeometry = new THREE.PlaneGeometry( 2.5, 4)
                const paper_texture = new THREE.TextureLoader(loadingManager).load( 'textures/page2.jpeg' );
                paper_texture.roation = Math.PI/2
                const planeMaterial = new THREE.MeshBasicMaterial( {map: paper_texture, side: THREE.DoubleSide} );
                const plane = new THREE.Mesh( planeGeometry,  planeMaterial);

                plane.position.x = i*20+7;
                plane.position.y = 16;
                plane.position.z = j*20-18.4;
                plane.rotateX(Math.PI*2);

                const box = new THREE.Box3();
                box.setFromObject(plane);
                
                scene.add( plane );	
                papers.push(plane);
            }			

            else if (coordinates[j] === 8) { //página
                const planeGeometry = new THREE.PlaneGeometry( 2.5, 4)
                const paper_texture = new THREE.TextureLoader(loadingManager).load( 'textures/page3.jpeg' );			
                paper_texture.roation = Math.PI/2
                const planeMaterial = new THREE.MeshBasicMaterial( {map: paper_texture, side: THREE.DoubleSide} );
                const plane = new THREE.Mesh( planeGeometry,  planeMaterial);

                plane.position.x = i*20+10;
                plane.position.y = 15;
                plane.position.z = j*20+1.8;
                plane.rotateX(Math.PI*2);

                const box = new THREE.Box3();
                box.setFromObject(plane);

                scene.add( plane );	
                papers.push(plane);
            }

            else if (coordinates[j] === 9) { //página
                const planeGeometry = new THREE.PlaneGeometry( 2.5, 4)
                const paper_texture = new THREE.TextureLoader(loadingManager).load( 'textures/page4.jpeg' );
                const planeMaterial = new THREE.MeshBasicMaterial( {map: paper_texture, side: THREE.DoubleSide} );
                const plane = new THREE.Mesh( planeGeometry,  planeMaterial);

                plane.position.x = i*20+6.4;
                plane.position.y = 14.1;
                plane.position.z = j*20-3;
                plane.rotateX(Math.PI/2);
                plane.rotateY(Math.PI);

                const box = new THREE.Box3();
                box.setFromObject(plane);

                scene.add( plane );	
                papers.push(plane);
            }

            else if (coordinates[j] === 10) { //página
                
                const planeGeometry = new THREE.PlaneGeometry( 2.5, 4)
                const paper_texture = new THREE.TextureLoader(loadingManager).load( 'textures/page5.jpeg' );			
                paper_texture.roation = Math.PI/2
                const planeMaterial = new THREE.MeshBasicMaterial( {map: paper_texture, side: THREE.DoubleSide} );
                const plane = new THREE.Mesh( planeGeometry,  planeMaterial);

                plane.position.x = i*20;
                plane.position.y = 9.6;
                plane.position.z = j*20+10;
                plane.rotateX(Math.PI*3/2);
                plane.rotateZ(Math.PI*1/7);

                const box = new THREE.Box3();
                box.setFromObject(plane);

                scene.add( plane );	
                papers.push(plane);
            }												

            else if (coordinates[j] === 11) { //bathroom
                var boxGeometry = new THREE.BoxBufferGeometry( 45, 35, 3)
                var wall_texture = new THREE.TextureLoader(loadingManager).load( 'textures/bathroom_wall.png' );
                wall_texture.wrapS = THREE.RepeatWrapping;
                wall_texture.wrapT = THREE.RepeatWrapping;
                wall_texture.repeat.set( 2, 1 );

                const wall_texture2 = new THREE.TextureLoader(loadingManager).load( 'textures/dirty_wall.jpg' );
                wall_texture2.wrapS = THREE.RepeatWrapping;
                wall_texture2.wrapT = THREE.RepeatWrapping;
                wall_texture2.repeat.set( 1, 1 );

                const wall_texture3 = new THREE.TextureLoader(loadingManager).load( 'textures/dirty_wall.jpg' );
                wall_texture3.wrapS = THREE.RepeatWrapping;
                wall_texture3.wrapT = THREE.RepeatWrapping;
                wall_texture3.repeat.set( 0.1, 1 );							
                
                var boxMaterial = 
                    [
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // RIGHT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // LEFT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // TOP SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture, side: THREE.DoubleSide}), // BOTTOM SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture, side: THREE.DoubleSide}), // FRONT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture, side: THREE.DoubleSide}) // BACK SIDE
                    ];
                const box1 = new THREE.Mesh( boxGeometry,  boxMaterial);

                box1.position.x = i*20-40;
                box1.position.y = 15;
                box1.position.z = j*20;
                
                const collisionBox1 = new THREE.Box3();
                collisionBox1.setFromObject(box1);

                const box2 = new THREE.Mesh( boxGeometry,  boxMaterial);

                box2.position.x = i*20-40;
                box2.position.y = 15;
                box2.position.z = j*20-40;

                const collisionBox2 = new THREE.Box3();
                collisionBox2.setFromObject(box2);							

                scene.add( box1 );	
                objects.push( collisionBox1 );							

                scene.add( box2 );	
                objects.push( collisionBox2 );

                //// PAREDE ESQUERDA DA PORTA DE ENTRADA

                boxGeometry = new THREE.BoxBufferGeometry( 22, 35, 3)
                wall_texture = new THREE.TextureLoader(loadingManager).load( 'textures/bathroom_wall.png' );
                wall_texture.wrapS = THREE.RepeatWrapping;
                wall_texture.wrapT = THREE.RepeatWrapping;
                wall_texture.repeat.set( 1, 1 );								
                boxMaterial = 
                    [
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // RIGHT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // LEFT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // TOP SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture, side: THREE.DoubleSide}), // BOTTOM SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture2, side: THREE.DoubleSide}), // FRONT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture, side: THREE.DoubleSide}) // BACK SIDE
                    ];
                const box3 = new THREE.Mesh( boxGeometry,  boxMaterial);

                box3.position.x = i*20-8;
                box3.position.y = 15;
                box3.position.z = j*20;
                
                const collisionBox3 = new THREE.Box3();
                collisionBox3.setFromObject(box3);

                scene.add( box3 );	
                objects.push( collisionBox3 );	

                ///							

                boxGeometry = new THREE.BoxBufferGeometry( 22, 35, 3)
                wall_texture = new THREE.TextureLoader(loadingManager).load( 'textures/bathroom_wall.png' );
                wall_texture.wrapS = THREE.RepeatWrapping;
                wall_texture.wrapT = THREE.RepeatWrapping;
                wall_texture.repeat.set( 1, 1 );								
                boxMaterial = 
                    [
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // RIGHT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // LEFT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // TOP SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture, side: THREE.DoubleSide}), // BOTTOM SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture, side: THREE.DoubleSide}), // FRONT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture2, side: THREE.DoubleSide}) // BACK SIDE
                    ];
                const box4 = new THREE.Mesh( boxGeometry,  boxMaterial);

                box4.position.x = i*20-8;
                box4.position.y = 15;
                box4.position.z = j*20-40;
                
                const collisionBox4 = new THREE.Box3();
                collisionBox4.setFromObject(box4);

                scene.add( box4 );	
                objects.push( collisionBox4 );

                ///

                boxGeometry = new THREE.BoxBufferGeometry( 12.5, 35, 3)
                wall_texture = new THREE.TextureLoader(loadingManager).load( 'textures/bathroom_wall.png' );
                wall_texture.wrapS = THREE.RepeatWrapping;
                wall_texture.wrapT = THREE.RepeatWrapping;
                wall_texture.repeat.set( 1, 1 );			
                boxMaterial = 
                    [
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // RIGHT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // LEFT SIDE
                        new THREE.MeshStandardMaterial({color: 0xcce0eb, side: THREE.DoubleSide}), // TOP SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture, side: THREE.DoubleSide}), // BOTTOM SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture2, side: THREE.DoubleSide}), // FRONT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture, side: THREE.DoubleSide}) // BACK SIDE
                    ];
                const box5 = new THREE.Mesh( boxGeometry,  boxMaterial);

                box5.position.x = i*20+1.5;
                box5.position.y = 15;
                box5.position.z = j*20-35;
                box5.rotateY(Math.PI / 2);
                
                const collisionBox5 = new THREE.Box3();
                collisionBox5.setFromObject(box5);

                scene.add( box5 );	
                objects.push( collisionBox5 );	

                ///

                boxGeometry = new THREE.BoxBufferGeometry( 12.5, 35, 3)
                wall_texture = new THREE.TextureLoader(loadingManager).load( 'textures/bathroom_wall.png' );
                wall_texture.wrapS = THREE.RepeatWrapping;
                wall_texture.wrapT = THREE.RepeatWrapping;
                wall_texture.repeat.set( 1, 1 );			
                boxMaterial = 
                    [
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // RIGHT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // LEFT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // TOP SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture, side: THREE.DoubleSide}), // BOTTOM SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture2, side: THREE.DoubleSide}), // FRONT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture, side: THREE.DoubleSide}) // BACK SIDE
                    ];
                const box6 = new THREE.Mesh( boxGeometry,  boxMaterial);

                box6.position.x = i*20+1.5;
                box6.position.y = 15;
                box6.position.z = j*20-5;
                box6.rotateY(Math.PI / 2);
                
                const collisionBox6 = new THREE.Box3();
                collisionBox6.setFromObject(box6);

                scene.add( box6 );	
                objects.push( collisionBox6 );	

                /// LATERAL DIREITA INFERIOR EXTERTA

                boxGeometry = new THREE.BoxBufferGeometry( 80, 35, 3)
                wall_texture = new THREE.TextureLoader(loadingManager).load( 'textures/bathroom_wall.png' );
                wall_texture.wrapS = THREE.RepeatWrapping;
                wall_texture.wrapT = THREE.RepeatWrapping;
                wall_texture.repeat.set( 4, 1 );								
                boxMaterial = 
                    [
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // RIGHT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // LEFT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // TOP SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture, side: THREE.DoubleSide}), // BOTTOM SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture2, side: THREE.DoubleSide}), // FRONT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture, side: THREE.DoubleSide}) // BACK SIDE
                    ];
                const box7 = new THREE.Mesh( boxGeometry,  boxMaterial);

                box7.position.x = i*20-19;
                box7.position.y = 15;
                box7.position.z = j*20-80;
                box7.rotateY(Math.PI / 2);
                
                const collisionBox7 = new THREE.Box3();
                collisionBox7.setFromObject(box7);

                scene.add( box7 );	
                objects.push( collisionBox7 );

                /// LATERAL ESQUERDA INFERIOR EXTERTA

                boxGeometry = new THREE.BoxBufferGeometry( 80, 35, 3)
                wall_texture = new THREE.TextureLoader(loadingManager).load( 'textures/bathroom_wall.png' );
                wall_texture.wrapS = THREE.RepeatWrapping;
                wall_texture.wrapT = THREE.RepeatWrapping;
                wall_texture.repeat.set( 4, 1 );								
                boxMaterial = 
                    [
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // RIGHT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // LEFT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // TOP SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture, side: THREE.DoubleSide}), // BOTTOM SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture2, side: THREE.DoubleSide}), // FRONT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture, side: THREE.DoubleSide}) // BACK SIDE
                    ];
                const box8 = new THREE.Mesh( boxGeometry,  boxMaterial);

                box8.position.x = i*20-19;
                box8.position.y = 15;
                box8.position.z = j*20+40;
                box8.rotateY(Math.PI / 2);
                
                const collisionBox8 = new THREE.Box3();
                collisionBox8.setFromObject(box8);

                scene.add( box8 );	
                objects.push( collisionBox8 );

                /// LATERAL DIREITA EXTERNA

                boxGeometry = new THREE.BoxBufferGeometry( 120, 35, 3)
                wall_texture = new THREE.TextureLoader(loadingManager).load( 'textures/bathroom_wall.png' );
                wall_texture.wrapS = THREE.RepeatWrapping;
                wall_texture.wrapT = THREE.RepeatWrapping;
                wall_texture.repeat.set( 5, 1 );									
                boxMaterial = 
                    [
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // RIGHT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // LEFT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // TOP SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture, side: THREE.DoubleSide}), // BOTTOM SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture, side: THREE.DoubleSide}), // FRONT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture2, side: THREE.DoubleSide}) // BACK SIDE
                    ];
                const box9 = new THREE.Mesh( boxGeometry,  boxMaterial);

                box9.position.x = i*20-80;
                box9.position.y = 15;
                box9.position.z = j*20-118.5;
                
                const collisionBox9 = new THREE.Box3();
                collisionBox9.setFromObject(box9);

                scene.add( box9 );	
                objects.push( collisionBox9 );

                /// LATERAL ESQUERDA EXTERNA

                boxGeometry = new THREE.BoxBufferGeometry( 120, 35, 3)
                wall_texture = new THREE.TextureLoader(loadingManager).load( 'textures/bathroom_wall.png' );
                wall_texture.wrapS = THREE.RepeatWrapping;
                wall_texture.wrapT = THREE.RepeatWrapping;
                wall_texture.repeat.set( 5, 1 );									
                boxMaterial = 
                    [
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // RIGHT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // LEFT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // TOP SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture, side: THREE.DoubleSide}), // BOTTOM SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture2, side: THREE.DoubleSide}), // FRONT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture, side: THREE.DoubleSide}) // BACK SIDE
                    ];
                const box10 = new THREE.Mesh( boxGeometry,  boxMaterial);

                box10.position.x = i*20-80;
                box10.position.y = 15;
                box10.position.z = j*20+78.5;
                
                const collisionBox10 = new THREE.Box3();
                collisionBox10.setFromObject(box10);

                scene.add( box10 );	
                objects.push( collisionBox10 );

                /// LATERAL DIREITA EXTERNA SUPERIOR

                boxGeometry = new THREE.BoxBufferGeometry( 80, 35, 3)
                wall_texture = new THREE.TextureLoader(loadingManager).load( 'textures/bathroom_wall.png' );
                wall_texture.wrapS = THREE.RepeatWrapping;
                wall_texture.wrapT = THREE.RepeatWrapping;
                wall_texture.repeat.set( 4, 1 );								
                boxMaterial = 
                    [
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // RIGHT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // LEFT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // TOP SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture, side: THREE.DoubleSide}), // BOTTOM SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture , side: THREE.DoubleSide}), // FRONT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture2, side: THREE.DoubleSide}) // BACK SIDE
                    ];
                const box11 = new THREE.Mesh( boxGeometry,  boxMaterial);

                box11.position.x = i*20-140;
                box11.position.y = 15;
                box11.position.z = j*20-80;
                box11.rotateY(Math.PI / 2);
                
                const collisionBox11 = new THREE.Box3();
                collisionBox11.setFromObject(box11);

                scene.add( box11 );	
                objects.push( collisionBox11 );

                /// LATERAL ESQUERDA EXTERNA SUPERIOR

                boxGeometry = new THREE.BoxBufferGeometry( 80, 35, 3)
                wall_texture = new THREE.TextureLoader(loadingManager).load( 'textures/bathroom_wall.png' );
                wall_texture.wrapS = THREE.RepeatWrapping;
                wall_texture.wrapT = THREE.RepeatWrapping;
                wall_texture.repeat.set( 4, 1 );								
                boxMaterial = 
                    [
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // RIGHT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // LEFT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // TOP SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture, side: THREE.DoubleSide}), // BOTTOM SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture , side: THREE.DoubleSide}), // FRONT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture2, side: THREE.DoubleSide}) // BACK SIDE
                    ];
                const box12 = new THREE.Mesh( boxGeometry,  boxMaterial);

                box12.position.x = i*20-140;
                box12.position.y = 15;
                box12.position.z = j*20+40;
                box12.rotateY(Math.PI / 2);
                
                const collisionBox12 = new THREE.Box3();
                collisionBox12.setFromObject(box12);

                scene.add( box12 );	
                objects.push( collisionBox12 );								

                /// DIREITA INTERIOR SUPERIOR

                boxGeometry = new THREE.BoxBufferGeometry( 60, 35, 3)
                wall_texture = new THREE.TextureLoader(loadingManager).load( 'textures/bathroom_wall.png' );			
                boxMaterial = 
                    [
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // RIGHT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // LEFT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // TOP SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture, side: THREE.DoubleSide}), // BOTTOM SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture, side: THREE.DoubleSide}), // FRONT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture, side: THREE.DoubleSide}) // BACK SIDE
                    ];

                wall_texture.wrapS = THREE.RepeatWrapping;
                wall_texture.wrapT = THREE.RepeatWrapping;
                wall_texture.repeat.set( 4, 1 );

                const box13 = new THREE.Mesh( boxGeometry,  boxMaterial);

                box13.position.x = i*20-111.5;
                box13.position.y = 15;
                box13.position.z = j*20-40;
                
                const collisionBox13 = new THREE.Box3();
                collisionBox13.setFromObject(box13);

                scene.add( box13 );	
                objects.push( collisionBox13 );

                /// ESQUERDA INTERIOR SUPERIOR

                boxGeometry = new THREE.BoxBufferGeometry( 60, 35, 3)
                wall_texture = new THREE.TextureLoader(loadingManager).load( 'textures/bathroom_wall.png' );			
                wall_texture.wrapS = THREE.RepeatWrapping;
                wall_texture.wrapT = THREE.RepeatWrapping;
                wall_texture.repeat.set( 4, 1 );
                boxMaterial = 
                    [
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // RIGHT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // LEFT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // TOP SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture, side: THREE.DoubleSide}), // BOTTOM SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture, side: THREE.DoubleSide}), // FRONT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture, side: THREE.DoubleSide}) // BACK SIDE
                    ];

                const box14 = new THREE.Mesh( boxGeometry,  boxMaterial);

                box14.position.x = i*20-111.5;
                box14.position.y = 15;
                box14.position.z = j*20;
                
                const collisionBox14 = new THREE.Box3();
                collisionBox14.setFromObject(box14);

                scene.add( box14 );	
                objects.push( collisionBox14 );

                /// PARTE EXTERIOR ESQUERDA PORTA

                boxGeometry = new THREE.BoxBufferGeometry( 28, 35, 3)
                wall_texture = new THREE.TextureLoader(loadingManager).load( 'textures/bathroom_wall.png' );			
                wall_texture.wrapS = THREE.RepeatWrapping;
                wall_texture.wrapT = THREE.RepeatWrapping;
                wall_texture.repeat.set( 2, 1 );
                boxMaterial = 
                    [
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // RIGHT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // LEFT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // TOP SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture, side: THREE.DoubleSide}), // BOTTOM SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture2, side: THREE.DoubleSide}), // FRONT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture, side: THREE.DoubleSide}) // BACK SIDE
                    ];

                const box15 = new THREE.Mesh( boxGeometry,  boxMaterial);

                box15.position.x = i*20-155;
                box15.position.y = 15;
                box15.position.z = j*20;
                
                const collisionBox15 = new THREE.Box3();
                collisionBox15.setFromObject(box15);

                scene.add( box15 );	
                objects.push( collisionBox15 );														

                /// PARTE SUPERIOR DA ENTRADA

                boxGeometry = new THREE.BoxBufferGeometry( 60, 35, 3)
                boxMaterial = 
                    [
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // RIGHT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // LEFT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // TOP SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // BOTTOM SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture2, side: THREE.DoubleSide}), // FRONT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture2, side: THREE.DoubleSide}) // BACK SIDE
                    ];
                const box16 = new THREE.Mesh( boxGeometry,  boxMaterial);

                box16.position.x = i*20-170;
                box16.position.y = 15;
                box16.position.z = j*20-28.5;
                box16.rotateY(Math.PI / 2);
                
                const collisionBox16 = new THREE.Box3();
                collisionBox16.setFromObject(box16);

                scene.add( box16 );	
                objects.push( collisionBox16 );	

                /// TETO MEIO

                boxGeometry = new THREE.BoxBufferGeometry( 124, 200, 3)
                boxMaterial = 
                    [
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // RIGHT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // LEFT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // TOP SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // BOTTOM SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture2, side: THREE.DoubleSide}), // FRONT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture2, side: THREE.DoubleSide}) // BACK SIDE
                    ];
                const box17 = new THREE.Mesh( boxGeometry,  boxMaterial);

                box17.position.x = i*20-79.5;
                box17.position.y = 32.5;
                box17.position.z = j*20-20;
                box17.rotateX(Math.PI*3/2);
                
                scene.add( box17 );	

                /// TETO PORTA

                boxGeometry = new THREE.BoxBufferGeometry( 22, 43, 3)
                boxMaterial = 
                    [
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // RIGHT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // LEFT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // TOP SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // BOTTOM SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture2 , side: THREE.DoubleSide}), // FRONT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture2, side: THREE.DoubleSide}) // BACK SIDE
                    ];
                const box18 = new THREE.Mesh( boxGeometry, boxMaterial);

                box18.position.x = i*20-8;
                box18.position.y = 32.5;
                box18.position.z = j*20-20;
                box18.rotateX(Math.PI*3/2);

                scene.add( box18 );								

                /// TETO SAÍDA

                boxGeometry = new THREE.BoxBufferGeometry( 31, 60, 3)
                boxMaterial = 
                    [
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // RIGHT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // LEFT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // TOP SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // BOTTOM SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture2 , side: THREE.DoubleSide}), // FRONT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture2, side: THREE.DoubleSide}) // BACK SIDE
                    ];
                const box19 = new THREE.Mesh( boxGeometry, boxMaterial);

                box19.position.x = i*20-156;
                box19.position.y = 32.5;
                box19.position.z = j*20-28.5;
                box19.rotateX(Math.PI*3/2);
                
                scene.add( box19 );	

                /// CHAO MEIO

                boxGeometry = new THREE.BoxBufferGeometry( 124, 200, 3)
                boxMaterial = 
                    [
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // RIGHT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // LEFT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // TOP SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // BOTTOM SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture2, side: THREE.DoubleSide}), // FRONT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture2, side: THREE.DoubleSide}) // BACK SIDE
                    ];
                const box20 = new THREE.Mesh( boxGeometry,  boxMaterial);

                box20.position.x = i*20-79.5;
                box20.position.y = 0.45;
                box20.position.z = j*20-20;
                box20.rotateX(Math.PI*3/2);
                
                scene.add( box20 );	

                // CHAO PORTA

                boxGeometry = new THREE.BoxBufferGeometry( 22, 43, 3)
                boxMaterial = 
                    [
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // RIGHT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // LEFT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // TOP SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // BOTTOM SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture2 , side: THREE.DoubleSide}), // FRONT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture2, side: THREE.DoubleSide}) // BACK SIDE
                    ];
                const box21 = new THREE.Mesh( boxGeometry, boxMaterial);

                box21.position.x = i*20-8;
                box21.position.y = 0.45;
                box21.position.z = j*20-20;
                box21.rotateX(Math.PI*3/2);

                scene.add( box21 );	

                /// CHAO SAÍDA

                boxGeometry = new THREE.BoxBufferGeometry( 31, 60, 3)
                boxMaterial = 
                    [
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // RIGHT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // LEFT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // TOP SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture3, side: THREE.DoubleSide}), // BOTTOM SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture2 , side: THREE.DoubleSide}), // FRONT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture2, side: THREE.DoubleSide}) // BACK SIDE
                    ];
                const box22 = new THREE.Mesh( boxGeometry, boxMaterial);

                box22.position.x = i*20-156;
                box22.position.y = 0.45;
                box22.position.z = j*20-28.5;
                box22.rotateX(Math.PI*3/2);
                
                scene.add( box22 );	


            }

            else if (coordinates[j] === 12) { //black water
                const aux = j;
                new THREE.OBJLoader(loadingManager).load(
                    // resource URL
                    'models/agua.obj',
                    // called when resource is loaded
                    function ( object ) {
                        const scale = 13;
                        object.scale.x = scale;
                        object.scale.y = scale;
                        object.scale.z = scale;

                        object.traverse( function ( child ) {

                        if ( child instanceof THREE.Mesh ) {
                            child.material = new THREE.MeshStandardMaterial( {color: 0x090909, side: THREE.DoubleSide} ) //0x090909
                            }
                        } );

                        object.position.x = i*20;
                        object.position.y = 8.65;
                        object.position.z = aux*20;

                        scene.add( object );
                        const geometry = new THREE.CircleBufferGeometry( scale + 24, 12 );
                        const circle = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial() );

                        circle.position.x = i*20;
                        circle.position.y = 4;
                        circle.position.z = aux*20;
                        circle.rotation.x = Math.PI * - 0.5;

                        water.push(circle);
                    }
                );
            }	

            else if (coordinates[j] === 13) { //tunnel

                const tunnelLenght = 200;
                const tunnelRad = 45;

                const cylinderGeometry = new THREE.CylinderBufferGeometry( tunnelRad, tunnelRad, tunnelLenght, 24, 1, true )
                const tunnelTexture = new THREE.TextureLoader(loadingManager).load( 'textures/cement.jpg' );
                const cylinderMaterial = new THREE.MeshPhongMaterial( {  map : tunnelTexture, side: THREE.DoubleSide});							
                const cylinder = new THREE.Mesh( cylinderGeometry, cylinderMaterial );

                cylinder.position.x = i*20;
                cylinder.position.y = 30;
                cylinder.position.z = j*20;
                cylinder.rotateX(Math.PI / 2);
                cylinder.rotateZ(Math.PI/2);

                const cylinderGeometry2 = new THREE.CylinderBufferGeometry( tunnelRad+0.25, tunnelRad+0.25, tunnelLenght, 24, 1, true )							
                const cylinder2 = new THREE.Mesh( cylinderGeometry2, cylinderMaterial );

                cylinder2.position.x = i*20;
                cylinder2.position.y = 30;
                cylinder2.position.z = j*20;
                cylinder2.rotateX(Math.PI / 2);
                cylinder2.rotateZ(Math.PI/2);

                const cylinderGeometry3 = new THREE.CylinderBufferGeometry( tunnelRad+0.5, tunnelRad+0.5, tunnelLenght, 24, 1, true )							
                const cylinder3 = new THREE.Mesh( cylinderGeometry3, cylinderMaterial );

                cylinder3.position.x = i*20;
                cylinder3.position.y = 30;
                cylinder3.position.z = j*20;
                cylinder3.rotateX(Math.PI / 2);
                cylinder3.rotateZ(Math.PI/2);							

                const cylinderGeometry4 = new THREE.CylinderBufferGeometry( tunnelRad+1, tunnelRad+1, tunnelLenght, 24, 1, true )							
                const cylinder4 = new THREE.Mesh( cylinderGeometry4, cylinderMaterial );

                cylinder4.position.x = i*20;
                cylinder4.position.y = 30;
                cylinder4.position.z = j*20;
                cylinder4.rotateX(Math.PI / 2);
                cylinder4.rotateZ(Math.PI/2);		
                
                const boxGeometry = new THREE.BoxBufferGeometry( tunnelLenght, 46, 5)		
                const collisionBox1 = new THREE.Mesh( boxGeometry);

                collisionBox1.position.x = i*20;
                collisionBox1.position.y = 20;
                collisionBox1.position.z = j*20-42;

                const collisionBox2 = new THREE.Mesh( boxGeometry);

                collisionBox2.position.x = i*20;
                collisionBox2.position.y = 20;
                collisionBox2.position.z = j*20+42;

                const box1 = new THREE.Box3();

                box1.setFromObject(collisionBox1);							

                const box2 = new THREE.Box3();
                box2.setFromObject(collisionBox2);							

                objects.push(box1)
                objects.push(box2)

                scene.add( cylinder );
                scene.add( cylinder2 );
                scene.add( cylinder3 );								
                scene.add( cylinder4 );	
            }

            else if (coordinates[j] === 14) { //poço

            const tunnelLenght = 20;
            const tunnelRad = 12
            const secondRad = tunnelRad + 4;

            const cylinderGeometry = new THREE.CylinderBufferGeometry( tunnelRad, tunnelRad, tunnelLenght, 24, 1, true )
            const tunnelTexture = new THREE.TextureLoader(loadingManager).load( 'textures/wall.jpg' );
            const cylinderMaterial = new THREE.MeshStandardMaterial( {  map : tunnelTexture, side: THREE.DoubleSide});							
            const cylinder = new THREE.Mesh( cylinderGeometry, cylinderMaterial );

            cylinder.position.x = i*20;
            cylinder.position.y = 2;
            cylinder.position.z = j*20;

            const cylinderGeometry2 = new THREE.CylinderBufferGeometry( secondRad, secondRad, tunnelLenght, 24, 1, true )							
            const cylinder2 = new THREE.Mesh( cylinderGeometry2, cylinderMaterial );

            cylinder2.position.x = i*20;
            cylinder2.position.y = 2;
            cylinder2.position.z = j*20;

            const torusGeometry = new THREE.TorusBufferGeometry( secondRad-2, 3, 16, 16 );
            const torusMaterial = new THREE.MeshStandardMaterial( { map: tunnelTexture } );
            const torus = new THREE.Mesh( torusGeometry, torusMaterial );

            torus.position.x = i*20;
            torus.position.y = tunnelLenght-10;
            torus.position.z = j*20;
            torus.rotateX(Math.PI/2)

            const geometry = new THREE.CircleBufferGeometry( tunnelRad, 16 );
            const blackWaterTexture = new THREE.TextureLoader(loadingManager).load( 'textures/black_water.jpg' );						
            const material = new THREE.MeshStandardMaterial( { map: blackWaterTexture } );
            const circle = new THREE.Mesh( geometry, material );

            circle.position.x = i*20;
            circle.position.y = tunnelLenght-15;
            circle.position.z = j*20;
            circle.rotation.x = Math.PI * - 0.5;

            boxGeometry = new THREE.BoxBufferGeometry( tunnelLenght+10, 12, 1);
            const plankTexture1 = new THREE.TextureLoader(loadingManager).load( 'textures/plank.jpg' );
            const plankTexture2 = new THREE.TextureLoader(loadingManager).load( 'textures/plank.jpg' );
            plankTexture2.wrapS = THREE.RepeatWrapping;
            plankTexture2.wrapT = THREE.RepeatWrapping;
            plankTexture2.repeat.set( 0.25, 0.25 );
            const plankTexture3 = new THREE.TextureLoader(loadingManager).load( 'textures/plank.jpg' );
            plankTexture3.wrapS = THREE.RepeatWrapping;
            plankTexture3.wrapT = THREE.RepeatWrapping;
            plankTexture3.repeat.set( 1, 0.1 );												
            boxMaterial = 
                [
                    new THREE.MeshStandardMaterial({map: plankTexture2, side: THREE.DoubleSide}), // RIGHT SIDE
                    new THREE.MeshStandardMaterial({map: plankTexture3, side: THREE.DoubleSide}), // LEFT SIDE
                    new THREE.MeshStandardMaterial({map: plankTexture3, side: THREE.DoubleSide}), // TOP SIDE
                    new THREE.MeshStandardMaterial({map: plankTexture2, side: THREE.DoubleSide}), // BOTTOM SIDE
                    new THREE.MeshStandardMaterial({map: plankTexture1, side: THREE.DoubleSide}), // FRONT SIDE
                    new THREE.MeshStandardMaterial({map: plankTexture1, side: THREE.DoubleSide}) // BACK SIDE
                ];
            var plank = new THREE.Mesh( boxGeometry, boxMaterial);

            plank.position.x = i*20;
            plank.position.y = 13.5;
            plank.position.z = j*20+2;
            plank.rotateX(Math.PI*3/2);
            
            scene.add( plank );	

            plank = new THREE.Mesh( boxGeometry, boxMaterial);

            plank.position.x = i*20+28;
            plank.position.y = 7.1;
            plank.position.z = j*20+10;
            plank.rotateY(Math.PI*3/2);
            plank.rotateX(Math.PI - Math.PI*1/9);

            scene.add( plank );							
                
            const collisionBox1 = new THREE.Box3();
            collisionBox1.setFromObject(cylinder);

            const collisionBox2 = new THREE.Box3();
            collisionBox2.setFromObject(plank);

            scene.add( circle );
            scene.add( torus );
            scene.add( cylinder );
            scene.add( cylinder2 );
            objects.push(collisionBox1);
            objects.push(collisionBox2);
            }

            else if (coordinates[j] === 40) { //magic cube
                const scale = 2;
                const boxGeometry = new THREE.BoxBufferGeometry( scale, scale, scale)
                const red_texture = new THREE.TextureLoader(loadingManager).load( 'textures/magic_cube/red_cube.jpeg' );
                const orange_texture = new THREE.TextureLoader(loadingManager).load( 'textures/magic_cube/orange_cube.jpeg' );
                const blue_texture = new THREE.TextureLoader(loadingManager).load( 'textures/magic_cube/blue_cube.jpeg' );
                const white_texture = new THREE.TextureLoader(loadingManager).load( 'textures/magic_cube/white_cube.jpeg' );
                const green_texture = new THREE.TextureLoader(loadingManager).load( 'textures/magic_cube/green_cube.jpeg' );
                const yellow_texture = new THREE.TextureLoader(loadingManager).load( 'textures/magic_cube/yellow_cube.jpeg' );
                const boxMaterial = 
                    [
                        new THREE.MeshStandardMaterial({map: red_texture}), // RIGHT SIDE
                        new THREE.MeshStandardMaterial({map: orange_texture}), // LEFT SIDE
                        new THREE.MeshStandardMaterial({map: blue_texture}), // TOP SIDE
                        new THREE.MeshStandardMaterial({map: white_texture}), // BOTTOM SIDE
                        new THREE.MeshStandardMaterial({map: green_texture}), // FRONT SIDE
                        new THREE.MeshStandardMaterial({map: yellow_texture}) // BACK SIDE
                    ];

                const box1 = new THREE.Mesh( boxGeometry,  boxMaterial);

                box1.position.x = i*20-10;
                box1.position.y = 2.9;
                box1.position.z = j*20+3;
                box1.rotateY(Math.PI/6)

                scene.add(box1);
            }	

            else if (coordinates[j] === 41) { //clown box
                const scale = 3.2;
                const x = -12;
                const z = -8;
                const boxGeometry = new THREE.BoxBufferGeometry( scale, scale, scale)
                const clownBoxTexture = new THREE.TextureLoader(loadingManager).load( 'textures/clown_box.jpg' );
                const boxMaterial = 
                    [
                        new THREE.MeshStandardMaterial({map: clownBoxTexture}), // RIGHT SIDE
                        new THREE.MeshStandardMaterial({map: clownBoxTexture}), // LEFT SIDE
                        new THREE.MeshStandardMaterial({map: clownBoxTexture}), // TOP SIDE
                        new THREE.MeshStandardMaterial({map: clownBoxTexture}), // BOTTOM SIDE
                        new THREE.MeshStandardMaterial({map: clownBoxTexture}), // FRONT SIDE
                        new THREE.MeshStandardMaterial({map: clownBoxTexture}) // BACK SIDE
                    ];

                const box1 = new THREE.Mesh( boxGeometry,  boxMaterial);

                box1.position.x = i*20+x;
                box1.position.y = scale*0.9+1;
                box1.position.z = j*20+z;

                var cylinderGeometry = new THREE.CylinderBufferGeometry( 0.1, 0.1, 1.75, 12)
                var cylinderMaterial = new THREE.MeshStandardMaterial( {  color : 0x43464B, side: THREE.DoubleSide});							
                var cylinder = new THREE.Mesh( cylinderGeometry, cylinderMaterial );

                cylinder.position.x = i*20+1.75+x;
                cylinder.position.y = 4;
                cylinder.position.z = j*20+z;
                cylinder.rotateX(Math.PI / 4);
                cylinder.rotateZ(Math.PI/2);

                //

                cylinderGeometry = new THREE.CylinderBufferGeometry( 0.1, 0.1, 1, 12)
                cylinderMaterial = new THREE.MeshStandardMaterial( {  color : 0x43464B, side: THREE.DoubleSide});							
                const cylinder2 = new THREE.Mesh( cylinderGeometry, cylinderMaterial );

                cylinder2.position.x = i*20+2.55+x;
                cylinder2.position.y = 4.5;
                cylinder2.position.z = j*20+z;
                cylinder2.rotateY(Math.PI/2);

                //							

                const woodTexture = new THREE.TextureLoader(loadingManager).load( 'textures/plank.jpg' );
                cylinderGeometry = new THREE.CylinderBufferGeometry( 0.2, 0.2, 1, 12)
                cylinderMaterial = new THREE.MeshStandardMaterial( {  map : woodTexture, side: THREE.DoubleSide});							
                const cylinder3 = new THREE.Mesh( cylinderGeometry, cylinderMaterial );

                cylinder3.position.x = i*20+3+x;
                cylinder3.position.y = 5;
                cylinder3.position.z = j*20+z;
                cylinder3.rotateX(Math.PI/2);
                cylinder3.rotateZ(Math.PI/2);


                scene.add(box1);
                scene.add(cylinder);
                scene.add(cylinder2);
                scene.add(cylinder3);
            }							

            else if (coordinates[j] === 42) { //mattress
                const mattressLoader = new THREE.OBJLoader(loadingManager);
                let mattress;
                // load a resource
                mattressLoader.load(
                    // resource URL
                    'models/mattress/mattress.obj',
                    // called when resource is loaded
                    function ( mattress ) {
                        mattress.position.x = i*20-19.8;
                        mattress.position.y = 4.35;
                        mattress.position.z = j*20-648.8;		

                        mattress.scale.x = 0.18;
                        mattress.scale.y = 0.10;
                        mattress.scale.z = 0.18;
                        mattress.rotateX(Math.PI)
                        mattress.rotateY(Math.PI)	

                        mattress.traverse( function ( child ) {

                        if ( child instanceof THREE.Mesh ) {
                            const mattressTexture = new THREE.TextureLoader(loadingManager).load( 'models/mattress/mattressTexture.jpg' );			
                            child.material = new THREE.MeshStandardMaterial( {map: mattressTexture, side: THREE.DoubleSide} )
                            }
                        } );
                        scene.add( mattress );
                    }
                );
            }

            else if (coordinates[j] === 43) { //garbage can
                const garbageCanLoader = new THREE.OBJLoader(loadingManager);
                let garbageCan;
                // load a resource
                garbageCanLoader.load(
                    // resource URL
                    'models/garbage_can/garbage_can.obj',
                    // called when resource is loaded
                    function ( garbageCan ) {
                        garbageCan.position.x = i*20;
                        garbageCan.position.y = 4.5;
                        garbageCan.position.z = j*20-465.5;		
                        garbageCan.rotateX(Math.PI/2);
                        garbageCan.rotateZ(-Math.PI/1.6)

                        garbageCan.scale.x = 0.05;
                        garbageCan.scale.y = 0.05;
                        garbageCan.scale.z = 0.05;

                        garbageCan.traverse( function ( child ) {

                        if ( child instanceof THREE.Mesh ) {
                            const garbageCanTexture = new THREE.TextureLoader(loadingManager).load( 'models/garbage_can/garbage_can.png' );			
                            child.material = new THREE.MeshStandardMaterial( {map: garbageCanTexture, side: THREE.DoubleSide} )
                            }
                        } );
                        scene.add( garbageCan );
                    }
                );
            }

            else if (coordinates[j] === 44) { //sink
                const sinkLoader = new THREE.OBJLoader(loadingManager);
                let sink;
                // load a resource
                sinkLoader.load(
                    // resource URL
                    'models/sink/sink.obj',
                    // called when resource is loaded
                    function ( sink ) {
                        sink.position.x = i*20;
                        sink.position.y = 2.5;
                        sink.position.z = j*20-632;

                        sink.scale.x = 0.1;
                        sink.scale.y = 0.1;
                        sink.scale.z = 0.1;

                        sink.traverse( function ( child ) {

                        if ( child instanceof THREE.Mesh ) {
                            const sinkTexture = new THREE.TextureLoader(loadingManager).load( 'models/sink/sinkTexture.png' );			
                            child.material = new THREE.MeshStandardMaterial( {map: sinkTexture, side: THREE.DoubleSide} )
                            }
                        } );
                        scene.add( sink );
                    }
                );
            }
            
            else if (coordinates[j] === 45) { //pencil
                new THREE.MTLLoader( loadingManager )
                .setPath( 'models/pencil/' )
                .load( 'Pencil.mtl', function ( materials ) {

                    materials.preload();

                    new THREE.OBJLoader( loadingManager )
                        .setMaterials( materials )
                        .setPath( 'models/pencil/' )
                        .load( 'Pencil.obj', function ( object ) {

                            object.position.x = i*20;
                            object.position.y = 4.5;
                            object.position.z = j*20-651;
                            
                            object.rotateX(Math.PI*3/2);
                            object.rotateZ(Math.PI/3)

                            object.scale.x = 0.005;
                            object.scale.y = 0.005;
                            object.scale.z = 0.005;
                            scene.add( object );

                        });

                } );
            }

            else if (coordinates[j] === 46) { //bench
                // load a resource
                const aux = j;
                new THREE.OBJLoader(loadingManager).load(
                    // resource URL
                    'models/bench/BenchOBJ.obj',
                    // called when resource is loaded
                    function ( object ) {
                        object.position.x = i*20;
                        object.position.y = 1;
                        object.position.z = aux*20;

                        object.rotateY(Math.PI/2);

                        object.scale.x = 16;
                        object.scale.y = 16;
                        object.scale.z = 16;

                        object.traverse( function ( child ) {
                        if ( child instanceof THREE.Mesh ) {
                            child.material = new THREE.MeshStandardMaterial( {map: new THREE.TextureLoader(loadingManager).load( 'models/bench/BenchOBJ.png' ), side: THREE.DoubleSide} )
                            }
                        } );

                        const collisionBox2 = new THREE.Box3();
                        collisionBox2.setFromObject(object);

                        scene.add( object );
                        objects.push(collisionBox2)
                        
                    }
                );
            }

            else if (coordinates[j] === 30) { //flashlight
                const flashLightColor = 0x1F1F1F;

                flashLightBody = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 6.5, 12), new THREE.MeshBasicMaterial({color:flashLightColor}));
                flashLightBody.position.x = i*20;
                flashLightBody.position.y = 2.2;
                flashLightBody.position.z = j*20;
                flashLightBody.rotateX(Math.PI/2);
                flashLightBody.rotateZ(Math.PI-Math.PI*3/10)

                flashLightLamp = new THREE.Mesh(new THREE.CylinderGeometry(2, 1, 2, 12), new THREE.MeshBasicMaterial({color:flashLightColor}));
                flashLightLamp.position.x = i*20-3.435;
                flashLightLamp.position.y = 2.2;
                flashLightLamp.position.z = j*20-2.525;
                flashLightLamp.rotateX(Math.PI/2)
                flashLightLamp.rotateZ(Math.PI-Math.PI*3/10)	

                spotLight1 = new THREE.SpotLight(0xcccccc, 0.5, 150);
                spotLight1.power = flashLightPower + 3.65;
                spotLight1.angle = 0.55;
                spotLight1.decay = 2;
                spotLight1.penumbra = 0.1;
                spotLight1.distance = 200;
                spotLight1.castShadow = true;

                spotLight2 = new THREE.SpotLight(0xcccccc, 0.5, 150);
                spotLight2.power = flashLightPower + 1.65;
                spotLight2.angle = 0.65;
                spotLight2.decay = 2;
                spotLight2.penumbra = 0.1;
                spotLight2.distance = 200;
                spotLight2.castShadow = true;

                const texture = new THREE.TextureLoader(loadingManager).load( 'textures/flashLightLamp.png' );
                flashLightCircle = new THREE.Mesh( new THREE.CircleBufferGeometry( 1.75, 12 ), new THREE.MeshBasicMaterial( { map: texture, side: THREE.DoubleSide } ) );

                flashLightCircle.position.x = i*20-4.235;
                flashLightCircle.position.y = 2.2;
                flashLightCircle.position.z = j*20-3.225;
                flashLightCircle.rotateY(Math.PI*3/10)								

                flashLightLamp.add(spotLight1);
                flashLightLamp.add(spotLight2);
                scene.add(flashLightBody);
                scene.add(flashLightLamp);
                scene.add(flashLightCircle);
            }

            else if (coordinates[j] === 60) { //página
                
                const planeGeometry = new THREE.PlaneGeometry( 2.5, 4)
                const paper_texture = new THREE.TextureLoader(loadingManager).load( 'textures/page5.jpeg' );			
                paper_texture.roation = Math.PI/2
                const planeMaterial = new THREE.MeshBasicMaterial( {map: paper_texture, side: THREE.DoubleSide} );
                const plane = new THREE.Mesh( planeGeometry,  planeMaterial);

                plane.position.x = i*20;
                plane.position.y = 4.7;
                plane.position.z = j*20-68;
                plane.rotateX(Math.PI*3/2);
                plane.rotateZ(Math.PI*1/7);

                const box = new THREE.Box3();
                box.setFromObject(plane);

                scene.add( plane );	
                papers.push(plane);
            }	

            else if (coordinates[j] === 95) { //gate
                const boxGeometry = new THREE.BoxBufferGeometry( 64, 54, 3)
                const wall_texture = new THREE.TextureLoader(loadingManager).load( 'textures/oldGate.jpg' );
                wall_texture.wrapS = THREE.RepeatWrapping;
                wall_texture.wrapT = THREE.RepeatWrapping;
                wall_texture.repeat.set( 2, 1 );
                const boxMaterial = 
                    [
                        new THREE.MeshStandardMaterial({map: wall_texture, side: THREE.DoubleSide}), // RIGHT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture, side: THREE.DoubleSide}), // LEFT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture, side: THREE.DoubleSide}), // TOP SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture, side: THREE.DoubleSide}), // BOTTOM SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture, side: THREE.DoubleSide}), // FRONT SIDE
                        new THREE.MeshStandardMaterial({map: wall_texture, side: THREE.DoubleSide}) // BACK SIDE
                    ];

                const box1 = new THREE.Mesh( boxGeometry,  boxMaterial);

                box1.position.x = i*20;
                box1.position.y = 28;
                box1.position.z = j*20;
                box1.rotateY(Math.PI/2);
                
                const collisionBox = new THREE.Box3();
                collisionBox.setFromObject(box1);

                const box = new THREE.Mesh( boxGeometry,  boxMaterial);

                scene.add( box1 );
                gateCollision = collisionBox;
                objects.push( gateCollision );							
            }

            else if (coordinates[j] === 99) {
                camera.position.set(i*20, 3, 20*j)
                camera.rotation.y = -5;
            }																			

        }
    }

    // rain

    rainCount = 900;
    rainGeo = new THREE.Geometry();
    for(let i=0;i<rainCount;i++) {
        rainDrop = new THREE.Vector3(
            Math.random() * 400 -200,
            Math.random() * 500 - 250,
            Math.random() * 400 - 200
        );
        rainDrop.velocity = {};
        rainDrop.velocity = 0;
        rainGeo.vertices.push(rainDrop);
    }
    const rainMaterial = new THREE.PointsMaterial({
        color: 0xaaaaaa,
        size: 0.13,
        transparent: true
    });
    rain = new THREE.Points(rainGeo,rainMaterial);
    scene.add(rain);

    //
    inicialPapersLenght = papers.length;
    pages.innerHTML = collectPages + "/" + inicialPapersLenght;

    //slenderman

    loadSlender();

    // flaslight

    flashLight = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 6.5, 12), new THREE.MeshBasicMaterial({color:0x1F1F1F}));
    flashLight.rotateX(Math.PI/2);
    flashLight.position.set(2,-3,0);

    spotLight1 = new THREE.SpotLight(0xcccccc, 0.5, 150);
    spotLight1.power = flashLightPower + 3.65;
    spotLight1.angle = 0.55;
    spotLight1.decay = 2;
    spotLight1.penumbra = 0.1;
    spotLight1.distance = 200;
    spotLight1.castShadow = true;
    spotLight1.rotateX(Math.PI/2);

    spotLight2 = new THREE.SpotLight(0xcccccc, 0.5, 150);
    spotLight2.power = flashLightPower + 1.65;
    spotLight2.angle = 0.65;
    spotLight2.decay = 2;
    spotLight2.penumbra = 0.1;
    spotLight2.distance = 200;
    spotLight2.castShadow = true;
    spotLight2.rotateX(Math.PI/2);

    spotLight3 = new THREE.SpotLight(0xffffff, 0.5, 150);
    spotLight3.power = + flashLightPower + 5;
    spotLight3.angle = 0.40;
    spotLight3.decay = 6;
    spotLight3.penumbra = 1;
    spotLight3.distance = 200;
    spotLight3.castShadow = true;
    spotLight3.rotateX(Math.PI/2);

    spotLight4 = new THREE.SpotLight(0xcccccc, 0.5, 150);
    spotLight4.power = flashLightPower + 2.65;
    spotLight4.angle = 0.1;
    spotLight4.decay = 6;
    spotLight4.penumbra = 0.1;
    spotLight4.distance = 200;
    spotLight4.castShadow = true;
    spotLight4.rotateX(Math.PI/2);											

    flashLight.add(spotLight1);
    flashLight.add(spotLight1.target);				
    flashLight.add(spotLight2);
    flashLight.add(spotLight2.target);
    flashLight.add(spotLight3);
    flashLight.add(spotLight3.target);						
    flashLight.add(spotLight4);
    flashLight.add(spotLight4.target);

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    
    // moon

    const moonTexture = new THREE.TextureLoader(loadingManager).load( 'textures/moon.png' );		
    const scale = 4;

    var geometry = new THREE.CircleBufferGeometry( 4 + scale, 16 );
    var material = new THREE.MeshBasicMaterial( { map: moonTexture, side: THREE.DoubleSide} );
    const moon = new THREE.Mesh( geometry, material );

    moon.position.set(800, 350, 560);
    moon.rotateX(Math.PI/2);
    scene.add( moon );		

    // postprocessing

    composer = new THREE.EffectComposer( renderer );
    composer.addPass( new THREE.RenderPass( scene, camera ) );

    glitchPass = new THREE.GlitchPass();
    composer.addPass( glitchPass );	

    window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
    composer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

    // This block runs while resources are loading.
    if( RESOURCES_LOADED == false ){
        requestAnimationFrame(animate);					
        composer.render(loadingScreen.scene, loadingScreen.camera);
        return;
    }

    requestAnimationFrame( animate );

    const time = performance.now();

    if ( controls.isLocked === true ) {

        if (rainOn === true) {
            rainGeo.vertices.forEach(p => {
                p.velocity -= 0.1 + Math.random() * 0.1;
                p.y += p.velocity;
                if (p.y < -50) {
                    p.y = 200;
                    p.velocity = 0;
                }
            });
            rainGeo.verticesNeedUpdate = true;
            rain.rotation.y +=0.002;
        }

        raycaster.ray.origin.copy( controls.getObject().position ); // localização
        raycaster.ray.origin.y += 18; // localização

        rain.position.x = camera.position.x;
        rain.position.z = camera.position.z;

        const delta = ( time - prevTime ) / 1000;

        // Set the velocity.x and velocity.z using the calculated time delta
        for(var i = 0; i < water.length; i++) {	
            if ( Math.sqrt(Math.pow(raycaster.ray.origin.x - water[i].position.x, 2) + Math.pow(raycaster.ray.origin.z - water[i].position.z, 2)) <= 26) {							
                onWater = true;
                break;
            } else {
                onWater = false;
            }
        }

        if (onWater) {
            moveSpeed = baseMoveSpeed*6;
            flashLight.rotation.x = Math.PI/2;
        }
        else if (run && stamina > 0.35) {
            moveSpeed = baseMoveSpeed*0.55;
            stamina -= 0.65;
            if (stamina > 20) {
                flashLight.rotation.x = Math.PI/4;											
            } 
        } else {
            moveSpeed = baseMoveSpeed;
            flashLight.rotation.x = Math.PI/2;
            if(stamina <= 99.3) stamina += 0.08;
        }
        
        velocity.x -= velocity.x * moveSpeed * delta; //movement speed
        velocity.z -= velocity.z * moveSpeed * delta; //movement speed

        direction.z = Number( moveForward ) - Number( moveBackward ); // rever
        direction.x = Number( moveRight ) - Number( moveLeft ); // rever
        direction.normalize(); // this ensures consistent movements in all directions

        // Update the position using the changed delta
        if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
        if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;					

        controls.moveRight( - velocity.x * delta );
        controls.moveForward( - velocity.z * delta );

        // Prevent the camera/player from falling out of the 'world'
        if ( controls.getObject().position.y < 18 ) {
            velocity.y = 0;
            controls.getObject().position.y = 18;
        }					

        for(var i = 0; i < objects.length; i++) {
            if ( raycaster.ray.intersectsBox( objects[i] ) === true) { 
                velocity.x = 0;
                velocity.z = 0;
                controls.getObject().position.x = origem.x;
                controls.getObject().position.y = origem.y;
                controls.getObject().position.z = origem.z;
            }
        }

        if(lanternPicked === false)	{
            if(interact === true && Math.sqrt(Math.pow(raycaster.ray.origin.x - flashLightBody.position.x, 2) + Math.pow(raycaster.ray.origin.z - flashLightBody.position.z, 2)) <= 15) {	
                AudioLoader.load( 'sounds/flashLightClickSound.wav', function( buffer ) {
                    flashLightClickSound.setBuffer( buffer );
                    flashLightClickSound.setLoop( false);
                    flashLightClickSound.setVolume( flashLightClickSoundVolume );
                    flashLightClickSound.play();
                    });							
                camera.add(flashLight);
                scene.remove(flashLightBody);
                scene.remove(flashLightLamp);
                scene.remove(flashLightCircle);
                lanternPicked = true;
            }
        }

        for(var i = 0; i < papers.length; i++) {
            if ( interact === true && (Math.sqrt(Math.pow(raycaster.ray.origin.x - papers[i].position.x, 2) + Math.pow(raycaster.ray.origin.z - papers[i].position.z, 2))) <= 6.5) {
                if(papers.length >= 4) console.log("Why would he let you go?...");
                if(papers.length == 3) console.log("I'll give you a chance...");
                if(papers.length == 2) {
                    objects.splice(objects.indexOf(gateCollision), 1);
                    console.log("Try through the gate now!");
                }
                if(papers.length == 1) console.log("Now it's too late");
                scene.remove(papers[i]);
                papers.splice(papers.indexOf(papers[i]), 1);
                if(pageFlipSound.isPlaying === false)
                    AudioLoader.load( 'sounds/page_flip.mp3', function( buffer ) {
                        pageFlipSound.setBuffer( buffer );
                        pageFlipSound.setLoop( false );
                        pageFlipSound.setVolume( pageFlipSoundVolume );
                        pageFlipSound.play();
                    });
                collectPages += 1;
                slenderSpeed += 0.00075;
                pages.innerHTML = collectPages + "/" + inicialPapersLenght;
            }
        }
        
        if(lanternPicked & slenderOn) {
            if ( Math.sqrt(Math.pow(raycaster.ray.origin.x - slenders[0].position.x, 2) + Math.pow(raycaster.ray.origin.z - slenders[0].position.z, 2)) < 110) { 
                spotLight1.power = Math.floor(Math.random() * 6);
                spotLight2.power = Math.floor(Math.random() * 5);
                spotLight3.power = Math.floor(Math.random() * 10);
                spotLight4.power = Math.floor(Math.random() * 9);					
                if (Math.sqrt(Math.pow(raycaster.ray.origin.x - slenders[0].position.x, 2) + Math.pow(raycaster.ray.origin.z - slenders[0].position.z, 2)) <  45) { //50
                    controls.disconnect();
                    camera.lookAt(slenders[0].up);
                    glitchPass.goWild = true;
                    if(slenderStaticSound.isPlaying === false)
                        AudioLoader.load( 'sounds/slender_static.mp3', function( buffer ) {
                        slenderStaticSound.setBuffer( buffer );
                        slenderStaticSound.setLoop( false );
                        slenderStaticSound.setVolume( slenderStaticSoundVolume );
                        slenderStaticSound.play();
                        document.removeEventListener('keydown', onKeyDown);
                        setTimeout(() => {  open(location, '_self').close(); }, 7500);
                    });
                }
            } else {
                spotLight1.power = flashLightPower + 3.65;
                spotLight2.power = flashLightPower + 1.65;
                spotLight3.power = flashLightPower + 5;
                spotLight4.power = flashLightPower + 2.65;						
            }
        }

        if(moveBackward || moveForward || moveLeft || moveRight) {
            if(stepSound.isPlaying === false) {
            AudioLoader.load( 'sounds/step' + Math.floor(Math.random() * 2) + '.mp3', function( buffer ) {
                stepSound.setBuffer( buffer );
                stepSound.setLoop( false);
                stepSound.setVolume( stepSoundVolume );
                stepSound.play();
                });
            }
        }

        if(papers.length <= 0) {
            gateCollision
            gameover.style.visibility = 'visible';						
            slenderSpeed = 0.02;
        };

        // slenderMan movimentation
        if(lanternPicked & slenderOn) {
            slenders[0].rotation.y = Math.atan2(( camera.position.z - slenders[0].position.z ) , ( camera.position.x - slenders[0].position.x ));
            slenders[0].position.lerp(camera.position, slenderSpeed)
        }
        if (slenders[0].position. y > 1) slenders[0].position.y = 1;

        origem = raycaster.ray.origin.clone();
        origem.y -= 18;

        if ( Math.sqrt(Math.pow(raycaster.ray.origin.x - origem.x, 2) + Math.pow(raycaster.ray.origin.z - origem.z, 2)) > 20) {
            controls.getObject().position.x = origem.x;
            controls.getObject().position.y = origem.y;
            controls.getObject().position.z = origem.z;
        }
    }
    //
    prevTime = time;
    composer.render(scene, camera);
}