import * as THREE from "three";

var counter = 0;
var vector = new THREE.Vector3();
addEventListener('message', function (message) {
    counter += message.data;
    vector.addScalar(message.data);
    postMessage({counter: counter, vector: vector});
});