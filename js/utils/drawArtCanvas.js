const artCanvas = document.querySelector("#artCanvas");
const artCtx = artCanvas.getContext("2d");

export function drawArtCanvas({ sourceCanvas, params, img }) {
  if (!sourceCanvas) return null;

  artCanvas.width = 1280;
  artCanvas.height = 720;

  const outLeft = params.left * artCanvas.width;
  const outTop = params.top * artCanvas.height;

  // draw image
  artCtx.drawImage(
    img,
    0,
    0,
    img.width,
    img.height,
    0,
    0,
    artCanvas.width,
    artCanvas.height
  );

  // draw webcam image
  artCtx.save();
  artCtx.globalAlpha = 0.8;

  artCtx.drawImage(sourceCanvas, outLeft, outTop);
}
