import { draw } from "./app.js";
import { setup } from "./setupWebcam.js";

let stats;
const controls = document.querySelector("#controls");

// const webcamRes = { w: 320, h: 240 };
const webcamRes = { w: 800, h: 600 };
const params = {
  cols: 72,
  rows: 8,
  gridSize: 0.6000000000000001,
  xOffset: 0.258,
  yOffset: 0.247,
  freq: 0.002,
  amp: 90,
  animSpeed: -10,
  bgColour: "#000000",
  colourRange: "portland",
  colourAlpha: 1,
};

addFps();
setupControls();
setup(webcamRes);
doDraw();

function doDraw() {
  if (stats) stats.begin();
  draw({ webcamRes });
  if (stats) stats.end();

  window.requestAnimationFrame(doDraw);
}

function addFps() {
  if (Stats) {
    stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);
  }
}

// SET UP CONTROLS
function setupControls() {
  const gui = new dat.GUI();
  gui.useLocalStorage = true;
  gui.remember(params);
  // general layout, positions etc
  const layout = gui.addFolder("layout");
  layout.add(params, "cols").min(2).max(100).step(1).onChange(updateThing);
  layout.add(params, "rows").min(2).max(100).step(1).onChange(updateThing);

  // starting folder state
  layout.closed = false;
}

function updateThing(value) {
  console.log("value: ", value);
}
