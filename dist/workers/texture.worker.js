(()=>{"use strict";var n={119:(t,e,n)=>{n.d(e,{q:()=>i});const i="0.0.4"}},i={};function o(t){var e=i[t];if(void 0!==e)return e.exports;e=i[t]={exports:{}};return n[t](e,e.exports,o),e.exports}o.d=(t,e)=>{for(var n in e)o.o(e,n)&&!o.o(t,n)&&Object.defineProperty(t,n,{enumerable:!0,get:e[n]})},o.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e);(()=>{var r=o(119);const a={enabled:!1,files:{},add:function(t,e){!1!==this.enabled&&(this.files[t]=e)},get:function(t){if(!1!==this.enabled)return this.files[t]},remove:function(t){delete this.files[t]},clear:function(){this.files={}}};const e=new class{constructor(t,e,n){const i=this;let r=!1,s=0,o=0,a=void 0;const c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=n,this.itemStart=function(t){o++,!1===r&&void 0!==i.onStart&&i.onStart(t,s,o),r=!0},this.itemEnd=function(t){s++,void 0!==i.onProgress&&i.onProgress(t,s,o),s===o&&(r=!1,void 0!==i.onLoad&&i.onLoad())},this.itemError=function(t){void 0!==i.onError&&i.onError(t)},this.resolveURL=function(t){return a?a(t):t},this.setURLModifier=function(t){return a=t,this},this.addHandler=function(t,e){return c.push(t,e),this},this.removeHandler=function(t){t=c.indexOf(t);return-1!==t&&c.splice(t,2),this},this.getHandler=function(n){for(let t=0,e=c.length;t<e;t+=2){const r=c[t];var i=c[t+1];if(r.global&&(r.lastIndex=0),r.test(n))return i}return null}}};class t extends class{constructor(t){this.manager=void 0!==t?t:e,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(n,i){const r=this;return new Promise(function(t,e){r.load(n,t,i,e)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}}{constructor(t){super(t),"undefined"==typeof createImageBitmap&&console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."),"undefined"==typeof fetch&&console.warn("THREE.ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"}}setOptions(t){return this.options=t,this}load(e,n,t,i){void 0===e&&(e=""),void 0!==this.path&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,s=a.get(e);if(void 0!==s)return r.manager.itemStart(e),setTimeout(function(){n&&n(s),r.manager.itemEnd(e)},0),s;const o={};o.credentials="anonymous"===this.crossOrigin?"same-origin":"include",o.headers=this.requestHeader,fetch(e,o).then(function(t){return t.blob()}).then(function(t){return createImageBitmap(t,Object.assign(r.options,{colorSpaceConversion:"none"}))}).then(function(t){a.add(e,t),n&&n(t),r.manager.itemEnd(e)}).catch(function(t){i&&i(t),r.manager.itemError(e),r.manager.itemEnd(e)}),r.manager.itemStart(e)}}t.prototype.isImageBitmapLoader=!0;const n=new t,i={init:function(t){n.setOptions(t.options),s({},t)},load:function(e){e.url?n.load(e.url,t=>s({imageBitmap:t},e,[]),void 0,t=>s({imageBitmap:null},e,[],t.message)):s({},e,[],"Missing Resource URL")}};function s(t,e,n=[],i=null){postMessage({id:e.id,action:e.action,error:i,version:r.q,...t},n)}addEventListener("message",function(t){t=t.data;i.hasOwnProperty(t.action)?i[t.action](t):s({},t,[],"Missing action")})})()})();