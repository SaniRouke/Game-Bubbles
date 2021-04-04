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
  bubblesDependsOnWidth = 10;
  isPlay = true;
  wind = {
    power: 0,
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
      const isRightdirection = Math.floor(Math.random() * 2);
    }, (Math.random() * 3 + 5) * 1000);
    this.canvas.addEventListener("click", () => {
      // this.isPlay = !this.isPlay;
      const intervalId = setInterval(() => {
        this.wind.power += 5;
        clearInterval(intervalId);
      }, 1000);
    });
  }

  play = () => {
    if (this.isPlay) {
      this.updateObjects();
      this.clearContext();
      this.objects.forEach((obj) => {
        obj.move(this.wind.power);
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
  move = (windPower) => {
    this.moveY();
    this.moveX(true, windPower);
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
  moveX = (isRightdirection, windPower) => {
    const { canvas, pos } = this;

    const blowRight = canvas.width / pos.x;
    const blowLeft = -canvas.width / (canvas.width - pos.x);

    const acc = isRightdirection ? blowRight : blowLeft;
    pos.x += (acc / 10) * windPower;
  };
  blow = () => {
    const { canvas, pos, windX } = this;
    const OX = canvas.width / 2;
    const acc = ((OX + pos.x) / canvas.width) * 2;

    const id = setInterval(() => {
      if (windX.speed < windX.prevSpeed && windX.isEnding === false) {
        windX.isEnding = true;
      }
      if (windX.speed > windX.prevSpeed && windX.isEnding === true) {
        windX.isEnding = false;
        clearInterval(id);
      }
      windX.tempForSin += windX.acc;
      windX.speed += Math.sin(windX.tempForSin) / 50;
      pos.x += windX.speed * windX.power * acc;
    }, 15);
  };
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
