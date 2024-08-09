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

// const getBoard = require('../app/pages/api/getBoard');

app.use(cors());

const port = 3004;

let queue = new Map()
let myMap = new Map();
let playerMap = new Map();
let socketMap = new Map();
let Board = new Map()

app.get('/', (req, res) => {
    res.send('Hello World!');
});


app.get('/duel', (req, res) => {
    res.send('Hello Game!');
});

const axios = require('axios')


io.on('connection', (socket) => {
    console.log('a user connected', socket.id);
    socket.on('userID', (userId, boardSize) => {
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

    socket.on('joinQueue', async (userId, boardSize) => {
        initializeBoardSize(boardSize);
        Board.set(socket.id, boardSize)
        console.log("joinq", boardSize);

         // Set the socket.id in the nested socketMap
        if (!socketMap.has(userId)) {
            socketMap.set(userId, socket.id);
        }

        // Add userId to the queue if not already present in playerMap
        if (!playerMap.has(userId) && !queue.get(boardSize).includes(userId)) {
            queue.get(boardSize).push(userId);
            console.log(queue.get(boardSize));
        }
        console.log("q", queue.get(boardSize));
        // Check if there are enough players to start a game
        if (queue.get(boardSize).length >= 2) {
            let player1 = queue.get(boardSize).shift();
            let player2 = queue.get(boardSize).shift();
            console.log(queue.get(boardSize));

            // Check if players are already in a game
            if (playerMap.has(player1)) {
                console.log("playing");
                return;
            }
            if (playerMap.has(player2)) {
                console.log("playing");
                return;
            }
            if (player1 === player2) {
                queue.get(boardSize).push(player1);
                return;
            }

            // Generate game ID and start the game
            let gameId = generateGameID();
            try {
                let board = await getBoard(Number(boardSize));
                let cellColor = generateColors(board.length);
                myMap.set(gameId, null);
                console.log(socketMap, player1, player2);
                io.to(socketMap.get(player1)).emit("matched", { Game: gameId, Board: board, Color: cellColor });
                io.to(socketMap.get(player2)).emit("matched", { Game: gameId, Board: board, Color: cellColor });
                console.log("emitted");
            } catch (error) {
                console.log("error fetching board", error);
            }
        }
    });

    socket.on("playerID", (gameId, userId) => {
        let boardSize = Board.get(socket.id);
        console.log("boardsize", boardSize, userId, Board);
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

    socket.on("gameWon", (userId, boardSize) => {
        console.log("won the game");
        socketMap.set(userId, socket.id)
        io.to(socketMap.get(userId)).emit("endGame", "you won");
        io.to(playerMap.get(socketMap.get(userId))).emit("endGame", "opponent won");
        if (playerMap.has(socketMap.get(userId))) {
            playerMap.delete(playerMap.get(socketMap.get(userId)));
            playerMap.delete(socketMap.get(userId));
        }
    });

    socket.on('disconnect', () => {
        let userId = socket.id
        let boardSize = Board.get(userId, socket.id);
        if (boardSize) {
            console.log(boardSize, "from disconnect", Board, socket.id);
            queue.set(boardSize, queue.get(boardSize).filter((num) => num !== socketMap.get(userId) && num !== playerMap.get(socketMap.get(userId))));
            console.log('user disconnected');
        }
    });
});

// Function to initialize a new board size
function initializeBoardSize(boardSize) {
    if (!queue.has(boardSize)) {
      queue.set(boardSize, []);
    }
  }

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

async function getBoard(boardSize) {
    try {
        let response = await axios.post("http://localhost:3003/puzzle/", {size: boardSize});
        return response.data;
    } catch (error) {
        return error;
    }
}

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
