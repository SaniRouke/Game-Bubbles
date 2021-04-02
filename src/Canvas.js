import { useEffect } from "react";
import bubbleSprite from "./img/bubble_frames.png";

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

const main = () => {
  const game = new Game();

  game.setSize(500, 500);
  game.settings();
  game.play();
  console.log(game);
  // game.pause()
  // game.restart()
};

class Context {
  canvas = document.getElementById("canvas");
  ctx = this.canvas.getContext("2d");
  clearContext = () => {
    const { canvas, ctx } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
}

class Game extends Context {
  objects = [];
  play = () => {
    this.clearContext();
    this.objects.forEach((obj) => {
      obj.move();
      obj.render();
    });
  };
  settings = () => {
    this.objects = [...this.getBubbles(5)];
  };

  getBubbles = (count) => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push(new Bubble());
    }
    return arr;
  };
  setSize = (width, height) => {
    this.canvas.width = width;
    this.canvas.height = height;
  };
}

class Bubble extends Game {
  pos = {
    x: 0,
    y: 0,
  };
  currentFrame = 0;
  TEST = () => {
    const { ctx } = this;
    const sprite = new Image();
    sprite.src = bubbleSprite;
    sprite.addEventListener("load", () => {
      ctx.drawImage(sprite, 0, 0);
    });
  };
  render = () => {
    this.TEST();
  };
  move = () => {
    // this.pos.x = Math.sin(1);
  };
}
