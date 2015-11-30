/******************************************************************************
* February 7, 2014
* @file invaders.js
* @brief This is the main javascript file for our space invaders assignment.
* @details The game's state is stored in several global variables. At a set 
interval, multiple update functions are called to simulate motion in the game
by redrawing the gameplay elements at different positions.
******************************************************************************/

/******************************************************************************
* Encase these variables within a JQuery ready block so that the DOM objects
* on the index.html page get to finish loading before the Javascript code can
* start manipulating them.
******************************************************************************/
$(document).ready(function() {
	// Set the dimensions of the canvas where the gameplay occurs
	// The default resolution is 640x480
	gameScreen = $("#gameScreen");
	gameScreen.width=WIDTH;
	gameScreen.height=HEIGHT;
	// set initial level to be 1
	currentLevel = 1;
	
	// Modifications to the canvas must be done on the canva's 2D context
	context = gameScreen.getContext('2d');
	// When the page loads, display a welcome screen 
	context.font = 'bold 16px arial';
	context.textBaseline = 'bottom';
	context.fillText('Welcome to Space Invaders!',200,200);
	context.fillText('Press the Space Bar to start a new game.',150,220);
});

/******************************************************************************
* The global variables below hold data representing key elements of the game's
* state like the player's health level and the number of live enemies present
******************************************************************************/
var gameScreen, context; // References to HTML5 canvas and its 2D context
var WIDTH = 640, HEIGHT = 480; // Resolution of gameplay area
var currentLevel; // What level the game is currently at
var MAXLEVELS = 3; // Max number of levels needed to beat for advance
var newLevel = false; // Boolean, record whether a new level is in progress
var gameOver; // Boolean, record whether the current game is over
var score = 0; // Player's score, incremented every time an enemy dies
var myPlayer; // Object to store player properties ("vehicle" type)
var myShots = []; // Object to store player's shots (array of type "shot")
var foeShots = []; // Object to store enemies' shots (array of type "shot")
var foes = []; // Object to store enemy properties (array of type "enemy")
var MAXROWS = 4, MAXCOLS = 5; // Dimensions of enemy grid when enemies spawn
var foeSpeed; // movement speed of enemies (determined by user w/radio buttons)
var MAXSHOTS = 3; // Max # of player shots allowed on screen at the same time
// for enemies, max # of shots is double the value of MAXSHOTS

/******************************************************************************
* Use event listeners to handle keyboard interrupts for game control. The
* variable "keyState" is an array whose indices correspond to ASCII codes. When
* a key is pressed ("keydown" event), its corresponding index in "keyState" is
* set to true. When the key rises back up ("keyup" event), its corresponding 
* index in "keyState" is set to false. 
******************************************************************************/
var keyState = [];
window.addEventListener('keydown',function(e){
	// Don't allow the space bar to scroll in the browser window
	// Don't allow arrow keys to change the radio button selections
	if (e.keyCode==32 || e.keyCode==37 || e.keyCode==39)
		e.preventDefault(); // Prevent spacebar's default behaviour
    keyState[e.keyCode || e.which] = true;
},true);    
window.addEventListener('keyup',function(e){
    keyState[e.keyCode || e.which] = false;
},true);

/******************************************************************************
* @brief Constructor function for an object to store player properties
* @param _pic The file path of the image used for representing the player
* @param _x The initial x-coordinate of the player image on the canvas
* @param _y The initial y-coordinate of the player image on the canvas
* @param _health The amount of health the player spawns with
******************************************************************************/
function vehicle(_pic,_x,_y,_health) {
	this.pic = new Image();
	this.pic.src = _pic;
	this.x = _x;
	this.y = _y;
	this.health = _health;
}

/******************************************************************************
* @brief Constructor function for an object to store fired-shot properties
* @param _pic The file path of the image used for representing the shot
* @param _x The initial x-coordinate of the shot image on the canvas
* @param _y The initial y-coordinate of the shot image on the canvas
******************************************************************************/
function shot(_pic,_x,_y) {
	this.pic = new Image();
	this.pic.src = _pic;
	this.x = _x;
	this.y = _y;
}

/******************************************************************************
* @brief Constructor function for an object to store enemy properties
* @param _pic The file path of the image used for representing the enemy
* @param _x The initial x-coordinate of the enemy image on the canvas
* @param _y The initial y-coordinate of the enemy image on the canvas
* @param _health The amount of health the enemy spawns with
* @param _dir The direction the enemy starts moving in (-1=left, +1=right)
******************************************************************************/
function enemy(_pic,_x,_y,_health,_dir) {
	this.pic = new Image();
	this.pic.src = _pic;
	this.x = _x;
	this.y = _y;
	// This gets decremented by 1 when a player-fired shot hits the enemy
	this.health = _health;
	this.dir = _dir;
}

// Set 25-millisecond interval for updating the game state
setInterval(function() {updateGameState()},25);

/******************************************************************************
* @brief Call updater functions for the game objects, then redraw them
* @return Nothing, unless the game ends
******************************************************************************/
function updateGameState(){
	// Start a new level if there isn't already one in progress
	if (!newLevel){
		if (keyState[32])
			startNewLevel(currentLevel);			
		else
			return;
	}
	// Check for game over
	if (gameOver) {
		lose();
		newLevel = false;
		return;
	}
	// Get game speed
	if (document.getElementById('slow').checked)
		foeSpeed = 1;
	else if (document.getElementById('medium').checked)
		foeSpeed = 2;
	else if (document.getElementById('fast').checked)
		foeSpeed = 4;
	// Update current position of player vehicle
	myPlayer = updatePlayer(myPlayer);
	// Update enemy positions
	foes = updateEnemies(foes);
	// If all enemies are killed, go to next level
	if (foes.length==0){
		advance();
		return;
	}
	// Redraw the canvas with the new element positions
	var context = gameScreen.getContext('2d');
	context.clearRect(0,0,WIDTH,HEIGHT);
	// Output score and player health at top of screen
	context.font = 'bold 12px arial';
	context.textBaseline = 'top';
	context.fillStyle = 'black';
	context.fillText('Score: '+score+' Level: '+currentLevel,0,0);
	// If player health is low (<=50), show as red
	if (myPlayer.health<=50)
		context.fillStyle = 'red';
	context.fillText('Health: '+myPlayer.health,WIDTH-65,0);
	// Draw player vehicle and player-fired shots
	context.drawImage(myPlayer.pic,myPlayer.x,myPlayer.y);
	for (var i=0;i<myShots.length;i++)
		context.drawImage(myShots[i].pic,myShots[i].x,myShots[i].y);
	// Draw enemies and enemy-fired shots
	for (var i=0; i<foes.length; i++){
		var rowLen = foes[i].length;
		for (var j=0; j<rowLen; j++){
			context.drawImage(foes[i][j].pic,foes[i][j].x,foes[i][j].y);
			// Game over if an enemy touched the bottom area
			if ((foes[i][j].y+foes[i][j].pic.height) >= myPlayer.y)
				gameOver = true;
		}
	}
	for (var i=0;i<foeShots.length;i++){
		context.drawImage(foeShots[i].pic,foeShots[i].x,foeShots[i].y);
	}
}

/******************************************************************************
* @brief Check to see if it's time for the enemies to drop down 1 row
* @detail When enemies are killed, some rows end up being shorter than others
and so we must check to see if the row containing the furthest-left enemy has 
hit the left edge (similarly for the right side). Otherwise the rows will 
not drop at the same time, messing up the synchronization.
* @param enemies 2D array of "enemy" objects
* @return True if it's time to drop, False otherwise
******************************************************************************/
function dropCheck(enemies){
	// Get the row indices for leftmost and rightmost
	var leftMost=0, rightMost=0;
	for (var i=0; i<enemies.length; i++){
		var a = enemies[i].length-1;
		var b = enemies[rightMost].length-1;
		if (enemies[i][0].x < enemies[leftMost][0].x)
			leftMost = i;
		if (enemies[i][a].x > enemies[rightMost][b].x)
			rightMost = i;
	}
	if (enemies[leftMost][0].x < 0 || 
		enemies[rightMost][enemies[rightMost].length-1].x > (WIDTH-52))
		return true;
	return false;
}

/******************************************************************************
* @brief Check to see if an enemy was hit by player fire (compare coordinates)
* @param enemy The enemy object, of type "enemy"
* @return True if the enemy was hit, False otherwise
******************************************************************************/
function enemyHit(foe){
	// Go through each of the player shots and see if the coordinates overlap
	// with the enemy's coordinates
	for (var i=0;i<myShots.length;i++){
		if (foe.x <= myShots[i].x && (foe.x+foe.pic.width) > myShots[i].x
			&& (foe.y+foe.pic.height) >= myShots[i].y){
			myShots.splice(i,1);
			return true;
		}
	}
	return false;
}

/******************************************************************************
* @brief Check to see if the player was hit by enemy fire (compare coordinates)
* @param player The player object, of type "vehicle"
* @return True if the player was hit, False otherwise
******************************************************************************/
function playerHit(player){
	// Go through each of the enemy shots and see if the coordinates overlap
	// with the player's coordinates
	for (var i=0; i<foeShots.length; i++){
		if (player.x<=foeShots[i].x && (player.x+player.pic.width)>foeShots[i].x
			&& player.y <= foeShots[i].y+foeShots[i].pic.height){
			foeShots.splice(i,1);
			return true;
		}
	}
	return false;
}

/******************************************************************************
* @brief Update the positions of the enemies and of any shots they fired
* @param enemies A 2D array of "enemy" objects to update
* @return The enemies array, after updating each element
******************************************************************************/
function updateEnemies (enemies){
	for (var i=0; i<enemies.length; i++){	
		var rowLen = enemies[i].length;
		// If the row starts going out of the left/right bounds,
		// change direction and shift row downwards
		if (dropCheck(enemies)){
			for (var j=0; j< rowLen; j++){
				enemies[i][j].dir *= -1;
				enemies[i][j].y += enemies[i][j].pic.height;
			}
		}
		for (var j=0; j < rowLen; j++){
			// damage enemy if hit detected
			if (enemyHit(enemies[i][j]))
				enemies[i][j].health--;
			// Remove enemy from array if health=0 (dead), and increase score
			if (enemies[i][j].health<=0){
				enemies[i].splice(j,1);
				j--;
				rowLen--;
				score++;
			}
			else // shift position of each enemy by 1, 2, or 4 pixels
				enemies[i][j].x += enemies[i][j].dir*foeSpeed;
		}
		// if the row is emptied, remove it altogether to prevent errors
		if (rowLen==0){
			enemies.splice(i,1);
			i--;
		}
	}
	// Randomly choose an enemy to start firing a shot at the player.
	// Generate random indices that fit in the array. Create a shot 
	// if there are fewer than 2xMAXSHOTS enemy shots on-screen presently
	var r = Math.floor(Math.random()*100)%enemies.length;
	if (r>0 && foeShots.length < MAXSHOTS*2) {
		var c = Math.floor(Math.random()*100)%enemies[r].length;
		var newShot = new shot("enemyFire.png",WIDTH,HEIGHT);
		// Shot should come out of the enemy image's bottom centre
		newShot.x = enemies[r][c].x+
					(enemies[r][c].pic.width/2)-
					(newShot.pic.width/2);
		newShot.y = enemies[r][c].y+enemies[r][c].pic.height;
		foeShots.push(newShot);
	}
	// Update enemy-fired shots (if any)
	for (var i=0;i<foeShots.length;i++){
		// If the shot ends up hitting the bottom edge, then make it disappear
		// by deleting it from the foeShots array
		if (foeShots[i].y > HEIGHT) {
			foeShots.splice(i,1);
			i--;
		} 
		else // Otherwise move enemy shot down by 2 pixels
			foeShots[i].y += 2;
	}
	return enemies;
}

/******************************************************************************
* @brief Update the positions of the player and of any shots he/she fired
* @param player The object to update (of type "vehicle")
* @return The player object that was inputted, after updating its properties
******************************************************************************/
function updatePlayer(player) {
	// Check to see if player was hit by enemy fire
	if (playerHit(player)){
		// End the game if the last hit caused the player to die (0 health)
		player.health -= 10*currentLevel;
		if (player.health<=0){
			player.health = 0;
			gameOver = true;
			return player;
		}
	}
	// Move player 10 pixels left or right (if arrow key is pressed)
	if (keyState[37] && player.x >0)
		player.x -= 10;
	if (keyState[39] && player.x <WIDTH-player.pic.width)
		player.x += 10;
	// Keep the vehicle within the bounds of the game screen
	// If either of the above operations caused it to go out of bounds,
	// then just set it such that it touches the edge of the screen.
	if (player.x<0)
		player.x = 0;
	if (player.x > WIDTH-player.pic.width)
		player.x = WIDTH-player.pic.width;
	// Fire a shot if the space bar is pressed and the number of fired shots
	// presently on the screen is less than MAXSHOTS.
	if (keyState[32] && myShots.length < MAXSHOTS){
		// create new shot
		var newShot = new shot("missile.jpg",WIDTH,HEIGHT);
		// Shot should come out of the player image's top centre
		newShot.x = player.x+(player.pic.width/2)-(newShot.pic.width/2);
		newShot.y = player.y-newShot.pic.height;
		myShots.push(newShot);
		// set back to false in case the keyup motion didn't register
		// prevents space bar from firing multiple shots in 1 stroke
		keyState[32] = false;
	}
	// Update current positions of player-fired shots (if any)
	for (var i=0;i<myShots.length;i++){
		// If the shot ends up hitting the top edge, then make it disappear
		// by removing it from the myShots array
		if (myShots[i].y < 0) {
			myShots.splice(i,1);
			i--;
		} 
		else // If not, move it up 5 pixels
			myShots[i].y -= 5;
	}
	return player;
}

/******************************************************************************
* @brief Start a new game (or a new level if a new game is already started)
* @param level What level to start from (1 for new game)
* @pre Argument "level" must be >= 1 and <= MAXSHOTS
* @return Nothing
******************************************************************************/
function startNewLevel(level){
	newLevel = true;
	/*PROBLEM: The spacebar keydown event "sticks" before the game can refresh
	 This would cause the player to prematurely fire a shot at the
	 start of a new game, which we want to prevent. 
	SOLUTION: Set keyState[32] to false as a workaround.*/
	if (keyState[32])
		keyState[32] = false;
	// If this is a new game, set score to 0
	if (level==1)
		score = 0;
	// The game's only just started so the game isn't over yet!
	gameOver = false;
	// Reset score to 0 if it's really a new game
	// Initialize player object with 100 health, at bottom centre of screen
	myPlayer = new vehicle("tank.jpg",WIDTH/2,HEIGHT,100);
	// The image needs to load at least once before we can get its dimensions
	// and actually put it in the proper place. Use onload as a workaround.
	myPlayer.pic.onload = function(){
		myPlayer.x -= (myPlayer.pic.width/2);
		myPlayer.y -= myPlayer.pic.height;
	}
	// Initialize enemy objects as a MAXROWS x MAXCOLS grid
	// Leave 20 pixels at the top of the screen to display health and score
	// Position everything around the centre at the start
	for (var i=0; i<MAXROWS; i++){
		foes[i] = [];
		// Use "level" for the enemy health, so on Level 1 the enemies 
		// have 1 health, on level 2 they have 2 health, and so on
		for (var j=0; j<MAXCOLS; j++)
			foes[i].push(new enemy("alien.jpg",180+j*55,20+i*44,level,1));
	}
	
	// Wipe the canvas clean, then draw the player and enemies
	context.clearRect(0,0,WIDTH,HEIGHT);
	context.drawImage(myPlayer.pic,myPlayer.x,myPlayer.y);
	for (var i=0; i<MAXROWS; i++){
		for (var j=0; j<MAXCOLS; j++)
			context.drawImage(foes[i][j].pic,foes[i][j].x,foes[i][j].y);
	}
}

/******************************************************************************
* @brief Display a message notifying the player that he/she has lost.
* @return Nothing
******************************************************************************/
function lose(){
	// Wipe the canvas clean, then display the losing message.
	context.clearRect(0,0,WIDTH,HEIGHT);
	context.font = 'bold 16px arial';
	context.textBaseline = 'bottom';
	context.fillStyle = 'black';
	context.fillText('Sorry, you lost. Your score: '+score,210,200);
	context.fillText('Press the Space Bar to try again.',200,220);
}

/******************************************************************************
* @brief Display a message notifying the player that he/she has beat a level.
* @details If the player has beat the last level, it shows a "You're Winner" 
picture in the centre of the canvas, an Easter egg reference to the game 
"Big Rigs Over the Road Racing". 
* @return Nothing
******************************************************************************/
function advance(){
	// Wipe the canvas clean
	context.clearRect(0,0,WIDTH,HEIGHT);
	context.font = 'bold 16px arial';
	context.textBaseline = 'bottom';
	context.fillStyle = 'black';
	// if the player won, draw the easter egg!
	if (currentLevel==MAXLEVELS){
		var winner = new Image();
		winner.src = "winner.png";
		// The image needs to load at least once before its dimensions can be 
		// acquired for proper placement. Use onload as workaround.
		winner.onload = function (){
			var x = (WIDTH-winner.width)/2, y = (HEIGHT-winner.height)/2;
			context.drawImage(winner,x,y);
		}
		// Display prompt to let user play a new game
		context.fillStyle = 'black';
		context.fillText('Your score: '+score,270,380);
		context.fillText('Press the Space Bar to play again.',200,400);
		// Reset to Level 1
		currentLevel = 1;
	}
	else { // otherwise prompt for new level, not new game
		context.fillText('Level '+currentLevel+' complete',225,200);
		context.fillText(MAXLEVELS-currentLevel+' levels remaining',225,220);
		context.fillText('Press the Space Bar to proceed.',200,240);
		// Increment current Level
		currentLevel++;
	}
	newLevel = false;
}
