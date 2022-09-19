export function getFlippedVideoCanvas({ video, w, h, flipX, flipY }) {
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
  const { videoWidth: vidW, videoHeight: vidH } = video;

  // const xOffset = (vidW - w) / 2;

  frameCtx.drawImage(video, 0, 0, vidW, vidH, 0, 0, w, h);

  return frameCanvas;
}
