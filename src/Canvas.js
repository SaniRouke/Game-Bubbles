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
  // const game = new Game(ctx);
  // console.log(game);
  //
  // game.play();
  // game.pause()
  // game.restart()
  const test = new TEST();
  ctx.canvas.addEventListener("click", () => test.setStage(2));
  const cb = test.setStage(1);
};

class TEST {
  stage = 0;
  prev_setStage = () => {};
  before = () => {
    console.log("before");
  };
  run = () => {
    console.log(this.stage);
    requestAnimationFrame(this.run);
  };
  setStage = (stage) => {
    this.prev_setStage();
    this.before();
    this.stage = stage;
    this.run();
    this.prev_setStage = () => {
      console.log("after");
    };
  };
}

class Game {
  props = {
    ctx: null,
    canvas: null,
    stage: null,
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
      end: 2,
      isEnd: null,
    },
  };
  bubbles = {
    countDependsOnWidth: 50,
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
    props.stage = 0;
    this.runStage(this.before, this.main, this.after);
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
    props.canvas.addEventListener("click", () => {
      if (this.gameInterface.startButtonIsMouseCollision()) {
        props.stage = 1;
        this.startTimer();
        return;
      }
    });
    setInterval(this.runWind, (Math.random() * 2 + 3) * 1000);
    this.runWind();
    props.canvas.addEventListener("mousemove", (e) => {
      props.mousePos.x = e.clientX;
      props.mousePos.y = e.clientY;
    });
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
    this.animate();

    requestAnimationFrame(this.play);
  };
  animate = () => {
    const { props, bubbles, oar, gameInterface } = this;
    this.gameRender();
    if (this.props.stage === 0) {
      gameInterface.renderStage0();
    }
    if (this.props.stage === 1) {
      if (props.time.isEnd) {
        props.isPlay = false;
      }
      gameInterface.renderStage1();
      this.updateObjects();
      const moveableObjects = [oar, ...bubbles.list];
      const renderObjects = [gameInterface, oar, ...bubbles.list];
      moveableObjects.forEach((obj) => {
        obj.move();
      });
      renderObjects.forEach((obj) => {
        obj.render();
      });
    }
    if (this.props.stage === 2) {
      gameInterface.renderStage2();
    }
  };
  gameRender = () => {
    this.clearContext();
    this.drawBackground();
    this.drawWind();
    // this.debug();
  };
  clearContext = () => {
    const { props } = this;
    const width = props.canvas.width;
    const height = props.canvas.height;
    props.ctx.clearRect(0, 0, width, height);
  };
  updateObjects = () => {
    const { props, bubbles, oar, gameInterface } = this;
    bubbles.list = bubbles.list.filter((bubble) => {
      return !bubble.isDead;
    });
    if (props.time.isEnd) {
      return;
    }
    bubbles.list.forEach((bubble) => {
      if (oar.isCollision(bubble) && !bubble.frame.isExploding) {
        const score = bubble.explode();
        gameInterface.addScore(score);
      }
    });
    if (bubbles.list.length < bubbles.count) {
      bubbles.list.push(new Bubble(this.props));
    }
  };
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
  startTimer = () => {
    this.props.time.start = Date.now();
  };
  runStage = (before, main, after) => {
    before();
    main();
    after();
  };
  before = () => {
    console.log("before");
  };
  main = () => {
    console.log("main");
  };
  after = () => {
    console.log("after");
  };
  // debug
  debug = () => {
    const { props } = this;
    const { ctx, canvas } = props;
    this.bubbles.countDependsOnWidth = 1000;
    console.log(this.bubbles);
    // grid
    ctx.fillRect(canvas.width / 2, 0, 1, canvas.height);
    ctx.fillRect(0, canvas.height / 2, canvas.width, 1);
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

  moveY = () => {
    const { gameProps, pos, step, frame } = this;
    if (gameProps.isPlay) {
      this.step = (gameProps.time.current * 2) / 60 + 2;
    } else {
      this.step *= 1.05;
    }
    pos.y -= step;
    if (frame.isExploding) {
      return;
    }
    if (pos.bottom < 0) {
      this.explode();
    }
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
  // debug
  debug = () => {
    const { ctx, pos, hitBox, size, gameProps } = this;
    const { mousePos } = gameProps;
    ctx.save();
    // ctx.globalCompositeOperation = "source-over";

    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate((Math.PI / 180) * 143);
    ctx.rotate(this.angle);

    // oar
    ctx.strokeRect(-size / 2, -size / 2, size, size);

    ctx.restore();

    // hitBox
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(hitBox.pos.x, hitBox.pos.y, hitBox.radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();

    // collision
    const point = {
      x: 300,
      y: 300,
      radius: 150,
    };
    ctx.fillStyle = "rgba(0,200,0,0.2)";
    ctx.beginPath();
    ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();

    const left = Math.min(hitBox.pos.x, point.x);
    const top = Math.min(hitBox.pos.y, point.y);
    const right = Math.max(hitBox.pos.x, point.x);
    const bottom = Math.max(hitBox.pos.y, point.y);

    const dx = right - left;
    const dy = bottom - top;

    ctx.fillStyle = "rgba(200,0,0,0.5)";
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < point.radius + hitBox.radius) {
      ctx.fillStyle = "rgba(200,200,0,0.5)";
    }
    ctx.fillRect(left, top, dx, dy);

    ctx.restore();
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
    pos: {
      x: null,
      y: null,
    },
  };
  timer = {
    time: null,
    pos: {
      x: null,
      y: null,
    },
  };
  intro = {
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
  };

  constructor(gameProps) {
    this.gameProps = gameProps;
    this.ctx = gameProps.ctx;
    this.canvas = gameProps.canvas;
    this.setPositions();
  }
  setPositions = () => {
    const { canvas, baseSize, score, timer, intro, startButton } = this;
    score.pos = {
      x: canvas.width - baseSize / 4,
      y: canvas.height - baseSize,
    };
    timer.pos = {
      x: baseSize / 4,
      y: canvas.height - baseSize,
    };
    intro.pos = {
      x: canvas.width / 2,
      y: canvas.height / 2,
    };
    startButton.pos = {
      x: canvas.width / 2,
      y: canvas.height / 2 + baseSize * 3.5,
    };
  };
  render = () => {
    const { stage } = this.gameProps;
    this.update(); //
    if (stage === 0) {
      this.drawIntro();
      this.drawStartButton();
    }
    if (stage === 1) {
      this.drawScore();
      this.drawTimer();
    }
    if (stage === 2) {
      this.drawResult();
      this.drawStartButton();
    }
    this.drawCursor();
  };
  renderStage0 = () => {
    this.drawIntro();
    this.drawStartButton();
    this.drawCursor();
  };
  renderStage1 = () => {
    this.update();
    this.drawIntro();
    this.drawScore();
    this.drawTimer();
    this.drawCursor();
  };
  renderStage2 = () => {
    this.update();
    this.drawResult();
    this.drawStartButton();
    this.drawCursor();
  };
  update = () => {
    const { time } = this.gameProps;
    time.current = Math.floor((Date.now() - time.start) / 1000);
    time.isEnd = time.current > time.end;
    if (time.isEnd) {
      time.current = time.end;
    }
  };
  drawStartButton = () => {
    const { ctx, font, baseSize, startButton } = this;
    const { pos, radius } = startButton;

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
    if (this.startButtonIsMouseCollision()) {
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
  startButtonIsMouseCollision = () => {
    const { pos, radius } = this.startButton;
    const { mousePos } = this.gameProps;

    const left = Math.min(pos.x, mousePos.x);
    const top = Math.min(pos.y, mousePos.y);
    const right = Math.max(pos.x, mousePos.x);
    const bottom = Math.max(pos.y, mousePos.y);

    const dx = right - left;
    const dy = bottom - top;

    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < radius) {
      return true;
    }
    return false;
  };
  drawScore = () => {
    const { ctx, score, font, baseSize } = this;
    const { pos, value } = score;

    ctx.save();
    ctx.font = font;
    ctx.textBaseline = "top";
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(200,120,0,0.8)";
    ctx.fillText(value, pos.x, pos.y - baseSize);
    ctx.fillText("Score", pos.x, pos.y);
    ctx.restore();
  };
  drawResult = () => {};
  addScore = (score) => {
    this.score.value += score;
  };
  drawTimer = () => {
    const { ctx, timer, font, baseSize } = this;
    const { pos } = timer;
    const time = this.gameProps.time.current;
    const endTime = this.gameProps.time.end;

    ctx.save();
    ctx.font = font;
    ctx.textBaseline = "top";
    ctx.fillStyle = `rgba(${(time * 255) / endTime},${
      255 - (time * 255) / endTime
    },0,1)`;
    ctx.fillText(time, pos.x, pos.y - baseSize);
    ctx.fillText("Time", pos.x, pos.y);
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
}
