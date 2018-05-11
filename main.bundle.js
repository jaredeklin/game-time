/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var Mushroom = __webpack_require__(1);
	var Centipede = __webpack_require__(2);
	var Character = __webpack_require__(3);
	var Bullet = __webpack_require__(4);
	var Spider = __webpack_require__(5);
	var ExplosionMushroom = __webpack_require__(6);
	var ExplosionCentipede = __webpack_require__(8);
	var ExplosionSpider = __webpack_require__(9);
	var HighScore = __webpack_require__(10);
	var Sound = __webpack_require__(11);
	
	var character = new Character();
	var canvas = document.getElementById('game');
	var ctx = canvas.getContext('2d');
	var bulletsArray = [];
	var centipedeArray = [];
	var mushroomArray = [];
	var spiderArray = [];
	var explosionArray = [];
	var overrideDefault = false;
	var gamePause = false;
	var gunSound = new Sound('../sounds/Laser_Shoot1.wav');
	var spiderSound = new Sound('../sounds/Emerge11.wav');
	var generateCentipedeSound = new Sound('../sounds/Explosion1.wav');
	var gameOverSound = new Sound('../sounds/Shut_Down1.wav');
	var centipedeHitSound = new Sound('../sounds/Explosion2.wav');
	var collisionSound = new Sound('../sounds/Explosion6.wav');
	
	var gameBoard = document.querySelector('.game-background');
	var startScreen = document.querySelector('.start-screen');
	var startButton = document.querySelector('.start-button');
	var levelUpScreen = document.querySelector('.level-up');
	var gameOverScreen = document.querySelector('.game-over');
	var restartButton = document.querySelector('.restart-button');
	var levelUpButton = document.querySelector('.new-level-button');
	var newHighScoreScreen = document.querySelector('.new-high-score');
	var saveHighScoreButton = document.querySelector('.submit-high-score-button');
	var showHighScoreStartScreenButton = document.querySelector('.high-score-start-button');
	var highScoreScreen = document.querySelector('.high-scores');
	var closeHighScoreScreenButton = document.querySelector('.hide-score');
	
	createInitialHighScore();
	startButton.focus();
	
	window.addEventListener('keydown', gameControls);
	startButton.addEventListener('click', startGame);
	restartButton.addEventListener('click', restartGame);
	levelUpButton.addEventListener('click', startNewLevel);
	saveHighScoreButton.addEventListener('click', collectUserInfo);
	showHighScoreStartScreenButton.addEventListener('click', showHighScoreScreenFromStart);
	closeHighScoreScreenButton.addEventListener('click', closeHighScoreScreen);
	
	function restartGame() {
	  gameOverScreen.classList.toggle('hidden');
	  resetGameValues();
	  populateMushrooms();
	  character.draw(ctx);
	  activateCentipede();
	}
	
	function startGame() {
	  startScreen.classList.toggle('hidden');
	  gameBoard.classList.toggle('hidden');
	  populateMushrooms();
	  activateCentipede();
	  generateCentipedeSound.play();
	}
	
	function updateGameValues() {
	  document.querySelector('.score-value').innerText = character.score;
	  document.querySelector('.level-value').innerText = character.level;
	  document.querySelector('.lives-value').innerText = character.lives;
	}
	
	function populateMushrooms() {
	  for (var i = 0; i < 12; i++) {
	    var mushroom = new Mushroom();
	
	    mushroom.draw(ctx);
	    mushroomArray.push(mushroom);
	  }
	}
	
	function activateCentipede() {
	  createCentipedeHead();
	  var increment = -30;
	
	  for (var i = 0; i < 9; i++) {
	    var centipede = new Centipede(-10 + increment);
	
	    increment -= 30;
	    centipede.draw(ctx);
	    centipedeArray.push(centipede);
	  }
	  requestAnimationFrame(gameLoop);
	}
	
	function gameLoop() {
	  if (character.lives > 0 && gamePause === false) {
	    updateGameValues();
	    if (characterCentipedeCollision() === true || characterSpiderCollision() === true) {
	      retryLevel();
	    } else if (centipedeArray.length === 0) {
	      levelUp();
	    } else {
	      persistGameLoop();
	    }
	  } else if (character.lives === 0) {
	    gameOver();
	  }
	}
	
	function persistGameLoop() {
	  centipedeMushroomCollision();
	  generateSpider();
	  animateGamePieces();
	  collisionDetection();
	  requestAnimationFrame(gameLoop);
	}
	
	function retryLevel() {
	  gameOverSound.play();
	  character.lives--;
	  centipedeArray = [];
	  spiderArray = [];
	  ctx.clearRect(0, 0, canvas.width, canvas.height);
	  resetCharacterPosition();
	  addSingleCentipedes();
	  activateCentipede();
	}
	
	function resetCharacterPosition() {
	  character.x = 480;
	  character.gunX = character.x - 7;
	  character.gunY = character.y - 10;
	  character.draw(ctx);
	}
	
	function levelUp() {
	  character.level++;
	  character.lives++;
	  character.score += 50;
	  levelUpScreen.classList.toggle('hidden');
	  document.querySelector('.level-value-screen').innerText = character.level;
	  document.querySelector('.new-level-button-text').innerText = character.level;
	}
	
	function gameOver() {
	  var oldHighScore = retrieveScoreFromStorage();
	
	  if (oldHighScore.score < character.score) {
	    overrideDefault = true;
	    document.querySelector('.game-over-high-score').innerText = character.score;
	    newHighScoreScreen.classList.toggle('hidden');
	  } else {
	    gameOverScreen.classList.toggle('hidden');
	    document.querySelector('.game-over-score').innerText = character.score;
	  }
	}
	
	function gameControls(e) {
	  if (gamePause === false) {
	    moveLeft(e);
	    moveRight(e);
	    moveUp(e);
	    moveDown(e);
	    shoot(e);
	    nextLevelCheat(e);
	  }
	  pauseGame(e);
	}
	
	function animateGamePieces() {
	  animateSpider();
	  animateCentipede();
	  animateBullet();
	  animateExplosions(ctx);
	  character.draw(ctx);
	}
	
	function collisionDetection() {
	  characterSpiderCollision();
	  characterCentipedeCollision();
	  bulletCentipedeCollision();
	  bulletMushroomCollision();
	  bulletSpiderCollision();
	  characterMushroomCollision();
	}
	
	function centipedeMushroomCollision() {
	  centipedeArray.forEach(function (segment) {
	    mushroomArray.forEach(function (boomer) {
	      if (boomer.x <= segment.x + segment.radius && boomer.x + boomer.width >= segment.x - segment.radius && segment.y + segment.radius >= boomer.y && segment.y - segment.radius <= boomer.y + boomer.height) {
	        segment.erase(ctx);
	        segment.y += segment.radius * 2 + segment.radius / 2;
	        segment.eyeY += segment.radius * 2 + segment.radius / 2;
	        segment.vx = -segment.vx;
	        segment.eyeX += segment.vx;
	      }
	      boomer.draw(ctx);
	    });
	  });
	}
	
	function bulletCentipedeCollision() {
	  centipedeArray.forEach(function (segment, segmentIndex, segmentArray) {
	    bulletsArray.forEach(function (bullet, bulletIndex, bulletArray) {
	      if (bullet.x <= segment.x + segment.radius && bullet.x + bullet.width >= segment.x - segment.radius && segment.y + segment.radius >= bullet.y && segment.y - segment.radius <= bullet.y + bullet.height) {
	        bullet.erase(ctx);
	        bulletArray.splice(bulletIndex, 1);
	        createExplosion(new ExplosionCentipede(segment.x, segment.y));
	        createHeadForNewCentipede(segmentIndex, segmentArray);
	        segment.erase(ctx);
	        createNewMushroom(segment);
	        segmentArray.splice(segmentIndex, 1);
	        character.score++;
	        centipedeHitSound.play();
	      }
	    });
	  });
	}
	
	function createNewMushroom(segment) {
	  if (segment.y > 50) {
	    var mushroom = new Mushroom(segment.x - segment.radius, segment.y - segment.radius);
	
	    mushroom.erase(ctx);
	    mushroom.draw(ctx);
	    mushroomArray.push(mushroom);
	  }
	}
	
	function createHeadForNewCentipede(segmentIndex, segmentArray) {
	  if (segmentIndex < segmentArray.length - 1) {
	    segmentArray[segmentIndex + 1].hasHead = true;
	  }
	}
	
	function bulletMushroomCollision() {
	  mushroomArray.forEach(function (boomer, boomerIndex, boomerArray) {
	    bulletsArray.forEach(function (bullet, bulletIndex, bulletArray) {
	      if (bullet.x <= boomer.x + boomer.width && bullet.x + bullet.width >= boomer.x && boomer.y + boomer.height >= bullet.y && boomer.y <= bullet.y + bullet.height) {
	        bullet.erase(ctx);
	        bulletArray.splice(bulletIndex, 1);
	        createExplosion(new ExplosionMushroom(boomer.x - boomer.width / 2, boomer.y - boomer.height / 2));
	        bulletMushroomHitCount(boomer, boomerIndex, boomerArray);
	        boomer.erase(ctx);
	        collisionSound.play();
	      }
	    });
	  });
	}
	
	function bulletMushroomHitCount(boomer, boomerIndex, boomerArray) {
	  boomer.hitCount++;
	  if (boomer.hitCount > 2) {
	    boomerArray.splice(boomerIndex, 1);
	    boomer.erase(ctx);
	  }
	}
	
	function characterMushroomCollision() {
	  mushroomArray.forEach(function (boomer) {
	    if (boomer.x + boomer.width >= character.x + character.vx && boomer.x < character.x + character.vx && boomer.y < character.y + character.height && character.y < boomer.y + boomer.height) {
	      character.erase(ctx);
	      character.x += character.vx;
	    } else if (boomer.x + boomer.width > character.x + character.width && boomer.x <= character.x + character.width && boomer.y + boomer.height > character.y && character.y + character.height > boomer.y) {
	      character.erase(ctx);
	      character.x -= character.vx;
	    } else if (character.y + character.vy <= boomer.y + boomer.height && character.y > boomer.y && character.x > boomer.x && character.x + character.width < boomer.x + boomer.width) {
	      character.erase(ctx);
	      character.y -= character.vy;
	    }
	  });
	}
	
	function bulletSpiderCollision() {
	  spiderArray.forEach(function (spidey, spideyIndex, spideyArray) {
	    bulletsArray.forEach(function (bullet, bulletIndex, bulletArray) {
	      if (bullet.x <= spidey.x + spidey.radius && bullet.x + bullet.width >= spidey.x - spidey.radius && spidey.y + spidey.radius >= bullet.y && spidey.y - spidey.radius <= bullet.y + bullet.height) {
	        bullet.erase(ctx);
	        bulletArray.splice(bulletIndex, 1);
	        createExplosion(new ExplosionSpider(spidey.x, spidey.y));
	        spidey.erase(ctx);
	        spideyArray.pop();
	        character.score += 10;
	        collisionSound.play();
	      }
	    });
	  });
	}
	
	function characterCentipedeCollision() {
	  var verify = void 0;
	
	  verify = centipedeArray.reduce(function (boolean, segment) {
	    if (character.x <= segment.x + segment.radius && character.x + character.width >= segment.x - segment.radius && segment.y + segment.radius >= character.y && segment.y - segment.radius <= character.y + character.height) {
	      boolean = true;
	    }
	    return boolean;
	  }, false);
	  return verify;
	}
	
	function characterSpiderCollision() {
	  var verify = void 0;
	
	  verify = spiderArray.reduce(function (boolean, spidey) {
	    if (character.x <= spidey.x + spidey.radius && character.x + character.width >= spidey.x - spidey.radius && spidey.y + spidey.radius >= character.y && spidey.y - spidey.radius <= character.y + character.height) {
	      boolean = true;
	    }
	    return boolean;
	  }, false);
	  return verify;
	}
	
	function moveUp(e) {
	  if (e.keyCode == '38' && character.y - character.vy > 400) {
	    e.preventDefault();
	    character.erase(ctx).moveUp().moveGun();
	  }
	}
	
	function moveLeft(e) {
	  if (e.keyCode == '37' && character.x + character.vx > 0) {
	    e.preventDefault();
	    character.erase(ctx).moveLeft().moveGun();
	  }
	}
	
	function moveRight(e) {
	  if (e.keyCode == '39' && character.x + character.vx + character.width < 1000) {
	    e.preventDefault();
	    character.erase(ctx).moveRight().moveGun();
	  }
	}
	
	function moveDown(e) {
	  if (e.keyCode == '40' && character.y + character.vy < 600) {
	    e.preventDefault();
	    character.erase(ctx).moveDown().moveGun();
	  }
	}
	
	function shoot(e) {
	  if (e.keyCode == '32' && bulletsArray.length < 1) {
	    e.preventDefault();
	    var bullet = new Bullet(character.gunX, character.gunY);
	
	    bullet.draw(ctx);
	    bulletsArray.push(bullet);
	    gunSound.play();
	  }
	}
	
	function pauseGame(e) {
	  if (e.keyCode == '80' && overrideDefault === false) {
	    e.preventDefault();
	    gamePause = !gamePause;
	    gameLoop();
	  }
	}
	
	function nextLevelCheat(e) {
	  if (e.keyCode == '49') {
	    e.preventDefault();
	    centipedeArray = [];
	    ctx.clearRect(0, 0, canvas.width, canvas.height);
	  }
	}
	
	function animateCentipede() {
	  centipedeArray.forEach(function (segment) {
	    segment.erase(ctx).move().draw(ctx);
	  });
	}
	
	function generateSpider() {
	  var number = Math.floor(Math.random() * 350);
	
	  if (number === 15 && spiderArray.length === 0) {
	    var spider = new Spider();
	
	    spiderArray.push(spider);
	    spiderSound.play();
	  }
	}
	
	function animateSpider() {
	  if (spiderArray.length === 1) {
	    spiderArray[0].erase(ctx).move().draw(ctx);
	  }
	}
	
	function animateBullet() {
	  bulletsArray.forEach(function (bullet, index, array) {
	    bullet.erase(ctx).move().draw(ctx);
	    if (bullet.y < 5) {
	      bullet.erase(ctx);
	      array.splice(index, 1);
	    }
	  });
	}
	
	function animateExplosions(ctx) {
	  explosionArray.forEach(function (explosion, index, array) {
	    explosion.erase(ctx).move().draw(ctx);
	    if (explosion.radius > 40) {
	      explosion.erase(ctx);
	      array.splice(index, 1);
	    }
	  });
	}
	
	function createExplosion(type) {
	  var boom = type;
	
	  boom.draw(ctx);
	  explosionArray.push(boom);
	}
	
	function addSingleCentipedes() {
	  if (character.level > 1) {
	    for (var i = 1; i < character.level; i++) {
	      var segment = new Centipede(-10, (Math.floor(Math.random() * 97) + 3) * 10);
	
	      segment.hasHead = true;
	      centipedeArray.push(segment);
	    }
	  }
	}
	
	function startNewLevel() {
	  centipedeArray = [];
	  createCentipedeHead();
	  addSingleCentipedes();
	  activateCentipede();
	  levelUpScreen.classList.toggle('hidden');
	}
	
	function retrieveScoreFromStorage() {
	  var retrievedScore = localStorage.getItem(localStorage.key(0));
	
	  var parsedHighScore = JSON.parse(retrievedScore);
	
	  return parsedHighScore;
	}
	
	function storeNewHighScore(name, score) {
	  var newHighScore = new HighScore(name, score);
	
	  var stringedHighScore = JSON.stringify(newHighScore);
	
	  localStorage.setItem(newHighScore.id, stringedHighScore);
	}
	
	function createInitialHighScore() {
	  if (localStorage.length === 0) {
	    var initialHighScore = new HighScore('initial', character.score);
	
	    var stringedHighScore = JSON.stringify(initialHighScore);
	
	    localStorage.setItem(initialHighScore.id, stringedHighScore);
	  }
	}
	
	function collectUserInfo() {
	  var oldHighScore = retrieveScoreFromStorage();
	
	  localStorage.removeItem(oldHighScore.id);
	  var name = document.querySelector('#name').value;
	
	  storeNewHighScore(name, character.score);
	  newHighScoreScreen.classList.toggle('hidden');
	  startScreen.classList.toggle('hidden');
	  gameBoard.classList.toggle('hidden');
	}
	
	function closeHighScoreScreen() {
	  highScoreScreen.classList.toggle('hidden');
	  startScreen.classList.toggle('hidden');
	}
	
	function showHighScoreScreenFromStart() {
	  startScreen.classList.toggle('hidden');
	  var highScore = retrieveScoreFromStorage();
	
	  document.querySelector('.high-score-name').innerText = highScore.name;
	  document.querySelector('.high-score-value').innerText = highScore.score;
	  highScoreScreen.classList.toggle('hidden');
	}
	
	function createCentipedeHead() {
	  var segment = new Centipede(-10);
	
	  centipedeArray.push(segment);
	  centipedeArray[0].hasHead = true;
	}
	
	function resetGameValues() {
	  centipedeArray = [];
	  mushroomArray = [];
	  character.score = 0;
	  character.level = 1;
	  character.lives = 3;
	}

/***/ }),
/* 1 */
/***/ (function(module, exports) {

	'use strict';
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Mushroom = function () {
	  function Mushroom(x, y) {
	    _classCallCheck(this, Mushroom);
	
	    this.x = x || Math.floor(Math.random() * 910) + 40;
	    this.y = y || Math.floor(Math.random() * 415) + 65;
	    this.width = 30;
	    this.height = 30;
	    this.hitCount = 0;
	  }
	
	  _createClass(Mushroom, [{
	    key: 'draw',
	    value: function draw(ctx) {
	      if (this.hitCount === 0) {
	        ctx.fillStyle = 'transparent';
	        ctx.fillRect(this.x, this.y, this.width, this.height);
	
	        ctx.beginPath();
	        ctx.fillStyle = 'red';
	        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI / 180 * 180, true);
	        ctx.fill();
	        ctx.closePath();
	
	        ctx.beginPath();
	        ctx.fillStyle = 'white';
	        ctx.arc(this.x + 7, this.y + 7, 3, 0, Math.PI / 180 * 360, true);
	        ctx.fill();
	        ctx.closePath();
	
	        ctx.beginPath();
	        ctx.fillStyle = 'white';
	        ctx.arc(this.x + 14, this.y + 3, 3, 0, Math.PI / 180 * 360, true);
	        ctx.fill();
	        ctx.closePath();
	
	        ctx.beginPath();
	        ctx.fillStyle = 'white';
	        ctx.arc(this.x + 23, this.y + 10, 3, 0, Math.PI / 180 * 360, true);
	        ctx.fill();
	        ctx.closePath();
	
	        ctx.fillStyle = 'brown';
	        ctx.fillRect(this.x + this.width / 2 - 4, this.y + this.height / 2, this.width / 3, this.height / 2);
	      } else if (this.hitCount === 1) {
	        ctx.fillStyle = 'transparent';
	        ctx.fillRect(this.x, this.y, this.width, this.height);
	
	        ctx.beginPath();
	        ctx.fillStyle = 'gray';
	        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI / 180 * 150, true);
	        ctx.fill();
	        ctx.closePath();
	
	        ctx.beginPath();
	        ctx.fillStyle = 'white';
	        ctx.arc(this.x + 7, this.y + 7, 3, 0, Math.PI / 180 * 360, true);
	        ctx.fill();
	        ctx.closePath();
	
	        ctx.beginPath();
	        ctx.fillStyle = 'white';
	        ctx.arc(this.x + 14, this.y + 3, 3, 0, Math.PI / 180 * 360, true);
	        ctx.fill();
	        ctx.closePath();
	
	        ctx.beginPath();
	        ctx.fillStyle = 'white';
	        ctx.arc(this.x + 23, this.y + 10, 3, 0, Math.PI / 180 * 360, true);
	        ctx.fill();
	        ctx.closePath();
	
	        ctx.fillStyle = 'gray';
	        ctx.fillRect(this.x + this.width / 2 - 4, this.y + this.height / 2, this.width / 3, this.height / 2);
	      } else if (this.hitCount === 2) {
	        ctx.fillStyle = 'transparent';
	        ctx.fillRect(this.x, this.y, this.width, this.height);
	
	        ctx.beginPath();
	        ctx.fillStyle = 'gray';
	        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI / 180 * 210, true);
	        ctx.fill();
	        ctx.closePath();
	
	        ctx.beginPath();
	        ctx.fillStyle = 'white';
	        ctx.arc(this.x + 7, this.y + 7, 3, 0, Math.PI / 180 * 360, true);
	        ctx.fill();
	        ctx.closePath();
	
	        ctx.beginPath();
	        ctx.fillStyle = 'white';
	        ctx.arc(this.x + 14, this.y + 3, 3, 0, Math.PI / 180 * 360, true);
	        ctx.fill();
	        ctx.closePath();
	
	        ctx.beginPath();
	        ctx.fillStyle = 'white';
	        ctx.arc(this.x + 23, this.y + 10, 3, 0, Math.PI / 180 * 360, true);
	        ctx.fill();
	        ctx.closePath();
	
	        ctx.fillStyle = 'gray';
	        ctx.fillRect(this.x + this.width / 2 - 10, this.y + this.height / 2, this.width / 3, this.height / 2);
	      }
	    }
	  }, {
	    key: 'erase',
	    value: function erase(ctx) {
	      ctx.clearRect(this.x - 20, this.y - 20, this.width + 40, this.height + 40);
	      return this;
	    }
	  }]);
	
	  return Mushroom;
	}();
	
	module.exports = Mushroom;

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	'use strict';
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Centipede = function () {
	  function Centipede(y) {
	    var x = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 500;
	
	    _classCallCheck(this, Centipede);
	
	    this.x = x;
	    this.y = y;
	    this.radius = 15;
	    this.vx = 0;
	    this.vy = 5;
	    this.walk = 6;
	    this.eyeX = this.x + this.vx;
	    this.eyeY = this.y - 5;
	    this.hasHead = false;
	    this.bob = 2;
	  }
	
	  _createClass(Centipede, [{
	    key: 'drawHead',
	    value: function drawHead(ctx) {
	      ctx.beginPath();
	      ctx.fillStyle = 'red';
	      ctx.arc(this.eyeX, this.eyeY + this.bob, this.radius / 4, 0, Math.PI / 180 * 360, false);
	      ctx.fill();
	      ctx.closePath();
	      ctx.save();
	    }
	  }, {
	    key: 'draw',
	    value: function draw(ctx) {
	      ctx.beginPath();
	      ctx.fillStyle = 'green';
	      ctx.arc(this.x, this.y + this.bob, this.radius, 0, Math.PI / 180 * 360, false);
	      ctx.fill();
	      ctx.closePath();
	
	      ctx.beginPath();
	      ctx.fillStyle = 'black';
	      ctx.arc(this.x + this.walk, this.y + 15 + this.bob, this.radius / 2, 0, Math.PI / 180 * 360, false);
	      ctx.fill();
	      ctx.closePath();
	
	      if (this.hasHead === true) {
	        this.drawHead(ctx);
	      }
	
	      if (this.x % 40 === 0) {
	        this.walk = -this.walk;
	      }
	
	      return this;
	    }
	  }, {
	    key: 'move',
	    value: function move() {
	      this.x += this.vx;
	      this.y += this.vy;
	      this.eyeY = this.y - 5;
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
	      return this;
	    }
	  }, {
	    key: 'erase',
	    value: function erase(ctx) {
	      ctx.clearRect(this.x - this.radius, this.y - this.radius - 5, this.radius * 2, this.radius * 2 + 15);
	      return this;
	    }
	  }]);
	
	  return Centipede;
	}();
	
	module.exports = Centipede;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

	'use strict';
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Character = function () {
	  function Character() {
	    _classCallCheck(this, Character);
	
	    this.x = 500;
	    this.y = 510;
	    this.width = 40;
	    this.height = 60;
	    this.vx = 20;
	    this.vy = 95;
	    this.gunX = this.x - 7;
	    this.gunY = this.y - 10;
	    this.lives = 3;
	    this.score = 0;
	    this.level = 1;
	  }
	
	  _createClass(Character, [{
	    key: 'draw',
	    value: function draw(ctx) {
	      ctx.beginPath();
	      ctx.fillStyle = 'transparent';
	      ctx.fillRect(this.x, this.y, this.width, this.height);
	      ctx.closePath();
	
	      ctx.beginPath();
	      ctx.fillStyle = 'tan';
	      ctx.arc(this.x + 20, this.y + 7, this.width / 3, 0, Math.PI / 180 * 360, false);
	      ctx.fill();
	      ctx.closePath();
	
	      ctx.beginPath();
	      ctx.fillStyle = '#FFFFFF';
	      ctx.arc(this.x + 20, this.y + 5, this.width / 3, Math.PI / 180 * 195, Math.PI / 180 * 345, false);
	      ctx.fill();
	      ctx.closePath();
	
	      ctx.beginPath();
	      ctx.strokeStyle = 'black';
	      ctx.lineWidth = 1;
	      ctx.arc(this.x + 20, this.y + 5, this.width / 3, Math.PI / 180 * 195, Math.PI / 180 * 345, false);
	      ctx.closePath();
	      ctx.stroke();
	
	      ctx.fillStyle = 'blue';
	      ctx.font = '4px serif';
	      ctx.fillText('Biggest', this.x + 13, this.y - 3);
	      ctx.fillText('Walleye', this.x + 12, this.y);
	
	      ctx.beginPath();
	      ctx.fillStyle = 'tan';
	      ctx.fillRect(this.x + 5, this.y + 20, this.width - 10, this.height - 30);
	      ctx.closePath();
	
	      ctx.beginPath();
	      ctx.strokeStyle = 'tan';
	      ctx.lineWidth = 8;
	      ctx.moveTo(this.x + 30, this.y + 22);
	      ctx.lineTo(this.x + 50, this.y + 50);
	      ctx.stroke();
	      ctx.closePath();
	
	      ctx.beginPath();
	      ctx.strokeStyle = '#2C3539';
	      ctx.lineWidth = 5;
	      ctx.moveTo(this.x - 3, this.y + 12);
	      ctx.lineTo(this.x - 3, this.y - 10);
	      ctx.stroke();
	      ctx.closePath();
	
	      ctx.beginPath();
	      ctx.strokeStyle = 'tan';
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
	  }, {
	    key: 'moveGun',
	    value: function moveGun() {
	      this.gunX = this.x - 3;
	      this.gunY = this.y - 10;
	      return this;
	    }
	  }, {
	    key: 'moveLeft',
	    value: function moveLeft() {
	      this.x -= this.vx;
	      return this;
	    }
	  }, {
	    key: 'moveRight',
	    value: function moveRight() {
	      this.x += this.vx;
	      return this;
	    }
	  }, {
	    key: 'moveUp',
	    value: function moveUp() {
	      this.y -= this.vy;
	      return this;
	    }
	  }, {
	    key: 'moveDown',
	    value: function moveDown() {
	      this.y += this.vy;
	      return this;
	    }
	  }, {
	    key: 'erase',
	    value: function erase(ctx) {
	      ctx.clearRect(this.x - 19, this.y - 10, this.width + 32, this.height + 35);
	      return this;
	    }
	  }]);
	
	  return Character;
	}();
	
	module.exports = Character;

/***/ }),
/* 4 */
/***/ (function(module, exports) {

	'use strict';
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Bullet = function () {
	  function Bullet(x, y) {
	    _classCallCheck(this, Bullet);
	
	    this.x = x;
	    this.y = y;
	    this.vy = -20;
	    this.height = 10;
	    this.width = 10;
	  }
	
	  _createClass(Bullet, [{
	    key: 'draw',
	    value: function draw(ctx) {
	      ctx.beginPath();
	      ctx.fillStyle = 'transparent';
	      ctx.fillRect(this.x, this.y, this.width, this.height);
	      ctx.closePath();
	
	      ctx.beginPath();
	      ctx.fillStyle = '#2C3539';
	      ctx.fillRect(this.x, this.y - 4, this.width, this.height - 4);
	      ctx.closePath();
	
	      ctx.beginPath();
	      ctx.fillStyle = '#2C3539';
	      ctx.moveTo(this.x + 5, this.y - 10);
	      ctx.lineTo(this.x + 10, this.y - 5);
	      ctx.lineTo(this.x, this.y - 5);
	      ctx.fill();
	
	      return this;
	    }
	  }, {
	    key: 'erase',
	    value: function erase(ctx) {
	      ctx.clearRect(this.x, this.y, this.width, this.height - this.vy);
	      return this;
	    }
	  }, {
	    key: 'move',
	    value: function move() {
	      this.y += this.vy;
	      return this;
	    }
	  }]);
	
	  return Bullet;
	}();
	
	module.exports = Bullet;

/***/ }),
/* 5 */
/***/ (function(module, exports) {

	'use strict';
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Spider = function () {
	  function Spider() {
	    var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : -75;
	    var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 400;
	
	    _classCallCheck(this, Spider);
	
	    this.x = x;
	    this.y = y;
	    this.radius = 20;
	    this.vy = Math.floor(Math.random() * 3) + 1;
	    this.vx = Math.floor(Math.random() * 3) + 1;
	    this.inverse = 1;
	    this.walk = 10;
	  }
	
	  _createClass(Spider, [{
	    key: 'draw',
	    value: function draw(ctx) {
	      ctx.beginPath();
	      ctx.fillStyle = 'transparent';
	      ctx.arc(this.x, this.y, this.radius, 0, Math.PI / 180 * 360, false);
	      ctx.fill();
	      ctx.closePath();
	
	      ctx.beginPath();
	      ctx.fillStyle = '#59362F';
	      ctx.arc(this.x, this.y - 22, this.radius * 2.2, Math.PI / 180 * 30, Math.PI / 180 * 150, false);
	      ctx.fill();
	      ctx.closePath();
	
	      ctx.beginPath();
	      ctx.fillStyle = '#59362F';
	      ctx.arc(this.x, this.y + 22, this.radius * 2.2, Math.PI / 180 * 330, Math.PI / 180 * 210, true);
	      ctx.fill();
	      ctx.closePath();
	
	      ctx.beginPath();
	      ctx.fillStyle = '#880000';
	      ctx.arc(this.x - 10, this.y + 2, this.radius / 3, Math.PI / 180 * 0, Math.PI / 180 * 360, false);
	      ctx.fill();
	      ctx.closePath();
	
	      ctx.beginPath();
	      ctx.fillStyle = '#880000';
	      ctx.arc(this.x + 10, this.y + 2, this.radius / 3, Math.PI / 180 * 0, Math.PI / 180 * 360, false);
	      ctx.fill();
	      ctx.closePath();
	
	      ctx.beginPath();
	      ctx.fillStyle = '#880000';
	      ctx.arc(this.x - 20, this.y - 6, this.radius / 4, Math.PI / 180 * 0, Math.PI / 180 * 360, false);
	      ctx.fill();
	      ctx.closePath();
	
	      ctx.beginPath();
	      ctx.fillStyle = '#880000';
	      ctx.arc(this.x + 20, this.y - 6, this.radius / 4, Math.PI / 180 * 0, Math.PI / 180 * 360, false);
	      ctx.fill();
	      ctx.closePath();
	
	      ctx.beginPath();
	      ctx.fillStyle = '#000000';
	      ctx.moveTo(this.x + 15, this.y + 17);
	      ctx.lineTo(this.x + 5, this.y + 17);
	      ctx.lineTo(this.x + 10, this.y + 27);
	      ctx.fill();
	
	      ctx.beginPath();
	      ctx.fillStyle = '#000000';
	      ctx.moveTo(this.x - 15, this.y + 17);
	      ctx.lineTo(this.x - 5, this.y + 17);
	      ctx.lineTo(this.x - 10, this.y + 27);
	      ctx.fill();
	
	      ctx.beginPath();
	      ctx.strokeStyle = '#000000';
	      ctx.lineWidth = 5;
	      ctx.moveTo(this.x - 23, this.y - 10);
	      ctx.lineTo(this.x - 40, this.y - 30);
	      ctx.lineTo(this.x - 70 + this.walk, this.y + 10);
	      ctx.stroke();
	
	      ctx.beginPath();
	      ctx.strokeStyle = '#000000';
	      ctx.lineWidth = 5;
	      ctx.moveTo(this.x - 27, this.y + 10);
	      ctx.lineTo(this.x - 40, this.y - 10);
	      ctx.lineTo(this.x - 50 - this.walk, this.y + 30);
	      ctx.stroke();
	
	      ctx.beginPath();
	      ctx.strokeStyle = '#000000';
	      ctx.lineWidth = 5;
	      ctx.moveTo(this.x + 23, this.y - 10);
	      ctx.lineTo(this.x + 40, this.y - 30);
	      ctx.lineTo(this.x + 70 - this.walk, this.y + 10);
	      ctx.stroke();
	
	      ctx.beginPath();
	      ctx.strokeStyle = '#000000';
	      ctx.lineWidth = 5;
	      ctx.moveTo(this.x + 27, this.y + 10);
	      ctx.lineTo(this.x + 40, this.y - 10);
	      ctx.lineTo(this.x + 50 + this.walk, this.y + 30);
	      ctx.stroke();
	
	      ctx.beginPath();
	      ctx.strokeStyle = '#000000';
	      ctx.lineWidth = 3;
	      ctx.moveTo(this.x - 3, this.y + 1);
	      ctx.lineTo(this.x - 12, this.y - 6);
	      ctx.stroke();
	
	      ctx.beginPath();
	      ctx.strokeStyle = '#000000';
	      ctx.lineWidth = 3;
	      ctx.moveTo(this.x + 3, this.y + 1);
	      ctx.lineTo(this.x + 12, this.y - 6);
	      ctx.stroke();
	    }
	  }, {
	    key: 'move',
	    value: function move() {
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
	        this.vy = Math.floor(Math.random() * 3) * this.inverse;
	      }
	
	      if (this.x % 5 === 0) {
	        this.walk = -this.walk;
	      }
	
	      return this;
	    }
	  }, {
	    key: 'erase',
	    value: function erase(ctx) {
	      ctx.clearRect(this.x - 83, this.y - 35, 165, 66);
	      return this;
	    }
	  }]);
	
	  return Spider;
	}();
	
	module.exports = Spider;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var Explosion = __webpack_require__(7);
	
	var ExplosionMushroom = function (_Explosion) {
	  _inherits(ExplosionMushroom, _Explosion);
	
	  function ExplosionMushroom(x, y) {
	    _classCallCheck(this, ExplosionMushroom);
	
	    var _this = _possibleConstructorReturn(this, (ExplosionMushroom.__proto__ || Object.getPrototypeOf(ExplosionMushroom)).call(this, x, y));
	
	    _this.red = 'rgba(255, 0, 0, 0.5)';
	    _this.yellow = 'rgba(255,255,0, 0.5)';
	    return _this;
	  }
	
	  _createClass(ExplosionMushroom, [{
	    key: 'draw',
	    value: function draw(ctx) {
	      ctx.beginPath();
	      ctx.fillStyle = this.red;
	      ctx.arc(this.x, this.y, this.radius / 2, 0, Math.PI / 180 * 360, false);
	      ctx.fill();
	      ctx.closePath();
	
	      ctx.beginPath();
	      ctx.fillStyle = this.yellow;
	      ctx.arc(this.x, this.y, this.radius, 0, Math.PI / 180 * 360, false);
	      ctx.fill();
	      ctx.closePath();
	
	      return this;
	    }
	  }]);
	
	  return ExplosionMushroom;
	}(Explosion);
	
	module.exports = ExplosionMushroom;

/***/ }),
/* 7 */
/***/ (function(module, exports) {

	"use strict";
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Explosion = function () {
	  function Explosion(x, y) {
	    _classCallCheck(this, Explosion);
	
	    this.x = x;
	    this.y = y;
	    this.radius = 4;
	    this.expand = 3;
	  }
	
	  _createClass(Explosion, [{
	    key: "draw",
	    value: function draw(ctx) {
	      ctx.beginPath();
	      ctx.fillStyle = this.red;
	      ctx.arc(this.x, this.y, this.radius / 2, 0, Math.PI / 180 * 360, false);
	      ctx.fill();
	      ctx.closePath();
	
	      ctx.beginPath();
	      ctx.fillStyle = this.yellow;
	      ctx.arc(this.x, this.y, this.radius, 0, Math.PI / 180 * 360, false);
	      ctx.fill();
	      ctx.closePath();
	
	      return this;
	    }
	  }, {
	    key: "move",
	    value: function move() {
	      this.radius += this.expand;
	      return this;
	    }
	  }, {
	    key: "erase",
	    value: function erase(ctx) {
	      ctx.clearRect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
	      return this;
	    }
	  }]);
	
	  return Explosion;
	}();
	
	module.exports = Explosion;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var Explosion = __webpack_require__(7);
	
	var ExplosionCentipede = function (_Explosion) {
	  _inherits(ExplosionCentipede, _Explosion);
	
	  function ExplosionCentipede(x, y) {
	    _classCallCheck(this, ExplosionCentipede);
	
	    var _this = _possibleConstructorReturn(this, (ExplosionCentipede.__proto__ || Object.getPrototypeOf(ExplosionCentipede)).call(this, x, y));
	
	    _this.lightGreen = '#B5DA45';
	    _this.darkGreen = 'darkgreen';
	    return _this;
	  }
	
	  _createClass(ExplosionCentipede, [{
	    key: 'draw',
	    value: function draw(ctx) {
	      ctx.beginPath();
	      ctx.fillStyle = this.darkGreen;
	      ctx.arc(this.x, this.y, this.radius / 2, 0, Math.PI / 180 * 360, false);
	      ctx.fill();
	      ctx.closePath();
	
	      ctx.beginPath();
	      ctx.fillStyle = this.lightGreen;
	      ctx.arc(this.x, this.y, this.radius, 0, Math.PI / 180 * 360, false);
	      ctx.fill();
	      ctx.closePath();
	
	      return this;
	    }
	  }]);
	
	  return ExplosionCentipede;
	}(Explosion);
	
	module.exports = ExplosionCentipede;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var Explosion = __webpack_require__(7);
	
	var ExplosionSpider = function (_Explosion) {
	  _inherits(ExplosionSpider, _Explosion);
	
	  function ExplosionSpider(x, y) {
	    _classCallCheck(this, ExplosionSpider);
	
	    var _this = _possibleConstructorReturn(this, (ExplosionSpider.__proto__ || Object.getPrototypeOf(ExplosionSpider)).call(this, x, y));
	
	    _this.red = '#880000';
	    _this.brown = '#59362F';
	    return _this;
	  }
	
	  _createClass(ExplosionSpider, [{
	    key: 'draw',
	    value: function draw(ctx) {
	      ctx.beginPath();
	      ctx.fillStyle = this.red;
	      ctx.arc(this.x, this.y, this.radius / 2, 0, Math.PI / 180 * 360, false);
	      ctx.fill();
	      ctx.closePath();
	
	      ctx.beginPath();
	      ctx.fillStyle = this.brown;
	      ctx.arc(this.x, this.y, this.radius, 0, Math.PI / 180 * 360, false);
	      ctx.fill();
	      ctx.closePath();
	
	      return this;
	    }
	  }]);
	
	  return ExplosionSpider;
	}(Explosion);
	
	module.exports = ExplosionSpider;

/***/ }),
/* 10 */
/***/ (function(module, exports) {

	"use strict";
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var HighScore = function HighScore(name, score) {
	  _classCallCheck(this, HighScore);
	
	  this.id = Date.now();
	  this.name = name;
	  this.score = score;
	};
	
	module.exports = HighScore;

/***/ }),
/* 11 */
/***/ (function(module, exports) {

	"use strict";
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Sound = function () {
	  function Sound(src) {
	    _classCallCheck(this, Sound);
	
	    this.sound = document.createElement("audio");
	    this.sound.src = src;
	    this.sound.setAttribute("preload", "auto");
	    this.sound.setAttribute("controls", "none");
	    this.sound.style.display = "none";
	    document.body.appendChild(this.sound);
	  }
	
	  _createClass(Sound, [{
	    key: "stop",
	    value: function stop() {
	      this.sound.pause();
	      return this;
	    }
	  }, {
	    key: "play",
	    value: function play() {
	      this.sound.play();
	      return this;
	    }
	  }]);
	
	  return Sound;
	}();
	
	module.exports = Sound;

/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgODc1MWE4MjQwNDhlMmEzNzc1OTEiLCJ3ZWJwYWNrOi8vLy4vbGliL2luZGV4LmpzIiwid2VicGFjazovLy8uL2xpYi9NdXNocm9vbS5qcyIsIndlYnBhY2s6Ly8vLi9saWIvQ2VudGlwZWRlLmpzIiwid2VicGFjazovLy8uL2xpYi9DaGFyYWN0ZXIuanMiLCJ3ZWJwYWNrOi8vLy4vbGliL0J1bGxldC5qcyIsIndlYnBhY2s6Ly8vLi9saWIvU3BpZGVyLmpzIiwid2VicGFjazovLy8uL2xpYi9FeHBsb3Npb24tTXVzaHJvb20uanMiLCJ3ZWJwYWNrOi8vLy4vbGliL0V4cGxvc2lvbi5qcyIsIndlYnBhY2s6Ly8vLi9saWIvRXhwbG9zaW9uLUNlbnRpcGVkZS5qcyIsIndlYnBhY2s6Ly8vLi9saWIvRXhwbG9zaW9uLVNwaWRlci5qcyIsIndlYnBhY2s6Ly8vLi9saWIvSGlnaC1TY29yZS5qcyIsIndlYnBhY2s6Ly8vLi9saWIvU291bmQuanMiXSwibmFtZXMiOlsiTXVzaHJvb20iLCJyZXF1aXJlIiwiQ2VudGlwZWRlIiwiQ2hhcmFjdGVyIiwiQnVsbGV0IiwiU3BpZGVyIiwiRXhwbG9zaW9uTXVzaHJvb20iLCJFeHBsb3Npb25DZW50aXBlZGUiLCJFeHBsb3Npb25TcGlkZXIiLCJIaWdoU2NvcmUiLCJTb3VuZCIsImNoYXJhY3RlciIsImNhbnZhcyIsImRvY3VtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJjdHgiLCJnZXRDb250ZXh0IiwiYnVsbGV0c0FycmF5IiwiY2VudGlwZWRlQXJyYXkiLCJtdXNocm9vbUFycmF5Iiwic3BpZGVyQXJyYXkiLCJleHBsb3Npb25BcnJheSIsIm92ZXJyaWRlRGVmYXVsdCIsImdhbWVQYXVzZSIsImd1blNvdW5kIiwic3BpZGVyU291bmQiLCJnZW5lcmF0ZUNlbnRpcGVkZVNvdW5kIiwiZ2FtZU92ZXJTb3VuZCIsImNlbnRpcGVkZUhpdFNvdW5kIiwiY29sbGlzaW9uU291bmQiLCJnYW1lQm9hcmQiLCJxdWVyeVNlbGVjdG9yIiwic3RhcnRTY3JlZW4iLCJzdGFydEJ1dHRvbiIsImxldmVsVXBTY3JlZW4iLCJnYW1lT3ZlclNjcmVlbiIsInJlc3RhcnRCdXR0b24iLCJsZXZlbFVwQnV0dG9uIiwibmV3SGlnaFNjb3JlU2NyZWVuIiwic2F2ZUhpZ2hTY29yZUJ1dHRvbiIsInNob3dIaWdoU2NvcmVTdGFydFNjcmVlbkJ1dHRvbiIsImhpZ2hTY29yZVNjcmVlbiIsImNsb3NlSGlnaFNjb3JlU2NyZWVuQnV0dG9uIiwiY3JlYXRlSW5pdGlhbEhpZ2hTY29yZSIsImZvY3VzIiwid2luZG93IiwiYWRkRXZlbnRMaXN0ZW5lciIsImdhbWVDb250cm9scyIsInN0YXJ0R2FtZSIsInJlc3RhcnRHYW1lIiwic3RhcnROZXdMZXZlbCIsImNvbGxlY3RVc2VySW5mbyIsInNob3dIaWdoU2NvcmVTY3JlZW5Gcm9tU3RhcnQiLCJjbG9zZUhpZ2hTY29yZVNjcmVlbiIsImNsYXNzTGlzdCIsInRvZ2dsZSIsInJlc2V0R2FtZVZhbHVlcyIsInBvcHVsYXRlTXVzaHJvb21zIiwiZHJhdyIsImFjdGl2YXRlQ2VudGlwZWRlIiwicGxheSIsInVwZGF0ZUdhbWVWYWx1ZXMiLCJpbm5lclRleHQiLCJzY29yZSIsImxldmVsIiwibGl2ZXMiLCJpIiwibXVzaHJvb20iLCJwdXNoIiwiY3JlYXRlQ2VudGlwZWRlSGVhZCIsImluY3JlbWVudCIsImNlbnRpcGVkZSIsInJlcXVlc3RBbmltYXRpb25GcmFtZSIsImdhbWVMb29wIiwiY2hhcmFjdGVyQ2VudGlwZWRlQ29sbGlzaW9uIiwiY2hhcmFjdGVyU3BpZGVyQ29sbGlzaW9uIiwicmV0cnlMZXZlbCIsImxlbmd0aCIsImxldmVsVXAiLCJwZXJzaXN0R2FtZUxvb3AiLCJnYW1lT3ZlciIsImNlbnRpcGVkZU11c2hyb29tQ29sbGlzaW9uIiwiZ2VuZXJhdGVTcGlkZXIiLCJhbmltYXRlR2FtZVBpZWNlcyIsImNvbGxpc2lvbkRldGVjdGlvbiIsImNsZWFyUmVjdCIsIndpZHRoIiwiaGVpZ2h0IiwicmVzZXRDaGFyYWN0ZXJQb3NpdGlvbiIsImFkZFNpbmdsZUNlbnRpcGVkZXMiLCJ4IiwiZ3VuWCIsImd1blkiLCJ5Iiwib2xkSGlnaFNjb3JlIiwicmV0cmlldmVTY29yZUZyb21TdG9yYWdlIiwiZSIsIm1vdmVMZWZ0IiwibW92ZVJpZ2h0IiwibW92ZVVwIiwibW92ZURvd24iLCJzaG9vdCIsIm5leHRMZXZlbENoZWF0IiwicGF1c2VHYW1lIiwiYW5pbWF0ZVNwaWRlciIsImFuaW1hdGVDZW50aXBlZGUiLCJhbmltYXRlQnVsbGV0IiwiYW5pbWF0ZUV4cGxvc2lvbnMiLCJidWxsZXRDZW50aXBlZGVDb2xsaXNpb24iLCJidWxsZXRNdXNocm9vbUNvbGxpc2lvbiIsImJ1bGxldFNwaWRlckNvbGxpc2lvbiIsImNoYXJhY3Rlck11c2hyb29tQ29sbGlzaW9uIiwiZm9yRWFjaCIsImJvb21lciIsInNlZ21lbnQiLCJyYWRpdXMiLCJlcmFzZSIsImV5ZVkiLCJ2eCIsImV5ZVgiLCJzZWdtZW50SW5kZXgiLCJzZWdtZW50QXJyYXkiLCJidWxsZXQiLCJidWxsZXRJbmRleCIsImJ1bGxldEFycmF5Iiwic3BsaWNlIiwiY3JlYXRlRXhwbG9zaW9uIiwiY3JlYXRlSGVhZEZvck5ld0NlbnRpcGVkZSIsImNyZWF0ZU5ld011c2hyb29tIiwiaGFzSGVhZCIsImJvb21lckluZGV4IiwiYm9vbWVyQXJyYXkiLCJidWxsZXRNdXNocm9vbUhpdENvdW50IiwiaGl0Q291bnQiLCJ2eSIsInNwaWRleSIsInNwaWRleUluZGV4Iiwic3BpZGV5QXJyYXkiLCJwb3AiLCJ2ZXJpZnkiLCJyZWR1Y2UiLCJib29sZWFuIiwia2V5Q29kZSIsInByZXZlbnREZWZhdWx0IiwibW92ZUd1biIsIm1vdmUiLCJudW1iZXIiLCJNYXRoIiwiZmxvb3IiLCJyYW5kb20iLCJzcGlkZXIiLCJpbmRleCIsImFycmF5IiwiZXhwbG9zaW9uIiwidHlwZSIsImJvb20iLCJyZXRyaWV2ZWRTY29yZSIsImxvY2FsU3RvcmFnZSIsImdldEl0ZW0iLCJrZXkiLCJwYXJzZWRIaWdoU2NvcmUiLCJKU09OIiwicGFyc2UiLCJzdG9yZU5ld0hpZ2hTY29yZSIsIm5hbWUiLCJuZXdIaWdoU2NvcmUiLCJzdHJpbmdlZEhpZ2hTY29yZSIsInN0cmluZ2lmeSIsInNldEl0ZW0iLCJpZCIsImluaXRpYWxIaWdoU2NvcmUiLCJyZW1vdmVJdGVtIiwidmFsdWUiLCJoaWdoU2NvcmUiLCJmaWxsU3R5bGUiLCJmaWxsUmVjdCIsImJlZ2luUGF0aCIsImFyYyIsIlBJIiwiZmlsbCIsImNsb3NlUGF0aCIsIm1vZHVsZSIsImV4cG9ydHMiLCJ3YWxrIiwiYm9iIiwic2F2ZSIsImRyYXdIZWFkIiwic3Ryb2tlU3R5bGUiLCJsaW5lV2lkdGgiLCJzdHJva2UiLCJmb250IiwiZmlsbFRleHQiLCJtb3ZlVG8iLCJsaW5lVG8iLCJpbnZlcnNlIiwiRXhwbG9zaW9uIiwicmVkIiwieWVsbG93IiwiZXhwYW5kIiwibGlnaHRHcmVlbiIsImRhcmtHcmVlbiIsImJyb3duIiwiRGF0ZSIsIm5vdyIsInNyYyIsInNvdW5kIiwiY3JlYXRlRWxlbWVudCIsInNldEF0dHJpYnV0ZSIsInN0eWxlIiwiZGlzcGxheSIsImJvZHkiLCJhcHBlbmRDaGlsZCIsInBhdXNlIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsdUJBQWU7QUFDZjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7O0FDdENBLEtBQU1BLFdBQVcsbUJBQUFDLENBQVEsQ0FBUixDQUFqQjtBQUNBLEtBQU1DLFlBQVksbUJBQUFELENBQVEsQ0FBUixDQUFsQjtBQUNBLEtBQU1FLFlBQVksbUJBQUFGLENBQVEsQ0FBUixDQUFsQjtBQUNBLEtBQU1HLFNBQVMsbUJBQUFILENBQVEsQ0FB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QWEySixJQUFiLEVBQW1CckcsS0FBbkIsRUFBMEI7QUFBQTs7QUFDeEIsUUFBSzBHLEVBQUwsR0FBVWlDLEtBQUtDLEdBQUwsRUFBVjtBQUNBLFFBQUt2QyxJQUFMLEdBQVlBLElBQVo7QUFDQSxRQUFLckcsS0FBTCxHQUFhQSxLQUFiO0FBQ0QsRTs7QUFHSHNILFFBQU9DLE9BQVAsR0FBaUI3SyxTQUFqQixDOzs7Ozs7Ozs7Ozs7S0NSTUMsSztBQUNKLGtCQUFZa00sR0FBWixFQUFpQjtBQUFBOztBQUNmLFVBQUtDLEtBQUwsR0FBYWhNLFNBQVNpTSxhQUFULENBQXVCLE9BQXZCLENBQWI7QUFDQSxVQUFLRCxLQUFMLENBQVdELEdBQVgsR0FBaUJBLEdBQWpCO0FBQ0EsVUFBS0MsS0FBTCxDQUFXRSxZQUFYLENBQXdCLFNBQXhCLEVBQW1DLE1BQW5DO0FBQ0EsVUFBS0YsS0FBTCxDQUFXRSxZQUFYLENBQXdCLFVBQXhCLEVBQW9DLE1BQXBDO0FBQ0EsVUFBS0YsS0FBTCxDQUFXRyxLQUFYLENBQWlCQyxPQUFqQixHQUEyQixNQUEzQjtBQUNBcE0sY0FBU3FNLElBQVQsQ0FBY0MsV0FBZCxDQUEwQixLQUFLTixLQUEvQjtBQUNEOzs7OzRCQUVNO0FBQ0wsWUFBS0EsS0FBTCxDQUFXTyxLQUFYO0FBQ0EsY0FBTyxJQUFQO0FBQ0Q7Ozs0QkFFSztBQUNKLFlBQUtQLEtBQUwsQ0FBV2pKLElBQVg7QUFDQSxjQUFPLElBQVA7QUFDRDs7Ozs7O0FBR0h5SCxRQUFPQyxPQUFQLEdBQWlCNUssS0FBakIsQyIsImZpbGUiOiJtYWluLmJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKVxuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuXG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRleHBvcnRzOiB7fSxcbiBcdFx0XHRpZDogbW9kdWxlSWQsXG4gXHRcdFx0bG9hZGVkOiBmYWxzZVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sb2FkZWQgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIDg3NTFhODI0MDQ4ZTJhMzc3NTkxIiwiY29uc3QgTXVzaHJvb20gPSByZXF1aXJlKCcuL011c2hyb29tLmpzJyk7XG5jb25zdCBDZW50aXBlZGUgPSByZXF1aXJlKCcuL0NlbnRpcGVkZS5qcycpO1xuY29uc3QgQ2hhcmFjdGVyID0gcmVxdWlyZSgnLi9DaGFyYWN0ZXIuanMnKTtcbmNvbnN0IEJ1bGxldCA9IHJlcXVpcmUoJy4vQnVsbGV0LmpzJyk7XG5jb25zdCBTcGlkZXIgPSByZXF1aXJlKCcuL1NwaWRlci5qcycpO1xuY29uc3QgRXhwbG9zaW9uTXVzaHJvb20gPSByZXF1aXJlKCcuL0V4cGxvc2lvbi1NdXNocm9vbS5qcycpO1xuY29uc3QgRXhwbG9zaW9uQ2VudGlwZWRlID0gcmVxdWlyZSgnLi9FeHBsb3Npb24tQ2VudGlwZWRlLmpzJyk7XG5jb25zdCBFeHBsb3Npb25TcGlkZXIgPSByZXF1aXJlKCcuL0V4cGxvc2lvbi1TcGlkZXIuanMnKTtcbmNvbnN0IEhpZ2hTY29yZSA9IHJlcXVpcmUoJy4vSGlnaC1TY29yZS5qcycpO1xuY29uc3QgU291bmQgPSByZXF1aXJlKCcuL1NvdW5kLmpzJylcblxuY29uc3QgY2hhcmFjdGVyID0gbmV3IENoYXJhY3RlcigpO1xuY29uc3QgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhbWUnKTtcbmNvbnN0IGN0eCA9ICBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbmNvbnN0IGJ1bGxldHNBcnJheSA9IFtdO1xubGV0IGNlbnRpcGVkZUFycmF5ID0gW107XG5sZXQgbXVzaHJvb21BcnJheSA9IFtdO1xubGV0IHNwaWRlckFycmF5ID0gW107XG5sZXQgZXhwbG9zaW9uQXJyYXkgPSBbXTtcbmxldCBvdmVycmlkZURlZmF1bHQgPSBmYWxzZTtcbmxldCBnYW1lUGF1c2UgPSBmYWxzZTtcbmxldCBndW5Tb3VuZCA9IG5ldyBTb3VuZCgnLi4vc291bmRzL0xhc2VyX1Nob290MS53YXYnKVxubGV0IHNwaWRlclNvdW5kID0gbmV3IFNvdW5kKCcuLi9zb3VuZHMvRW1lcmdlMTEud2F2JylcbmxldCBnZW5lcmF0ZUNlbnRpcGVkZVNvdW5kID0gbmV3IFNvdW5kKCcuLi9zb3VuZHMvRXhwbG9zaW9uMS53YXYnKVxubGV0IGdhbWVPdmVyU291bmQgPSBuZXcgU291bmQoJy4uL3NvdW5kcy9TaHV0X0Rvd24xLndhdicpXG5sZXQgY2VudGlwZWRlSGl0U291bmQgPSBuZXcgU291bmQoJy4uL3NvdW5kcy9FeHBsb3Npb24yLndhdicpXG5sZXQgY29sbGlzaW9uU291bmQgPSBuZXcgU291bmQoJy4uL3NvdW5kcy9FeHBsb3Npb242LndhdicpO1xuXG5cbmNvbnN0IGdhbWVCb2FyZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5nYW1lLWJhY2tncm91bmQnKTtcbmNvbnN0IHN0YXJ0U2NyZWVuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnN0YXJ0LXNjcmVlbicpO1xuY29uc3Qgc3RhcnRCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc3RhcnQtYnV0dG9uJyk7XG5jb25zdCBsZXZlbFVwU2NyZWVuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmxldmVsLXVwJyk7XG5jb25zdCBnYW1lT3ZlclNjcmVlbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5nYW1lLW92ZXInKTtcbmNvbnN0IHJlc3RhcnRCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucmVzdGFydC1idXR0b24nKTtcbmNvbnN0IGxldmVsVXBCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubmV3LWxldmVsLWJ1dHRvbicpO1xuY29uc3QgbmV3SGlnaFNjb3JlU2NyZWVuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm5ldy1oaWdoLXNjb3JlJyk7XG5jb25zdCBzYXZlSGlnaFNjb3JlQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnN1Ym1pdC1oaWdoLXNjb3JlLWJ1dHRvbicpO1xuY29uc3Qgc2hvd0hpZ2hTY29yZVN0YXJ0U2NyZWVuQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmhpZ2gtc2NvcmUtc3RhcnQtYnV0dG9uJyk7XG5jb25zdCBoaWdoU2NvcmVTY3JlZW4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuaGlnaC1zY29yZXMnKTtcbmNvbnN0IGNsb3NlSGlnaFNjb3JlU2NyZWVuQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmhpZGUtc2NvcmUnKTtcblxuY3JlYXRlSW5pdGlhbEhpZ2hTY29yZSgpO1xuc3RhcnRCdXR0b24uZm9jdXMoKTtcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBnYW1lQ29udHJvbHMpO1xuc3RhcnRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzdGFydEdhbWUpO1xucmVzdGFydEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHJlc3RhcnRHYW1lKTtcbmxldmVsVXBCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzdGFydE5ld0xldmVsKTtcbnNhdmVIaWdoU2NvcmVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjb2xsZWN0VXNlckluZm8pO1xuc2hvd0hpZ2hTY29yZVN0YXJ0U2NyZWVuQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2hvd0hpZ2hTY29yZVNjcmVlbkZyb21TdGFydCk7XG5jbG9zZUhpZ2hTY29yZVNjcmVlbkJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNsb3NlSGlnaFNjb3JlU2NyZWVuKTtcblxuXG5mdW5jdGlvbiByZXN0YXJ0R2FtZSgpIHtcbiAgZ2FtZU92ZXJTY3JlZW4uY2xhc3NMaXN0LnRvZ2dsZSgnaGlkZGVuJyk7XG4gIHJlc2V0R2FtZVZhbHVlcygpO1xuICBwb3B1bGF0ZU11c2hyb29tcygpO1xuICBjaGFyYWN0ZXIuZHJhdyhjdHgpO1xuICBhY3RpdmF0ZUNlbnRpcGVkZSgpO1xufVxuXG5mdW5jdGlvbiBzdGFydEdhbWUoKSB7XG4gIHN0YXJ0U2NyZWVuLmNsYXNzTGlzdC50b2dnbGUoJ2hpZGRlbicpO1xuICBnYW1lQm9hcmQuY2xhc3NMaXN0LnRvZ2dsZSgnaGlkZGVuJyk7XG4gIHBvcHVsYXRlTXVzaHJvb21zKCk7XG4gIGFjdGl2YXRlQ2VudGlwZWRlKCk7XG4gIGdlbmVyYXRlQ2VudGlwZWRlU291bmQucGxheSgpO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVHYW1lVmFsdWVzKCkge1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2NvcmUtdmFsdWUnKS5pbm5lclRleHQgPSBjaGFyYWN0ZXIuc2NvcmVcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmxldmVsLXZhbHVlJykuaW5uZXJUZXh0ID0gY2hhcmFjdGVyLmxldmVsO1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubGl2ZXMtdmFsdWUnKS5pbm5lclRleHQgPSBjaGFyYWN0ZXIubGl2ZXM7XG59XG5cbmZ1bmN0aW9uIHBvcHVsYXRlTXVzaHJvb21zKCkge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IDEyOyBpKyspIHtcbiAgICBsZXQgbXVzaHJvb20gPSBuZXcgTXVzaHJvb20oKTtcblxuICAgIG11c2hyb29tLmRyYXcoY3R4KTtcbiAgICBtdXNocm9vbUFycmF5LnB1c2gobXVzaHJvb20pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFjdGl2YXRlQ2VudGlwZWRlKCkge1xuICBjcmVhdGVDZW50aXBlZGVIZWFkKCk7XG4gIHZhciBpbmNyZW1lbnQgPSAtMzA7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCA5OyBpKyspIHtcbiAgICBsZXQgY2VudGlwZWRlID0gbmV3IENlbnRpcGVkZSgtMTAgKyBpbmNyZW1lbnQpO1xuXG4gICAgaW5jcmVtZW50IC09IDMwO1xuICAgIGNlbnRpcGVkZS5kcmF3KGN0eCk7XG4gICAgY2VudGlwZWRlQXJyYXkucHVzaChjZW50aXBlZGUpO1xuICB9XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZShnYW1lTG9vcCk7XG59XG5cbmZ1bmN0aW9uIGdhbWVMb29wKCkge1xuICBpZiAoY2hhcmFjdGVyLmxpdmVzID4gMCAmJiBnYW1lUGF1c2UgPT09IGZhbHNlICkge1xuICAgIHVwZGF0ZUdhbWVWYWx1ZXMoKTtcbiAgICBpZiAoY2hhcmFjdGVyQ2VudGlwZWRlQ29sbGlzaW9uKCkgPT09IHRydWUgXG4gICAgICB8fCBjaGFyYWN0ZXJTcGlkZXJDb2xsaXNpb24oKSA9PT0gdHJ1ZSkge1xuICAgICAgcmV0cnlMZXZlbCgpO1xuICAgIH0gZWxzZSBpZiAoY2VudGlwZWRlQXJyYXkubGVuZ3RoID09PSAwKSB7XG4gICAgICBsZXZlbFVwKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBlcnNpc3RHYW1lTG9vcCgpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChjaGFyYWN0ZXIubGl2ZXMgPT09IDApIHtcbiAgICBnYW1lT3ZlcigpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHBlcnNpc3RHYW1lTG9vcCAoKSB7XG4gIGNlbnRpcGVkZU11c2hyb29tQ29sbGlzaW9uKCk7XG4gIGdlbmVyYXRlU3BpZGVyKCk7XG4gIGFuaW1hdGVHYW1lUGllY2VzKCk7XG4gIGNvbGxpc2lvbkRldGVjdGlvbigpO1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZ2FtZUxvb3ApO1xufVxuXG5mdW5jdGlvbiByZXRyeUxldmVsICgpIHtcbiAgZ2FtZU92ZXJTb3VuZC5wbGF5KClcbiAgY2hhcmFjdGVyLmxpdmVzLS07XG4gIGNlbnRpcGVkZUFycmF5ID0gW107XG4gIHNwaWRlckFycmF5ID0gW107XG4gIGN0eC5jbGVhclJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcbiAgcmVzZXRDaGFyYWN0ZXJQb3NpdGlvbigpO1xuICBhZGRTaW5nbGVDZW50aXBlZGVzKCk7XG4gIGFjdGl2YXRlQ2VudGlwZWRlKCk7XG59XG5cbmZ1bmN0aW9uIHJlc2V0Q2hhcmFjdGVyUG9zaXRpb24gKCkge1xuICBjaGFyYWN0ZXIueCA9IDQ4MDtcbiAgY2hhcmFjdGVyLmd1blggPSBjaGFyYWN0ZXIueCAtIDc7XG4gIGNoYXJhY3Rlci5ndW5ZID0gY2hhcmFjdGVyLnkgLSAxMDtcbiAgY2hhcmFjdGVyLmRyYXcoY3R4KTtcbn1cblxuZnVuY3Rpb24gbGV2ZWxVcCAoKSB7XG4gIGNoYXJhY3Rlci5sZXZlbCsrO1xuICBjaGFyYWN0ZXIubGl2ZXMrKztcbiAgY2hhcmFjdGVyLnNjb3JlICs9IDUwO1xuICBsZXZlbFVwU2NyZWVuLmNsYXNzTGlzdC50b2dnbGUoJ2hpZGRlbicpO1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubGV2ZWwtdmFsdWUtc2NyZWVuJykuaW5uZXJUZXh0ID0gY2hhcmFjdGVyLmxldmVsO1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubmV3LWxldmVsLWJ1dHRvbi10ZXh0JykuaW5uZXJUZXh0ID0gY2hhcmFjdGVyLmxldmVsO1xufVxuXG5mdW5jdGlvbiBnYW1lT3ZlciAoKSB7XG4gIGxldCBvbGRIaWdoU2NvcmUgPSByZXRyaWV2ZVNjb3JlRnJvbVN0b3JhZ2UoKTtcblxuICBpZiAob2xkSGlnaFNjb3JlLnNjb3JlIDwgY2hhcmFjdGVyLnNjb3JlKSB7XG4gICAgb3ZlcnJpZGVEZWZhdWx0ID0gdHJ1ZTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZ2FtZS1vdmVyLWhpZ2gtc2NvcmUnKS5pbm5lclRleHQgPSBjaGFyYWN0ZXIuc2NvcmU7XG4gICAgbmV3SGlnaFNjb3JlU2NyZWVuLmNsYXNzTGlzdC50b2dnbGUoJ2hpZGRlbicpO1xuICB9IGVsc2Uge1xuICAgIGdhbWVPdmVyU2NyZWVuLmNsYXNzTGlzdC50b2dnbGUoJ2hpZGRlbicpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5nYW1lLW92ZXItc2NvcmUnKS5pbm5lclRleHQgPSBjaGFyYWN0ZXIuc2NvcmU7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2FtZUNvbnRyb2xzKGUpIHtcbiAgaWYgKGdhbWVQYXVzZSA9PT0gZmFsc2UpIHtcbiAgICBtb3ZlTGVmdChlKTtcbiAgICBtb3ZlUmlnaHQoZSk7XG4gICAgbW92ZVVwKGUpO1xuICAgIG1vdmVEb3duKGUpOyAgXG4gICAgc2hvb3QoZSk7XG4gICAgbmV4dExldmVsQ2hlYXQoZSk7XG4gIH1cbiAgcGF1c2VHYW1lKGUpO1xufVxuXG5mdW5jdGlvbiBhbmltYXRlR2FtZVBpZWNlcygpIHtcbiAgYW5pbWF0ZVNwaWRlcigpO1xuICBhbmltYXRlQ2VudGlwZWRlKCk7XG4gIGFuaW1hdGVCdWxsZXQoKVxuICBhbmltYXRlRXhwbG9zaW9ucyhjdHgpO1xuICBjaGFyYWN0ZXIuZHJhdyhjdHgpO1xufVxuXG5mdW5jdGlvbiBjb2xsaXNpb25EZXRlY3Rpb24oKSB7XG4gIGNoYXJhY3RlclNwaWRlckNvbGxpc2lvbigpO1xuICBjaGFyYWN0ZXJDZW50aXBlZGVDb2xsaXNpb24oKTsgIFxuICBidWxsZXRDZW50aXBlZGVDb2xsaXNpb24oKTtcbiAgYnVsbGV0TXVzaHJvb21Db2xsaXNpb24oKTtcbiAgYnVsbGV0U3BpZGVyQ29sbGlzaW9uKCk7XG4gIGNoYXJhY3Rlck11c2hyb29tQ29sbGlzaW9uKClcbn1cblxuZnVuY3Rpb24gY2VudGlwZWRlTXVzaHJvb21Db2xsaXNpb24oKSB7XG4gIGNlbnRpcGVkZUFycmF5LmZvckVhY2goc2VnbWVudCA9PiB7XG4gICAgbXVzaHJvb21BcnJheS5mb3JFYWNoKGJvb21lciA9PiB7XG4gICAgICBpZiAoKGJvb21lci54IDw9IHNlZ21lbnQueCArIHNlZ21lbnQucmFkaXVzIFxuICAgICAgICAmJiBib29tZXIueCArIGJvb21lci53aWR0aCA+PSBzZWdtZW50LnggLSBzZWdtZW50LnJhZGl1cykgXG4gICAgICAgICYmIChzZWdtZW50LnkgKyBzZWdtZW50LnJhZGl1cyA+PSBib29tZXIueSBcbiAgICAgICAgJiYgc2VnbWVudC55IC0gc2VnbWVudC5yYWRpdXMgPD0gYm9vbWVyLnkgKyBib29tZXIuaGVpZ2h0KSkge1xuICAgICAgICBzZWdtZW50LmVyYXNlKGN0eCk7XG4gICAgICAgIHNlZ21lbnQueSArPSBzZWdtZW50LnJhZGl1cyAqIDIgKyBzZWdtZW50LnJhZGl1cyAvIDI7XG4gICAgICAgIHNlZ21lbnQuZXllWSArPSBzZWdtZW50LnJhZGl1cyAqIDIgKyBzZWdtZW50LnJhZGl1cyAvIDI7XG4gICAgICAgIHNlZ21lbnQudnggPSAtc2VnbWVudC52eDtcbiAgICAgICAgc2VnbWVudC5leWVYICs9IHNlZ21lbnQudng7XG4gICAgICB9XG4gICAgICBib29tZXIuZHJhdyhjdHgpO1xuICAgIH0pXG4gIH0pXG59XG5cbmZ1bmN0aW9uIGJ1bGxldENlbnRpcGVkZUNvbGxpc2lvbigpIHtcbiAgY2VudGlwZWRlQXJyYXkuZm9yRWFjaCgoc2VnbWVudCwgc2VnbWVudEluZGV4LCBzZWdtZW50QXJyYXkpID0+IHtcbiAgICBidWxsZXRzQXJyYXkuZm9yRWFjaCgoYnVsbGV0LCBidWxsZXRJbmRleCwgYnVsbGV0QXJyYXkpICA9PiB7XG4gICAgICBpZiAoKGJ1bGxldC54IDw9IHNlZ21lbnQueCArIHNlZ21lbnQucmFkaXVzIFxuICAgICAgICAmJiBidWxsZXQueCArIGJ1bGxldC53aWR0aCA+PSBzZWdtZW50LnggLSBzZWdtZW50LnJhZGl1cykgXG4gICAgICAgICYmIChzZWdtZW50LnkgKyBzZWdtZW50LnJhZGl1cyA+PSBidWxsZXQueSBcbiAgICAgICAgJiYgc2VnbWVudC55IC0gc2VnbWVudC5yYWRpdXMgPD0gYnVsbGV0LnkgKyBidWxsZXQuaGVpZ2h0KSkge1xuICAgICAgICBidWxsZXQuZXJhc2UoY3R4KTtcbiAgICAgICAgYnVsbGV0QXJyYXkuc3BsaWNlKGJ1bGxldEluZGV4LCAxKTtcbiAgICAgICAgY3JlYXRlRXhwbG9zaW9uKG5ldyBFeHBsb3Npb25DZW50aXBlZGUoc2VnbWVudC54LCBzZWdtZW50LnkpKTtcbiAgICAgICAgY3JlYXRlSGVhZEZvck5ld0NlbnRpcGVkZShzZWdtZW50SW5kZXgsIHNlZ21lbnRBcnJheSk7XG4gICAgICAgIHNlZ21lbnQuZXJhc2UoY3R4KTtcbiAgICAgICAgY3JlYXRlTmV3TXVzaHJvb20oc2VnbWVudCk7XG4gICAgICAgIHNlZ21lbnRBcnJheS5zcGxpY2Uoc2VnbWVudEluZGV4LCAxKTtcbiAgICAgICAgY2hhcmFjdGVyLnNjb3JlKys7XG4gICAgICAgIGNlbnRpcGVkZUhpdFNvdW5kLnBsYXkoKVxuICAgICAgfVxuICAgIH0pXG4gIH0pXG59IFxuXG5mdW5jdGlvbiBjcmVhdGVOZXdNdXNocm9vbShzZWdtZW50KSB7XG4gIGlmIChzZWdtZW50LnkgPiA1MCkge1xuICAgIGxldCBtdXNocm9vbSA9IG5ldyBNdXNocm9vbShcbiAgICAgIHNlZ21lbnQueCAtIHNlZ21lbnQucmFkaXVzLCBcbiAgICAgIHNlZ21lbnQueSAtIHNlZ21lbnQucmFkaXVzKTtcbiAgICBcbiAgICBtdXNocm9vbS5lcmFzZShjdHgpO1xuICAgIG11c2hyb29tLmRyYXcoY3R4KTtcbiAgICBtdXNocm9vbUFycmF5LnB1c2gobXVzaHJvb20pO1xuICB9ICBcbn0gXG5cbmZ1bmN0aW9uIGNyZWF0ZUhlYWRGb3JOZXdDZW50aXBlZGUoc2VnbWVudEluZGV4LCBzZWdtZW50QXJyYXkpIHtcbiAgaWYgKHNlZ21lbnRJbmRleCA8IHNlZ21lbnRBcnJheS5sZW5ndGggLSAxKSB7XG4gICAgc2VnbWVudEFycmF5W3NlZ21lbnRJbmRleCArIDFdLmhhc0hlYWQgPSB0cnVlO1xuICB9ICBcbn1cblxuZnVuY3Rpb24gYnVsbGV0TXVzaHJvb21Db2xsaXNpb24oKSB7XG4gIG11c2hyb29tQXJyYXkuZm9yRWFjaCgoYm9vbWVyLCBib29tZXJJbmRleCwgYm9vbWVyQXJyYXkpID0+IHtcbiAgICBidWxsZXRzQXJyYXkuZm9yRWFjaCgoYnVsbGV0LCBidWxsZXRJbmRleCwgYnVsbGV0QXJyYXkpICA9PiB7XG4gICAgICBpZiAoKGJ1bGxldC54IDw9IGJvb21lci54ICsgYm9vbWVyLndpZHRoIFxuICAgICAgICAmJiBidWxsZXQueCArIGJ1bGxldC53aWR0aCA+PSBib29tZXIueCkgXG4gICAgICAgICYmIChib29tZXIueSArIGJvb21lci5oZWlnaHQgPj0gYnVsbGV0LnkgXG4gICAgICAgICYmIGJvb21lci55IDw9IGJ1bGxldC55ICsgYnVsbGV0LmhlaWdodCkpIHtcbiAgICAgICAgYnVsbGV0LmVyYXNlKGN0eCk7XG4gICAgICAgIGJ1bGxldEFycmF5LnNwbGljZShidWxsZXRJbmRleCwgMSk7XG4gICAgICAgIGNyZWF0ZUV4cGxvc2lvbihuZXcgRXhwbG9zaW9uTXVzaHJvb20oXG4gICAgICAgICAgYm9vbWVyLnggLSBib29tZXIud2lkdGggLyAyLCBcbiAgICAgICAgICBib29tZXIueSAtIGJvb21lci5oZWlnaHQgLyAyKSk7XG4gICAgICAgIGJ1bGxldE11c2hyb29tSGl0Q291bnQoYm9vbWVyLCBib29tZXJJbmRleCwgYm9vbWVyQXJyYXkpO1xuICAgICAgICBib29tZXIuZXJhc2UoY3R4KTtcbiAgICAgICAgY29sbGlzaW9uU291bmQucGxheSgpXG4gICAgICB9IFxuICAgIH0pXG4gIH0pXG59XG5cbmZ1bmN0aW9uIGJ1bGxldE11c2hyb29tSGl0Q291bnQoYm9vbWVyLCBib29tZXJJbmRleCwgYm9vbWVyQXJyYXkpIHtcbiAgYm9vbWVyLmhpdENvdW50Kys7XG4gIGlmIChib29tZXIuaGl0Q291bnQgPiAyKSB7XG4gICAgYm9vbWVyQXJyYXkuc3BsaWNlKGJvb21lckluZGV4LCAxKTtcbiAgICBib29tZXIuZXJhc2UoY3R4KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjaGFyYWN0ZXJNdXNocm9vbUNvbGxpc2lvbigpIHtcbiAgbXVzaHJvb21BcnJheS5mb3JFYWNoKChib29tZXIpID0+IHtcbiAgICBpZiAoYm9vbWVyLnggKyBib29tZXIud2lkdGggID49IGNoYXJhY3Rlci54ICsgY2hhcmFjdGVyLnZ4XG4gICAgICAmJiBib29tZXIueCA8IGNoYXJhY3Rlci54ICsgY2hhcmFjdGVyLnZ4IFxuICAgICAgJiYgYm9vbWVyLnkgIDwgY2hhcmFjdGVyLnkgKyBjaGFyYWN0ZXIuaGVpZ2h0XG4gICAgICAmJiBjaGFyYWN0ZXIueSA8IGJvb21lci55ICsgYm9vbWVyLmhlaWdodCkge1xuICAgICAgY2hhcmFjdGVyLmVyYXNlKGN0eCk7XG4gICAgICBjaGFyYWN0ZXIueCArPSBjaGFyYWN0ZXIudng7XG4gICAgfSBlbHNlIGlmIChib29tZXIueCArIGJvb21lci53aWR0aCAgPiBjaGFyYWN0ZXIueCArIGNoYXJhY3Rlci53aWR0aFxuICAgICAgJiYgYm9vbWVyLnggPD0gY2hhcmFjdGVyLnggKyBjaGFyYWN0ZXIud2lkdGhcbiAgICAgICYmIGJvb21lci55ICsgYm9vbWVyLmhlaWdodCA+IGNoYXJhY3Rlci55XG4gICAgICAmJiBjaGFyYWN0ZXIueSArIGNoYXJhY3Rlci5oZWlnaHQgPiBib29tZXIueSkge1xuICAgICAgY2hhcmFjdGVyLmVyYXNlKGN0eCk7XG4gICAgICBjaGFyYWN0ZXIueCAtPSBjaGFyYWN0ZXIudng7XG4gICAgfSBlbHNlIGlmIChjaGFyYWN0ZXIueSArIGNoYXJhY3Rlci52eSA8PSBib29tZXIueSArIGJvb21lci5oZWlnaHRcbiAgICAgICYmIGNoYXJhY3Rlci55ID4gYm9vbWVyLnlcbiAgICAgICYmIGNoYXJhY3Rlci54ID4gYm9vbWVyLnhcbiAgICAgICYmIGNoYXJhY3Rlci54ICsgY2hhcmFjdGVyLndpZHRoIDwgYm9vbWVyLnggKyBib29tZXIud2lkdGgpIHtcbiAgICAgIGNoYXJhY3Rlci5lcmFzZShjdHgpO1xuICAgICAgY2hhcmFjdGVyLnkgLT0gY2hhcmFjdGVyLnZ5O1xuICAgIH1cbiAgfSlcbn0gXG5cblxuZnVuY3Rpb24gYnVsbGV0U3BpZGVyQ29sbGlzaW9uKCkge1xuICBzcGlkZXJBcnJheS5mb3JFYWNoKChzcGlkZXksIHNwaWRleUluZGV4LCBzcGlkZXlBcnJheSkgPT4ge1xuICAgIGJ1bGxldHNBcnJheS5mb3JFYWNoKChidWxsZXQsIGJ1bGxldEluZGV4LCBidWxsZXRBcnJheSkgID0+IHtcbiAgICAgIGlmICgoYnVsbGV0LnggPD0gc3BpZGV5LnggKyBzcGlkZXkucmFkaXVzIFxuICAgICAgICAmJiBidWxsZXQueCArIGJ1bGxldC53aWR0aCA+PSBzcGlkZXkueCAtIHNwaWRleS5yYWRpdXMpIFxuICAgICAgICAmJiAoc3BpZGV5LnkgKyBzcGlkZXkucmFkaXVzID49IGJ1bGxldC55IFxuICAgICAgICAmJiBzcGlkZXkueSAtIHNwaWRleS5yYWRpdXMgPD0gYnVsbGV0LnkgKyBidWxsZXQuaGVpZ2h0KSkge1xuICAgICAgICBidWxsZXQuZXJhc2UoY3R4KTtcbiAgICAgICAgYnVsbGV0QXJyYXkuc3BsaWNlKGJ1bGxldEluZGV4LCAxKTtcbiAgICAgICAgY3JlYXRlRXhwbG9zaW9uKG5ldyBFeHBsb3Npb25TcGlkZXIoc3BpZGV5LngsIHNwaWRleS55KSk7XG4gICAgICAgIHNwaWRleS5lcmFzZShjdHgpO1xuICAgICAgICBzcGlkZXlBcnJheS5wb3AoKTtcbiAgICAgICAgY2hhcmFjdGVyLnNjb3JlICs9IDEwO1xuICAgICAgICBjb2xsaXNpb25Tb3VuZC5wbGF5KCk7XG4gICAgICB9XG4gICAgfSlcbiAgfSlcbn0gXG5cbmZ1bmN0aW9uIGNoYXJhY3RlckNlbnRpcGVkZUNvbGxpc2lvbigpIHtcbiAgbGV0IHZlcmlmeTtcblxuICB2ZXJpZnkgPSBjZW50aXBlZGVBcnJheS5yZWR1Y2UoKGJvb2xlYW4sIHNlZ21lbnQpID0+IHtcbiAgICBpZiAoKGNoYXJhY3Rlci54IDw9IHNlZ21lbnQueCArIHNlZ21lbnQucmFkaXVzIFxuICAgICAgJiYgY2hhcmFjdGVyLnggKyBjaGFyYWN0ZXIud2lkdGggPj0gc2VnbWVudC54IC0gc2VnbWVudC5yYWRpdXMpIFxuICAgICAgJiYgKHNlZ21lbnQueSArIHNlZ21lbnQucmFkaXVzID49IGNoYXJhY3Rlci55IFxuICAgICAgJiYgc2VnbWVudC55IC0gc2VnbWVudC5yYWRpdXMgPD0gY2hhcmFjdGVyLnkgKyBjaGFyYWN0ZXIuaGVpZ2h0KSkge1xuICAgICAgYm9vbGVhbiA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiBib29sZWFuO1xuICB9LCBmYWxzZSlcbiAgcmV0dXJuIHZlcmlmeTtcbn0gIFxuXG5mdW5jdGlvbiBjaGFyYWN0ZXJTcGlkZXJDb2xsaXNpb24oKSB7XG4gIGxldCB2ZXJpZnk7XG5cbiAgdmVyaWZ5ID0gc3BpZGVyQXJyYXkucmVkdWNlKChib29sZWFuLCBzcGlkZXkpID0+IHtcbiAgICBpZiAoKGNoYXJhY3Rlci54IDw9IHNwaWRleS54ICsgc3BpZGV5LnJhZGl1cyBcbiAgICAgICYmIGNoYXJhY3Rlci54ICsgY2hhcmFjdGVyLndpZHRoID49IHNwaWRleS54IC0gc3BpZGV5LnJhZGl1cykgXG4gICAgICAmJiAoc3BpZGV5LnkgKyBzcGlkZXkucmFkaXVzID49IGNoYXJhY3Rlci55IFxuICAgICAgJiYgc3BpZGV5LnkgLSBzcGlkZXkucmFkaXVzIDw9IGNoYXJhY3Rlci55ICsgY2hhcmFjdGVyLmhlaWdodCkpIHtcbiAgICAgIGJvb2xlYW4gPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gYm9vbGVhbjtcbiAgfSwgZmFsc2UpXG4gIHJldHVybiB2ZXJpZnk7XG59IFxuXG5mdW5jdGlvbiBtb3ZlVXAoZSkge1xuICBpZiAoXG4gICAgZS5rZXlDb2RlID09ICczOCcgJiYgY2hhcmFjdGVyLnkgLSBjaGFyYWN0ZXIudnkgPiA0MDApIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgY2hhcmFjdGVyLmVyYXNlKGN0eCkubW92ZVVwKCkubW92ZUd1bigpXG4gIH0gIFxufVxuXG5mdW5jdGlvbiBtb3ZlTGVmdChlKSB7XG4gIGlmIChlLmtleUNvZGUgPT0gJzM3JyBcbiAgICAmJiBjaGFyYWN0ZXIueCArIGNoYXJhY3Rlci52eCA+IDApIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgY2hhcmFjdGVyLmVyYXNlKGN0eCkubW92ZUxlZnQoKS5tb3ZlR3VuKClcbiAgfSAgXG59XG5cbmZ1bmN0aW9uIG1vdmVSaWdodChlKSB7XG4gIGlmIChlLmtleUNvZGUgPT0gJzM5JyBcbiAgICAmJiBjaGFyYWN0ZXIueCArIGNoYXJhY3Rlci52eCArIGNoYXJhY3Rlci53aWR0aCA8IDEwMDApIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgY2hhcmFjdGVyLmVyYXNlKGN0eCkubW92ZVJpZ2h0KCkubW92ZUd1bigpOyBcbiAgfSAgXG59XG5cbmZ1bmN0aW9uIG1vdmVEb3duKGUpIHtcbiAgaWYgKGUua2V5Q29kZSA9PSAnNDAnICYmIGNoYXJhY3Rlci55ICsgY2hhcmFjdGVyLnZ5IDwgNjAwKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGNoYXJhY3Rlci5lcmFzZShjdHgpLm1vdmVEb3duKCkubW92ZUd1bigpO1xuICB9IFxufVxuXG5mdW5jdGlvbiBzaG9vdChlKSB7XG4gIGlmIChlLmtleUNvZGUgPT0gJzMyJyAmJiBidWxsZXRzQXJyYXkubGVuZ3RoIDwgMSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBsZXQgYnVsbGV0ID0gbmV3IEJ1bGxldChjaGFyYWN0ZXIuZ3VuWCwgY2hhcmFjdGVyLmd1blkpO1xuXG4gICAgYnVsbGV0LmRyYXcoY3R4KTtcbiAgICBidWxsZXRzQXJyYXkucHVzaChidWxsZXQpO1xuICAgIGd1blNvdW5kLnBsYXkoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBwYXVzZUdhbWUoZSkge1xuICBpZiAoZS5rZXlDb2RlID09ICc4MCcgJiYgb3ZlcnJpZGVEZWZhdWx0ID09PSBmYWxzZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBnYW1lUGF1c2UgPSAhZ2FtZVBhdXNlO1xuICAgIGdhbWVMb29wKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gbmV4dExldmVsQ2hlYXQoZSkge1xuICBpZiAoZS5rZXlDb2RlID09ICc0OScpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgY2VudGlwZWRlQXJyYXkgPSBbXTtcbiAgICBjdHguY2xlYXJSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gYW5pbWF0ZUNlbnRpcGVkZSgpIHtcbiAgY2VudGlwZWRlQXJyYXkuZm9yRWFjaCgoc2VnbWVudCkgPT4ge1xuICAgIHNlZ21lbnQuZXJhc2UoY3R4KS5tb3ZlKCkuZHJhdyhjdHgpO1xuICB9KVxufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZVNwaWRlciAoKSB7XG4gIGxldCBudW1iZXIgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAzNTApO1xuICBcbiAgaWYgKG51bWJlciA9PT0gMTUgJiYgc3BpZGVyQXJyYXkubGVuZ3RoID09PSAwKSB7XG4gICAgbGV0IHNwaWRlciA9IG5ldyBTcGlkZXIoKTtcblxuICAgIHNwaWRlckFycmF5LnB1c2goc3BpZGVyKTtcbiAgICBzcGlkZXJTb3VuZC5wbGF5KClcbiAgfVxufVxuXG5mdW5jdGlvbiBhbmltYXRlU3BpZGVyKCkge1xuICBpZiAoc3BpZGVyQXJyYXkubGVuZ3RoID09PSAxKSB7XG4gICAgc3BpZGVyQXJyYXlbMF0uZXJhc2UoY3R4KS5tb3ZlKCkuZHJhdyhjdHgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFuaW1hdGVCdWxsZXQoKSB7XG4gIGJ1bGxldHNBcnJheS5mb3JFYWNoKChidWxsZXQsIGluZGV4LCBhcnJheSkgPT4ge1xuICAgIGJ1bGxldC5lcmFzZShjdHgpLm1vdmUoKS5kcmF3KGN0eCk7XG4gICAgaWYgKGJ1bGxldC55IDwgNSkge1xuICAgICAgYnVsbGV0LmVyYXNlKGN0eCk7XG4gICAgICBhcnJheS5zcGxpY2UoaW5kZXgsIDEpXG4gICAgfVxuICB9KVxufVxuXG5mdW5jdGlvbiBhbmltYXRlRXhwbG9zaW9ucyAoY3R4KSB7XG4gIGV4cGxvc2lvbkFycmF5LmZvckVhY2goKGV4cGxvc2lvbiwgaW5kZXgsIGFycmF5KSA9PiB7XG4gICAgZXhwbG9zaW9uLmVyYXNlKGN0eCkubW92ZSgpLmRyYXcoY3R4KTtcbiAgICBpZiAoZXhwbG9zaW9uLnJhZGl1cyA+IDQwKSB7XG4gICAgICBleHBsb3Npb24uZXJhc2UoY3R4KTtcbiAgICAgIGFycmF5LnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICB9KVxufVxuXG5mdW5jdGlvbiBjcmVhdGVFeHBsb3Npb24gKHR5cGUpIHtcbiAgbGV0IGJvb20gPSB0eXBlXG5cbiAgYm9vbS5kcmF3KGN0eCk7XG4gIGV4cGxvc2lvbkFycmF5LnB1c2goYm9vbSk7XG59XG5cbmZ1bmN0aW9uIGFkZFNpbmdsZUNlbnRpcGVkZXMoKSB7XG4gIGlmIChjaGFyYWN0ZXIubGV2ZWwgPiAxKSB7XG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPCBjaGFyYWN0ZXIubGV2ZWw7IGkrKykge1xuICAgICAgbGV0IHNlZ21lbnQgPSBuZXcgQ2VudGlwZWRlKCBcbiAgICAgICAgLTEwLFxuICAgICAgICAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogOTcpICsgMykgKiAxMCk7XG5cbiAgICAgIHNlZ21lbnQuaGFzSGVhZCA9IHRydWU7XG4gICAgICBjZW50aXBlZGVBcnJheS5wdXNoKHNlZ21lbnQpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBzdGFydE5ld0xldmVsKCkge1xuICBjZW50aXBlZGVBcnJheSA9IFtdO1xuICBjcmVhdGVDZW50aXBlZGVIZWFkKCk7XG4gIGFkZFNpbmdsZUNlbnRpcGVkZXMoKTtcbiAgYWN0aXZhdGVDZW50aXBlZGUoKTtcbiAgbGV2ZWxVcFNjcmVlbi5jbGFzc0xpc3QudG9nZ2xlKCdoaWRkZW4nKTtcbn1cblxuZnVuY3Rpb24gcmV0cmlldmVTY29yZUZyb21TdG9yYWdlICgpIHtcbiAgbGV0IHJldHJpZXZlZFNjb3JlID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0obG9jYWxTdG9yYWdlLmtleSgwKSk7XG5cbiAgbGV0IHBhcnNlZEhpZ2hTY29yZSA9IEpTT04ucGFyc2UocmV0cmlldmVkU2NvcmUpO1xuXG4gIHJldHVybiBwYXJzZWRIaWdoU2NvcmU7XG59XG5cbmZ1bmN0aW9uIHN0b3JlTmV3SGlnaFNjb3JlIChuYW1lLCBzY29yZSkge1xuICBsZXQgbmV3SGlnaFNjb3JlID0gbmV3IEhpZ2hTY29yZShuYW1lLCBzY29yZSk7XG5cbiAgbGV0IHN0cmluZ2VkSGlnaFNjb3JlID0gSlNPTi5zdHJpbmdpZnkobmV3SGlnaFNjb3JlKTtcblxuICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShuZXdIaWdoU2NvcmUuaWQsIHN0cmluZ2VkSGlnaFNjb3JlKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlSW5pdGlhbEhpZ2hTY29yZSgpIHtcbiAgaWYgKGxvY2FsU3RvcmFnZS5sZW5ndGggPT09IDApIHtcbiAgICBsZXQgaW5pdGlhbEhpZ2hTY29yZSA9IG5ldyBIaWdoU2NvcmUoJ2luaXRpYWwnLCBjaGFyYWN0ZXIuc2NvcmUpO1xuXG4gICAgbGV0IHN0cmluZ2VkSGlnaFNjb3JlID0gSlNPTi5zdHJpbmdpZnkoaW5pdGlhbEhpZ2hTY29yZSk7XG5cbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShpbml0aWFsSGlnaFNjb3JlLmlkLCBzdHJpbmdlZEhpZ2hTY29yZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY29sbGVjdFVzZXJJbmZvICgpIHtcbiAgbGV0IG9sZEhpZ2hTY29yZSA9IHJldHJpZXZlU2NvcmVGcm9tU3RvcmFnZSgpO1xuXG4gIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKG9sZEhpZ2hTY29yZS5pZCk7XG4gIGxldCBuYW1lID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI25hbWUnKS52YWx1ZTtcblxuICBzdG9yZU5ld0hpZ2hTY29yZShuYW1lLCBjaGFyYWN0ZXIuc2NvcmUpO1xuICBuZXdIaWdoU2NvcmVTY3JlZW4uY2xhc3NMaXN0LnRvZ2dsZSgnaGlkZGVuJyk7XG4gIHN0YXJ0U2NyZWVuLmNsYXNzTGlzdC50b2dnbGUoJ2hpZGRlbicpO1xuICBnYW1lQm9hcmQuY2xhc3NMaXN0LnRvZ2dsZSgnaGlkZGVuJyk7XG59XG5cbmZ1bmN0aW9uIGNsb3NlSGlnaFNjb3JlU2NyZWVuKCkge1xuICBoaWdoU2NvcmVTY3JlZW4uY2xhc3NMaXN0LnRvZ2dsZSgnaGlkZGVuJyk7XG4gIHN0YXJ0U2NyZWVuLmNsYXNzTGlzdC50b2dnbGUoJ2hpZGRlbicpO1xufVxuXG5mdW5jdGlvbiBzaG93SGlnaFNjb3JlU2NyZWVuRnJvbVN0YXJ0ICgpIHtcbiAgc3RhcnRTY3JlZW4uY2xhc3NMaXN0LnRvZ2dsZSgnaGlkZGVuJyk7XG4gIGxldCBoaWdoU2NvcmUgPSByZXRyaWV2ZVNjb3JlRnJvbVN0b3JhZ2UoKTtcblxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuaGlnaC1zY29yZS1uYW1lJykuaW5uZXJUZXh0ID0gaGlnaFNjb3JlLm5hbWU7XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5oaWdoLXNjb3JlLXZhbHVlJykuaW5uZXJUZXh0ID0gaGlnaFNjb3JlLnNjb3JlO1xuICBoaWdoU2NvcmVTY3JlZW4uY2xhc3NMaXN0LnRvZ2dsZSgnaGlkZGVuJyk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUNlbnRpcGVkZUhlYWQoKSB7XG4gIGxldCBzZWdtZW50ID0gbmV3IENlbnRpcGVkZSgtMTApXG5cbiAgY2VudGlwZWRlQXJyYXkucHVzaChzZWdtZW50KVxuICBjZW50aXBlZGVBcnJheVswXS5oYXNIZWFkID0gdHJ1ZTsgXG59XG5cbmZ1bmN0aW9uIHJlc2V0R2FtZVZhbHVlcygpIHtcbiAgY2VudGlwZWRlQXJyYXkgPSBbXTtcbiAgbXVzaHJvb21BcnJheSA9IFtdO1xuICBjaGFyYWN0ZXIuc2NvcmUgPSAwO1xuICBjaGFyYWN0ZXIubGV2ZWwgPSAxO1xuICBjaGFyYWN0ZXIubGl2ZXMgPSAzO1xufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vbGliL2luZGV4LmpzIiwiY2xhc3MgTXVzaHJvb20ge1xuICBjb25zdHJ1Y3Rvcih4LCB5KSB7XG4gICAgdGhpcy54ID0geCB8fCBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA5MTApICsgNDA7XG4gICAgdGhpcy55ID0geSB8fCBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA0MTUpICsgNjU7XG4gICAgdGhpcy53aWR0aCA9IDMwO1xuICAgIHRoaXMuaGVpZ2h0ID0gMzA7XG4gICAgdGhpcy5oaXRDb3VudCA9IDA7XG4gIH1cblxuICBkcmF3KGN0eCkge1xuICAgIGlmICh0aGlzLmhpdENvdW50ID09PSAwKSB7XG4gICAgICBjdHguZmlsbFN0eWxlID0gJ3RyYW5zcGFyZW50J1xuICAgICAgY3R4LmZpbGxSZWN0KHRoaXMueCwgdGhpcy55LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG5cbiAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgIGN0eC5maWxsU3R5bGUgPSAncmVkJztcbiAgICAgIGN0eC5hcmModGhpcy54ICsgdGhpcy53aWR0aCAvIDIsXG4gICAgICAgIHRoaXMueSArIHRoaXMuaGVpZ2h0IC8gMixcbiAgICAgICAgdGhpcy53aWR0aCAvIDIsXG4gICAgICAgIDAsXG4gICAgICAgIChNYXRoLlBJIC8gMTgwKSAqIDE4MCxcbiAgICAgICAgdHJ1ZSk7XG4gICAgICBjdHguZmlsbCgpO1xuICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuXG4gICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICBjdHguZmlsbFN0eWxlID0gJ3doaXRlJztcbiAgICAgIGN0eC5hcmModGhpcy54ICsgNyxcbiAgICAgICAgdGhpcy55ICsgNyxcbiAgICAgICAgMyxcbiAgICAgICAgMCxcbiAgICAgICAgKE1hdGguUEkgLyAxODApICogMzYwLFxuICAgICAgICB0cnVlKTtcbiAgICAgIGN0eC5maWxsKCk7XG4gICAgICBjdHguY2xvc2VQYXRoKCk7XG5cbiAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgIGN0eC5maWxsU3R5bGUgPSAnd2hpdGUnO1xuICAgICAgY3R4LmFyYyh0aGlzLnggKyAxNCxcbiAgICAgICAgdGhpcy55ICsgMyxcbiAgICAgICAgMyxcbiAgICAgICAgMCxcbiAgICAgICAgKE1hdGguUEkgLyAxODApICogMzYwLFxuICAgICAgICB0cnVlKTtcbiAgICAgIGN0eC5maWxsKCk7XG4gICAgICBjdHguY2xvc2VQYXRoKCk7XG5cbiAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgIGN0eC5maWxsU3R5bGUgPSAnd2hpdGUnO1xuICAgICAgY3R4LmFyYyh0aGlzLnggKyAyMywgdGhpcy55ICsgMTAsIDMsIDAsIChNYXRoLlBJIC8gMTgwKSAqIDM2MCwgdHJ1ZSk7XG4gICAgICBjdHguZmlsbCgpO1xuICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuXG4gICAgICBjdHguZmlsbFN0eWxlID0gJ2Jyb3duJ1xuICAgICAgY3R4LmZpbGxSZWN0KHRoaXMueCArIHRoaXMud2lkdGggLyAyIC0gNCxcbiAgICAgICAgdGhpcy55ICsgdGhpcy5oZWlnaHQgLyAyLFxuICAgICAgICB0aGlzLndpZHRoIC8gMyxcbiAgICAgICAgdGhpcy5oZWlnaHQgLyAyKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaGl0Q291bnQgPT09IDEpIHtcbiAgICAgIGN0eC5maWxsU3R5bGUgPSAndHJhbnNwYXJlbnQnXG4gICAgICBjdHguZmlsbFJlY3QodGhpcy54LCB0aGlzLnksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcblxuICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgY3R4LmZpbGxTdHlsZSA9ICdncmF5JztcbiAgICAgIGN0eC5hcmModGhpcy54ICsgdGhpcy53aWR0aCAvIDIsXG4gICAgICAgIHRoaXMueSArIHRoaXMuaGVpZ2h0IC8gMixcbiAgICAgICAgdGhpcy53aWR0aCAvIDIsXG4gICAgICAgIDAsXG4gICAgICAgIChNYXRoLlBJIC8gMTgwKSAqIDE1MCxcbiAgICAgICAgdHJ1ZSk7XG4gICAgICBjdHguZmlsbCgpO1xuICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuXG4gICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICBjdHguZmlsbFN0eWxlID0gJ3doaXRlJztcbiAgICAgIGN0eC5hcmModGhpcy54ICsgNywgdGhpcy55ICsgNywgMywgMCwgKE1hdGguUEkgLyAxODApICogMzYwLCB0cnVlKTtcbiAgICAgIGN0eC5maWxsKCk7XG4gICAgICBjdHguY2xvc2VQYXRoKCk7XG5cbiAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgIGN0eC5maWxsU3R5bGUgPSAnd2hpdGUnO1xuICAgICAgY3R4LmFyYyh0aGlzLnggKyAxNCwgdGhpcy55ICsgMywgMywgMCwgKE1hdGguUEkgLyAxODApICogMzYwLCB0cnVlKTtcbiAgICAgIGN0eC5maWxsKCk7XG4gICAgICBjdHguY2xvc2VQYXRoKCk7XG5cbiAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgIGN0eC5maWxsU3R5bGUgPSAnd2hpdGUnO1xuICAgICAgY3R4LmFyYyh0aGlzLnggKyAyMywgdGhpcy55ICsgMTAsIDMsIDAsIChNYXRoLlBJIC8gMTgwKSAqIDM2MCwgdHJ1ZSk7XG4gICAgICBjdHguZmlsbCgpO1xuICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuXG4gICAgICBjdHguZmlsbFN0eWxlID0gJ2dyYXknXG4gICAgICBjdHguZmlsbFJlY3QodGhpcy54ICsgdGhpcy53aWR0aCAvIDIgLSA0LFxuICAgICAgICB0aGlzLnkgKyB0aGlzLmhlaWdodCAvIDIsXG4gICAgICAgIHRoaXMud2lkdGggLyAzLFxuICAgICAgICB0aGlzLmhlaWdodCAvIDIpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5oaXRDb3VudCA9PT0gMikge1xuICAgICAgY3R4LmZpbGxTdHlsZSA9ICd0cmFuc3BhcmVudCdcbiAgICAgIGN0eC5maWxsUmVjdCh0aGlzLngsIHRoaXMueSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuXG4gICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICBjdHguZmlsbFN0eWxlID0gJ2dyYXknO1xuICAgICAgY3R4LmFyYyh0aGlzLnggKyB0aGlzLndpZHRoIC8gMixcbiAgICAgICAgdGhpcy55ICsgdGhpcy5oZWlnaHQgLyAyLFxuICAgICAgICB0aGlzLndpZHRoIC8gMixcbiAgICAgICAgMCxcbiAgICAgICAgKE1hdGguUEkgLyAxODApICogMjEwLFxuICAgICAgICB0cnVlKTtcbiAgICAgIGN0eC5maWxsKCk7XG4gICAgICBjdHguY2xvc2VQYXRoKCk7XG5cbiAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgIGN0eC5maWxsU3R5bGUgPSAnd2hpdGUnO1xuICAgICAgY3R4LmFyYyh0aGlzLnggKyA3LCB0aGlzLnkgKyA3LCAzLCAwLCAoTWF0aC5QSSAvIDE4MCkgKiAzNjAsIHRydWUpO1xuICAgICAgY3R4LmZpbGwoKTtcbiAgICAgIGN0eC5jbG9zZVBhdGgoKTtcblxuICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgY3R4LmZpbGxTdHlsZSA9ICd3aGl0ZSc7XG4gICAgICBjdHguYXJjKHRoaXMueCArIDE0LCB0aGlzLnkgKyAzLCAzLCAwLCAoTWF0aC5QSSAvIDE4MCkgKiAzNjAsIHRydWUpO1xuICAgICAgY3R4LmZpbGwoKTtcbiAgICAgIGN0eC5jbG9zZVBhdGgoKTtcblxuICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgY3R4LmZpbGxTdHlsZSA9ICd3aGl0ZSc7XG4gICAgICBjdHguYXJjKHRoaXMueCArIDIzLCB0aGlzLnkgKyAxMCwgMywgMCwgKE1hdGguUEkgLyAxODApICogMzYwLCB0cnVlKTtcbiAgICAgIGN0eC5maWxsKCk7XG4gICAgICBjdHguY2xvc2VQYXRoKCk7XG5cbiAgICAgIGN0eC5maWxsU3R5bGUgPSAnZ3JheSdcbiAgICAgIGN0eC5maWxsUmVjdCh0aGlzLnggKyB0aGlzLndpZHRoIC8gMiAtIDEwLFxuICAgICAgICB0aGlzLnkgKyB0aGlzLmhlaWdodCAvIDIsXG4gICAgICAgIHRoaXMud2lkdGggLyAzLFxuICAgICAgICB0aGlzLmhlaWdodCAvIDIpO1xuICAgIH1cbiAgfVxuXG4gIGVyYXNlKGN0eCkge1xuICAgIGN0eC5jbGVhclJlY3QodGhpcy54IC0gMjAsIHRoaXMueSAtIDIwLCB0aGlzLndpZHRoICsgNDAsIHRoaXMuaGVpZ2h0ICsgNDApXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBNdXNocm9vbTtcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9saWIvTXVzaHJvb20uanMiLCJjbGFzcyBDZW50aXBlZGUge1xuICBjb25zdHJ1Y3Rvcih5LCB4ID0gNTAwKSB7XG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLnkgPSB5O1xuICAgIHRoaXMucmFkaXVzID0gMTU7XG4gICAgdGhpcy52eCA9IDA7XG4gICAgdGhpcy52eSA9IDVcbiAgICB0aGlzLndhbGsgPSA2O1xuICAgIHRoaXMuZXllWCA9IHRoaXMueCArIHRoaXMudng7XG4gICAgdGhpcy5leWVZID0gdGhpcy55IC0gNTtcbiAgICB0aGlzLmhhc0hlYWQgPSBmYWxzZTtcbiAgICB0aGlzLmJvYiA9IDI7XG4gIH1cblxuICBkcmF3SGVhZChjdHgpIHtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4LmZpbGxTdHlsZSA9ICdyZWQnO1xuICAgIGN0eC5hcmModGhpcy5leWVYLCBcbiAgICAgIHRoaXMuZXllWSArIHRoaXMuYm9iLFxuICAgICAgdGhpcy5yYWRpdXMgLyA0LFxuICAgICAgMCwgKE1hdGguUEkgLyAxODApICogMzYwLFxuICAgICAgZmFsc2UpO1xuICAgIGN0eC5maWxsKCk7XG4gICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgIGN0eC5zYXZlKCk7XG4gIH1cblxuICBkcmF3KGN0eCkge1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBjdHguZmlsbFN0eWxlID0gJ2dyZWVuJztcbiAgICBjdHguYXJjKHRoaXMueCxcbiAgICAgIHRoaXMueSArIHRoaXMuYm9iLFxuICAgICAgdGhpcy5yYWRpdXMsXG4gICAgICAwLCAoTWF0aC5QSSAvIDE4MCkgKiAzNjAsXG4gICAgICBmYWxzZSk7XG4gICAgY3R4LmZpbGwoKTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG5cbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4LmZpbGxTdHlsZSA9ICdibGFjayc7XG4gICAgY3R4LmFyYyh0aGlzLnggKyB0aGlzLndhbGssXG4gICAgICB0aGlzLnkgKyAxNSArIHRoaXMuYm9iLFxuICAgICAgdGhpcy5yYWRpdXMgLyAyLFxuICAgICAgMCxcbiAgICAgIChNYXRoLlBJIC8gMTgwKSAqIDM2MCxcbiAgICAgIGZhbHNlKTtcbiAgICBjdHguZmlsbCgpO1xuICAgIGN0eC5jbG9zZVBhdGgoKTtcblxuICAgIGlmICh0aGlzLmhhc0hlYWQgPT09IHRydWUpIHtcbiAgICAgIHRoaXMuZHJhd0hlYWQoY3R4KTtcbiAgICB9XG5cbiAgICBpZiAoIHRoaXMueCAlIDQwID09PSAwKSB7XG4gICAgICB0aGlzLndhbGsgPSAtdGhpcy53YWxrO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBtb3ZlKCkge1xuICAgIHRoaXMueCArPSB0aGlzLnZ4O1xuICAgIHRoaXMueSArPSB0aGlzLnZ5O1xuICAgIHRoaXMuZXllWSA9IHRoaXMueSAtIDVcbiAgICB0aGlzLmV5ZVggPSB0aGlzLnggKyB0aGlzLnZ4O1xuICAgIGlmICh0aGlzLnggKyB0aGlzLnZ4ID4gOTkwIHx8IHRoaXMueCArIHRoaXMudnggPCAxMCkge1xuICAgICAgdGhpcy55ICs9IHRoaXMucmFkaXVzICogMiArIHRoaXMucmFkaXVzO1xuICAgICAgdGhpcy5leWVZICs9IHRoaXMucmFkaXVzICogMiArIHRoaXMucmFkaXVzO1xuICAgICAgdGhpcy52eCA9IC10aGlzLnZ4O1xuICAgIH1cbiAgICBcbiAgICBpZiAodGhpcy55ICsgdGhpcy5yYWRpdXMgPiA2MDApIHtcbiAgICAgIHRoaXMueSA9IDQ0MDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy55ID09PSB0aGlzLnJhZGl1cyAqIDIgKyB0aGlzLnJhZGl1cykge1xuICAgICAgdGhpcy52eSA9IDA7XG4gICAgICB0aGlzLnZ4ID0gNTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy54ICUgNTAgPT09IDApIHtcbiAgICAgIHRoaXMuYm9iID0gLXRoaXMuYm9iO1xuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgZXJhc2UoY3R4KSB7XG4gICAgY3R4LmNsZWFyUmVjdCh0aGlzLnggLSB0aGlzLnJhZGl1cyxcbiAgICAgIHRoaXMueSAtIHRoaXMucmFkaXVzIC0gNSxcbiAgICAgIHRoaXMucmFkaXVzICogIDIsXG4gICAgICB0aGlzLnJhZGl1cyAqIDIgKyAxNSk7XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENlbnRpcGVkZTtcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9saWIvQ2VudGlwZWRlLmpzIiwiY2xhc3MgQ2hhcmFjdGVyIHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIHRoaXMueCA9IDUwMDtcbiAgICB0aGlzLnkgPSA1MTA7XG4gICAgdGhpcy53aWR0aCA9IDQwO1xuICAgIHRoaXMuaGVpZ2h0ID0gNjA7XG4gICAgdGhpcy52eCA9IDIwO1xuICAgIHRoaXMudnkgPSA5NTtcbiAgICB0aGlzLmd1blggPSB0aGlzLnggLSA3O1xuICAgIHRoaXMuZ3VuWSA9IHRoaXMueSAtIDEwO1xuICAgIHRoaXMubGl2ZXMgPSAzO1xuICAgIHRoaXMuc2NvcmUgPSAwO1xuICAgIHRoaXMubGV2ZWwgPSAxO1xuICB9XG5cbiAgZHJhdyhjdHgpIHtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4LmZpbGxTdHlsZSA9ICd0cmFuc3BhcmVudCdcbiAgICBjdHguZmlsbFJlY3QodGhpcy54LCB0aGlzLnksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG5cbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4LmZpbGxTdHlsZSA9ICd0YW4nO1xuICAgIGN0eC5hcmModGhpcy54ICsgMjAsXG4gICAgICB0aGlzLnkgKyA3LFxuICAgICAgdGhpcy53aWR0aCAvIDMsXG4gICAgICAwLFxuICAgICAgKE1hdGguUEkgLyAxODApICogMzYwLFxuICAgICAgZmFsc2UpO1xuICAgIGN0eC5maWxsKCk7XG4gICAgY3R4LmNsb3NlUGF0aCgpO1xuXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5maWxsU3R5bGUgPSAnI0ZGRkZGRic7XG4gICAgY3R4LmFyYyh0aGlzLnggKyAyMCxcbiAgICAgIHRoaXMueSArIDUsXG4gICAgICB0aGlzLndpZHRoIC8gMyxcbiAgICAgIChNYXRoLlBJIC8gMTgwKSAqIDE5NSxcbiAgICAgIChNYXRoLlBJIC8gMTgwKSAqIDM0NSxcbiAgICAgIGZhbHNlKTtcbiAgICBjdHguZmlsbCgpO1xuICAgIGN0eC5jbG9zZVBhdGgoKTtcblxuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAnYmxhY2snXG4gICAgY3R4LmxpbmVXaWR0aCA9IDE7XG4gICAgY3R4LmFyYyh0aGlzLnggKyAyMCxcbiAgICAgIHRoaXMueSArIDUsXG4gICAgICB0aGlzLndpZHRoIC8gMyxcbiAgICAgIChNYXRoLlBJIC8gMTgwKSAqIDE5NSxcbiAgICAgIChNYXRoLlBJIC8gMTgwKSAqIDM0NSxcbiAgICAgIGZhbHNlKTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgY3R4LnN0cm9rZSgpO1xuXG4gICAgY3R4LmZpbGxTdHlsZSA9ICdibHVlJztcbiAgICBjdHguZm9udCA9ICc0cHggc2VyaWYnO1xuICAgIGN0eC5maWxsVGV4dCgnQmlnZ2VzdCcsIHRoaXMueCArIDEzLCB0aGlzLnkgLSAzKTtcbiAgICBjdHguZmlsbFRleHQoJ1dhbGxleWUnLCB0aGlzLnggKyAxMiwgdGhpcy55KTtcblxuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBjdHguZmlsbFN0eWxlID0gJ3Rhbic7XG4gICAgY3R4LmZpbGxSZWN0KHRoaXMueCArIDUsIHRoaXMueSArIDIwLCB0aGlzLndpZHRoIC0gMTAsIHRoaXMuaGVpZ2h0IC0gMzApO1xuICAgIGN0eC5jbG9zZVBhdGgoKTtcblxuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAndGFuJ1xuICAgIGN0eC5saW5lV2lkdGggPSA4O1xuICAgIGN0eC5tb3ZlVG8odGhpcy54ICsgMzAsIHRoaXMueSArIDIyKTtcbiAgICBjdHgubGluZVRvKHRoaXMueCArIDUwLCB0aGlzLnkgKyA1MCk7XG4gICAgY3R4LnN0cm9rZSgpO1xuICAgIGN0eC5jbG9zZVBhdGgoKVxuXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5zdHJva2VTdHlsZSA9ICcjMkMzNTM5J1xuICAgIGN0eC5saW5lV2lkdGggPSA1O1xuICAgIGN0eC5tb3ZlVG8odGhpcy54IC0gMywgdGhpcy55ICsgMTIpO1xuICAgIGN0eC5saW5lVG8odGhpcy54IC0gMywgdGhpcy55IC0gMTApXG4gICAgY3R4LnN0cm9rZSgpO1xuICAgIGN0eC5jbG9zZVBhdGgoKTtcblxuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAndGFuJ1xuICAgIGN0eC5saW5lV2lkdGggPSA4O1xuICAgIGN0eC5tb3ZlVG8odGhpcy54ICsgMTAsIHRoaXMueSArIDIyKTtcbiAgICBjdHgubGluZVRvKHRoaXMueCwgdGhpcy55ICsgNDApO1xuICAgIGN0eC5saW5lVG8odGhpcy54IC0gMTAsIHRoaXMueSArIDE1KTtcbiAgICBjdHguc3Ryb2tlKCk7XG4gICAgY3R4LmNsb3NlUGF0aCgpO1xuXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5maWxsU3R5bGUgPSAnYmx1ZSc7XG4gICAgY3R4LmZpbGxSZWN0KHRoaXMueCArIDUsIHRoaXMueSArIDUwLCB0aGlzLndpZHRoIC0gMTAsIHRoaXMuaGVpZ2h0IC0gNTApO1xuICAgIGN0eC5jbG9zZVBhdGgoKTtcblxuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBjdHguZmlsbFN0eWxlID0gJ2JsdWUnO1xuICAgIGN0eC5maWxsUmVjdCh0aGlzLnggKyA1LCB0aGlzLnkgKyA2MCwgdGhpcy53aWR0aCAtIDMwLCB0aGlzLmhlaWdodCAtIDQwKTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG5cbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4LmZpbGxTdHlsZSA9ICdibHVlJztcbiAgICBjdHguZmlsbFJlY3QodGhpcy54ICsgMjUsIHRoaXMueSArIDYwLCB0aGlzLndpZHRoIC0gMzAsIHRoaXMuaGVpZ2h0IC0gNDApO1xuICAgIGN0eC5jbG9zZVBhdGgoKTtcblxuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBjdHguZmlsbFN0eWxlID0gJ3doaXRlJztcbiAgICBjdHguZmlsbFJlY3QodGhpcy54ICsgNSwgdGhpcy55ICsgODAsIHRoaXMud2lkdGggLSAzMCwgdGhpcy5oZWlnaHQgLSA1NSk7XG4gICAgY3R4LmNsb3NlUGF0aCgpO1xuXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5maWxsU3R5bGUgPSAnd2hpdGUnO1xuICAgIGN0eC5maWxsUmVjdCh0aGlzLnggKyAyNSwgdGhpcy55ICsgODAsIHRoaXMud2lkdGggLSAzMCwgdGhpcy5oZWlnaHQgLSA1NSk7XG4gICAgY3R4LmNsb3NlUGF0aCgpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBtb3ZlR3VuKCkge1xuICAgIHRoaXMuZ3VuWCA9IHRoaXMueCAtIDM7XG4gICAgdGhpcy5ndW5ZID0gdGhpcy55IC0gMTA7XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIG1vdmVMZWZ0KCkge1xuICAgIHRoaXMueCAtPSB0aGlzLnZ4O1xuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBtb3ZlUmlnaHQoKSB7XG4gICAgdGhpcy54ICs9IHRoaXMudng7XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIG1vdmVVcCgpIHtcbiAgICB0aGlzLnkgLT0gdGhpcy52eTtcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgbW92ZURvd24oKSB7XG4gICAgdGhpcy55ICs9IHRoaXMudnk7XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGVyYXNlKGN0eCkge1xuICAgIGN0eC5jbGVhclJlY3QodGhpcy54IC0gMTksIHRoaXMueSAtIDEwLCB0aGlzLndpZHRoICsgMzIsIHRoaXMuaGVpZ2h0ICsgMzUpXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDaGFyYWN0ZXI7XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vbGliL0NoYXJhY3Rlci5qcyIsImNsYXNzIEJ1bGxldCB7XG4gIGNvbnN0cnVjdG9yKHgsIHkpIHtcbiAgICB0aGlzLnggPSB4O1xuICAgIHRoaXMueSA9IHk7XG4gICAgdGhpcy52eSA9IC0yMDtcbiAgICB0aGlzLmhlaWdodCA9IDEwO1xuICAgIHRoaXMud2lkdGggPSAxMDtcbiAgfVxuXG4gIGRyYXcoY3R4KSB7XG4gICAgY3R4LmJlZ2luUGF0aCgpXG4gICAgY3R4LmZpbGxTdHlsZSA9ICd0cmFuc3BhcmVudCdcbiAgICBjdHguZmlsbFJlY3QodGhpcy54LCB0aGlzLnksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG5cbiAgICBjdHguYmVnaW5QYXRoKClcbiAgICBjdHguZmlsbFN0eWxlID0gJyMyQzM1MzknO1xuICAgIGN0eC5maWxsUmVjdCh0aGlzLngsIHRoaXMueSAtIDQsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0IC0gNCk7XG4gICAgY3R4LmNsb3NlUGF0aCgpO1xuXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5maWxsU3R5bGUgPSAnIzJDMzUzOSdcbiAgICBjdHgubW92ZVRvKHRoaXMueCArIDUsIHRoaXMueSAtIDEwKTtcbiAgICBjdHgubGluZVRvKHRoaXMueCArIDEwLCB0aGlzLnkgLSA1ICk7XG4gICAgY3R4LmxpbmVUbyh0aGlzLngsIHRoaXMueSAtIDUpO1xuICAgIGN0eC5maWxsKCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGVyYXNlKGN0eCkge1xuICAgIGN0eC5jbGVhclJlY3QodGhpcy54LCB0aGlzLnksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0IC0gdGhpcy52eSlcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIG1vdmUoKSB7XG4gICAgdGhpcy55ICs9IHRoaXMudnk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCdWxsZXQ7XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vbGliL0J1bGxldC5qcyIsImNsYXNzIFNwaWRlciB7XG4gIGNvbnN0cnVjdG9yICh4ID0gLTc1LCB5ID0gNDAwKSB7XG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLnkgPSB5O1xuICAgIHRoaXMucmFkaXVzID0gMjA7XG4gICAgdGhpcy52eSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDMpICsgMTtcbiAgICB0aGlzLnZ4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMykgKyAxO1xuICAgIHRoaXMuaW52ZXJzZSA9IDE7XG4gICAgdGhpcy53YWxrID0gMTA7XG4gIH1cblxuICBkcmF3KGN0eCkge1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBjdHguZmlsbFN0eWxlID0gJ3RyYW5zcGFyZW50JztcbiAgICBjdHguYXJjKHRoaXMueCwgdGhpcy55LCB0aGlzLnJhZGl1cywgMCwgKE1hdGguUEkgLyAxODApICogMzYwLCBmYWxzZSk7XG4gICAgY3R4LmZpbGwoKTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG5cbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4LmZpbGxTdHlsZSA9ICcjNTkzNjJGJztcbiAgICBjdHguYXJjKHRoaXMueCxcbiAgICAgIHRoaXMueSAtIDIyLFxuICAgICAgdGhpcy5yYWRpdXMgKiAyLjIsXG4gICAgICAoTWF0aC5QSSAvIDE4MCkgKiAzMCxcbiAgICAgIChNYXRoLlBJIC8gMTgwKSAqIDE1MCxcbiAgICAgIGZhbHNlKTtcbiAgICBjdHguZmlsbCgpO1xuICAgIGN0eC5jbG9zZVBhdGgoKTtcblxuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBjdHguZmlsbFN0eWxlID0gJyM1OTM2MkYnO1xuICAgIGN0eC5hcmModGhpcy54LFxuICAgICAgdGhpcy55ICsgMjIsXG4gICAgICB0aGlzLnJhZGl1cyAqIDIuMixcbiAgICAgIChNYXRoLlBJIC8gMTgwKSAqIDMzMCxcbiAgICAgIChNYXRoLlBJIC8gMTgwKSAqIDIxMCxcbiAgICAgIHRydWUpO1xuICAgIGN0eC5maWxsKCk7XG4gICAgY3R4LmNsb3NlUGF0aCgpO1xuXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5maWxsU3R5bGUgPSAnIzg4MDAwMCc7XG4gICAgY3R4LmFyYyh0aGlzLnggLSAxMCxcbiAgICAgIHRoaXMueSArIDIsXG4gICAgICB0aGlzLnJhZGl1cyAvIDMsXG4gICAgICAoTWF0aC5QSSAvIDE4MCkgKiAwLFxuICAgICAgKE1hdGguUEkgLyAxODApICogMzYwLFxuICAgICAgZmFsc2UpO1xuICAgIGN0eC5maWxsKCk7XG4gICAgY3R4LmNsb3NlUGF0aCgpO1xuXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5maWxsU3R5bGUgPSAnIzg4MDAwMCc7XG4gICAgY3R4LmFyYyh0aGlzLnggKyAxMCxcbiAgICAgIHRoaXMueSArIDIsXG4gICAgICB0aGlzLnJhZGl1cyAvIDMsXG4gICAgICAoTWF0aC5QSSAvIDE4MCkgKiAwLFxuICAgICAgKE1hdGguUEkgLyAxODApICogMzYwLFxuICAgICAgZmFsc2UpO1xuICAgIGN0eC5maWxsKCk7XG4gICAgY3R4LmNsb3NlUGF0aCgpO1xuXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5maWxsU3R5bGUgPSAnIzg4MDAwMCc7XG4gICAgY3R4LmFyYyh0aGlzLnggLSAyMCxcbiAgICAgIHRoaXMueSAtIDYsXG4gICAgICB0aGlzLnJhZGl1cyAvIDQsXG4gICAgICAoTWF0aC5QSSAvIDE4MCkgKiAwLFxuICAgICAgKE1hdGguUEkgLyAxODApICogMzYwLFxuICAgICAgZmFsc2UpO1xuICAgIGN0eC5maWxsKCk7XG4gICAgY3R4LmNsb3NlUGF0aCgpO1xuXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5maWxsU3R5bGUgPSAnIzg4MDAwMCc7XG4gICAgY3R4LmFyYyh0aGlzLnggKyAyMCxcbiAgICAgIHRoaXMueSAtIDYsXG4gICAgICB0aGlzLnJhZGl1cyAvIDQsXG4gICAgICAoTWF0aC5QSSAvIDE4MCkgKiAwLFxuICAgICAgKE1hdGguUEkgLyAxODApICogMzYwLFxuICAgICAgZmFsc2UpO1xuICAgIGN0eC5maWxsKCk7XG4gICAgY3R4LmNsb3NlUGF0aCgpO1xuXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5maWxsU3R5bGUgPSAnIzAwMDAwMCdcbiAgICBjdHgubW92ZVRvKHRoaXMueCArIDE1LCB0aGlzLnkgKyAxNyk7XG4gICAgY3R4LmxpbmVUbyh0aGlzLnggKyA1LCB0aGlzLnkgKyAxNyk7XG4gICAgY3R4LmxpbmVUbyh0aGlzLnggKyAxMCwgdGhpcy55ICsgMjcgKTtcbiAgICBjdHguZmlsbCgpO1xuXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5maWxsU3R5bGUgPSAnIzAwMDAwMCdcbiAgICBjdHgubW92ZVRvKHRoaXMueCAtIDE1LCB0aGlzLnkgKyAxNyk7XG4gICAgY3R4LmxpbmVUbyh0aGlzLnggLSA1LCB0aGlzLnkgKyAxNyk7XG4gICAgY3R4LmxpbmVUbyh0aGlzLnggLSAxMCwgdGhpcy55ICsgMjcgKTtcbiAgICBjdHguZmlsbCgpO1xuXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5zdHJva2VTdHlsZSA9ICcjMDAwMDAwJ1xuICAgIGN0eC5saW5lV2lkdGggPSA1O1xuICAgIGN0eC5tb3ZlVG8odGhpcy54IC0gMjMsIHRoaXMueSAtIDEwKTtcbiAgICBjdHgubGluZVRvKHRoaXMueCAtIDQwLCB0aGlzLnkgLSAzMCk7XG4gICAgY3R4LmxpbmVUbyh0aGlzLnggLSA3MCArIHRoaXMud2FsaywgdGhpcy55ICsgMTApO1xuICAgIGN0eC5zdHJva2UoKTtcblxuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAnIzAwMDAwMCdcbiAgICBjdHgubGluZVdpZHRoID0gNTtcbiAgICBjdHgubW92ZVRvKHRoaXMueCAtIDI3LCB0aGlzLnkgKyAxMCk7XG4gICAgY3R4LmxpbmVUbyh0aGlzLnggLSA0MCwgdGhpcy55IC0gMTApO1xuICAgIGN0eC5saW5lVG8odGhpcy54IC0gNTAgLSB0aGlzLndhbGssIHRoaXMueSArIDMwKTtcbiAgICBjdHguc3Ryb2tlKCk7XG5cbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4LnN0cm9rZVN0eWxlID0gJyMwMDAwMDAnXG4gICAgY3R4LmxpbmVXaWR0aCA9IDU7XG4gICAgY3R4Lm1vdmVUbyh0aGlzLnggKyAyMywgdGhpcy55IC0gMTApO1xuICAgIGN0eC5saW5lVG8odGhpcy54ICsgNDAsIHRoaXMueSAtIDMwKTtcbiAgICBjdHgubGluZVRvKHRoaXMueCArIDcwIC0gdGhpcy53YWxrLCB0aGlzLnkgKyAxMCk7XG4gICAgY3R4LnN0cm9rZSgpO1xuXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5zdHJva2VTdHlsZSA9ICcjMDAwMDAwJ1xuICAgIGN0eC5saW5lV2lkdGggPSA1O1xuICAgIGN0eC5tb3ZlVG8odGhpcy54ICsgMjcsIHRoaXMueSArIDEwKTtcbiAgICBjdHgubGluZVRvKHRoaXMueCArIDQwLCB0aGlzLnkgLSAxMCk7XG4gICAgY3R4LmxpbmVUbyh0aGlzLnggKyA1MCArIHRoaXMud2FsaywgdGhpcy55ICsgMzApO1xuICAgIGN0eC5zdHJva2UoKTtcblxuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAnIzAwMDAwMCdcbiAgICBjdHgubGluZVdpZHRoID0gMztcbiAgICBjdHgubW92ZVRvKHRoaXMueCAtIDMsIHRoaXMueSArIDEpO1xuICAgIGN0eC5saW5lVG8odGhpcy54IC0gMTIsIHRoaXMueSAtIDYpO1xuICAgIGN0eC5zdHJva2UoKTtcblxuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAnIzAwMDAwMCdcbiAgICBjdHgubGluZVdpZHRoID0gMztcbiAgICBjdHgubW92ZVRvKHRoaXMueCArIDMsIHRoaXMueSArIDEpO1xuICAgIGN0eC5saW5lVG8odGhpcy54ICsgMTIsIHRoaXMueSAtIDYpO1xuICAgIGN0eC5zdHJva2UoKTtcblxuICB9XG5cbiAgbW92ZSgpIHtcbiAgICB0aGlzLnggKz0gdGhpcy52eDtcbiAgICB0aGlzLnkgKz0gdGhpcy52eTtcbiAgICBpZiAodGhpcy54ICsgdGhpcy52eCA+IDExMDAgfHwgdGhpcy54ICsgdGhpcy52eCA8IC0xMDApIHtcbiAgICAgIHRoaXMudnggPSAtdGhpcy52eDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy55ICsgdGhpcy5yYWRpdXMgPiA3MDAgfHwgdGhpcy55ICsgdGhpcy5yYWRpdXMgPCAzMDApIHtcbiAgICAgIHRoaXMudnkgPSAtdGhpcy52eTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy54ICUgNSA9PT0gMCkge1xuICAgICAgdGhpcy5pbnZlcnNlID0gLXRoaXMuaW52ZXJzZTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy54ICUgMTAwID09PSAwKSB7XG4gICAgICB0aGlzLnZ4ID0gKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDMpICsgMikgKiB0aGlzLmludmVyc2U7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMueSAlIDc1ID09PSAwKSB7XG4gICAgICB0aGlzLnZ5ID0gKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDMpKSAqIHRoaXMuaW52ZXJzZTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy54ICUgNSA9PT0gMCkge1xuICAgICAgdGhpcy53YWxrID0gLXRoaXMud2FsaztcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgZXJhc2UoY3R4KSB7XG4gICAgY3R4LmNsZWFyUmVjdCh0aGlzLnggLSA4MywgdGhpcy55IC0gMzUsIDE2NSwgNjYpO1xuICAgIHJldHVybiB0aGlzXG4gIH1cbn1cblxuXG5cbm1vZHVsZS5leHBvcnRzID0gU3BpZGVyO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vbGliL1NwaWRlci5qcyIsImNvbnN0IEV4cGxvc2lvbiA9IHJlcXVpcmUoJy4vRXhwbG9zaW9uLmpzJyk7XG5cbmNsYXNzIEV4cGxvc2lvbk11c2hyb29tIGV4dGVuZHMgRXhwbG9zaW9uIHtcbiAgY29uc3RydWN0b3IgKHgsIHkpIHtcbiAgICBzdXBlcih4LCB5KTtcbiAgICB0aGlzLnJlZCA9ICdyZ2JhKDI1NSwgMCwgMCwgMC41KSc7XG4gICAgdGhpcy55ZWxsb3cgPSAncmdiYSgyNTUsMjU1LDAsIDAuNSknO1xuICB9XG5cbiAgZHJhdyhjdHgpIHtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMucmVkO1xuICAgIGN0eC5hcmModGhpcy54LCB0aGlzLnksIHRoaXMucmFkaXVzIC8gMiwgMCwgKE1hdGguUEkgLyAxODApICogMzYwLCBmYWxzZSk7XG4gICAgY3R4LmZpbGwoKTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG5cbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMueWVsbG93O1xuICAgIGN0eC5hcmModGhpcy54LCB0aGlzLnksIHRoaXMucmFkaXVzLCAwLCAoTWF0aC5QSSAvIDE4MCkgKiAzNjAsIGZhbHNlKTtcbiAgICBjdHguZmlsbCgpO1xuICAgIGN0eC5jbG9zZVBhdGgoKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRXhwbG9zaW9uTXVzaHJvb207XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vbGliL0V4cGxvc2lvbi1NdXNocm9vbS5qcyIsImNsYXNzIEV4cGxvc2lvbiB7XG4gIGNvbnN0cnVjdG9yKHgsIHkpIHtcbiAgICB0aGlzLnggPSB4O1xuICAgIHRoaXMueSA9IHk7XG4gICAgdGhpcy5yYWRpdXMgPSA0O1xuICAgIHRoaXMuZXhwYW5kID0gMztcbiAgfVxuXG4gIGRyYXcoY3R4KSB7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLnJlZDtcbiAgICBjdHguYXJjKHRoaXMueCwgdGhpcy55LCB0aGlzLnJhZGl1cyAvIDIsIDAsIChNYXRoLlBJIC8gMTgwKSAqIDM2MCwgZmFsc2UpO1xuICAgIGN0eC5maWxsKCk7XG4gICAgY3R4LmNsb3NlUGF0aCgpO1xuXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLnllbGxvdztcbiAgICBjdHguYXJjKHRoaXMueCwgdGhpcy55LCB0aGlzLnJhZGl1cywgMCwgKE1hdGguUEkgLyAxODApICogMzYwLCBmYWxzZSk7XG4gICAgY3R4LmZpbGwoKTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIG1vdmUoKSB7XG4gICAgdGhpcy5yYWRpdXMgKz0gdGhpcy5leHBhbmQ7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBlcmFzZShjdHgpIHtcbiAgICBjdHguY2xlYXJSZWN0KHRoaXMueCAtIHRoaXMucmFkaXVzLFxuICAgICAgdGhpcy55IC0gdGhpcy5yYWRpdXMsXG4gICAgICB0aGlzLnJhZGl1cyAqIDIsXG4gICAgICB0aGlzLnJhZGl1cyAqIDIpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBFeHBsb3Npb247XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vbGliL0V4cGxvc2lvbi5qcyIsImNvbnN0IEV4cGxvc2lvbiA9IHJlcXVpcmUoJy4vRXhwbG9zaW9uLmpzJyk7XG5cbmNsYXNzIEV4cGxvc2lvbkNlbnRpcGVkZSBleHRlbmRzIEV4cGxvc2lvbiB7XG4gIGNvbnN0cnVjdG9yICh4LCB5KSB7XG4gICAgc3VwZXIoeCwgeSk7XG4gICAgdGhpcy5saWdodEdyZWVuID0gJyNCNURBNDUnO1xuICAgIHRoaXMuZGFya0dyZWVuID0gJ2RhcmtncmVlbic7XG4gIH1cblxuICBkcmF3KGN0eCkge1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBjdHguZmlsbFN0eWxlID0gdGhpcy5kYXJrR3JlZW47XG4gICAgY3R4LmFyYyh0aGlzLngsIHRoaXMueSwgdGhpcy5yYWRpdXMgLyAyLCAwLCAoTWF0aC5QSSAvIDE4MCkgKiAzNjAsIGZhbHNlKTtcbiAgICBjdHguZmlsbCgpO1xuICAgIGN0eC5jbG9zZVBhdGgoKTtcblxuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBjdHguZmlsbFN0eWxlID0gdGhpcy5saWdodEdyZWVuO1xuICAgIGN0eC5hcmModGhpcy54LCB0aGlzLnksIHRoaXMucmFkaXVzLCAwLCAoTWF0aC5QSSAvIDE4MCkgKiAzNjAsIGZhbHNlKTtcbiAgICBjdHguZmlsbCgpO1xuICAgIGN0eC5jbG9zZVBhdGgoKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRXhwbG9zaW9uQ2VudGlwZWRlO1xuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2xpYi9FeHBsb3Npb24tQ2VudGlwZWRlLmpzIiwiY29uc3QgRXhwbG9zaW9uID0gcmVxdWlyZSgnLi9FeHBsb3Npb24uanMnKTtcblxuY2xhc3MgRXhwbG9zaW9uU3BpZGVyIGV4dGVuZHMgRXhwbG9zaW9uIHtcbiAgY29uc3RydWN0b3IgKHgsIHkpIHtcbiAgICBzdXBlcih4LCB5KTtcbiAgICB0aGlzLnJlZCA9ICcjODgwMDAwJztcbiAgICB0aGlzLmJyb3duID0gJyM1OTM2MkYnO1xuICB9XG5cbiAgZHJhdyhjdHgpIHtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMucmVkO1xuICAgIGN0eC5hcmModGhpcy54LCB0aGlzLnksIHRoaXMucmFkaXVzIC8gMiwgMCwgKE1hdGguUEkgLyAxODApICogMzYwLCBmYWxzZSk7XG4gICAgY3R4LmZpbGwoKTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG5cbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMuYnJvd247XG4gICAgY3R4LmFyYyh0aGlzLngsIHRoaXMueSwgdGhpcy5yYWRpdXMsIDAsIChNYXRoLlBJIC8gMTgwKSAqIDM2MCwgZmFsc2UpO1xuICAgIGN0eC5maWxsKCk7XG4gICAgY3R4LmNsb3NlUGF0aCgpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBFeHBsb3Npb25TcGlkZXI7XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vbGliL0V4cGxvc2lvbi1TcGlkZXIuanMiLCJjbGFzcyBIaWdoU2NvcmUge1xuICBjb25zdHJ1Y3RvciAobmFtZSwgc2NvcmUpIHtcbiAgICB0aGlzLmlkID0gRGF0ZS5ub3coKTtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMuc2NvcmUgPSBzY29yZTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEhpZ2hTY29yZTtcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9saWIvSGlnaC1TY29yZS5qcyIsImNsYXNzIFNvdW5kIHtcbiAgY29uc3RydWN0b3Ioc3JjKSB7XG4gICAgdGhpcy5zb3VuZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhdWRpb1wiKTtcbiAgICB0aGlzLnNvdW5kLnNyYyA9IHNyYztcbiAgICB0aGlzLnNvdW5kLnNldEF0dHJpYnV0ZShcInByZWxvYWRcIiwgXCJhdXRvXCIpO1xuICAgIHRoaXMuc291bmQuc2V0QXR0cmlidXRlKFwiY29udHJvbHNcIiwgXCJub25lXCIpO1xuICAgIHRoaXMuc291bmQuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5zb3VuZCk7XG4gIH1cbiAgICBcbiAgc3RvcCAoKXtcbiAgICB0aGlzLnNvdW5kLnBhdXNlKCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBwbGF5KCl7XG4gICAgdGhpcy5zb3VuZC5wbGF5KCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0gICBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTb3VuZDtcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9saWIvU291bmQuanMiXSwic291cmNlUm9vdCI6IiJ9