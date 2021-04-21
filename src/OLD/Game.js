class GameOLD extends ContextOLD {
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
    this.spine = new SpineOLD();
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
        if (this.spine.isCollision(obj)) {
          obj.explode();
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
      this.bubbles.push(new BubbleOLD(this.bubbleSprite));
    }
  };
  clearContext = () => {
    const { canvas, ctx } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
}
