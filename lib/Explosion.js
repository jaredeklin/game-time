class Explosion {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 4;
    this.red = 'rgba(255, 0, 0, 0.5)'
    this.yellow = 'rgba(255,255,0, 0.5)';
    this.expand = 3;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.red;
    ctx.arc(this.x, this.y, this.radius / 2, 0, (Math.PI / 180) * 360, false);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = this.yellow;
    ctx.arc(this.x, this.y, this.radius, 0, (Math.PI / 180) * 360, false);
    ctx.fill();
    ctx.closePath();

    return this;
  }

  move() {
    this.radius += this.expand;
    return this;
  }

  erase(ctx) {
    ctx.clearRect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
    return this;
  }

}

module.exports = Explosion;