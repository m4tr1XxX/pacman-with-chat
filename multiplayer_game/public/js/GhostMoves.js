import { DIRECTIONS, OBJECT_TYPE } from "./setup.js";

//random movements
export function randomMovement(position, direction, objectExist) {
    let dir = direction;
    let nextMovePos = position + dir.movement;
    //
    const keys = Object.keys(DIRECTIONS);

    while (
        objectExist(nextMovePos, OBJECT_TYPE.WALL)  // || objectExist(nextMovePos, OBJECT_TYPE.GHOST)
    ) {
        //random key movements
        const key = keys[Math.floor(Math.random() * keys.length)];
        //next movement
        dir = DIRECTIONS[key];
        //set next move
        nextMovePos = position + dir.movement;
    }
    return { nextMovePos, direction: dir };
}