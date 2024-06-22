const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const bestDisplay = document.getElementById('best');
const gameOverContainer = document.getElementById('gameOverContainer');
const restartButton = document.getElementById('restartButton');
const nameForm = document.getElementById('nameForm');
const playerNameInput = document.getElementById('playerName');
const rankingContainer = document.getElementById('rankingContainer');
const rankingList = document.getElementById('rankingList');
const soundCheckbox = document.getElementById('soundCheckbox');

const box = 20;
const canvasSizeX = 600;
const canvasSizeY = 400;

let snake;
let food;
let score;
let bestScore = localStorage.getItem('bestScore') ? parseInt(localStorage.getItem('bestScore')) : 0;
let d;
let game;
let rankings = JSON.parse(localStorage.getItem('rankings')) || [];

// Função para criar som usando Web Audio API
function playEatSound() {
    if (soundCheckbox.checked) {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(440, context.currentTime); // Frequência em Hz (A4)
        gainNode.gain.setValueAtTime(1, context.currentTime);

        oscillator.start();
        oscillator.stop(context.currentTime + 0.1); // Duração do som em segundos
    }
}

function init() {
    snake = [{ x: 15 * box, y: 10 * box }];
    food = generateFood();
    score = 0;
    d = null;
    clearInterval(game);
    gameOverContainer.style.display = 'none';
    nameForm.style.display = 'flex';
    game = setInterval(draw, 100);
    bestDisplay.innerHTML = 'Recorde: ' + bestScore; // Atualize o display do recorde
}

document.addEventListener('keydown', direction);
restartButton.addEventListener('click', init);
nameForm.addEventListener('submit', function (e) {
    e.preventDefault();
    addRanking(playerNameInput.value, score);
    playerNameInput.value = '';
    displayRankings();
    gameOverContainer.style.display = 'none';
    init();
});

function direction(event) {
    if (event.keyCode === 37 && d !== 'RIGHT') {
        d = 'LEFT';
    } else if (event.keyCode === 38 && d !== 'DOWN') {
        d = 'UP';
    } else if (event.keyCode === 39 && d !== 'LEFT') {
        d = 'RIGHT';
    } else if (event.keyCode === 40 && d !== 'UP') {
        d = 'DOWN';
    }
}

function collision(newHead, array) {
    for (let i = 0; i < array.length; i++) {
        if (newHead.x === array[i].x && newHead.y === array[i].y) {
            return true;
        }
    }
    return false;
}

function gameOver() {
    clearInterval(game);
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('bestScore', bestScore);
    }
    gameOverContainer.style.display = 'flex';
}

function generateFood() {
    let x = Math.floor(Math.random() * 29 + 1) * box;
    let y = Math.floor(Math.random() * 19 + 1) * box;
    return { x, y };
}

function animateFood() {
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x, food.y, box, box);
    ctx.strokeStyle = 'darkred';
    ctx.strokeRect(food.x, food.y, box, box);
}

function draw() {
    ctx.clearRect(0, 0, canvasSizeX, canvasSizeY);

    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = (i === 0) ? '#00FF00' : '#32CD32';
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
        ctx.strokeStyle = '#006400';
        ctx.strokeRect(snake[i].x, snake[i].y, box, box);
    }

    animateFood();

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (d === 'LEFT') snakeX -= box;
    if (d === 'UP') snakeY -= box;
    if (d === 'RIGHT') snakeX += box;
    if (d === 'DOWN') snakeY += box;

    if (snakeX === food.x && snakeY === food.y) {
        score++;
        food = generateFood();
        playEatSound(); // Tocar som ao comer comida
    } else {
        snake.pop();
    }

    let newHead = {
        x: snakeX,
        y: snakeY
    };

    if (snakeX < 0 || snakeY < 0 || snakeX >= canvasSizeX || snakeY >= canvasSizeY || collision(newHead, snake)) {
        gameOver();
    }

    snake.unshift(newHead);

    scoreDisplay.innerHTML = 'Comprimento: ' + score;
    bestDisplay.innerHTML = 'Recorde: ' + bestScore;
}

function addRanking(name, score) {
    rankings.push({ name, score });
    rankings.sort((a, b) => b.score - a.score);
    // Mantém apenas os 10 primeiros
    if (rankings.length > 10) {
        rankings = rankings.slice(0, 10);
    }
    localStorage.setItem('rankings', JSON.stringify(rankings));
}

function displayRankings() {
    rankingList.innerHTML = '';
    rankings.forEach((ranking, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${ranking.name}: ${ranking.score}`;
        rankingList.appendChild(li);
    });
}

init();
displayRankings();
