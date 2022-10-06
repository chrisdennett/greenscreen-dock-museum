import { getFlippedVideoCanvas } from "./utils/getFlippedVideoCanvas.js";
import { reloadAfterMs } from "./utils/setupWebcam.js";
import { drawArtCanvas } from "./drawArtCanvas.js";
import { webGlWaterColourCanvas } from "./webgl-watercolourEffect/webGlWaterColourCanvas.js";
import { webGLGreenScreenCanvas } from "./webgl-greenscreen/webGLGreenScreenCanvas.js";

// app elements
const videoColorSelector = document.querySelector("#videoHolder");
const video = document.querySelector("#videoElement");

const canvasSize = {
  w: 1270,
  h: 1691,
};

const webGlGreenScreenCanvas = new webGLGreenScreenCanvas({ ...canvasSize });
const webcamEffectsCanvas = new webGlWaterColourCanvas({ ...canvasSize });

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

  const gsCanvas = webGlGreenScreenCanvas.update({
    sourceCanvas: frameCanvas,
    params,
  });
  const fxCanvas = webcamEffectsCanvas.update({
    sourceCanvas: gsCanvas,
    params,
  });
  // drawWebcamEffectsShader({ sourceCanvas: inCanvas, params });

  drawArtCanvas({
    sourceCanvas: fxCanvas,
    params,
    img,
    ...artworkSize,
  });

  // controls
  videoColorSelector.style.display = params.showColorDropper
    ? "inherit"
    : "none";
}
