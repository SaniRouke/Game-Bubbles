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
    // setInterval(() => {
    //   console.log();

    //   const isRightSide = Math.floor(Math.random() * 2);
    //   console.log(isRightSide ? "right" : "left");
    //   if (isRightSide) {
    //     this.objects.forEach((obj) => {
    //       if (obj.pos.x > this.canvas.width / 2) {
    //         obj.blow();
    //       }
    //     });
    //   } else {
    //     this.objects.forEach((obj) => {
    //       if (obj.pos.x < this.canvas.width / 2) {
    //         obj.blow();
    //       }
    //     });
    //   }
    // }, (Math.random() * 3 + 5) * 1000);
    // this.canvas.addEventListener("click", () => {
    //   console.log("kek");
    // });
  }

  play = () => {
    this.updateObjects();
    this.clearContext();
    this.objects.forEach((obj) => {
      obj.move();
      obj.render();
    });
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
  windX = {
    acc: 0.05,
    power: 5,
    speed: 0,
    prevSpeed: 0,
    tempForSin: 0,
    isEnding: false,
  };
  constructor(sprite) {
    super();
    const { canvas } = this;
    this.sprite = sprite;
  }
  render = () => {
    const { ctx, currentFrame, sprite } = this;
    if (sprite) {
      this.drawFrame(currentFrame);
    }
  };
  move = () => {
    this.moveY();
    this.moveX();
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
  moveX = (right) => {
    const isRightdirection = false;
    const { canvas, pos } = this;
    // const aсс = canvas.width / pos.x;
    // pos.x += aсс / 10;
    const aсс = canvas.width / canvas.width - pos.x;
    pos.x += aсс / 1000;
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
