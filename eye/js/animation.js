'use strict';
const pupil = document.querySelector('.big-book__pupil');

function eyePosition() {
  const c = pupil.getBoundingClientRect();
  const y = Math.round(c.top + (c.bottom - c.top) / 2);
  const x = Math.round(c.left + (c.right - c.left) / 2);

  return {x: x ,y: y};
}

let eyePos = eyePosition();

document.addEventListener('mousemove', (event) => {
  eyePos = eyePosition();
  const sizePupil = (new Calculation(eyePos.x, eyePos.y, event.clientX, event.clientY)).sizePupil;
  pupil.style.setProperty('--pupil-size', sizePupil);
  const offset = (new Calculation(eyePos.x, eyePos.y, event.clientX, event.clientY)).offsetPupil;
  pupil.style.setProperty('--pupil-x', `${offset.dx}px`);
  pupil.style.setProperty('--pupil-y', `${offset.dy}px`);
});



class Calculation {
  constructor(xEye, yEye, x, y) {
    this.xEye = xEye;
    this.yEye = yEye;
    this.x = x;
    this.y = y;
    this.dx = 0;
    this.dy = 0;
    this.crossBrowser();
  }

  crossBrowser() {

    if (this.xEye === this.x) {
      this.dx = this.xEye;
      this.dy = this.yEye >= this.y ? 0 : document.documentElement.clientHeight;
    } else if (this.yEye === this.y) {
      this.dy = this.yEye;
      this.dx = this.xEye >= this.x ? 0 : document.documentElement.clientWidth;
    } else {
      let crossPoint;

      if (this.yEye >= this.y) {
        crossPoint = this.crossLine(0, 0, 1, 0);
      } else if (this.yEye < this.y) {
        crossPoint = this.crossLine(0, document.documentElement.clientHeight, 1, document.documentElement.clientHeight);
      }

      if (crossPoint.dx < 0) {
        crossPoint = this.crossLine(0, 0, 0, 1);
      } else  if (crossPoint.dx > document.documentElement.clientWidth) {
        crossPoint = this.crossLine(document.documentElement.clientWidth, 0, document.documentElement.clientWidth, 1);
      }

      this.dx = crossPoint.dx;
      this.dy = crossPoint.dy;
    }
  }

  //Ax + By + C = 0
  //A = y1 - y2
  //B = x2 - x1
  //C = x1y2 - x2y1
  //x = -(C1B2 - C2B1) / (A1B2 - A2B1)
  //y = -(A1C2 - A2C1) / (A1B2 - A2B1)
  crossLine(x11, y11, x21, y21) {
    const x1 = this.x;
    const y1 = this.y;
    const x2 = this.xEye;
    const y2 = this.yEye;
    const A1 = y1 - y2;
    const B1 = x2 - x1;
    const C1 = x1 * y2 - x2 * y1;
    const A2 = y11 - y21;
    const B2 = x21 - x11;
    const C2 = x11 * y21 - x21 * y11;
    const dx = -(C1 * B2 - C2 * B1) / (A1 * B2 - A2 * B1);
    const dy = -(A1 * C2 - A2 * C1) / (A1 * B2 - A2 * B1);
    return {dx: dx, dy: dy};
  }

  get sizePupil() {
    const eyeLineLength = Math.abs(Math.sqrt(Math.pow(this.yEye - this.dy, 2) + Math.pow(this.xEye - this.dx, 2)));
    const currentLineLength = Math.abs(Math.sqrt(Math.pow(this.y - this.dy, 2) + Math.pow(this.x - this.dx, 2)));

    return 1 + (currentLineLength > eyeLineLength ? eyeLineLength / currentLineLength * 2 : currentLineLength / eyeLineLength * 2);
  }

  get offsetPupil() {
    let dx = 0;
    let dy = 0;

    if (this.dx !== this.xEye) {

      if (this.x < this.xEye) {
        dx = (this.x - this.xEye) / this.xEye * 30;
      } else {
        dx = (this.x - this.xEye) / (document.documentElement.clientWidth - this.xEye) * 30;
      }
    }

    if (this.dy !== this.yEye) {

      if (this.y < this.yEye) {
        dy = (this.y - this.yEye) / this.yEye * 30;
      } else {
        dy = (this.y - this.yEye) / (document.documentElement.clientHeight - this.yEye) * 30;
      }

    }

    return {dx: dx, dy: dy};
  }
}
