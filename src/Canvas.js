import { useEffect } from "react";

export default function Div() {
  useEffect(() => {
    main();
  });
  return (
    <div>
      <canvas id="canvas"></canvas>
    </div>
  );
}

class Ball {
  outer = {
    x: 100,
    y: 100,
    r: 30,
    // color: null,
  };
  inner = {
    x: null,
    y: null,
    r: null,
    color: {
      r: null,
      g: null,
      b: null,
    },
  };

  step = 5;

  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.inner.color.r = Math.floor(Math.random() * 200);
    this.inner.color.g = Math.floor(Math.random() * 200);
    this.inner.color.b = Math.floor(Math.random() * 200);
  }
  animate = () => {
    this.clear();
    this.move();
    this.render();

    requestAnimationFrame(this.animate);
  };

  render() {
    const { canvas, outer, ctx } = this;
    const circle = new Path2D();
    circle.arc(outer.x, outer.y, outer.r, 0, Math.PI * 2);
    this.setGradientPosition();
    ctx.fillStyle = this.getGradientColor();
    ctx.fill(circle);
  }
  setGradientPosition = () => {
    const { outer, inner } = this;
    inner.x = outer.x + outer.r / 2;
    inner.y = outer.y - outer.r / 2;
    inner.r = outer.r / 10;
  };
  getGradientColor = () => {
    const { outer, inner, ctx } = this;
    const { r, g, b } = inner.color;
    const gradient = ctx.createRadialGradient(
      outer.x,
      outer.y,
      outer.r,
      inner.x,
      inner.y,
      inner.r
    );
    gradient.addColorStop(0, `rgb(${r / 2},${g / 2},${b / 2})`);
    gradient.addColorStop(0.1, `rgb(${r / 1.9},${g / 1.9},${b / 1.9})`);
    gradient.addColorStop(1, `rgb(${r},${g},${b})`);

    return gradient;
  };
  move = () => {
    const { canvas, outer, step } = this;
    outer.x += step;
    outer.y *= 1.02;
    if (outer.x >= canvas.width + outer.r) {
      outer.x = -outer.r;
      outer.y = 100;
    }
  };
  clear = () => {
    const { canvas, ctx } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
}

const main = () => {
  let width = window.innerWidth - 15;
  let height = window.innerHeight - 20;
  const canvas = document.getElementById("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const ball = new Ball(canvas, ctx);

  ball.animate();
};
