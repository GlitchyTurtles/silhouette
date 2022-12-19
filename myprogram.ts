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
    sprite,
    getMouseButton1,
    SpriteDict,
    getMouseX,
    getMouseY,
    spriteExists,
    removeSprite,
    consolePrint,
    spriteRotate,
    createRectInGroup,
    spriteId,
    spriteHitDirection,
    createTextSpriteInGroup,
    disableContextMenu,
    textInputSpriteSetHandler
} from "./libs/lib-gqguardrail-exports.ts";
import * as Fn from "./libs/lib-gqguardrail-exports.ts";
// Don't edit the import lines above, or you won't be able to write your program!

// Also, do not use the following variable and function names in your own code below:
//    setup, draw, Fn
// and the other imported names above.

// Write your program below this line:
// ***********************************
import { PlayerSpriteDict, RespawnDict, LeaderboardDict, LevelData, BlockDict } from "./utils.ts";

const leaderboardCRUD = async (data: object) => {
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

// Global vars
declare var $: any;
let levelNumber: number = 6;
let mouseDownBefore: boolean = false;
let gameState: string = "menu";
let startTime: number = Date.now();
let deaths: number = 0;
let scrollAmount = 0;
let waitTimer: number;
let finalTime = 10000000; // just in case of a bug, it's set really high
let pausedTime = 0;
let skipped = false;
let leaderBoardData: LeaderboardDict = {
    "this won't be seen ever...": 340123,
};

// Levels
let levelBlocks: SpriteDict[] = [];

// Camera and camera constraints
let xOffset = 669;
let yOffset = 0;
let minX = -1200;
const maxX = 750;
const lerpFactor = 0.1;

// Change if you want extra info
const debug = false;

// Groups
const backgroundGroupName: string = "backgroundGroup";
createGroupInPlayground(backgroundGroupName);

const collisionGroupName: string = "collisionGroup";
createGroupInPlayground(collisionGroupName);

const bounceGroupName: string = "bounceGroup";
createGroupInPlayground(bounceGroupName);

const playerGroupName: string = "playerGroup";
createGroupInPlayground(playerGroupName);

const enemyGroupName: string = "ememyGroup";
createGroupInPlayground(enemyGroupName);

const uiGroupName: string = "uiGroup";
createGroupInPlayground(uiGroupName);

const textGroupName: string = "textGroup";
createGroupInPlayground(textGroupName);

// Easy-Access Level Data
const spawnPoint: RespawnDict = {
    1: [-350, 422],
    2: [-350, 422],
    3: [-350, 422],
    4: [-350, 422],
    5: [-350, 323],
    6: [-350, 422]
}

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

const levelData: { [index: number]: LevelData } = {
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
}

var missiles: SpriteDict[] = [];
var missleCount: number = 0;

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
}

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
}

// Utility functions
const lerp = (a: number, b: number, t: number) => (1 - t) * a + t * b;
const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

// Disable right click context menu
disableContextMenu();

// Start Screen!
const mainMenu = function () {
    if (screensForMenu["menuState"].includes("main")) {
        mainState();
    } else {
        leaderboardState();
    }
}

const mainState = function () {

    if (getMouseX() < 275 && getMouseY() < 75) {
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
    } else if (getMouseX() > 165 && getMouseX() < 485 && getMouseY() > 400 && getMouseY() < 435 || getKeyState(13)) {
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
    } else if (getKeyState(80)) {
        skipped = true;
        levelNumber = 6;
        screensForMenu["menuState"] = "";
        gameState = "playing";
        startGame();
    } else {
        if (screensForMenu["menuState"] != "mainMenu") {
            screensForMenu["menuState"] = "mainMenu";
            spriteSetAnimation(screensForMenu["id"], screensForMenu["mainMenu"]);
        }
    }
}

const scoreSpriteNames = ["scoreboardDisplayRanks", "scoreboardDisplayTimes", "scoreboardDisplayNames"]

const leaderboardState = function () {
    if (!spriteExists("scoreboardDisplayTimes")) leaderboardLogic(); // so it does it just once
    if (getMouseX() > 280 && getMouseX() < 360 && getMouseY() > 420 && getMouseY() < 455) {
        if (screensForMenu["menuState"] != "leaderboardMenuSelected") {
            screensForMenu["menuState"] = "leaderboardMenuSelected";
            spriteSetAnimation(screensForMenu["id"], screensForMenu["leaderboardMenuSelected"]);
        }
        if (getMouseButton1()) {
            if (mouseDownBefore) return // Reverse check
            screensForMenu["menuState"] = "mainMenu";
            scoreSpriteNames.forEach(sprite => removeSprite(sprite));
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
    } catch (error) {
        return sprite("scoreboardDisplayTimes").html("Load failed.");
    }

    // This uses the Schwartzian transform, because you can't sort a dict (at least to my understanding)
    var items = Object.keys(leaderBoardData).map((key) => { return [key, leaderBoardData[key]] });
    items.sort((first, second) => { return +first[1] - +second[1] }); // Why am I doing the '+x - +x'? *Sometimes* throws random error (ts(2362)) if not done like this.
    var keys = items.map((e) => { return e[0] });

    // First make a list of top 8
    var [displayRanks, displayTimes, displayNames]: string[] = ["", "", ""];
    for (let i = 0; i < 8; i++) {
        // Break if time is NaN, AKA no more existing items on list
        let playerTime = leaderBoardData[keys[i]];
        if (!playerTime) break;

        // Add to display var
        displayTimes = displayTimes + `${new Date(playerTime).toISOString().slice(11, -1)}` + "<br>";
        displayNames = displayNames + keys[i] + "<br>";
        // Use a regular expression to extract the last digit of the number and append the appropriate ordinal suffix
        displayRanks = displayRanks + (i + 1).toString().replace(/\d+$/, (match: string) => {
            return match + (match === "1" ? "st" : match === "2" ? "nd" : match === "3" ? "rd" : "th");
        }) + "<br>";
    }

    // Display the display vars
    const values = [displayRanks, displayTimes, displayNames];
    scoreSpriteNames.forEach((spriteName, index) => { sprite(spriteName).html(values[index]) });
}

const winScreen = () => {
    if (getMouseX() > 100 && getMouseX() < 555 && getMouseY() > 400 && getMouseY() < 465 || getKeyState(13)) {
        if (screensForMenu["menuState"] != "winScreenSelected") {
            screensForMenu["menuState"] = "winScreenSelected";
            spriteSetAnimation(screensForMenu["id"], screensForMenu["winScreenSelected"]);
        }
        if (getMouseButton1() || getKeyState(13)) {
            createSpriteInGroup(uiGroupName, "overlaySprite", preloadedAssets["mainOverlay"], PLAYGROUND_WIDTH, PLAYGROUND_HEIGHT);
            if (mouseDownBefore) return;
            screensForMenu["menuState"] = "mainMenu";
            gameState = "menu";
            mouseDownBefore = true;
            skipped = false;
        }
    } else {
        if (screensForMenu["menuState"] != "winScreen") {
            screensForMenu["menuState"] = "winScreen";
            spriteSetAnimation(screensForMenu["id"], screensForMenu["winScreen"]);
        }
    }
}

let setup = function () {
    createSpriteInGroup(backgroundGroupName, screensForMenu["id"], screensForMenu["mainMenu"], PLAYGROUND_WIDTH, PLAYGROUND_HEIGHT);
    createSpriteInGroup(uiGroupName, "overlaySprite", preloadedAssets["mainOverlay"], PLAYGROUND_WIDTH, PLAYGROUND_HEIGHT);
};

const newBlock = function (xPos: number, yPos: number, blockSize: string) {
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
        if (specialVals == null) return consolePrint("You made a mistake inputting values into a movingblock");
        var width = parseInt(specialVals[0]);
        var height = parseInt(specialVals[1]);
        var [minXPos, maxXPos] = [parseInt(specialVals[2]), parseInt(specialVals[3])];
        var [minYPos, maxYPos] = [parseInt(specialVals[4]), parseInt(specialVals[5])];
        var [xSpeed, ySpeed] = [parseInt(specialVals[6]), parseInt(specialVals[7])];
        blockSize = `${specialVals[0]}x${specialVals[1]}`;
    } else {
        var width = parseInt(blockSize.split("x")[0]);
        var height = parseInt(blockSize.split("x")[1]);
        var [minXPos, maxXPos] = [0, 0];
        var [minYPos, maxYPos] = [0, 0];
        var [xSpeed, ySpeed] = [0, 0];
    }

    var i = levelBlocks.length; // Auto-updating index
    var newBlockInfo: BlockDict = {
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
}

const spawnMissle = function (xPos: number, yPos: number) {
    // Instance the missile
    missleCount++;
    var missileInfo: SpriteDict = {
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
    spriteRotate(missileInfo["id"], angle)

    // Calculate the velocity vector using trigonometry
    missileInfo["xSpeed"] = Math.cos(angle * (Math.PI / 180)) * 10;
    missileInfo["ySpeed"] = Math.sin(angle * (Math.PI / 180)) * 10;
}


// Start timer and begin
const startGame = function () {
    // Remove menu
    if (spriteExists(screensForMenu["id"])) removeSprite(screensForMenu["id"])

    // Controls guide
    createSpriteInGroup(uiGroupName, "controls", preloadedAssets["controls"], 306, 326, PLAYGROUND_WIDTH / 2 - 153, PLAYGROUND_HEIGHT / 2 - 163)

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
    if (!spriteExists("backgroundImage")) createSpriteInGroup(backgroundGroupName, "backgroundImage", preloadedAssets["background"], PLAYGROUND_WIDTH, PLAYGROUND_HEIGHT, 0, 0);

    // Create 2 waves: wave1 and wave2
    createSpriteInGroup(backgroundGroupName, "wave1", preloadedAssets["wave1"], PLAYGROUND_WIDTH * 5, PLAYGROUND_HEIGHT, 0, 0);
    createSpriteInGroup(backgroundGroupName, "wave2", preloadedAssets["wave2"], PLAYGROUND_WIDTH * 5, PLAYGROUND_HEIGHT, 0, 0);
}


const setupLevel = function () {
    // Remove old level
    levelBlocks.forEach((block) => { removeSprite(block["id"]); });
    levelBlocks = [];

    // Set up new level
    const data = levelData[levelNumber];
    data.forEach(({ x, y, size }) => { newBlock(x, y, size) });

    // Special conditions for the boss fight!
    if (levelNumber == 6) {
        level6Setup();
    }
}

const level6Setup = () => {
    if (!spriteExists(droneData["id"])) {
        minX = 10;
        createRectInGroup(textGroupName, "healthBarMain", 52, 72, 540, 10, "#76B947", 0, 0, 0);
        createSpriteInGroup(enemyGroupName, droneData["id"], droneData["droneFly"], droneData["width"], droneData["height"], droneData["xPos"], droneData["yPos"]);
        spriteSetAnimation("overlaySprite", preloadedAssets["bossOverlay"]);
        createRectInGroup(textGroupName, "healthBarSecond", 50, 70, 544, 14, "#171717", 0, 0, 0);
        createRectInGroup(textGroupName, "healthBarBack", 52, 72, 540, 10, "#FF5C5C", 0, 0, 0);
        createTextSpriteInGroup(textGroupName, "bossBarText", 540, 50, 40, 40)
        sprite("bossBarText").css("font-family", "Tahoma").css("background-color", "rgba(0, 0, 0, 0)").css("font-size", "20pt").css("text-align", "center");
        sprite("bossBarText").html("Evil Inc: Dronie")
        createSpriteInGroup(uiGroupName, "bossControls", preloadedAssets["bossControls"], 307, 329, PLAYGROUND_WIDTH / 2 - 153, PLAYGROUND_HEIGHT / 2 - 163)
    } else {
        missiles.forEach(missile => { removeSprite(missile["id"]) });
        missiles = [];
        droneData["yPos"], droneData["xPos"] = 200, 200;
        spriteSetXY(droneData["id"], droneData["xPos"], droneData["yPos"]);
        droneData["health"] = 540;
        droneData["attackState"] = "passive";
        if (!spriteExists("bossControls")) createSpriteInGroup(uiGroupName, "bossControls", preloadedAssets["bossControls"], 307, 329, PLAYGROUND_WIDTH / 2 - 153, PLAYGROUND_HEIGHT / 2 - 163)
    }
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
    var groundSprite: SpriteDict = levelBlocks.find(sprite => sprite["id"] === spriteId(hitSprite)) as SpriteDict;
    var collisionNormal = spriteHitDirection(groundSprite["id"], groundSprite["xPos"], groundSprite["yPos"], groundSprite["xSpeed"], groundSprite["ySpeed"], groundSprite["width"], groundSprite["height"], playerData["hitboxId"], playerData["xPos"], playerData["yPos"], playerData["xSpeed"], playerData["ySpeed"], playerData['hitboxWidth'], playerData["hitboxHeight"])

    // Un-collide the player
    switch (true) {
        case collisionNormal["right"]:
            playerData["xSpeed"] = 0;
            var amountOverlap = (playerData["xPos"] + playerData["hitboxWidth"]) - groundSprite["xPos"];
            if (amountOverlap > 0) playerData["xPos"] -= amountOverlap;
            break;
        case collisionNormal["left"]:
            playerData["xSpeed"] = 0;
            amountOverlap = playerData["xPos"] - (groundSprite["xPos"] + groundSprite["width"]);
            if (amountOverlap < 0) playerData["xPos"] -= amountOverlap;
            break;
        case collisionNormal["down"]:
            playerData["groundColliding"] = true;
            playerData["ySpeed"] = 0;
            amountOverlap = (playerData["yPos"] + playerData["hitboxHeight"]) - groundSprite["yPos"];
            if (amountOverlap > 0) playerData["yPos"] -= amountOverlap;

            if (Math.abs(groundSprite["xSpeed"]) > 0) playerData["xPos"] += groundSprite["xSpeed"]
            if (Math.abs(groundSprite["ySpeed"]) > 0) playerData["ySpeed"] += groundSprite["ySpeed"];
            break;
        case collisionNormal["up"]:
            playerData["groundColliding"] = false;
            playerData["ySpeed"] = 0;
            amountOverlap = playerData["yPos"] - (groundSprite["yPos"] + groundSprite["height"]);
            if (amountOverlap > 0) playerData["yPos"] -= amountOverlap;
            break;
    }
}

const playerMovement = function () { // This is exclusively for the player, so we don't need a spriteData arg
    // Tahoma is a CSS Web Safe Font!
    if (debug) sprite("debugShown").html(`Offset: ${xOffset} | Player X: ${playerData["xPos"].toPrecision(3)} | Player Y: ${playerData["yPos"].toPrecision(3)} | Player Y Speed: ${playerData["ySpeed"].toPrecision(3)} | Player X Speed: ${playerData["xSpeed"].toPrecision(3)}`).css("font-family", "Tahoma").css("background-color", "rgba(0, 0, 0, 0)");

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
    if (Math.abs(playerData["xSpeed"]) <= 0.001) playerData["xSpeed"] = 0;

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

    // Reset after falling into the void or touching an enemy
    var touchedEnemy: boolean = false;
    forEachSpriteGroupCollisionDo(playerData["hitboxId"], enemyGroupName, (collIndex, hitSprite) => {
        if (spriteId(hitSprite) == droneData["id"]) {
            var collisionNormal = spriteHitDirection(droneData["id"], droneData["xPos"], droneData["yPos"], droneData["xSpeed"], droneData["ySpeed"], droneData["width"], droneData["height"], playerData["hitboxId"], playerData["xPos"], playerData["yPos"], playerData["xSpeed"], playerData["ySpeed"], playerData['hitboxWidth'], playerData["hitboxHeight"])
            if (collisionNormal["down"]) {
                playerData["ySpeed"] = -5;
                droneData["health"] -= 50;
                droneData["attackState"] = "return";
            } else if (collisionNormal["up"]) {
                touchedEnemy = true;
            }
        } else {
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
    if (playerData["xPos"] < -740) playerData["xPos"] = -740;

    // Actually move the player
    playerData["xPos"] = playerData["xPos"] + playerData["xSpeed"];
    playerData["yPos"] = playerData["yPos"] + playerData["ySpeed"];
    spriteSetXY(playerData["hitboxId"], playerData["xPos"] + xOffset, playerData["yPos"] + yOffset);
}


const updateHealth = () => {
    let prevWidth = spriteGetWidth("healthBarMain");
    if (spriteExists("healthBarMain")) removeSprite("healthBarMain");
    prevWidth = lerp(prevWidth, droneData["health"], lerpFactor)
    createRectInGroup(textGroupName, "healthBarMain", 52, 72, prevWidth, 10, "#76B947", 0, 0, 0);
}

const droneDataAI = () => {
    // Die animation
    if (droneData["health"] <= 0) {
        gameState = "ended";
        finalTime = Date.now() - startTime;
        waitTimer = Date.now();
        if (spriteExists("dronePredict")) removeSprite("dronePredict");
    }

    // Drone "AI" is done with states.
    if (droneData["attackState"] == "passive") {
        droneMovement();
        if (Math.random() > 0.2) {
            droneData["attackState"] = "missiles";
        }
        if (spriteExists("dronePredict")) removeSprite("dronePredict");
    } else if (droneData["attackState"] == "swoop") {
        if (Date.now() - droneData["timer"] > 2000) {
            droneSwoop();
        } else {
            if (Date.now() - droneData["timer"] < 1000) {
                droneData["targetX"] = playerData["xPos"];
                droneData["targetY"] = playerData["yPos"];
            }
            if (!spriteExists("dronePredict")) createSpriteInGroup(uiGroupName, "dronePredict", preloadedAssets["dronePredict"], 196, 53, droneData["targetX"], droneData["targetY"]);
            if (spriteExists("dronePredict")) {
                spriteSetXY("dronePredict", droneData["targetX"] - droneData["width"] / 2 + xOffset, droneData["targetY"] - droneData["height"] / 2 + yOffset)
            }
            droneMovement();
        }
    } else if (droneData["attackState"] == "missiles") {
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
        if (spriteExists("dronePredict")) removeSprite("dronePredict");
    } else if (droneData["attackState"] == "return") {
        droneReturn();
        if (spriteExists("dronePredict")) removeSprite("dronePredict");
    }

    // Drone health
    updateHealth();

    // Actually move the Drone
    droneData["xPos"] = droneData["xPos"] + droneData["xSpeed"];
    droneData["yPos"] = droneData["yPos"] + droneData["ySpeed"];
    spriteSetXY(droneData["id"], droneData["xPos"] + xOffset, droneData["yPos"] + yOffset);
}

const droneMovement = () => {
    const distToPlayer = playerData["xPos"] - droneData["xPos"] - droneData["width"] / 2;
    if (Math.abs(distToPlayer) > 10) {
        droneData["xSpeed"] += clamp(Math.abs(distToPlayer) / 25, 0, 25) * (distToPlayer / Math.abs(distToPlayer));
        droneData["xSpeed"] *= 0.7;
    } else {
        droneData["xSpeed"] *= 0.5;
    }
    spriteRotate(droneData["id"], clamp(droneData["xSpeed"] * 1.6, -50, 50))
    droneData["yPos"] = droneData["yAmplitude"] * Math.sin(Date.now() * 2 * Math.PI / droneData["yPeriod"]) + 125;
}

const droneSwoop = () => {
    if (spriteExists("dronePredict")) spriteSetXY("dronePredict", droneData["targetX"] - droneData["width"] / 2 + xOffset, droneData["targetY"] - droneData["height"] / 2 + yOffset)
    const distToTargetX = droneData["targetX"] - droneData["xPos"] - droneData["width"] / 2;
    const distToTargetY = droneData["targetY"] - droneData["yPos"] - droneData["height"] / 2;
    if (Math.abs(distToTargetX) > 10 || Math.abs(distToTargetY) > 10) {
        droneData["xSpeed"] += clamp(Math.abs(distToTargetX) / 25, 0, 25) * (distToTargetX / Math.abs(distToTargetX));
        droneData["xSpeed"] *= 0.7;

        droneData["ySpeed"] += clamp(Math.abs(distToTargetY) / 25, 0, 25) * (distToTargetY / Math.abs(distToTargetY));
        droneData["ySpeed"] *= 0.7;
        droneData["pauseOnGround"] = Date.now();
        if (spriteExists("dronePredict")) removeSprite("dronePredict");
    } else {
        droneData["xSpeed"] = 0;
        droneData["ySpeed"] = 0;
        if (Date.now() - droneData["pauseOnGround"] > 3000) {
            droneData["pauseOnGround"] = Date.now();
            droneData["attackState"] = "return";
        }
    }
    spriteRotate(droneData["id"], clamp(droneData["xSpeed"] * 1.6, -50, 50))
}

const droneReturn = () => {
    droneData["targetY"] = droneData["yAmplitude"] * Math.sin(Date.now() * 2 * Math.PI / droneData["yPeriod"]) + 125;
    const distToTargetY = droneData["targetY"] - droneData["yPos"] - droneData["height"] / 2;
    const distToPlayer = playerData["xPos"] - droneData["xPos"] - droneData["width"] / 2;
    if (Math.abs(distToPlayer) > 10) {
        droneData["xSpeed"] += clamp(Math.abs(distToPlayer) / 25, 0, 25) * (distToPlayer / Math.abs(distToPlayer));
        droneData["xSpeed"] *= 0.7;
    } else {
        droneData["xSpeed"] *= 0.5;
    }
    if (Math.abs(distToTargetY) > 10) {
        droneData["ySpeed"] += clamp(Math.abs(distToTargetY) / 25, 0, 25) * (distToTargetY / Math.abs(distToTargetY));
        droneData["ySpeed"] *= 0.7;
    } else {
        droneData["attackState"] = "missiles";
    }
    spriteRotate(droneData["id"], clamp(droneData["xSpeed"] * 1.6, -50, 50))
}

const moveBlocks = () => {
    for (let i = 0; i < levelBlocks.length; i++) {
        let currentBlock = levelBlocks[i];
        if (Math.abs(currentBlock["xSpeed"]) > 0) {
            currentBlock["xPos"] += currentBlock["xSpeed"];
            if (currentBlock["xPos"] <= currentBlock["minXPos"] || currentBlock["xPos"] >= currentBlock["maxXPos"]) currentBlock["xSpeed"] = -currentBlock["xSpeed"];
        }
        if (Math.abs(currentBlock["ySpeed"]) > 0) {
            currentBlock["yPos"] += currentBlock["ySpeed"];
            if (currentBlock["yPos"] < currentBlock["minYPos"] || currentBlock["yPos"] > currentBlock["maxYPos"]) currentBlock["ySpeed"] = -currentBlock["ySpeed"];
        }
        spriteSetXY(currentBlock["id"], currentBlock["xPos"] + xOffset, currentBlock["yPos"] + yOffset);
    }

    spriteSetXY("wave1", xOffset / 5 - PLAYGROUND_WIDTH, yOffset)
    spriteSetXY("wave2", xOffset / 10 - PLAYGROUND_WIDTH, yOffset)
}

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
            if (index > -1) missiles.splice(index, 1);
        });
    });
}

const endOfGame = () => {
    updateHealth();
    if (Date.now() - waitTimer > 2000) {
        levelBlocks.forEach(blockDict => { removeSprite(blockDict["id"]) });
        missiles.forEach(missileDict => { removeSprite(missileDict["id"]) });
        levelBlocks = []
        missiles = []

        const removeSprites: string[] = [playerData["spriteId"], playerData["hitboxId"], "wave1", "wave2", droneData["id"], "healthBarMain", "healthBarSecond", "healthBarBack", "bossBarText"]
        removeSprites.forEach(name => { removeSprite(name); });

        if (spriteExists("dronePredict")) removeSprite("dronePredict");
        removeSprite("overlaySprite")
        droneData["health"] = 540;
        playerData["xPos"] = spawnPoint[levelNumber][0]
        playerData["yPos"] = spawnPoint[levelNumber][1]

        spriteSetXY("speedrunTimer", PLAYGROUND_WIDTH / 2 - 150, PLAYGROUND_HEIGHT / 2 - 85)
        sprite("speedrunTimer").css("color", "rgba(255, 255, 255, 255)").css("font-size", "35pt");
        if (skipped) sprite("speedrunTimer").html("You skipped.");
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
}

const inputHandler = () => {
    var inputValue = $("#inputfield2").val();
    if (inputValue.trim().length != 0) {
        if (inputValue in leaderBoardData || inputValue == 'John Doe' || inputValue.length > 10 || inputValue.includes("\n")) return;
        if (spriteExists("inputfield")) removeSprite("inputfield");
        inputValue = inputValue.replace(/[^a-zA-Z0-9\s]/g, ""); // This is my attempt at protecting myself from some kind of SQL injection
        if (!skipped) leaderboardCRUD({ inputValue: finalTime });
        createSpriteInGroup(backgroundGroupName, screensForMenu["id"], screensForMenu["winScreen"], PLAYGROUND_WIDTH, PLAYGROUND_HEIGHT);
        gameState = "final";
        spriteSetAnimation("backgroundImage", preloadedAssets["background"]);
        removeSprite("speedrunTimer")
    }
}


let draw = () => {
    // Just so we can check if they click this frame!
    if (!getMouseButton1()) mouseDownBefore = false;

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
    } else if (gameState == "paused") {

        if (getMouseButton1()) {
            gameState = "playing";
            removeSprite("pauseMenu");
            startTime = Date.now() - pausedTime;
            pausedTime = 0;
        }
    } else if (gameState == "menu") {
        mainMenu();
    } else if (gameState == "ended") {
        endOfGame();
    } else if (gameState == "final") {
        winScreen();
    }
};