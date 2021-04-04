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
  //
  // const blowElement = new BlowElement();
  // blowElement.render();

  //
  game.play();
  console.log(game);
  // game.pause()
  // game.restart()
};

class Context {
  canvas = document.getElementById("canvas");
  ctx = this.canvas.getContext("2d");
}

class Game extends Context {
  objects = [];
  bubblesDependsOnWidth = 50;
  isPlay = true;
  wind = {
    power: 0,
    isRightDirection: false,
    tempForSin: 0,
  };
  constructor() {
    super();
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.bubblesCount = this.canvas.width / this.bubblesDependsOnWidth;
    const sprite = new Image();
    sprite.src = bubbleSprite;
    sprite.addEventListener("load", () => {
      this.sprite = sprite;
    });
    setInterval(() => {
      const { wind } = this;
      wind.isRightDirection = Math.floor(Math.random() * 2);
      const intervalId = setInterval(() => {
        if (wind.power < 0 || wind.tempForSin > 10) {
          wind.tempForSin = 0;
          wind.power = 0;
          clearInterval(intervalId);
        }
        console.log(wind.tempForSin);
        wind.tempForSin += 0.2;
        wind.power += Math.sin(wind.tempForSin);
      }, 100);
    }, (Math.random() * 7 + 3) * 1000);
    this.canvas.addEventListener("click", () => {
      this.isPlay = !this.isPlay;
    });
  }

  play = () => {
    if (this.isPlay) {
      this.updateObjects();
      this.clearContext();
      this.objects.forEach((obj) => {
        obj.move(this.wind);
        obj.render();
      });
    }
    requestAnimationFrame(this.play);
  };
  updateObjects = () => {
    this.objects = this.objects.filter((obj) => {
      return !obj.isDead;
    });
    if (this.objects.length < this.bubblesCount) {
      this.objects.push(new Bubble(this.sprite));
    }
  };
  clearContext = () => {
    const { canvas, ctx } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
}

class Bubble extends Context {
  id = 0;
  minSize = 5;
  maxSize = 150;
  size = Math.random() * (this.maxSize - this.minSize) + this.minSize;
  pos = {
    x: Math.floor(
      Math.random() * (this.canvas.width - this.size) + this.size / 2
    ),
    y: Math.floor(Math.random() * this.canvas.height) + this.canvas.height,
  };
  // step = 10 / this.size + 3;
  step = 10 / this.size + 1;
  currentFrame = 0;
  isExploding = false;
  isDead = false;
  constructor(sprite) {
    super();
    const { canvas } = this;
    this.sprite = sprite;
  }
  render = () => {
    const { canvas, ctx, pos, currentFrame, sprite } = this;
    if (sprite) {
      this.drawFrame(currentFrame);
    }
  };
  move = (wind) => {
    this.moveY();
    this.moveY();
    this.moveY();
    this.moveX(wind);
  };
  moveY = () => {
    this.pos.y -= this.step;
    if (this.isExploding) {
      return;
    }
    if (this.pos.y < 50) {
      this.isExploding = true;
      this.explode();
    }
  };
  moveX = (wind) => {
    const { canvas, pos } = this;

    const blowRight = canvas.width / pos.x;
    const blowLeft = -canvas.width / (canvas.width - pos.x);

    const acc = wind.isRightDirection ? blowRight : blowLeft;
    pos.x += (acc / 10) * wind.power;
  };
  blow = () => {};
  explode = () => {
    const intervalId = setInterval(() => {
      this.currentFrame++;
      if (this.currentFrame > 5) {
        clearInterval(intervalId);
        this.isDead = true;
      }
    }, 50);
  };
  drawFrame = (frame) => {
    const { ctx, pos, size, sprite } = this;
    const frameSize = 512;
    const column = (frame % 3) * frameSize;
    const row = frame > 2 ? frameSize : 0;
    ctx.drawImage(
      sprite,
      column,
      row,
      frameSize,
      frameSize,
      pos.x - size / 2,
      pos.y,
      size,
      size
    );
  };
}
