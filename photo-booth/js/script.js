'use strict';
const errorNod = document.getElementById('error-message');
const video = document.createElement('video');
video.setAttribute('autoplay', '');
const audio = document.createElement('audio');
audio.src = './audio/click.mp3';
const app = document.querySelector('.app');
const controls = app.querySelector('.controls');
const takePhoto = document.getElementById('take-photo');
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
const list = document.querySelector('.list');

let getUserMedia = navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia;

if (!getUserMedia) {
  errorNod.textContent = 'Вы используете броузер без поддержки Media Capture API';
  errorNod.classList.add('visible');
} else {
  window.navigator.mediaDevices
    .getUserMedia({video: true, audio: false})
    .then(stream => {

      app.insertBefore(video, app.querySelector('.controls'));
      controls.appendChild(audio);
      video.src = URL.createObjectURL(stream);
      // video.src = stream.toBlob();
      controls.classList.add('visible');
    })
    .catch(err => {
      errorNod.textContent = 'Вы не предоставили доступ к веб-камере';
      errorNod.classList.add('visible');
    });
}

takePhoto.addEventListener('click', event => {
  event.preventDefault();
  audio.play();
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);
  const picture = canvas.toDataURL();
  const frag = createNode(pictureNode(picture));
  list.insertBefore(frag, list.firstElementChild);
  for (const el of frag.querySelectorAll('figcaption a')) {
    if (el.textContent === 'file_download') {
      el.addEventListener('click', event => {
        event.currentTarget.style.display = 'none';
      });
    } else if (el.textContent === 'file_upload') {
      el.addEventListener('click', uploadPicture);
    } else {
      el.addEventListener('click', deletePicture);
    }
  }
});

function pictureNode(picture) {
  return {
    tag: 'figure',
    content: [
      {
        tag: 'img',
        attrs: {
          src: picture
        }
      },
      {
        tag: 'figcaption',
        content: [
          {
            tag: 'a',
            attrs: {
              'href': picture,
              'download': 'snapshot.png'
            },
            content: {
              tag: 'i',
              cls: 'material-icons',
              content: 'file_download'
            }
          },
          {
            tag: 'a',
            content: {
              tag: 'i',
              cls: 'material-icons',
              content: 'file_upload'
            }
          },
          {
            tag: 'a',
            content: {
              tag: 'i',
              cls: 'material-icons',
              content: 'delete'
            }
          }
        ]
      }
    ]
  }
}

function createNode(node) {

  if ((typeof node === 'string') || (typeof node === 'number')) {
    return addBr(node);
  }

  if (Array.isArray(node)) {
    return node.reduce((f, item) => {
      f.appendChild(createNode(item));
      return f;
    }, document.createDocumentFragment());
  }

  const el = document.createElement(node.tag);

  if (node.cls) {
    el.className = node.cls;
  }

  if (node.content) {
    el.appendChild(createNode(node.content));
  }

  if (node.attrs) {
    Object.keys(node.attrs).forEach((key) => {
      el.setAttribute(key, node.attrs[key]);
    });
  }

  if (node.style) {
    Object.keys(node.style).forEach((key) => {
      el.style[key] = node.style[key];
    });
  }

  return el;
}

function addBr(text) {

  return text.toString().split('\n').reduce((f, item, key, array) => {
    f.appendChild(document.createTextNode(item));

    if ((array.length - 1) > key) {
      f.appendChild(document.createElement('br'));
    }
    return f;
  }, document.createDocumentFragment());

}

function uploadPicture(event) {
  event.preventDefault();
  const con = new XMLHttpRequest();
  con.open('POST', 'https://neto-api.herokuapp.com/photo-booth');
  const formData = new FormData();
  formData.append('image', dataURItoBlob(event.currentTarget.parentNode.parentNode.querySelector('img').src));
  con.addEventListener('load', event => {
    console.log(event.currentTarget.responseText);
  });
  con.send(formData);
  event.currentTarget.style.display = 'none';
}

function deletePicture(event) {
  event.preventDefault();
  list.removeChild(event.currentTarget.parentNode.parentNode);
}

function dataURItoBlob(dataUrl) {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while(n--){
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], {type:mime});
}