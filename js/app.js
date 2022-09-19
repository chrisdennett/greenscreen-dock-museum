import { getFlippedVideoCanvas } from "./utils/getFlippedVideoCanvas.js";
import { reloadAfterMs } from "./setupWebcam.js";

// app elements
const artCanvas = document.querySelector("#artCanvas");
const guideCanvas = document.querySelector("#guideCanvas");
const video = document.querySelector("#videoElement");

const artCtx = artCanvas.getContext("2d");

// draw loop
export function draw({ webcamRes }) {
  // if (!params) reloadAfterMs();

  if (video.srcObject && !video.srcObject.active) {
    reloadAfterMs();
  }

  const frameCanvas = getFlippedVideoCanvas({
    video,
    w: webcamRes.w,
    h: webcamRes.h,
    flipX: true,
    flipY: false,
  });

  artCanvas.width = webcamRes.w;
  artCanvas.height = webcamRes.h;

  artCtx.drawImage(frameCanvas, 0, 0);
}
