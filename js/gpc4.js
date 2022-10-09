import * as THREE from "../lib/three.module.js";
import {OrbitControls} from "../lib/OrbitControls.module.js";
import {BrazoRobotico} from "./brazo_robotico.js";
import {GUI} from "../lib/lil-gui.module.min.js"; 
import {TWEEN} from "../lib/tween.module.min.js";

// Variables estandar
let renderer, scene, camera, cameraOrtho, cameraControls, cameraHelper;
const L =40;

// Otras globales
let robot, suelo, insetWidth, insetHeight, brazoRobotico;
let angulo = 0;

// Acciones
init();
loadScene();
render();


function init()
{
    //Inicializacion de camaras
    const ar = window.innerWidth / window.innerHeight;
    setCameras(ar);

    //Inicializacion de la escena
    scene = new THREE.Scene();
    // scene.add(camera);
    // scene.add(cameraOrtho)
    
    //Inicializacion del motor de render
    renderer = new THREE.WebGLRenderer({antialias: true, preserveDrawingBuffer: true});
    renderer.setSize(window.innerWidth,window.innerHeight);
    renderer.setClearColor(0x7c7b82);
    document.getElementById('container').appendChild( renderer.domElement );
    renderer.autoClear = false;

    //Inicializacion del control de camara
    cameraControls = new OrbitControls( camera, renderer.domElement );
    cameraControls.minDistance = 300;
    cameraControls.maxDistance = 900;
    cameraControls.target.set(0,1,0);

    //Inicializacion de eventos
    window.addEventListener('resize',onWindowResize);
    window.addEventListener('keydown',onKeyDown);
    onWindowResize();

    initGui();
}

function setCameras(ar){
    let camaraOrtografica;
    if(ar>1)
        
        camaraOrtografica = new THREE.OrthographicCamera(-L*ar, L*ar, L,-L,1,1000);
    else
        camaraOrtografica = new THREE.OrthographicCamera(-L, L, L/ar,-L/ar,1,1000);
    //perspective camera
    camera = new THREE.PerspectiveCamera( 70, ar, 0.01, 1000);
    camera.position.y = 340;
    camera.position.z = 200;

    //cameraOrtho
    cameraOrtho = camaraOrtografica.clone();
    cameraOrtho.position.set(0,340,0);
    cameraOrtho.lookAt(0,-0,0);
    //cameraOrtho.up.set(0,1,0)

    //ayudante de camara
    cameraHelper = new THREE.CameraHelper(camera);

    //camera.add(cameraOrtho);
}
function initGui() {
    const gui = new GUI({'title':'Control robot'});
    const obj = { 
        giroBase: 0,
        giroBrazo: 0,
        giroAntebrazoY:0,
        giroAntebrazoZ:0,
        giroPinza:0,
        separacionPinza:10,
        alambres: false,
        anima: function(){
            var position = { 
                giroBase:0,
                giroBrazo:0,
                giroAntebrazoY:0,
                giroAntebrazoZ:0,
                giroPinza:0,
                separacionPinza:0,
            };

            var tween_to = new TWEEN.Tween( position )
                .to( { 
                    giroBase:-180,
                    giroBrazo:20,
                    giroAntebrazoY:180,
                    giroAntebrazoZ:-20,
                    giroPinza:200,
                    separacionPinza:15, 
                }, 5000 )
                .easing(TWEEN.Easing.Quadratic.Out)
                .onUpdate(()=>{
                    brazoRobotico.rotateBase(position.giroBase);
                    giroBase.setValue(position.giroBase);
                    brazoRobotico.rotateBrazo(position.giroBrazo);
                    giroBrazo.setValue(position.giroBrazo);
                    brazoRobotico.rotateAnteBrazo(position.giroAntebrazoY);
                    giroAntebrazoY.setValue(position.giroAntebrazoY);
                    brazoRobotico.rotateAnteBrazo1(position.giroAntebrazoZ);
                    giroAntebrazoZ.setValue(position.giroAntebrazoZ);
                    brazoRobotico.rotatePinza(position.giroPinza);
                    giroPinza.setValue(position.giroPinza);
                    brazoRobotico.openPinza(position.separacionPinza);
                    separacionPinza.setValue(position.separacionPinza);
                });
            var tween_fro = new TWEEN.Tween( position )
                .to( { 
                    giroBase:90,
                    giroBrazo:10,
                    giroAntebrazoY:-90,
                    giroAntebrazoZ:90,
                    giroPinza:20,
                    separacionPinza:1.5,  
                }, 5000 )
                .easing(TWEEN.Easing.Quadratic.Out)
                .onUpdate(()=>{
                    brazoRobotico.rotateBase(position.giroBase);
                    giroBase.setValue(position.giroBase);
                    brazoRobotico.rotateBrazo(position.giroBrazo);
                    giroBrazo.setValue(position.giroBrazo);
                    brazoRobotico.rotateAnteBrazo(position.giroAntebrazoY);
                    giroAntebrazoY.setValue(position.giroAntebrazoY);
                    brazoRobotico.rotateAnteBrazo1(position.giroAntebrazoZ);
                    giroAntebrazoZ.setValue(position.giroAntebrazoZ);
                    brazoRobotico.rotatePinza(position.giroPinza);
                    giroPinza.setValue(position.giroPinza);
                    brazoRobotico.openPinza(position.separacionPinza);
                    separacionPinza.setValue(position.separacionPinza);
                });
            tween_to.chain( tween_fro );
            tween_fro.chain( tween_to );

            tween_to.start();
            
        }
    }

    var giroBase = gui.add( obj, 'giroBase', -180, 180 ).onChange(value=>{
        brazoRobotico.rotateBase(value);
    }); // min, max
    var giroBrazo = gui.add( obj, 'giroBrazo', -45, 45).onChange(value=>{
        brazoRobotico.rotateBrazo(value);
    });// min, max, step
    var giroAntebrazoY = gui.add( obj, 'giroAntebrazoY', -180, 180).onChange(value=>{
        brazoRobotico.rotateAnteBrazo(value);
    });// min, max, step // min, max, step
    var giroAntebrazoZ = gui.add( obj, 'giroAntebrazoZ', -90, 90).onChange(value=>{
        brazoRobotico.rotateAnteBrazo1(value);
    });// min, max, step
    var giroPinza = gui.add( obj, 'giroPinza', -40, 220).onChange(value=>{
        brazoRobotico.rotatePinza(value);
    }); // min, max, step
    var separacionPinza = gui.add( obj, 'separacionPinza', 0, 15).onChange(value=>{
        brazoRobotico.openPinza(value);
    }); // min, max, step
    gui.add( obj, 'alambres').onChange(value=>{
        brazoRobotico.changeWireframe(value);
        suelo.material.wireframe = value;
    }); // min, max, step
    gui.add( obj, 'anima'); // min, max, step
}

function onWindowResize(){
    //actualizamos la matriz de proyeccion de la camara
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    //actualizamos las dimesiones del render
    renderer.setSize( window.innerWidth, window.innerHeight );
    
    const minDim = Math.min( window.innerWidth, window.innerHeight );
    insetWidth = minDim / 4;
    insetHeight = minDim / 4;
    
    //actualizamos la matriz de proyeccion de la camaraOrtografica
    cameraOrtho.aspect = insetWidth / insetHeight;
    cameraOrtho.updateProjectionMatrix();
}

function onKeyDown(e){
    switch (e.keyCode) {
        case 37:
        robot.position.x -= 10.0;
        break;
        case 38:
        robot.position.z -= 10.0;
        break;
        case 39:
        robot.position.x += 10.0;
        break;
        case 40:
        robot.position.z += 10.0;
        break;
      }
}

function loadScene()
{
    brazoRobotico =  new BrazoRobotico(false);
    const sueloMaterial = new THREE.MeshNormalMaterial({wireframe:false, flatShading: true});
    suelo = new THREE.Mesh( new THREE.PlaneGeometry(1000,1000, 20,20), sueloMaterial );
    suelo.rotation.x = -Math.PI/2;
    suelo.position.y = -0.2;
    suelo.position.z= 0;
    scene.add(suelo);
    robot = brazoRobotico.model();
    scene.add( robot);
    //scene.add(new THREE.AxesHelper(120))
}

function update()
{
    // angulo += 0.01;
    // robot.rotation.y = angulo;
    
}

function render()
{
    requestAnimationFrame(render);
    TWEEN.update();
    renderer.clear();
    //update();
    //let dim = Math.min(window.innerWidth, window.innerHeight)/4;
    renderer.setScissorTest( true );
    renderer.setScissor( 0, window.innerHeight - insetHeight, insetWidth, insetHeight );
    renderer.setViewport( 0, window.innerHeight - insetHeight, insetWidth, insetHeight );
    renderer.render( scene, cameraOrtho );
    renderer.setScissorTest( false );
    //renderer.setClearColor(0x7c7b82);
    renderer.setViewport(0,0,window.innerWidth,window.innerHeight);
    renderer.render(scene,camera);

}