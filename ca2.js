
let canvas;
let context;

let request_id;
let fpsInterval = 1000 / 30; // the denominator is frames-per-second
let now;
let then = Date.now();

let zombies = []; // 1v
let vampires = [];
let obstacles = [];
let collectables = [];
let target;

let score = 0;
let time = 0;
let level = 0;

let playerImage = new Image();
let zombieImage = new Image();
let vampireImage = new Image();
let obstacleImage = new Image();
let collectableImage = new Image();
let targetImage = new Image();
let background = new Image();

let totalObstacles = 0;
let totalZombies = 0;
let totalVampires = 0;
let totalCollectables = 0;

let zombieSpeed = 1;

// Player size and coordinates
let player = {
    x : 200,
    y : 380,
    size : 20,
    xChange : 0,
    yChange : 0,
    previousXChange : 0,
    previousYChange : 0
}

let moveLeft = false;
let moveUp = false;
let moveRight = false;
let moveDown = false;
let pause = false;

let main_music_audio = new Audio('main.mp3');
let boing_audio = new Audio('boing.mp3')
let collectable_audio = new Audio('collectable.mp3');
let next_level_audio = new Audio('nextlevel.mp3');
let death_audio = new Audio('death.mp3');

document.addEventListener("DOMContentLoaded", init, false);


function init() {
    canvas = document.querySelector("canvas"); // create the canvas
    context = canvas.getContext("2d");  // find our Picasso

    playerImage.src = "fish.png";
    zombieImage.src = "zombie_walk1.png";
    vampireImage.src = "vamp.png";
    obstacleImage.src = "rock.png";
    collectableImage.src = "red.png";
    targetImage.src = "flag.png";
    background.src = "seafloor.png";

    //startLevel();
    let start_button = document.querySelector("#start");
    start_button.onclick = start;
}

function start(){
    let start_button = document.querySelector("#start");
    start_button.innerHTML = "restart";

    // reset the variables
    totalVampires = 0;
    totalZombies = 0;
    totalCollectables = 1;
    zombies = []; // 1v
    vampires = [];
    obstacles = [];
    collectables = [];
    level = 0;
    score = 0;

    moveUp = false;
    moveDown = false;
    moveLeft = false;
    moveRight = false;

    window.addEventListener("keydown", activate, false); //listen out for me pressing a key and then run the function
    window.addEventListener("keyup", deactivate, false);

    pause = false;

    let score_element = document.querySelector("#score");
    score_element.innerHTML = "SCORE: " + score;

    main_music_audio.play();
    main_music_audio.volume = 0.5;
    main_music_audio.loop = true;
    startLevel();
    draw();
}

function startLevel(){
    if (level >= 1) {
        score = score + level * 5;
        let score_element = document.querySelector("#score");
        score_element.innerHTML = "SCORE: " + score;
        next_level_audio.currentTime = 0;
        next_level_audio.play();
    }

    level = level + 1;
    zombieSpeed = zombieSpeed + 0.5;

    if(level == 1){
        totalObstacles = 10;
        totalVampires = 0;
        totalZombies = 0;
        totalCollectables = 1;
    }else if(level == 2){
        totalObstacles = 10;
        totalVampires = 1;
        zombieSpeed = 0;
        totalZombies = 0;
        totalCollectables = 1;
    }else if(level == 3) {
        totalObstacles = 10;
        totalVampires = 1;
        zombieSpeed = 1;
        totalZombies = 1;
        totalCollectables = 1;
    }else if(level == 4){
        totalObstacles = 10;
        totalVampires = 2;
        zombieSpeed = 1;
        totalZombies = 2;
        totalCollectables = 2;
    }else if(level == 5){
        totalObstacles = 10;
        totalVampires = 2;
        zombieSpeed = 1.5;
        totalZombies = 2;
        totalCollectables = 2;
    }else if(level == 6){
        totalObstacles = 15;
        totalVampires = 3;
        zombieSpeed = 1.5;
        totalZombies = 3;
        totalCollectables = 2;
    }else if(level == 7){
        totalObstacles = 15;
        totalVampires = 3;
        zombieSpeed = 2;
        totalZombies = 3;
        totalCollectables = 3;
    }else if(level == 8){
        totalObstacles = 20;
        totalVampires = 3;
        zombieSpeed = 2;
        totalZombies = 4;
        totalCollectables = 4;
    }else if(level == 9){
        totalObstacles = 20;
        totalVampires = 4;
        zombieSpeed = 2.5;
        totalZombies = 4;
        totalCollectables = 5;
    }else if(level == 10){
        totalObstacles = 20;
        totalVampires = 4;
        zombieSpeed = 3;
        totalZombies = 5;
        totalCollectables = 5;
    }else if(level == 11){
        stop("YOU WIN!")
    }

    setup_obstacles(totalObstacles);
    setup_zombies(totalZombies, zombieSpeed);
    setup_vampires(totalVampires, 0.2);
    setup_collectables(totalCollectables);
    setupTarget();
}

function setup_obstacles(totalNumberObstacles){
    //obstacles.length = 0; // clear all obstacles. We might not want to clear obstacles however, and may instead decide to just add new ones.
    while (obstacles.length < totalNumberObstacles) { // will only create up to 5 things
        let size = randint(15, 25);
        let o = {
            x : randint(0, canvas.width - size), // puts the x value off the edge of the canvas - size just to it doesn't appear off screen
            y : randint(0, canvas.height - size),
            size : size // they'll all be different sizes
        };
        obstacles.push(o);
    }
}

function setup_collectables(totalNumberCollectables){
    collectables.length = 0; // every level reset the collectables

    while (collectables.length < totalNumberCollectables) { // will only create up to 4 things
        let c = {
            x : randint(0, canvas.width), // puts the x value off the edge of the canvas
            y : randint(0, canvas.height),
            size : 20
        };
        collectables.push(c);
    }
}

// These zombies follow the player
function setup_zombies(totalNumberZombies, newSpeed){
    //zombies.length = 0; // if we want new zombies every level
    while (zombies.length < totalNumberZombies) { // will only create up to 5 things
        let z = {
            x : randint(0, canvas.width), // puts the x value off the edge of the canvas
            y : randint(0, canvas.height),
            size : 20,
            xChange : 0,
            yChange : 0,
            previousXChange: 0,
            previousYChange: 0,
            wallSpeedModifier: 0,
            speed: 2
        };
        zombies.push(z);
    }

    for(let z of zombies){
        z.speed = newSpeed;
    }
}

function setup_vampires(totalNumberVampires, extraSpeed){
    //vampires.length = 0;
    while (vampires.length < totalNumberVampires) { // will only create up to 4 things
        let v = {
            x : randint(0, canvas.width), // puts the x value off the edge of the canvas
            y : randint(0, canvas.height),
            size : 20,
            xChange: randint(-2, 2),
            yChange: randint(-2, 2),
            speed: 1
        };

        vampires.push(v);
    }

    for(let v of vampires){
        // sometimes the vampires spawn overlapping an obstacle and get stuck. This stops that
        for(let o of obstacles){
            while(collides(v, o)){
                v.x = randint(0, canvas.width);
                v.y = randint(0, canvas.height);
            }
        }

        v.xChange = v.xChange + extraSpeed;
        v.yChange = v.yChange + extraSpeed;
    }
}

function setupTarget(){
    target = {
        x: randint(0, canvas.width - 20),
        y: randint(0, canvas.height - 20),
        size: 20
    }
}

function draw() {
    request_id = window.requestAnimationFrame(draw); // creates animation
    let now = Date.now();
    let elapsed = now - then;
    if (elapsed <= fpsInterval) {
        return;
    }
    then = now - (elapsed % fpsInterval);

    context.clearRect(0, 0, canvas.width, canvas.height); // clears canvas

    context.drawImage(background, 0, 0);

    // draw the zombies
    // context.fillStyle = "yellow"; // picks up yellow paintbrush
    for (let z of zombies) {      // going through the list and drawing the objects on the screen
        context.drawImage(zombieImage,
            z.x, z.y,z.size, z.size);
    }

    // draw the vampires
    // context.fillStyle = "purple"; // picks up purple paintbrush
    for (let v of vampires) {      // going through the list and drawing the objects on the screen
        context.drawImage(vampireImage,
            v.x, v.y, v.size, v.size);
    }

    context.drawImage(targetImage, target.x, target.y, target.size, target.size);

    // draw the player
    context.drawImage(playerImage,
        player.x, player.y, player.size, player.size);


    // draw the obstacles
    context.fillStyle = "white";
    for (let o of obstacles) {      // going through the list and drawing the objects on the screen
        context.drawImage(obstacleImage,
            o.x, o.y, o.size, o.size);
    }

    // draw the collectables
    context.fillStyle = "white";
    for (let o of collectables) {      // going through the list and drawing the objects on the screen
        context.drawImage(collectableImage,
            o.x, o.y, o.size, o.size);
    }

    if (pause) return;

    // collision detection
    for (let z of zombies) {      // visit each zombie and see if the player has collided
        if (player_collides(z)) {
            death_audio.play();
            stop("You Died!");
            return;
        }
    }

    for (let v of vampires) {      // visit each vampire and see if the player has collided
        if (player_collides(v)) {
            death_audio.play();
            stop("You Died!");
            return;
        }
    }

    // Player has reached new level
    if(player_collides(target)){
        startLevel()
    }

    // deal with obstacles
    for (let o of obstacles) {
        // get the player to bounce off
        if (collides(o, player)) {
            // bounce the player away
            player.xChange = player.previousXChange * -5;
            player.yChange = player.previousYChange * -5;
            boing_audio.currentTime = 0;
            boing_audio.play();
        }

        for(let z of zombies){
            if(collides(o, z)){
                z.wallSpeedModifier = 0.25;
            }
        }
    }

    // deal with collectables
    for (let c of collectables){
        if(collides(c, player)){
            score = score + 1;
            let score_element = document.querySelector("#score");
            score_element.innerHTML = "SCORE: " + score;
            collectables.splice(collectables.indexOf(c), 1);
            collectable_audio.currentTime = 0;
            collectable_audio.play();
        }
    }

    for (let v of vampires) {
        if (v.x < 0) {        // getting it to bounce against walls
            v.xChange = v.xChange * -1; // if xchange is -7, multiply it by -1 and you get a positive number
        } else if (v.x + v.size >= canvas.width) {
            v.xChange = v.xChange * -1; // changing direction
        }
        if (v.y < 0) {
            v.yChange = v.yChange * -1;
        } else if (v.y + v.size >= canvas.height) {
            v.yChange = v.yChange * -1;
        }

        //also change direction if it hits a wall
        for(let o of obstacles) {
            if (collides(v, o)) {
                v.xChange = v.xChange * -1;
                v.yChange = v.yChange * -1;
            }
        }
    }

    for (let v of vampires) {   // updates the positions of the vampires
        if (v.x + v.width < 0) {
            v.x = canvas.width; // puts the object back at the other end of the screen
            //v.y = randint(0, canvas.height);
        }
        if  (v.x > canvas.width){
            v.x = -v.size;
        }
        else
        {
            v.x = v.x + v.xChange * v.speed;
            v.y = v.y + v.yChange * v.speed;
        }
    }


    // where will the zombies move
    for (let z of zombies) {
        // do the same for x and y
        // if the x of the zombie is ahead of the x of the player, then we want to go in that direction but only at a certain max speed
        z.xChange = player.x - z.x;
        if (z.xChange > 1) {
            z.xChange = z.speed;
        } else if (z.xChange < -1) {
            z.xChange = -z.speed;
        }
        z.yChange = player.y - z.y;
        if (z.yChange > 1) {
            z.yChange = z.speed;
        }
        if (z.yChange < -1) {
            z.yChange = -z.speed;
        }

        z.xChange = z.xChange * z.wallSpeedModifier;

        z.yChange = z.yChange * z.wallSpeedModifier;

        // reset wall speed for this zombie
        z.wallSpeedModifier = 1;

        z.x = z.x + z.xChange;
        z.y = z.y + z.yChange;
    }

    // Moving Player
    if (moveRight) {            // move Right
        player.xChange = player.xChange + player.size/2.5;
    }
    if (moveLeft) {
        player.xChange = player.xChange - player.size/2.5;
    }
    if (moveUp) {            // move Up
        player.yChange = player.yChange - player.size/2.5;
    }
    if (moveDown) {            // move Down
        player.yChange = player.yChange + player.size/2.5;
    }

    player.x = player.x + player.xChange;
    player.y = player.y + player.yChange;

    // save these so the player bounces off walls
    player.previousXChange = player.xChange;
    player.previousYChange = player.yChange;

    // reset these
    player.xChange = 0;
    player.yChange = 0;

    if (player.x + player.size < 0) {
        player.x = canvas.width;
    } else if (player.x > canvas.width) {
        player.x = -player.size;
    }

    if(player.y + player.size < 0){
        player.y = canvas.height;
    }
    else if (player.y > canvas.height){
        player.y = -player.size;
    }
    
}

function randint(min, max) {
    return Math.round(Math.random() * (max - min)) + min;
}

// Activate (Press Down)
function activate(event) {
    let key = event.key;    // go to the event and ask for which key
    if (key === "ArrowLeft") {
        moveLeft = true;
    } else if (key === "ArrowUp") {
        moveUp = true;
    } 
    else if (key === "ArrowRight") {
        moveRight = true;
    } else if  (key === "ArrowDown") {
        moveDown = true;
    } else if (key === " ") {
        pause = !pause;
    }
}

// Deactivate (Press Up)
function deactivate(event) {
    let key = event.key;    // go to the event and ask for which key
    if (key === "ArrowLeft") {
        moveLeft = false;
    } else if (key === "ArrowUp") {
        moveUp = false;
    } else if (key === "ArrowRight") {
        moveRight = false;
    } else if  (key === "ArrowDown") {
        moveDown = false;
    }
}

// PLayer Collides Function
function player_collides(thing) { //
    if (player.x + player.size < thing.x || // if my right hand corner is less than the asteroids left hand corner
        thing.x + thing.size < player.x ||
        player.y > thing.y + thing.size ||
        thing.y > player.y + player.size)
    {
        return false;
    }
    else
    {
        return true;
    }
}

// does object collide with other object
function collides(object, otherObject){
    if( object.x + object.size < otherObject.x ||
        otherObject.x + otherObject.size < object.x ||
        object.y > otherObject.y + otherObject.size ||
        otherObject.y > object.y + object.size
    )
    {
        return false;
    }
    else
    {
        return true;
    }
}

// Stop Function
function stop(message) {
    window.removeEventListener("keydown", activate, false);
    window.removeEventListener("keyup", deactivate, false);
    pause = true;
    let outcome_element = document.querySelector("#outcome");
    outcome_element.innerHTML = message;
}







