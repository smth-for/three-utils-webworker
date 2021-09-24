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
  100
);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 2;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.autoRotate = true;
controls.enableDamping = true;

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
  dracoUrl: '', // https://vestanest.smth.it/draco-r121/
  gltfUrl: '',
  workerRight: workerGLTFRight,
  workerError: workerGLTFError,
};
workerGLTFGui.add(workerGLTFParams, "workerRight").name("Toggle Worker");
workerGLTFGui.add(workerGLTFParams, "workerError").name("Error Worker");

/*
 * WEB WORKER FUNCTIONS
 */

// WORKER TEXTURE
function workerTextureRight() {
  if (activeWorkerGLTF) {
    clearInterval(activeWorkerGLTF);
    activeWorkerGLTF = null;
  } else {
    activeWorkerGLTF = setInterval(() => {
      var workerTexture = new Worker("./workers/texture.worker.js");

      workerTexture.addEventListener("message", function (message) {
        console.log("WebW Texture Message", message.data);
        if (!message.data.error) {
          plane1.material.color = new THREE.Color(0xff00ff);
          plane1.material.map = new THREE.CanvasTexture(
            message.data.imageBitmap
          );
          plane1.material.needsUpdate = true;
        } else {
          alert("Worker Texture Error " + message.data.error);
        }
        workerTexture.terminate();
      });
      workerTexture.postMessage({
        url:
          "https://dummyimage.com/300x300/db1cdb/000000.png&text=" +
          workerTextureParams.counter++,
      });
    }, workerTextureParams.intervalTime);
  }
}

function workerTextureError() {
  workerTexture.postMessage({ url: "" });
}

function resetCounter() {
  workerTextureParams.counter = 1;
}

// WORKER GLTF
function workerGLTFRight() {
  var workerGLTF = new Worker("./workers/texture.worker.js");

      workerGLTF.addEventListener("message", function (message) {
        console.log("WebW GLTF Message", message.data);
        if (!message.data.error) {
        } else {
          alert("Worker GLTF Error " + message.data.error);
        }
        workerGLTF.terminate();
      });
      workerGLTF.postMessage({
        action: 'init',
        url: workerGLTFParams.dracoUrl
      });
}

function workerGLTFError() {
  workerTexture.postMessage({});
}
