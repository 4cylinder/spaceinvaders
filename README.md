# spaceinvaders
Space Invaders game written in Javascript using HTML5 Canvas.

**Instructions**

* Launch index.html in your browser, ideally in a minimum 1024x768 window
* Choose the game speed by clicking one of the radio buttons on the left panel
* Press the Space Bar to start a new game
* Use the left and right arrow keys to move
* Use the space bar to fire
* Destroy all aliens to win the level
* Press the space bar to advance to the next level
* Win the game by beating all levels

**Datastructures**

* vehicle: Represents the player. Stores information on the position, health level, and the picture being used. Position is represented by the (x,y) coordinates on a HTML5 canvas. Health level is 1-100 if the player is alive and 0 if the player is dead.
* enemy: Represents an alien. Stores information on the position, health level, direction of movement, and the picture being used. Position is represented by the (x,y) coordinates on a HTML5 canvas. Health level is 1 to the max number of game levels (defined in a global var). On Level 1 an enemy has 1 health, on level 2 an enemy has 2 health, etc. Health is 0 if the enemy is dead. Direction is -1 if the enemy is moving leftward and +1 if the rightward.
* shot: Represents a projectile fired by either the player or an alien. Stores information on the position and the picture being used

**Main user-defined objects**

* myPlayer: "vehicle" object controlled by the user.
* foes: A 2-dimensional array of "enemy" objects
* myShots: Array of player-fired shots, max length defined by global var.Each element in this array is a "shot" object
* foeShots: Array of enemy-fired shots, max length = 2x that of myShots Each element in this array is a "shot" object

**How it works**

* Global variables store the game's state, e.g. the current level, the number of enemies still alive, the resolution of the canvas, etc
* Event listener for keyup and keydown events tracks keypresses. An array with each index equal to an ASCII code stores keydowns as true values and keyups as false values. E.g. pressing the spacebar (ASCII code 32) means the array will be equal to true at index 32. Letting the spacebar back up will set that value to false. 
* The function updateGameState() is called at 25-millisecond intervals
* updateGameState() calls helper functions to update positions of the player, the enemies, and any shots fired by the player and/or the enemies. After the positions are recalculated, the canvas is wiped and those objects are redrawn in their new positions.
* Enemies start off by moving rightward. When the rightmost enemy touches the right edge, the enemies descend by 1 row and start moving leftward. When the leftmost enemy touches the left edge, the enemies descend by 1 row and move rightward. The pattern repeats itself until the enemies touch the bottom or the player destroys all of them.
* Player defines the speed at which the enemies move left/right using a radio button selector on the left panel of the webpage.
* The player can fire shots indefinitely, but up to MAXSHOTS (default 3) can be rendered on-screen at the same time. If MAXSHOTS shots are already  present, the player must wait for at least one shot to hit an enemy or hit the top edge of the screen, before firing a new shot
* Shots do 1 damage to enemies (decrementing health by 1).
* Enemies can fire up to 2xMAXSHOTS at the same time towards the player. 
* Enemy shots do 10 damage to the player on Level 1, 20 on 2, 30 on 3, etc
* When an enemy is killed, it is deleted from the array
* When a shot hits an enemy or the player, or hits the top or bottom edge, it is deleted from the array it belongs to.

**Acknowledgements**
* Uses jQuery (included in this submission as `jquery.js`)
* Images obtained from Google Image searches
* CSS layout inspired by previous CSC309 midterm
