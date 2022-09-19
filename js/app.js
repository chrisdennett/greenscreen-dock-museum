import { getFlippedVideoCanvas } from "./utils/getFlippedVideoCanvas.js";
import { reloadAfterMs } from "./setupWebcam.js";

// app elements
const artCanvas = document.querySelector("#artCanvas");
const guideCanvas = document.querySelector("#guideCanvas");
const video = document.querySelector("#videoElement");

const artCtx = artCanvas.getContext("2d");

let glfxCanvas, texture;

// draw loop
export function draw({ webcamRes }) {
  // if (!params) reloadAfterMs();

  if (video.srcObject && !video.srcObject.active) {
    reloadAfterMs();
  }

  if (!glfxCanvas) {
    // fx loaded in index.html script tag
    glfxCanvas = fx.canvas();
    console.log("glfxCanvas: ", glfxCanvas);
  }

  const frameCanvas = getFlippedVideoCanvas({
    video,
    w: webcamRes.w,
    h: webcamRes.h,
    flipX: true,
    flipY: false,
  });

  if (glfxCanvas && video) {
    texture = glfxCanvas.texture(frameCanvas);
    glfxCanvas.draw(texture).ink(0.8).update();
  }

  artCanvas.width = webcamRes.w;
  artCanvas.height = webcamRes.h;

  artCtx.drawImage(glfxCanvas, 0, 0);
}
