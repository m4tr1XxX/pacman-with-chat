import { LEVEL, OBJECT_TYPE } from './setup.js';
import GameBoard from './GameBoard.js';
import Pacman from './Pacman.js';
import { randomMovement } from './GhostMoves.js';
import Ghost from './Ghost.js';
//sounds
let soundDot = '/sounds/munch.wav'
let soundPill = '/sounds/pill.wav'
let soundGameStart = '/sounds/game_start.wav'
let soundGameOver = '/sounds/death.wav'
let soundGhost = '/sounds/eat_ghost.wav'


//elements
const gameGrid = document.querySelector('#game');
const scoreTable = document.querySelector('#score');
const startButton = document.querySelector('#start-button');

//game consts
const POWER_PILL_TIME = 10000; // 10 SECS
const GLOBAL_SPEED = 80;
const gameBoard = GameBoard.createGameBoard(gameGrid, LEVEL);


//SETUP
let score = 0;
let timer = null;
let gameWin = false;
let powerPillActive = false;
let powerPillTimer = null;


//audios
function playAudio(audio) {
    const soundEffect = new Audio(audio);
    soundEffect.play();
}

function gameOVer(pacman, grid) {
    playAudio(soundGameOver);
    
    document.removeEventListener('keydown', (e) =>
        pacman.handleKeyInput(e, gameBoard.objectExist)
    );

    gameBoard.showGameStatus(gameWin);

    clearInterval(timer);

    startButton.classList.remove('hide');


}

function checkCollision(pacman, ghosts) {
    const collidedGhost = ghosts.find((ghost) => pacman.pos === ghost.pos);

    if (collidedGhost) {
        if (pacman.powerPill) { //if pacman have powerpill
            playAudio(soundGhost);
            gameBoard.removeObject(collidedGhost.pos, [
                OBJECT_TYPE.GHOST,
                OBJECT_TYPE.SCARED,
                collidedGhost.name
            ]);
            collidedGhost.pos = collidedGhost.startPos;
            score += 100;
        } else {   //when pacman dies
            gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.PACMAN]);
            gameBoard.rotateDiv(pacman.pos, 0);
            gameOVer(pacman, gameGrid);
        }
    }
}

function gameLoop(pacman, ghosts) {
    gameBoard.moveCharacter(pacman);
    checkCollision(pacman, ghosts);

    ghosts.forEach((ghost) => gameBoard.moveCharacter(ghost));
    checkCollision(pacman, ghosts);

    //pacman eats dot
    if (gameBoard.objectExist(pacman.pos, OBJECT_TYPE.DOT)) {
        playAudio(soundDot);
        gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.DOT]);
        gameBoard.dotCount--;
        score += 10;
    }
    //check if pacman eats powerpill
    if (gameBoard.objectExist(pacman.pos, OBJECT_TYPE.PILL)) {
        playAudio(soundPill);
        gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.PILL]);

        pacman.powerPill = true;
        score += 50;
        clearTimeout(powerPillTimer);
        powerPillTimer = setTimeout(
            () => (pacman.powerPill = false),
            POWER_PILL_TIME
        );
    }

    //scared ghostmode
    if (pacman.powerPill !== powerPillActive) {
        powerPillActive = pacman.powerPill;
        ghosts.forEach((ghost) => (ghost.isScared = pacman.powerPill));
    }

    //if all dots eaten
    if (gameBoard.dotCount === 0) {
        gameWin = true; 
        gameOVer(pacman, ghosts);
    }

    //socreboard
    scoreTable.innerHTML = score;
}

function startGame() {
    playAudio(soundGameStart);
    gameWin = false;
    powerPillActive = false;
    score = 0;
    startButton.classList.add('hide');

    gameBoard.createGrid(LEVEL);

    const pacman = new Pacman(2, 290);
    gameBoard.addObject(290, [OBJECT_TYPE.PACMAN]);
    document.addEventListener('keydown', (e) =>
        pacman.handleKeyInput(e, gameBoard.objectExist)
    );

    //ghosts
    const ghosts = [
        new Ghost(5, 188, randomMovement, OBJECT_TYPE.BLINKY),
        new Ghost(4, 209, randomMovement, OBJECT_TYPE.PINKY),
        new Ghost(3, 230, randomMovement, OBJECT_TYPE.INKY),
        new Ghost(2, 251, randomMovement, OBJECT_TYPE.CLYDE),
    ]

    timer = setInterval(() => gameLoop(pacman, ghosts), GLOBAL_SPEED)
}
//start game
startButton.addEventListener('click', startGame);