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
//import { newGQAnimation, createGroupInPlayground, createSpriteInGroup, spriteGetX, spriteGetY, spriteSetXY, spriteGetWidth, spriteGetHeight, PLAYGROUND_HEIGHT, PLAYGROUND_WIDTH, getKeyState, spriteSetAnimation, ANIMATION_HORIZONTAL, forEachSpriteGroupCollisionDo, sprite, getMouseButton1, getMouseX, getMouseY, spriteExists, removeSprite, consolePrint, spriteRotate, createRectInGroup, spriteId, spriteHitDirection, createTextSpriteInGroup, disableContextMenu, textInputSpriteSetHandler } from "./libs/lib-gqguardrail-exports.ts";
//import "./libs/lib-gqguardrail-exports.ts";
// Don't edit the import lines above, or you won't be able to write your program!
// Also, do not use the following variable and function names in your own code below:
//    setup, draw, Fn
// and the other imported names above.
// Write your program below this line:
// ***********************************
//import "./utils.ts";
const leaderboardCRUD = async (data) => {
    // Use fetch to send the data to the server
    const response = await fetch('/data', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const responseData = await response.json();
    const dataDB = await responseData;
    return await dataDB;
};
let levelNumber = 6;
let mouseDownBefore = false;
let gameState = "menu";
let startTime = Date.now();
let deaths = 0;
let scrollAmount = 0;
let waitTimer;
let finalTime = 10000000; // just in case of a bug, it's set really high
let pausedTime = 0;
let skipped = false;
let leaderBoardData = {
    "this won't be seen ever...": 340123,
};
// Levels
let levelBlocks = [];
// Camera and camera constraints
let xOffset = 669;
let yOffset = 0;
let minX = -1200;
const maxX = 750;
const lerpFactor = 0.1;
// Change if you want extra info
const debug = false;
// Groups
const backgroundGroupName = "backgroundGroup";
createGroupInPlayground(backgroundGroupName);
const collisionGroupName = "collisionGroup";
createGroupInPlayground(collisionGroupName);
const bounceGroupName = "bounceGroup";
createGroupInPlayground(bounceGroupName);
const playerGroupName = "playerGroup";
createGroupInPlayground(playerGroupName);
const enemyGroupName = "ememyGroup";
createGroupInPlayground(enemyGroupName);
const uiGroupName = "uiGroup";
createGroupInPlayground(uiGroupName);
const textGroupName = "textGroup";
createGroupInPlayground(textGroupName);
// Easy-Access Level Data
const spawnPoint = {
    1: [-350, 422],
    2: [-350, 422],
    3: [-350, 422],
    4: [-350, 422],
    5: [-350, 323],
    6: [-350, 422]
};
const level1Data = [
    { x: -750, y: PLAYGROUND_HEIGHT - 20, size: "640x640" },
    { x: 0, y: PLAYGROUND_HEIGHT - 60, size: "20x480" },
    { x: 135, y: PLAYGROUND_HEIGHT - 80, size: "100x640" },
    { x: 350, y: PLAYGROUND_HEIGHT - 60, size: "20x480" },
    { x: 500, y: PLAYGROUND_HEIGHT - 100, size: "100x640" },
    { x: 500, y: PLAYGROUND_HEIGHT - 200, size: "100x20" },
    { x: 690, y: PLAYGROUND_HEIGHT - 240, size: "100x20" },
    { x: 860, y: PLAYGROUND_HEIGHT - 300, size: "100x20" },
    { x: 1050, y: PLAYGROUND_HEIGHT - 350, size: "100x640" },
    { x: 1200, y: 100 - PLAYGROUND_HEIGHT, size: "100x640" },
    { x: 1400, y: PLAYGROUND_HEIGHT - 20, size: "640x640" }
];
/* Moving blocks!
 * Any block with a size that starts with 'MB' is a moving block
 * Input info:
 *   MB: 100x20 RG: 600,  1000, 0,    0    SP: 5,      0
 *   MB: sizeXY RG: minX, maxX, minY, maxY SP: xSpeed, ySpeed
 */
const level2Data = [
    { x: -750, y: PLAYGROUND_HEIGHT - 20, size: "640x640" },
    { x: -160, y: PLAYGROUND_HEIGHT - 48, size: "38x29" },
    { x: -40, y: PLAYGROUND_HEIGHT - 300, size: "100x640" },
    { x: 120, y: 250 - PLAYGROUND_HEIGHT, size: "100x640" },
    { x: 210, y: PLAYGROUND_HEIGHT - 28, size: "38x29" },
    { x: 400, y: PLAYGROUND_HEIGHT - 300, size: "100x640" },
    { x: 500, y: PLAYGROUND_HEIGHT - 200, size: "100x20" },
    { x: 600, y: PLAYGROUND_HEIGHT - 200, size: "MB: 100x20 RG: 600,1000,0,0 SP: 5,0" },
    { x: 1100, y: PLAYGROUND_HEIGHT - 300, size: "100x640" },
    { x: 1200, y: PLAYGROUND_HEIGHT - 200, size: "MB: 100x20 RG: 0,1000,200,460 SP: 0,5" },
    { x: 1300, y: 150 - PLAYGROUND_HEIGHT, size: "100x640" },
    { x: 1400, y: PLAYGROUND_HEIGHT - 200, size: "MB: 100x20 RG: 0,1000,200,460 SP: 0,5" },
    { x: 1500, y: PLAYGROUND_HEIGHT - 300, size: "100x640" },
    { x: 1600, y: PLAYGROUND_HEIGHT - 20, size: "640x640" },
];
const level3Data = [
    { x: -750, y: PLAYGROUND_HEIGHT - 20, size: "640x640" },
    { x: -10, y: PLAYGROUND_HEIGHT - 60, size: "20x480" },
    { x: 100, y: PLAYGROUND_HEIGHT - 200, size: "MB: 20x100 RG: -750,1000,200,360 SP: 0,5" },
    { x: 150, y: PLAYGROUND_HEIGHT - 60, size: "100x640" },
    { x: 150, y: 120 - PLAYGROUND_HEIGHT, size: "100x640" },
    { x: 300, y: PLAYGROUND_HEIGHT - 28, size: "38x29" },
    { x: 300, y: PLAYGROUND_HEIGHT - 300, size: "MB: 100x20 RG: 250,350,0,0 SP: 5,0" },
    { x: 400, y: PLAYGROUND_HEIGHT - 280, size: "20x480" },
    { x: 500, y: PLAYGROUND_HEIGHT - 200, size: "100x20" },
    { x: 900, y: PLAYGROUND_HEIGHT - 100, size: "100x20" },
    { x: 1200, y: PLAYGROUND_HEIGHT - 200, size: "100x20" },
    { x: 1400, y: PLAYGROUND_HEIGHT - 300, size: "100x20" },
    { x: 1600, y: PLAYGROUND_HEIGHT - 20, size: "640x640" },
];
const level4Data = [
    { x: -750, y: PLAYGROUND_HEIGHT - 20, size: "640x640" },
    { x: -10, y: PLAYGROUND_HEIGHT - 60, size: "20x480" },
    { x: 90, y: PLAYGROUND_HEIGHT - 100, size: "20x480" },
    { x: 190, y: PLAYGROUND_HEIGHT - 140, size: "20x480" },
    { x: 390, y: PLAYGROUND_HEIGHT - 140, size: "20x480" },
    { x: 700, y: PLAYGROUND_HEIGHT - 100, size: "20x480" },
    { x: 1000, y: PLAYGROUND_HEIGHT - 140, size: "20x480" },
    { x: 1200, y: PLAYGROUND_HEIGHT - 100, size: "20x480" },
    { x: 1500, y: PLAYGROUND_HEIGHT - 120, size: "640x640" }
];
const level5Data = [
    { x: -750, y: PLAYGROUND_HEIGHT - 120, size: "640x640" },
    { x: 100, y: PLAYGROUND_HEIGHT - 200, size: "MB: 20x100 RG: -750,1000,200,360 SP: 0,5" },
    { x: 300, y: PLAYGROUND_HEIGHT - 250, size: "MB: 20x100 RG: -750,1000,200,360 SP: 0,5" },
    { x: 500, y: PLAYGROUND_HEIGHT - 120, size: "100x640" },
    { x: 600, y: PLAYGROUND_HEIGHT - 28, size: "38x29" },
    { x: 900, y: PLAYGROUND_HEIGHT - 100, size: "100x20" },
    { x: 1200, y: PLAYGROUND_HEIGHT - 200, size: "100x20" },
    { x: 1300, y: 300 - PLAYGROUND_HEIGHT, size: "20x480" },
    { x: 1380, y: PLAYGROUND_HEIGHT - 28, size: "38x29" },
    { x: 1600, y: PLAYGROUND_HEIGHT - 200, size: "20x480" },
    { x: 1600, y: PLAYGROUND_HEIGHT - 20, size: "640x640" },
];
const level6Data = [
    { x: -750, y: PLAYGROUND_HEIGHT - 20, size: "640x640" },
    { x: -700, y: PLAYGROUND_HEIGHT - 250, size: "MB: 100x20 RG: -750,600,0,0 SP: 5,0" },
    { x: -110, y: PLAYGROUND_HEIGHT - 100, size: "100x640" },
    { x: -10, y: PLAYGROUND_HEIGHT - 20, size: "640x640" },
    { x: 110, y: PLAYGROUND_HEIGHT - 100, size: "100x640" },
    { x: 630, y: 0, size: "640x640" },
];
const levelData = {
    1: level1Data,
    2: level2Data,
    3: level3Data,
    4: level4Data,
    5: level5Data,
    6: level6Data
};
/* The player is made up of 2 sprites:
 * 1. the invisible hitbox, and
 * 2. the animation / visible sprite.
 * This dict stores all the data required for *both*, including velocity and animations.
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
// Boss fight
let droneData = {
    "id": "droneDataBoss",
    "health": 540 - 535,
    "width": 196,
    "height": 53,
    "xPos": 200,
    "yPos": 200,
    "xSpeed": 0,
    "ySpeed": 0,
    "yPeriod": 4000,
    "yAmplitude": 25,
    "attackState": "passive",
    "targetX": 0,
    "targetY": 0,
    "timer": Date.now(),
    "pauseOnGround": Date.now(),
    "droneFly": newGQAnimation("img/enemies/droneFly.png", 2, 196, 25, ANIMATION_HORIZONTAL),
};
var missiles = [];
var missleCount = 0;
// More preloaded stuff
const screensForMenu = {
    "id": "screenSwitcher",
    "menuState": "mainMenu",
    "mainMenu": newGQAnimation("img/screens/mainMenu.png"),
    "mainMenuSelected": newGQAnimation("img/screens/mainMenuSelected.png"),
    "mainMenuSelected2": newGQAnimation("img/screens/mainMenuSelected2.png"),
    "leaderboardMenu": newGQAnimation("img/screens/leaderboard.png"),
    "leaderboardMenuSelected": newGQAnimation("img/screens/leaderboardSelected.png"),
    "winScreen": newGQAnimation("img/screens/winScreen.png"),
    "winScreenSelected": newGQAnimation("img/screens/winScreenSelected.png")
};
const preloadedAssets = {
    "controls": newGQAnimation("img/ui/controls.png"),
    "bossControls": newGQAnimation("img/ui/boss.png"),
    "background": newGQAnimation("img/ground/background.png"),
    "input": newGQAnimation("img/screens/input.png"),
    "wave1": newGQAnimation("img/ground/wave.png"),
    "wave2": newGQAnimation("img/ground/wave2.png"),
    "640x640": newGQAnimation("img/ground/640x640.png"),
    "20x480": newGQAnimation("img/ground/20x480.png"),
    "100x20": newGQAnimation("img/ground/100x20.png"),
    "20x100": newGQAnimation("img/ground/20x100.png"),
    "100x640": newGQAnimation("img/ground/100x640.png"),
    "38x29": newGQAnimation("img/ground/38x29.png"),
    "pauseMenu": newGQAnimation("img/ui/pause.png"),
    "mainOverlay": newGQAnimation("img/ui/mainOverlay.png"),
    "bossOverlay": newGQAnimation("img/ui/bossOverlay.png"),
    "dronePredict": newGQAnimation("img/enemies/dronePredict.png")
};
// Utility functions
const lerp = (a, b, t) => (1 - t) * a + t * b;
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
// Disable right click context menu
disableContextMenu();
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
    if (getMouseX() < 275 && getMouseY() < 75) {
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
    else if (getMouseX() > 165 && getMouseX() < 485 && getMouseY() > 400 && getMouseY() < 435 || getKeyState(13)) {
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
    else if (getKeyState(80)) {
        skipped = true;
        levelNumber = 6;
        screensForMenu["menuState"] = "";
        gameState = "playing";
        startGame();
    }
    else {
        if (screensForMenu["menuState"] != "mainMenu") {
            screensForMenu["menuState"] = "mainMenu";
            spriteSetAnimation(screensForMenu["id"], screensForMenu["mainMenu"]);
        }
    }
};
const scoreSpriteNames = ["scoreboardDisplayRanks", "scoreboardDisplayTimes", "scoreboardDisplayNames"];
const leaderboardState = function () {
    if (!spriteExists("scoreboardDisplayTimes"))
        leaderboardLogic(); // so it does it just once
    if (getMouseX() > 280 && getMouseX() < 360 && getMouseY() > 420 && getMouseY() < 455) {
        if (screensForMenu["menuState"] != "leaderboardMenuSelected") {
            screensForMenu["menuState"] = "leaderboardMenuSelected";
            spriteSetAnimation(screensForMenu["id"], screensForMenu["leaderboardMenuSelected"]);
        }
        if (getMouseButton1()) {
            if (mouseDownBefore)
                return; // Reverse check
            screensForMenu["menuState"] = "mainMenu";
            scoreSpriteNames.forEach(sprite => removeSprite(sprite));
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
const leaderboardLogic = async () => {
    // Create sprites first so we can check if this func has already run
    createTextSpriteInGroup(textGroupName, "scoreboardDisplayRanks", 400, 500, PLAYGROUND_WIDTH / 2 - 390, PLAYGROUND_HEIGHT / 2 - 50);
    createTextSpriteInGroup(textGroupName, "scoreboardDisplayTimes", 400, 500, PLAYGROUND_WIDTH / 2 - 200, PLAYGROUND_HEIGHT / 2 - 50);
    createTextSpriteInGroup(textGroupName, "scoreboardDisplayNames", 400, 500, PLAYGROUND_WIDTH / 2 - 15, PLAYGROUND_HEIGHT / 2 - 50);
    scoreSpriteNames.forEach(spriteName => sprite(spriteName).css("font-family", "Tahoma").css("font-size", "20pt").css("text-align", "center").css("background-color", "rgba(0, 0, 0, 0)").css("color", "rgba(62, 34, 58, 100)"));
    // Set a loading sprite and await the database data
    sprite("scoreboardDisplayTimes").html("Loading Leaderboard...");
    try {
        leaderBoardData = await leaderboardCRUD({ "message": "checkDB" });
    }
    catch (error) {
        return sprite("scoreboardDisplayTimes").html("Load failed.");
    }
    // This uses the Schwartzian transform, because you can't sort a dict (at least to my understanding)
    var items = Object.keys(leaderBoardData).map((key) => { return [key, leaderBoardData[key]]; });
    items.sort((first, second) => { return +first[1] - +second[1]; }); // Why am I doing the '+x - +x'? *Sometimes* throws random error (ts(2362)) if not done like this.
    var keys = items.map((e) => { return e[0]; });
    // First make a list of top 8
    var [displayRanks, displayTimes, displayNames] = ["", "", ""];
    for (let i = 0; i < 8; i++) {
        // Break if time is NaN, AKA no more existing items on list
        let playerTime = leaderBoardData[keys[i]];
        if (!playerTime)
            break;
        // Add to display var
        displayTimes = displayTimes + `${new Date(playerTime).toISOString().slice(11, -1)}` + "<br>";
        displayNames = displayNames + keys[i] + "<br>";
        // Use a regular expression to extract the last digit of the number and append the appropriate ordinal suffix
        displayRanks = displayRanks + (i + 1).toString().replace(/\d+$/, (match) => {
            return match + (match === "1" ? "st" : match === "2" ? "nd" : match === "3" ? "rd" : "th");
        }) + "<br>";
    }
    // Display the display vars
    const values = [displayRanks, displayTimes, displayNames];
    scoreSpriteNames.forEach((spriteName, index) => { sprite(spriteName).html(values[index]); });
};
const winScreen = () => {
    if (getMouseX() > 100 && getMouseX() < 555 && getMouseY() > 400 && getMouseY() < 465 || getKeyState(13)) {
        if (screensForMenu["menuState"] != "winScreenSelected") {
            screensForMenu["menuState"] = "winScreenSelected";
            spriteSetAnimation(screensForMenu["id"], screensForMenu["winScreenSelected"]);
        }
        if (getMouseButton1() || getKeyState(13)) {
            createSpriteInGroup(uiGroupName, "overlaySprite", preloadedAssets["mainOverlay"], PLAYGROUND_WIDTH, PLAYGROUND_HEIGHT);
            if (mouseDownBefore)
                return;
            screensForMenu["menuState"] = "mainMenu";
            gameState = "menu";
            mouseDownBefore = true;
        }
    }
    else {
        if (screensForMenu["menuState"] != "winScreen") {
            screensForMenu["menuState"] = "winScreen";
            spriteSetAnimation(screensForMenu["id"], screensForMenu["winScreen"]);
        }
    }
};
let setup = function () {
    createSpriteInGroup(backgroundGroupName, screensForMenu["id"], screensForMenu["mainMenu"], PLAYGROUND_WIDTH, PLAYGROUND_HEIGHT);
    createSpriteInGroup(uiGroupName, "overlaySprite", preloadedAssets["mainOverlay"], PLAYGROUND_WIDTH, PLAYGROUND_HEIGHT);
};
const newBlock = function (xPos, yPos, blockSize) {
    if (blockSize.includes("MB")) {
        /* How moving platforms are handled. If the size includes 'MB' it is parsed differently, and has more values
         * Takes: "MB: 100x20 RG: 100,1000,0,0 SP: 5,0" Returns: ["100", "20", "100", "1000", "0", "0", "5", "0"]
         * Index Values:                                           0      1     2      3       4    5    6    7
         *  0 and 1-> width, height
         *  2 and 3 -> minXPos, maxXPos
         *  4 and 5 -> minYPos, maxYPos
         *  6 and 7 -> xSpeed, ySpeed
        */
        const specialVals = blockSize.match(/-?\d+/g);
        if (specialVals == null)
            return consolePrint("You made a mistake inputting values into a movingblock");
        var width = parseInt(specialVals[0]);
        var height = parseInt(specialVals[1]);
        var [minXPos, maxXPos] = [parseInt(specialVals[2]), parseInt(specialVals[3])];
        var [minYPos, maxYPos] = [parseInt(specialVals[4]), parseInt(specialVals[5])];
        var [xSpeed, ySpeed] = [parseInt(specialVals[6]), parseInt(specialVals[7])];
        blockSize = `${specialVals[0]}x${specialVals[1]}`;
    }
    else {
        var width = parseInt(blockSize.split("x")[0]);
        var height = parseInt(blockSize.split("x")[1]);
        var [minXPos, maxXPos] = [0, 0];
        var [minYPos, maxYPos] = [0, 0];
        var [xSpeed, ySpeed] = [0, 0];
    }
    var i = levelBlocks.length; // Auto-updating index
    var newBlockInfo = {
        "id": "block" + i,
        "width": width,
        "height": height,
        "xPos": xPos,
        "yPos": yPos,
        "xSpeed": xSpeed,
        "ySpeed": ySpeed,
        "minXPos": minXPos,
        "maxXPos": maxXPos,
        "minYPos": minYPos,
        "maxYPos": maxYPos,
        "640x640": preloadedAssets["640x640"],
        "20x480": preloadedAssets["20x480"],
        "100x20": preloadedAssets["100x20"],
        "20x100": preloadedAssets["20x100"],
        "100x640": preloadedAssets["100x640"],
        "38x29": preloadedAssets["38x29"]
    };
    levelBlocks[i] = newBlockInfo;
    createSpriteInGroup((blockSize == "38x29") ? bounceGroupName : collisionGroupName, newBlockInfo["id"], newBlockInfo[blockSize], newBlockInfo["width"], newBlockInfo["height"], newBlockInfo["xPos"] + xOffset, newBlockInfo["yPos"] + yOffset);
};
const spawnMissle = function (xPos, yPos) {
    // Instance the missile
    missleCount++;
    var missileInfo = {
        "id": "missile" + missleCount,
        "width": 24,
        "height": 14,
        "xPos": xPos,
        "yPos": yPos,
        "xSpeed": 0,
        "ySpeed": 0,
        "xTarget": playerData["xPos"],
        "yTarget": playerData["yPos"],
        "anim": newGQAnimation("img/enemies/missile.png")
    };
    missiles.push(missileInfo);
    createSpriteInGroup(enemyGroupName, missileInfo["id"], missileInfo["anim"], missileInfo["width"], missileInfo["height"], missileInfo["xPos"] + xOffset, missileInfo["yPos"] + yOffset);
    // Make the missile point towards its target
    var angle = Math.atan2(missileInfo["yTarget"] - missileInfo["yPos"], missileInfo["xTarget"] - missileInfo["xPos"]);
    // Convert the angle to degrees (degrees to radians)
    angle = angle * (180 / Math.PI);
    // Rotate the missile towards the player
    spriteRotate(missileInfo["id"], angle);
    // Calculate the velocity vector using trigonometry
    missileInfo["xSpeed"] = Math.cos(angle * (Math.PI / 180)) * 10;
    missileInfo["ySpeed"] = Math.sin(angle * (Math.PI / 180)) * 10;
};
// Start timer and begin
const startGame = function () {
    // Remove menu
    if (spriteExists(screensForMenu["id"]))
        removeSprite(screensForMenu["id"]);
    // Controls guide
    createSpriteInGroup(uiGroupName, "controls", preloadedAssets["controls"], 306, 326, PLAYGROUND_WIDTH / 2 - 153, PLAYGROUND_HEIGHT / 2 - 163);
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
    if (!spriteExists("backgroundImage"))
        createSpriteInGroup(backgroundGroupName, "backgroundImage", preloadedAssets["background"], PLAYGROUND_WIDTH, PLAYGROUND_HEIGHT, 0, 0);
    // Create 2 waves: wave1 and wave2
    createSpriteInGroup(backgroundGroupName, "wave1", preloadedAssets["wave1"], PLAYGROUND_WIDTH * 5, PLAYGROUND_HEIGHT, 0, 0);
    createSpriteInGroup(backgroundGroupName, "wave2", preloadedAssets["wave2"], PLAYGROUND_WIDTH * 5, PLAYGROUND_HEIGHT, 0, 0);
};
const setupLevel = function () {
    // Remove old level
    levelBlocks.forEach((block) => { removeSprite(block["id"]); });
    levelBlocks = [];
    // Set up new level
    const data = levelData[levelNumber];
    data.forEach(({ x, y, size }) => { newBlock(x, y, size); });
    // Special conditions for the boss fight!
    if (levelNumber == 6) {
        level6Setup();
    }
};
const level6Setup = () => {
    if (!spriteExists(droneData["id"])) {
        minX = 10;
        createRectInGroup(textGroupName, "healthBarMain", 52, 72, 540, 10, "#76B947", 0, 0, 0);
        createSpriteInGroup(enemyGroupName, droneData["id"], droneData["droneFly"], droneData["width"], droneData["height"], droneData["xPos"], droneData["yPos"]);
        spriteSetAnimation("overlaySprite", preloadedAssets["bossOverlay"]);
        createRectInGroup(textGroupName, "healthBarSecond", 50, 70, 544, 14, "#171717", 0, 0, 0);
        createRectInGroup(textGroupName, "healthBarBack", 52, 72, 540, 10, "#FF5C5C", 0, 0, 0);
        createTextSpriteInGroup(textGroupName, "bossBarText", 540, 50, 40, 40);
        sprite("bossBarText").css("font-family", "Tahoma").css("background-color", "rgba(0, 0, 0, 0)").css("font-size", "20pt").css("text-align", "center");
        sprite("bossBarText").html("Evil Inc: Dronie");
        createSpriteInGroup(uiGroupName, "bossControls", preloadedAssets["bossControls"], 307, 329, PLAYGROUND_WIDTH / 2 - 153, PLAYGROUND_HEIGHT / 2 - 163);
    }
    else {
        missiles.forEach(missile => { removeSprite(missile["id"]); });
        missiles = [];
        droneData["yPos"], droneData["xPos"] = 200, 200;
        spriteSetXY(droneData["id"], droneData["xPos"], droneData["yPos"]);
        droneData["health"] = 540;
        droneData["attackState"] = "passive";
        if (!spriteExists("bossControls"))
            createSpriteInGroup(uiGroupName, "bossControls", preloadedAssets["bossControls"], 307, 329, PLAYGROUND_WIDTH / 2 - 153, PLAYGROUND_HEIGHT / 2 - 163);
    }
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
    var groundSprite = levelBlocks.find(sprite => sprite["id"] === spriteId(hitSprite));
    var collisionNormal = spriteHitDirection(groundSprite["id"], groundSprite["xPos"], groundSprite["yPos"], groundSprite["xSpeed"], groundSprite["ySpeed"], groundSprite["width"], groundSprite["height"], playerData["hitboxId"], playerData["xPos"], playerData["yPos"], playerData["xSpeed"], playerData["ySpeed"], playerData['hitboxWidth'], playerData["hitboxHeight"]);
    // Un-collide the player
    switch (true) {
        case collisionNormal["right"]:
            playerData["xSpeed"] = 0;
            var amountOverlap = (playerData["xPos"] + playerData["hitboxWidth"]) - groundSprite["xPos"];
            if (amountOverlap > 0)
                playerData["xPos"] -= amountOverlap;
            break;
        case collisionNormal["left"]:
            playerData["xSpeed"] = 0;
            amountOverlap = playerData["xPos"] - (groundSprite["xPos"] + groundSprite["width"]);
            if (amountOverlap < 0)
                playerData["xPos"] -= amountOverlap;
            break;
        case collisionNormal["down"]:
            playerData["groundColliding"] = true;
            playerData["ySpeed"] = 0;
            amountOverlap = (playerData["yPos"] + playerData["hitboxHeight"]) - groundSprite["yPos"];
            if (amountOverlap > 0)
                playerData["yPos"] -= amountOverlap;
            if (Math.abs(groundSprite["xSpeed"]) > 0)
                playerData["xPos"] += groundSprite["xSpeed"];
            if (Math.abs(groundSprite["ySpeed"]) > 0)
                playerData["ySpeed"] += groundSprite["ySpeed"];
            break;
        case collisionNormal["up"]:
            playerData["groundColliding"] = false;
            playerData["ySpeed"] = 0;
            amountOverlap = playerData["yPos"] - (groundSprite["yPos"] + groundSprite["height"]);
            if (amountOverlap > 0)
                playerData["yPos"] -= amountOverlap;
            break;
    }
};
const playerMovement = function () {
    // Tahoma is a CSS Web Safe Font!
    if (debug)
        sprite("debugShown").html(`Offset: ${xOffset} | Player X: ${playerData["xPos"].toPrecision(3)} | Player Y: ${playerData["yPos"].toPrecision(3)} | Player Y Speed: ${playerData["ySpeed"].toPrecision(3)} | Player X Speed: ${playerData["xSpeed"].toPrecision(3)}`).css("font-family", "Tahoma").css("background-color", "rgba(0, 0, 0, 0)");
    // The playerData["groundColliding"] will be false in air, true on ground - but not before these two lines!
    playerData["groundColliding"] = false;
    forEachSpriteGroupCollisionDo(playerData["hitboxId"], collisionGroupName, handleCollisions);
    // Bouncepads / trampolines 
    forEachSpriteGroupCollisionDo(playerData["hitboxId"], bounceGroupName, () => { playerData["ySpeed"] = -25; });
    // Keys: a = 65 and d = 68
    if (getKeyState(68)) {
        playerData["xSpeed"] += 2.5;
    }
    if (getKeyState(65)) {
        playerData["xSpeed"] -= 2.5;
    }
    playerData["xSpeed"] *= 0.7;
    if (Math.abs(playerData["xSpeed"]) <= 0.001)
        playerData["xSpeed"] = 0;
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
    // Reset after falling into the void or touching an enemy
    var touchedEnemy = false;
    forEachSpriteGroupCollisionDo(playerData["hitboxId"], enemyGroupName, (collIndex, hitSprite) => {
        if (spriteId(hitSprite) == droneData["id"]) {
            var collisionNormal = spriteHitDirection(droneData["id"], droneData["xPos"], droneData["yPos"], droneData["xSpeed"], droneData["ySpeed"], droneData["width"], droneData["height"], playerData["hitboxId"], playerData["xPos"], playerData["yPos"], playerData["xSpeed"], playerData["ySpeed"], playerData['hitboxWidth'], playerData["hitboxHeight"]);
            if (collisionNormal["down"]) {
                playerData["ySpeed"] = -5;
                droneData["health"] -= 50;
                droneData["attackState"] = "return";
            }
            else if (collisionNormal["up"]) {
                touchedEnemy = true;
            }
        }
        else {
            touchedEnemy = true;
        }
    });
    if (playerData["yPos"] > PLAYGROUND_HEIGHT + playerData["spriteHeight"] || touchedEnemy) {
        [playerData["ySpeed"], playerData["xSpeed"]] = [0, 0];
        [playerData["xPos"], playerData["yPos"]] = [spawnPoint[levelNumber][0], spawnPoint[levelNumber][1]];
        setupLevel();
        deaths++;
    }
    // Next level
    if (playerData["xPos"] > 1840) {
        levelNumber++;
        xOffset = 750;
        playerData["xPos"] = spawnPoint[levelNumber][0];
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
const updateHealth = () => {
    let prevWidth = spriteGetWidth("healthBarMain");
    if (spriteExists("healthBarMain"))
        removeSprite("healthBarMain");
    prevWidth = lerp(prevWidth, droneData["health"], lerpFactor);
    createRectInGroup(textGroupName, "healthBarMain", 52, 72, prevWidth, 10, "#76B947", 0, 0, 0);
};
const droneDataAI = () => {
    // Die animation
    if (droneData["health"] <= 0) {
        gameState = "ended";
        finalTime = Date.now() - startTime;
        waitTimer = Date.now();
        if (spriteExists("dronePredict"))
            removeSprite("dronePredict");
    }
    // Drone "AI" is done with states.
    if (droneData["attackState"] == "passive") {
        droneMovement();
        if (Math.random() > 0.2) {
            droneData["attackState"] = "missiles";
        }
        if (spriteExists("dronePredict"))
            removeSprite("dronePredict");
    }
    else if (droneData["attackState"] == "swoop") {
        if (Date.now() - droneData["timer"] > 2000) {
            droneSwoop();
        }
        else {
            if (Date.now() - droneData["timer"] < 1000) {
                droneData["targetX"] = playerData["xPos"];
                droneData["targetY"] = playerData["yPos"];
            }
            if (!spriteExists("dronePredict"))
                createSpriteInGroup(uiGroupName, "dronePredict", preloadedAssets["dronePredict"], 196, 53, droneData["targetX"], droneData["targetY"]);
            if (spriteExists("dronePredict")) {
                spriteSetXY("dronePredict", droneData["targetX"] - droneData["width"] / 2 + xOffset, droneData["targetY"] - droneData["height"] / 2 + yOffset);
            }
            droneMovement();
        }
    }
    else if (droneData["attackState"] == "missiles") {
        if (Math.random() > 0.8 && Date.now() - droneData["timer"] > 200) {
            spawnMissle(droneData["xPos"] + droneData["width"] / 2, droneData["yPos"] + 20);
            droneData["health"]--;
            droneData["timer"] = Date.now();
            if (Math.random() < 0.1) {
                droneData["timer"] = Date.now();
                droneData["attackState"] = "swoop";
            }
        }
        droneMovement();
        if (spriteExists("dronePredict"))
            removeSprite("dronePredict");
    }
    else if (droneData["attackState"] == "return") {
        droneReturn();
        if (spriteExists("dronePredict"))
            removeSprite("dronePredict");
    }
    // Drone health
    updateHealth();
    // Actually move the Drone
    droneData["xPos"] = droneData["xPos"] + droneData["xSpeed"];
    droneData["yPos"] = droneData["yPos"] + droneData["ySpeed"];
    spriteSetXY(droneData["id"], droneData["xPos"] + xOffset, droneData["yPos"] + yOffset);
};
const droneMovement = () => {
    const distToPlayer = playerData["xPos"] - droneData["xPos"] - droneData["width"] / 2;
    if (Math.abs(distToPlayer) > 10) {
        droneData["xSpeed"] += clamp(Math.abs(distToPlayer) / 25, 0, 25) * (distToPlayer / Math.abs(distToPlayer));
        droneData["xSpeed"] *= 0.7;
    }
    else {
        droneData["xSpeed"] *= 0.5;
    }
    spriteRotate(droneData["id"], clamp(droneData["xSpeed"] * 1.6, -50, 50));
    droneData["yPos"] = droneData["yAmplitude"] * Math.sin(Date.now() * 2 * Math.PI / droneData["yPeriod"]) + 125;
};
const droneSwoop = () => {
    if (spriteExists("dronePredict"))
        spriteSetXY("dronePredict", droneData["targetX"] - droneData["width"] / 2 + xOffset, droneData["targetY"] - droneData["height"] / 2 + yOffset);
    const distToTargetX = droneData["targetX"] - droneData["xPos"] - droneData["width"] / 2;
    const distToTargetY = droneData["targetY"] - droneData["yPos"] - droneData["height"] / 2;
    if (Math.abs(distToTargetX) > 10 || Math.abs(distToTargetY) > 10) {
        droneData["xSpeed"] += clamp(Math.abs(distToTargetX) / 25, 0, 25) * (distToTargetX / Math.abs(distToTargetX));
        droneData["xSpeed"] *= 0.7;
        droneData["ySpeed"] += clamp(Math.abs(distToTargetY) / 25, 0, 25) * (distToTargetY / Math.abs(distToTargetY));
        droneData["ySpeed"] *= 0.7;
        droneData["pauseOnGround"] = Date.now();
        if (spriteExists("dronePredict"))
            removeSprite("dronePredict");
    }
    else {
        droneData["xSpeed"] = 0;
        droneData["ySpeed"] = 0;
        if (Date.now() - droneData["pauseOnGround"] > 3000) {
            droneData["pauseOnGround"] = Date.now();
            droneData["attackState"] = "return";
        }
    }
    spriteRotate(droneData["id"], clamp(droneData["xSpeed"] * 1.6, -50, 50));
};
const droneReturn = () => {
    droneData["targetY"] = droneData["yAmplitude"] * Math.sin(Date.now() * 2 * Math.PI / droneData["yPeriod"]) + 125;
    const distToTargetY = droneData["targetY"] - droneData["yPos"] - droneData["height"] / 2;
    const distToPlayer = playerData["xPos"] - droneData["xPos"] - droneData["width"] / 2;
    if (Math.abs(distToPlayer) > 10) {
        droneData["xSpeed"] += clamp(Math.abs(distToPlayer) / 25, 0, 25) * (distToPlayer / Math.abs(distToPlayer));
        droneData["xSpeed"] *= 0.7;
    }
    else {
        droneData["xSpeed"] *= 0.5;
    }
    if (Math.abs(distToTargetY) > 10) {
        droneData["ySpeed"] += clamp(Math.abs(distToTargetY) / 25, 0, 25) * (distToTargetY / Math.abs(distToTargetY));
        droneData["ySpeed"] *= 0.7;
    }
    else {
        droneData["attackState"] = "missiles";
    }
    spriteRotate(droneData["id"], clamp(droneData["xSpeed"] * 1.6, -50, 50));
};
const moveBlocks = () => {
    for (let i = 0; i < levelBlocks.length; i++) {
        let currentBlock = levelBlocks[i];
        if (Math.abs(currentBlock["xSpeed"]) > 0) {
            currentBlock["xPos"] += currentBlock["xSpeed"];
            if (currentBlock["xPos"] <= currentBlock["minXPos"] || currentBlock["xPos"] >= currentBlock["maxXPos"])
                currentBlock["xSpeed"] = -currentBlock["xSpeed"];
        }
        if (Math.abs(currentBlock["ySpeed"]) > 0) {
            currentBlock["yPos"] += currentBlock["ySpeed"];
            if (currentBlock["yPos"] < currentBlock["minYPos"] || currentBlock["yPos"] > currentBlock["maxYPos"])
                currentBlock["ySpeed"] = -currentBlock["ySpeed"];
        }
        spriteSetXY(currentBlock["id"], currentBlock["xPos"] + xOffset, currentBlock["yPos"] + yOffset);
    }
    spriteSetXY("wave1", xOffset / 5 - PLAYGROUND_WIDTH, yOffset);
    spriteSetXY("wave2", xOffset / 10 - PLAYGROUND_WIDTH, yOffset);
};
const moveMissiles = () => {
    missiles.forEach(missile => {
        // And just move the missile as normal
        missile["xPos"] = missile["xPos"] + missile["xSpeed"];
        missile["yPos"] = missile["yPos"] + missile["ySpeed"];
        spriteSetXY(missile["id"], missile["xPos"] + xOffset, missile["yPos"] + yOffset);
        // Check if it hits a wall
        forEachSpriteGroupCollisionDo(missile["id"], "collisionGroup", () => {
            removeSprite(missile["id"]);
            const index = missiles.indexOf(missile);
            if (index > -1)
                missiles.splice(index, 1);
        });
    });
};
const endOfGame = () => {
    updateHealth();
    if (Date.now() - waitTimer > 2000) {
        levelBlocks.forEach(blockDict => { removeSprite(blockDict["id"]); });
        missiles.forEach(missileDict => { removeSprite(missileDict["id"]); });
        levelBlocks = [];
        missiles = [];
        const removeSprites = [playerData["spriteId"], playerData["hitboxId"], "wave1", "wave2", droneData["id"], "healthBarMain", "healthBarSecond", "healthBarBack", "bossBarText"];
        removeSprites.forEach(name => { removeSprite(name); });
        if (spriteExists("dronePredict"))
            removeSprite("dronePredict");
        removeSprite("overlaySprite");
        droneData["health"] = 540;
        playerData["xPos"] = spawnPoint[levelNumber][0];
        playerData["yPos"] = spawnPoint[levelNumber][1];
        spriteSetXY("speedrunTimer", PLAYGROUND_WIDTH / 2 - 150, PLAYGROUND_HEIGHT / 2 - 85);
        sprite("speedrunTimer").css("color", "rgba(255, 255, 255, 255)").css("font-size", "35pt");
        if (skipped)
            sprite("speedrunTimer").html("You skipped.");
        spriteSetAnimation("backgroundImage", preloadedAssets["input"]);
        // Text input but "custom". I might be making extra work for myself here, but it's fun to figure out
        createTextSpriteInGroup(textGroupName, "inputfield", 200, 60, PLAYGROUND_WIDTH / 2 - 100, PLAYGROUND_HEIGHT / 2 + 35);
        textInputSpriteSetHandler("inputfield", inputHandler);
        $("#inputfield").css("background-color", "rgba(0, 0, 0, 0)");
        $("#inputfield").append(`<textarea id="inputfield2" rows="2" cols="20">John Doe</textarea>`);
        $("#inputfield").append(`<style>div{text-align: center;}</style><button id="leaderboardButton" type="button">Add me to leaderboard!</button>`);
        $("#inputfield2").css("resize", "none");
        $("#leaderboardButton").click(inputHandler);
        gameState = "input";
    }
};
const inputHandler = () => {
    var inputValue = $("#inputfield2").val();
    if (inputValue.trim().length != 0) {
        if (inputValue in leaderBoardData || inputValue == 'John Doe' || inputValue.length > 10 || inputValue.includes("\n"))
            return;
        if (spriteExists("inputfield"))
            removeSprite("inputfield");
        inputValue = inputValue.replace(/[^a-zA-Z0-9\s]/g, ""); // This is my attempt at protecting myself from some kind of SQL injection
        if (!skipped)
            leaderboardCRUD({ inputValue: finalTime });
        createSpriteInGroup(backgroundGroupName, screensForMenu["id"], screensForMenu["winScreen"], PLAYGROUND_WIDTH, PLAYGROUND_HEIGHT);
        gameState = "final";
        spriteSetAnimation("backgroundImage", preloadedAssets["background"]);
        removeSprite("speedrunTimer");
    }
};
let draw = () => {
    // Just so we can check if they click this frame!
    if (!getMouseButton1())
        mouseDownBefore = false;
    // Gamestates
    if (gameState == "playing") {
        // Camera movement, Calculate the distance from the player to the center of the screen, and allow it to be edited by the arrow keys
        const playerDistToCenterX = spriteGetX(playerData["hitboxId"]) - PLAYGROUND_WIDTH / 2;
        scrollAmount = getKeyState(37) ? ++scrollAmount : (getKeyState(39) ? --scrollAmount : 0);
        xOffset = lerp(xOffset, clamp(xOffset + -playerDistToCenterX + scrollAmount * 10, minX, maxX), lerpFactor);
        // Player
        playerMovement();
        playerAnimation();
        moveBlocks();
        // Specific Level stuff
        if (levelNumber == 6) {
            droneDataAI();
            moveMissiles();
            if (spriteExists("bossControls") && (getKeyState(37) || getKeyState(39) || getKeyState(68)
                || getKeyState(65) || getKeyState(87) || getKeyState(32))) {
                removeSprite("bossControls");
            }
        }
        // Timer
        const elapsed = new Date(Date.now() - startTime - pausedTime);
        sprite("speedrunTimer").html(elapsed.toISOString().slice(11, -1));
        // How-to-play menu
        if (spriteExists("controls") && (getKeyState(37) || getKeyState(39) || getKeyState(68)
            || getKeyState(65) || getKeyState(87) || getKeyState(32))) {
            removeSprite("controls");
        }
        // Pause Menu
        if (getKeyState(27)) {
            gameState = "paused";
            pausedTime = Date.now() - startTime;
            createSpriteInGroup(textGroupName, "pauseMenu", preloadedAssets["pauseMenu"], PLAYGROUND_WIDTH, PLAYGROUND_HEIGHT);
        }
    }
    else if (gameState == "paused") {
        if (getMouseButton1()) {
            gameState = "playing";
            removeSprite("pauseMenu");
            startTime = Date.now() - pausedTime;
            pausedTime = 0;
        }
    }
    else if (gameState == "menu") {
        mainMenu();
    }
    else if (gameState == "ended") {
        endOfGame();
    }
    else if (gameState == "final") {
        winScreen();
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXlwcm9ncmFtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibXlwcm9ncmFtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQztBQUNiLHFCQUFxQjtBQUNyQixnQkFBZ0I7QUFDaEIsMEVBQTBFO0FBQzFFOzs7Ozs7Ozs7OztHQVdHO0FBQ0gsT0FBTyxFQUNILGNBQWMsRUFDZCx1QkFBdUIsRUFDdkIsbUJBQW1CLEVBQ25CLFVBQVUsRUFDVixVQUFVLEVBQ1YsV0FBVyxFQUNYLGNBQWMsRUFDZCxlQUFlLEVBQ2YsaUJBQWlCLEVBQ2pCLGdCQUFnQixFQUNoQixXQUFXLEVBQ1gsa0JBQWtCLEVBQ2xCLG9CQUFvQixFQUNwQiw2QkFBNkIsRUFDN0IsTUFBTSxFQUNOLGVBQWUsRUFFZixTQUFTLEVBQ1QsU0FBUyxFQUNULFlBQVksRUFDWixZQUFZLEVBQ1osWUFBWSxFQUNaLFlBQVksRUFDWixpQkFBaUIsRUFDakIsUUFBUSxFQUNSLGtCQUFrQixFQUNsQix1QkFBdUIsRUFDdkIsa0JBQWtCLEVBQ2xCLHlCQUF5QixFQUM1QixNQUFNLG1DQUFtQyxDQUFDO0FBQzNDLE9BQW9CLG1DQUFtQyxDQUFDO0FBQ3hELGlGQUFpRjtBQUVqRixxRkFBcUY7QUFDckYscUJBQXFCO0FBQ3JCLHNDQUFzQztBQUV0QyxzQ0FBc0M7QUFDdEMsc0NBQXNDO0FBQ3RDLE9BQXFGLFlBQVksQ0FBQztBQUVsRyxNQUFNLGVBQWUsR0FBRyxLQUFLLEVBQUUsSUFBWSxFQUFFLEVBQUU7SUFDM0MsMkNBQTJDO0lBQzNDLE1BQU0sUUFBUSxHQUFHLE1BQU0sS0FBSyxDQUFDLE9BQU8sRUFBRTtRQUNsQyxNQUFNLEVBQUUsTUFBTTtRQUNkLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQztRQUMxQixPQUFPLEVBQUU7WUFDTCxjQUFjLEVBQUUsa0JBQWtCO1NBQ3JDO0tBQ0osQ0FBQyxDQUFDO0lBQ0gsTUFBTSxZQUFZLEdBQUcsTUFB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LENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsaUJBQWlCLEdBQUcsR0FBRyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUU7SUFDdkQsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRTtJQUN2RCxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLGlCQUFpQixHQUFHLEVBQUUsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFO0lBQ3BELEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsaUJBQWlCLEdBQUcsR0FBRyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUU7SUFDdkQsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxpQkFBaUIsR0FBRyxHQUFHLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRTtJQUN0RCxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLGlCQUFpQixHQUFHLEdBQUcsRUFBRSxJQUFJLEVBQUUscUNBQXFDLEVBQUU7SUFDbkYsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxpQkFBaUIsR0FBRyxHQUFHLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRTtJQUN4RCxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLGlCQUFpQixHQUFHLEdBQUcsRUFBRSxJQUFJLEVBQUUsdUNBQXVDLEVBQUU7SUFDdEYsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRTtJQUN4RCxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLGlCQUFpQixHQUFHLEdBQUcsRUFBRSxJQUFJLEVBQUUsdUNBQXVDLEVBQUU7SUFDdEYsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxpQkFBaUIsR0FBRyxHQUFHLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRTtJQUN4RCxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLGlCQUFpQixHQUFHLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFO0NBQzFELENBQUM7QUFFRixNQUFNLFVBQVUsR0FBRztJQUNmLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxpQkFBaUIsR0FBRyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRTtJQUN2RCxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsaUJBQWlCLEdBQUcsRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7SUFDckQsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxpQkFBaUIsR0FBRyxHQUFHLEVBQUUsSUFBSSxFQUFFLDBDQUEwQyxFQUFFO0lBQ3hGLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsaUJBQWlCLEdBQUcsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUU7SUFDdEQsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRTtJQUN2RCxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLGlCQUFpQixHQUFHLEVBQUUsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFO0lBQ3BELEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsaUJBQWlCLEdBQUcsR0FBRyxFQUFFLElBQUksRUFBRSxvQ0FBb0MsRUFBRTtJQUNsRixFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLGlCQUFpQixHQUFHLEdBQUcsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFO0lBQ3RELEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsaUJBQWlCLEdBQUcsR0FBRyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7SUFDdEQsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxpQkFBaUIsR0FBRyxHQUFHLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRTtJQUN0RCxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLGlCQUFpQixHQUFHLEdBQUcsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFO0lBQ3ZELEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsaUJBQWlCLEdBQUcsR0FBRyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7SUFDdkQsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxpQkFBaUIsR0FBRyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRTtDQUMxRCxDQUFDO0FBRUYsTUFBTSxVQUFVLEdBQUc7SUFDZixFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsaUJBQWlCLEdBQUcsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUU7SUFDdkQsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLGlCQUFpQixHQUFHLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFO0lBQ3JELEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsaUJBQWlCLEdBQUcsR0FBRyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7SUFDckQsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxpQkFBaUIsR0FBRyxHQUFHLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRTtJQUN0RCxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLGlCQUFpQixHQUFHLEdBQUcsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFO0lBQ3RELEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsaUJBQWlCLEdBQUcsR0FBRyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7SUFDdEQsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxp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VyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckMsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDOUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM5RSxJQUFJLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVFLFNBQVMsR0FBRyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztLQUNyRDtTQUFNO1FBQ0gsSUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM5QyxJQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9DLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDaEMsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsTUFB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NUI7UUFFRCxhQUFhO1FBQ2IsSUFBSSxXQUFXLENBQUMsRUFBRSxDQUFDLEVBQUU7WUFDakIsU0FBUyxHQUFHLFFBQVEsQ0FBQztZQUNyQixVQUFVLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLFNBQVMsQ0FBQztZQUNwQyxtQkFBbUIsQ0FBQyxhQUFhLEVBQUUsV0FBVyxFQUFFLGVBQWUsQ0FBQyxXQUFXLENBQUMsRUFBRSxnQkFBZ0IsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1NBQ3RIO0tBQ0o7U0FBTSxJQUFJLFNBQVMsSUFBSSxRQUFRLEVBQUU7UUFFOUIsSUFBSSxlQUFlLEVBQUUsRUFBRTtZQUNuQixTQUFTLEdBQUcsU0FBUyxDQUFDO1lBQ3RCLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUMxQixTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLFVBQVUsQ0FBQztZQUNwQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO1NBQ2xCO0tBQ0o7U0FBTSxJQUFJLFNBQVMsSUFBSSxNQUFNLEVBQUU7UUFDNUIsUUFBUSxFQUFFLENBQUM7S0FDZDtTQUFNLElBQUksU0FBUyxJQUFJLE9BQU8sRUFBRTtRQUM3QixTQUFTLEVBQUUsQ0FBQztLQUNmO1NBQU0sSUFBSSxTQUFTLElBQUksT0FBTyxFQUFFO1FBQzdCLFNBQVMsRUFBRSxDQUFDO0tBQ2Y7QUFDTCxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbi8vIFByb2dyYW1tZXIncyBOYW1lOlxuLy8gUHJvZ3JhbSBOYW1lOlxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8qIFxuICogQ29weXJpZ2h0IDIwMTIsIDIwMTYsIDIwMTksIDIwMjAgQ2hlbmdcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqICAgICBodHRwczovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5pbXBvcnQge1xuICAgIG5ld0dRQW5pbWF0aW9uLFxuICAgIGNyZWF0ZUdyb3VwSW5QbGF5Z3JvdW5kLFxuICAgIGNyZWF0ZVNwcml0ZUluR3JvdXAsXG4gICAgc3ByaXRlR2V0WCxcbiAgICBzcHJpdGVHZXRZLFxuICAgIHNwcml0ZVNldFhZLFxuICAgIHNwcml0ZUdldFdpZHRoLFxuICAgIHNwcml0ZUdldEhlaWdodCxcbiAgICBQTEFZR1JPVU5EX0hFSUdIVCxcbiAgICBQTEFZR1JPVU5EX1dJRFRILFxuICAgIGdldEtleVN0YXRlLFxuICAgIHNwcml0ZVNldEFuaW1hdGlvbixcbiAgICBBTklNQVRJT05fSE9SSVpPTlRBTCxcbiAgICBmb3JFYWNoU3ByaXRlR3JvdXBDb2xsaXNpb25EbyxcbiAgICBzcHJpdGUsXG4gICAgZ2V0TW91c2VCdXR0b24xLFxuICAgIFNwcml0ZURpY3QsXG4gICAgZ2V0TW91c2VYLFxuICAgIGdldE1vdXNlWSxcbiAgICBzcHJpdGVFeGlzdHMsXG4gICAgcmVtb3ZlU3ByaXRlLFxuICAgIGNvbnNvbGVQcmludCxcbiAgICBzcHJpdGVSb3RhdGUsXG4gICAgY3JlYXRlUmVjdEluR3JvdXAsXG4gICAgc3ByaXRlSWQsXG4gICAgc3ByaXRlSGl0RGlyZWN0aW9uLFxuICAgIGNyZWF0ZVRleHRTcHJpdGVJbkdyb3VwLFxuICAgIGRpc2FibGVDb250ZXh0TWVudSxcbiAgICB0ZXh0SW5wdXRTcHJpdGVTZXRIYW5kbGVyXG59IGZyb20gXCIuL2xpYnMvbGliLWdxZ3VhcmRyYWlsLWV4cG9ydHMudHNcIjtcbmltcG9ydCAqIGFzIEZuIGZyb20gXCIuL2xpYnMvbGliLWdxZ3VhcmRyYWlsLWV4cG9ydHMudHNcIjtcbi8vIERvbid0IGVkaXQgdGhlIGltcG9ydCBsaW5lcyBhYm92ZSwgb3IgeW91IHdvbid0IGJlIGFibGUgdG8gd3JpdGUgeW91ciBwcm9ncmFtIVxuXG4vLyBBbHNvLCBkbyBub3QgdXNlIHRoZSBmb2xsb3dpbmcgdmFyaWFibGUgYW5kIGZ1bmN0aW9uIG5hbWVzIGluIHlvdXIgb3duIGNvZGUgYmVsb3c6XG4vLyAgICBzZXR1cCwgZHJhdywgRm5cbi8vIGFuZCB0aGUgb3RoZXIgaW1wb3J0ZWQgbmFtZXMgYWJvdmUuXG5cbi8vIFdyaXRlIHlvdXIgcHJvZ3JhbSBiZWxvdyB0aGlzIGxpbmU6XG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuaW1wb3J0IHsgUGxheWVyU3ByaXRlRGljdCwgUmVzcGF3bkRpY3QsIExlYWRlcmJvYXJkRGljdCwgTGV2ZWxEYXRhLCBCbG9ja0RpY3QgfSBmcm9tIFwiLi91dGlscy50c1wiO1xuXG5jb25zdCBsZWFkZXJib2FyZENSVUQgPSBhc3luYyAoZGF0YTogb2JqZWN0KSA9PiB7XG4gICAgLy8gVXNlIGZldGNoIHRvIHNlbmQgdGhlIGRhdGEgdG8gdGhlIHNlcnZlclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goJy9kYXRhJywge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoZGF0YSksXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgIH0sXG4gICAgfSk7XG4gICAgY29uc3QgcmVzcG9uc2VEYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgIGNvbnN0IGRhdGFEQiA9IGF3YWl0IHJlc3BvbnNlRGF0YTtcbiAgICByZXR1cm4gYXdhaXQgZGF0YURCO1xufTtcblxuLy8gR2xvYmFsIHZhcnNcbmRlY2xhcmUgdmFyICQ6IGFueTtcbmxldCBsZXZlbE51bWJlcjogbnVtYmVyID0gNjtcbmxldCBtb3VzZURvd25CZWZvcmU6IGJvb2xlYW4gPSBmYWxzZTtcbmxldCBnYW1lU3RhdGU6IHN0cmluZyA9IFwibWVudVwiO1xubGV0IHN0YXJ0VGltZTogbnVtYmVyID0gRGF0ZS5ub3coKTtcbmxldCBkZWF0aHM6IG51bWJlciA9IDA7XG5sZXQgc2Nyb2xsQW1vdW50ID0gMDtcbmxldCB3YWl0VGltZXI6IG51bWJlcjtcbmxldCBmaW5hbFRpbWUgPSAxMDAwMDAwMDsgLy8ganVzdCBpbiBjYXNlIG9mIGEgYnVnLCBpdCdzIHNldCByZWFsbHkgaGlnaFxubGV0IHBhdXNlZFRpbWUgPSAwO1xubGV0IHNraXBwZWQgPSBmYWxzZTtcbmxldCBsZWFkZXJCb2FyZERhdGE6IExlYWRlcmJvYXJkRGljdCA9IHtcbiAgICBcInRoaXMgd29uJ3QgYmUgc2VlbiBldmVyLi4uXCI6IDM0MDEyMyxcbn07XG5cbi8vIExldmVsc1xubGV0IGxldmVsQmxvY2tzOiBTcHJpdGVEaWN0W10gPSBbXTtcblxuLy8gQ2FtZXJhIGFuZCBjYW1lcmEgY29uc3RyYWludHNcbmxldCB4T2Zmc2V0ID0gNjY5O1xubGV0IHlPZmZzZXQgPSAwO1xubGV0IG1pblggPSAtMTIwMDtcbmNvbnN0IG1heFggPSA3NTA7XG5jb25zdCBsZXJwRmFjdG9yID0gMC4xO1xuXG4vLyBDaGFuZ2UgaWYgeW91IHdhbnQgZXh0cmEgaW5mb1xuY29uc3QgZGVidWcgPSBmYWxzZTtcblxuLy8gR3JvdXBzXG5jb25zdCBiYWNrZ3JvdW5kR3JvdXBOYW1lOiBzdHJpbmcgPSBcImJhY2tncm91bmRHcm91cFwiO1xuY3JlYXRlR3JvdXBJblBsYXlncm91bmQoYmFja2dyb3VuZEdyb3VwTmFtZSk7XG5cbmNvbnN0IGNvbGxpc2lvbkdyb3VwTmFtZTogc3RyaW5nID0gXCJjb2xsaXNpb25Hcm91cFwiO1xuY3JlYXRlR3JvdXBJblBsYXlncm91bmQoY29sbGlzaW9uR3JvdXBOYW1lKTtcblxuY29uc3QgYm91bmNlR3JvdXBOYW1lOiBzdHJpbmcgPSBcImJvdW5jZUdyb3VwXCI7XG5jcmVhdGVHcm91cEluUGxheWdyb3VuZChib3VuY2VHcm91cE5hbWUpO1xuXG5jb25zdCBwbGF5ZXJHcm91cE5hbWU6IHN0cmluZyA9IFwicGxheWVyR3JvdXBcIjtcbmNyZWF0ZUdyb3VwSW5QbGF5Z3JvdW5kKHBsYXllckdyb3VwTmFtZSk7XG5cbmNvbnN0IGVuZW15R3JvdXBOYW1lOiBzdHJpbmcgPSBcImVtZW15R3JvdXBcIjtcbmNyZWF0ZUdyb3VwSW5QbGF5Z3JvdW5kKGVuZW15R3JvdXBOYW1lKTtcblxuY29uc3QgdWlHcm91cE5hbWU6IHN0cmluZyA9IFwidWlHcm91cFwiO1xuY3JlYXRlR3JvdXBJblBsYXlncm91bmQodWlHcm91cE5hbWUpO1xuXG5jb25zdCB0ZXh0R3JvdXBOYW1lOiBzdHJpbmcgPSBcInRleHRHcm91cFwiO1xuY3JlYXRlR3JvdXBJblBsYXlncm91bmQodGV4dEdyb3VwTmFtZSk7XG5cbi8vIEVhc3ktQWNjZXNzIExldmVsIERhdGFcbmNvbnN0IHNwYXduUG9pbnQ6IFJlc3Bhd25EaWN0ID0ge1xuICAgIDE6IFstMzUwLCA0MjJdLFxuICAgIDI6IFstMzUwLCA0MjJdLFxuICAgIDM6IFstMzUwLCA0MjJdLFxuICAgIDQ6IFstMzUwLCA0MjJdLFxuICAgIDU6IFstMzUwLCAzMjNdLFxuICAgIDY6IFstMzUwLCA0MjJdXG59XG5cbmNvbnN0IGxldmVsMURhdGEgPSBbXG4gICAgeyB4OiAtNzUwLCB5OiBQTEFZR1JPVU5EX0hFSUdIVCAtIDIwLCBzaXplOiBcIjY0MHg2NDBcIiB9LFxuICAgIHsgeDogMCwgeTogUExBWUdST1VORF9IRUlHSFQgLSA2MCwgc2l6ZTogXCIyMHg0ODBcIiB9LFxuICAgIHsgeDogMTM1LCB5OiBQTEFZR1JPVU5EX0hFSUdIVCAtIDgwLCBzaXplOiBcIjEwMHg2NDBcIiB9LFxuICAgIHsgeDogMzUwLCB5OiBQTEFZR1JPVU5EX0hFSUdIVCAtIDYwLCBzaXplOiBcIjIweDQ4MFwiIH0sXG4gICAgeyB4OiA1MDAsIHk6IFBMQVlHUk9VTkRfSEVJR0hUIC0gMTAwLCBzaXplOiBcIjEwMHg2NDBcIiB9LFxuICAgIHsgeDogNTAwLCB5OiBQTEFZR1JPVU5EX0hFSUdIVCAtIDIwMCwgc2l6ZTogXCIxMDB4MjBcIiB9LFxuICAgIHsgeDogNjkwLCB5OiBQTEFZR1JPVU5EX0hFSUdIVCAtIDI0MCwgc2l6ZTogXCIxMDB4MjBcIiB9LFxuICAgIHsgeDogODYwLCB5OiBQTEFZR1JPVU5EX0hFSUdIVCAtIDMwMCwgc2l6ZTogXCIxMDB4MjBcIiB9LFxuICAgIHsgeDogMTA1MCwgeTogUExBWUdST1VORF9IRUlHSFQgLSAzNTAsIHNpemU6IFwiMTAweDY0MFwiIH0sXG4gICAgeyB4OiAxMjAwLCB5OiAxMDAgLSBQTEFZR1JPVU5EX0hFSUdIVCwgc2l6ZTogXCIxMDB4NjQwXCIgfSxcbiAgICB7IHg6IDE0MDAsIHk6IFBMQVlHUk9VTkRfSEVJR0hUIC0gMjAsIHNpemU6IFwiNjQweDY0MFwiIH1cbl07XG5cbi8qIE1vdmluZyBibG9ja3MhXG4gKiBBbnkgYmxvY2sgd2l0aCBhIHNpemUgdGhhdCBzdGFydHMgd2l0aCAnTUInIGlzIGEgbW92aW5nIGJsb2NrXG4gKiBJbnB1dCBpbmZvOlxuICogICBNQjogMTAweDIwIFJHOiA2MDAsICAxMDAwLCAwLCAgICAwICAgIFNQOiA1LCAgICAgIDBcbiAqICAgTUI6IHNpemVYWSBSRzogbWluWCwgbWF4WCwgbWluWSwgbWF4WSBTUDogeFNwZWVkLCB5U3BlZWRcbiAqL1xuY29uc3QgbGV2ZWwyRGF0YSA9IFtcbiAgICB7IHg6IC03NTAsIHk6IFBMQVlHUk9VTkRfSEVJR0hUIC0gMjAsIHNpemU6IFwiNjQweDY0MFwiIH0sXG4gICAgeyB4OiAtMTYwLCB5OiBQTEFZR1JPVU5EX0hFSUdIVCAtIDQ4LCBzaXplOiBcIjM4eDI5XCIgfSxcbiAgICB7IHg6IC00MCwgeTogUExBWUdST1VORF9IRUlHSFQgLSAzMDAsIHNpemU6IFwiMTAweDY0MFwiIH0sXG4gICAgeyB4OiAxMjAsIHk6IDI1MCAtIFBMQVlHUk9VTkRfSEVJR0hULCBzaXplOiBcIjEwMHg2NDBcIiB9LFxuICAgIHsgeDogMjEwLCB5OiBQTEFZR1JPVU5EX0hFSUdIVCAtIDI4LCBzaXplOiBcIjM4eDI5XCIgfSxcbiAgICB7IHg6IDQwMCwgeTogUExBWUdST1VORF9IRUlHSFQgLSAzMDAsIHNpemU6IFwiMTAweDY0MFwiIH0sXG4gICAgeyB4OiA1MDAsIHk6IFBMQVlHUk9VTkRfSEVJR0hUIC0gMjAwLCBzaXplOiBcIjEwMHgyMFwiIH0sXG4gICAgeyB4OiA2MDAsIHk6IFBMQVlHUk9VTkRfSEVJR0hUIC0gMjAwLCBzaXplOiBcIk1COiAxMDB4MjAgUkc6IDYwMCwxMDAwLDAsMCBTUDogNSwwXCIgfSxcbiAgICB7IHg6IDExMDAsIHk6IFBMQVlHUk9VTkRfSEVJR0hUIC0gMzAwLCBzaXplOiBcIjEwMHg2NDBcIiB9LFxuICAgIHsgeDogMTIwMCwgeTogUExBWUdST1VORF9IRUlHSFQgLSAyMDAsIHNpemU6IFwiTUI6IDEwMHgyMCBSRzogMCwxMDAwLDIwMCw0NjAgU1A6IDAsNVwiIH0sXG4gICAgeyB4OiAxMzAwLCB5OiAxNTAgLSBQTEFZR1JPVU5EX0hFSUdIVCwgc2l6ZTogXCIxMDB4NjQwXCIgfSxcbiAgICB7IHg6IDE0MDAsIHk6IFBMQVlHUk9VTkRfSEVJR0hUIC0gMjAwLCBzaXplOiBcIk1COiAxMDB4MjAgUkc6IDAsMTAwMCwyMDAsNDYwIFNQOiAwLDVcIiB9LFxuICAgIHsgeDogMTUwMCwgeTogUExBWUdST1VORF9IRUlHSFQgLSAzMDAsIHNpemU6IFwiMTAweDY0MFwiIH0sXG4gICAgeyB4OiAxNjAwLCB5OiBQTEFZR1JPVU5EX0hFSUdIVCAtIDIwLCBzaXplOiBcIjY0MHg2NDBcIiB9LFxuXTtcblxuY29uc3QgbGV2ZWwzRGF0YSA9IFtcbiAgICB7IHg6IC03NTAsIHk6IFBMQVlHUk9VTkRfSEVJR0hUIC0gMjAsIHNpemU6IFwiNjQweDY0MFwiIH0sXG4gICAgeyB4OiAtMTAsIHk6IFBMQVlHUk9VTkRfSEVJR0hUIC0gNjAsIHNpemU6IFwiMjB4NDgwXCIgfSxcbiAgICB7IHg6IDEwMCwgeTogUExBWUdST1VORF9IRUlHSFQgLSAyMDAsIHNpemU6IFwiTUI6IDIweDEwMCBSRzogLTc1MCwxMDAwLDIwMCwzNjAgU1A6IDAsNVwiIH0sXG4gICAgeyB4OiAxNTAsIHk6IFBMQVlHUk9VTkRfSEVJR0hUIC0gNjAsIHNpemU6IFwiMTAweDY0MFwiIH0sXG4gICAgeyB4OiAxNTAsIHk6IDEyMCAtIFBMQVlHUk9VTkRfSEVJR0hULCBzaXplOiBcIjEwMHg2NDBcIiB9LFxuICAgIHsgeDogMzAwLCB5OiBQTEFZR1JPVU5EX0hFSUdIVCAtIDI4LCBzaXplOiBcIjM4eDI5XCIgfSxcbiAgICB7IHg6IDMwMCwgeTogUExBWUdST1VORF9IRUlHSFQgLSAzMDAsIHNpemU6IFwiTUI6IDEwMHgyMCBSRzogMjUwLDM1MCwwLDAgU1A6IDUsMFwiIH0sXG4gICAgeyB4OiA0MDAsIHk6IFBMQVlHUk9VTkRfSEVJR0hUIC0gMjgwLCBzaXplOiBcIjIweDQ4MFwiIH0sXG4gICAgeyB4OiA1MDAsIHk6IFBMQVlHUk9VTkRfSEVJR0hUIC0gMjAwLCBzaXplOiBcIjEwMHgyMFwiIH0sXG4gICAgeyB4OiA5MDAsIHk6IFBMQVlHUk9VTkRfSEVJR0hUIC0gMTAwLCBzaXplOiBcIjEwMHgyMFwiIH0sXG4gICAgeyB4OiAxMjAwLCB5OiBQTEFZR1JPVU5EX0hFSUdIVCAtIDIwMCwgc2l6ZTogXCIxMDB4MjBcIiB9LFxuICAgIHsgeDogMTQwMCwgeTogUExBWUdST1VORF9IRUlHSFQgLSAzMDAsIHNpemU6IFwiMTAweDIwXCIgfSxcbiAgICB7IHg6IDE2MDAsIHk6IFBMQVlHUk9VTkRfSEVJR0hUIC0gMjAsIHNpemU6IFwiNjQweDY0MFwiIH0sXG5dO1xuXG5jb25zdCBsZXZlbDREYXRhID0gW1xuICAgIHsgeDogLTc1MCwgeTogUExBWUdST1VORF9IRUlHSFQgLSAyMCwgc2l6ZTogXCI2NDB4NjQwXCIgfSxcbiAgICB7IHg6IC0xMCwgeTogUExBWUdST1VORF9IRUlHSFQgLSA2MCwgc2l6ZTogXCIyMHg0ODBcIiB9LFxuICAgIHsgeDogOTAsIHk6IFBMQVlHUk9VTkRfSEVJR0hUIC0gMTAwLCBzaXplOiBcIjIweDQ4MFwiIH0sXG4gICAgeyB4OiAxOTAsIHk6IFBMQVlHUk9VTkRfSEVJR0hUIC0gMTQwLCBzaXplOiBcIjIweDQ4MFwiIH0sXG4gICAgeyB4OiAzOTAsIHk6IFBMQVlHUk9VTkRfSEVJR0hUIC0gMTQwLCBzaXplOiBcIjIweDQ4MFwiIH0sXG4gICAgeyB4OiA3MDAsIHk6IFBMQVlHUk9VTkRfSEVJR0hUIC0gMTAwLCBzaXplOiBcIjIweDQ4MFwiIH0sXG4gICAgeyB4OiAxMDAwLCB5OiBQTEFZR1JPVU5EX0hFSUdIVCAtIDE0MCwgc2l6ZTogXCIyMHg0ODBcIiB9LFxuICAgIHsgeDogMTIwMCwgeTogUExBWUdST1VORF9IRUlHSFQgLSAxMDAsIHNpemU6IFwiMjB4NDgwXCIgfSxcbiAgICB7IHg6IDE1MDAsIHk6IFBMQVlHUk9VTkRfSEVJR0hUIC0gMTIwLCBzaXplOiBcIjY0MHg2NDBcIiB9XG5dO1xuXG5jb25zdCBsZXZlbDVEYXRhID0gW1xuICAgIHsgeDogLTc1MCwgeTogUExBWUdST1VORF9IRUlHSFQgLSAxMjAsIHNpemU6IFwiNjQweDY0MFwiIH0sXG4gICAgeyB4OiAxMDAsIHk6IFBMQVlHUk9VTkRfSEVJR0hUIC0gMjAwLCBzaXplOiBcIk1COiAyMHgxMDAgUkc6IC03NTAsMTAwMCwyMDAsMzYwIFNQOiAwLDVcIiB9LFxuICAgIHsgeDogMzAwLCB5OiBQTEFZR1JPVU5EX0hFSUdIVCAtIDI1MCwgc2l6ZTogXCJNQjogMjB4MTAwIFJHOiAtNzUwLDEwMDAsMjAwLDM2MCBTUDogMCw1XCIgfSxcbiAgICB7IHg6IDUwMCwgeTogUExBWUdST1VORF9IRUlHSFQgLSAxMjAsIHNpemU6IFwiMTAweDY0MFwiIH0sXG4gICAgeyB4OiA2MDAsIHk6IFBMQVlHUk9VTkRfSEVJR0hUIC0gMjgsIHNpemU6IFwiMzh4MjlcIiB9LFxuICAgIHsgeDogOTAwLCB5OiBQTEFZR1JPVU5EX0hFSUdIVCAtIDEwMCwgc2l6ZTogXCIxMDB4MjBcIiB9LFxuICAgIHsgeDogMTIwMCwgeTogUExBWUdST1VORF9IRUlHSFQgLSAyMDAsIHNpemU6IFwiMTAweDIwXCIgfSxcbiAgICB7IHg6IDEzMDAsIHk6IDMwMCAtIFBMQVlHUk9VTkRfSEVJR0hULCBzaXplOiBcIjIweDQ4MFwiIH0sXG4gICAgeyB4OiAxMzgwLCB5OiBQTEFZR1JPVU5EX0hFSUdIVCAtIDI4LCBzaXplOiBcIjM4eDI5XCIgfSxcbiAgICB7IHg6IDE2MDAsIHk6IFBMQVlHUk9VTkRfSEVJR0hUIC0gMjAwLCBzaXplOiBcIjIweDQ4MFwiIH0sXG4gICAgeyB4OiAxNjAwLCB5OiBQTEFZR1JPVU5EX0hFSUdIVCAtIDIwLCBzaXplOiBcIjY0MHg2NDBcIiB9LFxuXTtcblxuY29uc3QgbGV2ZWw2RGF0YSA9IFtcbiAgICB7IHg6IC03NTAsIHk6IFBMQVlHUk9VTkRfSEVJR0hUIC0gMjAsIHNpemU6IFwiNjQweDY0MFwiIH0sXG4gICAgeyB4OiAtNzAwLCB5OiBQTEFZR1JPVU5EX0hFSUdIVCAtIDI1MCwgc2l6ZTogXCJNQjogMTAweDIwIFJHOiAtNzUwLDYwMCwwLDAgU1A6IDUsMFwiIH0sXG4gICAgeyB4OiAtMTEwLCB5OiBQTEFZR1JPVU5EX0hFSUdIVCAtIDEwMCwgc2l6ZTogXCIxMDB4NjQwXCIgfSxcbiAgICB7IHg6IC0xMCwgeTogUExBWUdST1VORF9IRUlHSFQgLSAyMCwgc2l6ZTogXCI2NDB4NjQwXCIgfSxcbiAgICB7IHg6IDExMCwgeTogUExBWUdST1VORF9IRUlHSFQgLSAxMDAsIHNpemU6IFwiMTAweDY0MFwiIH0sXG4gICAgeyB4OiA2MzAsIHk6IDAsIHNpemU6IFwiNjQweDY0MFwiIH0sXG5dO1xuXG5jb25zdCBsZXZlbERhdGE6IHsgW2luZGV4OiBudW1iZXJdOiBMZXZlbERhdGEgfSA9IHtcbiAgICAxOiBsZXZlbDFEYXRhLFxuICAgIDI6IGxldmVsMkRhdGEsXG4gICAgMzogbGV2ZWwzRGF0YSxcbiAgICA0OiBsZXZlbDREYXRhLFxuICAgIDU6IGxldmVsNURhdGEsXG4gICAgNjogbGV2ZWw2RGF0YVxufTtcblxuLyogVGhlIHBsYXllciBpcyBtYWRlIHVwIG9mIDIgc3ByaXRlczpcbiAqIDEuIHRoZSBpbnZpc2libGUgaGl0Ym94LCBhbmRcbiAqIDIuIHRoZSBhbmltYXRpb24gLyB2aXNpYmxlIHNwcml0ZS5cbiAqIFRoaXMgZGljdCBzdG9yZXMgYWxsIHRoZSBkYXRhIHJlcXVpcmVkIGZvciAqYm90aCosIGluY2x1ZGluZyB2ZWxvY2l0eSBhbmQgYW5pbWF0aW9ucy5cbiAqL1xubGV0IHBsYXllckRhdGE6IFBsYXllclNwcml0ZURpY3QgPSB7XG4gICAgXCJoaXRib3hJZFwiOiBcInBsYXllckhpdGJveFwiLFxuICAgIFwiaGl0Ym94V2lkdGhcIjogMTMsXG4gICAgXCJoaXRib3hIZWlnaHRcIjogMzcsXG4gICAgXCJ4UG9zXCI6IHNwYXduUG9pbnRbbGV2ZWxOdW1iZXJdWzBdLFxuICAgIFwieVBvc1wiOiBzcGF3blBvaW50W2xldmVsTnVtYmVyXVsxXSxcbiAgICBcInhTcGVlZFwiOiAwLFxuICAgIFwieVNwZWVkXCI6IDAsXG4gICAgXCJncm91bmRDb2xsaWRpbmdcIjogdHJ1ZSxcbiAgICBcImNveW90ZVRpbWVcIjogNiwgLy8gU2V0IHRpbWVyIChwZXIgZnJhbWUpXG4gICAgXCJjb3lvdGVDb3VudGVyXCI6IDAsXG4gICAgXCJib29zdENvb2xkb3duXCI6IERhdGUubm93KCksXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBcInNwcml0ZUlkXCI6IFwicGxheWVyU3ByaXRlXCIsXG4gICAgXCJzcHJpdGVXaWR0aFwiOiA0MyxcbiAgICBcInNwcml0ZUhlaWdodFwiOiA1NSxcbiAgICBcImFuaW1TdGF0ZVwiOiBcImlkbGVcIixcbiAgICBcImxhc3REaXJlY3Rpb25cIjogMSwgLy8gU3RhcnQgbG9va2luZyBsZWZ0XG4gICAgXCJhbmltSGl0Ym94XCI6IG5ld0dRQW5pbWF0aW9uKFwiaW1nL3BsYXllci9oaXRib3gucG5nXCIpLFxuICAgIFwiYW5pbUlkbGVMZWZ0XCI6IG5ld0dRQW5pbWF0aW9uKFwiaW1nL3BsYXllci9pZGxlTGVmdC5wbmdcIiksXG4gICAgXCJhbmltSWRsZVJpZ2h0XCI6IG5ld0dRQW5pbWF0aW9uKFwiaW1nL3BsYXllci9pZGxlUmlnaHQucG5nXCIpLFxuICAgIFwiYW5pbUp1bXBMZWZ0XCI6IG5ld0dRQW5pbWF0aW9uKFwiaW1nL3BsYXllci9qdW1wTGVmdC5wbmdcIiksXG4gICAgXCJhbmltSnVtcFJpZ2h0XCI6IG5ld0dRQW5pbWF0aW9uKFwiaW1nL3BsYXllci9qdW1wUmlnaHQucG5nXCIpLFxuICAgIFwiYW5pbUp1bXBTdHJhaWdodFwiOiBuZXdHUUFuaW1hdGlvbihcImltZy9wbGF5ZXIvanVtcFN0cmFpZ2h0LnBuZ1wiKSxcbiAgICBcImFuaW1SdW5DeWNsZUxlZnRcIjogbmV3R1FBbmltYXRpb24oXCJpbWcvcGxheWVyL3J1bkN5Y2xlTGVmdC5wbmdcIiwgMTEsIDQzLCAyNSwgQU5JTUFUSU9OX0hPUklaT05UQUwpLFxuICAgIFwiYW5pbVJ1bkN5Y2xlUmlnaHRcIjogbmV3R1FBbmltYXRpb24oXCJpbWcvcGxheWVyL3J1bkN5Y2xlUmlnaHQucG5nXCIsIDExLCA0MywgMjUsIEFOSU1BVElPTl9IT1JJWk9OVEFMKSxcbn07XG5cbi8vIEJvc3MgZmlnaHRcbmxldCBkcm9uZURhdGEgPSB7XG4gICAgXCJpZFwiOiBcImRyb25lRGF0YUJvc3NcIixcbiAgICBcImhlYWx0aFwiOiA1NDAgLSA1MzUsXG4gICAgXCJ3aWR0aFwiOiAxOTYsXG4gICAgXCJoZWlnaHRcIjogNTMsXG4gICAgXCJ4UG9zXCI6IDIwMCxcbiAgICBcInlQb3NcIjogMjAwLFxuICAgIFwieFNwZWVkXCI6IDAsXG4gICAgXCJ5U3BlZWRcIjogMCxcbiAgICBcInlQZXJpb2RcIjogNDAwMCxcbiAgICBcInlBbXBsaXR1ZGVcIjogMjUsXG4gICAgXCJhdHRhY2tTdGF0ZVwiOiBcInBhc3NpdmVcIixcbiAgICBcInRhcmdldFhcIjogMCxcbiAgICBcInRhcmdldFlcIjogMCxcbiAgICBcInRpbWVyXCI6IERhdGUubm93KCksXG4gICAgXCJwYXVzZU9uR3JvdW5kXCI6IERhdGUubm93KCksXG4gICAgXCJkcm9uZUZseVwiOiBuZXdHUUFuaW1hdGlvbihcImltZy9lbmVtaWVzL2Ryb25lRmx5LnBuZ1wiLCAyLCAxOTYsIDI1LCBBTklNQVRJT05fSE9SSVpPTlRBTCksXG59XG5cbnZhciBtaXNzaWxlczogU3ByaXRlRGljdFtdID0gW107XG52YXIgbWlzc2xlQ291bnQ6IG51bWJlciA9IDA7XG5cbi8vIE1vcmUgcHJlbG9hZGVkIHN0dWZmXG5jb25zdCBzY3JlZW5zRm9yTWVudSA9IHtcbiAgICBcImlkXCI6IFwic2NyZWVuU3dpdGNoZXJcIixcbiAgICBcIm1lbnVTdGF0ZVwiOiBcIm1haW5NZW51XCIsXG4gICAgXCJtYWluTWVudVwiOiBuZXdHUUFuaW1hdGlvbihcImltZy9zY3JlZW5zL21haW5NZW51LnBuZ1wiKSxcbiAgICBcIm1haW5NZW51U2VsZWN0ZWRcIjogbmV3R1FBbmltYXRpb24oXCJpbWcvc2NyZWVucy9tYWluTWVudVNlbGVjdGVkLnBuZ1wiKSxcbiAgICBcIm1haW5NZW51U2VsZWN0ZWQyXCI6IG5ld0dRQW5pbWF0aW9uKFwiaW1nL3NjcmVlbnMvbWFpbk1lbnVTZWxlY3RlZDIucG5nXCIpLFxuICAgIFwibGVhZGVyYm9hcmRNZW51XCI6IG5ld0dRQW5pbWF0aW9uKFwiaW1nL3NjcmVlbnMvbGVhZGVyYm9hcmQucG5nXCIpLFxuICAgIFwibGVhZGVyYm9hcmRNZW51U2VsZWN0ZWRcIjogbmV3R1FBbmltYXRpb24oXCJpbWcvc2NyZWVucy9sZWFkZXJib2FyZFNlbGVjdGVkLnBuZ1wiKSxcbiAgICBcIndpblNjcmVlblwiOiBuZXdHUUFuaW1hdGlvbihcImltZy9zY3JlZW5zL3dpblNjcmVlbi5wbmdcIiksXG4gICAgXCJ3aW5TY3JlZW5TZWxlY3RlZFwiOiBuZXdHUUFuaW1hdGlvbihcImltZy9zY3JlZW5zL3dpblNjcmVlblNlbGVjdGVkLnBuZ1wiKVxufVxuXG5jb25zdCBwcmVsb2FkZWRBc3NldHMgPSB7XG4gICAgXCJjb250cm9sc1wiOiBuZXdHUUFuaW1hdGlvbihcImltZy91aS9jb250cm9scy5wbmdcIiksXG4gICAgXCJib3NzQ29udHJvbHNcIjogbmV3R1FBbmltYXRpb24oXCJpbWcvdWkvYm9zcy5wbmdcIiksXG4gICAgXCJiYWNrZ3JvdW5kXCI6IG5ld0dRQW5pbWF0aW9uKFwiaW1nL2dyb3VuZC9iYWNrZ3JvdW5kLnBuZ1wiKSxcbiAgICBcImlucHV0XCI6IG5ld0dRQW5pbWF0aW9uKFwiaW1nL3NjcmVlbnMvaW5wdXQucG5nXCIpLFxuICAgIFwid2F2ZTFcIjogbmV3R1FBbmltYXRpb24oXCJpbWcvZ3JvdW5kL3dhdmUucG5nXCIpLFxuICAgIFwid2F2ZTJcIjogbmV3R1FBbmltYXRpb24oXCJpbWcvZ3JvdW5kL3dhdmUyLnBuZ1wiKSxcbiAgICBcIjY0MHg2NDBcIjogbmV3R1FBbmltYXRpb24oXCJpbWcvZ3JvdW5kLzY0MHg2NDAucG5nXCIpLFxuICAgIFwiMjB4NDgwXCI6IG5ld0dRQW5pbWF0aW9uKFwiaW1nL2dyb3VuZC8yMHg0ODAucG5nXCIpLFxuICAgIFwiMTAweDIwXCI6IG5ld0dRQW5pbWF0aW9uKFwiaW1nL2dyb3VuZC8xMDB4MjAucG5nXCIpLFxuICAgIFwiMjB4MTAwXCI6IG5ld0dRQW5pbWF0aW9uKFwiaW1nL2dyb3VuZC8yMHgxMDAucG5nXCIpLFxuICAgIFwiMTAweDY0MFwiOiBuZXdHUUFuaW1hdGlvbihcImltZy9ncm91bmQvMTAweDY0MC5wbmdcIiksXG4gICAgXCIzOHgyOVwiOiBuZXdHUUFuaW1hdGlvbihcImltZy9ncm91bmQvMzh4MjkucG5nXCIpLFxuICAgIFwicGF1c2VNZW51XCI6IG5ld0dRQW5pbWF0aW9uKFwiaW1nL3VpL3BhdXNlLnBuZ1wiKSxcbiAgICBcIm1haW5PdmVybGF5XCI6IG5ld0dRQW5pbWF0aW9uKFwiaW1nL3VpL21haW5PdmVybGF5LnBuZ1wiKSxcbiAgICBcImJvc3NPdmVybGF5XCI6IG5ld0dRQW5pbWF0aW9uKFwiaW1nL3VpL2Jvc3NPdmVybGF5LnBuZ1wiKSxcbiAgICBcImRyb25lUHJlZGljdFwiOiBuZXdHUUFuaW1hdGlvbihcImltZy9lbmVtaWVzL2Ryb25lUHJlZGljdC5wbmdcIilcbn1cblxuLy8gVXRpbGl0eSBmdW5jdGlvbnNcbmNvbnN0IGxlcnAgPSAoYTogbnVtYmVyLCBiOiBudW1iZXIsIHQ6IG51bWJlcikgPT4gKDEgLSB0KSAqIGEgKyB0ICogYjtcbmNvbnN0IGNsYW1wID0gKG51bTogbnVtYmVyLCBtaW46IG51bWJlciwgbWF4OiBudW1iZXIpID0+IE1hdGgubWluKE1hdGgubWF4KG51bSwgbWluKSwgbWF4KTtcblxuLy8gRGlzYWJsZSByaWdodCBjbGljayBjb250ZXh0IG1lbnVcbmRpc2FibGVDb250ZXh0TWVudSgpO1xuXG4vLyBTdGFydCBTY3JlZW4hXG5jb25zdCBtYWluTWVudSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoc2NyZWVuc0Zvck1lbnVbXCJtZW51U3RhdGVcIl0uaW5jbHVkZXMoXCJtYWluXCIpKSB7XG4gICAgICAgIG1haW5TdGF0ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGxlYWRlcmJvYXJkU3RhdGUoKTtcbiAgICB9XG59XG5cbmNvbnN0IG1haW5TdGF0ZSA9IGZ1bmN0aW9uICgpIHtcblxuICAgIGlmIChnZXRNb3VzZVgoKSA8IDI3NSAmJiBnZXRNb3VzZVkoKSA8IDc1KSB7XG4gICAgICAgIGlmIChzY3JlZW5zRm9yTWVudVtcIm1lbnVTdGF0ZVwiXSAhPSBcIm1haW5NZW51U2VsZWN0ZWRcIikge1xuICAgICAgICAgICAgc2NyZWVuc0Zvck1lbnVbXCJtZW51U3RhdGVcIl0gPSBcIm1haW5NZW51U2VsZWN0ZWRcIjtcbiAgICAgICAgICAgIHNwcml0ZVNldEFuaW1hdGlvbihzY3JlZW5zRm9yTWVudVtcImlkXCJdLCBzY3JlZW5zRm9yTWVudVtcIm1haW5NZW51U2VsZWN0ZWRcIl0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChnZXRNb3VzZUJ1dHRvbjEoKSkge1xuICAgICAgICAgICAgaWYgKG1vdXNlRG93bkJlZm9yZSkgcmV0dXJuIC8vIFJldmVyc2UgY2hlY2tcbiAgICAgICAgICAgIHNjcmVlbnNGb3JNZW51W1wibWVudVN0YXRlXCJdID0gXCJsZWFkZXJib2FyZE1lbnVcIjtcbiAgICAgICAgICAgIHNwcml0ZVNldEFuaW1hdGlvbihzY3JlZW5zRm9yTWVudVtcImlkXCJdLCBzY3JlZW5zRm9yTWVudVtcImxlYWRlcmJvYXJkTWVudVwiXSk7XG4gICAgICAgICAgICBtb3VzZURvd25CZWZvcmUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChnZXRNb3VzZVgoKSA+IDE2NSAmJiBnZXRNb3VzZVgoKSA8IDQ4NSAmJiBnZXRNb3VzZVkoKSA+IDQwMCAmJiBnZXRNb3VzZVkoKSA8IDQzNSB8fCBnZXRLZXlTdGF0ZSgxMykpIHtcbiAgICAgICAgaWYgKHNjcmVlbnNGb3JNZW51W1wibWVudVN0YXRlXCJdICE9IFwibWFpbk1lbnVTZWxlY3RlZDJcIikge1xuICAgICAgICAgICAgc2NyZWVuc0Zvck1lbnVbXCJtZW51U3RhdGVcIl0gPSBcIm1haW5NZW51U2VsZWN0ZWQyXCI7XG4gICAgICAgICAgICBzcHJpdGVTZXRBbmltYXRpb24oc2NyZWVuc0Zvck1lbnVbXCJpZFwiXSwgc2NyZWVuc0Zvck1lbnVbXCJtYWluTWVudVNlbGVjdGVkMlwiXSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGdldE1vdXNlQnV0dG9uMSgpIHx8IGdldEtleVN0YXRlKDEzKSkge1xuICAgICAgICAgICAgaWYgKG1vdXNlRG93bkJlZm9yZSkgcmV0dXJuIC8vIFJldmVyc2UgY2hlY2tcbiAgICAgICAgICAgIHNjcmVlbnNGb3JNZW51W1wibWVudVN0YXRlXCJdID0gXCJcIjtcbiAgICAgICAgICAgIGdhbWVTdGF0ZSA9IFwicGxheWluZ1wiO1xuICAgICAgICAgICAgc3RhcnRHYW1lKCk7XG4gICAgICAgICAgICBtb3VzZURvd25CZWZvcmUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChnZXRLZXlTdGF0ZSg4MCkpIHtcbiAgICAgICAgc2tpcHBlZCA9IHRydWU7XG4gICAgICAgIGxldmVsTnVtYmVyID0gNjtcbiAgICAgICAgc2NyZWVuc0Zvck1lbnVbXCJtZW51U3RhdGVcIl0gPSBcIlwiO1xuICAgICAgICBnYW1lU3RhdGUgPSBcInBsYXlpbmdcIjtcbiAgICAgICAgc3RhcnRHYW1lKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHNjcmVlbnNGb3JNZW51W1wibWVudVN0YXRlXCJdICE9IFwibWFpbk1lbnVcIikge1xuICAgICAgICAgICAgc2NyZWVuc0Zvck1lbnVbXCJtZW51U3RhdGVcIl0gPSBcIm1haW5NZW51XCI7XG4gICAgICAgICAgICBzcHJpdGVTZXRBbmltYXRpb24oc2NyZWVuc0Zvck1lbnVbXCJpZFwiXSwgc2NyZWVuc0Zvck1lbnVbXCJtYWluTWVudVwiXSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmNvbnN0IHNjb3JlU3ByaXRlTmFtZXMgPSBbXCJzY29yZWJvYXJkRGlzcGxheVJhbmtzXCIsIFwic2NvcmVib2FyZERpc3BsYXlUaW1lc1wiLCBcInNjb3JlYm9hcmREaXNwbGF5TmFtZXNcIl1cblxuY29uc3QgbGVhZGVyYm9hcmRTdGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXNwcml0ZUV4aXN0cyhcInNjb3JlYm9hcmREaXNwbGF5VGltZXNcIikpIGxlYWRlcmJvYXJkTG9naWMoKTsgLy8gc28gaXQgZG9lcyBpdCBqdXN0IG9uY2VcbiAgICBpZiAoZ2V0TW91c2VYKCkgPiAyODAgJiYgZ2V0TW91c2VYKCkgPCAzNjAgJiYgZ2V0TW91c2VZKCkgPiA0MjAgJiYgZ2V0TW91c2VZKCkgPCA0NTUpIHtcbiAgICAgICAgaWYgKHNjcmVlbnNGb3JNZW51W1wibWVudVN0YXRlXCJdICE9IFwibGVhZGVyYm9hcmRNZW51U2VsZWN0ZWRcIikge1xuICAgICAgICAgICAgc2NyZWVuc0Zvck1lbnVbXCJtZW51U3RhdGVcIl0gPSBcImxlYWRlcmJvYXJkTWVudVNlbGVjdGVkXCI7XG4gICAgICAgICAgICBzcHJpdGVTZXRBbmltYXRpb24oc2NyZWVuc0Zvck1lbnVbXCJpZFwiXSwgc2NyZWVuc0Zvck1lbnVbXCJsZWFkZXJib2FyZE1lbnVTZWxlY3RlZFwiXSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGdldE1vdXNlQnV0dG9uMSgpKSB7XG4gICAgICAgICAgICBpZiAobW91c2VEb3duQmVmb3JlKSByZXR1cm4gLy8gUmV2ZXJzZSBjaGVja1xuICAgICAgICAgICAgc2NyZWVuc0Zvck1lbnVbXCJtZW51U3RhdGVcIl0gPSBcIm1haW5NZW51XCI7XG4gICAgICAgICAgICBzY29yZVNwcml0ZU5hbWVzLmZvckVhY2goc3ByaXRlID0+IHJlbW92ZVNwcml0ZShzcHJpdGUpKTtcbiAgICAgICAgICAgIHNwcml0ZVNldEFuaW1hdGlvbihzY3JlZW5zRm9yTWVudVtcImlkXCJdLCBzY3JlZW5zRm9yTWVudVtcIm1haW5NZW51XCJdKTtcbiAgICAgICAgICAgIG1vdXNlRG93bkJlZm9yZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoc2NyZWVuc0Zvck1lbnVbXCJtZW51U3RhdGVcIl0gIT0gXCJsZWFkZXJib2FyZE1lbnVcIikge1xuICAgICAgICAgICAgc2NyZWVuc0Zvck1lbnVbXCJtZW51U3RhdGVcIl0gPSBcImxlYWRlcmJvYXJkTWVudVwiO1xuICAgICAgICAgICAgc3ByaXRlU2V0QW5pbWF0aW9uKHNjcmVlbnNGb3JNZW51W1wiaWRcIl0sIHNjcmVlbnNGb3JNZW51W1wibGVhZGVyYm9hcmRNZW51XCJdKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuY29uc3QgbGVhZGVyYm9hcmRMb2dpYyA9IGFzeW5jICgpID0+IHtcbiAgICAvLyBDcmVhdGUgc3ByaXRlcyBmaXJzdCBzbyB3ZSBjYW4gY2hlY2sgaWYgdGhpcyBmdW5jIGhhcyBhbHJlYWR5IHJ1blxuICAgIGNyZWF0ZVRleHRTcHJpdGVJbkdyb3VwKHRleHRHcm91cE5hbWUsIFwic2NvcmVib2FyZERpc3BsYXlSYW5rc1wiLCA0MDAsIDUwMCwgUExBWUdST1VORF9XSURUSCAvIDIgLSAzOTAsIFBMQVlHUk9VTkRfSEVJR0hUIC8gMiAtIDUwKTtcbiAgICBjcmVhdGVUZXh0U3ByaXRlSW5Hcm91cCh0ZXh0R3JvdXBOYW1lLCBcInNjb3JlYm9hcmREaXNwbGF5VGltZXNcIiwgNDAwLCA1MDAsIFBMQVlHUk9VTkRfV0lEVEggLyAyIC0gMjAwLCBQTEFZR1JPVU5EX0hFSUdIVCAvIDIgLSA1MCk7XG4gICAgY3JlYXRlVGV4dFNwcml0ZUluR3JvdXAodGV4dEdyb3VwTmFtZSwgXCJzY29yZWJvYXJkRGlzcGxheU5hbWVzXCIsIDQwMCwgNTAwLCBQTEFZR1JPVU5EX1dJRFRIIC8gMiAtIDE1LCBQTEFZR1JPVU5EX0hFSUdIVCAvIDIgLSA1MCk7XG4gICAgc2NvcmVTcHJpdGVOYW1lcy5mb3JFYWNoKHNwcml0ZU5hbWUgPT4gc3ByaXRlKHNwcml0ZU5hbWUpLmNzcyhcImZvbnQtZmFtaWx5XCIsIFwiVGFob21hXCIpLmNzcyhcImZvbnQtc2l6ZVwiLCBcIjIwcHRcIikuY3NzKFwidGV4dC1hbGlnblwiLCBcImNlbnRlclwiKS5jc3MoXCJiYWNrZ3JvdW5kLWNvbG9yXCIsIFwicmdiYSgwLCAwLCAwLCAwKVwiKS5jc3MoXCJjb2xvclwiLCBcInJnYmEoNjIsIDM0LCA1OCwgMTAwKVwiKSk7XG5cbiAgICAvLyBTZXQgYSBsb2FkaW5nIHNwcml0ZSBhbmQgYXdhaXQgdGhlIGRhdGFiYXNlIGRhdGFcbiAgICBzcHJpdGUoXCJzY29yZWJvYXJkRGlzcGxheVRpbWVzXCIpLmh0bWwoXCJMb2FkaW5nIExlYWRlcmJvYXJkLi4uXCIpO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgbGVhZGVyQm9hcmREYXRhID0gYXdhaXQgbGVhZGVyYm9hcmRDUlVEKHsgXCJtZXNzYWdlXCI6IFwiY2hlY2tEQlwiIH0pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBzcHJpdGUoXCJzY29yZWJvYXJkRGlzcGxheVRpbWVzXCIpLmh0bWwoXCJMb2FkIGZhaWxlZC5cIik7XG4gICAgfVxuXG4gICAgLy8gVGhpcyB1c2VzIHRoZSBTY2h3YXJ0emlhbiB0cmFuc2Zvcm0sIGJlY2F1c2UgeW91IGNhbid0IHNvcnQgYSBkaWN0IChhdCBsZWFzdCB0byBteSB1bmRlcnN0YW5kaW5nKVxuICAgIHZhciBpdGVtcyA9IE9iamVjdC5rZXlzKGxlYWRlckJvYXJkRGF0YSkubWFwKChrZXkpID0+IHsgcmV0dXJuIFtrZXksIGxlYWRlckJvYXJkRGF0YVtrZXldXSB9KTtcbiAgICBpdGVtcy5zb3J0KChmaXJzdCwgc2Vjb25kKSA9PiB7IHJldHVybiArZmlyc3RbMV0gLSArc2Vjb25kWzFdIH0pOyAvLyBXaHkgYW0gSSBkb2luZyB0aGUgJyt4IC0gK3gnPyAqU29tZXRpbWVzKiB0aHJvd3MgcmFuZG9tIGVycm9yICh0cygyMzYyKSkgaWYgbm90IGRvbmUgbGlrZSB0aGlzLlxuICAgIHZhciBrZXlzID0gaXRlbXMubWFwKChlKSA9PiB7IHJldHVybiBlWzBdIH0pO1xuXG4gICAgLy8gRmlyc3QgbWFrZSBhIGxpc3Qgb2YgdG9wIDhcbiAgICB2YXIgW2Rpc3BsYXlSYW5rcywgZGlzcGxheVRpbWVzLCBkaXNwbGF5TmFtZXNdOiBzdHJpbmdbXSA9IFtcIlwiLCBcIlwiLCBcIlwiXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDg7IGkrKykge1xuICAgICAgICAvLyBCcmVhayBpZiB0aW1lIGlzIE5hTiwgQUtBIG5vIG1vcmUgZXhpc3RpbmcgaXRlbXMgb24gbGlzdFxuICAgICAgICBsZXQgcGxheWVyVGltZSA9IGxlYWRlckJvYXJkRGF0YVtrZXlzW2ldXTtcbiAgICAgICAgaWYgKCFwbGF5ZXJUaW1lKSBicmVhaztcblxuICAgICAgICAvLyBBZGQgdG8gZGlzcGxheSB2YXJcbiAgICAgICAgZGlzcGxheVRpbWVzID0gZGlzcGxheVRpbWVzICsgYCR7bmV3IERhdGUocGxheWVyVGltZSkudG9JU09TdHJpbmcoKS5zbGljZSgxMSwgLTEpfWAgKyBcIjxicj5cIjtcbiAgICAgICAgZGlzcGxheU5hbWVzID0gZGlzcGxheU5hbWVzICsga2V5c1tpXSArIFwiPGJyPlwiO1xuICAgICAgICAvLyBVc2UgYSByZWd1bGFyIGV4cHJlc3Npb24gdG8gZXh0cmFjdCB0aGUgbGFzdCBkaWdpdCBvZiB0aGUgbnVtYmVyIGFuZCBhcHBlbmQgdGhlIGFwcHJvcHJpYXRlIG9yZGluYWwgc3VmZml4XG4gICAgICAgIGRpc3BsYXlSYW5rcyA9IGRpc3BsYXlSYW5rcyArIChpICsgMSkudG9TdHJpbmcoKS5yZXBsYWNlKC9cXGQrJC8sIChtYXRjaDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbWF0Y2ggKyAobWF0Y2ggPT09IFwiMVwiID8gXCJzdFwiIDogbWF0Y2ggPT09IFwiMlwiID8gXCJuZFwiIDogbWF0Y2ggPT09IFwiM1wiID8gXCJyZFwiIDogXCJ0aFwiKTtcbiAgICAgICAgfSkgKyBcIjxicj5cIjtcbiAgICB9XG5cbiAgICAvLyBEaXNwbGF5IHRoZSBkaXNwbGF5IHZhcnNcbiAgICBjb25zdCB2YWx1ZXMgPSBbZGlzcGxheVJhbmtzLCBkaXNwbGF5VGltZXMsIGRpc3BsYXlOYW1lc107XG4gICAgc2NvcmVTcHJpdGVOYW1lcy5mb3JFYWNoKChzcHJpdGVOYW1lLCBpbmRleCkgPT4geyBzcHJpdGUoc3ByaXRlTmFtZSkuaHRtbCh2YWx1ZXNbaW5kZXhdKSB9KTtcbn1cblxuY29uc3Qgd2luU2NyZWVuID0gKCkgPT4ge1xuICAgIGlmIChnZXRNb3VzZVgoKSA+IDEwMCAmJiBnZXRNb3VzZVgoKSA8IDU1NSAmJiBnZXRNb3VzZVkoKSA+IDQwMCAmJiBnZXRNb3VzZVkoKSA8IDQ2NSB8fCBnZXRLZXlTdGF0ZSgxMykpIHtcbiAgICAgICAgaWYgKHNjcmVlbnNGb3JNZW51W1wibWVudVN0YXRlXCJdICE9IFwid2luU2NyZWVuU2VsZWN0ZWRcIikge1xuICAgICAgICAgICAgc2NyZWVuc0Zvck1lbnVbXCJtZW51U3RhdGVcIl0gPSBcIndpblNjcmVlblNlbGVjdGVkXCI7XG4gICAgICAgICAgICBzcHJpdGVTZXRBbmltYXRpb24oc2NyZWVuc0Zvck1lbnVbXCJpZFwiXSwgc2NyZWVuc0Zvck1lbnVbXCJ3aW5TY3JlZW5TZWxlY3RlZFwiXSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGdldE1vdXNlQnV0dG9uMSgpIHx8IGdldEtleVN0YXRlKDEzKSkge1xuICAgICAgICAgICAgY3JlYXRlU3ByaXRlSW5Hcm91cCh1aUdyb3VwTmFtZSwgXCJvdmVybGF5U3ByaXRlXCIsIHByZWxvYWRlZEFzc2V0c1tcIm1haW5PdmVybGF5XCJdLCBQTEFZR1JPVU5EX1dJRFRILCBQTEFZR1JPVU5EX0hFSUdIVCk7XG4gICAgICAgICAgICBpZiAobW91c2VEb3duQmVmb3JlKSByZXR1cm47XG4gICAgICAgICAgICBzY3JlZW5zRm9yTWVudVtcIm1lbnVTdGF0ZVwiXSA9IFwibWFpbk1lbnVcIjtcbiAgICAgICAgICAgIGdhbWVTdGF0ZSA9IFwibWVudVwiO1xuICAgICAgICAgICAgbW91c2VEb3duQmVmb3JlID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChzY3JlZW5zRm9yTWVudVtcIm1lbnVTdGF0ZVwiXSAhPSBcIndpblNjcmVlblwiKSB7XG4gICAgICAgICAgICBzY3JlZW5zRm9yTWVudVtcIm1lbnVTdGF0ZVwiXSA9IFwid2luU2NyZWVuXCI7XG4gICAgICAgICAgICBzcHJpdGVTZXRBbmltYXRpb24oc2NyZWVuc0Zvck1lbnVbXCJpZFwiXSwgc2NyZWVuc0Zvck1lbnVbXCJ3aW5TY3JlZW5cIl0pO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5sZXQgc2V0dXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgY3JlYXRlU3ByaXRlSW5Hcm91cChiYWNrZ3JvdW5kR3JvdXBOYW1lLCBzY3JlZW5zRm9yTWVudVtcImlkXCJdLCBzY3JlZW5zRm9yTWVudVtcIm1haW5NZW51XCJdLCBQTEFZR1JPVU5EX1dJRFRILCBQTEFZR1JPVU5EX0hFSUdIVCk7XG4gICAgY3JlYXRlU3ByaXRlSW5Hcm91cCh1aUdyb3VwTmFtZSwgXCJvdmVybGF5U3ByaXRlXCIsIHByZWxvYWRlZEFzc2V0c1tcIm1haW5PdmVybGF5XCJdLCBQTEFZR1JPVU5EX1dJRFRILCBQTEFZR1JPVU5EX0hFSUdIVCk7XG59O1xuXG5jb25zdCBuZXdCbG9jayA9IGZ1bmN0aW9uICh4UG9zOiBudW1iZXIsIHlQb3M6IG51bWJlciwgYmxvY2tTaXplOiBzdHJpbmcpIHtcbiAgICBpZiAoYmxvY2tTaXplLmluY2x1ZGVzKFwiTUJcIikpIHtcbiAgICAgICAgLyogSG93IG1vdmluZyBwbGF0Zm9ybXMgYXJlIGhhbmRsZWQuIElmIHRoZSBzaXplIGluY2x1ZGVzICdNQicgaXQgaXMgcGFyc2VkIGRpZmZlcmVudGx5LCBhbmQgaGFzIG1vcmUgdmFsdWVzXG4gICAgICAgICAqIFRha2VzOiBcIk1COiAxMDB4MjAgUkc6IDEwMCwxMDAwLDAsMCBTUDogNSwwXCIgUmV0dXJuczogW1wiMTAwXCIsIFwiMjBcIiwgXCIxMDBcIiwgXCIxMDAwXCIsIFwiMFwiLCBcIjBcIiwgXCI1XCIsIFwiMFwiXVxuICAgICAgICAgKiBJbmRleCBWYWx1ZXM6ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDAgICAgICAxICAgICAyICAgICAgMyAgICAgICA0ICAgIDUgICAgNiAgICA3XG4gICAgICAgICAqICAwIGFuZCAxLT4gd2lkdGgsIGhlaWdodFxuICAgICAgICAgKiAgMiBhbmQgMyAtPiBtaW5YUG9zLCBtYXhYUG9zXG4gICAgICAgICAqICA0IGFuZCA1IC0+IG1pbllQb3MsIG1heFlQb3NcbiAgICAgICAgICogIDYgYW5kIDcgLT4geFNwZWVkLCB5U3BlZWRcbiAgICAgICAgKi9cbiAgICAgICAgY29uc3Qgc3BlY2lhbFZhbHMgPSBibG9ja1NpemUubWF0Y2goLy0/XFxkKy9nKTtcbiAgICAgICAgaWYgKHNwZWNpYWxWYWxzID09IG51bGwpIHJldHVybiBjb25zb2xlUHJpbnQoXCJZb3UgbWFkZSBhIG1pc3Rha2UgaW5wdXR0aW5nIHZhbHVlcyBpbnRvIGEgbW92aW5nYmxvY2tcIik7XG4gICAgICAgIHZhciB3aWR0aCA9IHBhcnNlSW50KHNwZWNpYWxWYWxzWzBdKTtcbiAgICAgICAgdmFyIGhlaWdodCA9IHBhcnNlSW50KHNwZWNpYWxWYWxzWzFdKTtcbiAgICAgICAgdmFyIFttaW5YUG9zLCBtYXhYUG9zXSA9IFtwYXJzZUludChzcGVjaWFsVmFsc1syXSksIHBhcnNlSW50KHNwZWNpYWxWYWxzWzNdKV07XG4gICAgICAgIHZhciBbbWluWVBvcywgbWF4WVBvc10gPSBbcGFyc2VJbnQoc3BlY2lhbFZhbHNbNF0pLCBwYXJzZUludChzcGVjaWFsVmFsc1s1XSldO1xuICAgICAgICB2YXIgW3hTcGVlZCwgeVNwZWVkXSA9IFtwYXJzZUludChzcGVjaWFsVmFsc1s2XSksIHBhcnNlSW50KHNwZWNpYWxWYWxzWzddKV07XG4gICAgICAgIGJsb2NrU2l6ZSA9IGAke3NwZWNpYWxWYWxzWzBdfXgke3NwZWNpYWxWYWxzWzFdfWA7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHdpZHRoID0gcGFyc2VJbnQoYmxvY2tTaXplLnNwbGl0KFwieFwiKVswXSk7XG4gICAgICAgIHZhciBoZWlnaHQgPSBwYXJzZUludChibG9ja1NpemUuc3BsaXQoXCJ4XCIpWzFdKTtcbiAgICAgICAgdmFyIFttaW5YUG9zLCBtYXhYUG9zXSA9IFswLCAwXTtcbiAgICAgICAgdmFyIFttaW5ZUG9zLCBtYXhZUG9zXSA9IFswLCAwXTtcbiAgICAgICAgdmFyIFt4U3BlZWQsIHlTcGVlZF0gPSBbMCwgMF07XG4gICAgfVxuXG4gICAgdmFyIGkgPSBsZXZlbEJsb2Nrcy5sZW5ndGg7IC8vIEF1dG8tdXBkYXRpbmcgaW5kZXhcbiAgICB2YXIgbmV3QmxvY2tJbmZvOiBCbG9ja0RpY3QgPSB7XG4gICAgICAgIFwiaWRcIjogXCJibG9ja1wiICsgaSxcbiAgICAgICAgXCJ3aWR0aFwiOiB3aWR0aCxcbiAgICAgICAgXCJoZWlnaHRcIjogaGVpZ2h0LFxuICAgICAgICBcInhQb3NcIjogeFBvcyxcbiAgICAgICAgXCJ5UG9zXCI6IHlQb3MsXG4gICAgICAgIFwieFNwZWVkXCI6IHhTcGVlZCxcbiAgICAgICAgXCJ5U3BlZWRcIjogeVNwZWVkLFxuICAgICAgICBcIm1pblhQb3NcIjogbWluWFBvcyxcbiAgICAgICAgXCJtYXhYUG9zXCI6IG1heFhQb3MsXG4gICAgICAgIFwibWluWVBvc1wiOiBtaW5ZUG9zLFxuICAgICAgICBcIm1heFlQb3NcIjogbWF4WVBvcyxcbiAgICAgICAgXCI2NDB4NjQwXCI6IHByZWxvYWRlZEFzc2V0c1tcIjY0MHg2NDBcIl0sXG4gICAgICAgIFwiMjB4NDgwXCI6IHByZWxvYWRlZEFzc2V0c1tcIjIweDQ4MFwiXSxcbiAgICAgICAgXCIxMDB4MjBcIjogcHJlbG9hZGVkQXNzZXRzW1wiMTAweDIwXCJdLFxuICAgICAgICBcIjIweDEwMFwiOiBwcmVsb2FkZWRBc3NldHNbXCIyMHgxMDBcIl0sXG4gICAgICAgIFwiMTAweDY0MFwiOiBwcmVsb2FkZWRBc3NldHNbXCIxMDB4NjQwXCJdLFxuICAgICAgICBcIjM4eDI5XCI6IHByZWxvYWRlZEFzc2V0c1tcIjM4eDI5XCJdXG4gICAgfTtcblxuICAgIGxldmVsQmxvY2tzW2ldID0gbmV3QmxvY2tJbmZvO1xuICAgIGNyZWF0ZVNwcml0ZUluR3JvdXAoKGJsb2NrU2l6ZSA9PSBcIjM4eDI5XCIpID8gYm91bmNlR3JvdXBOYW1lIDogY29sbGlzaW9uR3JvdXBOYW1lLCBuZXdCbG9ja0luZm9bXCJpZFwiXSwgbmV3QmxvY2tJbmZvW2Jsb2NrU2l6ZV0sIG5ld0Jsb2NrSW5mb1tcIndpZHRoXCJdLCBuZXdCbG9ja0luZm9bXCJoZWlnaHRcIl0sIG5ld0Jsb2NrSW5mb1tcInhQb3NcIl0gKyB4T2Zmc2V0LCBuZXdCbG9ja0luZm9bXCJ5UG9zXCJdICsgeU9mZnNldCk7XG59XG5cbmNvbnN0IHNwYXduTWlzc2xlID0gZnVuY3Rpb24gKHhQb3M6IG51bWJlciwgeVBvczogbnVtYmVyKSB7XG4gICAgLy8gSW5zdGFuY2UgdGhlIG1pc3NpbGVcbiAgICBtaXNzbGVDb3VudCsrO1xuICAgIHZhciBtaXNzaWxlSW5mbzogU3ByaXRlRGljdCA9IHtcbiAgICAgICAgXCJpZFwiOiBcIm1pc3NpbGVcIiArIG1pc3NsZUNvdW50LFxuICAgICAgICBcIndpZHRoXCI6IDI0LFxuICAgICAgICBcImhlaWdodFwiOiAxNCxcbiAgICAgICAgXCJ4UG9zXCI6IHhQb3MsXG4gICAgICAgIFwieVBvc1wiOiB5UG9zLFxuICAgICAgICBcInhTcGVlZFwiOiAwLFxuICAgICAgICBcInlTcGVlZFwiOiAwLFxuICAgICAgICBcInhUYXJnZXRcIjogcGxheWVyRGF0YVtcInhQb3NcIl0sXG4gICAgICAgIFwieVRhcmdldFwiOiBwbGF5ZXJEYXRhW1wieVBvc1wiXSxcbiAgICAgICAgXCJhbmltXCI6IG5ld0dRQW5pbWF0aW9uKFwiaW1nL2VuZW1pZXMvbWlzc2lsZS5wbmdcIilcbiAgICB9O1xuICAgIG1pc3NpbGVzLnB1c2gobWlzc2lsZUluZm8pO1xuICAgIGNyZWF0ZVNwcml0ZUluR3JvdXAoZW5lbXlHcm91cE5hbWUsIG1pc3NpbGVJbmZvW1wiaWRcIl0sIG1pc3NpbGVJbmZvW1wiYW5pbVwiXSwgbWlzc2lsZUluZm9bXCJ3aWR0aFwiXSwgbWlzc2lsZUluZm9bXCJoZWlnaHRcIl0sIG1pc3NpbGVJbmZvW1wieFBvc1wiXSArIHhPZmZzZXQsIG1pc3NpbGVJbmZvW1wieVBvc1wiXSArIHlPZmZzZXQpO1xuXG4gICAgLy8gTWFrZSB0aGUgbWlzc2lsZSBwb2ludCB0b3dhcmRzIGl0cyB0YXJnZXRcbiAgICB2YXIgYW5nbGUgPSBNYXRoLmF0YW4yKG1pc3NpbGVJbmZvW1wieVRhcmdldFwiXSAtIG1pc3NpbGVJbmZvW1wieVBvc1wiXSwgbWlzc2lsZUluZm9bXCJ4VGFyZ2V0XCJdIC0gbWlzc2lsZUluZm9bXCJ4UG9zXCJdKTtcblxuICAgIC8vIENvbnZlcnQgdGhlIGFuZ2xlIHRvIGRlZ3JlZXMgKGRlZ3JlZXMgdG8gcmFkaWFucylcbiAgICBhbmdsZSA9IGFuZ2xlICogKDE4MCAvIE1hdGguUEkpO1xuXG4gICAgLy8gUm90YXRlIHRoZSBtaXNzaWxlIHRvd2FyZHMgdGhlIHBsYXllclxuICAgIHNwcml0ZVJvdGF0ZShtaXNzaWxlSW5mb1tcImlkXCJdLCBhbmdsZSlcblxuICAgIC8vIENhbGN1bGF0ZSB0aGUgdmVsb2NpdHkgdmVjdG9yIHVzaW5nIHRyaWdvbm9tZXRyeVxuICAgIG1pc3NpbGVJbmZvW1wieFNwZWVkXCJdID0gTWF0aC5jb3MoYW5nbGUgKiAoTWF0aC5QSSAvIDE4MCkpICogMTA7XG4gICAgbWlzc2lsZUluZm9bXCJ5U3BlZWRcIl0gPSBNYXRoLnNpbihhbmdsZSAqIChNYXRoLlBJIC8gMTgwKSkgKiAxMDtcbn1cblxuXG4vLyBTdGFydCB0aW1lciBhbmQgYmVnaW5cbmNvbnN0IHN0YXJ0R2FtZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBSZW1vdmUgbWVudVxuICAgIGlmIChzcHJpdGVFeGlzdHMoc2NyZWVuc0Zvck1lbnVbXCJpZFwiXSkpIHJlbW92ZVNwcml0ZShzY3JlZW5zRm9yTWVudVtcImlkXCJdKVxuXG4gICAgLy8gQ29udHJvbHMgZ3VpZGVcbiAgICBjcmVhdGVTcHJpdGVJbkdyb3VwKHVpR3JvdXBOYW1lLCBcImNvbnRyb2xzXCIsIHByZWxvYWRlZEFzc2V0c1tcImNvbnRyb2xzXCJdLCAzMDYsIDMyNiwgUExBWUdST1VORF9XSURUSCAvIDIgLSAxNTMsIFBMQVlHUk9VTkRfSEVJR0hUIC8gMiAtIDE2MylcblxuICAgIC8vIFJlc2V0IHRoZSB0aW1lciBpbiBjYXNlIHRoZXkgc3RheWVkIG9uIHRoZSBtZW51IGZvciBhIHdoaWxlXG4gICAgc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcblxuICAgIC8vIFNldHVwIGxldmVsICMxXG4gICAgc2V0dXBMZXZlbCgpO1xuXG4gICAgLy8gU2hvdyB0aGUgZGVidWcgbWVudSB0aGluZyBJIHVzZVxuICAgIGlmIChkZWJ1ZykgY3JlYXRlVGV4dFNwcml0ZUluR3JvdXAodGV4dEdyb3VwTmFtZSwgXCJkZWJ1Z1Nob3duXCIsIDgwMCwgMzAsIDAsIDApO1xuXG4gICAgLy8gVGltZXJcbiAgICBjcmVhdGVUZXh0U3ByaXRlSW5Hcm91cCh0ZXh0R3JvdXBOYW1lLCBcInNwZWVkcnVuVGltZXJcIiwgMzAwLCA2MCwgMTAsIDEwKTtcbiAgICBzcHJpdGUoXCJzcGVlZHJ1blRpbWVyXCIpLmNzcyhcImZvbnQtZmFtaWx5XCIsIFwiVGFob21hXCIpLmNzcyhcImJhY2tncm91bmQtY29sb3JcIiwgXCJyZ2JhKDAsIDAsIDAsIDApXCIpLmNzcyhcImZvbnQtc2l6ZVwiLCBcIjIwcHRcIik7XG5cbiAgICAvLyBQbGF5ZXIgU3ByaXRlIGFuZCBIaXRib3hcbiAgICBjcmVhdGVTcHJpdGVJbkdyb3VwKHBsYXllckdyb3VwTmFtZSwgcGxheWVyRGF0YVtcInNwcml0ZUlkXCJdLCBwbGF5ZXJEYXRhW1wiYW5pbUp1bXBTdHJhaWdodFwiXSwgcGxheWVyRGF0YVtcInNwcml0ZVdpZHRoXCJdLCBwbGF5ZXJEYXRhW1wic3ByaXRlSGVpZ2h0XCJdLCBwbGF5ZXJEYXRhW1wieFBvc1wiXSwgcGxheWVyRGF0YVtcInlQb3NcIl0pO1xuICAgIGNyZWF0ZVNwcml0ZUluR3JvdXAocGxheWVyR3JvdXBOYW1lLCBwbGF5ZXJEYXRhW1wiaGl0Ym94SWRcIl0sIHBsYXllckRhdGFbXCJhbmltSGl0Ym94XCJdLCBwbGF5ZXJEYXRhW1wiaGl0Ym94V2lkdGhcIl0sIHBsYXllckRhdGFbXCJoaXRib3hIZWlnaHRcIl0sIHBsYXllckRhdGFbXCJ4UG9zXCJdLCBwbGF5ZXJEYXRhW1wieVBvc1wiXSk7XG5cbiAgICAvLyBCYWNrZ3JvdW5kXG4gICAgaWYgKCFzcHJpdGVFeGlzdHMoXCJiYWNrZ3JvdW5kSW1hZ2VcIikpIGNyZWF0ZVNwcml0ZUluR3JvdXAoYmFja2dyb3VuZEdyb3VwTmFtZSwgXCJiYWNrZ3JvdW5kSW1hZ2VcIiwgcHJlbG9hZGVkQXNzZXRzW1wiYmFja2dyb3VuZFwiXSwgUExBWUdST1VORF9XSURUSCwgUExBWUdST1VORF9IRUlHSFQsIDAsIDApO1xuXG4gICAgLy8gQ3JlYXRlIDIgd2F2ZXM6IHdhdmUxIGFuZCB3YXZlMlxuICAgIGNyZWF0ZVNwcml0ZUluR3JvdXAoYmFja2dyb3VuZEdyb3VwTmFtZSwgXCJ3YXZlMVwiLCBwcmVsb2FkZWRBc3NldHNbXCJ3YXZlMVwiXSwgUExBWUdST1VORF9XSURUSCAqIDUsIFBMQVlHUk9VTkRfSEVJR0hULCAwLCAwKTtcbiAgICBjcmVhdGVTcHJpdGVJbkdyb3VwKGJhY2tncm91bmRHcm91cE5hbWUsIFwid2F2ZTJcIiwgcHJlbG9hZGVkQXNzZXRzW1wid2F2ZTJcIl0sIFBMQVlHUk9VTkRfV0lEVEggKiA1LCBQTEFZR1JPVU5EX0hFSUdIVCwgMCwgMCk7XG59XG5cblxuY29uc3Qgc2V0dXBMZXZlbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBSZW1vdmUgb2xkIGxldmVsXG4gICAgbGV2ZWxCbG9ja3MuZm9yRWFjaCgoYmxvY2spID0+IHsgcmVtb3ZlU3ByaXRlKGJsb2NrW1wiaWRcIl0pOyB9KTtcbiAgICBsZXZlbEJsb2NrcyA9IFtdO1xuXG4gICAgLy8gU2V0IHVwIG5ldyBsZXZlbFxuICAgIGNvbnN0IGRhdGEgPSBsZXZlbERhdGFbbGV2ZWxOdW1iZXJdO1xuICAgIGRhdGEuZm9yRWFjaCgoeyB4LCB5LCBzaXplIH0pID0+IHsgbmV3QmxvY2soeCwgeSwgc2l6ZSkgfSk7XG5cbiAgICAvLyBTcGVjaWFsIGNvbmRpdGlvbnMgZm9yIHRoZSBib3NzIGZpZ2h0IVxuICAgIGlmIChsZXZlbE51bWJlciA9PSA2KSB7XG4gICAgICAgIGxldmVsNlNldHVwKCk7XG4gICAgfVxufVxuXG5jb25zdCBsZXZlbDZTZXR1cCA9ICgpID0+IHtcbiAgICBpZiAoIXNwcml0ZUV4aXN0cyhkcm9uZURhdGFbXCJpZFwiXSkpIHtcbiAgICAgICAgbWluWCA9IDEwO1xuICAgICAgICBjcmVhdGVSZWN0SW5Hcm91cCh0ZXh0R3JvdXBOYW1lLCBcImhlYWx0aEJhck1haW5cIiwgNTIsIDcyLCA1NDAsIDEwLCBcIiM3NkI5NDdcIiwgMCwgMCwgMCk7XG4gICAgICAgIGNyZWF0ZVNwcml0ZUluR3JvdXAoZW5lbXlHcm91cE5hbWUsIGRyb25lRGF0YVtcImlkXCJdLCBkcm9uZURhdGFbXCJkcm9uZUZseVwiXSwgZHJvbmVEYXRhW1wid2lkdGhcIl0sIGRyb25lRGF0YVtcImhlaWdodFwiXSwgZHJvbmVEYXRhW1wieFBvc1wiXSwgZHJvbmVEYXRhW1wieVBvc1wiXSk7XG4gICAgICAgIHNwcml0ZVNldEFuaW1hdGlvbihcIm92ZXJsYXlTcHJpdGVcIiwgcHJlbG9hZGVkQXNzZXRzW1wiYm9zc092ZXJsYXlcIl0pO1xuICAgICAgICBjcmVhdGVSZWN0SW5Hcm91cCh0ZXh0R3JvdXBOYW1lLCBcImhlYWx0aEJhclNlY29uZFwiLCA1MCwgNzAsIDU0NCwgMTQsIFwiIzE3MTcxN1wiLCAwLCAwLCAwKTtcbiAgICAgICAgY3JlYXRlUmVjdEluR3JvdXAodGV4dEdyb3VwTmFtZSwgXCJoZWFsdGhCYXJCYWNrXCIsIDUyLCA3MiwgNTQwLCAxMCwgXCIjRkY1QzVDXCIsIDAsIDAsIDApO1xuICAgICAgICBjcmVhdGVUZXh0U3ByaXRlSW5Hcm91cCh0ZXh0R3JvdXBOYW1lLCBcImJvc3NCYXJUZXh0XCIsIDU0MCwgNTAsIDQwLCA0MClcbiAgICAgICAgc3ByaXRlKFwiYm9zc0JhclRleHRcIikuY3NzKFwiZm9udC1mYW1pbHlcIiwgXCJUYWhvbWFcIikuY3NzKFwiYmFja2dyb3VuZC1jb2xvclwiLCBcInJnYmEoMCwgMCwgMCwgMClcIikuY3NzKFwiZm9udC1zaXplXCIsIFwiMjBwdFwiKS5jc3MoXCJ0ZXh0LWFsaWduXCIsIFwiY2VudGVyXCIpO1xuICAgICAgICBzcHJpdGUoXCJib3NzQmFyVGV4dFwiKS5odG1sKFwiRXZpbCBJbmM6IERyb25pZVwiKVxuICAgICAgICBjcmVhdGVTcHJpdGVJbkdyb3VwKHVpR3JvdXBOYW1lLCBcImJvc3NDb250cm9sc1wiLCBwcmVsb2FkZWRBc3NldHNbXCJib3NzQ29udHJvbHNcIl0sIDMwNywgMzI5LCBQTEFZR1JPVU5EX1dJRFRIIC8gMiAtIDE1MywgUExBWUdST1VORF9IRUlHSFQgLyAyIC0gMTYzKVxuICAgIH0gZWxzZSB7XG4gICAgICAgIG1pc3NpbGVzLmZvckVhY2gobWlzc2lsZSA9PiB7IHJlbW92ZVNwcml0ZShtaXNzaWxlW1wiaWRcIl0pIH0pO1xuICAgICAgICBtaXNzaWxlcyA9IFtdO1xuICAgICAgICBkcm9uZURhdGFbXCJ5UG9zXCJdLCBkcm9uZURhdGFbXCJ4UG9zXCJdID0gMjAwLCAyMDA7XG4gICAgICAgIHNwcml0ZVNldFhZKGRyb25lRGF0YVtcImlkXCJdLCBkcm9uZURhdGFbXCJ4UG9zXCJdLCBkcm9uZURhdGFbXCJ5UG9zXCJdKTtcbiAgICAgICAgZHJvbmVEYXRhW1wiaGVhbHRoXCJdID0gNTQwO1xuICAgICAgICBkcm9uZURhdGFbXCJhdHRhY2tTdGF0ZVwiXSA9IFwicGFzc2l2ZVwiO1xuICAgICAgICBpZiAoIXNwcml0ZUV4aXN0cyhcImJvc3NDb250cm9sc1wiKSkgY3JlYXRlU3ByaXRlSW5Hcm91cCh1aUdyb3VwTmFtZSwgXCJib3NzQ29udHJvbHNcIiwgcHJlbG9hZGVkQXNzZXRzW1wiYm9zc0NvbnRyb2xzXCJdLCAzMDcsIDMyOSwgUExBWUdST1VORF9XSURUSCAvIDIgLSAxNTMsIFBMQVlHUk9VTkRfSEVJR0hUIC8gMiAtIDE2MylcbiAgICB9XG59XG5cbmNvbnN0IHBsYXllckFuaW1hdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBTZWNvbmQgc3ByaXRlIHRoYXQgZm9sbG93cyB0aGUgaW52aXNpYmxlIGhpdGJveCBmb3IgYW5pbWF0aW9uc1xuICAgIHNwcml0ZVNldFhZKFwicGxheWVyU3ByaXRlXCIsIHNwcml0ZUdldFgocGxheWVyRGF0YVtcImhpdGJveElkXCJdKSAtIHNwcml0ZUdldFdpZHRoKFwicGxheWVyU3ByaXRlXCIpIC8gMywgc3ByaXRlR2V0WShwbGF5ZXJEYXRhW1wiaGl0Ym94SWRcIl0pIC0gc3ByaXRlR2V0SGVpZ2h0KHBsYXllckRhdGFbXCJoaXRib3hJZFwiXSkgLyAyICsgMik7XG5cbiAgICB2YXIgY29sbGlkaW5nID0gcGxheWVyRGF0YVtcImdyb3VuZENvbGxpZGluZ1wiXTtcbiAgICB2YXIgc3BlZWQgPSBwbGF5ZXJEYXRhW1wieFNwZWVkXCJdO1xuXG4gICAgaWYgKGNvbGxpZGluZykgeyAvLyBPbiBncm91bmQgYW5pbXNcbiAgICAgICAgaWYgKHNwZWVkIDwgMSAmJiBzcGVlZCA+IC0xKSB7XG4gICAgICAgICAgICBpZiAocGxheWVyRGF0YVtcImFuaW1TdGF0ZVwiXSAhPSBcImlkbGVcIikge1xuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXJEYXRhW1wibGFzdERpcmVjdGlvblwiXSA9PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHNwcml0ZVNldEFuaW1hdGlvbihwbGF5ZXJEYXRhW1wic3ByaXRlSWRcIl0sIHBsYXllckRhdGFbXCJhbmltSWRsZUxlZnRcIl0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNwcml0ZVNldEFuaW1hdGlvbihwbGF5ZXJEYXRhW1wic3ByaXRlSWRcIl0sIHBsYXllckRhdGFbXCJhbmltSWRsZVJpZ2h0XCJdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcGxheWVyRGF0YVtcImFuaW1TdGF0ZVwiXSA9IFwiaWRsZVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHNwZWVkID4gMSkge1xuICAgICAgICAgICAgaWYgKHBsYXllckRhdGFbXCJhbmltU3RhdGVcIl0gIT0gXCJydW5SaWdodFwiKSB7XG4gICAgICAgICAgICAgICAgc3ByaXRlU2V0QW5pbWF0aW9uKHBsYXllckRhdGFbXCJzcHJpdGVJZFwiXSwgcGxheWVyRGF0YVtcImFuaW1SdW5DeWNsZVJpZ2h0XCJdKTtcbiAgICAgICAgICAgICAgICBwbGF5ZXJEYXRhW1wiYW5pbVN0YXRlXCJdID0gXCJydW5SaWdodFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGxheWVyRGF0YVtcImxhc3REaXJlY3Rpb25cIl0gPSAxO1xuICAgICAgICB9IGVsc2UgaWYgKHNwZWVkIDwgLTEpIHtcbiAgICAgICAgICAgIGlmIChwbGF5ZXJEYXRhW1wiYW5pbVN0YXRlXCJdICE9IFwicnVuTGVmdFwiKSB7XG4gICAgICAgICAgICAgICAgc3ByaXRlU2V0QW5pbWF0aW9uKHBsYXllckRhdGFbXCJzcHJpdGVJZFwiXSwgcGxheWVyRGF0YVtcImFuaW1SdW5DeWNsZUxlZnRcIl0pO1xuICAgICAgICAgICAgICAgIHBsYXllckRhdGFbXCJhbmltU3RhdGVcIl0gPSBcInJ1bkxlZnRcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBsYXllckRhdGFbXCJsYXN0RGlyZWN0aW9uXCJdID0gLTE7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoc3BlZWQgPCAwLjUgJiYgc3BlZWQgPiAtMC41KSB7XG4gICAgICAgICAgICBpZiAocGxheWVyRGF0YVtcImFuaW1TdGF0ZVwiXSAhPSBcImp1bXBTdHJhaWdodFwiKSB7XG4gICAgICAgICAgICAgICAgc3ByaXRlU2V0QW5pbWF0aW9uKHBsYXllckRhdGFbXCJzcHJpdGVJZFwiXSwgcGxheWVyRGF0YVtcImFuaW1KdW1wU3RyYWlnaHRcIl0pO1xuICAgICAgICAgICAgICAgIHBsYXllckRhdGFbXCJhbmltU3RhdGVcIl0gPSBcImp1bXBTdHJhaWdodFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHNwZWVkID4gMC41KSB7XG4gICAgICAgICAgICBpZiAocGxheWVyRGF0YVtcImFuaW1TdGF0ZVwiXSAhPSBcImp1bXBSaWdodFwiKSB7XG4gICAgICAgICAgICAgICAgc3ByaXRlU2V0QW5pbWF0aW9uKHBsYXllckRhdGFbXCJzcHJpdGVJZFwiXSwgcGxheWVyRGF0YVtcImFuaW1KdW1wUmlnaHRcIl0pO1xuICAgICAgICAgICAgICAgIHBsYXllckRhdGFbXCJhbmltU3RhdGVcIl0gPSBcImp1bXBSaWdodFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHNwZWVkIDwgLTAuNSkge1xuICAgICAgICAgICAgaWYgKHBsYXllckRhdGFbXCJhbmltU3RhdGVcIl0gIT0gXCJqdW1wTGVmdFwiKSB7XG4gICAgICAgICAgICAgICAgc3ByaXRlU2V0QW5pbWF0aW9uKHBsYXllckRhdGFbXCJzcHJpdGVJZFwiXSwgcGxheWVyRGF0YVtcImFuaW1KdW1wTGVmdFwiXSk7XG4gICAgICAgICAgICAgICAgcGxheWVyRGF0YVtcImFuaW1TdGF0ZVwiXSA9IFwianVtcExlZnRcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuY29uc3QgaGFuZGxlQ29sbGlzaW9ucyA9IGZ1bmN0aW9uIChjb2xsSW5kZXg6IG51bWJlciwgaGl0U3ByaXRlOiBvYmplY3QpIHtcbiAgICAvLyBTZWUgaG93IHRoZSBwbGF5ZXIgaXMgY29sbGlkaW5nXG4gICAgdmFyIGdyb3VuZFNwcml0ZTogU3ByaXRlRGljdCA9IGxldmVsQmxvY2tzLmZpbmQoc3ByaXRlID0+IHNwcml0ZVtcImlkXCJdID09PSBzcHJpdGVJZChoaXRTcHJpdGUpKSBhcyBTcHJpdGVEaWN0O1xuICAgIHZhciBjb2xsaXNpb25Ob3JtYWwgPSBzcHJpdGVIaXREaXJlY3Rpb24oZ3JvdW5kU3ByaXRlW1wiaWRcIl0sIGdyb3VuZFNwcml0ZVtcInhQb3NcIl0sIGdyb3VuZFNwcml0ZVtcInlQb3NcIl0sIGdyb3VuZFNwcml0ZVtcInhTcGVlZFwiXSwgZ3JvdW5kU3ByaXRlW1wieVNwZWVkXCJdLCBncm91bmRTcHJpdGVbXCJ3aWR0aFwiXSwgZ3JvdW5kU3ByaXRlW1wiaGVpZ2h0XCJdLCBwbGF5ZXJEYXRhW1wiaGl0Ym94SWRcIl0sIHBsYXllckRhdGFbXCJ4UG9zXCJdLCBwbGF5ZXJEYXRhW1wieVBvc1wiXSwgcGxheWVyRGF0YVtcInhTcGVlZFwiXSwgcGxheWVyRGF0YVtcInlTcGVlZFwiXSwgcGxheWVyRGF0YVsnaGl0Ym94V2lkdGgnXSwgcGxheWVyRGF0YVtcImhpdGJveEhlaWdodFwiXSlcblxuICAgIC8vIFVuLWNvbGxpZGUgdGhlIHBsYXllclxuICAgIHN3aXRjaCAodHJ1ZSkge1xuICAgICAgICBjYXNlIGNvbGxpc2lvbk5vcm1hbFtcInJpZ2h0XCJdOlxuICAgICAgICAgICAgcGxheWVyRGF0YVtcInhTcGVlZFwiXSA9IDA7XG4gICAgICAgICAgICB2YXIgYW1vdW50T3ZlcmxhcCA9IChwbGF5ZXJEYXRhW1wieFBvc1wiXSArIHBsYXllckRhdGFbXCJoaXRib3hXaWR0aFwiXSkgLSBncm91bmRTcHJpdGVbXCJ4UG9zXCJdO1xuICAgICAgICAgICAgaWYgKGFtb3VudE92ZXJsYXAgPiAwKSBwbGF5ZXJEYXRhW1wieFBvc1wiXSAtPSBhbW91bnRPdmVybGFwO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgY29sbGlzaW9uTm9ybWFsW1wibGVmdFwiXTpcbiAgICAgICAgICAgIHBsYXllckRhdGFbXCJ4U3BlZWRcIl0gPSAwO1xuICAgICAgICAgICAgYW1vdW50T3ZlcmxhcCA9IHBsYXllckRhdGFbXCJ4UG9zXCJdIC0gKGdyb3VuZFNwcml0ZVtcInhQb3NcIl0gKyBncm91bmRTcHJpdGVbXCJ3aWR0aFwiXSk7XG4gICAgICAgICAgICBpZiAoYW1vdW50T3ZlcmxhcCA8IDApIHBsYXllckRhdGFbXCJ4UG9zXCJdIC09IGFtb3VudE92ZXJsYXA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBjb2xsaXNpb25Ob3JtYWxbXCJkb3duXCJdOlxuICAgICAgICAgICAgcGxheWVyRGF0YVtcImdyb3VuZENvbGxpZGluZ1wiXSA9IHRydWU7XG4gICAgICAgICAgICBwbGF5ZXJEYXRhW1wieVNwZWVkXCJdID0gMDtcbiAgICAgICAgICAgIGFtb3VudE92ZXJsYXAgPSAocGxheWVyRGF0YVtcInlQb3NcIl0gKyBwbGF5ZXJEYXRhW1wiaGl0Ym94SGVpZ2h0XCJdKSAtIGdyb3VuZFNwcml0ZVtcInlQb3NcIl07XG4gICAgICAgICAgICBpZiAoYW1vdW50T3ZlcmxhcCA+IDApIHBsYXllckRhdGFbXCJ5UG9zXCJdIC09IGFtb3VudE92ZXJsYXA7XG5cbiAgICAgICAgICAgIGlmIChNYXRoLmFicyhncm91bmRTcHJpdGVbXCJ4U3BlZWRcIl0pID4gMCkgcGxheWVyRGF0YVtcInhQb3NcIl0gKz0gZ3JvdW5kU3ByaXRlW1wieFNwZWVkXCJdXG4gICAgICAgICAgICBpZiAoTWF0aC5hYnMoZ3JvdW5kU3ByaXRlW1wieVNwZWVkXCJdKSA+IDApIHBsYXllckRhdGFbXCJ5U3BlZWRcIl0gKz0gZ3JvdW5kU3ByaXRlW1wieVNwZWVkXCJdO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgY29sbGlzaW9uTm9ybWFsW1widXBcIl06XG4gICAgICAgICAgICBwbGF5ZXJEYXRhW1wiZ3JvdW5kQ29sbGlkaW5nXCJdID0gZmFsc2U7XG4gICAgICAgICAgICBwbGF5ZXJEYXRhW1wieVNwZWVkXCJdID0gMDtcbiAgICAgICAgICAgIGFtb3VudE92ZXJsYXAgPSBwbGF5ZXJEYXRhW1wieVBvc1wiXSAtIChncm91bmRTcHJpdGVbXCJ5UG9zXCJdICsgZ3JvdW5kU3ByaXRlW1wiaGVpZ2h0XCJdKTtcbiAgICAgICAgICAgIGlmIChhbW91bnRPdmVybGFwID4gMCkgcGxheWVyRGF0YVtcInlQb3NcIl0gLT0gYW1vdW50T3ZlcmxhcDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbn1cblxuY29uc3QgcGxheWVyTW92ZW1lbnQgPSBmdW5jdGlvbiAoKSB7IC8vIFRoaXMgaXMgZXhjbHVzaXZlbHkgZm9yIHRoZSBwbGF5ZXIsIHNvIHdlIGRvbid0IG5lZWQgYSBzcHJpdGVEYXRhIGFyZ1xuICAgIC8vIFRhaG9tYSBpcyBhIENTUyBXZWIgU2FmZSBGb250IVxuICAgIGlmIChkZWJ1Zykgc3ByaXRlKFwiZGVidWdTaG93blwiKS5odG1sKGBPZmZzZXQ6ICR7eE9mZnNldH0gfCBQbGF5ZXIgWDogJHtwbGF5ZXJEYXRhW1wieFBvc1wiXS50b1ByZWNpc2lvbigzKX0gfCBQbGF5ZXIgWTogJHtwbGF5ZXJEYXRhW1wieVBvc1wiXS50b1ByZWNpc2lvbigzKX0gfCBQbGF5ZXIgWSBTcGVlZDogJHtwbGF5ZXJEYXRhW1wieVNwZWVkXCJdLnRvUHJlY2lzaW9uKDMpfSB8IFBsYXllciBYIFNwZWVkOiAke3BsYXllckRhdGFbXCJ4U3BlZWRcIl0udG9QcmVjaXNpb24oMyl9YCkuY3NzKFwiZm9udC1mYW1pbHlcIiwgXCJUYWhvbWFcIikuY3NzKFwiYmFja2dyb3VuZC1jb2xvclwiLCBcInJnYmEoMCwgMCwgMCwgMClcIik7XG5cbiAgICAvLyBUaGUgcGxheWVyRGF0YVtcImdyb3VuZENvbGxpZGluZ1wiXSB3aWxsIGJlIGZhbHNlIGluIGFpciwgdHJ1ZSBvbiBncm91bmQgLSBidXQgbm90IGJlZm9yZSB0aGVzZSB0d28gbGluZXMhXG4gICAgcGxheWVyRGF0YVtcImdyb3VuZENvbGxpZGluZ1wiXSA9IGZhbHNlO1xuICAgIGZvckVhY2hTcHJpdGVHcm91cENvbGxpc2lvbkRvKHBsYXllckRhdGFbXCJoaXRib3hJZFwiXSwgY29sbGlzaW9uR3JvdXBOYW1lLCBoYW5kbGVDb2xsaXNpb25zKTtcblxuICAgIC8vIEJvdW5jZXBhZHMgLyB0cmFtcG9saW5lcyBcbiAgICBmb3JFYWNoU3ByaXRlR3JvdXBDb2xsaXNpb25EbyhwbGF5ZXJEYXRhW1wiaGl0Ym94SWRcIl0sIGJvdW5jZUdyb3VwTmFtZSwgKCkgPT4geyBwbGF5ZXJEYXRhW1wieVNwZWVkXCJdID0gLTI1OyB9KTtcblxuICAgIC8vIEtleXM6IGEgPSA2NSBhbmQgZCA9IDY4XG4gICAgaWYgKGdldEtleVN0YXRlKDY4KSkge1xuICAgICAgICBwbGF5ZXJEYXRhW1wieFNwZWVkXCJdICs9IDIuNTtcbiAgICB9XG4gICAgaWYgKGdldEtleVN0YXRlKDY1KSkge1xuICAgICAgICBwbGF5ZXJEYXRhW1wieFNwZWVkXCJdIC09IDIuNTtcbiAgICB9XG4gICAgcGxheWVyRGF0YVtcInhTcGVlZFwiXSAqPSAwLjc7XG4gICAgaWYgKE1hdGguYWJzKHBsYXllckRhdGFbXCJ4U3BlZWRcIl0pIDw9IDAuMDAxKSBwbGF5ZXJEYXRhW1wieFNwZWVkXCJdID0gMDtcblxuICAgIC8vIElmIGluIGFpciB2cyBncm91bmRcbiAgICBpZiAocGxheWVyRGF0YVtcInlTcGVlZFwiXSA8IDEwMCAmJiAhcGxheWVyRGF0YVtcImdyb3VuZENvbGxpZGluZ1wiXSkge1xuICAgICAgICBwbGF5ZXJEYXRhW1wieVNwZWVkXCJdKys7XG4gICAgICAgIGlmIChwbGF5ZXJEYXRhW1wiY295b3RlQ291bnRlclwiXSA+IDApIHBsYXllckRhdGFbXCJjb3lvdGVDb3VudGVyXCJdLS07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcGxheWVyRGF0YVtcImNveW90ZUNvdW50ZXJcIl0gPSBwbGF5ZXJEYXRhW1wiY295b3RlVGltZVwiXTtcbiAgICB9XG5cbiAgICAvLyBJbiBjYXNlIHlvdSBkb24ndCBrbm93IHdoYXQgY295b3RlIHRpbWUgaXM6IFRoZSBwbGF5ZXIgY2FuIHN0aWxsIGp1bXAgYSBmZXcgZnJhbWVzIGFmdGVyIGdvaW5nIG92ZXIgdGhlIGVkZ2Ugb2YgYSBwbGF0Zm9ybS5cbiAgICBpZiAocGxheWVyRGF0YVtcImNveW90ZUNvdW50ZXJcIl0gPiAwICYmIChnZXRLZXlTdGF0ZSg4NykpKSB7IC8vIEtleXM6IDg3ID0gd1xuICAgICAgICBwbGF5ZXJEYXRhW1wiY295b3RlQ291bnRlclwiXSA9IDA7XG4gICAgICAgIHBsYXllckRhdGFbXCJ5U3BlZWRcIl0gPSAtMTU7XG4gICAgfVxuXG4gICAgLy8gQm9vc3RcbiAgICBpZiAoZ2V0S2V5U3RhdGUoMzIpICYmIERhdGUubm93KCkgLSBwbGF5ZXJEYXRhW1wiYm9vc3RDb29sZG93blwiXSA+IDEwMDApIHsgLy8gS2V5czogMzIgPSBzcGFjZVxuICAgICAgICBpZiAocGxheWVyRGF0YVtcInhTcGVlZFwiXSkgeyAvLyBDYW4gcmV0dXJuIE5hTiBzb21ldGltZXMsIHNvLi4uXG4gICAgICAgICAgICBwbGF5ZXJEYXRhW1wieFNwZWVkXCJdID0gNDAgKiAocGxheWVyRGF0YVtcInhTcGVlZFwiXSAvIE1hdGguYWJzKHBsYXllckRhdGFbXCJ4U3BlZWRcIl0pKTsgIC8vIFRoaXMganVzdCBzZXRzIHRoZSBzcGVlZCB0byBlaXRoZXIgLTQwIG9yIDQwXG4gICAgICAgICAgICBwbGF5ZXJEYXRhW1wieVNwZWVkXCJdID0gLTM7XG4gICAgICAgICAgICBwbGF5ZXJEYXRhW1wiYm9vc3RDb29sZG93blwiXSA9IERhdGUubm93KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZXNldCBhZnRlciBmYWxsaW5nIGludG8gdGhlIHZvaWQgb3IgdG91Y2hpbmcgYW4gZW5lbXlcbiAgICB2YXIgdG91Y2hlZEVuZW15OiBib29sZWFuID0gZmFsc2U7XG4gICAgZm9yRWFjaFNwcml0ZUdyb3VwQ29sbGlzaW9uRG8ocGxheWVyRGF0YVtcImhpdGJveElkXCJdLCBlbmVteUdyb3VwTmFtZSwgKGNvbGxJbmRleCwgaGl0U3ByaXRlKSA9PiB7XG4gICAgICAgIGlmIChzcHJpdGVJZChoaXRTcHJpdGUpID09IGRyb25lRGF0YVtcImlkXCJdKSB7XG4gICAgICAgICAgICB2YXIgY29sbGlzaW9uTm9ybWFsID0gc3ByaXRlSGl0RGlyZWN0aW9uKGRyb25lRGF0YVtcImlkXCJdLCBkcm9uZURhdGFbXCJ4UG9zXCJdLCBkcm9uZURhdGFbXCJ5UG9zXCJdLCBkcm9uZURhdGFbXCJ4U3BlZWRcIl0sIGRyb25lRGF0YVtcInlTcGVlZFwiXSwgZHJvbmVEYXRhW1wid2lkdGhcIl0sIGRyb25lRGF0YVtcImhlaWdodFwiXSwgcGxheWVyRGF0YVtcImhpdGJveElkXCJdLCBwbGF5ZXJEYXRhW1wieFBvc1wiXSwgcGxheWVyRGF0YVtcInlQb3NcIl0sIHBsYXllckRhdGFbXCJ4U3BlZWRcIl0sIHBsYXllckRhdGFbXCJ5U3BlZWRcIl0sIHBsYXllckRhdGFbJ2hpdGJveFdpZHRoJ10sIHBsYXllckRhdGFbXCJoaXRib3hIZWlnaHRcIl0pXG4gICAgICAgICAgICBpZiAoY29sbGlzaW9uTm9ybWFsW1wiZG93blwiXSkge1xuICAgICAgICAgICAgICAgIHBsYXllckRhdGFbXCJ5U3BlZWRcIl0gPSAtNTtcbiAgICAgICAgICAgICAgICBkcm9uZURhdGFbXCJoZWFsdGhcIl0gLT0gNTA7XG4gICAgICAgICAgICAgICAgZHJvbmVEYXRhW1wiYXR0YWNrU3RhdGVcIl0gPSBcInJldHVyblwiO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChjb2xsaXNpb25Ob3JtYWxbXCJ1cFwiXSkge1xuICAgICAgICAgICAgICAgIHRvdWNoZWRFbmVteSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0b3VjaGVkRW5lbXkgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgaWYgKHBsYXllckRhdGFbXCJ5UG9zXCJdID4gUExBWUdST1VORF9IRUlHSFQgKyBwbGF5ZXJEYXRhW1wic3ByaXRlSGVpZ2h0XCJdIHx8IHRvdWNoZWRFbmVteSkge1xuICAgICAgICBbcGxheWVyRGF0YVtcInlTcGVlZFwiXSwgcGxheWVyRGF0YVtcInhTcGVlZFwiXV0gPSBbMCwgMF07XG4gICAgICAgIFtwbGF5ZXJEYXRhW1wieFBvc1wiXSwgcGxheWVyRGF0YVtcInlQb3NcIl1dID0gW3NwYXduUG9pbnRbbGV2ZWxOdW1iZXJdWzBdLCBzcGF3blBvaW50W2xldmVsTnVtYmVyXVsxXV07XG4gICAgICAgIHNldHVwTGV2ZWwoKTtcbiAgICAgICAgZGVhdGhzKys7XG4gICAgfVxuXG4gICAgLy8gTmV4dCBsZXZlbFxuICAgIGlmIChwbGF5ZXJEYXRhW1wieFBvc1wiXSA+IDE4NDApIHtcbiAgICAgICAgbGV2ZWxOdW1iZXIrKztcbiAgICAgICAgeE9mZnNldCA9IDc1MDtcbiAgICAgICAgcGxheWVyRGF0YVtcInhQb3NcIl0gPSBzcGF3blBvaW50W2xldmVsTnVtYmVyXVswXTtcbiAgICAgICAgc2V0dXBMZXZlbCgpO1xuICAgIH1cblxuICAgIC8vIEJhc2ljIGxldmVsIGNvbnN0cmFpbnRcbiAgICBpZiAocGxheWVyRGF0YVtcInhQb3NcIl0gPCAtNzQwKSBwbGF5ZXJEYXRhW1wieFBvc1wiXSA9IC03NDA7XG5cbiAgICAvLyBBY3R1YWxseSBtb3ZlIHRoZSBwbGF5ZXJcbiAgICBwbGF5ZXJEYXRhW1wieFBvc1wiXSA9IHBsYXllckRhdGFbXCJ4UG9zXCJdICsgcGxheWVyRGF0YVtcInhTcGVlZFwiXTtcbiAgICBwbGF5ZXJEYXRhW1wieVBvc1wiXSA9IHBsYXllckRhdGFbXCJ5UG9zXCJdICsgcGxheWVyRGF0YVtcInlTcGVlZFwiXTtcbiAgICBzcHJpdGVTZXRYWShwbGF5ZXJEYXRhW1wiaGl0Ym94SWRcIl0sIHBsYXllckRhdGFbXCJ4UG9zXCJdICsgeE9mZnNldCwgcGxheWVyRGF0YVtcInlQb3NcIl0gKyB5T2Zmc2V0KTtcbn1cblxuXG5jb25zdCB1cGRhdGVIZWFsdGggPSAoKSA9PiB7XG4gICAgbGV0IHByZXZXaWR0aCA9IHNwcml0ZUdldFdpZHRoKFwiaGVhbHRoQmFyTWFpblwiKTtcbiAgICBpZiAoc3ByaXRlRXhpc3RzKFwiaGVhbHRoQmFyTWFpblwiKSkgcmVtb3ZlU3ByaXRlKFwiaGVhbHRoQmFyTWFpblwiKTtcbiAgICBwcmV2V2lkdGggPSBsZXJwKHByZXZXaWR0aCwgZHJvbmVEYXRhW1wiaGVhbHRoXCJdLCBsZXJwRmFjdG9yKVxuICAgIGNyZWF0ZVJlY3RJbkdyb3VwKHRleHRHcm91cE5hbWUsIFwiaGVhbHRoQmFyTWFpblwiLCA1MiwgNzIsIHByZXZXaWR0aCwgMTAsIFwiIzc2Qjk0N1wiLCAwLCAwLCAwKTtcbn1cblxuY29uc3QgZHJvbmVEYXRhQUkgPSAoKSA9PiB7XG4gICAgLy8gRGllIGFuaW1hdGlvblxuICAgIGlmIChkcm9uZURhdGFbXCJoZWFsdGhcIl0gPD0gMCkge1xuICAgICAgICBnYW1lU3RhdGUgPSBcImVuZGVkXCI7XG4gICAgICAgIGZpbmFsVGltZSA9IERhdGUubm93KCkgLSBzdGFydFRpbWU7XG4gICAgICAgIHdhaXRUaW1lciA9IERhdGUubm93KCk7XG4gICAgICAgIGlmIChzcHJpdGVFeGlzdHMoXCJkcm9uZVByZWRpY3RcIikpIHJlbW92ZVNwcml0ZShcImRyb25lUHJlZGljdFwiKTtcbiAgICB9XG5cbiAgICAvLyBEcm9uZSBcIkFJXCIgaXMgZG9uZSB3aXRoIHN0YXRlcy5cbiAgICBpZiAoZHJvbmVEYXRhW1wiYXR0YWNrU3RhdGVcIl0gPT0gXCJwYXNzaXZlXCIpIHtcbiAgICAgICAgZHJvbmVNb3ZlbWVudCgpO1xuICAgICAgICBpZiAoTWF0aC5yYW5kb20oKSA+IDAuMikge1xuICAgICAgICAgICAgZHJvbmVEYXRhW1wiYXR0YWNrU3RhdGVcIl0gPSBcIm1pc3NpbGVzXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNwcml0ZUV4aXN0cyhcImRyb25lUHJlZGljdFwiKSkgcmVtb3ZlU3ByaXRlKFwiZHJvbmVQcmVkaWN0XCIpO1xuICAgIH0gZWxzZSBpZiAoZHJvbmVEYXRhW1wiYXR0YWNrU3RhdGVcIl0gPT0gXCJzd29vcFwiKSB7XG4gICAgICAgIGlmIChEYXRlLm5vdygpIC0gZHJvbmVEYXRhW1widGltZXJcIl0gPiAyMDAwKSB7XG4gICAgICAgICAgICBkcm9uZVN3b29wKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoRGF0ZS5ub3coKSAtIGRyb25lRGF0YVtcInRpbWVyXCJdIDwgMTAwMCkge1xuICAgICAgICAgICAgICAgIGRyb25lRGF0YVtcInRhcmdldFhcIl0gPSBwbGF5ZXJEYXRhW1wieFBvc1wiXTtcbiAgICAgICAgICAgICAgICBkcm9uZURhdGFbXCJ0YXJnZXRZXCJdID0gcGxheWVyRGF0YVtcInlQb3NcIl07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXNwcml0ZUV4aXN0cyhcImRyb25lUHJlZGljdFwiKSkgY3JlYXRlU3ByaXRlSW5Hcm91cCh1aUdyb3VwTmFtZSwgXCJkcm9uZVByZWRpY3RcIiwgcHJlbG9hZGVkQXNzZXRzW1wiZHJvbmVQcmVkaWN0XCJdLCAxOTYsIDUzLCBkcm9uZURhdGFbXCJ0YXJnZXRYXCJdLCBkcm9uZURhdGFbXCJ0YXJnZXRZXCJdKTtcbiAgICAgICAgICAgIGlmIChzcHJpdGVFeGlzdHMoXCJkcm9uZVByZWRpY3RcIikpIHtcbiAgICAgICAgICAgICAgICBzcHJpdGVTZXRYWShcImRyb25lUHJlZGljdFwiLCBkcm9uZURhdGFbXCJ0YXJnZXRYXCJdIC0gZHJvbmVEYXRhW1wid2lkdGhcIl0gLyAyICsgeE9mZnNldCwgZHJvbmVEYXRhW1widGFyZ2V0WVwiXSAtIGRyb25lRGF0YVtcImhlaWdodFwiXSAvIDIgKyB5T2Zmc2V0KVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZHJvbmVNb3ZlbWVudCgpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChkcm9uZURhdGFbXCJhdHRhY2tTdGF0ZVwiXSA9PSBcIm1pc3NpbGVzXCIpIHtcbiAgICAgICAgaWYgKE1hdGgucmFuZG9tKCkgPiAwLjggJiYgRGF0ZS5ub3coKSAtIGRyb25lRGF0YVtcInRpbWVyXCJdID4gMjAwKSB7XG4gICAgICAgICAgICBzcGF3bk1pc3NsZShkcm9uZURhdGFbXCJ4UG9zXCJdICsgZHJvbmVEYXRhW1wid2lkdGhcIl0gLyAyLCBkcm9uZURhdGFbXCJ5UG9zXCJdICsgMjApO1xuICAgICAgICAgICAgZHJvbmVEYXRhW1wiaGVhbHRoXCJdLS07XG4gICAgICAgICAgICBkcm9uZURhdGFbXCJ0aW1lclwiXSA9IERhdGUubm93KCk7XG4gICAgICAgICAgICBpZiAoTWF0aC5yYW5kb20oKSA8IDAuMSkge1xuICAgICAgICAgICAgICAgIGRyb25lRGF0YVtcInRpbWVyXCJdID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgICAgICBkcm9uZURhdGFbXCJhdHRhY2tTdGF0ZVwiXSA9IFwic3dvb3BcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBkcm9uZU1vdmVtZW50KCk7XG4gICAgICAgIGlmIChzcHJpdGVFeGlzdHMoXCJkcm9uZVByZWRpY3RcIikpIHJlbW92ZVNwcml0ZShcImRyb25lUHJlZGljdFwiKTtcbiAgICB9IGVsc2UgaWYgKGRyb25lRGF0YVtcImF0dGFja1N0YXRlXCJdID09IFwicmV0dXJuXCIpIHtcbiAgICAgICAgZHJvbmVSZXR1cm4oKTtcbiAgICAgICAgaWYgKHNwcml0ZUV4aXN0cyhcImRyb25lUHJlZGljdFwiKSkgcmVtb3ZlU3ByaXRlKFwiZHJvbmVQcmVkaWN0XCIpO1xuICAgIH1cblxuICAgIC8vIERyb25lIGhlYWx0aFxuICAgIHVwZGF0ZUhlYWx0aCgpO1xuXG4gICAgLy8gQWN0dWFsbHkgbW92ZSB0aGUgRHJvbmVcbiAgICBkcm9uZURhdGFbXCJ4UG9zXCJdID0gZHJvbmVEYXRhW1wieFBvc1wiXSArIGRyb25lRGF0YVtcInhTcGVlZFwiXTtcbiAgICBkcm9uZURhdGFbXCJ5UG9zXCJdID0gZHJvbmVEYXRhW1wieVBvc1wiXSArIGRyb25lRGF0YVtcInlTcGVlZFwiXTtcbiAgICBzcHJpdGVTZXRYWShkcm9uZURhdGFbXCJpZFwiXSwgZHJvbmVEYXRhW1wieFBvc1wiXSArIHhPZmZzZXQsIGRyb25lRGF0YVtcInlQb3NcIl0gKyB5T2Zmc2V0KTtcbn1cblxuY29uc3QgZHJvbmVNb3ZlbWVudCA9ICgpID0+IHtcbiAgICBjb25zdCBkaXN0VG9QbGF5ZXIgPSBwbGF5ZXJEYXRhW1wieFBvc1wiXSAtIGRyb25lRGF0YVtcInhQb3NcIl0gLSBkcm9uZURhdGFbXCJ3aWR0aFwiXSAvIDI7XG4gICAgaWYgKE1hdGguYWJzKGRpc3RUb1BsYXllcikgPiAxMCkge1xuICAgICAgICBkcm9uZURhdGFbXCJ4U3BlZWRcIl0gKz0gY2xhbXAoTWF0aC5hYnMoZGlzdFRvUGxheWVyKSAvIDI1LCAwLCAyNSkgKiAoZGlzdFRvUGxheWVyIC8gTWF0aC5hYnMoZGlzdFRvUGxheWVyKSk7XG4gICAgICAgIGRyb25lRGF0YVtcInhTcGVlZFwiXSAqPSAwLjc7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZHJvbmVEYXRhW1wieFNwZWVkXCJdICo9IDAuNTtcbiAgICB9XG4gICAgc3ByaXRlUm90YXRlKGRyb25lRGF0YVtcImlkXCJdLCBjbGFtcChkcm9uZURhdGFbXCJ4U3BlZWRcIl0gKiAxLjYsIC01MCwgNTApKVxuICAgIGRyb25lRGF0YVtcInlQb3NcIl0gPSBkcm9uZURhdGFbXCJ5QW1wbGl0dWRlXCJdICogTWF0aC5zaW4oRGF0ZS5ub3coKSAqIDIgKiBNYXRoLlBJIC8gZHJvbmVEYXRhW1wieVBlcmlvZFwiXSkgKyAxMjU7XG59XG5cbmNvbnN0IGRyb25lU3dvb3AgPSAoKSA9PiB7XG4gICAgaWYgKHNwcml0ZUV4aXN0cyhcImRyb25lUHJlZGljdFwiKSkgc3ByaXRlU2V0WFkoXCJkcm9uZVByZWRpY3RcIiwgZHJvbmVEYXRhW1widGFyZ2V0WFwiXSAtIGRyb25lRGF0YVtcIndpZHRoXCJdIC8gMiArIHhPZmZzZXQsIGRyb25lRGF0YVtcInRhcmdldFlcIl0gLSBkcm9uZURhdGFbXCJoZWlnaHRcIl0gLyAyICsgeU9mZnNldClcbiAgICBjb25zdCBkaXN0VG9UYXJnZXRYID0gZHJvbmVEYXRhW1widGFyZ2V0WFwiXSAtIGRyb25lRGF0YVtcInhQb3NcIl0gLSBkcm9uZURhdGFbXCJ3aWR0aFwiXSAvIDI7XG4gICAgY29uc3QgZGlzdFRvVGFyZ2V0WSA9IGRyb25lRGF0YVtcInRhcmdldFlcIl0gLSBkcm9uZURhdGFbXCJ5UG9zXCJdIC0gZHJvbmVEYXRhW1wiaGVpZ2h0XCJdIC8gMjtcbiAgICBpZiAoTWF0aC5hYnMoZGlzdFRvVGFyZ2V0WCkgPiAxMCB8fCBNYXRoLmFicyhkaXN0VG9UYXJnZXRZKSA+IDEwKSB7XG4gICAgICAgIGRyb25lRGF0YVtcInhTcGVlZFwiXSArPSBjbGFtcChNYXRoLmFicyhkaXN0VG9UYXJnZXRYKSAvIDI1LCAwLCAyNSkgKiAoZGlzdFRvVGFyZ2V0WCAvIE1hdGguYWJzKGRpc3RUb1RhcmdldFgpKTtcbiAgICAgICAgZHJvbmVEYXRhW1wieFNwZWVkXCJdICo9IDAuNztcblxuICAgICAgICBkcm9uZURhdGFbXCJ5U3BlZWRcIl0gKz0gY2xhbXAoTWF0aC5hYnMoZGlzdFRvVGFyZ2V0WSkgLyAyNSwgMCwgMjUpICogKGRpc3RUb1RhcmdldFkgLyBNYXRoLmFicyhkaXN0VG9UYXJnZXRZKSk7XG4gICAgICAgIGRyb25lRGF0YVtcInlTcGVlZFwiXSAqPSAwLjc7XG4gICAgICAgIGRyb25lRGF0YVtcInBhdXNlT25Hcm91bmRcIl0gPSBEYXRlLm5vdygpO1xuICAgICAgICBpZiAoc3ByaXRlRXhpc3RzKFwiZHJvbmVQcmVkaWN0XCIpKSByZW1vdmVTcHJpdGUoXCJkcm9uZVByZWRpY3RcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZHJvbmVEYXRhW1wieFNwZWVkXCJdID0gMDtcbiAgICAgICAgZHJvbmVEYXRhW1wieVNwZWVkXCJdID0gMDtcbiAgICAgICAgaWYgKERhdGUubm93KCkgLSBkcm9uZURhdGFbXCJwYXVzZU9uR3JvdW5kXCJdID4gMzAwMCkge1xuICAgICAgICAgICAgZHJvbmVEYXRhW1wicGF1c2VPbkdyb3VuZFwiXSA9IERhdGUubm93KCk7XG4gICAgICAgICAgICBkcm9uZURhdGFbXCJhdHRhY2tTdGF0ZVwiXSA9IFwicmV0dXJuXCI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3ByaXRlUm90YXRlKGRyb25lRGF0YVtcImlkXCJdLCBjbGFtcChkcm9uZURhdGFbXCJ4U3BlZWRcIl0gKiAxLjYsIC01MCwgNTApKVxufVxuXG5jb25zdCBkcm9uZVJldHVybiA9ICgpID0+IHtcbiAgICBkcm9uZURhdGFbXCJ0YXJnZXRZXCJdID0gZHJvbmVEYXRhW1wieUFtcGxpdHVkZVwiXSAqIE1hdGguc2luKERhdGUubm93KCkgKiAyICogTWF0aC5QSSAvIGRyb25lRGF0YVtcInlQZXJpb2RcIl0pICsgMTI1O1xuICAgIGNvbnN0IGRpc3RUb1RhcmdldFkgPSBkcm9uZURhdGFbXCJ0YXJnZXRZXCJdIC0gZHJvbmVEYXRhW1wieVBvc1wiXSAtIGRyb25lRGF0YVtcImhlaWdodFwiXSAvIDI7XG4gICAgY29uc3QgZGlzdFRvUGxheWVyID0gcGxheWVyRGF0YVtcInhQb3NcIl0gLSBkcm9uZURhdGFbXCJ4UG9zXCJdIC0gZHJvbmVEYXRhW1wid2lkdGhcIl0gLyAyO1xuICAgIGlmIChNYXRoLmFicyhkaXN0VG9QbGF5ZXIpID4gMTApIHtcbiAgICAgICAgZHJvbmVEYXRhW1wieFNwZWVkXCJdICs9IGNsYW1wKE1hdGguYWJzKGRpc3RUb1BsYXllcikgLyAyNSwgMCwgMjUpICogKGRpc3RUb1BsYXllciAvIE1hdGguYWJzKGRpc3RUb1BsYXllcikpO1xuICAgICAgICBkcm9uZURhdGFbXCJ4U3BlZWRcIl0gKj0gMC43O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGRyb25lRGF0YVtcInhTcGVlZFwiXSAqPSAwLjU7XG4gICAgfVxuICAgIGlmIChNYXRoLmFicyhkaXN0VG9UYXJnZXRZKSA+IDEwKSB7XG4gICAgICAgIGRyb25lRGF0YVtcInlTcGVlZFwiXSArPSBjbGFtcChNYXRoLmFicyhkaXN0VG9UYXJnZXRZKSAvIDI1LCAwLCAyNSkgKiAoZGlzdFRvVGFyZ2V0WSAvIE1hdGguYWJzKGRpc3RUb1RhcmdldFkpKTtcbiAgICAgICAgZHJvbmVEYXRhW1wieVNwZWVkXCJdICo9IDAuNztcbiAgICB9IGVsc2Uge1xuICAgICAgICBkcm9uZURhdGFbXCJhdHRhY2tTdGF0ZVwiXSA9IFwibWlzc2lsZXNcIjtcbiAgICB9XG4gICAgc3ByaXRlUm90YXRlKGRyb25lRGF0YVtcImlkXCJdLCBjbGFtcChkcm9uZURhdGFbXCJ4U3BlZWRcIl0gKiAxLjYsIC01MCwgNTApKVxufVxuXG5jb25zdCBtb3ZlQmxvY2tzID0gKCkgPT4ge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGV2ZWxCbG9ja3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbGV0IGN1cnJlbnRCbG9jayA9IGxldmVsQmxvY2tzW2ldO1xuICAgICAgICBpZiAoTWF0aC5hYnMoY3VycmVudEJsb2NrW1wieFNwZWVkXCJdKSA+IDApIHtcbiAgICAgICAgICAgIGN1cnJlbnRCbG9ja1tcInhQb3NcIl0gKz0gY3VycmVudEJsb2NrW1wieFNwZWVkXCJdO1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRCbG9ja1tcInhQb3NcIl0gPD0gY3VycmVudEJsb2NrW1wibWluWFBvc1wiXSB8fCBjdXJyZW50QmxvY2tbXCJ4UG9zXCJdID49IGN1cnJlbnRCbG9ja1tcIm1heFhQb3NcIl0pIGN1cnJlbnRCbG9ja1tcInhTcGVlZFwiXSA9IC1jdXJyZW50QmxvY2tbXCJ4U3BlZWRcIl07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKE1hdGguYWJzKGN1cnJlbnRCbG9ja1tcInlTcGVlZFwiXSkgPiAwKSB7XG4gICAgICAgICAgICBjdXJyZW50QmxvY2tbXCJ5UG9zXCJdICs9IGN1cnJlbnRCbG9ja1tcInlTcGVlZFwiXTtcbiAgICAgICAgICAgIGlmIChjdXJyZW50QmxvY2tbXCJ5UG9zXCJdIDwgY3VycmVudEJsb2NrW1wibWluWVBvc1wiXSB8fCBjdXJyZW50QmxvY2tbXCJ5UG9zXCJdID4gY3VycmVudEJsb2NrW1wibWF4WVBvc1wiXSkgY3VycmVudEJsb2NrW1wieVNwZWVkXCJdID0gLWN1cnJlbnRCbG9ja1tcInlTcGVlZFwiXTtcbiAgICAgICAgfVxuICAgICAgICBzcHJpdGVTZXRYWShjdXJyZW50QmxvY2tbXCJpZFwiXSwgY3VycmVudEJsb2NrW1wieFBvc1wiXSArIHhPZmZzZXQsIGN1cnJlbnRCbG9ja1tcInlQb3NcIl0gKyB5T2Zmc2V0KTtcbiAgICB9XG5cbiAgICBzcHJpdGVTZXRYWShcIndhdmUxXCIsIHhPZmZzZXQgLyA1IC0gUExBWUdST1VORF9XSURUSCwgeU9mZnNldClcbiAgICBzcHJpdGVTZXRYWShcIndhdmUyXCIsIHhPZmZzZXQgLyAxMCAtIFBMQVlHUk9VTkRfV0lEVEgsIHlPZmZzZXQpXG59XG5cbmNvbnN0IG1vdmVNaXNzaWxlcyA9ICgpID0+IHtcbiAgICBtaXNzaWxlcy5mb3JFYWNoKG1pc3NpbGUgPT4ge1xuICAgICAgICAvLyBBbmQganVzdCBtb3ZlIHRoZSBtaXNzaWxlIGFzIG5vcm1hbFxuICAgICAgICBtaXNzaWxlW1wieFBvc1wiXSA9IG1pc3NpbGVbXCJ4UG9zXCJdICsgbWlzc2lsZVtcInhTcGVlZFwiXTtcbiAgICAgICAgbWlzc2lsZVtcInlQb3NcIl0gPSBtaXNzaWxlW1wieVBvc1wiXSArIG1pc3NpbGVbXCJ5U3BlZWRcIl07XG4gICAgICAgIHNwcml0ZVNldFhZKG1pc3NpbGVbXCJpZFwiXSwgbWlzc2lsZVtcInhQb3NcIl0gKyB4T2Zmc2V0LCBtaXNzaWxlW1wieVBvc1wiXSArIHlPZmZzZXQpO1xuXG4gICAgICAgIC8vIENoZWNrIGlmIGl0IGhpdHMgYSB3YWxsXG4gICAgICAgIGZvckVhY2hTcHJpdGVHcm91cENvbGxpc2lvbkRvKG1pc3NpbGVbXCJpZFwiXSwgXCJjb2xsaXNpb25Hcm91cFwiLCAoKSA9PiB7XG4gICAgICAgICAgICByZW1vdmVTcHJpdGUobWlzc2lsZVtcImlkXCJdKTtcbiAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gbWlzc2lsZXMuaW5kZXhPZihtaXNzaWxlKTtcbiAgICAgICAgICAgIGlmIChpbmRleCA+IC0xKSBtaXNzaWxlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cblxuY29uc3QgZW5kT2ZHYW1lID0gKCkgPT4ge1xuICAgIHVwZGF0ZUhlYWx0aCgpO1xuICAgIGlmIChEYXRlLm5vdygpIC0gd2FpdFRpbWVyID4gMjAwMCkge1xuICAgICAgICBsZXZlbEJsb2Nrcy5mb3JFYWNoKGJsb2NrRGljdCA9PiB7IHJlbW92ZVNwcml0ZShibG9ja0RpY3RbXCJpZFwiXSkgfSk7XG4gICAgICAgIG1pc3NpbGVzLmZvckVhY2gobWlzc2lsZURpY3QgPT4geyByZW1vdmVTcHJpdGUobWlzc2lsZURpY3RbXCJpZFwiXSkgfSk7XG4gICAgICAgIGxldmVsQmxvY2tzID0gW11cbiAgICAgICAgbWlzc2lsZXMgPSBbXVxuXG4gICAgICAgIGNvbnN0IHJlbW92ZVNwcml0ZXM6IHN0cmluZ1tdID0gW3BsYXllckRhdGFbXCJzcHJpdGVJZFwiXSwgcGxheWVyRGF0YVtcImhpdGJveElkXCJdLCBcIndhdmUxXCIsIFwid2F2ZTJcIiwgZHJvbmVEYXRhW1wiaWRcIl0sIFwiaGVhbHRoQmFyTWFpblwiLCBcImhlYWx0aEJhclNlY29uZFwiLCBcImhlYWx0aEJhckJhY2tcIiwgXCJib3NzQmFyVGV4dFwiXVxuICAgICAgICByZW1vdmVTcHJpdGVzLmZvckVhY2gobmFtZSA9PiB7IHJlbW92ZVNwcml0ZShuYW1lKTsgfSk7XG5cbiAgICAgICAgaWYgKHNwcml0ZUV4aXN0cyhcImRyb25lUHJlZGljdFwiKSkgcmVtb3ZlU3ByaXRlKFwiZHJvbmVQcmVkaWN0XCIpO1xuICAgICAgICByZW1vdmVTcHJpdGUoXCJvdmVybGF5U3ByaXRlXCIpXG4gICAgICAgIGRyb25lRGF0YVtcImhlYWx0aFwiXSA9IDU0MDtcbiAgICAgICAgcGxheWVyRGF0YVtcInhQb3NcIl0gPSBzcGF3blBvaW50W2xldmVsTnVtYmVyXVswXVxuICAgICAgICBwbGF5ZXJEYXRhW1wieVBvc1wiXSA9IHNwYXduUG9pbnRbbGV2ZWxOdW1iZXJdWzFdXG5cbiAgICAgICAgc3ByaXRlU2V0WFkoXCJzcGVlZHJ1blRpbWVyXCIsIFBMQVlHUk9VTkRfV0lEVEggLyAyIC0gMTUwLCBQTEFZR1JPVU5EX0hFSUdIVCAvIDIgLSA4NSlcbiAgICAgICAgc3ByaXRlKFwic3BlZWRydW5UaW1lclwiKS5jc3MoXCJjb2xvclwiLCBcInJnYmEoMjU1LCAyNTUsIDI1NSwgMjU1KVwiKS5jc3MoXCJmb250LXNpemVcIiwgXCIzNXB0XCIpO1xuICAgICAgICBpZiAoc2tpcHBlZCkgc3ByaXRlKFwic3BlZWRydW5UaW1lclwiKS5odG1sKFwiWW91IHNraXBwZWQuXCIpO1xuICAgICAgICBzcHJpdGVTZXRBbmltYXRpb24oXCJiYWNrZ3JvdW5kSW1hZ2VcIiwgcHJlbG9hZGVkQXNzZXRzW1wiaW5wdXRcIl0pO1xuXG4gICAgICAgIC8vIFRleHQgaW5wdXQgYnV0IFwiY3VzdG9tXCIuIEkgbWlnaHQgYmUgbWFraW5nIGV4dHJhIHdvcmsgZm9yIG15c2VsZiBoZXJlLCBidXQgaXQncyBmdW4gdG8gZmlndXJlIG91dFxuICAgICAgICBjcmVhdGVUZXh0U3ByaXRlSW5Hcm91cCh0ZXh0R3JvdXBOYW1lLCBcImlucHV0ZmllbGRcIiwgMjAwLCA2MCwgUExBWUdST1VORF9XSURUSCAvIDIgLSAxMDAsIFBMQVlHUk9VTkRfSEVJR0hUIC8gMiArIDM1KTtcbiAgICAgICAgdGV4dElucHV0U3ByaXRlU2V0SGFuZGxlcihcImlucHV0ZmllbGRcIiwgaW5wdXRIYW5kbGVyKTtcbiAgICAgICAgJChcIiNpbnB1dGZpZWxkXCIpLmNzcyhcImJhY2tncm91bmQtY29sb3JcIiwgXCJyZ2JhKDAsIDAsIDAsIDApXCIpO1xuICAgICAgICAkKFwiI2lucHV0ZmllbGRcIikuYXBwZW5kKGA8dGV4dGFyZWEgaWQ9XCJpbnB1dGZpZWxkMlwiIHJvd3M9XCIyXCIgY29scz1cIjIwXCI+Sm9obiBEb2U8L3RleHRhcmVhPmApO1xuICAgICAgICAkKFwiI2lucHV0ZmllbGRcIikuYXBwZW5kKGA8c3R5bGU+ZGl2e3RleHQtYWxpZ246IGNlbnRlcjt9PC9zdHlsZT48YnV0dG9uIGlkPVwibGVhZGVyYm9hcmRCdXR0b25cIiB0eXBlPVwiYnV0dG9uXCI+QWRkIG1lIHRvIGxlYWRlcmJvYXJkITwvYnV0dG9uPmApO1xuICAgICAgICAkKFwiI2lucHV0ZmllbGQyXCIpLmNzcyhcInJlc2l6ZVwiLCBcIm5vbmVcIik7XG4gICAgICAgICQoXCIjbGVhZGVyYm9hcmRCdXR0b25cIikuY2xpY2soaW5wdXRIYW5kbGVyKTtcbiAgICAgICAgZ2FtZVN0YXRlID0gXCJpbnB1dFwiO1xuICAgIH1cbn1cblxuY29uc3QgaW5wdXRIYW5kbGVyID0gKCkgPT4ge1xuICAgIHZhciBpbnB1dFZhbHVlID0gJChcIiNpbnB1dGZpZWxkMlwiKS52YWwoKTtcbiAgICBpZiAoaW5wdXRWYWx1ZS50cmltKCkubGVuZ3RoICE9IDApIHtcbiAgICAgICAgaWYgKGlucHV0VmFsdWUgaW4gbGVhZGVyQm9hcmREYXRhIHx8IGlucHV0VmFsdWUgPT0gJ0pvaG4gRG9lJyB8fCBpbnB1dFZhbHVlLmxlbmd0aCA+IDEwIHx8IGlucHV0VmFsdWUuaW5jbHVkZXMoXCJcXG5cIikpIHJldHVybjtcbiAgICAgICAgaWYgKHNwcml0ZUV4aXN0cyhcImlucHV0ZmllbGRcIikpIHJlbW92ZVNwcml0ZShcImlucHV0ZmllbGRcIik7XG4gICAgICAgIGlucHV0VmFsdWUgPSBpbnB1dFZhbHVlLnJlcGxhY2UoL1teYS16QS1aMC05XFxzXS9nLCBcIlwiKTsgLy8gVGhpcyBpcyBteSBhdHRlbXB0IGF0IHByb3RlY3RpbmcgbXlzZWxmIGZyb20gc29tZSBraW5kIG9mIFNRTCBpbmplY3Rpb25cbiAgICAgICAgaWYgKCFza2lwcGVkKSBsZWFkZXJib2FyZENSVUQoeyBpbnB1dFZhbHVlOiBmaW5hbFRpbWUgfSk7XG4gICAgICAgIGNyZWF0ZVNwcml0ZUluR3JvdXAoYmFja2dyb3VuZEdyb3VwTmFtZSwgc2NyZWVuc0Zvck1lbnVbXCJpZFwiXSwgc2NyZWVuc0Zvck1lbnVbXCJ3aW5TY3JlZW5cIl0sIFBMQVlHUk9VTkRfV0lEVEgsIFBMQVlHUk9VTkRfSEVJR0hUKTtcbiAgICAgICAgZ2FtZVN0YXRlID0gXCJmaW5hbFwiO1xuICAgICAgICBzcHJpdGVTZXRBbmltYXRpb24oXCJiYWNrZ3JvdW5kSW1hZ2VcIiwgcHJlbG9hZGVkQXNzZXRzW1wiYmFja2dyb3VuZFwiXSk7XG4gICAgICAgIHJlbW92ZVNwcml0ZShcInNwZWVkcnVuVGltZXJcIilcbiAgICB9XG59XG5cblxubGV0IGRyYXcgPSAoKSA9PiB7XG4gICAgLy8gSnVzdCBzbyB3ZSBjYW4gY2hlY2sgaWYgdGhleSBjbGljayB0aGlzIGZyYW1lIVxuICAgIGlmICghZ2V0TW91c2VCdXR0b24xKCkpIG1vdXNlRG93bkJlZm9yZSA9IGZhbHNlO1xuXG4gICAgLy8gR2FtZXN0YXRlc1xuICAgIGlmIChnYW1lU3RhdGUgPT0gXCJwbGF5aW5nXCIpIHtcbiAgICAgICAgLy8gQ2FtZXJhIG1vdmVtZW50LCBDYWxjdWxhdGUgdGhlIGRpc3RhbmNlIGZyb20gdGhlIHBsYXllciB0byB0aGUgY2VudGVyIG9mIHRoZSBzY3JlZW4sIGFuZCBhbGxvdyBpdCB0byBiZSBlZGl0ZWQgYnkgdGhlIGFycm93IGtleXNcbiAgICAgICAgY29uc3QgcGxheWVyRGlzdFRvQ2VudGVyWCA9IHNwcml0ZUdldFgocGxheWVyRGF0YVtcImhpdGJveElkXCJdKSAtIFBMQVlHUk9VTkRfV0lEVEggLyAyO1xuICAgICAgICBzY3JvbGxBbW91bnQgPSBnZXRLZXlTdGF0ZSgzNykgPyArK3Njcm9sbEFtb3VudCA6IChnZXRLZXlTdGF0ZSgzOSkgPyAtLXNjcm9sbEFtb3VudCA6IDApO1xuICAgICAgICB4T2Zmc2V0ID0gbGVycCh4T2Zmc2V0LCBjbGFtcCh4T2Zmc2V0ICsgLXBsYXllckRpc3RUb0NlbnRlclggKyBzY3JvbGxBbW91bnQgKiAxMCwgbWluWCwgbWF4WCksIGxlcnBGYWN0b3IpO1xuXG4gICAgICAgIC8vIFBsYXllclxuICAgICAgICBwbGF5ZXJNb3ZlbWVudCgpO1xuICAgICAgICBwbGF5ZXJBbmltYXRpb24oKTtcbiAgICAgICAgbW92ZUJsb2NrcygpO1xuXG4gICAgICAgIC8vIFNwZWNpZmljIExldmVsIHN0dWZmXG4gICAgICAgIGlmIChsZXZlbE51bWJlciA9PSA2KSB7XG4gICAgICAgICAgICBkcm9uZURhdGFBSSgpO1xuICAgICAgICAgICAgbW92ZU1pc3NpbGVzKCk7XG4gICAgICAgICAgICBpZiAoc3ByaXRlRXhpc3RzKFwiYm9zc0NvbnRyb2xzXCIpICYmIChnZXRLZXlTdGF0ZSgzNykgfHwgZ2V0S2V5U3RhdGUoMzkpIHx8IGdldEtleVN0YXRlKDY4KVxuICAgICAgICAgICAgICAgIHx8IGdldEtleVN0YXRlKDY1KSB8fCBnZXRLZXlTdGF0ZSg4NykgfHwgZ2V0S2V5U3RhdGUoMzIpKSkge1xuICAgICAgICAgICAgICAgIHJlbW92ZVNwcml0ZShcImJvc3NDb250cm9sc1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRpbWVyXG4gICAgICAgIGNvbnN0IGVsYXBzZWQgPSBuZXcgRGF0ZShEYXRlLm5vdygpIC0gc3RhcnRUaW1lIC0gcGF1c2VkVGltZSk7XG4gICAgICAgIHNwcml0ZShcInNwZWVkcnVuVGltZXJcIikuaHRtbChlbGFwc2VkLnRvSVNPU3RyaW5nKCkuc2xpY2UoMTEsIC0xKSk7XG5cbiAgICAgICAgLy8gSG93LXRvLXBsYXkgbWVudVxuICAgICAgICBpZiAoc3ByaXRlRXhpc3RzKFwiY29udHJvbHNcIikgJiYgKGdldEtleVN0YXRlKDM3KSB8fCBnZXRLZXlTdGF0ZSgzOSkgfHwgZ2V0S2V5U3RhdGUoNjgpXG4gICAgICAgICAgICB8fCBnZXRLZXlTdGF0ZSg2NSkgfHwgZ2V0S2V5U3RhdGUoODcpIHx8IGdldEtleVN0YXRlKDMyKSkpIHtcbiAgICAgICAgICAgIHJlbW92ZVNwcml0ZShcImNvbnRyb2xzXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUGF1c2UgTWVudVxuICAgICAgICBpZiAoZ2V0S2V5U3RhdGUoMjcpKSB7XG4gICAgICAgICAgICBnYW1lU3RhdGUgPSBcInBhdXNlZFwiO1xuICAgICAgICAgICAgcGF1c2VkVGltZSA9IERhdGUubm93KCkgLSBzdGFydFRpbWU7XG4gICAgICAgICAgICBjcmVhdGVTcHJpdGVJbkdyb3VwKHRleHRHcm91cE5hbWUsIFwicGF1c2VNZW51XCIsIHByZWxvYWRlZEFzc2V0c1tcInBhdXNlTWVudVwiXSwgUExBWUdST1VORF9XSURUSCwgUExBWUdST1VORF9IRUlHSFQpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChnYW1lU3RhdGUgPT0gXCJwYXVzZWRcIikge1xuXG4gICAgICAgIGlmIChnZXRNb3VzZUJ1dHRvbjEoKSkge1xuICAgICAgICAgICAgZ2FtZVN0YXRlID0gXCJwbGF5aW5nXCI7XG4gICAgICAgICAgICByZW1vdmVTcHJpdGUoXCJwYXVzZU1lbnVcIik7XG4gICAgICAgICAgICBzdGFydFRpbWUgPSBEYXRlLm5vdygpIC0gcGF1c2VkVGltZTtcbiAgICAgICAgICAgIHBhdXNlZFRpbWUgPSAwO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChnYW1lU3RhdGUgPT0gXCJtZW51XCIpIHtcbiAgICAgICAgbWFpbk1lbnUoKTtcbiAgICB9IGVsc2UgaWYgKGdhbWVTdGF0ZSA9PSBcImVuZGVkXCIpIHtcbiAgICAgICAgZW5kT2ZHYW1lKCk7XG4gICAgfSBlbHNlIGlmIChnYW1lU3RhdGUgPT0gXCJmaW5hbFwiKSB7XG4gICAgICAgIHdpblNjcmVlbigpO1xuICAgIH1cbn07Il19