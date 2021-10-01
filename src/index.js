import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import Stats from "three/examples/jsm/libs/stats.module";
import { randFloat } from "three/src/math/MathUtils";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";

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
  },
};
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
controlsFolder
  .add(settings.controls, "autoRotate")
  .onFinishChange((v) => (controls.autoRotate = v));
controlsFolder
  .add(settings.controls, "enableDamping")
  .onFinishChange((v) => (controls.enableDamping = v));
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

gui.add({ testKTX2: testKTX2 }, "testKTX2").name("testKTX2");

function testKTX2() {
  var ktx2Loader = new KTX2Loader();
  ktx2Loader.setTranscoderPath("./libs/basis/");
  ktx2Loader.detectSupport(renderer);
  const ormLoad = ktx2Loader.loadAsync("./maps/ktx2/silvertex_orm.ktx2");
  const normalLoad = ktx2Loader.loadAsync("./maps/ktx2/silvertex_normal.ktx2");

  Promise.all([ormLoad, normalLoad]).then(([orm, normal]) => {
    console.log("orm", orm, "normal", normal);
    orm.wrapS = THREE.RepeatWrapping;
    orm.wrapT = THREE.RepeatWrapping;
    orm.repeat.set(60, 60);
    normal.wrapS = THREE.RepeatWrapping;
    normal.wrapT = THREE.RepeatWrapping;
    normal.repeat.set(60, 60);
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#00ff00"),
      aoMap: orm,
      roughnessMap: orm,
      metalnessMap: orm,
      normalMap: normal,
    });

    plane1.material = material;
    plane2.material = material;
    plane1.material.needsUpdate = true;
    plane2.material.needsUpdate = true;
  });
}
/*
 * WORKERS
 */

var activeWorkerTexture = null;
const workerTextureGui = gui.addFolder("Texture Worker");
const workerTextureParams = {
  enableWorker:
    typeof createImageBitmap !== "undefined" &&
    /Firefox/.test(navigator.userAgent) === false,
  worker: null,
  initWorker: false,
  fallback: null,
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
// Use an ImageBitmapLoader if imageBitmaps are supported. Moves much of the
// expensive work of uploading a texture to the GPU off the main thread.
function workerTextureRight() {
  if (activeWorkerTexture) {
    clearInterval(activeWorkerTexture);
    activeWorkerTexture = null;

    if (!!workerTextureParams.worker) {
      workerTextureParams.worker.terminate();
      workerTextureParams.worker = null;
    }
  } else {
    if (!workerTextureParams.worker && workerTextureParams.enableWorker) {
      workerTextureParams.worker = new Worker("./workers/texture.worker.js");
      workerTextureParams.worker.addEventListener(
        "message",
        function (message) {
          console.log("WebW Texture Message", message.data);
          if (!message.data.error) {
            if (message.data.action === "init") {
              workerTextureParams.initWorker = true;
            }
            if (message.data.action === "load") {
              plane1.material.map = new THREE.CanvasTexture(
                message.data.imageBitmap
              );
              plane1.material.needsUpdate = true;
            }
          } else {
            alert("Worker Texture Error " + message.data.error);
          }
        }
      );
      workerTextureParams.worker.postMessage({
        id: "init",
        action: "init",
        options: { imageOrientation: "flipY" },
      });
    }

    if (!workerTextureParams.fallback && !workerTextureParams.enableWorker) {
      workerTextureParams.fallback = new THREE.TextureLoader();
    }

    activeWorkerTexture = setInterval(() => {
      const counterTmp = workerTextureParams.counter++;
      const url =
        "https://dummyimage.com/2048x2048/db1cdb/000000.png&text=" + counterTmp;

      if (workerTextureParams.enableWorker) {
        if (workerTextureParams.initWorker) {
          workerTextureParams.worker.postMessage({
            id: counterTmp,
            action: "load",
            url: url,
          });
        }
      } else {
        workerTextureParams.fallback.load(url, (texture) => {
          plane1.material.map = texture;
          plane1.material.needsUpdate = true;
        });
      }
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
function workerGLTFInit(multi = false) {
  workerGLTFParams.worker = new Worker("./workers/gltf.worker.js");

  workerGLTFParams.worker.addEventListener("message", function (message) {
    console.log("WebW GLTF Message", message.data);
    if (!message.data.error) {
      if (message.data.action === "init") {
        workerGLTFParams.initWorker = true;
      }
      if (message.data.action === "load") {
        parseSceneAndInsert(message.data.gltf, multi);
        if (multi) {
          workerGLTFParams.worker.postMessage({
            id: "dispose",
            action: "dispose",
          });
        }
      }
      if (message.data.action === "dispose") {
        workerGLTFParams.worker.terminate();
      }
    } else {
      alert("Worker GLTF Error " + message.data.error);
    }
    // workerGLTF.terminate();
  });
  workerGLTFParams.worker.postMessage({
    id: "init",
    action: "init",
    options: { dracoUrl: workerGLTFParams.dracoUrl },
  });
}

function workerGLTFLoad() {
  var intervalGLTF = setInterval(() => {
    if (workerGLTFParams.initWorker) {
      workerGLTFParams.worker.postMessage({
        id: workerGLTFParams.gltfUrl,
        action: "load",
        url: workerGLTFParams.gltfUrl,
      });
      clearInterval(intervalGLTF);
    }
  }, 100);
}

function workerGLTFError() {
  workerGLTFParams.worker.postMessage({ url: "" });
}

function parseSceneAndInsert(sceneJson, multi = false) {
  const mesh = new THREE.ObjectLoader().parse(sceneJson);
  mesh.material = material;
  if (multi) {
    mesh.position.set(randFloat(-2, 2), randFloat(-2, 2), randFloat(-2, 2));
  }
  scene.add(mesh);
}
