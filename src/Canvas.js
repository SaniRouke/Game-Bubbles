import { useEffect } from "react";
import bubbleFrames from "./img/bubble_frames.png";
import oarImage from "./img/oar-skyrim.png";

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
  const ctx = document.getElementById("canvas").getContext("2d");
  const game = new Game(ctx);
  //
  game.play();
};

class Game {
  props = {
    ctx: null,
    canvas: null,
    stage: 0,
    isPlay: true,
    bubbleSprite: null,
    oarSprite: null,
    mousePos: {
      prev: {
        x: 0,
        y: 0,
      },
      x: 0,
      y: 0,
    },
    wind: {
      power: 0,
      isRightDirection: false,
      tempForSin: 0,
    },
    time: {
      current: null,
      start: null,
      end: 60,
      isEnd: null,
    },
  };
  bubbles = {
    countDependsOnWidth: 100,
    count: 0,
    list: [],
  };
  oar = null;
  gameInterface = null;

  constructor(ctx) {
    const { props } = this;
    props.ctx = ctx;
    props.canvas = ctx.canvas;

    this.settingCanvas();
    this.setGameProps();
    this.addEvents();
  }
  settingCanvas = () => {
    const { props } = this;
    props.canvas.width = window.innerWidth;
    props.canvas.height = window.innerHeight;
  };
  setGameProps = () => {
    const { bubbles, props } = this;
    bubbles.count = props.canvas.width / bubbles.countDependsOnWidth;
    props.bubbleSprite = new Image();
    props.bubbleSprite.src = bubbleFrames;
    props.oarSprite = new Image();
    props.oarSprite.src = oarImage;
    this.oar = new Oar(props);
    this.gameInterface = new GameInterface(props);
  };
  addEvents = () => {
    const { props } = this;
    props.canvas.addEventListener("click", this.restart);
    setInterval(this.runWind, (Math.random() * 2 + 3) * 1000);
    this.runWind();
    props.canvas.addEventListener("mousemove", this.setMousePos);
  };
  runWind = () => {
    const { wind } = this.props;
    wind.isRightDirection = Math.floor(Math.random() * 2);
    const intervalId = setInterval(() => {
      if (wind.power < 0 || wind.tempForSin > 10) {
        wind.tempForSin = 0;
        wind.power = 0;
        clearInterval(intervalId);
      }
      wind.tempForSin += Math.random() * 0.1 + 0.3;
      wind.power += Math.sin(wind.tempForSin / 2);
    }, 100);
  };
  // цикл
  play = () => {
    this.gameAnimate();
    this.gameRender();

    requestAnimationFrame(this.play);
  };
  gameAnimate = () => {
    const { props, bubbles, oar, gameInterface } = this;

    if(this.props.stage !== 0) {
      this.update();
    }    
    if (this.props.stage === 1) {
      if (props.time.isEnd) {
        props.stage = 2;
      }
      oar.move()
      bubbles.list.forEach((bubble) => {
        bubble.move();
      });
    }
    if (this.props.stage === 2) {
      bubbles.list.forEach((bubble) => {
        bubble.moveYRush();
      });
    }
    gameInterface.drawCursor()
  };
  gameRender = () => {
    const { props, bubbles, oar, gameInterface } = this;
    this.clearContext();
    this.drawBackground();
    this.drawWind();
    bubbles.list.forEach((bubble) => {
      bubble.render();
    });
    if (this.props.stage === 0) {
      gameInterface.drawIntro()
      gameInterface.drawStartButton()
    }
    if (this.props.stage === 1) {
      oar.render()
      gameInterface.drawScore()
      gameInterface.update()
      gameInterface.drawTimer()
    }
    if (this.props.stage === 2) {
      gameInterface.drawResult()
      gameInterface.drawStartButton()
    }
    gameInterface.drawCursor()
    // this.debug();
  };
  clearContext = () => {
    const { props } = this;
    const width = props.canvas.width;
    const height = props.canvas.height;
    props.ctx.clearRect(0, 0, width, height);
  };
  update = () => {
    const { props, bubbles, oar, gameInterface } = this;
    this.settingCanvas()
    bubbles.list = bubbles.list.filter((bubble) => {
      return !bubble.isDead;
    });
    if (props.time.isEnd) {
      return;
    }
    bubbles.list.forEach((bubble) => {
      if (bubble.frame.isExploding) {
        return
      }
      if (oar.isCollision(bubble)) {
        const score = bubble.explode();
        gameInterface.addScore(score, true);
      }
      if(bubble.pos.bottom < 0) {
        const score = bubble.explode();
        gameInterface.addScore(score, false);
      }
    });
    if (bubbles.list.length < bubbles.count) {
      bubbles.list.push(new Bubble(this.props));
    }
  };
  restart = () => {
    const { props } = this;
    if (this.gameInterface.startButton.isMouseCollision()) {
      props.stage = 1
      this.restartTimer();
    }
  }
  setMousePos = (e) => {
    const { props } = this;
    props.mousePos.x = e.clientX;
    props.mousePos.y = e.clientY;
  }
  drawBackground = () => {
    const { ctx, canvas } = this.props;
    const light = ctx.createRadialGradient(0, 0, 0, 0, 0, canvas.width);
    light.addColorStop(0, "rgba(0,150,200,0)");
    light.addColorStop(1, "rgba(0,0,0,0.9)");
    const deep = ctx.createLinearGradient(0, 0, 0, canvas.height);
    deep.addColorStop(0, "rgba(100,255,255,1)");
    deep.addColorStop(0.3, "rgba(0,150,200,0)");
    deep.addColorStop(0.95, "rgba(0,0,0,1)");
    ctx.save();
    ctx.fillStyle = deep;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  };
  drawWind = () => {
    const { ctx, canvas } = this.props;
    const oy = canvas.height / 2;
    const length = 200;
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height - oy;
    const startX = x;
    const startY = oy - y;

    ctx.save();
    const opacity = this.props.wind.power / 50;
    const curveValue = 0.3;
    ctx.strokeStyle = `rgba(150,255,255,${opacity})`;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    if (this.props.wind.isRightDirection) {
      const endX = x + length;
      const curve = (startX * curveValue) / canvas.width;
      const endY = oy - y * (1 + curve);

      ctx.quadraticCurveTo(
        startX + length * 0.6,
        startY + (endY - startY) / 100,
        endX,
        endY
      );
    } else {
      const endX = x - length;
      const curve = curveValue - (startX * curveValue) / canvas.width;
      const endY = oy - y * (1 + curve);

      ctx.quadraticCurveTo(
        startX - length * 0.6,
        startY + (endY - startY) / 100,
        endX,
        endY
      );
    }
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  };
  restartTimer = () => {
    this.props.time.start = Date.now();
    this.props.time.isEnd = false;
    this.gameInterface.score.value = 0
    this.gameInterface.score.missed = 0
  };
}

class Bubble {
  gameProps = null;
  ctx = null;
  canvas = null;
  size = null;
  minSize = 5;
  maxSize = 100;
  color = null;
  step = null;
  isDead = false;

  pos = {
    x: null,
    y: null,
    top: null,
    right: null,
    bottom: null,
    left: null,
  };

  frame = {
    current: 0,
    isExploding: false,
    size: 512,
  };

  constructor(gameProps) {
    this.gameProps = gameProps;
    this.ctx = gameProps.ctx;
    this.canvas = gameProps.canvas;

    this.size = Math.floor(
      Math.random() * (this.maxSize - this.minSize) + this.minSize
    );
    this.step = 10 / this.size + 1;
    this.pos = {
      x: Math.floor(
        Math.random() * (this.canvas.width - this.size) + this.size / 2
      ),
      y: Math.floor(Math.random() * this.canvas.height + this.canvas.height),
    };
    this.updateSidesPos();
    this.color = `rgba(${Math.random() * 255},${Math.random() * 255}, ${
      Math.random() * 255
    },1)`;
  }
  render = () => {
    const { frame, gameProps } = this;

    this.drawBackground();

    if (gameProps.bubbleSprite) {
      this.drawFrame(frame.current);
    }
  };
  move = () => {
    this.moveY();
    this.moveX();
    this.updateSidesPos();
  };
  moveYRush = () => {
    this.moveY()
    this.step *= 1.05;
  }
  moveY = () => {
    const { gameProps, pos, step, frame } = this;
    if (gameProps.stage === 1) {
      this.step = (gameProps.time.current * 2) / 60 + 2;
    } 
    pos.y -= step;
  };
  moveX = () => {
    const { canvas, pos, size, maxSize, gameProps } = this;
    const blowRight = canvas.width / pos.x;
    const blowLeft = -canvas.width / (canvas.width - pos.x);
    const acc = gameProps.wind.isRightDirection ? blowRight : blowLeft;
    const accFromSize = ((maxSize * 10) / size) * acc;
    pos.x += (accFromSize / 500) * gameProps.wind.power;
    if (pos.x - size / 2.5 < 0) {
      pos.x = size / 2.5;
    }
    if (pos.x + size / 2.5 > canvas.width) {
      pos.x = canvas.width - size / 2.5;
    }
  };
  updateSidesPos = () => {
    const { pos, size } = this;
    pos.top = pos.y - size / 2;
    pos.right = pos.x + size / 2;
    pos.bottom = pos.y + size / 2;
    pos.left = pos.x - size / 2;
  };
  explode = () => {
    const { frame, size } = this;
    frame.isExploding = true;

    const intervalId = setInterval(() => {
      frame.current++;
      if (frame.current > 5) {
        clearInterval(intervalId);
        this.isDead = true;
      }
    }, 50);
    return size;
  };
  drawFrame = (frame) => {
    const { ctx, canvas, pos, size, gameProps } = this;
    const frameSize = this.frame.size;
    const column = (frame % 3) * frameSize;
    const row = frame > 2 ? frameSize : 0;
    //
    ctx.save();
    ctx.translate(pos.x, pos.y);

    const dx = -canvas.width / 2 - pos.x;
    const dy = -canvas.height - pos.y;
    const rotateAngle = (Math.atan2(dy, dx) / Math.PI) * 180;

    ctx.rotate((Math.PI / 180) * (135 + rotateAngle));
    ctx.translate(-pos.x, -pos.y);
    //
    ctx.drawImage(
      gameProps.bubbleSprite,
      column,
      row,
      frameSize,
      frameSize,
      pos.x - size / 2,
      pos.y - size / 2,
      size,
      size
    );
    ctx.restore();
  };
  drawBackground = () => {
    const { ctx, pos, size, color, frame } = this;
    const bgSize = size / (frame.current + 1);

    ctx.save();
    const grad = ctx.createRadialGradient(
      pos.x,
      pos.y,
      0,
      pos.x,
      pos.y,
      bgSize
    );
    grad.addColorStop(0, color);
    grad.addColorStop(0.4, "transparent");

    ctx.globalCompositeOperation = "soft-light";
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, bgSize * 2, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  };
}

class Oar {
  gameProps = null;
  pos;
  hitBox;
  size = 250;
  angle = 0;

  constructor(gameProps) {
    this.gameProps = gameProps;
    this.ctx = gameProps.ctx;
    this.canvas = gameProps.ctx.canvas;
    this.pos = {
      x: this.canvas.width / 2,
      y: 0,
    };
  }

  render = () => {
    const { ctx, pos, angle, size, gameProps } = this;

    // this.debug();+

    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate((Math.PI / 180) * 143);
    ctx.rotate(angle);
    //
    // ctx.shadowColor = "black";
    // ctx.shadowOffsetX = 10;
    // ctx.shadowOffsetY = 100;
    // ctx.shadowBlur = 100;
    ctx.drawImage(
      gameProps.oarSprite,
      50,
      0,
      500,
      500,
      -size / 2,
      -size / 2,
      size,
      size
    );
    ctx.restore();
  };
  move = () => {
    const { canvas, pos, gameProps } = this;
    const { mousePos } = gameProps;
    mousePos.prev.x = pos.x;
    const dif = mousePos.x - mousePos.prev.x;
    pos.x += dif / 50;

    const ox = pos.x - canvas.width / 2;
    this.angle = -((Math.PI / 180) * ox) / 10;
    this.updateHitBoxPos();
  };
  updateHitBoxPos = () => {
    const { canvas, size } = this;

    this.hitBox = {
      radius: 50,
      pos: {
        x:
          canvas.width / 2 +
          ((canvas.width / 2 - this.pos.x) / canvas.width) *
            -canvas.width *
            1.2,
        y: this.pos.y + size / 3,
      },
    };
  };
  isCollision = (obj) => {
    const { hitBox } = this;
    const left = Math.min(hitBox.pos.x, obj.pos.x);
    const top = Math.min(hitBox.pos.y, obj.pos.y);
    const right = Math.max(hitBox.pos.x, obj.pos.x);
    const bottom = Math.max(hitBox.pos.y, obj.pos.y);

    const dx = right - left;
    const dy = bottom - top;

    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < hitBox.radius + obj.size / 3) {
      return true;
    }
    return false;
  };
}

class GameInterface {
  gameProps = null;
  baseSize = 20;
  font = `${this.baseSize}px monospace`;
  cursor = {
    pos: null,
  };
  score = {
    value: 0,
    missed: 0,
    pos: {
      x: null,
      y: null,
    },
  };
  timer = {
    time: 0,
    pos: {
      x: null,
      y: null,
    },
  };
  startButton = {
    radius: this.baseSize * 3,
    pos: {
      x: null,
      y: null,
    },
    isDrawn: false,
    isMouseCollision: () => {
      const { pos, radius } = this.startButton;
      const { mousePos } = this.gameProps;
  
      const left = Math.min(pos.x, mousePos.x);
      const top = Math.min(pos.y, mousePos.y);
      const right = Math.max(pos.x, mousePos.x);
      const bottom = Math.max(pos.y, mousePos.y);
  
      const dx = right - left;
      const dy = bottom - top;
  
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < radius && this.startButton.isDrawn) {
        return true;
      }
      return false;
    }
  };
  intro = {
    pos: {
      x: null,
      y: null,
    },
  };
  result = {
    pos: {
      x: null,
      y: null
    }
  }
  constructor(gameProps) {
    this.gameProps = gameProps;
    this.ctx = gameProps.ctx;
    this.canvas = gameProps.canvas;
    this.setPositions();
  }
  setPositions = () => {
    const { canvas, baseSize, score, timer, startButton, intro, result } = this;
    score.pos = {
      x: canvas.width - baseSize / 4,
      y: canvas.height - baseSize,
    };
    timer.pos = {
      x: baseSize / 4,
      y: canvas.height - baseSize,
    };
    startButton.pos = {
      x: canvas.width / 2,
      y: canvas.height / 2 + baseSize * 3.5,
    };
    intro.pos = {
      x: canvas.width / 2,
      y: canvas.height / 2,
    };
    result.pos = {
      x: canvas.width / 2,
      y: canvas.height / 2 - baseSize * 10
    }
  };
  update = () => {
    const { time } = this.gameProps;
    time.current = Math.floor((Date.now() - time.start) / 1000);
    time.isEnd = time.current > time.end;
    if (time.isEnd) {
      time.current = time.end;
    }
    this.startButton.isDrawn = false
  };
  drawStartButton = () => {
    const { ctx, baseSize, startButton } = this;
    const { pos, radius } = startButton;

    startButton.isDrawn = true

    const grad = ctx.createRadialGradient(
      pos.x,
      pos.y,
      0,
      pos.x,
      pos.y,
      radius
    );
    grad.addColorStop(0, "rgba(200,90,50,1)");
    grad.addColorStop(0.9, "rgba(200,50,50,0.7)");
    grad.addColorStop(1, "transparent");
    const gradHover = ctx.createRadialGradient(
      pos.x,
      pos.y,
      0,
      pos.x,
      pos.y,
      radius
    );
    gradHover.addColorStop(0, "rgba(200,90,50,1)");
    gradHover.addColorStop(0.9, "rgba(200,50,50,1)");
    gradHover.addColorStop(1, "transparent");

    ctx.save();
    ctx.fillStyle = grad;
    if (this.startButton.isMouseCollision()) {
      ctx.fillStyle = gradHover;
    }
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "rgba(200,200,200,0.8)";
    ctx.font = `${baseSize}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("START", pos.x, pos.y);
    ctx.restore();
  };
  drawScore = () => {
    const { ctx, score, baseSize } = this;
    const { pos, value } = score;

    ctx.save();
    ctx.font = `${baseSize * 4}px Freckle Face`
    ctx.textBaseline = "top";
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(200,120,0,0.8)";
    ctx.fillText(value, pos.x, pos.y - baseSize * 6);
    ctx.font = `${baseSize * 2}px Freckle Face`
    ctx.fillText("Score", pos.x, pos.y - baseSize * 2);
    ctx.restore();
  };
  addScore = (score, isHit) => {
    if (isHit) {
      this.score.value += score;
    } else {
      this.score.missed += score
    }
  };
  drawTimer = () => {
    const { ctx, timer, font, baseSize } = this;
    const { pos } = timer;
    const time = this.gameProps.time.current;
    const endTime = this.gameProps.time.end;

    ctx.save();    
    ctx.font = `${baseSize * 4}px Freckle Face`
    ctx.textBaseline = "top";
    ctx.fillStyle = `rgba(${(time * 255) / endTime},${
      255 - (time * 255) / endTime
    },0,1)`;
    ctx.fillText(time, pos.x, pos.y - baseSize * 6);
    ctx.font = `${baseSize * 2}px Freckle Face`
    ctx.fillText("Time", pos.x, pos.y - baseSize * 2);
    ctx.restore();
  };
  drawCursor = () => {
    const { ctx, gameProps, baseSize } = this;
    const { mousePos } = gameProps;
    const cursorRadius = baseSize * 2.5;

    ctx.save();
    const grad = ctx.createRadialGradient(
      mousePos.x,
      mousePos.y,
      cursorRadius / 3,
      mousePos.x,
      mousePos.y,
      cursorRadius
    );
    ctx.globalCompositeOperation = "screen";
    grad.addColorStop(0, "rgba(100,200,150,0.5)");
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(mousePos.x, mousePos.y, cursorRadius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };
  drawIntro = () => {
    const { ctx, baseSize, intro } = this;
    const { pos } = intro;

    if (this.gameProps.stage != 0) {
      pos.y -= 5;
    }

    const bubble = (x = 0, y = 0, radius = baseSize) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(pos.x + x, pos.y + y, radius, 0, Math.PI * 2);
      ctx.closePath();
      const grad = ctx.createRadialGradient(
        pos.x + x,
        pos.y + y,
        0,
        pos.x + x,
        pos.y + y,
        radius
      );
      grad.addColorStop(0, "transparent");
      grad.addColorStop(0.7, "rgba(255,255,255,0.2)");
      grad.addColorStop(0.9, "rgba(255,255,255,0.4)");
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    };
    const text = () => {
      ctx.save();
      ctx.globalCompositeOperation = "overlay";

      ctx.fillStyle = "yellow";
      ctx.font = `${baseSize * 6}px Freckle Face`;
      ctx.textAlign = "center";
      ctx.fillText("BUbbles", pos.x, pos.y);

      ctx.restore();
    };
    bubble(-baseSize * 5, 0, baseSize * 5);
    bubble(baseSize, baseSize * -10, baseSize / 2);
    bubble(baseSize * 2, baseSize * -4, baseSize);
    bubble(baseSize * -3, baseSize * -8, baseSize * 1.7);
    bubble(baseSize * 5, baseSize * -5, baseSize * 1.4);
    bubble(baseSize * 10, baseSize, baseSize * 3);
    bubble(baseSize * -3, baseSize * 8, baseSize * 2);
    bubble(baseSize * 5, baseSize * 10, baseSize * 3);
    bubble(baseSize * -10, baseSize * 7, baseSize);
    bubble(baseSize * 10, baseSize * 8, baseSize / 2);
    bubble(baseSize * 11, baseSize * 7, baseSize * 1.5);
    text();
  };
  drawResult = () => {
    const {ctx, baseSize, score, result} = this
    const {pos} = result
    ctx.save()
    ctx.font = `${baseSize * 5}px Freckle Face`
    ctx.textAlign = "center";
    ctx.fillStyle = 'rgba(200,200,100,1)'
    ctx.fillText('RESULTS', pos.x, pos.y)
    
    ctx.font = `${baseSize * 3}px Freckle Face`
    ctx.fillStyle = 'rgba(50,200,100,1)'
    ctx.fillText('SCORE: ' + score.value, pos.x, pos.y + baseSize * 6)

    ctx.font = `${baseSize * 2}px Freckle Face`
    ctx.fillStyle = 'rgba(100,150,100,1)'
    ctx.fillText('missed: ' + score.missed, pos.x, pos.y + baseSize * 8)
    ctx.restore()
  };
}
