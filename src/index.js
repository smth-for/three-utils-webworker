import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import Stats from "three/examples/jsm/libs/stats.module";
import { randFloat } from "three/src/math/MathUtils";
import { FileLoader, CompressedTexture } from "three";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { BasisTextureLoader } from "three/examples/jsm/loaders/BasisTextureLoader.js";

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
  dracoUrl: `${document.URL}libs/draco/`,
  gltfUrl: `${document.URL}gltf/model.gltf`,
  multi: false,
  workerInit: workerGLTFInit,
  workerLoad: workerGLTFLoad,
  workerError: workerGLTFError,
};
workerGLTFGui.add(workerGLTFParams, "gltfUrl");
workerGLTFGui.add(workerGLTFParams, "multi");
workerGLTFGui.add(workerGLTFParams, "workerInit").name("Init Worker");
workerGLTFGui.add(workerGLTFParams, "workerLoad").name("Load Worker");
workerGLTFGui.add(workerGLTFParams, "workerError").name("Error Worker");

var activeWorkerKTX = null;
const workerKTXGui = gui.addFolder("KTX Worker");
const workerKTXParams = {
  worker: null,
  initWorker: false,
  workerConfig: {},
  basisUrl: `${document.URL}libs/basis/`,
  ktxUrl: `${document.URL}maps/ktx2/test/lynx2048UASTC.ktx2`,
  workerInit: workerKTXInit,
  workerLoad: workerKTXLoad,
  workerError: workerKTXError,
};
workerKTXGui.add(workerKTXParams, "ktxUrl");
workerKTXGui.add(workerKTXParams, "workerInit").name("Init Worker");
workerKTXGui.add(workerKTXParams, "workerLoad").name("Load Worker");
workerKTXGui.add(workerKTXParams, "workerError").name("Error Worker");

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
function workerGLTFInit() {
  workerGLTFParams.worker = new Worker("./workers/gltf.worker.js");

  workerGLTFParams.worker.addEventListener("message", function (message) {
    console.log("WebW GLTF Message", message.data);
    if (!message.data.error) {
      if (message.data.action === "init") {
        workerGLTFParams.initWorker = true;
      }
      if (message.data.action === "load") {
        parseSceneAndInsert(message.data.gltf, workerGLTFParams.multi);
        if (workerGLTFParams.multi) {
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

// WORKER KTX
function workerKTXInit() {
  workerKTXParams.worker = new Worker("./workers/ktx2.worker.js");

  workerKTXParams.worker.addEventListener("message", function (message) {
    console.log("WebW KTX Message", message.data);
    if (!message.data.error) {
      if (message.data.action === "init") {
        workerKTXParams.initWorker = true;
      }
      if (message.data.action === "load") {
        const compressTexture = _createCompressTextureFromData(message.data);
        plane1.material.map = compressTexture;
        plane1.material.color = new THREE.Color('#fff');
        plane1.material.needsUpdate = true;
        plane2.material.map = compressTexture;
        plane2.material.color = new THREE.Color('#fff');
        plane2.material.needsUpdate = true;
        workerKTXParams.worker.postMessage({
          id: "dispose",
          action: "dispose",
        });
      }
      if (message.data.action === "dispose") {
        workerKTXParams.worker.terminate();
      }
    } else {
      alert("Worker KTX Error " + message.data.error);
    }
    // workerKTX.terminate();
  });

  workerKTXParams.workerConfig = {
    astcSupported: renderer.extensions.has( 'WEBGL_compressed_texture_astc' ),
    etc1Supported: renderer.extensions.has( 'WEBGL_compressed_texture_etc1' ),
    etc2Supported: renderer.extensions.has( 'WEBGL_compressed_texture_etc' ),
    dxtSupported: renderer.extensions.has( 'WEBGL_compressed_texture_s3tc' ),
    bptcSupported: renderer.extensions.has( 'EXT_texture_compression_bptc' ),
    pvrtcSupported: renderer.extensions.has( 'WEBGL_compressed_texture_pvrtc' )
      || renderer.extensions.has( 'WEBKIT_WEBGL_compressed_texture_pvrtc' )
  };

  workerKTXParams.worker.postMessage({
    id: "init",
    action: "init",
    options: { basisUrl: workerKTXParams.basisUrl, workerConfig: workerKTXParams.workerConfig},
  });
}

function workerKTXLoad() {
  var intervalKTX = setInterval(() => {
    if (workerKTXParams.initWorker) {
      workerKTXParams.worker.postMessage({
        id: workerKTXParams.ktxUrl,
        action: "load",
        url: workerKTXParams.ktxUrl,
      });
      clearInterval(intervalKTX);
    }
  }, 100);
}

function workerKTXError() {
  workerKTXParams.worker.postMessage({ url: "" });
}

function _createCompressTextureFromData(data) {
  const { mipmaps, width, height, format, type, error, dfdTransferFn, dfdFlags } = data;
		if ( type === 'error' ) return Promise.reject( error );
		const texture = new CompressedTexture( mipmaps, width, height, format, THREE.UnsignedByteType );
		texture.minFilter = mipmaps.length === 1 ? THREE.LinearFilter : THREE.LinearMipmapLinearFilter;
		texture.magFilter = THREE.LinearFilter;
		texture.generateMipmaps = false;
		texture.needsUpdate = true;
		texture.encoding = dfdTransferFn === 2 ? THREE.sRGBEncoding : THREE.LinearEncoding;
		texture.premultiplyAlpha = !! ( dfdFlags & 1 );
  return texture;
}