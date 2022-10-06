import { getFlippedVideoCanvas } from "./utils/getFlippedVideoCanvas.js";
import { reloadAfterMs } from "./utils/setupWebcam.js";
import { drawArtCanvas } from "./utils/drawArtCanvas.js";
import {
  drawGreenscreen,
  setupGreenScreenShader,
} from "./utils/drawGreenscreen.js";
import { webGLGreenScreenCanvas } from "./utils/webGLGreenScreenCanvas.js";
// import { drawGlFxCanvas, setupGlfxCanvas } from "./utils/drawGlFxCanvas.js";

// app elements

const inCanvas = document.getElementById("inCanvas");

const videoColorSelector = document.querySelector("#videoHolder");
const video = document.querySelector("#videoElement");

const inWebGlCanvas = new webGLGreenScreenCanvas({
  canvas: inCanvas,
  w: 1270,
  h: 1691,
});

const greenscreenCanvas = setupGreenScreenShader({ w: 1270, h: 1691 });
// const glfxCanvas = setupGlfxCanvas();

// draw loop
export function draw({ artworkSize, params, img }) {
  // if (!params) reloadAfterMs();

  if (video.srcObject && !video.srcObject.active) {
    reloadAfterMs();
    return;
  }

  const frameCanvas = getFlippedVideoCanvas({
    video,
    crop: {
      left: params.cropLeft,
      right: params.cropRight,
      top: params.cropTop,
      bottom: params.cropBottom,
    },
    scale: params.size,
    flipX: true,
    flipY: false,
  });

  inWebGlCanvas.update({ sourceCanvas: frameCanvas, params });

  drawGreenscreen({ sourceCanvas: inCanvas, params });
  // drawGlFxCanvas({ sourceCanvas: greenscreenCanvas, params });
  drawArtCanvas({
    sourceCanvas: greenscreenCanvas,
    params,
    img,
    ...artworkSize,
  });

  // controls
  videoColorSelector.style.display = params.showColorDropper
    ? "inherit"
    : "none";
}
