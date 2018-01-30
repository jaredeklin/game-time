class Spider {
  constructor (x = -75, y = 400) {
    this.x = x;
    this.y = y;
    this.radius = 20;
    this.vy = Math.floor(Math.random() * 4) + 1;
    this.vx = Math.floor(Math.random() * 4 ) + 1;
    this.inverse = 1;
    this.walk = 10;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.fillStyle = 'transparent';
    ctx.arc(this.x, this.y, this.radius, 0, (Math.PI / 180) * 360, false);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = '#59362F';
    ctx.arc(this.x, this.y - 22, this.radius * 2.2, (Math.PI / 180) * 30, (Math.PI / 180) * 150, false);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = '#59362F';
    ctx.arc(this.x, this.y + 22, this.radius * 2.2, (Math.PI / 180) * 330, (Math.PI / 180) * 210, true);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = '#880000';
    ctx.arc(this.x - 10, this.y + 2, this.radius / 3, (Math.PI / 180) * 0, (Math.PI / 180) * 360, false);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = '#880000';
    ctx.arc(this.x + 10, this.y + 2, this.radius / 3, (Math.PI / 180) * 0, (Math.PI / 180) * 360, false);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = '#880000';
    ctx.arc(this.x - 20, this.y - 6, this.radius / 4, (Math.PI / 180) * 0, (Math.PI / 180) * 360, false);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = '#880000';
    ctx.arc(this.x + 20, this.y - 6, this.radius / 4, (Math.PI / 180) * 0, (Math.PI / 180) * 360, false);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = '#000000'
    ctx.moveTo(this.x + 15, this.y + 17);
    ctx.lineTo(this.x + 5, this.y + 17);
    ctx.lineTo(this.x + 10, this.y + 27 );
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = '#000000'
    ctx.moveTo(this.x - 15, this.y + 17);
    ctx.lineTo(this.x - 5, this.y + 17);
    ctx.lineTo(this.x - 10, this.y + 27 );
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 5;
    ctx.moveTo(this.x - 23, this.y - 10);
    ctx.lineTo(this.x - 40, this.y - 30);
    ctx.lineTo(this.x - 70 + this.walk, this.y + 10);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 5;
    ctx.moveTo(this.x - 27, this.y + 10);
    ctx.lineTo(this.x - 40, this.y - 10);
    ctx.lineTo(this.x - 50 - this.walk, this.y + 30);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 5;
    ctx.moveTo(this.x + 23, this.y - 10);
    ctx.lineTo(this.x + 40, this.y - 30);
    ctx.lineTo(this.x + 70 - this.walk, this.y + 10);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 5;
    ctx.moveTo(this.x + 27, this.y + 10);
    ctx.lineTo(this.x + 40, this.y - 10);
    ctx.lineTo(this.x + 50 + this.walk, this.y + 30);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 3;
    ctx.moveTo(this.x - 3, this.y + 1);
    ctx.lineTo(this.x - 12, this.y - 6);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 3;
    ctx.moveTo(this.x + 3, this.y + 1);
    ctx.lineTo(this.x + 12, this.y - 6);
    ctx.stroke();

  }

  move() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x + this.vx > 1100 || this.x + this.vx < -100) {
      this.vx = -this.vx;
    }

    if (this.y + this.radius > 700 || this.y + this.radius < 300) {
      this.vy = -this.vy;
    }

    if (this.x % 5 === 0) {
      this.inverse = -this.inverse;
    }

    if (this.x % 100 === 0) {
      this.vx = (Math.floor(Math.random() * 3) + 2) * this.inverse;
    }

    if (this.y % 75 === 0) {
      this.vy = (Math.floor(Math.random() * 3)) * this.inverse;
    }

    if (this.x % 5 === 0) {
      this.walk = -this.walk;
    }

    return this
  }

  erase(ctx) {
    ctx.clearRect(this.x - 83, this.y - 35, 165, 66);
    return this
  }
}



module.exports = Spider;
