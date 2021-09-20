import * as THREE from "three";

const loader = new THREE.ImageBitmapLoader();
loader.setOptions( { imageOrientation: 'flipY' } );
var counter = 1;

addEventListener("message", function (message) {
  counter += 1;
  loader.load(
    // resource URL
    message.data + counter.toString(),
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
