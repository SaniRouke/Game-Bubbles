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
    x: -100,
    y: 100,
    r: 30,
  };
  inner = {
    x: null,
    y: null,
    r: null,
  };

  step = 5;
  color1 = "grey";
  color2 = "yellow";

  constructor(canvas, ctx) {
    const { outer, inner } = this;
    this.canvas = canvas;
    this.ctx = ctx;
  }
  animate = () => {
    this.clear();
    this.move();
    this.render();

    requestAnimationFrame(this.animate);
  };
  render() {
    const { outer, ctx } = this;
    ctx.beginPath();
    ctx.fillStyle = this.color1;
    ctx.arc(outer.x, outer.y, outer.r, 0, Math.PI * 2);
    ctx.fillStyle = this.getGradient();
    ctx.fill();
    ctx.closePath();
    this.withGradient();
  }
  withGradient = () => {
    const { outer, inner } = this;
    inner.x = outer.x + outer.r / 2;
    inner.y = outer.y - outer.r / 2;
    inner.r = outer.r / 10;
  };
  getGradient = () => {
    const { outer, inner, ctx } = this;
    const gradient = ctx.createRadialGradient(
      outer.x,
      outer.y,
      outer.r,
      inner.x,
      inner.y,
      inner.r
    );
    gradient.addColorStop(0, "rgb(50,50,0)");
    gradient.addColorStop(0.1, "rgb(100,100,0)");
    gradient.addColorStop(1, this.color2);

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
