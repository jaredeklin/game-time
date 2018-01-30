class Centipede {
  constructor(y, x = 500) {
    this.x = x;
    this.y = y;
    this.radius = 15;
    this.vx = 0;
    this.vy = 5
    this.walk = 6;
    this.eyeX = this.x + this.vx;
    this.eyeY = this.y - 5;
    this.hasHead = false;
    this.bob = 2;
  }

  drawHead(ctx) {
    ctx.beginPath();
    ctx.fillStyle = 'red';
    ctx.arc(this.eyeX, this.eyeY + this.bob, this.radius / 4, 0, (Math.PI / 180) * 360, false);
    ctx.fill();
    ctx.closePath();
    ctx.save();
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.fillStyle = 'green';
    ctx.arc(this.x, this.y + this.bob, this.radius, 0, (Math.PI / 180) * 360, false);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = 'black';
    ctx.arc(this.x + this.walk, this.y + 15 + this.bob, this.radius / 2, 0, (Math.PI / 180) * 360, false);
    ctx.fill();
    ctx.closePath();

    if (this.hasHead === true) {
      this.drawHead(ctx);
    }

    if ( this.x % 40 === 0) {
      this.walk = -this.walk;
    }

    return this
  }

  move() {
    this.x += this.vx;
    this.y += this.vy;
    this.eyeY = this.y - 5
    this.eyeX = this.x + this.vx;
    if (this.x + this.vx > 990 || this.x + this.vx < 10) {
      this.y += this.radius * 2 + this.radius;
      this.eyeY += this.radius * 2 + this.radius;
      this.vx = -this.vx;
    }
    if (this.y + this.radius > 600) {
      this.y = 440;
    }
    if (this.y === this.radius * 2 + this.radius) {
      this.vy = 0;
      this.vx = 5;
    }

    if (this.x % 50 === 0) {
      this.bob = -this.bob;
    }
    return this
  }

  erase(ctx) {
    ctx.clearRect(this.x - this.radius, this.y - this.radius - 5, this.radius *  2, this.radius * 2 + 15);
    return this
  }
}

module.exports = Centipede;