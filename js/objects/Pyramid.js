let setup = 0;

export class Pyramid {
  constructor({ centerPt, allPts, ptsAcross }) {
    this.centerPt = centerPt;
    this.leftPt = null;
    this.rightPt = null;
    this.topPt = null;
    this.bottomPt = null;

    const leftPtIndex = this.centerPt.index - 2;
    const rightPtIndex = this.centerPt.index + 2;
    const topPtIndex = this.centerPt.index - (ptsAcross + 1) * 2;
    const bottomPtIndex = this.centerPt.index + (ptsAcross + 1) * 2;

    this.bottomRightColourIndex = centerPt.blockIndex;
    this.bottomLeftColourIndex = centerPt.blockIndex - 1;
    this.topRightColourIndex = centerPt.blockIndex - (ptsAcross + 1) + 1;
    this.topLeftColourIndex = centerPt.blockIndex - (ptsAcross + 1);

    if (allPts[leftPtIndex]) {
      this.leftPt = allPts[leftPtIndex];
    }

    if (allPts[rightPtIndex]) {
      this.rightPt = allPts[rightPtIndex];
    }

    if (allPts[topPtIndex]) {
      this.topPt = allPts[topPtIndex];
    }

    if (allPts[bottomPtIndex]) {
      this.bottomPt = allPts[bottomPtIndex];
    }
  }

  // SVG
  addSvgTriangles(artSvgGroup, artSvgShadowOverlay) {
    this.topLeftSvgTriangle = this.addSvgTriangle({
      artSvgGroup,
      artSvgShadowOverlay,
      pos: "topLeft",
    });
    this.topRightSvgTriangle = this.addSvgTriangle({
      artSvgGroup,
      artSvgShadowOverlay,
      pos: "topRight",
    });
    this.bottomLeftSvgTriangle = this.addSvgTriangle({
      artSvgGroup,
      artSvgShadowOverlay,
      pos: "bottomLeft",
    });
    this.bottomRightSvgTriangle = this.addSvgTriangle({
      artSvgGroup,
      artSvgShadowOverlay,
      pos: "bottomRight",
    });
  }

  addSvgTriangle({ artSvgGroup, artSvgShadowOverlay, pos }) {
    if (this.centerPt.isOnTopEdge && pos === "topLeft") return null;
    if (this.centerPt.isOnLeftEdge && pos === "topLeft") return null;

    if (this.centerPt.isOnTopEdge && pos === "topRight") return null;
    if (this.centerPt.isOnRightEdge && pos === "topRight") return null;

    if (this.centerPt.isOnLeftEdge && pos === "bottomLeft") return null;
    if (this.centerPt.isOnRightEdge && pos === "bottomRight") return null;

    if (this.centerPt.isOnBottomEdge && pos === "bottomLeft") return null;
    if (this.centerPt.isOnBottomEdge && pos === "bottomRight") return null;

    const triangle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polygon"
    );

    let polyPoints, overlayGradient;

    if (pos === "topLeft") {
      polyPoints = `
        ${this.centerPt.x},${this.centerPt.y} 
        ${this.leftPt.x},${this.leftPt.y}
        ${this.topPt.x},${this.topPt.y}
        `;
      overlayGradient = "#topLeftGradient";
    } else if (pos === "topRight") {
      polyPoints = `
      ${this.centerPt.x},${this.centerPt.y} 
      ${this.topPt.x},${this.topPt.y}
      ${this.rightPt.x},${this.rightPt.y}
      `;
      overlayGradient = "#topRightGradient";
    } else if (pos === "bottomLeft") {
      polyPoints = `
          ${this.centerPt.x},${this.centerPt.y} 
          ${this.leftPt.x},${this.leftPt.y}
          ${this.bottomPt.x},${this.bottomPt.y}
          `;
      overlayGradient = "#bottomLeftGradient";
    } else if (pos === "bottomRight") {
      polyPoints = `
          ${this.centerPt.x},${this.centerPt.y} 
          ${this.bottomPt.x},${this.bottomPt.y}
          ${this.rightPt.x},${this.rightPt.y}
          `;
      overlayGradient = "#bottomRightGradient";
    }

    triangle.setAttribute("points", polyPoints);
    artSvgGroup.appendChild(triangle);

    if (overlayGradient) {
      const overlay = triangle.cloneNode();
      overlay.style.fill = `url(${overlayGradient})`;
      // overlay.style.fill = `rgb(${Math.random() * 255}, 0, 0)`;

      artSvgShadowOverlay.appendChild(overlay);
    }

    return triangle;
  }

  fillSvgTriangles(blockColours, settings) {
    this.fillTriangle({
      triangle: this.topLeftSvgTriangle,
      rgb: blockColours[this.topLeftColourIndex],
      settings,
    });

    this.fillTriangle({
      triangle: this.topRightSvgTriangle,
      rgb: blockColours[this.topRightColourIndex],
      settings,
    });

    this.fillTriangle({
      triangle: this.bottomLeftSvgTriangle,
      rgb: blockColours[this.bottomLeftColourIndex],
      settings,
    });

    // BOTTOM RIGHT
    this.fillTriangle({
      triangle: this.bottomRightSvgTriangle,
      // rgb: { r: "255", g: "0", b: "0" },
      rgb: blockColours[this.bottomRightColourIndex],
      settings,
    });
  }

  fillTriangle({ triangle, rgb, settings }) {
    if (!triangle) return;

    const { fillType } = settings;

    const fill = this.getFillColour(fillType, rgb);
    triangle.style.fill = "white";
    triangle.style.fill = fill;
  }

  getFillColour(fillType, rgb) {
    let fill;

    if (fillType === "colour") {
      fill = getColour(rgb);
    } else if (fillType === "b&w") {
      fill = getBlackOrWhite(rgb);
    } else if (fillType === "greyscale") {
      fill = getGrey(rgb);
    } else if (fillType === "posterised") {
      fill = getPosterisedColour(rgb);
    }

    return fill;
  }

  // CANVAS
  drawAllTriangles(ctx, blockColours, settings) {
    const { showStroke, fillType, strokeColour, strokeWidth } = settings;
    const triProps = { fillType, showStroke, ctx };

    ctx.strokeStyle = strokeColour;
    ctx.lineWidth = strokeWidth;

    // TOP LEFT
    this.drawTriangle({
      ...triProps,
      pos: "topLeft",
      rgb: blockColours[this.topLeftColourIndex],
    });
    // TOP RIGHT
    this.drawTriangle({
      ...triProps,
      pos: "topRight",
      rgb: blockColours[this.topRightColourIndex],
    });
    // BOTTOM LEFT
    this.drawTriangle({
      ...triProps,
      pos: "bottomLeft",
      rgb: blockColours[this.bottomLeftColourIndex],
    });
    // BOTTOM RIGHT
    this.drawTriangle({
      ...triProps,
      pos: "bottomRight",
      rgb: blockColours[this.bottomRightColourIndex],
    });
  }

  drawTriangle({ ctx, pos, rgb, showStroke, fillType }) {
    let pt1, pt2, pt3;
    pt1 = this.centerPt;

    if (pos === "topLeft") {
      if (pt1.isOnLeftEdge) return;
      pt2 = this.leftPt;
      pt3 = this.topPt;
    } else if (pos === "topRight") {
      if (pt1.isOnRightEdge) return;
      pt2 = this.rightPt;
      pt3 = this.topPt;
    } else if (pos === "bottomLeft") {
      if (pt1.isOnLeftEdge) return;
      pt2 = this.leftPt;
      pt3 = this.bottomPt;
    } else if (pos === "bottomRight") {
      if (pt1.isOnRightEdge) return;
      pt2 = this.rightPt;
      pt3 = this.bottomPt;
    }

    if (!pt1 || !pt2 || !pt3) return;

    ctx.fillStyle = this.getFillColour(fillType, rgb);
    ctx.beginPath();
    ctx.moveTo(pt1.x, pt1.y);
    ctx.lineTo(pt2.x, pt2.y);
    ctx.lineTo(pt3.x, pt3.y);
    ctx.closePath();
    ctx.fill();

    if (showStroke) {
      ctx.stroke();
    }
  }

  drawPoints(ctx) {
    this.centerPt.draw(ctx, "red");

    if (this.leftPt) {
      this.leftPt.draw(ctx, "yellow");
    }

    if (this.rightPt) {
      this.rightPt.draw(ctx, "magenta");
    }

    if (this.topPt) {
      this.topPt.draw(ctx, "blue");
    }

    if (this.bottomPt) {
      this.bottomPt.draw(ctx, "green");
    }
  }
}

function getBlackOrWhite(rgb) {
  const grey = (rgb.r + rgb.g + rgb.b) / 3;
  return grey > 127 ? "rgb(255,255,255)" : "rgb(0,0,0)";
}

function getGrey(rgb) {
  const grey = (rgb.r + rgb.g + rgb.b) / 3;
  return `rgb(${grey},${grey},${grey})`;
}

function getColour(rgb) {
  // if (!rgb || !rgb.r || !rgb.g || !rgb.b) return "red";
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

function getPosterisedColour(rgb) {
  const { h, l } = rgbToHsl(rgb);

  // full saturation
  // let s2 = 0.75;

  // if lightness below threshold, make it black
  // if it's higher than a threshold make it white
  // otherwise set it in the middle
  let l2 = l;

  const lowerThreshold = 0.34;
  const upperThreshold = 0.58;
  //
  if (l < lowerThreshold) {
    l2 = 0;
  } else if (l > upperThreshold) {
    l2 = 1;
  } else {
    l2 = 0.5;
  }

  let threshH = getQuantisedValue(h, 12);
  return `hsl(${threshH * 360}deg, ${100}%, ${l2 * 100}%)`;
}

function rgbToHsl(rgb) {
  const _r = rgb.r / 255;
  const _g = rgb.g / 255;
  const _b = rgb.b / 255;

  const max = Math.max(_r, _g, _b);
  const min = Math.min(_r, _g, _b);

  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case _r:
        h = (_g - _b) / d + (_g < _b ? 6 : 0);
        break;
      case _g:
        h = (_b - _r) / d + 2;
        break;
      case _b:
        h = (_r - _g) / d + 4;
        break;
      default:
        break;
    }

    h /= 6;
  }

  return { h, s, l };
}

const getQuantisedValue = (value, totalBands) => {
  const bandSize = 1 / totalBands;

  for (let i = totalBands - 1; i > 0; i--) {
    if (value > i * bandSize) {
      return i * bandSize;
    }
  }

  return 0;
};
