import { ImageBitmapLoader } from "three";

const loader = new ImageBitmapLoader();
loader.setOptions( { imageOrientation: 'flipY' } );

addEventListener("message", function (message) {
  loader.load(
    // resource URL
    message.data.url,
    // onLoad callback
    (imageBitmap) => {
      postMessage({ imageBitmap: imageBitmap, error: null });
    },
    undefined,
    function (err) {
      console.log("An error happened");
      postMessage({ imageBitmap: null, error: err });
    }
  );
});
