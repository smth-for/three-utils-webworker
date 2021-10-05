import { VERSION } from "../version";
import { LoadingManager } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

const loaderManager = new LoadingManager();
const gltfLoader = new GLTFLoader(loaderManager);
const dracoLoader = new DRACOLoader();
gltfLoader.setDRACOLoader(dracoLoader);

const functions = {
  init: init,
  load: load,
  dispose: dispose,
};

addEventListener("message", function (message) {
  const data = message.data;
  if (functions.hasOwnProperty(data.action)) {
    functions[data.action](data);
  } else {
    composeMessage({}, data, [], "Missing action");
  }
});

function composeMessage(payload, data, transfer = [], error = null) {
  postMessage(
    {
      id: data.id,
      action: data.action,
      error: error,
      version: VERSION,
      ...payload,
    },
    transfer
  );
}

function init(data) {
  setDracoDecoderPath(data.options);
  composeMessage({}, data);
}

function load(data) {
  if (data.url) {
    gltfLoader.load(
      data.url,
      (gltf) => {
        const sceneJson = gltf.scene.toJSON();
        composeMessage({ gltf: sceneJson }, data);
      },
      undefined,
      (err) => composeMessage({ gltf: null }, data, [], err.message)
    );
  } else {
    composeMessage({ gltf: null }, data, [], "Missing Resource URL");
  }
}

function dispose(data) {
  dracoLoader.dispose();
  composeMessage({}, data);
}

// Support Functions
function setDracoDecoderPath(options) {
  dracoLoader.setDecoderPath(options.dracoUrl);
  dracoLoader.setDecoderConfig({ type: options.dracoDecoder || "wasm" });
  dracoLoader.setWorkerLimit(options.dracoWorkersNum || 4);
  gltfLoader.setDRACOLoader(dracoLoader);
}
