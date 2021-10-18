import { VERSION } from "../version";
import { LoadingManager, WebGLRenderer, FileLoader } from "three";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";

const loaderManager = new LoadingManager();
const ktx2Loader = new KTX2Loader(loaderManager);
const fileLoader = new FileLoader(loaderManager);

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
  _setOptionsLoaders(data.options);
  _composeMessage({}, data);
}

function load(data) {
  if (data.url) {
    fileLoader.load(
        data.url,
        (buffer) => {
          ktx2Loader
            .init()
            .then(() => {
              return ktx2Loader.workerPool.postMessage(
                { type: "transcode", buffers: [buffer], taskConfig: {} },
                [buffer]
              );
            })
            .then((e) => {
              const { mipmaps, width, height, format, type, error, dfdTransferFn, dfdFlags } = e.data;
              _composeMessage({ mipmaps, width, height, format, type, error, dfdTransferFn, dfdFlags }, data);
            })
            .catch((err) => {
                _composeMessage({ type: 'error' }, data, err.message);
            });
        },
        undefined,
        (err) => _composeMessage({ type: 'error' }, data, 'KTX Error')
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
  ktx2Loader.dispose();
  _composeMessage({}, data);
}

// Support Functions
function _setOptionsLoaders(options) {
  ktx2Loader.setTranscoderPath(options.basisUrl);
  //ktx2Loader.detectSupport(new WebGLRenderer());
  ktx2Loader.workerConfig = options.workerConfig;
  ktx2Loader.setWorkerLimit(options.basisWorkersNum || 4);
  fileLoader.setResponseType("arraybuffer");

  if (!!options.withCredentials) {
    ktx2Loader.setWithCredentials(options.withCredentials);
    fileLoader.setWithCredentials(ktx2Loader.withCredentials);
  }
}
