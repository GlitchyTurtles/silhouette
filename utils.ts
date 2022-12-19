import * as Fn from "./libs/lib-gqguardrail-exports.ts";

export type PlayerSpriteDict = {
    "hitboxId": string;
    "hitboxWidth": number;
    "hitboxHeight": number;
    "xPos": number;
    "yPos": number;
    "xSpeed": number;
    "ySpeed": number;
    "groundColliding": boolean;
    "coyoteTime": number;
    "coyoteCounter": number;
    "boostCooldown": number;
    //---------------------------
    "spriteId": string;
    "spriteWidth": number;
    "spriteHeight": number;
    "animState": string;
    "lastDirection": number;
    "animHitbox": Fn.SpriteAnimation;
    "animIdleLeft": Fn.SpriteAnimation;
    "animIdleRight": Fn.SpriteAnimation;
    "animJumpLeft": Fn.SpriteAnimation;
    "animJumpRight": Fn.SpriteAnimation;
    "animJumpStraight": Fn.SpriteAnimation;
    "animRunCycleLeft": Fn.SpriteAnimation;
    "animRunCycleRight": Fn.SpriteAnimation;
};

export type RespawnDict = {
    [s: number]: any;
}

export type LeaderboardDict = {
    [s: string]: any;
}

export type LevelData = {
    x: number;
    y: number;
    size: string;
}[];

export type BlockDict = {
    "id": string;
    "width": number;
    "height": number;
    "xPos": number;
    "yPos": number;
    "xSpeed": number;
    "ySpeed": number;
    "minXPos": number;
    "maxXPos": number;
    [s: string]: any;
}