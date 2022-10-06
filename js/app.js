import { getFlippedVideoCanvas } from "./utils/getFlippedVideoCanvas.js";
import { reloadAfterMs } from "./utils/setupWebcam.js";
import { drawArtCanvas } from "./utils/drawArtCanvas.js";
import {
  drawWebcamEffectsShader,
  setupWebcamEffectsShader,
} from "./utils/drawWebcamEffectCanvas.js";
import { webGLGreenScreenCanvas } from "./utils/webGLGreenScreenCanvas.js";

// app elements
const inCanvas = document.getElementById("inCanvas");

const videoColorSelector = document.querySelector("#videoHolder");
const video = document.querySelector("#videoElement");

const inWebGlCanvas = new webGLGreenScreenCanvas({
  canvas: inCanvas,
  w: 1270,
  h: 1691,
});

const webcamEffectsCanvas = setupWebcamEffectsShader({ w: 1270, h: 1691 });

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

  drawWebcamEffectsShader({ sourceCanvas: inCanvas, params });
  drawArtCanvas({
    sourceCanvas: webcamEffectsCanvas,
    params,
    img,
    ...artworkSize,
  });

  // controls
  videoColorSelector.style.display = params.showColorDropper
    ? "inherit"
    : "none";
}
