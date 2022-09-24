const params = {
  cropLeft: 0.1,
  cropRight: 0.15,
  cropTop: 0.1,
  cropBottom: 0,
  left: 0.3,
  top: 0.3,
  size: 1,
  keyColor: "#15cb99",
  keySimilarity: 0.4,
  keySmoothness: 0.08,
  keySpill: 0.1,
  brightness: 0,
  contrast: 0,
  denoise: 100,
  hue: 0,
  saturation: 0,
  noise: 0,
  sepia: 0,
  unsharpRadius: 0,
  unsharpStrength: 0,
  vibrance: 0,
  vibranceStrength: 0,
  lensBlurRadius: 0,
  lensBlurBrightness: 1,
  lensBlurAngle: 0,
  triangleBlur: 0,
  edgeWork: 0,
  ink: 0,
};

// SET UP CONTROLS
export function setupControls() {
  // dat loaded in index.html script tag
  const gui = new dat.GUI();
  gui.useLocalStorage = true;
  gui.remember(params);

  const position = gui.addFolder("position");
  position.add(params, "cropLeft").min(0).max(1).step(0.001);
  position.add(params, "cropRight").min(0).max(1).step(0.001);
  position.add(params, "cropTop").min(0).max(1).step(0.001);
  position.add(params, "cropBottom").min(0).max(1).step(0.001);
  position.add(params, "left").min(0).max(1).step(0.001);
  position.add(params, "top").min(0).max(1).step(0.001);
  position.add(params, "size").min(0).max(1).step(0.001);

  const chromaKey = gui.addFolder("chromaKey");
  chromaKey.addColor(params, "keyColor");
  chromaKey.add(params, "keySimilarity").min(0).max(1).step(0.001);
  chromaKey.add(params, "keySmoothness").min(0).max(1).step(0.001);
  chromaKey.add(params, "keySpill").min(0).max(1).step(0.001);

  const filters = gui.addFolder("filters");
  filters.add(params, "brightness").min(-1).max(1).step(0.001);
  filters.add(params, "contrast").min(-1).max(1).step(0.001);
  filters.add(params, "denoise").min(0).max(100).step(1);
  filters.add(params, "hue").min(-1).max(1).step(0.001);
  filters.add(params, "saturation").min(-1).max(1).step(0.001);
  filters.add(params, "noise").min(0).max(1).step(0.001);
  filters.add(params, "sepia").min(0).max(1).step(0.001);
  filters.add(params, "unsharpRadius").min(0).max(100).step(1);
  filters.add(params, "unsharpStrength").min(0).max(100).step(1);
  filters.add(params, "vibrance").min(-1).max(1).step(0.001);
  filters.add(params, "lensBlurRadius").min(0).max(50).step(1);
  filters.add(params, "lensBlurBrightness").min(-1).max(1).step(0.001);
  filters.add(params, "lensBlurAngle").min(0).max(3.1416).step(0.001);
  filters.add(params, "triangleBlur").min(0).max(200).step(1);
  filters.add(params, "edgeWork").min(0).max(200).step(1);
  filters.add(params, "ink").min(0).max(1).step(0.001);

  // starting folder state
  position.closed = false;
  chromaKey.closed = true;
  filters.closed = true;

  return params;
}
