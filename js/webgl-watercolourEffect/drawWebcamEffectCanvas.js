import { vert, frag } from "./webcamEffects.shaders.js";

const greenscreenCanvas = document.createElement("canvas");
let gl;
let prog;
let texLoc;
let keyColorLoc;
let similarityLoc;
let smoothnessLoc;
let spillLoc;

export function drawWebcamEffectsShader({ sourceCanvas, params }) {
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

  // Draw the rectangle.
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

export function setupWebcamEffectsShader({ w, h }) {
  gl = greenscreenCanvas.getContext("webgl", { premultipliedAlpha: false });

  greenscreenCanvas.width = w;
  greenscreenCanvas.height = h;

  // prog
  prog = gl.createProgram();

  // vert shader
  const vs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vs, vert);
  gl.compileShader(vs);

  // frag shader
  const fs = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fs, frag);
  gl.compileShader(fs);
  if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(fs));
  }

  // connect everything up
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);

  // look up where the vertex data needs to go.
  var positionLocation = gl.getAttribLocation(prog, "a_position");
  var texcoordLocation = gl.getAttribLocation(prog, "a_texCoord");

  // Create a buffer to put three 2d clip space points in
  const positionBuffer = gl.createBuffer();

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Set a rectangle the same size as the image.
  setRectangle(gl, 0, 0, w, h);

  // provide texture coordinates for the rectangle.
  var texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0,
    ]),
    gl.STATIC_DRAW
  );

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.activeTexture(gl.TEXTURE0);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  // lookup uniforms
  var resolutionLocation = gl.getUniformLocation(prog, "u_resolution");

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Tell it to use our prog (pair of shaders)
  gl.useProgram(prog);

  // Turn on the position attribute
  gl.enableVertexAttribArray(positionLocation);

  // Bind the position buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 2; // 2 components per iteration
  var type = gl.FLOAT; // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0; // start at the beginning of the buffer
  gl.vertexAttribPointer(
    positionLocation,
    size,
    type,
    normalize,
    stride,
    offset
  );

  // Turn on the texcoord attribute
  gl.enableVertexAttribArray(texcoordLocation);

  // bind the texcoord buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

  // Tell the texcoord attribute how to get data out of texcoordBuffer (ARRAY_BUFFER)
  var size = 2; // 2 components per iteration
  var type = gl.FLOAT; // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0; // start at the beginning of the buffer
  gl.vertexAttribPointer(
    texcoordLocation,
    size,
    type,
    normalize,
    stride,
    offset
  );

  // set the resolution
  gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

  // set up param locations in shader
  keyColorLoc = gl.getUniformLocation(prog, "keyColor");
  similarityLoc = gl.getUniformLocation(prog, "similarity");
  smoothnessLoc = gl.getUniformLocation(prog, "smoothness");
  spillLoc = gl.getUniformLocation(prog, "spill");

  // Draw the rectangle.
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  return greenscreenCanvas;
}

function setRectangle(gl, x, y, width, height) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]),
    gl.STATIC_DRAW
  );
}
