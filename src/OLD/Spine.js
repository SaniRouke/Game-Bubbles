class SpineOLD extends ContextOLD {
  spineFrame = new Image();
  width = 50;
  height = 250;
  pos = {
    x: this.canvas.width / 2,
    y: -100,
    top: -this.height / 2,
    right: this.width / 2,
    bottom: this.height / 2,
    left: -this.width / 2,
  };
  mousePos = {
    x: 0,
    y: 0,
  };
  hitBox = {
    x: this.pos.x,
    y: 100,
    radius: 100,
  };
  angle = 0;
  constructor(spineFrame) {
    super();
    this.spineFrame = spineFrame;
  }
  updatePos = () => {
    const { pos, hitBox } = this;
    pos.top = this.pos.y - this.height / 2;
    pos.right = this.pos.x + this.width / 2;
    pos.bottom = this.pos.y + this.height / 2;
    pos.left = this.pos.x - this.width / 2;
    //
    hitBox.x = pos.x;
    hitBox.y = pos.y + this.height;
    hitBox.radius = 100;
  };
  isCollision = (obj) => {
    const left = Math.min(this.pos.x, obj.pos.x);
    const top = Math.min(this.pos.y + this.height - this.width, obj.pos.y);
    const right = Math.max(this.pos.x, obj.pos.x);
    const bottom = Math.max(this.pos.y, obj.pos.y);

    const dx = bottom - top;
    const dy = right - left;
    const c = Math.sqrt(dx * dx + dy * dy);
    if (c < this.width * 2 + obj.size / 2) {
      return true;
    }
    return false;
  };
  move = () => {
    const { canvas, pos, mousePos } = this;
    pos.x = mousePos.x;
    const ox = pos.x - canvas.width / 2;
    this.angle = -((Math.PI / 180) * ox) / 10;
    this.updatePos();
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
