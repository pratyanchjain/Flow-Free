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
let socketMap = new Map();

app.get('/api', (req, res) => {
    res.send('Hello World!');
});


app.get('/api/duel', (req, res) => {
    res.send('Hello Game!');
});

io.on('connection', (socket) => {
    console.log('a user connected', socket.id);
    socket.on('userID', (userId) => {
        console.log("user Id", userId, socketMap.get(userId), socket.id)
        console.log(playerMap)
        myMap.forEach((key, value) => {
            if (value === socketMap.get(userId)) {
                myMap.set(key, socket.id)
                console.log("found")
            }
        })
        let oldSocket = socketMap.get(userId)
        let oldSocketMatch = playerMap.get(oldSocket);
        console.log("oldSocket", oldSocket, "oldSocketMatch", oldSocketMatch);
        playerMap.delete(oldSocket);
        playerMap.set(socket.id, oldSocketMatch);
        socketMap.set(userId, socket.id);
        console.log(socketMap, playerMap, myMap)
    })
    socket.on('hi', (msg) => {
        // Broadcast the received message to all connected clients
        io.emit('message', msg);
    });

    socket.on('joinQueue', async (userId) => {
        socketMap.set(userId, socket.id)
        if (!playerMap.has(userId)) {
            queue.push(userId);
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
                console.log(socketMap, player1, player2)
                io.to(socketMap.get(player1)).emit("matched", {Game: gameId, Board: board, Color: cellColor});
                io.to(socketMap.get(player2)).emit("matched", {Game: gameId, Board: board, Color: cellColor});
                console.log("emitted");
            } catch (error) {
                console.log("error fetching board", error);
            }
        }
    });

    socket.on("playerID", (gameId, userId) => {
        console.log("gameId", gameId);
        socketMap.set(userId, socket.id)
        if (!myMap.get(gameId) || myMap.get(gameId) === socket.id) {
            myMap.set(gameId, socket.id);
        } else {
            playerMap.set(myMap.get(gameId), socket.id);
            playerMap.set(socket.id, myMap.get(gameId));
        }
    });

    socket.on("updateMove", (board, userId) => {
        socketMap.set(userId, socket.id);
        console.log("updating move", userId, socketMap.get(userId))
        io.to(playerMap.get(socketMap.get(userId))).emit("opponentMove", board);
    });

    socket.on("gameWon", (userId) => {
        console.log("won the game");
        socketMap.set(userId, socket.id)
        io.to(socketMap.get(userId)).emit("endGame", "you won");
        io.to(playerMap.get(socketMap.get(userId))).emit("endGame", "opponent won");
        if (playerMap.has(socketMap.get(userId))) {
            playerMap.delete(playerMap.get(socketMap.get(userId)));
            playerMap.delete(socketMap.get(userId));
        }
    });

    socket.on('disconnect', (userId) => {
        socketMap.set(userId, socket.id)
        queue = queue.filter((num) => num !== socketMap.get(userId) && num !== playerMap.get(socketMap.get(userId)));
        console.log('user disconnected');
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
