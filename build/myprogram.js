"use strict";
// Programmer's Name:
// Program Name:
//////////////////////////////////////////////////////////////////////////
/*
 * Copyright 2012, 2016, 2019, 2020 Cheng
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     https://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
//import { newGQAnimation, createGroupInPlayground, createSpriteInGroup, spriteGetX, spriteGetY, spriteSetXY, spriteGetWidth, spriteGetHeight, PLAYGROUND_HEIGHT, PLAYGROUND_WIDTH, getKeyState, spriteSetAnimation, ANIMATION_HORIZONTAL, forEachSpriteGroupCollisionDo, createTextSpriteInGroup, sprite, getMouseButton1 } from "./libs/lib-gqguardrail-exports.ts";
//import * as Fn from "./libs/lib-gqguardrail-exports.ts";
// Don't edit the import lines above, or you won't be able to write your program!
// Also, do not use the following variable and function names in your own code below:
//    setup, draw, Fn
// and the other imported names above.
// Write your program below this line:
// ***********************************
//import "./utils.ts";
var levelNumber = 2;
var spacebarDownBefore = false;
var mouseDownBefore = false;
var gameState = "menu";
var startTime = Date.now();
var deaths = 0;
var scrollAmount = 0;
// Levels
var levelBlocks = [];
var levelTexts = [];
// Camera and camera constraints
var xOffset = 700;
var yOffset = 0;
const minX = -1200;
const maxX = 750;
// Change if you want extra info
const debug = false;
// Respawn points
const spawnPoint = {
    1: [-350, 422],
    2: [-350, 422],
};
/* The player is made up of 2 sprites:
 * 1. the invisible hitbox and 2. the animation / visible sprite.
 * This dict stores the data required for both, including velocity and animations.
 */
let playerData = {
    "hitboxId": "playerHitbox",
    "hitboxWidth": 13,
    "hitboxHeight": 37,
    "xPos": spawnPoint[levelNumber][0],
    "yPos": spawnPoint[levelNumber][1],
    "xSpeed": 0,
    "ySpeed": 0,
    "groundColliding": true,
    "coyoteTime": 6,
    "coyoteCounter": 0,
    "boostCooldown": Date.now(),
    //---------------------------
    "spriteId": "playerSprite",
    "spriteWidth": 43,
    "spriteHeight": 55,
    "animState": "idle",
    "lastDirection": 1,
    "animHitbox": newGQAnimation("img/player/hitbox.png"),
    "animIdleLeft": newGQAnimation("img/player/idleLeft.png"),
    "animIdleRight": newGQAnimation("img/player/idleRight.png"),
    "animJumpLeft": newGQAnimation("img/player/jumpLeft.png"),
    "animJumpRight": newGQAnimation("img/player/jumpRight.png"),
    "animJumpStraight": newGQAnimation("img/player/jumpStraight.png"),
    "animRunCycleLeft": newGQAnimation("img/player/runCycleLeft.png", 11, 43, 25, ANIMATION_HORIZONTAL),
    "animRunCycleRight": newGQAnimation("img/player/runCycleRight.png", 11, 43, 25, ANIMATION_HORIZONTAL),
};
// More preloaded stuff
const screensForMenu = {
    "id": "screenSwitcher",
    "menuState": "mainMenu",
    "mainMenu": newGQAnimation("img/screens/mainMenu.png"),
    "mainMenuSelected": newGQAnimation("img/screens/mainMenuSelected.png"),
    "mainMenuSelected2": newGQAnimation("img/screens/mainMenuSelected2.png"),
    "leaderboardMenu": newGQAnimation("img/screens/leaderboard.png"),
    "leaderboardMenuSelected": newGQAnimation("img/screens/leaderboardSelected.png")
};
// Scoreboard, comes set with just my score
let leaderboard = {
    "John": 340123
};
// Groups
const backgroundGroupName = "backgroundGroup";
createGroupInPlayground(backgroundGroupName);
const collisionGroupName = "collisionGroup";
createGroupInPlayground(collisionGroupName);
const playerGroupName = "playerGroup";
createGroupInPlayground(playerGroupName);
const uiGroupName = "uiGroup";
createGroupInPlayground(uiGroupName);
const textGroupName = "textGroup";
createGroupInPlayground(textGroupName);
// Disable right click menu, because I want to use right click for controls
//$(document).contextmenu(function () {
//    return false;
//});
// Utils that would norrmally be kept in a secondary file
const lerp = function (a, b, t) {
    return (1 - t) * a + t * b;
};
/*
Fn.createTextInputSpriteInGroup(textGroupName, "inputfield", 200, 60, 2, 20, PLAYGROUND_WIDTH / 2 - 75, PLAYGROUND_HEIGHT / 2, test)
Fn.sprite("inputfield").css("resize", "none");
Fn.textInputSpriteSetString("inputfield", "test");
*/
/*

// Text input but custom instead of 'createTextInputSpriteInGroup' (I might be making extra work for myself here, but it's fun to figure out)
Fn.createTextSpriteInGroup(textGroupName, "inputfield", 200, 60, PLAYGROUND_WIDTH / 2 - 75, PLAYGROUND_HEIGHT / 2);

// Why won't this work?!
$("#inputfield").css("background-color", "rgba(0, 0, 0, 0)");
$("#inputfield").append(`<textarea id="inputfield2" rows="2" cols="20">John Doe</textarea>`);
$("#inputfield").append(`<button id="buttonId" type="button">Add me to leaderboard!</button>`);

$("#inputfield2").css("resize", "none");

//Also this
Fn.textInputSpriteSetHandler("inputfield", inputHandler);
*/
// Start Screen!
const mainMenu = function () {
    if (screensForMenu["menuState"].includes("main")) {
        mainState();
    }
    else {
        leaderboardState();
    }
};
const mainState = function () {
    if (Fn.getMouseX() < 275 && Fn.getMouseY() < 75) {
        if (screensForMenu["menuState"] != "mainMenuSelected") {
            screensForMenu["menuState"] = "mainMenuSelected";
            spriteSetAnimation(screensForMenu["id"], screensForMenu["mainMenuSelected"]);
        }
        if (getMouseButton1()) {
            if (mouseDownBefore)
                return; // Reverse check
            screensForMenu["menuState"] = "leaderboardMenu";
            spriteSetAnimation(screensForMenu["id"], screensForMenu["leaderboardMenu"]);
            mouseDownBefore = true;
        }
    }
    else if (Fn.getMouseX() > 165 && Fn.getMouseX() < 485 && Fn.getMouseY() > 400 && Fn.getMouseY() < 435 || getKeyState(13)) {
        if (screensForMenu["menuState"] != "mainMenuSelected2") {
            screensForMenu["menuState"] = "mainMenuSelected2";
            spriteSetAnimation(screensForMenu["id"], screensForMenu["mainMenuSelected2"]);
        }
        if (getMouseButton1() || getKeyState(13)) {
            if (mouseDownBefore)
                return; // Reverse check
            screensForMenu["menuState"] = "";
            gameState = "playing";
            startGame();
            mouseDownBefore = true;
        }
    }
    else {
        if (screensForMenu["menuState"] != "mainMenu") {
            screensForMenu["menuState"] = "mainMenu";
            spriteSetAnimation(screensForMenu["id"], screensForMenu["mainMenu"]);
        }
    }
};
const leaderboardState = function () {
    if (!Fn.spriteExists("scoreboardDisplayTimes"))
        leaderboardLogic(); // so it does it just once
    if (Fn.getMouseX() > 280 && Fn.getMouseX() < 360 && Fn.getMouseY() > 420 && Fn.getMouseY() < 455) {
        if (screensForMenu["menuState"] != "leaderboardMenuSelected") {
            screensForMenu["menuState"] = "leaderboardMenuSelected";
            spriteSetAnimation(screensForMenu["id"], screensForMenu["leaderboardMenuSelected"]);
        }
        if (getMouseButton1()) {
            if (mouseDownBefore)
                return; // Reverse check
            screensForMenu["menuState"] = "mainMenu";
            Fn.removeSprite("scoreboardDisplayRanks");
            Fn.removeSprite("scoreboardDisplayTimes");
            Fn.removeSprite("scoreboardDisplayNames");
            spriteSetAnimation(screensForMenu["id"], screensForMenu["mainMenu"]);
            mouseDownBefore = true;
        }
    }
    else {
        if (screensForMenu["menuState"] != "leaderboardMenu") {
            screensForMenu["menuState"] = "leaderboardMenu";
            spriteSetAnimation(screensForMenu["id"], screensForMenu["leaderboardMenu"]);
        }
    }
};
// This basically just displays the content from 'leaderboard' in a readable way
const leaderboardLogic = function () {
    // This uses the Schwartzian transform, because you can't sort a dict (at least to my understanding)
    var items = Object.keys(leaderboard).map((key) => { return [key, leaderboard[key]]; });
    items.sort((first, second) => { return +first[1] - +second[1]; }); // Why am I doing the '+x - +x'? *Sometimes* throws random error (ts(2362)) if not done like this.
    var keys = items.map((e) => { return e[0]; });
    createTextSpriteInGroup(textGroupName, "scoreboardDisplayRanks", 400, 500, PLAYGROUND_WIDTH / 2 - 390, PLAYGROUND_HEIGHT / 2 - 50);
    sprite("scoreboardDisplayRanks").css("font-family", "Tahoma").css("font-size", "20pt").css("text-align", "center").css("background-color", "rgba(0, 0, 0, 0)").css("color", "rgba(62, 34, 58, 100)");
    createTextSpriteInGroup(textGroupName, "scoreboardDisplayTimes", 400, 500, PLAYGROUND_WIDTH / 2 - 200, PLAYGROUND_HEIGHT / 2 - 50);
    sprite("scoreboardDisplayTimes").css("font-family", "Tahoma").css("font-size", "20pt").css("text-align", "center").css("background-color", "rgba(0, 0, 0, 0)").css("color", "rgba(62, 34, 58, 100)");
    createTextSpriteInGroup(textGroupName, "scoreboardDisplayNames", 400, 500, PLAYGROUND_WIDTH / 2 - 10, PLAYGROUND_HEIGHT / 2 - 50);
    sprite("scoreboardDisplayNames").css("font-family", "Tahoma").css("font-size", "20pt").css("text-align", "center").css("background-color", "rgba(0, 0, 0, 0)").css("color", "rgba(62, 34, 58, 100)");
    // First make a list of top 8
    var [displayRanks, displayTimes, displayNames] = ["", "", ""];
    for (let i = 0; i < 8; i++) {
        // Break if time is NaN
        let playerTime = leaderboard[keys[i]];
        if (!playerTime) {
            break;
        }
        // Make times readable
        let hours = Math.floor((playerTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let minutes = Math.floor((playerTime % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((playerTime % (1000 * 60)) / 1000);
        let miliseconds = (playerTime / 1000).toFixed(2);
        // Add to display var
        displayTimes = displayTimes + `${hours}:${minutes}:${seconds}.${miliseconds.toString().split('.')[1]}` + "<br>";
        displayNames = displayNames + keys[i] + "<br>";
        displayRanks = displayRanks + (i + 1) + "<br>";
    }
    // Display the display vars
    sprite("scoreboardDisplayRanks").html(displayRanks);
    sprite("scoreboardDisplayTimes").html(displayNames);
    sprite("scoreboardDisplayNames").html(displayTimes);
};
function inputHandler(text) {
    Fn.consolePrint(text);
    if (leaderboard[text] || text == 'John Doe')
        return; // When you don't have .includes, you gotta get creative (and yes I know 0 won't work, but you can't get a 0 sec time!)
    if (Fn.spriteExists("inputfield")) {
        Fn.removeSprite("inputfield");
    }
}
let setup = function () {
    createSpriteInGroup(backgroundGroupName, screensForMenu["id"], screensForMenu["mainMenu"], PLAYGROUND_WIDTH, PLAYGROUND_HEIGHT);
};
const newBlock = function (xPos, yPos, blockSize) {
    var width = parseInt(blockSize.split("x")[0]);
    var height = parseInt(blockSize.split("x")[1]);
    var i = levelBlocks.length; // Auto-updating index
    var newBlockInfo = {
        "id": "block" + i,
        "width": width,
        "height": height,
        "xPos": xPos,
        "yPos": yPos,
        "xSpeed": 0,
        "ySpeed": 0,
        "640x640": newGQAnimation("img/ground/640x640.png"),
        "20x480": newGQAnimation("img/ground/20x480.png"),
        "100x20": newGQAnimation("img/ground/100x20.png"),
        "100x640": newGQAnimation("img/ground/100x640.png")
    };
    levelBlocks[i] = newBlockInfo;
    createSpriteInGroup(collisionGroupName, newBlockInfo["id"], newBlockInfo[blockSize], newBlockInfo["width"], newBlockInfo["height"], newBlockInfo["xPos"], newBlockInfo["yPos"]);
};
// Start timer and begin
const startGame = function () {
    // Remove menu
    Fn.removeSprite(screensForMenu["id"]);
    // Controls guide
    createSpriteInGroup(uiGroupName, "controls", newGQAnimation("img/ui/controls.png"), 306, 326, PLAYGROUND_WIDTH / 2 - 153, PLAYGROUND_HEIGHT / 2 - 163);
    // Reset the timer in case they stayed on the menu for a while
    startTime = Date.now();
    // Setup level #1
    setupLevel();
    // Show the debug menu thing I use
    if (debug)
        createTextSpriteInGroup(textGroupName, "debugShown", 800, 30, 0, 0);
    // Timer
    createTextSpriteInGroup(textGroupName, "speedrunTimer", 300, 60, 10, 10);
    sprite("speedrunTimer").css("font-family", "Tahoma").css("background-color", "rgba(0, 0, 0, 0)").css("font-size", "20pt");
    // Player Sprite and Hitbox
    createSpriteInGroup(playerGroupName, playerData["spriteId"], playerData["animJumpStraight"], playerData["spriteWidth"], playerData["spriteHeight"], playerData["xPos"], playerData["yPos"]);
    createSpriteInGroup(playerGroupName, playerData["hitboxId"], playerData["animHitbox"], playerData["hitboxWidth"], playerData["hitboxHeight"], playerData["xPos"], playerData["yPos"]);
    // Background
    createSpriteInGroup(backgroundGroupName, "backgroundImage", newGQAnimation("img/ground/background.png"), PLAYGROUND_WIDTH, PLAYGROUND_HEIGHT, 0, 0);
    // Create 2 waves: wave1 and wave2
    createSpriteInGroup(backgroundGroupName, "wave1", newGQAnimation("img/ground/wave.png"), PLAYGROUND_WIDTH * 5, PLAYGROUND_HEIGHT, 0, 0);
    createSpriteInGroup(backgroundGroupName, "wave2", newGQAnimation("img/ground/wave2.png"), PLAYGROUND_WIDTH * 5, PLAYGROUND_HEIGHT, 0, 0);
};
const setupLevel = function () {
    // Remove old level (bit of an odd way to do it, but I can't seem to loop over all elements of a group)
    if (levelNumber != 1) {
        // Delete old sprites
        for (let i = 0; i < levelBlocks.length; i++) {
            if (Fn.spriteExists(levelBlocks[i]["id"])) {
                Fn.removeSprite(levelBlocks[i]["id"]);
            }
            ;
        }
        ;
        levelBlocks = [];
        levelTexts = [];
    }
    ;
    // Set up new level
    switch (levelNumber) {
        case 1:
            newBlock(-750, PLAYGROUND_HEIGHT - 20, "640x640");
            newBlock(0, PLAYGROUND_HEIGHT - 60, "20x480");
            newBlock(135, PLAYGROUND_HEIGHT - 80, "100x640");
            newBlock(350, PLAYGROUND_HEIGHT - 60, "20x480");
            newBlock(500, PLAYGROUND_HEIGHT - 100, "100x640");
            newBlock(500, PLAYGROUND_HEIGHT - 200, "100x20");
            newBlock(690, PLAYGROUND_HEIGHT - 240, "100x20");
            newBlock(860, PLAYGROUND_HEIGHT - 300, "100x20");
            newBlock(1050, PLAYGROUND_HEIGHT - 350, "100x640");
            newBlock(1200, 100 - PLAYGROUND_HEIGHT, "100x640");
            newBlock(1400, PLAYGROUND_HEIGHT - 20, "640x640");
            break;
        case 2:
            newBlock(-750, PLAYGROUND_HEIGHT - 20, "640x640");
            newBlock(-10, PLAYGROUND_HEIGHT - 60, "20x480");
            newBlock(90, PLAYGROUND_HEIGHT - 100, "20x480");
            newBlock(190, PLAYGROUND_HEIGHT - 140, "20x480");
            newBlock(390, PLAYGROUND_HEIGHT - 140, "20x480");
            newBlock(700, PLAYGROUND_HEIGHT - 100, "20x480");
            break;
        case 3:
            break;
        case 4:
            sprite("groundSprite4").html("Use your boost wisely.").css("font-family", "Tahoma").css("background-color", "rgba(0, 0, 0, 0)").css("font-size", "15pt");
            break;
        case 5:
            break;
        default:
        // Pass
    }
    ;
};
const respawnPlayer = function () {
    playerData["ySpeed"] = 0, playerData["xSpeed"] = 0;
    playerData["xPos"] = spawnPoint[levelNumber][0], playerData["yPos"] = spawnPoint[levelNumber][1];
};
const playerAnimation = function () {
    // Second sprite that follows the invisible hitbox for animations
    spriteSetXY("playerSprite", spriteGetX(playerData["hitboxId"]) - spriteGetWidth("playerSprite") / 3, spriteGetY(playerData["hitboxId"]) - spriteGetHeight(playerData["hitboxId"]) / 2 + 2);
    var colliding = playerData["groundColliding"];
    var speed = playerData["xSpeed"];
    if (colliding) { // On ground anims
        if (speed < 1 && speed > -1) {
            if (playerData["animState"] != "idle") {
                if (playerData["lastDirection"] == 1) {
                    spriteSetAnimation(playerData["spriteId"], playerData["animIdleLeft"]);
                }
                else {
                    spriteSetAnimation(playerData["spriteId"], playerData["animIdleRight"]);
                }
                playerData["animState"] = "idle";
            }
        }
        else if (speed > 1) {
            if (playerData["animState"] != "runRight") {
                spriteSetAnimation(playerData["spriteId"], playerData["animRunCycleRight"]);
                playerData["animState"] = "runRight";
            }
            playerData["lastDirection"] = 1;
        }
        else if (speed < -1) {
            if (playerData["animState"] != "runLeft") {
                spriteSetAnimation(playerData["spriteId"], playerData["animRunCycleLeft"]);
                playerData["animState"] = "runLeft";
            }
            playerData["lastDirection"] = -1;
        }
    }
    else {
        if (speed < 0.5 && speed > -0.5) {
            if (playerData["animState"] != "jumpStraight") {
                spriteSetAnimation(playerData["spriteId"], playerData["animJumpStraight"]);
                playerData["animState"] = "jumpStraight";
            }
        }
        else if (speed > 0.5) {
            if (playerData["animState"] != "jumpRight") {
                spriteSetAnimation(playerData["spriteId"], playerData["animJumpRight"]);
                playerData["animState"] = "jumpRight";
            }
        }
        else if (speed < -0.5) {
            if (playerData["animState"] != "jumpLeft") {
                spriteSetAnimation(playerData["spriteId"], playerData["animJumpLeft"]);
                playerData["animState"] = "jumpLeft";
            }
        }
    }
};
const handleCollisions = function (collIndex, hitSprite) {
    // See how the player is colliding
    let groundSprite = levelBlocks[0];
    for (let i = 0; i < levelBlocks.length; i++) {
        if (levelBlocks[i]["id"] == Fn.spriteId(hitSprite)) {
            groundSprite = levelBlocks[i];
            break;
        }
    }
    var collisionNormal = Fn.spriteHitDirection(groundSprite["id"], groundSprite["xPos"], groundSprite["yPos"], 0, 0, groundSprite["width"], groundSprite["height"], playerData["hitboxId"], playerData["xPos"], playerData["yPos"], playerData["xSpeed"], playerData["ySpeed"], 13, 37);
    // Un-collide the player
    if (collisionNormal["right"]) {
        playerData["xSpeed"] = 0;
        let amountIntoWall = (playerData["xPos"] + playerData["hitboxWidth"]) - groundSprite["xPos"];
        if (amountIntoWall > 0)
            playerData["xPos"] = playerData["xPos"] - (amountIntoWall);
    }
    else if (collisionNormal["left"]) {
        playerData["xSpeed"] = 0;
        let amountIntoWall = playerData["xPos"] - (groundSprite["xPos"] + groundSprite["width"]);
        if (amountIntoWall < 0)
            playerData["xPos"] = playerData["xPos"] - (amountIntoWall);
    }
    if (collisionNormal["down"]) {
        playerData["groundColliding"] = true;
        playerData["ySpeed"] = 0;
        let amountUnderGround = (playerData["yPos"] + playerData["hitboxHeight"]) - groundSprite["yPos"];
        if (amountUnderGround > 0)
            playerData["yPos"] = playerData["yPos"] - (amountUnderGround);
    }
    else if (collisionNormal["up"]) {
        playerData["groundColliding"] = false;
        playerData["ySpeed"] = 0;
        let amountOverGround = playerData["yPos"] - (groundSprite["yPos"] + groundSprite["height"]);
        if (amountOverGround > 0)
            playerData["yPos"] = playerData["yPos"] - (amountOverGround);
    }
};
const playerMovement = function () {
    // Tahoma is a CSS Web Safe Font!
    if (debug)
        sprite("debugShown").html(`Offset: ${xOffset} | Player X: ${playerData["xPos"].toPrecision(3)} | Player Y: ${playerData["yPos"].toPrecision(3)} | Player Y Speed: ${playerData["ySpeed"].toPrecision(3)} | Player X Speed: ${playerData["xSpeed"].toPrecision(3)}`).css("font-family", "Tahoma").css("background-color", "rgba(0, 0, 0, 0)");
    // Keys: a = 65 and d = 68
    if (getKeyState(68))
        playerData["xSpeed"] = playerData["xSpeed"] + 2.5;
    if (getKeyState(65))
        playerData["xSpeed"] = playerData["xSpeed"] - 2.5;
    if (getKeyState(68) && getKeyState(65))
        playerData["xSpeed"] = 0;
    if (playerData["xSpeed"] != 0)
        playerData["xSpeed"] = playerData["xSpeed"] * 0.7;
    if ((playerData["xSpeed"] - (-0.001)) * (playerData["xSpeed"] - (0.001)) <= 0)
        playerData["xSpeed"] = 0; // if # in range -0.001 to 0.001, just make it 0
    // The playerData["groundColliding"] will be false in air, true on ground - but not before these two lines!
    playerData["groundColliding"] = false;
    forEachSpriteGroupCollisionDo(playerData["hitboxId"], "collisionGroup", handleCollisions);
    // If in air vs ground
    if (playerData["ySpeed"] < 100 && !playerData["groundColliding"]) {
        playerData["ySpeed"]++;
        if (playerData["coyoteCounter"] > 0)
            playerData["coyoteCounter"]--;
    }
    else {
        playerData["coyoteCounter"] = playerData["coyoteTime"];
    }
    // In case you don't know what coyote time is: The player can still jump a few frames after going over the edge of a platform.
    if (playerData["coyoteCounter"] > 0 && (getKeyState(87))) { // Keys: 87 = w
        playerData["coyoteCounter"] = 0;
        playerData["ySpeed"] = -15;
    }
    // Boost
    if (getKeyState(32) && Date.now() - playerData["boostCooldown"] > 1000) { // Keys: 32 = space
        if (playerData["xSpeed"]) { // Can return NaN sometimes, so...
            playerData["xSpeed"] = 40 * (playerData["xSpeed"] / Math.abs(playerData["xSpeed"])); // This just sets the speed to either -40 or 40
            playerData["ySpeed"] = -3;
            playerData["boostCooldown"] = Date.now();
        }
    }
    // Reset after falling into the void
    if (playerData["yPos"] > PLAYGROUND_HEIGHT + playerData["spriteHeight"]) {
        deaths++;
        respawnPlayer();
    }
    // Next level
    if (playerData["xPos"] > 1840 && levelNumber == 1) {
        levelNumber++;
        xOffset = 750;
        respawnPlayer();
        setupLevel();
    }
    // Basic level constraint
    if (playerData["xPos"] < -740)
        playerData["xPos"] = -740;
    // Actually move the player
    playerData["xPos"] = playerData["xPos"] + playerData["xSpeed"];
    playerData["yPos"] = playerData["yPos"] + playerData["ySpeed"];
    spriteSetXY(playerData["hitboxId"], playerData["xPos"] + xOffset, playerData["yPos"] + yOffset);
};
const showTimer = function () {
    // Time calculations for hours, minutes and seconds
    var distance = (Date.now() - startTime);
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
    var miliseconds = (distance / 1000).toFixed(2);
    sprite("speedrunTimer").html(`${hours}:${minutes}:${seconds}.${miliseconds.toString().split('.')[1]}`);
};
const moveBlocks = function () {
    for (let i = 0; i < levelBlocks.length; i++) {
        let currentBlock = levelBlocks[i];
        spriteSetXY(currentBlock["id"], currentBlock["xPos"] + xOffset, currentBlock["yPos"] + yOffset);
    }
    spriteSetXY("wave1", xOffset / 5 - PLAYGROUND_WIDTH, yOffset);
    spriteSetXY("wave2", xOffset / 10 - PLAYGROUND_WIDTH, yOffset);
};
let draw = function () {
    // Just so we can check if they click this frame!
    if (!getMouseButton1())
        mouseDownBefore = false;
    // Gamestates
    if (gameState == "playing") {
        // Camera movement, Calculate the distance from the player to the center of the screen
        var playerDistToCenterX = spriteGetX(playerData["hitboxId"]) - PLAYGROUND_WIDTH / 2;
        var lerpFactor = 0.1;
        // Fancy scrolling so you can check out the level with the arrow keys
        if (getKeyState(37)) {
            scrollAmount++;
        }
        else if (getKeyState(39)) {
            scrollAmount--;
        }
        else {
            scrollAmount = 0;
        }
        // Smooth interpolation
        xOffset = lerp(xOffset, Math.max(minX, Math.min(maxX, (xOffset + -playerDistToCenterX + scrollAmount * 10))), lerpFactor);
        // Player
        playerMovement();
        playerAnimation();
        moveBlocks();
        // Weapons
        // Level
        // Timer
        showTimer();
        // How-to-play menu
        if (Fn.spriteExists("controls") && (getKeyState(37) || getKeyState(39) || getKeyState(68)
            || getKeyState(65) || getKeyState(87) || getKeyState(32))) {
            Fn.removeSprite("controls");
        }
    }
    else {
        mainMenu();
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXlwcm9ncmFtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibXlwcm9ncmFtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQztBQUNiLHFCQUFxQjtBQUNyQixnQkFBZ0I7QUFDaEIsMEVBQTBFO0FBQzFFOzs7Ozs7Ozs7OztHQVdHO0FBQ0gsT0FBTyxFQUNILGNBQWMsRUFDZCx1QkFBdUIsRUFDdkIsbUJBQW1CLEVBQ25CLFVBQVUsRUFDVixVQUFVLEVBQ1YsV0FBVyxFQUNYLGNBQWMsRUFDZCxlQUFlLEVBQ2YsaUJBQWlCLEVBQ2pCLGdCQUFnQixFQUNoQixXQUFXLEVBQ1gsa0JBQWtCLEVBQ2xCLG9CQUFvQixFQUNwQiw2QkFBNkIsRUFDN0IsdUJBQXVCLEVBQ3ZCLE1BQU0sRUFDTixlQUFlLEVBQ2xCLE1BQU0sbUNBQW1DLENBQUM7QUFDM0MsT0FBTyxLQUFLLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQUN4RCxpRkFBaUY7QUFFakYscUZBQXFGO0FBQ3JGLHFCQUFxQjtBQUNyQixzQ0FBc0M7QUFFdEMsc0NBQXNDO0FBQ3RDLHNDQUFzQztBQUN0QyxPQUErRCxZQUFZLENBQUM7QUFJNUUsSUFBSSxXQUFXLEdBQVcsQ0FBQyxDQUFDO0FBQzVCLElBQUksa0JBQWtCLEdBQVksS0FBSyxDQUFDO0FBQ3hDLElBQUksZUFBZSxHQUFZLEtBQUssQ0FBQztBQUNyQyxJQUFJLFNBQVMsR0FBVyxNQUFNLENBQUM7QUFDL0IsSUFBSSxTQUFTLEdBQVcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ25DLElBQUksTUFBTSxHQUFXLENBQUMsQ0FBQztBQUN2QixJQUFJLFlBQVksR0FBRyxDQUFDLENBQUM7QUFFckIsU0FBUztBQUNULElBQUksV0FBVyxHQUFvQixFQUFFLENBQUM7QUFDdEMsSUFBSSxVQUFVLEdBQW9CLEVBQUUsQ0FBQTtBQUVwQyxnQ0FBZ0M7QUFDaEMsSUFBSSxPQUFPLEdBQUcsR0FBRyxDQUFDO0FBQ2xCLElB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Q0FBQyxFQUFFLENBQUMsSUFBSSxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRTtZQUMzRCxFQUFFLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQy9CO0tBQ0o7U0FBTTtRQUNILFFBQVEsRUFBRSxDQUFDO0tBQ2Q7QUFDTCxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbi8vIFByb2dyYW1tZXIncyBOYW1lOlxuLy8gUHJvZ3JhbSBOYW1lOlxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8qIFxuICogQ29weXJpZ2h0IDIwMTIsIDIwMTYsIDIwMTksIDIwMjAgQ2hlbmdcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqICAgICBodHRwczovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5pbXBvcnQge1xuICAgIG5ld0dRQW5pbWF0aW9uLFxuICAgIGNyZWF0ZUdyb3VwSW5QbGF5Z3JvdW5kLFxuICAgIGNyZWF0ZVNwcml0ZUluR3JvdXAsXG4gICAgc3ByaXRlR2V0WCxcbiAgICBzcHJpdGVHZXRZLFxuICAgIHNwcml0ZVNldFhZLFxuICAgIHNwcml0ZUdldFdpZHRoLFxuICAgIHNwcml0ZUdldEhlaWdodCxcbiAgICBQTEFZR1JPVU5EX0hFSUdIVCxcbiAgICBQTEFZR1JPVU5EX1dJRFRILFxuICAgIGdldEtleVN0YXRlLFxuICAgIHNwcml0ZVNldEFuaW1hdGlvbixcbiAgICBBTklNQVRJT05fSE9SSVpPTlRBTCxcbiAgICBmb3JFYWNoU3ByaXRlR3JvdXBDb2xsaXNpb25EbyxcbiAgICBjcmVhdGVUZXh0U3ByaXRlSW5Hcm91cCxcbiAgICBzcHJpdGUsXG4gICAgZ2V0TW91c2VCdXR0b24xXG59IGZyb20gXCIuL2xpYnMvbGliLWdxZ3VhcmRyYWlsLWV4cG9ydHMudHNcIjtcbmltcG9ydCAqIGFzIEZuIGZyb20gXCIuL2xpYnMvbGliLWdxZ3VhcmRyYWlsLWV4cG9ydHMudHNcIjtcbi8vIERvbid0IGVkaXQgdGhlIGltcG9ydCBsaW5lcyBhYm92ZSwgb3IgeW91IHdvbid0IGJlIGFibGUgdG8gd3JpdGUgeW91ciBwcm9ncmFtIVxuXG4vLyBBbHNvLCBkbyBub3QgdXNlIHRoZSBmb2xsb3dpbmcgdmFyaWFibGUgYW5kIGZ1bmN0aW9uIG5hbWVzIGluIHlvdXIgb3duIGNvZGUgYmVsb3c6XG4vLyAgICBzZXR1cCwgZHJhdywgRm5cbi8vIGFuZCB0aGUgb3RoZXIgaW1wb3J0ZWQgbmFtZXMgYWJvdmUuXG5cbi8vIFdyaXRlIHlvdXIgcHJvZ3JhbSBiZWxvdyB0aGlzIGxpbmU6XG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuaW1wb3J0IHsgUGxheWVyU3ByaXRlRGljdCwgUmVzcGF3bkRpY3QsIExlYWRlcmJvYXJkRGljdCB9IGZyb20gXCIuL3V0aWxzLnRzXCI7XG5cbi8vIEdsb2JhbCB2YXJzXG5kZWNsYXJlIHZhciAkOiBhbnk7XG52YXIgbGV2ZWxOdW1iZXI6IG51bWJlciA9IDI7XG52YXIgc3BhY2ViYXJEb3duQmVmb3JlOiBib29sZWFuID0gZmFsc2U7XG52YXIgbW91c2VEb3duQmVmb3JlOiBib29sZWFuID0gZmFsc2U7XG52YXIgZ2FtZVN0YXRlOiBzdHJpbmcgPSBcIm1lbnVcIjtcbnZhciBzdGFydFRpbWU6IG51bWJlciA9IERhdGUubm93KCk7XG52YXIgZGVhdGhzOiBudW1iZXIgPSAwO1xudmFyIHNjcm9sbEFtb3VudCA9IDA7XG5cbi8vIExldmVsc1xudmFyIGxldmVsQmxvY2tzOiBGbi5TcHJpdGVEaWN0W10gPSBbXTtcbnZhciBsZXZlbFRleHRzOiBGbi5TcHJpdGVEaWN0W10gPSBbXVxuXG4vLyBDYW1lcmEgYW5kIGNhbWVyYSBjb25zdHJhaW50c1xudmFyIHhPZmZzZXQgPSA3MDA7XG52YXIgeU9mZnNldCA9IDA7XG5jb25zdCBtaW5YID0gLTEyMDA7XG5jb25zdCBtYXhYID0gNzUwO1xuXG4vLyBDaGFuZ2UgaWYgeW91IHdhbnQgZXh0cmEgaW5mb1xuY29uc3QgZGVidWcgPSBmYWxzZTtcblxuLy8gUmVzcGF3biBwb2ludHNcbmNvbnN0IHNwYXduUG9pbnQ6IFJlc3Bhd25EaWN0ID0ge1xuICAgIDE6IFstMzUwLCA0MjJdLFxuICAgIDI6IFstMzUwLCA0MjJdLFxufVxuXG4vKiBUaGUgcGxheWVyIGlzIG1hZGUgdXAgb2YgMiBzcHJpdGVzOlxuICogMS4gdGhlIGludmlzaWJsZSBoaXRib3ggYW5kIDIuIHRoZSBhbmltYXRpb24gLyB2aXNpYmxlIHNwcml0ZS5cbiAqIFRoaXMgZGljdCBzdG9yZXMgdGhlIGRhdGEgcmVxdWlyZWQgZm9yIGJvdGgsIGluY2x1ZGluZyB2ZWxvY2l0eSBhbmQgYW5pbWF0aW9ucy5cbiAqL1xubGV0IHBsYXllckRhdGE6IFBsYXllclNwcml0ZURpY3QgPSB7XG4gICAgXCJoaXRib3hJZFwiOiBcInBsYXllckhpdGJveFwiLFxuICAgIFwiaGl0Ym94V2lkdGhcIjogMTMsXG4gICAgXCJoaXRib3hIZWlnaHRcIjogMzcsXG4gICAgXCJ4UG9zXCI6IHNwYXduUG9pbnRbbGV2ZWxOdW1iZXJdWzBdLFxuICAgIFwieVBvc1wiOiBzcGF3blBvaW50W2xldmVsTnVtYmVyXVsxXSxcbiAgICBcInhTcGVlZFwiOiAwLFxuICAgIFwieVNwZWVkXCI6IDAsXG4gICAgXCJncm91bmRDb2xsaWRpbmdcIjogdHJ1ZSxcbiAgICBcImNveW90ZVRpbWVcIjogNiwgLy8gU2V0IHRpbWVyIChwZXIgZnJhbWUpXG4gICAgXCJjb3lvdGVDb3VudGVyXCI6IDAsXG4gICAgXCJib29zdENvb2xkb3duXCI6IERhdGUubm93KCksXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBcInNwcml0ZUlkXCI6IFwicGxheWVyU3ByaXRlXCIsXG4gICAgXCJzcHJpdGVXaWR0aFwiOiA0MyxcbiAgICBcInNwcml0ZUhlaWdodFwiOiA1NSxcbiAgICBcImFuaW1TdGF0ZVwiOiBcImlkbGVcIixcbiAgICBcImxhc3REaXJlY3Rpb25cIjogMSwgLy8gU3RhcnQgbG9va2luZyBsZWZ0XG4gICAgXCJhbmltSGl0Ym94XCI6IG5ld0dRQW5pbWF0aW9uKFwiaW1nL3BsYXllci9oaXRib3gucG5nXCIpLFxuICAgIFwiYW5pbUlkbGVMZWZ0XCI6IG5ld0dRQW5pbWF0aW9uKFwiaW1nL3BsYXllci9pZGxlTGVmdC5wbmdcIiksXG4gICAgXCJhbmltSWRsZVJpZ2h0XCI6IG5ld0dRQW5pbWF0aW9uKFwiaW1nL3BsYXllci9pZGxlUmlnaHQucG5nXCIpLFxuICAgIFwiYW5pbUp1bXBMZWZ0XCI6IG5ld0dRQW5pbWF0aW9uKFwiaW1nL3BsYXllci9qdW1wTGVmdC5wbmdcIiksXG4gICAgXCJhbmltSnVtcFJpZ2h0XCI6IG5ld0dRQW5pbWF0aW9uKFwiaW1nL3BsYXllci9qdW1wUmlnaHQucG5nXCIpLFxuICAgIFwiYW5pbUp1bXBTdHJhaWdodFwiOiBuZXdHUUFuaW1hdGlvbihcImltZy9wbGF5ZXIvanVtcFN0cmFpZ2h0LnBuZ1wiKSxcbiAgICBcImFuaW1SdW5DeWNsZUxlZnRcIjogbmV3R1FBbmltYXRpb24oXCJpbWcvcGxheWVyL3J1bkN5Y2xlTGVmdC5wbmdcIiwgMTEsIDQzLCAyNSwgQU5JTUFUSU9OX0hPUklaT05UQUwpLFxuICAgIFwiYW5pbVJ1bkN5Y2xlUmlnaHRcIjogbmV3R1FBbmltYXRpb24oXCJpbWcvcGxheWVyL3J1bkN5Y2xlUmlnaHQucG5nXCIsIDExLCA0MywgMjUsIEFOSU1BVElPTl9IT1JJWk9OVEFMKSxcbn07XG5cbi8vIE1vcmUgcHJlbG9hZGVkIHN0dWZmXG5jb25zdCBzY3JlZW5zRm9yTWVudSA9IHtcbiAgICBcImlkXCI6IFwic2NyZWVuU3dpdGNoZXJcIixcbiAgICBcIm1lbnVTdGF0ZVwiOiBcIm1haW5NZW51XCIsXG4gICAgXCJtYWluTWVudVwiOiBuZXdHUUFuaW1hdGlvbihcImltZy9zY3JlZW5zL21haW5NZW51LnBuZ1wiKSxcbiAgICBcIm1haW5NZW51U2VsZWN0ZWRcIjogbmV3R1FBbmltYXRpb24oXCJpbWcvc2NyZWVucy9tYWluTWVudVNlbGVjdGVkLnBuZ1wiKSxcbiAgICBcIm1haW5NZW51U2VsZWN0ZWQyXCI6IG5ld0dRQW5pbWF0aW9uKFwiaW1nL3NjcmVlbnMvbWFpbk1lbnVTZWxlY3RlZDIucG5nXCIpLFxuICAgIFwibGVhZGVyYm9hcmRNZW51XCI6IG5ld0dRQW5pbWF0aW9uKFwiaW1nL3NjcmVlbnMvbGVhZGVyYm9hcmQucG5nXCIpLFxuICAgIFwibGVhZGVyYm9hcmRNZW51U2VsZWN0ZWRcIjogbmV3R1FBbmltYXRpb24oXCJpbWcvc2NyZWVucy9sZWFkZXJib2FyZFNlbGVjdGVkLnBuZ1wiKVxufVxuXG4vLyBTY29yZWJvYXJkLCBjb21lcyBzZXQgd2l0aCBqdXN0IG15IHNjb3JlXG5sZXQgbGVhZGVyYm9hcmQ6IExlYWRlcmJvYXJkRGljdCA9IHtcbiAgICBcIkpvaG5cIjogMzQwMTIzXG59XG5cbi8vIEdyb3Vwc1xuY29uc3QgYmFja2dyb3VuZEdyb3VwTmFtZTogc3RyaW5nID0gXCJiYWNrZ3JvdW5kR3JvdXBcIjtcbmNyZWF0ZUdyb3VwSW5QbGF5Z3JvdW5kKGJhY2tncm91bmRHcm91cE5hbWUpO1xuXG5jb25zdCBjb2xsaXNpb25Hcm91cE5hbWU6IHN0cmluZyA9IFwiY29sbGlzaW9uR3JvdXBcIjtcbmNyZWF0ZUdyb3VwSW5QbGF5Z3JvdW5kKGNvbGxpc2lvbkdyb3VwTmFtZSk7XG5cbmNvbnN0IHBsYXllckdyb3VwTmFtZTogc3RyaW5nID0gXCJwbGF5ZXJHcm91cFwiO1xuY3JlYXRlR3JvdXBJblBsYXlncm91bmQocGxheWVyR3JvdXBOYW1lKTtcblxuY29uc3QgdWlHcm91cE5hbWU6IHN0cmluZyA9IFwidWlHcm91cFwiO1xuY3JlYXRlR3JvdXBJblBsYXlncm91bmQodWlHcm91cE5hbWUpO1xuXG5jb25zdCB0ZXh0R3JvdXBOYW1lOiBzdHJpbmcgPSBcInRleHRHcm91cFwiO1xuY3JlYXRlR3JvdXBJblBsYXlncm91bmQodGV4dEdyb3VwTmFtZSk7XG5cbi8vIERpc2FibGUgcmlnaHQgY2xpY2sgbWVudSwgYmVjYXVzZSBJIHdhbnQgdG8gdXNlIHJpZ2h0IGNsaWNrIGZvciBjb250cm9sc1xuLy8kKGRvY3VtZW50KS5jb250ZXh0bWVudShmdW5jdGlvbiAoKSB7XG4vLyAgICByZXR1cm4gZmFsc2U7XG4vL30pO1xuXG4vLyBVdGlscyB0aGF0IHdvdWxkIG5vcnJtYWxseSBiZSBrZXB0IGluIGEgc2Vjb25kYXJ5IGZpbGVcbmNvbnN0IGxlcnAgPSBmdW5jdGlvbiAoYTogbnVtYmVyLCBiOiBudW1iZXIsIHQ6IG51bWJlcikge1xuICAgIHJldHVybiAoMSAtIHQpICogYSArIHQgKiBiO1xufVxuXG4vKlxuRm4uY3JlYXRlVGV4dElucHV0U3ByaXRlSW5Hcm91cCh0ZXh0R3JvdXBOYW1lLCBcImlucHV0ZmllbGRcIiwgMjAwLCA2MCwgMiwgMjAsIFBMQVlHUk9VTkRfV0lEVEggLyAyIC0gNzUsIFBMQVlHUk9VTkRfSEVJR0hUIC8gMiwgdGVzdClcbkZuLnNwcml0ZShcImlucHV0ZmllbGRcIikuY3NzKFwicmVzaXplXCIsIFwibm9uZVwiKTtcbkZuLnRleHRJbnB1dFNwcml0ZVNldFN0cmluZyhcImlucHV0ZmllbGRcIiwgXCJ0ZXN0XCIpO1xuKi9cblxuXG4vKlxuXG4vLyBUZXh0IGlucHV0IGJ1dCBjdXN0b20gaW5zdGVhZCBvZiAnY3JlYXRlVGV4dElucHV0U3ByaXRlSW5Hcm91cCcgKEkgbWlnaHQgYmUgbWFraW5nIGV4dHJhIHdvcmsgZm9yIG15c2VsZiBoZXJlLCBidXQgaXQncyBmdW4gdG8gZmlndXJlIG91dClcbkZuLmNyZWF0ZVRleHRTcHJpdGVJbkdyb3VwKHRleHRHcm91cE5hbWUsIFwiaW5wdXRmaWVsZFwiLCAyMDAsIDYwLCBQTEFZR1JPVU5EX1dJRFRIIC8gMiAtIDc1LCBQTEFZR1JPVU5EX0hFSUdIVCAvIDIpO1xuXG4vLyBXaHkgd29uJ3QgdGhpcyB3b3JrPyFcbiQoXCIjaW5wdXRmaWVsZFwiKS5jc3MoXCJiYWNrZ3JvdW5kLWNvbG9yXCIsIFwicmdiYSgwLCAwLCAwLCAwKVwiKTtcbiQoXCIjaW5wdXRmaWVsZFwiKS5hcHBlbmQoYDx0ZXh0YXJlYSBpZD1cImlucHV0ZmllbGQyXCIgcm93cz1cIjJcIiBjb2xzPVwiMjBcIj5Kb2huIERvZTwvdGV4dGFyZWE+YCk7XG4kKFwiI2lucHV0ZmllbGRcIikuYXBwZW5kKGA8YnV0dG9uIGlkPVwiYnV0dG9uSWRcIiB0eXBlPVwiYnV0dG9uXCI+QWRkIG1lIHRvIGxlYWRlcmJvYXJkITwvYnV0dG9uPmApO1xuXG4kKFwiI2lucHV0ZmllbGQyXCIpLmNzcyhcInJlc2l6ZVwiLCBcIm5vbmVcIik7XG5cbi8vQWxzbyB0aGlzXG5Gbi50ZXh0SW5wdXRTcHJpdGVTZXRIYW5kbGVyKFwiaW5wdXRmaWVsZFwiLCBpbnB1dEhhbmRsZXIpO1xuKi9cblxuLy8gU3RhcnQgU2NyZWVuIVxuY29uc3QgbWFpbk1lbnUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHNjcmVlbnNGb3JNZW51W1wibWVudVN0YXRlXCJdLmluY2x1ZGVzKFwibWFpblwiKSkge1xuICAgICAgICBtYWluU3RhdGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBsZWFkZXJib2FyZFN0YXRlKCk7XG4gICAgfVxufVxuXG5jb25zdCBtYWluU3RhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKEZuLmdldE1vdXNlWCgpIDwgMjc1ICYmIEZuLmdldE1vdXNlWSgpIDwgNzUpIHtcbiAgICAgICAgaWYgKHNjcmVlbnNGb3JNZW51W1wibWVudVN0YXRlXCJdICE9IFwibWFpbk1lbnVTZWxlY3RlZFwiKSB7XG4gICAgICAgICAgICBzY3JlZW5zRm9yTWVudVtcIm1lbnVTdGF0ZVwiXSA9IFwibWFpbk1lbnVTZWxlY3RlZFwiO1xuICAgICAgICAgICAgc3ByaXRlU2V0QW5pbWF0aW9uKHNjcmVlbnNGb3JNZW51W1wiaWRcIl0sIHNjcmVlbnNGb3JNZW51W1wibWFpbk1lbnVTZWxlY3RlZFwiXSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGdldE1vdXNlQnV0dG9uMSgpKSB7XG4gICAgICAgICAgICBpZiAobW91c2VEb3duQmVmb3JlKSByZXR1cm4gLy8gUmV2ZXJzZSBjaGVja1xuICAgICAgICAgICAgc2NyZWVuc0Zvck1lbnVbXCJtZW51U3RhdGVcIl0gPSBcImxlYWRlcmJvYXJkTWVudVwiO1xuICAgICAgICAgICAgc3ByaXRlU2V0QW5pbWF0aW9uKHNjcmVlbnNGb3JNZW51W1wiaWRcIl0sIHNjcmVlbnNGb3JNZW51W1wibGVhZGVyYm9hcmRNZW51XCJdKTtcbiAgICAgICAgICAgIG1vdXNlRG93bkJlZm9yZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKEZuLmdldE1vdXNlWCgpID4gMTY1ICYmIEZuLmdldE1vdXNlWCgpIDwgNDg1ICYmIEZuLmdldE1vdXNlWSgpID4gNDAwICYmIEZuLmdldE1vdXNlWSgpIDwgNDM1IHx8IGdldEtleVN0YXRlKDEzKSkge1xuICAgICAgICBpZiAoc2NyZWVuc0Zvck1lbnVbXCJtZW51U3RhdGVcIl0gIT0gXCJtYWluTWVudVNlbGVjdGVkMlwiKSB7XG4gICAgICAgICAgICBzY3JlZW5zRm9yTWVudVtcIm1lbnVTdGF0ZVwiXSA9IFwibWFpbk1lbnVTZWxlY3RlZDJcIjtcbiAgICAgICAgICAgIHNwcml0ZVNldEFuaW1hdGlvbihzY3JlZW5zRm9yTWVudVtcImlkXCJdLCBzY3JlZW5zRm9yTWVudVtcIm1haW5NZW51U2VsZWN0ZWQyXCJdKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZ2V0TW91c2VCdXR0b24xKCkgfHwgZ2V0S2V5U3RhdGUoMTMpKSB7XG4gICAgICAgICAgICBpZiAobW91c2VEb3duQmVmb3JlKSByZXR1cm4gLy8gUmV2ZXJzZSBjaGVja1xuICAgICAgICAgICAgc2NyZWVuc0Zvck1lbnVbXCJtZW51U3RhdGVcIl0gPSBcIlwiO1xuICAgICAgICAgICAgZ2FtZVN0YXRlID0gXCJwbGF5aW5nXCI7XG4gICAgICAgICAgICBzdGFydEdhbWUoKTtcbiAgICAgICAgICAgIG1vdXNlRG93bkJlZm9yZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoc2NyZWVuc0Zvck1lbnVbXCJtZW51U3RhdGVcIl0gIT0gXCJtYWluTWVudVwiKSB7XG4gICAgICAgICAgICBzY3JlZW5zRm9yTWVudVtcIm1lbnVTdGF0ZVwiXSA9IFwibWFpbk1lbnVcIjtcbiAgICAgICAgICAgIHNwcml0ZVNldEFuaW1hdGlvbihzY3JlZW5zRm9yTWVudVtcImlkXCJdLCBzY3JlZW5zRm9yTWVudVtcIm1haW5NZW51XCJdKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuY29uc3QgbGVhZGVyYm9hcmRTdGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIUZuLnNwcml0ZUV4aXN0cyhcInNjb3JlYm9hcmREaXNwbGF5VGltZXNcIikpIGxlYWRlcmJvYXJkTG9naWMoKTsgLy8gc28gaXQgZG9lcyBpdCBqdXN0IG9uY2VcbiAgICBpZiAoRm4uZ2V0TW91c2VYKCkgPiAyODAgJiYgRm4uZ2V0TW91c2VYKCkgPCAzNjAgJiYgRm4uZ2V0TW91c2VZKCkgPiA0MjAgJiYgRm4uZ2V0TW91c2VZKCkgPCA0NTUpIHtcbiAgICAgICAgaWYgKHNjcmVlbnNGb3JNZW51W1wibWVudVN0YXRlXCJdICE9IFwibGVhZGVyYm9hcmRNZW51U2VsZWN0ZWRcIikge1xuICAgICAgICAgICAgc2NyZWVuc0Zvck1lbnVbXCJtZW51U3RhdGVcIl0gPSBcImxlYWRlcmJvYXJkTWVudVNlbGVjdGVkXCI7XG4gICAgICAgICAgICBzcHJpdGVTZXRBbmltYXRpb24oc2NyZWVuc0Zvck1lbnVbXCJpZFwiXSwgc2NyZWVuc0Zvck1lbnVbXCJsZWFkZXJib2FyZE1lbnVTZWxlY3RlZFwiXSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGdldE1vdXNlQnV0dG9uMSgpKSB7XG4gICAgICAgICAgICBpZiAobW91c2VEb3duQmVmb3JlKSByZXR1cm4gLy8gUmV2ZXJzZSBjaGVja1xuICAgICAgICAgICAgc2NyZWVuc0Zvck1lbnVbXCJtZW51U3RhdGVcIl0gPSBcIm1haW5NZW51XCI7XG4gICAgICAgICAgICBGbi5yZW1vdmVTcHJpdGUoXCJzY29yZWJvYXJkRGlzcGxheVJhbmtzXCIpO1xuICAgICAgICAgICAgRm4ucmVtb3ZlU3ByaXRlKFwic2NvcmVib2FyZERpc3BsYXlUaW1lc1wiKTtcbiAgICAgICAgICAgIEZuLnJlbW92ZVNwcml0ZShcInNjb3JlYm9hcmREaXNwbGF5TmFtZXNcIik7XG4gICAgICAgICAgICBzcHJpdGVTZXRBbmltYXRpb24oc2NyZWVuc0Zvck1lbnVbXCJpZFwiXSwgc2NyZWVuc0Zvck1lbnVbXCJtYWluTWVudVwiXSk7XG4gICAgICAgICAgICBtb3VzZURvd25CZWZvcmUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHNjcmVlbnNGb3JNZW51W1wibWVudVN0YXRlXCJdICE9IFwibGVhZGVyYm9hcmRNZW51XCIpIHtcbiAgICAgICAgICAgIHNjcmVlbnNGb3JNZW51W1wibWVudVN0YXRlXCJdID0gXCJsZWFkZXJib2FyZE1lbnVcIjtcbiAgICAgICAgICAgIHNwcml0ZVNldEFuaW1hdGlvbihzY3JlZW5zRm9yTWVudVtcImlkXCJdLCBzY3JlZW5zRm9yTWVudVtcImxlYWRlcmJvYXJkTWVudVwiXSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8vIFRoaXMgYmFzaWNhbGx5IGp1c3QgZGlzcGxheXMgdGhlIGNvbnRlbnQgZnJvbSAnbGVhZGVyYm9hcmQnIGluIGEgcmVhZGFibGUgd2F5XG5jb25zdCBsZWFkZXJib2FyZExvZ2ljID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIFRoaXMgdXNlcyB0aGUgU2Nod2FydHppYW4gdHJhbnNmb3JtLCBiZWNhdXNlIHlvdSBjYW4ndCBzb3J0IGEgZGljdCAoYXQgbGVhc3QgdG8gbXkgdW5kZXJzdGFuZGluZylcbiAgICB2YXIgaXRlbXMgPSBPYmplY3Qua2V5cyhsZWFkZXJib2FyZCkubWFwKChrZXkpID0+IHsgcmV0dXJuIFtrZXksIGxlYWRlcmJvYXJkW2tleV1dIH0pO1xuICAgIGl0ZW1zLnNvcnQoKGZpcnN0LCBzZWNvbmQpID0+IHsgcmV0dXJuICtmaXJzdFsxXSAtICtzZWNvbmRbMV0gfSk7IC8vIFdoeSBhbSBJIGRvaW5nIHRoZSAnK3ggLSAreCc/ICpTb21ldGltZXMqIHRocm93cyByYW5kb20gZXJyb3IgKHRzKDIzNjIpKSBpZiBub3QgZG9uZSBsaWtlIHRoaXMuXG4gICAgdmFyIGtleXMgPSBpdGVtcy5tYXAoKGUpID0+IHsgcmV0dXJuIGVbMF0gfSk7XG5cbiAgICBjcmVhdGVUZXh0U3ByaXRlSW5Hcm91cCh0ZXh0R3JvdXBOYW1lLCBcInNjb3JlYm9hcmREaXNwbGF5UmFua3NcIiwgNDAwLCA1MDAsIFBMQVlHUk9VTkRfV0lEVEggLyAyIC0gMzkwLCBQTEFZR1JPVU5EX0hFSUdIVCAvIDIgLSA1MCk7XG4gICAgc3ByaXRlKFwic2NvcmVib2FyZERpc3BsYXlSYW5rc1wiKS5jc3MoXCJmb250LWZhbWlseVwiLCBcIlRhaG9tYVwiKS5jc3MoXCJmb250LXNpemVcIiwgXCIyMHB0XCIpLmNzcyhcInRleHQtYWxpZ25cIiwgXCJjZW50ZXJcIikuY3NzKFwiYmFja2dyb3VuZC1jb2xvclwiLCBcInJnYmEoMCwgMCwgMCwgMClcIikuY3NzKFwiY29sb3JcIiwgXCJyZ2JhKDYyLCAzNCwgNTgsIDEwMClcIik7XG5cbiAgICBjcmVhdGVUZXh0U3ByaXRlSW5Hcm91cCh0ZXh0R3JvdXBOYW1lLCBcInNjb3JlYm9hcmREaXNwbGF5VGltZXNcIiwgNDAwLCA1MDAsIFBMQVlHUk9VTkRfV0lEVEggLyAyIC0gMjAwLCBQTEFZR1JPVU5EX0hFSUdIVCAvIDIgLSA1MCk7XG4gICAgc3ByaXRlKFwic2NvcmVib2FyZERpc3BsYXlUaW1lc1wiKS5jc3MoXCJmb250LWZhbWlseVwiLCBcIlRhaG9tYVwiKS5jc3MoXCJmb250LXNpemVcIiwgXCIyMHB0XCIpLmNzcyhcInRleHQtYWxpZ25cIiwgXCJjZW50ZXJcIikuY3NzKFwiYmFja2dyb3VuZC1jb2xvclwiLCBcInJnYmEoMCwgMCwgMCwgMClcIikuY3NzKFwiY29sb3JcIiwgXCJyZ2JhKDYyLCAzNCwgNTgsIDEwMClcIik7XG5cbiAgICBjcmVhdGVUZXh0U3ByaXRlSW5Hcm91cCh0ZXh0R3JvdXBOYW1lLCBcInNjb3JlYm9hcmREaXNwbGF5TmFtZXNcIiwgNDAwLCA1MDAsIFBMQVlHUk9VTkRfV0lEVEggLyAyIC0gMTAsIFBMQVlHUk9VTkRfSEVJR0hUIC8gMiAtIDUwKTtcbiAgICBzcHJpdGUoXCJzY29yZWJvYXJkRGlzcGxheU5hbWVzXCIpLmNzcyhcImZvbnQtZmFtaWx5XCIsIFwiVGFob21hXCIpLmNzcyhcImZvbnQtc2l6ZVwiLCBcIjIwcHRcIikuY3NzKFwidGV4dC1hbGlnblwiLCBcImNlbnRlclwiKS5jc3MoXCJiYWNrZ3JvdW5kLWNvbG9yXCIsIFwicmdiYSgwLCAwLCAwLCAwKVwiKS5jc3MoXCJjb2xvclwiLCBcInJnYmEoNjIsIDM0LCA1OCwgMTAwKVwiKTtcblxuICAgIC8vIEZpcnN0IG1ha2UgYSBsaXN0IG9mIHRvcCA4XG4gICAgdmFyIFtkaXNwbGF5UmFua3MsIGRpc3BsYXlUaW1lcywgZGlzcGxheU5hbWVzXTogc3RyaW5nW10gPSBbXCJcIiwgXCJcIiwgXCJcIl07XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCA4OyBpKyspIHtcbiAgICAgICAgLy8gQnJlYWsgaWYgdGltZSBpcyBOYU5cbiAgICAgICAgbGV0IHBsYXllclRpbWUgPSBsZWFkZXJib2FyZFtrZXlzW2ldXTtcbiAgICAgICAgaWYgKCFwbGF5ZXJUaW1lKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE1ha2UgdGltZXMgcmVhZGFibGVcbiAgICAgICAgbGV0IGhvdXJzID0gTWF0aC5mbG9vcigocGxheWVyVGltZSAlICgxMDAwICogNjAgKiA2MCAqIDI0KSkgLyAoMTAwMCAqIDYwICogNjApKTtcbiAgICAgICAgbGV0IG1pbnV0ZXMgPSBNYXRoLmZsb29yKChwbGF5ZXJUaW1lICUgKDEwMDAgKiA2MCAqIDYwKSkgLyAoMTAwMCAqIDYwKSk7XG4gICAgICAgIGxldCBzZWNvbmRzID0gTWF0aC5mbG9vcigocGxheWVyVGltZSAlICgxMDAwICogNjApKSAvIDEwMDApO1xuICAgICAgICBsZXQgbWlsaXNlY29uZHMgPSAocGxheWVyVGltZSAvIDEwMDApLnRvRml4ZWQoMik7XG5cbiAgICAgICAgLy8gQWRkIHRvIGRpc3BsYXkgdmFyXG4gICAgICAgIGRpc3BsYXlUaW1lcyA9IGRpc3BsYXlUaW1lcyArIGAke2hvdXJzfToke21pbnV0ZXN9OiR7c2Vjb25kc30uJHttaWxpc2Vjb25kcy50b1N0cmluZygpLnNwbGl0KCcuJylbMV19YCArIFwiPGJyPlwiO1xuICAgICAgICBkaXNwbGF5TmFtZXMgPSBkaXNwbGF5TmFtZXMgKyBrZXlzW2ldICsgXCI8YnI+XCI7XG4gICAgICAgIGRpc3BsYXlSYW5rcyA9IGRpc3BsYXlSYW5rcyArIChpICsgMSkgKyBcIjxicj5cIjtcbiAgICB9XG5cbiAgICAvLyBEaXNwbGF5IHRoZSBkaXNwbGF5IHZhcnNcbiAgICBzcHJpdGUoXCJzY29yZWJvYXJkRGlzcGxheVJhbmtzXCIpLmh0bWwoZGlzcGxheVJhbmtzKTtcbiAgICBzcHJpdGUoXCJzY29yZWJvYXJkRGlzcGxheVRpbWVzXCIpLmh0bWwoZGlzcGxheU5hbWVzKTtcbiAgICBzcHJpdGUoXCJzY29yZWJvYXJkRGlzcGxheU5hbWVzXCIpLmh0bWwoZGlzcGxheVRpbWVzKTtcbn1cblxuZnVuY3Rpb24gaW5wdXRIYW5kbGVyKHRleHQ6IHN0cmluZykge1xuICAgIEZuLmNvbnNvbGVQcmludCh0ZXh0KVxuXG4gICAgaWYgKGxlYWRlcmJvYXJkW3RleHRdIHx8IHRleHQgPT0gJ0pvaG4gRG9lJykgcmV0dXJuOyAvLyBXaGVuIHlvdSBkb24ndCBoYXZlIC5pbmNsdWRlcywgeW91IGdvdHRhIGdldCBjcmVhdGl2ZSAoYW5kIHllcyBJIGtub3cgMCB3b24ndCB3b3JrLCBidXQgeW91IGNhbid0IGdldCBhIDAgc2VjIHRpbWUhKVxuICAgIGlmIChGbi5zcHJpdGVFeGlzdHMoXCJpbnB1dGZpZWxkXCIpKSB7XG4gICAgICAgIEZuLnJlbW92ZVNwcml0ZShcImlucHV0ZmllbGRcIilcbiAgICB9XG59XG5cbmxldCBzZXR1cCA9IGZ1bmN0aW9uICgpIHtcbiAgICBjcmVhdGVTcHJpdGVJbkdyb3VwKGJhY2tncm91bmRHcm91cE5hbWUsIHNjcmVlbnNGb3JNZW51W1wiaWRcIl0sIHNjcmVlbnNGb3JNZW51W1wibWFpbk1lbnVcIl0sIFBMQVlHUk9VTkRfV0lEVEgsIFBMQVlHUk9VTkRfSEVJR0hUKTtcbn07XG5cbmNvbnN0IG5ld0Jsb2NrID0gZnVuY3Rpb24gKHhQb3M6IG51bWJlciwgeVBvczogbnVtYmVyLCBibG9ja1NpemU6IHN0cmluZykge1xuICAgIHZhciB3aWR0aCA9IHBhcnNlSW50KGJsb2NrU2l6ZS5zcGxpdChcInhcIilbMF0pO1xuICAgIHZhciBoZWlnaHQgPSBwYXJzZUludChibG9ja1NpemUuc3BsaXQoXCJ4XCIpWzFdKTtcblxuICAgIHZhciBpID0gbGV2ZWxCbG9ja3MubGVuZ3RoOyAvLyBBdXRvLXVwZGF0aW5nIGluZGV4XG4gICAgdmFyIG5ld0Jsb2NrSW5mbzogRm4uU3ByaXRlRGljdCA9IHtcbiAgICAgICAgXCJpZFwiOiBcImJsb2NrXCIgKyBpLFxuICAgICAgICBcIndpZHRoXCI6IHdpZHRoLFxuICAgICAgICBcImhlaWdodFwiOiBoZWlnaHQsXG4gICAgICAgIFwieFBvc1wiOiB4UG9zLFxuICAgICAgICBcInlQb3NcIjogeVBvcyxcbiAgICAgICAgXCJ4U3BlZWRcIjogMCxcbiAgICAgICAgXCJ5U3BlZWRcIjogMCxcbiAgICAgICAgXCI2NDB4NjQwXCI6IG5ld0dRQW5pbWF0aW9uKFwiaW1nL2dyb3VuZC82NDB4NjQwLnBuZ1wiKSxcbiAgICAgICAgXCIyMHg0ODBcIjogbmV3R1FBbmltYXRpb24oXCJpbWcvZ3JvdW5kLzIweDQ4MC5wbmdcIiksXG4gICAgICAgIFwiMTAweDIwXCI6IG5ld0dRQW5pbWF0aW9uKFwiaW1nL2dyb3VuZC8xMDB4MjAucG5nXCIpLFxuICAgICAgICBcIjEwMHg2NDBcIjogbmV3R1FBbmltYXRpb24oXCJpbWcvZ3JvdW5kLzEwMHg2NDAucG5nXCIpXG4gICAgfTtcblxuICAgIGxldmVsQmxvY2tzW2ldID0gbmV3QmxvY2tJbmZvO1xuICAgIGNyZWF0ZVNwcml0ZUluR3JvdXAoY29sbGlzaW9uR3JvdXBOYW1lLCBuZXdCbG9ja0luZm9bXCJpZFwiXSwgbmV3QmxvY2tJbmZvW2Jsb2NrU2l6ZV0sIG5ld0Jsb2NrSW5mb1tcIndpZHRoXCJdLCBuZXdCbG9ja0luZm9bXCJoZWlnaHRcIl0sIG5ld0Jsb2NrSW5mb1tcInhQb3NcIl0sIG5ld0Jsb2NrSW5mb1tcInlQb3NcIl0pO1xufVxuXG4vLyBTdGFydCB0aW1lciBhbmQgYmVnaW5cbmNvbnN0IHN0YXJ0R2FtZSA9IGZ1bmN0aW9uICgpIHtcblxuICAgIC8vIFJlbW92ZSBtZW51XG4gICAgRm4ucmVtb3ZlU3ByaXRlKHNjcmVlbnNGb3JNZW51W1wiaWRcIl0pXG5cbiAgICAvLyBDb250cm9scyBndWlkZVxuICAgIGNyZWF0ZVNwcml0ZUluR3JvdXAodWlHcm91cE5hbWUsIFwiY29udHJvbHNcIiwgbmV3R1FBbmltYXRpb24oXCJpbWcvdWkvY29udHJvbHMucG5nXCIpLCAzMDYsIDMyNiwgUExBWUdST1VORF9XSURUSCAvIDIgLSAxNTMsIFBMQVlHUk9VTkRfSEVJR0hUIC8gMiAtIDE2MylcblxuICAgIC8vIFJlc2V0IHRoZSB0aW1lciBpbiBjYXNlIHRoZXkgc3RheWVkIG9uIHRoZSBtZW51IGZvciBhIHdoaWxlXG4gICAgc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcblxuICAgIC8vIFNldHVwIGxldmVsICMxXG4gICAgc2V0dXBMZXZlbCgpO1xuXG4gICAgLy8gU2hvdyB0aGUgZGVidWcgbWVudSB0aGluZyBJIHVzZVxuICAgIGlmIChkZWJ1ZykgY3JlYXRlVGV4dFNwcml0ZUluR3JvdXAodGV4dEdyb3VwTmFtZSwgXCJkZWJ1Z1Nob3duXCIsIDgwMCwgMzAsIDAsIDApO1xuXG4gICAgLy8gVGltZXJcbiAgICBjcmVhdGVUZXh0U3ByaXRlSW5Hcm91cCh0ZXh0R3JvdXBOYW1lLCBcInNwZWVkcnVuVGltZXJcIiwgMzAwLCA2MCwgMTAsIDEwKTtcbiAgICBzcHJpdGUoXCJzcGVlZHJ1blRpbWVyXCIpLmNzcyhcImZvbnQtZmFtaWx5XCIsIFwiVGFob21hXCIpLmNzcyhcImJhY2tncm91bmQtY29sb3JcIiwgXCJyZ2JhKDAsIDAsIDAsIDApXCIpLmNzcyhcImZvbnQtc2l6ZVwiLCBcIjIwcHRcIik7XG5cbiAgICAvLyBQbGF5ZXIgU3ByaXRlIGFuZCBIaXRib3hcbiAgICBjcmVhdGVTcHJpdGVJbkdyb3VwKHBsYXllckdyb3VwTmFtZSwgcGxheWVyRGF0YVtcInNwcml0ZUlkXCJdLCBwbGF5ZXJEYXRhW1wiYW5pbUp1bXBTdHJhaWdodFwiXSwgcGxheWVyRGF0YVtcInNwcml0ZVdpZHRoXCJdLCBwbGF5ZXJEYXRhW1wic3ByaXRlSGVpZ2h0XCJdLCBwbGF5ZXJEYXRhW1wieFBvc1wiXSwgcGxheWVyRGF0YVtcInlQb3NcIl0pO1xuICAgIGNyZWF0ZVNwcml0ZUluR3JvdXAocGxheWVyR3JvdXBOYW1lLCBwbGF5ZXJEYXRhW1wiaGl0Ym94SWRcIl0sIHBsYXllckRhdGFbXCJhbmltSGl0Ym94XCJdLCBwbGF5ZXJEYXRhW1wiaGl0Ym94V2lkdGhcIl0sIHBsYXllckRhdGFbXCJoaXRib3hIZWlnaHRcIl0sIHBsYXllckRhdGFbXCJ4UG9zXCJdLCBwbGF5ZXJEYXRhW1wieVBvc1wiXSk7XG5cbiAgICAvLyBCYWNrZ3JvdW5kXG4gICAgY3JlYXRlU3ByaXRlSW5Hcm91cChiYWNrZ3JvdW5kR3JvdXBOYW1lLCBcImJhY2tncm91bmRJbWFnZVwiLCBuZXdHUUFuaW1hdGlvbihcImltZy9ncm91bmQvYmFja2dyb3VuZC5wbmdcIiksIFBMQVlHUk9VTkRfV0lEVEgsIFBMQVlHUk9VTkRfSEVJR0hULCAwLCAwKTtcblxuICAgIC8vIENyZWF0ZSAyIHdhdmVzOiB3YXZlMSBhbmQgd2F2ZTJcbiAgICBjcmVhdGVTcHJpdGVJbkdyb3VwKGJhY2tncm91bmRHcm91cE5hbWUsIFwid2F2ZTFcIiwgbmV3R1FBbmltYXRpb24oXCJpbWcvZ3JvdW5kL3dhdmUucG5nXCIpLCBQTEFZR1JPVU5EX1dJRFRIICogNSwgUExBWUdST1VORF9IRUlHSFQsIDAsIDApO1xuICAgIGNyZWF0ZVNwcml0ZUluR3JvdXAoYmFja2dyb3VuZEdyb3VwTmFtZSwgXCJ3YXZlMlwiLCBuZXdHUUFuaW1hdGlvbihcImltZy9ncm91bmQvd2F2ZTIucG5nXCIpLCBQTEFZR1JPVU5EX1dJRFRIICogNSwgUExBWUdST1VORF9IRUlHSFQsIDAsIDApO1xufVxuXG5cbmNvbnN0IHNldHVwTGV2ZWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gUmVtb3ZlIG9sZCBsZXZlbCAoYml0IG9mIGFuIG9kZCB3YXkgdG8gZG8gaXQsIGJ1dCBJIGNhbid0IHNlZW0gdG8gbG9vcCBvdmVyIGFsbCBlbGVtZW50cyBvZiBhIGdyb3VwKVxuICAgIGlmIChsZXZlbE51bWJlciAhPSAxKSB7XG4gICAgICAgIC8vIERlbGV0ZSBvbGQgc3ByaXRlc1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxldmVsQmxvY2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoRm4uc3ByaXRlRXhpc3RzKGxldmVsQmxvY2tzW2ldW1wiaWRcIl0pKSB7XG4gICAgICAgICAgICAgICAgRm4ucmVtb3ZlU3ByaXRlKGxldmVsQmxvY2tzW2ldW1wiaWRcIl0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICB9O1xuICAgICAgICBsZXZlbEJsb2NrcyA9IFtdO1xuICAgICAgICBsZXZlbFRleHRzID0gW107XG4gICAgfTtcblxuICAgIC8vIFNldCB1cCBuZXcgbGV2ZWxcbiAgICBzd2l0Y2ggKGxldmVsTnVtYmVyKSB7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIG5ld0Jsb2NrKC03NTAsIFBMQVlHUk9VTkRfSEVJR0hUIC0gMjAsIFwiNjQweDY0MFwiKTtcbiAgICAgICAgICAgIG5ld0Jsb2NrKDAsIFBMQVlHUk9VTkRfSEVJR0hUIC0gNjAsIFwiMjB4NDgwXCIpO1xuICAgICAgICAgICAgbmV3QmxvY2soMTM1LCBQTEFZR1JPVU5EX0hFSUdIVCAtIDgwLCBcIjEwMHg2NDBcIik7XG4gICAgICAgICAgICBuZXdCbG9jaygzNTAsIFBMQVlHUk9VTkRfSEVJR0hUIC0gNjAsIFwiMjB4NDgwXCIpO1xuICAgICAgICAgICAgbmV3QmxvY2soNTAwLCBQTEFZR1JPVU5EX0hFSUdIVCAtIDEwMCwgXCIxMDB4NjQwXCIpO1xuICAgICAgICAgICAgbmV3QmxvY2soNTAwLCBQTEFZR1JPVU5EX0hFSUdIVCAtIDIwMCwgXCIxMDB4MjBcIik7XG4gICAgICAgICAgICBuZXdCbG9jayg2OTAsIFBMQVlHUk9VTkRfSEVJR0hUIC0gMjQwLCBcIjEwMHgyMFwiKTtcbiAgICAgICAgICAgIG5ld0Jsb2NrKDg2MCwgUExBWUdST1VORF9IRUlHSFQgLSAzMDAsIFwiMTAweDIwXCIpO1xuICAgICAgICAgICAgbmV3QmxvY2soMTA1MCwgUExBWUdST1VORF9IRUlHSFQgLSAzNTAsIFwiMTAweDY0MFwiKTtcbiAgICAgICAgICAgIG5ld0Jsb2NrKDEyMDAsIDEwMCAtIFBMQVlHUk9VTkRfSEVJR0hULCBcIjEwMHg2NDBcIik7XG4gICAgICAgICAgICBuZXdCbG9jaygxNDAwLCBQTEFZR1JPVU5EX0hFSUdIVCAtIDIwLCBcIjY0MHg2NDBcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgbmV3QmxvY2soLTc1MCwgUExBWUdST1VORF9IRUlHSFQgLSAyMCwgXCI2NDB4NjQwXCIpO1xuICAgICAgICAgICAgbmV3QmxvY2soLTEwLCBQTEFZR1JPVU5EX0hFSUdIVCAtIDYwLCBcIjIweDQ4MFwiKTtcbiAgICAgICAgICAgIG5ld0Jsb2NrKDkwLCBQTEFZR1JPVU5EX0hFSUdIVCAtIDEwMCwgXCIyMHg0ODBcIik7XG4gICAgICAgICAgICBuZXdCbG9jaygxOTAsIFBMQVlHUk9VTkRfSEVJR0hUIC0gMTQwLCBcIjIweDQ4MFwiKTtcbiAgICAgICAgICAgIG5ld0Jsb2NrKDM5MCwgUExBWUdST1VORF9IRUlHSFQgLSAxNDAsIFwiMjB4NDgwXCIpO1xuICAgICAgICAgICAgbmV3QmxvY2soNzAwLCBQTEFZR1JPVU5EX0hFSUdIVCAtIDEwMCwgXCIyMHg0ODBcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzOlxuXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0OlxuXG4gICAgICAgICAgICBzcHJpdGUoXCJncm91bmRTcHJpdGU0XCIpLmh0bWwoXCJVc2UgeW91ciBib29zdCB3aXNlbHkuXCIpLmNzcyhcImZvbnQtZmFtaWx5XCIsIFwiVGFob21hXCIpLmNzcyhcImJhY2tncm91bmQtY29sb3JcIiwgXCJyZ2JhKDAsIDAsIDAsIDApXCIpLmNzcyhcImZvbnQtc2l6ZVwiLCBcIjE1cHRcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA1OlxuXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy8gUGFzc1xuICAgIH07XG59XG5cbmNvbnN0IHJlc3Bhd25QbGF5ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgcGxheWVyRGF0YVtcInlTcGVlZFwiXSA9IDAsIHBsYXllckRhdGFbXCJ4U3BlZWRcIl0gPSAwO1xuICAgIHBsYXllckRhdGFbXCJ4UG9zXCJdID0gc3Bhd25Qb2ludFtsZXZlbE51bWJlcl1bMF0sIHBsYXllckRhdGFbXCJ5UG9zXCJdID0gc3Bhd25Qb2ludFtsZXZlbE51bWJlcl1bMV07XG59XG5cbmNvbnN0IHBsYXllckFuaW1hdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBTZWNvbmQgc3ByaXRlIHRoYXQgZm9sbG93cyB0aGUgaW52aXNpYmxlIGhpdGJveCBmb3IgYW5pbWF0aW9uc1xuICAgIHNwcml0ZVNldFhZKFwicGxheWVyU3ByaXRlXCIsIHNwcml0ZUdldFgocGxheWVyRGF0YVtcImhpdGJveElkXCJdKSAtIHNwcml0ZUdldFdpZHRoKFwicGxheWVyU3ByaXRlXCIpIC8gMywgc3ByaXRlR2V0WShwbGF5ZXJEYXRhW1wiaGl0Ym94SWRcIl0pIC0gc3ByaXRlR2V0SGVpZ2h0KHBsYXllckRhdGFbXCJoaXRib3hJZFwiXSkgLyAyICsgMik7XG5cbiAgICB2YXIgY29sbGlkaW5nID0gcGxheWVyRGF0YVtcImdyb3VuZENvbGxpZGluZ1wiXTtcbiAgICB2YXIgc3BlZWQgPSBwbGF5ZXJEYXRhW1wieFNwZWVkXCJdO1xuXG4gICAgaWYgKGNvbGxpZGluZykgeyAvLyBPbiBncm91bmQgYW5pbXNcbiAgICAgICAgaWYgKHNwZWVkIDwgMSAmJiBzcGVlZCA+IC0xKSB7XG4gICAgICAgICAgICBpZiAocGxheWVyRGF0YVtcImFuaW1TdGF0ZVwiXSAhPSBcImlkbGVcIikge1xuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXJEYXRhW1wibGFzdERpcmVjdGlvblwiXSA9PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHNwcml0ZVNldEFuaW1hdGlvbihwbGF5ZXJEYXRhW1wic3ByaXRlSWRcIl0sIHBsYXllckRhdGFbXCJhbmltSWRsZUxlZnRcIl0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNwcml0ZVNldEFuaW1hdGlvbihwbGF5ZXJEYXRhW1wic3ByaXRlSWRcIl0sIHBsYXllckRhdGFbXCJhbmltSWRsZVJpZ2h0XCJdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcGxheWVyRGF0YVtcImFuaW1TdGF0ZVwiXSA9IFwiaWRsZVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHNwZWVkID4gMSkge1xuICAgICAgICAgICAgaWYgKHBsYXllckRhdGFbXCJhbmltU3RhdGVcIl0gIT0gXCJydW5SaWdodFwiKSB7XG4gICAgICAgICAgICAgICAgc3ByaXRlU2V0QW5pbWF0aW9uKHBsYXllckRhdGFbXCJzcHJpdGVJZFwiXSwgcGxheWVyRGF0YVtcImFuaW1SdW5DeWNsZVJpZ2h0XCJdKTtcbiAgICAgICAgICAgICAgICBwbGF5ZXJEYXRhW1wiYW5pbVN0YXRlXCJdID0gXCJydW5SaWdodFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGxheWVyRGF0YVtcImxhc3REaXJlY3Rpb25cIl0gPSAxO1xuICAgICAgICB9IGVsc2UgaWYgKHNwZWVkIDwgLTEpIHtcbiAgICAgICAgICAgIGlmIChwbGF5ZXJEYXRhW1wiYW5pbVN0YXRlXCJdICE9IFwicnVuTGVmdFwiKSB7XG4gICAgICAgICAgICAgICAgc3ByaXRlU2V0QW5pbWF0aW9uKHBsYXllckRhdGFbXCJzcHJpdGVJZFwiXSwgcGxheWVyRGF0YVtcImFuaW1SdW5DeWNsZUxlZnRcIl0pO1xuICAgICAgICAgICAgICAgIHBsYXllckRhdGFbXCJhbmltU3RhdGVcIl0gPSBcInJ1bkxlZnRcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBsYXllckRhdGFbXCJsYXN0RGlyZWN0aW9uXCJdID0gLTE7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoc3BlZWQgPCAwLjUgJiYgc3BlZWQgPiAtMC41KSB7XG4gICAgICAgICAgICBpZiAocGxheWVyRGF0YVtcImFuaW1TdGF0ZVwiXSAhPSBcImp1bXBTdHJhaWdodFwiKSB7XG4gICAgICAgICAgICAgICAgc3ByaXRlU2V0QW5pbWF0aW9uKHBsYXllckRhdGFbXCJzcHJpdGVJZFwiXSwgcGxheWVyRGF0YVtcImFuaW1KdW1wU3RyYWlnaHRcIl0pO1xuICAgICAgICAgICAgICAgIHBsYXllckRhdGFbXCJhbmltU3RhdGVcIl0gPSBcImp1bXBTdHJhaWdodFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHNwZWVkID4gMC41KSB7XG4gICAgICAgICAgICBpZiAocGxheWVyRGF0YVtcImFuaW1TdGF0ZVwiXSAhPSBcImp1bXBSaWdodFwiKSB7XG4gICAgICAgICAgICAgICAgc3ByaXRlU2V0QW5pbWF0aW9uKHBsYXllckRhdGFbXCJzcHJpdGVJZFwiXSwgcGxheWVyRGF0YVtcImFuaW1KdW1wUmlnaHRcIl0pO1xuICAgICAgICAgICAgICAgIHBsYXllckRhdGFbXCJhbmltU3RhdGVcIl0gPSBcImp1bXBSaWdodFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHNwZWVkIDwgLTAuNSkge1xuICAgICAgICAgICAgaWYgKHBsYXllckRhdGFbXCJhbmltU3RhdGVcIl0gIT0gXCJqdW1wTGVmdFwiKSB7XG4gICAgICAgICAgICAgICAgc3ByaXRlU2V0QW5pbWF0aW9uKHBsYXllckRhdGFbXCJzcHJpdGVJZFwiXSwgcGxheWVyRGF0YVtcImFuaW1KdW1wTGVmdFwiXSk7XG4gICAgICAgICAgICAgICAgcGxheWVyRGF0YVtcImFuaW1TdGF0ZVwiXSA9IFwianVtcExlZnRcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuY29uc3QgaGFuZGxlQ29sbGlzaW9ucyA9IGZ1bmN0aW9uIChjb2xsSW5kZXg6IG51bWJlciwgaGl0U3ByaXRlOiBvYmplY3QpIHtcbiAgICAvLyBTZWUgaG93IHRoZSBwbGF5ZXIgaXMgY29sbGlkaW5nXG4gICAgbGV0IGdyb3VuZFNwcml0ZTogRm4uU3ByaXRlRGljdCA9IGxldmVsQmxvY2tzWzBdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGV2ZWxCbG9ja3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGxldmVsQmxvY2tzW2ldW1wiaWRcIl0gPT0gRm4uc3ByaXRlSWQoaGl0U3ByaXRlKSkge1xuICAgICAgICAgICAgZ3JvdW5kU3ByaXRlID0gbGV2ZWxCbG9ja3NbaV07XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbiAgICB2YXIgY29sbGlzaW9uTm9ybWFsID0gRm4uc3ByaXRlSGl0RGlyZWN0aW9uKGdyb3VuZFNwcml0ZVtcImlkXCJdLCBncm91bmRTcHJpdGVbXCJ4UG9zXCJdLCBncm91bmRTcHJpdGVbXCJ5UG9zXCJdLCAwLCAwLCBncm91bmRTcHJpdGVbXCJ3aWR0aFwiXSwgZ3JvdW5kU3ByaXRlW1wiaGVpZ2h0XCJdLCBwbGF5ZXJEYXRhW1wiaGl0Ym94SWRcIl0sIHBsYXllckRhdGFbXCJ4UG9zXCJdLCBwbGF5ZXJEYXRhW1wieVBvc1wiXSwgcGxheWVyRGF0YVtcInhTcGVlZFwiXSwgcGxheWVyRGF0YVtcInlTcGVlZFwiXSwgMTMsIDM3KVxuXG4gICAgLy8gVW4tY29sbGlkZSB0aGUgcGxheWVyXG4gICAgaWYgKGNvbGxpc2lvbk5vcm1hbFtcInJpZ2h0XCJdKSB7XG4gICAgICAgIHBsYXllckRhdGFbXCJ4U3BlZWRcIl0gPSAwO1xuICAgICAgICBsZXQgYW1vdW50SW50b1dhbGwgPSAocGxheWVyRGF0YVtcInhQb3NcIl0gKyBwbGF5ZXJEYXRhW1wiaGl0Ym94V2lkdGhcIl0pIC0gZ3JvdW5kU3ByaXRlW1wieFBvc1wiXTtcbiAgICAgICAgaWYgKGFtb3VudEludG9XYWxsID4gMCkgcGxheWVyRGF0YVtcInhQb3NcIl0gPSBwbGF5ZXJEYXRhW1wieFBvc1wiXSAtIChhbW91bnRJbnRvV2FsbCk7XG5cbiAgICB9IGVsc2UgaWYgKGNvbGxpc2lvbk5vcm1hbFtcImxlZnRcIl0pIHtcbiAgICAgICAgcGxheWVyRGF0YVtcInhTcGVlZFwiXSA9IDA7XG4gICAgICAgIGxldCBhbW91bnRJbnRvV2FsbCA9IHBsYXllckRhdGFbXCJ4UG9zXCJdIC0gKGdyb3VuZFNwcml0ZVtcInhQb3NcIl0gKyBncm91bmRTcHJpdGVbXCJ3aWR0aFwiXSk7XG4gICAgICAgIGlmIChhbW91bnRJbnRvV2FsbCA8IDApIHBsYXllckRhdGFbXCJ4UG9zXCJdID0gcGxheWVyRGF0YVtcInhQb3NcIl0gLSAoYW1vdW50SW50b1dhbGwpO1xuICAgIH1cbiAgICBpZiAoY29sbGlzaW9uTm9ybWFsW1wiZG93blwiXSkge1xuICAgICAgICBwbGF5ZXJEYXRhW1wiZ3JvdW5kQ29sbGlkaW5nXCJdID0gdHJ1ZTtcbiAgICAgICAgcGxheWVyRGF0YVtcInlTcGVlZFwiXSA9IDA7XG4gICAgICAgIGxldCBhbW91bnRVbmRlckdyb3VuZCA9IChwbGF5ZXJEYXRhW1wieVBvc1wiXSArIHBsYXllckRhdGFbXCJoaXRib3hIZWlnaHRcIl0pIC0gZ3JvdW5kU3ByaXRlW1wieVBvc1wiXTtcbiAgICAgICAgaWYgKGFtb3VudFVuZGVyR3JvdW5kID4gMCkgcGxheWVyRGF0YVtcInlQb3NcIl0gPSBwbGF5ZXJEYXRhW1wieVBvc1wiXSAtIChhbW91bnRVbmRlckdyb3VuZCk7XG4gICAgfSBlbHNlIGlmIChjb2xsaXNpb25Ob3JtYWxbXCJ1cFwiXSkge1xuICAgICAgICBwbGF5ZXJEYXRhW1wiZ3JvdW5kQ29sbGlkaW5nXCJdID0gZmFsc2U7XG4gICAgICAgIHBsYXllckRhdGFbXCJ5U3BlZWRcIl0gPSAwO1xuICAgICAgICBsZXQgYW1vdW50T3Zlckdyb3VuZCA9IHBsYXllckRhdGFbXCJ5UG9zXCJdIC0gKGdyb3VuZFNwcml0ZVtcInlQb3NcIl0gKyBncm91bmRTcHJpdGVbXCJoZWlnaHRcIl0pO1xuICAgICAgICBpZiAoYW1vdW50T3Zlckdyb3VuZCA+IDApIHBsYXllckRhdGFbXCJ5UG9zXCJdID0gcGxheWVyRGF0YVtcInlQb3NcIl0gLSAoYW1vdW50T3Zlckdyb3VuZCk7XG4gICAgfVxufVxuXG5jb25zdCBwbGF5ZXJNb3ZlbWVudCA9IGZ1bmN0aW9uICgpIHsgLy8gVGhpcyBpcyBleGNsdXNpdmVseSBmb3IgdGhlIHBsYXllciwgc28gd2UgZG9uJ3QgbmVlZCBhIHNwcml0ZURhdGEgYXJnXG4gICAgLy8gVGFob21hIGlzIGEgQ1NTIFdlYiBTYWZlIEZvbnQhXG4gICAgaWYgKGRlYnVnKSBzcHJpdGUoXCJkZWJ1Z1Nob3duXCIpLmh0bWwoYE9mZnNldDogJHt4T2Zmc2V0fSB8IFBsYXllciBYOiAke3BsYXllckRhdGFbXCJ4UG9zXCJdLnRvUHJlY2lzaW9uKDMpfSB8IFBsYXllciBZOiAke3BsYXllckRhdGFbXCJ5UG9zXCJdLnRvUHJlY2lzaW9uKDMpfSB8IFBsYXllciBZIFNwZWVkOiAke3BsYXllckRhdGFbXCJ5U3BlZWRcIl0udG9QcmVjaXNpb24oMyl9IHwgUGxheWVyIFggU3BlZWQ6ICR7cGxheWVyRGF0YVtcInhTcGVlZFwiXS50b1ByZWNpc2lvbigzKX1gKS5jc3MoXCJmb250LWZhbWlseVwiLCBcIlRhaG9tYVwiKS5jc3MoXCJiYWNrZ3JvdW5kLWNvbG9yXCIsIFwicmdiYSgwLCAwLCAwLCAwKVwiKTtcblxuICAgIC8vIEtleXM6IGEgPSA2NSBhbmQgZCA9IDY4XG4gICAgaWYgKGdldEtleVN0YXRlKDY4KSkgcGxheWVyRGF0YVtcInhTcGVlZFwiXSA9IHBsYXllckRhdGFbXCJ4U3BlZWRcIl0gKyAyLjU7XG4gICAgaWYgKGdldEtleVN0YXRlKDY1KSkgcGxheWVyRGF0YVtcInhTcGVlZFwiXSA9IHBsYXllckRhdGFbXCJ4U3BlZWRcIl0gLSAyLjU7XG4gICAgaWYgKGdldEtleVN0YXRlKDY4KSAmJiBnZXRLZXlTdGF0ZSg2NSkpIHBsYXllckRhdGFbXCJ4U3BlZWRcIl0gPSAwO1xuICAgIGlmIChwbGF5ZXJEYXRhW1wieFNwZWVkXCJdICE9IDApIHBsYXllckRhdGFbXCJ4U3BlZWRcIl0gPSBwbGF5ZXJEYXRhW1wieFNwZWVkXCJdICogMC43O1xuICAgIGlmICgocGxheWVyRGF0YVtcInhTcGVlZFwiXSAtICgtMC4wMDEpKSAqIChwbGF5ZXJEYXRhW1wieFNwZWVkXCJdIC0gKDAuMDAxKSkgPD0gMCkgcGxheWVyRGF0YVtcInhTcGVlZFwiXSA9IDA7IC8vIGlmICMgaW4gcmFuZ2UgLTAuMDAxIHRvIDAuMDAxLCBqdXN0IG1ha2UgaXQgMFxuXG5cbiAgICAvLyBUaGUgcGxheWVyRGF0YVtcImdyb3VuZENvbGxpZGluZ1wiXSB3aWxsIGJlIGZhbHNlIGluIGFpciwgdHJ1ZSBvbiBncm91bmQgLSBidXQgbm90IGJlZm9yZSB0aGVzZSB0d28gbGluZXMhXG4gICAgcGxheWVyRGF0YVtcImdyb3VuZENvbGxpZGluZ1wiXSA9IGZhbHNlO1xuICAgIGZvckVhY2hTcHJpdGVHcm91cENvbGxpc2lvbkRvKHBsYXllckRhdGFbXCJoaXRib3hJZFwiXSwgXCJjb2xsaXNpb25Hcm91cFwiLCBoYW5kbGVDb2xsaXNpb25zKTtcblxuICAgIC8vIElmIGluIGFpciB2cyBncm91bmRcbiAgICBpZiAocGxheWVyRGF0YVtcInlTcGVlZFwiXSA8IDEwMCAmJiAhcGxheWVyRGF0YVtcImdyb3VuZENvbGxpZGluZ1wiXSkge1xuICAgICAgICBwbGF5ZXJEYXRhW1wieVNwZWVkXCJdKys7XG4gICAgICAgIGlmIChwbGF5ZXJEYXRhW1wiY295b3RlQ291bnRlclwiXSA+IDApIHBsYXllckRhdGFbXCJjb3lvdGVDb3VudGVyXCJdLS07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcGxheWVyRGF0YVtcImNveW90ZUNvdW50ZXJcIl0gPSBwbGF5ZXJEYXRhW1wiY295b3RlVGltZVwiXTtcbiAgICB9XG5cbiAgICAvLyBJbiBjYXNlIHlvdSBkb24ndCBrbm93IHdoYXQgY295b3RlIHRpbWUgaXM6IFRoZSBwbGF5ZXIgY2FuIHN0aWxsIGp1bXAgYSBmZXcgZnJhbWVzIGFmdGVyIGdvaW5nIG92ZXIgdGhlIGVkZ2Ugb2YgYSBwbGF0Zm9ybS5cbiAgICBpZiAocGxheWVyRGF0YVtcImNveW90ZUNvdW50ZXJcIl0gPiAwICYmIChnZXRLZXlTdGF0ZSg4NykpKSB7IC8vIEtleXM6IDg3ID0gd1xuICAgICAgICBwbGF5ZXJEYXRhW1wiY295b3RlQ291bnRlclwiXSA9IDA7XG4gICAgICAgIHBsYXllckRhdGFbXCJ5U3BlZWRcIl0gPSAtMTU7XG4gICAgfVxuXG4gICAgLy8gQm9vc3RcbiAgICBpZiAoZ2V0S2V5U3RhdGUoMzIpICYmIERhdGUubm93KCkgLSBwbGF5ZXJEYXRhW1wiYm9vc3RDb29sZG93blwiXSA+IDEwMDApIHsgLy8gS2V5czogMzIgPSBzcGFjZVxuICAgICAgICBpZiAocGxheWVyRGF0YVtcInhTcGVlZFwiXSkgeyAvLyBDYW4gcmV0dXJuIE5hTiBzb21ldGltZXMsIHNvLi4uXG4gICAgICAgICAgICBwbGF5ZXJEYXRhW1wieFNwZWVkXCJdID0gNDAgKiAocGxheWVyRGF0YVtcInhTcGVlZFwiXSAvIE1hdGguYWJzKHBsYXllckRhdGFbXCJ4U3BlZWRcIl0pKTsgIC8vIFRoaXMganVzdCBzZXRzIHRoZSBzcGVlZCB0byBlaXRoZXIgLTQwIG9yIDQwXG4gICAgICAgICAgICBwbGF5ZXJEYXRhW1wieVNwZWVkXCJdID0gLTM7XG4gICAgICAgICAgICBwbGF5ZXJEYXRhW1wiYm9vc3RDb29sZG93blwiXSA9IERhdGUubm93KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZXNldCBhZnRlciBmYWxsaW5nIGludG8gdGhlIHZvaWRcbiAgICBpZiAocGxheWVyRGF0YVtcInlQb3NcIl0gPiBQTEFZR1JPVU5EX0hFSUdIVCArIHBsYXllckRhdGFbXCJzcHJpdGVIZWlnaHRcIl0pIHtcbiAgICAgICAgZGVhdGhzKys7XG4gICAgICAgIHJlc3Bhd25QbGF5ZXIoKTtcbiAgICB9XG5cbiAgICAvLyBOZXh0IGxldmVsXG4gICAgaWYgKHBsYXllckRhdGFbXCJ4UG9zXCJdID4gMTg0MCAmJiBsZXZlbE51bWJlciA9PSAxKSB7XG4gICAgICAgIGxldmVsTnVtYmVyKys7XG4gICAgICAgIHhPZmZzZXQgPSA3NTA7XG4gICAgICAgIHJlc3Bhd25QbGF5ZXIoKTtcbiAgICAgICAgc2V0dXBMZXZlbCgpO1xuICAgIH1cblxuICAgIC8vIEJhc2ljIGxldmVsIGNvbnN0cmFpbnRcbiAgICBpZiAocGxheWVyRGF0YVtcInhQb3NcIl0gPCAtNzQwKSBwbGF5ZXJEYXRhW1wieFBvc1wiXSA9IC03NDA7XG5cbiAgICAvLyBBY3R1YWxseSBtb3ZlIHRoZSBwbGF5ZXJcbiAgICBwbGF5ZXJEYXRhW1wieFBvc1wiXSA9IHBsYXllckRhdGFbXCJ4UG9zXCJdICsgcGxheWVyRGF0YVtcInhTcGVlZFwiXTtcbiAgICBwbGF5ZXJEYXRhW1wieVBvc1wiXSA9IHBsYXllckRhdGFbXCJ5UG9zXCJdICsgcGxheWVyRGF0YVtcInlTcGVlZFwiXTtcbiAgICBzcHJpdGVTZXRYWShwbGF5ZXJEYXRhW1wiaGl0Ym94SWRcIl0sIHBsYXllckRhdGFbXCJ4UG9zXCJdICsgeE9mZnNldCwgcGxheWVyRGF0YVtcInlQb3NcIl0gKyB5T2Zmc2V0KTtcbn1cblxuY29uc3Qgc2hvd1RpbWVyID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIFRpbWUgY2FsY3VsYXRpb25zIGZvciBob3VycywgbWludXRlcyBhbmQgc2Vjb25kc1xuICAgIHZhciBkaXN0YW5jZSA9IChEYXRlLm5vdygpIC0gc3RhcnRUaW1lKVxuICAgIHZhciBob3VycyA9IE1hdGguZmxvb3IoKGRpc3RhbmNlICUgKDEwMDAgKiA2MCAqIDYwICogMjQpKSAvICgxMDAwICogNjAgKiA2MCkpO1xuICAgIHZhciBtaW51dGVzID0gTWF0aC5mbG9vcigoZGlzdGFuY2UgJSAoMTAwMCAqIDYwICogNjApKSAvICgxMDAwICogNjApKTtcbiAgICB2YXIgc2Vjb25kcyA9IE1hdGguZmxvb3IoKGRpc3RhbmNlICUgKDEwMDAgKiA2MCkpIC8gMTAwMCk7XG4gICAgdmFyIG1pbGlzZWNvbmRzID0gKGRpc3RhbmNlIC8gMTAwMCkudG9GaXhlZCgyKTtcblxuICAgIHNwcml0ZShcInNwZWVkcnVuVGltZXJcIikuaHRtbChgJHtob3Vyc306JHttaW51dGVzfToke3NlY29uZHN9LiR7bWlsaXNlY29uZHMudG9TdHJpbmcoKS5zcGxpdCgnLicpWzFdfWApO1xufVxuXG5jb25zdCBtb3ZlQmxvY2tzID0gZnVuY3Rpb24gKCkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGV2ZWxCbG9ja3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbGV0IGN1cnJlbnRCbG9jayA9IGxldmVsQmxvY2tzW2ldO1xuICAgICAgICBzcHJpdGVTZXRYWShjdXJyZW50QmxvY2tbXCJpZFwiXSwgY3VycmVudEJsb2NrW1wieFBvc1wiXSArIHhPZmZzZXQsIGN1cnJlbnRCbG9ja1tcInlQb3NcIl0gKyB5T2Zmc2V0KTtcbiAgICB9XG4gICAgc3ByaXRlU2V0WFkoXCJ3YXZlMVwiLCB4T2Zmc2V0IC8gNSAtIFBMQVlHUk9VTkRfV0lEVEgsIHlPZmZzZXQpXG4gICAgc3ByaXRlU2V0WFkoXCJ3YXZlMlwiLCB4T2Zmc2V0IC8gMTAgLSBQTEFZR1JPVU5EX1dJRFRILCB5T2Zmc2V0KVxufVxuXG5sZXQgZHJhdyA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBKdXN0IHNvIHdlIGNhbiBjaGVjayBpZiB0aGV5IGNsaWNrIHRoaXMgZnJhbWUhXG4gICAgaWYgKCFnZXRNb3VzZUJ1dHRvbjEoKSkgbW91c2VEb3duQmVmb3JlID0gZmFsc2U7XG5cbiAgICAvLyBHYW1lc3RhdGVzXG4gICAgaWYgKGdhbWVTdGF0ZSA9PSBcInBsYXlpbmdcIikge1xuICAgICAgICAvLyBDYW1lcmEgbW92ZW1lbnQsIENhbGN1bGF0ZSB0aGUgZGlzdGFuY2UgZnJvbSB0aGUgcGxheWVyIHRvIHRoZSBjZW50ZXIgb2YgdGhlIHNjcmVlblxuICAgICAgICB2YXIgcGxheWVyRGlzdFRvQ2VudGVyWCA9IHNwcml0ZUdldFgocGxheWVyRGF0YVtcImhpdGJveElkXCJdKSAtIFBMQVlHUk9VTkRfV0lEVEggLyAyO1xuICAgICAgICB2YXIgbGVycEZhY3RvciA9IDAuMTtcblxuICAgICAgICAvLyBGYW5jeSBzY3JvbGxpbmcgc28geW91IGNhbiBjaGVjayBvdXQgdGhlIGxldmVsIHdpdGggdGhlIGFycm93IGtleXNcbiAgICAgICAgaWYgKGdldEtleVN0YXRlKDM3KSkge1xuICAgICAgICAgICAgc2Nyb2xsQW1vdW50Kys7XG4gICAgICAgIH0gZWxzZSBpZiAoZ2V0S2V5U3RhdGUoMzkpKSB7XG4gICAgICAgICAgICBzY3JvbGxBbW91bnQtLTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNjcm9sbEFtb3VudCA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTbW9vdGggaW50ZXJwb2xhdGlvblxuICAgICAgICB4T2Zmc2V0ID0gbGVycCh4T2Zmc2V0LCBNYXRoLm1heChtaW5YLCBNYXRoLm1pbihtYXhYLCAoeE9mZnNldCArIC1wbGF5ZXJEaXN0VG9DZW50ZXJYICsgc2Nyb2xsQW1vdW50ICogMTApKSksIGxlcnBGYWN0b3IpO1xuXG4gICAgICAgIC8vIFBsYXllclxuICAgICAgICBwbGF5ZXJNb3ZlbWVudCgpO1xuICAgICAgICBwbGF5ZXJBbmltYXRpb24oKTtcbiAgICAgICAgbW92ZUJsb2NrcygpO1xuXG4gICAgICAgIC8vIFdlYXBvbnNcblxuICAgICAgICAvLyBMZXZlbFxuXG4gICAgICAgIC8vIFRpbWVyXG4gICAgICAgIHNob3dUaW1lcigpO1xuXG4gICAgICAgIC8vIEhvdy10by1wbGF5IG1lbnVcbiAgICAgICAgaWYgKEZuLnNwcml0ZUV4aXN0cyhcImNvbnRyb2xzXCIpICYmIChnZXRLZXlTdGF0ZSgzNykgfHwgZ2V0S2V5U3RhdGUoMzkpIHx8IGdldEtleVN0YXRlKDY4KVxuICAgICAgICAgICAgfHwgZ2V0S2V5U3RhdGUoNjUpIHx8IGdldEtleVN0YXRlKDg3KSB8fCBnZXRLZXlTdGF0ZSgzMikpKSB7XG4gICAgICAgICAgICBGbi5yZW1vdmVTcHJpdGUoXCJjb250cm9sc1wiKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIG1haW5NZW51KCk7XG4gICAgfVxufTtcblxuXG4vKlxuICAgICAgICBsZXQgYTtcbiAgICAgICAgd2hpbGUgKCFhIHx8IGEgPT0gXCJKb2huIERvZVwiKSBhID0gcHJvbXB0KFwiUGxlYXNlIGVudGVyIHlvdXIgbmFtZSBvciBpbnRpYWxzIHNvIHlvdSBjYW4gYmUgYWRkZWQgdG8gdGhlIGxlYWRlcmJvYXJkLlwiLCBcIkpvaG4gRG9lXCIpO1xuXG5cbiAgICAgICAgRm4uY29uc29sZVByaW50KGEpXG5cbiovXG5cblxuXG4vKlxuICAgIG1pc2M6XG4gICAgICAgICAgICBpZiAoIW1vdXNlRG93bkJlZm9yZSkge1xuICAgICAgICAgICAgRm4uY29uc29sZVByaW50KFwidGVzdFwiLCBtb3VzZURvd25CZWZvcmUpXG4gICAgICAgICAgICBwbGF5ZXJEYXRhW1wieFNwZWVkXCJdID0gNTAgKiBsYXN0RGlyZWN0aW9uO1xuICAgICAgICAgICAgY2hhcmdlVXAgPSAwO1xuICAgICAgICB9XG5cblxuXG4gICAgICAgIGlmIChnZXRNb3VzZUJ1dHRvbjEoKSkge1xuICAgICAgICAgICAgY2hhcmdlVXArKztcbiAgICAgICAgICAgIC8vd2FpdCB1bnRpbGwgaXQgZ29lcyBiYWNrIHVwXG4gICAgICAgICAgICBtb3VzZURvd25CZWZvcmUgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKG1vdXNlRG93bkJlZm9yZSkge1xuICAgICAgICAgICAgICAgIEZuLmNvbnNvbGVQcmludChcInJlbGVhc2VcIiwgY2hhcmdlVXApO1xuICAgICAgICAgICAgICAgIHBsYXllckRhdGFbXCJ4U3BlZWRcIl0gPSBjaGFyZ2VVcCAqIGxhc3REaXJlY3Rpb247XG4gICAgICAgICAgICAgICAgY2hhcmdlVXAgPSAxMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG1vdXNlRG93bkJlZm9yZSA9IGZhbHNlO1xuICAgICAgICB9XG4qL1xuXG4vKlxuICAgIGlmIChGbi5zcHJpdGVFeGlzdHMoc3dvcmREYXRhW1wiaWRcIl0pKSB7XG4gICAgICAgIHNwcml0ZVNldFhZKHN3b3JkRGF0YVtcImlkXCJdLCBwbGF5ZXJEYXRhW1wieFBvc1wiXSwgcGxheWVyRGF0YVtcInlQb3NcIl0gLSBwbGF5ZXJEYXRhW1wic3ByaXRlV2lkdGhcIl0gLyAyKTtcbiAgICAgICAgc3dvcmREYXRhW1wicm90YXRpb25cIl0gPSBzd29yZERhdGFbXCJyb3RhdGlvblwiXSArIDQwO1xuICAgICAgICBGbi5zcHJpdGVSb3RhdGUoc3dvcmREYXRhW1wiaWRcIl0sIHN3b3JkRGF0YVtcInJvdGF0aW9uXCJdKTtcbiAgICAgICAgaWYgKHN3b3JkRGF0YVtcInJvdGF0aW9uXCJdID4gMzYwKSB7XG4gICAgICAgICAgICBGbi5yZW1vdmVTcHJpdGUoc3dvcmREYXRhW1wiaWRcIl0pO1xuICAgICAgICAgICAgc3dvcmREYXRhW1wicm90YXRpb25cIl0gPSAwO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4qL1xuXG4vKlxuY3JlYXRlU3ByaXRlSW5Hcm91cCh3ZWFwb25Hcm91cE5hbWUsIHN3b3JkRGF0YVtcImlkXCJdLCBuZXdHUUFuaW1hdGlvbihcImltZy93ZWFwb25zL3N3b3JkLnBuZ1wiKSwgMTYsIDgwLCBwbGF5ZXJEYXRhW1wieFBvc1wiXSwgcGxheWVyRGF0YVtcInlQb3NcIl0gLSBwbGF5ZXJEYXRhW1wic3ByaXRlV2lkdGhcIl0gLyAyKTtcbiovXG5cblxuLypcbkknbGwgbmVlZCB0aGVzZSBmb3IgbGF0ZXJcblxuXG5Gbi5zYXZlRGljdGlvbmFyeUFzKClcbkZuLmdldFNhdmVkRGljdGlvbmFyeSgpXG5Gbi5kZWxldGVTYXZlZERpY3Rpb25hcnkoKVxuKi8iXX0=