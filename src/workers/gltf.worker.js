import { LoadingManager } from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

const loaderManager = new LoadingManager();
const gltfLoader = new GLTFLoader(loaderManager);
const dracoLoader = new DRACOLoader();
gltfLoader.setDRACOLoader(dracoLoader);

addEventListener("message", function (message) {

    switch(message.data.action) {
        case 'init':
            setDracoDecoderPath(message.data.url);
            postMessage({ id: message.data.id, action: message.data.action, error: null })
            break;
        case 'load':
            load(message);
            break;
        default:
            postMessage({ id: message.data.id, action: message.data.action, error: 'Missing action' })
            break;
    }

    if(message.data.action === "init") {
        setDracoDecoderPath(message.data.url);
    }
});

function load(message) {
    if(message.data.url) {
        gltfLoader.load(
          message.data.url,
          (gltf) => postMessage({ id: message.data.id, gltf: gltf, error: null }),
          undefined,
          (err) => postMessage({ id: message.data.id, gltf: null, error: err })
        );
      } else {
        postMessage({ id: message.data.id, imageBitmap: null, error: 'Missing Resource URL' })
      }
}

function setDracoDecoderPath(dracoUrl) {
    dracoLoader.setDecoderPath(dracoUrl);
    // this.dracoLoader.setDecoderConfig({ type: 'js' });
    gltfLoader.setDRACOLoader(dracoLoader);
  }