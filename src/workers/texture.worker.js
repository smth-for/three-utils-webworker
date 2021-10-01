import { VERSION } from '../version';
import { ImageBitmapLoader } from "three";

const loader = new ImageBitmapLoader();

const functions = {
  init: init,
  load: load,
}

addEventListener("message", function (message) {
  const data = message.data;
  if(functions.hasOwnProperty(data.action)) {
    functions[data.action](data);
  } else {
    composeMessage({}, data, [], "Missing action")
  }
});

function composeMessage(payload, data, transfer = [], error = null) {
  postMessage({
    id: data.id,
    action: data.action,
    error: error,
    version: VERSION,
    ...payload,
  }, transfer);
}

function init(data) {
  loader.setOptions(data.options);
  composeMessage({}, data);
}

function load(data) {
  if (data.url) {
    loader.load(
      data.url,
      (imageBitmap) => composeMessage({imageBitmap: imageBitmap}, data, [imageBitmap]),
      undefined, // TODO: implement a progress
      (err) => composeMessage({imageBitmap: null}, data, [], err.message),
    );
  } else {
    composeMessage({}, data, [], "Missing Resource URL")
  }
}
