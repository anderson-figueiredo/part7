

var gameChar_x;
var gameChar_y;
var floorPos_y;
var scrollPos;
var gameChar_world_x;

var isLeft;
var isRight;
var isFalling;
var isPlummeting;

var clouds;
var mountains;
var trees_x;
var canyons;
var collectables;

var game_score;
var flagpole;
var lives;
var enemies;

var platforms;

var jumpSound;
var appleCrunch;
var ghostSound;
var levelCompleted;
var fallingSound;
var gameOver;
var gameSong;

function preload()
{
    soundFormats('mp3','wav');
    
    //load your sounds here
    jumpSound = loadSound('assets/187024__lloydevans09__jump2.wav');
    jumpSound.setVolume(0.2);
    
    appleCrunch = loadSound('assets/20269__koops__apple-crunch-06.wav');
    appleCrunch.setVolume(0.5);
    
    ghostSound = loadSound('assets/490515__staudio__ghostguardian-attack-01.wav');
    ghostSound.setVolume(0.5);
    
    levelCompleted = loadSound('assets/397355__plasterbrain__tada-fanfare-a.mp3');
    levelCompleted.setVolume(0.1)
    
    fallingSound = loadSound('assets/113366__silversatyr__fall2.mp3');
    fallingSound.setVolume(0.1)
    
    gameOver = loadSound('assets/439890__simonbay__lushlife-gameover.wav');
    gameOver.setVolume(0.05)
    
    gameSong = loadSound('assets/223898__theblockofsound235__the-entertainer-digital-ii-chime-song-6.wav');
    gameSong.setVolume(0.02)  ;
}


function setup()
{
	createCanvas(1024, 576);
	floorPos_y = height * 3/4;
    
    // Initialise lives.
    lives = 3;    
    startGame();
    
}


function draw()
{

    background(100, 155, 255); // fill the sky blue

	noStroke();
	fill(0,155,0);
	rect(0, floorPos_y, width, height/4); // draw some green ground

    push();
    translate(scrollPos, 0);
    
	// Draw clouds.
    drawClouds();
    
	// Draw mountains.
    drawMountains();
	
    // Draw trees.
    drawTrees();

	// Draw canyons.
    for(var i = 0; i < canyons.length; i++)
        {
            drawCanyon(canyons[i]);
            checkCanyon(canyons[i]);
        }
	
    // Draw collectable items.
    for(var i = 0; i < collectables.length; i++)
        {
            if(collectables[i].isFound == false)
            {
                drawCollectable(collectables[i]);
                checkCollectable(collectables[i]);
            }
        }
    
    // Draw Platfomrs
    for(var i = 0; i < platforms.length; i++)
    {
        platforms[i].draw();
    }
    
    // Draw enemies
    for(var i = 0; i < enemies.length; i++)
    {
        enemies[i].draw();
        
        var isContact = enemies[i].checkContact(gameChar_world_x, gameChar_y);
        if(isContact)
        {
            if(lives > 0)
            {
                lives -= 1;
                ghostSound.play();
                /*Adicionei a música no contato com o fantasma para tocar quando zerar a vida*/
                if(!lives) {
                    ghostSound.stop;
                    gameSong.stop()
                    gameOver.isPlaying() || gameOver.play()
               }
                startGame();
                break;
            }
        }
    }
    
    renderFlagpole();
    pop();
    
    // Check if player went down the cliff.
    checkPlayerDie();
    
    // Lives score.
    if(lives > 0)
    {
        for(var i = 0; i < lives; i++)
        {
/*       // this is the hearts: 
            x = 40 + (i * 25)
             y = 42
             size = 18
            
            strokeWeight(1.2)
            stroke(145, 29, 29);
            fill(255, 0, 0);
        
            beginShape();
            vertex(x, y);
            bezierVertex(x - size / 2, y - size / 2, x - size,  y + size / 3, x, y + size);
            bezierVertex(x + size, y + size / 3, x + size / 2,  y - size / 2, x, y);  
            endShape(CLOSE);
*/
        //hat?
            fill(0);
            rect(28 + ([i] * 28), 42, 18, 15);
            rect(24 + ([i] * 28), 57, 26, 2.3, 30);
        }
    }

    // Game score.
    textSize(16);
    textAlign(LEFT);
    fill(255);
    noStroke();
    text("Score: " + game_score, 35, 30);
    
    // Game over message.
    if(lives < 1)
    {
        textSize(24);
        textAlign(CENTER, CENTER);
        text("Game over. Press space to continue.", width/2, height/2);
    }
     
    // Level complete message.
    if(flagpole.isReached)
    {
        textSize(24);
        textAlign(CENTER, CENTER);
        text("Level complete. Press space to continue.", width/2, height/2);

    }
    
    if(! flagpole.isReached)
    {
        checkFlagpole();
    }
    
    
	// Draw game character.
	drawGameChar();
    
    
	// Logic to make the game character move or the background scroll.
	if(isLeft)
	{
		if(gameChar_x > width * 0.2)
		{
			gameChar_x -= 5;
		}
		else
		{
			scrollPos += 5;
		}
	}

	if(isRight)
	{
		if(gameChar_x < width * 0.8)
		{
			gameChar_x += 5;
		}
		else
		{
			scrollPos -= 5; // negative for moving against the background
		}
	}

	// Logic to make the game character rise and fall.
    if (gameChar_y < floorPos_y)
    {
        isContact = false;
        
        for(var i = 0; i < platforms.length; i++)
        {            
            if(platforms[i].checkContact(gameChar_world_x, gameChar_y))
            {
                isContact = true;
                isFalling = false;
                break;
            }
        }
              
        if(! isContact)
        {
            gameChar_y += 2;
            isFalling = true;
        }
    }
    else
    {
           isFalling = false;
    }
    
	// Update real position of gameChar for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;
}


// ---------------------
// Key control functions
// ---------------------

function keyPressed()
{
    if(key == 'a' || key == 'A' || keyCode == 37)
    {
        isLeft = true;
    }
    
    if(key == 'd' || key == 'D' ||  keyCode == 39)
    {
        isRight = true;
    }
    
    /*mudei o código do w*/ 
    if(key == 'w' || key == 'W' || keyCode === 87)
    {  
        if(!isFalling && !isPlummeting && lives > 0)
        {
            gameChar_y -= 100;
            jumpSound.play();
        }
    }
	
    /*adicionei o código do espaço com validação das vidas restantes*/ 
    if(key == ' ' || keyCode == 32) {
        if(!lives) {
            setup();
        }
    }
}

function keyReleased()
{
    if(key == 'a' || key == 'A' || keyCode == 37)
    {
        isLeft = false;
    }
    else if(key == 'd' || key == 'D' || keyCode == 39)
    {
        isRight = false;
    }
}


// ------------------------------
// Game character render function
// ------------------------------

// Function to draw the game character.

function drawGameChar()
{
    if(isLeft && isFalling)
    {
        //face
        fill(250, 200, 213);
        ellipse(gameChar_x, gameChar_y - 55, 20, 20);

        //hat
        fill(0);
        rect(gameChar_x - 9, gameChar_y - 75, 18, 15);
        rect(gameChar_x - 12, gameChar_y - 62, 24, 2.3, 30);

        //eyes
        strokeWeight(1)
        stroke(255);
        fill(53, 115, 136);
        ellipse(gameChar_x - 5, gameChar_y - 56, 3, 3);
        noStroke();

        //body
        fill(0);
        rect(gameChar_x - 10, gameChar_y - 43, 20, 32, 5);

        //hands
        fill(250, 200, 213);
        rect(gameChar_x - 17.5, gameChar_y - 60, 6, 5, 2.2); 

        //arms
        fill(0);
        rect(gameChar_x - 18, gameChar_y - 55, 7, 18, 2);

        //legs
        fill(0);
        rect(gameChar_x - 8, gameChar_y - 17, 7, 10, 2);
        rect(gameChar_x + 1, gameChar_y - 13, 7, 10, 2);    

	}
	else if(isRight && isFalling)
	{
        //face
        fill(250, 200, 213);
        ellipse(gameChar_x, gameChar_y - 55, 20, 20);
        fill(0);  
        ellipse(gameChar_x +5, gameChar_y - 56, 2, 2);

        //hat
        fill(0);
        rect(gameChar_x - 9, gameChar_y - 75, 18, 15);
        rect(gameChar_x - 12, gameChar_y - 62, 24, 2.3, 30);
        
        //eyes
        strokeWeight(1)
        stroke(255);
        fill(53, 115, 136);
        ellipse(gameChar_x + 5, gameChar_y - 56, 3, 3);
        noStroke();

         //body
        fill(0);
        rect(gameChar_x - 10, gameChar_y - 43, 20, 32, 5);

        //hands
        fill(250, 200, 213);
        rect(gameChar_x + 11.5, gameChar_y - 60, 6, 5, 2.2); 

        //arms
        fill(0);
        rect(gameChar_x + 11, gameChar_y - 55, 7, 18, 2);

        //legs
        fill(0);
        rect(gameChar_x - 8, gameChar_y - 13, 7, 10, 2);
        rect(gameChar_x + 1, gameChar_y - 17, 7, 10, 2); 

	}
	else if(isLeft)
	{
        //face
        fill(250, 200, 213);
        ellipse(gameChar_x, gameChar_y - 55, 20, 20);
        fill(0);
        ellipse(gameChar_x -5, gameChar_y - 56, 2, 2);

        //hat
        fill(0);
        rect(gameChar_x - 9, gameChar_y - 75, 18, 15);
        rect(gameChar_x - 12, gameChar_y - 62, 24, 2.3, 30);
        
        //eyes
        strokeWeight(1)
        stroke(255);
        fill(53, 115, 136);
        ellipse(gameChar_x - 5, gameChar_y - 56, 3, 3);
        noStroke();

        //body
        fill(0);
        rect(gameChar_x - 10, gameChar_y - 43, 20, 32, 5);

        //arms
        fill(0);
        stroke(255);
        strokeWeight(0.5)
        rect(gameChar_x - 5, gameChar_y - 40, 7, 18, 2);
        noStroke();

        //hands
        fill(250, 200, 213);
        rect(gameChar_x - 5, gameChar_y - 22, 6, 5, 2.2); 

        //leg vertex;
        fill(0);
        rect(gameChar_x - 8, gameChar_y - 12, 7, 15, 2);
        beginShape();
        vertex(gameChar_x + 2, gameChar_y - 12);
        vertex(gameChar_x + 8, gameChar_y - 13);
        vertex(gameChar_x + 16, gameChar_y + 1);
        vertex(gameChar_x + 10, gameChar_y + 3);
        endShape(); 
        
	}
	else if(isRight)
	{
        //face
        fill(250, 200, 213);
        ellipse(gameChar_x, gameChar_y - 55, 20, 20);
        fill(0);
        ellipse(gameChar_x +5, gameChar_y - 56, 2, 2);

        //hat
        fill(0);
        rect(gameChar_x - 9, gameChar_y - 75, 18, 15);
        rect(gameChar_x - 12, gameChar_y - 62, 24, 2.3, 30);
        
        //eyes
        strokeWeight(1)
        stroke(255);
        fill(53, 115, 136);
        ellipse(gameChar_x + 5, gameChar_y - 56, 3, 3);
        noStroke();

        //body
        fill(0);
        rect(gameChar_x - 10, gameChar_y - 43, 20, 32, 5);


        //arms
        fill(0);
        stroke(255);
        strokeWeight(0.5)
        rect(gameChar_x - 2, gameChar_y - 40, 7, 18, 2);
        noStroke();

        //hands
        fill(250, 200, 213);
        rect(gameChar_x - 1.5, gameChar_y - 22, 6, 5, 2.2); 

        //leg vertex;
        fill(0);
        rect(gameChar_x + 1, gameChar_y - 12, 7, 15, 2);
        beginShape();
        vertex(gameChar_x - 1, gameChar_y - 13);
        vertex(gameChar_x - 8, gameChar_y - 13);
        vertex(gameChar_x - 16, gameChar_y);
        vertex(gameChar_x - 10, gameChar_y + 2);
        endShape(); 

	}
	else if(isFalling || isPlummeting)
	{
        //face
        fill(250, 200, 213);
        ellipse(gameChar_x, gameChar_y - 55, 20, 20);
        fill(0);
        ellipse(gameChar_x -5, gameChar_y - 56, 2, 2);
        ellipse(gameChar_x +5, gameChar_y - 56, 2, 2);

        //hat
        fill(0);
        rect(gameChar_x - 9, gameChar_y - 75, 18, 15);
        rect(gameChar_x - 12, gameChar_y - 62, 24, 2.3, 30);
        
        //eyes
        strokeWeight(1)
        stroke(255);
        fill(53, 115, 136);
        ellipse(gameChar_x - 5, gameChar_y - 56, 3, 3);
        ellipse(gameChar_x + 5, gameChar_y - 56, 3, 3);
        noStroke();

        //smile
        fill(255);
        arc(gameChar_x, gameChar_y - 52, 8, 8, 0, radians(180), PIE);

        //body
        fill(0);
        rect(gameChar_x - 13, gameChar_y - 43, 26, 32, 5);
        fill(255);
        ellipse(gameChar_x, gameChar_y - 35, 1.5, 1.5);
        ellipse(gameChar_x, gameChar_y - 30, 1.5, 1.5);
        ellipse(gameChar_x, gameChar_y - 25, 1.5, 1.5);

        //hands
        fill(250, 200, 213);
        rect(gameChar_x + 14.5, gameChar_y - 64, 6, 5, 2.2);
        rect(gameChar_x - 20.5, gameChar_y - 64, 6, 5, 2.2); 

        //arms
        fill(0);
        rect(gameChar_x - 21, gameChar_y - 60, 7, 18, 2);
        rect(gameChar_x + 14, gameChar_y - 60, 7, 18, 2);

        //legs
        fill(0);
        rect(gameChar_x + 1, gameChar_y - 17, 7, 15, 2);
        rect(gameChar_x - 8, gameChar_y - 17, 7, 15, 2);


	}
	else
	{  
        //face
        fill(250, 200, 213);
        ellipse(gameChar_x, gameChar_y - 55, 20, 20);

        //hat
        fill(0);
        rect(gameChar_x - 9, gameChar_y - 75, 18, 15);
        rect(gameChar_x - 12, gameChar_y - 62, 24, 2.3, 30);

        //eyes
        strokeWeight(1)
        stroke(255);
        fill(53, 115, 136);
        ellipse(gameChar_x - 5, gameChar_y - 56, 3, 3);
        ellipse(gameChar_x + 5, gameChar_y - 56, 3, 3);
        noStroke();

        //smile
        fill(255);
        arc(gameChar_x, gameChar_y - 52, 8, 8, 0, radians(180), PIE);

        //body
        fill(0);
        rect(gameChar_x - 13, gameChar_y - 43, 26, 32, 5);
        fill(255);
        ellipse(gameChar_x, gameChar_y - 35, 1.5, 1.5);
        ellipse(gameChar_x, gameChar_y - 30, 1.5, 1.5);
        ellipse(gameChar_x, gameChar_y - 25, 1.5, 1.5);

        //hands
        fill(250, 200, 213);
        rect(gameChar_x + 14.5, gameChar_y - 23, 6, 5, 2.2);
        rect(gameChar_x - 20.5, gameChar_y - 23, 6, 5, 2.2); 

        //arms
        fill(0);
        rect(gameChar_x - 21, gameChar_y - 40, 7, 18, 2);
        rect(gameChar_x + 14, gameChar_y - 40, 7, 18, 2);

        //legs
        rect(gameChar_x + 1, gameChar_y - 12, 7, 15, 2);
        rect(gameChar_x - 8, gameChar_y - 12, 7, 15, 2);
	}
}

// ---------------------------
// Background render functions
// ---------------------------

// Function to draw cloud objects.
function drawClouds()
{
    for(var i = 0; i < clouds.length; i++)
    {
        fill(255,255,255);
        
        ellipse(clouds[i].x_pos + 65 * clouds[i].size, 
                clouds[i].y_pos * clouds[i].size,
                clouds[i].size * 50, 
                clouds[i].size * 50);
        
        ellipse(clouds[i].x_pos + 100 * clouds[i].size, 
                clouds[i].y_pos * clouds[i].size,
                clouds[i].size * 70, 
                clouds[i].size * 70);
        
        ellipse(clouds[i].x_pos + 135 * clouds[i].size, 
                clouds[i].y_pos * clouds[i].size, 
                clouds[i].size * 50, 
                clouds[i].size * 50);
    }
}

// Function to draw mountains objects.
function drawMountains()
{
    for(var i = 0; i < mountains.length; i++)
    {
        //front mountains
        fill(120,120,120);
        triangle(mountains[i].x_pos + 160, 
                 floorPos_y, 
                 mountains[i].x_pos + 450, 
                 floorPos_y, 
                 mountains[i].x_pos + 320, 
                 mountains[i].y_pos + 50);
        
        triangle(mountains[i].x_pos + 60,
                 floorPos_y , 
                 mountains[i].x_pos + 380, 
                 floorPos_y, mountains[i].x_pos  + 235, 
                 mountains[i].y_pos);
        
        //back mountain
        fill(100,100,100);
        triangle(mountains[i].x_pos + 310, 
                 floorPos_y, 
                 mountains[i].x_pos + 380,
                 floorPos_y, 
                 mountains[i].x_pos  + 235,
                 mountains[i].y_pos);
     } 
}

// Function to draw trees objects.
function drawTrees()
{
    for(var i = 0; i < trees_x.length; i++)
    {
        //trunk
        fill(139,69,19);
        rect(trees_x[i], floorPos_y - 60, 30, 60);

        //branches
        fill(0, 120, 0);
        triangle(trees_x[i] - 40, 
                 floorPos_y - 55, 
                 trees_x[i] + 15, 
                 floorPos_y - 120, 
                 trees_x[i] + 70, 
                 floorPos_y - 55);
        
        triangle(trees_x[i] - 30, 
                 floorPos_y - 85, 
                 trees_x[i] + 15, 
                 floorPos_y - 140, 
                 trees_x[i] + 60, 
                 floorPos_y - 85);
        
        triangle(trees_x[i] - 15, 
                 floorPos_y - 115,
                 trees_x[i] + 15,
                 floorPos_y - 150,
                 trees_x[i] + 45,
                 floorPos_y - 115);
    }
}

// ---------------------------------
// Canyon render and check functions
// ---------------------------------

// Function to draw canyon objects.

function drawCanyon(t_canyon)
{
    for(var i = 0; i < canyons.length; i++)
    {
        fill(175, 59, 8);
        rect(t_canyon.x_pos, floorPos_y, t_canyon.width, floorPos_y);
        stroke(226, 128, 65);
        strokeWeight(2);
        
        triangle(t_canyon.x_pos + t_canyon.width, 
                 floorPos_y + 10, 
                 t_canyon.x_pos + t_canyon.width - 30 , 
                 height, 
                 t_canyon.x_pos + t_canyon.width, 
                 height);
        
        triangle(t_canyon.x_pos, 
                 floorPos_y + 10, 
                 t_canyon.x_pos + 30 , 
                 height, 
                 t_canyon.x_pos,
                 height);
        
        noStroke();
    }
}

// Function to check if character is over a canyon.

function checkCanyon(t_canyon)
{
    if((gameChar_world_x > t_canyon.x_pos) && (gameChar_world_x < t_canyon.x_pos+t_canyon.width) && (gameChar_y >= floorPos_y))
    {  
        isPlummeting = true;  
        gameChar_y += 2;
        fallingSound.isPlaying() || fallingSound.play();
    }
    
    if (isPlummeting || flagpole.isReached || !lives)
    {
        isLeft = false;
        isRight = false;
    }
    
}

// ----------------------------------
// Collectable items render and check functions
// ----------------------------------

// Function to draw collectable objects.

function drawCollectable(t_collectable)
{
    for(var i = 0; i < collectables.length; i++)
    {  
        //apple
        noStroke();
        fill(204, 55, 51);
        ellipse(t_collectable.x_pos, 
                t_collectable.y_pos - 14, 
                32, 
                30
               );

        //apple leaf
        fill(34, 177, 17);
        strokeWeight(1)
        stroke(34, 136, 17);
        beginShape();
        curveVertex(t_collectable.x_pos + 2,
                    t_collectable.y_pos - 21);
        
        curveVertex(t_collectable.x_pos + 2,
                    t_collectable.y_pos - 21);
        
        curveVertex(t_collectable.x_pos - 8.5,
                    t_collectable.y_pos - 34);
        
        curveVertex(t_collectable.x_pos - 13,
                    t_collectable.y_pos - 30);
        
        curveVertex(t_collectable.x_pos + 2,
                    t_collectable.y_pos - 21);
        
        curveVertex(t_collectable.x_pos + 2,
                    t_collectable.y_pos - 21);
        endShape();
        noStroke();
    }    
}

// Function to check character has collected an item.

function checkCollectable(t_collectable)
{
    if(abs(dist(gameChar_world_x, gameChar_y, t_collectable.x_pos, t_collectable.y_pos) < 30))   
    {
        t_collectable.isFound = true; 
        appleCrunch.play();
        game_score += 1;
    }
}


function renderFlagpole()
{
    push();
    
    strokeWeight(5);
    stroke(100);
    line(flagpole.x_pos, 
         floorPos_y, 
         flagpole.x_pos, 
         floorPos_y - 250);
    fill(255);
    noStroke();
    
    if(flagpole.isReached)
    {
        rect(flagpole.x_pos, 
             floorPos_y - 250, 
             flagpole.flagWidth, 
             flagpole.flagHeight);
    
        //straight red england bars
        fill(208, 12, 39);
        rect(flagpole.x_pos,
             (floorPos_y - 250) / 0.9, 
             flagpole.flagWidth, 
             flagpole.flagHeight * 0.16);
        
        rect(flagpole.x_pos + 37,  
             floorPos_y - 250, 
             flagpole.flagWidth * 0.1, 
             flagpole.flagHeight);
    }
    else
    {
        rect(flagpole.x_pos, 
             floorPos_y - flagpole.flagHeight, 
             flagpole.flagWidth, 
             flagpole.flagHeight);
        
        //straight red england bars
        fill(208, 12, 39);
        rect(flagpole.x_pos,  
             (floorPos_y - flagpole.flagHeight) / 0.95, 
             flagpole.flagWidth, 
             flagpole.flagHeight * 0.16);
        
        rect(flagpole.x_pos + 37,  
             floorPos_y - flagpole.flagHeight, 
             flagpole.flagWidth * 0.1, 
             flagpole.flagHeight);
    }
     
    pop();
}


function checkFlagpole()
{
    var d = abs(gameChar_world_x - flagpole.x_pos);
    
    if(d < 15)
    {
        flagpole.isReached = true;
        gameSong.stop()
        levelCompleted.play();
    }
}



function checkPlayerDie()
{
    if(gameChar_y > height )    
    {
        lives -= 1;
        
        if(lives > 0)
        {
            startGame();
            fallingSound.stop();
        }
        
        if(!lives)
        {   
            gameSong.stop()
            gameOver.isPlaying() || gameOver.play()
            
        }
    }
}


function startGame()
{
    gameChar_x = width/2;
	gameChar_y = floorPos_y;
    
    
  //  gameSong.isPlaying() || gameSong.loop();
	
    // Variable to control the background scrolling.
	scrollPos = 0;

	// Variable to store the real position of the gameChar in the game world. Needed for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;

	// Boolean variables to control the movement of the game character.
	isLeft = false;
	isRight = false;
	isFalling = false;
	isPlummeting = false;
    
    // Initialise game score.
    game_score = 0;

	// Initialise arrays of scenery objects.
    clouds = 
    [
        {x_pos: 80, y_pos: 80, size: 1.2},
        {x_pos: 350, y_pos: 200, size: 1.0},
        {x_pos: 600, y_pos: 130, size: 1.3},
        {x_pos: 900, y_pos: 80, size: 0.8},
        {x_pos: 1200, y_pos: 80, size: 1.4},
        {x_pos: 1800, y_pos: 80, size: 1.0},
        {x_pos: 2000, y_pos: 80, size: 0.5},
        {x_pos: 2300, y_pos: 80, size: 1.2},
        {x_pos: 2600, y_pos: 80, size: 1.0},
        {x_pos: 3100, y_pos: 80, size: 0.5}
    ];
    
    mountains = 
    [
        {x_pos: 100, y_pos: 200},
        {x_pos: 700, y_pos: 160},
        {x_pos: 1200, y_pos: 130},
        {x_pos: 2000, y_pos: 250}

    ];
    
    trees_x = [
        100, 
        300, 
        650, 
        1000, 
        2000,
        2500
    ];
    
    collectables = 
    [
        {x_pos: 100, y_pos: floorPos_y, isFound: false},
        {x_pos: 200, y_pos: floorPos_y - 180, isFound: false},
        {x_pos: 650, y_pos: floorPos_y - 90, isFound: false},
     //   {x_pos: 1175, y_pos: floorPos_y - 120, isFound: false},
        {x_pos: 1175, y_pos: floorPos_y, isFound: false},
        {x_pos: 1700, y_pos: floorPos_y, isFound: false},
        {x_pos: 2050, y_pos: floorPos_y - 90, isFound: false},
        {x_pos: 2500, y_pos: floorPos_y, isFound: false},
        {x_pos: 2850, y_pos: floorPos_y - 60, isFound: false}
    ];
    
    canyons = 
    [
        {x_pos: 140, width: 100},
        {x_pos: 1200, width: 150},
        {x_pos: 1800, width: 80},
        {x_pos: 2800, width: 120}
    ]; 
   
    
    // platforms
    platforms = [];
    platforms.push(createPlatforms(20, floorPos_y - 100, 100));
    platforms.push(createPlatforms(400, floorPos_y - 70, 100));
    platforms.push(createPlatforms(2100, floorPos_y - 95, 120) );
    
    
    // enemies
    enemies = [];
    enemies.push(new Enemy(600, floorPos_y - 10, 100));
    enemies.push(new Enemy(1000, floorPos_y - 10, 180));
    enemies.push(new Enemy(1400, floorPos_y - 10, 350));    
    enemies.push(new Enemy(2100, floorPos_y - 110, 100));
    enemies.push(new Enemy(600, floorPos_y - 10, 100));
    
    //Initialise flagpole.
    flagpole = {isReached : false, x_pos: 3100, flagWidth: 80, flagHeight:48}
    
}



function createPlatforms(x, y, length)
{
    var p = {
        x: x,
        y: y,
        length: length,
        draw: function(){
            
            blockSize = 30;

            strokeWeight(1);
            stroke(132, 31, 39);
            fill(204, 102, 0);
            rect(this.x, this.y, this.length / 5, 15);
            rect(this.x + (length / 5) * 1, this.y, this.length / 5, 15);
            rect(this.x + (length / 5) * 2, this.y, this.length / 5, 15);
            rect(this.x + (length / 5) * 3, this.y, this.length / 5, 15);
            rect(this.x + (length / 5) * 4, this.y, this.length / 5, 15);
            
            noStroke();
        },
        
        checkContact: function(gc_x, gc_y)
        {
            if(gc_x > this.x && gc_x < this.x + this.length)
            {
                var d = this.y - gc_y;
                if(d >= 0 && d < 5)
                {
                    return true; 
                }
            }
            
            return false;
        }
    }

    return p;
}


function Enemy(x, y, range)
{
    this.x = x;
    this.y = y;
    this.range = range;
    
    this.currentX = x;
    this.inc = 1;
    
    this.update = function()
    {
        this.currentX += this.inc;
        
        if(this.currentX >= this.x + this.range)
        {
            this.inc = -1;
        }
        else if(this.currentX < this.x)
        {
            this.inc = 1;
        }
    }
    
    this.draw = function()
    {
        this.update();
        
        //ghost body
        fill(255);
        ellipse(this.currentX + 5, this.y - 10, 30, 30);
        rect(this.currentX - 10, this.y - 10, 30, 10);
	    triangle(this.currentX - 10, this.y + 10, this.currentX - 10, this.y, this.currentX , this.y);
        triangle(this.currentX, this.y + 10, this.currentX - 10, this.y, this.currentX + 10, this.y);
        triangle(this.currentX + 10, this.y + 10, this.currentX, this.y, this.currentX + 20, this.y);
        triangle(this.currentX + 20, this.y + 10, this.currentX + 10, this.y, this.currentX + 20, this.y);

        //ghost eyes
        fill(0);
        ellipse(this.currentX + 1, this.y - 12, 8, 8);
        ellipse(this.currentX + 10, this.y - 12, 8, 8);
        
        //ghost eye colour
        fill(0, 255, 255);
        
        //move right and left
        if(gameChar_world_x < this.currentX)
        {
            ellipse(this.currentX, this.y - 12, 3, 3);
            ellipse(this.currentX + 9, this.y - 12, 3, 3); 
        }
        else
        {
            //ellipse(this.currentX + 1, this.y - 12, 3, 3);
            //ellipse(this.currentX + 10, this.y - 12, 3, 3);

            ellipse(this.currentX + 2, this.y - 12, 3, 3);
            ellipse(this.currentX + 11, this.y - 12, 3, 3); 
        }
        
       
    }
    
    this.checkContact = function(gc_x, gc_y)
    {
        var d = dist(gc_x, gc_y, this.currentX, this.y)
        if(d < 25)
        {
            return true; 
        }
        
        return false;
    }
}
