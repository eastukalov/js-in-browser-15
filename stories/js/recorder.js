'use strict';

if (navigator.mediaDevices === undefined) {
  navigator.mediaDevices = {};
}

if (navigator.mediaDevices.getUserMedia === undefined) {
  navigator.mediaDevices.getUserMedia = function (constraints) {
    var getUserMedia = navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia;

    if (!getUserMedia) {
      return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
    }
    return new Promise((resolve, reject) => {
      getUserMedia.call(navigator, constraints, resolve, reject);
    });
  }
}

function createThumbnail(video) {
  return new Promise((done, fail) => {
    const preview = document.createElement('video');
    preview.src = URL.createObjectURL(video);
    preview.addEventListener('loadeddata', () => preview.currentTime = 2);
    preview.addEventListener('seeked', () => {
      const snapshot = document.createElement('canvas');
      const context = snapshot.getContext('2d');
      snapshot.width = preview.videoWidth;
      snapshot.height = preview.videoHeight;
      context.drawImage(preview, 0, 0);
      snapshot.toBlob(done);
    });
  });
}

function record(app) {
  return new Promise((done, fail) => {
    app.mode = 'preparing';

    window.navigator.mediaDevices
      .getUserMedia({video: true, audio: false})
      .then(stream => {
        app.mode = 'recording';
        app.preview.srcObject = stream;

        setTimeout(() => {
          let recorded;
          let rec = new MediaRecorder(stream);
          let chunks = [];
          rec.addEventListener('dataavailable', e => chunks.push(e.data));
          rec.addEventListener('stop', e => {
            recorded = new Blob(chunks, {'type': rec.mimeTypes});
            chunks = null;
            rec = stream = null;

            createThumbnail(recorded)
              .then(picture => {
                done({video: recorded, frame: picture});
              })
              .catch (e => {
                fail(e.message);
              });
          });

          rec.start();

          setTimeout(() => {
            rec.stop();
            app.preview.srcObject = null;
            stream.getTracks().forEach(track => track.stop());
          }, app.limit);

        }, 1000);

      })
      .catch(err => {
        fail('Вы не предоставили доступ к веб-камере');
      });
  });
}
