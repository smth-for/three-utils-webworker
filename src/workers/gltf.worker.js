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
    _composeMessage({}, data, [], "Missing action");
  }
});

function _composeMessage(payload, data, transfer = [], error = null) {
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
  _setDracoDecoderPath(data.options);
  _composeMessage({}, data);
}

function load(data) {
  if (data.url) {
    gltfLoader.load(
      data.url,
      (gltf) => {
        const sceneJson = gltf.scene.toJSON();
        _composeMessage({ gltf: sceneJson }, data);
      },
      undefined,
      (err) => _composeMessage({ gltf: null }, data, err.message)
    );
  } else {
    postMessage({
      id: data.id,
      action: data.action,
      gltf: null,
      error: "Missing Resource URL",
    });
  }
}

function dispose(data) {
  dracoLoader.dispose();
  _composeMessage({}, data);
}

// Support Functions
function _setDracoDecoderPath(options) {
  dracoLoader.setDecoderPath(options.dracoUrl);
  dracoLoader.setDecoderConfig({ type: options.dracoDecoder || "wasm" });
  dracoLoader.setWorkerLimit(options.dracoWorkersNum || 4);
  gltfLoader.setDRACOLoader(dracoLoader);
}
