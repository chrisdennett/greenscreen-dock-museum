export function drawGlFxCanvas({ sourceCanvas, params, glfxCanvas }) {
  if (!sourceCanvas) return;

  //   if (!glfxCanvas) {
  //     // fx loaded in index.html script tag
  //     glfxCanvas = fx.canvas();
  //   }

  if (glfxCanvas && sourceCanvas) {
    let texture = glfxCanvas.texture(sourceCanvas);
    let gc = glfxCanvas.draw(texture);
    gc.sepia(params.sepia);

    // gc.lensBlur(
    //   params.lensBlurRadius,
    //   params.lensBlurBrightness,
    //   params.lensBlurAngle
    // );
    // gc.triangleBlur(params.triangleBlur);
    gc.brightnessContrast(params.brightness, params.contrast);
    gc.denoise(params.denoise);
    // gc.hueSaturation(params.hue, params.saturation);
    // gc.unsharpMask(params.unsharpRadius, params.unsharpStrength);
    gc.vibrance(params.vibrance);
    gc.ink(params.ink);

    // if (params.edgeWork > 0) {
    //   gc.edgeWork(params.edgeWork);
    // }

    gc.noise(params.noise);

    gc.update();
  }
}
