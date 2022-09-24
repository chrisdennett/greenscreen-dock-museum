import { draw } from "./app.js";
import { setupControls } from "./controls.js";
import { setup } from "./setupWebcam.js";

let stats;

// const webcamRes = { w: 320, h: 240 };
const webcamRes = { w: 800, h: 600 };

const img1 = await loadImage("/img/AlbumPainting_01.jpg");
addFps();
const params = setupControls();
setup(webcamRes);
doDraw();

function doDraw() {
  if (stats) stats.begin();
  draw({ webcamRes, params, img1 });
  if (stats) stats.end();

  window.requestAnimationFrame(doDraw);
}

function addFps() {
  // stats loaded in index.html script tag
  stats = new Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);
}

async function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject();
    img.src = url;
  });
}

/*
{
  "preset": "watercolour-2",
  "closed": false,
  "folders": {
    "position": {
      "preset": "Default",
      "closed": false,
      "folders": {}
    },
    "chromaKey": {
      "preset": "Default",
      "closed": true,
      "folders": {}
    },
    "filters": {
      "preset": "Default",
      "closed": true,
      "folders": {}
    }
  },
  "remembered": {
    "Default": {
      "0": {
        "cropLeft": 0.115,
        "cropRight": 0.115,
        "cropTop": 0.038,
        "cropBottom": 0.049,
        "left": 0.269,
        "top": 0.225,
        "size": 0.258,
        "keyColor": "#55ba18",
        "keySimilarity": 0,
        "keySmoothness": 0.23600000000000002,
        "keySpill": 0.203,
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
        "cropLeft": 0,
        "cropRight": 0,
        "cropTop": 0,
        "cropBottom": 0,
        "left": 0.49,
        "top": 0.501,
        "size": 0.126,
        "keyColor": "#15cb99",
        "keySimilarity": 0.23600000000000002,
        "keySmoothness": 0.08,
        "keySpill": 0.1,
        "brightness": 0,
        "contrast": 0,
        "denoise": 100,
        "hue": 0,
        "saturation": 0,
        "noise": 0.148,
        "sepia": 0,
        "unsharpRadius": 0,
        "unsharpStrength": 0,
        "vibrance": 0,
        "lensBlurRadius": 1,
        "lensBlurBrightness": 1,
        "lensBlurAngle": 0.464,
        "triangleBlur": 0,
        "edgeWork": 0,
        "ink": 0.10400000000000001
      }
    }
  }
}
*/
