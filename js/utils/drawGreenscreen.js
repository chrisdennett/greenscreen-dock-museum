import { vert, frag } from "../../shaders/greenscreen.shaders.js";

const greenscreenCanvas = document.createElement("canvas");
let gl;
let prog;
// GREEN SCREEN CODE
let texLoc;
let texWidthLoc;
let texHeightLoc;
let keyColorLoc;
let similarityLoc;
let smoothnessLoc;
let spillLoc;

export function drawGreenscreen({ sourceCanvas, params }) {
  if (!sourceCanvas) return;

  greenscreenCanvas.width = sourceCanvas.width;
  greenscreenCanvas.height = sourceCanvas.height;
  gl.viewport(0, 0, sourceCanvas.width, sourceCanvas.height);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    sourceCanvas
  );
  gl.uniform1i(texLoc, 0);
  gl.uniform1f(texWidthLoc, sourceCanvas.width);
  gl.uniform1f(texHeightLoc, sourceCanvas.height);
  const m = params.keyColor.match(/^#([0-9a-f]{6})$/i)[1];
  gl.uniform3f(
    keyColorLoc,
    parseInt(m.substr(0, 2), 16) / 255,
    parseInt(m.substr(2, 2), 16) / 255,
    parseInt(m.substr(4, 2), 16) / 255
  );

  // gl.uniform4f(u_colorLocation, 1, 0, 1, 0.5);
  // gl.uniform3fv(u_colorLocation, getPalette());

  gl.uniform1f(similarityLoc, params.keySimilarity);

  gl.uniform1f(smoothnessLoc, params.keySmoothness);
  gl.uniform1f(spillLoc, params.keySpill);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

export function setupGreenScreenShader() {
  gl = greenscreenCanvas.getContext("webgl", { premultipliedAlpha: false });
  prog = gl.createProgram();

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

  // set up param locations in shader
  texLoc = gl.getUniformLocation(prog, "tex");
  texWidthLoc = gl.getUniformLocation(prog, "texWidth");
  texHeightLoc = gl.getUniformLocation(prog, "texHeight");
  keyColorLoc = gl.getUniformLocation(prog, "keyColor");
  similarityLoc = gl.getUniformLocation(prog, "similarity");
  smoothnessLoc = gl.getUniformLocation(prog, "smoothness");
  spillLoc = gl.getUniformLocation(prog, "spill");

  return greenscreenCanvas;
}

// Unused Palette Code - for greenscreen webgl if used
/*
function getPalette() {
  let combinedArr = [];

  for (let p of paletteArray) {
    const [r, g, b] = p.rgb;

    combinedArr.push(r / 255, g / 255, b / 255);
  }

  return combinedArr;
}


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
*/
