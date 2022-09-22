import { getFlippedVideoCanvas } from "./utils/getFlippedVideoCanvas.js";
import { reloadAfterMs } from "./setupWebcam.js";

// app elements
const artCanvas = document.querySelector("#artCanvas");
const video = document.querySelector("#videoElement");
const greenscreenCanvas = document.querySelector("#guideCanvas");
const gl = greenscreenCanvas.getContext("webgl", { premultipliedAlpha: false });

// GREEN SCREEN CODE
const vs = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(
  vs,
  "attribute vec2 c; void main(void) { gl_Position=vec4(c, 0.0, 1.0); }"
);
gl.compileShader(vs);

const fs = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fs, document.getElementById("fragment-shader").innerText);
gl.compileShader(fs);
if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
  console.error(gl.getShaderInfoLog(fs));
}

const prog = gl.createProgram();
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

const texLoc = gl.getUniformLocation(prog, "tex");
const texWidthLoc = gl.getUniformLocation(prog, "texWidth");
const texHeightLoc = gl.getUniformLocation(prog, "texHeight");
const keyColorLoc = gl.getUniformLocation(prog, "keyColor");
const similarityLoc = gl.getUniformLocation(prog, "similarity");
const smoothnessLoc = gl.getUniformLocation(prog, "smoothness");
const spillLoc = gl.getUniformLocation(prog, "spill");

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

  gl.uniform1f(similarityLoc, params.keySimilarity);

  gl.uniform1f(smoothnessLoc, params.keySmoothness);
  gl.uniform1f(spillLoc, params.keySpill);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}
// END GREEN SCREEN CODE

const artCtx = artCanvas.getContext("2d");

let glfxCanvas, texture;

// draw loop
export function draw({ webcamRes, params }) {
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
