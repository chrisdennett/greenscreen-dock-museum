import { getFlippedVideoCanvas } from "./utils/getFlippedVideoCanvas.js";
import { reloadAfterMs } from "./utils/setupWebcam.js";
import { drawArtCanvas } from "./utils/drawArtCanvas.js";
import {
  drawGreenscreen,
  setupGreenScreenShader,
} from "./utils/drawGreenscreen.js";
import { drawGlFxCanvas, setupGlfxCanvas } from "./utils/drawGlFxCanvas.js";

// app elements
const videoColorSelector = document.querySelector("#videoHolder");
const video = document.querySelector("#videoElement");

const greenscreenCanvas = setupGreenScreenShader();
const glfxCanvas = setupGlfxCanvas();

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

  drawGreenscreen({ sourceCanvas: frameCanvas, params });
  drawGlFxCanvas({ sourceCanvas: greenscreenCanvas, params });
  drawArtCanvas({ sourceCanvas: glfxCanvas, params, img, ...artworkSize });

  // controls
  videoColorSelector.style.display = params.showColorDropper
    ? "inherit"
    : "none";
}
