import { getFlippedVideoCanvas } from "./utils/getFlippedVideoCanvas.js";
import { reloadAfterMs } from "./setupWebcam.js";
import { vert, frag } from "../shaders/greenscreen.shaders.js";

// app elements
const artCanvas = document.querySelector("#artCanvas");
const artCtx = artCanvas.getContext("2d");
const videoColorSelector = document.querySelector("#videoHolder");
const video = document.querySelector("#videoElement");
const greenscreenCanvas = document.createElement("canvas");
// const greenscreenCanvas = document.querySelector("#guideCanvas");
let glfxCanvas, texture;

const gl = greenscreenCanvas.getContext("webgl", { premultipliedAlpha: false });
const prog = gl.createProgram();

setupGreenScreenShader();

// GREEN SCREEN CODE
const texLoc = gl.getUniformLocation(prog, "tex");
const texWidthLoc = gl.getUniformLocation(prog, "texWidth");
const texHeightLoc = gl.getUniformLocation(prog, "texHeight");
const keyColorLoc = gl.getUniformLocation(prog, "keyColor");
const u_colorLocation = gl.getUniformLocation(prog, "u_Color");
const similarityLoc = gl.getUniformLocation(prog, "similarity");
const smoothnessLoc = gl.getUniformLocation(prog, "smoothness");
const spillLoc = gl.getUniformLocation(prog, "spill");

function setupGreenScreenShader() {
  const vs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vs, vert);
  gl.compileShader(vs);

  const fs = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fs, frag);
  gl.compileShader(fs);
  if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(fs));
  }

  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const vb = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vb);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, 1, -1, -1, 1, -1, 1, 1]),
    gl.STATIC_DRAW
  );

  const coordLoc = gl.getAttribLocation(prog, "c");
  gl.vertexAttribPointer(coordLoc, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(coordLoc);

  gl.activeTexture(gl.TEXTURE0);
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
}

function getPalette() {
  /*{
    name: "Rhythm",
    hex: "6B799E",
    rgb: [107, 121, 158],
    cmyk: [32, 23, 0, 38],
    hsb: [224, 32, 62],
    hsl: [224, 21, 52],
    lab: [51, 4, -22],
  }*/
  let combinedArr = [];

  for (let p of paletteArray) {
    const [r, g, b] = p.rgb;

    combinedArr.push(r / 255, g / 255, b / 255);
  }

  return combinedArr;
  // return [1, 0, 1, 0.5, 0, 0, 1, 0.5];
}

function drawGreenscreen({ webcamRes, sourceCanvas, params }) {
  greenscreenCanvas.width = webcamRes.w;
  greenscreenCanvas.height = webcamRes.h;
  gl.viewport(0, 0, webcamRes.w, webcamRes.h);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGB,
    gl.RGB,
    gl.UNSIGNED_BYTE,
    sourceCanvas
  );
  gl.uniform1i(texLoc, 0);
  gl.uniform1f(texWidthLoc, webcamRes.w);
  gl.uniform1f(texHeightLoc, webcamRes.h);
  const m = params.keyColor.match(/^#([0-9a-f]{6})$/i)[1];
  gl.uniform3f(
    keyColorLoc,
    parseInt(m.substr(0, 2), 16) / 255,
    parseInt(m.substr(2, 2), 16) / 255,
    parseInt(m.substr(4, 2), 16) / 255
  );

  // gl.uniform4f(u_colorLocation, 1, 0, 1, 0.5);
  gl.uniform3fv(u_colorLocation, getPalette());

  gl.uniform1f(similarityLoc, params.keySimilarity);

  gl.uniform1f(smoothnessLoc, params.keySmoothness);
  gl.uniform1f(spillLoc, params.keySpill);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}
// END GREEN SCREEN CODE

// draw loop
export function draw({ webcamRes, params, img1 }) {
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

  drawGreenscreen({ webcamRes, sourceCanvas: frameCanvas, params });

  if (!glfxCanvas) {
    // fx loaded in index.html script tag
    glfxCanvas = fx.canvas();
  }

  if (glfxCanvas && video) {
    texture = glfxCanvas.texture(greenscreenCanvas);
    let gc = glfxCanvas.draw(texture);
    gc.sepia(params.sepia);

    gc.lensBlur(
      params.lensBlurRadius,
      params.lensBlurBrightness,
      params.lensBlurAngle
    );
    // gc.triangleBlur(params.triangleBlur);
    gc.denoise(params.denoise);
    gc.brightnessContrast(params.brightness, params.contrast);
    // gc.hueSaturation(params.hue, params.saturation);
    gc.vibrance(params.vibrance);
    gc.ink(params.ink);

    // if (params.edgeWork > 0) {
    //   gc.edgeWork(params.edgeWork);
    // }

    gc.noise(params.noise);
    // gc.unsharpMask(params.unsharpRadius, params.unsharpStrength);

    gc.update();
  }

  const { w, h } = webcamRes;
  artCanvas.width = w;
  artCanvas.height = h;

  const inLeft = w * params.cropLeft;
  const inRight = w * params.cropRight;
  const inTop = h * params.cropTop;
  const inBottom = h * params.cropBottom;
  const inWidth = w - (inLeft + inRight);
  const inHeight = h - (inTop + inBottom);

  const wToHRatio = inHeight / inWidth;

  const outLeft = params.left * w;
  const outTop = params.top * h;
  const outWidth = params.size * inWidth;
  const outHeight = wToHRatio * outWidth;

  // draw image
  artCtx.drawImage(img1, 0, 0, img1.width, img1.height, 0, 0, w, h);

  // draw webcam image
  artCtx.drawImage(
    glfxCanvas,
    inLeft,
    inTop,
    inWidth,
    inHeight,
    outLeft,
    outTop,
    outWidth,
    outHeight
  );

  // controls
  videoColorSelector.style.display = params.showColorDropper
    ? "inherit"
    : "none";
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

// Extended Array
const paletteArray = [
  {
    name: "Rhythm",
    hex: "6B799E",
    rgb: [107, 121, 158],
    cmyk: [32, 23, 0, 38],
    hsb: [224, 32, 62],
    hsl: [224, 21, 52],
    lab: [51, 4, -22],
  },
  {
    name: "Metallic Sunburst",
    hex: "AA8448",
    rgb: [170, 132, 72],
    cmyk: [0, 22, 58, 33],
    hsb: [37, 58, 67],
    hsl: [37, 40, 47],
    lab: [58, 7, 38],
  },
  {
    name: "Laurel Green",
    hex: "A4B29A",
    rgb: [164, 178, 154],
    cmyk: [8, 0, 13, 30],
    hsb: [95, 13, 70],
    hsl: [95, 13, 65],
    lab: [71, -9, 11],
  },
  {
    name: "Kombu Green",
    hex: "35463F",
    rgb: [53, 70, 63],
    cmyk: [24, 0, 10, 73],
    hsb: [155, 24, 27],
    hsl: [155, 14, 24],
    lab: [28, -8, 2],
  },
  {
    name: "Spanish Bistre",
    hex: "777242",
    rgb: [119, 114, 66],
    cmyk: [0, 4, 45, 53],
    hsb: [54, 45, 47],
    hsl: [54, 29, 36],
    lab: [47, -6, 27],
  },
  {
    name: "Sage",
    hex: "BDB88F",
    rgb: [189, 184, 143],
    cmyk: [0, 3, 24, 26],
    hsb: [53, 24, 74],
    hsl: [53, 26, 65],
    lab: [74, -5, 22],
  },
  {
    name: "Timberwolf",
    hex: "CECCC1",
    rgb: [206, 204, 193],
    cmyk: [0, 1, 6, 19],
    hsb: [51, 6, 81],
    hsl: [51, 12, 78],
    lab: [82, -1, 6],
  },
  {
    name: "Camel",
    hex: "AF985C",
    rgb: [175, 152, 92],
    cmyk: [0, 13, 47, 31],
    hsb: [43, 47, 69],
    hsl: [43, 34, 52],
    lab: [64, 0, 35],
  },
  {
    name: "China Rose",
    hex: "AA5062",
    rgb: [170, 80, 98],
    cmyk: [0, 53, 42, 33],
    hsb: [348, 53, 67],
    hsl: [348, 36, 49],
    lab: [46, 39, 7],
  },
  {
    name: "Morning Blue",
    hex: "769A8E",
    rgb: [118, 154, 142],
    cmyk: [23, 0, 8, 40],
    hsb: [160, 23, 60],
    hsl: [160, 15, 53],
    lab: [61, -15, 2],
  },
];
