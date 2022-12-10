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
import {
    newGQAnimation,
    createGroupInPlayground,
    createSpriteInGroup,
    spriteGetX,
    spriteGetY,
    spriteSetXY,
    spriteGetWidth,
    spriteGetHeight,
    PLAYGROUND_HEIGHT,
    PLAYGROUND_WIDTH,
    getKeyState,
    spriteSetAnimation,
    ANIMATION_HORIZONTAL,
    forEachSpriteGroupCollisionDo,
    createTextSpriteInGroup,
    sprite,
    getMouseButton1
} from "./libs/lib-gqguardrail-exports.ts";
import * as Fn from "./libs/lib-gqguardrail-exports.ts";
// Don't edit the import lines above, or you won't be able to write your program!

// Also, do not use the following variable and function names in your own code below:
//    setup, draw, Fn
// and the other imported names above.

// Write your program below this line:
// ***********************************
import { PlayerSpriteDict, RespawnDict, LeaderboardDict } from "./utils.ts";

let sample = {
    "test": 1
}

Fn.saveDictionaryAs("test", sample);
Fn.consolePrint(Fn.getSavedDictionary("test"));


// Global vars
declare var $: any;
var levelNumber: number = 2;
var spacebarDownBefore: boolean = false;
var mouseDownBefore: boolean = false;
var gameState: string = "menu";
var startTime: number = Date.now();
var deaths: number = 0;
var scrollAmount = 0;

// Levels
var levelBlocks: Fn.SpriteDict[] = [];
var levelTexts: Fn.SpriteDict[] = []

// Camera and camera constraints
var xOffset = 700;
var yOffset = 0;
const minX = -1200;
const maxX = 750;

// Change if you want extra info
const debug = false;

// Respawn points
const spawnPoint: RespawnDict = {
    1: [-350, 422],
    2: [-350, 422],
}

/* The player is made up of 2 sprites:
 * 1. the invisible hitbox and 2. the animation / visible sprite.
 * This dict stores the data required for both, including velocity and animations.
 */
let playerData: PlayerSpriteDict = {
    "hitboxId": "playerHitbox",
    "hitboxWidth": 13,
    "hitboxHeight": 37,
    "xPos": spawnPoint[levelNumber][0],
    "yPos": spawnPoint[levelNumber][1],
    "xSpeed": 0,
    "ySpeed": 0,
    "groundColliding": true,
    "coyoteTime": 6, // Set timer (per frame)
    "coyoteCounter": 0,
    "boostCooldown": Date.now(),
    //---------------------------
    "spriteId": "playerSprite",
    "spriteWidth": 43,
    "spriteHeight": 55,
    "animState": "idle",
    "lastDirection": 1, // Start looking left
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
}

// Scoreboard, comes set with just my score
let leaderboard: LeaderboardDict = {
    "John": 340123
}

// Groups
const backgroundGroupName: string = "backgroundGroup";
createGroupInPlayground(backgroundGroupName);

const collisionGroupName: string = "collisionGroup";
createGroupInPlayground(collisionGroupName);

const playerGroupName: string = "playerGroup";
createGroupInPlayground(playerGroupName);

const uiGroupName: string = "uiGroup";
createGroupInPlayground(uiGroupName);

const textGroupName: string = "textGroup";
createGroupInPlayground(textGroupName);

// Disable right click menu, because I want to use right click for controls
//$(document).contextmenu(function () {
//    return false;
//});

// Utils that would norrmally be kept in a secondary file
const lerp = function (a: number, b: number, t: number) {
    return (1 - t) * a + t * b;
}

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
    } else {
        leaderboardState();
    }
}

const mainState = function () {
    if (Fn.getMouseX() < 275 && Fn.getMouseY() < 75) {
        if (screensForMenu["menuState"] != "mainMenuSelected") {
            screensForMenu["menuState"] = "mainMenuSelected";
            spriteSetAnimation(screensForMenu["id"], screensForMenu["mainMenuSelected"]);
        }
        if (getMouseButton1()) {
            if (mouseDownBefore) return // Reverse check
            screensForMenu["menuState"] = "leaderboardMenu";
            spriteSetAnimation(screensForMenu["id"], screensForMenu["leaderboardMenu"]);
            mouseDownBefore = true;
        }
    } else if (Fn.getMouseX() > 165 && Fn.getMouseX() < 485 && Fn.getMouseY() > 400 && Fn.getMouseY() < 435 || getKeyState(13)) {
        if (screensForMenu["menuState"] != "mainMenuSelected2") {
            screensForMenu["menuState"] = "mainMenuSelected2";
            spriteSetAnimation(screensForMenu["id"], screensForMenu["mainMenuSelected2"]);
        }
        if (getMouseButton1() || getKeyState(13)) {
            if (mouseDownBefore) return // Reverse check
            screensForMenu["menuState"] = "";
            gameState = "playing";
            startGame();
            mouseDownBefore = true;
        }
    } else {
        if (screensForMenu["menuState"] != "mainMenu") {
            screensForMenu["menuState"] = "mainMenu";
            spriteSetAnimation(screensForMenu["id"], screensForMenu["mainMenu"]);
        }
    }
}

const leaderboardState = function () {
    if (!Fn.spriteExists("scoreboardDisplayTimes")) leaderboardLogic(); // so it does it just once
    if (Fn.getMouseX() > 280 && Fn.getMouseX() < 360 && Fn.getMouseY() > 420 && Fn.getMouseY() < 455) {
        if (screensForMenu["menuState"] != "leaderboardMenuSelected") {
            screensForMenu["menuState"] = "leaderboardMenuSelected";
            spriteSetAnimation(screensForMenu["id"], screensForMenu["leaderboardMenuSelected"]);
        }
        if (getMouseButton1()) {
            if (mouseDownBefore) return // Reverse check
            screensForMenu["menuState"] = "mainMenu";
            Fn.removeSprite("scoreboardDisplayRanks");
            Fn.removeSprite("scoreboardDisplayTimes");
            Fn.removeSprite("scoreboardDisplayNames");
            spriteSetAnimation(screensForMenu["id"], screensForMenu["mainMenu"]);
            mouseDownBefore = true;
        }
    } else {
        if (screensForMenu["menuState"] != "leaderboardMenu") {
            screensForMenu["menuState"] = "leaderboardMenu";
            spriteSetAnimation(screensForMenu["id"], screensForMenu["leaderboardMenu"]);
        }
    }
}

// This basically just displays the content from 'leaderboard' in a readable way
const leaderboardLogic = function () {
    // This uses the Schwartzian transform, because you can't sort a dict (at least to my understanding)
    var items = Object.keys(leaderboard).map((key) => { return [key, leaderboard[key]] });
    items.sort((first, second) => { return +first[1] - +second[1] }); // Why am I doing the '+x - +x'? *Sometimes* throws random error (ts(2362)) if not done like this.
    var keys = items.map((e) => { return e[0] });

    createTextSpriteInGroup(textGroupName, "scoreboardDisplayRanks", 400, 500, PLAYGROUND_WIDTH / 2 - 390, PLAYGROUND_HEIGHT / 2 - 50);
    sprite("scoreboardDisplayRanks").css("font-family", "Tahoma").css("font-size", "20pt").css("text-align", "center").css("background-color", "rgba(0, 0, 0, 0)").css("color", "rgba(62, 34, 58, 100)");

    createTextSpriteInGroup(textGroupName, "scoreboardDisplayTimes", 400, 500, PLAYGROUND_WIDTH / 2 - 200, PLAYGROUND_HEIGHT / 2 - 50);
    sprite("scoreboardDisplayTimes").css("font-family", "Tahoma").css("font-size", "20pt").css("text-align", "center").css("background-color", "rgba(0, 0, 0, 0)").css("color", "rgba(62, 34, 58, 100)");

    createTextSpriteInGroup(textGroupName, "scoreboardDisplayNames", 400, 500, PLAYGROUND_WIDTH / 2 - 10, PLAYGROUND_HEIGHT / 2 - 50);
    sprite("scoreboardDisplayNames").css("font-family", "Tahoma").css("font-size", "20pt").css("text-align", "center").css("background-color", "rgba(0, 0, 0, 0)").css("color", "rgba(62, 34, 58, 100)");

    // First make a list of top 8
    var [displayRanks, displayTimes, displayNames]: string[] = ["", "", ""];
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
}

function inputHandler(text: string) {
    Fn.consolePrint(text)

    if (leaderboard[text] || text == 'John Doe') return; // When you don't have .includes, you gotta get creative (and yes I know 0 won't work, but you can't get a 0 sec time!)
    if (Fn.spriteExists("inputfield")) {
        Fn.removeSprite("inputfield")
    }
}

let setup = function () {
    createSpriteInGroup(backgroundGroupName, screensForMenu["id"], screensForMenu["mainMenu"], PLAYGROUND_WIDTH, PLAYGROUND_HEIGHT);
};

const newBlock = function (xPos: number, yPos: number, blockSize: string) {
    var width = parseInt(blockSize.split("x")[0]);
    var height = parseInt(blockSize.split("x")[1]);

    var i = levelBlocks.length; // Auto-updating index
    var newBlockInfo: Fn.SpriteDict = {
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
}

// Start timer and begin
const startGame = function () {

    // Remove menu
    Fn.removeSprite(screensForMenu["id"])

    // Controls guide
    createSpriteInGroup(uiGroupName, "controls", newGQAnimation("img/ui/controls.png"), 306, 326, PLAYGROUND_WIDTH / 2 - 153, PLAYGROUND_HEIGHT / 2 - 163)

    // Reset the timer in case they stayed on the menu for a while
    startTime = Date.now();

    // Setup level #1
    setupLevel();

    // Show the debug menu thing I use
    if (debug) createTextSpriteInGroup(textGroupName, "debugShown", 800, 30, 0, 0);

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
}


const setupLevel = function () {
    // Remove old level (bit of an odd way to do it, but I can't seem to loop over all elements of a group)
    if (levelNumber != 1) {
        // Delete old sprites
        for (let i = 0; i < levelBlocks.length; i++) {
            if (Fn.spriteExists(levelBlocks[i]["id"])) {
                Fn.removeSprite(levelBlocks[i]["id"]);
            };

        };
        levelBlocks = [];
        levelTexts = [];
    };

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
    };
}

const respawnPlayer = function () {
    playerData["ySpeed"] = 0, playerData["xSpeed"] = 0;
    playerData["xPos"] = spawnPoint[levelNumber][0], playerData["yPos"] = spawnPoint[levelNumber][1];
}

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
                } else {
                    spriteSetAnimation(playerData["spriteId"], playerData["animIdleRight"]);
                }
                playerData["animState"] = "idle";
            }
        } else if (speed > 1) {
            if (playerData["animState"] != "runRight") {
                spriteSetAnimation(playerData["spriteId"], playerData["animRunCycleRight"]);
                playerData["animState"] = "runRight";
            }
            playerData["lastDirection"] = 1;
        } else if (speed < -1) {
            if (playerData["animState"] != "runLeft") {
                spriteSetAnimation(playerData["spriteId"], playerData["animRunCycleLeft"]);
                playerData["animState"] = "runLeft";
            }
            playerData["lastDirection"] = -1;
        }
    } else {
        if (speed < 0.5 && speed > -0.5) {
            if (playerData["animState"] != "jumpStraight") {
                spriteSetAnimation(playerData["spriteId"], playerData["animJumpStraight"]);
                playerData["animState"] = "jumpStraight";
            }
        } else if (speed > 0.5) {
            if (playerData["animState"] != "jumpRight") {
                spriteSetAnimation(playerData["spriteId"], playerData["animJumpRight"]);
                playerData["animState"] = "jumpRight";
            }
        } else if (speed < -0.5) {
            if (playerData["animState"] != "jumpLeft") {
                spriteSetAnimation(playerData["spriteId"], playerData["animJumpLeft"]);
                playerData["animState"] = "jumpLeft";
            }
        }
    }
}

const handleCollisions = function (collIndex: number, hitSprite: object) {
    // See how the player is colliding
    let groundSprite: Fn.SpriteDict = levelBlocks[0];
    for (let i = 0; i < levelBlocks.length; i++) {
        if (levelBlocks[i]["id"] == Fn.spriteId(hitSprite)) {
            groundSprite = levelBlocks[i];
            break;
        }
    }
    var collisionNormal = Fn.spriteHitDirection(groundSprite["id"], groundSprite["xPos"], groundSprite["yPos"], 0, 0, groundSprite["width"], groundSprite["height"], playerData["hitboxId"], playerData["xPos"], playerData["yPos"], playerData["xSpeed"], playerData["ySpeed"], 13, 37)

    // Un-collide the player
    if (collisionNormal["right"]) {
        playerData["xSpeed"] = 0;
        let amountIntoWall = (playerData["xPos"] + playerData["hitboxWidth"]) - groundSprite["xPos"];
        if (amountIntoWall > 0) playerData["xPos"] = playerData["xPos"] - (amountIntoWall);

    } else if (collisionNormal["left"]) {
        playerData["xSpeed"] = 0;
        let amountIntoWall = playerData["xPos"] - (groundSprite["xPos"] + groundSprite["width"]);
        if (amountIntoWall < 0) playerData["xPos"] = playerData["xPos"] - (amountIntoWall);
    }
    if (collisionNormal["down"]) {
        playerData["groundColliding"] = true;
        playerData["ySpeed"] = 0;
        let amountUnderGround = (playerData["yPos"] + playerData["hitboxHeight"]) - groundSprite["yPos"];
        if (amountUnderGround > 0) playerData["yPos"] = playerData["yPos"] - (amountUnderGround);
    } else if (collisionNormal["up"]) {
        playerData["groundColliding"] = false;
        playerData["ySpeed"] = 0;
        let amountOverGround = playerData["yPos"] - (groundSprite["yPos"] + groundSprite["height"]);
        if (amountOverGround > 0) playerData["yPos"] = playerData["yPos"] - (amountOverGround);
    }
}

const playerMovement = function () { // This is exclusively for the player, so we don't need a spriteData arg
    // Tahoma is a CSS Web Safe Font!
    if (debug) sprite("debugShown").html(`Offset: ${xOffset} | Player X: ${playerData["xPos"].toPrecision(3)} | Player Y: ${playerData["yPos"].toPrecision(3)} | Player Y Speed: ${playerData["ySpeed"].toPrecision(3)} | Player X Speed: ${playerData["xSpeed"].toPrecision(3)}`).css("font-family", "Tahoma").css("background-color", "rgba(0, 0, 0, 0)");

    // Keys: a = 65 and d = 68
    if (getKeyState(68)) playerData["xSpeed"] = playerData["xSpeed"] + 2.5;
    if (getKeyState(65)) playerData["xSpeed"] = playerData["xSpeed"] - 2.5;
    if (getKeyState(68) && getKeyState(65)) playerData["xSpeed"] = 0;
    if (playerData["xSpeed"] != 0) playerData["xSpeed"] = playerData["xSpeed"] * 0.7;
    if ((playerData["xSpeed"] - (-0.001)) * (playerData["xSpeed"] - (0.001)) <= 0) playerData["xSpeed"] = 0; // if # in range -0.001 to 0.001, just make it 0


    // The playerData["groundColliding"] will be false in air, true on ground - but not before these two lines!
    playerData["groundColliding"] = false;
    forEachSpriteGroupCollisionDo(playerData["hitboxId"], "collisionGroup", handleCollisions);

    // If in air vs ground
    if (playerData["ySpeed"] < 100 && !playerData["groundColliding"]) {
        playerData["ySpeed"]++;
        if (playerData["coyoteCounter"] > 0) playerData["coyoteCounter"]--;
    } else {
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
            playerData["xSpeed"] = 40 * (playerData["xSpeed"] / Math.abs(playerData["xSpeed"]));  // This just sets the speed to either -40 or 40
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
    if (playerData["xPos"] < -740) playerData["xPos"] = -740;

    // Actually move the player
    playerData["xPos"] = playerData["xPos"] + playerData["xSpeed"];
    playerData["yPos"] = playerData["yPos"] + playerData["ySpeed"];
    spriteSetXY(playerData["hitboxId"], playerData["xPos"] + xOffset, playerData["yPos"] + yOffset);
}

const showTimer = function () {
    // Time calculations for hours, minutes and seconds
    var distance = (Date.now() - startTime)
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
    var miliseconds = (distance / 1000).toFixed(2);

    sprite("speedrunTimer").html(`${hours}:${minutes}:${seconds}.${miliseconds.toString().split('.')[1]}`);
}

const moveBlocks = function () {
    for (let i = 0; i < levelBlocks.length; i++) {
        let currentBlock = levelBlocks[i];
        spriteSetXY(currentBlock["id"], currentBlock["xPos"] + xOffset, currentBlock["yPos"] + yOffset);
    }
    spriteSetXY("wave1", xOffset / 5 - PLAYGROUND_WIDTH, yOffset)
    spriteSetXY("wave2", xOffset / 10 - PLAYGROUND_WIDTH, yOffset)
}

let draw = function () {
    // Just so we can check if they click this frame!
    if (!getMouseButton1()) mouseDownBefore = false;

    // Gamestates
    if (gameState == "playing") {
        // Camera movement, Calculate the distance from the player to the center of the screen
        var playerDistToCenterX = spriteGetX(playerData["hitboxId"]) - PLAYGROUND_WIDTH / 2;
        var lerpFactor = 0.1;

        // Fancy scrolling so you can check out the level with the arrow keys
        if (getKeyState(37)) {
            scrollAmount++;
        } else if (getKeyState(39)) {
            scrollAmount--;
        } else {
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
    } else {
        mainMenu();
    }
};


/*
        let a;
        while (!a || a == "John Doe") a = prompt("Please enter your name or intials so you can be added to the leaderboard.", "John Doe");


        Fn.consolePrint(a)

*/



/*
    misc:
            if (!mouseDownBefore) {
            Fn.consolePrint("test", mouseDownBefore)
            playerData["xSpeed"] = 50 * lastDirection;
            chargeUp = 0;
        }



        if (getMouseButton1()) {
            chargeUp++;
            //wait untill it goes back up
            mouseDownBefore = true;
        } else {
            if (mouseDownBefore) {
                Fn.consolePrint("release", chargeUp);
                playerData["xSpeed"] = chargeUp * lastDirection;
                chargeUp = 10;
            }
            mouseDownBefore = false;
        }
*/

/*
    if (Fn.spriteExists(swordData["id"])) {
        spriteSetXY(swordData["id"], playerData["xPos"], playerData["yPos"] - playerData["spriteWidth"] / 2);
        swordData["rotation"] = swordData["rotation"] + 40;
        Fn.spriteRotate(swordData["id"], swordData["rotation"]);
        if (swordData["rotation"] > 360) {
            Fn.removeSprite(swordData["id"]);
            swordData["rotation"] = 0;
        }
        return;
    }
*/

/*
createSpriteInGroup(weaponGroupName, swordData["id"], newGQAnimation("img/weapons/sword.png"), 16, 80, playerData["xPos"], playerData["yPos"] - playerData["spriteWidth"] / 2);
*/


/*
I'll need these for later


Fn.saveDictionaryAs()
Fn.getSavedDictionary()
Fn.deleteSavedDictionary()
*/
