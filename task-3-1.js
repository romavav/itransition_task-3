const readline = require('readline');
const crypto = require('crypto');

// Генератор случайных чисел
class RandomGenerator {
    static generateRandomKey(length) {
        return crypto.randomBytes(Math.ceil(length / 8)).toString('hex').slice(0, length);
    }
}

// Функция для вычисления HMAC
function calculateHMAC(message, key) {
    const hmac = crypto.createHmac('sha256', key);
    hmac.update(message);
    return hmac.digest('hex');
}

// Класс определения победителя
class Rules {
    constructor(moves) {
        this.moves = moves;
        this.halfLen = Math.floor(moves.length / 2);
    }

    determineWinner(userMove, computerMove) {
        const userIndex = this.moves.indexOf(userMove);
        const computerIndex = this.moves.indexOf(computerMove);

        if (userIndex === computerIndex) {
            return "Draw";
        } else if ((userIndex + this.halfLen) % this.moves.length === computerIndex) {
            return "You win";
        } else {
            return "Computer wins";
        }
    }
}
// Класс игры
class Game {
    constructor(moves) {
        this.moves = moves;
        this.key = RandomGenerator.generateRandomKey(256);
        this.rules = new Rules(moves);
    }

    playGame(playerChoice) {
        const computerMove = this.moves[Math.floor(Math.random() * this.moves.length)];
        const hmac = calculateHMAC(playerChoice, this.key);
        const winner = this.rules.determineWinner(playerChoice, computerMove);

        console.log(`Your move: ${playerChoice}`);
        console.log(`Computer move: ${computerMove}`);
        console.log(`Winner: ${winner}`);
        console.log(`HMAC key: ${this.key}`);
    }
}


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function displayHelpTable() {
    console.log('Game Rules:');
    console.log('rock vs. scissors - Rock wins');
    console.log('scissors vs. paper - Scissors wins');
    console.log('paper vs. rock - Paper wins');
}

function displayMenu(moves, game) {
    const computerMove = moves[Math.floor(Math.random() * moves.length)];
    const hmac = calculateHMAC(computerMove, game.key);
    console.log(`HMAC: ${hmac}`);
    console.log('Available moves:');

    moves.forEach((move, index) => {
        console.log(`${index + 1} - ${move}`);
    });

    console.log('0 - exit');
    console.log('? - help');
}

function getUserChoice() {
    return new Promise((resolve) => {
        rl.question('Enter your move: ', (choice) => {
            resolve(choice);
        });
    });
}

async function startGame() {
    const userMoves = process.argv.slice(2);

    if (userMoves.length < 3 || userMoves.length % 2 === 0) {
        console.log('Error: Please provide an odd number of unique moves (3 or more).');
        return;
    }

    const game = new Game(userMoves);

    displayMenu(userMoves, game);
    let playerChoice = await getUserChoice();

    while (playerChoice !== '0') {
        if (playerChoice === '?') {
            displayHelpTable();
        } else if (userMoves.includes(userMoves[playerChoice - 1])) {
            game.playGame(userMoves[playerChoice - 1]);
        } else {
            console.log('Invalid move. Please try again.');
        }

        displayMenu(userMoves, game);
        playerChoice = await getUserChoice();
    }

    rl.close();
}
startGame();