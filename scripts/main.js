const gameTitle = document.querySelector(".game-title");
const leftArrow = document.querySelector(".left-arrow");
const rightArrow = document.querySelector(".right-arrow");
const selectionBox = document.querySelector(".select-airplane");
const airplane = document.querySelector(".model img");
const playButton = document.querySelector(".playBtn");
const bulletsArea = document.querySelector(".bullets-area");
const obstaclesArea = document.querySelector(".obstacles-area");
const score = document.querySelector("#the-score");
const TEN = 10;
const THIRTY = 30;
const HUNDRED = 100;
let gameOver = false;
let scorePoints = 0;
let movementSpeed = 5;

playButton.addEventListener("click", () => {
    document.body.style.cursor = "none";
    airplane.style.width = "90px";
    throwMenu();
    document.addEventListener("mousemove", moveTheAirplane);
    setTimeout(() => {
        document.addEventListener("click", createBullet);
        setObstacles();
    }, 2000);

    showLiveScore();
    startSound();
});

function throwMenu() {
    gameTitle.classList.add("throw-title");
    playButton.classList.add("throw-button");
    selectionBox.classList.add("throw-box");
    airplane.classList.add("improve-airplane-position");
}

function moveTheAirplane(e) {
    let x = e.clientX;
    let y = e.clientY;
    airplane.style.left = x + "px";
    airplane.style.top = y + "px";
}

let bullet = [];
let bulletIndex = 0;

function createBullet(e) {
    let newBullet = document.createElement("img");
    newBullet.src = "./images/in_game/fork.webp";
    newBullet.classList.add("bullet");
    newBullet.id = bulletIndex;
    bullet[bulletIndex] = newBullet;
    bulletsArea.appendChild(newBullet);
    let posY = e.clientY;
    setBulletStartPosition(newBullet);
    moveBullet(bullet[bulletIndex], posY);
    ++bulletIndex;
    bulletSound();
}

function setBulletStartPosition(newBullet) {
    newBullet.style.left = airplane.style.left;
    newBullet.style.top = airplane.style.top;
}

let moveBulletRequest;

function moveBullet(bullet, posY) {
    posY -= 12;
    bullet.style.top = posY + "px";
    if (posY > -50) {
        moveBulletRequest = requestAnimationFrame(() => {
            moveBullet(bullet, posY);
        });
    } else {
        if (bulletsArea.contains(bullet)) {
            bulletsArea.removeChild(bullet);
        }
        if (bulletIndex === 10) {
            bulletIndex = 0;
        }
    }

    //CHECK BULLET vs OBSTACLE COLLISION
    for (let i = 0; i < meteorite.length; ++i) {
        let bulletRect = bullet.getBoundingClientRect();
        let meteoriteRect = meteorite[i].getBoundingClientRect();
        if (
            bulletRect.y < meteoriteRect.bottom - TEN &&
            bulletRect.bottom > meteoriteRect.y + TEN &&
            bulletRect.x < meteoriteRect.right - TEN &&
            bulletRect.right > meteoriteRect.x + TEN &&
            bulletRect.y > 0
        ) {
            if (obstaclesArea.contains(meteorite[i])) {
                obstaclesArea.removeChild(meteorite[i]);
            }
            bulletsArea.removeChild(bullet);
            score.textContent = ++scorePoints;
            destroySound();
            break;
        }
    }
}

let createObstaclesTimeout;

function setObstacles() {
    let random = Math.floor(Math.random() * 1800);
    createObstaclesTimeout = setTimeout(() => {
        createMeteorites();
        setObstacles();
    }, random);
}

let meteorite = [];
let indx = 0;

function createMeteorites() {
    let newMeteorite = document.createElement("img");
    newMeteorite.src =
        obstacleModels[Math.floor(Math.random() * obstacleModels.length)];
    newMeteorite.setAttribute("draggable", "false");
    newMeteorite.classList.add("meteorite");
    newMeteorite.classList.add("rotate-meteorite");
    newMeteorite.id = indx;
    meteorite[indx] = newMeteorite;
    obstaclesArea.appendChild(newMeteorite);

    setTimeout(() => {
        if (obstaclesArea.contains(newMeteorite) && !gameOver) {
            obstaclesArea.removeChild(newMeteorite);
        }
    }, 3800);

    let y = -150; //Start position
    let x = Math.floor(Math.random() * window.innerWidth);
    let randomSpeed = Math.floor(Math.random() * 13) + 4;
    setMeteoriteStartPosition(newMeteorite, x, y, randomSpeed);
    ++indx;
    if (meteorite.length == 20) {
        meteorite.splice(0, 10);
        indx = 10;
    }
}

function setMeteoriteStartPosition(newMeteorite, x, y, randomSpeed) {
    newMeteorite.style.left = x + "px";
    newMeteorite.style.top = y + "px";
    moveMeteorite(meteorite[indx], y, randomSpeed);
}

let moveMeteoritesRequest;

function moveMeteorite(newMeteorite, y, randomSpeed) {
    y += randomSpeed;
    newMeteorite.style.top = y + "px";
    if (y < window.innerHeight + HUNDRED) {
        moveMeteoritesRequest = requestAnimationFrame(() => {
            moveMeteorite(newMeteorite, y, randomSpeed);
        });
    }

    // AIRPLANE VS METEORITE COLLISION
    let airplaneRect = airplane.getBoundingClientRect();
    let obstacleRect = newMeteorite.getBoundingClientRect();
    if (
        airplaneRect.y < obstacleRect.bottom - THIRTY &&
        airplaneRect.right > obstacleRect.x + THIRTY &&
        airplaneRect.x < obstacleRect.right - THIRTY &&
        airplaneRect.bottom > obstacleRect.y + THIRTY
    ) {
        cancelAnimationFrame(moveMeteoritesRequest);
        clearTimeout(createObstaclesTimeout);
        document.removeEventListener("mousemove", moveTheAirplane);
        document.removeEventListener("click", createBullet);
        newMeteorite.src = "./images/in_game/explosion.png";
        newMeteorite.style.width = "120px";
        if (
            scorePoints > parseInt(localStorage.getItem("highScore")) ||
            !localStorage.getItem("highScore")
        ) {
            localStorage.setItem("highScore", scorePoints);
        }
        gameOverMenuScore.textContent =
            "Best Score: " + localStorage.getItem("highScore");
        document.body.style.cursor = "default";
        newMeteorite.classList.remove("rotate-meteorite");
        dropGameOverMenu();
        if (!gameOver) {
            crashSound();
            gameOver = true;
        }
    }
}

let airplaneModels = [
    "./images/Airplanes/default.png",
    "./images/Airplanes/model2.png",
    "./images/Airplanes/model3.png",
    "./images/Airplanes/model4.png",
];
let airplaneIndex = 0;

let obstacleModels = [
    "./images/Meteorites/meteorite.png",
    "./images/Meteorites/meteorite2.png",
    "./images/Meteorites/meteorite3.png",
];

leftArrow.onclick = () => {
    --airplaneIndex;
    if (airplaneIndex < 0) {
        airplaneIndex = airplaneModels.length - 1;
    }
    setModel(airplaneIndex);
    arrowSound();
};

rightArrow.onclick = () => {
    ++airplaneIndex;
    if (airplaneIndex > airplaneModels.length - 1) {
        airplaneIndex = 0;
    }
    setModel(airplaneIndex);
    arrowSound();
};

function setModel(i) {
    airplane.setAttribute("src", airplaneModels[i]);
}

// GAME OVER MENU
const gameOverMenu = document.querySelector(".game-over-menu");
const restartBtn = document.querySelector(".restart-game-button");

function dropGameOverMenu() {
    gameOverMenu.classList.add("drop-game-over-menu");
}

restartBtn.addEventListener("click", () => {
    gameOverMenu.classList.remove("drop-game-over-menu");
    setTimeout(() => {
        window.location.reload();
    }, 1200);
});

// GAME SCORE
const liveScoreBox = document.querySelector(".live-score");
const gameOverMenuScore = document.querySelector(".final-score p");

function showLiveScore() {
    liveScoreBox.classList.add("show-live-score");
}

// AUDIO
function arrowSound() {
    let sound = new Audio("./audio/select_model.wav");
    sound.volume = 0.4;
    onload = sound.play();
}

function bulletSound() {
    let sound = new Audio("./audio/bullet_sound.wav");
    sound.volume = 0.4;
    onload = sound.play();
}

function startSound() {
    let sound = new Audio("./audio/hide_menu.wav");
    sound.volume = 0.5;
    onload = sound.play();
}

function crashSound() {
    let sound = new Audio("./audio/crash.wav");
    sound.volume = 0.5;
    onload = sound.play();
}

function destroySound() {
    let sound = new Audio("./audio/destroyed_meteorite.wav");
    sound.volume = 0.35;
    onload = sound.play();
}
