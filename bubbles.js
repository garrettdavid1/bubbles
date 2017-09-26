setTimeout(function () {
	// Initial Setup
	var canvas = $('#canvas')[0];
	var c = canvas.getContext('2d');
	$('#finalScore').hide();

	canvas.width = innerWidth;
	canvas.height = innerHeight;
	canvas.style.position = 'absolute';
	canvas.style.backgroundColor = 'lightblue';
	canvas.style.top = 0;
	canvas.style.left = 0;

	var hexToRgba = function(hex) {
		var c;
		if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
			c = hex.substring(1).split('');
			if (c.length == 3) {
				c = [c[0], c[0], c[1], c[1], c[2], c[2]];
			}
			c = '0x' + c.join('');
			return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ', .2)';
		}
		throw new Error('Bad Hex');
	}

	var mouse = {
		x: innerWidth / 2,
		y: innerHeight / 2
	};

	var colors = [
		'#89FEFA',
		'#20D5F6',
		'#1873B9',
		'#2B3FB2',
		'#0B0A89'
	];


	addEventListener('mousemove', function () {
		mouse.x = event.clientX;
		mouse.y = event.clientY;
	});

	addEventListener('resize', function () {
		canvas.width = innerWidth;
		canvas.height = innerHeight;

		init();
	});


	function randomIntFromRange(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}

	function randomColor(colors) {
		return colors[Math.floor(Math.random() * colors.length)];
	}


	function Circle(x, y, dx, dy, radius, color, strokeStyle) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
		this.dx = dx;
		this.dy = dy;
		this.dmax = 1;
		this.ymax = 3;
		this.yDirection = 1;
		this.xDirection = this.x / (this.x * -1);
		this.strokeStyle = strokeStyle;

		this.update = function () {
			this.draw();
		};

		this.draw = function () {
			if (this.y <= -radius) {
				this.y = window.innerHeight + this.radius;
			}

			if (this.dx > 1 || this.dx < -1) {
				this.dx = (this.dx * 1);
			}

			if (this.x >= (window.innerWidth + radius)) {
				this.x = -radius;
			}
			if (!(this.dx >= this.dmax)) {
				this.x -= this.dx;
			} else {
				this.x += this.dx;
			}

			if (!(this.dy >= this.ymax)) {
				this.dy += .05;
			}

			this.y -= this.dy;

			c.beginPath();
			c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, this.color);
			c.fillStyle = this.color;
			c.fill();
			c.strokeStyle = this.strokeStyle;
			c.stroke();
			c.closePath();
		};
	}

	if(canvas.width < 400){
		var radiusMultiplier = 200;
	} else{
		var radiusMultiplier = 50;
	}

	var objects;
	var radius;
	var x;
	var y;
	var dx;
	var dy;
	var color;
	var hexColor;
	function init() {
		objects = [];

		for (var i = 0; i < 200; i++) {
			radius = Math.random() * radiusMultiplier;
			x = randomIntFromRange(radius, window.innerWidth - radius);
			y = randomIntFromRange(radius, window.innerHeight + radius);
			dy = randomIntFromRange(1, 5);
			dx = randomIntFromRange(-3, 3);
			hexColor = randomColor(colors);
			color = hexToRgba(hexColor);
			objects.push(new Circle(x, y, dx, dy, radius, color, '#89FEFA'));
		}
	}

	var totalPoints = 0;
	var totalClicks = 0;
	var score = 0;
	var timeLeft = 10;
	

	var gameTimer = setInterval(function () {
		$('.timeLeft').text(timeLeft);
		if (timeLeft <= 0) {
			$('#canvas').css('pointer-events', 'none');
			$('#finalScore').show();
			$('#scoreboard').hide();
			if (totalPoints < 100) {
				$('.rating').text('You can do better than that...');
			} else if (totalPoints >= 100 && totalPoints < 300) {
				$('.rating').text('Not too shabby, grasshopper.');
			} else if (totalPoints >= 300 && totalPoints < 400) {
				$('.rating').text('Watch out, everyone! We have a baller on our hands!');
			} else if (totalPoints >= 400) {
				$('.rating').text('You\'re so good, you broke the game!');
			} else {
				$('.rating').text('...umm....Did you even try?');
			}
			clearInterval(gameTimer);
		}
		timeLeft--;
	}, 1000);

	// Add event listener for `click` events.
	canvas.addEventListener('click', function (event) {
		var clickX = event.pageX,
			clickY = event.pageY;
			registerInput(clickX, clickY);
	}, false);

	function registerInput(x, y){
		totalClicks++;
		for (var i = 0; i < objects.length; i++) {
			if (y > (objects[i].y - objects[i].radius) && y < (objects[i].y + objects[i].radius) && x > (objects[i].x - objects[i].radius) && x < (objects[i].x + objects[i].radius)) {
				updateScore(50 - objects[i].radius);
				radius = Math.random() * radiusMultiplier;
				x = randomIntFromRange(radius, window.innerWidth - radius);
				dy = randomIntFromRange(1, 5);
				dx = randomIntFromRange(-3, 3);
				hexColor = randomColor(colors);
				color = hexToRgba(hexColor);
				objects[i] = new Circle(x, window.innerHeight + radius, dx, dy, radius, color, '#89FEFA');
			} else {
				updateScore(0);
			}
	}

	function updateScore(points) {
		totalPoints += parseInt(points);
		$('.points').text(totalPoints);
		// $('.clicks').text(totalClicks);
		// $('.score').text(parseInt((totalPoints / totalClicks) * 10));
	}

	// Animation Loop
	function animate() {
		requestAnimationFrame(animate);
		c.clearRect(0, 0, canvas.width, canvas.height);

		objects.forEach(function (object) {
			if (object !== '') {
				object.update();
			}
		});
	}

	// Set up touch events for mobile, etc
	canvas.addEventListener("touchstart", function (e) {
		mousePos = getTouchPos(canvas, e);
		var touch = e.touches[0];
		var mouseEvent = new MouseEvent("mousedown", {
			clientX: touch.clientX,
			clientY: touch.clientY
		});
		canvas.dispatchEvent(mouseEvent);
	}, false);
	canvas.addEventListener("touchend", function (e) {
		var mouseEvent = new MouseEvent("mouseup", {});
		canvas.dispatchEvent(mouseEvent);
	}, false);
	canvas.addEventListener("touchmove", function (e) {
		var touch = e.touches[0];
		var mouseEvent = new MouseEvent("mousemove", {
			clientX: touch.clientX,
			clientY: touch.clientY
		});
		canvas.dispatchEvent(mouseEvent);
	}, false);

	// Get the position of a touch relative to the canvas
	function getTouchPos(canvasDom, touchEvent) {
		var rect = canvasDom.getBoundingClientRect();
		return {
			x: touchEvent.touches[0].clientX - rect.left,
			y: touchEvent.touches[0].clientY - rect.top
		};
	}

	init();
	animate();
}, 500);