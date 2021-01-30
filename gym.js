let gameCanvas;
let game;
let inGameDisplay;
let itemDisplay;

// Initializes game on document load
window.addEventListener("load", function () {
	gameCanvas = document.getElementById("gameCanvas");
	inGameDisplay = document.getElementById("shoppingCartDisplay");
	itemDisplay = document.getElementById("checkoutDisplay");

	game = new Game(gameCanvas);
});

// Defines main game class
class Game {
	constructor(canvas) {
		// Sets up graphic context
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d");
		this.ctx.save();
		this.viewportPosition = new Vector2();
        this.mousePosition = new Vector2();
        
        // used for point and click/phone
        this.destinationPoint = new Vector2();

        if (window.outerWidth >= 1024 && window.outerHeight >= 768){
            this.bounds = [new Vector2(), new Vector2(1024, 768)];
        } else {
            this.bounds = [new Vector2(), new Vector2(window.outerWidth, window.outerHeight)];
        }
        
		this.floorTexture = new Image();
		this.floorTexture.src = "images/floor.png"

		// Sets up input handlers
		document.onkeydown = this.keyDownHandler.bind(this);
		document.onkeyup = this.keyUpHandler.bind(this);
        document.onmousemove = this.mouseMoveHandler.bind(this);

        ///todo
        document.onmousedown = this.mouseDownHandler.bind(this);

		// Sets up the array of keystates
		this.keystates = {};
		this.keysDown = {};

		// Creates entities
		this.entities = [];
		this.shoppingCart = [];
		this.items = {
			courseInfo: new ItemData("Course Information", "images/booksmall.svg", 0),
			coupon: new ItemData("\"Final Grade Coupon\" - Uhh...keep it?", "images/coupon.svg", 0, true)
		};

		// Creating 
		// Make a temporary array to use later
		let tables = [];
		// Make a shelf with tvs, and add it to the array
		let aTable = this.addEntity(new Table(500, 300, new Vector2(2, 1)));
		// This adds 2 tvs to the shelf
		/*aTable.addEntity(this.addEntity(new ItemEntity(0, 0, this.items.tv)));
		aTable.addEntity(this.addEntity(new ItemEntity(0, 0, this.items.tv)));*/
		tables.push(aTable);

		// Course Information
		aTable = this.addEntity(new Table(700, 300, new Vector2(2, 3)));
		for (let i = 0; i < 6; i++) {
			aTable.addEntity(this.addEntity(new ItemEntity(0, 0, this.items.courseInfo)));
		}
		tables.push(aTable);

		// Sauce shelf
		aTable = this.addEntity(new Table(200, 300, new Vector2(4, 2)));
		/*for (let i = 0; i < 5; i++) {
			aTable.addEntity(this.addEntity(new ItemEntity(0, 0, this.items.ranch)));
		}*/
		tables.push(aTable);

		// Potato shelf
		/*aTable = this.addEntity(new Table(200, 100, new Vector2(8, 2)));
		for (let i = 0; i < 16; i++) {
			aTable.addEntity(this.addEntity(new ItemEntity(0, 0, this.items.potato)));
		}*/
		tables.push(aTable);

		// Checkout and cash register
		aTable = this.addEntity(new Table(9, 620, new Vector2(3, 1)));
		this.player = this.addEntity(new Player(256, 192, { size: 40 }));
		this.addEntity(new ItemEntity(950, 50, this.items.coupon));

		// The bragging teacher
		this.addEntity(
			new NPC(
				// Position
				120,
				700,
				// Set of dialogue
				[
					"My last student's startup was sold\nfor $600 million US.\nHow much did yours go for?",
					"Should my other student do an IPO\nor SPAC...the stock market these\ndays is so hard to predict.",
                    "Yeah, I pretty much taught Bill\nGates everything he knows.",
                    "Yup, taught Jeff Bezos too.\nExcept that taking over\nthe world bit...",
                    "Facebook was actually my idea.\nZuckerberg just took my idea\nwhen I bragged too much one class.",
                    "Oliver, a grade 11 student, \ndid all the hard work for this\nprogram. I just Zuckerberg'd him."
				],
				// Behaviour script; personalized for each npc to get special behaviour
				function () {
				},
				// How many pixels the npc can reach
				60,
				// Optional args, but the only use is to set movement speed so kind of useless
				{ movementSpeed: 0.3 }
			)
		);

		// Confused student
		this.addEntity(
			new NPC(
				120,
				300,
				[
                    "Why are there only Computer\nStudies teachers at the course\nfair? Is this a sign?",
                    "I'm in Grade 10, I should\ntake ICS2O1!",
                    "No wait, I'm GOING to be in\nGrade 11 next year, I should\ntake ICS3U1!",
                    "Hold on, it's 2021. I'll\nbe in Grade 12 next year.\nI should take ICS4U1!",
                    "No...wait...no...\nI'm graduating...\nI shouldn't even be here!?!",
				],
				function () {
				},
				60,
				{ movementSpeed: 0.3 }
			)
		);

		// General Teacher
		this.addEntity(
			new NPC(
				600,
				500,
				[
					"In Grade 10, take ICS2O1.",
					"In Grade 11, you have 2 options.\nICS3U1 is recommended for many\nprograms, not just computer science.",
                    "You can also take ICS3C1. I don't\nrecommend it if you've taken\nor plan to take ICS2O1 though.",
                    "In Grade 12, you can take ICS4U1.\nHowever, Grade 11 ICS3U1 is\na prerequisite."
				],
				function() { 
					this.walkTo(game.player.position);
				},
				60,
				{ movementSpeed: 0.3 }
			)
		);

		// Grade 10 Teacher
		this.addEntity(
			new NPC(
				800,
				700,
				[
					"Hello, do you want to learn\nmore about ICS2O1 and ICS3C1?",
					"We learn how to make programs\nusing a language named Python.",
                    "We learn how to make neat games,\nusing Pygame. We make item\ncollection games, and\na Zelda-like battle game.",
					"We also learn about computer hardware,\nand how computers impact people,\nand the environment around us."
				],
				function () {},
				20,
				{
					movementSpeed: 0.3,
					// The stock of items
					inventory: {
						"Course Information": 40
					}
				}
			)
        );
        

        // Grade 11 Teacher
		this.addEntity(
			new NPC(
				300,
				100,
				[
					"Hello, do you want to learn more about ICS3U1?",
					"This year we learned how to make programs in JavaScript.\nThis web page game is based on a student's work.\nTopics: Basic HTML, variables, if statements, timer loops",
                    "This year we also learned the skills to make TypeRacer.\nTopics: Arrays, string functions,\nrandom numbers, functions",
                    "We also learn about array algorithms:\nsearching, data manipulation, sorting.",
					"We also learn about computer systems,\n and how computers impact people\n, and the environment around us."
				],
				function () {},
				20,
				{
					movementSpeed: 0.3,
				}
			)
		);


        // Grade 12 Teacher
		this.addEntity(
			new NPC(
				600,
				100,
				[
					"Hello, do you want to learn more about ICS4U1?\nYou need to have taken ICS3U1 first.",
                    "The main topic is object-oriented programming.\nWe do 2D arrays so we can make games like\nSimCity or Chess.",
                    "We also spend a lot of time learning about algorithms:\nbetter searches and sorts, recursion\nand some backtracking as well.",
					"We also learn about career opportunities,\nand society impacts of technology."
				],
				function () {},
				20,
				{
					movementSpeed: 0.3,
				}
			)
		);


		// Set the main update loop after a 1s delay to allow assets to load
		setTimeout(function () {
			setInterval(this.update.bind(this), 16);
		}.bind(this), 1000);
	}

	// Sets a key to true if pressed
	keyDownHandler(e) {
		this.keystates[e.key] = true;
		this.keysDown[e.key] = true;
		if (e.keyCode == 32 && e.target == document.body) {
			e.preventDefault();
		}
	}

	// Sets a key to false when letting go
	keyUpHandler(e) {
		this.keystates[e.key] = false;
	}

	// Sets the mouse position when moved
	mouseMoveHandler(e) {
		var rect = game.canvas.getBoundingClientRect();
		game.mousePosition.x = e.clientX - rect.left;
		game.mousePosition.y = e.clientY - rect.top;
	}

    mouseDownHandler(e){
        var rect = game.canvas.getBoundingClientRect();
		game.destinationPoint.x = e.clientX - rect.left;
		game.destinationPoint.y = e.clientY - rect.top;
    }

    autoMove(){
    
    }

	// Function to get whether or not a key is pressed currently
	getKey(key) {
		if (this.keystates[key]) {
			return true;
		} else {
			return false;
		}
	}

	// Function to see if a key has been pressed on the first frame
	getKeyDown(key) {
		if (this.keysDown[key]) {
			return true;
		} else {
			return false;
		}
	}

	// Add an entity to the global list
	addEntity(e) {
		this.entities.push(e);

		return e;
	}

	// Main game loop
	update() {
		// Update all entities
		for (let e of this.entities) {
			e.update();
		}

		// Camera follow player
		this.viewportPosition = Vector2.Lerp(this.viewportPosition, Vector2.Lerp(this.player.position.clone(), this.mousePosition, 0.1).add(new Vector2(-256, -192)),
			this.viewportPosition.clone()
				.multiply(-1)
				.add(this.player.position)
				.magnitude / 5000
		);

		// Reset the keydown object
		this.keysDown = {};
		// Draw eveything
		this.render();
	}

	// Draws all necessary elements
	render() {
		this.ctx.clearRect(0, 0, 512, 384);

		this.ctx.save();
		this.ctx.beginPath();
		this.ctx.strokeStyle = "#000000";
		this.ctx.lineWidth = 18;
		let tpos1 = this.WtSPoint(this.bounds[0]);
		let tpos2 = this.WtSPoint(this.bounds[1]);

		// Background and setting
		// Road
		this.ctx.fillStyle = "#707070";
		this.ctx.fillRect(tpos1.x - 512, tpos1.y - 128, 2048, 128);
		// Grass
		this.ctx.fillStyle = "#37a967";
		this.ctx.fillRect(tpos1.x - 512, tpos1.y, 2048, 2048);
		// Floorboards
		this.ctx.fillStyle = "#a67c28";
		this.ctx.fillRect(tpos1.x, tpos1.y, tpos2.x - tpos1.x, tpos2.y - tpos1.y);
		// Walls
		this.ctx.strokeRect(tpos1.x, tpos1.y, tpos2.x - tpos1.x, tpos2.y - tpos1.y)

		this.ctx.restore();

		// Render all entities
		for (let e of this.entities) {
			e.draw(this.ctx);
		}

		// Draws the info box if player is on top of something
		if (this.player.targetEntity != null) {
			this.ctx.save();
			this.ctx.beginPath();
			this.ctx.fillStyle = "hsla(0deg, 0%, 0%, 0.5)"
			this.ctx.fillRect(20, 20, 472, 100);

			this.ctx.fillStyle = "#ffffff"
            this.ctx.font = "18pt Courier new";
            
			let text = String(this.player.targetEntity.getInteractText());
			let lines = text.split('\n');
			
			for ( let i = 0; i < lines.length; i++){
				this.ctx.fillText(lines[i], 40, 50 + i * 22, 432);
			}

			// this.ctx.fillText(this.player.targetEntity.getInteractText(), 40, 50, 432);

			this.ctx.restore();
		}

	}

	// World to screen coordinates
	WtSPoint(v) {
		return new Vector2().add(v).add(new Vector2().set(this.viewportPosition).multiply(-1));
	}

	// Screen to world coordinates
	StWPoint(v) {
		return new Vector2().add(v).add(new Vector2().set(this.viewportPosition));
	}

	// Updates the html for the shopping cart
	updateShoppingCartDisplay() {
		// Reset display to null
		inGameDisplay.innerHTML = "";

		// Create element for shoopping cart overview (shows the subtotal and item count)
		let overview = document.createElement("div");

		// icon
		let temp = document.createElement("img");
		temp.src = "images/shoppingcart.svg";
		overview.appendChild(temp);

		// Title
		temp = document.createElement("h1");
		temp.append(document.createTextNode(this.shoppingCart.length + " items in your cart"));
		overview.appendChild(temp);

		// calculate price
		temp = document.createElement("p");
		let subtotal = 0;
		let factor = 1;
		for (let item of this.shoppingCart) {
			if (item.multiplicative) {
				factor *= item.price;
			} else {
				subtotal += item.price;
			}
		}
		subtotal *= factor;
		subtotal = "Subtotal: $" + subtotal.toFixed(2);
		temp.append(document.createTextNode(subtotal));
		overview.appendChild(temp);


		inGameDisplay.appendChild(overview);

		// Add a div ith info for each item in cart
		let i = 0;
		for (let item of this.shoppingCart) {
			let node = document.createElement("div");
			node.setAttribute("data-shoppingIndex", i);
			node.addEventListener("click", function () { game.player.dropItem(node.getAttribute("data-shoppingIndex")) }.bind(game.player), false);

			let itemImage = document.createElement("img");
			itemImage.src = item.image.src;

			let itemName = document.createElement("p");
			itemName.append(document.createTextNode(item.name));

			let itemPrice = document.createElement("p");
			itemPrice.append(document.createTextNode(item.getPriceAsString()));

			node.appendChild(itemImage);
			node.appendChild(itemName);
			node.appendChild(itemPrice);

			inGameDisplay.appendChild(node);
			i++;
		}
	}

	// Function to add an item to cart
	addItemToShoppingCart(i) {
		this.shoppingCart.push(i);
		this.updateShoppingCartDisplay();
		return i;
	}

	// Function to remove item from cart
	removeItemFromShoppingCart(i) {
		this.shoppingCart.splice(this.shoppingCart.indexOf(i), 1);
		this.updateShoppingCartDisplay();
		return i;
	}

	// Function to remove item from cart at certain index
	removeItemFromShoppingCartByIndex(i) {
		i = this.shoppingCart.splice(i, 1);
		this.updateShoppingCartDisplay();
		return i;
	}
}

// Base entity class
class Entity {
	constructor(x, y, {
		// Optional Kwargs (most of which are not used lol)
		friction = 0.8,
		size = 20,
		movementSpeed = 1,
		interactable = true
	} = {}) {
		// Bool that enables updating
		this.alive = true;
		// Bool that allows interacting and shows text
		this.interactable = interactable;

		// Transform and physics data
		this.position = new Vector2(x, y);
		this.velocity = new Vector2();
		this.size = size;
		this.movementSpeed = movementSpeed;
		this.friction = friction;

		this.lifetimeElapsed = 0;

		// Just an empty overridable function so I can implement simple code without having to rewrite the constructor
		this.init();
	}

	init() {

	}

	update() {
		// Fisicks
		this.position.add(this.velocity);
		this.velocity.multiply(this.friction);
		this.lifetimeElapsed++;

		// Game bounds
		if (this.position.x - this.size < game.bounds[0].x) this.position.x = game.bounds[0].x + this.size;
		else if (this.position.x + this.size > game.bounds[1].x) this.position.x = game.bounds[1].x - this.size;
		if (this.position.y - this.size < game.bounds[0].y) this.position.y = game.bounds[0].y + this.size;
		else if (this.position.y + this.size > game.bounds[1].y) this.position.y = game.bounds[1].y - this.size;
	}

	draw(ctx) {
		ctx.save();
		ctx.beginPath();
		// Sets temporary position variable converted into screen space for rendering
		let tpos = game.WtSPoint(this.position);
		// Draws a circle at position
		ctx.arc(tpos.x, tpos.y, this.size, 0, Math.PI * 2);
		ctx.fillStyle = "#ffffff";
		ctx.fill();

		ctx.restore();
	}

	// Checks for collision against another entity
	collideWith(other) {
		// Yeah ik really long function chain, basically gets distance between 2 circles and compares with the sum of their sizes
		if (this.position.clone().add(other.position.clone().multiply(-1)).magnitude < this.size + other.size) {
			return true;
		} else {
			return false;
		}
	}

	// Removes entity from global list, leaving it for gc
	destroy() {
		game.entities.splice(game.entities.indexOf(this), 1);
		this.alive = false;
	}

	// Function to call when interacting
	interact() {

	}

	// Overridable function to get the text to render
	getInteractText() {
		return "";
	}
}

// Player's class that inherits from entity
class Player extends Entity {
	constructor(x, y, ...args) {
		super(x, y, args[0]);

		this.image = new Image();
		this.image.src = "images/human.svg";
		this.rotation = 0;
		this.targetEntity = null;
	}

	update() {
		// Movement
		if (game.getKey("w")) {
			this.velocity.y -= this.movementSpeed;
		}
		if (game.getKey("s")) {
			this.velocity.y += this.movementSpeed;
		}
		if (game.getKey("a")) {
			this.velocity.x -= this.movementSpeed;
		}
		if (game.getKey("d")) {
			this.velocity.x += this.movementSpeed;
		}

		// Sets rotation based on velocity
		if (this.velocity.x != 0 || this.velocity.y != 0) {
			this.rotation = Math.PI - Math.atan2(this.velocity.x, this.velocity.y);
		}

		// Checks if stepping over an item
		// If has a target, makes sure is still in range of target
		// Otherwise, looks for a collision with any other objects
		if (this.targetEntity) {
			if (!this.collideWith(this.targetEntity)) {
				this.targetEntity = null
			}
		} else {
			for (let e of game.entities) {
				if (e != this && e.interactable && this.collideWith(e)) {
					this.targetEntity = e;
					break;
				}
			}
		}

		// Interact with target
		if (this.targetEntity && game.getKeyDown(" ")) {
			this.targetEntity.interact();
			this.targetEntity = null;
		}

		super.update();
	}

	draw(ctx) {
		// Slightly more complex draw function
		ctx.save();
		let tpos = game.WtSPoint(this.position);
		ctx.translate(tpos.x, tpos.y);
		ctx.moveTo(0, 0)
		ctx.rotate(this.rotation);
		ctx.scale(0.5, 0.5);

		ctx.fillStyle = "#000000";
		ctx.beginPath();
		// Draws feet by amplitude modulating a sine wave to velocity
		ctx.arc(this.image.width * 0.25, Math.sin(this.lifetimeElapsed / 5) * 24 * (this.velocity.magnitude / this.movementSpeed / 5), 24, 0, Math.PI * 2);
		ctx.fill();
		ctx.beginPath();
		// Same as first foot but phase inverted
		ctx.arc(this.image.width * -0.25, -Math.sin(this.lifetimeElapsed / 5) * 24 * (this.velocity.magnitude / this.movementSpeed / 5), 24, 0, Math.PI * 2);
		ctx.fill();

		ctx.drawImage(this.image, -this.image.width / 2, -this.image.height / 2);
		ctx.restore();
	}

	// Takes item out of shopping cart and makes a new item entity of the same kind
	dropItem(item) {
		item = game.removeItemFromShoppingCartByIndex(item);
		let e = game.addEntity(new ItemEntity(this.position.x, this.position.y, item[0]));
		e.velocity.add(new Vector2(0, -10).rotate(this.rotation * (360 / (2 * Math.PI))))
	}
}

// Class that holds the information of a type of item
class ItemData {
	constructor(name, imageSource, price, multiplicative = false) {
		this.name = name;
		this.image = new Image();
		this.image.src = imageSource;
		this.price = price;
		this.multiplicative = multiplicative; // Whether or not to multiply the total rather than add
	}

	// Function to get the string interpretation of value
	getPriceAsString() {
		if (this.multiplicative) {
			return ((1 - this.price) * 100).toFixed(0) + "%";
		} else {
			return "$" + this.price;
		}
	}
}

// Child class of entity that shows an item and is pickupable
class ItemEntity extends Entity {
	constructor(x, y, itemSource, ...args) {
		super(x, y, args[0]);
		this.itemSource = itemSource;
	}

	draw(ctx) {
		// Draws image of item at position
		ctx.save();
		let tpos = game.WtSPoint(this.position.clone().add(new Vector2(this.itemSource.image.width, this.itemSource.image.height).multiply(-0.5)))
		ctx.drawImage(this.itemSource.image, tpos.x, tpos.y);

		ctx.restore();
	}

	interact() {
		// Moves item to shopping cart
		game.addItemToShoppingCart(this.itemSource);
		this.destroy();
		game.player.targetEntity = null;
	}

	getInteractText() {
		return this.itemSource.name + "   " + this.itemSource.getPriceAsString();
	}
}

// Child class of entity that allows checking out
class CashRegister extends Entity {
	init() {
		this.image = new Image();
		this.image.src = "images/cashRegister.svg";
	}

	draw(ctx) {
		ctx.save();
		let tpos = game.WtSPoint(this.position.clone().add(new Vector2(this.image.width, this.image.height).multiply(-0.5)))
		ctx.drawImage(this.image, tpos.x, tpos.y);

		ctx.restore();
	}

	// Checks out on interact
	interact() {
		itemDisplay.innerHTML = "";
		let temp = document.createElement("p");
		let subtotal = 0;
		let factor = 1;
		for (let item of game.shoppingCart) {
			if (item.multiplicative) {
				factor *= item.price;
			} else {
				subtotal += item.price;
			}
		}
		subtotal *= factor;

		// Makes a series of text nodes to display price
		let tempString = "Subtotal: $" + subtotal.toFixed(2) + "\n";
		temp.append(document.createTextNode(tempString));
		temp.append(document.createElement("br"));

		tempString = "Taxes: $" + (subtotal * 0.13).toFixed(2) + "\n";
		temp.append(document.createTextNode(tempString));
		temp.append(document.createElement("br"));

		tempString = "Shipping and handling: $" + ((subtotal < 100) ? 10 : 0).toFixed(2);
		temp.append(document.createTextNode(tempString));
		temp.append(document.createElement("br"));

		tempString = "-----------";
		temp.append(document.createTextNode(tempString));
		temp.append(document.createElement("br"));

		tempString = "Total: $" + (subtotal * 1.13 + ((subtotal < 100) ? 10 : 0)).toFixed(2) + "\n";
		temp.append(document.createTextNode(tempString));
		temp.append(document.createElement("br"));

		itemDisplay.appendChild(temp);
		itemDisplay.style.height = "200px";
	}

	getInteractText() {
		return "Check out";
	}
}

class NPC extends Entity {
	constructor(x, y, dialogue, behavior = null, reachRange = 20, ...args) {
		super(x, y, args[0]);

		this.dialogue = dialogue;
		this.dialogue.unshift(["Talk"])
		this.currentDialogue = 0;

		this.behavior = behavior;

		this.image = new Image();
		this.image.src = "images/human.svg";
		this.destination = null;
		this.reachRange = reachRange;
		this.inventory = {}
		if (args[0].inventory !== undefined) {
			this.inventory = args[0].inventory;
		}
	}

	update() {
		if (this.velocity.x != 0 || this.velocity.y != 0) {
			this.rotation = Math.PI - Math.atan2(this.velocity.x, this.velocity.y);
		}

		if (this.behavior != null) {
			this.behavior();
		}

		if (this.destination !== null) {
			let reachedDestinationX = false;
			let dpos = new Vector2(this.destination.x - this.position.x, this.destination.y - this.position.y);
			if (dpos.x < -this.reachRange) {
				this.velocity.x -= this.movementSpeed;
			} else if (dpos.x > this.reachRange) {
				this.velocity.x += this.movementSpeed;
			} else {
				reachedDestinationX = true;
			}
			if (dpos.y < -this.reachRange) {
				this.velocity.y -= this.movementSpeed;
			} else if (dpos.y > this.reachRange) {
				this.velocity.y += this.movementSpeed;
			} else if (reachedDestinationX) {
				this.destination = null;
			}
		}

		super.update();
	}

	draw(ctx) {
		ctx.save();
		let tpos = game.WtSPoint(this.position);
		ctx.translate(tpos.x, tpos.y);
		ctx.moveTo(0, 0)
		ctx.rotate(this.rotation);
		ctx.scale(0.5, 0.5);

		ctx.fillStyle = "#000000";
		ctx.beginPath();
		ctx.arc(this.image.width * 0.25, Math.sin(this.lifetimeElapsed / 5) * 24 * (this.velocity.magnitude / this.movementSpeed / 5), 24, 0, Math.PI * 2);
		ctx.fill();
		ctx.beginPath();
		ctx.arc(this.image.width * -0.25, -Math.sin(this.lifetimeElapsed / 5) * 24 * (this.velocity.magnitude / this.movementSpeed / 5), 24, 0, Math.PI * 2);
		ctx.fill();

		ctx.drawImage(this.image, -this.image.width / 2, -this.image.height / 2);
		ctx.restore();
	}

	getInteractText() {
		return this.dialogue[this.currentDialogue];
	}

	interact() {
		this.currentDialogue++;
		this.currentDialogue %= this.dialogue.length;
		if (this.dialogue[this.currentDialogue] == "Talk") {
			this.dialogue.shift();
		}
	}

	walkTo(destination, override = false) {
		if (this.destination == null || override) {
			this.destination = destination;
		}
	}
}

// Non interactible entity that holds other item entities
class Table extends Entity {
	constructor(x, y, dimensions, ...args) {
		super(x, y, args[0]);

		this.dimensions = dimensions;
		this.itemCount = 0;
		this.items = new Array(this.dimensions.x * this.dimensions.y).fill(null);
		this.interactable = false;
		this.defaultItem = null;
	}

	update() {
		for (let item of this.items) {
			if (item != null && !item.alive) {
				this.items[this.items.indexOf(item)] = null;
				this.itemCount--;
			}
		}
	}

	// add something to shelf
	addEntity(e) {
		try {
			this.defaultItem = e.itemSource;
		} finally {

		}
		if (this.items.every((value) => { console.log("ASDO"); return value != null; }, this)) {
			return e;
		}
		let index = this.items.indexOf(null);
		this.items[index] = e;
		e.position = this.position.clone().add(new Vector2(32 + (64 * (index % this.dimensions.x)), 32 + (64 * Math.floor(index / this.dimensions.x))));
		this.itemCount++;
		return e;
	}

	draw(ctx) {
		ctx.save();
		ctx.beginPath();

		ctx.fillStyle = "#664910";
		let tpos = game.WtSPoint(this.position);
		ctx.fillRect(tpos.x, tpos.y, this.dimensions.x * 64, this.dimensions.y * 64);

		ctx.restore();
	}
}

// Class for 2d vectors but I don't know what i'm doing so it's terrible
// You'll see me using these long strings of functions because i need to clone vectors to do stuff, why isn't there operator overloading in js
// I'm just used to unity vectors so i need this
class Vector2 {
	// Creates a new vector; defaults to (0, 0)
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}

	// Sets this vector to another vector (because this is a reference type)
	set(v) {
		this.x = v.x;
		this.y = v.y;

		return this;
	}

	// A static function that returns the sum of 2 vectors
	static add(v1, v2) {
		return new Vector2(v1.x + v2.x, v1.y + v2.y);
	}

	// Adds and returns this vector added with another
	add(other) {
		this.x += other.x;
		this.y += other.y;

		return this;
	}

	// Same as add but multiplying by a factor
	static multiply(v1, factor) {
		return new Vector2(v1.x * factor, v1.y * factor);
	}

	multiply(factor) {
		this.x *= factor;
		this.y *= factor;

		return this;
	}

	// Stolen from stackoverflow because I haven't done math in ages
	static rotate(v, d) {
		var sin = Math.sin(d * deg2Rad);
		var cos = Math.cos(d * deg2Rad);

		var tv = new Vector2(v)
		x = (cos * tv.x) - (sin * tv.y);
		y = (sin * tv.x) + (cos * tx.y);
		return tv;
	}

	rotate(d) {
		let sin = Math.sin(d * (Math.PI / 180));
		let cos = Math.cos(d * (Math.PI / 180));

		this.x = (cos * this.x) - (sin * this.y);
		this.y = (sin * this.x) + (cos * this.y);

		return this;
	}

	// Returns a deep copy of this vector
	clone() {
		return new Vector2().set(this);
	}

	// Interpolates 2 vectors
	static Lerp(v1, v2, f) {
		v1 = v1.clone();
		let tv1 = v1.clone();
		v2 = v2.clone();
		return new Vector2().set(v2.add(v1.multiply(-1)).multiply(f).add(tv1));
	}

	// Returns the magnitude of vector
	get magnitude() {
		return Math.sqrt((this.x) ** 2 + (this.y) ** 2);
	}
}
