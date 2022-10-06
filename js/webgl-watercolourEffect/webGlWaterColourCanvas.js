import { vert, frag } from "./webcamEffects.shaders.js";

const effectsCanvas = document.createElement("canvas");

export class webGlWaterColourCanvas {
  constructor({ w, h }) {
    this.gl;
    this.prog;
    this.texLoc;
    this.brightnessLoc;
    this.contrastLoc;
    this.sepiaLoc;
    this.vibranceLoc;
    this.blurLoc;
    this.useStaticValues;

    this.setup({ w, h });
  }

  setup({ w, h }) {
    this.gl = effectsCanvas.getContext("webgl", {
      premultipliedAlpha: false,
    });

    effectsCanvas.width = w;
    effectsCanvas.height = h;

    // prog
    this.prog = this.gl.createProgram();

    // vert shader
    const vs = this.gl.createShader(this.gl.VERTEX_SHADER);
    this.gl.shaderSource(vs, vert);
    this.gl.compileShader(vs);

    // frag shader
    const fs = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    this.gl.shaderSource(fs, frag);
    this.gl.compileShader(fs);
    if (!this.gl.getShaderParameter(fs, this.gl.COMPILE_STATUS)) {
      console.error(this.gl.getShaderInfoLog(fs));
    }

    // connect everything up
    this.gl.attachShader(this.prog, vs);
    this.gl.attachShader(this.prog, fs);
    this.gl.linkProgram(this.prog);

    // look up where the vertex data needs to go.
    var positionLocation = this.gl.getAttribLocation(this.prog, "a_position");
    var texcoordLocation = this.gl.getAttribLocation(this.prog, "a_texCoord");

    // Create a buffer to put three 2d clip space points in
    const positionBuffer = this.gl.createBuffer();

    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);

    // Set a rectangle the same size as the image.
    this.setRectangle(this.gl, 0, 0, w, h);

    // provide texture coordinates for the rectangle.
    var texcoordBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texcoordBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array([
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0,
      ]),
      this.gl.STATIC_DRAW
    );

    const texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_S,
      this.gl.CLAMP_TO_EDGE
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_T,
      this.gl.CLAMP_TO_EDGE
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MIN_FILTER,
      this.gl.LINEAR
    );

    // lookup uniforms
    var resolutionLocation = this.gl.getUniformLocation(
      this.prog,
      "u_resolution"
    );

    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

    // Clear the canvas
    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    // Tell it to use our this.prog (pair of shaders)
    this.gl.useProgram(this.prog);

    // Turn on the position attribute
    this.gl.enableVertexAttribArray(positionLocation);

    // Bind the position buffer.
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);

    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2; // 2 components per iteration
    var type = this.gl.FLOAT; // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0; // start at the beginning of the buffer
    this.gl.vertexAttribPointer(
      positionLocation,
      size,
      type,
      normalize,
      stride,
      offset
    );

    // Turn on the texcoord attribute
    this.gl.enableVertexAttribArray(texcoordLocation);

    // bind the texcoord buffer.
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texcoordBuffer);

    // Tell the texcoord attribute how to get data out of texcoordBuffer (ARRAY_BUFFER)
    var size = 2; // 2 components per iteration
    var type = this.gl.FLOAT; // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0; // start at the beginning of the buffer
    this.gl.vertexAttribPointer(
      texcoordLocation,
      size,
      type,
      normalize,
      stride,
      offset
    );

    // set the resolution
    this.gl.uniform2f(
      resolutionLocation,
      this.gl.canvas.width,
      this.gl.canvas.height
    );

    // set up param locations in shader
    this.brightnessLoc = this.gl.getUniformLocation(this.prog, "brightness");
    this.contrastLoc = this.gl.getUniformLocation(this.prog, "contrast");
    this.sepiaLoc = this.gl.getUniformLocation(this.prog, "sepia");
    this.vibranceLoc = this.gl.getUniformLocation(this.prog, "vibrance");
    this.blurLoc = this.gl.getUniformLocation(this.prog, "blur");
    this.useStaticValues = this.gl.getUniformLocation(
      this.prog,
      "useStaticValues"
    );

    // Draw the rectangle.
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
  }

  update({ sourceCanvas, params }) {
    if (!sourceCanvas) return;

    effectsCanvas.width = sourceCanvas.width;
    effectsCanvas.height = sourceCanvas.height;
    this.gl.viewport(0, 0, sourceCanvas.width, sourceCanvas.height);
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      sourceCanvas
    );
    this.gl.uniform1i(this.texLoc, 0);

    this.gl.uniform1f(this.brightnessLoc, params.brightness);
    this.gl.uniform1f(this.contrastLoc, params.contrast);
    this.gl.uniform1f(this.sepiaLoc, params.sepia);
    this.gl.uniform1f(this.vibranceLoc, params.vibrance);
    this.gl.uniform1f(this.blurLoc, params.blur);
    this.gl.uniform1i(this.useStaticValues, params.useStaticValues);

    // Draw the rectangle.
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

    return effectsCanvas;
  }

  setRectangle(gl, x, y, width, height) {
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
}
