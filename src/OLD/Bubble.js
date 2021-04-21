class BubbleOLD extends ContextOLD {
  id = 0;
  minSize = 5;
  maxSize = 100;
  size = Math.floor(
    Math.random() * (this.maxSize - this.minSize) + this.minSize
  );
  pos = {
    x: Math.floor(
      Math.random() * (this.canvas.width - this.size) + this.size / 2
    ),
    y: Math.floor(Math.random() * this.canvas.height + this.canvas.height),
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
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
    this.updatePos();
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
  updatePos = () => {
    const { pos } = this;
    pos.top = this.pos.y - this.size / 2;
    pos.right = this.pos.x + this.size / 2;
    pos.bottom = this.pos.y + this.size / 2;
    pos.left = this.pos.x - this.size / 2;
  };
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
    //

    ctx.save();
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, size / 3, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(200,0,0,1)";
    ctx.fill();
    ctx.closePath();

    function angle(cx, cy, ex, ey) {
      var dy = ey - cy;
      var dx = ex - cx;
      var theta = Math.atan2(dy, dx);
      theta *= 180 / Math.PI;
      return theta;
    }
    //
    const a = angle(
      pos.x,
      pos.y,
      -this.canvas.width / 2,
      -this.canvas.height / 2
    );
    ctx.translate(pos.x, pos.y);
    ctx.rotate((Math.PI / 180) * (135 + a));
    ctx.translate(-pos.x, -pos.y);
    //
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
    ctx.restore();
  };
}
