import { draw } from "./app.js";
import { setup } from "./setupWebcam.js";

let stats;

// const webcamRes = { w: 320, h: 240 };
const webcamRes = { w: 800, h: 600 };

const params = {
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
const initParams = { ...params };

addFps();
setupControls();
setup(webcamRes);
doDraw();

function doDraw() {
  if (stats) stats.begin();
  draw({ webcamRes, params, initParams });
  if (stats) stats.end();

  window.requestAnimationFrame(doDraw);
}

function addFps() {
  // stats loaded in index.html script tag
  stats = new Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);
}

// SET UP CONTROLS
function setupControls() {
  // dat loaded in index.html script tag
  const gui = new dat.GUI();
  gui.useLocalStorage = true;
  gui.remember(params);
  // general filters, positions etc
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
  filters.closed = false;
}

/*
{
  "preset": "watercolour-2",
  "closed": false,
  "folders": {
    "filters": {
      "preset": "Default",
      "closed": false,
      "folders": {}
    }
  },
  "remembered": {
    "Default": {
      "0": {
        "brightness": 0,
        "contrast": 0,
        "denoise": 100,
        "hue": 0,
        "saturation": 0,
        "noise": 0,
        "sepia": 0,
        "unsharpRadius": 0,
        "unsharpStrength": 0,
        "vibrance": 0,
        "lensBlurRadius": 0,
        "lensBlurBrightness": 0,
        "lensBlurAngle": 0,
        "triangleBlur": 0,
        "edgeWork": 0,
        "ink": 0
      }
    },
    "watercolour-1": {
      "0": {
        "brightness": 0.266,
        "contrast": 0.112,
        "denoise": 0,
        "hue": -0.109,
        "saturation": -0.263,
        "noise": 0.016,
        "sepia": 0.225,
        "unsharpRadius": 23,
        "unsharpStrength": 15,
        "vibrance": -1,
        "lensBlurRadius": 0,
        "lensBlurBrightness": -0.418,
        "lensBlurAngle": 0.742,
        "triangleBlur": 0,
        "edgeWork": 0,
        "ink": 0
      }
    },
    "watercolour-2": {
      "0": {
        "brightness": 0.31,
        "contrast": 0.266,
        "denoise": 36,
        "hue": 0,
        "saturation": 0,
        "noise": 0.17,
        "sepia": 0.402,
        "unsharpRadius": 0,
        "unsharpStrength": 0,
        "vibrance": 1,
        "lensBlurRadius": 2,
        "lensBlurBrightness": -0.418,
        "lensBlurAngle": 0.742,
        "triangleBlur": 0,
        "edgeWork": 0,
        "ink": 0.622
      }
    }
  }
}

*/
