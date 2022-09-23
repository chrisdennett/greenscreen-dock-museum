const video = document.querySelector("#videoElement");
let mediaStream;
let timeout = null;

// set up controls, webcam etc
export function setup(webcamRes) {
  document.addEventListener("dblclick", (e) => {
    e.preventDefault();
  });

  connectWebCamToVideo(webcamRes);
}

function connectWebCamToVideo(webcamRes) {
  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({
        video: { width: webcamRes.w, height: webcamRes.h },
      })
      .then(function (stream) {
        mediaStream = stream;
        video.srcObject = mediaStream;
      })
      .catch(function (error) {
        // reloadAfterMs();
      });
  }
}

export function reloadAfterMs(ms = 2000) {
  if (timeout) return;
  timeout = setTimeout(() => {
    window.location.reload();
  }, ms);
}
