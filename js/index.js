import { draw } from "./app.js";
import { setupControls } from "./controls.js";
import { loadImage } from "./utils/loadImage.js";
import { setup } from "./utils/setupWebcam.js";

const webcamRes = { w: 160, h: 120 };
// const webcamRes = { w: 320, h: 240 };
// const webcamRes = { w: 640, h: 480 };
// const webcamRes = { w: 800, h: 600 };
const artworkSize = { w: 1270, h: 1691 };

const img1 = await loadImage("/img/Loose_01_1270x1650.jpg");
let stats;

addFps();
const params = setupControls();
setup(webcamRes);
doDraw();

function doDraw() {
  if (stats) stats.begin();

  draw({ artworkSize, params, img: img1 });

  if (stats) stats.end();

  window.requestAnimationFrame(doDraw);
}

function addFps() {
  // stats loaded in index.html script tag
  stats = new Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);
}
