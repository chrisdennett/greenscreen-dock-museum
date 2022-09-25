const artCanvas = document.querySelector("#artCanvas");
const artCtx = artCanvas.getContext("2d");

const ghostCanvas = document.createElement("canvas");
const ghostCtx = ghostCanvas.getContext("2d");

/*

Draw ghosting verstion
- draw ghostCanvas to the art canvas
- draw current frame to art canvas
- wipe the ghostCanvas
- set alpha to 0.2 or some such on ghost canvas
- draw art canvas to ghost canvas
-
- repeat.

*/

export function drawArtCanvas({ sourceCanvas, params, w, h, img }) {
  if (!sourceCanvas) return null;

  if (artCanvas.width !== w) {
    artCanvas.width = w;
    artCanvas.height = h;
    ghostCanvas.width = w;
    ghostCanvas.height = h;
  }

  artCanvas.width = w;
  artCanvas.height = h;

  const outLeft = params.left * artCanvas.width;
  const outTop = params.top * artCanvas.height;

  artCtx.drawImage(ghostCanvas, 0, 0);
  artCtx.drawImage(sourceCanvas, outLeft, outTop);

  ghostCtx.save();
  ghostCtx.drawImage(artCanvas, 0, 0);
  ghostCtx.globalAlpha = 0.03;
  // ghostCtx.globalCompositeOperation = "destination-in";
  ghostCtx.drawImage(img, 0, 0, img.width, img.height, 0, 0, w, h);
  ghostCtx.restore();
}
