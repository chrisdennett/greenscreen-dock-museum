import { draw } from "./app.js";
import { setupControls } from "./controls.js";
import { setup } from "./utils/setupWebcam.js";

// const webcamRes = { w: 800, h: 600 };
// const webcamRes = { w: 320, h: 240 };
const webcamRes = { w: 640, h: 480 };
const artworkSize = { w: 1280, h: 720 };

const paintingBgCanvas = document.getElementById("paintingBgCanvas");
paintingBgCanvas.width = artworkSize.w;
paintingBgCanvas.height = artworkSize.h;
const paintingBgCtx = paintingBgCanvas.getContext("2d");
const img1 = await loadImage("/img/AlbumPainting_01.jpg");
paintingBgCtx.drawImage(
  img1,
  0,
  0,
  img1.width,
  img1.height,
  0,
  0,
  artworkSize.w,
  artworkSize.h
);

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

async function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject();
    img.src = url;
  });
}
