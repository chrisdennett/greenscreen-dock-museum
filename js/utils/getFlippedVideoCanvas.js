export function getFlippedVideoCanvas({
  video,
  canvas,
  crop,
  scale,
  flipX,
  flipY,
}) {
  // show central panel of video
  let src, srcW, srcH;

  if (video) {
    src = video;
    srcW = video.videoWidth;
    srcH = video.videoHeight;
  } else {
    src = canvas;
    srcW = canvas.width;
    srcH = canvas.height;
  }

  if (!src || !srcW || !srcH) return;

  const leftCrop = crop.left * srcW;
  const rightCrop = crop.right * srcW;
  const topCrop = crop.top * srcH;
  const bottomCrop = crop.bottom * srcH;

  const inW = srcW - (leftCrop + rightCrop);
  const inH = srcH - (topCrop + bottomCrop);

  if (inW < 1 || inH < 1) {
    console.log("CROPPED TO BELOW ZERO H or W");
    return;
  }

  const outW = inW * scale;
  const outH = inH * scale;

  if (outW < 1 || outH < 1) {
    console.log("SCALED BELOW ZERO H or W");
    return;
  }

  const frameCanvas = document.createElement("canvas");
  frameCanvas.width = outW;
  frameCanvas.height = outH;
  const frameCtx = frameCanvas.getContext("2d");

  const scaleX = flipX ? -1 : 1;
  const scaleY = flipY ? -1 : 1;
  const translateX = flipX ? frameCanvas.width : 0;
  const translateY = flipY ? frameCanvas.height : 0;

  frameCtx.translate(translateX, translateY);
  frameCtx.scale(scaleX, scaleY);

  frameCtx.drawImage(src, leftCrop, topCrop, inW, inH, 0, 0, outW, outH);

  return frameCanvas;
}
