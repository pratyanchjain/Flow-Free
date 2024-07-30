const express = require('express');
const cors = require('cors');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: "*",
    },
  });

const getBoard = require('../app/pages/api/getBoard');

app.use(cors());

const port = 3004;

let queue = [];
let myMap = new Map();
let playerMap = new Map();

app.get('/api', (req, res) => {
    res.send('Hello World!');
});


app.get('/api/duel', (req, res) => {
    res.send('Hello Game!');
});

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('hi', (msg) => {
        // Broadcast the received message to all connected clients
        io.emit('message', msg);
    });

    socket.on('joinQueue', async () => {
        if (!playerMap.has(socket.id)) {
            queue.push(socket.id);
            console.log(queue);
        }
        if (queue.length >= 2) {
            let player1 = queue.shift();
            let player2 = queue.shift();
            console.log(queue);

            if (playerMap.has(player1)) {
                console.log("playing");
                return;
            }
            if (playerMap.has(player2)) {
                console.log("playing");
                return;
            }
            if (player1 === player2) {
                queue.push(player1);
                return;
            }

            let gameId = generateGameID();
            try {
                let board = await getBoard(4);
                let cellColor = generateColors(board.length);
                myMap.set(gameId, null);
                io.to(player1).emit("matched", {Game: gameId, Board: board, Color: cellColor});
                io.to(player2).emit("matched", {Game: gameId, Board: board, Color: cellColor});
                console.log("emitted");
            } catch (error) {
                console.log("error fetching board", error);
            }
        }
    });

    socket.on("playerID", (gameId) => {
        console.log("gameId", gameId);
        if (!myMap.get(gameId) || myMap.get(gameId) === socket.id) {
            myMap.set(gameId, socket.id);
        } else {
            playerMap.set(myMap.get(gameId), socket.id);
            playerMap.set(socket.id, myMap.get(gameId));
        }
    });

    socket.on("updateMove", (board) => {
        io.to(playerMap.get(socket.id)).emit("opponentMove", board);
    });

    socket.on("gameWon", () => {
        console.log("won the game");
        io.to(socket.id).emit("endGame", "you won");
        io.to(playerMap.get(socket.id)).emit("endGame", "opponent won");
        if (playerMap.has(socket.id)) {
            playerMap.delete(playerMap.get(socket.id));
            playerMap.delete(socket.id);
        }
    });

    socket.on('disconnect', () => {
        queue = queue.filter((num) => num !== socket.id && num !== playerMap.get(socket.id));
        console.log('user disconnected');
        if (playerMap.has(socket.id)) {
            io.to(playerMap.get(socket.id)).emit("aborted");
            playerMap.delete(playerMap.get(socket.id));
            playerMap.delete(socket.id);
        }
    });
});


function generateGameID() {
    return 'game-' + Math.random().toString(36).substring(2, 9);
}

function generateColors(boardSize) {
    let cellColors = {}
    for (let i = 0; i <= boardSize; i++) {
        cellColors[i] = getRandomColor();
    }
    cellColors[0] = "";
    return cellColors;
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};


server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
