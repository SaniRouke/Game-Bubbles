import { useEffect } from "react";
import bubbleFrames from "./img/bubble_frames.png";

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
  isPlay = true;
  bubbleSprite = new Image();
  bubblesDependsOnWidth = 50;
  objects = [];
  bubbles = [];
  spine;
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

    this.init();
  }
  init = () => {
    const { canvas, bubbleSprite, setWind } = this;
    bubbleSprite.src = bubbleFrames;
    this.spine = new Spine();
    setWind();

    canvas.addEventListener("click", () => {
      this.isPlay = !this.isPlay;
    });
    canvas.addEventListener("mousemove", (e) => {
      const { spine } = this;
      spine.mousePos.x = e.clientX;
      spine.mousePos.y = e.clientY;
    });
  };
  setWind = () => {
    setInterval(() => {
      const { wind } = this;
      wind.isRightDirection = Math.floor(Math.random() * 2);
      const intervalId = setInterval(() => {
        if (wind.power < 0 || wind.tempForSin > 10) {
          wind.tempForSin = 0;
          wind.power = 0;
          clearInterval(intervalId);
        }
        wind.tempForSin += Math.random() * 0.5;
        wind.power += Math.sin(wind.tempForSin);
      }, 100);
    }, (Math.random() * 7 + 3) * 1000);
  };
  // цикл
  play = () => {
    if (this.isPlay) {
      this.updateObjects();
      this.clearContext();
      this.objects = [this.spine, ...this.bubbles];
      this.objects.forEach((obj) => {
        if (obj instanceof Bubble) {
          this.spine.isCollision(obj);
        }
        obj.move(this.wind);
        obj.render();
      });
    }
    requestAnimationFrame(this.play);
  };
  updateObjects = () => {
    this.bubbles = this.bubbles.filter((obj) => {
      return !obj.isDead;
    });
    if (this.bubbles.length < this.bubblesCount) {
      this.bubbles.push(new Bubble(this.bubbleSprite));
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
  maxSize = 100;
  size = Math.random() * (this.maxSize - this.minSize) + this.minSize;
  pos = {
    x: Math.floor(
      Math.random() * (this.canvas.width - this.size) + this.size / 2
    ),
    y: Math.floor(Math.random() * this.canvas.height) + this.canvas.height,
  };
  step = 10 / this.size + 1;
  currentFrame = 0;
  isExploding = false;
  isDead = false;
  constructor(bubbleSprite) {
    super();
    this.bubbleSprite = bubbleSprite;
  }
  render = () => {
    const { currentFrame, bubbleSprite } = this;
    if (bubbleSprite) {
      this.drawFrame(currentFrame);
    }
  };
  move = (wind) => {
    this.moveY();
    this.moveX(wind);
  };
  moveY = () => {
    this.pos.y -= this.step;
    if (this.isExploding) {
      return;
    }
    if (this.pos.y < this.size / 2) {
      this.explode();
    }
  };
  moveX = (wind) => {
    const { canvas, pos, size } = this;

    const blowRight = canvas.width / pos.x;
    const blowLeft = -canvas.width / (canvas.width - pos.x);

    const acc = wind.isRightDirection ? blowRight : blowLeft;
    pos.x += (acc / 20) * wind.power;
    if (pos.x - size / 2.5 < 0) {
      pos.x = size / 2.5;
    }
    if (pos.x + size / 2.5 > canvas.width) {
      pos.x = canvas.width - size / 2.5;
    }
  };
  blow = () => {};
  explode = () => {
    this.isExploding = true;
    const intervalId = setInterval(() => {
      this.currentFrame++;
      if (this.currentFrame > 5) {
        clearInterval(intervalId);
        this.isDead = true;
      }
    }, 50);
  };
  drawFrame = (frame) => {
    const { ctx, pos, size, bubbleSprite } = this;
    const frameSize = 512;
    const column = (frame % 3) * frameSize;
    const row = frame > 2 ? frameSize : 0;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, size / 3, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(200,0,0,1)";
    ctx.fill();
    ctx.closePath();
    ctx.drawImage(
      bubbleSprite,
      column,
      row,
      frameSize,
      frameSize,
      pos.x - size / 2,
      pos.y - size / 2,
      size,
      size
    );
  };
}

class Spine extends Context {
  spineFrame = new Image();
  pos = {
    x: this.canvas.width / 2,
    y: -100,
  };
  mousePos = {
    x: 0,
    y: 0,
  };
  width = 50;
  height = 250;
  angle = 0;
  constructor(spineFrame) {
    super();
    this.spineFrame = spineFrame;
  }
  isCollision = (obj) => {
    // console.log(this.pos.x);
  };
  move = () => {
    const { canvas, pos, mousePos } = this;
    pos.x = mousePos.x;
    const ox = pos.x - canvas.width / 2;
    this.angle = -((Math.PI / 180) * ox) / 10;
  };
  render = () => {
    const { ctx, pos, width, height, angle } = this;

    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(angle);
    const gradTop = ctx.createLinearGradient(-width / 10, 0, width / 2, 0);
    gradTop.addColorStop(0, "gray");
    gradTop.addColorStop(0.2, "rgba(220,150,50,1)");
    gradTop.addColorStop(0.8, "rgba(220,150,50,1)");
    gradTop.addColorStop(1, "gray");
    const gradBottom = ctx.createLinearGradient(-width / 2, 0, width / 2, 0);
    gradBottom.addColorStop(0, "gray");
    gradBottom.addColorStop(0.2, "rgba(220,150,50,0.8)");
    gradBottom.addColorStop(0.8, "rgba(220,150,50,1)");
    gradBottom.addColorStop(1, "gray");
    ctx.beginPath();
    ctx.strokeStyle = gradTop;
    ctx.lineCap = "round";
    ctx.lineWidth = width / 5;
    ctx.moveTo(0, 0);
    ctx.lineTo(0, height);
    ctx.stroke();
    ctx.beginPath();
    ctx.strokeStyle = gradBottom;
    ctx.lineWidth = width;
    ctx.moveTo(0, height - 50);
    ctx.lineTo(0, height);
    ctx.stroke();
    ctx.restore();
  };
}
