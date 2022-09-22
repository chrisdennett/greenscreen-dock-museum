import { getFlippedVideoCanvas } from "./utils/getFlippedVideoCanvas.js";
import { reloadAfterMs } from "./setupWebcam.js";

// app elements
const artCanvas = document.querySelector("#artCanvas");
// const guideCanvas = document.querySelector("#guideCanvas");
const video = document.querySelector("#videoElement");

const artCtx = artCanvas.getContext("2d");

let glfxCanvas, texture;

// draw loop
export function draw({ webcamRes, params, initParams }) {
  // if (!params) reloadAfterMs();

  if (video.srcObject && !video.srcObject.active) {
    reloadAfterMs();
  }

  if (!glfxCanvas) {
    // fx loaded in index.html script tag
    glfxCanvas = fx.canvas();
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
    let gc = glfxCanvas.draw(texture);

    gc.lensBlur(
      params.lensBlurRadius,
      params.lensBlurBrightness,
      params.lensBlurAngle
    );
    gc.triangleBlur(params.triangleBlur);
    gc.denoise(params.denoise);
    gc.brightnessContrast(params.brightness, params.contrast);
    gc.hueSaturation(params.hue, params.saturation);
    gc.vibrance(params.vibrance);
    gc.ink(params.ink);

    gc.noise(params.noise);
    gc.sepia(params.sepia);
    gc.unsharpMask(params.unsharpRadius, params.unsharpStrength);

    gc.update();
  }

  artCanvas.width = webcamRes.w;
  artCanvas.height = webcamRes.h;

  artCtx.drawImage(glfxCanvas, 0, 0);
}

/*
 if (currFilter === "ink") 
 {fxCanvas.draw(texture).ink(inkLevel).update();
 }
if (currFilter === "edges") {
  fxCanvas.draw(texture).edgeWork(edgeLevel).update();
}
if (currFilter === "swirl") {
  fxCanvas
    .draw(texture)
    .swirl(380, 240, 200, parseFloat(swirlAngle))
    .update();
}
if (currFilter === "tiltshift") {
  fxCanvas
    .draw(texture)
    .tiltShift(96, 359.25, 480, 287.4, 15, 200)
    .update();
}
if (currFilter === "bulge") {
  fxCanvas.draw(texture).bulgePinch(320, 239.5, 242, 0.63).update();
}
if (currFilter === "pinch") {
  fxCanvas.draw(texture).bulgePinch(320, 239.5, 242, -0.6).update();
}
if (currFilter === "colourhalftone") {
  fxCanvas.draw(texture).colorHalftone(320, 239.5, 0.87, 5).update();
}
if (currFilter === "halftone") {
  fxCanvas.draw(texture).dotScreen(320, 239.5, 1.1, 4).update();
}
if (currFilter === "hexpixels") {
  fxCanvas.draw(texture).hexagonalPixelate(320, 239.5, 40).update();
}
if (currFilter === "unsharp") {
  fxCanvas.draw(texture).unsharpMask(15, 5).update();
}
if (currFilter === "denoise") {
  fxCanvas.draw(texture).denoise(denoiseLevel).update();
}
if (currFilter === "huesat") {
  fxCanvas.draw(texture).hueSaturation(0, 1).triangleBlur(30).update();
}
if (currFilter === "experiment") {
  fxCanvas
    .draw(texture)
    .hueSaturation(0, 0.5)
    .denoise(denoiseLevel)
    .ink(inkLevel)
    .update();
}
*/
