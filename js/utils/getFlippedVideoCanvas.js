export function getFlippedVideoCanvas({ video, canvas, w, h, flipX, flipY }) {
  const frameCanvas = document.createElement("canvas");
  frameCanvas.width = w;
  frameCanvas.height = h;
  const frameCtx = frameCanvas.getContext("2d");

  const scaleX = flipX ? -1 : 1;
  const scaleY = flipY ? -1 : 1;
  const translateX = flipX ? frameCanvas.width : 0;
  const translateY = flipY ? frameCanvas.height : 0;

  frameCtx.translate(translateX, translateY);
  frameCtx.scale(scaleX, scaleY);

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

  frameCtx.drawImage(src, 0, 0, srcW, srcH, 0, 0, w, h);

  return frameCanvas;
}
