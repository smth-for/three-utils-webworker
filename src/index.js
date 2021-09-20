import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import Stats from "three/examples/jsm/libs/stats.module";

const loader = new THREE.ImageBitmapLoader();
loader.setOptions({ imageOrientation: "flipY" });
var counter = 1;

var workerTest = new Worker("./workers/test.worker.js");
var workerTexture = new Worker("./workers/texture.worker.js");

workerTest.addEventListener("message", function (message) {
  console.log("RESPONSE WW TEST", message.data);
});

workerTexture.addEventListener("message", function (message) {
  console.log("RESPONSE WW TEXTURE", message.data);
  sphere.material.color = new THREE.Color(0xff00ff);
  sphere.material.map = new THREE.CanvasTexture(message.data.imageBitmap);
  sphere.material.needsUpdate = true;
  console.log(sphere.material.color, sphere.material.map);
});

var activeWorkerTest = null;
var activeWorkerTexture = null;
var changeTextureInterval = null;
// Debug
const gui = new dat.GUI();

gui.add({ workerAdd: workerAdd }, "workerAdd").name("Worker add");
gui.add({ workerTex: workerTex }, "workerTex").name("workerTex");
gui.add({ changeTexture: changeTexture }, "changeTexture").name("changeTexture");
var perfFolder = gui.addFolder("Performance");

const stats = Stats();
stats.domElement.height = "48px";
[].forEach.call(
  stats.domElement.children,
  (child) => (child.style.display = "")
);

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
  side: THREE.DoubleSide,
});
//material.color = new THREE.Color(0xff0000);

// Mesh
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

// Lights

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.x = 2;
pointLight.position.y = 3;
pointLight.position.z = 4;
scene.add(pointLight);

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
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

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
  sphere.rotation.y = 0.5 * elapsedTime;

  // Update Orbital Controls
  // controls.update()

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);

  stats.update();
};

tick();

function workerAdd() {
  console.log(activeWorkerTest);
  if (activeWorkerTest) {
    clearInterval(activeWorkerTest);
    activeWorkerTest = null;
  } else {
    activeWorkerTest = setInterval(() => {
      workerTest.postMessage(1);
    }, 100);
  }
}

function workerTex() {
  console.log(activeWorkerTexture);
  if (activeWorkerTexture) {
    clearInterval(activeWorkerTexture);
    activeWorkerTexture = null;
  } else {
    activeWorkerTexture = setInterval(() => {
      workerTexture.postMessage(
        "https://dummyimage.com/300x300/db1cdb/000000.png&text="
      );
    }, 10);
  }
}

function changeTexture() {
  // changeTextureInterval

  console.log(changeTextureInterval);
  if (changeTextureInterval) {
    clearInterval(changeTextureInterval);
    changeTextureInterval = null;
  } else {
    changeTextureInterval = setInterval(() => {
      counter += 1;
      loader.load(
        // resource URL
        "https://dummyimage.com/300x300/db1cdb/000000.png&text=" +
          counter.toString(),
        // onLoad callback
        (imageBitmap) => {
          sphere.material.color = new THREE.Color(0xff00ff);
          sphere.material.map = new THREE.CanvasTexture(
            imageBitmap
          );
          sphere.material.needsUpdate = true;
          console.log(sphere.material.color, sphere.material.map);
        },
        undefined,
        function (err) {
          console.log("An error happened");
        }
      );
    }, 10);
  }
}
