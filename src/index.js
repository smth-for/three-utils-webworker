import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import Stats from "three/examples/jsm/libs/stats.module";

// Debug
const gui = new dat.GUI();
const stats = Stats();
stats.domElement.height = "48px";
[].forEach.call(
  stats.domElement.children,
  (child) => (child.style.display = "")
);
var perfFolder = gui.addFolder("Performance");
var perfLi = document.createElement("li");
stats.domElement.style.position = "static";
perfLi.appendChild(stats.domElement);
perfLi.classList.add("gui-stats");
perfFolder.__ul.appendChild(perfLi);

var settings = {
  controls: {
    autoRotate: false,
    enableDamping: true,
  }
}
var settingsFolder = gui.addFolder("Settings");

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Objects
const geometry = new THREE.PlaneGeometry(1, 1);

// Materials
const material = new THREE.MeshStandardMaterial({
  color: 0xffff00,
  side: THREE.FrontSide,
});

// Mesh
const plane1 = new THREE.Mesh(geometry, material);
const plane2 = new THREE.Mesh(geometry, material);
plane2.rotateY(Math.PI);
scene.add(plane1);
scene.add(plane2);

// Lights

const pointLight1 = new THREE.PointLight(0xffffff, 1);
pointLight1.position.x = 2;
pointLight1.position.y = 3;
pointLight1.position.z = 4;
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xffffff, 1);
pointLight2.position.x = -2;
pointLight2.position.y = -3;
pointLight2.position.z = -4;
scene.add(pointLight2);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 2;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.autoRotate = settings.controls.autoRotate;
controls.enableDamping = settings.controls.enableDamping;

var controlsFolder = settingsFolder.addFolder("Controls");
controlsFolder.add(settings.controls, 'autoRotate').onFinishChange((v) => controls.autoRotate = v);
controlsFolder.add(settings.controls, 'enableDamping').onFinishChange((v) => controls.enableDamping = v);
/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */

const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update objects
  // sphere.rotation.y = 0.5 * elapsedTime;

  // Update Orbital Controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);

  stats.update();
};

tick();

/*
 * WORKERS
 */

var activeWorkerGLTF = null;
const workerTextureGui = gui.addFolder("Texture Worker");
const workerTextureParams = {
  worker: null,
  intervalTime: 1000,
  counter: 1,
  resetCounter: resetCounter,
  workerRight: workerTextureRight,
  workerError: workerTextureError,
};
workerTextureGui.add(workerTextureParams, "intervalTime", 1, 1000, 10);
workerTextureGui.add(workerTextureParams, "resetCounter").name("Reset Counter");
workerTextureGui.add(workerTextureParams, "workerRight").name("Toggle Worker");
workerTextureGui.add(workerTextureParams, "workerError").name("Error Worker");

var activeWorkerGLTF = null;
const workerGLTFGui = gui.addFolder("GLTF Worker");
const workerGLTFParams = {
  worker: null,
  initWorker: false,
  dracoUrl: "https://vestanest.smth.it/draco-r121/", // 
  gltfUrl: "https://vestanest.smth.it/download/gltf/5e25ba211250c8419a6b41b2",
  workerInit: workerGLTFInit,
  workerLoad: workerGLTFLoad,
  workerError: workerGLTFError,
};
workerGLTFGui.add(workerGLTFParams, "gltfUrl");
workerGLTFGui.add(workerGLTFParams, "workerInit").name("Init Worker");
workerGLTFGui.add(workerGLTFParams, "workerLoad").name("Load Worker");
workerGLTFGui.add(workerGLTFParams, "workerError").name("Error Worker");

/*
 * WEB WORKER FUNCTIONS
 */

// WORKER TEXTURE
function workerTextureRight() {
  if (activeWorkerGLTF) {
    clearInterval(activeWorkerGLTF);
    activeWorkerGLTF = null;
    workerTextureParams.worker.terminate();
    workerTextureParams.worker = null;
  } else {
    if(!workerTextureParams.worker) {
      workerTextureParams.worker = new Worker("./workers/texture.worker.js");
      workerTextureParams.worker.addEventListener("message", function (message) {
        console.log("WebW Texture Message", message.data);
        if (!message.data.error) {
          // plane1.material.color = new THREE.Color(0xff00ff);
          const m = new THREE.DataTexture(message.data.imageBitmap);
          // plane1.material.map = new THREE.CanvasTexture(
          //   message.data.imageBitmap
          // );
          m.flipY = true;
          plane1.material.map = m;
          plane1.material.needsUpdate = true;
        } else {
          alert("Worker Texture Error " + message.data.error);
        }
      });
    }
    activeWorkerGLTF = setInterval(() => {
      var counterTmp = workerTextureParams.counter++;
      workerTextureParams.worker.postMessage({
        id: counterTmp,
        url:
          "https://dummyimage.com/300x300/db1cdb/000000.png&text=" + counterTmp,
      });
    }, workerTextureParams.intervalTime);
  }
}

function workerTextureError() {
  workerTextureParams.worker.postMessage({ url: "" });
}

function resetCounter() {
  workerTextureParams.counter = 1;
}

// WORKER GLTF
function workerGLTFInit() {
  workerGLTFParams.worker = new Worker("./workers/gltf.worker.js");

  workerGLTFParams.worker.addEventListener("message", function (message) {
    console.log("WebW GLTF Message", message.data);
    if (!message.data.error) {
      if(message.data.action === "init") {workerGLTFParams.initWorker = true;}
      if(message.data.action === "load") {parseSceneAndInsert(message.data.gltf)}
    } else {
      alert("Worker GLTF Error " + message.data.error);
    }
    // workerGLTF.terminate();
  });
  workerGLTFParams.worker.postMessage({
    action: "init",
    url: workerGLTFParams.dracoUrl,
  });
}

function workerGLTFLoad() {
  var intervalGLTF = setInterval(() => {
    if(workerGLTFParams.initWorker) {
      workerGLTFParams.worker.postMessage({
        action: "load",
        url: workerGLTFParams.gltfUrl,
      });
      clearInterval(intervalGLTF);
    }
  }, 100)
}

function workerGLTFError() {
  workerGLTFParams.worker.postMessage({url: ''});
}

function parseSceneAndInsert(sceneJson) {
  const mesh = new THREE.ObjectLoader().parse( sceneJson );
  mesh.material = material;
  scene.add(mesh);
}
