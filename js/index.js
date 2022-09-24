import { draw } from "./app.js";
import { setupControls } from "./controls.js";
import { setup } from "./setupWebcam.js";

let stats;

// const webcamRes = { w: 320, h: 240 };
const webcamRes = { w: 640, h: 480 };
// const webcamRes = { w: 800, h: 600 };

const img1 = await loadImage("/img/AlbumPainting_01.jpg");
addFps();
const params = setupControls();
setup(webcamRes);
doDraw();

function doDraw() {
  if (stats) stats.begin();
  draw({ webcamRes, params, img1 });
  if (stats) stats.end();

  window.requestAnimationFrame(doDraw);
}

function addFps() {
  // stats loaded in index.html script tag
  stats = new Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);
}

async function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject();
    img.src = url;
  });
}
