class Character {
  constructor () {
    this.x = 500;
    this.y = 510;
    this.width = 40;
    this.height = 60;
    this.vx = 20;
    this.vy = 95;
    this.arms = this.vx * 3;
    this.hat = this.vx * 2;
    this.gunX = this.x - 7;
    this.gunY = this.y - 10;
  }
  draw(ctx) {
    ctx.beginPath();
    ctx.fillStyle = 'transparent'
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = 'tan';
    ctx.arc(this.x + 20, this.y + 7, this.width / 3, 0, (Math.PI / 180) * 360, false);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = '#FFFFFF';
    ctx.arc(this.x + 20, this.y + 5, this.width / 3, (Math.PI / 180) * 195, (Math.PI / 180) * 345, false);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 1;
    ctx.arc(this.x + 20, this.y + 5, this.width / 3, (Math.PI / 180) * 195, (Math.PI / 180) * 345, false);
    ctx.closePath();
    ctx.stroke();

    // ctx.beginPath();
    // ctx.strokeStyle = 'black'
    // ctx.lineWidth = 2;
    // ctx.moveTo(this.x + 33, this.y + 2);
    // ctx.lineTo(this.x + this.hat, this.y + 1);
    // ctx.stroke();

    ctx.fillStyle = 'blue';
    ctx.font = '4px serif';
    ctx.fillText('Biggest', this.x + 13, this.y - 3);
    ctx.fillText('Walleye', this.x + 12, this.y);

    ctx.beginPath();
    ctx.fillStyle = 'tan';
    ctx.fillRect(this.x + 5, this.y + 20, this.width - 10, this.height - 30);
    ctx.closePath();

    ctx.beginPath();
    ctx.strokeStyle = 'tan'
    ctx.lineWidth = 8;
    ctx.moveTo(this.x + 30, this.y + 22);
    ctx.lineTo(this.x + 50, this.y + 50);
    ctx.stroke();
    ctx.closePath()

    ctx.beginPath();
    ctx.strokeStyle = '#2C3539'
    ctx.lineWidth = 5;
    ctx.moveTo(this.x - 3, this.y + 12);
    ctx.lineTo(this.x - 3, this.y - 10)
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.strokeStyle = 'tan'
    ctx.lineWidth = 8;
    ctx.moveTo(this.x + 10, this.y + 22);
    ctx.lineTo(this.x, this.y + 40);
    ctx.lineTo(this.x - 10, this.y + 15);
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = 'blue';
    ctx.fillRect(this.x + 5, this.y + 50, this.width - 10, this.height - 50);
    ctx.closePath();


    ctx.beginPath();
    ctx.fillStyle = 'blue';
    ctx.fillRect(this.x + 5, this.y + 60, this.width - 30, this.height - 40);
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = 'blue';
    ctx.fillRect(this.x + 25, this.y + 60, this.width - 30, this.height - 40);
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = 'white';
    ctx.fillRect(this.x + 5, this.y + 80, this.width - 30, this.height - 55);
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = 'white';
    ctx.fillRect(this.x + 25, this.y + 80, this.width - 30, this.height - 55);
    ctx.closePath();

    return this;
  }

  move() {
    this.gunX = this.x - 3;
    this.gunY = this.y - 10;
  }

  erase(ctx) {
    ctx.clearRect(this.x - 19, this.y - 10, this.width + 32, this.height + 35)
    return this;
  }
}

module.exports = Character;