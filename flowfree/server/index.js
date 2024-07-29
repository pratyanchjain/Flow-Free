const express = require('express');
const cors = require('cors');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
      origin: "*",  // Adjust this to match your client URL
    },
  });

const getBoard = require('../pages/api/getBoard');
const { randomInt } = require('crypto');

app.use(cors());

const port = 3004;

let queue = [];
let myMap = new Map();


app.get('/', (req, res) => {
    res.send('Hello World!');
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('hi', (msg) => {
        // Broadcast the received message to all connected clients
        io.emit('message', msg);
      });

    socket.on('joinQueue', async () => {
        queue.push(socket.id);
        console.log(socket.id)
        if (queue.length >= 2) {
            let player1 = queue.pop()
            let player2 = queue.pop()
            myMap[player1] = player2
            myMap[player2] = player1
            let gameId = generateGameID();
            try {
                let board = await getBoard(Math.floor(Math.random() * 10) + 4);
                let cellColor = generateColors(board.length)
                io.to(player1).emit("matched", {Game: gameId, Board: board, Color:  cellColor})
                io.to(player2).emit("matched", {Game: gameId, Board: board, Color:  cellColor })
                console.log("emitted")
            } catch (error) {
                console.log("error fetching board", error);
            }
            
        }
    });

    socket.on("updateMove", (board) => {
        io.to(myMap[socket.id]).emit("opponentMove", board);
    })

    socket.on("gameWon", () => {
        console.log("won the game")
        io.to(socket.id).emit("endGame", "you won");
        io.to(myMap[socket.id]).emit("endGame", "opponent won")
    })
  
    socket.on('disconnect', () => {
        queue = queue.filter((num) => num !== socket.id && num !== myMap[socket.id]);
        console.log('users disconnected');
        io.to(myMap[socket.id]).emit("aborted");
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
