import { ImageBitmapLoader } from "three";

const loader = new ImageBitmapLoader();
loader.setOptions( { imageOrientation: 'flipY' } );

addEventListener("message", function (message) {
  if(message.data.url) {
    loader.load(
      message.data.url,
      (imageBitmap) => postMessage({ id: message.data.id, imageBitmap: imageBitmap, error: null }),
      undefined,
      (err) => postMessage({ id: message.data.id, imageBitmap: null, error: err })
    );
  } else {
    postMessage({ id: message.data.id, imageBitmap: null, error: 'Missing Resource URL' })
  }
});
