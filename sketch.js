var gameChar_x;
var gameChar_y;
var floorPos_y;
var scrollPos;
var gameChar_world_x;
var mode;

var isLeft;
var isRight;
var isFalling;
var isPlummeting;
var isGameOver;

var clouds;
var mountains;
var trees_x;
var canyons;
var collectables;
var platforms;
var enemies;
var flowers;

var game_score;
var flagpole;
var lives;

var jumpSound;
var appleCrunch;
var ghostSound;
var levelCompleted;
var fallingSound;
var gameOver;
var gameSong;

var gameFont;

function preload()
{
    soundFormats('mp3','wav');
    
    jumpSound = loadSound('assets/187024__lloydevans09__jump2.wav');
    jumpSound.setVolume(0.1);
    
    appleCrunch = loadSound('assets/20269__koops__apple-crunch-06.wav');
    appleCrunch.setVolume(0.3);
    
    ghostSound = loadSound('assets/490515__staudio__ghostguardian-attack-01.wav');
    ghostSound.setVolume(0.1);
    
    levelCompleted = loadSound('assets/397355__plasterbrain__tada-fanfare-a.mp3');
    levelCompleted.setVolume(0.1)
    
    fallingSound = loadSound('assets/113366__silversatyr__fall2.mp3');
    fallingSound.setVolume(0.1)
    
    gameOver = loadSound('assets/439890__simonbay__lushlife-gameover.wav');
    gameOver.setVolume(0.05)
    
    gameSong = loadSound('assets/223898__theblockofsound235__the-entertainer-digital-ii-chime-song-6.wav');
    gameSong.setVolume(0.01);
    
    gameFont = loadFont('assets/DotGothic16/DotGothic16-Regular.ttf');
}

function setup()
{
    //begin game mode
     mode = 0;
    
    //Check if gameOver song was played
    playGameOverSong = true;
    
    //Canvas size && floor position height
	createCanvas(1024, 576);
	floorPos_y = height * 3/4;

    // Background music
    gameSong.loop();
    
    // Initialise lives.
    lives = 3;    
    startGame();
    
}

function draw()
{

    if(mode == 0)
    {        
        //Background scenery while game hasn't started 
        scenery();

        //Game Start message
        textFont(gameFont);
        fill(255);
        stroke(0);
        strokeWeight(2);
        rect(width/4, height/3, width/2, height/4);
        noStroke();

        textSize(24);
        textAlign(CENTER, CENTER);
        fill(0);
        textSize(32);
        text("Press space to begin...", width/2, height/2 - 30); 

    }// end of mode 0

    if(mode == 1)
    {
        
        //Background scenery
        scenery();

        // Lives score.
        if(lives > 0)
        {
            for(var i = 0; i < lives; i++)
            {
                //hats left
                fill(0);
                rect(50 + ([i] * 30), 50, 18, 15);
                rect(46 + ([i] * 30), 65, 26, 2.3, 30);
            }
        }

        // Game score.
        textFont(gameFont);
        textSize(20);
        fill(0);
        textAlign(LEFT);
        text("Score: " + game_score + "/15", 35, 30);
        noStroke();

        //check if player went down a cliff -- dead
        checkPlayerDie();

        // Check if our character hasn't reached the flagpole yet.
        if(!flagpole.isReached)
        {
            checkFlagpole();
        }

        // Level complete message.
        if(flagpole.isReached)
        {
            stroke(0);
            strokeWeight(2);
            fill(255);
            rect(width/4, height/3, width/2, height/4);
            noStroke();

            textSize(24);
            textAlign(CENTER, CENTER);
            fill(0);
            textSize(32);
            text("Level complete", width/2, height/2 - 50);
            textSize(24);
            text("Press enter to restart.", width/2, height/2 - 10);

        }

        // Game character movement and the background scroll. 
        charMovement();

        // Draw game character.
        drawGameChar();
    
    } // end of mode 1 
}


function scenery()
{

    background(100, 155, 255); // fill the sky blue    
   	
    fill(225, 169, 95); // draw some earth ground
    rect(0, floorPos_y, width, height/4); 
    fill(255, 155, 0); // draw some yellow ish ground
    rect(0, floorPos_y, width, height/20);
    fill(0, 155, 0);  // draw some green ground
    rect(0, floorPos_y, width, height/30); 

    push();
    translate(scrollPos, 0);
       
    // Draw clouds
    clouds.drawAndUpdateClouds();
    
    
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
	
    
    // Draw flowers
    for(var i = 0; i < flowers.length; i++)
    {
        flowers[i].draw();
    }
    
    
    // Draw collectables.
    for(var i = 0; i < collectables.length; i++)
        {
            if(collectables[i].isFound == false)
            {
                drawCollectable(collectables[i]);
                checkCollectable(collectables[i]);
            }
        }
    
    
    // Draw platfomrs
    for(var i = 0; i < platforms.length; i++)
    {
        platforms[i].draw();
    }
    
    
    // Draw enemies & do checks to see if entered in contact with character/died.
    for(var i = 0; i < enemies.length; i++)
    {
        enemies[i].draw();
        
        var enemyContact = enemies[i].checkContact(gameChar_world_x, gameChar_y);
        if(enemyContact || gameChar_world_x < -450)
        {
            if(lives > 0)
            {
                ghostSound.play();
                checkPlayerDie(enemyContact);
                break;
            }
        }
    }

    
    // Draw flagpole
    drawFlagpole();

    
    // Draw death angel
    drawDeathAngel();
    
    pop();

}

function charMovement()
{
// Logic to make the game character move and the background scroll.
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
            scrollPos -= 5;
        }
    }

    // Logic to make the game character rise and fall.
    if (gameChar_y < floorPos_y && !isGameOver)
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

        if(!isContact)
        {
            gameChar_y += 2;
            isFalling = true;
        }
    }
    else
    {
           isFalling = false;
    }
    
    
    if(isGameOver)
    {
        gameChar_y -= 0.8;
    }
    

    // Update real position of gameChar for collision detection.
    gameChar_world_x = gameChar_x - scrollPos;

}


// ---------------------
// Key control functions
// ---------------------

function keyPressed()
{
    //Check if the user is pressing the Key A or ArrowLeft
    if(keyCode == 65 || keyCode == 37)
    {
        isLeft = true;
    }
    
    //Check if the user is pressing the Key D or ArrowRight
    if(keyCode == 68 ||  keyCode == 39)
    {
        isRight = true;
    }
    
    //Check if the user is pressing the Key W or Space
    if(keyCode == 87 || keyCode == 32)
    {  
        if(!isFalling && !isPlummeting && lives > 0 && !flagpole.isReached)
        {
            gameChar_y -= 100;
            jumpSound.play();
        }
    }
    
    //Check if the user is pressing Space -- iniitialise the game
    if(keyCode == 32) 
    {
        mode = 1;
    }
    
    //Check if the user is pressing enter -- restart the game
    if(!lives || flagpole.isReached)
    {
        if(keyCode == 13) 
        {
            setup();
        }
    }
}

function keyReleased()
{
    if(keyCode == 65 || keyCode == 37)
    {
        isLeft = false;
    }
    else if(keyCode == 68 ||  keyCode == 39)
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
        endShape(CLOSE); 
        
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
        endShape(CLOSE); 

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
	else if (isGameOver)
	{  
        //face
        fill(250, 200, 213, 220);
        ellipse(gameChar_x, gameChar_y - 55, 20, 20);
        
        //hat
        stroke(150);
        strokeWeight(0.5);
        fill(255, 255, 255, 220);
        rect(gameChar_x - 9, gameChar_y - 75, 18, 15);
        rect(gameChar_x - 12, gameChar_y - 62, 24, 2.3, 30);

        //eyes
        strokeWeight(1)
        stroke(255);
        fill(53, 115, 136, 200);
        ellipse(gameChar_x - 5, gameChar_y - 56, 3, 3);
        ellipse(gameChar_x + 5, gameChar_y - 56, 3, 3);
        noStroke();

        //smile
        fill(255, 255,255, 200);
        arc(gameChar_x, gameChar_y - 52, 8, 8, 0, radians(180), PIE);
        
        //left wing
        fill(255, 255, 255, 200);
        stroke(150);
        strokeWeight(0.5);

        beginShape();
        vertex(gameChar_x + 12, gameChar_y - 37);
        bezierVertex(gameChar_x + 12, gameChar_y - 37, gameChar_x + 10, gameChar_y - 50, gameChar_x + 31, gameChar_y - 52);
        bezierVertex(gameChar_x + 31, gameChar_y - 52, gameChar_x + 42, gameChar_y - 52, gameChar_x + 51, gameChar_y - 62);
        bezierVertex(gameChar_x + 51, gameChar_y - 62, gameChar_x + 58, gameChar_y - 62, gameChar_x + 46, gameChar_y - 50);
        bezierVertex(gameChar_x + 46, gameChar_y - 50, gameChar_x + 64, gameChar_y - 60, gameChar_x + 44, gameChar_y - 44);
        bezierVertex(gameChar_x + 44, gameChar_y - 44, gameChar_x + 58, gameChar_y - 50, gameChar_x + 42, gameChar_y - 40);
        bezierVertex(gameChar_x + 42, gameChar_y - 40, gameChar_x + 56, gameChar_y - 43, gameChar_x + 37, gameChar_y - 35);
        bezierVertex(gameChar_x + 37, gameChar_y - 35, gameChar_x + 53, gameChar_y - 38, gameChar_x + 33, gameChar_y - 32);
        bezierVertex(gameChar_x + 33, gameChar_y - 32, gameChar_x + 50, gameChar_y - 34, gameChar_x + 29, gameChar_y - 28);
        bezierVertex(gameChar_x + 29, gameChar_y - 28, gameChar_x + 48, gameChar_y - 30, gameChar_x + 25, gameChar_y - 25);
        bezierVertex(gameChar_x + 25, gameChar_y - 25, gameChar_x + 14, gameChar_y - 24, gameChar_x + 12, gameChar_y - 37);
        endShape(CLOSE);
        
        //internal bit of the left wing
        beginShape();
        vertex(gameChar_x + 16, gameChar_y - 34);
        bezierVertex(gameChar_x + 16, gameChar_y - 34, gameChar_x + 6, gameChar_y - 42, gameChar_x + 39, gameChar_y - 49);
        bezierVertex(gameChar_x + 39, gameChar_y - 49, gameChar_x + 8, gameChar_y - 32, gameChar_x + 33, gameChar_y - 40);
        endShape();

        //right wing
        beginShape();
        vertex(gameChar_x - 12, gameChar_y - 37);
        bezierVertex(gameChar_x - 12, gameChar_y - 37, gameChar_x - 10, gameChar_y - 54, gameChar_x - 32, gameChar_y - 52);
        bezierVertex(gameChar_x - 32, gameChar_y - 52, gameChar_x - 42, gameChar_y - 52, gameChar_x - 52, gameChar_y - 62);
        bezierVertex(gameChar_x - 52, gameChar_y - 62, gameChar_x - 60, gameChar_y - 62, gameChar_x - 45, gameChar_y - 50);
        bezierVertex(gameChar_x - 45, gameChar_y - 50, gameChar_x - 64, gameChar_y - 60, gameChar_x - 44, gameChar_y - 44);
        bezierVertex(gameChar_x - 44, gameChar_y - 44, gameChar_x - 60, gameChar_y - 50, gameChar_x - 41, gameChar_y - 40);
        bezierVertex(gameChar_x - 41, gameChar_y - 40, gameChar_x - 57, gameChar_y - 43, gameChar_x - 37, gameChar_y - 35);
        bezierVertex(gameChar_x - 37, gameChar_y - 35, gameChar_x - 54, gameChar_y - 38, gameChar_x - 33, gameChar_y - 32);
        bezierVertex(gameChar_x - 33, gameChar_y - 32, gameChar_x - 51, gameChar_y - 34, gameChar_x - 29, gameChar_y - 28);
        bezierVertex(gameChar_x - 29, gameChar_y - 28, gameChar_x - 49, gameChar_y - 30, gameChar_x - 25, gameChar_y - 25);
        bezierVertex(gameChar_x - 25, gameChar_y - 25, gameChar_x - 14, gameChar_y - 24, gameChar_x - 12, gameChar_y - 37);
        endShape(CLOSE);  

        //internal bit of the right wing
        beginShape();
        vertex(gameChar_x - 16, gameChar_y - 34);
        bezierVertex(gameChar_x - 16, gameChar_y - 34, gameChar_x - 6, gameChar_y - 42, gameChar_x - 40, gameChar_y - 49);
        bezierVertex(gameChar_x - 40, gameChar_y - 49, gameChar_x - 8, gameChar_y - 32, gameChar_x - 34, gameChar_y - 40);
        endShape();
        //noStroke();
        
        //body
        fill(255, 255, 255, 200);
        rect(gameChar_x - 13, gameChar_y - 43, 26, 32, 5);
        fill(0, 0, 0, 200);
        ellipse(gameChar_x, gameChar_y - 35, 1.5, 1.5);
        ellipse(gameChar_x, gameChar_y - 30, 1.5, 1.5);
        ellipse(gameChar_x, gameChar_y - 25, 1.5, 1.5);
        
        //hands
        fill(250, 200, 213, 200);
        rect(gameChar_x + 14.5, gameChar_y - 22, 6, 5, 2.2);
        rect(gameChar_x - 20.5, gameChar_y - 22, 6, 5, 2.2); 

        //arms
        fill(255, 255, 255, 200);
        rect(gameChar_x - 21, gameChar_y - 40, 7, 18, 2);
        rect(gameChar_x + 14, gameChar_y - 40, 7, 18, 2);

        //legs
        rect(gameChar_x + 1, gameChar_y - 12, 7, 15, 2);
        rect(gameChar_x - 8, gameChar_y - 12, 7, 15, 2);
        noStroke();
                
        
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
// Background functions
// ---------------------------

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


// Function to draw the DeathAngel that points the right direction
function drawDeathAngel()
{     
    xPos = -450;
    yPos = floorPos_y
    
    //x_center= min + (max-min)/2
    
    push();

    translate(xPos - 540, yPos - 432);
    
    
    //Death Angel body
    fill(0);
    beginShape();
    vertex(490, 203);
    bezierVertex(490, 203, 512, 196, 521, 208);
    bezierVertex(521, 208, 530, 220, 530, 258);
    vertex(542, 289);
    vertex(551, 261);
    bezierVertex(551, 261, 557, 255, 560, 257);
    bezierVertex(560, 257, 570, 320, 548, 351);
    bezierVertex(548, 351, 540, 362, 537, 352);
    vertex(534, 345);
    vertex(532, 432);
    bezierVertex(532, 432, 528, 440, 486, 439);
    bezierVertex(486, 439, 450, 435, 426, 442);
    bezierVertex(426, 442, 405, 448, 396, 436);
    bezierVertex(396, 436, 390, 430, 385, 432);
    bezierVertex(385, 432, 460, 430, 475, 387);
    vertex(482, 327);
    bezierVertex(482, 327, 480, 340, 466, 348);
    bezierVertex(466, 348, 435, 275, 463, 275);
    vertex(475, 290);
    vertex(490, 260);
    vertex(493, 220);
    bezierVertex(493, 220, 495, 206, 486, 210);
    bezierVertex(486, 210, 480, 206, 490, 203);
    endShape(CLOSE);
    
    
    //Scythe
    rect(460, 130, 3, 300);
    
    beginShape();
    vertex(455, 140);
    bezierVertex(455, 140, 535, 140, 560, 185);
    bezierVertex(560, 185, 520, 160, 455, 165);
    endShape(CLOSE);
    
    
    //Left hand
    fill(255);
    stroke(0);
    strokeWeight(0.5);
    strokeJoin(ROUND);
    beginShape();
    vertex(560, 260);
    bezierVertex(560, 260, 560, 258, 564, 257);
    vertex(580, 258);
    bezierVertex(580, 258, 585, 258, 579, 260);
    vertex(579, 260);
    vertex(570, 260.5);
    bezierVertex(571, 260.5, 571, 262, 568, 266);
    vertex(560, 269);
    vertex(560, 260);
    endShape(CLOSE);
    
    //Right hand
    rect(456, 281, 10, 11, 3);
    
   
    //Death Angel face
    noStroke();
    ellipse(510, 220, 20, 23);
    ellipse(512, 231, 10, 12);
    
    
    fill(0);
    ellipse(508, 224, 6, 7);
    ellipse(516, 224, 5, 6);
    triangle(512, 230, 513, 227, 514, 230);
    
    pop();
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
    
    if(lives > 0)
    {
        if((gameChar_world_x > t_canyon.x_pos) && 
           (gameChar_world_x < t_canyon.x_pos+t_canyon.width) && 
           (gameChar_y >= floorPos_y) && !isGameOver)
        {  
            isPlummeting = true;  
            gameChar_y += 2;
            fallingSound.isPlaying() || fallingSound.play();
        }
    }
    else
    {
        isPlummeting = false;  
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
    if(abs(dist(gameChar_world_x, gameChar_y, t_collectable.x_pos, t_collectable.y_pos) < 30) && !isGameOver)   
    {
        t_collectable.isFound = true; 
        appleCrunch.play();
        game_score += 1;
    }
}

// ----------------------------------
// Flapole render and check functions
// ----------------------------------

// Function to draw flagPole
function drawFlagpole()
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

// Function to check flagPole
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

// ----------------------------------
// Create Platforms function
// ----------------------------------

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

// ----------------------------------
// Enemy constructor
// ----------------------------------

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
	    triangle(this.currentX - 10, 
                 this.y + 10, 
                 this.currentX - 10, 
                 this.y, 
                 this.currentX , 
                 this.y);
        
        triangle(this.currentX,
                 this.y + 10, 
                 this.currentX - 10, 
                 this.y, 
                 this.currentX + 10, 
                 this.y);
        
        triangle(this.currentX + 10, 
                 this.y + 10, 
                 this.currentX, 
                 this.y, 
                 this.currentX + 20, 
                 this.y);
        
        triangle(this.currentX + 20, 
                 this.y + 10, 
                 this.currentX + 10, 
                 this.y, 
                 this.currentX + 20, 
                 this.y);

        //ghost eyes
        fill(0);
        ellipse(this.currentX + 1, this.y - 12, 8, 8);
        ellipse(this.currentX + 10, this.y - 12, 8, 8);
        
        //ghost cyan eye colour
        fill(0, 255, 255);
        
        //move eyes right and left
        if(gameChar_world_x < this.currentX)
        {
            ellipse(this.currentX, this.y - 12, 3, 3);
            ellipse(this.currentX + 9, this.y - 12, 3, 3); 
        }
        else
        {
            ellipse(this.currentX + 2, this.y - 12, 3, 3);
            ellipse(this.currentX + 11, this.y - 12, 3, 3); 
        }
        
    }
    
    //check if we are in contact with the ghost
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

// ----------------------------------
// Cloud constructor
// ----------------------------------

function Cloud(x, y, size, speed)
{
    this.x = x;
    this.y = y;
    this.size = size;

    this.speed = speed;
    
    this.cloudMovement = function()
    {
        this.x += this.speed;
    }
    
    this.drawCloud = function()
    {   
        fill(255);
        
        ellipse( this.x + 65 *  this.size, 
                 this.y *  this.size,
                 this.size * 50, 
                 this.size * 50);
        
        ellipse( this.x + 100 *  this.size, 
                 this.y *  this.size,
                 this.size * 70, 
                 this.size * 70);
        
        ellipse( this.x + 135 *  this.size, 
                 this.y *  this.size, 
                 this.size * 50, 
                 this.size * 50);
    }

}

// ----------------------------------
// If the cloud is over the screen width then remove it from array and reconstruct 
// ----------------------------------

function CloudRespawn()
{
    
    this.clouds = [];
    this.startClouds = 0;

    this.cloudsInTheSky = function(startClouds)
    {
        this.startClouds = startClouds;
        
        //start clouds first run
        for(var i = 0; i < startClouds; i++)
        {
            var nc = new Cloud(random(-500, 3100), 
                               random(70, 150), 
                               random(0.2, 1.5), 
                               random(0.1, 0.3)
                              );
            
            this.clouds.push(nc);
        }
        
        this.drawAndUpdateClouds = function()
        {
            //initial draw and movement on the screen
            var offScreenClouds = 0;
            for(var i = this.clouds.length - 1; i >= 0; i--)

            {
                this.clouds[i].drawCloud();
                this.clouds[i].cloudMovement();
                if(this.clouds[i].x > flagpole.x_pos + 200)
                {
                    this.clouds.splice(i, 1)
                    offScreenClouds++;
                }
                
            }
            
            //respawn clouds that are now missing
            if(offScreenClouds > 0)
            {
                for(var i = 0; i < offScreenClouds; i++)
                {
                    var nc = new Cloud(random(-800, -1000), 
                                       random(70, 150), 
                                       random(0.2, 1.5), 
                                       random(0.1, 0.3)
                                      );
                    
                    this.clouds.push(nc);
                }
            }
        }
    }
}

// ----------------------------------
// Constructor to draw scenery flowers
// ----------------------------------

function Flower(x, y, size, color)
{
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
    
    this.draw = function()
    {   
        //flower leafs
        stroke(0,100,0);
        strokeWeight(0.3);
        fill(0,150,0);
        ellipse(this.x - this.size / 2, this.y + 10,this.size, this.size / 2);
        ellipse(this.x + this.size / 2, this.y + 10,this.size, this.size / 2);
        
        //flower stem
        strokeWeight(1);
        line(this.x, floorPos_y, this.x, this.y);
        noStroke();
        
        //Flower petals
        fill(this.color);
        ellipse(this.x - this.size / 2, this.y - this.size / 2,this.size);
        ellipse(this.x  + this.size / 2, this.y - this.size / 2, this.size);
        ellipse(this.x  - this.size / 2, this.y + this.size / 2, this.size);
        ellipse(this.x  + this.size / 2, this.y + this.size / 2, this.size);
        
        //Middle yellow bit of the flower
        fill(350,230,20);
        ellipse(this.x , this.y, this.size * 0.8);
        
    }
}

// ----------------------------------
// Check if player is alive
// ----------------------------------

function checkPlayerDie(enemyContact)
{   
    if(lives > 0)
    {
        if(gameChar_y > height + 65 || enemyContact || gameChar_world_x < -450)    
        {
            lives -= 1;

            if(lives > 0)
            {
                startGame();
            }
        }
    }
    else
    {  
        
        // Game over message.
        fill(255);
        stroke(0);
        strokeWeight(2);
        rect(width/4, height/3, width/2, height/4);
        noStroke();

        textAlign(CENTER, CENTER);
        textSize(32);
        fill(0);
        text("Game over", width/2, height/2 - 50);
        textSize(24);
        text("Press enter to play again", width/2, height/2 - 10);
        
        isGameOver = true;
        
        if(playGameOverSong)
        {
            playGameOverSong = false;
            gameSong.stop();
            gameOver.isPlaying() || gameOver.play();
        }
    }   
}

// ----------------------------------
// Start Game
// ----------------------------------

function startGame()
{
    gameChar_x = width/2;
	gameChar_y = floorPos_y;

    // Variable to control the background scrolling.
	scrollPos = 0;

	// Variable to store the real position of the gameChar in the game world. Needed for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;

	// Boolean variables to control the movement of the game character.
	isLeft = false;
	isRight = false;
	isFalling = false;
	isPlummeting = false;
    isGameOver = false;
    
    // Initialise game score.
    game_score = 0;
    
    mountains = 
    [
        {x_pos: -400, y_pos: 200},
        {x_pos: 100, y_pos: 200},
        {x_pos: 700, y_pos: 160},
        {x_pos: 1200, y_pos: 130},
        {x_pos: 2000, y_pos: 250},
        {x_pos: 2300, y_pos: 130},
        {x_pos: 2600, y_pos: 280}

    ];
    
    trees_x = [
        -250, 
        100, 
        300, 
        650, 
        1000, 
        1500,
        1700,
        2000,
        2450,
        2650,
        3000
    ];
    
    collectables = 
    [
        {x_pos: -350, y_pos: floorPos_y, isFound: false},
        {x_pos: -200, y_pos: floorPos_y - 90, isFound: false},
        {x_pos: 100, y_pos: floorPos_y, isFound: false},
        {x_pos: 200, y_pos: floorPos_y - 180, isFound: false},
        {x_pos: 650, y_pos: floorPos_y - 90, isFound: false},
        {x_pos: 935, y_pos: floorPos_y - 275, isFound: false},
        {x_pos: 1175, y_pos: floorPos_y, isFound: false},
        {x_pos: 1400, y_pos: floorPos_y, isFound: false},
        {x_pos: 1700, y_pos: floorPos_y, isFound: false},
        {x_pos: 2100, y_pos: floorPos_y - 120, isFound: false},
        {x_pos: 2200, y_pos: floorPos_y - 180, isFound: false},
        {x_pos: 2380, y_pos: floorPos_y - 220, isFound: false},
        {x_pos: 2500, y_pos: floorPos_y, isFound: false},
        {x_pos: 2600, y_pos: floorPos_y - 180, isFound: false},
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
    platforms.push(createPlatforms(700, floorPos_y - 70 , 110));
    platforms.push(createPlatforms(850, floorPos_y - 150, 100));
    platforms.push(createPlatforms(2100, floorPos_y - 95, 120));
    platforms.push(createPlatforms(2320, floorPos_y - 150, 120));
    platforms.push(createPlatforms(2540, floorPos_y - 95, 120) );
    
    
    // enemies
    enemies = [];
    enemies.push(new Enemy(600, floorPos_y - 10, 150));
    enemies.push(new Enemy(1000, floorPos_y - 10, 180));
    enemies.push(new Enemy(1370, floorPos_y - 10, 400)); 
    enemies.push(new Enemy(2000, floorPos_y - 10, 300));   
    enemies.push(new Enemy(2100, floorPos_y - 110, 100));
    enemies.push(new Enemy(2300, floorPos_y - 10, 300));  
    enemies.push(new Enemy(2540, floorPos_y - 110, 100));
    
    //flower
    flowers = [];
    for(var i = 0; i < 30; i++)
    {
        var flowerColour = color(random(150,255), random(0,100), 0);
        flowers.push(new Flower(random(-500, 3500), 
                                floorPos_y - 12, 
                                random(4,8), 
                                flowerColour)
                    );
    }
  
    //Initialise Clouds
    clouds = new CloudRespawn();
    clouds.cloudsInTheSky(18);
    
    //Initialise flagpole.
    flagpole = {isReached : false, x_pos: 3100, flagWidth: 80, flagHeight:48}
    
}
